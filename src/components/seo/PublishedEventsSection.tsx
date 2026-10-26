import Link from "next/link";
import type { GolfOutingPublic } from "@/services/getGolfOutingPublic";
import { formatOutingDate } from "@/components/GolfOutingPage/golfOutingDisplay";
import { buildEventItemListJsonLd, eventPublicPath } from "@/lib/seo/eventSchema";
import JsonLd from "@/lib/seo/JsonLd";

type Props = {
  events: GolfOutingPublic[];
  productType: "GOLF" | "NETWORKING";
  title: string;
  description: string;
  listJsonLdName: string;
};

export default function PublishedEventsSection({
  events,
  productType,
  title,
  description,
  listJsonLdName,
}: Props) {
  const filtered = events
    .filter((e) => (e.product_type || "GOLF") === productType)
    .sort((a, b) => String(a.event_date).localeCompare(String(b.event_date)));

  if (filtered.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      <JsonLd data={buildEventItemListJsonLd(filtered, listJsonLdName)} />
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
          Discover events
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[#1C315F] md:text-4xl">{title}</h2>
        <p className="mt-4 text-lg text-[#1C315F]/75">{description}</p>
        <p className="mt-3 text-sm text-[#1C315F]/60">
          Browse all published events on our{" "}
          <Link href="/events" className="font-semibold text-[#ED3237] underline">
            events directory
          </Link>
          .
        </p>
      </div>
      <ul className="mx-auto mt-10 grid max-w-4xl gap-4">
        {filtered.map((event) => (
          <li key={event.event_id}>
            <Link
              href={eventPublicPath(event)}
              className="block rounded-2xl border border-[#1C315F]/10 bg-white p-5 shadow-sm transition hover:border-[#ED3237]/40 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#1C315F]/60">
                {event.university_name}
              </p>
              <h3 className="mt-1 text-xl font-bold text-[#1C315F]">{event.event_name}</h3>
              <p className="mt-2 text-sm text-[#1C315F]/70">
                {formatOutingDate(event.event_date, event.tz)}
                {event.venue_name ? ` · ${event.venue_name}` : ""}
                {event.venue_city ? `, ${event.venue_city}` : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
