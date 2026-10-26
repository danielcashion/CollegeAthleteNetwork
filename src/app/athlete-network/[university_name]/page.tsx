import type { Metadata } from "next";
import Link from "next/link";
import AthleteNetworkPageContent from "@/components/AthleteNetworkPage/AthleteNetworkPage";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import {
  getSportsForUniversity,
  getUniversityBySlug,
} from "@/lib/seo/athleteNetworkCache";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ university_name: string }>;
};

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

  const sports = await getSportsForUniversity(university.university_name);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: `${university.university_name} Athlete Network` },
        ]}
      />
      {sports.length > 0 ? (
        <section className="container mx-auto px-4 pb-6">
          <h2 className="text-lg font-semibold text-[#1C315F]">
            Teams in this network
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {sports.map(({ sport, sportSlug }) => (
              <li key={sportSlug}>
                <Link
                  href={`/athlete-network/${university.slug}/${sportSlug}`}
                  className="inline-block rounded-full border border-[#1C315F]/20 px-4 py-2 text-sm font-medium text-[#1C315F] hover:border-[#ED3237] hover:text-[#ED3237]"
                >
                  {sport}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <AthleteNetworkPageContent university={university} />
    </>
  );
}
