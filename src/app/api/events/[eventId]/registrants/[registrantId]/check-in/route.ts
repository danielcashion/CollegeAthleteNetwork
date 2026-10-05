import { NextRequest, NextResponse } from "next/server";
import { openDoor } from "@/lib/door/door";
import { jsonError } from "@/lib/door/http";
import { checkInGuest, undoCheckIn } from "@/lib/door/registrants";

type Context = { params: Promise<{ eventId: string; registrantId: string }> };

export async function POST(request: NextRequest, context: Context) {
  try {
    const { eventId, registrantId } = await context.params;
    const { organizer, event } = await openDoor(request, eventId);
    const guest = await checkInGuest(organizer, event, registrantId);
    return NextResponse.json({ guest });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { eventId, registrantId } = await context.params;
    const { organizer, event } = await openDoor(request, eventId);
    const guest = await undoCheckIn(organizer, event, registrantId);
    return NextResponse.json({ guest });
  } catch (error) {
    return jsonError(error);
  }
}
