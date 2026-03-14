export interface CardCombinationRef {
  slug: string;
  name: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RichCardContent {
  slug: string;
  cardId: number;
  name: string;
  arcana: 'major' | 'minor';
  suit: string | null;
  number: number;
  element: string | null;
  zodiac: string | null;
  uprightKeywords: string[];
  reversedKeywords: string[];
  featuredSnippet: string;
  uprightMeaning: string;
  reversedMeaning: string;
  loveRelationships: string;
  careerFinances: string;
  yesOrNo: string;
  yesOrNoVerdict: 'yes' | 'no' | 'maybe';
  combinations: CardCombinationRef[];
  faq: FaqItem[];
  relatedCards: string[];
  metaTitle: string;
  metaDescription: string;
}

export interface CardHubEntry {
  slug: string;
  name: string;
  arcana: string;
  suit: string | null;
  number: number;
  featuredSnippet: string;
  cardId: number;
}
