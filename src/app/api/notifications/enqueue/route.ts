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
  from_address: z.string().min(1), // Allow template variables, validate after replacement
  reply_to_address: z.email(),
  recipients: z
    .array(
      z.object({
        recipient_id: z.string().min(1),
        email: z.email({ message: "Please enter a valid email address" }),
        university: z.string().optional(),
        segment: z.string().optional(),
        vars: z
          .object({
            correlation_id: z.string().optional(),
            university_name: z.string().optional(),
            athlete_id: z.string().optional(),
            athlete_name: z.string().optional(),
            sport: z.string().optional(),
            gender_id: z.string().optional(),
            max_roster_year: z.string().optional(),
            seeking_text: z.string().optional(),
            seeking_color: z.string().optional(),
            email_address: z.string().optional(),
            step_1: z.string().optional(),
            step_2: z.string().optional(),
            step_3: z.string().optional(),
            step_4: z.string().optional(),
            step_5: z.string().optional(),
            step_6: z.string().optional(),
            step_7: z.string().optional(),
            step_8: z.string().optional(),
            step_9: z.string().optional(),
            step_10: z.string().optional(),
            checklist_steps: z.string().optional(),
            checklist_color: z.string().optional(),
          })
          .passthrough()
          .optional(), // passthrough allows additional custom variables
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

// Function to replace template variables in a string
function replaceTemplateVariables(template: string, vars: Record<string, any>): string {
  let result = template;
  
  // Replace variables in the format {{variable_name}}
  Object.entries(vars).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    const stringValue = value?.toString() || '';
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), stringValue);
  });
  
  return result;
}

// Function to validate email format after template replacement
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
      // Prepare vars for template replacement
      const recipientVars = {
        university_name: r.university ?? "",
        row_id: r.recipient_id,
        ...r.vars,
      };
      
      // Replace template variables in from_name and from_address
      const processedFromName = replaceTemplateVariables(from_name, recipientVars);
      const processedFromAddress = replaceTemplateVariables(from_address, recipientVars);
      const processedSubject = replaceTemplateVariables(subject, recipientVars);
      
      // Validate the processed email address
      if (!isValidEmail(processedFromAddress)) {
        throw new Error(`Invalid email address after template replacement: ${processedFromAddress} for recipient ${r.recipient_id}`);
      }
      
      const messageBody = JSON.stringify({
        event: "email.send",
        correlationId: correlation_id,
        campaignId: campaign_id, 
        university_name: r.university ?? "",
        recipientId: r.recipient_id,
        email_to_address: r.email,
        email_from_name: processedFromName,
        email_from_address: processedFromAddress,
        reply_to_address: reply_to_address,
        email_subject: processedSubject,
        templateKey: template_key,
        vars: recipientVars,
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

    // Prepare entries to be sent to SQS

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
