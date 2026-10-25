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

  // Arabic card-meaning pages 404 in Phase 1. Listing them would feed Search
  // Console a set of soft-404s and burn crawl budget on the ar namespace.
  it('lists no Arabic card-meaning URLs', () => {
    const arabicCardUrls = urls.filter((u) => u.startsWith('https://www.tarotveil.com/ar/tarot-card-meanings'));
    expect(arabicCardUrls).toEqual([]);
  });

  it('still lists English and Farsi card-meaning URLs', () => {
    expect(urls).toContain('https://www.tarotveil.com/tarot-card-meanings');
    expect(urls).toContain('https://www.tarotveil.com/fa/tarot-card-meanings');
  });

  it('never advertises an ar alternate on a card-meaning entry', () => {
    for (const entry of entries) {
      if (!entry.url.includes('tarot-card-meanings')) continue;
      expect(entry.alternates?.languages, entry.url).not.toHaveProperty('ar');
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
