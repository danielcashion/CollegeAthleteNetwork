import "server-only";

const PROFILE_URL =
  /^(?:https?:\/\/)?(?:[\w-]+\.)?linkedin\.com\/in\/([A-Za-z0-9\-_%]{2,100})\/?(?:\?[^#]*)?(?:#.*)?$/i;

/**
 * Accept only a personal LinkedIn profile URL and normalize it.
 * Allows a missing scheme, www or another subdomain, a trailing slash, and a query string.
 * Rejects company, school, pub, and post URLs.
 */
export function normalizeLinkedInUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 300) return null;
  if (/[\s<>]/.test(trimmed)) return null;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return null;
  }

  if (parsed.username || parsed.password) return null;
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") return null;
  if (!/(^|\.)linkedin\.com$/i.test(parsed.hostname)) return null;

  const match = `${parsed.hostname}${parsed.pathname}`.match(PROFILE_URL);
  const slug = match?.[1];
  if (!slug) return null;

  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    return null;
  }
  if (!/^[A-Za-z0-9\-_%]{2,100}$/.test(decoded)) return null;

  return `https://www.linkedin.com/in/${decoded}`;
}

/** Slug stored on university_athletes.bus_url_1. The column is varchar(60). */
export function linkedInSlug(raw: string): string | null {
  const url = normalizeLinkedInUrl(raw);
  if (!url) return null;
  const slug = url.slice("https://www.linkedin.com/in/".length);
  if (!slug || slug.length > 60) return null;
  return slug;
}
