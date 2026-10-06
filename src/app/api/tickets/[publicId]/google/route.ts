import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/app/api/golf/_public";
import { callTicketProc } from "@/lib/tickets/gateway";
import { googleConfigured } from "@/lib/tickets/fields";
import { upsertGoogleObject } from "@/lib/tickets/google";
import { ticketOrigin, ULID_PATTERN } from "@/lib/tickets/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await context.params;
  const id = publicId.trim().toUpperCase();
  const back = new URL(`/t/${id}?wallet=google-unavailable`, ticketOrigin());
  if (!ULID_PATTERN.test(id)) return NextResponse.redirect(back);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`ticket:${ip}`, 30, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!googleConfigured()) return NextResponse.redirect(back);
  try {
    const rows = await callTicketProc("ticket_lookup", { public_id: id }, { secret: false });
    const row = rows.find((item) => String(item.public_id || "").toUpperCase() === id);
    if (!row?.public_id || (row.status && row.status !== "ISSUED")) return NextResponse.redirect(back);
    const saved = await upsertGoogleObject(row);
    if (!row.google_object_id || row.google_class_id !== saved.classId) {
      await callTicketProc("ticket_touch", {
        action: "google_bind",
        public_id: id,
        google_class_id: saved.classId,
        google_object_id: saved.objectId,
      });
    }
    return NextResponse.redirect(saved.saveUrl);
  } catch (error) {
    console.error("google wallet save failed", error);
    return NextResponse.redirect(back);
  }
}
