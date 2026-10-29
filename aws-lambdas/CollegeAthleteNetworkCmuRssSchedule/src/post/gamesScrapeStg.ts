import type { Config, GamesScrapeStgRow, PostBatchResult } from '../types.js';
import { logJson } from '../util/observability.js';

function rowForApi(row: GamesScrapeStgRow): Record<string, unknown> {
  const out: Record<string, unknown> = {
    university_name: row.university_name,
    team_id: row.team_id,
    sport: row.sport,
    gender_id: row.gender_id,
    sport_url: row.sport_url,
    season: row.season,
    DATE: row.DATE,
    AT: row.AT,
    opponent: row.opponent,
    is_active_YN: row.is_active_YN,
    created_by: row.created_by,
  };
  if (row.TIME) out.TIME = row.TIME;
  if (row.location) out.location = row.location;
  if (row.tournament) out.tournament = row.tournament;
  if (row.result) out.result = row.result;
  return out;
}

async function postOnce(
  body: unknown,
  config: Config,
): Promise<Response> {
  return fetch(config.postDataApi, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': config.userAgent,
    },
    body: JSON.stringify(body),
  });
}

async function postSingle(row: GamesScrapeStgRow, config: Config): Promise<boolean> {
  const res = await postOnce(rowForApi(row), config);
  if (!res.ok) {
    const text = await res.text();
    logJson(config.logLevel, 'ERROR', 'POST single failed', {
      status: res.status,
      text: text.slice(0, 500),
    });
    return false;
  }
  return true;
}

export async function postBatch(rows: GamesScrapeStgRow[], config: Config): Promise<PostBatchResult> {
  if (rows.length === 0) {
    return { posted: 0, failed: 0 };
  }

  const payload = rows.map(rowForApi);
  const res = await postOnce(payload, config);
  if (res.ok) {
    return { posted: rows.length, failed: 0 };
  }

  const text = await res.text();
  logJson(config.logLevel, 'WARNING', 'POST batch failed, falling back to singles', {
    status: res.status,
    text: text.slice(0, 500),
    batch_size: rows.length,
  });

  let posted = 0;
  let failed = 0;
  for (const row of rows) {
    if (await postSingle(row, config)) posted++;
    else failed++;
  }
  return { posted, failed };
}

export async function postAllRows(rows: GamesScrapeStgRow[], config: Config): Promise<PostBatchResult> {
  let posted = 0;
  let failed = 0;
  const size = config.postBatchSize;

  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const result = await postBatch(chunk, config);
    posted += result.posted;
    failed += result.failed;
  }

  return { posted, failed };
}
