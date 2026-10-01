import { NextRequest, NextResponse } from "next/server";
import { assertPublishedOuting } from "@/app/api/golf/_public";
import { sendGolfPaymentReceipt } from "@/libs/sendGolfReceipt";
import { ticketSecretOk } from "@/lib/tickets/secret";
import { getPublicGolfOrder } from "@/services/getGolfOutingPublic";
import type { GolfOutingPublic } from "@/services/getGolfOutingPublic";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!ticketSecretOk(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const orderId = Number(body.order_id);
  if (!orderId) return NextResponse.json({ error: "order_id is required" }, { status: 400 });
  const order = await getPublicGolfOrder(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const event = (await assertPublishedOuting(order.event_id)) as GolfOutingPublic | null;
  if (!event) return NextResponse.json({ error: "Outing is not available" }, { status: 400 });
  try {
    await sendGolfPaymentReceipt({
      orderId,
      event,
      purchaserName: body.purchaser_name || order.purchaser_name,
      purchaserEmail: body.purchaser_email || order.purchaser_email,
      totalCents: Number(body.total_cents || order.total_cents || 0),
      category: "REGISTRATION",
      paymentMethod: typeof body.payment_method === "string" ? body.payment_method : "cash",
      transactionId: typeof body.transaction_id === "string" ? body.transaction_id : order.paypal_order_id || String(orderId),
      fallbackDescription: typeof body.description === "string" ? body.description : "Door payment",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Receipt could not be sent";
    return NextResponse.json({ error: message }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
