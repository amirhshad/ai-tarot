/**
 * Generate Farsi SEO content for all 78 tarot cards.
 * Writes to _fa columns in the card_content table.
 * Non-destructive — only updates Farsi columns, never touches English content.
 *
 * Usage:
 *   cd app && node ../execution/generate-card-content-fa.mjs
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

// ── Farsi card names (from deck.ts) ─────────────────────────────────
const FARSI_NAMES = {
  'the-fool': 'احمق', 'the-magician': 'جادوگر', 'the-high-priestess': 'کاهنه اعظم',
  'the-empress': 'ملکه', 'the-emperor': 'امپراتور', 'the-hierophant': 'کاهن اعظم',
  'the-lovers': 'عاشقان', 'the-chariot': 'ارابه', 'strength': 'قدرت',
  'the-hermit': 'زاهد', 'wheel-of-fortune': 'چرخ بخت', 'justice': 'عدالت',
  'the-hanged-man': 'مرد آویزان', 'death': 'مرگ', 'temperance': 'اعتدال',
  'the-devil': 'شیطان', 'the-tower': 'برج', 'the-star': 'ستاره',
  'the-moon': 'ماه', 'the-sun': 'خورشید', 'judgement': 'داوری', 'the-world': 'جهان',
};

// Minor arcana Farsi patterns
const SUIT_FA = { wands: 'عصاها', cups: 'جام‌ها', swords: 'شمشیرها', pentacles: 'سکه‌ها' };
const RANK_FA = {
  'Ace': 'آس', 'Two': 'دو', 'Three': 'سه', 'Four': 'چهار', 'Five': 'پنج',
  'Six': 'شش', 'Seven': 'هفت', 'Eight': 'هشت', 'Nine': 'نه', 'Ten': 'ده',
  'Page': 'ندیمه', 'Knight': 'شوالیه', 'Queen': 'ملکه', 'King': 'شاه',
};

function getFarsiName(slug, englishName) {
  if (FARSI_NAMES[slug]) return FARSI_NAMES[slug];
  // Build from rank + suit for minor arcana
  const match = englishName.match(/^(\w+) of (\w+)$/);
  if (match) {
    const rank = RANK_FA[match[1]] || match[1];
    const suit = SUIT_FA[match[2].toLowerCase()] || match[2];
    return `${rank} ${suit}`;
  }
  return englishName;
}

// ── System prompt ─────────────────────────────────────────────────────
const SYSTEM_PROMPT = `شما یک فالگیر استاد تاروت و نویسنده محتوای حرفه‌ای هستید. برای پلتفرم تاروت هوش مصنوعی «تاروت‌ویل» محتوای فارسی خلق می‌کنید.

قوانین نگارش:
1. به فارسی روان و طبیعی بنویسید — ترجمه نکنید، خلق کنید
2. از ضمیر «شما» استفاده کنید
3. روایت‌محور بنویسید — فهرست‌وار ننویسید
4. تاروت را ابزار خودشناسی معرفی کنید، نه فال‌بینی
5. از زبان قطعی («خواهید...») پرهیز کنید. به جای آن از «این کارت شما را دعوت می‌کند...» استفاده کنید
6. عمق فرهنگی فارسی را رعایت کنید — از استعاره‌ها و تعبیرات طبیعی فارسی استفاده کنید
7. محتوای اصیل بنویسید — کپی نکنید
8. از نصیحت پزشکی، حقوقی یا مالی پرهیز کنید

فقط JSON معتبر برگردانید. بدون markdown، بدون توضیح اضافی.`;

// ── Generate content for one card ─────────────────────────────────────
async function generateFarsiContent(anthropic, cardRow) {
  const { slug, name, arcana, suit, element, zodiac, upright_meaning } = cardRow;
  const nameFA = getFarsiName(slug, name);

  const cardContext = arcana === 'minor'
    ? `${name} (${nameFA}) کارت آرکانای کوچک از خانواده ${SUIT_FA[suit] || suit} (عنصر: ${element}) است.`
    : `${name} (${nameFA}) کارت شماره ${cardRow.number} آرکانای بزرگ (عنصر: ${element}، مرتبط با ${zodiac}) است.`;

  // Existing English content as context (not to translate, but for consistency)
  const contextSnippet = upright_meaning.slice(0, 400);

  const comboSlugs = JSON.parse(cardRow.combinations);
  const comboList = comboSlugs.map(c => `  - ${c.name} (${getFarsiName(c.slug, c.name)})`).join('\n');

  const prompt = `محتوای جامع SEO به زبان فارسی برای کارت تاروت "${name}" (${nameFA}) بنویسید.

${cardContext}

محتوای انگلیسی موجود برای زمینه (تکرار نکنید، فقط به عنوان مرجع):
"${contextSnippet}..."

یک شیء JSON با این کلیدهای دقیق برگردانید:

{
  "name_fa": "${nameFA}",

  "upright_keywords_fa": ["۵-۷ کلمه کلیدی فارسی برای حالت ایستاده"],
  "reversed_keywords_fa": ["۵-۷ کلمه کلیدی فارسی برای حالت معکوس"],

  "featured_snippet_fa": "۴۰-۶۰ کلمه فارسی. خلاصه‌ای مستقل که معنای اصلی این کارت را بیان کند.",

  "upright_meaning_fa": "۵۰۰-۷۰۰ کلمه فارسی. تفسیر روایی عمیق معنای ایستاده. به تصاویر رایدر-ویت-اسمیت اشاره کنید. پاراگراف‌ها را با خط جدید جدا کنید.",

  "reversed_meaning_fa": "۳۰۰-۵۰۰ کلمه فارسی. تفسیر معنای معکوس. دقیق و ظریف — نه صرفاً عکس ایستاده.",

  "love_relationships_fa": "۲۰۰-۳۰۰ کلمه فارسی. هر دو حالت ایستاده و معکوس در زمینه عشق و روابط.",

  "career_finances_fa": "۲۰۰-۳۰۰ کلمه فارسی. هر دو حالت در زمینه شغل و مالی.",

  "as_feelings_fa": "۲۰۰-۳۰۰ کلمه فارسی. وقتی این کارت به عنوان احساسات ظاهر می‌شود چه معنایی دارد؟ هر دو حالت.",

  "how_someone_sees_you_fa": "۲۰۰-۳۰۰ کلمه فارسی. وقتی در موقعیت «نگاه دیگران به شما» ظاهر می‌شود. هر دو حالت.",

  "advice_fa": "۲۰۰-۳۰۰ کلمه فارسی. راهنمایی عملی وقتی این کارت به عنوان توصیه کشیده می‌شود. هر دو حالت.",

  "yes_or_no_fa": "۱۰۰-۱۵۰ کلمه فارسی. حکم واضح با توضیح.",

  "combinations_fa": [
    برای هر یک از ترکیبات زیر، ۱-۲ جمله فارسی بنویسید:
${comboList}
    قالب: [{"slug": "card-slug", "name": "Card Name", "description": "توضیح فارسی ترکیب"}]
  ],

  "faq_fa": [
    ۴-۶ سؤال متداول فارسی درباره ${nameFA}. الگوها:
    - "آیا ${nameFA} کارت خوبی است؟"
    - "${nameFA} در خوانش عشق چه معنایی دارد؟"
    - "${nameFA} معکوس چه معنایی دارد؟"
    - "آیا ${nameFA} بله یا خیر است؟"
    قالب: [{"question": "...", "answer": "۴۰-۸۰ کلمه فارسی"}]
  ],

  "meta_title_fa": "حداکثر ۵۵ کاراکتر فارسی. قالب: 'معنی ${nameFA} در تاروت — ایستاده و معکوس'",
  "meta_description_fa": "حداکثر ۱۵۰ کاراکتر فارسی. معنی ${nameFA} در تاروت. تفسیر ایستاده و معکوس برای عشق، شغل و بله یا خیر."
}

مهم: فقط شیء JSON برگردانید. بدون بلاک کد markdown.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 6000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Failed to parse JSON for ${name}: ${text.slice(0, 300)}`);

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate required fields
  const required = [
    'name_fa', 'upright_keywords_fa', 'reversed_keywords_fa', 'featured_snippet_fa',
    'upright_meaning_fa', 'reversed_meaning_fa', 'love_relationships_fa', 'career_finances_fa',
    'yes_or_no_fa', 'combinations_fa', 'faq_fa', 'meta_title_fa', 'meta_description_fa',
  ];
  for (const key of required) {
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

  // Fetch cards that need Farsi content
  let query = 'SELECT slug, name, arcana, suit, number, element, zodiac, upright_meaning, combinations FROM card_content';
  const queryArgs = [];

  if (onlyCard) {
    query += ' WHERE slug = ?';
    queryArgs.push(onlyCard);
  } else {
    query += ' WHERE name_fa IS NULL';
  }
  query += ' ORDER BY card_id';

  const result = await db.execute({ sql: query, args: queryArgs });
  let cards = result.rows;

  if (cards.length === 0) {
    console.log('All cards already have Farsi content. Use --card=slug to regenerate a specific card.');
    return;
  }

  if (limit) cards = cards.slice(0, limit);

  console.log(dryRun ? '=== DRY RUN ===' : '=== GENERATING FARSI CONTENT ===');
  console.log(`Processing ${cards.length} card(s)\n`);

  let processed = 0;

  for (const cardRow of cards) {
    const slug = cardRow.slug;
    console.log(`[${processed + 1}/${cards.length}] ${cardRow.name} (${getFarsiName(slug, cardRow.name)})...`);

    if (dryRun) {
      console.log(`  Would generate all Farsi content fields`);
      processed++;
      continue;
    }

    try {
      const data = await generateFarsiContent(anthropic, cardRow);

      // Log word count
      const wordCount = [
        data.upright_meaning_fa, data.reversed_meaning_fa, data.love_relationships_fa,
        data.career_finances_fa, data.as_feelings_fa || '', data.how_someone_sees_you_fa || '',
        data.advice_fa || '', data.yes_or_no_fa, data.featured_snippet_fa,
      ].join(' ').split(/\s+/).length;
      console.log(`  → ${wordCount} words, ${data.faq_fa.length} FAQs, ${data.combinations_fa.length} combos`);

      // Non-destructive UPDATE — only touches _fa columns
      await db.execute({
        sql: `UPDATE card_content SET
          name_fa = ?, upright_keywords_fa = ?, reversed_keywords_fa = ?,
          featured_snippet_fa = ?, upright_meaning_fa = ?, reversed_meaning_fa = ?,
          love_relationships_fa = ?, career_finances_fa = ?,
          as_feelings_fa = ?, how_someone_sees_you_fa = ?, advice_fa = ?,
          yes_or_no_fa = ?, combinations_fa = ?, faq_fa = ?,
          meta_title_fa = ?, meta_description_fa = ?,
          updated_at = datetime('now')
        WHERE slug = ?`,
        args: [
          data.name_fa,
          JSON.stringify(data.upright_keywords_fa),
          JSON.stringify(data.reversed_keywords_fa),
          data.featured_snippet_fa,
          data.upright_meaning_fa,
          data.reversed_meaning_fa,
          data.love_relationships_fa,
          data.career_finances_fa,
          data.as_feelings_fa || null,
          data.how_someone_sees_you_fa || null,
          data.advice_fa || null,
          data.yes_or_no_fa,
          JSON.stringify(data.combinations_fa),
          JSON.stringify(data.faq_fa),
          data.meta_title_fa,
          data.meta_description_fa,
          slug,
        ],
      });

      processed++;
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }

  console.log(`\nDone! Generated Farsi content for ${processed} card(s).`);
}

main().catch(console.error);
