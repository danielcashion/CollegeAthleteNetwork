import type { HomeAway } from '../types.js';
import { decodeXmlText, normalizeText } from '../util/text.js';

export interface ParsedOpponent {
  homeAway: HomeAway;
  rank?: number;
  name: string;
}

export function parsePsOpponent(raw: string): ParsedOpponent {
  let s = decodeXmlText(raw);
  let homeAway: HomeAway = 'home';

  if (/^at\s+/i.test(s)) {
    homeAway = 'away';
    s = s.replace(/^at\s+/i, '');
  } else if (/^vs\.?\s+/i.test(s)) {
    homeAway = 'neutral';
    s = s.replace(/^vs\.?\s+/i, '');
  }

  s = normalizeText(s);
  let rank: number | undefined;
  const rankMatch = s.match(/^#(\d+)\s+(.*)$/);
  if (rankMatch) {
    rank = Number.parseInt(rankMatch[1], 10);
    s = rankMatch[2].trim();
  }

  return { homeAway, rank, name: s };
}

/** Golf/meet: split "Event @ Venue" embedded in opponent after vs. strip. */
export function splitGolfOpponentAndVenue(name: string): { opponent: string; location: string } {
  const atIdx = name.indexOf('@');
  if (atIdx === -1) {
    return { opponent: name.trim(), location: '' };
  }
  return {
    opponent: name.slice(0, atIdx).trim(),
    location: name.slice(atIdx + 1).trim(),
  };
}
