import { NextRequest, NextResponse } from "next/server";
import { syncAssignment } from "@/lib/tickets/deliver";
import { ticketSecretOk } from "@/lib/tickets/secret";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!ticketSecretOk(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const eventId = String(body.event_id || "").trim();
  const playerIds = Array.isArray(body.player_ids) ? body.player_ids.map(Number).filter(Boolean) : [];
  if (!eventId || !playerIds.length) {
    return NextResponse.json({ error: "event_id and player_ids are required" }, { status: 400 });
  }
  const updated = [];
  for (const playerId of playerIds) {
    try {
      const row = await syncAssignment(
        playerId,
        eventId,
        String(body.member_id || "PUBLIC"),
        body.assignment_value === undefined ? undefined : String(body.assignment_value ?? "")
      );
      if (row) updated.push(row.player_id);
    } catch (error) {
      console.error("ticket assignment sync failed", error);
    }
  }
  return NextResponse.json({ ok: true, updated });
}
