import { DECK } from './deck';
import { TarotCard } from './types';

/**
 * Final avalanche step (murmur3 fmix32).
 *
 * djb2 alone is not usable here. Its last operation is `+ charCode`, with no
 * mixing afterwards, so two strings differing by one in the final character
 * produce hashes differing by exactly one. Date strings are exactly that: the
 * daily card advanced one deck position per day and dealt the deck in order.
 * A year of output still looked uniform, which is what made it hard to see.
 *
 * fmix32 diffuses every input bit across the whole word, so neighbouring dates
 * land in unrelated places. Returns an unsigned 32-bit integer.
 */
function avalanche(h: number): number {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Deterministic string hash — djb2 accumulation plus an avalanche finalizer.
 *
 * Changing this function reshuffles which card appears on every date. That is
 * a product-visible change; make it deliberately.
 */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(hash, 33) + str.charCodeAt(i)) | 0;
  }
  return avalanche(hash);
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
