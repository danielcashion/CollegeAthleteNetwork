/**
 * Client-only visitor signal collection using open-source FingerprintJS.
 * Import only from Client Components or code that never runs on the server.
 */

import {
  createFingerprintJsGetter,
  DEFAULT_FINGERPRINT_PROVIDER,
} from "./fingerprintProvider";
import type { FingerprintProviderId, UtmParams, VisitorEventClientPayload } from "../types";

function parseUtmFromUrl(url: string): UtmParams {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {};
  }
  const sp = parsed.searchParams;
  const pick = (k: string): string | undefined => {
    const v = sp.get(k);
    if (v == null || v === "") return undefined;
    return v.slice(0, 150);
  };
  return {
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    utm_term: pick("utm_term"),
    utm_content: pick("utm_content"),
  };
}

function readDeviceMemoryGb(): number | null {
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (typeof nav.deviceMemory === "number" && Number.isFinite(nav.deviceMemory)) {
    return nav.deviceMemory;
  }
  return null;
}

function readHardwareConcurrency(): number | null {
  if (typeof navigator.hardwareConcurrency === "number") {
    return navigator.hardwareConcurrency;
  }
  return null;
}

export interface CollectVisitorPayloadOptions {
  /** Override provider id when using Pro in the future. */
  fingerprintProvider?: FingerprintProviderId;
  /** From sessionStorage; stable for the browser session. */
  sessionId: string;
  /** Unique per logical page view (generated per navigation). */
  pageviewId: string;
}

/**
 * Loads FingerprintJS, collects browser signals, and returns a normalized payload
 * ready for POST /api/visitor-events.
 */
export async function collectVisitorPayload(
  options: CollectVisitorPayloadOptions,
): Promise<VisitorEventClientPayload> {
  if (typeof window === "undefined") {
    throw new Error("collectVisitorPayload must run in the browser");
  }

  const getVisitorId = await createFingerprintJsGetter();
  const visitorId = await getVisitorId();

  const pageUrl = window.location.href;
  const referrerUrl = document.referrer ? document.referrer : null;

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";

  const languages = Array.isArray(navigator.languages)
    ? [...navigator.languages].map((l) => String(l).slice(0, 35))
    : navigator.language
      ? [String(navigator.language).slice(0, 35)]
      : [];

  const fpProvider = options.fingerprintProvider ?? DEFAULT_FINGERPRINT_PROVIDER;

  return {
    fingerprintProvider: fpProvider,
    visitorId,
    requestTimestamp: new Date().toISOString(),
    browserTimezone: tz.slice(0, 100),
    browserLocale: String(navigator.language || "").slice(0, 35),
    languages,
    screenWidth: Math.max(0, Math.min(65535, window.screen.width)),
    screenHeight: Math.max(0, Math.min(65535, window.screen.height)),
    devicePixelRatio: Number.isFinite(window.devicePixelRatio)
      ? Math.round(window.devicePixelRatio * 100) / 100
      : 1,
    hardwareConcurrency: readHardwareConcurrency(),
    deviceMemoryGb: readDeviceMemoryGb(),
    userAgent: String(navigator.userAgent || "").slice(0, 1024),
    pageUrl: pageUrl.slice(0, 2048),
    referrerUrl: referrerUrl ? referrerUrl.slice(0, 2048) : null,
    utm: parseUtmFromUrl(pageUrl),
    sessionId: options.sessionId,
    pageviewId: options.pageviewId,
    pageTitle: typeof document.title === "string" ? document.title.slice(0, 512) : null,
  };
}
