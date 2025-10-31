// This accepts a campaign payload and enqueues one message per recipient in batches of 10 (SQS limit).
// app/api/notifications/enqueue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { z } from "zod";

// ---- security: only run server-side ----
export const dynamic = "force-dynamic";

const schema = z.object({
  campaign_id: z.string().min(1),
  correlation_id: z.string().min(1),
  subject: z.string().min(1).max(512),
  template_key: z.string().min(1),
  from_name: z.string().min(1),
  from_address: z.email(),
  reply_to_address: z.email(),
  recipients: z
    .array(
      z.object({
        recipient_id: z.string().min(1),
        email: z.email({ message: "Please enter a valid email address" }),
        university: z.string().optional(),
        segment: z.string().optional(),
        vars: z.record(z.string(), z.string()).optional(), // custom variables for each recipient
      })
    )
    .min(1),
});

const SQS_QUEUE_URL = process.env.AWS_SQS_EMAIL_QUEUE_URL;
const REGION = process.env.AWS_REGION;
const SES_CONFIGURATION_SET = process.env.AWS_SES_CONFIGURATION_SET;

function chunk<T>(arr: T[], size = 10): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function POST(req: NextRequest) {
  if (!SQS_QUEUE_URL) {
    console.error("Missing AWS_SQS_EMAIL_QUEUE_URL env var");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const sqs = new SQSClient({ region: REGION });

  try {
    // 1) AuthZ check (pseudo): ensure your NextAuth user is an admin
    // const session = await auth();
    // if (!session?.user?.isAdmin) return NextResponse.json({error:'Unauthorized'}, { status: 403 });

    const json = await req.json();
    const parsed = schema.parse(json);

    const {
      campaign_id,
      correlation_id,
      subject,
      template_key,
      from_name,
      from_address,
      reply_to_address,
      recipients,
    } = parsed;

    // 2) Precompute message bodies and check sizes (SQS 256 KB limit)
    const oversized: { recipient_id: string; email: string; size: number }[] =
      [];
    const bodies = recipients.map((r) => {
      const messageBody = JSON.stringify({
        event: "email.send",
        correlationId: correlation_id,
        campaignId: campaign_id, // TODO: change to be the `row_id/correlation_id` from our API `message_list` endpoint response
        university_name: r.university ?? "",
        recipientId: r.recipient_id,
        email_to_address: r.email,
        email_from_name: from_name,
        email_from_address: from_address,
        reply_to_address: reply_to_address,
        email_subject: subject,
        templateKey: template_key,
        vars: {
          university_name: r.university ?? "",
          row_id: r.recipient_id,
          ...r.vars,
        },
        configurationSet: SES_CONFIGURATION_SET,
        tags: [
          { Name: "campaign_id", Value: campaign_id.toUpperCase() },
          { Name: "correlation_id", Value: correlation_id.toUpperCase() },
          { Name: "university_name", Value: r.university?.toUpperCase() ?? "" },
        ],
      });
      const size = Buffer.byteLength(messageBody, "utf8");
      if (size > 256 * 1024) {
        oversized.push({ recipient_id: r.recipient_id, email: r.email, size });
      }
      return { r, messageBody, size };
    });

    if (oversized.length > 0) {
      // Return a descriptive 400 listing offending recipients so the caller
      // can inspect/truncate payloads before retrying.
      return NextResponse.json(
        {
          error: "One or more per-recipient messages exceed SQS 256 KB limit",
          offenders: oversized,
        },
        { status: 400 }
      );
    }

    // 3) Build SQS entries (one per recipient) now that sizes are verified
    const entries = bodies.map(({ r, messageBody }, idx) => {
      const id = `c${campaign_id}-r${r.recipient_id}-${idx}`;
      return {
        Id: id, // unique within the batch
        MessageBody: messageBody,
        MessageAttributes: {
          campaign_id: { DataType: "String", StringValue: campaign_id },
          recipient_id: {
            DataType: "String",
            StringValue: r.recipient_id,
          },
          correlation_id: {
            DataType: "String",
            StringValue: correlation_id,
          },
        },
        // If FIFO queue: uncomment these two lines
        // MessageGroupId: `campaign-${campaign_id}`,
        // MessageDeduplicationId: id,
      };
    });

    // Log the entries being sent to SQS
    console.log(
      "SQS Entries to be sent:",
      entries.map((entry) => ({
        Id: entry.Id,
        MessageBody: JSON.parse(entry.MessageBody), // Parse to make it readable
        MessageAttributes: entry.MessageAttributes,
      }))
    );

    // 3) Batch send in chunks of 10
    const chunks = chunk(entries, 10);
    const results = [];
    for (const c of chunks) {
      const resp = await sqs.send(
        new SendMessageBatchCommand({
          QueueUrl: SQS_QUEUE_URL,
          Entries: c,
        })
      );
      // Optionally inspect resp.Failed for partial errors
      if (resp.Failed && resp.Failed.length > 0) {
        console.error("SQS batch partial failure", resp.Failed);
        // Choose your policy: fail fast or continue
        // Here we fail if anything failed:
        return NextResponse.json(
          { error: "Partial SQS failure", details: resp.Failed },
          { status: 502 }
        );
      }
      results.push(resp.Successful?.length ?? 0);
    }

    return NextResponse.json({
      ok: true,
      enqueued: results.reduce((a, b) => a + b, 0),
      batches: results.length,
    });
  } catch (err: any) {
    console.error(err);
    // Return a 400 when our explicit thrown errors indicate client payload
    // problems (e.g. oversized message bodies).
    if (err?.message?.includes("Message body too large")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    // Validation errors show useful messages
    if (err?.issues) {
      return NextResponse.json(
        { error: "Invalid payload", issues: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
