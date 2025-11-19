import { getUniqueUniversityMeta } from "@/services/getUniqueUniversityMeta";
import { getUniversitySportsList } from "@/services/getUniversitySports";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await generateSitemap();
}

async function generateSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const universities = await getUniqueUniversityMeta();
    const sportsList = await getUniversitySportsList();

    const baseUrl = "https://www.collegeathletenetwork.org";

    const staticPages = [
      "about-us",
      "athlete-checklist",
      "communications",
      "contact-us",
      "corporate-partners",
      "data-transparency",
      "join-us",
      "privacy-policy",
      "sample-data",
      "terms-of-service",
    ];

    const sitemapEntries = [
      {
        url: baseUrl,
        changeFrequency: "daily",
        priority: 1,
      },

      // Static pages
      ...staticPages.map((path) => ({
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
