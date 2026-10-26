import type { Metadata } from "next";
import AthleteNetworkPageContentSport from "@/components/AthleteNetworkPage/AthleteNetworkPageSport";
import {
  getUniqueUniversityMeta,
  textToSlug,
} from "@/services/getUniqueUniversityMeta";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ university_name: string; sport: string }>;
};

async function getSportBySlugs(universitySlug: string, sportSlug: string) {
  const normalizedUniversitySlug = textToSlug(decodeURIComponent(universitySlug));
  const normalizedSportSlug = textToSlug(decodeURIComponent(sportSlug));
  const universities = await getUniqueUniversityMeta();
  const university = universities.find(
    (item: { slug: string }) => item.slug === normalizedUniversitySlug
  );

  if (!university) return null;

  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/publicprod/university_sport_seo?university_name=${encodeURIComponent(
      university.university_name
    )}`,
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { university_name, sport } = await params;
  const sportData = await getSportBySlugs(university_name, sport);
  if (!sportData) notFound();
  const canonicalPath = `/athlete-network/${sportData.university_slug}/${sportData.sport_slug}`;

  return {
    title: `${sportData.university_name} ${sportData.sport} Athlete Network`,
    description: `Explore ${sportData.university_name} ${sportData.sport} athletes, team information, and alumni career opportunities.`,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${sportData.university_name} ${sportData.sport} Athlete Network`,
      description: `Connect with ${sportData.university_name} ${sportData.sport} athletes and alumni.`,
      url: canonicalPath,
      images: sportData.logo_url ? [sportData.logo_url] : undefined,
    },
  };
}

export default async function UniversitySportsPage({ params }: Props) {
  const { university_name, sport } = await params;
  const sportData = await getSportBySlugs(university_name, sport);
  if (!sportData) notFound();

  return <AthleteNetworkPageContentSport sportData={sportData} />;
}
