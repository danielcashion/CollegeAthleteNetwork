import { DoorEvent } from "./events";
import { Guest } from "./registrants";
import { capturePayPalOrder, paymentMethod } from "./paypal";
import { PayToken } from "./session";
import { apiSend, callProc, publicApiBase } from "./upstream";

export async function recordCapturedPayment(input: {
  kind: "golf" | "event";
  golfOrderId: number | null;
  registrantId: string;
  memberId: string;
  amountCents: number;
  orderID: string;
  captureId: string;
  method: string;
  purchaserName: string;
  purchaserEmail: string;
  eventName: string;
}) {
  const method = paymentMethod(input.method);
  if (input.kind === "golf" && input.golfOrderId) {
    await callProc("golf_fulfill_order", input.memberId || "DOOR", {
      order_id: input.golfOrderId,
      paypal_order_id: input.orderID,
      gateway_payment_id: input.captureId,
      payment_method: method,
      mark_comp: 0,
    });
  } else {
    await apiSend(
      "put",
      "/event_registrants",
      {
        paid_status: "PAID",
        payment_amount: (input.amountCents / 100).toFixed(2),
        payment_method: method,
        ext_payment_id: input.captureId,
        payment_date: new Date().toISOString().slice(0, 19).replace("T", " "),
        paypal_order_id: input.orderID,
      },
      { registrant_id: input.registrantId }
    );
  }

  try {
    await fetch(`${publicApiBase()}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: null,
        university_name: null,
        purpose: input.kind === "golf" ? "golf" : "event",
        currency: "USD",
        total_amount: input.amountCents,
        payment_type: "event",
        payment_method: method,
        payment_status: "complete",
        transaction_id: input.captureId,
        donor_name: input.purchaserName,
        donor_email: input.purchaserEmail,
        notes: `${input.eventName} ${input.registrantId}`,
        direction: "in",
        is_anonymous: 0,
        is_active_YN: 1,
      }),
    });
  } catch (error) {
    console.error("financials row failed", error);
  }

  return { success: true, captureId: input.captureId };
}

export async function fulfillPayment(token: PayToken, orderID: string, methodInput?: string | null) {
  if (token.paypalOrderId !== orderID) {
    throw new Error("PayPal order does not match this checkout");
  }
  const captured = await capturePayPalOrder(orderID);
  return recordCapturedPayment({
    kind: token.kind,
    golfOrderId: token.golfOrderId,
    registrantId: token.registrantId,
    memberId: token.memberId,
    amountCents: token.amountCents,
    orderID,
    captureId: captured.captureId,
    method: paymentMethod(methodInput),
    purchaserName: token.purchaserName,
    purchaserEmail: token.purchaserEmail,
    eventName: token.eventName,
  });
}

export function chargeDescription(event: DoorEvent, guest: Guest) {
  return `${event.title} — ${guest.name}`.slice(0, 120);
}
