import type { Metadata } from "next";
import AthleteNetworkPageContentSport from "@/components/AthleteNetworkPage/AthleteNetworkPageSport";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { getSportBySlugs } from "@/lib/seo/athleteNetworkCache";
import { athleteNetworkSportJsonLd } from "@/lib/seo/athleteNetworkSchema";
import JsonLd from "@/lib/seo/JsonLd";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ university_name: string; sport: string }>;
};

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

  return (
    <>
      <JsonLd
        data={athleteNetworkSportJsonLd({
          universityName: sportData.university_name,
          universitySlug: sportData.university_slug,
          sport: sportData.sport,
          sportSlug: sportData.sport_slug,
          logoUrl: sportData.logo_url,
        })}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Athlete networks by school", href: "/athlete-network" },
          {
            label: sportData.university_name,
            href: `/athlete-network/${sportData.university_slug}`,
          },
          { label: sportData.sport },
        ]}
      />
      <AthleteNetworkPageContentSport sportData={sportData} />
    </>
  );
}
