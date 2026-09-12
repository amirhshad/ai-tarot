import { describe, it, expect } from 'vitest';
import type { SpreadType } from '@/lib/tarot/types';
import {
  SPREAD_COSTS,
  FOLLOW_UP_COST,
  INCLUDED_FOLLOW_UPS,
  grantFor,
  periodKeyFor,
} from './config';

describe('SPREAD_COSTS', () => {
  it('prices every spread type', () => {
    const spreads: SpreadType[] = ['single', 'three-card', 'celtic-cross', 'horseshoe'];
    for (const spread of spreads) {
      expect(SPREAD_COSTS[spread], spread).toBeGreaterThan(0);
    }
  });

  it('matches the approved packaging', () => {
    expect(SPREAD_COSTS['single']).toBe(1);
    expect(SPREAD_COSTS['three-card']).toBe(2);
    expect(SPREAD_COSTS['horseshoe']).toBe(3);
    expect(SPREAD_COSTS['celtic-cross']).toBe(5);
    expect(FOLLOW_UP_COST).toBe(1);
    expect(INCLUDED_FOLLOW_UPS).toBe(2);
  });

  it("keeps Celtic Cross out of reach of a free user's daily grant", () => {
    expect(SPREAD_COSTS['celtic-cross']).toBeGreaterThan(grantFor('free'));
  });

  it('lets a free user afford exactly one horseshoe per day', () => {
    expect(SPREAD_COSTS['horseshoe']).toBe(grantFor('free'));
  });
});

describe('grantFor', () => {
  it('grants the approved amounts', () => {
    expect(grantFor('free')).toBe(3);
    expect(grantFor('pro')).toBe(120);
    expect(grantFor('premium')).toBe(350);
  });

  it('falls back to the free grant for an unknown tier', () => {
    expect(grantFor('mystery-tier')).toBe(3);
  });
});

describe('periodKeyFor', () => {
  it('gives free users a UTC day key', () => {
    expect(periodKeyFor('free', new Date('2026-09-12T10:00:00Z'))).toBe('d:2026-09-12');
  });

  it('gives paid users a UTC month key', () => {
    expect(periodKeyFor('pro', new Date('2026-09-12T10:00:00Z'))).toBe('m:2026-09');
    expect(periodKeyFor('premium', new Date('2026-09-12T10:00:00Z'))).toBe('m:2026-09');
  });

  it('rolls the free key at 00:00 UTC, not local midnight', () => {
    expect(periodKeyFor('free', new Date('2026-09-12T23:59:59Z'))).toBe('d:2026-09-12');
    expect(periodKeyFor('free', new Date('2026-09-13T00:00:00Z'))).toBe('d:2026-09-13');
  });

  it('rolls the paid key at the month boundary', () => {
    expect(periodKeyFor('pro', new Date('2026-09-30T23:59:59Z'))).toBe('m:2026-09');
    expect(periodKeyFor('pro', new Date('2026-10-01T00:00:00Z'))).toBe('m:2026-10');
  });

  it('never collides a daily key with a monthly key', () => {
    const day = periodKeyFor('free', new Date('2026-09-12T10:00:00Z'));
    const month = periodKeyFor('pro', new Date('2026-09-12T10:00:00Z'));
    expect(day).not.toBe(month);
  });
});
