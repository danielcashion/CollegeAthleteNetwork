const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export function ulid(now = Date.now()): string {
  const time = new Uint8Array(6);
  let stamp = now;
  for (let index = 5; index >= 0; index -= 1) {
    time[index] = stamp % 256;
    stamp = Math.floor(stamp / 256);
  }
  const random = new Uint8Array(10);
  crypto.getRandomValues(random);
  const bytes = new Uint8Array(16);
  bytes.set(time, 0);
  bytes.set(random, 6);

  let result = "";
  let acc = 0;
  let bits = 2;
  for (const byte of bytes) {
    acc = acc * 256 + byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      const index = Math.floor(acc / 2 ** bits);
      acc -= index * 2 ** bits;
      result += CROCKFORD[index] || "0";
    }
  }
  return result.slice(0, 26);
}

export function ticketOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "";
  const origin = configured.trim() || "https://www.collegeathletenetwork.org";
  return origin.replace(/\/$/, "");
}

export function ticketUrl(publicId: string) {
  return `${ticketOrigin()}/t/${publicId}`;
}

export function parseTicketPublicId(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    const marker = parts.findIndex((part) => part.toLowerCase() === "t");
    const candidate = marker >= 0 ? parts[marker + 1] || "" : "";
    if (ULID_PATTERN.test(candidate.toUpperCase())) return candidate.toUpperCase();
  } catch {
    // Not a URL. Fall through to a raw id.
  }
  const segment = raw.split(/[/?#]/).filter(Boolean).pop() || "";
  return ULID_PATTERN.test(segment.toUpperCase()) ? segment.toUpperCase() : "";
}

export function isDeliverableEmail(email: string) {
  const value = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  return !/^guest\+.*@golf\.collegeathletenetwork\.org$/i.test(value);
}

export function paidStatusLabel(status?: string | null) {
  const value = String(status || "").toUpperCase();
  if (value === "COMP" || value === "SPONSOR_INCLUDED") return "Complimentary";
  if (value === "PAID") return "Paid";
  return "Pay at door";
}

export function assignmentLabel(kind?: string | null, value?: string | null) {
  const clean = String(value || "").trim();
  const table = String(kind || "").toUpperCase() === "TABLE";
  if (!clean) return table ? "Table to be assigned" : "Hole to be assigned";
  return table ? `Table ${clean}` : `Hole ${clean}`;
}
