/**
 * Visitor intelligence types shared by client, API route, and DB layer.
 * When migrating to Fingerprint Pro, extend {@link FingerprintProviderId} and
 * add optional `requestId` / `linkedId` fields to {@link VisitorEventClientPayload}.
 */

/** Open-source FingerprintJS vs commercial Pro / Agent (future). */
export type FingerprintProviderId = "fingerprintjs" | "fingerprint_pro";

export type TrafficClass =
  | "high_confidence_human"
  | "medium_confidence_human"
  | "low_confidence_location"
  | "likely_infrastructure"
  | "likely_bot";

export type FinalLocationSource =
  | "browser_geo"
  | "explicit_user"
  | "ip_geolocation"
  | "inferred_market"
  | "unattributable";

/** Normalized UTM fields (empty strings stripped to undefined). */
export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/**
 * Payload built in the browser (fingerprint + signals + session/pageview ids).
 * Sent to POST /api/visitor-events.
 */
export interface VisitorEventClientPayload {
  /** Which library produced visitorId (default fingerprintjs). */
  fingerprintProvider: FingerprintProviderId;
  visitorId: string;
  /** ISO 8601 timestamp when the client assembled the payload. */
  requestTimestamp: string;
  browserTimezone: string;
  browserLocale: string;
  languages: string[];
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  hardwareConcurrency: number | null;
  /** `navigator.deviceMemory` in GB when exposed; otherwise null. */
  deviceMemoryGb: number | null;
  userAgent: string;
  pageUrl: string;
  referrerUrl: string | null;
  utm: UtmParams;
  /** Stable for the browser tab session (sessionStorage). */
  sessionId: string;
  /** Unique per logical page view (survives Strict Mode via storage). */
  pageviewId: string;
  /** document.title when available. */
  pageTitle: string | null;
}

/**
 * Full event after API route adds server fields (IP, received time, headers snapshot).
 */
export interface VisitorEventIngestPayload extends VisitorEventClientPayload {
  /** ISO 8601 when the API route received the request. */
  serverReceivedAt: string;
  /** Best-effort client IP (IPv4 or IPv6 string). */
  clientIp: string;
  /** Raw forwarded chain when present (for audit). */
  forwardedForChain: string | null;
  /** Optional: set by the API route when the server enriches the payload. */
  ingestionPath?: "next_api";
}

/** ipapi.com (or compatible) normalized enrichment row. */
export interface IpapiEnrichment {
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  org: string | null;
  asn: string | null;
  raw: Record<string, unknown>;
}

/** Inputs to the rules-based scoring engine (after DB lookups). */
export interface ScoringContext {
  browserTimezone: string | null;
  browserLocale: string | null;
  userAgent: string | null;
  ipapiCity: string | null;
  ipapiRegion: string | null;
  ipapiCountry: string | null;
  ipapiOrg: string | null;
  ipapiAsn: string | null;
  ipapiLatitude: number | null;
  ipapiLongitude: number | null;
  /** Distinct calendar days this visitor has pageviews (including today). */
  distinctVisitDays: number;
  /** Pageviews in the current session so far (including this one). */
  sessionPageviewCount: number;
  isDataCenterCity: boolean;
  isHostingProvider: boolean;
}

export interface AttributionResult {
  trafficClass: TrafficClass;
  locationConfidenceScore: number;
  finalCity: string | null;
  finalRegion: string | null;
  finalCountry: string | null;
  finalLatitude: number | null;
  finalLongitude: number | null;
  finalLocationSource: FinalLocationSource;
  schoolMarketCode: string | null;
  schoolMarketConfidenceScore: number | null;
  reasonCodes: string[];
}
