import type { Metadata } from "next";
import AthleteNetworkPageContent from "@/components/AthleteNetworkPage/AthleteNetworkPage";
import { redirect } from "next/navigation";

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
    }/publicprod/university_meta?university_name=${encodeURIComponent(
      slugToText(university_name)
    )}`,
    {
      next: { revalidate: 3600 },
    }
  );
  const arr: any = await res.json();

  const uni = Array.isArray(arr) && arr.length > 0 ? arr[0] : null;

  if (!uni) {
    return {
      title: `${university_name} Athletic Network`,
      description: `Explore ${university_name} athletes and professional opportunities!`,
    };
  }

  return {
    title: `${uni.university_name} Athlete Network | The College Athlete Network`,
    description: `Explore ${uni.university_name}'s athlete and alumni career network.`,
    openGraph: {
      title: `${uni.university_name} Athlete Network`,
      description: `Connect with ${uni.university_name} athletes and alumni.`,
      images: [uni.logo_url],
    },
  };
}

export default async function UniversityPage({ params }: Props) {
  const { university_name } = await params;

  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/publicprod/university_meta?university_name=${encodeURIComponent(
      slugToText(university_name)
    )}`
  );

  const arr: any = await res.json();

  const university = Array.isArray(arr) && arr.length > 0 ? arr[0] : null;

  if (!university) redirect("/404");

  return <AthleteNetworkPageContent university={university} />;
}
