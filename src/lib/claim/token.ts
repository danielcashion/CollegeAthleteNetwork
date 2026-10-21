import "server-only";
import { claimApiGet, rowsOf } from "./api";

const CLAIM_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The path segment is university_athlete_claim_links.claim_id.
 * Resolve it to athlete_id. Inactive links and unknown ids do not resolve.
 */
export async function resolveClaimToken(token: string): Promise<number | null> {
  const claimId = token.trim().toLowerCase();
  if (!CLAIM_ID.test(claimId)) return null;

  const data = await claimApiGet("/university_athlete_claim_links", { claim_id: claimId });
  const row = rowsOf(data).find((item) => String(item.claim_id ?? "").trim().toLowerCase() === claimId);
  if (!row || Number(row.is_active_YN) === 0) return null;

  const athleteId = Number(row.athlete_id);
  if (!Number.isInteger(athleteId) || athleteId <= 0) return null;
  return athleteId;
}
