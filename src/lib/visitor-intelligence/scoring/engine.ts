/**
 * Rules-based visitor attribution scoring. Kept pure (no I/O) for tests and reuse from ingest.
 */

import type {
  AttributionResult,
  FinalLocationSource,
  ScoringContext,
  TrafficClass,
} from "../types";

/** Known noisy data-center / edge cities (case-insensitive match on city + region). */
const INFRA_CITY_REGIONS: { city: string; region: string }[] = [
  { city: "quincy", region: "WA" },
  { city: "boydton", region: "VA" },
  { city: "san jose", region: "CA" },
];

const CLOUD_ORG_SUBSTRINGS = [
  "amazon",
  "aws",
  "microsoft",
  "azure",
  "google",
  "gcp",
  "cloudflare",
  "oracle cloud",
  "akamai",
  "fastly",
  "digitalocean",
  "linode",
  "akamai technologies",
  "hetzner",
  "ovh",
];

const BOT_UA_HINTS =
  /bot|crawl|spider|slurp|bingpreview|headless|phantom|puppeteer|playwright|selenium|lighthouse|preview/i;

function normalizeCity(c: string | null): string {
  return (c || "").trim().toLowerCase();
}

function normalizeRegion(r: string | null): string {
  return (r || "").trim().toUpperCase();
}

function isInfraCity(ipapiCity: string | null, ipapiRegion: string | null): boolean {
  const city = normalizeCity(ipapiCity);
  const region = normalizeRegion(ipapiRegion);
  for (const row of INFRA_CITY_REGIONS) {
    if (city.includes(row.city) && region === row.region) {
      return true;
    }
  }
  return false;
}

function orgOrAsnSuggestsCloud(org: string | null, asn: string | null): boolean {
  const hay = `${org || ""} ${asn || ""}`.toLowerCase();
  return CLOUD_ORG_SUBSTRINGS.some((s) => hay.includes(s));
}

function timezonePlausible(tz: string | null): boolean {
  if (!tz || tz.length < 2) return false;
  if (tz.length > 90) return false;
  // IANA zones typically contain "/" or are "UTC"
  return /^[A-Za-z0-9_+/\-]+$/.test(tz);
}

/**
 * Computes attribution from a base score starting at 50, applying additive/subtractive rules,
 * then maps to traffic_class, final_location_source, and reason codes.
 */
export function computeAttribution(ctx: ScoringContext): AttributionResult {
  const reasonCodes: string[] = [];
  let score = 50;

  const infraCity = isInfraCity(ctx.ipapiCity, ctx.ipapiRegion);
  if (infraCity) {
    score -= 25;
    if (normalizeCity(ctx.ipapiCity).includes("quincy")) reasonCodes.push("CITY_INFRA_QUINCY_WA");
    else if (normalizeCity(ctx.ipapiCity).includes("boydton")) reasonCodes.push("CITY_INFRA_BOYDTON_VA");
    else if (normalizeCity(ctx.ipapiCity).includes("san jose")) reasonCodes.push("CITY_INFRA_SAN_JOSE_CA");
    else reasonCodes.push("CITY_INFRA_KNOWN_LIST");
  }

  if (orgOrAsnSuggestsCloud(ctx.ipapiOrg, ctx.ipapiAsn)) {
    score -= 25;
    const o = (ctx.ipapiOrg || "").toLowerCase();
    if (o.includes("microsoft") || o.includes("azure")) reasonCodes.push("ORG_MICROSOFT");
    else if (o.includes("amazon") || o.includes("aws")) reasonCodes.push("ORG_AWS");
    else if (o.includes("google")) reasonCodes.push("ORG_GOOGLE");
    else if (o.includes("cloudflare")) reasonCodes.push("ORG_CLOUDFLARE");
    else reasonCodes.push("ORG_CLOUD_OR_CDN");
  }

  const ua = ctx.userAgent || "";
  if (BOT_UA_HINTS.test(ua)) {
    score -= 15;
    reasonCodes.push("UA_BOT_OR_HEADLESS");
  }

  if (timezonePlausible(ctx.browserTimezone)) {
    score += 10;
    const tzTag = (ctx.browserTimezone || "")
      .replace(/[/\\]/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 40);
    reasonCodes.push(`TZ_${tzTag}`);
  }

  if (ctx.distinctVisitDays >= 2) {
    score += 10;
    reasonCodes.push("REPEAT_VISITOR");
  }

  if (ctx.sessionPageviewCount >= 2) {
    score += 10;
    reasonCodes.push("MULTI_PAGE_SESSION");
  }

  score = Math.max(0, Math.min(100, score));

  let trafficClass: TrafficClass;
  if (reasonCodes.includes("UA_BOT_OR_HEADLESS") && score < 35) {
    trafficClass = "likely_bot";
  } else if (ctx.isHostingProvider && score < 30) {
    trafficClass = "likely_infrastructure";
  } else if (infraCity && score < 35) {
    trafficClass = "likely_infrastructure";
  } else if (score >= 75) {
    trafficClass = "high_confidence_human";
  } else if (score >= 50) {
    trafficClass = "medium_confidence_human";
  } else if (score >= 30) {
    trafficClass = "low_confidence_location";
  } else if (score < 25 || (ctx.isHostingProvider && orgOrAsnSuggestsCloud(ctx.ipapiOrg, ctx.ipapiAsn))) {
    trafficClass = "likely_infrastructure";
  } else {
    trafficClass = "low_confidence_location";
  }

  let finalLocationSource: FinalLocationSource = "unattributable";
  if (trafficClass === "likely_bot" || trafficClass === "likely_infrastructure") {
    finalLocationSource = "unattributable";
  } else if (ctx.ipapiCity && ctx.ipapiCountry) {
    finalLocationSource = "ip_geolocation";
  } else if (timezonePlausible(ctx.browserTimezone)) {
    finalLocationSource = "inferred_market";
  }

  const finalCity = ctx.ipapiCity;
  const finalRegion = ctx.ipapiRegion;
  const finalCountry = ctx.ipapiCountry;
  let finalLatitude: number | null = ctx.ipapiLatitude;
  let finalLongitude: number | null = ctx.ipapiLongitude;
  if (trafficClass === "likely_infrastructure" || trafficClass === "likely_bot") {
    finalLatitude = null;
    finalLongitude = null;
  }

  const attribution: AttributionResult = {
    trafficClass,
    locationConfidenceScore: score,
    finalCity,
    finalRegion,
    finalCountry,
    finalLatitude,
    finalLongitude,
    finalLocationSource,
    schoolMarketCode: null,
    schoolMarketConfidenceScore: null,
    reasonCodes,
  };

  return attribution;
}
