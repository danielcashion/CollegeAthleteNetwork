import "server-only";
import { createHash } from "crypto";

/**
 * In-process limiter, same idea as the golf public routes.
 * TODO: move to a shared store before Renidly is live if this runs on more than one instance.
 */
const buckets = new Map<string, number[]>();

function tokenKey(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function rateLimitClaimEmail(token: string, limit = 20, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const key = `email:${tokenKey(token)}`;
  const hits = (buckets.get(key) || []).filter((stamp) => now - stamp < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

export function rateLimitClaimLookup(token: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const key = `linkedin:${tokenKey(token)}`;
  const hits = (buckets.get(key) || []).filter((stamp) => now - stamp < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}
