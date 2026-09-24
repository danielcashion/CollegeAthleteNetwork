import { NextRequest, NextResponse } from "next/server";
import { getPayPalConfig } from "@/libs/paypal";
import { setPublicGolfPaypalOrderId } from "@/services/getGolfOutingPublic";
import { assertPublishedOuting, clientKey, getAccessToken, getPublicGolfOrder, rateLimit } from "../../_public";

function siteOrigin(request: NextRequest) {
  return (
    request.headers.get("origin") ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.collegeathletenetwork.org"
  ).replace(/\/$/, "");
}

function approveUrlFrom(paypalOrder: { id?: string; links?: Array<{ rel?: string; href?: string }> }, configUrl?: string) {
  const action = paypalOrder.links?.find((link) => link.rel === "payer-action" || link.rel === "approve");
  if (action?.href) return action.href;
  const host = String(configUrl || "").includes("sandbox")
    ? "https://www.sandbox.paypal.com"
    : "https://www.paypal.com";
  return paypalOrder.id ? `${host}/checkoutnow?token=${paypalOrder.id}` : "";
}

export async function POST(request: NextRequest) {
  const { amount, currency = "USD", golfData, fundingSource } = await request.json();
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
  const origin = siteOrigin(request);
  const returnParams = new URLSearchParams({
    order_id: String(order.order_id),
    email: order.purchaser_email,
    amount: String(order.total_cents),
  });
  if (order.purchaser_name) returnParams.set("name", order.purchaser_name);
  if (golfData.event_name) returnParams.set("event", String(golfData.event_name));
  if (golfData.outing_slug) returnParams.set("slug", String(golfData.outing_slug));
  const returnUrl = `${origin}/golf-pay/venmo?${returnParams.toString()}`;
  const payload: Record<string, unknown> = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: { currency_code: currency, value: (amount / 100).toFixed(2) },
        description: `${golfData.category || "GOLF"} ${golfData.event_name || event.event_name}`.trim(),
        custom_id: `golf_${golfData.order_id}_${order.purchaser_email}`,
        invoice_id: `golf-${golfData.order_id}`,
      },
    ],
    application_context: {
      brand_name: "The College Athlete Network",
      user_action: "PAY_NOW",
      shipping_preference: "NO_SHIPPING",
      return_url: returnUrl,
      cancel_url: returnUrl,
    },
  };
  if (fundingSource === "venmo") {
    payload.payment_source = {
      venmo: {
        email_address: order.purchaser_email,
        experience_context: {
          brand_name: "The College Athlete Network",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: returnUrl,
          cancel_url: returnUrl,
        },
      },
    };
  }

  let response = await fetch(`${config.url}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok && fundingSource === "venmo") {
    delete payload.payment_source;
    response = await fetch(`${config.url}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 502 });
  }
  const paypalOrder = await response.json();
  try {
    await setPublicGolfPaypalOrderId(Number(golfData.order_id), String(paypalOrder.id));
  } catch (err) {
    console.error("could not persist paypal_order_id", err);
  }
  return NextResponse.json({
    orderID: paypalOrder.id,
    approveUrl: approveUrlFrom(paypalOrder, config.url),
  });
}
