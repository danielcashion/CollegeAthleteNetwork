import { NextRequest, NextResponse } from "next/server";
import { openDoor } from "@/lib/door/door";
import { chargeDescription } from "@/lib/door/fulfill";
import { jsonError } from "@/lib/door/http";
import { HttpError, signPayToken } from "@/lib/door/session";
import { createPayPalOrder } from "@/lib/door/paypal";
import { createWalkupCharge, type Guest } from "@/lib/door/registrants";
import { apiSend } from "@/lib/door/upstream";

const METHODS = ["card", "applepay", "venmo", "cash", "check"] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const method = String(body.method || "");
    if (!METHODS.includes(method as (typeof METHODS)[number])) throw new HttpError("Choose how this payment was made", 400);
    const amountCents = Math.round(Number(body.amountCents));
    const { organizer, event } = await openDoor(request, String(body.eventId || ""));
    const offline = method === "cash" ? "CASH" : method === "check" ? "CHECK" : undefined;
    const recorded = await createWalkupCharge(organizer, event, {
      firstName: String(body.firstName || ""),
      lastName: String(body.lastName || ""),
      email: String(body.email || ""),
      amountCents,
      offline,
    });
    if (offline) {
      return NextResponse.json({
        recorded: true,
        guest: recorded.guest,
        amountCents,
        orderId: recorded.golfOrderId,
      });
    }

    const paypalOrder = await createPayPalOrder({
      amountCents: recorded.amountCents,
      invoiceId: recorded.kind === "golf" ? String(recorded.golfOrderId) : recorded.guest.id,
      description: chargeDescription(event, recorded.guest as Guest),
      customId: `${recorded.kind}_${recorded.guest.id}_${Date.now()}`,
    });
    if (recorded.kind === "golf" && recorded.golfOrderId) {
      await apiSend("put", "/golf_orders", { paypal_order_id: paypalOrder.id }, { order_id: recorded.golfOrderId });
    } else {
      await apiSend("put", "/event_registrants", { paypal_order_id: paypalOrder.id }, { registrant_id: recorded.guest.id });
    }
    const token = await signPayToken({
      purpose: "pay",
      paypalOrderId: paypalOrder.id,
      eventId: event.id,
      registrantId: recorded.guest.id,
      amountCents: recorded.amountCents,
      kind: recorded.kind,
      golfOrderId: recorded.golfOrderId,
      eventName: event.title,
      purchaserName: recorded.guest.name,
      purchaserEmail: recorded.guest.email,
      memberId: organizer.member_id,
    });
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    return NextResponse.json({
      recorded: false,
      checkoutUrl: `${origin}/pay/${token}`,
      amountCents: recorded.amountCents,
      orderId: recorded.golfOrderId,
      guest: recorded.guest,
    });
  } catch (error) {
    return jsonError(error);
  }
}
