import { describe, it, expect } from 'vitest';
import { buildAlternates, CARD_CONTENT_LOCALES } from './alternates';

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
  it('omits locales outside the given subset', () => {
    const { languages } = buildAlternates('/tarot-card-meanings', 'en', {
      locales: CARD_CONTENT_LOCALES,
    });
    expect(languages).toEqual({
      en: `${SITE}/tarot-card-meanings`,
      fa: `${SITE}/fa/tarot-card-meanings`,
      'x-default': `${SITE}/tarot-card-meanings`,
    });
    expect(languages).not.toHaveProperty('ar');
  });

  it('excludes Arabic from card content until Phase 2', () => {
    expect(CARD_CONTENT_LOCALES).toEqual(['en', 'fa']);
  });
});
