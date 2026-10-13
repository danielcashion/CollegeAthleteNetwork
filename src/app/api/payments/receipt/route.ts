import { NextRequest, NextResponse } from "next/server";
import { openDoor } from "@/lib/door/door";
import { jsonError } from "@/lib/door/http";
import { saveReceiptEmail, saveReceiptPhone } from "@/lib/door/registrants";
import { HttpError } from "@/lib/door/session";
import { normalizePhone, sendSms } from "@/lib/tickets/sms";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function methodLabel(value: unknown) {
  const method = String(value || "").toLowerCase();
  if (method === "applepay") return "Apple Pay";
  if (method === "card") return "card";
  if (method === "venmo") return "Venmo";
  if (method === "cash") return "cash";
  if (method === "check") return "check";
  return "payment";
}

function receiptText(body: { name?: unknown; amountCents?: unknown; method?: unknown; orderId?: unknown }, eventName: string) {
  const cents = Math.round(Number(body.amountCents));
  const amount = Number.isInteger(cents) && cents > 0 ? `$${(cents / 100).toFixed(2)}` : "";
  const name = String(body.name || "").trim();
  const lines = [
    "Receipt from The College Athlete Network",
    eventName,
    [name, amount].filter(Boolean).join(" — "),
    `Paid by ${methodLabel(body.method)}`,
    `Order #${body.orderId}`,
  ];
  return lines.filter(Boolean).join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event } = await openDoor(request, String(body.eventId || ""));
    const orderId = Number(body.orderId);
    const playerId = body.playerId ? String(body.playerId) : undefined;
    if (!orderId) throw new HttpError("This payment does not have a receipt yet", 400);

    if (String(body.channel || "email") === "sms") {
      const phone = normalizePhone(String(body.phone || ""));
      if (!phone) throw new HttpError("Enter a valid mobile number", 400);
      await saveReceiptPhone(event, { orderId, playerId, phone });
      const result = await sendSms(phone, receiptText(body, event.title));
      if (result.sent) return NextResponse.json({ ok: true });
      if (result.reason === "unconfigured") throw new HttpError("Text receipts are not available right now", 503);
      if (result.reason === "opt-out") throw new HttpError("This number has opted out of text messages", 400);
      throw new HttpError("detail" in result && result.detail ? result.detail : "Text could not be sent", 502);
    }

    const email = String(body.email || "").trim();
    if (!EMAIL.test(email) || email.length > 190) throw new HttpError("Enter a valid email address", 400);
    await saveReceiptEmail(event, { orderId, playerId, email });
    const site = (process.env.CAN_PUBLIC_SITE_URL || "https://www.collegeathletenetwork.org").replace(/\/$/, "");
    const response = await fetch(`${site}/api/internal/tickets/receipt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ticket-secret": process.env.TICKET_PROC_SECRET || "",
      },
      body: JSON.stringify({
        order_id: orderId,
        purchaser_email: email,
        purchaser_name: body.name,
        total_cents: body.amountCents,
        payment_method: body.method,
        description: "Door payment",
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new HttpError(typeof payload.error === "string" ? payload.error : "Receipt could not be sent", response.status);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
