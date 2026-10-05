import { NextRequest, NextResponse } from "next/server";
import { loadEventById } from "@/lib/door/events";
import { jsonError } from "@/lib/door/http";
import { HttpError, signDoorPass } from "@/lib/door/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventId = String(body.eventId || "").trim().toUpperCase();
    if (!/^[A-Z0-9]{8}$/.test(eventId)) throw new HttpError("Enter the 8-character event id", 400);
    const { event, memberId } = await loadEventById(eventId);
    const token = await signDoorPass(event.id, memberId);
    return NextResponse.json({
      token,
      event: {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        startTime: event.startTime,
        location: event.location,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
