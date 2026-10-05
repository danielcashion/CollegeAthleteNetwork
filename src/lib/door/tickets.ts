import { DoorEvent } from "./events";
import { Guest } from "./registrants";
import { HttpError, Organizer } from "./session";
import { callProc } from "./upstream";

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

type TicketLookup = {
  public_id?: string;
  ticket_id?: number;
  status?: string;
  player_id?: number;
  registrant_id?: string | null;
  golf_event_id?: string;
  door_event_id?: string | null;
  first_name?: string;
  last_name?: string;
  paid_status?: string;
  checkin_status?: string;
  checked_in_at?: string | null;
  live_assignment_kind?: string | null;
  live_assignment_value?: string | null;
  product_type?: string | null;
  event_name?: string;
  university_name?: string;
};

function ticketPublicId(value: string) {
  const raw = value.trim();
  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    const marker = parts.findIndex((part) => part.toLowerCase() === "t");
    const candidate = marker >= 0 ? parts[marker + 1] || "" : "";
    if (ULID_PATTERN.test(candidate.toUpperCase())) return candidate.toUpperCase();
  } catch {
    // Scanner payloads are often a raw path.
  }
  const segment = raw.split(/[/?#]/).filter(Boolean).pop() || "";
  return ULID_PATTERN.test(segment.toUpperCase()) ? segment.toUpperCase() : "";
}

function assignmentLabel(kind?: string | null, value?: string | null) {
  const table = String(kind || "").toUpperCase() === "TABLE";
  const clean = String(value || "").trim();
  if (!clean) return table ? "Table to be assigned" : "Hole to be assigned";
  return table ? `Table ${clean}` : `Hole ${clean}`;
}

export async function checkInTicket(organizer: Organizer, event: DoorEvent, payload: string) {
  const publicId = ticketPublicId(payload);
  if (!publicId) throw new HttpError("That code is not a ticket", 400);
  const secret = process.env.TICKET_PROC_SECRET || "";
  if (!secret) throw new HttpError("Ticket check-in is not configured", 503);

  let row: TicketLookup;
  try {
    const raw = await callProc<TicketLookup | TicketLookup[]>("ticket_lookup", organizer.member_id, {
      public_id: publicId,
      proc_secret: secret,
    });
    row = (Array.isArray(raw) ? raw[0] : raw) || {};
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/not found/i.test(message)) throw new HttpError("Ticket not found", 404);
    throw new HttpError(message || "Ticket lookup failed", 502);
  }

  if (!row?.public_id || !row.golf_event_id) throw new HttpError("No ticket matches that code", 404);
  const status = String(row.status || "").toUpperCase();
  if (status === "REVOKED" || status === "SUPERSEDED") throw new HttpError("This ticket was revoked and cannot be used", 410);
  if (status !== "ISSUED") throw new HttpError("No ticket matches that code", 404);
  const doorId = String(row.door_event_id || "").toUpperCase();
  const golfId = String(row.golf_event_id || "").toUpperCase();
  const openId = event.id.toUpperCase();
  const openGolf = String(event.golfEventId || "").toUpperCase();
  const sameEvent = (doorId && doorId === openId) || golfId === openId || (openGolf !== "" && golfId === openGolf);
  if (!sameEvent) {
    const name = String(row.event_name || "").trim();
    throw new HttpError(name ? `This ticket is for ${name}` : "This ticket is for a different event", 409);
  }

  let result: { checked_in_at?: string; already_checked_in?: number; registrant_id?: string };
  try {
    result = await callProc<{ checked_in_at?: string; already_checked_in?: number; registrant_id?: string }>("event_checkin", organizer.member_id, {
      event_id: event.id,
      registrant_id: row.registrant_id || undefined,
      player_id: row.player_id || undefined,
      checkin_method: "QR",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check-in failed";
    if (/not on the selected event/i.test(message)) throw new HttpError("This ticket is for a different event", 409);
    if (/not found/i.test(message)) throw new HttpError("Ticket not found", 404);
    throw new HttpError(message, 502);
  }
  const checkedInAt = result?.checked_in_at || row.checked_in_at || null;
  const alreadyCheckedIn = Number(result?.already_checked_in) === 1;

  const kind = String(row.live_assignment_kind || (row.product_type === "NETWORKING" ? "TABLE" : "HOLE"));
  const guest: Guest = {
    id: String(result?.registrant_id || row.registrant_id || row.player_id),
    kind: "golf",
    eventId: event.id,
    name: `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Guest",
    email: "",
    phone: null,
    paidStatus: row.paid_status || "UNPAID",
    checkinStatus: "CHECKED_IN",
    amountDueCents: ["PAID", "COMP", "SPONSOR_INCLUDED"].includes(String(row.paid_status || "")) ? 0 : event.costCents,
    orderId: null,
    startingHole: kind === "HOLE" ? String(row.live_assignment_value || "").trim() || null : null,
    assignmentLabel: assignmentLabel(kind, row.live_assignment_value),
    checkedInAt,
    universityName: row.university_name || event.universityName,
    eventName: row.event_name || event.title,
  };
  return { guest, alreadyCheckedIn: alreadyCheckedIn || false };
}
