import { DoorEvent } from "./events";
import { Organizer, HttpError } from "./session";
import { apiGet, apiSend, callProc, dollarsToCents, varcharEight } from "./upstream";

export type Guest = {
  id: string;
  kind: "golf" | "event";
  eventId: string;
  name: string;
  email: string;
  phone: string | null;
  paidStatus: string;
  checkinStatus: string;
  amountDueCents: number;
  orderId: number | null;
  startingHole?: string | null;
  teamId?: string | null;
  assignmentLabel?: string | null;
  checkedInAt?: string | null;
  universityName?: string | null;
  eventName?: string | null;
};

type GolfPlayer = {
  player_id?: number;
  event_id: string;
  team_id?: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  paid_status?: string;
  checkin_status?: string;
  order_id?: number | null;
  starting_hole?: string | number | null;
  is_active_YN?: number | boolean | string | null;
};

type GolfOrder = {
  order_id?: number;
  event_id: string;
  total_cents?: number;
  amount_paid_cents?: number;
  order_status?: string;
  purchaser_name?: string;
  purchaser_email?: string;
  paypal_order_id?: string | null;
};

type RegistrantRow = {
  registrant_id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  paid_status?: string;
  checkin_status?: string;
  payment_amount?: number | string | null;
};

function active(value: GolfPlayer["is_active_YN"]) {
  return value !== 0 && value !== "0" && value !== false;
}

function balance(order?: GolfOrder | null) {
  if (!order) return 0;
  const status = (order.order_status || "").toUpperCase();
  if (status === "PAID" || status === "VOID" || status === "REFUNDED") return 0;
  const total = Number(order.total_cents || 0);
  const paid = Number(order.amount_paid_cents || 0);
  return Math.max(0, total - paid);
}

export async function listGuests(organizer: Organizer, event: DoorEvent): Promise<Guest[]> {
  if (event.managedGolf && event.golfEventId) {
    const [players, orders] = await Promise.all([
      apiGet<GolfPlayer>("/golf_players", { event_id: event.golfEventId }),
      apiGet<GolfOrder>("/golf_orders", { event_id: event.golfEventId }).catch(() => [] as GolfOrder[]),
    ]);
    return players
      .filter((player) => active(player.is_active_YN) && player.player_id != null)
      .map((player) => {
        const order = orders.find((item) => Number(item.order_id) === Number(player.order_id));
        const settled = ["PAID", "COMP", "SPONSOR_INCLUDED"].includes(player.paid_status || "");
        return {
          id: String(player.player_id),
          kind: "golf" as const,
          eventId: event.id,
          name: `${player.first_name || ""} ${player.last_name || ""}`.trim(),
          email: player.email,
          phone: player.phone || null,
          paidStatus: player.paid_status || "UNPAID",
          checkinStatus: player.checkin_status || "NOT_ARRIVED",
          amountDueCents: settled ? 0 : balance(order),
          orderId: player.order_id ?? null,
          startingHole: player.starting_hole == null || String(player.starting_hole).trim() === "" ? null : String(player.starting_hole).trim(),
          teamId: player.team_id == null ? null : String(player.team_id),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const rows = await apiGet<RegistrantRow>("/event_registrants", { event_id: event.id }).catch(() => [] as RegistrantRow[]);
  return rows
    .map((row) => {
      const settled = ["PAID", "COMP"].includes(row.paid_status || "");
      return {
        id: row.registrant_id,
        kind: "event" as const,
        eventId: event.id,
        name: `${row.first_name || ""} ${row.last_name || ""}`.trim(),
        email: row.email,
        phone: row.phone || null,
        paidStatus: row.paid_status || "UNPAID",
        checkinStatus: row.checkin_status || "NOT_ARRIVED",
        amountDueCents: settled ? 0 : event.costCents,
        orderId: null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function insertedId(row: { player_id?: number | null; order_id?: number | null; insertId?: number | null } | null | undefined, key: "player_id" | "order_id") {
  const value = Number(row?.[key] || row?.insertId);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

async function resolvePlayerId(eventId: string, email: string, created: GolfPlayer & { insertId?: number }) {
  const direct = insertedId(created, "player_id");
  if (direct) return direct;
  const rows = await apiGet<GolfPlayer>("/golf_players", { event_id: eventId });
  const match = rows
    .filter((row) => String(row.email || "").toLowerCase() === email.toLowerCase() && row.player_id)
    .sort((a, b) => Number(b.player_id) - Number(a.player_id))[0];
  return Number(match?.player_id || 0);
}

async function resolveOrderId(eventId: string, email: string, created: GolfOrder & { insertId?: number }) {
  const direct = insertedId(created, "order_id");
  if (direct) return direct;
  const rows = await apiGet<GolfOrder>("/golf_orders", { event_id: eventId, purchaser_email: email });
  const match = rows
    .filter((row) => String(row.purchaser_email || "").toLowerCase() === email.toLowerCase() && row.order_id)
    .sort((a, b) => Number(b.order_id) - Number(a.order_id))[0];
  return Number(match?.order_id || 0);
}

export async function createWalkupCharge(
  organizer: Organizer,
  event: DoorEvent,
  input: { firstName: string; lastName: string; email: string; phone?: string; amountCents: number; offline?: "CASH" | "CHECK" }
) {
  if (!input.firstName?.trim() || !input.lastName?.trim() || !input.email?.trim()) {
    throw new HttpError("Name and email are required", 400);
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new HttpError("Enter an amount greater than zero", 400);
  }
  const name = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
  const email = input.email.trim();

  if (event.managedGolf && event.golfEventId) {
    const created = await apiSend<GolfPlayer & { insertId?: number; success?: boolean; message?: string; error?: string }>("post", "/golf_players", {
      event_id: event.golfEventId,
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email,
      phone: input.phone?.trim() || null,
      paid_status: input.offline ? "PAID" : "UNPAID",
      checkin_status: "NOT_ARRIVED",
      is_active_YN: 1,
      created_by: organizer.member_id.slice(0, 20),
    });
    if (created?.success === false) throw new HttpError(created.message || created.error || "The guest was not added", 502);
    const playerId = await resolvePlayerId(event.golfEventId, email, created);
    if (!playerId) throw new HttpError("The guest was not added", 502);
    const order = await apiSend<GolfOrder & { insertId?: number }>("post", "/golf_orders", {
      event_id: event.golfEventId,
      purchaser_name: name,
      purchaser_email: email,
      member_id: organizer.member_id,
      subtotal_cents: input.amountCents,
      total_cents: input.amountCents,
      amount_paid_cents: input.offline ? input.amountCents : 0,
      currency: "USD",
      order_status: input.offline ? "PAID" : "PENDING",
      payment_gateway: input.offline ? "OFFLINE" : "PAYPAL",
      gateway_intent_id: input.offline || null,
    });
    const orderId = await resolveOrderId(event.golfEventId, email, order);
    if (!orderId) throw new HttpError("The payment could not be recorded", 502);
    await apiSend("post", "/golf_order_items", {
      order_id: orderId,
      item_type: "TICKET",
      description: input.offline ? `Door ${input.offline.toLowerCase()}` : "Door payment",
      quantity: 1,
      unit_price_cents: input.amountCents,
      fmv_cents: 0,
      line_total_cents: input.amountCents,
    });
    await apiSend("put", "/golf_players", { order_id: orderId }, { player_id: playerId });
    const guest = (await listGuests(organizer, event)).find((item) => item.id === String(playerId));
    return {
      guest: guest || { id: String(playerId), name, email, kind: "golf" as const },
      amountCents: input.amountCents,
      golfOrderId: orderId,
      kind: "golf" as const,
    };
  }

  const guest = await addGuest(organizer, event, { firstName: input.firstName, lastName: input.lastName, email, phone: input.phone });
  if (!guest) throw new HttpError("The guest was not added", 502);
  if (input.offline) {
    await apiSend(
      "put",
      "/event_registrants",
      {
        paid_status: "PAID",
        payment_amount: (input.amountCents / 100).toFixed(2),
        payment_method: input.offline,
        payment_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      },
      { registrant_id: guest.id }
    );
  }
  return { guest: { ...guest, name, email }, amountCents: input.amountCents, golfOrderId: null, kind: "event" as const };
}

export async function addGuest(organizer: Organizer, event: DoorEvent, input: { firstName: string; lastName: string; email: string; phone?: string }) {
  if (event.managedGolf) throw new HttpError("Golf guests come from outing registration", 400);
  if (!input.firstName?.trim() || !input.lastName?.trim() || !input.email?.trim()) {
    throw new HttpError("Name and email are required", 400);
  }
  const registrant_id = varcharEight();
  await apiSend("post", "/event_registrants", {
    registrant_id,
    event_id: event.id,
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    paid_status: event.costCents > 0 ? "UNPAID" : "COMP",
    checkin_status: "NOT_ARRIVED",
    is_active_YN: 1,
    created_by: organizer.member_id,
  });
  return (await listGuests(organizer, event)).find((guest) => guest.id === registrant_id);
}

export async function checkInGuest(organizer: Organizer, event: DoorEvent, guestId: string) {
  const guests = await listGuests(organizer, event);
  const guest = guests.find((item) => item.id === guestId);
  if (!guest) throw new HttpError("Guest not found", 404);
  if (guest.checkinStatus === "CHECKED_IN") return guest;

  try {
    await callProc("event_checkin", organizer.member_id, {
      event_id: event.id,
      registrant_id: guest.kind === "event" ? guest.id : undefined,
      player_id: guest.kind === "golf" ? Number(guest.id) : undefined,
      checkin_method: "MANUAL",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check-in failed";
    if (/not on the selected event/i.test(message)) throw new HttpError("This guest is for a different event", 409);
    if (/not found/i.test(message)) throw new HttpError("Guest not found", 404);
    throw new HttpError(message, 502);
  }

  const refreshed = await listGuests(organizer, event);
  return refreshed.find((item) => item.id === guestId) || { ...guest, checkinStatus: "CHECKED_IN" };
}

export async function undoCheckIn(organizer: Organizer, event: DoorEvent, guestId: string) {
  const guests = await listGuests(organizer, event);
  const guest = guests.find((item) => item.id === guestId);
  if (!guest) throw new HttpError("Guest not found", 404);
  if (guest.checkinStatus !== "CHECKED_IN") return guest;

  try {
    await callProc("event_undo_checkin", organizer.member_id, {
      event_id: event.id,
      registrant_id: guest.kind === "event" ? guest.id : undefined,
      player_id: guest.kind === "golf" ? Number(guest.id) : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not undo check-in";
    if (/not found/i.test(message)) throw new HttpError("Guest not found", 404);
    throw new HttpError(message, 502);
  }

  const refreshed = await listGuests(organizer, event);
  return refreshed.find((item) => item.id === guestId) || { ...guest, checkinStatus: "NOT_ARRIVED" };
}

export async function reserveCharge(organizer: Organizer, event: DoorEvent, guestId: string) {
  const guests = await listGuests(organizer, event);
  const guest = guests.find((item) => item.id === guestId);
  if (!guest) throw new HttpError("Guest not found", 404);
  if (["PAID", "COMP", "SPONSOR_INCLUDED"].includes(guest.paidStatus)) {
    throw new HttpError("This guest does not owe a balance", 400);
  }

  if (guest.kind === "golf" && event.golfEventId) {
    let orderId = guest.orderId;
    let amountCents = guest.amountDueCents;
    if (!orderId) {
      const tickets = await apiGet<{ unit_price_cents?: number; ticket_type_status?: string; type_name?: string }>(
        "/golf_ticket_types",
        { event_id: event.golfEventId }
      );
      const ticket = tickets.find((item) => item.ticket_type_status !== "ARCHIVED" && Number(item.unit_price_cents) > 0);
      amountCents = Number(ticket?.unit_price_cents || 0);
      if (!amountCents) throw new HttpError("No open balance", 400);
      const created = await apiSend<GolfOrder>("post", "/golf_orders", {
        event_id: event.golfEventId,
        purchaser_name: guest.name,
        purchaser_email: guest.email,
        member_id: organizer.member_id,
        subtotal_cents: amountCents,
        total_cents: amountCents,
        currency: "USD",
        order_status: "PENDING",
        payment_gateway: "PAYPAL",
      });
      orderId = Number(created.order_id);
      await apiSend("post", "/golf_order_items", {
        order_id: orderId,
        item_type: "TICKET",
        description: ticket?.type_name || "Registration",
        quantity: 1,
        unit_price_cents: amountCents,
        fmv_cents: 0,
        line_total_cents: amountCents,
      });
      await apiSend("put", "/golf_players", { order_id: orderId }, { player_id: guest.id });
    }
    if (!amountCents || !orderId) throw new HttpError("No open balance", 400);
    const order = (await apiGet<GolfOrder>("/golf_orders", { order_id: orderId }))[0];
    const due = balance(order);
    if (due !== amountCents && guest.orderId) {
      amountCents = due;
    }
    if (!amountCents) throw new HttpError("Amount does not match reserved order", 400);
    return { guest, amountCents, golfOrderId: orderId, kind: "golf" as const };
  }

  const amountCents = event.costCents || dollarsToCents(0);
  if (!amountCents) throw new HttpError("This event has no ticket price", 400);
  return { guest, amountCents, golfOrderId: null, kind: "event" as const };
}
