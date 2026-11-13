import type { Config, TeamRosterYear } from '../types.js';
import { isRetryableHttp, withRetry } from '../util/retry.js';

export function buildUniversityRosterYearsUrl(
  baseUrl: string,
  universityName: string,
  gamesUpdateYn: 0 | 1,
): string {
  const u = new URL(`${baseUrl.replace(/\/$/, '')}/university_roster_years`);
  u.searchParams.set('university_name', universityName);
  u.searchParams.set('games_update_YN', String(gamesUpdateYn));
  return u.toString();
}

export function dedupeTeamsByTeamId(rows: TeamRosterYear[]): TeamRosterYear[] {
  const map = new Map<string, TeamRosterYear>();
  for (const row of rows) {
    if (!row.team_id) continue;
    if (!map.has(row.team_id)) {
      map.set(row.team_id, row);
    }
  }
  return [...map.values()];
}

async function fetchJson(url: string, config: Config): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.httpTimeoutMs);

  try {
    const response = await withRetry(
      async () => {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': config.userAgent,
          },
          signal: controller.signal,
        });
        if (isRetryableHttp(res.status)) {
          throw new Error(`GET retryable status ${res.status}`);
        }
        return res;
      },
      {
        maxAttempts: 3,
        baseDelayMs: 400,
        maxDelayMs: 4000,
        retryOn: (err) => err instanceof Error,
      },
    );

    if (!response.ok) {
      throw new Error(`GET ${url} failed: ${response.status}`);
    }
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchTeams(config: Config): Promise<TeamRosterYear[]> {
  const url = buildUniversityRosterYearsUrl(
    config.apiBaseUrl,
    config.universityName,
    config.gamesUpdateYn,
  );
  const data = await fetchJson(url, config);
  if (!Array.isArray(data)) {
    throw new Error('university_roster_years did not return an array');
  }
  return dedupeTeamsByTeamId(data as TeamRosterYear[]);
}
