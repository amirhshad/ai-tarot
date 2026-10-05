import { describe, it, expect } from 'vitest';
import {
  LOCALES,
  isRtl,
  toLocale,
  BRAND,
  HTML_LANG,
  LOCALE_LABELS,
  localePathPattern,
  type Locale,
} from './locales';

describe('LOCALES', () => {
  it('contains exactly en, fa, ar with en first', () => {
    expect(LOCALES).toEqual(['en', 'fa', 'ar']);
  });

  it('has no duplicates', () => {
    expect(new Set(LOCALES).size).toBe(LOCALES.length);
  });
});

describe('isRtl', () => {
  it('is true for fa and ar, false for en', () => {
    expect(isRtl('en')).toBe(false);
    expect(isRtl('fa')).toBe(true);
    expect(isRtl('ar')).toBe(true);
  });
});

describe('toLocale', () => {
  it('passes through every supported locale', () => {
    for (const locale of LOCALES) {
      expect(toLocale(locale)).toBe(locale);
    }
  });

  // Review Focus 2: an unknown prefix must degrade to English, never throw.
  it.each([
    ['de', 'unsupported language'],
    ['ar-SA', 'region subtag we do not route'],
    ['AR', 'wrong case'],
    ['', 'empty string'],
    ['../fa', 'traversal-looking junk'],
  ])('falls back to en for %s (%s)', (input) => {
    expect(toLocale(input)).toBe('en');
  });

  it('falls back to en for undefined and null', () => {
    expect(toLocale(undefined)).toBe('en');
    expect(toLocale(null)).toBe('en');
  });
});

describe('per-locale constant tables', () => {
  it.each([
    ['BRAND', BRAND],
    ['HTML_LANG', HTML_LANG],
    ['LOCALE_LABELS', LOCALE_LABELS],
  ])('%s covers every locale with a non-empty value', (_name, table) => {
    for (const locale of LOCALES) {
      expect((table as Record<Locale, string>)[locale]?.trim()).toBeTruthy();
    }
    expect(Object.keys(table as object).sort()).toEqual([...LOCALES].sort());
  });

  it('keeps the brand Latin in every locale per the spec', () => {
    expect(BRAND.en).toBe('TarotVeil');
    expect(BRAND.ar).toBe('TarotVeil');
  });

  it('forces Latin digits for Arabic date formatting', () => {
    expect(HTML_LANG.ar).toBe('ar-u-nu-latn');
    const formatted = new Date('2026-10-04T00:00:00Z').toLocaleDateString(HTML_LANG.ar, {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    });
    expect(formatted).toMatch(/\d/);          // Latin digits present
    expect(formatted).not.toMatch(/[٠-٩]/); // no Arabic-Indic digits
  });

  it('labels each locale in its own script', () => {
    expect(LOCALE_LABELS.en).toBe('English');
    expect(LOCALE_LABELS.fa).toBe('فارسی');
    expect(LOCALE_LABELS.ar).toBe('العربية');
  });
});

describe('localePathPattern', () => {
  it('strips a leading locale prefix', () => {
    expect('/ar/dashboard'.replace(localePathPattern(), '')).toBe('/dashboard');
    expect('/fa/reading/new'.replace(localePathPattern(), '')).toBe('/reading/new');
    expect('/en'.replace(localePathPattern(), '')).toBe('');
  });

  it('does not strip a path that merely starts with locale letters', () => {
    expect('/article'.replace(localePathPattern(), '')).toBe('/article');
    expect('/far-future'.replace(localePathPattern(), '')).toBe('/far-future');
  });
});
