import { DoorEvent } from "./events";
import { chargeDescription, recordCapturedPayment } from "./fulfill";
import { HttpError, Organizer } from "./session";
import { CardInput, chargeCard, createPayPalOrder, getPayPalConfig, readPayPalOrder, capturePayPalOrder, venmoPayLink } from "./paypal";
import { createWalkupCharge, Guest, reserveCharge } from "./registrants";
import { apiSend } from "./upstream";

export type ChargeTarget = {
  guest: Guest | { id: string; name: string; email: string; kind: "golf" | "event" };
  amountCents: number;
  golfOrderId: number | null;
  kind: "golf" | "event";
};

export async function prepareCharge(
  organizer: Organizer,
  event: DoorEvent,
  input: { registrantId?: string; firstName?: string; lastName?: string; email?: string; amountCents?: number }
): Promise<ChargeTarget> {
  if (input.registrantId) return reserveCharge(organizer, event, input.registrantId);
  const amountCents = Math.round(Number(input.amountCents));
  return createWalkupCharge(organizer, event, {
    firstName: String(input.firstName || ""),
    lastName: String(input.lastName || ""),
    email: String(input.email || ""),
    amountCents,
  });
}

function orderInput(event: DoorEvent, target: ChargeTarget, description?: string) {
  return {
    amountCents: target.amountCents,
    invoiceId: target.kind === "golf" && target.golfOrderId ? String(target.golfOrderId) : target.guest.id,
    description: description || chargeDescription(event, target.guest as Guest),
    customId: `${target.kind}_${target.guest.id}_${Date.now()}`,
  };
}

async function rememberOrder(target: ChargeTarget, paypalOrderId: string) {
  if (target.kind === "golf" && target.golfOrderId) {
    await apiSend("put", "/golf_orders", { paypal_order_id: paypalOrderId }, { order_id: target.golfOrderId });
  } else {
    await apiSend("put", "/event_registrants", { paypal_order_id: paypalOrderId }, { registrant_id: target.guest.id });
  }
}

function paidPayload(organizer: Organizer, event: DoorEvent, target: ChargeTarget, orderID: string, captureId: string, method: string) {
  return recordCapturedPayment({
    kind: target.kind,
    golfOrderId: target.golfOrderId,
    registrantId: target.guest.id,
    memberId: organizer.member_id,
    amountCents: target.amountCents,
    orderID,
    captureId,
    method,
    purchaserName: target.guest.name,
    purchaserEmail: target.guest.email,
    eventName: event.title,
  });
}

export async function chargeDoorCard(organizer: Organizer, event: DoorEvent, target: ChargeTarget, card: CardInput) {
  const charged = await chargeCard(orderInput(event, target), card);
  await rememberOrder(target, charged.orderId);
  const recorded = await paidPayload(organizer, event, target, charged.orderId, charged.captureId, "card");
  return { paid: true, ...recorded, orderId: target.golfOrderId, paypalOrderId: charged.orderId, guest: target.guest, amountCents: target.amountCents };
}

const applePayGuests = new Map<string, Promise<ChargeTarget>>();

export async function startDoorApplePayAmount(event: DoorEvent, amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) throw new HttpError("Enter an amount greater than zero", 400);
  const created = await createPayPalOrder({
    amountCents,
    invoiceId: event.id.slice(0, 127),
    description: event.title.slice(0, 120),
    customId: `door_apple_${event.id}_${amountCents}_${Date.now()}`.slice(0, 127),
  });
  return applePayCheckout(created.id, event.title, "", amountCents, null);
}

export async function startDoorApplePay(_organizer: Organizer, event: DoorEvent, target: ChargeTarget) {
  const created = await createPayPalOrder({
    ...orderInput(event, target),
    customId: `door_${target.kind}_${target.guest.id}_${Date.now()}`.slice(0, 127),
  });
  await rememberOrder(target, created.id);
  return applePayCheckout(created.id, event.title, target.guest.name, target.amountCents, target.golfOrderId, target.guest);
}

function applePayCheckout(
  paypalOrderId: string,
  eventName: string,
  guestName: string,
  amountCents: number,
  orderId: number | null,
  guest?: ChargeTarget["guest"]
) {
  const origin = (process.env.PAY_CHECKOUT_ORIGIN || "https://www.collegeathletenetwork.org").replace(/\/$/, "");
  const params = new URLSearchParams({
    client: getPayPalConfig()["client-id"],
    amount: (amountCents / 100).toFixed(2),
    event: eventName,
  });
  if (guestName.trim()) params.set("guest", guestName);
  return {
    paid: false,
    qrUrl: `${origin}/door-pay/${paypalOrderId}?${params.toString()}`,
    paypalOrderId,
    orderId,
    guest,
    amountCents,
  };
}

export async function syncDoorApplePay(organizer: Organizer, event: DoorEvent, target: ChargeTarget, paypalOrderId: string) {
  let current = await readPayPalOrder(paypalOrderId);
  if (current.status !== "APPROVED" && current.status !== "COMPLETED") {
    return { paid: false, status: current.status || "PENDING", paypalOrderId };
  }
  let captureId = current.captureId;
  if (!(current.status === "COMPLETED" && captureId)) {
    try {
      captureId = (await capturePayPalOrder(paypalOrderId)).captureId;
    } catch {
      const again = await readPayPalOrder(paypalOrderId);
      if (again.status !== "COMPLETED" || !again.captureId) {
        return { paid: false, status: again.status || "PENDING", paypalOrderId };
      }
      captureId = again.captureId;
      current = again;
    }
    if (current.status !== "COMPLETED") current = await readPayPalOrder(paypalOrderId);
  }
  if (!target.guest.id) {
    const email = current.email || `applepay+${paypalOrderId.toLowerCase()}@collegeathletenetwork.org`;
    const firstName = current.firstName || "Apple Pay";
    let created = applePayGuests.get(paypalOrderId);
    if (!created) {
      created = createWalkupCharge(organizer, event, {
        firstName,
        lastName: current.lastName || "Guest",
        email,
        phone: current.phone,
        amountCents: target.amountCents,
      }).catch((error) => {
        applePayGuests.delete(paypalOrderId);
        throw error;
      });
      applePayGuests.set(paypalOrderId, created);
    }
    target = await created;
    await rememberOrder(target, paypalOrderId);
  }
  const recorded = await paidPayload(organizer, event, target, paypalOrderId, captureId || paypalOrderId, "applepay");
  return { paid: true, ...recorded, orderId: target.golfOrderId, paypalOrderId, guest: target.guest, amountCents: target.amountCents };
}

export async function startDoorVenmo(_organizer: Organizer, event: DoorEvent, target: ChargeTarget) {
  const venmo = venmoPayLink(target.amountCents, event.title);
  return {
    paid: false,
    qrUrl: venmo.qrUrl,
    note: venmo.note,
    username: venmo.username,
    orderId: target.golfOrderId,
    guest: target.guest,
    amountCents: target.amountCents,
  };
}

export async function recordDoorVenmo(organizer: Organizer, event: DoorEvent, target: ChargeTarget) {
  const reference = `venmo-${target.golfOrderId || target.guest.id}-${Date.now()}`;
  const recorded = await paidPayload(organizer, event, target, reference, reference, "venmo");
  return { paid: true, ...recorded, orderId: target.golfOrderId, guest: target.guest, amountCents: target.amountCents };
}

export async function syncDoorVenmo(organizer: Organizer, event: DoorEvent, target: ChargeTarget, paypalOrderId: string) {
  const current = await readPayPalOrder(paypalOrderId);
  if (current.status !== "APPROVED" && current.status !== "COMPLETED") {
    return { paid: false, status: current.status || "PENDING" };
  }
  const captured =
    current.status === "COMPLETED" && current.captureId
      ? { captureId: current.captureId }
      : await capturePayPalOrder(paypalOrderId);
  const recorded = await paidPayload(organizer, event, target, paypalOrderId, captured.captureId, "venmo");
  return { paid: true, ...recorded, orderId: target.golfOrderId, paypalOrderId, guest: target.guest, amountCents: target.amountCents };
}

export function cardFromBody(body: { number?: string; expiry?: string; securityCode?: string; name?: string }): CardInput {
  const number = String(body.number || "").replace(/\D/g, "");
  const expiry = String(body.expiry || "");
  const securityCode = String(body.securityCode || "").replace(/\D/g, "");
  const name = String(body.name || "").trim();
  if (number.length < 13 || number.length > 19) throw new HttpError("Enter the card number", 400);
  if (!/^\d{4}-\d{2}$/.test(expiry)) throw new HttpError("Enter the expiration as MM/YY", 400);
  if (securityCode.length < 3 || securityCode.length > 4) throw new HttpError("Enter the security code", 400);
  if (!name) throw new HttpError("Enter the name on the card", 400);
  return { number, expiry, securityCode, name };
}
