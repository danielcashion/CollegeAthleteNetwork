import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { decodeRssBytes } from '../../src/parse/encoding.js';
import { mapItemToStagingRow } from '../../src/parse/mapToStagingRow.js';
import { parseItems, parsePrestoScheduleRss } from '../../src/parse/prestosportsRss.js';
import type { TeamRosterYear } from '../../src/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, '../../../../fixtures/rss');

function loadFixture(name: string): string {
  const buf = fs.readFileSync(path.join(fixturesDir, name));
  return decodeRssBytes(buf);
}

const footballTeam: TeamRosterYear = {
  team_id: 'E73B33CA',
  gender_id: 1,
  university_name: 'Carnegie Mellon',
  team_name: 'Football',
  url: 'https://athletics.cmu.edu/sports/fball',
};

describe('RSS fixtures', () => {
  it('parses football fixture items', () => {
    const items = parseItems(parsePrestoScheduleRss(loadFixture('fball.xml')));
    expect(items.length).toBe(10);
    const first = mapItemToStagingRow(items[0], footballTeam, {
      universityName: 'Carnegie Mellon',
      season: '2026-27',
      createdBy: 'test',
      feedUrl: 'x',
    });
    expect(first?.result).toBe('L 17-7');
    expect(first?.opponent).toBe('John Carroll');
  });

  it('parses golf placement scores', () => {
    const items = parseItems(parsePrestoScheduleRss(loadFixture('mgolf.xml')));
    expect(items.length).toBeGreaterThan(0);
    const withScore = items.find((i) => i.psScore.includes('/'));
    expect(withScore).toBeTruthy();
    const row = mapItemToStagingRow(withScore!, {
      ...footballTeam,
      team_id: '047885FD',
      team_name: 'Golf',
      url: 'https://athletics.cmu.edu/sports/mgolf',
    }, {
      universityName: 'Carnegie Mellon',
      season: '2026-27',
      createdBy: 'test',
      feedUrl: 'x',
    });
    expect(row?.result).toMatch(/\d/);
  });

  it('parses track feed volume', () => {
    const items = parseItems(parsePrestoScheduleRss(loadFixture('wtrack.xml')));
    expect(items.length).toBe(48);
  });
});
