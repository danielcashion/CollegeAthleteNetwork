/** Generational suffixes and post-nominal credentials LinkedIn appends to a last name. */
const DECORATION = new Set([
  "jr", "sr", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix",
  "junior", "senior", "2nd", "3rd", "4th",
  "cfa", "cpa", "cfp", "cma", "cia", "caia", "frm", "chfc", "clu",
  "mba", "mpa", "mph", "ms", "ma", "msc", "bs", "ba", "bba", "bsba",
  "phd", "md", "do", "jd", "esq", "esquire", "llm",
  "pe", "pmp", "sphr", "rn", "dds", "dmd", "dvm", "edd", "dba",
]);

function tokens(value: string): string[] {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/(?<=[a-z0-9])\.(?=[a-z0-9])/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** Drop one trailing suffix, credential, or initial. Dotted forms such as Ph.D. count as one credential. */
function dropTrailingDecoration(name: string[]): boolean {
  let joined = "";
  for (let i = name.length - 1; i >= 1 && name[i].length <= 3; i -= 1) {
    joined = name[i] + joined;
    if (DECORATION.has(joined)) {
      name.splice(i);
      return true;
    }
  }
  const last = name[name.length - 1];
  if (DECORATION.has(last) || last.length === 1) {
    name.pop();
    return true;
  }
  return false;
}

/** Drop trailing suffixes, credentials, and initials. Keep at least one token. */
function significant(parts: string[]): string[] {
  const name = [...parts];
  while (name.length > 1 && dropTrailingDecoration(name)) {
    // Keep peeling Jr., CFA, Ph.D., and similar endings.
  }
  return name;
}

function editDistance(left: string, right: string): number {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const grid = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let row = 0; row < rows; row += 1) grid[row][0] = row;
  for (let col = 0; col < cols; col += 1) grid[0][col] = col;
  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      grid[row][col] = Math.min(grid[row - 1][col] + 1, grid[row][col - 1] + 1, grid[row - 1][col - 1] + cost);
    }
  }
  return grid[left.length][right.length];
}

function lastNameOf(value: string): string {
  const parts = significant(tokens(value));
  return parts[parts.length - 1] || "";
}

/** Compare the athlete's last name with the last name returned by Renidly. */
export function lastNamesMatch(athleteName: string, profileLastName: string): boolean {
  const athlete = lastNameOf(athleteName);
  const profile = lastNameOf(profileLastName);
  if (!athlete || !profile) return false;
  return athlete === profile;
}

/**
 * True when the last names are the same or only a small spelling apart.
 * Cashion and Cashon are close. Cashion and Georgiou are not.
 */
export function lastNamesClose(athleteName: string, profileLastName: string): boolean {
  const athlete = lastNameOf(athleteName);
  const profile = lastNameOf(profileLastName);
  if (!athlete || !profile) return false;
  if (athlete === profile) return true;
  const distance = editDistance(athlete, profile);
  const longest = Math.max(athlete.length, profile.length);
  if (longest <= 4) return distance <= 1;
  return distance <= 2 && distance / longest <= 0.34;
}
