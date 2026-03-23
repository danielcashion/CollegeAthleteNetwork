/**
 * Classifies hosting / data-center style traffic using org/ASN strings and optional DB patterns.
 */

import type { RowDataPacket } from "mysql2/promise";

const CLOUD_SUBSTRINGS = [
  "amazon",
  "aws",
  "microsoft",
  "azure",
  "google",
  "gcp",
  "cloudflare",
  "oracle",
  "akamai",
  "fastly",
  "digitalocean",
  "linode",
  "hetzner",
  "ovh",
];

export interface InfraPatternRow {
  pattern_type: "city_region" | "asn" | "org_substring" | "ip_cidr";
  pattern_value: string;
  region_code: string | null;
  country_code: string | null;
}

export function isHostingProviderOrg(org: string | null, asn: string | null): boolean {
  const hay = `${org || ""} ${asn || ""}`.toLowerCase();
  return CLOUD_SUBSTRINGS.some((s) => hay.includes(s));
}

export function isDataCenterCityFromPatterns(
  city: string | null,
  region: string | null,
  patterns: InfraPatternRow[],
): boolean {
  const c = (city || "").trim().toLowerCase();
  const r = (region || "").trim().toUpperCase();
  for (const p of patterns) {
    if (p.pattern_type !== "city_region") continue;
    const [pcity, preg] = p.pattern_value.split("|").map((s) => s.trim());
    if (!pcity) continue;
    if (c.includes(pcity.toLowerCase()) && (!preg || r === preg.toUpperCase())) {
      return true;
    }
  }
  return false;
}

export function loadInfraPatternsFromRows(rows: RowDataPacket[]): InfraPatternRow[] {
  return rows.map((row) => ({
    pattern_type: row.pattern_type as InfraPatternRow["pattern_type"],
    pattern_value: String(row.pattern_value),
    region_code: row.region_code ? String(row.region_code) : null,
    country_code: row.country_code ? String(row.country_code) : null,
  }));
}
