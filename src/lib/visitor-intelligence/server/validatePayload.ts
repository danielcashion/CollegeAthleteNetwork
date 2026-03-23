import { z } from "zod";
import type { UtmParams, VisitorEventClientPayload } from "../types";
import { sanitizeString, sanitizeStringArray } from "./sanitize";

const utmSchema = z
  .object({
    utm_source: z.string().max(150).optional(),
    utm_medium: z.string().max(150).optional(),
    utm_campaign: z.string().max(150).optional(),
    utm_term: z.string().max(150).optional(),
    utm_content: z.string().max(150).optional(),
  })
  .strict();

export const visitorEventClientSchema = z
  .object({
    fingerprintProvider: z.enum(["fingerprintjs", "fingerprint_pro"]),
    visitorId: z.string().min(8).max(64),
    requestTimestamp: z.string().max(40),
    browserTimezone: z.string().max(100),
    browserLocale: z.string().max(35),
    languages: z.array(z.string()).max(25),
    screenWidth: z.number().int().min(0).max(65535),
    screenHeight: z.number().int().min(0).max(65535),
    devicePixelRatio: z.number().min(0).max(64),
    hardwareConcurrency: z.number().int().min(0).max(256).nullable(),
    deviceMemoryGb: z.number().min(0).max(1024).nullable(),
    userAgent: z.string().max(1024),
    pageUrl: z.string().max(2048),
    referrerUrl: z.string().max(2048).nullable(),
    utm: utmSchema,
    sessionId: z.string().uuid(),
    pageviewId: z.string().uuid(),
    pageTitle: z.string().max(512).nullable(),
  })
  .strict();

function normalizeUtm(utm: z.infer<typeof utmSchema>): UtmParams {
  const out: UtmParams = {};
  const set = (k: keyof UtmParams, v: string | undefined) => {
    const s = sanitizeString(v, 150);
    if (s) out[k] = s;
  };
  set("utm_source", utm.utm_source);
  set("utm_medium", utm.utm_medium);
  set("utm_campaign", utm.utm_campaign);
  set("utm_term", utm.utm_term);
  set("utm_content", utm.utm_content);
  return out;
}

/**
 * Parses JSON body, validates with Zod, and applies server-side string hygiene.
 */
export function parseAndSanitizeVisitorPayload(
  body: unknown,
): { ok: true; data: VisitorEventClientPayload } | { ok: false; error: string } {
  const parsed = visitorEventClientSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.message };
  }
  const v = parsed.data;
  const data: VisitorEventClientPayload = {
    fingerprintProvider: v.fingerprintProvider,
    visitorId: sanitizeString(v.visitorId, 64) || "",
    requestTimestamp: sanitizeString(v.requestTimestamp, 40) || new Date().toISOString(),
    browserTimezone: sanitizeString(v.browserTimezone, 100) || "",
    browserLocale: sanitizeString(v.browserLocale, 35) || "",
    languages: sanitizeStringArray(v.languages, 25, 35),
    screenWidth: v.screenWidth,
    screenHeight: v.screenHeight,
    devicePixelRatio: v.devicePixelRatio,
    hardwareConcurrency: v.hardwareConcurrency,
    deviceMemoryGb: v.deviceMemoryGb,
    userAgent: sanitizeString(v.userAgent, 1024) || "",
    pageUrl: sanitizeString(v.pageUrl, 2048) || "",
    referrerUrl: sanitizeString(v.referrerUrl, 2048),
    utm: normalizeUtm(v.utm),
    sessionId: v.sessionId,
    pageviewId: v.pageviewId,
    pageTitle: sanitizeString(v.pageTitle, 512),
  };

  if (!data.visitorId) {
    return { ok: false, error: "visitorId required" };
  }

  return { ok: true, data };
}
