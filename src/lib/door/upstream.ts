import axios from "axios";

export function apiBase() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.tourneymaster.org"
  ).replace(/\/$/, "");
}

export function publicApiBase() {
  const root = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://api.tourneymaster.org"
  ).replace(/\/$/, "");
  return root.endsWith("/publicprod") ? root : `${root}/publicprod`;
}

export function unwrap<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { resource?: unknown }).resource)) {
    return (data as { resource: T[] }).resource;
  }
  if (data && typeof data === "object") return [data as T];
  return [];
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T[]> {
  const url = new URL(`${publicApiBase()}${path.startsWith("/") ? path : `/${path}`}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
  const { data } = await axios.get(url.toString());
  return unwrap<T>(data);
}

export async function apiSend<T>(method: "post" | "put", path: string, body: unknown, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${publicApiBase()}${path.startsWith("/") ? path : `/${path}`}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
  const { data } = await axios.request({
    url: url.toString(),
    method,
    data: body,
    headers: { "Content-Type": "application/json" },
  });
  return (unwrap<T>(data)[0] ?? data) as T;
}

export async function callProc<T>(name: string, memberId: string, query: Record<string, unknown>): Promise<T> {
  const url = new URL(`${publicApiBase()}/${name}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
  });
  const { data } = await axios.post(url.toString(), { method: "POST", member_id: memberId });
  const row = (unwrap<T>(data)[0] ?? data) as T;
  if (row && typeof row === "object" && "success" in row && (row as { success?: boolean }).success === false) {
    throw new Error(String((row as { message?: string; error?: string }).message || (row as { error?: string }).error || "Request failed"));
  }
  return row;
}

export function varcharEight() {
  const charset = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (num) => charset.charAt(num % charset.length)).join("");
}

export function sameSchool(sessionUniversity?: string | null, eventUniversity?: string | null) {
  return Boolean(
    sessionUniversity &&
      eventUniversity &&
      sessionUniversity.toLowerCase() === eventUniversity.toLowerCase()
  );
}

export function todayKey(timeZone = "America/New_York") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function dateKey(value?: string | null) {
  const match = String(value || "").match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] || null;
}

export function dollarsToCents(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.round(amount * 100);
}
