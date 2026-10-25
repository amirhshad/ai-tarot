import { describe, it, expect } from 'vitest';
import {
  assertCardContentLocale,
  assertCardPublished,
  buildAlternates,
  cardLocales,
  CARD_CONTENT_LOCALES,
} from './alternates';

const SITE = 'https://www.tarotveil.com';

describe('buildAlternates', () => {
  it('emits one language entry per locale plus x-default', () => {
    const { languages } = buildAlternates('/spreads');
    expect(languages).toEqual({
      en: `${SITE}/spreads`,
      fa: `${SITE}/fa/spreads`,
      ar: `${SITE}/ar/spreads`,
      'x-default': `${SITE}/spreads`,
    });
  });

  it('self-references the canonical for each locale', () => {
    expect(buildAlternates('/spreads', 'en').canonical).toBe(`${SITE}/spreads`);
    expect(buildAlternates('/spreads', 'fa').canonical).toBe(`${SITE}/fa/spreads`);
    expect(buildAlternates('/spreads', 'ar').canonical).toBe(`${SITE}/ar/spreads`);
  });

  it('normalises the root path so no double slash appears', () => {
    const { canonical, languages } = buildAlternates('/', 'ar');
    expect(canonical).toBe(`${SITE}/ar`);
    expect(languages.en).toBe(`${SITE}/`);
    expect(canonical).not.toContain('//ar');
  });

  it('falls back to English for an unknown locale', () => {
    expect(buildAlternates('/spreads', 'de').canonical).toBe(`${SITE}/spreads`);
  });

  // The Phase 2 gate: Arabic card-meaning routes 404, so advertising an ar
  // hreflang for them would point crawlers at a dead URL.
  // An explicit subset, not CARD_CONTENT_LOCALES: that constant now covers
  // every locale the site has, so passing it would assert nothing about
  // subsetting. This tests the mechanism, which is what callers rely on when a
  // page exists in fewer locales than the site does.
  it('omits locales outside the given subset', () => {
    const { languages } = buildAlternates('/tarot-card-meanings', 'en', {
      locales: ['en', 'fa'],
    });
    expect(languages).toEqual({
      en: `${SITE}/tarot-card-meanings`,
      fa: `${SITE}/fa/tarot-card-meanings`,
      'x-default': `${SITE}/tarot-card-meanings`,
    });
    expect(languages).not.toHaveProperty('ar');
  });

  /**
   * Pins the site-wide half of the gate so changing it stays a conscious act.
   *
   * Arabic was added on 2026-10-25 with the Phase 2 cohort. Note what this
   * does NOT mean: Arabic card *pages* are not all live. Membership here only
   * makes a locale eligible; `cardLocales` then intersects it with each card's
   * authored locales, so 8 Arabic cards are live and 70 still 404.
   */
  it('lists every locale eligible for card content', () => {
    expect(CARD_CONTENT_LOCALES).toEqual(['en', 'fa', 'ar']);
  });
});

// The Phase 2 gate itself — the thing all seven card-meaning routes delegate
// to. If someone deleted the gate call from a route without touching
// CARD_CONTENT_LOCALES, nothing here would catch it directly, but this pins
// that the gate function itself still does the right thing for every locale
// that matters, so removing a route's call is the only way left to break it.
describe('assertCardContentLocale', () => {
  /**
   * Every locale the site has is now eligible for card content, so this gate
   * has no locale left to reject — 'ar' used to be the only one, and it threw
   * here until 2026-10-25. The rejection it used to provide now comes from
   * `assertCardPublished` below, per card rather than per locale.
   *
   * Kept rather than deleted because the function is still called by all seven
   * card routes (see card-content-gate.test.ts) and still does the rejecting
   * for any locale added to LOCALES but not to CARD_CONTENT_LOCALES.
   */
  it('accepts every locale currently eligible for card content', () => {
    for (const locale of CARD_CONTENT_LOCALES) {
      expect(() => assertCardContentLocale(locale)).not.toThrow();
    }
  });

  // toLocale() normalises anything outside LOCALES to DEFAULT_LOCALE ('en')
  // before the membership check runs, and 'en' is always eligible — so an
  // unknown locale renders the English page rather than 404ing.
  it('does not throw for an unknown locale (it normalises to the English fallback)', () => {
    expect(() => assertCardContentLocale('de')).not.toThrow();
  });

  it('does not throw for en', () => {
    expect(() => assertCardContentLocale('en')).not.toThrow();
  });

  it('does not throw for fa', () => {
    expect(() => assertCardContentLocale('fa')).not.toThrow();
  });

  it('does not throw for ar', () => {
    expect(() => assertCardContentLocale('ar')).not.toThrow();
  });
});

/**
 * The per-card half of the Phase 2 gate.
 *
 * These assert the *mechanism*, not the current cohort: they must keep passing
 * when `'ar'` is added to `CARD_CONTENT_LOCALES`, which is why none of them
 * hardcodes Arabic's current absence. The one test that does pin the current
 * state is `CARD_CONTENT_LOCALES` above, which fails deliberately on that
 * change so it has to be conscious.
 */
describe('cardLocales', () => {
  it('intersects authored locales with the site-wide switch', () => {
    // A card authored in every locale is live only where the site allows it.
    expect(cardLocales(['en', 'fa', 'ar'])).toEqual([...CARD_CONTENT_LOCALES]);
  });

  it('drops a locale the card has no authored content in', () => {
    expect(cardLocales(['en'])).toEqual(['en']);
  });

  it('never invents a locale the site-wide switch excludes', () => {
    for (const locale of cardLocales(['en', 'fa', 'ar'])) {
      expect(CARD_CONTENT_LOCALES).toContain(locale);
    }
  });

  // The resilience contract: a failed database read yields an empty map, so
  // every lookup is undefined. That must degrade to the old per-locale
  // behaviour, not 404 every card page or empty the sitemap.
  it('falls back to the site-wide set when the card is unknown', () => {
    expect(cardLocales(undefined)).toEqual([...CARD_CONTENT_LOCALES]);
  });

  it('returns a copy, so callers cannot mutate the constant', () => {
    const result = cardLocales(undefined);
    result.push('de' as never);
    expect(CARD_CONTENT_LOCALES).not.toContain('de' as never);
  });
});

describe('assertCardPublished', () => {
  it('does not throw for a locale the card is authored in', () => {
    expect(() => assertCardPublished('fa', ['en', 'fa'])).not.toThrow();
  });

  it('throws for a locale the card has no authored content in', () => {
    expect(() => assertCardPublished('fa', ['en'])).toThrow('NEXT_NOT_FOUND');
  });

  it('does not throw when the per-card map is unavailable', () => {
    expect(() => assertCardPublished('fa', undefined)).not.toThrow();
  });

  it('throws for en only if English itself is somehow unauthored', () => {
    expect(() => assertCardPublished('en', [])).toThrow('NEXT_NOT_FOUND');
  });
});
