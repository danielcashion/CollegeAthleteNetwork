/**
 * ipapi.com enrichment abstraction. Reuse the same response shape as existing CAN usage
 * (`src/app/api/logUserIP/route.ts`). Swap base URL / auth if you move providers.
 */

import type { IpapiEnrichment } from "../types";

function toStr(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function toNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Looks up geo/org for an IPv4/IPv6 address using ipapi.com.
 * Returns empty enrichment when IP is unknown or the key is missing (caller may still persist).
 */
export async function fetchIpapiEnrichment(
  ip: string,
  accessKey: string | undefined,
): Promise<IpapiEnrichment> {
  const empty: IpapiEnrichment = {
    city: null,
    region: null,
    country: null,
    latitude: null,
    longitude: null,
    org: null,
    asn: null,
    raw: {},
  };

  if (!accessKey || ip === "unknown" || !ip) {
    return empty;
  }

  try {
    const geoRes = await fetch(
      `https://api.ipapi.com/api/${encodeURIComponent(ip)}?access_key=${encodeURIComponent(accessKey)}`,
      {
        headers: { "User-Agent": "CollegeAthleteNetwork/1.0" },
        next: { revalidate: 0 },
      },
    );
    const geo = (await geoRes.json()) as Record<string, unknown>;
    if (!geo || (geo as { error?: unknown }).error) {
      return { ...empty, raw: geo };
    }

    const connection = geo.connection as Record<string, unknown> | undefined;
    const asn =
      toStr(connection?.asn) ??
      toStr(geo.asn) ??
      toStr((geo as { connection?: { asn?: string } }).connection?.asn);

    return {
      city: toStr(geo.city),
      region: toStr(geo.region_code ?? geo.region),
      country: toStr(geo.country_code ?? geo.country_name),
      latitude: toNum(geo.latitude),
      longitude: toNum(geo.longitude),
      org: toStr(connection?.org ?? geo.org),
      asn,
      raw: geo,
    };
  } catch {
    return empty;
  }
}
