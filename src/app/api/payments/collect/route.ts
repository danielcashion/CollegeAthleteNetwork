import { NextRequest, NextResponse } from "next/server";
import { openDoor } from "@/lib/door/door";
import { jsonError } from "@/lib/door/http";
import { HttpError } from "@/lib/door/session";
import { createWalkupCharge } from "@/lib/door/registrants";

const METHODS = ["cash", "check"] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const method = String(body.method || "");
    if (!METHODS.includes(method as (typeof METHODS)[number])) {
      throw new HttpError("Card, Apple Pay, and Venmo are charged from the payment sheet", 400);
    }
    const amountCents = Math.round(Number(body.amountCents));
    const { organizer, event } = await openDoor(request, String(body.eventId || ""));
    const recorded = await createWalkupCharge(organizer, event, {
      firstName: String(body.firstName || ""),
      lastName: String(body.lastName || ""),
      email: String(body.email || ""),
      amountCents,
      offline: method === "cash" ? "CASH" : "CHECK",
    });
    return NextResponse.json({
      recorded: true,
      guest: recorded.guest,
      amountCents,
      orderId: recorded.golfOrderId,
    });
  } catch (error) {
    return jsonError(error);
  }
}
