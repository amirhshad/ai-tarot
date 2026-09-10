#!/usr/bin/env node
/**
 * Metadata guard. Enforces the SERP budgets and, critically, cross-page
 * UNIQUENESS: 78 card pages sharing one templated description is what
 * produced 0.72% CTR at position 7.5 on Bing.
 *
 * Usage: node execution/check-metadata.mjs
 * Exit 0 = pass, 1 = violations.
 */
import { createRequire } from 'module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// There is no package.json or node_modules at the repo root — deps live in
// app/. This is the bootstrap every script in execution/ uses; see
// deepen-cards-kimi.mjs:31-33. A bare `import from '@libsql/client'` fails.
const require = createRequire(resolve(__dirname, '../app/package.json'));
const { createClient } = require('@libsql/client');

const TITLE_MAX = 60;
const DESC_MAX = 155;

const violations = [];
const fail = (where, msg) => violations.push(`${where}: ${msg}`);

function loadEnv() {
  // .env.local is the app's, not the repo root's.
  const raw = readFileSync(join(ROOT, 'app', '.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
  }
}

function checkLen(where, field, value, max) {
  if (!value) return fail(where, `${field} is empty`);
  if (value.length > max) fail(where, `${field} is ${value.length} chars (max ${max}): "${value}"`);
}

function checkUnique(where, field, rows, pick) {
  const seen = new Map();
  for (const r of rows) {
    const v = pick(r);
    if (!v) continue;
    // Strip the card name so a shared TEMPLATE is caught even though the
    // rendered strings differ. This is the check that matters.
    const skeleton = v.replace(new RegExp(`\\b${r.name || r.slug}\\b`, 'gi'), '«CARD»').trim();
    if (seen.has(skeleton)) {
      fail(where, `${field} template collision: "${r.slug}" duplicates "${seen.get(skeleton)}"\n    ${skeleton}`);
    } else {
      seen.set(skeleton, r.slug);
    }
  }
}

async function main() {
  loadEnv();
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const { rows } = await db.execute(
    'SELECT slug, name, meta_title, meta_description, meta_title_fa, meta_description_fa FROM card_content ORDER BY card_id'
  );
  console.log(`Checking ${rows.length} card rows...`);

  for (const r of rows) {
    checkLen(`card:${r.slug}`, 'meta_title', r.meta_title, TITLE_MAX);
    checkLen(`card:${r.slug}`, 'meta_description', r.meta_description, DESC_MAX);
    if (r.meta_title_fa) checkLen(`card:${r.slug}`, 'meta_title_fa', r.meta_title_fa, TITLE_MAX);
    if (r.meta_description_fa) checkLen(`card:${r.slug}`, 'meta_description_fa', r.meta_description_fa, DESC_MAX);
  }
  checkUnique('cards', 'meta_description', rows, r => r.meta_description);
  checkUnique('cards', 'meta_title', rows, r => r.meta_title);

  for (const locale of ['en', 'fa']) {
    const msgs = JSON.parse(readFileSync(join(ROOT, 'app', 'src', 'messages', `${locale}.json`), 'utf8'));
    const y = msgs.yesOrNo || {};
    // yes-or-no opts out of the layout's '%s | TarotVeil' template via
    // `title: { absolute }`, so it gets the full 60-char budget.
    checkLen(`msg:${locale}.yesOrNo`, 'metaTitle', y.metaTitle, TITLE_MAX);
    checkLen(`msg:${locale}.yesOrNo`, 'metaDescription', y.metaDescription, DESC_MAX);
  }

  if (violations.length) {
    console.error(`\n✗ ${violations.length} violation(s):\n`);
    for (const v of violations) console.error('  ' + v);
    process.exit(1);
  }
  console.log('\n✓ All metadata within budget and free of template collisions.');
}

main().catch(e => { console.error(e); process.exit(1); });
