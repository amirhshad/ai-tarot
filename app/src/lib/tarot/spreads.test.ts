import { describe, it, expect } from 'vitest';
import { SPREADS, getSpread, getAvailableSpreads } from './spreads';
import type { SpreadType, Tier } from './types';

const ALL_TYPES: SpreadType[] = ['single', 'three-card', 'celtic-cross', 'horseshoe'];

describe('SPREADS integrity', () => {
  it('defines every spread type exactly once', () => {
    const types = Object.values(SPREADS).map((s) => s.type);
    expect(new Set(types).size).toBe(types.length);
    for (const type of ALL_TYPES) {
      expect(types).toContain(type);
    }
  });

  it('keys match the spread type they hold', () => {
    for (const [key, spread] of Object.entries(SPREADS)) {
      expect(spread.type).toBe(key);
    }
  });

  /** `drawCards` throws when these disagree, so a mismatch breaks every reading. */
  it('keeps cardCount equal to positions.length', () => {
    for (const spread of Object.values(SPREADS)) {
      expect(spread.cardCount, `${spread.type} cardCount`).toBe(spread.positions.length);
    }
  });

  it('numbers positions contiguously from zero', () => {
    for (const spread of Object.values(SPREADS)) {
      const indices = spread.positions.map((p) => p.index).sort((a, b) => a - b);
      expect(indices).toEqual(spread.positions.map((_, i) => i));
    }
  });

  it('gives every position both English and Farsi copy', () => {
    for (const spread of Object.values(SPREADS)) {
      for (const position of spread.positions) {
        expect(position.name.trim(), `${spread.type}.${position.index}.name`).not.toBe('');
        expect(position.nameFA.trim(), `${spread.type}.${position.index}.nameFA`).not.toBe('');
        expect(position.description.trim()).not.toBe('');
        expect(position.descriptionFA.trim()).not.toBe('');
      }
    }
  });

  it('gives every spread both English and Farsi names', () => {
    for (const spread of Object.values(SPREADS)) {
      expect(spread.name.trim()).not.toBe('');
      expect(spread.nameFA.trim()).not.toBe('');
      expect(spread.description.trim()).not.toBe('');
      expect(spread.descriptionFA.trim()).not.toBe('');
    }
  });

  it('draws no more cards than the deck holds', () => {
    for (const spread of Object.values(SPREADS)) {
      expect(spread.cardCount).toBeGreaterThan(0);
      expect(spread.cardCount).toBeLessThanOrEqual(78);
    }
  });
});

describe('getSpread', () => {
  it('resolves every known type', () => {
    for (const type of ALL_TYPES) {
      expect(getSpread(type)?.type).toBe(type);
    }
  });

  it('returns undefined for unknown input rather than a default', () => {
    for (const bad of ['', 'tarot', 'SINGLE', 'three_card']) {
      expect(getSpread(bad)).toBeUndefined();
    }
  });
});

describe('getAvailableSpreads', () => {
  it('offers paid tiers at least what free gets', () => {
    const free = getAvailableSpreads('free').map((s) => s.type);
    for (const tier of ['pro', 'premium'] as Tier[]) {
      const available = getAvailableSpreads(tier).map((s) => s.type);
      for (const type of free) {
        expect(available, `${tier} lost access to ${type}`).toContain(type);
      }
    }
  });

  it('returns only real spread definitions', () => {
    for (const tier of ['free', 'pro', 'premium'] as Tier[]) {
      for (const spread of getAvailableSpreads(tier)) {
        expect(Object.values(SPREADS)).toContain(spread);
      }
    }
  });
});
