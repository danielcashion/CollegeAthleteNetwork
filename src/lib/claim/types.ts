/** Plain data passed to the confirm page. No athlete id — the token is the only client handle. */

export type LinkedInExperience = {
  title: string;
  company: string;
  dateLabel: string | null;
  logoUrl: string | null;
  /** YYYY-MM-DD */
  startDate?: string | null;
  /** YYYY-MM-DD; null means current. */
  endDate?: string | null;
  location?: string | null;
  description?: string | null;
};

export type LinkedInEducation = {
  school: string;
  detail: string | null;
  dateLabel: string | null;
  logoUrl: string | null;
  degree?: string | null;
  fieldOfStudy?: string | null;
  grade?: string | null;
  activities?: string | null;
  description?: string | null;
  /** YYYY-MM-DD */
  startDate?: string | null;
  /** YYYY-MM-DD */
  endDate?: string | null;
};

/** Hiring wins when both linkedin_profile flags are 1. */
export type ProfileBadge = "hiring" | "openToWork";

export type LinkedInProfile = {
  fullName: string;
  headline: string | null;
  currentTitle: string | null;
  currentCompany: string | null;
  location: string | null;
  photoUrl: string | null;
  badge: ProfileBadge | null;
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
  profileUrl: string;
};

export type RenidlyRows = {
  profile: Record<string, unknown>;
  experience: Record<string, unknown>[];
  education: Record<string, unknown>[];
};

export type ClaimStatus =
  | "new"
  | "identity_confirmed"
  | "identity_declined"
  | "stored_rejected"
  | "completed";

export type ClaimSnapshot = {
  status: ClaimStatus;
  linkedinUrl: string | null;
  /** Where the confirmed URL came from. */
  profileSource: "stored" | "submitted" | null;
};

export type AthleteForClaim = {
  firstName: string;
  fullName: string;
  school: string;
  schoolLogoUrl: string | null;
  sport: string;
  /** Last roster year on university_athletes.max_roster_year. */
  classYear: number | null;
  photoUrl: string | null;
  /** Normalized profile URL from university_athletes.bus_url_1, when we have one. */
  linkedinUrl: string | null;
  /** university_athletes.bus_url_1_verified = 1. */
  linkedinVerified: boolean;
  claim: ClaimSnapshot;
};

export type ClaimActionErrorCode =
  | "invalid_link"
  | "invalid_url"
  | "not_found"
  | "rate_limited"
  | "unavailable"
  | "network";

export type ClaimActionResult =
  | { ok: true; claim: ClaimSnapshot; notice?: string }
  | { ok: false; code: ClaimActionErrorCode; message: string };

export type LookupActionResult =
  | { ok: true; profile: LinkedInProfile; rows: RenidlyRows; simulated: boolean; lastNameMatches: boolean }
  | { ok: false; code: ClaimActionErrorCode; message: string };

export type EmailConfirmStatus = "active" | "inactive" | "inaccurate";

export type AthleteEmailForConfirm = {
  rowId: number;
  emailAddress: string;
  emailType: string | null;
  emailStatus: string | null;
};

export type EmailActionResult =
  | { ok: true }
  | { ok: false; code: ClaimActionErrorCode; message: string };
