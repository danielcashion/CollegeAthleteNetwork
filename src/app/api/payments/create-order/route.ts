import { NextRequest, NextResponse } from "next/server";
import { openDoor } from "@/lib/door/door";
import { chargeDescription } from "@/lib/door/fulfill";
import { jsonError } from "@/lib/door/http";
import { createPayPalOrder } from "@/lib/door/paypal";
import { reserveCharge } from "@/lib/door/registrants";
import { signPayToken } from "@/lib/door/session";
import { apiSend } from "@/lib/door/upstream";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizer, event } = await openDoor(request, String(body.eventId || ""));
    const reserved = await reserveCharge(organizer, event, String(body.registrantId || ""));
    const paypalOrder = await createPayPalOrder({
      amountCents: reserved.amountCents,
      invoiceId: reserved.kind === "golf" ? String(reserved.golfOrderId) : reserved.guest.id,
      description: chargeDescription(event, reserved.guest),
      customId: `${reserved.kind}_${reserved.guest.id}_${Date.now()}`,
    });

    if (reserved.kind === "golf" && reserved.golfOrderId) {
      await apiSend("put", "/golf_orders", { paypal_order_id: paypalOrder.id }, { order_id: reserved.golfOrderId });
    } else {
      await apiSend("put", "/event_registrants", { paypal_order_id: paypalOrder.id }, { registrant_id: reserved.guest.id });
    }

    const token = await signPayToken({
      purpose: "pay",
      paypalOrderId: paypalOrder.id,
      eventId: event.id,
      registrantId: reserved.guest.id,
      amountCents: reserved.amountCents,
      kind: reserved.kind,
      golfOrderId: reserved.golfOrderId,
      eventName: event.title,
      purchaserName: reserved.guest.name,
      purchaserEmail: reserved.guest.email,
      memberId: organizer.member_id,
    });
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    return NextResponse.json({
      orderID: paypalOrder.id,
      checkoutUrl: `${origin}/pay/${token}`,
      amountCents: reserved.amountCents,
    });
  } catch (error) {
    return jsonError(error);
  }
}

