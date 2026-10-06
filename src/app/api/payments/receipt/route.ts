import { NextRequest, NextResponse } from "next/server";
import { openDoor } from "@/lib/door/door";
import { jsonError } from "@/lib/door/http";
import { HttpError } from "@/lib/door/session";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await openDoor(request, String(body.eventId || ""));
    const email = String(body.email || "").trim();
    const orderId = Number(body.orderId);
    if (!EMAIL.test(email)) throw new HttpError("Enter a valid email address", 400);
    if (!orderId) throw new HttpError("This payment does not have a receipt yet", 400);
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
