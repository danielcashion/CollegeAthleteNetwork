import type { Context, ScheduledEvent } from 'aws-lambda';
import { loadConfig } from './config.js';
import { buildFeedUrl, fetchRssFeed } from './clients/rssFetch.js';
import { fetchTeams } from './clients/tourneymaster.js';
import { decodeRssBytes } from './parse/encoding.js';
import { dedupeStagingRows, mapItemToStagingRow } from './parse/mapToStagingRow.js';
import { parseItems, parsePrestoScheduleRss } from './parse/prestosportsRss.js';
import { resolveSeasonForTeam } from './parse/season.js';
import { postAllRows } from './post/gamesScrapeStg.js';
import type { Config, GamesScrapeStgRow, HandlerSummary, TeamProcessResult, TeamRosterYear } from './types.js';
import { mapPool } from './util/concurrency.js';
import { buildRunSummary, logJson } from './util/observability.js';

async function processTeam(
  team: TeamRosterYear,
  config: Config,
  now: Date,
): Promise<{ result: TeamProcessResult; rows: GamesScrapeStgRow[] }> {
  const season = resolveSeasonForTeam(team, config, now);
  const feedUrl = buildFeedUrl(team.url, season);
  const base: TeamProcessResult = {
    team_id: team.team_id,
    team_name: team.team_name,
    feed_url: feedUrl,
    http_status: null,
    items_parsed: 0,
    rows_mapped: 0,
  };

  try {
    const feed = await fetchRssFeed(feedUrl, {
      timeoutMs: config.httpTimeoutMs,
      userAgent: config.userAgent,
    });
    base.http_status = feed.status;

    if (feed.status === 404) {
      return { result: base, rows: [] };
    }
    if (feed.status !== 200) {
      base.error = `HTTP ${feed.status}`;
      return { result: base, rows: [] };
    }

    const xml = decodeRssBytes(feed.body, feed.declaredEncoding);
    const doc = parsePrestoScheduleRss(xml);
    const items = parseItems(doc);
    base.items_parsed = items.length;

    const ctx = {
      universityName: config.universityName,
      season,
      createdBy: config.createdBy,
      feedUrl,
    };

    const rows: GamesScrapeStgRow[] = [];
    for (const item of items) {
      try {
        const row = mapItemToStagingRow(item, team, ctx);
        if (row) rows.push(row);
      } catch (err) {
        logJson(config.logLevel, 'WARNING', 'item parse failed', {
          team_id: team.team_id,
          title: item.title,
          dc_date: item.dcDate,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    base.rows_mapped = rows.length;
    return { result: base, rows };
  } catch (err) {
    base.error = err instanceof Error ? err.message : String(err);
    return { result: base, rows: [] };
  }
}

export async function handler(_event: ScheduledEvent, _context: Context): Promise<HandlerSummary> {
  const config = loadConfig();
  const now = new Date();

  logJson(config.logLevel, 'INFO', 'run started', {
    university_name: config.universityName,
    dry_run: config.dryRun,
  });

  const teams = await fetchTeams(config);
  const processed = await mapPool(teams, config.feedConcurrency, (team) =>
    processTeam(team, config, now),
  );

  const teamResults = processed.map((p) => p.result);
  let allRows = dedupeStagingRows(processed.flatMap((p) => p.rows));

  let rowsPosted = 0;
  let rowsFailed = 0;

  if (config.dryRun) {
    logJson(config.logLevel, 'INFO', 'DRY_RUN: sample rows', {
      count: allRows.length,
      sample: allRows.slice(0, 3),
    });
  } else {
    const postResult = await postAllRows(allRows, config);
    rowsPosted = postResult.posted;
    rowsFailed = postResult.failed;
  }

  const summary = buildRunSummary({
    universityName: config.universityName,
    dryRun: config.dryRun,
    teamResults,
    rowsPosted,
    rowsFailed,
  });

  logJson(config.logLevel, 'INFO', 'run finished', summary as unknown as Record<string, unknown>);
  return summary;
}
