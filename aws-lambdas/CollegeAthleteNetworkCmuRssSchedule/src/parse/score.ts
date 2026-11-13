import type { ParsedScore } from '../types.js';
import { normalizeText } from '../util/text.js';

const WL_RE = /^([WLT]),\s*(\d+)\s*-\s*(\d+)\s*$/i;

export function parsePsScore(raw: string): ParsedScore | null {
  const s = normalizeText(raw);
  if (!s) return null;

  const wl = s.match(WL_RE);
  if (wl) {
    const letter = wl[1].toUpperCase();
    const a = wl[2];
    const b = wl[3];
    return { kind: 'wl', result: `${letter} ${a}-${b}` };
  }

  return { kind: 'placement', result: s.slice(0, 20) };
}

export function detectStatusFlags(title: string, description: string): {
  isFinal: boolean;
  postponed: boolean;
  canceled: boolean;
  suspended: boolean;
} {
  const blob = `${title} ${description}`;
  return {
    isFinal: /\bFinal\b/i.test(title),
    postponed: /Postponed/i.test(blob),
    canceled: /Canceled|Cancelled/i.test(blob),
    suspended: /Suspended/i.test(blob),
  };
}

export function statusLabel(flags: ReturnType<typeof detectStatusFlags>): string | null {
  if (flags.canceled) return 'Canceled';
  if (flags.postponed) return 'Postponed';
  if (flags.suspended) return 'Suspended';
  return null;
}
