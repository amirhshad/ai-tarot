/**
 * Generate rich SEO content for all 78 tarot cards.
 * Outputs ~1,800–2,500 words per card with structured sections.
 * Writes directly to Turso DB.
 *
 * Usage:
 *   cd app && node ../execution/generate-rich-card-content.mjs
 *
 * Options:
 *   --limit=5    Only generate N cards (for testing)
 *   --card=slug  Generate a specific card only
 *
 * Requires ANTHROPIC_API_KEY and TURSO_DATABASE_URL in app/.env.local
 */

import { createRequire } from 'module';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, '../app/package.json'));
const Anthropic = require('@anthropic-ai/sdk').default;
const { createClient } = require('@libsql/client');

const ENV_PATH = resolve(__dirname, '../app/.env.local');

// ── Load environment ──────────────────────────────────────────────────
function loadEnv() {
  const env = {};
  if (existsSync(ENV_PATH)) {
    const lines = readFileSync(ENV_PATH, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([A-Z_]+)=(.+)/);
      if (match) env[match[1]] = match[2].trim();
    }
  }
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY,
    dbUrl: process.env.TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || 'file:data/tarot.db',
    dbToken: process.env.TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN,
  };
}

// ── Deck data (inlined to avoid TS import issues in .mjs) ─────────────
const MAJOR_ARCANA = [
  { id: 0, name: 'The Fool', arcana: 'major', suit: null, number: 0, keywords: ['beginnings', 'innocence', 'spontaneity', 'free spirit'], element: 'Air', zodiac: 'Uranus' },
  { id: 1, name: 'The Magician', arcana: 'major', suit: null, number: 1, keywords: ['manifestation', 'resourcefulness', 'power', 'inspired action'], element: 'Air', zodiac: 'Mercury' },
  { id: 2, name: 'The High Priestess', arcana: 'major', suit: null, number: 2, keywords: ['intuition', 'sacred knowledge', 'divine feminine', 'subconscious'], element: 'Water', zodiac: 'Moon' },
  { id: 3, name: 'The Empress', arcana: 'major', suit: null, number: 3, keywords: ['femininity', 'beauty', 'nature', 'abundance'], element: 'Earth', zodiac: 'Venus' },
  { id: 4, name: 'The Emperor', arcana: 'major', suit: null, number: 4, keywords: ['authority', 'structure', 'control', 'fatherhood'], element: 'Fire', zodiac: 'Aries' },
  { id: 5, name: 'The Hierophant', arcana: 'major', suit: null, number: 5, keywords: ['spiritual wisdom', 'tradition', 'conformity', 'education'], element: 'Earth', zodiac: 'Taurus' },
  { id: 6, name: 'The Lovers', arcana: 'major', suit: null, number: 6, keywords: ['love', 'harmony', 'relationships', 'values alignment'], element: 'Air', zodiac: 'Gemini' },
  { id: 7, name: 'The Chariot', arcana: 'major', suit: null, number: 7, keywords: ['control', 'willpower', 'success', 'determination'], element: 'Water', zodiac: 'Cancer' },
  { id: 8, name: 'Strength', arcana: 'major', suit: null, number: 8, keywords: ['strength', 'courage', 'persuasion', 'influence'], element: 'Fire', zodiac: 'Leo' },
  { id: 9, name: 'The Hermit', arcana: 'major', suit: null, number: 9, keywords: ['soul-searching', 'introspection', 'being alone', 'inner guidance'], element: 'Earth', zodiac: 'Virgo' },
  { id: 10, name: 'Wheel of Fortune', arcana: 'major', suit: null, number: 10, keywords: ['good luck', 'karma', 'life cycles', 'destiny'], element: 'Fire', zodiac: 'Jupiter' },
  { id: 11, name: 'Justice', arcana: 'major', suit: null, number: 11, keywords: ['justice', 'fairness', 'truth', 'cause and effect'], element: 'Air', zodiac: 'Libra' },
  { id: 12, name: 'The Hanged Man', arcana: 'major', suit: null, number: 12, keywords: ['pause', 'surrender', 'letting go', 'new perspectives'], element: 'Water', zodiac: 'Neptune' },
  { id: 13, name: 'Death', arcana: 'major', suit: null, number: 13, keywords: ['endings', 'change', 'transformation', 'transition'], element: 'Water', zodiac: 'Scorpio' },
  { id: 14, name: 'Temperance', arcana: 'major', suit: null, number: 14, keywords: ['balance', 'moderation', 'patience', 'purpose'], element: 'Fire', zodiac: 'Sagittarius' },
  { id: 15, name: 'The Devil', arcana: 'major', suit: null, number: 15, keywords: ['shadow self', 'attachment', 'addiction', 'restriction'], element: 'Earth', zodiac: 'Capricorn' },
  { id: 16, name: 'The Tower', arcana: 'major', suit: null, number: 16, keywords: ['sudden change', 'upheaval', 'chaos', 'revelation'], element: 'Fire', zodiac: 'Mars' },
  { id: 17, name: 'The Star', arcana: 'major', suit: null, number: 17, keywords: ['hope', 'faith', 'purpose', 'renewal'], element: 'Air', zodiac: 'Aquarius' },
  { id: 18, name: 'The Moon', arcana: 'major', suit: null, number: 18, keywords: ['illusion', 'fear', 'anxiety', 'subconscious'], element: 'Water', zodiac: 'Pisces' },
  { id: 19, name: 'The Sun', arcana: 'major', suit: null, number: 19, keywords: ['positivity', 'fun', 'warmth', 'success'], element: 'Fire', zodiac: 'Sun' },
  { id: 20, name: 'Judgement', arcana: 'major', suit: null, number: 20, keywords: ['judgement', 'rebirth', 'inner calling', 'absolution'], element: 'Fire', zodiac: 'Pluto' },
  { id: 21, name: 'The World', arcana: 'major', suit: null, number: 21, keywords: ['completion', 'integration', 'accomplishment', 'travel'], element: 'Earth', zodiac: 'Saturn' },
];

function minorCards(suit, idStart, element) {
  const names = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
  const keywordMap = {
    wands: [
      ['inspiration', 'new opportunities', 'growth', 'potential'],
      ['future planning', 'progress', 'decisions', 'discovery'],
      ['progress', 'expansion', 'foresight', 'overseas opportunities'],
      ['celebration', 'joy', 'harmony', 'relaxation'],
      ['disagreement', 'competition', 'tension', 'conflict'],
      ['success', 'public recognition', 'progress', 'self-confidence'],
      ['challenge', 'competition', 'protection', 'perseverance'],
      ['speed', 'action', 'air travel', 'movement'],
      ['resilience', 'courage', 'persistence', 'test of faith'],
      ['burden', 'extra responsibility', 'hard work', 'completion'],
      ['inspiration', 'ideas', 'discovery', 'limitless potential'],
      ['energy', 'passion', 'adventure', 'impulsiveness'],
      ['courage', 'confidence', 'independence', 'social butterfly'],
      ['natural leader', 'vision', 'entrepreneur', 'honour'],
    ],
    cups: [
      ['love', 'new feelings', 'emotional awakening', 'creativity'],
      ['unified love', 'partnership', 'mutual attraction', 'connection'],
      ['celebration', 'friendship', 'creativity', 'community'],
      ['meditation', 'contemplation', 'apathy', 'reevaluation'],
      ['regret', 'failure', 'disappointment', 'pessimism'],
      ['revisiting the past', 'childhood memories', 'innocence', 'joy'],
      ['opportunities', 'choices', 'wishful thinking', 'illusion'],
      ['disappointment', 'abandonment', 'withdrawal', 'escapism'],
      ['contentment', 'satisfaction', 'gratitude', 'wish come true'],
      ['divine love', 'blissful relationships', 'harmony', 'alignment'],
      ['creative opportunities', 'intuitive messages', 'curiosity', 'possibility'],
      ['creativity', 'romance', 'charm', 'imagination'],
      ['compassion', 'calm', 'comfort', 'emotional security'],
      ['emotional balance', 'compassion', 'diplomacy', 'wisdom'],
    ],
    swords: [
      ['breakthrough', 'clarity', 'sharp mind', 'truth'],
      ['difficult choices', 'indecision', 'stalemate', 'blocked emotions'],
      ['heartbreak', 'emotional pain', 'sorrow', 'grief'],
      ['rest', 'relaxation', 'meditation', 'contemplation'],
      ['conflict', 'disagreements', 'competition', 'defeat'],
      ['transition', 'change', 'rite of passage', 'releasing baggage'],
      ['betrayal', 'deception', 'getting away with something', 'strategy'],
      ['negative thoughts', 'self-imposed restriction', 'imprisonment', 'victim mentality'],
      ['anxiety', 'worry', 'fear', 'depression'],
      ['painful endings', 'deep wounds', 'betrayal', 'loss'],
      ['new ideas', 'curiosity', 'thirst for knowledge', 'new communication'],
      ['ambitious', 'action-oriented', 'driven to succeed', 'fast thinking'],
      ['independent', 'unbiased judgement', 'clear boundaries', 'direct communication'],
      ['mental clarity', 'intellectual power', 'authority', 'truth'],
    ],
    pentacles: [
      ['new financial opportunity', 'prosperity', 'abundance', 'security'],
      ['balance', 'adaptability', 'time management', 'prioritisation'],
      ['teamwork', 'collaboration', 'learning', 'implementation'],
      ['saving money', 'security', 'conservatism', 'scarcity'],
      ['financial loss', 'poverty', 'lack mindset', 'isolation'],
      ['giving', 'receiving', 'sharing wealth', 'generosity'],
      ['long-term view', 'sustainable results', 'perseverance', 'investment'],
      ['apprenticeship', 'repetitive tasks', 'mastery', 'skill development'],
      ['abundance', 'luxury', 'self-sufficiency', 'financial independence'],
      ['wealth', 'financial security', 'family', 'long-term success'],
      ['manifestation', 'financial opportunity', 'skill development', 'ambition'],
      ['hard work', 'productivity', 'routine', 'conservatism'],
      ['nurturing', 'practical', 'providing financially', 'working parent'],
      ['wealth', 'business', 'leadership', 'security'],
    ],
  };

  return names.map((rank, i) => ({
    id: idStart + i,
    name: `${rank} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
    arcana: 'minor',
    suit,
    number: i + 1,
    keywords: keywordMap[suit][i],
    element,
    zodiac: null,
  }));
}

const DECK = [
  ...MAJOR_ARCANA,
  ...minorCards('wands', 22, 'Fire'),
  ...minorCards('cups', 36, 'Water'),
  ...minorCards('swords', 50, 'Air'),
  ...minorCards('pentacles', 64, 'Earth'),
];

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Build a list of all slugs for combination references
const ALL_SLUGS = DECK.map(c => ({ slug: toSlug(c.name), name: c.name, arcana: c.arcana }));

// ── System prompt ─────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert tarot reader and writer creating SEO content for a premium AI tarot platform called TarotVeil. Write in a warm, insightful second-person voice ("you"). Your interpretations should be:

1. Narrative-driven — tell a story, don't list bullet points
2. Psychologically grounded — frame tarot as a tool for self-reflection
3. Specific and actionable — give concrete guidance, not vague platitudes
4. Balanced — acknowledge both shadow and light aspects of every card
5. Original — never copy existing tarot site content verbatim

Avoid: fortune-telling language ("you will..."), absolute predictions, medical/legal/financial advice, religious framing.

Use "this card invites you to consider..." or "the energy here suggests..." rather than "this means you will..."

You must return ONLY valid JSON. No markdown, no code blocks, no commentary.`;

// ── Generate content for one card ─────────────────────────────────────
async function generateCardContent(anthropic, card) {
  const slug = toSlug(card.name);
  const isMinor = card.arcana === 'minor';
  const cardContext = isMinor
    ? `${card.name} is a Minor Arcana card from the Suit of ${card.suit.charAt(0).toUpperCase() + card.suit.slice(1)} (element: ${card.element}). Number ${card.number} in its suit.`
    : `${card.name} is Major Arcana card number ${card.number} (element: ${card.element}, associated with ${card.zodiac}).`;

  // Pick 5-8 related cards for combination references
  const relatedForCombos = ALL_SLUGS
    .filter(c => c.slug !== slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 7);

  const comboList = relatedForCombos.map(c => `  - ${c.name} (slug: ${c.slug})`).join('\n');

  // Pick 3-5 thematically related cards
  const relatedSlugs = ALL_SLUGS
    .filter(c => c.slug !== slug)
    .filter(c => {
      if (card.arcana === 'major') return c.arcana === 'major';
      return c.arcana === 'minor';
    })
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .map(c => c.slug);

  const prompt = `Generate complete SEO content for the tarot card "${card.name}".

${cardContext}
Keywords: ${card.keywords.join(', ')}

Return a JSON object with these exact keys:

{
  "featured_snippet": "40-60 word self-contained paragraph defining this card. This will appear as the first thing readers see and should capture the card's core meaning.",

  "upright_keywords": ["5-7 upright keyword phrases"],
  "reversed_keywords": ["5-7 reversed keyword phrases"],

  "upright_meaning": "600-800 words. Deep narrative interpretation of the upright meaning. Cover general life meaning, spiritual significance, and practical guidance. Write in flowing paragraphs separated by newlines. Reference the Rider-Waite-Smith imagery.",

  "reversed_meaning": "400-600 words. Narrative interpretation of the reversed meaning. Explain what shifts in the card's energy when reversed. Not simply the opposite — nuanced and specific.",

  "love_relationships": "200-300 words. Both upright and reversed interpretations in the context of love, dating, and relationships. Cover singles and those in partnerships.",

  "career_finances": "200-300 words. Both upright and reversed in career, work, and financial contexts. Be specific about workplace scenarios.",

  "yes_or_no": "100-150 words. Clear verdict with explanation.",
  "yes_or_no_verdict": "yes" or "no" or "maybe",

  "combinations": [
    For each of these cards, write a 1-2 sentence description of what it means when paired with ${card.name}:
${comboList}
    Format: [{"slug": "card-slug", "name": "Card Name", "description": "What this combination means"}]
  ],

  "faq": [
    4-6 FAQ items targeting "People Also Ask" queries about ${card.name}. Common patterns:
    - "Is ${card.name} a good card?"
    - "What does ${card.name} mean in a love reading?"
    - "What does ${card.name} reversed mean?"
    - "Does ${card.name} mean yes or no?"
    - "What zodiac sign is ${card.name}?"
    - "What does ${card.name} mean as feelings?"
    Format: [{"question": "...", "answer": "40-80 word answer"}]
  ],

  "meta_title": "Max 55 characters. Format: '${card.name} Tarot Meaning — Upright & Reversed'",
  "meta_description": "Max 150 characters. Format: 'Discover the ${card.name} tarot card meaning. Learn upright and reversed interpretations for love, career, and life.'"
}

IMPORTANT: Return ONLY the JSON object. No markdown code blocks. No extra text.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Failed to parse JSON for ${card.name}: ${text.slice(0, 300)}`);

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate required fields
  const required = [
    'featured_snippet', 'upright_keywords', 'reversed_keywords',
    'upright_meaning', 'reversed_meaning', 'love_relationships',
    'career_finances', 'yes_or_no', 'yes_or_no_verdict',
    'combinations', 'faq', 'meta_title', 'meta_description',
  ];
  for (const key of required) {
    if (!parsed[key]) throw new Error(`Missing field "${key}" for ${card.name}`);
  }

  // Add card metadata + related cards
  return {
    slug,
    card_id: card.id,
    name: card.name,
    arcana: card.arcana,
    suit: card.suit || null,
    number: card.number,
    element: card.element || null,
    zodiac: card.zodiac || null,
    upright_keywords: JSON.stringify(parsed.upright_keywords),
    reversed_keywords: JSON.stringify(parsed.reversed_keywords),
    featured_snippet: parsed.featured_snippet,
    upright_meaning: parsed.upright_meaning,
    reversed_meaning: parsed.reversed_meaning,
    love_relationships: parsed.love_relationships,
    career_finances: parsed.career_finances,
    yes_or_no: parsed.yes_or_no,
    yes_or_no_verdict: parsed.yes_or_no_verdict,
    combinations: JSON.stringify(parsed.combinations),
    faq: JSON.stringify(parsed.faq),
    related_cards: JSON.stringify(relatedSlugs),
    meta_title: parsed.meta_title.slice(0, 60),
    meta_description: parsed.meta_description.slice(0, 155),
  };
}

// ── DB helpers ─────────────────────────────────────────────────────────
async function ensureTable(db) {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS card_content (
      slug TEXT PRIMARY KEY,
      card_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      arcana TEXT NOT NULL,
      suit TEXT,
      number INTEGER NOT NULL,
      element TEXT,
      zodiac TEXT,
      upright_keywords TEXT NOT NULL,
      reversed_keywords TEXT NOT NULL,
      featured_snippet TEXT NOT NULL,
      upright_meaning TEXT NOT NULL,
      reversed_meaning TEXT NOT NULL,
      love_relationships TEXT NOT NULL,
      career_finances TEXT NOT NULL,
      yes_or_no TEXT NOT NULL,
      yes_or_no_verdict TEXT NOT NULL,
      combinations TEXT NOT NULL,
      faq TEXT NOT NULL,
      related_cards TEXT NOT NULL,
      meta_title TEXT NOT NULL,
      meta_description TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

async function getExistingSlugs(db) {
  const result = await db.execute('SELECT slug FROM card_content');
  return new Set(result.rows.map(r => r.slug));
}

async function insertCard(db, data) {
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
      data.slug, data.card_id, data.name, data.arcana, data.suit, data.number,
      data.element, data.zodiac, data.upright_keywords, data.reversed_keywords,
      data.featured_snippet, data.upright_meaning, data.reversed_meaning,
      data.love_relationships, data.career_finances, data.yes_or_no,
      data.yes_or_no_verdict, data.combinations, data.faq, data.related_cards,
      data.meta_title, data.meta_description,
    ],
  });
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const cardArg = args.find(a => a.startsWith('--card='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;
  const onlyCard = cardArg ? cardArg.split('=')[1] : null;

  const { apiKey, dbUrl, dbToken } = loadEnv();
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found');

  const anthropic = new Anthropic({ apiKey });
  const db = createClient({ url: dbUrl, authToken: dbToken });

  await ensureTable(db);
  const existing = await getExistingSlugs(db);
  console.log(`Found ${existing.size} existing cards in DB`);

  let cards = DECK;
  if (onlyCard) {
    cards = cards.filter(c => toSlug(c.name) === onlyCard);
    if (cards.length === 0) throw new Error(`Card not found: ${onlyCard}`);
  }

  let generated = 0;
  let skipped = 0;

  for (const card of cards) {
    const slug = toSlug(card.name);

    if (existing.has(slug) && !onlyCard) {
      skipped++;
      continue;
    }

    if (limit && generated >= limit) {
      console.log(`Reached limit of ${limit} cards.`);
      break;
    }

    try {
      console.log(`[${generated + skipped + 1}/${cards.length}] Generating ${card.name}...`);
      const data = await generateCardContent(anthropic, card);

      // Log word counts for QA
      const wordCount = [
        data.upright_meaning, data.reversed_meaning,
        data.love_relationships, data.career_finances,
        data.yes_or_no, data.featured_snippet,
      ].join(' ').split(/\s+/).length;
      console.log(`  → ${wordCount} words, ${JSON.parse(data.faq).length} FAQs, ${JSON.parse(data.combinations).length} combos`);

      await insertCard(db, data);
      generated++;
    } catch (err) {
      console.error(`Error generating ${card.name}:`, err.message);
    }
  }

  console.log(`\nDone! Generated: ${generated}, Skipped: ${skipped}, Total in DB: ${existing.size + generated}/78`);
}

main().catch(console.error);
