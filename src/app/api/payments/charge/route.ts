import { NextRequest, NextResponse } from "next/server";
import { chargeDoorCard, cardFromBody, prepareCharge, recordDoorVenmo, startDoorApplePay, startDoorApplePayAmount, startDoorVenmo, syncDoorApplePay, syncDoorVenmo } from "@/lib/door/doorCharge";
import { openDoor } from "@/lib/door/door";
import { jsonError } from "@/lib/door/http";
import { HttpError } from "@/lib/door/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const method = String(body.method || "");
    const action = String(body.action || "pay");
    if (!["card", "applepay", "venmo"].includes(method)) throw new HttpError("Choose how this payment was made", 400);
    const { organizer, event } = await openDoor(request, String(body.eventId || ""));

    if ((method === "venmo" || method === "applepay") && (action === "status" || action === "received")) {
      const kind = body.kind === "event" ? "event" : "golf";
      const target = {
        guest: {
          id: String(body.registrantId || ""),
          name: String(body.guestName || ""),
          email: String(body.email || ""),
          kind,
        },
        amountCents: Math.round(Number(body.amountCents)),
        golfOrderId: body.orderId ? Number(body.orderId) : null,
        kind,
      } as const;
      if (method === "applepay") {
        const paypalOrderId = String(body.paypalOrderId || "");
        if (!paypalOrderId) throw new HttpError("This Apple Pay payment has not started", 400);
        return NextResponse.json(await syncDoorApplePay(organizer, event, target, paypalOrderId));
      }
      if (action === "received") return NextResponse.json(await recordDoorVenmo(organizer, event, target));
      const paypalOrderId = String(body.paypalOrderId || "");
      if (!paypalOrderId) throw new HttpError("This Venmo payment has not started", 400);
      return NextResponse.json(await syncDoorVenmo(organizer, event, target, paypalOrderId));
    }

    if (method === "applepay" && !body.registrantId && !String(body.email || "").trim()) {
      return NextResponse.json(await startDoorApplePayAmount(event, Math.round(Number(body.amountCents))));
    }

    const target = await prepareCharge(organizer, event, {
      registrantId: body.registrantId ? String(body.registrantId) : undefined,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      amountCents: body.amountCents,
    });
    if (method === "venmo") {
      return NextResponse.json(await startDoorVenmo(organizer, event, target));
    }
    if (method === "applepay") {
      return NextResponse.json(await startDoorApplePay(organizer, event, target));
    }
    const expiry = expiryYearMonth(String(body.card?.expiry || ""));
    return NextResponse.json(
      await chargeDoorCard(
        organizer,
        event,
        target,
        cardFromBody({
          number: body.card?.number,
          expiry,
          securityCode: body.card?.securityCode,
          name: body.card?.name || `${body.firstName || ""} ${body.lastName || ""}`.trim(),
        })
      )
    );
  } catch (error) {
    return jsonError(error);
  }
}

function expiryYearMonth(value: string) {
  const match = value.replace(/\s/g, "").match(/^(\d{2})\/?(\d{2})$/);
  if (!match) return value;
  return `20${match[2]}-${match[1]}`;
}
