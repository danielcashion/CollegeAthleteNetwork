import type { TicketRow } from "./gateway";
import { assignmentLabel, paidStatusLabel } from "./token";

const IVORY = { r: 246, g: 241, b: 231 };
const NAVY = "#1C315F";

export type PassFields = {
  holderName: string;
  eventName: string;
  universityName: string;
  assignment: string;
  seatValue: string;
  dateLabel: string;
  assignmentKind: "HOLE" | "TABLE";
  whenLabel: string;
  relevantDate: string | null;
  venue: string;
  paidLabel: string;
  confirmationCode: string;
  support: string;
  background: string;
  foreground: string;
  label: string;
  logoUrl: string | null;
};

function hexByte(value: string) {
  const parsed = Number.parseInt(value, 16);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeHex(value?: string | null) {
  const raw = String(value || "").trim();
  const match = raw.match(/^#?([0-9a-fA-F]{6})$/);
  return match ? `#${match[1].toUpperCase()}` : "";
}

function luminance(hex: string) {
  const channels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((part) => {
    const channel = hexByte(part) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(hex: string, against: { r: number; g: number; b: number }) {
  const background = luminance(`#${against.r.toString(16).padStart(2, "0")}${against.g.toString(16).padStart(2, "0")}${against.b.toString(16).padStart(2, "0")}`);
  const foreground = luminance(hex);
  const lighter = Math.max(background, foreground);
  const darker = Math.min(background, foreground);
  return (lighter + 0.05) / (darker + 0.05);
}

export function passColors(primary?: string | null) {
  const candidate = normalizeHex(primary);
  const foreground = candidate && contrast(candidate, IVORY) >= 4.5 ? candidate : NAVY;
  return { background: "#F6F1E7", foreground, label: foreground };
}

function venueLine(row: TicketRow) {
  return [row.venue_name, row.venue_city, row.venue_state].map((part) => String(part || "").trim()).filter(Boolean).join(", ");
}

function calendarDay(row: TicketRow) {
  const raw = String(row.event_date || row.event_startdate || "").trim();
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function formatCalendarDay(day: string, options: Intl.DateTimeFormatOptions) {
  const [year, month, date] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, date, 12))
  );
}

export function relevantDate(row: TicketRow) {
  const day = calendarDay(row);
  return day ? `${day}T13:00:00Z` : null;
}

export function whenLabel(row: TicketRow) {
  const day = calendarDay(row);
  if (!day) return "Date to be announced";
  return formatCalendarDay(day, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export function dateLabel(row: TicketRow) {
  const day = calendarDay(row);
  if (!day) return "Date TBA";
  return formatCalendarDay(day, { month: "short", day: "numeric", year: "numeric" });
}

export function passFields(row: TicketRow): PassFields {
  const kind = String(row.live_assignment_kind || row.assignment_kind || "HOLE").toUpperCase() === "TABLE" ? "TABLE" : "HOLE";
  const value = row.live_assignment_value ?? row.assignment_value;
  const colors = passColors(row.primary_hex);
  const holder = `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Guest";
  const seat = String(value || "").trim();
  return {
    holderName: holder,
    eventName: row.event_name || "Event",
    universityName: row.university_name || "The College Athlete Network",
    assignment: assignmentLabel(kind, value),
    seatValue: seat || "To be assigned",
    dateLabel: dateLabel(row),
    assignmentKind: kind,
    whenLabel: whenLabel(row),
    relevantDate: relevantDate(row),
    venue: venueLine(row) || "Venue to be announced",
    paidLabel: paidStatusLabel(row.paid_status),
    confirmationCode: row.confirmation_code || "",
    support: row.contact_email || "admin@collegeathletenetwork.org",
    background: colors.background,
    foreground: colors.foreground,
    label: colors.label,
    logoUrl: row.university_logo_url || row.logo_url || null,
  };
}

export function appleConfigured() {
  return Boolean(
    process.env.APPLE_PASS_TYPE_ID &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_PASS_CERT_PEM &&
      process.env.APPLE_PASS_KEY_PEM &&
      process.env.APPLE_WWDR_PEM
  );
}

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_WALLET_ISSUER_ID && process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON);
}

export function walletGapMessage() {
  const missing = [appleConfigured() ? "" : "Apple Wallet", googleConfigured() ? "" : "Google Wallet"].filter(Boolean);
  if (!missing.length) return "";
  return `${missing.join(" and ")} signing is not configured`;
}
