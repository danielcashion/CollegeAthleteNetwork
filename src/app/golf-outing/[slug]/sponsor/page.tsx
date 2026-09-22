import Link from "next/link";
import { notFound } from "next/navigation";
import GolfSponsorForm from "@/components/GolfOutingPage/GolfSponsorForm";
import { formatOutingDate, venueLine } from "@/components/GolfOutingPage/golfOutingDisplay";
import { getPublicGolfOutingBySlug, listPublicPackages } from "@/services/getGolfOutingPublic";

export default async function PublicGolfSponsorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ package?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const event = await getPublicGolfOutingBySlug(slug);
  if (!event) notFound();
  const packages = await listPublicPackages(event.event_id);
  const initialPackageId = Number(query.package) || undefined;

  return (
    <div className="min-h-screen bg-[#f9faf8]">
      <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-12 pt-28 text-white">
        <div className="container mx-auto px-4">
          <Link href={`/golf-outing/${slug}`} className="mb-4 inline-block text-sm font-semibold text-white/80 hover:text-white">
            ← Back to outing
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{event.university_name}</p>
          <h1 className="mb-2 mt-2 text-4xl font-bold">Become a sponsor</h1>
          <p className="text-lg">{event.event_name}</p>
          <p className="mt-1 text-white/80">
            {formatOutingDate(event.event_date, event.tz)} · {venueLine(event)}
          </p>
        </div>
      </section>
      <div className="container mx-auto px-4 py-12">
        <GolfSponsorForm event={event} packages={packages} initialPackageId={initialPackageId} />
      </div>
    </div>
  );
}
