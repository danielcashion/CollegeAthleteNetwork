import { NextRequest, NextResponse } from "next/server";
import { callTicketProc } from "@/lib/tickets/gateway";
import { ticketSecretOk } from "@/lib/tickets/secret";
import { ulid } from "@/lib/tickets/token";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!ticketSecretOk(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const playerId = Number(body.player_id);
  const eventId = String(body.event_id || "").trim();
  if (!playerId || !eventId) return NextResponse.json({ error: "player_id and event_id are required" }, { status: 400 });
  const memberId = String(body.member_id || "PUBLIC");
  try {
    if (body.rotate) {
      const rows = await callTicketProc(
        "ticket_rotate",
        { player_id: playerId, event_id: eventId, public_id: ulid() },
        { memberId }
      );
      return NextResponse.json({ ok: true, ticket: rows[0] || null });
    }
    const rows = await callTicketProc("ticket_revoke", { player_id: playerId, event_id: eventId }, { memberId });
    return NextResponse.json({ ok: true, ticket: rows[0] || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Revoke failed";
    const status = /not found/i.test(message) ? 404 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
