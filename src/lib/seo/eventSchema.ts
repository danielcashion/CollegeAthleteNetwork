import type { GolfOutingPublic } from "@/services/getGolfOutingPublic";
import { absoluteUrl } from "./site";
import { outingCalendarDate } from "@/components/GolfOutingPage/golfOutingDisplay";

export function eventPublicPath(event: GolfOutingPublic): string {
  const section =
    (event.product_type || "GOLF") === "NETWORKING"
      ? "networking-event"
      : "golf-outing";
  return `/${section}/${event.public_url_slug}`;
}

export function buildEventJsonLd(event: GolfOutingPublic) {
  const path = eventPublicPath(event);
  const date = outingCalendarDate(event.event_date);
  const locationParts = [
    event.venue_name,
    event.venue_address,
    event.venue_city,
    event.venue_state,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.event_name,
    description:
      event.description_html?.replace(/<[^>]+>/g, " ").slice(0, 500) ||
      `${event.university_name} ${(event.product_type || "GOLF") === "NETWORKING" ? "networking" : "golf"} event`,
    startDate: date ? `${date}T12:00:00-05:00` : undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: absoluteUrl(path),
    organizer: {
      "@type": "Organization",
      name: event.university_name,
    },
    ...(locationParts.length
      ? {
          location: {
            "@type": "Place",
            name: event.venue_name || undefined,
            address: {
              "@type": "PostalAddress",
              streetAddress: event.venue_address || undefined,
              addressLocality: event.venue_city || undefined,
              addressRegion: event.venue_state || undefined,
              addressCountry: "US",
            },
          },
        }
      : {}),
    ...(event.hero_image_url ? { image: [event.hero_image_url] } : {}),
  };
}

export function buildEventItemListJsonLd(
  events: GolfOutingPublic[],
  listName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(eventPublicPath(event)),
      name: event.event_name,
    })),
  };
}
