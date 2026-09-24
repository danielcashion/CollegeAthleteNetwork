import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/components/GolfOutingPage/golfOutingDisplay";
import { listPublicPackages } from "@/services/getGolfOutingPublic";
import { assertPublishedOuting, callPublicGolfProc, clientKey, rateLimit } from "../_public";

type PlayerInput = { first_name?: string; last_name?: string; email?: string };

function normalizePlayers(players: unknown) {
  if (!Array.isArray(players)) return [];
  return (players as PlayerInput[]).map((player) => ({
    first_name: String(player.first_name || "").trim(),
    last_name: String(player.last_name || "").trim(),
    email: String(player.email || "").trim(),
  }));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const contact_email = String(body.contact_email || "").trim();
  if (!rateLimit(clientKey(request, contact_email))) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const event = await assertPublishedOuting(body.event_id);
  if (!event || !["PUBLISHED", "SOLD_OUT", "REGISTRATION_CLOSED"].includes(event.event_status)) {
    return NextResponse.json({ error: "Sponsorships are not available" }, { status: 400 });
  }

  const sponsor_name = String(body.sponsor_name || "").trim();
  const package_id = Number(body.package_id);
  if (!sponsor_name || !isValidEmail(contact_email) || !package_id) {
    return NextResponse.json({ error: "Organization name, valid email, and package are required" }, { status: 400 });
  }

  const packages = await listPublicPackages(event.event_id);
  const selected = packages.find((row) => Number(row.sponsorship_type_id) === package_id);
  if (!selected) {
    return NextResponse.json({ error: "Package is not available" }, { status: 400 });
  }
  const remaining = selected.remaining_qty != null ? Number(selected.remaining_qty) : Number(selected.inventory ?? 0);
  if (remaining <= 0) {
    return NextResponse.json({ error: "Package is sold out" }, { status: 400 });
  }

  const players = normalizePlayers(body.players).filter((player) => player.first_name || player.last_name || player.email);
  if (selected.includes_foursome) {
    if (players.length !== 4 || players.some((player) => !player.first_name || !player.last_name || !isValidEmail(player.email))) {
      return NextResponse.json({ error: "Enter first name, last name, and a valid email for all four golfers" }, { status: 400 });
    }
  }

  try {
    const result = await callPublicGolfProc<{
      order_id: number;
      sponsor_id?: number;
      total_cents: number;
      order_status?: string;
    }>("golf_purchase_sponsorship", "", {
      event_id: event.event_id,
      package_id,
      sponsor_name,
      contact_email,
      contact_phone: String(body.contact_phone || "").trim() || null,
      logo_url: String(body.logo_url || "").trim() || null,
      public_display_YN: body.public_display_YN ?? 1,
      team_name: selected.includes_foursome ? String(body.team_name || "").trim() || null : null,
      players: selected.includes_foursome ? players : [],
    });
    return NextResponse.json({
      order_id: Number(result.order_id),
      sponsor_id: result.sponsor_id ? Number(result.sponsor_id) : undefined,
      total_cents: Number(result.total_cents),
      order_status: result.order_status || "PENDING",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not reserve sponsorship" },
      { status: 400 }
    );
  }
}
