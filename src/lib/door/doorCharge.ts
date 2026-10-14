import { DoorEvent, doorOrganizer, loadEventById } from "./events";
import { chargeDescription, recordCapturedPayment } from "./fulfill";
import { HttpError, Organizer } from "./session";
import { CardInput, chargeCard, createPayPalOrder, getPayPalConfig, readPayPalOrder, capturePayPalOrder, venmoPayLink } from "./paypal";
import { claimWalkupOrder, createWalkupCharge, Guest, reserveCharge, reserveWalkupOrder } from "./registrants";
import { apiGet, apiSend } from "./upstream";

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

function doorMarker(event: DoorEvent, memberId: string, kind: "golf" | "event" | "walkup", guestId: string, amountCents: number) {
  return `door|${event.id}|${memberId}|${kind}|${guestId}|${amountCents}`.slice(0, 127);
}

export async function startDoorApplePayAmount(event: DoorEvent, amountCents: number, memberId: string) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) throw new HttpError("Enter an amount greater than zero", 400);
  const organizer = doorOrganizer(memberId || "DOOR", event);
  if (!event.managedGolf || !event.golfEventId) {
    const created = await createPayPalOrder({
      amountCents,
      invoiceId: `${event.id}-${Date.now()}`.slice(0, 127),
      description: event.title.slice(0, 120),
      customId: doorMarker(event, organizer.member_id, "walkup", "", amountCents),
    });
    return applePayCheckout(created.id, event.title, "", amountCents, null);
  }
  const orderId = await reserveWalkupOrder(organizer, event, amountCents);
  const created = await createPayPalOrder({
    amountCents,
    invoiceId: `${event.golfEventId}-${orderId}`.slice(0, 127),
    description: event.title.slice(0, 120),
    customId: doorMarker(event, organizer.member_id, "walkup", String(orderId), amountCents),
  });
  await rememberOrder({ guest: { id: "", name: "", email: "", kind: "golf" }, amountCents, golfOrderId: orderId, kind: "golf" }, created.id);
  return applePayCheckout(created.id, event.title, "", amountCents, orderId);
}

export async function startDoorApplePay(organizer: Organizer, event: DoorEvent, target: ChargeTarget) {
  const created = await createPayPalOrder({
    ...orderInput(event, target),
    customId: doorMarker(event, organizer.member_id || "DOOR", target.kind, target.guest.id, target.amountCents),
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

type PaidApple = {
  paid: true;
  orderId: number | null;
  paypalOrderId: string;
  amountCents: number;
  guest: { id: string; name: string; email: string; kind: "golf" | "event" };
};

type GolfOrderRow = {
  order_id?: number;
  event_id?: string;
  order_status?: string;
  purchaser_name?: string;
  purchaser_email?: string;
  paypal_order_id?: string | null;
  total_cents?: number;
  member_id?: string | null;
};

type GolfPlayerRow = {
  player_id?: number;
  order_id?: number | null;
  first_name?: string;
  last_name?: string;
  email?: string;
};

type RegistrantPayRow = {
  registrant_id?: string;
  event_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  paid_status?: string;
  paypal_order_id?: string | null;
  payment_amount?: number | string | null;
};

function samePayPal(value: string | null | undefined, paypalOrderId: string) {
  return String(value || "") === paypalOrderId;
}

async function recordedApplePay(paypalOrderId: string): Promise<PaidApple | null> {
  const orders = await apiGet<GolfOrderRow>("/golf_orders", { paypal_order_id: paypalOrderId }).catch(() => [] as GolfOrderRow[]);
  const paidOrder = orders
    .filter((order) => samePayPal(order.paypal_order_id, paypalOrderId) && String(order.order_status || "").toUpperCase() === "PAID" && order.order_id)
    .sort((a, b) => Number(b.order_id) - Number(a.order_id))[0];
  if (paidOrder?.event_id) {
    const players = await apiGet<GolfPlayerRow>("/golf_players", { event_id: paidOrder.event_id }).catch(() => [] as GolfPlayerRow[]);
    const player = players
      .filter((row) => Number(row.order_id) === Number(paidOrder.order_id) && row.player_id)
      .sort((a, b) => Number(b.player_id) - Number(a.player_id))[0];
    const name = player ? `${player.first_name || ""} ${player.last_name || ""}`.trim() : paidOrder.purchaser_name || "";
    return {
      paid: true,
      orderId: Number(paidOrder.order_id),
      paypalOrderId,
      amountCents: Number(paidOrder.total_cents || 0),
      guest: {
        id: player?.player_id ? String(player.player_id) : "",
        name,
        email: player?.email || paidOrder.purchaser_email || "",
        kind: "golf",
      },
    };
  }

  const registrants = await apiGet<RegistrantPayRow>("/event_registrants", { paypal_order_id: paypalOrderId }).catch(() => [] as RegistrantPayRow[]);
  const paidGuest = registrants.find(
    (row) => samePayPal(row.paypal_order_id, paypalOrderId) && ["PAID", "COMP"].includes(String(row.paid_status || "").toUpperCase()) && row.registrant_id
  );
  if (!paidGuest) return null;
  const dollars = Number(paidGuest.payment_amount);
  return {
    paid: true,
    orderId: null,
    paypalOrderId,
    amountCents: Number.isFinite(dollars) ? Math.round(dollars * 100) : 0,
    guest: {
      id: String(paidGuest.registrant_id),
      name: `${paidGuest.first_name || ""} ${paidGuest.last_name || ""}`.trim(),
      email: paidGuest.email || "",
      kind: "event",
    },
  };
}

async function pendingGolfOrder(paypalOrderId: string) {
  const orders = await apiGet<GolfOrderRow>("/golf_orders", { paypal_order_id: paypalOrderId }).catch(() => [] as GolfOrderRow[]);
  return (
    orders
      .filter((order) => {
        const status = String(order.order_status || "").toUpperCase();
        return samePayPal(order.paypal_order_id, paypalOrderId) && order.order_id && order.event_id && (status === "PENDING" || status === "PARTIAL");
      })
      .sort((a, b) => Number(b.order_id) - Number(a.order_id))[0] || null
  );
}

function parseDoorMarker(customId: string, invoiceId: string) {
  const parts = customId.split("|");
  if (parts[0] === "door" && parts.length >= 6) {
    const kind = parts[3] === "event" ? "event" : parts[3] === "golf" ? "golf" : "walkup";
    return { eventId: parts[1] || "", memberId: parts[2] || "DOOR", kind, guestId: parts[4] || "", amountCents: Number(parts[5]) };
  }
  const walkup = customId.match(/^door_apple_([A-Za-z0-9]+)_(\d+)_/);
  if (walkup) return { eventId: walkup[1], memberId: "DOOR", kind: "walkup" as const, guestId: "", amountCents: Number(walkup[2]) };
  if (customId.startsWith("door_apple_") && invoiceId) {
    return { eventId: invoiceId, memberId: "DOOR", kind: "walkup" as const, guestId: "", amountCents: 0 };
  }
  return null;
}

async function readApprovedOrder(paypalOrderId: string) {
  let current = await readPayPalOrder(paypalOrderId);
  for (let attempt = 0; attempt < 4 && current.status !== "APPROVED" && current.status !== "COMPLETED"; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    current = await readPayPalOrder(paypalOrderId);
  }
  if (current.status !== "APPROVED" && current.status !== "COMPLETED") {
    console.error("door apple pay not approved", paypalOrderId, current.status || "UNKNOWN");
    throw new HttpError("Apple Pay has not finished", 409);
  }
  return current;
}

async function captureApprovedOrder(paypalOrderId: string, status: string, captureId?: string) {
  if (status === "COMPLETED") return captureId || paypalOrderId;
  try {
    return (await capturePayPalOrder(paypalOrderId)).captureId;
  } catch (error) {
    const again = await readPayPalOrder(paypalOrderId);
    if (again.status === "COMPLETED") return again.captureId || paypalOrderId;
    const message = error instanceof Error ? error.message : "Apple Pay could not be recorded";
    console.error("door apple pay capture failed", paypalOrderId, again.status, message);
    throw new HttpError(message || "Apple Pay could not be recorded", 502);
  }
}

async function finishPendingOrder(
  order: GolfOrderRow,
  paypalOrderId: string,
  captureId: string,
  payer: { firstName: string; lastName: string; email: string; phone: string }
) {
  const loaded = await loadEventById(String(order.event_id));
  const organizer = doorOrganizer(order.member_id || "DOOR", loaded.event);
  const players = await apiGet<GolfPlayerRow>("/golf_players", { event_id: order.event_id }).catch(() => [] as GolfPlayerRow[]);
  const linked = players.find((row) => Number(row.order_id) === Number(order.order_id) && row.player_id);
  const target = linked
    ? {
        guest: {
          id: String(linked.player_id),
          name: `${linked.first_name || ""} ${linked.last_name || ""}`.trim() || order.purchaser_name || "Guest",
          email: linked.email || order.purchaser_email || "",
          kind: "golf" as const,
        },
        amountCents: Number(order.total_cents || 0),
        golfOrderId: Number(order.order_id),
        kind: "golf" as const,
      }
    : await claimWalkupOrder(organizer, loaded.event, Number(order.order_id), {
        firstName: payer.firstName,
        lastName: payer.lastName,
        email: payer.email,
        phone: payer.phone,
        amountCents: Number(order.total_cents || 0),
      });
  await paidPayload(organizer, loaded.event, target, paypalOrderId, captureId, "applepay");
}

const completing = new Map<string, Promise<PaidApple>>();

async function finishDoorApplePay(paypalOrderId: string): Promise<PaidApple> {
  const existing = await recordedApplePay(paypalOrderId);
  if (existing) return existing;

  const pending = await pendingGolfOrder(paypalOrderId);
  const current = await readApprovedOrder(paypalOrderId);
  const marker = parseDoorMarker(current.customId, current.invoiceId);
  if (!pending && !marker?.eventId) throw new HttpError("This payment is not a door charge", 400);
  const captureId = await captureApprovedOrder(paypalOrderId, current.status, current.captureId);

  if (pending) {
    await finishPendingOrder(pending, paypalOrderId, captureId, current);
  } else if (marker) {
    const loaded = await loadEventById(marker.eventId);
    const organizer = doorOrganizer(marker.memberId || "DOOR", loaded.event);
    const amountCents = current.amountCents || marker.amountCents;
    let target: ChargeTarget;
    if (marker.guestId && marker.kind !== "walkup") {
      target = await reserveCharge(organizer, loaded.event, marker.guestId);
    } else {
      target = await createWalkupCharge(organizer, loaded.event, {
        firstName: current.firstName || "Apple Pay",
        lastName: current.lastName || "Guest",
        email: current.email || `applepay+${paypalOrderId.toLowerCase()}@collegeathletenetwork.org`,
        phone: current.phone,
        amountCents,
      });
      await rememberOrder(target, paypalOrderId);
    }
    await paidPayload(organizer, loaded.event, target, paypalOrderId, captureId, "applepay");
  }

  const recorded = await recordedApplePay(paypalOrderId);
  if (!recorded) throw new HttpError("Apple Pay could not be recorded", 502);
  console.info("door apple pay recorded", paypalOrderId);
  return recorded;
}

export async function completeDoorApplePay(paypalOrderId: string) {
  const done = await recordedApplePay(paypalOrderId);
  if (done) return done;
  let pending = completing.get(paypalOrderId);
  if (!pending) {
    pending = finishDoorApplePay(paypalOrderId).finally(() => completing.delete(paypalOrderId));
    completing.set(paypalOrderId, pending);
  }
  return pending;
}

export async function waitForDoorApplePay(paypalOrderId: string) {
  return (await recordedApplePay(paypalOrderId)) || { paid: false as const, status: "WAITING", paypalOrderId };
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
