import { NextRequest, NextResponse } from "next/server";
import { listTodayEvents } from "@/lib/door/events";
import { jsonError } from "@/lib/door/http";
import { assertOrganizer, readOrganizer } from "@/lib/door/session";

export async function GET(request: NextRequest) {
  try {
    const organizer = await readOrganizer(request);
    assertOrganizer(organizer);
    const events = await listTodayEvents(organizer);
    return NextResponse.json({ events });
  } catch (error) {
    return jsonError(error);
  }
}
