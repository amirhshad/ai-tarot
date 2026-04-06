import { getDb, ensureSchema } from './sqlite';
import type { RichCardContent, CardHubEntry } from '../seo/types';

// Module-level cache for build-time performance (avoid N+1 DB queries)
let _allCardsCache: RichCardContent[] | null = null;

function rowToRichCard(row: Record<string, unknown>): RichCardContent {
  return {
    slug: row.slug as string,
    cardId: row.card_id as number,
    name: row.name as string,
    arcana: row.arcana as 'major' | 'minor',
    suit: (row.suit as string) || null,
    number: row.number as number,
    element: (row.element as string) || null,
    zodiac: (row.zodiac as string) || null,
    uprightKeywords: JSON.parse(row.upright_keywords as string),
    reversedKeywords: JSON.parse(row.reversed_keywords as string),
    featuredSnippet: row.featured_snippet as string,
    uprightMeaning: row.upright_meaning as string,
    reversedMeaning: row.reversed_meaning as string,
    loveRelationships: row.love_relationships as string,
    careerFinances: row.career_finances as string,
    asFeelings: (row.as_feelings as string) || null,
    howSomeoneSeesYou: (row.how_someone_sees_you as string) || null,
    advice: (row.advice as string) || null,
    yesOrNo: row.yes_or_no as string,
    yesOrNoVerdict: row.yes_or_no_verdict as 'yes' | 'no' | 'maybe',
    combinations: JSON.parse(row.combinations as string),
    faq: JSON.parse(row.faq as string),
    relatedCards: JSON.parse(row.related_cards as string),
    metaTitle: row.meta_title as string,
    metaDescription: row.meta_description as string,
  };
}

export async function getAllCardContent(): Promise<RichCardContent[]> {
  if (_allCardsCache) return _allCardsCache;
  await ensureSchema();
  const db = getDb();
  const result = await db.execute('SELECT * FROM card_content ORDER BY card_id');
  _allCardsCache = result.rows.map(row => rowToRichCard(row as Record<string, unknown>));
  return _allCardsCache;
}

export async function getCardContent(slug: string): Promise<RichCardContent | null> {
  // Use cache if available (during build)
  if (_allCardsCache) {
    return _allCardsCache.find(c => c.slug === slug) || null;
  }
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM card_content WHERE slug = ?', args: [slug] });
  if (result.rows.length === 0) return null;
  return rowToRichCard(result.rows[0] as Record<string, unknown>);
}

export async function getAllCardSlugs(): Promise<string[]> {
  const cards = await getAllCardContent();
  return cards.map(c => c.slug);
}

export async function getCardsByArcana(arcana: string): Promise<CardHubEntry[]> {
  const cards = await getAllCardContent();
  return cards
    .filter(c => c.arcana === arcana)
    .map(c => ({
      slug: c.slug,
      name: c.name,
      arcana: c.arcana,
      suit: c.suit,
      number: c.number,
      featuredSnippet: c.featuredSnippet,
      cardId: c.cardId,
    }));
}

export async function getCardsBySuit(suit: string): Promise<CardHubEntry[]> {
  const cards = await getAllCardContent();
  return cards
    .filter(c => c.suit === suit)
    .map(c => ({
      slug: c.slug,
      name: c.name,
      arcana: c.arcana,
      suit: c.suit,
      number: c.number,
      featuredSnippet: c.featuredSnippet,
      cardId: c.cardId,
    }));
}

export async function getAllCardsForHub(): Promise<CardHubEntry[]> {
  const cards = await getAllCardContent();
  return cards.map(c => ({
    slug: c.slug,
    name: c.name,
    arcana: c.arcana,
    suit: c.suit,
    number: c.number,
    featuredSnippet: c.featuredSnippet,
    cardId: c.cardId,
  }));
}

export async function upsertCardContent(data: RichCardContent): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO card_content (
      slug, card_id, name, arcana, suit, number, element, zodiac,
      upright_keywords, reversed_keywords, featured_snippet,
      upright_meaning, reversed_meaning, love_relationships,
      career_finances, yes_or_no, yes_or_no_verdict,
      combinations, faq, related_cards, meta_title, meta_description,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      data.slug, data.cardId, data.name, data.arcana, data.suit, data.number,
      data.element, data.zodiac,
      JSON.stringify(data.uprightKeywords), JSON.stringify(data.reversedKeywords),
      data.featuredSnippet, data.uprightMeaning, data.reversedMeaning,
      data.loveRelationships, data.careerFinances, data.yesOrNo, data.yesOrNoVerdict,
      JSON.stringify(data.combinations), JSON.stringify(data.faq),
      JSON.stringify(data.relatedCards), data.metaTitle, data.metaDescription,
    ],
  });
  _allCardsCache = null; // invalidate cache
}
