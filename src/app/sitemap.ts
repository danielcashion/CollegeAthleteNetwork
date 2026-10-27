import type { MetadataRoute } from "next";

import {
  buildCoreSitemap,
  buildEventsSitemap,
  buildSportsSitemap,
  buildUniversitySitemap,
  fetchEventsForSitemap,
  fetchSportsForSitemap,
  fetchUniversitiesForSitemap,
  minimalFallbackSitemap,
} from "@/lib/seo/sitemapHelpers";

export const revalidate = 3600;

export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];
}

export default async function sitemap(props: {
  id: Promise<number> | number;
}): Promise<MetadataRoute.Sitemap> {
  const id = typeof props.id === "number" ? props.id : await props.id;
  const siteLastMod = new Date();

  try {
    if (id === 0) {
      return buildCoreSitemap(siteLastMod);
    }

    if (id === 1) {
      const universities = await fetchUniversitiesForSitemap();
      if (!universities.length) return minimalFallbackSitemap();
      return buildUniversitySitemap(universities, siteLastMod);
    }

    if (id === 2) {
      const [universities, sportsList] = await Promise.all([
        fetchUniversitiesForSitemap(),
        fetchSportsForSitemap(),
      ]);
      if (!sportsList.length) return [];
      return buildSportsSitemap(universities, sportsList, siteLastMod);
    }

    if (id === 3) {
      const publishedEvents = await fetchEventsForSitemap();
      if (!publishedEvents.length) return [];
      return buildEventsSitemap(publishedEvents, siteLastMod);
    }

    return minimalFallbackSitemap();
  } catch (error) {
    console.error(`Sitemap segment ${id} failed:`, error);
    return id === 0 ? minimalFallbackSitemap() : [];
  }
}
