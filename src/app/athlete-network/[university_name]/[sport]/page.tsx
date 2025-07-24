import type { Metadata } from "next";
import AthleteNetworkPageContentSport from "@/components/AthleteNetworkPage/AthleteNetworkPageSport";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ university_name: string; sport: string }>;
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
      images: [uni_sports.logo_url], // Logo is not currently there... it comes from `/university_meta`
    },
  };
}

export default async function universitySportsPage({ params }: Props) {
  const { university_name, sport } = await params;

  const decodedUni = slugToText(university_name);
  const decodedSport = slugToText(sport);

  const sportRes = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/publicprod/university_sport_seo?university_name=${encodeURIComponent(
      decodedUni
    )}`
  );

  const sportArrRaw: any = await sportRes.json();

  // parse the sport_details string into a JSON array
  const sportArr: any = sportArrRaw.map((item: any) => ({
    ...item,
    sport_details: JSON.parse(item.sport_details),
  }));

  const filteredSportArr = sportArr.filter(
    (item: any) => item.sport.toLowerCase() === decodedSport.toLowerCase()
  );

  if (filteredSportArr.length === 0) {
    redirect("/404");
  }
  return <AthleteNetworkPageContentSport sportData={filteredSportArr[0]} />;
}
