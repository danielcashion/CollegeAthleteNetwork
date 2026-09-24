import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/components/GolfOutingPage/golfOutingDisplay";
import { listPublicPackages, type GolfPackagePublic } from "@/services/getGolfOutingPublic";
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

function remainingOf(pkg: GolfPackagePublic) {
  return pkg.remaining_qty != null ? Number(pkg.remaining_qty) : Number(pkg.inventory ?? 0);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const event = await assertPublishedOuting(body.event_id);
  if (!event || !["PUBLISHED", "SOLD_OUT", "REGISTRATION_CLOSED"].includes(event.event_status)) {
    return NextResponse.json({ error: "Sponsorships are not available" }, { status: 400 });
  }

  const rawItems = Array.isArray(body.items)
    ? body.items
    : body.package_id
      ? [
          {
            package_id: body.package_id,
            sponsor_name: body.sponsor_name,
            contact_email: body.contact_email,
            contact_phone: body.contact_phone,
            logo_url: body.logo_url,
            public_display_YN: body.public_display_YN,
            team_name: body.team_name,
            players: body.players,
          },
        ]
      : [];

  if (rawItems.length === 0) {
    return NextResponse.json({ error: "Add at least one sponsorship to the cart" }, { status: 400 });
  }

  const packages = await listPublicPackages(event.event_id);
  const reserved = new Map<number, number>();
  const items = [];

  for (const raw of rawItems) {
    const sponsor_name = String(raw.sponsor_name || "").trim();
    const contact_email = String(raw.contact_email || "").trim();
    const package_id = Number(raw.package_id);
    if (!sponsor_name || !isValidEmail(contact_email) || !package_id) {
      return NextResponse.json({ error: "Each item needs an organization name, valid email, and package" }, { status: 400 });
    }
    if (!rateLimit(clientKey(request, contact_email))) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }

    const selected = packages.find((row) => Number(row.sponsorship_type_id) === package_id);
    if (!selected) {
      return NextResponse.json({ error: "Package is not available" }, { status: 400 });
    }
    const already = reserved.get(package_id) || 0;
    if (already + 1 > remainingOf(selected)) {
      return NextResponse.json({ error: `${selected.sponsorship_name} does not have enough remaining inventory` }, { status: 400 });
    }
    reserved.set(package_id, already + 1);

    const players = normalizePlayers(raw.players).filter((player) => player.first_name || player.last_name || player.email);
    if (selected.includes_foursome) {
      if (players.length !== 4 || players.some((player) => !player.first_name || !player.last_name || !isValidEmail(player.email))) {
        return NextResponse.json({ error: `Enter first name, last name, and a valid email for all four golfers on ${selected.sponsorship_name}` }, { status: 400 });
      }
    }

    items.push({
      package_id,
      sponsor_name,
      contact_email,
      contact_phone: String(raw.contact_phone || "").trim() || null,
      logo_url: String(raw.logo_url || "").trim() || null,
      public_display_YN: raw.public_display_YN ?? 1,
      team_name: selected.includes_foursome ? String(raw.team_name || "").trim() || null : null,
      players: selected.includes_foursome ? players : [],
    });
  }

  const first = items[0];
  try {
    const result = await callPublicGolfProc<{
      order_id: number;
      sponsor_id?: number;
      total_cents: number;
      order_status?: string;
    }>("golf_purchase_sponsorship", "", {
      event_id: event.event_id,
      purchaser_name: String(body.purchaser_name || first.sponsor_name).trim(),
      purchaser_email: String(body.purchaser_email || first.contact_email).trim(),
      purchaser_phone: String(body.purchaser_phone || "").trim() || null,
      items,
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
