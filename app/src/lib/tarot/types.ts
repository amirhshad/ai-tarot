export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type Court = 'page' | 'knight' | 'queen' | 'king';
export type SpreadType = 'single' | 'three-card' | 'celtic-cross' | 'horseshoe';
export type Tier = 'free' | 'pro' | 'premium';

export interface TarotCard {
  id: number;
  name: string;
  nameFA: string;
  arcana: Arcana;
  suit?: Suit;
  number: number;
  court?: Court;
  keywords: string[];
  keywordsFA: string[];
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
  nameFA: string;
  description: string;
  descriptionFA: string;
}

export interface SpreadDefinition {
  type: SpreadType;
  name: string;
  nameFA: string;
  description: string;
  descriptionFA: string;
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
