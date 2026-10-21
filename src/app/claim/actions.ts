"use server";

import { getAthleteForClaim, getStoredLinkedInProfile } from "@/lib/claim/athlete";
import { ClaimDataError } from "@/lib/claim/api";
import { lastNamesMatch } from "@/lib/claim/lastName";
import { linkedInSlug, normalizeLinkedInUrl } from "@/lib/claim/linkedinUrl";
import { loadRenidlyForAthlete, markLinkedInVerified } from "@/lib/claim/verifyUrl";
import {
  confirmIdentity as saveIdentity,
  confirmLinkedInProfile as saveLinkedIn,
  declineIdentity as saveDecline,
  getClaimSnapshot,
  rejectStoredProfile as saveRejectStored,
} from "@/lib/claim/persist";
import { deactivateAthleteLinkedIn } from "@/lib/claim/deactivate";
import { priorClause } from "@/lib/claim/deactivateResult";
import { lookupLinkedInProfile, saveLinkedInProfile } from "@/lib/claim/provider";
import { rateLimitClaimLookup } from "@/lib/claim/rateLimit";
import { resolveClaimToken } from "@/lib/claim/token";
import type { ClaimActionResult, LookupActionResult, RenidlyRows } from "@/lib/claim/types";

const INVALID: ClaimActionResult = {
  ok: false,
  code: "invalid_link",
  message: "This link isn't valid.",
};

const URL_MESSAGE =
  "That doesn't look like a LinkedIn profile link. Open your profile and copy the address from the browser bar. It should look like linkedin.com/in/your-name.";

const NAME_MISMATCH =
  "The last name on this LinkedIn profile doesn't match this athlete record. Paste your own profile URL.";

function profileEntityId(rows: RenidlyRows): string | null {
  const raw = rows.profile.urn;
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return null;
  return value.slice(0, 80);
}

function profileLastName(rows: RenidlyRows): string {
  const lastName = rows.profile.last_name;
  const fullName = rows.profile.full_name;
  const last = typeof lastName === "string" ? lastName.trim() : "";
  if (last) return last;
  return typeof fullName === "string" ? fullName.trim() : "";
}

async function athleteIdFromToken(token: string): Promise<number | null> {
  const athleteId = await resolveClaimToken(token);
  if (!athleteId) return null;
  try {
    const athlete = await getAthleteForClaim(athleteId);
    return athlete ? athleteId : null;
  } catch (error) {
    if (error instanceof ClaimDataError) throw error;
    return null;
  }
}

export async function confirmIdentity(token: string): Promise<ClaimActionResult> {
  try {
    const athleteId = await athleteIdFromToken(token);
    if (!athleteId) return INVALID;
    return { ok: true, claim: saveIdentity(athleteId) };
  } catch {
    return { ok: false, code: "unavailable", message: "We couldn't save that just now. Please try again." };
  }
}

export async function declineIdentity(token: string): Promise<ClaimActionResult> {
  try {
    const athleteId = await athleteIdFromToken(token);
    if (!athleteId) return INVALID;
    return { ok: true, claim: saveDecline(athleteId) };
  } catch {
    return { ok: false, code: "unavailable", message: "We couldn't save that just now. Please try again." };
  }
}

export async function rejectStoredProfile(token: string): Promise<ClaimActionResult> {
  try {
    const athleteId = await athleteIdFromToken(token);
    if (!athleteId) return INVALID;
    return { ok: true, claim: saveRejectStored(athleteId) };
  } catch {
    return { ok: false, code: "unavailable", message: "We couldn't save that just now. Please try again." };
  }
}

export async function confirmLinkedInProfile(
  token: string,
  profileUrl: string,
  rows?: RenidlyRows,
): Promise<ClaimActionResult> {
  try {
    const athleteId = await athleteIdFromToken(token);
    if (!athleteId) return INVALID;

    const normalized = normalizeLinkedInUrl(profileUrl);
    if (!normalized) return { ok: false, code: "invalid_url", message: URL_MESSAGE };

    const claim = getClaimSnapshot(athleteId);
    if (claim.status === "new") {
      return { ok: false, code: "unavailable", message: "Confirm your identity first, then confirm the profile." };
    }

    const athlete = await getAthleteForClaim(athleteId);
    if (!athlete) return INVALID;
    const needsVerification = !athlete.linkedinVerified;
    const slug = linkedInSlug(normalized);

    if (needsVerification) {
      if (!rows) {
        return { ok: false, code: "unavailable", message: "Paste your LinkedIn profile URL so we can verify it." };
      }
      if (!lastNamesMatch(athlete.fullName, profileLastName(rows))) {
        return { ok: false, code: "unavailable", message: NAME_MISMATCH };
      }
      if (!slug) {
        return { ok: false, code: "invalid_url", message: "That LinkedIn address is too long to save on this record." };
      }
    }

    if (rows) {
      const deactivated = await deactivateAthleteLinkedIn(athleteId);
      if (!deactivated.ok) return { ok: false, code: "unavailable", message: deactivated.message };
      try {
        await saveLinkedInProfile({ athleteId, linkedinUrl: normalized, rows });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const detail = message.startsWith("The profile") || message.startsWith("A LinkedIn") || message.startsWith("Profile rows")
          ? message
          : "The new profile did not save. Please try again.";
        const prior = priorClause(deactivated.profiles, deactivated.experience, deactivated.education);
        return { ok: false, code: "unavailable", message: prior ? `${prior} ${detail}` : detail };
      }
      if (needsVerification && slug) {
        const loaded = await loadRenidlyForAthlete(athleteId);
        if (!loaded.ok) return { ok: false, code: "unavailable", message: loaded.message };
        const marked = await markLinkedInVerified(athleteId, slug, profileEntityId(rows));
        if (!marked.ok) return { ok: false, code: "unavailable", message: marked.message };
      }
      return { ok: true, claim: saveLinkedIn(athleteId, normalized, "submitted"), notice: deactivated.notice };
    }

    const stored = await getStoredLinkedInProfile(athleteId).catch(() => null);
    if (stored?.profileUrl !== normalized) {
      return { ok: false, code: "unavailable", message: "Look up that LinkedIn profile again, then confirm it." };
    }
    return { ok: true, claim: saveLinkedIn(athleteId, normalized, "stored") };
  } catch {
    return { ok: false, code: "unavailable", message: "We couldn't save that profile. Please try again." };
  }
}

export async function lookupLinkedIn(token: string, rawUrl: string): Promise<LookupActionResult> {
  let athleteId: number | null;
  try {
    athleteId = await athleteIdFromToken(token);
  } catch {
    return {
      ok: false,
      code: "unavailable",
      message: "We couldn't look that up just now. Please try again in a moment.",
    };
  }
  if (!athleteId) return { ok: false, code: "invalid_link", message: "This link isn't valid." };

  const claim = getClaimSnapshot(athleteId);
  if (claim.status === "new") {
    return { ok: false, code: "unavailable", message: "Confirm your identity first, then add a LinkedIn URL." };
  }

  const normalized = normalizeLinkedInUrl(rawUrl);
  if (!normalized) return { ok: false, code: "invalid_url", message: URL_MESSAGE };

  if (!rateLimitClaimLookup(token)) {
    return {
      ok: false,
      code: "rate_limited",
      message: "You've looked up a few profiles on this link. Please wait a few minutes and try again.",
    };
  }

  try {
    const lookup = await lookupLinkedInProfile(normalized);
    if (!lookup) {
      return {
        ok: false,
        code: "not_found",
        message: "We couldn't find a LinkedIn profile at that link. Check the URL and try again.",
      };
    }
    const athlete = await getAthleteForClaim(athleteId);
    const lastNameMatches = Boolean(
      athlete?.linkedinVerified || (athlete && lastNamesMatch(athlete.fullName, profileLastName(lookup.rows))),
    );
    return { ok: true, profile: lookup.profile, rows: lookup.rows, simulated: false, lastNameMatches };
  } catch (error) {
    console.error("LinkedIn lookup failed", error instanceof Error ? error.message : error);
    return {
      ok: false,
      code: "network",
      message: "We couldn't reach the profile service just now. Please try again in a moment.",
    };
  }
}
