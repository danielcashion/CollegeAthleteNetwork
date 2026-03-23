/**
 * Abstraction over fingerprint providers so migrating to Fingerprint Pro or
 * `@fingerprint/agent` is a small change: swap {@link getVisitorId} implementation
 * and set `fingerprintProvider: "fingerprint_pro"` on the payload.
 *
 * Open source: `@fingerprintjs/fingerprintjs` → `getVisitorId()`.
 * Pro (future): `@fingerprintjs/fingerprintjs-pro` or `@fingerprint/agent` →
 *   use `fp.get()` which returns `visitorId` + optional `requestId`.
 */

import type { FingerprintProviderId } from "../types";

export type GetVisitorIdFn = () => Promise<string>;

let fingerprintGetterPromise: Promise<GetVisitorIdFn> | null = null;

/**
 * Lazily loads `@fingerprintjs/fingerprintjs` and returns a function that resolves
 * the stable visitor id. Safe to call multiple times; the agent loads once per tab.
 */
export async function createFingerprintJsGetter(): Promise<GetVisitorIdFn> {
  if (typeof window === "undefined") {
    throw new Error("createFingerprintJsGetter is client-only");
  }
  if (!fingerprintGetterPromise) {
    fingerprintGetterPromise = (async () => {
      const FP = await import("@fingerprintjs/fingerprintjs");
      const fp = await FP.load();
      return async () => {
        const result = await fp.get();
        return result.visitorId;
      };
    })();
  }
  return fingerprintGetterPromise;
}

/** Default provider id for OSS builds. */
export const DEFAULT_FINGERPRINT_PROVIDER: FingerprintProviderId = "fingerprintjs";

/**
 * Future: implement using Fingerprint Pro / Agent and return visitorId (+ store requestId if needed).
 * export async function createFingerprintProGetter(apiKey: string): Promise<GetVisitorIdFn> { ... }
 */
