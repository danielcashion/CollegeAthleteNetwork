import { getUniqueUniversityMeta } from "@/services/getUniqueUniversityMeta";
import { getUniversitySportsList } from "@/services/getUniversitySports";
import { listPublishedPublicEvents } from "@/services/getGolfOutingPublic";
import { outingCalendarDate } from "@/components/GolfOutingPage/golfOutingDisplay";
import { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return generateSitemap();
}

async function generateSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [universities, sportsList, publishedEvents] = await Promise.all([
      getUniqueUniversityMeta(),
      getUniversitySportsList(),
      listPublishedPublicEvents({ fresh: false }).catch(() => []),
    ]);
    const baseUrl = "https://www.collegeathletenetwork.org";
    const universitiesByName = new Map<string, any>(
      universities.map((university: any) => [
        university.university_name,
        university,
      ])
    );
    const siteLastMod = new Date();

    const personaPages = [
      "personas/athletic-department-administration",
      "personas/alumni-students",
      "personas/development-officers",
    ];

    const staticPages = [
      "about-us",
      "accessibility",
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
      ...personaPages,
      "privacy-policy",
      "sample-data",
      "support",
      "terms-of-service",
      "golf-outings",
      "networking-events",
    ];

    const sitemapEntries: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        changeFrequency: "daily",
        priority: 1,
        lastModified: siteLastMod,
      },

      ...personaPages.map((path) => ({
        url: `${baseUrl}/${path}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        lastModified: siteLastMod,
      })),

      ...staticPages
        .filter((path) => !personaPages.includes(path))
        .map((path) => ({
          url: `${baseUrl}/${path}`,
          changeFrequency: "monthly" as const,
          priority: path === "events" ? 0.85 : 0.7,
          lastModified: siteLastMod,
        })),

      ...universities.map((university: any) => ({
        url: `${baseUrl}/athlete-network/${university.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        lastModified: siteLastMod,
      })),

      ...sportsList
        .map(({ university_name, sport }) => {
          const uni = universitiesByName.get(university_name);
          if (!uni) return null;
          return {
            url: `${baseUrl}/athlete-network/${uni.slug}/${sport}`,
            changeFrequency: "weekly" as const,
            priority: 0.6,
            lastModified: siteLastMod,
          };
        })
        .filter(Boolean),

      ...publishedEvents.map((event) => {
        const eventDate = outingCalendarDate(event.event_date);
        return {
          url: `${baseUrl}/${event.product_type === "NETWORKING" ? "networking-event" : "golf-outing"}/${event.public_url_slug}`,
          changeFrequency: "weekly" as const,
          priority: 0.65,
          lastModified: eventDate ? new Date(`${eventDate}T12:00:00Z`) : siteLastMod,
        };
      }),
    ];

    return Array.from(
      new Map(
        sitemapEntries.map((entry) => [entry.url, entry])
      ).values()
    );
  } catch (error) {
    console.error("Error generating sitemap:", error);

    return [
      {
        url: "https://www.collegeathletenetwork.org",
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }
}
