import type { DescriptionParts } from '../types.js';
import { decodeXmlText, normalizeText } from '../util/text.js';

function extractTailAfterMatchupHeader(description: string): string {
  const timed = description.match(/\sat\s+\d{1,2}:\d{2}\s*(?:[AP]\.?M\.?)?:\s*(.+)$/i);
  if (timed) return timed[1].trim();

  const dateOnly = description.match(
    /\bon\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s*\d{4}:\s*(.+)$/i,
  );
  if (dateOnly) return dateOnly[1].trim();

  const colon = description.match(/:\s*(.+)$/);
  return colon ? colon[1].trim() : '';
}

function isScoreOrStatusSegment(segment: string): boolean {
  return (
    /^Final$/i.test(segment) ||
    /^\d+\s*-\s*\d+$/.test(segment) ||
    /^[WLT],\s*\d/i.test(segment) ||
    /^\d+(st|nd|rd|th)(\/\d+)?$/i.test(segment) ||
    /^T-\d+(st|nd|rd|th)$/i.test(segment)
  );
}

export function parsePrestoDescription(raw: string): DescriptionParts {
  const description = decodeXmlText(raw);
  const timeTba = /\bTBA\b|\bTBD\b/i.test(description) || !/\sat\s+\d{1,2}:\d{2}/i.test(description);

  const tail = extractTailAfterMatchupHeader(description);
  const segments = tail
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  let locationHint = '';
  let notesParts: string[] = [];

  if (segments.length > 0) {
    const rest = segments.slice(1).filter((s) => !isScoreOrStatusSegment(s));
    if (rest.length > 0 && /-\s*[A-Za-z.]+\.?\s*$/.test(rest[0])) {
      locationHint = rest[0];
      notesParts = rest.slice(1);
    } else {
      notesParts = rest;
    }
  }

  return {
    timeTba,
    notes: normalizeText(notesParts.join(', ')),
    locationHint: normalizeText(locationHint),
  };
}
