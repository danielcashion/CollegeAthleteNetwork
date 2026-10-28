import { CAN_ORG_NAME } from "@/lib/seo/canUrls";
import { absoluteUrl, SITE_URL } from "@/lib/seo/site";

type UniversityLike = {
  university_name: string;
  mascot?: string | null;
  slug: string;
  logo_url?: string | null;
  website?: string | null;
};

export function athleteNetworkHubDescription(uni: UniversityLike): string {
  const mascot = uni.mascot?.trim();
  const networkName = mascot
    ? `${uni.university_name} ${mascot} Athlete Network`
    : `${uni.university_name} Athlete Network`;
  return `Join the ${networkName} on ${CAN_ORG_NAME}. Search alumni and student-athletes by sport, employer, and location—career connections built for ${uni.university_name}.`;
}

export function athleteNetworkHubJsonLd(
  uni: UniversityLike,
  path: string
) {
  const url = absoluteUrl(path);
  const pageName = uni.mascot
    ? `${uni.university_name} ${uni.mascot} Athlete Network`
    : `${uni.university_name} Athlete Network`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: pageName,
        description: athleteNetworkHubDescription(uni),
        isPartOf: {
          "@type": "WebSite",
          name: CAN_ORG_NAME,
          url: SITE_URL,
        },
        about: {
          "@type": "CollegeOrUniversity",
          name: uni.university_name,
          ...(uni.website ? { url: uni.website } : {}),
        },
        publisher: {
          "@type": "Organization",
          name: CAN_ORG_NAME,
          url: SITE_URL,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Athlete networks by school",
            item: absoluteUrl("/athlete-network"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: pageName,
            item: url,
          },
        ],
      },
    ],
  } as const;
}

export function athleteNetworkSportJsonLd(options: {
  universityName: string;
  universitySlug: string;
  sport: string;
  sportSlug: string;
  logoUrl?: string | null;
}) {
  const path = `/athlete-network/${options.universitySlug}/${options.sportSlug}`;
  const url = absoluteUrl(path);
  const pageName = `${options.universityName} ${options.sport} Athlete Network`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: pageName,
        description: `Explore ${options.universityName} ${options.sport} on ${CAN_ORG_NAME}—rosters, alumni careers, and networking for ${options.sport} student-athletes.`,
        isPartOf: {
          "@type": "WebSite",
          name: CAN_ORG_NAME,
          url: SITE_URL,
        },
        about: {
          "@type": "CollegeOrUniversity",
          name: options.universityName,
        },
        publisher: {
          "@type": "Organization",
          name: CAN_ORG_NAME,
          url: SITE_URL,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Athlete networks by school",
            item: absoluteUrl("/athlete-network"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${options.universityName} Athlete Network`,
            item: absoluteUrl(`/athlete-network/${options.universitySlug}`),
          },
          {
            "@type": "ListItem",
            position: 4,
            name: pageName,
            item: url,
          },
        ],
      },
    ],
  } as const;
}
