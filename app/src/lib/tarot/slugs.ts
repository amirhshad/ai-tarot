import { TarotCard } from './types';
import { DECK } from './deck';

/** Convert a card name to a URL-safe slug */
export function cardToSlug(card: TarotCard): string {
  return card.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Look up a card by its slug */
export function getCardBySlug(slug: string): TarotCard | undefined {
  return DECK.find(card => cardToSlug(card) === slug);
}

/** Get all cards with their slugs */
export function getAllCardSlugs(): { card: TarotCard; slug: string }[] {
  return DECK.map(card => ({ card, slug: cardToSlug(card) }));
}
