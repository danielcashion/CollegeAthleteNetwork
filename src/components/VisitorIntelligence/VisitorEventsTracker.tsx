"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { collectVisitorPayload } from "@/lib/visitor-intelligence/client/collectFingerprint";

const SESSION_KEY = "can_vi_sid";
const PATH_KEY = "can_vi_pv_path";
const PV_KEY = "can_vi_pvid";

function getOrCreateSessionId(): string {
  let s = sessionStorage.getItem(SESSION_KEY);
  if (!s) {
    s = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

/**
 * One logical pageview id per pathname navigation; stable across React Strict Mode remounts.
 */
function getPageviewIdForPath(pathname: string): string {
  const storedPath = sessionStorage.getItem(PATH_KEY);
  let pv = sessionStorage.getItem(PV_KEY);
  if (storedPath !== pathname) {
    pv = crypto.randomUUID();
    sessionStorage.setItem(PATH_KEY, pathname);
    sessionStorage.setItem(PV_KEY, pv);
  }
  if (!pv) {
    pv = crypto.randomUUID();
    sessionStorage.setItem(PATH_KEY, pathname);
    sessionStorage.setItem(PV_KEY, pv);
  }
  return pv;
}

/**
 * Fires once per page view: collects FingerprintJS + browser signals and POSTs to `/api/visitor-events`.
 * Uses sessionStorage to dedupe Strict Mode double effects and to keep session_id stable.
 */
export default function VisitorEventsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pageviewId = getPageviewIdForPath(pathname);
    const sentKey = `can_vi_sent_${pageviewId}`;
    if (sessionStorage.getItem(sentKey)) {
      return;
    }
    sessionStorage.setItem(sentKey, "1");

    const sessionId = getOrCreateSessionId();

    let cancelled = false;
    (async () => {
      try {
        const payload = await collectVisitorPayload({ sessionId, pageviewId });
        if (cancelled) return;
        const res = await fetch("/api/visitor-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });
        if (!res.ok && process.env.NODE_ENV === "development") {
          const text = await res.text().catch(() => "");
          console.warn("[visitor-events]", res.status, text);
        }
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.error("[visitor-events] failed", e);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
