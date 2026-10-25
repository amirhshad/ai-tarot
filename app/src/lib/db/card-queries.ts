import { getDb, ensureSchema } from './sqlite';
import type { RichCardContent, CardHubEntry } from '../seo/types';


/**
 * Map a DB row to RichCardContent in the requested locale.
 *
 * Localised content lives in suffixed columns beside the English ones
 * (`upright_meaning_fa`, `upright_meaning_ar`, …). `col` resolves one field by
 * deriving the suffix from the locale, so adding a locale means adding columns
 * and nothing here — it replaced one hand-written ternary per field per locale,
 * which is 16 for Farsi alone and would have been 32 with Arabic.
 *
 * The English fallback is deliberate and load-bearing: a locale with no row for
 * a field renders the English one. That is why card-meaning routes are gated by
 * `CARD_CONTENT_LOCALES` — without the gate this fallback would quietly serve
 * English card text under a localised URL.
 */
function rowToRichCard(row: Record<string, unknown>, locale: string = 'en'): RichCardContent {
  const suffix = locale === 'en' ? '' : `_${locale}`;
  const col = (name: string): unknown =>
    (suffix && row[`${name}${suffix}`]) || row[name];

  // The deepening experiment's extra content is English-only. Appending English
  // sections to a localised page would be worse than having none.
  const isEnglish = locale === 'en';

  return {
    slug: row.slug as string,
    cardId: row.card_id as number,
    name: col('name') as string,
    arcana: row.arcana as 'major' | 'minor',
    suit: (row.suit as string) || null,
    number: row.number as number,
    element: (row.element as string) || null,
    zodiac: (row.zodiac as string) || null,
    uprightKeywords: JSON.parse(col('upright_keywords') as string),
    reversedKeywords: JSON.parse(col('reversed_keywords') as string),
    featuredSnippet: col('featured_snippet') as string,
    uprightMeaning: col('upright_meaning') as string,
    reversedMeaning: col('reversed_meaning') as string,
    loveRelationships: col('love_relationships') as string,
    careerFinances: col('career_finances') as string,
    asFeelings: (col('as_feelings') as string) || null,
    howSomeoneSeesYou: (col('how_someone_sees_you') as string) || null,
    advice: (col('advice') as string) || null,
    yesOrNo: col('yes_or_no') as string,
    yesOrNoVerdict: row.yes_or_no_verdict as 'yes' | 'no' | 'maybe',
    combinations: JSON.parse(col('combinations') as string),
    faq: [
      ...JSON.parse(col('faq') as string),
      ...(isEnglish && row.deep_faq ? JSON.parse(row.deep_faq as string) : []),
    ],
    deepSections: isEnglish && row.deep_sections ? JSON.parse(row.deep_sections as string) : [],
    relatedCards: JSON.parse(row.related_cards as string),
    metaTitle: col('meta_title') as string,
    metaDescription: col('meta_description') as string,
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

/**
 * slug -> the day that card's content last changed, as `YYYY-MM-DD`.
 *
 * For the sitemap's `lastModified`. `updated_at` is already maintained by every
 * script that writes card content, and it already holds real per-card dates —
 * the 8 pages from the August deepening carry 2026-08-30 while untouched cards
 * carry 2026-04-10 or 2026-05-14. The sitemap used to publish one hardcoded
 * constant for all 78, which told Google nothing had changed on precisely the
 * pages whose change we needed it to notice.
 *
 * Returns an empty map rather than throwing: a sitemap that 500s is worse than
 * one with slightly stale dates, so the caller falls back to its constant.
 *
 * One row carries both the English and Farsi columns, so both locales of a card
 * advertise the same date. That is imprecise but never wrong in the direction
 * that matters — it cannot claim a page is older than it is.
 */
export async function getCardLastModifiedMap(): Promise<Record<string, string>> {
  try {
    await ensureSchema();
    const db = getDb();
    const result = await db.execute(
      "SELECT slug, substr(coalesce(updated_at, created_at), 1, 10) AS day FROM card_content",
    );
    const map: Record<string, string> = {};
    for (const row of result.rows as unknown as { slug: string; day: string | null }[]) {
      if (row.slug && row.day) map[row.slug] = row.day;
    }
    return map;
  } catch (err) {
    console.error('sitemap: could not read card updated_at, falling back to constant', err);
    return {};
  }
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
