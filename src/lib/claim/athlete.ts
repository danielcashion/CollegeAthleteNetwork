import "server-only";
import { claimApiGet, rowsOf } from "./api";
import { publicLinkedInUrl } from "./linkedinDisplay";
import { normalizeLinkedInUrl } from "./linkedinUrl";
import { getClaimSnapshot } from "./persist";
import { isoDate } from "./profileDates";
import type { AthleteForClaim, LinkedInEducation, LinkedInExperience, LinkedInProfile, ProfileBadge } from "./types";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function httpsUrl(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function monthYear(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function dateSpan(start: unknown, end: unknown): string | null {
  const startLabel = monthYear(start);
  if (!startLabel && !end) return null;
  const endLabel = end ? monthYear(end) : "Present";
  if (!startLabel) return endLabel;
  return `${startLabel} — ${endLabel || "Present"}`;
}

function profileBadge(row: Record<string, unknown>): ProfileBadge | null {
  if (Number(row.is_hiring_YN) === 1) return "hiring";
  if (Number(row.is_open_to_work) === 1) return "openToWork";
  return null;
}

function firstNameOf(fullName: string): string {
  return fullName.split(/\s+/).filter(Boolean)[0] || "";
}

function locationOf(row: Record<string, unknown>): string | null {
  const city = text(row.city);
  const state = text(row.state);
  const country = text(row.country);
  const local = [city, state].filter(Boolean).join(", ");
  if (local) return local;
  return country || null;
}

/** A LinkedIn /in/ URL Renidly can fetch, including a stable entity id. */
function profileLookupUrl(value: unknown): string {
  const raw = text(value);
  if (!raw || /^(no link found|manual_entry|null)$/i.test(raw)) return "";
  const candidate = /linkedin\.com|^https?:\/\//i.test(raw) ? raw : `https://www.linkedin.com/in/${raw}`;
  return normalizeLinkedInUrl(candidate) || "";
}

function linkedInUrlFromAthlete(row: Record<string, unknown>): string | null {
  return publicLinkedInUrl(profileLookupUrl(row.bus_url_1)) || null;
}

export async function getAthleteForClaim(athleteId: number): Promise<AthleteForClaim | null> {
  const data = await claimApiGet("/university_athletes", { athlete_id: athleteId });
  const row = rowsOf(data).find((item) => Number(item.athlete_id) === athleteId);
  if (!row) return null;
  if (Number(row.is_active_YN) === 0) return null;

  const fullName = text(row.athlete_name);
  if (!fullName) return null;

  const classYear = Number(row.max_roster_year);
  const school = text(row.university_name);
  const [profileData, metaData] = await Promise.all([
    claimApiGet("/athlete_profile", { athlete_id: athleteId }).catch(() => null),
    school
      ? claimApiGet("/university_meta", { university_name: school }).catch(() => null)
      : Promise.resolve(null),
  ]);
  const profile = profileData
    ? rowsOf(profileData)
        .filter((item) => Number(item.athlete_id) === athleteId)
        .sort((a, b) => Number(b.row_id) - Number(a.row_id))[0]
    : undefined;
  const photoUrl = profile ? httpsUrl(profile.s3_picture_url) || httpsUrl(profile.profile_pic_url) : null;
  const meta = metaData
    ? rowsOf(metaData).find((item) => text(item.university_name).toLowerCase() === school.toLowerCase()) || rowsOf(metaData)[0]
    : undefined;
  const schoolLogoUrl = meta ? httpsUrl(meta.logo_url) : null;

  return {
    firstName: firstNameOf(fullName),
    fullName,
    school,
    schoolLogoUrl,
    sport: text(row.sport),
    classYear: Number.isInteger(classYear) && classYear > 1900 ? classYear : null,
    photoUrl,
    linkedinUrl: linkedInUrlFromAthlete(row),
    linkedinVerified: Number(row.bus_url_1_verified) === 1,
    claim: getClaimSnapshot(athleteId),
  };
}

export async function getStoredLinkedInProfile(athleteId: number): Promise<LinkedInProfile | null> {
  const [profileData, experienceData, educationData] = await Promise.all([
    claimApiGet("/athlete_profile", { athlete_id: athleteId }),
    claimApiGet("/athlete_experience", { athlete_id: athleteId }),
    claimApiGet("/athlete_education", { athlete_id: athleteId }),
  ]);

  const profile = rowsOf(profileData)
    .filter((item) => Number(item.athlete_id) === athleteId)
    .sort((a, b) => Number(b.row_id) - Number(a.row_id))[0];
  if (!profile) return null;
  if (Number(profile.is_active_YN) === 0) return null;

  const fullName = text(profile.full_name) || [text(profile.first_name), text(profile.last_name)].filter(Boolean).join(" ");
  if (!fullName) return null;
  const profileUrl =
    profileLookupUrl(profile.public_identifier) ||
    rowsOf(experienceData).map((item) => profileLookupUrl(item.bus_url_1)).find(Boolean) ||
    rowsOf(educationData).map((item) => profileLookupUrl(item.bus_url_1)).find(Boolean) ||
    "";

  const experience: LinkedInExperience[] = rowsOf(experienceData)
    .filter((item) => Number(item.athlete_id) === athleteId && Number(item.is_active_YN) !== 0)
    .sort((a, b) => Number(a.job_order_id ?? 999) - Number(b.job_order_id ?? 999))
    .slice(0, 3)
    .map((item) => ({
      title: text(item.title) || "Role",
      company: text(item.company),
      dateLabel: dateSpan(item.start_date, item.end_date),
      logoUrl: httpsUrl(item.s3_company_logo_url) || httpsUrl(item.logo_url),
      startDate: isoDate(item.start_date),
      endDate: isoDate(item.end_date),
      location: text(item.location) || null,
      description: text(item.description) || null,
    }))
    .filter((item) => item.title || item.company);

  const education: LinkedInEducation[] = rowsOf(educationData)
    .filter((item) => Number(item.athlete_id) === athleteId && Number(item.is_active_YN) !== 0)
    .sort((a, b) => String(b.end_date || "").localeCompare(String(a.end_date || "")))
    .slice(0, 3)
    .map((item) => {
      const detail = [text(item.degree_name), text(item.field_of_study)].filter(Boolean).join(", ");
      return {
        school: text(item.school) || "School",
        detail: detail || null,
        dateLabel: dateSpan(item.start_date, item.end_date),
        logoUrl: httpsUrl(item.s3_school_logo_url) || httpsUrl(item.logo_url),
        degree: text(item.degree_name) || null,
        fieldOfStudy: text(item.field_of_study) || null,
        grade: text(item.grade) || null,
        activities: text(item.activities_and_societies) || null,
        description: text(item.description) || null,
        startDate: isoDate(item.start_date),
        endDate: isoDate(item.end_date),
      };
    })
    .filter((item) => item.school);

  const current = experience[0];
  const photoUrl = httpsUrl(profile.s3_picture_url) || httpsUrl(profile.profile_pic_url);

  return {
    fullName,
    headline: text(profile.headline) || null,
    currentTitle: current?.title || text(profile.occupation) || null,
    currentCompany: current?.company || null,
    location: locationOf(profile),
    photoUrl,
    badge: profileBadge(profile),
    experience,
    education,
    profileUrl,
  };
}
