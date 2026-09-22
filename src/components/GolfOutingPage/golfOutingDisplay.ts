export function formatOutingDate(utcDateTime?: string | null, timezone?: string | null): string {
  if (!utcDateTime) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "America/New_York",
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(utcDateTime));
  } catch {
    return String(utcDateTime).slice(0, 10);
  }
}

export function formatOutingDateTime(utcDateTime?: string | null, timezone?: string | null): string {
  if (!utcDateTime) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "America/New_York",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(utcDateTime));
  } catch {
    return String(utcDateTime);
  }
}

export function outingStatusLabel(status?: string | null): string {
  switch (status) {
    case "PUBLISHED":
      return "Registration open";
    case "SOLD_OUT":
      return "Sold out";
    case "REGISTRATION_CLOSED":
      return "Registration closed";
    case "COMPLETED":
      return "Completed";
    default:
      return status || "";
  }
}

export function formatCents(cents?: number | null): string {
  return `$${((cents || 0) / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function packageAccent(name?: string | null): string {
  const key = (name || "").toLowerCase();
  if (key.includes("gold")) return "#C9A227";
  if (key.includes("silver")) return "#8A94A6";
  if (key.includes("bronze")) return "#B87333";
  return "#1C315F";
}

export const MEMBERS_SITE = "https://members.collegeathletenetwork.org";

export function attendeesPerTicket(typeName?: string | null): number {
  return /four/i.test(typeName || "") ? 4 : 1;
}

export function isValidEmail(email?: string | null): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test((email || "").trim());
}

export function membersGolfCheckoutUrl(
  slug: string,
  path: "sponsor" | "register",
  query?: Record<string, string | number | undefined>
): string {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const dest = `/golf/${slug}/${path}${params.toString() ? `?${params}` : ""}`;
  return `${MEMBERS_SITE}/login?returnUrl=${encodeURIComponent(dest)}`;
}

export function auctionPhotoUrls(raw?: string[] | string | null): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : raw ? [raw] : [];
  } catch {
    return raw ? [raw] : [];
  }
}

export function venueLine(outing: {
  venue_name?: string | null;
  venue_city?: string | null;
  venue_state?: string | null;
}): string {
  return [outing.venue_name, [outing.venue_city, outing.venue_state].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(" · ");
}
