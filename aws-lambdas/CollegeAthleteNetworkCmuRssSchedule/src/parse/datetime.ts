export function splitDcDateToUtcColumns(isoUtc: string): { date: string; time: string | null } {
  const s = isoUtc.trim();
  if (!s) {
    return { date: '', time: null };
  }

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    return { date: '', time: null };
  }

  const date = d.toISOString().slice(0, 10);
  const hh = d.getUTCHours();
  const mm = d.getUTCMinutes();
  const ss = d.getUTCSeconds();
  const time = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}Z`;
  return { date, time };
}

export function parsePubDateToIso(pubDate: string): string {
  const t = Date.parse(pubDate);
  if (Number.isNaN(t)) return '';
  return new Date(t).toISOString();
}
