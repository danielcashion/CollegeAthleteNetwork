function publicApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.PUBLIC_API ||
    "https://api.tourneymaster.org";
  const root = String(raw).replace(/\/$/, "");
  return root.endsWith("/publicprod") ? root : `${root}/publicprod`;
}

export type TicketRow = {
  public_id?: string;
  token_version?: number;
  ticket_id?: number;
  status?: string;
  confirmation_code?: string;
  player_id?: number;
  golf_event_id?: string;
  door_event_id?: string | null;
  assignment_kind?: string | null;
  assignment_value?: string | null;
  live_assignment_kind?: string | null;
  live_assignment_value?: string | null;
  pass_error?: string | null;
  google_class_id?: string | null;
  google_object_id?: string | null;
  last_downloaded_at?: string | null;
  email_sent_at?: string | null;
  sms_sent_at?: string | null;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  paid_status?: string | null;
  checkin_status?: string | null;
  product_type?: string | null;
  event_name?: string;
  university_name?: string;
  event_date?: string | null;
  tz?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  venue_city?: string | null;
  venue_state?: string | null;
  logo_url?: string | null;
  university_logo_url?: string | null;
  contact_email?: string | null;
  contact_name?: string | null;
  checkin_opens_at?: string | null;
  event_startdate?: string | null;
  primary_hex?: string | null;
  secondary_hex?: string | null;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  purchaser_name?: string | null;
  purchaser_email?: string | null;
  purchaser_phone?: string | null;
  order_id?: number;
  duplicate?: number;
  updated?: number;
  action?: string;
};

function procRows<T>(data: unknown): T[] {
  if (data == null) return [];
  if (Array.isArray(data)) {
    if (data.length === 0) return [];
    if (Array.isArray(data[0])) return data.flatMap((item) => procRows<T>(item));
    return data.filter((item) => item && typeof item === "object") as T[];
  }
  if (typeof data === "object") {
    const record = data as { resource?: unknown; success?: boolean; error?: string; message?: string };
    if (Array.isArray(record.resource)) return procRows<T>(record.resource);
    if (record.success === false) {
      throw new Error(record.error || record.message || "Ticket request failed");
    }
    return [data as T];
  }
  return [];
}

export class TicketProcError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TicketProcError";
  }
}

export async function callTicketProc<T = TicketRow>(
  name: string,
  query: Record<string, unknown>,
  options?: { memberId?: string; secret?: boolean }
): Promise<T[]> {
  const url = new URL(`${publicApiBase()}/${name}`);
  const payload: Record<string, unknown> = { ...query };
  if (options?.secret !== false) {
    const secret = process.env.TICKET_PROC_SECRET || "";
    if (!secret) throw new TicketProcError("Ticket service is not configured");
    payload.proc_secret = secret;
  }
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
  });
  const memberId = options?.memberId?.trim() || "PUBLIC";
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ method: "POST", member_id: memberId }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || (data && typeof data === "object" && (data as { success?: boolean }).success === false)) {
    const message =
      (data && typeof data === "object" && ((data as { error?: string }).error || (data as { message?: string }).message)) ||
      "Ticket request failed";
    throw new TicketProcError(String(message));
  }
  return procRows<T>(data);
}
