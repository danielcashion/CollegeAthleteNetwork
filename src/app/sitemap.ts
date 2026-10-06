import { getUniqueUniversityMeta } from "@/services/getUniqueUniversityMeta";
import { getUniversitySportsList } from "@/services/getUniversitySports";
import { listPublishedPublicEvents } from "@/services/getGolfOutingPublic";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await generateSitemap();
}

async function generateSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const universities = await getUniqueUniversityMeta();
    const sportsList = await getUniversitySportsList();
    const publishedEvents = await listPublishedPublicEvents().catch(() => []);
    const baseUrl = "https://www.collegeathletenetwork.org";

    const personaPages = [
      "personas/athletic-department-administration",
      "personas/alumni-students",
      "personas/development-officers",
    ];

    const staticPages = [
      "about-us",
      "competitive-landscape",
      "athlete-checklist",
      "communications",
      "contact-us",
      "corporate-partners",
      "data-transparency",
      "join-us",
      ...personaPages,
      "privacy-policy",
      "sample-data",
      "support",
      "terms-of-service",
      "golf-outings",
      "networking-events",
    ];

    const sitemapEntries = [
      {
        url: baseUrl,
        changeFrequency: "daily",
        priority: 1,
      },

      // Persona pages (higher priority conversion pages)
      ...personaPages.map((path) => ({
        url: `${baseUrl}/${path}`,
        changeFrequency: "monthly",
        priority: 0.8,
      })),

      // Other static pages
      ...staticPages
        .filter((path) => !personaPages.includes(path))
        .map((path) => ({
          url: `${baseUrl}/${path}`,
          changeFrequency: "monthly",
          priority: 0.7,
        })),

      // Dynamic university pages
      ...universities.map((university: any) => ({
        url: `${baseUrl}/athlete-network/${university.slug}`,
        changeFrequency: "weekly",
        priority: 0.7,
      })),

      // Dynamic sport pages
      ...sportsList
        .map(({ university_name, sport }) => {
          const uni = universities.find(
            (u: any) => u.university_name === university_name
          );
          if (!uni) return null;
          return {
            url: `${baseUrl}/athlete-network/${uni.slug}/${sport}`,
            changeFrequency: "weekly",
            priority: 0.6,
          };
        })
        .filter(Boolean),

      ...publishedEvents.map((event) => ({
        url: `${baseUrl}/${event.product_type === "NETWORKING" ? "networking-event" : "golf-outing"}/${event.public_url_slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];

    return sitemapEntries;
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
