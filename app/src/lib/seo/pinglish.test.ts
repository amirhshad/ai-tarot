import { describe, it, expect } from 'vitest';
import { getPinglishVariants } from './pinglish';
import { getFarsiVariants } from '@/lib/tarot/farsi-names';
import { getAllCardSlugs } from '@/lib/tarot/slugs';

const ENTRIES = getAllCardSlugs();
const SLUGS = ENTRIES.map((s) => s.slug);

// Classify by the deck's own arcana field, not by the slug string:
// "wheel-of-fortune" is a major arcana that happens to contain "-of-".
const MAJOR = ENTRIES.filter((e) => e.card.arcana === 'major').map((e) => e.slug);
const MINOR = ENTRIES.filter((e) => e.card.arcana === 'minor').map((e) => e.slug);

/**
 * Pinglish is Persian written in Latin script, rendered as visible text on the
 * card pages ("Also searched as: …"). It is Latin-script by definition, so any
 * non-ASCII character is corruption rather than content.
 *
 * Regression: 'kart abلeh' carried an Arabic LAM and 'nobалeh' carried Cyrillic
 * homoglyphs. Both rendered on live, indexed pages.
 */
describe('getPinglishVariants', () => {
  it('returns pure ASCII for every card', () => {
    for (const slug of SLUGS) {
      const variants = getPinglishVariants(slug);
      const offenders = variants
        .split('')
        .filter((ch) => ch.charCodeAt(0) > 127)
        .map((ch) => `${ch} (U+${ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`);
      expect(offenders, `${slug} → ${variants}`).toEqual([]);
    }
  });

  it('returns a non-empty comma-separated list for every card', () => {
    for (const slug of SLUGS) {
      const variants = getPinglishVariants(slug);
      expect(variants.trim(), slug).not.toBe('');
      expect(variants.split(',').map((p) => p.trim()).filter(Boolean).length).toBeGreaterThan(1);
    }
  });

  it('has no empty segments or doubled separators', () => {
    for (const slug of SLUGS) {
      const variants = getPinglishVariants(slug);
      expect(variants, slug).not.toMatch(/,\s*,/);
      expect(variants.trim(), slug).not.toMatch(/^,|,$/);
      for (const part of variants.split(',')) {
        expect(part.trim(), `empty segment in ${slug}`).not.toBe('');
      }
    }
  });

  it('parses every minor arcana slug rather than falling through', () => {
    expect(MINOR).toHaveLength(56);
    for (const slug of MINOR) {
      // The fallback branch emits the raw slug; a real parse emits "kart <rank> <suit>".
      expect(getPinglishVariants(slug), slug).toMatch(/^fal tarot, kart /);
    }
  });

  it('covers all 22 major arcana explicitly', () => {
    expect(MAJOR).toHaveLength(22);
    for (const slug of MAJOR) {
      expect(getPinglishVariants(slug), slug).toMatch(/^fal tarot, maani /);
    }
  });

  it('is stable across calls', () => {
    for (const slug of SLUGS.slice(0, 10)) {
      expect(getPinglishVariants(slug)).toBe(getPinglishVariants(slug));
    }
  });

  it('degrades gracefully on an unknown slug', () => {
    expect(getPinglishVariants('not-a-card')).toContain('fal tarot');
  });
});

/**
 * Farsi variants are the opposite case: they must be Persian script, not Latin.
 */
describe('getFarsiVariants', () => {
  it('returns Persian script where variants exist', () => {
    for (const slug of SLUGS) {
      for (const variant of getFarsiVariants(slug)) {
        expect(variant.trim(), `${slug} has a blank variant`).not.toBe('');
        expect(variant, `${slug} → "${variant}" is not Persian script`).toMatch(/[؀-ۿ]/);
      }
    }
  });

  it('has no duplicate variants within a card', () => {
    for (const slug of SLUGS) {
      const variants = getFarsiVariants(slug);
      expect(new Set(variants).size, slug).toBe(variants.length);
    }
  });

  it('returns an array for unknown slugs rather than throwing', () => {
    expect(Array.isArray(getFarsiVariants('not-a-card'))).toBe(true);
  });
});
