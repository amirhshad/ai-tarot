#!/usr/bin/env node
/**
 * Rewrite English meta_title / meta_description for all 78 card pages.
 *
 * Why: every card currently ships the same description skeleton —
 *   "What does «CARD» mean? Upright & reversed meanings for love, career,
 *    feelings, and yes-or-no readings. Free AI tarot reading included."
 * On Bing these pages hold 3,622 impressions at avg position 7.5 and earn
 * 26 clicks (0.72%); 57 of 79 have never been clicked. A seventh result with
 * a visibly templated snippet gets skipped.
 *
 * This generates per-card copy from data ALREADY in the table — no LLM call,
 * no API spend. Variation comes from yes_or_no_verdict and the keyword lists,
 * which differ for every card.
 *
 * Backup naming: each `--write` run creates execution/output/card-meta-backup-
 * <ISO>.json holding the values it is ABOUT TO OVERWRITE. If this script is
 * ever re-run, the OLDEST backup for a rewrite is the true original — not the
 * newest, which only captures the previous run's output. See
 * execution/output/README.md before restoring from any of these files.
 *
 * Idempotent: before writing, generated values are compared against what is
 * already in the table. If every row already matches, the script prints that
 * nothing changed and exits without creating a backup or touching the DB.
 * The actual write is a single atomic db.batch() — not a sequential loop —
 * so a dropped connection mid-write can't leave the table half-updated.
 *
 * Usage:
 *   node execution/rewrite-card-meta.mjs            # dry run, prints all 78
 *   node execution/rewrite-card-meta.mjs --write    # backs up, then writes
 */
import { createRequire } from 'module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// There is no package.json or node_modules at the repo root — deps live in
// app/. This is the bootstrap every script in execution/ uses; see
// deepen-cards-kimi.mjs:31-33. A bare `import from '@libsql/client'` fails.
const require = createRequire(resolve(__dirname, '../app/package.json'));
const { createClient } = require('@libsql/client');
const WRITE = process.argv.includes('--write');

const TITLE_MAX = 60;
const DESC_MAX = 155;

function loadEnv() {
  const raw = readFileSync(join(ROOT, 'app', '.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
  }
}

/** "yes" -> the clause that opens the description. */
const VERDICT_CLAUSE = {
  yes: 'leans yes',
  no: 'leans no',
  maybe: 'is a conditional card',
};

/**
 * The keyword columns hold full phrases ("New beginnings and fresh starts"),
 * not short keywords. Used raw they blow the 155-char budget and every card
 * collapses to the same short fallback form. Keep the first idea only.
 */
function compress(k) {
  if (!k) return '';
  return String(k)
    .toLowerCase()
    .trim()
    .split(/ (?:and|or) /)[0]
    .replace(/[.,;:]+$/, '')
    .trim();
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Title: keep the card name first (that is what the searcher scanned for),
 * then add the Yes/No hook — per-card yes/no is the site's strongest query
 * family. Drop the hook when the name is long enough to blow the budget.
 *
 * A pure "{name} Tarot Meaning — Upright, Reversed & Yes/No" hook is
 * identical across every card once the guard strips the name out to check
 * for a shared template — that is exactly the collision the guard exists to
 * catch. So the hook leads with this card's own top keyword (from
 * upright_keywords) instead of the generic phrase; the generic phrase is
 * kept only as a last-resort fallback for the handful of names too long for
 * a keyword-bearing title to fit in 60 chars.
 */
function buildTitle(name, u, kwIndex = 0) {
  const kw = capitalize(u[kwIndex] ?? u[0] ?? '');
  const forms = [];
  if (kw) {
    forms.push(`${name} Tarot Meaning — ${kw} (Yes/No)`);
    forms.push(`${name} Tarot Meaning — ${kw}`);
  }
  forms.push(`${name} Tarot Meaning — Upright, Reversed & Yes/No`);
  forms.push(`${name} Tarot Meaning — Upright & Reversed`);
  forms.push(`${name} Tarot Meaning`);
  return forms.find(f => f.length <= TITLE_MAX) || forms[forms.length - 1].slice(0, TITLE_MAX);
}

/**
 * Description: opens with this card's actual verdict and its own keywords,
 * so no two are alike. Falls back through progressively shorter forms to
 * stay inside 155 chars.
 *
 * `offset` shifts the keyword window used for BOTH the upright list and the
 * reversed word — a dedupe collision (two cards whose first upright/reversed
 * keywords compress to the same phrase, e.g. Ace of Swords and King of
 * Swords both reducing to "mental clarity" / "mental confusion") is resolved
 * by rotating the upright array and advancing the reversed index by one,
 * rather than only shifting the reversed word as before (which left the
 * upright clause — the actual collision source — untouched).
 */
function buildDescription(name, verdict, u, r, offset = 0) {
  const v = VERDICT_CLAUSE[verdict] || VERDICT_CLAUSE.maybe;
  const uu = offset && u.length > offset ? u.slice(offset).concat(u.slice(0, offset)) : u;
  const rWord = r[offset] ?? r[0] ?? '';

  // Try the richest form first, shedding keywords then trailing clauses until
  // it fits. Verified against all 78 live rows: 0 over budget, 78/78 unique,
  // avg 147 chars, min 134, max 155.
  const forms = [
    n => `${name} ${v} in a yes or no reading. Upright: ${uu.slice(0, n).join(', ')}. Reversed: ${rWord}. Love, feelings and career — free AI reading.`,
    n => `${name} ${v} in a yes or no reading. Upright: ${uu.slice(0, n).join(', ')}. Reversed: ${rWord}. Love, feelings and career.`,
    n => `${name} ${v} in a yes or no reading. Upright: ${uu.slice(0, n).join(', ')}. Reversed: ${rWord}.`,
  ];
  for (const f of forms) {
    for (const n of [3, 2, 1]) {
      const candidate = f(n);
      if (candidate.length <= DESC_MAX) return candidate;
    }
  }
  return `${name} ${v} in a yes or no reading. Upright: ${u[0] || ''}.`.slice(0, DESC_MAX);
}

async function main() {
  loadEnv();
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const { rows } = await db.execute(
    'SELECT card_id, slug, name, yes_or_no_verdict, upright_keywords, reversed_keywords, meta_title, meta_description FROM card_content ORDER BY card_id'
  );
  console.log(`Loaded ${rows.length} cards.\n`);

  const updates = rows.map(r => {
    const u = JSON.parse(r.upright_keywords || '[]').map(compress).filter(Boolean);
    const rv = JSON.parse(r.reversed_keywords || '[]').map(compress).filter(Boolean);
    return {
      slug: r.slug,
      name: r.name,
      u, rv,
      verdict: r.yes_or_no_verdict,
      title: buildTitle(r.name, u),
      description: buildDescription(r.name, r.yes_or_no_verdict, u, rv),
      oldTitle: r.meta_title,
      oldDescription: r.meta_description,
    };
  });

  // The guard (execution/check-metadata.mjs) strips the card name out of
  // each string and flags any two rows that reduce to the same skeleton —
  // that is the actual "templated copy" bug this task fixes. Two cards can
  // legitimately share a leading keyword (e.g. Ace of Swords and King of
  // Swords both open with "mental clarity"), so replay that same check here
  // and, on a collision, retry the later row with its next-best keyword
  // before falling back to the generic form. All deterministic from the
  // same columns — no new data, no LLM.
  const skeleton = (v, name) => v.replace(new RegExp(`\\b${name}\\b`, 'gi'), '«CARD»').trim();

  function dedupe(field, build) {
    const seen = new Map();
    for (const upd of updates) {
      let value = upd[field];
      let index = 0;
      let key = skeleton(value, upd.name);
      while (seen.has(key) && index < 6) {
        index += 1;
        value = build(upd, index);
        key = skeleton(value, upd.name);
      }
      seen.set(key, upd.slug);
      upd[field] = value;
    }
  }
  dedupe('title', (upd, i) => buildTitle(upd.name, upd.u, i));
  dedupe('description', (upd, i) => buildDescription(upd.name, upd.verdict, upd.u, upd.rv, i));

  for (const u of updates) {
    console.log(`${u.slug}`);
    console.log(`  T(${u.title.length}) ${u.title}`);
    console.log(`  D(${u.description.length}) ${u.description}`);
  }

  const descs = new Set(updates.map(u => u.description));
  console.log(`\nUnique descriptions: ${descs.size} / ${updates.length}`);
  if (descs.size !== updates.length) {
    console.error('✗ Descriptions are not unique. Fix the generator before writing.');
    process.exit(1);
  }

  const titles = new Set(updates.map(u => u.title));
  console.log(`Unique titles: ${titles.size} / ${updates.length}`);
  if (titles.size !== updates.length) {
    console.error('✗ Titles are not unique. Fix the generator before writing.');
    process.exit(1);
  }

  const overTitle = updates.filter(u => u.title.length > TITLE_MAX).length;
  const overDesc = updates.filter(u => u.description.length > DESC_MAX).length;
  console.log(`Titles over ${TITLE_MAX} chars: ${overTitle}`);
  console.log(`Descriptions over ${DESC_MAX} chars: ${overDesc}`);
  if (overTitle || overDesc) {
    console.error('✗ Length budget exceeded. Fix the generator before writing.');
    process.exit(1);
  }

  if (!WRITE) {
    console.log('\nDry run. Re-run with --write to apply.');
    return;
  }

  // Idempotent no-op guard: if the table already holds exactly these values
  // (e.g. this is a re-run after a previous write already succeeded), there
  // is nothing to back up or write. Skipping avoids creating a confusing
  // extra backup file whose "old" values would just be the current — already
  // correct — copy, and makes the script safe to re-run at will.
  const changed = updates.filter(u => u.title !== u.oldTitle || u.description !== u.oldDescription);
  if (changed.length === 0) {
    console.log('\nNo changes: every row already matches the generated values. Nothing to back up or write.');
    return;
  }
  console.log(`\n${changed.length} of ${updates.length} rows differ from the current DB values.`);

  mkdirSync(join(__dirname, 'output'), { recursive: true });
  const backupPath = join(__dirname, 'output', `card-meta-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  writeFileSync(backupPath, JSON.stringify(updates.map(u => ({ slug: u.slug, meta_title: u.oldTitle, meta_description: u.oldDescription })), null, 2));
  console.log(`Backed up previous values to ${backupPath}`);

  // Single atomic batch rather than 78 sequential db.execute() calls — a
  // dropped connection mid-loop previously could have left some rows
  // rewritten and the rest untouched, with no detection. libSQL applies a
  // batch atomically.
  await db.batch(
    updates.map(u => ({
      sql: 'UPDATE card_content SET meta_title = ?, meta_description = ? WHERE slug = ?',
      args: [u.title, u.description, u.slug],
    })),
    'write'
  );
  console.log(`✓ Wrote ${updates.length} rows.`);
}

main().catch(e => { console.error(e); process.exit(1); });
