import type { GolfOutingPublic } from "@/services/getGolfOutingPublic";
import { sendGolfPaymentReceipt } from "@/libs/sendGolfReceipt";
import { callTicketProc, type TicketRow } from "./gateway";
import { googleConfigured, walletGapMessage } from "./fields";
import { patchGoogleObject } from "./google";
import { normalizePhone, sendSms, twilioConfigured } from "./sms";
import { isDeliverableEmail, ticketUrl } from "./token";

export async function issueTicketsForOrder(orderId: number, memberId?: string) {
  return callTicketProc("issue_event_tickets", { order_id: orderId }, { memberId: memberId || "PUBLIC" });
}

async function mark(action: string, publicIds: string[], extra?: Record<string, unknown>) {
  const ids = publicIds.filter(Boolean);
  if (!ids.length) return;
  await callTicketProc("ticket_touch", { action, public_ids: ids, ...extra });
}

async function textTickets(tickets: TicketRow[]) {
  if (!twilioConfigured()) return;
  const pending = tickets.filter((ticket) => ticket.public_id && !ticket.sms_sent_at);
  if (!pending.length) return;
  const university = pending[0].university_name || "The College Athlete Network";
  const eventName = pending[0].event_name || "your event";
  const purchaser = normalizePhone(pending[0].purchaser_phone);
  const sent = new Set<string>();
  if (purchaser) {
    const lines = pending.map((ticket) => {
      const name = `${ticket.first_name || ""} ${ticket.last_name || ""}`.trim() || "Guest";
      return `${name}: ${ticketUrl(String(ticket.public_id))}`;
    });
    const result = await sendSms(purchaser, `${university} — ${eventName}. Your tickets:\n${lines.join("\n")}`.slice(0, 1400));
    if (result.sent || result.reason === "opt-out") {
      pending.forEach((ticket) => sent.add(String(ticket.public_id)));
    } else if (result.reason === "failed") {
      console.error("ticket sms failed", result.detail);
    }
  }
  for (const ticket of pending) {
    const phone = normalizePhone(ticket.phone);
    if (!phone || phone === purchaser) continue;
    const result = await sendSms(
      phone,
      `${university} — ${eventName}. Your ticket: ${ticketUrl(String(ticket.public_id))}`
    );
    if (result.sent || result.reason === "opt-out") sent.add(String(ticket.public_id));
    else if (result.reason === "failed") console.error("ticket sms failed", result.detail);
  }
  if (sent.size) await mark("sms_sent", [...sent]);
}

export async function deliverOrderTickets(input: {
  orderId: number;
  event: GolfOutingPublic;
  purchaserName?: string | null;
  purchaserEmail?: string | null;
  totalCents: number;
  category?: string | null;
  paymentMethod?: string | null;
  transactionId?: string | null;
  fallbackDescription?: string | null;
  memberId?: string | null;
}) {
  let tickets: TicketRow[] = [];
  try {
    tickets = await issueTicketsForOrder(input.orderId, input.memberId || undefined);
  } catch (error) {
    console.error("ticket issue failed", error);
  }

  const gap = walletGapMessage();
  if (gap && tickets.some((ticket) => ticket.public_id && !ticket.pass_error)) {
    try {
      await mark(
        "pass_error",
        tickets.filter((ticket) => ticket.public_id && !ticket.pass_error).map((ticket) => String(ticket.public_id)),
        { pass_error: gap }
      );
    } catch (error) {
      console.error("ticket pass_error failed", error);
    }
  }

  const needsEmail = tickets.length === 0 || tickets.some((ticket) => !ticket.email_sent_at);
  if (needsEmail && isDeliverableEmail(String(input.purchaserEmail || ""))) {
    try {
      await sendGolfPaymentReceipt({
        ...input,
        tickets: tickets
          .filter((ticket) => ticket.public_id)
          .map((ticket) => ({
            name: `${ticket.first_name || ""} ${ticket.last_name || ""}`.trim() || "Guest",
            url: ticketUrl(String(ticket.public_id)),
          })),
      });
      await mark(
        "email_sent",
        tickets.map((ticket) => String(ticket.public_id || ""))
      );
    } catch (error) {
      console.error("golf public receipt email failed", error);
    }
  }

  try {
    await textTickets(tickets);
  } catch (error) {
    console.error("ticket sms failed", error);
  }
}

export async function resendTicket(row: TicketRow) {
  const name = `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Guest";
  const url = ticketUrl(String(row.public_id || ""));
  const university = row.university_name || "The College Athlete Network";
  const eventName = row.event_name || "your event";
  const phone = normalizePhone(row.phone) || normalizePhone(row.purchaser_phone);
  if (twilioConfigured() && phone) {
    const result = await sendSms(phone, `${university} — ${eventName}. Your ticket: ${url}`);
    if (result.sent || result.reason === "opt-out") {
      await mark("sms_sent", [String(row.public_id)]);
    } else if (result.reason === "failed") {
      throw new Error(result.detail || "SMS failed");
    }
  }
  const email = isDeliverableEmail(String(row.email || ""))
    ? String(row.email)
    : isDeliverableEmail(String(row.purchaser_email || ""))
      ? String(row.purchaser_email)
      : "";
  if (email) {
    const { SESClient, SendEmailCommand } = await import("@aws-sdk/client-ses");
    const ses = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
    const from = process.env.EMAIL_FROM?.trim() || "admin@collegeathletenetwork.org";
    await ses.send(
      new SendEmailCommand({
        Source: `The College Athlete Network <${from}>`,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: `${eventName} ticket`, Charset: "UTF-8" },
          Body: {
            Text: {
              Data: `${university}\n${eventName}\n${name}\n${url}\n\nPowered by The College Athlete Network`,
              Charset: "UTF-8",
            },
          },
        },
      })
    );
  }
}

export async function syncAssignment(playerId: number, eventId: string, memberId?: string, assignmentValue?: string | null) {
  const rows = await callTicketProc(
    "ticket_assignment",
    {
      player_id: playerId,
      event_id: eventId,
      assignment_value: assignmentValue === undefined ? undefined : assignmentValue,
    },
    { memberId: memberId || "PUBLIC" }
  );
  const row = rows.find((item) => item.public_id);
  if (!row) return null;
  if (googleConfigured() && row.google_object_id) {
    try {
      await patchGoogleObject(row);
    } catch (error) {
      console.error("google wallet patch failed", error);
    }
  }
  return row;
}
