import { NextRequest, NextResponse } from "next/server";
import type { VisitorEventIngestPayload } from "@/lib/visitor-intelligence/types";
import { getClientIpFromRequest } from "@/lib/visitor-intelligence/server/getClientIp";
import { parseAndSanitizeVisitorPayload } from "@/lib/visitor-intelligence/server/validatePayload";
import { ingestVisitorPageview } from "@/lib/visitor-intelligence/server/ingestPageview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isDatabaseConfigured(): boolean {
  return !!(process.env.DATABASE_URL || process.env.MYSQL_HOST);
}

/**
 * Accepts browser visitor intelligence payloads, attaches server IP and timestamp,
 * and writes to Aurora via `ingestVisitorPageview`.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseAndSanitizeVisitorPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { clientIp, forwardedForChain } = getClientIpFromRequest(request);
  const serverReceivedAt = new Date().toISOString();

  const ingestPayload: VisitorEventIngestPayload = {
    ...parsed.data,
    serverReceivedAt,
    clientIp,
    forwardedForChain,
    ingestionPath: "next_api",
  };

  if (!isDatabaseConfigured()) {
    console.error("visitor-events: set DATABASE_URL or MYSQL_HOST / MYSQL_* for MySQL");
    return NextResponse.json({ error: "Visitor ingestion is not configured" }, { status: 503 });
  }

  try {
    await ingestVisitorPageview(ingestPayload);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const e = err as NodeJS.ErrnoException & { errno?: number; sqlMessage?: string; sqlState?: string };
    console.error("visitor-events: ingest failed", {
      name: e?.name,
      message: e?.message,
      code: e?.code,
      errno: e?.errno,
      sqlState: e?.sqlState,
      sqlMessage: e?.sqlMessage,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
