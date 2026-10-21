import "server-only";
import { invokeRenidlyLambda } from "./renidlyLambda";
import type { LinkedInEducation, LinkedInExperience, LinkedInProfile, ProfileBadge, RenidlyRows } from "./types";

export type LinkedInLookup = {
  profile: LinkedInProfile;
  rows: RenidlyRows;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function monthYear(value: unknown): string | null {
  const raw = text(value).slice(0, 10);
  if (!raw) return null;
  const date = new Date(`${raw}T00:00:00Z`);
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asRecords(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") as Record<string, unknown>[] : [];
}

function profileBadge(row: Record<string, unknown>): ProfileBadge | null {
  if (Number(row.is_hiring_YN) === 1) return "hiring";
  if (Number(row.is_open_to_work) === 1) return "openToWork";
  return null;
}

function toCard(rows: RenidlyRows, profileUrl: string): LinkedInProfile {
  const profile = rows.profile;
  const experience: LinkedInExperience[] = rows.experience
    .map((item) => ({
      title: text(item.title) || "Role",
      company: text(item.company),
      dateLabel: dateSpan(item.start_date, item.end_date),
      logoUrl: text(item.s3_company_logo_url) || text(item.logo_url) || null,
    }))
    .filter((item) => item.title || item.company);

  const education: LinkedInEducation[] = rows.education
    .map((item) => {
      const detail = [text(item.degree_name), text(item.field_of_study)].filter(Boolean).join(", ");
      return {
        school: text(item.school) || "School",
        detail: detail || null,
        dateLabel: dateSpan(item.start_date, item.end_date),
        logoUrl: text(item.s3_school_logo_url) || text(item.logo_url) || null,
      };
    })
    .filter((item) => item.school);

  const current = experience[0];
  const city = text(profile.city);
  const state = text(profile.state);
  const location = [city, state].filter(Boolean).join(", ") || text(profile.country) || null;
  const photo = text(profile.s3_picture_url) || text(profile.profile_pic_url);

  return {
    fullName: text(profile.full_name),
    headline: text(profile.headline) || null,
    currentTitle: current?.title || text(profile.occupation) || null,
    currentCompany: current?.company || null,
    location,
    photoUrl: photo || null,
    badge: profileBadge(profile),
    experience,
    education,
    profileUrl,
  };
}

export async function lookupLinkedInProfile(profileUrl: string): Promise<LinkedInLookup | null> {
  const result = await invokeRenidlyLambda({ action: "preview", linkedinUrl: profileUrl });
  if (result.statusCode === 404) return null;
  if (result.statusCode !== 200 || !result.body) {
    throw new Error("RENIDLY_UNAVAILABLE");
  }

  const profile = asRecord(result.body.profile);
  if (!profile) return null;
  const rows: RenidlyRows = {
    profile,
    experience: asRecords(result.body.experience),
    education: asRecords(result.body.education),
  };
  const cardUrl = text(result.body.profileUrl) || profileUrl;
  const card = toCard(rows, cardUrl);
  if (!card.fullName) return null;
  return { profile: card, rows };
}

export async function saveLinkedInProfile(input: {
  athleteId: number;
  linkedinUrl: string;
  rows: RenidlyRows;
}): Promise<void> {
  const result = await invokeRenidlyLambda({
    action: "confirm",
    athleteId: input.athleteId,
    linkedinUrl: input.linkedinUrl,
    profile: input.rows.profile,
    experience: input.rows.experience,
    education: input.rows.education,
  });
  if (result.statusCode !== 200) {
    const message = text(result.body?.error) || "SAVE_FAILED";
    throw new Error(message);
  }
}
