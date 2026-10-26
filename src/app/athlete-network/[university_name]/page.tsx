import type { Metadata } from "next";
import AthleteNetworkPageContent from "@/components/AthleteNetworkPage/AthleteNetworkPage";
import {
  getUniqueUniversityMeta,
  textToSlug,
} from "@/services/getUniqueUniversityMeta";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ university_name: string }>;
};

async function getUniversityBySlug(slug: string) {
  const normalizedSlug = textToSlug(decodeURIComponent(slug));
  const universities = await getUniqueUniversityMeta();
  return universities.find(
    (university: { slug: string }) => university.slug === normalizedSlug
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { university_name } = await params;
  const uni = await getUniversityBySlug(university_name);
  if (!uni) notFound();

  return {
    title: `${uni.university_name} ${uni.mascot} Athlete Network`,
    description: `Explore ${uni.university_name}'s athlete and alumni career network.`,
    alternates: {
      canonical: `/athlete-network/${uni.slug}`,
    },
    openGraph: {
      title: `${uni.university_name} ${uni.mascot} Athlete Network`,
      description: `Connect with ${uni.university_name} athletes and alumni.`,
      url: `/athlete-network/${uni.slug}`,
      images: uni.logo_url ? [uni.logo_url] : undefined,
    },
  };
}

export default async function UniversityPage({ params }: Props) {
  const { university_name } = await params;
  const university = await getUniversityBySlug(university_name);
  if (!university) notFound();

  return <AthleteNetworkPageContent university={university} />;
}
