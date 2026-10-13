import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
  listPublicPackages,
  listPublicSponsors,
  listPublicTickets,
  type GolfPackagePublic,
  type GolfSponsorPublic,
} from "@/services/getGolfOutingPublic";

export const dynamic = "force-dynamic";

function packageLines(pkg: GolfPackagePublic): string[] {
  const lines = [
    pkg.package_role === "TITLE" ? "Named in the event headline" : "",
    pkg.package_role === "COCKTAIL" ? "Cocktail hour sponsorship" : "",
    pkg.package_role === "ATHLETE" ? "Sponsor student athletes. Choose a quantity at checkout." : "",
    pkg.includes_public_logo ? "Logo on this page" : "",
  ];
  return lines.filter(Boolean);
}

function titleLine(eventName: string, sponsors: GolfSponsorPublic[], packages: GolfPackagePublic[]) {
  const names = sponsors
    .filter((sponsor) => packages.some((pkg) => pkg.sponsorship_type_id === sponsor.package_id && pkg.package_role === "TITLE"))
    .map((sponsor) => sponsor.sponsor_name);
  if (!names.length) return null;
  return `${eventName}, Sponsored by ${names.join(" and ")}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicGolfOutingBySlug(slug, "NETWORKING");
  if (!event) return { title: "Networking event" };
  return {
    title: event.event_name,
    description: `${event.university_name} networking event`,
  };
}

export default async function NetworkingEventPublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab: tabParam } = await searchParams;
  const event = await getPublicGolfOutingBySlug(slug, "NETWORKING");
  if (!event) notFound();
  const [packages, tickets, sponsors] = await Promise.all([
    listPublicPackages(event.event_id),
    listPublicTickets(event.event_id),
    listPublicSponsors(event.event_id),
  ]);
  const registrationOpen = event.event_status === "PUBLISHED";
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "registration", label: "Registration" },
  ] as const;
  const tab = tabParam === "registration" ? "registration" : "overview";
  const headline = titleLine(event.event_name, sponsors, packages);

  return (
    <div className="min-h-screen bg-[#f9faf8]">
      <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-16 pt-28 text-white">
        <div className="container mx-auto px-4">
          <Link
            href="/networking-events"
            className="mb-6 inline-block text-sm font-semibold uppercase tracking-wide text-white/80 hover:text-white"
          >
            ← Networking Events
          </Link>
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{event.university_name}</p>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">{event.event_name}</h1>
            {headline ? <p className="mb-3 text-xl font-semibold">{headline}</p> : null}
            <p className="text-lg md:text-xl">{formatOutingDate(event.event_date, event.tz)}</p>
            <p className="mt-2 text-white/90">{venueLine(event)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {registrationOpen ? (
                <Link
                  href={`/networking-event/${slug}?tab=registration`}
                  className="rounded-full bg-white px-6 py-3 text-lg font-semibold text-[#1C315F] transition duration-200 hover:bg-[#1C315F] hover:text-white"
                >
                  Register For The Event
                </Link>
              ) : (
                <span className="rounded-full bg-white/20 px-6 py-3 font-semibold">{outingStatusLabel(event.event_status)}</span>
              )}
              {event.sponsorships_enabled !== 0 && (
                <Link
                  href={`/networking-event/${slug}/sponsor`}
                  className="rounded-full border border-white px-6 py-3 text-lg font-semibold transition duration-200 hover:bg-white hover:text-[#ED3237]"
                >
                  Become a Sponsor
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-4 px-4">
        {sponsors.length > 0 ? (
          <div className="relative z-10 -mt-8">
            <GolfSponsorCarousel sponsors={sponsors} />
          </div>
        ) : null}
        <nav
          className={`relative z-10 flex flex-wrap items-center gap-1 rounded-2xl bg-white p-2 shadow-md ${sponsors.length > 0 ? "" : "-mt-7"}`}
          aria-label="Event sections"
        >
          {tabs.map((item) => {
            const href = item.id === "overview" ? `/networking-event/${slug}` : `/networking-event/${slug}?tab=registration`;
            const active = tab === item.id;
            return (
              <Link
                key={item.id}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                  active ? "bg-[#1C315F] text-white shadow-sm" : "text-[#1c315f]/70 hover:bg-[#f3f4f2] hover:text-[#1C315F]"
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
                <p className="mt-2 text-lg font-bold">{event.venue_name || "Venue TBA"}</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#1c315f]/60">Availability</p>
                <p className="mt-2 text-lg font-bold">
                  {event.remaining_spots != null ? `${event.remaining_spots} spots remaining` : outingStatusLabel(event.event_status)}
                </p>
              </div>
            </div>
            {event.description_html ? (
              <div className="rounded-2xl bg-white p-8 shadow-md">
                <h2 className="mb-4 text-3xl font-bold">About this event</h2>
                <div className="prose max-w-3xl text-[#1c315f]" dangerouslySetInnerHTML={{ __html: event.description_html }} />
              </div>
            ) : null}
          </>
        )}

        {tab === "registration" && (
          <div className="space-y-12">
            <div>
              <h2 className="mb-2 text-3xl font-bold">Registration</h2>
              <p className="mb-6 text-[#1c315f]/70">Choose a ticket. Checkout as a guest with PayPal, a debit or credit card, or Venmo.</p>
              {tickets.length === 0 ? (
                <p className="rounded-2xl bg-white p-8 text-[#1c315f]/70 shadow-md">Registration options have not been published yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
                  {tickets.map((ticket) => (
                    <div key={ticket.ticket_type_id} className="flex flex-col rounded-2xl bg-white p-5 shadow-md">
                      <h3 className="text-lg font-bold">{ticket.type_name}</h3>
                      <p className="mt-2 text-2xl font-bold text-[#ED3237]">{formatCents(ticket.unit_price_cents)}</p>
                      {ticket.description_html ? (
                        <div
                          className="prose mt-3 max-w-none text-sm text-[#1c315f]/70"
                          dangerouslySetInnerHTML={{ __html: ticket.description_html }}
                        />
                      ) : null}
                      {registrationOpen ? (
                        <Link
                          href={`/networking-event/${slug}/register?ticket=${ticket.ticket_type_id}`}
                          className="mt-5 rounded-full bg-[#1C315F] px-4 py-2 text-center text-sm font-semibold text-white transition duration-200 hover:bg-[#ED3237]"
                        >
                          Select
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(packages.length > 0 || event.sponsorships_enabled !== 0) && (
              <div>
                <h2 className="mb-2 text-3xl font-bold">Sponsorship</h2>
                <p className="mb-6 text-[#1c315f]/70">Support the event. Current sponsor logos appear in the banner above.</p>
                {packages.length === 0 ? (
                  <p className="rounded-2xl bg-white p-8 text-[#1c315f]/70 shadow-md">Sponsorship packages have not been published yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
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
                          <p className="mt-1 text-sm text-[#1c315f]/70">{soldOut ? "Sold out" : `${remaining} available`}</p>
                          <ul className="mt-4 flex-1 space-y-1 text-sm">
                            {packageLines(pkg).map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                          {event.sponsorships_enabled !== 0 && !soldOut ? (
                            <Link
                              href={`/networking-event/${slug}/sponsor?package=${pkg.sponsorship_type_id}`}
                              className="mt-5 rounded-full bg-[#1C315F] px-4 py-2 text-center text-sm font-semibold text-white transition duration-200 hover:bg-[#ED3237]"
                            >
                              Select package
                            </Link>
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
      </section>
    </div>
  );
}
