import "server-only";
import { claimApiGet, ClaimDataError } from "./api";
import { parseDeactivateResponse, type DeactivateOutcome } from "./deactivateResult";

const UNAVAILABLE = "We couldn't update the previous LinkedIn record just now. Nothing new was saved.";

/** Sets the athlete's current LinkedIn rows aside before a fresh profile is saved. */
export async function deactivateAthleteLinkedIn(athleteId: number): Promise<DeactivateOutcome> {
  if (!Number.isInteger(athleteId) || athleteId <= 0) {
    return parseDeactivateResponse([[{ "Error: the athlete_id cannot be NULL. Exiting.": "Error: the athlete_id cannot be NULL. Exiting." }]]);
  }

  try {
    const data = await claimApiGet("/linkedin_maintenance", {
      task: "deactivate_athlete_linkedin_data",
      athlete_id: athleteId,
    });
    return parseDeactivateResponse(data);
  } catch (error) {
    if (error instanceof ClaimDataError) return { ok: false, message: UNAVAILABLE };
    return { ok: false, message: UNAVAILABLE };
  }
}
