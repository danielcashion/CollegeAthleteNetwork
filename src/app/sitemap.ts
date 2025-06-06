import { getUniqueUniversityMeta } from "@/services/getUniqueUniversityMeta";

export default function sitemap() {
  return generateSitemap();
}

async function generateSitemap() {
  try {
    const universities = await getUniqueUniversityMeta();
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
