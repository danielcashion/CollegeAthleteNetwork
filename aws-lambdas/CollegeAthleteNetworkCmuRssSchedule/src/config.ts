import type { Config } from './types.js';
import { isValidSeasonFormat } from './parse/season.js';

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') return defaultValue;
  return value === '1' || value.toLowerCase() === 'true';
}

function parseIntEnv(value: string | undefined, defaultValue: number): number {
  if (value === undefined || value === '') return defaultValue;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : defaultValue;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const apiBaseUrl = (env.API_BASE_URL ?? 'https://api.tourneymaster.org/publicprod').replace(/\/$/, '');
  const universityName = (env.UNIVERSITY_NAME ?? '').trim();
  if (!universityName) {
    throw new Error('UNIVERSITY_NAME is required');
  }

  const seasonRaw = (env.SEASON ?? '').trim();
  const seasonOverride = seasonRaw === '' ? null : seasonRaw;
  if (seasonOverride && !isValidSeasonFormat(seasonOverride)) {
    throw new Error(`SEASON must match YYYY-YY format, got: ${seasonOverride}`);
  }

  const postDataApi = (env.POST_DATA_API ?? `${apiBaseUrl}/games_scrape_stg`).replace(/\/$/, '');
  if (!postDataApi.endsWith('/games_scrape_stg')) {
    // allow full override URL
  }

  return {
    apiBaseUrl,
    universityName,
    gamesUpdateYn: parseIntEnv(env.GAMES_UPDATE_YN, 1) === 0 ? 0 : 1,
    seasonOverride,
    academicYearRolloverMonth: parseIntEnv(env.ACADEMIC_YEAR_ROLLOVER_MONTH, 7),
    academicYearRolloverDay: parseIntEnv(env.ACADEMIC_YEAR_ROLLOVER_DAY, 1),
    feedConcurrency: Math.max(1, parseIntEnv(env.FEED_CONCURRENCY, 4)),
    httpTimeoutMs: Math.max(1000, parseIntEnv(env.HTTP_TIMEOUT_MS, 15000)),
    postBatchSize: Math.max(1, parseIntEnv(env.POST_BATCH_SIZE, 25)),
    dryRun: parseBool(env.DRY_RUN, false),
    createdBy: (env.CREATED_BY ?? 'cmu-rss-lambda').slice(0, 20),
    userAgent: env.USER_AGENT ?? 'CAN-CMU-RSS/1.0 (+https://collegeathletenetwork.com)',
    logLevel: (env.LOG_LEVEL ?? 'INFO').toUpperCase(),
    postDataApi: env.POST_DATA_API ?? `${apiBaseUrl}/games_scrape_stg`,
  };
}
