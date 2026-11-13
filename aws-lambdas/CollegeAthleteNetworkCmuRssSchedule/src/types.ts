export type HomeAway = 'home' | 'away' | 'neutral';

export interface TeamRosterYear {
  team_id: string;
  university_id?: string;
  gender_id: number;
  university_name: string;
  team_name: string;
  url: string;
  roster_id?: string;
  roster_year_orig?: string;
  is_active_YN?: number;
  games_update_YN?: number;
}

export interface Config {
  apiBaseUrl: string;
  universityName: string;
  gamesUpdateYn: 0 | 1;
  seasonOverride: string | null;
  academicYearRolloverMonth: number;
  academicYearRolloverDay: number;
  feedConcurrency: number;
  httpTimeoutMs: number;
  postBatchSize: number;
  dryRun: boolean;
  createdBy: string;
  userAgent: string;
  logLevel: string;
  postDataApi: string;
}

export interface ParsedRssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  dcDate: string;
  psScore: string;
  psOpponent: string;
}

export interface ParsedScore {
  kind: 'wl' | 'placement';
  result: string;
}

export interface DescriptionParts {
  timeTba: boolean;
  notes: string;
  locationHint: string;
}

export interface MapContext {
  universityName: string;
  season: string;
  createdBy: string;
  feedUrl: string;
}

/** Row sent to POST /games_scrape_stg (JSON keys match API). */
export interface GamesScrapeStgRow {
  university_name: string;
  team_id: string;
  sport: string;
  gender_id: number;
  sport_url: string;
  season: string;
  DATE: string;
  TIME?: string;
  AT: HomeAway;
  opponent: string;
  location?: string;
  tournament?: string;
  result?: string;
  is_active_YN: number;
  created_by: string;
}

export interface TeamProcessResult {
  team_id: string;
  team_name: string;
  feed_url: string;
  http_status: number | null;
  items_parsed: number;
  rows_mapped: number;
  error?: string;
}

export interface PostBatchResult {
  posted: number;
  failed: number;
}

export interface HandlerSummary {
  university_name: string;
  dry_run: boolean;
  teams_total: number;
  teams_ok: number;
  teams_failed: number;
  feeds_not_found: number;
  items_parsed: number;
  rows_posted: number;
  rows_failed: number;
  team_results: TeamProcessResult[];
  scraped_at_utc: string;
}

export interface RssFeedBytes {
  url: string;
  status: number;
  body: Buffer;
  declaredEncoding?: string;
}

export interface FetchOptions {
  timeoutMs: number;
  userAgent: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryOn: (err: unknown, response?: Response) => boolean;
}
