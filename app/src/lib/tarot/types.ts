import type { TranslatedLocale } from '@/i18n/locales';

export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type Court = 'page' | 'knight' | 'queen' | 'king';
export type SpreadType = 'single' | 'three-card' | 'celtic-cross' | 'horseshoe';
export type Tier = 'free' | 'pro' | 'premium';

/**
 * `name` and `keywords` are the canonical English. Slugs, image paths, and DB
 * rows derive from them, and the English prompt path reads them directly, so
 * duplicating English into `localized` would create two sources of truth.
 *
 * `localized` is an exhaustive Record rather than a Partial on purpose: a card
 * missing Arabic is a compile error, not an English name appearing mid-Arabic
 * reading.
 */
export interface TarotCard {
  id: number;
  name: string;
  arcana: Arcana;
  suit?: Suit;
  number: number;
  court?: Court;
  keywords: string[];
  localized: Record<TranslatedLocale, { name: string; keywords: string[] }>;
  image: string;
}

export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
  position: SpreadPosition;
}

export interface SpreadPosition {
  index: number;
  name: string;
  description: string;
  localized: Record<TranslatedLocale, { name: string; description: string }>;
}

export interface SpreadDefinition {
  type: SpreadType;
  name: string;
  description: string;
  localized: Record<TranslatedLocale, { name: string; description: string }>;
  cardCount: number;
  positions: SpreadPosition[];
  minimumTier: Tier;
}

export interface Reading {
  id: string;
  userId: string;
  spreadType: SpreadType;
  question?: string;
  cards: DrawnCard[];
  interpretation?: string;
  modelUsed: string;
  language: string;
  tokensUsed: number;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  readingId: string;
  role: 'user' | 'assistant';
  content: string;
  tokensUsed: number;
  createdAt: string;
}
