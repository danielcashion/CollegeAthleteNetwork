export function isoDate(value: unknown): string | null {
  if (value == null || value === "") return null;
  const raw = String(value).trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00Z`) : new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function parts(value: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})/.exec(value);
  return match ? { year: Number(match[1]), month: Number(match[2]) } : null;
}

const longMonth = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export function fullMonthYear(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : longMonth.format(date);
}

/** LinkedIn-style inclusive span, e.g. "1 yr 7 mos". */
export function durationLabel(start: string | null | undefined, end: string | null | undefined, now = new Date()): string | null {
  const from = start ? parts(start) : null;
  if (!from) return null;
  const to = end ? parts(end) : { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  if (!to) return null;
  const months = (to.year - from.year) * 12 + (to.month - from.month) + 1;
  if (months < 1) return null;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years ? `${years} yr${years === 1 ? "" : "s"}` : "", rest ? `${rest} mo${rest === 1 ? "" : "s"}` : ""]
    .filter(Boolean)
    .join(" ");
}
