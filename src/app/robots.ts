import type { MetadataRoute } from "next";

const baseUrl = "https://www.collegeathletenetwork.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/confirm", "/confirm/", "/t/"],
    },
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
