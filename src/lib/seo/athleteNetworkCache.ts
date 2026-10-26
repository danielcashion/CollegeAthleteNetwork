import { cache } from "react";
import {
  getUniqueUniversityMeta,
  textToSlug,
} from "@/services/getUniqueUniversityMeta";

async function fetchSportsForUniversity(universityName: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/publicprod/university_sport_seo?university_name=${encodeURIComponent(universityName)}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const rows: { sport: string }[] = await res.json();
  const seen = new Set<string>();
  return rows.flatMap((row) => {
    const sportSlug = textToSlug(row.sport);
    if (seen.has(sportSlug)) return [];
    seen.add(sportSlug);
    return [{ sport: row.sport, sportSlug }];
  });
}

export const getUniversityBySlug = cache(async (slug: string) => {
  const normalizedSlug = textToSlug(decodeURIComponent(slug));
  const universities = await getUniqueUniversityMeta();
  return (
    universities.find(
      (university: { slug: string }) => university.slug === normalizedSlug
    ) ?? null
  );
});

export const getSportsForUniversity = cache(async (universityName: string) => {
  return fetchSportsForUniversity(universityName);
});

export const getSportBySlugs = cache(
  async (universitySlug: string, sportSlug: string) => {
    const normalizedUniversitySlug = textToSlug(
      decodeURIComponent(universitySlug)
    );
    const normalizedSportSlug = textToSlug(decodeURIComponent(sportSlug));
    const university = await getUniversityBySlug(normalizedUniversitySlug);
    if (!university) return null;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/publicprod/university_sport_seo?university_name=${encodeURIComponent(university.university_name)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;

    const rows: any[] = await res.json();
    const sportData = rows.find(
      (item) => textToSlug(item.sport) === normalizedSportSlug
    );
    if (!sportData) return null;

    try {
      return {
        ...sportData,
        university_slug: university.slug,
        sport_slug: normalizedSportSlug,
        sport_details:
          typeof sportData.sport_details === "string"
            ? JSON.parse(sportData.sport_details)
            : sportData.sport_details,
      };
    } catch {
      return null;
    }
  }
);
