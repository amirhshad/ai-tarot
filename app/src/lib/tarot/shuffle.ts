import { DrawnCard, SpreadPosition } from './types';
import { DECK } from './deck';

/**
 * Fisher-Yates (Knuth) shuffle using cryptographic randomness.
 * Runs client-side using Web Crypto API for verifiable randomness.
 */
export function cryptoShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  const randomValues = new Uint32Array(shuffled.length);
  crypto.getRandomValues(randomValues);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Draw cards from a shuffled deck with crypto-random reversals.
 * Each card has an independent 50% chance of being reversed.
 */
export function drawCards(
  count: number,
  positions: SpreadPosition[],
): DrawnCard[] {
  if (count !== positions.length) {
    throw new Error(`Card count (${count}) must match positions length (${positions.length})`);
  }

  const shuffled = cryptoShuffle(DECK);
  const drawn = shuffled.slice(0, count);

  // Crypto-random reversal bits
  const reversalBits = new Uint8Array(count);
  crypto.getRandomValues(reversalBits);

  return drawn.map((card, i) => ({
    card,
    reversed: reversalBits[i] > 127,
    position: positions[i],
  }));
}

/**
 * Serialize drawn cards for storage (Supabase JSON column).
 */
export function serializeDrawnCards(
  cards: DrawnCard[],
): { cardId: number; reversed: boolean; positionIndex: number }[] {
  return cards.map(dc => ({
    cardId: dc.card.id,
    reversed: dc.reversed,
    positionIndex: dc.position.index,
  }));
}

/**
 * Deserialize cards from storage back to DrawnCard objects.
 */
export function deserializeDrawnCards(
  data: { cardId: number; reversed: boolean; positionIndex: number }[],
  positions: SpreadPosition[],
): DrawnCard[] {
  return data.map(d => {
    const card = DECK.find(c => c.id === d.cardId);
    if (!card) throw new Error(`Card not found: ${d.cardId}`);
    const position = positions.find(p => p.index === d.positionIndex);
    if (!position) throw new Error(`Position not found: ${d.positionIndex}`);
    return { card, reversed: d.reversed, position };
  });
}
