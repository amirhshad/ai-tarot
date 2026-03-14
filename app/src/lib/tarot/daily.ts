import { DECK } from './deck';
import { TarotCard } from './types';

/**
 * DJB2 hash — deterministic, fast, good distribution.
 */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Get today's date string in YYYY-MM-DD format (UTC).
 */
export function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Deterministically select a card index for a given date.
 */
export function getDailyCardIndex(dateStr: string): number {
  return djb2Hash(dateStr) % DECK.length;
}

/**
 * Get the daily card for a given date.
 */
export function getDailyCard(dateStr: string): TarotCard {
  return DECK[getDailyCardIndex(dateStr)];
}
