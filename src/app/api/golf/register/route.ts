import { NextRequest, NextResponse } from "next/server";
import { attendeesPerTicket, isValidEmail } from "@/components/GolfOutingPage/golfOutingDisplay";
import { listPublicTickets } from "@/services/getGolfOutingPublic";
import { assertPublishedOuting, callPublicGolfProc, clientKey, rateLimit } from "../_public";

type PlayerInput = { first_name?: string; last_name?: string; email?: string; phone?: string };

function normalizePlayers(players: unknown): Array<{
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}> {
  if (!Array.isArray(players)) return [];
  return (players as PlayerInput[]).map((player) => ({
    first_name: String(player.first_name || "").trim(),
    last_name: String(player.last_name || "").trim(),
    email: String(player.email || "").trim(),
    phone: String(player.phone || "").trim() || null,
  }));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const purchaser_email = String(body.purchaser_email || "").trim();
  if (!rateLimit(clientKey(request, purchaser_email))) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const event = await assertPublishedOuting(body.event_id);
  if (!event || event.event_status !== "PUBLISHED") {
    return NextResponse.json({ error: "Registration is not open" }, { status: 400 });
  }

  const purchaser_name = String(body.purchaser_name || "").trim();
  const ticket_type_id = Number(body.ticket_type_id);
  const quantity = Math.max(1, Number(body.quantity) || 1);
  if (!purchaser_name || !isValidEmail(purchaser_email) || !ticket_type_id) {
    return NextResponse.json({ error: "Name, valid email, and ticket are required" }, { status: 400 });
  }

  const tickets = await listPublicTickets(event.event_id);
  const ticket = tickets.find((row) => Number(row.ticket_type_id) === ticket_type_id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket type is not available" }, { status: 400 });
  }

  const seats = attendeesPerTicket(ticket.type_name) * quantity;
  const players = normalizePlayers(body.players);
  if (players.length !== seats) {
    return NextResponse.json({ error: "Roster does not match ticket quantity" }, { status: 400 });
  }
  if (players.some((player) => !player.first_name || !player.last_name || !isValidEmail(player.email))) {
    return NextResponse.json({ error: "Each attendee needs a first name, last name, and valid email" }, { status: 400 });
  }

  try {
    const result = await callPublicGolfProc<{
      order_id: number;
      total_cents: number;
      order_status?: string;
    }>("golf_register", "", {
      event_id: event.event_id,
      ticket_type_id,
      purchaser_name,
      purchaser_email,
      purchaser_phone: String(body.purchaser_phone || "").trim() || null,
      quantity,
      group_size: attendeesPerTicket(ticket.type_name),
      team_names: Array.isArray(body.team_names)
        ? body.team_names.map((name: unknown) => String(name || "").trim()).filter(Boolean)
        : [],
      players,
    });
    return NextResponse.json({
      order_id: Number(result.order_id),
      total_cents: Number(result.total_cents),
      order_status: result.order_status || "PENDING",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not reserve registration" },
      { status: 400 }
    );
  }
}
