import "server-only";
import type { ClaimSnapshot, ClaimStatus } from "./types";

/**
 * TODO(schema): Nothing in the current database is a claim receipt.
 *
 * university_athletes.bus_url_1 / bus_url_1_verified mean "we found a profile URL",
 * and onboarded_YN means the athlete finished member onboarding. Athlete 2963
 * already has onboarded_YN = 1, so that flag must not mean "claim link completed".
 * athlete_step_status is the member checklist, keyed by a different step_id.
 *
 * Proposed table `athlete_profile_claims`:
 *   claim_id            INT UNSIGNED PK AI
 *   athlete_id          INT UNSIGNED NOT NULL
 *   token_hash          CHAR(64) NOT NULL          -- sha256 of the raw token
 *   identity_status     ENUM('pending','confirmed','declined') NOT NULL DEFAULT 'pending'
 *   identity_status_at  DATETIME NULL
 *   stored_profile_rejected_YN TINYINT NOT NULL DEFAULT 0
 *   linkedin_url        VARCHAR(200) NULL          -- normalized https://www.linkedin.com/in/<slug>
 *   linkedin_status     ENUM('pending','confirmed') NOT NULL DEFAULT 'pending'
 *   linkedin_status_at  DATETIME NULL
 *   profile_source      VARCHAR(20) NULL           -- 'stored' | 'renidly'
 *   created_datetime    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
 *   updated_datetime    DATETIME NULL
 *   UNIQUE KEY uk_athlete (athlete_id)
 *   KEY idx_token_hash (token_hash)
 *
 * On confirm, also set university_athletes.bus_url_1 to the slug and
 * bus_url_1_verified = 1. Leave onboarded_YN alone.
 *
 * This step keeps the result in process memory so the UI can be exercised
 * without writing production athlete rows. It resets when the server process does.
 */

type MemoryClaim = ClaimSnapshot & { athleteId: number };

const globalStore = globalThis as unknown as { __canClaimStore?: Map<number, MemoryClaim> };
const store = globalStore.__canClaimStore ?? new Map<number, MemoryClaim>();
globalStore.__canClaimStore = store;

const EMPTY: ClaimSnapshot = { status: "new", linkedinUrl: null, profileSource: null };

function snapshot(record: MemoryClaim | undefined): ClaimSnapshot {
  if (!record) return EMPTY;
  return {
    status: record.status,
    linkedinUrl: record.linkedinUrl,
    profileSource: record.profileSource,
  };
}

function write(athleteId: number, status: ClaimStatus, patch: Partial<ClaimSnapshot> = {}) {
  const current = store.get(athleteId);
  const next: MemoryClaim = {
    athleteId,
    status,
    linkedinUrl: patch.linkedinUrl === undefined ? current?.linkedinUrl ?? null : patch.linkedinUrl,
    profileSource: patch.profileSource === undefined ? current?.profileSource ?? null : patch.profileSource,
  };
  store.set(athleteId, next);
  return snapshot(next);
}

export function getClaimSnapshot(athleteId: number): ClaimSnapshot {
  return snapshot(store.get(athleteId));
}

export function confirmIdentity(athleteId: number): ClaimSnapshot {
  const current = store.get(athleteId);
  if (current?.status === "identity_declined") {
    return write(athleteId, "identity_confirmed", { linkedinUrl: null, profileSource: null });
  }
  if (current?.status === "completed" || current?.status === "stored_rejected") {
    return snapshot(current);
  }
  return write(athleteId, "identity_confirmed");
}

export function declineIdentity(athleteId: number): ClaimSnapshot {
  return write(athleteId, "identity_declined", { linkedinUrl: null, profileSource: null });
}

export function rejectStoredProfile(athleteId: number): ClaimSnapshot {
  return write(athleteId, "stored_rejected", { linkedinUrl: null, profileSource: null });
}

export function confirmLinkedInProfile(
  athleteId: number,
  profileUrl: string,
  profileSource: "stored" | "submitted",
): ClaimSnapshot {
  return write(athleteId, "completed", { linkedinUrl: profileUrl, profileSource });
}
