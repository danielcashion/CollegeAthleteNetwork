export function outingCalendarDate(value?: string | Date | null): string | null {
  if (value == null || value === "") return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function formatOutingDate(value?: string | null, _timezone?: string | null): string {
  const ymd = outingCalendarDate(value);
  if (!ymd) return value ? String(value).slice(0, 10) : "";
  const [year, month, day] = ymd.split("-").map(Number);
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(Date.UTC(year, month - 1, day)));
  } catch {
    return ymd;
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

export function sortSponsorshipPackages<T extends { sponsorship_name?: string | null; sort_order?: number | null }>(
  packages: T[]
): T[] {
  const rank = (name?: string | null) => {
    const key = (name || "").trim().toLowerCase();
    if (key === "gold") return 0;
    if (key === "silver") return 1;
    if (key === "bronze") return 2;
    return 50;
  };
  return [...packages].sort((a, b) => {
    const byTier = rank(a.sponsorship_name) - rank(b.sponsorship_name);
    if (byTier !== 0) return byTier;
    return (a.sort_order ?? 100) - (b.sort_order ?? 100);
  });
}

export function attendeesPerTicket(typeName?: string | null): number {
  return /four/i.test(typeName || "") ? 4 : 1;
}

export function defaultFoursomeTeamName(
  firstName?: string | null,
  lastName?: string | null,
  index = 0,
  total = 1
) {
  const person = [firstName, lastName].map((part) => String(part || "").trim()).filter(Boolean).join(" ");
  const base = person ? `The ${person} Foursome` : "The Foursome";
  return total > 1 ? `${base} #${index + 1}` : base;
}

export function isValidEmail(email?: string | null): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test((email || "").trim());
}

export function nextAuctionBidCents(item: {
  high_bid_cents?: number | null;
  starting_bid_cents?: number | null;
  min_increment_cents?: number | null;
}) {
  const high = Number(item.high_bid_cents || 0);
  const start = Number(item.starting_bid_cents || 0);
  const increment = Number(item.min_increment_cents || 2500);
  return high > 0 ? high + increment : start;
}

export function obfuscateBidderName(name?: string | null) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "";
  if (trimmed.includes("*") || /^[^\s]+\s[A-Za-z]\.$/.test(trimmed)) return trimmed;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return `${parts[0].slice(0, 1)}${"*".repeat(Math.max(parts[0].length - 1, 1))}`;
  }
  return `${parts[0]} ${String(parts[parts.length - 1]).slice(0, 1).toUpperCase()}.`;
}

export function digitsOnly(value?: string | null) {
  return String(value || "").replace(/\D/g, "");
}

export function normalizeUsPhone(value?: string | null) {
  const digits = digitsOnly(value);
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits.slice(0, 10);
}

export function isValidUsPhone(value?: string | null) {
  return normalizeUsPhone(value).length === 10;
}

export function formatUsPhone(value?: string | null) {
  const digits = normalizeUsPhone(value);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
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
