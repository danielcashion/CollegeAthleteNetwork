import "server-only";
import { claimApiGet, claimApiSend, ClaimDataError, rowsOf } from "./api";

const CLAIM_FAILED = "We couldn't record your claim. Please try again.";

function mysqlDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

/** Record the first successful profile confirmation on the athlete's claim link. */
export async function markClaimLinkClaimed(athleteId: number): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const data = await claimApiGet("/university_athlete_claim_links", { athlete_id: athleteId });
    const row = rowsOf(data).find((item) => Number(item.athlete_id) === athleteId);
    if (row && Number(row.is_claimed_YN) === 1) return { ok: true };

    await claimApiSend(
      "PUT",
      "/university_athlete_claim_links",
      { athlete_id: athleteId },
      {
        athlete_id: athleteId,
        is_claimed_YN: 1,
        claimed_datetime: mysqlDateTime(new Date()),
      },
    );
    return { ok: true };
  } catch (error) {
    if (error instanceof ClaimDataError) return { ok: false, message: CLAIM_FAILED };
    return { ok: false, message: CLAIM_FAILED };
  }
}
