import "server-only";
import { claimApiGet, claimApiSend, rowsOf } from "./api";
import type { AthleteEmailForConfirm, EmailConfirmStatus } from "./types";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function mysqlDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function rowPayload(row: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value !== null && typeof value !== "object") payload[key] = value;
  }
  return { ...payload, ...patch };
}

export async function fetchAthleteEmailsForConfirm(athleteId: number): Promise<AthleteEmailForConfirm[]> {
  const data = await claimApiGet("/university_athletes_emails", { athlete_id: athleteId });
  const seen = new Set<string>();
  const rows: AthleteEmailForConfirm[] = [];

  for (const item of rowsOf(data)) {
    if (Number(item.athlete_id) !== athleteId) continue;
    if (Number(item.is_active_YN) === 0) continue;
    const emailAddress = text(item.email_address);
    const normalized = emailAddress.toLowerCase();
    if (!normalized.includes("@")) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    const rowId = Number(item.row_id);
    if (!Number.isFinite(rowId)) continue;
    rows.push({
      rowId,
      emailAddress,
      emailType: text(item.email_type) || null,
      emailStatus: text(item.email_status) || null,
    });
  }

  rows.sort((a, b) => {
    const aEdu = a.emailAddress.toLowerCase().endsWith(".edu") ? 0 : 1;
    const bEdu = b.emailAddress.toLowerCase().endsWith(".edu") ? 0 : 1;
    if (aEdu !== bEdu) return aEdu - bEdu;
    return a.emailAddress.localeCompare(b.emailAddress);
  });

  return rows;
}

async function putEmailRow(
  athleteId: number,
  row: Record<string, unknown>,
  status: EmailConfirmStatus,
): Promise<void> {
  const rowId = Number(row.row_id);
  const now = mysqlDateTime(new Date());
  await claimApiSend("PUT", "/university_athletes_emails", { row_id: rowId }, rowPayload(row, {
    email_status: status,
    updated_by: "confirm_link",
    updated_datetime: now,
    athlete_id: athleteId,
    row_id: rowId,
  }));
}

export async function setEmailStatusesForAthlete(
  athleteId: number,
  updates: { rowId: number; status: EmailConfirmStatus }[],
): Promise<void> {
  const data = await claimApiGet("/university_athletes_emails", { athlete_id: athleteId });
  const byId = new Map<number, Record<string, unknown>>();
  for (const item of rowsOf(data)) {
    if (Number(item.athlete_id) !== athleteId) continue;
    const rowId = Number(item.row_id);
    if (Number.isFinite(rowId)) byId.set(rowId, item);
  }

  for (const update of updates) {
    const row = byId.get(update.rowId);
    if (!row) throw new Error(`Email row ${update.rowId} not found for athlete`);
    await putEmailRow(athleteId, row, update.status);
  }
}

export async function markAllEmailsInaccurate(athleteId: number): Promise<void> {
  const data = await claimApiGet("/university_athletes_emails", { athlete_id: athleteId });
  for (const item of rowsOf(data)) {
    if (Number(item.athlete_id) !== athleteId) continue;
    if (Number(item.is_active_YN) === 0) continue;
    const rowId = Number(item.row_id);
    if (!Number.isFinite(rowId)) continue;
    await putEmailRow(athleteId, item, "inaccurate");
  }
}
