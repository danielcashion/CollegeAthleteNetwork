import { SITE_URL } from "@/lib/seo/site";
import { textToSlug } from "@/lib/seo/slug";

export const CAN_ORG_NAME = "The College Athlete Network";

export function canAthleteNetworkPath(universityName: string): string {
  return `/athlete-network/${textToSlug(universityName)}`;
}

export function canAthleteNetworkUrl(universityName: string): string {
  return `${SITE_URL.replace(/\/$/, "")}${canAthleteNetworkPath(universityName)}`;
}
