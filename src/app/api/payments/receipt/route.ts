import { NextRequest, NextResponse } from "next/server";
import { openDoor } from "@/lib/door/door";
import { jsonError } from "@/lib/door/http";
import { saveReceiptEmail, saveReceiptPhone } from "@/lib/door/registrants";
import { HttpError } from "@/lib/door/session";
import { normalizePhone, sendReceiptMessage } from "@/lib/tickets/sms";
import { receiptPageUrl } from "@/lib/receipts/token";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      const result = await sendReceiptMessage(phone, {
        eventName: event.title,
        purchaserName: typeof body.name === "string" ? body.name : "",
        amountCents: Math.round(Number(body.amountCents)),
        method: typeof body.method === "string" ? body.method : "",
        orderId,
        receiptUrl: await receiptPageUrl(orderId, typeof body.method === "string" ? body.method : ""),
      });
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
