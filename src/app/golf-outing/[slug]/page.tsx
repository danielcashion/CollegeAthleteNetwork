import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import GolfAuctionPreview from "@/components/GolfOutingPage/GolfAuctionPreview";
import {
  getPublicGolfOutingBySlug,
  listPublicAuctionItems,
  listPublicPackages,
  listPublicSponsors,
} from "@/services/getGolfOutingPublic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicGolfOutingBySlug(slug);
  if (!event) return { title: "Golf outing" };
  return {
    title: event.event_name,
    description: `${event.university_name} golf outing at ${event.venue_name || "the course"}`,
    openGraph: {
      title: event.event_name,
      description: `${event.university_name} · ${event.venue_name || ""}`,
      images: event.hero_image_url ? [event.hero_image_url] : undefined,
    },
  };
}

export default async function GolfOutingPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublicGolfOutingBySlug(slug);
  if (!event) notFound();
  const [packages, sponsors, items] = await Promise.all([
    listPublicPackages(event.event_id),
    listPublicSponsors(event.event_id),
    listPublicAuctionItems(event.event_id),
  ]);
  const registrationOpen = event.event_status === "PUBLISHED";

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-16 pt-28 text-white">
        <div className="container mx-auto px-4">
          <p className="mb-2 uppercase tracking-wide">{event.university_name}</p>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{event.event_name}</h1>
          <p className="text-lg">
            {String(event.event_date).slice(0, 10)} · {event.play_format || "golf"} · {event.event_format}
          </p>
          <p>
            {event.venue_name}
            {event.venue_address ? ` · ${event.venue_address}` : ""}
            {event.venue_city ? `, ${event.venue_city}` : ""} {event.venue_state}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {registrationOpen ? (
              <Link href={`/golf-outing/${slug}/register`} className="rounded-full bg-white px-5 py-3 font-semibold text-[#1c315f]">
                Register
              </Link>
            ) : (
              <span className="rounded-full bg-white/20 px-5 py-3">Registration closed</span>
            )}
            {event.sponsorships_enabled !== 0 && (
              <Link href={`/golf-outing/${slug}/sponsor`} className="rounded-full border border-white px-5 py-3 font-semibold">
                Become a sponsor
              </Link>
            )}
          </div>
        </div>
      </section>
      <section className="container mx-auto space-y-12 px-4 py-12 text-[#1c315f]">
        {event.description_html && (
          <div className="prose max-w-3xl" dangerouslySetInnerHTML={{ __html: event.description_html }} />
        )}
        {event.remaining_spots != null && <p>{event.remaining_spots} golfer spots remaining.</p>}
        {packages.length > 0 && (
          <div>
            <h2 className="mb-4 text-3xl font-bold">Sponsorship packages</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {packages.map((pkg) => (
                <div key={pkg.sponsorship_type_id} className="rounded-lg border bg-white p-4">
                  <h3 className="text-xl font-semibold">{pkg.sponsorship_name}</h3>
                  <p className="text-2xl">${(pkg.unit_price_cents / 100).toFixed(0)}</p>
                  <p className="text-sm text-gray-600">{pkg.inventory} available</p>
                  <p className="mt-2 text-sm">
                    {pkg.includes_foursome ? "Includes a foursome. " : ""}
                    {pkg.includes_teebox_signage ? "Tee-box signage. " : ""}
                    {pkg.includes_public_logo ? "Logo on this page." : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {sponsors.length > 0 && (
          <div>
            <h2 className="mb-4 text-3xl font-bold">Sponsors</h2>
            <div className="flex flex-wrap items-center gap-6">
              {sponsors.map((sponsor) =>
                sponsor.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={sponsor.sponsor_id} src={sponsor.logo_url} alt={sponsor.sponsor_name} className="h-14" />
                ) : (
                  <span key={sponsor.sponsor_id} className="font-medium">{sponsor.sponsor_name}</span>
                )
              )}
            </div>
          </div>
        )}
        <GolfAuctionPreview items={items} slug={slug} />
      </section>
    </div>
  );
}
