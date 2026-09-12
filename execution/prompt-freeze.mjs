#!/usr/bin/env node
/**
 * Prompt freeze gate.
 *
 * Prompt text is a product asset, not incidental source. A refactor, a merge,
 * or a well-meaning tidy-up can change the voice of every reading we ship
 * without failing a build or showing up as an obvious diff. This gate hashes
 * the rendered prompts across a fixture matrix and fails when a frozen one
 * changes.
 *
 *   node execution/prompt-freeze.mjs            # verify (exit 1 on drift)
 *   node execution/prompt-freeze.mjs --update   # re-freeze, deliberately
 *   node execution/prompt-freeze.mjs --verbose  # show the changed text
 *
 * Rules, following the same convention the snapshot enforces elsewhere:
 *   - CHANGED frozen prompt  -> failure. Re-freeze only if the change is intended.
 *   - REMOVED frozen prompt  -> failure. A retired spread or locale needs a human.
 *   - ADDED prompt           -> allowed. New spreads and languages may add keys.
 *
 * Fixtures live in prompt-freeze.fixtures.ts; the frozen hashes in
 * prompt-freeze.snapshot.json. Both are meant to be committed.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const APP_SRC = join(ROOT, 'app', 'src');
const ESBUILD = join(ROOT, 'app', 'node_modules', '.bin', 'esbuild');
const FIXTURES = join(HERE, 'prompt-freeze.fixtures.ts');
const SNAPSHOT = join(HERE, 'prompt-freeze.snapshot.json');

const argv = process.argv.slice(2);
const UPDATE = argv.includes('--update');
const VERBOSE = argv.includes('--verbose');

if (argv.includes('--help') || argv.includes('-h')) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace(/^.*?\/\*\*/s, '').replace(/^ \* ?/gm, ''));
  process.exit(0);
}

const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 16);

function renderFixtures() {
  if (!existsSync(ESBUILD)) {
    console.error('✗ esbuild not found at app/node_modules/.bin/esbuild');
    console.error('  Run `npm install` inside app/ first — this gate bundles the');
    console.error('  TypeScript prompt layer to render it.');
    process.exit(2);
  }
  const tmp = mkdtempSync(join(tmpdir(), 'prompt-freeze-'));
  const bundle = join(tmp, 'fixtures.mjs');
  try {
    execFileSync(ESBUILD, [
      FIXTURES,
      '--bundle',
      '--platform=node',
      '--format=esm',
      `--alias:@=${APP_SRC}`,
      `--outfile=${bundle}`,
      '--log-level=warning',
    ], { stdio: ['ignore', 'ignore', 'inherit'] });
    return bundle;
  } catch {
    console.error('✗ Failed to bundle the prompt fixtures. Fix the TypeScript error above.');
    rmSync(tmp, { recursive: true, force: true });
    process.exit(2);
  }
}

const bundlePath = renderFixtures();
const { collect } = await import(pathToFileURL(bundlePath).href);
const rendered = collect();
rmSync(dirname(bundlePath), { recursive: true, force: true });

const current = {};
const texts = new Map();
for (const { key, text } of rendered) {
  if (current[key] !== undefined) {
    console.error(`✗ Duplicate fixture key: ${key}`);
    process.exit(2);
  }
  current[key] = sha(text);
  texts.set(key, text);
}

if (!existsSync(SNAPSHOT)) {
  if (!UPDATE) {
    console.error('✗ No snapshot found. Create it with:\n    node execution/prompt-freeze.mjs --update');
    process.exit(1);
  }
  writeSnapshot(current);
  console.log(`✓ Froze ${Object.keys(current).length} prompts.`);
  process.exit(0);
}

const previous = JSON.parse(readFileSync(SNAPSHOT, 'utf8')).prompts ?? {};

const changed = [];
const added = [];
const removed = [];
for (const key of Object.keys(current)) {
  if (previous[key] === undefined) added.push(key);
  else if (previous[key] !== current[key]) changed.push(key);
}
for (const key of Object.keys(previous)) {
  if (current[key] === undefined) removed.push(key);
}

if (UPDATE) {
  writeSnapshot(current);
  const summary = [
    changed.length ? `${changed.length} changed` : null,
    added.length ? `${added.length} added` : null,
    removed.length ? `${removed.length} removed` : null,
  ].filter(Boolean).join(', ') || 'no changes';
  console.log(`✓ Re-froze ${Object.keys(current).length} prompts (${summary}).`);
  process.exit(0);
}

for (const key of added) console.log(`+ added   ${key}`);

if (!changed.length && !removed.length) {
  const note = added.length ? ` (${added.length} new, allowed)` : '';
  console.log(`✓ ${Object.keys(current).length} prompts match the snapshot${note}.`);
  if (added.length) console.log('  Run --update to record the new ones.');
  process.exit(0);
}

console.error('');
console.error('✗ Frozen prompt text changed.');
console.error('');
for (const key of changed) {
  console.error(`  ~ changed  ${key}`);
  if (VERBOSE) {
    console.error('    ---');
    console.error(texts.get(key).split('\n').map((l) => `    ${l}`).join('\n'));
    console.error('    ---');
  }
}
for (const key of removed) console.error(`  - removed  ${key}`);
console.error('');
console.error('  This changes the voice of readings we ship. If it was intended:');
console.error('      node execution/prompt-freeze.mjs --update');
console.error('  and commit the snapshot alongside the prompt change, so the diff');
console.error('  shows the voice change as a deliberate act.');
if (!VERBOSE) console.error('  Re-run with --verbose to print the new text.');
console.error('');
process.exit(1);

function writeSnapshot(prompts) {
  const body = {
    _comment: 'Frozen rendered prompts. Regenerate with `node execution/prompt-freeze.mjs --update`. Do not hand-edit.',
    prompts: Object.fromEntries(Object.keys(prompts).sort().map((k) => [k, prompts[k]])),
  };
  writeFileSync(SNAPSHOT, `${JSON.stringify(body, null, 2)}\n`);
}
