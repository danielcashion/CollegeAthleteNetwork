import { describe, expect, it } from 'vitest';
import { parsePsOpponent } from '../../src/parse/opponent.js';

describe('parsePsOpponent', () => {
  it('detects away', () => {
    expect(parsePsOpponent('at Catholic')).toEqual({
      homeAway: 'away',
      name: 'Catholic',
    });
  });

  it('detects neutral vs.', () => {
    expect(parsePsOpponent('vs. UAA Championship @ venue')).toMatchObject({
      homeAway: 'neutral',
    });
  });

  it('strips rank', () => {
    expect(parsePsOpponent('#8 John Carroll')).toEqual({
      homeAway: 'home',
      rank: 8,
      name: 'John Carroll',
    });
  });
});
