import { describe, expect, it } from 'vitest';
import { decodeRssBytes } from '../../src/parse/encoding.js';
import { decodeXmlText } from '../../src/util/text.js';

describe('encoding', () => {
  it('decodes XML entities in text helper', () => {
    expect(decodeXmlText('Franklin &amp; Marshall')).toBe('Franklin & Marshall');
    expect(decodeXmlText('Swimming &amp; Diving')).toBe('Swimming & Diving');
  });

  it('decodes ISO-8859-1 bytes', () => {
    const buf = Buffer.from('<?xml version="1.0" encoding="ISO-8859-1"?><x>test</x>', 'latin1');
    expect(decodeRssBytes(buf)).toContain('test');
  });
});
