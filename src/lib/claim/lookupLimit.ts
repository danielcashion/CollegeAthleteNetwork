import { refreshMonth } from "./refreshLimit";

const LOOKUP_LIMIT = 3;

function storageKey(token: string): string {
  return `can.claim.lookup.${token}`;
}

function readUrls(token: string): { month: string; urls: string[] } {
  const month = refreshMonth();
  if (typeof window === "undefined") return { month, urls: [] };
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return { month, urls: [] };
    const parsed = JSON.parse(raw) as { month?: unknown; urls?: unknown };
    const storedMonth = typeof parsed.month === "string" ? parsed.month : "";
    if (storedMonth !== month || !Array.isArray(parsed.urls)) return { month, urls: [] };
    const urls = parsed.urls.filter((item): item is string => typeof item === "string" && item.length > 0);
    return { month, urls };
  } catch {
    return { month, urls: [] };
  }
}

/** True when this profile was already counted, or this claim link still has a lookup left this month. */
export function canLookupLinkedInProfile(token: string, profileKey: string): boolean {
  const stored = readUrls(token);
  if (stored.urls.includes(profileKey)) return true;
  return stored.urls.length < LOOKUP_LIMIT;
}

/** Remember one successful lookup of a new profile. Repeats and a new month do not add another. */
export function recordLinkedInLookup(token: string, profileKey: string): void {
  if (typeof window === "undefined") return;
  const stored = readUrls(token);
  if (stored.urls.includes(profileKey)) return;
  try {
    window.localStorage.setItem(
      storageKey(token),
      JSON.stringify({ month: stored.month, urls: [...stored.urls, profileKey] }),
    );
  } catch {
    // The profile was already retrieved. A full browser store should not hide that result.
  }
}
