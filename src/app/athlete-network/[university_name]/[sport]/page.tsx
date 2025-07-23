// /app/[uni_sportsversity]/[sport]/page.tsx
import type { Metadata } from "next";
import AthleteNetworkPageContentSport from "@/components/AthleteNetworkPage/AthleteNetworkPageSport";
// TODO: modify the new above component To Handle Individual Sports
import { redirect } from "next/navigation";

// 1. Get Data from the `/university_teams` endpoint
// -> university_name, team_name, url, gender_id (1 = Mens, 2 = Womens), url (for the team), sponsor, sponsor_logo_url will be used to generate the page
// 2. Get distinct combination of uni_sportsversity and sport, as each uni_sportsque sport will have its own page. (if there are basketball teams for both men and women, they will have the same sport page but different teams)
// 3. Should include the URLs for Mens & Womens teams, but in the same way we did them before (not as a link that invites users to leave our page, but as a searchable link for google).

type Props = {
  params: Promise<{ university_name: string }>;
};

function slugToText(slug: string) {
  const decoded = decodeURIComponent(slug);
  let text = decoded.replace(/-/g, " ");

  text = text.replace(/\band\b/g, "&");
  return text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { university_name } = await params;

  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/publicprod/university_teams?university_name=${encodeURIComponent(
      slugToText(university_name)
    )}`,
    {
      next: { revalidate: 3600 },
    }
  );
  const arr: any = await res.json();

  const uni_sports = Array.isArray(arr) && arr.length > 0 ? arr[0] : null;

  if (!uni_sports) {
    return {
      title: `${uni_sports.university_name} ${uni_sports.team_name} Athlete Network | Connecting Students & Alumni`,
      description: `Explore ${uni_sports.university_name} ${uni_sports.team_name} athletes and professional opportunities!`,
    };
  }

  return {
    title: `${uni_sports.university_name} ${uni_sports.team_name} Athlete Network | The College Athlete Network`,
    description: `Explore ${uni_sports.university_name}'s athlete and alumni career network.`,
    openGraph: {
      title: `${uni_sports.university_name} ${uni_sports.team_name} Athlete Network`,
      description: `Connect with ${uni_sports.university_name} ${uni_sports.team_name} athletes and alumni.`,
      images: [uni_sports.logo_url],  // Logo is not currently there... it comes from `/university_meta`
    },
  };
}

export default async function universitySportsPage({ params }: Props) {
  const { university_name } = await params;

  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/publicprod/university_teams?university_name=${encodeURIComponent(     // API ENDPOINT WILL CHANGE... Dan currently writing it.
      slugToText(university_name)
    )}`
  );

  const arr: any = await res.json();

  const university = Array.isArray(arr) && arr.length > 0 ? arr[0] : null;

  if (!university) redirect("/404");

  return <AthleteNetworkPageContentSport university={university} />;
}
