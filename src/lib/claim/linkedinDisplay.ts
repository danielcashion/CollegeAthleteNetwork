/** Renidly / LinkedIn member entity ids, e.g. ACoAAAAcDtEBmaPHwHOMex6kGQzKdyT6tJmaJGs. */
const ENTITY_ID = /^ACo[A-Za-z0-9_-]{16,}$/i;

function slugOf(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")
    .replace(/\/+$/, "")
    .split(/[?#]/)[0];
}

/** The public LinkedIn handle, or null when the value is missing or an unreadable entity id. */
export function linkedInHandleFrom(value: string | null | undefined): string | null {
  const slug = slugOf(value ?? "");
  if (!slug || ENTITY_ID.test(slug)) return null;
  if (!/^[A-Za-z0-9\-_%]{2,100}$/.test(slug)) return null;
  return slug;
}

/** Profile URL that is safe to show or open. Entity ids are omitted. */
export function publicLinkedInUrl(value: string | null | undefined): string | null {
  const handle = linkedInHandleFrom(value);
  return handle ? `https://www.linkedin.com/in/${handle}` : null;
}

/** Display label such as linkedin.com/in/your-name. */
export function publicLinkedInLabel(value: string | null | undefined): string | null {
  const url = publicLinkedInUrl(value);
  return url ? url.replace(/^https?:\/\/(www\.)?/, "") : null;
}

const PROFILE_PREFIXES = ["https://www.linkedin.com/in/", "www.linkedin.com/in/"];

/** True when the pasted text is a personal LinkedIn profile address we can look up. */
export function isLinkedInProfileInput(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return PROFILE_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

/** Stable key for counting distinct profile lookups. Query strings are ignored. */
export function linkedInProfileKey(value: string): string | null {
  if (!isLinkedInProfileInput(value)) return null;
  const trimmed = value.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    const slug = decodeURIComponent(url.pathname.replace(/^\/in\//i, "").split("/")[0] || "");
    if (!slug) return null;
    return `https://www.linkedin.com/in/${slug.toLowerCase()}`;
  } catch {
    return null;
  }
}
