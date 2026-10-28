import { textToSlug } from "@/lib/seo/slug";

export { textToSlug } from "@/lib/seo/slug";

export interface UniversitySportRaw {
  university_name: string;
  sport: string;
}

export interface UniversitySportSlug {
  university_name: string;
  sport: string;
}

export const getUniversitySportsList = async (): Promise<
  UniversitySportSlug[]
> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/publicprod/university_sport_seo`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch university sports: ${res.status}`);
  }

  const rawData: UniversitySportRaw[] = await res.json();
  const seen = new Set<string>();

  return rawData.flatMap(({ university_name, sport }) => {
    const sportSlug = textToSlug(sport);
    const key = `${university_name}\0${sportSlug}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ university_name, sport: sportSlug }];
  });
};
