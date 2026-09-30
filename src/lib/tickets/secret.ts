import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

export function ticketSecretOk(request: NextRequest) {
  const expected = process.env.TICKET_PROC_SECRET || "";
  const provided = request.headers.get("x-ticket-secret") || "";
  if (!expected || expected.length !== provided.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}
