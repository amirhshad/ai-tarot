export interface CardCombinationRef {
  slug: string;
  name: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** A per-card deep section from the indexation experiment. Which sections a
 *  card carries, and in what order, varies by card on purpose — see
 *  execution/deepen-cards-kimi.mjs. English only. */
export interface DeepSection {
  id: string;
  heading: string;
  body: string;
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
  asFeelings: string | null;
  howSomeoneSeesYou: string | null;
  advice: string | null;
  yesOrNo: string;
  yesOrNoVerdict: 'yes' | 'no' | 'maybe';
  combinations: CardCombinationRef[];
  faq: FaqItem[];
  deepSections: DeepSection[];
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
