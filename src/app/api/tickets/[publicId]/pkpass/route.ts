import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/app/api/golf/_public";
import { buildPkPass } from "@/lib/tickets/apple";
import { callTicketProc } from "@/lib/tickets/gateway";
import { appleConfigured } from "@/lib/tickets/fields";
import { ticketOrigin, ULID_PATTERN } from "@/lib/tickets/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function limited(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return !rateLimit(`ticket:${ip}`, 30, 10 * 60 * 1000);
}

async function issuedTicket(publicId: string) {
  const rows = await callTicketProc("ticket_lookup", { public_id: publicId }, { secret: false });
  const row = rows.find((item) => String(item.public_id || "").toUpperCase() === publicId) || null;
  if (!row?.public_id || (row.status && row.status !== "ISSUED")) return null;
  return row;
}

export async function GET(request: NextRequest, context: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await context.params;
  const id = publicId.trim().toUpperCase();
  if (!ULID_PATTERN.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (limited(request)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!appleConfigured()) {
    return NextResponse.redirect(new URL(`/t/${id}?wallet=apple-unavailable`, ticketOrigin()));
  }
  try {
    const row = await issuedTicket(id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await buildPkPass(row);
    try {
      await callTicketProc("ticket_touch", { action: "downloaded", public_id: id });
    } catch (error) {
      console.error("ticket download stamp failed", error);
    }
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `inline; filename="${id}.pkpass"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("pkpass failed", error);
    return NextResponse.json({ error: "Apple Wallet is not available" }, { status: 503 });
  }
}
