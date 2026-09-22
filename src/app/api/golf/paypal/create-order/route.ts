import { NextRequest, NextResponse } from "next/server";
import { getPayPalConfig } from "@/libs/paypal";
import { assertPublishedOuting, clientKey, getAccessToken, getPublicGolfOrder, rateLimit } from "../../_public";

export async function POST(request: NextRequest) {
  const { amount, currency = "USD", golfData } = await request.json();
  if (!amount || !golfData?.order_id) {
    return NextResponse.json({ error: "Missing order" }, { status: 400 });
  }
  if (!rateLimit(clientKey(request, golfData.purchaser_email), 10)) {
    return NextResponse.json({ error: "Too many payment attempts" }, { status: 429 });
  }

  const order = await getPublicGolfOrder(Number(golfData.order_id));
  if (!order || order.order_status !== "PENDING") {
    return NextResponse.json({ error: "Pending order not found" }, { status: 400 });
  }
  if (Number(order.total_cents) !== Number(amount)) {
    return NextResponse.json({ error: "Amount does not match reserved order" }, { status: 400 });
  }
  const event = await assertPublishedOuting(order.event_id);
  if (!event) {
    return NextResponse.json({ error: "Outing is not available for checkout" }, { status: 400 });
  }
  if (golfData.category === "REGISTRATION" && event.event_status !== "PUBLISHED") {
    return NextResponse.json({ error: "Registration is not open" }, { status: 400 });
  }

  const accessToken = await getAccessToken();
  const config = getPayPalConfig();
  const response = await fetch(`${config.url}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: currency, value: (amount / 100).toFixed(2) },
          description: `${golfData.category || "GOLF"} ${golfData.event_name || event.event_name}`.trim(),
          custom_id: `golf_${golfData.order_id}_${Date.now()}`,
        },
      ],
      application_context: {
        brand_name: "The College Athlete Network",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    }),
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 502 });
  }
  const paypalOrder = await response.json();
  return NextResponse.json({ orderID: paypalOrder.id });
}
