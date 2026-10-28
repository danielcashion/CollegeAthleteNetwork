import { SITE_URL } from "@/lib/seo/site";
import { getUniqueUniversityMeta } from "@/services/getUniqueUniversityMeta";
import { getUniversitySportsList } from "@/services/getUniversitySports";
import { listPublishedPublicEvents } from "@/services/getGolfOutingPublic";
import { outingCalendarDate } from "@/components/GolfOutingPage/golfOutingDisplay";
import type { MetadataRoute } from "next";

export const PERSONA_PAGES = [
  "personas/athletic-department-administration",
  "personas/alumni-students",
  "personas/development-officers",
] as const;

export const STATIC_PAGES = [
  "about-us",
  "accessibility",
  "athlete-network",
  "competitive-landscape",
  "athlete-checklist",
  "communications",
  "contact-us",
  "corporate-partners",
  "data-transparency",
  "events",
  "faqs",
  "fundraising",
  "infrastructure",
  "join-us",
  ...PERSONA_PAGES,
  "privacy-policy",
  "sample-data",
  "support",
  "terms-of-service",
  "golf-outings",
  "networking-events",
] as const;

type UniversityMeta = Awaited<ReturnType<typeof getUniqueUniversityMeta>>[number];

export async function fetchUniversitiesForSitemap(): Promise<UniversityMeta[]> {
  try {
    return await getUniqueUniversityMeta();
  } catch (error) {
    console.error("Sitemap: university_meta unavailable", error);
    return [];
  }
}

export async function fetchSportsForSitemap(): Promise<
  Awaited<ReturnType<typeof getUniversitySportsList>>
> {
  try {
    return await getUniversitySportsList();
  } catch (error) {
    console.error("Sitemap: university_sport_seo unavailable", error);
    return [];
  }
}

export async function fetchEventsForSitemap() {
  try {
    return await listPublishedPublicEvents({ fresh: false });
  } catch (error) {
    console.error("Sitemap: published events unavailable", error);
    return [];
  }
}

function dedupeEntries(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const valid = entries.filter(
    (entry): entry is MetadataRoute.Sitemap[number] =>
      Boolean(entry?.url && entry.url.startsWith("http"))
  );
  return Array.from(new Map(valid.map((entry) => [entry.url, entry])).values());
}

export function buildCoreSitemap(siteLastMod: Date): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const personaSet = new Set<string>(PERSONA_PAGES);

  return dedupeEntries([
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
      lastModified: siteLastMod,
    },
    ...STATIC_PAGES.map((path) => ({
      url: `${baseUrl}/${path}`,
      changeFrequency: (personaSet.has(path) || path === "athlete-network"
        ? "weekly"
        : "monthly") as "weekly" | "monthly",
      priority:
        path === "athlete-network"
          ? 0.9
          : path === "events"
            ? 0.85
            : personaSet.has(path)
              ? 0.8
              : 0.7,
      lastModified: siteLastMod,
    })),
  ]);
}

export function buildUniversitySitemap(
  universities: UniversityMeta[],
  siteLastMod: Date
): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  return dedupeEntries(
    universities
      .filter((u) => u.slug)
      .map((university) => ({
        url: `${baseUrl}/athlete-network/${university.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        lastModified: siteLastMod,
      }))
  );
}

export function buildSportsSitemap(
  universities: UniversityMeta[],
  sportsList: Awaited<ReturnType<typeof getUniversitySportsList>>,
  siteLastMod: Date
): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const universitiesByName = new Map(
    universities.map((university) => [university.university_name, university])
  );

  const entries: MetadataRoute.Sitemap = [];
  for (const { university_name, sport } of sportsList) {
    const uni = universitiesByName.get(university_name);
    if (!uni?.slug || !sport) continue;
    entries.push({
      url: `${baseUrl}/athlete-network/${uni.slug}/${sport}`,
      changeFrequency: "weekly",
      priority: 0.6,
      lastModified: siteLastMod,
    });
  }
  return dedupeEntries(entries);
}

export function buildEventsSitemap(
  publishedEvents: Awaited<ReturnType<typeof listPublishedPublicEvents>>,
  siteLastMod: Date
): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [];
  for (const event of publishedEvents) {
    const slug = event.public_url_slug?.trim();
    if (!slug) continue;
    const eventDate = outingCalendarDate(event.event_date);
    const pathPrefix =
      event.product_type === "NETWORKING" ? "networking-event" : "golf-outing";
    entries.push({
      url: `${baseUrl}/${pathPrefix}/${encodeURIComponent(slug)}`,
      changeFrequency: "weekly",
      priority: 0.65,
      lastModified: eventDate
        ? new Date(`${eventDate}T12:00:00Z`)
        : siteLastMod,
    });
  }
  return dedupeEntries(entries);
}

export function minimalFallbackSitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL.replace(/\/$/, ""),
      changeFrequency: "daily",
      priority: 1,
      lastModified: new Date(),
    },
  ];
}
