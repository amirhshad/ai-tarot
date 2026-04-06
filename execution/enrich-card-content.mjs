/**
 * Enrich existing card content with 3 new SEO sections:
 *   - "As Feelings"
 *   - "How Someone Sees You"
 *   - "Advice"
 *
 * Non-destructive: only UPDATEs the 3 new columns, never touches existing content.
 *
 * Usage:
 *   cd app && node ../execution/enrich-card-content.mjs
 *
 * Options:
 *   --limit=N     Only process N cards (for testing)
 *   --card=slug   Process a specific card only
 *   --dry-run     Print prompts without calling the API
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

// ── Generate enrichment for one card ─────────────────────────────────
async function generateEnrichment(anthropic, cardRow) {
  const { name, arcana, suit, element, keywords, upright_meaning } = cardRow;

  const cardContext = arcana === 'minor'
    ? `${name} is a Minor Arcana card from the Suit of ${suit.charAt(0).toUpperCase() + suit.slice(1)} (element: ${element}).`
    : `${name} is a Major Arcana card (element: ${element}).`;

  // Pass a snippet of existing upright meaning for tone/context consistency
  const contextSnippet = upright_meaning.slice(0, 500);

  const prompt = `Generate three additional content sections for the tarot card "${name}".

${cardContext}
Keywords: ${keywords}

Here is the existing upright meaning for context (do not repeat this content):
"${contextSnippet}..."

Return a JSON object with these exact keys:

{
  "as_feelings": "200-300 words. What does ${name} represent when it appears as someone's feelings toward you or about a situation? Cover both upright and reversed. Address what emotional state this card reveals — the depth, quality, and nature of those feelings. Be specific about what this card says about attraction, affection, anxiety, excitement, etc. as relevant to this card's energy.",

  "how_someone_sees_you": "200-300 words. When ${name} appears in a 'how someone sees you' position, what does it reveal about their perception? Cover both upright and reversed. Be specific about what qualities, traits, or role this person is attributing to you. Address both romantic and non-romantic contexts.",

  "advice": "200-300 words. What guidance does ${name} offer when drawn as advice? Cover both upright and reversed. Be actionable and specific — what should the querent consider doing, reflecting on, or changing? Frame as empowering guidance, not commands."
}

IMPORTANT: Return ONLY the JSON object. No markdown code blocks. No extra text.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Failed to parse JSON for ${name}: ${text.slice(0, 300)}`);

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate required fields
  for (const key of ['as_feelings', 'how_someone_sees_you', 'advice']) {
    if (!parsed[key]) throw new Error(`Missing field "${key}" for ${name}`);
  }

  return parsed;
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const cardArg = args.find(a => a.startsWith('--card='));
  const dryRun = args.includes('--dry-run');
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;
  const onlyCard = cardArg ? cardArg.split('=')[1] : null;

  const { apiKey, dbUrl, dbToken } = loadEnv();
  if (!apiKey && !dryRun) throw new Error('ANTHROPIC_API_KEY not found');

  const anthropic = dryRun ? null : new Anthropic({ apiKey });
  const db = createClient({ url: dbUrl, authToken: dbToken });

  // Fetch all cards that need enrichment
  let query = 'SELECT slug, name, arcana, suit, element, upright_keywords as keywords, upright_meaning FROM card_content';
  const queryArgs = [];

  if (onlyCard) {
    query += ' WHERE slug = ?';
    queryArgs.push(onlyCard);
  } else {
    // Only enrich cards that don't have the new fields yet
    query += ' WHERE as_feelings IS NULL';
  }
  query += ' ORDER BY card_id';

  const result = await db.execute({ sql: query, args: queryArgs });
  let cards = result.rows;

  if (cards.length === 0) {
    console.log('All cards already enriched. Use --card=slug to re-enrich a specific card.');
    return;
  }

  if (limit) cards = cards.slice(0, limit);

  console.log(dryRun ? '=== DRY RUN ===' : '=== ENRICHING CARDS ===');
  console.log(`Processing ${cards.length} card(s)\n`);

  let processed = 0;

  for (const cardRow of cards) {
    const slug = cardRow.slug;
    console.log(`[${processed + 1}/${cards.length}] ${cardRow.name}...`);

    if (dryRun) {
      console.log(`  Would generate: as_feelings, how_someone_sees_you, advice`);
      processed++;
      continue;
    }

    try {
      const data = await generateEnrichment(anthropic, cardRow);

      // Log word counts
      const wordCount = [data.as_feelings, data.how_someone_sees_you, data.advice]
        .join(' ').split(/\s+/).length;
      console.log(`  → ${wordCount} words total`);

      // Non-destructive UPDATE — only touches the 3 new columns
      await db.execute({
        sql: `UPDATE card_content SET as_feelings = ?, how_someone_sees_you = ?, advice = ?, updated_at = datetime('now') WHERE slug = ?`,
        args: [data.as_feelings, data.how_someone_sees_you, data.advice, slug],
      });

      processed++;
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }

  console.log(`\nDone! Enriched ${processed} card(s).`);
}

main().catch(console.error);
