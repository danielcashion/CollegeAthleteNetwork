import { NextRequest, NextResponse } from "next/server";
import { getPublicGolfOrder } from "../../_public";

export async function GET(request: NextRequest) {
  const orderId = Number(request.nextUrl.searchParams.get("order_id"));
  if (!orderId) {
    return NextResponse.json({ error: "Missing order" }, { status: 400 });
  }
  const order = await getPublicGolfOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({
    order_id: order.order_id,
    order_status: order.order_status,
    total_cents: order.total_cents,
    purchaser_email: order.purchaser_email,
    purchaser_name: order.purchaser_name,
    paypal_order_id: order.paypal_order_id || null,
  });
}
