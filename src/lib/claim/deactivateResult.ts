export type DeactivateOutcome =
  | {
      ok: true;
      profiles: number;
      experience: number;
      education: number;
      notice: string;
    }
  | { ok: false; message: string };

const MISSING_ID = "We couldn't update your record because the profile id was missing. Nothing new was saved.";
const UNKNOWN_ATHLETE = "We couldn't find a record to update. Nothing new was saved.";
const UNREADABLE = "We couldn't confirm the previous LinkedIn data was set aside. Nothing new was saved.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function logRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  const first = data[0];
  if (Array.isArray(first)) return first.filter(isRecord);
  if (isRecord(first) && ("step" in first || Object.keys(first).some((key) => /^error:/i.test(key)))) {
    return data.filter(isRecord);
  }
  return [];
}

function errorMessage(row: Record<string, unknown>): string | null {
  const text = Object.entries(row)
    .map(([key, value]) => `${key} ${value ?? ""}`)
    .join(" ");
  if (/athlete_id cannot be null/i.test(text)) return MISSING_ID;
  if (/does not exist/i.test(text)) return UNKNOWN_ATHLETE;
  if (/error:/i.test(text)) return UNREADABLE;
  return null;
}

function countFor(step: string): "profiles" | "experience" | "education" | null {
  const label = step.toLowerCase();
  if (label.includes("profile")) return "profiles";
  if (label.includes("experience")) return "experience";
  if (label.includes("education")) return "education";
  return null;
}

export function priorClause(profiles: number, experience: number, education: number): string | null {
  const parts = [
    profiles > 0 ? `${profiles} ${profiles === 1 ? "profile" : "profiles"}` : "",
    experience > 0 ? `${experience} ${experience === 1 ? "job" : "jobs"}` : "",
    education > 0 ? `${education} ${education === 1 ? "school" : "schools"}` : "",
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return `Previous LinkedIn data was set aside (${parts.join(", ")}).`;
}

export function describeDeactivation(profiles: number, experience: number, education: number): string {
  const prior = priorClause(profiles, experience, education);
  if (!prior) return "No previous LinkedIn records were active. Your new profile is now the current one.";
  return `${prior} Your new profile is now the current one.`;
}

/** Interprets the linkedin_maintenance deactivate response, including its error rows. */
export function parseDeactivateResponse(data: unknown): DeactivateOutcome {
  const rows = logRows(data);
  if (rows.length === 0) return { ok: false, message: UNREADABLE };

  for (const row of rows) {
    const message = errorMessage(row);
    if (message) return { ok: false, message };
  }

  const counts = { profiles: 0, experience: 0, education: 0 };
  let sawStep = false;
  for (const row of rows) {
    if (typeof row.step !== "string") continue;
    const bucket = countFor(row.step);
    if (!bucket) continue;
    const count = Number(String(row.comments ?? "").trim());
    if (!Number.isFinite(count) || count < 0) return { ok: false, message: UNREADABLE };
    counts[bucket] = count;
    sawStep = true;
  }
  if (!sawStep) return { ok: false, message: UNREADABLE };

  return {
    ok: true,
    ...counts,
    notice: describeDeactivation(counts.profiles, counts.experience, counts.education),
  };
}
