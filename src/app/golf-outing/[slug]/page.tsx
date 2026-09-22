import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import GolfAuctionPreview from "@/components/GolfOutingPage/GolfAuctionPreview";
import {
  formatCents,
  formatOutingDate,
  outingStatusLabel,
  venueLine,
} from "@/components/GolfOutingPage/golfOutingDisplay";
import {
  getPublicGolfOutingBySlug,
  listPublicAuctionItems,
  listPublicPackages,
  listPublicSponsors,
  listPublicTickets,
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab: tabParam } = await searchParams;
  const event = await getPublicGolfOutingBySlug(slug);
  if (!event) notFound();
  const [packages, tickets, sponsors, items] = await Promise.all([
    listPublicPackages(event.event_id),
    listPublicTickets(event.event_id),
    listPublicSponsors(event.event_id),
    listPublicAuctionItems(event.event_id),
  ]);
  const registrationOpen = event.event_status === "PUBLISHED";
  const showAuction = event.auction_enabled !== 0 || items.length > 0;
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "registration", label: "Registration" },
    ...(showAuction ? [{ id: "auction", label: "Auction" }] : []),
  ] as const;
  const requested = tabParam === "registration" || tabParam === "auction" ? tabParam : "overview";
  const tab = requested === "auction" && !showAuction ? "overview" : requested;

  return (
    <div className="min-h-screen bg-[#f9faf8]">
      <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-16 pt-28 text-white">
        <div className="container mx-auto px-4">
          <Link
            href="/golf-outings"
            className="mb-6 inline-block text-sm font-semibold uppercase tracking-wide text-white/80 hover:text-white"
          >
            ← All Golf Outings
          </Link>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            {event.university_name}
          </p>
          <h1 className="mb-4 max-w-4xl text-4xl font-bold md:text-5xl">{event.event_name}</h1>
          <p className="text-lg md:text-xl">
            {formatOutingDate(event.event_date, event.tz)}
            {event.play_format ? ` · ${event.play_format}` : ""}
            {event.event_format ? ` · ${event.event_format.toLowerCase()}` : ""}
          </p>
          <p className="mt-2 text-white/90">{venueLine(event)}</p>
          {event.venue_address && (
            <p className="text-sm text-white/70">
              {event.venue_address}
              {event.venue_city ? `, ${event.venue_city}` : ""}
              {event.venue_state ? ` ${event.venue_state}` : ""}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {registrationOpen ? (
              <Link
                href={`/golf-outing/${slug}?tab=registration`}
                className="rounded-full bg-white px-6 py-3 text-lg font-semibold text-[#1C315F] transition duration-200 hover:bg-[#1C315F] hover:text-white"
              >
                Register to play
              </Link>
            ) : (
              <span className="rounded-full bg-white/20 px-6 py-3 font-semibold">
                {outingStatusLabel(event.event_status)}
              </span>
            )}
            {event.sponsorships_enabled !== 0 && (
              <Link
                href={`/golf-outing/${slug}/sponsor`}
                className="rounded-full border border-white px-6 py-3 text-lg font-semibold transition duration-200 hover:bg-white hover:text-[#ED3237]"
              >
                Become a sponsor
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <nav
          className="relative z-10 -mt-7 flex flex-wrap gap-1 rounded-2xl bg-white p-2 shadow-md"
          aria-label="Outing sections"
        >
          {tabs.map((item) => {
            const href = item.id === "overview" ? `/golf-outing/${slug}` : `/golf-outing/${slug}?tab=${item.id}`;
            const active = tab === item.id;
            return (
              <Link
                key={item.id}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#1C315F] text-white shadow-sm"
                    : "text-[#1c315f]/70 hover:bg-[#f3f4f2] hover:text-[#1C315F]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <section className="container mx-auto space-y-10 px-4 py-14 text-[#1c315f]">
        {tab === "overview" && (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#1c315f]/60">Date</p>
                <p className="mt-2 text-lg font-bold">{formatOutingDate(event.event_date, event.tz)}</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#1c315f]/60">Venue</p>
                <p className="mt-2 text-lg font-bold">{event.venue_name || "Course TBA"}</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#1c315f]/60">Availability</p>
                <p className="mt-2 text-lg font-bold">
                  {event.remaining_spots != null ? `${event.remaining_spots} spots remaining` : outingStatusLabel(event.event_status)}
                </p>
              </div>
            </div>

            {event.description_html && (
              <div className="rounded-2xl bg-white p-8 shadow-md">
                <h2 className="mb-4 text-3xl font-bold">About this outing</h2>
                <div className="prose max-w-3xl text-[#1c315f]" dangerouslySetInnerHTML={{ __html: event.description_html }} />
              </div>
            )}

            {packages.length > 0 && (
              <div>
                <h2 className="mb-6 text-3xl font-bold">Sponsorship packages</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {packages.map((pkg) => (
                    <div key={pkg.sponsorship_type_id} className="flex flex-col rounded-2xl bg-white p-6 shadow-md">
                      <h3 className="text-xl font-bold">{pkg.sponsorship_name}</h3>
                      <p className="mt-2 text-3xl font-bold text-[#ED3237]">
                        {formatCents(pkg.unit_price_cents)}
                      </p>
                      <p className="mt-1 text-sm text-[#1c315f]/70">{pkg.inventory} available</p>
                      <ul className="mt-4 flex-1 space-y-2 text-sm">
                        {pkg.includes_foursome ? <li>Includes a foursome</li> : null}
                        {pkg.includes_teebox_signage ? <li>Tee-box signage</li> : null}
                        {pkg.includes_public_logo ? <li>Logo on this page</li> : null}
                      </ul>
                      {event.sponsorships_enabled !== 0 && (
                        <Link
                          href={`/golf-outing/${slug}/sponsor?package=${pkg.sponsorship_type_id}`}
                          className="mt-6 rounded-full bg-[#1C315F] px-4 py-2 text-center font-semibold text-white transition duration-200 hover:bg-[#ED3237]"
                        >
                          Select package
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sponsors.length > 0 && (
              <div className="rounded-2xl bg-white p-8 shadow-md">
                <h2 className="mb-6 text-3xl font-bold">Sponsors</h2>
                <div className="flex flex-wrap items-center gap-8">
                  {sponsors.map((sponsor) =>
                    sponsor.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={sponsor.sponsor_id}
                        src={sponsor.logo_url}
                        alt={sponsor.sponsor_name}
                        className="h-16 object-contain"
                      />
                    ) : (
                      <span key={sponsor.sponsor_id} className="font-semibold">
                        {sponsor.sponsor_name}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "registration" && (
          <div>
            <h2 className="mb-2 text-3xl font-bold">Registration</h2>
            <p className="mb-8 text-[#1c315f]/70">
              Choose a ticket to play in the outing. Checkout continues on the members site.
            </p>
            {tickets.length === 0 ? (
              <p className="rounded-2xl bg-white p-8 text-[#1c315f]/70 shadow-md">
                Registration options have not been published yet.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {tickets.map((ticket) => (
                  <div key={ticket.ticket_type_id} className="flex flex-col rounded-2xl bg-white p-6 shadow-md">
                    <h3 className="text-xl font-bold">{ticket.type_name}</h3>
                    <p className="mt-2 text-3xl font-bold text-[#ED3237]">{formatCents(ticket.unit_price_cents)}</p>
                    {ticket.inventory != null && (
                      <p className="mt-1 text-sm text-[#1c315f]/70">{ticket.inventory} available</p>
                    )}
                    {ticket.description_html && (
                      <div
                        className="prose mt-3 max-w-none text-sm text-[#1c315f]/70"
                        dangerouslySetInnerHTML={{ __html: ticket.description_html }}
                      />
                    )}
                    {registrationOpen && (
                      <Link
                        href={`/golf-outing/${slug}/register?ticket=${ticket.ticket_type_id}`}
                        className="mt-6 rounded-full bg-[#1C315F] px-4 py-2 text-center font-semibold text-white transition duration-200 hover:bg-[#ED3237]"
                      >
                        Select ticket
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "auction" && (
          <GolfAuctionPreview items={items} slug={slug} />
        )}
      </section>
    </div>
  );
}
