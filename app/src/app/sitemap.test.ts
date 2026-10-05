import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';

describe('sitemap', () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

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
});
