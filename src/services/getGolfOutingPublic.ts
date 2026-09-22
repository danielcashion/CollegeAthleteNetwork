const PUBLIC_API = () => `${process.env.NEXT_PUBLIC_API_URL}/publicprod`;

export type GolfOutingPublic = {
  event_id: string;
  university_name: string;
  event_name: string;
  description_html?: string | null;
  event_date: string;
  tz: string;
  event_format?: string;
  play_format?: string | null;
  event_status: string;
  capacity_golfers?: number | null;
  max_teams?: number | null;
  venue_name?: string | null;
  venue_address?: string | null;
  venue_city?: string | null;
  venue_state?: string | null;
  hero_image_url?: string | null;
  logo_url?: string | null;
  public_url_slug: string;
  contact_email?: string | null;
  registration_opens_at?: string | null;
  registration_closes_at?: string | null;
  currency?: string;
  remaining_spots?: number | null;
  auction_enabled?: number;
  sponsorships_enabled?: number;
  registration_type?: "INDIVIDUAL" | "TEAM" | "BOTH";
};

export type GolfTicketPublic = {
  ticket_type_id: number;
  event_id: string;
  type_name: string;
  description_html?: string | null;
  unit_price_cents: number;
  fmv_cents?: number;
  inventory?: number | null;
  ticket_type_status: string;
};

export type GolfPackagePublic = {
  sponsorship_type_id: number;
  event_id: string;
  sponsorship_name: string;
  description_html?: string | null;
  unit_price_cents: number;
  inventory: number;
  includes_foursome: number;
  includes_teebox_signage: number;
  includes_public_logo: number;
  sponsorship_status: string;
};

export type GolfSponsorPublic = {
  sponsor_id: number;
  event_id: string;
  package_id: number;
  sponsor_name: string;
  logo_url?: string | null;
  public_display_YN?: number;
  payment_status: string;
};

export type GolfAuctionPublic = {
  auction_item_id: number;
  event_id: string;
  title: string;
  description_html?: string | null;
  photo_urls?: string[] | string | null;
  fmv_cents?: number;
  starting_bid_cents: number;
  min_increment_cents?: number;
  closes_at: string;
  item_status: string;
  high_bid_cents?: number | null;
};

function unwrap<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { resource?: unknown }).resource)) {
    return (data as { resource: T[] }).resource;
  }
  if (data) return [data as T];
  return [];
}

async function publicGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T[]> {
  const url = new URL(`${PUBLIC_API()}/${path}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return unwrap<T>(await res.json());
}

export async function listPublicGolfOutings(filters?: {
  university_name?: string;
  q?: string;
  date_from?: string;
  date_to?: string;
}): Promise<GolfOutingPublic[]> {
  const rows = await publicGet<GolfOutingPublic>("v_golf_outings_public");
  return rows.filter((row) => {
    if (!["PUBLISHED", "SOLD_OUT", "REGISTRATION_CLOSED", "COMPLETED"].includes(row.event_status)) {
      return false;
    }
    if (filters?.university_name && row.university_name.toLowerCase() !== filters.university_name.toLowerCase()) {
      return false;
    }
    if (filters?.q && !`${row.event_name} ${row.venue_name || ""}`.toLowerCase().includes(filters.q.toLowerCase())) {
      return false;
    }
    const date = String(row.event_date).slice(0, 10);
    if (filters?.date_from && date < filters.date_from) return false;
    if (filters?.date_to && date > filters.date_to) return false;
    return true;
  });
}

export async function getPublicGolfOutingBySlug(slug: string): Promise<GolfOutingPublic | null> {
  const rows = await publicGet<GolfOutingPublic>("v_golf_outings_public", { public_url_slug: slug });
  return rows.find((row) => row.public_url_slug === slug) ?? null;
}

export async function listPublicTickets(event_id: string): Promise<GolfTicketPublic[]> {
  const rows = await publicGet<GolfTicketPublic>("golf_ticket_types", { event_id });
  return rows.filter((row) => row.ticket_type_status === "ACTIVE");
}

export async function listPublicPackages(event_id: string): Promise<GolfPackagePublic[]> {
  const rows = await publicGet<GolfPackagePublic>("golf_sponsorship_types", { event_id });
  return rows.filter((row) => row.sponsorship_status === "ACTIVE");
}

export async function listPublicSponsors(event_id: string): Promise<GolfSponsorPublic[]> {
  const rows = await publicGet<GolfSponsorPublic>("golf_sponsors", { event_id });
  return rows.filter((row) => (row.payment_status === "PAID" || row.payment_status === "COMP") && row.public_display_YN);
}

export async function listPublicAuctionItems(event_id: string): Promise<GolfAuctionPublic[]> {
  const fromView = await publicGet<GolfAuctionPublic>("v_golf_auction_public", { event_id });
  if (fromView.length > 0) return fromView.filter((row) => row.event_id === event_id);
  const fallback = await publicGet<GolfAuctionPublic>("golf_auction_items", { event_id });
  return fallback.filter((row) => row.event_id === event_id && ["LIVE", "ENDED"].includes(row.item_status));
}

export async function callPublicGolfProc<T = Record<string, unknown>>(
  name: string,
  member_id: string,
  query: Record<string, unknown>
): Promise<T> {
  if (!member_id?.trim()) {
    throw new Error("member_id is required");
  }
  const res = await fetch(`${PUBLIC_API()}/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method: "POST",
      member_id,
      params: JSON.stringify({ query }),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Golf request failed");
  }
  const rows = unwrap<T>(data);
  return (rows[0] ?? data) as T;
}

export async function getPublicGolfOrder(order_id: number) {
  const rows = await publicGet<{
    order_id: number;
    event_id: string;
    total_cents: number;
    order_status: string;
    purchaser_email: string;
    purchaser_name: string;
    paypal_order_id?: string | null;
  }>("golf_orders", { order_id });
  return rows.find((row) => Number(row.order_id) === Number(order_id)) ?? null;
}
