const MONTHLY_LIMIT = 3;

export function refreshMonth(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function refreshesRemaining(count: number, storedMonth: string, now = new Date()): number {
  const used = storedMonth === refreshMonth(now) ? count : 0;
  return Math.max(0, MONTHLY_LIMIT - used);
}

function storageKey(token: string): string {
  return `can.claim.refresh.${token}`;
}

function readCount(token: string): { month: string; count: number } {
  const month = refreshMonth();
  if (typeof window === "undefined") return { month, count: 0 };
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return { month, count: 0 };
    const parsed = JSON.parse(raw) as { month?: unknown; count?: unknown };
    const storedMonth = typeof parsed.month === "string" ? parsed.month : "";
    const count = typeof parsed.count === "number" && Number.isFinite(parsed.count) ? Math.max(0, Math.floor(parsed.count)) : 0;
    if (storedMonth !== month) return { month, count: 0 };
    return { month, count };
  } catch {
    return { month, count: 0 };
  }
}

/** True while this browser has fewer than 3 successful refreshes for this claim link in the current month. */
export function canRefreshLinkedIn(token: string): boolean {
  const stored = readCount(token);
  return refreshesRemaining(stored.count, stored.month) > 0;
}

/** Count one successful Refresh. A new calendar month starts again at zero. */
export function recordLinkedInRefresh(token: string): void {
  if (typeof window === "undefined") return;
  const stored = readCount(token);
  try {
    window.localStorage.setItem(
      storageKey(token),
      JSON.stringify({ month: stored.month, count: stored.count + 1 }),
    );
  } catch {
    // The profile pull already succeeded. A full browser store should not hide that result.
  }
}
