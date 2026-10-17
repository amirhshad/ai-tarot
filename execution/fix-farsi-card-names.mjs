#!/usr/bin/env node
/**
 * Rewrite Farsi card names stored in `card_content` to the grammatical form.
 *
 * Two fixes, both deterministic — no model calls, no cost:
 *
 *   1. Persian does not pluralize the noun after a numeral. "پنج شمشیرها"
 *      becomes "پنج شمشیر". Nine additionally takes its zamme ("نُه"), since
 *      bare "نه" is also the word for "no" — a reading once closed on
 *      "نه جام‌ها می‌تواند راست بایستد", i.e. "then no cups can stand upright".
 *   2. "کاهنه اعظم" becomes "کاهنه بزرگ", so the High Priestess is more than
 *      one letter from the Hierophant ("کاهن اعظم").
 *
 * This matches the names `deck.ts` now serves to the reading prompt, so the
 * card pages and the readings agree. It rewrites names embedded in generated
 * prose too, not just the `name_fa` column — which is why it is a string
 * rewrite rather than a regeneration.
 *
 * A bare suit ("خانواده جام‌ها") is correct Persian and is left alone: the
 * numeral is required for a match. Safe to re-run — the fixed forms no longer
 * match the pattern.
 *
 *   node execution/fix-farsi-card-names.mjs            # dry run, prints diff
 *   node execution/fix-farsi-card-names.mjs --apply    # writes
 */
import { createRequire } from 'module';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, '../app/package.json'));
const { createClient } = require('@libsql/client');

const ENV_PATH = resolve(__dirname, '../app/.env.local');

function loadEnv() {
  const env = {};
  if (existsSync(ENV_PATH)) {
    for (const line of readFileSync(ENV_PATH, 'utf-8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.+)/);
      if (m) env[m[1]] = m[2].trim();
    }
  }
  return {
    dbUrl: process.env.TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || 'file:data/tarot.db',
    dbToken: process.env.TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN,
  };
}

const FA_COLS = [
  'name_fa', 'upright_keywords_fa', 'reversed_keywords_fa', 'featured_snippet_fa',
  'upright_meaning_fa', 'reversed_meaning_fa', 'love_relationships_fa', 'career_finances_fa',
  'as_feelings_fa', 'how_someone_sees_you_fa', 'advice_fa', 'yes_or_no_fa',
  'combinations_fa', 'faq_fa', 'meta_title_fa', 'meta_description_fa',
];

const SUIT = {
  'چوب‌دست‌ها': 'چوب‌دست', 'عصاها': 'عصا', 'جام‌ها': 'جام',
  'شمشیرها': 'شمشیر', 'سکه‌ها': 'سکه',
};
const NUM = {
  'دو': 'دو', 'سه': 'سه', 'چهار': 'چهار', 'پنج': 'پنج', 'شش': 'شش',
  'هفت': 'هفت', 'هشت': 'هشت', 'نه': 'نُه', 'ده': 'ده',
};

const NUM_RE = Object.keys(NUM).join('|');
const SUIT_RE = Object.keys(SUIT).join('|');
const CARD_RE = new RegExp(`(^|[\\s«»"'(\\[،؛:.!?—–-])(${NUM_RE})([ ‌]+)(${SUIT_RE})`, 'g');
const PRIESTESS_RE = /کاهنه اعظم/g;

export function fixFarsiNames(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(CARD_RE, (_m, pre, num, sp, suit) => `${pre}${NUM[num]}${sp}${SUIT[suit]}`)
    .replace(PRIESTESS_RE, 'کاهنه بزرگ');
}

async function main() {
  const apply = process.argv.includes('--apply');
  const { dbUrl, dbToken } = loadEnv();
  const db = createClient({ url: dbUrl, authToken: dbToken });

  const rows = (await db.execute(`SELECT slug, ${FA_COLS.join(', ')} FROM card_content`)).rows;

  const writes = [];
  let colCount = 0;
  let editCount = 0;
  const samples = [];

  for (const row of rows) {
    const changed = {};
    for (const col of FA_COLS) {
      const after = fixFarsiNames(row[col]);
      if (after === row[col]) continue;
      changed[col] = after;
      colCount++;
      const before = String(row[col]);
      editCount += [...before.matchAll(CARD_RE)].length + (before.match(PRIESTESS_RE) || []).length;
      if (samples.length < 10) {
        const near = before.match(new RegExp(`.{0,30}(?:${NUM_RE})[ ‌]+(?:${SUIT_RE}).{0,24}`))
          || before.match(/.{0,30}کاهنه اعظم.{0,24}/);
        if (near) samples.push(`  ${row.slug}.${col}\n     − …${near[0]}…\n     + …${fixFarsiNames(near[0])}…`);
      }
    }
    if (Object.keys(changed).length) writes.push({ slug: row.slug, changed });
  }

  console.log(`rows: ${writes.length}/${rows.length}   columns: ${colCount}   name occurrences: ${editCount}`);
  if (samples.length) console.log('\n' + samples.join('\n'));

  if (!writes.length) { console.log('\nNothing to do — names are already correct.'); return; }

  if (!apply) {
    console.log('\nDRY RUN — nothing written. Re-run with --apply to write.');
    return;
  }

  let done = 0;
  for (const { slug, changed } of writes) {
    const keys = Object.keys(changed);
    await db.execute({
      sql: `UPDATE card_content SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE slug = ?`,
      args: [...keys.map(k => changed[k]), slug],
    });
    done++;
  }
  console.log(`\n✓ Updated ${done} rows. Resubmit the sitemap: node execution/indexnow-submit.mjs`);
}

main().catch(e => { console.error('ERR', e.message); process.exit(1); });
