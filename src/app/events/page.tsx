import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedPublicEvents } from "@/services/getGolfOutingPublic";
import { formatOutingDate } from "@/components/GolfOutingPage/golfOutingDisplay";
import {
  buildEventItemListJsonLd,
  eventPublicPath,
} from "@/lib/seo/eventSchema";
import JsonLd from "@/lib/seo/JsonLd";
import { marketingMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export const metadata: Metadata = marketingMetadata({
  title: "College Athletic Events Directory",
  description:
    "Find published golf outings and networking events hosted by college athletic departments on The College Athlete Network.",
  path: "/events",
  keywords:
    "college golf outing, athletic department networking event, university fundraiser, alumni golf tournament",
});

type Props = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

export default async function EventsDirectoryPage({ searchParams }: Props) {
  const { q, type } = await searchParams;
  const query = (q || "").trim().toLowerCase();
  const typeFilter =
    type === "golf" || type === "networking" ? type : undefined;

  let events = await listPublishedPublicEvents({ fresh: false });

  if (typeFilter === "golf") {
    events = events.filter((e) => (e.product_type || "GOLF") === "GOLF");
  } else if (typeFilter === "networking") {
    events = events.filter((e) => e.product_type === "NETWORKING");
  }

  if (query) {
    events = events.filter((event) => {
      const haystack = `${event.event_name} ${event.university_name} ${event.venue_name || ""} ${event.venue_city || ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  events = [...events].sort((a, b) =>
    String(a.event_date).localeCompare(String(b.event_date))
  );

  return (
    <div className="min-h-screen bg-[#f9faf8]">
      <JsonLd
        data={buildEventItemListJsonLd(
          events,
          "College athletic events on The College Athlete Network"
        )}
      />
      <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-16 pt-28 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Events directory</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Search published golf outings and networking dinners hosted by college
            athletic departments.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <form method="get" className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="q"
            defaultValue={q || ""}
            placeholder="Search by event, school, or venue…"
            className="flex-1 rounded-full border border-[#1C315F]/20 px-5 py-3 text-[#1C315F]"
            aria-label="Search events"
          />
          <select
            name="type"
            defaultValue={typeFilter || ""}
            className="rounded-full border border-[#1C315F]/20 px-4 py-3 text-[#1C315F]"
            aria-label="Event type"
          >
            <option value="">All event types</option>
            <option value="golf">Golf outings</option>
            <option value="networking">Networking events</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-[#1C315F] px-6 py-3 font-semibold text-white hover:bg-[#ED3237]"
          >
            Search
          </button>
        </form>

        <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-[#1C315F]/70">
          {events.length} published event{events.length === 1 ? "" : "s"}
          {query ? ` matching “${q}”` : ""}.
        </p>

        <ul className="mx-auto mt-8 grid max-w-4xl gap-4">
          {events.map((event) => (
            <li key={event.event_id}>
              <Link
                href={eventPublicPath(event)}
                className="block rounded-2xl border border-[#1C315F]/10 bg-white p-5 shadow-sm transition hover:border-[#ED3237]/40 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[#1C315F]/60">
                  {event.university_name} ·{" "}
                  {(event.product_type || "GOLF") === "NETWORKING"
                    ? "Networking"
                    : "Golf outing"}
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#1C315F]">
                  {event.event_name}
                </h2>
                <p className="mt-2 text-sm text-[#1C315F]/70">
                  {formatOutingDate(event.event_date, event.tz)}
                  {event.venue_name ? ` · ${event.venue_name}` : ""}
                  {event.venue_city ? `, ${event.venue_city}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {events.length === 0 ? (
          <p className="mt-10 text-center text-[#1C315F]/70">
            No published events match your search. Try a different keyword or browse{" "}
            <Link href="/golf-outings" className="text-[#ED3237] underline">
              golf outings
            </Link>{" "}
            and{" "}
            <Link href="/networking-events" className="text-[#ED3237] underline">
              networking events
            </Link>
            .
          </p>
        ) : null}
      </section>
    </div>
  );
}
