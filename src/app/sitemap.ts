import { getUniqueUniversityMeta } from "@/services/getUniqueUniversityMeta";

export default function sitemap() {
  return generateSitemap();
}

async function generateSitemap() {
  try {
    const universities = await getUniqueUniversityMeta();

    const baseUrl = "https://www.collegeathletenetwork.org";

    const sitemapEntries = [
      {
        url: baseUrl,
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/athlete-network`,
        changeFrequency: "daily",
        priority: 0.8,
      },

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
