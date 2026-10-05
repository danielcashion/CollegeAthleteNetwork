import { NextRequest, NextResponse } from "next/server";
import { openDoor } from "@/lib/door/door";
import { jsonError } from "@/lib/door/http";
import { addGuest, listGuests } from "@/lib/door/registrants";

type Context = { params: Promise<{ eventId: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const { eventId } = await context.params;
    const { organizer, event } = await openDoor(request, eventId);
    const guests = await listGuests(organizer, event);
    return NextResponse.json({ event, guests });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest, context: Context) {
  try {
    const { eventId } = await context.params;
    const { organizer, event } = await openDoor(request, eventId);
    const body = await request.json();
    const guest = await addGuest(organizer, event, {
      firstName: String(body.firstName || ""),
      lastName: String(body.lastName || ""),
      email: String(body.email || ""),
      phone: body.phone ? String(body.phone) : undefined,
    });
    return NextResponse.json({ guest });
  } catch (error) {
    return jsonError(error);
  }
}
