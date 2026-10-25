/**
 * Rebuild `app/src/lib/seo/published-cards.json` from the database.
 *
 * The Phase 2 gate needs to answer "is this card live in this locale?" in three
 * places the database cannot reach: a **client** component (CardMeaningLink
 * gates ~20 in-body links and runs in the browser), `generateStaticParams` at
 * build time, and the sub-hub pages' card lists. A bundled manifest serves all
 * three synchronously, so one source of truth gates every surface.
 *
 * The database stays the source of *content*; this file is the derived index of
 * what has been published. Run it after any script that writes localised card
 * columns — `generate-card-content-ar.mjs --fetch` runs it automatically.
 *
 * Usage:
 *   node execution/build-card-locale-manifest.mjs
 *   node execution/build-card-locale-manifest.mjs --check   # exit 1 if stale
 */

import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, '../app/package.json'));
const { createClient } = require('@libsql/client');

const ENV_PATH = resolve(__dirname, '../app/.env.local');
const MANIFEST_PATH = resolve(__dirname, '../app/src/lib/seo/published-cards.json');

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

export async function buildManifest() {
  const { dbUrl, dbToken } = loadEnv();
  const db = createClient({ url: dbUrl, authToken: dbToken });

  // A locale counts as authored when its `name_xx` column is populated — the
  // column every generation script writes first and never partially. English is
  // always present: it is the canonical content every row carries.
  const result = await db.execute(
    `SELECT slug,
            (name_fa IS NOT NULL AND trim(name_fa) <> '') AS has_fa,
            (name_ar IS NOT NULL AND trim(name_ar) <> '') AS has_ar
     FROM card_content ORDER BY card_id`,
  );

  const manifest = {};
  for (const row of result.rows) {
    if (!row.slug) continue;
    const locales = ['en'];
    if (row.has_fa) locales.push('fa');
    if (row.has_ar) locales.push('ar');
    manifest[row.slug] = locales;
  }
  return manifest;
}

function serialise(manifest) {
  return JSON.stringify(manifest, null, 2) + '\n';
}

async function main() {
  const check = process.argv.includes('--check');
  const manifest = await buildManifest();
  const next = serialise(manifest);

  const counts = {};
  for (const locales of Object.values(manifest)) {
    for (const l of locales) counts[l] = (counts[l] || 0) + 1;
  }

  if (check) {
    const current = existsSync(MANIFEST_PATH) ? readFileSync(MANIFEST_PATH, 'utf-8') : '';
    if (current !== next) {
      console.error('published-cards.json is stale — run: node execution/build-card-locale-manifest.mjs');
      process.exit(1);
    }
    console.log(`published-cards.json is current (${Object.keys(manifest).length} cards).`);
    return;
  }

  writeFileSync(MANIFEST_PATH, next);
  console.log(`Wrote ${MANIFEST_PATH}`);
  console.log(`  cards: ${Object.keys(manifest).length}`);
  for (const [locale, n] of Object.entries(counts).sort()) {
    console.log(`  ${locale}: ${n}`);
  }
}

// `pathToFileURL`, not a `file://` template string: this repo's path contains
// spaces, which the URL form percent-encodes, so the naive comparison is always
// false and main() silently never runs.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
