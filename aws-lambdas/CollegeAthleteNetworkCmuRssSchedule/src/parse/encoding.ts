export function detectXmlEncoding(buf: Buffer): string | undefined {
  const head = buf.subarray(0, 200).toString('latin1');
  const m = head.match(/encoding=["']([^"']+)["']/i);
  return m?.[1];
}

export function decodeRssBytes(buf: Buffer, declaredEncoding?: string): string {
  const enc = (declaredEncoding ?? detectXmlEncoding(buf) ?? 'utf-8').toLowerCase();
  const label =
    enc === 'iso-8859-1' || enc === 'latin1' ? 'iso-8859-1' : enc === 'utf-8' ? 'utf-8' : enc;

  try {
    return new TextDecoder(label).decode(buf);
  } catch {
    return buf.toString('utf-8');
  }
}
