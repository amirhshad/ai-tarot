import { describe, it, expect } from 'vitest';
import { getDailyCard, getDailyCardIndex, getTodayDateStr } from './daily';
import { DECK } from './deck';

/** Consecutive UTC date strings starting at `start`, as YYYY-MM-DD. */
function dateRange(start: string, days: number): string[] {
  const out: string[] = [];
  const d = new Date(`${start}T00:00:00Z`);
  for (let i = 0; i < days; i++) {
    out.push(d.toISOString().split('T')[0]);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

const YEAR = dateRange('2026-01-01', 365);

describe('getDailyCardIndex', () => {
  it('is deterministic for a given date', () => {
    for (const date of ['2026-03-14', '2027-11-02', '2030-12-31']) {
      expect(getDailyCardIndex(date)).toBe(getDailyCardIndex(date));
    }
  });

  it('always lands inside the deck', () => {
    for (const date of YEAR) {
      const i = getDailyCardIndex(date);
      expect(Number.isInteger(i)).toBe(true);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(DECK.length);
    }
  });

  /**
   * Regression: djb2 adds the final character without mixing afterwards, so
   * consecutive dates produced consecutive deck indices — the daily card dealt
   * the deck in order (87% of days advanced by exactly +1). Distribution over a
   * year looked perfect, which is why it survived review.
   */
  it('does not walk the deck sequentially on consecutive days', () => {
    const indices = YEAR.map(getDailyCardIndex);
    let stepsOfOne = 0;
    for (let i = 1; i < indices.length; i++) {
      if (((indices[i] - indices[i - 1]) % DECK.length + DECK.length) % DECK.length === 1) {
        stepsOfOne++;
      }
    }
    // At chance, ~365/78 ≈ 4.7 days would advance by one. Allow generous slack;
    // the bug produced 318.
    expect(stepsOfOne).toBeLessThan(25);
  });

  it('changes card on consecutive days almost always', () => {
    const indices = YEAR.map(getDailyCardIndex);
    let repeats = 0;
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] === indices[i - 1]) repeats++;
    }
    // Independent draws repeat ~1/78 of the time; ~4.7 expected over a year.
    expect(repeats).toBeLessThan(20);
  });

  it('spreads across most of the deck over a year', () => {
    const distinct = new Set(YEAR.map(getDailyCardIndex)).size;
    expect(distinct).toBeGreaterThan(DECK.length * 0.75);
  });

  it('has no single card dominating the year', () => {
    const counts = new Map<number, number>();
    for (const date of YEAR) {
      const i = getDailyCardIndex(date);
      counts.set(i, (counts.get(i) ?? 0) + 1);
    }
    const max = Math.max(...Array.from(counts.values()));
    // Uniform would be ~4.7 per card over 365 days.
    expect(max).toBeLessThan(15);
  });

  it('differs across adjacent months and years', () => {
    expect(getDailyCardIndex('2026-03-01')).not.toBe(getDailyCardIndex('2026-04-01'));
    expect(getDailyCardIndex('2026-06-15')).not.toBe(getDailyCardIndex('2027-06-15'));
  });
});

describe('getDailyCard', () => {
  it('returns a real deck card matching the index', () => {
    for (const date of ['2026-01-01', '2026-08-20', '2029-02-28']) {
      expect(getDailyCard(date)).toBe(DECK[getDailyCardIndex(date)]);
    }
  });

  it('returns a fully formed card', () => {
    const card = getDailyCard('2026-05-05');
    expect(card.name).toBeTruthy();
    expect(card.nameFA).toBeTruthy();
    expect(card.keywords.length).toBeGreaterThan(0);
  });
});

describe('getTodayDateStr', () => {
  it('is a UTC YYYY-MM-DD string', () => {
    expect(getTodayDateStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(getTodayDateStr()).toBe(new Date().toISOString().split('T')[0]);
  });
});
