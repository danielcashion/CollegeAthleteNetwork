import { describe, expect, it } from 'vitest';
import { parsePsScore } from '../../src/parse/score.js';

describe('parsePsScore', () => {
  it('parses W/L with comma', () => {
    expect(parsePsScore('L, 17-7')).toEqual({ kind: 'wl', result: 'L 17-7' });
    expect(parsePsScore('W, 38-35')).toEqual({ kind: 'wl', result: 'W 38-35' });
  });

  it('parses placement', () => {
    expect(parsePsScore('4th/12')).toEqual({ kind: 'placement', result: '4th/12' });
  });

  it('returns null for empty', () => {
    expect(parsePsScore('')).toBeNull();
    expect(parsePsScore('   ')).toBeNull();
  });
});
