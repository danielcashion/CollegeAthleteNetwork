export function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

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

  return rawData.map(({ university_name, sport }) => ({
    university_name,
    sport: textToSlug(sport),
  }));
};
