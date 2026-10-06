import { NextRequest, NextResponse } from "next/server";
import { assertPublishedOuting } from "@/app/api/golf/_public";
import { deliverOrderTickets } from "@/lib/tickets/deliver";
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
  await deliverOrderTickets({
    orderId,
    event,
    purchaserName: body.purchaser_name || order.purchaser_name,
    purchaserEmail: body.purchaser_email || order.purchaser_email,
    totalCents: Number(body.total_cents || order.total_cents || 0),
    category: typeof body.category === "string" ? body.category : "golf",
    paymentMethod: typeof body.payment_method === "string" ? body.payment_method : "paypal",
    transactionId: typeof body.transaction_id === "string" ? body.transaction_id : order.paypal_order_id || String(orderId),
    memberId: order.member_id,
  });
  return NextResponse.json({ ok: true });
}
