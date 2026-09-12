import { describe, it, expect } from 'vitest';
import {
  cryptoShuffle,
  drawCards,
  serializeDrawnCards,
  deserializeDrawnCards,
} from './shuffle';
import { DECK } from './deck';
import { SPREADS } from './spreads';

describe('cryptoShuffle', () => {
  it('returns a true permutation — nothing lost, nothing duplicated', () => {
    for (let run = 0; run < 50; run++) {
      const out = cryptoShuffle(DECK);
      expect(out).toHaveLength(DECK.length);
      expect(new Set(out.map((c) => c.id)).size).toBe(DECK.length);
    }
  });

  it('does not mutate the input array', () => {
    const before = DECK.map((c) => c.id);
    cryptoShuffle(DECK);
    expect(DECK.map((c) => c.id)).toEqual(before);
  });

  it('actually reorders', () => {
    // A correct shuffle returning identity 20 times running is ~(1/78!)^20.
    const identical = Array.from({ length: 20 }, () =>
      cryptoShuffle(DECK).every((c, i) => c.id === DECK[i].id),
    ).filter(Boolean).length;
    expect(identical).toBe(0);
  });

  it('moves every position over many runs', () => {
    // Guards the classic off-by-one where index 0 is never swapped.
    const moved = new Set<number>();
    for (let run = 0; run < 200; run++) {
      cryptoShuffle(DECK).forEach((card, i) => {
        if (card.id !== DECK[i].id) moved.add(i);
      });
    }
    expect(moved.size).toBe(DECK.length);
  });

  it('handles empty and single-element arrays', () => {
    expect(cryptoShuffle([])).toEqual([]);
    expect(cryptoShuffle([DECK[0]])).toEqual([DECK[0]]);
  });
});

describe('drawCards', () => {
  it('draws one card per position, without repeats', () => {
    for (const spread of Object.values(SPREADS)) {
      const drawn = drawCards(spread.cardCount, spread.positions);
      expect(drawn).toHaveLength(spread.cardCount);
      expect(new Set(drawn.map((d) => d.card.id)).size).toBe(spread.cardCount);
      drawn.forEach((d, i) => expect(d.position).toBe(spread.positions[i]));
    }
  });

  it('throws when count and positions disagree', () => {
    const positions = SPREADS['three-card'].positions;
    expect(() => drawCards(2, positions)).toThrow(/must match/);
    expect(() => drawCards(4, positions)).toThrow(/must match/);
  });

  it('reverses close to half the time', () => {
    const positions = SPREADS['three-card'].positions;
    let reversed = 0;
    const draws = 2000;
    for (let i = 0; i < draws; i++) {
      reversed += drawCards(3, positions).filter((d) => d.reversed).length;
    }
    const rate = reversed / (draws * 3);
    // `reversalBits[i] > 127` is exactly 128/256. Wide band to stay non-flaky.
    expect(rate).toBeGreaterThan(0.45);
    expect(rate).toBeLessThan(0.55);
  });

  it('produces both orientations for every position', () => {
    const positions = SPREADS['celtic-cross'].positions;
    const seen = positions.map(() => new Set<boolean>());
    for (let i = 0; i < 200; i++) {
      drawCards(10, positions).forEach((d, idx) => seen[idx].add(d.reversed));
    }
    seen.forEach((s) => expect(s.size).toBe(2));
  });
});

describe('serialize / deserialize round-trip', () => {
  it('restores the same cards, orientations, and positions', () => {
    for (const spread of Object.values(SPREADS)) {
      const original = drawCards(spread.cardCount, spread.positions);
      const restored = deserializeDrawnCards(
        serializeDrawnCards(original),
        spread.positions,
      );
      expect(restored).toHaveLength(original.length);
      restored.forEach((r, i) => {
        expect(r.card.id).toBe(original[i].card.id);
        expect(r.reversed).toBe(original[i].reversed);
        expect(r.position.index).toBe(original[i].position.index);
      });
    }
  });

  it('throws on an unknown card id rather than returning a hole', () => {
    const positions = SPREADS['single'].positions;
    expect(() =>
      deserializeDrawnCards([{ cardId: 9999, reversed: false, positionIndex: 0 }], positions),
    ).toThrow(/Card not found/);
  });

  it('throws on an unknown position index', () => {
    const positions = SPREADS['single'].positions;
    expect(() =>
      deserializeDrawnCards([{ cardId: DECK[0].id, reversed: false, positionIndex: 99 }], positions),
    ).toThrow(/Position not found/);
  });
});
