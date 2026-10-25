/**
 * Generate Arabic SEO content for tarot cards — Phase 2, cohort first.
 * Writes to _ar columns in the card_content table.
 * Non-destructive — only touches Arabic columns, never English or Farsi.
 *
 * Uses the **Message Batches API**, not synchronous calls: this is an
 * unattended backfill nobody is waiting on, so it runs at 50% of the
 * per-token rate. Results arrive within 24h (an expiry, not an SLA), which
 * is why submit and fetch are separate commands rather than one blocking run.
 *
 * Usage:
 *   node execution/generate-card-content-ar.mjs --dry-run     # print one prompt, no API call
 *   node execution/generate-card-content-ar.mjs --submit      # create the batch, save its id
 *   node execution/generate-card-content-ar.mjs --status      # check the batch
 *   node execution/generate-card-content-ar.mjs --cancel      # pull a batch (e.g. after a model change)
 *   node execution/generate-card-content-ar.mjs --fetch       # validate results, write JSON + DB
 *
 * Options:
 *   --cards=a,b,c   Override the cohort (default: the 8-card cohort below)
 *   --all           Process all 78 cards instead of the cohort
 *   --limit=N       Cap the card count
 *   --no-db         With --fetch, write JSON files but skip the DB upsert
 *
 * Requires ANTHROPIC_API_KEY and TURSO_DATABASE_URL in app/.env.local
 */

import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, '../app/package.json'));
const Anthropic = require('@anthropic-ai/sdk').default;
const { createClient } = require('@libsql/client');

const ENV_PATH = resolve(__dirname, '../app/.env.local');
const DECK_PATH = resolve(__dirname, '../app/src/lib/tarot/deck.ts');
const OUT_DIR = resolve(__dirname, 'output/ar-cards');
const BATCH_ID_PATH = resolve(OUT_DIR, 'batch-id.txt');

// Sonnet 5.5 — the model this project's Arabic was actually evaluated on (zero
// clear errors in 403 words, the comparison that disqualified Haiku; see
// docs/arabic-reading-sample-2026-10-05.md) and the model the app itself serves
// paid readings with (CAPABLE_MODEL in app/src/lib/ai/client.ts).
//
// Sonnet 5 is the same $2/$10 and would have avoided thinking tokens, but its
// Arabic has never been measured here. ~$1 across the full 78 cards is not
// worth generating permanently-indexed Arabic on an unevaluated model.
const MODEL = 'claude-sonnet-5-5';

// Sonnet 5.5 rejects `thinking: {type:'disabled'}` with a 400 — the Models API
// reports `thinking.types.disabled.supported: false` for it. `between_tools`
// turns off up-front thinking and is what client.ts already uses for this
// model, so the generation path matches the serving path.
//
// Effort is deliberately left at the model default (`high`) rather than lowered
// to trim thinking tokens: default effort is the condition under which the
// Arabic quality finding was established, and ~$0.80 across 78 cards is not a
// reason to generate under a configuration nobody has evaluated.
const THINKING = { type: 'between_tools' };

// Content runs ~7,400 output tokens per card (measured: ~3,070 words at ~2.3
// tokens/word for Arabic). The fa script's 8,000 would truncate the long cards
// outright; with thinking tokens also counting against this ceiling on Sonnet
// 5.5, the headroom here is the difference between a card and a parse error.
const MAX_TOKENS = 24000;

/**
 * The cohort: the 8 highest-click `/fa/tarot-card-meanings/*` pages, Jul 25 –
 * Oct 24 2026, from **Google** Search Console.
 *
 * The Phase 2 spec said to pull this from Bing. That was written before this
 * project established that the search channel is per-locale — Bing is ~8x
 * Google for English, but Farsi traffic is Google's. Bing would have reported
 * near-nothing for these URLs and the cohort would have been chosen by noise.
 *
 * Farsi is the proxy for Arabic demand: it is the locale where card pages
 * actually earn clicks (CTR 1.6–16.7% here, against English card pages' 0.72%),
 * and it shares script direction and a partly overlapping market.
 *
 * Ties at 2 clicks broken by impressions. the-moon, the-tower and six-of-swords
 * also sit in the English deepening cohort, which buys cross-locale
 * comparability at no cost.
 *
 * The control group is the other 70 cards, which stay gated and 404.
 */
const COHORT = [
  'judgement',          // 5 clicks, 30 impressions, 16.7% CTR
  'ten-of-cups',        // 5, 153, 3.3%
  'eight-of-swords',    // 4, 114, 3.5%
  'ten-of-pentacles',   // 3, 115, 2.6%
  'the-moon',           // 3, 148, 2.0%
  'the-tower',          // 2, 126, 1.6%
  'the-hermit',         // 2, 70, 2.9%
  'six-of-swords',      // 2, 58, 3.4%
];

function loadEnv() {
  const env = {};
  if (existsSync(ENV_PATH)) {
    for (const line of readFileSync(ENV_PATH, 'utf-8').split('\n')) {
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

/**
 * Arabic card names, read out of `deck.ts` rather than restated here.
 *
 * The fa script hardcodes its 78 names with a "(from deck.ts)" comment, which
 * is a copy that can drift from the deck the app actually renders. Parsing the
 * single source instead means a renamed card cannot disagree with its own page.
 */
function loadArabicNames() {
  const src = readFileSync(DECK_PATH, 'utf-8');
  const names = {};

  // Majors declare `name: 'The Moon',`; minors pass the name positionally to
  // `createMinorCard(22, 1, 'wands', 'Ace of Wands', […])`. Rather than two
  // regexes, anchor on each `ar: { … }` block and walk back to the nearest
  // preceding ASCII-capitalised string literal — which is the English card name
  // in both forms. Suits ('wands'), court ranks ('page') and English keywords
  // are all lowercase, and the fa block above is Arabic script, so none of them
  // can be mistaken for it.
  const arBlock = /ar:\s*\{\s*name:\s*'([^']+)',\s*keywords:\s*\[([^\]]*)\]/g;
  const englishName = /'([A-Z][A-Za-z ]*)'/g;

  let m;
  while ((m = arBlock.exec(src)) !== null) {
    const before = src.slice(0, m.index);
    let last = null;
    let e;
    englishName.lastIndex = 0;
    while ((e = englishName.exec(before)) !== null) last = e[1];
    if (!last) continue;
    names[last] = {
      name: m[1],
      keywords: [...m[2].matchAll(/'([^']+)'/g)].map(k => k[1]),
    };
  }
  return names;
}

// ── Terminology, taken from the shipped ar.json bundle ──────────────
//
// Free generation does not know these: in the 2026-10-05 sample Sonnet wrote
// الأوراق الكبرى for the Major Arcana where the bundle ships الأركانا الكبرى.
// Generated prose that disagrees with the UI around it reads as two products.
//
// This also settles one of the two terminology questions the Phase 2 spec left
// open: الأركانا الكبرى, not الأسرار الكبرى — the bundle already committed to
// the transliteration, and the spec's own note is that it dominates Arabic
// tarot content online.
const TERMINOLOGY = `المصطلحات الملزمة (استخدمها حرفياً، لا بدائل):
- الأركانا الكبرى = Major Arcana (لا تكتب "الأسرار الكبرى" ولا "الأوراق الكبرى")
- مجموعة العصي = Wands · مجموعة الكؤوس = Cups · مجموعة السيوف = Swords · مجموعة الدنانير = Pentacles
- مستقيمة = upright · معكوسة = reversed
- السائل = the querent
- انتشار = spread
- بطاقة = card

كلمة "مجموعة" مخصصة للمجموعة الواحدة من البطاقات (suit) فقط. لا تستخدمها بمعنى
"رزمة التاروت" كلها في هذا النص.`;

const SYSTEM_PROMPT = `أنت كاتب محتوى تاروت عربي خبير. تكتب نثراً عربياً فصيحاً وسليماً نحوياً،
بنبرة تأملية ورمزية — لا تنبؤية. لا تستخدم صيغة "سوف يحدث لك"؛ استخدم صياغة
تأملية ومتعاطفة ("قد تدعوك هذه البطاقة إلى…").

تكتب بالعربية الفصحى فقط. لا تستخدم أي حرف فارسي (پ چ ژ گ ک ی) ولا كلمة "فال".

${TERMINOLOGY}

تُعيد JSON صالحاً فقط، بدون أي نص قبله أو بعده، وبدون أسوار markdown.`;

const SUIT_AR = {
  wands: 'مجموعة العصي',
  cups: 'مجموعة الكؤوس',
  swords: 'مجموعة السيوف',
  pentacles: 'مجموعة الدنانير',
};

function buildPrompt(cardRow, arName, arKeywords) {
  const { name, arcana, suit, element, zodiac, upright_meaning } = cardRow;

  const cardContext = arcana === 'minor'
    ? `${name} (${arName}) بطاقة من الأركانا الصغرى، من ${SUIT_AR[suit] || suit} (العنصر: ${element}).`
    : `${name} (${arName}) البطاقة رقم ${cardRow.number} من الأركانا الكبرى (العنصر: ${element}، مرتبطة بـ ${zodiac}).`;

  // English content as reference only. Deliberately a 400-char snippet, not the
  // whole field: this is native generation, not translation (see
  // directives/prompt-engineering.md — "translate meaning, not just words").
  const contextSnippet = (upright_meaning || '').slice(0, 400);
  const comboSlugs = JSON.parse(cardRow.combinations || '[]');
  const comboList = comboSlugs.map(c => `  - ${c.name}`).join('\n');

  return `اكتب محتوى SEO شاملاً بالعربية لبطاقة التاروت "${name}" (${arName}).

${cardContext}

الكلمات المفتاحية العربية المعتمدة لهذه البطاقة: ${arKeywords.join('، ')}

المحتوى الإنجليزي الموجود للسياق فقط (لا تترجمه حرفياً، اكتب نصاً عربياً أصيلاً):
"${contextSnippet}..."

أعد كائن JSON بهذه المفاتيح بالضبط:

{
  "name_ar": "${arName}",

  "upright_keywords_ar": ["5-7 كلمات مفتاحية عربية للحالة المستقيمة"],
  "reversed_keywords_ar": ["5-7 كلمات مفتاحية عربية للحالة المعكوسة"],

  "featured_snippet_ar": "40-60 كلمة عربية. ملخص مستقل يوضح المعنى الجوهري للبطاقة.",

  "upright_meaning_ar": "500-700 كلمة عربية. تفسير سردي عميق للمعنى المستقيم. أشر إلى صور رايدر-ويت-سميث. افصل الفقرات بسطر جديد.",

  "reversed_meaning_ar": "300-500 كلمة عربية. تفسير المعنى المعكوس. دقيق ومتدرج — ليس مجرد عكس المستقيم.",

  "love_relationships_ar": "200-300 كلمة عربية. الحالتان المستقيمة والمعكوسة في سياق الحب والعلاقات.",

  "career_finances_ar": "200-300 كلمة عربية. الحالتان في سياق العمل والمال.",

  "as_feelings_ar": "200-300 كلمة عربية. ماذا تعني هذه البطاقة عندما تظهر كمشاعر؟ الحالتان.",

  "how_someone_sees_you_ar": "200-300 كلمة عربية. عندما تظهر في موضع «كيف يراك الآخرون». الحالتان.",

  "advice_ar": "200-300 كلمة عربية. إرشاد عملي عندما تُسحب هذه البطاقة كمشورة. الحالتان.",

  "yes_or_no_ar": "100-150 كلمة عربية. حكم واضح مع تفسيره.",

  "combinations_ar": [
    لكل تركيبة من التركيبات التالية، اكتب جملة أو جملتين بالعربية:
${comboList}
    الصيغة: [{"slug": "card-slug", "name": "Card Name", "description": "وصف التركيبة بالعربية"}]
  ],

  "faq_ar": [
    4-6 أسئلة شائعة بالعربية عن ${arName}. الأنماط:
    - "هل ${arName} بطاقة جيدة؟"
    - "ماذا تعني ${arName} في قراءة الحب؟"
    - "ماذا تعني ${arName} معكوسة؟"
    - "هل ${arName} تعني نعم أم لا؟"
    الصيغة: [{"question": "...", "answer": "40-80 كلمة عربية"}]
  ],

  "meta_title_ar": "من 45 إلى 55 حرفاً عربياً (احسب الحروف). النمط: 'معنى بطاقة ${arName} في التاروت — مستقيمة ومعكوسة'",
  "meta_description_ar": "من 130 إلى 150 حرفاً عربياً — استخدم المساحة كلها، فهذا النص هو ما يراه الباحث في نتائج البحث. ابدأ بمعنى ${arName} المستقيمة والمعكوسة، ثم أضف ما يميز هذه البطاقة تحديداً (صورتها، أو سؤال الحب أو العمل، أو حكم نعم/لا). لا تكتب وصفاً عاماً يصلح لأي بطاقة."
}

مهم: أعد كائن JSON فقط. بدون أسوار markdown.`;
}

const REQUIRED_FIELDS = [
  'name_ar', 'upright_keywords_ar', 'reversed_keywords_ar', 'featured_snippet_ar',
  'upright_meaning_ar', 'reversed_meaning_ar', 'love_relationships_ar',
  'career_finances_ar', 'as_feelings_ar', 'how_someone_sees_you_ar', 'advice_ar',
  'yes_or_no_ar', 'combinations_ar', 'faq_ar', 'meta_title_ar', 'meta_description_ar',
];

/**
 * The same gate `parity.test.ts` applies to ar.json, applied to generated prose
 * before it can reach the database.
 *
 * The Persian-letter check and the standalone-فال check are both mirrored from
 * there deliberately: Farsi that happens to avoid پ چ ژ گ ک ی still reads as
 * Farsi, and فال is the single likeliest Persian word to surface in this
 * product's copy. The lookarounds matter — فالتاروت is correct Arabic (فـ + الـ);
 * only فال standing alone is Persian.
 */
function validate(slug, data) {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    const v = data[field];
    if (v === undefined || v === null) errors.push(`missing field: ${field}`);
    else if (typeof v === 'string' && v.trim() === '') errors.push(`empty field: ${field}`);
    else if (Array.isArray(v) && v.length === 0) errors.push(`empty array: ${field}`);
  }

  const allText = JSON.stringify(data);
  const persian = allText.match(/[پچژگکی]/g);
  if (persian) errors.push(`Persian letters: ${[...new Set(persian)].join(' ')}`);
  if (/‌/.test(allText)) errors.push('contains ZWNJ (U+200C), a Persian joiner');
  if (/(?<![؀-ۿ])فال(?![؀-ۿ])/.test(allText)) errors.push('contains the Persian word فال');

  // Terminology the 2026-10-05 sample got wrong unprompted.
  if (/الأسرار الكبرى|الأوراق الكبرى/.test(allText)) {
    errors.push('wrong Major Arcana term — must be الأركانا الكبرى');
  }

  // Snippet lengths. The first run of this cohort passed every other check
  // while shipping 71-character descriptions against a 150 budget — half the
  // length of the Farsi pages (avg 125) this experiment is measured against.
  // An under-length description is not cosmetic here: the cohort is judged on
  // CTR, so a short snippet confounds the one question it exists to answer.
  const title = String(data.meta_title_ar ?? '');
  const desc = String(data.meta_description_ar ?? '');
  if (title.length > 60) errors.push(`meta_title_ar too long: ${title.length} chars (max 60)`);
  if (title.length < 35) errors.push(`meta_title_ar too short: ${title.length} chars (min 35)`);
  if (desc.length > 160) errors.push(`meta_description_ar too long: ${desc.length} chars (max 160)`);
  if (desc.length < 120) errors.push(`meta_description_ar too short: ${desc.length} chars (min 120 — Farsi averages 125)`);

  return errors.length ? { slug, errors } : null;
}

async function loadCards(db, slugs) {
  const placeholders = slugs.map(() => '?').join(',');
  const result = await db.execute({
    sql: `SELECT slug, name, arcana, suit, number, element, zodiac, upright_meaning, combinations
          FROM card_content WHERE slug IN (${placeholders}) ORDER BY card_id`,
    args: slugs,
  });
  return result.rows;
}

function selectSlugs(args, allSlugsFallback) {
  if (args.cards) return args.cards.split(',').map(s => s.trim()).filter(Boolean);
  const base = args.all ? allSlugsFallback : COHORT;
  return args.limit ? base.slice(0, Number(args.limit)) : base;
}

function parseArgs() {
  const args = {};
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) args[m[1]] = m[2] === undefined ? true : m[2];
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const { apiKey, dbUrl, dbToken } = loadEnv();
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found in env or app/.env.local');

  mkdirSync(OUT_DIR, { recursive: true });
  const db = createClient({ url: dbUrl, authToken: dbToken });
  const anthropic = new Anthropic({ apiKey });
  const arNames = loadArabicNames();

  // ── fetch ────────────────────────────────────────────────────────
  if (args.fetch) {
    if (!existsSync(BATCH_ID_PATH)) throw new Error(`No batch id at ${BATCH_ID_PATH} — run --submit first`);
    const batchId = readFileSync(BATCH_ID_PATH, 'utf-8').trim();
    const batch = await anthropic.messages.batches.retrieve(batchId);
    if (batch.processing_status !== 'ended') {
      console.log(`Batch ${batchId} is ${batch.processing_status}, not ended. Counts:`, batch.request_counts);
      return;
    }

    const failures = [];
    let written = 0;

    // Results arrive in ANY order — key by custom_id, never by position.
    for await (const entry of await anthropic.messages.batches.results(batchId)) {
      const slug = entry.custom_id;
      if (entry.result.type !== 'succeeded') {
        failures.push({ slug, errors: [`batch result: ${entry.result.type}`] });
        continue;
      }

      // Find the text block by type rather than taking content[0]: on current
      // models content[0] can be a thinking block, which is what made the fa
      // script's `content[0].text` fragile.
      const textBlock = entry.result.message.content.find(b => b.type === 'text');
      if (!textBlock) {
        failures.push({ slug, errors: ['no text block in response'] });
        continue;
      }

      const match = textBlock.text.match(/\{[\s\S]*\}/);
      if (!match) {
        failures.push({ slug, errors: ['no JSON object in response'] });
        continue;
      }

      let data;
      try {
        data = JSON.parse(match[0]);
      } catch (e) {
        failures.push({ slug, errors: [`JSON parse: ${e.message}`] });
        continue;
      }

      const invalid = validate(slug, data);
      if (invalid) {
        failures.push(invalid);
        // Still write the file so the Arabic can be read and judged by hand.
        writeFileSync(resolve(OUT_DIR, `${slug}.rejected.json`), JSON.stringify(data, null, 2));
        continue;
      }

      writeFileSync(resolve(OUT_DIR, `${slug}.json`), JSON.stringify(data, null, 2));
      written++;

      if (!args['no-db']) {
        await db.execute({
          sql: `UPDATE card_content SET
                  name_ar = ?, upright_keywords_ar = ?, reversed_keywords_ar = ?,
                  featured_snippet_ar = ?, upright_meaning_ar = ?, reversed_meaning_ar = ?,
                  love_relationships_ar = ?, career_finances_ar = ?, as_feelings_ar = ?,
                  how_someone_sees_you_ar = ?, advice_ar = ?, yes_or_no_ar = ?,
                  combinations_ar = ?, faq_ar = ?, meta_title_ar = ?, meta_description_ar = ?,
                  updated_at = datetime('now')
                WHERE slug = ?`,
          args: [
            data.name_ar,
            JSON.stringify(data.upright_keywords_ar),
            JSON.stringify(data.reversed_keywords_ar),
            data.featured_snippet_ar,
            data.upright_meaning_ar,
            data.reversed_meaning_ar,
            data.love_relationships_ar,
            data.career_finances_ar,
            data.as_feelings_ar,
            data.how_someone_sees_you_ar,
            data.advice_ar,
            data.yes_or_no_ar,
            JSON.stringify(data.combinations_ar),
            JSON.stringify(data.faq_ar),
            data.meta_title_ar,
            data.meta_description_ar,
            slug,
          ],
        });
      }
    }

    console.log(`\n${written} card(s) validated and written to ${OUT_DIR}${args['no-db'] ? ' (DB skipped)' : ' and the database'}.`);

    // Rebuild the published-cards manifest from the database. The gate reads
    // that bundled file, not the DB, so a content write without this step
    // leaves the new cards unpublished — safe, but silently so.
    if (!args['no-db'] && written > 0) {
      const { execFileSync } = await import('child_process');
      execFileSync(process.execPath, [resolve(__dirname, 'build-card-locale-manifest.mjs')], { stdio: 'inherit' });
    }
    if (failures.length) {
      console.log(`\n${failures.length} failed validation — nothing was written to the DB for these:`);
      for (const f of failures) console.log(`  ${f.slug}: ${f.errors.join('; ')}`);
      process.exitCode = 1;
    }
    // `updated_at` moved, so the sitemap's per-card lastmod now advertises a
    // fresh date for exactly these pages. Resubmit after deploy:
    //   node execution/indexnow-submit.mjs
    return;
  }

  // ── cancel ───────────────────────────────────────────────────────
  // Needed the first time this cohort ran: the batch had to be pulled after a
  // model change. Cancelling stops unstarted requests; ones already in flight
  // still complete and still bill.
  if (args.cancel) {
    if (!existsSync(BATCH_ID_PATH)) throw new Error(`No batch id at ${BATCH_ID_PATH}`);
    const batchId = readFileSync(BATCH_ID_PATH, 'utf-8').trim();
    const batch = await anthropic.messages.batches.cancel(batchId);
    console.log(`Batch ${batchId} is now ${batch.processing_status}`);
    console.log(`  counts: ${JSON.stringify(batch.request_counts)}`);
    return;
  }

  // ── status ───────────────────────────────────────────────────────
  if (args.status) {
    if (!existsSync(BATCH_ID_PATH)) throw new Error(`No batch id at ${BATCH_ID_PATH}`);
    const batchId = readFileSync(BATCH_ID_PATH, 'utf-8').trim();
    const batch = await anthropic.messages.batches.retrieve(batchId);
    console.log(`Batch ${batchId}`);
    console.log(`  status:  ${batch.processing_status}`);
    console.log(`  counts:  ${JSON.stringify(batch.request_counts)}`);
    console.log(`  created: ${batch.created_at}`);
    if (batch.ended_at) console.log(`  ended:   ${batch.ended_at}`);
    return;
  }

  // ── build requests (shared by --dry-run and --submit) ────────────
  const allSlugs = (await db.execute('SELECT slug FROM card_content ORDER BY card_id'))
    .rows.map(r => r.slug);
  const slugs = selectSlugs(args, allSlugs);
  const cards = await loadCards(db, slugs);

  const missing = slugs.filter(s => !cards.some(c => c.slug === s));
  if (missing.length) throw new Error(`Slugs not found in card_content: ${missing.join(', ')}`);

  const requests = [];
  for (const card of cards) {
    const ar = arNames[card.name];
    if (!ar) throw new Error(`No Arabic name in deck.ts for "${card.name}" — cannot generate without committed terminology`);
    requests.push({
      custom_id: card.slug,
      params: {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        thinking: THINKING,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildPrompt(card, ar.name, ar.keywords) }],
      },
    });
  }

  if (args['dry-run']) {
    console.log(`Would submit ${requests.length} request(s) on ${MODEL}: ${slugs.join(', ')}\n`);
    console.log('─'.repeat(70));
    console.log(`SYSTEM:\n${SYSTEM_PROMPT}\n`);
    console.log('─'.repeat(70));
    console.log(`USER (${requests[0].custom_id}):\n${requests[0].params.messages[0].content}`);
    return;
  }

  if (!args.submit) {
    console.log('Nothing to do. Pass --dry-run, --submit, --status, --cancel or --fetch.');
    return;
  }

  // ── submit ───────────────────────────────────────────────────────
  const batch = await anthropic.messages.batches.create({ requests });
  writeFileSync(BATCH_ID_PATH, batch.id);
  console.log(`Submitted ${requests.length} card(s) as batch ${batch.id}`);
  console.log(`  model:  ${MODEL} (batch rate: $1/$5 per MTok — 50% off $2/$10)`);
  console.log(`  cards:  ${slugs.join(', ')}`);
  console.log(`  id saved to ${BATCH_ID_PATH}`);
  console.log(`\nCheck with --status, then collect with --fetch (results expire after 24h).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
