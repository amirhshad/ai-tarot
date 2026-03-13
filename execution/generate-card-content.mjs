/**
 * One-time script: Generate AI narrative content for all 78 tarot cards.
 * Uses Claude Haiku for cost efficiency.
 *
 * Usage:
 *   cd app && node ../execution/generate-card-content.mjs
 *
 * Requires ANTHROPIC_API_KEY in app/.env.local
 */

import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve @anthropic-ai/sdk from app/node_modules
const require = createRequire(resolve(__dirname, '../app/package.json'));
const Anthropic = require('@anthropic-ai/sdk').default;

const OUTPUT_PATH = resolve(__dirname, '../app/src/data/card-content.json');
const ENV_PATH = resolve(__dirname, '../app/.env.local');

// Load API key from .env.local
function loadApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  if (existsSync(ENV_PATH)) {
    const env = readFileSync(ENV_PATH, 'utf-8');
    const match = env.match(/ANTHROPIC_API_KEY=(.+)/);
    if (match) return match[1].trim();
  }
  throw new Error('ANTHROPIC_API_KEY not found in environment or app/.env.local');
}

const anthropic = new Anthropic({ apiKey: loadApiKey() });

// Full deck data (inlined to avoid TS import issues in .mjs)
const MAJOR_ARCANA = [
  { id: 0, name: 'The Fool', arcana: 'major', suit: null, number: 0, keywords: ['beginnings', 'innocence', 'spontaneity', 'free spirit'] },
  { id: 1, name: 'The Magician', arcana: 'major', suit: null, number: 1, keywords: ['manifestation', 'resourcefulness', 'power', 'inspired action'] },
  { id: 2, name: 'The High Priestess', arcana: 'major', suit: null, number: 2, keywords: ['intuition', 'sacred knowledge', 'divine feminine', 'subconscious'] },
  { id: 3, name: 'The Empress', arcana: 'major', suit: null, number: 3, keywords: ['femininity', 'beauty', 'nature', 'abundance'] },
  { id: 4, name: 'The Emperor', arcana: 'major', suit: null, number: 4, keywords: ['authority', 'structure', 'control', 'fatherhood'] },
  { id: 5, name: 'The Hierophant', arcana: 'major', suit: null, number: 5, keywords: ['spiritual wisdom', 'tradition', 'conformity', 'education'] },
  { id: 6, name: 'The Lovers', arcana: 'major', suit: null, number: 6, keywords: ['love', 'harmony', 'relationships', 'values alignment'] },
  { id: 7, name: 'The Chariot', arcana: 'major', suit: null, number: 7, keywords: ['control', 'willpower', 'success', 'determination'] },
  { id: 8, name: 'Strength', arcana: 'major', suit: null, number: 8, keywords: ['strength', 'courage', 'persuasion', 'influence'] },
  { id: 9, name: 'The Hermit', arcana: 'major', suit: null, number: 9, keywords: ['soul-searching', 'introspection', 'being alone', 'inner guidance'] },
  { id: 10, name: 'Wheel of Fortune', arcana: 'major', suit: null, number: 10, keywords: ['good luck', 'karma', 'life cycles', 'destiny'] },
  { id: 11, name: 'Justice', arcana: 'major', suit: null, number: 11, keywords: ['justice', 'fairness', 'truth', 'cause and effect'] },
  { id: 12, name: 'The Hanged Man', arcana: 'major', suit: null, number: 12, keywords: ['pause', 'surrender', 'letting go', 'new perspectives'] },
  { id: 13, name: 'Death', arcana: 'major', suit: null, number: 13, keywords: ['endings', 'change', 'transformation', 'transition'] },
  { id: 14, name: 'Temperance', arcana: 'major', suit: null, number: 14, keywords: ['balance', 'moderation', 'patience', 'purpose'] },
  { id: 15, name: 'The Devil', arcana: 'major', suit: null, number: 15, keywords: ['shadow self', 'attachment', 'addiction', 'restriction'] },
  { id: 16, name: 'The Tower', arcana: 'major', suit: null, number: 16, keywords: ['sudden change', 'upheaval', 'chaos', 'revelation'] },
  { id: 17, name: 'The Star', arcana: 'major', suit: null, number: 17, keywords: ['hope', 'faith', 'purpose', 'renewal'] },
  { id: 18, name: 'The Moon', arcana: 'major', suit: null, number: 18, keywords: ['illusion', 'fear', 'anxiety', 'subconscious'] },
  { id: 19, name: 'The Sun', arcana: 'major', suit: null, number: 19, keywords: ['positivity', 'fun', 'warmth', 'success'] },
  { id: 20, name: 'Judgement', arcana: 'major', suit: null, number: 20, keywords: ['judgement', 'rebirth', 'inner calling', 'absolution'] },
  { id: 21, name: 'The World', arcana: 'major', suit: null, number: 21, keywords: ['completion', 'integration', 'accomplishment', 'travel'] },
];

function minorCards(suit, idStart) {
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
  }));
}

const DECK = [
  ...MAJOR_ARCANA,
  ...minorCards('wands', 22),
  ...minorCards('cups', 36),
  ...minorCards('swords', 50),
  ...minorCards('pentacles', 64),
];

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function generateCardContent(card) {
  const isMinor = card.arcana === 'minor';
  const cardContext = isMinor
    ? `${card.name} is a Minor Arcana card from the suit of ${card.suit}. Number ${card.number} in its suit.`
    : `${card.name} is Major Arcana card number ${card.number} in the Rider-Waite-Smith tarot deck.`;

  const prompt = `Write tarot card meaning content for ${card.name}.

${cardContext}
Keywords: ${card.keywords.join(', ')}

Write three sections in JSON format:
1. "upright" — The upright meaning. 150-180 words. Narrative tone, insightful, specific to this card. Explain what this card reveals when it appears upright in an AI tarot reading. Reference the card's imagery and symbolism from the Rider-Waite-Smith deck.
2. "reversed" — The reversed meaning. 100-130 words. What shifts when this card appears reversed. Not simply the opposite — nuanced.
3. "inReading" — How this card behaves in readings. 80-100 words. What it means in different positions (past/present/future), how it interacts with surrounding cards, what questions it answers best.
4. "summary" — A single sentence (max 25 words) capturing the essence of this card. Used as a preview/snippet.

Tone: Insightful, warm, accessible. Not mystical-fluffy — grounded and specific.
Do NOT use phrases like "In the realm of" or "This card invites you to". Be direct.

Return ONLY valid JSON with keys: upright, reversed, inReading, summary`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Failed to parse JSON for ${card.name}: ${text.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]);
}

async function main() {
  // Load existing content to support resuming
  let existing = {};
  if (existsSync(OUTPUT_PATH)) {
    existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8'));
    console.log(`Loaded ${Object.keys(existing).length} existing entries`);
  }

  const results = { ...existing };
  let generated = 0;
  let skipped = 0;

  for (const card of DECK) {
    const slug = toSlug(card.name);

    if (results[slug]) {
      skipped++;
      continue;
    }

    try {
      console.log(`Generating [${generated + skipped + 1}/${DECK.length}] ${card.name}...`);
      const content = await generateCardContent(card);
      results[slug] = {
        id: card.id,
        name: card.name,
        slug,
        arcana: card.arcana,
        suit: card.suit || null,
        number: card.number,
        keywords: card.keywords,
        ...content,
      };
      generated++;

      // Save after each card (resume-safe)
      writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));

      // Small delay to avoid rate limiting
      if (generated % 10 === 0) {
        console.log(`  ... ${generated} generated, ${skipped} skipped. Saving checkpoint.`);
      }
    } catch (err) {
      console.error(`Error generating ${card.name}:`, err.message);
      // Continue with next card
    }
  }

  console.log(`\nDone! Generated: ${generated}, Skipped: ${skipped}, Total: ${Object.keys(results).length}/78`);
  console.log(`Output: ${OUTPUT_PATH}`);
}

main().catch(console.error);
