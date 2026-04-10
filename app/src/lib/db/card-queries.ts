import { getDb, ensureSchema } from './sqlite';
import type { RichCardContent, CardHubEntry } from '../seo/types';


/** Map a DB row to RichCardContent, using Farsi columns when locale is 'fa' with English fallback */
function rowToRichCard(row: Record<string, unknown>, locale: string = 'en'): RichCardContent {
  const fa = locale === 'fa';
  return {
    slug: row.slug as string,
    cardId: row.card_id as number,
    name: (fa && row.name_fa ? row.name_fa : row.name) as string,
    arcana: row.arcana as 'major' | 'minor',
    suit: (row.suit as string) || null,
    number: row.number as number,
    element: (row.element as string) || null,
    zodiac: (row.zodiac as string) || null,
    uprightKeywords: JSON.parse((fa && row.upright_keywords_fa ? row.upright_keywords_fa : row.upright_keywords) as string),
    reversedKeywords: JSON.parse((fa && row.reversed_keywords_fa ? row.reversed_keywords_fa : row.reversed_keywords) as string),
    featuredSnippet: (fa && row.featured_snippet_fa ? row.featured_snippet_fa : row.featured_snippet) as string,
    uprightMeaning: (fa && row.upright_meaning_fa ? row.upright_meaning_fa : row.upright_meaning) as string,
    reversedMeaning: (fa && row.reversed_meaning_fa ? row.reversed_meaning_fa : row.reversed_meaning) as string,
    loveRelationships: (fa && row.love_relationships_fa ? row.love_relationships_fa : row.love_relationships) as string,
    careerFinances: (fa && row.career_finances_fa ? row.career_finances_fa : row.career_finances) as string,
    asFeelings: ((fa && row.as_feelings_fa ? row.as_feelings_fa : row.as_feelings) as string) || null,
    howSomeoneSeesYou: ((fa && row.how_someone_sees_you_fa ? row.how_someone_sees_you_fa : row.how_someone_sees_you) as string) || null,
    advice: ((fa && row.advice_fa ? row.advice_fa : row.advice) as string) || null,
    yesOrNo: (fa && row.yes_or_no_fa ? row.yes_or_no_fa : row.yes_or_no) as string,
    yesOrNoVerdict: row.yes_or_no_verdict as 'yes' | 'no' | 'maybe',
    combinations: JSON.parse((fa && row.combinations_fa ? row.combinations_fa : row.combinations) as string),
    faq: JSON.parse((fa && row.faq_fa ? row.faq_fa : row.faq) as string),
    relatedCards: JSON.parse(row.related_cards as string),
    metaTitle: (fa && row.meta_title_fa ? row.meta_title_fa : row.meta_title) as string,
    metaDescription: (fa && row.meta_description_fa ? row.meta_description_fa : row.meta_description) as string,
  };
}

// Locale-keyed caches for build-time performance
const _cardsCacheByLocale: Record<string, RichCardContent[]> = {};

export async function getAllCardContent(locale: string = 'en'): Promise<RichCardContent[]> {
  if (_cardsCacheByLocale[locale]) return _cardsCacheByLocale[locale];
  await ensureSchema();
  const db = getDb();
  const result = await db.execute('SELECT * FROM card_content ORDER BY card_id');
  _cardsCacheByLocale[locale] = result.rows.map(row => rowToRichCard(row as Record<string, unknown>, locale));
  return _cardsCacheByLocale[locale];
}

export async function getCardContent(slug: string, locale: string = 'en'): Promise<RichCardContent | null> {
  // Use cache if available (during build)
  if (_cardsCacheByLocale[locale]) {
    return _cardsCacheByLocale[locale].find(c => c.slug === slug) || null;
  }
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM card_content WHERE slug = ?', args: [slug] });
  if (result.rows.length === 0) return null;
  return rowToRichCard(result.rows[0] as Record<string, unknown>, locale);
}

export async function getAllCardSlugs(): Promise<string[]> {
  const cards = await getAllCardContent();
  return cards.map(c => c.slug);
}

export async function getCardsByArcana(arcana: string, locale: string = 'en'): Promise<CardHubEntry[]> {
  const cards = await getAllCardContent(locale);
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

export async function getCardsBySuit(suit: string, locale: string = 'en'): Promise<CardHubEntry[]> {
  const cards = await getAllCardContent(locale);
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

export async function getAllCardsForHub(locale: string = 'en'): Promise<CardHubEntry[]> {
  const cards = await getAllCardContent(locale);
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
  // invalidate all locale caches
  for (const key of Object.keys(_cardsCacheByLocale)) {
    delete _cardsCacheByLocale[key];
  }
}
