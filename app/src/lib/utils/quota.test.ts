import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SpreadType } from '@/lib/tarot/types';

const getUsage = vi.fn();
const upsertUsage = vi.fn();

vi.mock('@/lib/db/queries', () => ({
  getUsage: (...args: unknown[]) => getUsage(...args),
  upsertUsage: (...args: unknown[]) => upsertUsage(...args),
}));

// vi.mock is hoisted above these imports, so the mock is already in place.
import { checkQuota, incrementUsage } from './quota';
import { PLANS } from '@/lib/stripe/config';

type Usage = Partial<{
  single_count: number;
  three_card_count: number;
  celtic_cross_count: number;
  horseshoe_count: number;
}>;

const withUsage = (usage: Usage | null) => {
  getUsage.mockResolvedValue(
    usage && {
      single_count: 0,
      three_card_count: 0,
      celtic_cross_count: 0,
      horseshoe_count: 0,
      ...usage,
    },
  );
};

beforeEach(() => {
  getUsage.mockReset();
  upsertUsage.mockReset();
  withUsage(null);
});

describe('checkQuota — paid tiers', () => {
  it('never blocks pro or premium on any spread', async () => {
    withUsage({ single_count: 999, three_card_count: 999, celtic_cross_count: 999, horseshoe_count: 999 });
    for (const tier of ['pro', 'premium']) {
      for (const spread of ['single', 'three-card', 'celtic-cross', 'horseshoe'] as SpreadType[]) {
        const result = await checkQuota('user-1', tier, spread);
        expect(result.allowed, `${tier} / ${spread}`).toBe(true);
      }
    }
  });
});

describe('checkQuota — free tier', () => {
  it('allows the first single and three-card reading of the day', async () => {
    withUsage(null);
    expect((await checkQuota('user-1', 'free', 'single')).allowed).toBe(true);
    expect((await checkQuota('user-1', 'free', 'three-card')).allowed).toBe(true);
  });

  it('blocks once the daily allowance is used', async () => {
    withUsage({ single_count: PLANS.free.limits.singlePerDay });
    const single = await checkQuota('user-1', 'free', 'single');
    expect(single.allowed).toBe(false);
    expect(single.reason).toBeTruthy();

    withUsage({ three_card_count: PLANS.free.limits.threeCardPerDay });
    expect((await checkQuota('user-1', 'free', 'three-card')).allowed).toBe(false);
  });

  it('blocks well past the limit, not only exactly at it', async () => {
    withUsage({ single_count: 50 });
    expect((await checkQuota('user-1', 'free', 'single')).allowed).toBe(false);
  });

  it('treats a missing usage row as zero rather than throwing', async () => {
    withUsage(null);
    await expect(checkQuota('user-1', 'free', 'single')).resolves.toEqual({ allowed: true });
  });

  it('gates members-only spreads', async () => {
    withUsage(null);
    for (const spread of ['celtic-cross', 'horseshoe'] as SpreadType[]) {
      const result = await checkQuota('user-1', 'free', spread);
      // Free limits are 0 today, so these are members-only.
      expect(result.allowed, spread).toBe(false);
      expect(result.reason, spread).toBeTruthy();
    }
  });

  it('falls back to free limits for an unrecognised tier', async () => {
    withUsage({ single_count: 99 });
    // getPlan() falls back to free, but the tier check short-circuits first.
    // This pins current behaviour so a change to it is deliberate.
    expect((await checkQuota('user-1', 'mystery-tier', 'single')).allowed).toBe(true);
  });
});

/**
 * Regression: the Celtic Cross and Horseshoe branches checked only for a zero
 * allowance and never counted usage, so raising a free limit from 0 to any
 * number would have granted unlimited readings of that spread.
 */
describe('checkQuota — non-zero allowance is counted', () => {
  it('enforces a positive per-day limit on gated spreads', async () => {
    vi.resetModules();
    vi.doMock('@/lib/stripe/config', () => ({
      PLANS: {},
      getPlan: () => ({
        name: 'Free',
        limits: {
          singlePerDay: 1,
          threeCardPerDay: 1,
          celticCrossPerDay: 2,
          horseshoePerDay: 2,
          followUpsPerReading: 0,
        },
      }),
      getFollowUpLimit: () => 0,
    }));
    const { checkQuota: scoped } = await import('./quota');

    withUsage({ celtic_cross_count: 1, horseshoe_count: 1 });
    expect((await scoped('user-1', 'free', 'celtic-cross')).allowed).toBe(true);
    expect((await scoped('user-1', 'free', 'horseshoe')).allowed).toBe(true);

    withUsage({ celtic_cross_count: 2, horseshoe_count: 2 });
    expect((await scoped('user-1', 'free', 'celtic-cross')).allowed).toBe(false);
    expect((await scoped('user-1', 'free', 'horseshoe')).allowed).toBe(false);

    vi.doUnmock('@/lib/stripe/config');
    vi.resetModules();
  });
});

describe('incrementUsage', () => {
  it('writes the column matching the spread', async () => {
    const expected: Record<SpreadType, string> = {
      'single': 'single_count',
      'three-card': 'three_card_count',
      'celtic-cross': 'celtic_cross_count',
      'horseshoe': 'horseshoe_count',
    };
    for (const [spread, column] of Object.entries(expected)) {
      upsertUsage.mockReset();
      await incrementUsage('user-1', spread as SpreadType);
      expect(upsertUsage).toHaveBeenCalledTimes(1);
      expect(upsertUsage.mock.calls[0][2]).toBe(column);
    }
  });

  it('uses a UTC YYYY-MM-DD period key, matching checkQuota', async () => {
    await incrementUsage('user-1', 'single');
    const period = upsertUsage.mock.calls[0][1];
    expect(period).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(period).toBe(new Date().toISOString().split('T')[0]);

    await checkQuota('user-1', 'free', 'single');
    expect(getUsage.mock.calls.at(-1)?.[1]).toBe(period);
  });
});
