import { NextRequest, NextResponse } from "next/server";
import { openDoor } from "@/lib/door/door";
import { jsonError } from "@/lib/door/http";
import { assignStartingHole } from "@/lib/door/registrants";
import { syncAssignment } from "@/lib/tickets/deliver";

type Context = { params: Promise<{ eventId: string; registrantId: string }> };

export async function POST(request: NextRequest, context: Context) {
  try {
    const { eventId, registrantId } = await context.params;
    const { organizer, event } = await openDoor(request, eventId);
    const body = await request.json().catch(() => ({}));
    const hole = Number(body.hole);
    const guest = await assignStartingHole(organizer, event, registrantId, hole);
    if (event.golfEventId) {
      try {
        await syncAssignment(Number(registrantId), event.golfEventId, organizer.member_id, String(hole));
      } catch (error) {
        console.error("ticket assignment sync failed", error);
      }
    }
    return NextResponse.json({ guest });
  } catch (error) {
    return jsonError(error);
  }
}
