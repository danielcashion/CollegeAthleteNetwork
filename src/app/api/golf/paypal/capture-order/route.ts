import { NextRequest, NextResponse } from "next/server";
import { getPayPalConfig } from "@/libs/paypal";
import { assertPublishedOuting, callPublicGolfProc, getAccessToken, getPublicGolfOrder } from "../../_public";

export async function POST(request: NextRequest) {
  const { orderID, golfData } = await request.json();
  if (!orderID || !golfData?.order_id) {
    return NextResponse.json({ error: "Missing order" }, { status: 400 });
  }

  const pending = await getPublicGolfOrder(Number(golfData.order_id));
  if (!pending) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  const event = await assertPublishedOuting(pending.event_id);
  if (!event) {
    return NextResponse.json({ error: "Outing is not available" }, { status: 400 });
  }
  if (golfData.amount && Number(golfData.amount) !== Number(pending.total_cents)) {
    return NextResponse.json({ error: "Amount does not match reserved order" }, { status: 400 });
  }

  const accessToken = await getAccessToken();
  const config = getPayPalConfig();
  const response = await fetch(`${config.url}/v2/checkout/orders/${orderID}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to capture PayPal order" }, { status: 502 });
  }
  const captureData = await response.json();
  if (captureData.status !== "COMPLETED") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }
  const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];

  if (!golfData.member_id) {
    return NextResponse.json(
      { error: "Sign in on the members site to complete payment. Golf stored procedures require a logged-in member_id." },
      { status: 401 }
    );
  }
  const result = await callPublicGolfProc("golf_fulfill_order", String(golfData.member_id), {
    order_id: Number(golfData.order_id),
    paypal_order_id: orderID,
    gateway_payment_id: capture?.id ?? null,
    payment_method: golfData.payment_method || "paypal",
    mark_comp: 0,
  });

  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/publicprod/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: null,
        university_name: event.university_name,
        sport: "Golf",
        gender_id: 0,
        purpose: golfData.category || "golf",
        currency: "USD",
        total_amount: pending.total_cents,
        payment_type: "event",
        payment_method: "paypal",
        payment_status: "complete",
        transaction_id: capture?.id || orderID,
        donor_name: golfData.purchaser_name || pending.purchaser_name,
        donor_email: golfData.purchaser_email || pending.purchaser_email,
        notes: `golf order ${golfData.order_id}`,
        direction: "in",
        is_anonymous: 0,
        is_active_YN: 1,
      }),
    });
  } catch (err) {
    console.error("golf public financials row failed", err);
  }

  return NextResponse.json({ success: true, result, captureId: capture?.id });
}
