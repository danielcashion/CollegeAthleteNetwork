import { NextRequest, NextResponse } from "next/server";
import { openDoor } from "@/lib/door/door";
import { jsonError } from "@/lib/door/http";
import { checkInTicket } from "@/lib/door/tickets";

type Context = { params: Promise<{ eventId: string }> };

export async function POST(request: NextRequest, context: Context) {
  try {
    const { eventId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { organizer, event } = await openDoor(request, eventId);
    const result = await checkInTicket(organizer, event, String(body.payload || ""));
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
