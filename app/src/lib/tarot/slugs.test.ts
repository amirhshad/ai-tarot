import { describe, it, expect } from 'vitest';
import { cardToSlug, getCardBySlug, getAllCardSlugs } from './slugs';
import { DECK } from './deck';

/**
 * Card slugs are indexed URLs (/tarot-card-meanings/<slug>), and the English
 * card cohort is an active SEO experiment. A silent slug change delists a page
 * and loses its history, so these assertions are deliberately strict.
 */
describe('cardToSlug', () => {
  it('produces a URL-safe slug for every card', () => {
    for (const card of DECK) {
      expect(cardToSlug(card)).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('never produces empty, doubled, or edge hyphens', () => {
    for (const card of DECK) {
      const slug = cardToSlug(card);
      expect(slug.length).toBeGreaterThan(0);
      expect(slug).not.toMatch(/--/);
      expect(slug).not.toMatch(/^-|-$/);
    }
  });

  it('is stable across calls', () => {
    for (const card of DECK) {
      expect(cardToSlug(card)).toBe(cardToSlug(card));
    }
  });
});

describe('slug uniqueness', () => {
  it('gives all 78 cards a distinct slug', () => {
    const slugs = getAllCardSlugs().map((s) => s.slug);
    expect(slugs).toHaveLength(78);
    expect(new Set(slugs).size).toBe(78);
  });
});

describe('getCardBySlug', () => {
  it('round-trips every card', () => {
    for (const card of DECK) {
      expect(getCardBySlug(cardToSlug(card))?.id).toBe(card.id);
    }
  });

  it('returns undefined for unknown slugs', () => {
    for (const slug of ['not-a-card', '', 'THE-FOOL', 'the fool']) {
      expect(getCardBySlug(slug)).toBeUndefined();
    }
  });

  /**
   * Locks the slugs that are live and indexed today. If one of these fails,
   * a card name changed and the corresponding URL is about to 404 — add a
   * redirect before updating this list.
   */
  it('keeps known published slugs stable', () => {
    const published: Record<string, string> = {
      'the-fool': 'The Fool',
      'the-magician': 'The Magician',
      'wheel-of-fortune': 'Wheel of Fortune',
      'the-high-priestess': 'The High Priestess',
      'ace-of-cups': 'Ace of Cups',
      'ten-of-pentacles': 'Ten of Pentacles',
      'king-of-swords': 'King of Swords',
      'page-of-wands': 'Page of Wands',
    };
    for (const [slug, name] of Object.entries(published)) {
      const card = getCardBySlug(slug);
      expect(card, `slug "${slug}" no longer resolves`).toBeDefined();
      expect(card!.name).toBe(name);
    }
  });
});
