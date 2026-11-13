import type { HandlerSummary, TeamProcessResult } from '../types.js';

const LEVELS = ['DEBUG', 'INFO', 'WARNING', 'ERROR'] as const;

export function logJson(
  configuredLevel: string,
  level: string,
  msg: string,
  fields: Record<string, unknown> = {},
): void {
  const cfgIdx = LEVELS.indexOf(configuredLevel as (typeof LEVELS)[number]);
  const msgIdx = LEVELS.indexOf(level as (typeof LEVELS)[number]);
  const cfg = cfgIdx === -1 ? 1 : cfgIdx;
  const msgLevel = msgIdx === -1 ? 1 : msgIdx;
  if (msgLevel < cfg) return;

  console.log(
    JSON.stringify({
      level,
      msg,
      ts: new Date().toISOString(),
      ...fields,
    }),
  );
}

export function buildRunSummary(params: {
  universityName: string;
  dryRun: boolean;
  teamResults: TeamProcessResult[];
  rowsPosted: number;
  rowsFailed: number;
}): HandlerSummary {
  const teamsFailed = params.teamResults.filter((t) => t.error).length;
  const feedsNotFound = params.teamResults.filter((t) => t.http_status === 404).length;
  const itemsParsed = params.teamResults.reduce((s, t) => s + t.items_parsed, 0);

  return {
    university_name: params.universityName,
    dry_run: params.dryRun,
    teams_total: params.teamResults.length,
    teams_ok: params.teamResults.length - teamsFailed,
    teams_failed: teamsFailed,
    feeds_not_found: feedsNotFound,
    items_parsed: itemsParsed,
    rows_posted: params.rowsPosted,
    rows_failed: params.rowsFailed,
    team_results: params.teamResults,
    scraped_at_utc: new Date().toISOString(),
  };
}
