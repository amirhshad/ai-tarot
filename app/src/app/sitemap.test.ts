import { describe, it, expect, beforeAll, vi } from 'vitest';
import type { MetadataRoute } from 'next';

// The sitemap now reads real per-card dates from Turso. Mock that one query so
// these tests stay hermetic and fast — and so the fallback branch is testable
// without taking the database away.
const lastModifiedMap: Record<string, string> = {
  'the-tower': '2026-08-30',
  'the-moon': '2026-08-30',
  // 'the-sun' is deliberately absent, to exercise the fallback.
};

vi.mock('@/lib/db/card-queries', () => ({
  getCardLastModifiedMap: () => Promise.resolve(lastModifiedMap),
}));

import sitemap from './sitemap';

describe('sitemap', () => {
  let entries: MetadataRoute.Sitemap;
  let urls: string[];

  beforeAll(async () => {
    entries = await sitemap();
    urls = entries.map((e) => e.url);
  });

  it('includes Arabic URLs for Phase 1 routes', () => {
    expect(urls).toContain('https://www.tarotveil.com/ar');
    expect(urls).toContain('https://www.tarotveil.com/ar/reading/free');
    expect(urls).toContain('https://www.tarotveil.com/ar/spreads');
  });

  /**
   * Arabic card-meaning URLs are now listed — but only the Phase 2 cohort.
   *
   * This replaced an assertion that NO Arabic card URL appears, which was
   * correct until 2026-10-25 and failed deliberately when 'ar' was added to
   * CARD_CONTENT_LOCALES. The protective intent is unchanged: the sitemap must
   * never advertise an Arabic URL that 404s, and the ~70 cards with no Arabic
   * content still 404.
   */
  const AR_COHORT = [
    'judgement', 'ten-of-cups', 'eight-of-swords', 'ten-of-pentacles',
    'the-moon', 'the-tower', 'the-hermit', 'six-of-swords',
  ];

  it('lists every Arabic card in the cohort', () => {
    for (const slug of AR_COHORT) {
      expect(urls).toContain(`https://www.tarotveil.com/ar/tarot-card-meanings/${slug}`);
    }
  });

  it('lists no Arabic card outside the cohort', () => {
    const listed = urls
      .filter(u => u.startsWith('https://www.tarotveil.com/ar/tarot-card-meanings/'))
      .map(u => u.split('/').pop()!)
      // Sub-hubs share the prefix but are not cards.
      .filter(slug => !slug.startsWith('suit-of-') && slug !== 'major-arcana');
    expect(listed.sort()).toEqual([...AR_COHORT].sort());
  });

  // The cohort contains no Wand, so that sub-hub has an empty list and
  // SubHubPage 404s it. A listed 404 is worse than an unlisted page.
  it('omits the Arabic sub-hub that has no cohort card', () => {
    expect(urls).not.toContain('https://www.tarotveil.com/ar/tarot-card-meanings/suit-of-wands');
  });

  it('lists the Arabic sub-hubs that do have cohort cards', () => {
    for (const slug of ['major-arcana', 'suit-of-cups', 'suit-of-swords', 'suit-of-pentacles']) {
      expect(urls).toContain(`https://www.tarotveil.com/ar/tarot-card-meanings/${slug}`);
    }
  });

  // The per-card half of the gate now reads the bundled manifest
  // (published-cards.json), not a query, so it cannot be exercised through the
  // mock above — these assert it against the real manifest. 'the-sun' has no
  // Arabic content, which is what makes it the useful case.
  it('omits a card from a locale it has no authored content in', () => {
    expect(urls).not.toContain('https://www.tarotveil.com/ar/tarot-card-meanings/the-sun');
  });

  it('still lists a card in a locale it does have content in', () => {
    expect(urls).toContain('https://www.tarotveil.com/ar/tarot-card-meanings/the-moon');
  });

  // English is canonical and must never be gated away by this mechanism.
  it('lists every card in English regardless of the per-card map', () => {
    expect(urls).toContain('https://www.tarotveil.com/tarot-card-meanings/the-sun');
    expect(urls).toContain('https://www.tarotveil.com/tarot-card-meanings/the-moon');
  });

  // A card the map says nothing about (a failed read yields {} for every slug)
  // must keep the pre-cohort behaviour rather than vanish from the sitemap.
  it('falls back to the site-wide locales for a card absent from the map', () => {
    expect(urls).toContain('https://www.tarotveil.com/fa/tarot-card-meanings/the-star');
  });

  it('still lists English and Farsi card-meaning URLs', () => {
    expect(urls).toContain('https://www.tarotveil.com/tarot-card-meanings');
    expect(urls).toContain('https://www.tarotveil.com/fa/tarot-card-meanings');
  });

  /**
   * hreflang must agree with what is actually published. Previously this
   * asserted no card-meaning entry ever carries an `ar` alternate; now an
   * entry may carry one, but only if that Arabic URL is itself in the sitemap.
   * An `ar` alternate pointing at a 404 is the specific defect being guarded.
   */
  it('advertises an ar alternate only where the Arabic URL exists', () => {
    const urlSet = new Set(urls);
    for (const entry of entries) {
      if (!entry.url.includes('tarot-card-meanings')) continue;
      const ar = (entry.alternates?.languages as Record<string, string> | undefined)?.ar;
      if (!ar) continue;
      expect(urlSet.has(ar), `${entry.url} advertises ar -> ${ar}, which is not listed`).toBe(true);
    }
  });

  it('emits no duplicate URLs', () => {
    const duplicates = urls.filter((u, i) => urls.indexOf(u) !== i);
    expect(duplicates).toEqual([]);
  });

  // The whole point of reading the database: a card whose content changed must
  // advertise the date it changed, not a sitewide constant. Publishing one
  // frozen date for all 78 is why Google never recrawled the deepened cohort.
  it('carries each card its own content-change date', () => {
    const find = (slug: string) =>
      entries.find((e) => e.url === `https://www.tarotveil.com/tarot-card-meanings/${slug}`);

    expect(find('the-tower')?.lastModified).toBe('2026-08-30');
    expect(find('the-moon')?.lastModified).toBe('2026-08-30');
  });

  it('applies the same date to a card in every locale it is listed for', () => {
    const fa = entries.find((e) => e.url === 'https://www.tarotveil.com/fa/tarot-card-meanings/the-tower');
    expect(fa?.lastModified).toBe('2026-08-30');
  });

  it('falls back to the constant for a card with no recorded date', () => {
    const sun = entries.find((e) => e.url === 'https://www.tarotveil.com/tarot-card-meanings/the-sun');
    expect(sun?.lastModified).toBe('2026-05-14');
  });

  it('does not freeze every card on one date', () => {
    const cardDates = new Set(
      entries
        .filter((e) => /\/tarot-card-meanings\/[a-z-]+$/.test(e.url))
        .map((e) => String(e.lastModified)),
    );
    expect(cardDates.size).toBeGreaterThan(1);
  });
});
