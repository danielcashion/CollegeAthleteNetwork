import { XMLParser } from 'fast-xml-parser';
import type { ParsedRssItem } from '../types.js';
import { decodeXmlText } from '../util/text.js';

const parser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  parseTagValue: false,
  removeNSPrefix: true,
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function textField(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  if (v === undefined || v === null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

export function parsePrestoScheduleRss(xml: string): Record<string, unknown> {
  const doc = parser.parse(xml) as Record<string, unknown>;
  return doc;
}

export function parseItems(doc: Record<string, unknown>): ParsedRssItem[] {
  const rss = doc.rss as Record<string, unknown> | undefined;
  const channel = rss?.channel as Record<string, unknown> | undefined;
  const rawItems = asArray(channel?.item as Record<string, unknown> | Record<string, unknown>[] | undefined);

  return rawItems.map((item) => ({
    title: decodeXmlText(textField(item, 'title')),
    link: decodeXmlText(textField(item, 'link')),
    description: decodeXmlText(textField(item, 'description')),
    pubDate: textField(item, 'pubDate'),
    dcDate: textField(item, 'date') || textField(item, 'dc:date'),
    psScore: textField(item, 'score') || textField(item, 'ps:score'),
    psOpponent: decodeXmlText(textField(item, 'opponent') || textField(item, 'ps:opponent')),
  }));
}
