/**
 * Strips control characters and truncates strings for safe storage and downstream APIs.
 */

const CTRL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeString(
  input: string | null | undefined,
  maxLen: number,
): string | null {
  if (input == null) return null;
  const cleaned = input.replace(CTRL_RE, "").trim();
  if (cleaned === "") return null;
  return cleaned.slice(0, maxLen);
}

export function sanitizeStringArray(arr: string[] | undefined, maxItems: number, maxEach: number): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .slice(0, maxItems)
    .map((s) => sanitizeString(String(s), maxEach))
    .filter((s): s is string => s != null);
}
