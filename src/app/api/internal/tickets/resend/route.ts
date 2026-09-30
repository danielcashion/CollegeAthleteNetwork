import { NextRequest, NextResponse } from "next/server";
import { callTicketProc } from "@/lib/tickets/gateway";
import { resendTicket } from "@/lib/tickets/deliver";
import { ticketSecretOk } from "@/lib/tickets/secret";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!ticketSecretOk(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const playerId = Number(body.player_id);
  const eventId = String(body.event_id || "").trim();
  const idempotencyKey = String(body.idempotency_key || "").trim();
  if (!playerId || !eventId || !idempotencyKey) {
    return NextResponse.json({ error: "player_id, event_id, and idempotency_key are required" }, { status: 400 });
  }
  try {
    const rows = await callTicketProc(
      "ticket_resend",
      { player_id: playerId, event_id: eventId, idempotency_key: idempotencyKey },
      { memberId: String(body.member_id || "PUBLIC") }
    );
    const row = rows[0];
    if (Number(row?.duplicate) === 1) return NextResponse.json({ ok: true, duplicate: true });
    if (!row?.public_id) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    await resendTicket(row);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Resend failed";
    const status = /not found/i.test(message) ? 404 : /forbidden|not configured/i.test(message) ? 403 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
