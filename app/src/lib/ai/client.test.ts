import { describe, it, expect } from 'vitest';
import { LOCALES, type Locale } from '@/i18n/locales';
import type { Tier } from '@/lib/tarot/types';
import { getModel, getThinking, CHEAP_MODEL, CAPABLE_MODEL } from './client';

const TIERS: Tier[] = ['free', 'pro', 'premium'];

describe('getModel', () => {
  it('returns the cheap model for free + en, free + fa, and free with no locale', () => {
    expect(getModel('free', 'en')).toBe(CHEAP_MODEL);
    expect(getModel('free', 'fa')).toBe(CHEAP_MODEL);
    expect(getModel('free')).toBe(CHEAP_MODEL);
  });

  it('returns the capable model for free + ar', () => {
    expect(getModel('free', 'ar')).toBe(CAPABLE_MODEL);
  });

  it('returns the capable model for pro/premium at any locale', () => {
    for (const tier of ['pro', 'premium'] as const) {
      for (const locale of LOCALES as readonly Locale[]) {
        expect(getModel(tier, locale)).toBe(CAPABLE_MODEL);
      }
      expect(getModel(tier)).toBe(CAPABLE_MODEL);
    }
  });
});

describe('getThinking', () => {
  it("is 'disabled' for the cheap model", () => {
    expect(getThinking(CHEAP_MODEL)).toEqual({ type: 'disabled' });
  });

  it("is 'between_tools' for the capable model", () => {
    expect(getThinking(CAPABLE_MODEL)).toEqual({ type: 'between_tools' });
  });
});

describe('the model/thinking pairing invariant', () => {
  // This is the assertion that would have caught the 400: getThinking must be
  // keyed on the resolved model, not the tier. If it were keyed on tier,
  // routing an Arabic free reading to the capable model while still passing
  // tier: 'free' into getThinking would hand Sonnet the 'disabled' value it
  // rejects.
  it("is 'disabled' exactly when the model is the cheap one, for every tier/locale combination", () => {
    const locales: (Locale | undefined)[] = [...LOCALES, undefined];

    for (const tier of TIERS) {
      for (const locale of locales) {
        const model = getModel(tier, locale);
        const thinking = getThinking(model);

        if (model === CHEAP_MODEL) {
          expect(thinking, `${tier}/${locale}`).toEqual({ type: 'disabled' });
        } else {
          expect(thinking, `${tier}/${locale}`).toEqual({ type: 'between_tools' });
        }
      }
    }
  });
});
