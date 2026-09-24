import { sortSponsorshipPackages } from "@/components/GolfOutingPage/golfOutingDisplay";

function publicApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.PUBLIC_API ||
    "https://api.tourneymaster.org";
  return `${String(raw).replace(/\/$/, "")}/publicprod`;
}

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
  contact_name?: string | null;
  contact_email?: string | null;
  registration_opens_at?: string | null;
  registration_closes_at?: string | null;
  currency?: string;
  is_active_YN?: number;
  remaining_spots?: number | null;
  hole_count?: number | null;
  remaining_hole_slots?: number | null;
  remaining_longest_drive?: number | null;
  remaining_closest_to_pin?: number | null;
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
  requires_golfer_info?: number;
  ticket_type_status: string;
  sort_order?: number;
  is_active_YN?: number;
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
  includes_longest_drive?: number;
  includes_closest_to_pin?: number;
  includes_public_logo: number;
  sponsorship_status: string;
  sort_order?: number;
  is_active_YN?: number;
  remaining_package_qty?: number | null;
  remaining_hole_slots?: number | null;
  remaining_longest_drive?: number | null;
  remaining_closest_to_pin?: number | null;
  remaining_qty?: number | null;
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
  auction_type?: "silent" | "live" | null;
  description_html?: string | null;
  photo_urls?: string[] | string | null;
  donor_name?: string | null;
  is_anonymous_YN?: number;
  fmv_cents?: number;
  starting_bid_cents: number;
  min_increment_cents?: number;
  closes_at: string;
  item_status: string;
  is_active_YN?: number;
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
  const url = new URL(`${publicApiBase()}/${path}`);
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
    if (row.is_active_YN === 0) return false;
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
  const fromView = await publicGet<GolfTicketPublic>("v_golf_tickets_public", { event_id });
  const rows = fromView.length > 0 ? fromView : await publicGet<GolfTicketPublic>("golf_ticket_types", { event_id });
  return rows
    .filter((row) => row.event_id === event_id && row.ticket_type_status === "ACTIVE")
    .sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100));
}

export async function listPublicPackages(event_id: string): Promise<GolfPackagePublic[]> {
  const fromView = await publicGet<GolfPackagePublic>("v_golf_packages_public", { event_id });
  const rows = fromView.length > 0 ? fromView : await publicGet<GolfPackagePublic>("golf_sponsorship_types", { event_id });
  return sortSponsorshipPackages(
    rows
      .filter((row) => row.event_id === event_id && row.sponsorship_status === "ACTIVE")
      .map((row) => ({
        ...row,
        remaining_qty:
          row.remaining_qty != null
            ? Number(row.remaining_qty)
            : Number(row.remaining_package_qty ?? row.inventory ?? 0),
      }))
  );
}

export function packageIsSoldOut(pkg: Pick<GolfPackagePublic, "remaining_qty" | "inventory">) {
  const remaining = pkg.remaining_qty != null ? Number(pkg.remaining_qty) : Number(pkg.inventory ?? 0);
  return remaining <= 0;
}

export async function listPublicSponsors(event_id: string): Promise<GolfSponsorPublic[]> {
  const rows = await publicGet<GolfSponsorPublic>("golf_sponsors", { event_id });
  return rows.filter((row) => (row.payment_status === "PAID" || row.payment_status === "COMP") && row.public_display_YN);
}

function publicAuctionDonorName(item: GolfAuctionPublic) {
  if (Number(item.is_anonymous_YN) === 1) {
    return "Anonymous";
  }
  return item.donor_name || null;
}

export async function listPublicAuctionItems(event_id: string): Promise<GolfAuctionPublic[]> {
  const fromView = await publicGet<GolfAuctionPublic>("v_golf_auction_public", { event_id });
  const rows =
    fromView.length > 0
      ? fromView.filter((row) => row.event_id === event_id)
      : (await publicGet<GolfAuctionPublic>("golf_auction_items", { event_id })).filter(
          (row) => row.event_id === event_id && ["LIVE", "ENDED"].includes(row.item_status)
        );
  return rows.map((row) => ({ ...row, donor_name: publicAuctionDonorName(row) }));
}

function unwrapProcResult<T>(data: unknown): T {
  let current: unknown = data;
  while (Array.isArray(current)) {
    if (current.length === 0) return data as T;
    current = current[0];
  }
  return (current ?? data) as T;
}

export async function callPublicGolfProc<T = Record<string, unknown>>(
  name: string,
  member_id: string | null | undefined,
  query: Record<string, unknown>
): Promise<T> {
  const url = new URL(`${publicApiBase()}/${name}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value !== null && typeof value === "object") {
      url.searchParams.set(key, JSON.stringify(value));
    } else {
      url.searchParams.set(key, value == null ? "" : String(value));
    }
  });
  if (!member_id?.trim()) {
    url.searchParams.set("guest", "1");
  }
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method: "POST",
      member_id: member_id?.trim() || "",
    }),
  });
  const data = await res.json();
  if (!res.ok || data?.success === false) {
    throw new Error(data?.error || data?.message || "Golf request failed");
  }
  return unwrapProcResult<T>(data);
}

export async function getPublicGolfOrder(order_id: number) {
  const rows = await publicGet<{
    order_id: number;
    event_id: string;
    total_cents: number;
    order_status: string;
    purchaser_email: string;
    purchaser_name: string;
    member_id?: string | null;
    paypal_order_id?: string | null;
  }>("golf_orders", { order_id });
  return rows.find((row) => Number(row.order_id) === Number(order_id)) ?? null;
}

export async function setPublicGolfPaypalOrderId(order_id: number, paypal_order_id: string) {
  await fetch(`${publicApiBase()}/golf_orders?order_id=${order_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paypal_order_id,
      updated_by: "public-golf",
      is_active_YN: 1,
    }),
  });
}
