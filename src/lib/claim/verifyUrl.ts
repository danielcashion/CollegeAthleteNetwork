import "server-only";
import { claimApiGet, claimApiSend, ClaimDataError } from "./api";

const LOAD_FAILED = "We pulled the LinkedIn profile, but we couldn't finish saving it. Please try again.";
const URL_FAILED = "We pulled the LinkedIn profile, but we couldn't mark it verified. Please try again.";

function loadFailed(data: unknown): boolean {
  const rows = Array.isArray(data) ? data.flat(2) : [data];
  return rows.some((row) => {
    if (!row || typeof row !== "object") return false;
    return Object.keys(row as Record<string, unknown>).some((key) => /error:/i.test(key));
  });
}

/** Move this athlete's staged Renidly rows into the current LinkedIn tables. */
export async function loadRenidlyForAthlete(athleteId: number): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const data = await claimApiGet("/linkedin_maintenance", {
      task: "load_renidly_stg",
      athlete_id: athleteId,
      limit: 1,
    });
    if (loadFailed(data)) return { ok: false, message: LOAD_FAILED };
    return { ok: true };
  } catch (error) {
    if (error instanceof ClaimDataError) return { ok: false, message: LOAD_FAILED };
    return { ok: false, message: LOAD_FAILED };
  }
}

/** Store the LinkedIn slug, the Renidly entity id, and mark the athlete verified. */
export async function markLinkedInVerified(
  athleteId: number,
  slug: string,
  entityId: string | null,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const body: Record<string, unknown> = {
    athlete_id: athleteId,
    bus_url_1: slug,
    bus_url_1_verified: 1,
  };
  if (entityId) body.urn = entityId;
  try {
    await claimApiSend("PUT", "/university_athletes", { athlete_id: athleteId }, body);
    return { ok: true };
  } catch (error) {
    if (error instanceof ClaimDataError) return { ok: false, message: URL_FAILED };
    return { ok: false, message: URL_FAILED };
  }
}
