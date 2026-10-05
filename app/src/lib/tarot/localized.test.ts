import { describe, it, expect } from 'vitest';
import { LOCALES, type Locale } from '@/i18n/locales';
import { SPREADS } from './spreads';
import {
  spreadName,
  spreadDescription,
  positionName,
  positionDescription,
} from './localized';

describe('spread accessors', () => {
  it('returns the canonical English fields for en', () => {
    const single = SPREADS.single;
    expect(spreadName(single, 'en')).toBe('Single Card');
    expect(spreadDescription(single, 'en')).toBe('A quick insight into your question or situation.');
  });

  it('returns the Farsi sidecar for fa', () => {
    expect(spreadName(SPREADS.single, 'fa')).toBe('تک کارت');
  });

  it('returns Arabic for ar and never English', () => {
    const ar = spreadName(SPREADS.single, 'ar');
    expect(ar.trim()).toBeTruthy();
    expect(ar).not.toBe('Single Card');
    expect(ar).toMatch(/[؀-ۿ]/);
  });
});

// Review Focus 5: a missing Arabic string would leak English into an Arabic
// prompt. tsc catches an absent key; this catches a present-but-empty one.
describe('every spread and position is complete in every locale', () => {
  for (const locale of LOCALES) {
    it(`has non-empty name and description for all spreads in ${locale}`, () => {
      for (const spread of Object.values(SPREADS)) {
        expect(spreadName(spread, locale).trim(), `${spread.type}.name.${locale}`).not.toBe('');
        expect(
          spreadDescription(spread, locale).trim(),
          `${spread.type}.description.${locale}`,
        ).not.toBe('');
      }
    });

    it(`has non-empty name and description for all 21 positions in ${locale}`, () => {
      let counted = 0;
      for (const spread of Object.values(SPREADS)) {
        for (const position of spread.positions) {
          const label = `${spread.type}.${position.index}.${locale}`;
          expect(positionName(position, locale).trim(), `${label}.name`).not.toBe('');
          expect(positionDescription(position, locale).trim(), `${label}.description`).not.toBe('');
          counted += 1;
        }
      }
      expect(counted).toBe(21);
    });

    it(`uses Arabic script for every ar spread string`, () => {
      if (locale !== 'ar') return;
      for (const spread of Object.values(SPREADS)) {
        expect(spreadName(spread, 'ar')).toMatch(/[؀-ۿ]/);
        for (const position of spread.positions) {
          expect(positionName(position, 'ar')).toMatch(/[؀-ۿ]/);
        }
      }
    });
  }
});

describe('locale coverage is driven by LOCALES', () => {
  it('handles every locale without throwing', () => {
    for (const locale of LOCALES as readonly Locale[]) {
      expect(() => spreadName(SPREADS['celtic-cross'], locale)).not.toThrow();
    }
  });
});
