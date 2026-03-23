import type { NextRequest } from "next/server";

/**
 * Extracts the best-effort client IP from proxy headers (Cloudflare, nginx, standard forward chain).
 * Trims whitespace; returns first public-ish address from X-Forwarded-For when comma-separated.
 */
export function getClientIpFromRequest(request: NextRequest): {
  clientIp: string;
  forwardedForChain: string | null;
} {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  const forwardedForChain = forwarded?.trim() || null;

  if (cf) {
    return { clientIp: cf, forwardedForChain };
  }
  if (realIp) {
    return { clientIp: realIp, forwardedForChain };
  }
  if (forwardedForChain) {
    const first = forwardedForChain.split(",")[0]?.trim();
    if (first) {
      return { clientIp: first, forwardedForChain };
    }
  }

  // NextRequest may expose socket in Node — optional fallback
  const fromSocket = (request as NextRequest & { ip?: string }).ip;
  if (fromSocket) {
    return { clientIp: fromSocket, forwardedForChain };
  }

  return { clientIp: "unknown", forwardedForChain };
}
