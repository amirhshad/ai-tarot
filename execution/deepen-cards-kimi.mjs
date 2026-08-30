/**
 * Indexation experiment: deepen a small cohort of ENGLISH card pages with
 * Kimi K3, then watch whether those specific URLs get admitted to the index.
 *
 * Context: all 78 English card pages already average ~1,713 body words with an
 * identical section structure. Length is not the lever — sameness is. So this
 * script does NOT rewrite the existing copy. It adds per-card material that a
 * template cannot produce, and deliberately varies WHICH sections each card
 * gets so the cohort does not just become a second template.
 *
 * Non-destructive: only writes deep_sections / deep_faq / deepened_* columns.
 * Existing English and Farsi copy is never touched.
 *
 * Usage:
 *   node execution/deepen-cards-kimi.mjs --card=the-tower          # generate, review only
 *   node execution/deepen-cards-kimi.mjs --card=the-tower --write  # also write to Turso
 *   node execution/deepen-cards-kimi.mjs --all --write             # whole cohort
 *   node execution/deepen-cards-kimi.mjs --card=the-tower --dry-run
 *
 * Output is always written to execution/output/deepen/<slug>.json for review,
 * and a pre-write backup of affected rows to execution/output/deepen/backup-*.json.
 *
 * Requires MOONSHOT_API_KEY, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN in app/.env.local
 */

import { createRequire } from 'module';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, '../app/package.json'));
const { createClient } = require('@libsql/client');

const ENV_PATH = resolve(__dirname, '../app/.env.local');
const CARDS_DIR = resolve(__dirname, '../app/public/cards');
const OUT_DIR = resolve(__dirname, 'output/deepen');
const API_BASE = 'https://api.moonshot.ai/v1';
const MODEL = 'kimi-k3';

// ── The test cohort ───────────────────────────────────────────────────
// Every slug here was confirmed "Crawled - currently not indexed" via the GSC
// URL Inspection API on 2026-08-30, fetched successfully, self-canonical.
// Do NOT add cards that are already indexed — seven-of-swords, ace-of-swords
// and knight-of-cups are the untouched reference group.
const COHORT = [
  'the-tower',
  'death',
  'the-lovers',
  'the-moon',
  'three-of-swords',
  'ten-of-swords',
  'queen-of-pentacles',
  'six-of-cups',
];

// ── Section menu ──────────────────────────────────────────────────────
// Each card gets a DIFFERENT subset, in a different order. The whole point of
// the experiment is that the cohort must not look mass-produced.
const SECTION_LIBRARY = {
  symbolism: {
    heading: 'The Symbolism, Read Closely',
    brief: `Walk through what Pamela Colman Smith actually drew on THIS card in the 1909 Rider-Waite-Smith deck — the specific objects, figures, colours, postures, background details, and what each one carries. Be concrete and visual: name the things on the card. Explain why a detail is placed where it is. 350-450 words. This section must be impossible to write about any other card.`,
  },
  lineage: {
    heading: 'How Other Decks See This Card',
    brief: `Compare how this specific card differs across the Marseille tradition, the Rider-Waite-Smith, and Crowley/Harris's Thoth deck — different names, different imagery, different emphasis, and what those differences reveal about the card's meaning. If the card was renumbered or renamed historically, say so. Accuracy matters more than length here: if you are not confident about a specific historical claim, leave it out rather than inventing it. 250-350 words.`,
  },
  vignettes: {
    heading: 'What It Looks Like in a Real Reading',
    brief: `Three short, concrete scenarios where someone pulls this card — a specific situation, what they were asking, and how the card lands for them. Make them ordinary and human (a job offer, a text left unanswered, a move, a diagnosis-adjacent worry handled gently). Each 100-150 words, separated by a blank line. Reflective, never predictive.`,
  },
  misreadings: {
    heading: 'What This Card Is Not',
    brief: `The three or four most common misreadings of this specific card, and what the card is actually pointing at instead. Be direct about the pop-culture distortions. 250-350 words.`,
  },
  reversalNuance: {
    heading: 'Reading the Reversal by Position',
    brief: `How the reversed meaning of this card shifts depending on where it lands — past vs present vs future, as an obstacle, as advice, as an outcome position. Give the reader a way to tell an "internalised" reversal from a "blocked" one for this particular card. 300-400 words.`,
  },
  timing: {
    heading: 'Timing and Season',
    brief: `The traditional timing associations for this card — astrological correspondence, season, pace of events — and an honest note on how much weight to give timing readings at all. 200-300 words.`,
  },
  shadow: {
    heading: 'Sitting With the Harder Side',
    brief: `An honest, grounded look at the difficult territory this card touches, written for a reader who may actually be in it right now. Compassionate, non-clinical, no medical or crisis advice. 250-350 words.`,
  },
  journaling: {
    heading: 'Questions to Sit With',
    brief: `Five to seven journalling prompts specific to this card — not generic tarot prompts. Each one should only make sense for this card. Present as a numbered list, one per line.`,
  },
};

// Per-card section plans. Varied on purpose.
const PLANS = {
  'the-tower':          ['symbolism', 'misreadings', 'shadow', 'vignettes', 'lineage'],
  'death':              ['misreadings', 'symbolism', 'lineage', 'vignettes', 'journaling'],
  'the-lovers':         ['symbolism', 'lineage', 'reversalNuance', 'vignettes'],
  'the-moon':           ['symbolism', 'shadow', 'reversalNuance', 'journaling', 'timing'],
  'three-of-swords':    ['shadow', 'symbolism', 'vignettes', 'misreadings'],
  'ten-of-swords':      ['symbolism', 'misreadings', 'reversalNuance', 'vignettes'],
  'queen-of-pentacles': ['symbolism', 'vignettes', 'reversalNuance', 'timing', 'journaling'],
  'six-of-cups':        ['symbolism', 'lineage', 'vignettes', 'journaling'],
};

// ── Environment ───────────────────────────────────────────────────────
function loadEnv() {
  const env = {};
  if (existsSync(ENV_PATH)) {
    for (const line of readFileSync(ENV_PATH, 'utf-8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.+)/);
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return {
    apiKey: process.env.MOONSHOT_API_KEY || env.MOONSHOT_API_KEY,
    dbUrl: process.env.TURSO_DATABASE_URL || env.TURSO_DATABASE_URL,
    dbToken: process.env.TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN,
  };
}

// ── Card image ────────────────────────────────────────────────────────
// K3 supports image input. The first review pass showed it describing the RWS
// imagery from memory and getting it wrong (it placed The Tower's lightning on
// the left; it strikes from the upper right, and the sky has clouds, not the
// solid black it claimed). Attaching the actual asset removes that whole class
// of error from the symbolism section.
// Assets are major/m00.jpg…m21.jpg and minor/{c,p,s,w}01.jpg…14.jpg
const SUIT_LETTER = { cups: 'c', pentacles: 'p', swords: 's', wands: 'w' };

function cardImageDataUrl(card) {
  const n = String(card.number).padStart(2, '0');
  const rel = card.arcana === 'major'
    ? `major/m${n}.jpg`
    : `minor/${SUIT_LETTER[card.suit]}${n}.jpg`;
  const path = resolve(CARDS_DIR, rel);
  if (!existsSync(path)) return null;
  return { url: `data:image/jpeg;base64,${readFileSync(path).toString('base64')}`, rel };
}

// ── Prompts ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a tarot scholar and essayist writing for TarotVeil, a premium AI tarot platform. You are NOT writing generic SEO filler — you are writing the material a serious reader cannot find on the twenty interchangeable tarot sites that already rank.

Voice and rules:
1. Narrative and symbolic — cohesive prose, never bullet-point summaries (except where a section explicitly asks for a list).
2. Second person ("you"), warm, reflective, psychologically grounded.
3. NEVER predictive or deterministic. Never "you will", "this means you are going to", "expect that". Use "this card invites you to consider", "the energy here suggests", "readers often find".
4. No medical, legal, or financial advice. No religious framing. No crisis instructions.
5. Concrete over abstract. Name the actual objects on the actual card. Cite the actual historical deck. Vague mysticism is failure.
5b. When a card image is attached, DESCRIBE WHAT YOU SEE IN IT, not what you remember about the card. Directions (left/right/above), colours, how many figures, what is in the sky and background — read them off the image. If the image contradicts your memory of the deck, the image wins.
6. Original prose. Never reproduce phrasing from Biddy Tarot, Labyrinthos, or any existing tarot site.
7. Do not repeat what the existing page already says — you are given it so you can AVOID overlapping with it.

Return ONLY valid JSON. No markdown fences, no commentary before or after.`;

function buildUserPrompt(card, planKeys) {
  const sections = planKeys.map(k => SECTION_LIBRARY[k]);
  const existing = [
    `UPRIGHT: ${card.upright_meaning}`,
    `REVERSED: ${card.reversed_meaning}`,
    `LOVE: ${card.love_relationships}`,
    `CAREER: ${card.career_finances}`,
    card.as_feelings ? `AS FEELINGS: ${card.as_feelings}` : '',
    card.advice ? `ADVICE: ${card.advice}` : '',
  ].filter(Boolean).join('\n\n');

  const existingFaq = JSON.parse(card.faq || '[]').map(f => `- ${f.question}`).join('\n');

  return `Card: ${card.name}
Arcana: ${card.arcana}${card.suit ? ` / Suit of ${card.suit}` : ''}
Number: ${card.number}
Element: ${card.element || 'n/a'}   Astrological: ${card.zodiac || 'n/a'}
Upright keywords: ${JSON.parse(card.upright_keywords || '[]').join(', ')}
Reversed keywords: ${JSON.parse(card.reversed_keywords || '[]').join(', ')}

=== CONTENT ALREADY ON THE PAGE (do not repeat or paraphrase any of this) ===
${existing}

=== FAQ QUESTIONS ALREADY ON THE PAGE (do not repeat these) ===
${existingFaq}

=== YOUR TASK ===
Write ${sections.length} new sections for this page, in this exact order:

${sections.map((s, i) => `${i + 1}. id: "${planKeys[i]}"  heading: "${s.heading}"\n   ${s.brief}`).join('\n\n')}

Then write 9 NEW FAQ entries. These must be questions a real person actually types into Google about ${card.name} — long-tail, specific, sometimes awkwardly phrased, the way real search queries are. They must not duplicate the existing FAQ questions listed above. Each answer is 60-110 words, and answers the question directly in the first sentence.

Return JSON in exactly this shape:
{
  "sections": [
    { "id": "<the id given above>", "heading": "<the heading given above>", "body": "<prose, paragraphs separated by \\n\\n>" }
  ],
  "faq": [
    { "question": "...", "answer": "..." }
  ]
}`;
}

// ── Kimi call ─────────────────────────────────────────────────────────
// Streamed, because kimi-k3 reasons for minutes before the first content token
// and a non-streamed request trips undici's 300s headers timeout.
async function callKimi(apiKey, userPrompt, imageUrl) {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 1, // kimi-k3 rejects any other value
      // K3 is a reasoning model and reasoning tokens count against max_tokens.
      // At default effort a 5-section card burned 15.9k tokens thinking and
      // emitted 445 chars of prose, so: low effort, generous ceiling.
      max_tokens: 48000,
      reasoning_effort: 'low',
      response_format: { type: 'json_object' },
      stream: true,
      stream_options: { include_usage: true },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: imageUrl
            ? [{ type: 'image_url', image_url: { url: imageUrl } }, { type: 'text', text: userPrompt }]
            : userPrompt,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Moonshot ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }

  let text = '';
  let usage = null;
  let buf = '';
  const decoder = new TextDecoder();

  for await (const chunk of res.body) {
    buf += decoder.decode(chunk, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;
      let evt;
      try { evt = JSON.parse(payload); } catch { continue; }
      if (evt.usage) usage = evt.usage;
      const delta = evt.choices?.[0]?.delta?.content;
      // Progress dots go to stderr so stdout stays parseable. They used to go
      // to stdout, which meant callers filtered them with `tr -d '.'` — and
      // that also ate the decimal point in the elapsed time, turning "143.8s"
      // into "1438s" and making a 2-minute run look like 24 minutes.
      if (delta) { text += delta; process.stderr.write('.'); }
    }
  }

  if (!text) throw new Error('Stream produced no content');
  return { text, usage };
}

// ── Validation ────────────────────────────────────────────────────────
// The first batch blocked three cards and every block was a false positive:
// the guard matched bare substrings without noticing the sentence was DENYING
// determinism, not asserting it ("The Lovers doesn't guarantee duration…",
// "Reading it as 'you will be betrayed' overstates the card…"). Two changes:
// the patterns now describe assertive frames rather than lone words, and a
// sentence that rejects or quotes the phrasing is exempt.
//
// Deliberately kept strict rather than clever — this guard exists to stop the
// page promising outcomes, and a rare over-trigger is cheaper than a miss.
const BANNED = [
  /\byou will\b/i,
  /\bis going to happen\b/i,
  /\bdestined to\b/i,
  /\bguaranteed to\b/i,          // not bare "guarantee": "doesn't guarantee" is the house line
  /\byour future holds\b/i,
  /\bwill definitely\b/i,
  /\bis certain to\b/i,
];

// A sentence carrying any of these is arguing against the prediction, quoting a
// misreading, or using the word non-predictively.
const REJECTION_CONTEXT = /\b(doesn't|does not|don't|do not|never|isn't|is not|aren't|are not|won't|will not|rather than|instead of|misread\w*|misinterpret\w*|misunderstand\w*|distortion|myth|overstat\w+|not a prediction|reading it as|treating it as|the idea that|the assumption that|as if|no guarantee)\b/i;

function scanPredictive(text) {
  const hits = [];
  // Split on sentence boundaries, keeping quoted fragments with their sentence.
  const sentences = String(text).split(/(?<=[.!?])\s+/);
  for (const sentence of sentences) {
    if (REJECTION_CONTEXT.test(sentence)) continue;
    for (const re of BANNED) {
      const hit = sentence.match(re);
      if (hit) hits.push({ phrase: hit[0], sentence: sentence.trim() });
    }
  }
  return hits;
}

function validate(parsed, planKeys) {
  const problems = [];
  if (!Array.isArray(parsed.sections)) problems.push('sections is not an array');
  if (!Array.isArray(parsed.faq)) problems.push('faq is not an array');
  const ids = (parsed.sections || []).map(s => s.id);
  for (const k of planKeys) if (!ids.includes(k)) problems.push(`missing section: ${k}`);
  for (const s of parsed.sections || []) {
    const words = String(s.body || '').trim().split(/\s+/).length;
    if (words < 120) problems.push(`section "${s.id}" is only ${words} words`);
    for (const h of scanPredictive(s.body)) {
      problems.push(`section "${s.id}" uses predictive language: "${h.phrase}" — in: ${h.sentence.slice(0, 120)}`);
    }
  }
  for (const f of parsed.faq || []) {
    for (const h of scanPredictive(f.answer)) {
      problems.push(`faq "${String(f.question).slice(0, 40)}…" uses predictive language: "${h.phrase}" — in: ${h.sentence.slice(0, 120)}`);
    }
  }
  return problems;
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const cardArg = args.find(a => a.startsWith('--card='))?.split('=')[1];
  const all = args.includes('--all');
  const write = args.includes('--write');
  const dryRun = args.includes('--dry-run');
  // Write an already-reviewed execution/output/deepen/<slug>.json to the DB
  // without spending another 20-minute generation on it.
  const fromCache = args.includes('--from-cache');

  const slugs = cardArg ? [cardArg] : all ? COHORT : null;
  if (!slugs) {
    console.error('Specify --card=<slug> or --all. Cohort:\n  ' + COHORT.join('\n  '));
    process.exit(1);
  }
  for (const s of slugs) {
    if (!PLANS[s]) { console.error(`No section plan for "${s}". Add one to PLANS.`); process.exit(1); }
  }

  const { apiKey, dbUrl, dbToken } = loadEnv();
  if (!apiKey) { console.error('MOONSHOT_API_KEY not found in app/.env.local'); process.exit(1); }

  mkdirSync(OUT_DIR, { recursive: true });
  const db = createClient({ url: dbUrl, authToken: dbToken });

  // Backup affected rows before any write
  if (write && !dryRun) {
    const placeholders = slugs.map(() => '?').join(',');
    const backup = await db.execute({
      sql: `SELECT slug, deep_sections, deep_faq, deepened_at, deepened_model FROM card_content WHERE slug IN (${placeholders})`,
      args: slugs,
    });
    const path = resolve(OUT_DIR, `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    writeFileSync(path, JSON.stringify(backup.rows, null, 2));
    console.log(`Backup written: ${path}`);
  }

  let totalIn = 0, totalOut = 0;

  for (const slug of slugs) {
    const planKeys = PLANS[slug];
    const res = await db.execute({ sql: 'SELECT * FROM card_content WHERE slug = ?', args: [slug] });
    if (res.rows.length === 0) { console.error(`  ${slug}: not found in card_content`); continue; }
    const card = res.rows[0];

    if (fromCache) {
      const cached = resolve(OUT_DIR, `${slug}.json`);
      if (!existsSync(cached)) { console.error(`  ${slug}: no cached output at ${cached}`); continue; }
      const parsed = JSON.parse(readFileSync(cached, 'utf-8'));
      const problems = validate(parsed, planKeys);
      const words = parsed.sections.reduce((n, s) => n + String(s.body).trim().split(/\s+/).length, 0);
      console.log(`${slug}: from cache — ${words} words, ${parsed.faq.length} FAQs${problems.length ? `, ${problems.length} problem(s)` : ''}`);
      for (const p of problems) console.log(`    - ${p}`);
      if (write && !problems.length) {
        await db.execute({
          sql: `UPDATE card_content
                SET deep_sections = ?, deep_faq = ?, deepened_at = ?, deepened_model = ?, updated_at = datetime('now')
                WHERE slug = ?`,
          args: [JSON.stringify(parsed.sections), JSON.stringify(parsed.faq), parsed.generatedAt || new Date().toISOString(), parsed.model || MODEL, slug],
        });
        console.log('  ✓ written to card_content');
      }
      continue;
    }

    const userPrompt = buildUserPrompt(card, planKeys);

    if (dryRun) {
      console.log(`\n${'='.repeat(70)}\n${slug} — PROMPT (${userPrompt.length} chars)\n${'='.repeat(70)}`);
      console.log(userPrompt);
      continue;
    }

    process.stdout.write(`${slug}: calling ${MODEL} (${planKeys.length} sections)… `);
    const started = Date.now();
    const img = cardImageDataUrl(card);
    if (!img) console.log(`\n  ⚠ no card image found for ${slug} — symbolism will be written from memory`);
    const { text, usage } = await callKimi(apiKey, userPrompt, img?.url);
    totalIn += usage?.prompt_tokens || 0;
    totalOut += usage?.completion_tokens || 0;
    const reasoned = usage?.completion_tokens_details?.reasoning_tokens || 0;

    let parsed;
    try {
      parsed = JSON.parse(text.replace(/^```(?:json)?\n?|```$/g, '').trim());
    } catch (e) {
      const path = resolve(OUT_DIR, `${slug}.RAW-PARSE-FAIL.txt`);
      writeFileSync(path, text);
      console.log(`JSON parse failed. Raw saved to ${path}`);
      continue;
    }

    // Second pass over the symbolism section only. Even with the image attached,
    // the first pass got visual details wrong (contradicted itself on which
    // corner the lightning comes from; called a clouded sky cloudless). This
    // pass shows the model the image and its own draft and asks for corrections
    // to observable facts only.
    const symbolism = parsed.sections.find(s => s.id === 'symbolism');
    if (symbolism && img) {
      process.stdout.write('  verifying symbolism against image… ');
      const verifyPrompt = `Below is a draft description of the attached tarot card image (${card.name}, Rider-Waite-Smith).

Check it against the image and correct ONLY factual visual errors: wrong directions (left/right/above/below), wrong colours, wrong counts of figures or objects, things claimed present that are absent, things present that the draft denies. Also fix any sentence that contradicts itself about a visual detail.

Do NOT change the interpretation, the voice, the structure, or the length. If a statement is visually accurate, leave it exactly as written.

DRAFT:
${symbolism.body}

Return JSON: { "body": "<the corrected text>", "corrections": ["<one line per change made>"] }`;
      try {
        const v = await callKimi(apiKey, verifyPrompt, img.url);
        const vp = JSON.parse(v.text.replace(/^```(?:json)?\n?|```$/g, '').trim());
        totalIn += v.usage?.prompt_tokens || 0;
        totalOut += v.usage?.completion_tokens || 0;
        if (vp.body) {
          symbolism.body = vp.body;
          parsed.symbolismCorrections = vp.corrections || [];
          console.log(`${(vp.corrections || []).length} correction(s)`);
          for (const c of vp.corrections || []) console.log(`    · ${c}`);
        }
      } catch (e) {
        console.log(`verification failed (${e.message.slice(0, 80)}) — keeping first draft`);
      }
    }

    const problems = validate(parsed, planKeys);
    const words = parsed.sections.reduce((n, s) => n + String(s.body).trim().split(/\s+/).length, 0);
    console.log(`${((Date.now() - started) / 1000).toFixed(1)}s, +${words} words, ${parsed.faq.length} FAQs, ${reasoned} reasoning tokens`);
    if (problems.length) {
      console.log('  ⚠ validation:');
      for (const p of problems) console.log(`    - ${p}`);
    }

    const outPath = resolve(OUT_DIR, `${slug}.json`);
    writeFileSync(outPath, JSON.stringify({ slug, model: MODEL, generatedAt: new Date().toISOString(), usage, problems, ...parsed }, null, 2));
    console.log(`  → ${outPath}`);

    if (write) {
      if (problems.length) {
        console.log('  ✗ NOT written to DB — fix validation problems first.');
        continue;
      }
      await db.execute({
        sql: `UPDATE card_content
              SET deep_sections = ?, deep_faq = ?, deepened_at = ?, deepened_model = ?, updated_at = datetime('now')
              WHERE slug = ?`,
        args: [JSON.stringify(parsed.sections), JSON.stringify(parsed.faq), new Date().toISOString(), MODEL, slug],
      });
      console.log('  ✓ written to card_content');
    }
  }

  if (totalIn || totalOut) {
    console.log(`\nTokens — in: ${totalIn.toLocaleString()}, out: ${totalOut.toLocaleString()}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
