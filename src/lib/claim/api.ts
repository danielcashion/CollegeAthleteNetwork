import "server-only";

export class ClaimDataError extends Error {
  constructor() {
    super("CLAIM_DATA_UNAVAILABLE");
    this.name = "ClaimDataError";
  }
}

/** Same public API root the rest of this app uses (see lib/door/upstream.ts). */
export function claimApiBase(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.PUBLIC_API ||
    "";
  const root = raw.trim().replace(/\/$/, "");
  if (!root) throw new ClaimDataError();
  return root.endsWith("/publicprod") ? root : `${root}/publicprod`;
}

export async function claimApiGet(path: string, params: Record<string, string | number>): Promise<unknown> {
  const url = new URL(`${claimApiBase()}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(12000) });
  } catch {
    throw new ClaimDataError();
  }
  if (!response.ok) throw new ClaimDataError();

  try {
    return await response.json();
  } catch {
    throw new ClaimDataError();
  }
}

export async function claimApiSend(
  method: "POST" | "PUT",
  path: string,
  params: Record<string, string | number>,
  body: Record<string, unknown>,
): Promise<unknown> {
  const url = new URL(`${claimApiBase()}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new ClaimDataError();
  }
  if (!response.ok) throw new ClaimDataError();

  try {
    return await response.json();
  } catch {
    throw new ClaimDataError();
  }
}

export function rowsOf(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter((item) => item && typeof item === "object") as Record<string, unknown>[];
  }
  if (data && typeof data === "object" && Array.isArray((data as { resource?: unknown }).resource)) {
    return rowsOf((data as { resource: unknown }).resource);
  }
  return [];
}
