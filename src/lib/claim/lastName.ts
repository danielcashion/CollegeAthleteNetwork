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

/** Compare the athlete's last name with the last name returned by Renidly. */
export function lastNamesMatch(athleteName: string, profileLastName: string): boolean {
  const athlete = significant(tokens(athleteName));
  const profile = significant(tokens(profileLastName));
  if (!athlete.length || !profile.length) return false;
  return athlete[athlete.length - 1] === profile[profile.length - 1];
}
