import { NextRequest } from "next/server";
import { getPayPalConfig } from "@/libs/paypal";
import {
  callPublicGolfProc,
  getPublicGolfOrder,
  getPublicGolfOutingBySlug,
} from "@/services/getGolfOutingPublic";

const rateBucket = new Map<string, number[]>();

export function rateLimit(key: string, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const hits = (rateBucket.get(key) || []).filter((ts) => now - ts < windowMs);
  if (hits.length >= limit) return false;
  hits.push(now);
  rateBucket.set(key, hits);
  return true;
}

export function clientKey(request: NextRequest, email?: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return `${ip}:${(email || "").toLowerCase()}`;
}

export async function getAccessToken() {
  const config = getPayPalConfig();
  const auth = Buffer.from(`${config["client-id"]}:${config.secret}`).toString("base64");
  const response = await fetch(`${config.url}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error("PayPal authentication failed");
  return (await response.json()).access_token as string;
}

export async function assertPublishedOuting(event_id: string) {
  const PUBLIC_API = `${process.env.NEXT_PUBLIC_API_URL}/publicprod`;
  const res = await fetch(`${PUBLIC_API}/v_golf_outings_public?event_id=${encodeURIComponent(event_id)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  const rows = Array.isArray(data) ? data : data?.resource || (data ? [data] : []);
  return rows.find((row: { event_id: string }) => row.event_id === event_id) || null;
}

export { callPublicGolfProc, getPublicGolfOrder, getPublicGolfOutingBySlug };
