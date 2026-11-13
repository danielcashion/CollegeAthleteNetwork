import type { GamesScrapeStgRow, MapContext, ParsedRssItem, TeamRosterYear } from '../types.js';
import { parsePrestoDescription } from './description.js';
import { parsePubDateToIso, splitDcDateToUtcColumns } from './datetime.js';
import { parsePsOpponent, splitGolfOpponentAndVenue } from './opponent.js';
import { detectStatusFlags, parsePsScore, statusLabel } from './score.js';
import { truncate } from '../util/text.js';

export function stagingRowDedupeKey(row: GamesScrapeStgRow): string {
  return [row.team_id, row.DATE, row.TIME ?? '', row.opponent].join('|');
}

export function dedupeStagingRows(rows: GamesScrapeStgRow[]): GamesScrapeStgRow[] {
  const seen = new Set<string>();
  const out: GamesScrapeStgRow[] = [];
  for (const row of rows) {
    const key = stagingRowDedupeKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

export function mapItemToStagingRow(
  item: ParsedRssItem,
  team: TeamRosterYear,
  ctx: MapContext,
): GamesScrapeStgRow | null {
  const iso =
    item.dcDate.trim() ||
    (item.pubDate ? parsePubDateToIso(item.pubDate) : '');
  if (!iso) return null;

  const descParts = parsePrestoDescription(item.description);
  const { date, time } = splitDcDateToUtcColumns(iso);
  if (!date) return null;

  const oppParsed = parsePsOpponent(item.psOpponent || item.title);
  let opponentName = oppParsed.name;
  let location = descParts.locationHint;
  const golfSplit = splitGolfOpponentAndVenue(opponentName);
  if (golfSplit.location) {
    opponentName = golfSplit.opponent;
    location = location || golfSplit.location;
  }

  const flags = detectStatusFlags(item.title, item.description);
  const score = parsePsScore(item.psScore);
  let result: string | undefined;
  if (score) {
    if (score.kind === 'placement' || flags.isFinal) {
      result = score.result;
    }
  }

  const status = statusLabel(flags);
  let tournament = descParts.notes;
  if (status) {
    tournament = tournament ? `${status} — ${tournament}` : status;
  }

  const sportUrl = team.url.replace(/\/$/, '');

  const row: GamesScrapeStgRow = {
    university_name: truncate(ctx.universityName, 60),
    team_id: team.team_id.slice(0, 8),
    sport: truncate(team.team_name, 50),
    gender_id: team.gender_id,
    sport_url: truncate(sportUrl, 120),
    season: truncate(ctx.season, 150),
    DATE: truncate(date, 20),
    AT: oppParsed.homeAway,
    opponent: truncate(opponentName, 80),
    is_active_YN: 1,
    created_by: truncate(ctx.createdBy, 20),
  };

  if (!descParts.timeTba && time) {
    row.TIME = truncate(time, 100);
  }
  if (location) row.location = truncate(location, 200);
  if (tournament) row.tournament = truncate(tournament, 60);
  if (result) row.result = truncate(result, 20);

  return row;
}
