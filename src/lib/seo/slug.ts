/** URL segment for `/athlete-network/{slug}` — keep in sync with satellite sites. */
export function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}
