const SUFFIX = /^(jr|sr|ii|iii|iv|v)$/;

function tokens(value: string): string[] {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** Compare the athlete's last name with the last name returned by Renidly. */
export function lastNamesMatch(athleteName: string, profileLastName: string): boolean {
  const athlete = tokens(athleteName);
  const profile = tokens(profileLastName);
  if (!athlete.length || !profile.length) return false;
  while (athlete.length > 1 && SUFFIX.test(athlete[athlete.length - 1])) athlete.pop();
  return athlete[athlete.length - 1] === profile[profile.length - 1];
}
