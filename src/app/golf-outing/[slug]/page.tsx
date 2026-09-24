import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import GolfAuctionPreview from "@/components/GolfOutingPage/GolfAuctionPreview";
import GolfSponsorCarousel from "@/components/GolfOutingPage/GolfSponsorCarousel";
import {
  formatCents,
  formatOutingDate,
  outingStatusLabel,
  packageAccent,
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
          <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                {event.university_name}
              </p>
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">{event.event_name}</h1>
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
                    Register For The Event
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
                    Become a Sponsor
                  </Link>
                )}
              </div>
            </div>
            {sponsors.length > 0 && (
              <div className="rounded-2xl border border-white/25 bg-white/95 p-4 text-[#1C315F] shadow-lg">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1C315F]/60">
                  Event Sponsors
                </p>
                <GolfSponsorCarousel sponsors={sponsors} />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <nav
          className="relative z-10 -mt-7 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-2 shadow-md"
          aria-label="Outing sections"
        >
          <div className="flex shrink-0 flex-wrap gap-1">
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
          </div>
          {sponsors.length > 0 && <GolfSponsorCarousel sponsors={sponsors} />}
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
          </>
        )}

        {tab === "registration" && (
          <div className="space-y-12">
            <div>
              <h2 className="mb-2 text-3xl font-bold">Registration</h2>
              <p className="mb-6 text-[#1c315f]/70">
                Choose a ticket to play in the outing. Checkout as a guest with PayPal, a debit or credit card, or Venmo.
              </p>
              {tickets.length === 0 ? (
                <p className="rounded-2xl bg-white p-8 text-[#1c315f]/70 shadow-md">
                  Registration options have not been published yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-4xl">
                  {tickets.map((ticket) => (
                    <div key={ticket.ticket_type_id} className="flex flex-col rounded-2xl bg-white p-5 shadow-md">
                      <h3 className="text-lg font-bold">{ticket.type_name}</h3>
                      <p className="mt-2 text-2xl font-bold text-[#ED3237]">{formatCents(ticket.unit_price_cents)}</p>
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
                          className="mt-5 rounded-full bg-[#1C315F] px-4 py-2 text-center text-sm font-semibold text-white transition duration-200 hover:bg-[#ED3237]"
                        >
                          Select
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(packages.length > 0 || event.sponsorships_enabled !== 0) && (
              <div>
                <h2 className="mb-2 text-3xl font-bold">Sponsorship</h2>
                <p className="mb-6 text-[#1c315f]/70">
                  Support the outing with a package. Current sponsor logos appear next to the event name above.
                </p>
                {packages.length === 0 ? (
                  <p className="rounded-2xl bg-white p-8 text-[#1c315f]/70 shadow-md">
                    Sponsorship packages have not been published yet.
                    {event.contact_email ? ` Contact ${event.contact_email} for details.` : ""}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-4xl">
                    {packages.map((pkg) => {
                      const remaining = pkg.remaining_qty != null ? Number(pkg.remaining_qty) : Number(pkg.inventory ?? 0);
                      const soldOut = remaining <= 0;
                      return (
                      <div
                        key={pkg.sponsorship_type_id}
                        className={`flex flex-col rounded-2xl bg-white p-5 shadow-md ${soldOut ? "opacity-70" : ""}`}
                        style={{ borderLeftWidth: 4, borderLeftColor: packageAccent(pkg.sponsorship_name) }}
                      >
                        <h3 className="text-lg font-bold">{pkg.sponsorship_name}</h3>
                        <p className="mt-2 text-2xl font-bold text-[#ED3237]">{formatCents(pkg.unit_price_cents)}</p>
                        <p className="mt-1 text-sm text-[#1c315f]/70">
                          {soldOut ? "Sold out" : `${remaining} available`}
                        </p>
                        <ul className="mt-4 flex-1 space-y-1 text-sm">
                          {pkg.includes_foursome ? <li>Includes a foursome</li> : null}
                          {pkg.includes_teebox_signage ? <li>Tee-box signage</li> : null}
                          {pkg.includes_longest_drive ? <li>Longest drive contest</li> : null}
                          {pkg.includes_closest_to_pin ? <li>Closest to the pin contest</li> : null}
                          {pkg.includes_public_logo ? <li>Logo on this page</li> : null}
                        </ul>
                        {event.sponsorships_enabled !== 0 && !soldOut ? (
                          <Link
                            href={`/golf-outing/${slug}/sponsor?package=${pkg.sponsorship_type_id}`}
                            className="mt-5 rounded-full bg-[#1C315F] px-4 py-2 text-center text-sm font-semibold text-white transition duration-200 hover:bg-[#ED3237]"
                          >
                            Select package
                          </Link>
                        ) : soldOut ? (
                          <p className="mt-5 rounded-full bg-gray-100 px-4 py-2 text-center text-sm font-semibold text-gray-500">
                            Sold out
                          </p>
                        ) : null}
                      </div>
                      );
                    })}
                  </div>
                )}
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
