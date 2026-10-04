import { describe, it, expect } from 'vitest';
import { LOCALES, type Locale } from '@/i18n/locales';
import en from './en.json';
import fa from './fa.json';
import ar from './ar.json';

const BUNDLES: Record<Locale, unknown> = { en, fa, ar };

/** Flatten to dotted leaf paths so a missing or extra key names itself. */
function leafPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leafEntries(value: unknown, prefix = ''): [string, unknown][] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [[prefix, value]];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leafEntries(child, prefix ? `${prefix}.${key}` : key),
  );
}

const enPaths = leafPaths(en);

describe('message bundle parity', () => {
  /**
   * A floor, not an exact count. Later tasks legitimately add keys (inline
   * bilingual copy moves into the bundles), so pinning the exact number would
   * make a correct change fail. The floor still catches a truncated bundle.
   */
  it('en.json has at least the namespaces and keys it shipped with', () => {
    expect(Object.keys(en as object).length).toBeGreaterThanOrEqual(26);
    expect(enPaths.length).toBeGreaterThanOrEqual(769);
  });

  // Review Focus 4: a key missing from ar.json renders English mid-Arabic page
  // via next-intl's fallback, with no error. This is the gate that catches it.
  for (const locale of LOCALES) {
    if (locale === 'en') continue;

    it(`${locale}.json has exactly the same keys as en.json`, () => {
      const paths = leafPaths(BUNDLES[locale]);
      const missing = enPaths.filter((p) => !paths.includes(p));
      const extra = paths.filter((p) => !enPaths.includes(p));
      expect(missing, `missing from ${locale}.json`).toEqual([]);
      expect(extra, `not in en.json`).toEqual([]);
    });

    it(`${locale}.json has no empty values`, () => {
      for (const [path, value] of leafEntries(BUNDLES[locale])) {
        expect(typeof value, path).toBe('string');
        expect(String(value).trim(), path).not.toBe('');
      }
    });

    it(`${locale}.json preserves every ICU placeholder`, () => {
      const enMap = new Map(leafEntries(en));
      for (const [path, value] of leafEntries(BUNDLES[locale])) {
        const expected = String(enMap.get(path) ?? '').match(/\{[^}]+\}/g)?.sort() ?? [];
        const actual = String(value).match(/\{[^}]+\}/g)?.sort() ?? [];
        expect(actual, `placeholders in ${locale}.json → ${path}`).toEqual(expected);
      }
    });
  }

  it('ar.json is written in Arabic script, not left as English', () => {
    const untranslated: string[] = [];
    const enMap = new Map(leafEntries(en));
    for (const [path, value] of leafEntries(ar)) {
      const text = String(value);
      // Allow values that are legitimately just the brand or a bare number.
      if (/^(?:TarotVeil|[\d\s.,%+-]+)$/.test(text.trim())) continue;
      if (text === String(enMap.get(path))) untranslated.push(path);
      else if (!/[؀-ۿ]/.test(text)) untranslated.push(path);
    }
    expect(untranslated, `untranslated ar.json keys`).toEqual([]);
  });

  it('ar.json contains no Persian-specific letters', () => {
    const persian: string[] = [];
    for (const [path, value] of leafEntries(ar)) {
      if (/[پچژگکی]/.test(String(value))) persian.push(path);
    }
    expect(persian, `Persian letters (پ چ ژ گ ک ی) in ar.json`).toEqual([]);
  });

  /**
   * The Arabic-script assertion above only proves a value sits in the U+0600
   * block — which Farsi does too. Farsi that happens to avoid پ چ ژ گ ک ی
   * therefore passes both of the checks above. `فال` is the Persian word for a
   * divination reading and the single most likely such word to appear in this
   * product's copy, so it gets its own assertion.
   *
   * The lookarounds are the point: `فال` is also the Arabic conjunction فـ
   * joined to the article الـ, so `فالتاروت` and `فالبطاقة الأولى` are correct
   * Arabic. Only `فال` standing alone as a word is Persian.
   */
  it('ar.json does not use the Persian word فال', () => {
    const offenders: string[] = [];
    for (const [path, value] of leafEntries(ar)) {
      if (/(?<![؀-ۿ])فال(?![؀-ۿ])/.test(String(value))) offenders.push(path);
    }
    expect(offenders, `Persian word فال in ar.json`).toEqual([]);
  });

  /**
   * Replaces an earlier `not.toMatch(/تاروت‌ویل|تاروتفيل/)` test that could
   * never fire: that pattern's first alternative contains a ZWNJ and a Persian
   * ی, so any bundle passing the Persian-letter test passed it for free.
   * Asserting presence parity instead catches both a translated brand and a
   * brand inserted where English has none — the real defect found in review.
   */
  it('mentions TarotVeil in exactly the values en.json does', () => {
    const enMap = new Map(leafEntries(en));
    const mismatched: string[] = [];
    for (const [path, value] of leafEntries(ar)) {
      const inEn = String(enMap.get(path) ?? '').includes('TarotVeil');
      const inAr = String(value).includes('TarotVeil');
      if (inEn !== inAr) mismatched.push(`${path} (en: ${inEn}, ar: ${inAr})`);
    }
    expect(mismatched, `brand presence differs from en.json`).toEqual([]);
  });
});
