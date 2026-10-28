import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/lib/seo/JsonLd";
import { marketingMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, SITE_URL } from "@/lib/seo/site";
import { getUniqueUniversityMeta } from "@/services/getUniqueUniversityMeta";

export const revalidate = 3600;

export const metadata: Metadata = marketingMetadata({
  title: "Athlete Networks by School | The College Athlete Network",
  description:
    "Find your university's College Athlete Network hub—searchable alumni and student-athlete career networks for every partner school.",
  path: "/athlete-network",
  keywords:
    "college athlete network, university athlete network, alumni athlete network, college sports network",
});

export default async function AthleteNetworkDirectoryPage() {
  let universities: Awaited<ReturnType<typeof getUniqueUniversityMeta>> = [];
  try {
    universities = await getUniqueUniversityMeta();
  } catch (error) {
    console.error("Athlete network directory: university_meta failed", error);
  }

  const sorted = [...universities].sort((a, b) =>
    a.university_name.localeCompare(b.university_name, "en", { sensitivity: "base" })
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Athlete Networks by School",
    url: absoluteUrl("/athlete-network"),
    isPartOf: {
      "@type": "WebSite",
      name: "The College Athlete Network",
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: sorted.length,
      itemListElement: sorted.slice(0, 500).map((uni, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${uni.university_name} Athlete Network`,
        url: absoluteUrl(`/athlete-network/${uni.slug}`),
      })),
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-bold text-[#1C315F] sm:text-4xl">
            Athlete networks by school
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Each hub connects current and former student-athletes with alumni careers, mentorship, and
            opportunities—maintained by The College Athlete Network.
          </p>
        </header>
        <ul className="mt-12 columns-1 gap-x-10 sm:columns-2 lg:columns-3">
          {sorted.map((uni) => (
            <li key={uni.slug} className="mb-2 break-inside-avoid">
              <Link
                href={`/athlete-network/${uni.slug}`}
                className="font-medium text-[#1C315F] hover:text-[#ED3237] underline-offset-4 hover:underline"
              >
                {uni.university_name}
                {uni.mascot ? ` ${uni.mascot}` : ""} Athlete Network
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
