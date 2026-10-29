import { describe, expect, it } from 'vitest';
import { mapItemToStagingRow } from '../../src/parse/mapToStagingRow.js';
import type { ParsedRssItem, TeamRosterYear } from '../../src/types.js';

const team: TeamRosterYear = {
  team_id: 'E73B33CA',
  gender_id: 1,
  university_name: 'Carnegie Mellon',
  team_name: 'Football',
  url: 'https://athletics.cmu.edu/sports/fball',
  roster_year_orig: '2026-27',
};

const ctx = {
  universityName: 'Carnegie Mellon',
  season: '2026-27',
  createdBy: 'cmu-rss-lambda',
  feedUrl: 'https://athletics.cmu.edu/sports/fball/2026-27/schedule?print=rss',
};

describe('mapItemToStagingRow', () => {
  it('maps away game using ps:opponent not title', () => {
    const item: ParsedRssItem = {
      title: 'Carnegie Mellon 38, Catholic 35 Final',
      link: 'https://example.com#x',
      description:
        'Football on Sep 12, 2026 at 12:00 PM: Carnegie Mellon vs. Catholic, Final, 38-35',
      pubDate: 'Sat, 12 Sep 2026 16:00:00 GMT',
      dcDate: '2026-09-12T16:00:00Z',
      psScore: 'W, 38-35',
      psOpponent: 'at Catholic',
    };
    const row = mapItemToStagingRow(item, team, ctx)!;
    expect(row.AT).toBe('away');
    expect(row.opponent).toBe('Catholic');
    expect(row.DATE).toBe('2026-09-12');
    expect(row.TIME).toBe('16:00:00Z');
    expect(row.result).toBe('W 38-35');
    expect(row.sport).toBe('Football');
  });

  it('maps event notes to tournament', () => {
    const item: ParsedRssItem = {
      title: 'Dickinson vs. Carnegie Mellon',
      link: 'https://example.com#z',
      description:
        'Football on Oct 31, 2026 at 3:30 PM: Dickinson vs. Carnegie Mellon, 14th Annual Cindy Lackner Memorial Game',
      pubDate: '',
      dcDate: '2026-10-31T19:30:00Z',
      psScore: '',
      psOpponent: 'Dickinson',
    };
    const row = mapItemToStagingRow(item, team, ctx)!;
    expect(row.tournament).toBe('14th Annual Cindy Lackner Memorial Game');
  });

  it('round-trips ampersand opponent from XML decode path', () => {
    const item: ParsedRssItem = {
      title: 'Carnegie Mellon vs. Franklin & Marshall',
      link: 'https://example.com#y',
      description: 'Football on Nov 7, 2026 at 12:00 PM: Carnegie Mellon vs. Franklin & Marshall',
      pubDate: '',
      dcDate: '2026-11-07T17:00:00Z',
      psScore: '',
      psOpponent: 'at Franklin & Marshall',
    };
    const row = mapItemToStagingRow(item, team, ctx)!;
    expect(row.opponent).toBe('Franklin & Marshall');
  });
});
