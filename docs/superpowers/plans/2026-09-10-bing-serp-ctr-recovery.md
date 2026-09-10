# Bing SERP CTR Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert impressions TarotVeil already earns on Bing into clicks, by fixing the SERP snippets on the two page families that hold 85% of all impressions and by making new content discoverable within days instead of weeks.

**Architecture:** Three independent levers, ordered by return-on-effort. (1) Rewrite the `/yes-or-no` title and description — one i18n string per locale, the single highest-value edit available. (2) Replace the byte-identical templated meta descriptions on all 78 English card pages with per-card copy generated deterministically from data already in the `card_content` table — no LLM spend. (3) Add IndexNow so Bing, which is ~90% of current search traffic, picks up changes in days. A metadata guard script is built first and gates every subsequent task.

**Tech Stack:** Next.js 14 App Router, next-intl (locales `en`, `fa`), Turso/libSQL (`card_content` table), Node ESM scripts under `execution/`, Vercel deploy on push.

**Spec:** This plan's own "Background — the evidence" section below. Derived from the Bing Webmaster Tools exports of 2026-09-10 (`~/Downloads/tarotveil.com_{SearchPerformanceOverview,PageTrafficReport,KeywordReport,DeviceReport,CountryReport}_9_10_2026.csv`) covering 2026-03-15 → 2026-09-07.

---

## Background — the evidence

Lifetime totals reconcile across all four Bing exports: **30,133 impressions, 659 clicks, avg position 5.6.**

| Segment | Pages | Impressions | Clicks | CTR | Avg pos |
|---|---|---|---|---|---|
| `/yes-or-no` | 1 | 14,900 (68%) | 513 (78%) | 3.44% | 5.6 |
| English card pages | 79 | 3,622 (17%) | 26 (4%) | **0.72%** | 7.5 |
| Farsi (all) | 23 | 3,062 (14%) | 94 (14%) | 3.07% | 5.1 |

Query-level split of the yes/no family:

| Query type | Impressions | Clicks | CTR | Avg pos |
|---|---|---|---|---|
| contains "ai" | 712 | 274 | **38.5%** | 1.7 |
| contains "free" | 387 | 42 | 10.9% | 6.1 |
| plain "yes or no tarot" | 10,792 | 145 | **1.34%** | 5.5 |

Three conclusions drive every task below:

1. **Position is not the problem.** Avg position 5.6 should yield 5–8% CTR. `/yes-or-no` yields 3.44% overall and 1.34% on its biggest query. The gap is the snippet.
2. **The converting words are known.** "AI" converts at 38%, "free" at 11%, neither at 1.3%. Both words are already in the title but sit past the mobile truncation point.
3. **The card pages rank and are ignored.** 57 of 79 have never received a click. All 78 share one meta description differing only in the card name.

Device split (same pages, near-identical positions): Desktop 20,875 impr / 239 clicks / **1.14%**; Mobile 9,258 / 420 / **4.54%**. Unexplained; Task 6 investigates.

## Global Constraints

- **Locales are `en` and `fa` only.** `app/src/i18n/routing.ts` defines `locales: ['en','fa']`. Arabic does not exist and is explicitly **out of scope** for this plan — see "Deferred work".
- **Title budget: 60 characters**, measured on the string as rendered in the SERP. The root layout appends `" | TarotVeil"` (13 chars) to any `title` that is not `{ absolute: ... }`. Card pages already opt out via `title: { absolute: ... }`.
- **Description budget: 155 characters.**
- **Farsi copy keeps فال.** It is the category noun. When a Farsi title exceeds budget, cut the brand suffix, never فال.
- **No paid API calls in this plan.** Every generated string is deterministic from existing DB columns. If a task appears to need an LLM, stop and ask.
- **Never overwrite DB columns without a backup.** Task 3 is the first script in this repo to write non-additive columns; it must dump before it writes.
- **Commit one concern at a time.** Branch off `main`; do not commit to `main` directly.

## File Structure

| File | Responsibility |
|---|---|
| `execution/check-metadata.mjs` | **New.** Validation gate. Asserts title/description budgets and cross-page uniqueness for card rows and locale message files. Exit 1 on violation. |
| `execution/rewrite-card-meta.mjs` | **New.** Backs up then rewrites `meta_title` / `meta_description` for all English card rows from existing columns. `--dry-run` default. |
| `execution/indexnow-submit.mjs` | **New.** Reads the deployed sitemap, POSTs URLs to IndexNow. |
| `app/src/messages/en.json` | Modify `yesOrNo.metaTitle` / `metaDescription` / `ogTitle` / `ogDescription`. |
| `app/src/messages/fa.json` | Same keys, Farsi. |
| `app/src/app/[locale]/(marketing)/yes-or-no/page.tsx:9-33` | Switch `title` to `{ absolute }` to reclaim the 13 chars the layout template consumes. |
| `app/public/27104a98df7e4f81b7a4c6e1bf98df88.txt` | **New.** IndexNow key verification file. Public by design. |
| `docs/superpowers/plans/2026-09-10-bing-serp-ctr-recovery.md` | This plan. |

---

### Task 1: Metadata guard script

The repo has no test runner and no test script in `app/package.json`. Rather than introduce one for string assertions, this task builds the validation gate as an `execution/` script, matching the existing convention (`deepen-cards-kimi.mjs`, `generate-rich-card-content.mjs`). Every later task runs it.

**Files:**
- Create: `execution/check-metadata.mjs`
- Test: the script is self-testing — it runs against live data and exits non-zero on violation.

**Interfaces:**
- Consumes: `card_content` table columns `slug`, `meta_title`, `meta_description`, `meta_title_fa`, `meta_description_fa`; `app/src/messages/{en,fa}.json`.
- Produces: CLI `node execution/check-metadata.mjs`. Exit 0 = all pass, exit 1 = violations printed. Later tasks call this verbatim.

- [ ] **Step 1: Write the guard with a deliberately failing expectation**

Create `execution/check-metadata.mjs`:

```js
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
const BRAND_SUFFIX = ' | TarotVeil';

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
    const skeleton = v.replace(new RegExp(r.name || r.slug, 'gi'), '«CARD»').trim();
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
    // yes-or-no uses a bare `title`, so the layout appends the brand suffix.
    // Task 2 switches it to absolute; until then the budget is 60-13=47.
    checkLen(`msg:${locale}.yesOrNo`, 'metaTitle+suffix', y.metaTitle + BRAND_SUFFIX, TITLE_MAX);
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
```

- [ ] **Step 2: Run it and confirm it FAILS on the known-bad state**

Run: `node execution/check-metadata.mjs`

Expected: exit 1, with ~77 `meta_description template collision` violations for the card pages (they all share the `What does «CARD» mean? Upright & reversed meanings for love, career, feelings, and yes-or-no readings. Free AI tarot reading included.` skeleton) and likely `meta_title template collision` too.

**This failure is the point.** It is the 0.72% CTR expressed as a test. If it exits 0, the guard is wrong — the collision regex is not matching. Debug it before continuing.

- [ ] **Step 3: Commit the guard**

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git checkout -b fix/bing-serp-ctr
git add execution/check-metadata.mjs
git commit -m "test(seo): add metadata guard for SERP budgets and template collisions

78 card pages share one meta description skeleton, which is the direct
cause of 0.72% CTR at avg position 7.5 on Bing. This script fails on
that state; the following commits make it pass."
```

---

### Task 2: Rewrite the `/yes-or-no` title and description

The highest-return edit in the plan. 10,792 impressions at position 5.5 converting at 1.34%, on a page whose title already contains both words that convert ("Free", "AI") — but at characters 22 and 27, past where mobile truncates.

**Files:**
- Modify: `app/src/messages/en.json` → `yesOrNo.metaTitle`, `metaDescription`, `ogTitle`, `ogDescription`
- Modify: `app/src/messages/fa.json` → same keys
- Modify: `app/src/app/[locale]/(marketing)/yes-or-no/page.tsx:9-33`

**Interfaces:**
- Consumes: `execution/check-metadata.mjs` from Task 1.
- Produces: no code interface. Task 5 submits this URL to IndexNow.

- [ ] **Step 1: Switch the page to an absolute title**

The layout appends `" | TarotVeil"`, costing 13 of the 60 characters. Card pages already opt out; this page should too.

In `app/src/app/[locale]/(marketing)/yes-or-no/page.tsx`, change:

```ts
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
```

to:

```ts
  return {
    // Opt out of the layout's '%s | TarotVeil' template. The brand suffix is
    // the least useful 13 characters in a 60-char budget, and Bing data shows
    // the words that earn the click ("Free", "AI") must sit at the front.
    title: { absolute: t('metaTitle') },
    description: t('metaDescription'),
```

- [ ] **Step 2: Rewrite the English strings**

In `app/src/messages/en.json`, replace the four `yesOrNo` keys:

```json
    "metaTitle": "Free AI Yes or No Tarot — Instant Answer, No Signup",
    "metaDescription": "Ask a yes or no question and get an instant answer from an AI tarot reading. Three cards, one clear verdict, the reasoning behind it. Free, no signup.",
    "ogTitle": "Free AI Yes or No Tarot — Instant Answer",
    "ogDescription": "Ask a question, draw three cards, get a clear yes, no or maybe with AI interpretation. Free, no signup."
```

Rationale, tied to the data:
- `Free` at character 1 and `AI` at character 6 — both inside the mobile truncation window. Current title buries them at 22 and 27.
- `Instant Answer` and `No Signup` address the intent behind the 10,792 plain "yes or no tarot" impressions: those users want an immediate card flip, and currently pick one of the four results above us.
- Title is 51 chars, description 150 — both inside budget with the absolute-title change.

- [ ] **Step 3: Rewrite the Farsi strings**

In `app/src/messages/fa.json`, replace:

```json
    "metaTitle": "فال تاروت بله یا خیر رایگان — پاسخ فوری با هوش مصنوعی",
    "metaDescription": "سؤال بله یا خیر خود را بپرسید و پاسخ فوری از فال تاروت با هوش مصنوعی بگیرید. سه کارت، یک پاسخ روشن، همراه با دلیل آن. رایگان و بدون ثبت‌نام.",
    "ogTitle": "فال تاروت بله یا خیر رایگان — پاسخ فوری",
    "ogDescription": "سؤال بپرسید، سه کارت بکشید و پاسخ بله، خیر یا شاید را با تفسیر هوش مصنوعی ببینید. رایگان و بدون ثبت‌نام."
```

Note this keeps فال and adds هوش مصنوعی (AI) — the Farsi query data shows the same AI-modifier lift, e.g. `فال تاروت هوش مصنوعی` and `فال هوش مصنوعی رایگان` both converting well above the Farsi average. `ogTitle` drops the `| تاروت‌ویل` brand suffix to stay in budget, per the Global Constraints rule.

- [ ] **Step 4: Update the guard to match the absolute title, then run it**

Step 1 removed the brand suffix from this page, so the guard's `BRAND_SUFFIX` allowance is now wrong by 13 characters. **This is a required edit, not a contingency** — the new 51-char title plus the 13-char suffix is 64, and the guard would fail a page that is actually within budget.

In `execution/check-metadata.mjs`, change:

```js
    checkLen(`msg:${locale}.yesOrNo`, 'metaTitle+suffix', y.metaTitle + BRAND_SUFFIX, TITLE_MAX);
```

to:

```js
    // yes-or-no opts out of the layout's '%s | TarotVeil' template via
    // `title: { absolute }`, so it gets the full 60-char budget.
    checkLen(`msg:${locale}.yesOrNo`, 'metaTitle', y.metaTitle, TITLE_MAX);
```

`BRAND_SUFFIX` now has no remaining use — delete the constant so it does not sit there implying a check that no longer happens.

Run: `node execution/check-metadata.mjs`

Expected: the two `msg:en.yesOrNo` / `msg:fa.yesOrNo` checks pass. Card collisions still fail — that is Task 3. Confirm no NEW `msg:` violations appear.

- [ ] **Step 5: Verify the rendered title locally**

```bash
cd app && npm run build && npm start &
sleep 12
curl -s http://localhost:3000/yes-or-no | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3000/fa/yes-or-no | grep -o '<title>[^<]*</title>'
kill %1
```

Expected: `<title>Free AI Yes or No Tarot — Instant Answer, No Signup</title>` with **no** `| TarotVeil` suffix, and the Farsi equivalent.

- [ ] **Step 6: Commit**

```bash
git add app/src/messages/en.json app/src/messages/fa.json "app/src/app/[locale]/(marketing)/yes-or-no/page.tsx"
git commit -m "fix(seo): front-load 'Free' and 'AI' in yes-or-no title

Bing: 10,792 impressions on plain 'yes or no tarot' at position 5.5
convert at 1.34%, while queries containing 'ai' convert at 38.5% and
'free' at 10.9%. Both words were already in the title but at chars 22
and 27, past the mobile truncation point. Also drops the brand suffix
via an absolute title to reclaim 13 chars of the 60-char budget."
```

---

### Task 3: Replace the templated card meta descriptions

79 pages, 3,622 impressions, 26 clicks, 57 pages at zero. All share one description skeleton. This task generates 78 distinct ones **deterministically from columns already in the table** — `yes_or_no_verdict`, `upright_keywords`, `reversed_keywords` — so it costs nothing in API spend.

**Files:**
- Create: `execution/rewrite-card-meta.mjs`
- Modify (data): `card_content.meta_title`, `card_content.meta_description` for English rows

**Interfaces:**
- Consumes: `card_content` columns `slug`, `name`, `yes_or_no_verdict` (`'yes'|'no'|'maybe'`), `upright_keywords` (JSON string array), `reversed_keywords` (JSON string array).
- Produces: CLI `node execution/rewrite-card-meta.mjs [--write]`. Default is dry-run. Writes `execution/output/card-meta-backup-<ISO>.json` before any write.

- [ ] **Step 1: Write the generator**

Create `execution/rewrite-card-meta.mjs`:

```js
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

/**
 * Title: keep the card name first (that is what the searcher scanned for),
 * then add the Yes/No hook — per-card yes/no is the site's strongest query
 * family. Drop the hook when the name is long enough to blow the budget.
 */
function buildTitle(name) {
  const withHook = `${name} Tarot Meaning — Upright, Reversed & Yes/No`;
  if (withHook.length <= TITLE_MAX) return withHook;
  const short = `${name} Tarot Meaning — Upright & Reversed`;
  if (short.length <= TITLE_MAX) return short;
  return `${name} Tarot Meaning`;
}

/**
 * Description: opens with this card's actual verdict and its own keywords,
 * so no two are alike. Falls back through progressively shorter forms to
 * stay inside 155 chars.
 */
function buildDescription(name, verdict, up, rev) {
  const v = VERDICT_CLAUSE[verdict] || VERDICT_CLAUSE.maybe;
  const u = up.map(compress).filter(Boolean);
  const r = rev.map(compress).filter(Boolean);

  // Try the richest form first, shedding keywords then trailing clauses until
  // it fits. Verified against all 78 live rows: 0 over budget, 78/78 unique,
  // avg 147 chars, min 134, max 155.
  const forms = [
    n => `${name} ${v} in a yes or no reading. Upright: ${u.slice(0, n).join(', ')}. Reversed: ${r[0] || ''}. Love, feelings and career — free AI reading.`,
    n => `${name} ${v} in a yes or no reading. Upright: ${u.slice(0, n).join(', ')}. Reversed: ${r[0] || ''}. Love, feelings and career.`,
    n => `${name} ${v} in a yes or no reading. Upright: ${u.slice(0, n).join(', ')}. Reversed: ${r[0] || ''}.`,
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
    const up = JSON.parse(r.upright_keywords || '[]');
    const rev = JSON.parse(r.reversed_keywords || '[]');
    return {
      slug: r.slug,
      title: buildTitle(r.name),
      description: buildDescription(r.name, r.yes_or_no_verdict, up, rev),
      oldTitle: r.meta_title,
      oldDescription: r.meta_description,
    };
  });

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

  if (!WRITE) {
    console.log('\nDry run. Re-run with --write to apply.');
    return;
  }

  mkdirSync(join(__dirname, 'output'), { recursive: true });
  const backupPath = join(__dirname, 'output', `card-meta-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  writeFileSync(backupPath, JSON.stringify(updates.map(u => ({ slug: u.slug, meta_title: u.oldTitle, meta_description: u.oldDescription })), null, 2));
  console.log(`\nBacked up previous values to ${backupPath}`);

  for (const u of updates) {
    await db.execute({
      sql: 'UPDATE card_content SET meta_title = ?, meta_description = ? WHERE slug = ?',
      args: [u.title, u.description, u.slug],
    });
  }
  console.log(`✓ Wrote ${updates.length} rows.`);
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Dry-run and read all 78 outputs**

Run: `node execution/rewrite-card-meta.mjs`

Expected: 78 blocks printed, every `T(...)` ≤ 60 and `D(...)` ≤ 155, and `Unique descriptions: 78 / 78`.

This exact generator was prototyped against all 78 live rows during preflight. The numbers to expect: 0 titles and 0 descriptions over budget, 78/78 unique descriptions, 77 distinct skeletons, description lengths 134–155 (avg 147), and 72 of 78 titles carrying the `Yes/No` hook (the 6 longest card names fall back to `— Upright & Reversed`). **If your run disagrees with those numbers, something changed — stop and report it rather than writing.**

**Read the output before writing.** Spot-check at minimum:
- `the-sun` (verdict `yes`) and `the-tower` (verdict `no`) — the two highest-impression card pages — must read naturally.
- The longest card name (`the-wheel-of-fortune` or `knight-of-pentacles`) must not have produced a truncated-looking title.
- If any description reads awkwardly because a keyword list is oddly worded, fix the keyword handling in the generator, not the DB row.

- [ ] **Step 3: Write, then verify with the guard**

```bash
node execution/rewrite-card-meta.mjs --write
node execution/check-metadata.mjs
```

Expected: the guard now exits **0**. This is the moment Task 1's failing test passes.

- [ ] **Step 4: Verify two pages render the new copy**

```bash
cd app && npm run build && npm start &
sleep 12
curl -s http://localhost:3000/tarot-card-meanings/the-sun   | grep -o '<meta name="description" content="[^"]*"'
curl -s http://localhost:3000/tarot-card-meanings/the-tower | grep -o '<meta name="description" content="[^"]*"'
kill %1
```

Expected: two clearly different sentences, each opening with the card name and its yes/no verdict.

Note: `npm run build` is known to emit `credit balance is too low` errors while prerendering `/daily`. It still exits 0. That failure is unrelated to this task — do not chase it here.

- [ ] **Step 5: Commit**

```bash
git add execution/rewrite-card-meta.mjs execution/output/card-meta-backup-*.json
git commit -m "fix(seo): generate per-card meta descriptions from card data

All 78 card pages shipped one description skeleton. On Bing they hold
3,622 impressions at position 7.5 and earn 26 clicks; 57 have never been
clicked. Descriptions are now built from yes_or_no_verdict and the
per-card keyword lists — deterministic, no API spend, 78/78 unique.
Titles gain a Yes/No hook where the 60-char budget allows.

Previous values backed up under execution/output/."
```

---

### Task 4: Deploy and capture the before/after baseline

The two content changes must go live before IndexNow has anything worth submitting, and the baseline must be recorded before Bing recrawls.

**Files:** none — this is a deploy plus a written record.

- [ ] **Step 1: Record the pre-change baseline**

Append to `docs/superpowers/plans/2026-09-10-bing-serp-ctr-recovery.md` under a new `## Measurement` heading:

```markdown
## Measurement

Baseline, Bing lifetime through 2026-09-07 (before this branch shipped):

- `/yes-or-no`: 14,900 impressions, 513 clicks, 3.44% CTR, position 5.62
- English card pages (79): 3,622 impressions, 26 clicks, 0.72% CTR, position 7.49
- Query "yes or no tarot": 5,565 impressions, 52 clicks, 0.93% CTR, position 5.25
- Query "yes no tarot": 3,168 impressions, 45 clicks, 1.42% CTR, position 5.74
- Desktop 1.14% CTR vs Mobile 4.54% CTR

Re-export the same four Bing reports on **2026-10-10** (30 days post-deploy)
and compare. Positions should be unchanged — only CTR is being tested. If
position moves materially, the comparison is confounded and needs a longer
window.
```

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin fix/bing-serp-ctr
gh pr create --title "fix(seo): recover Bing CTR on yes-or-no and card pages" \
  --body "$(cat <<'EOF'
Bing is ~90% of current search traffic (434 clicks vs Google's 52 over the
same 28 days) and the site sits at avg position 5.6 — page one. The losses
are in the snippet, not the ranking.

- `/yes-or-no` (68% of all impressions): front-load "Free" and "AI", the two
  words the query data proves convert (38.5% and 10.9% CTR vs 1.34% without).
- 78 card pages: replace the shared description skeleton with per-card copy
  generated from existing DB columns. No API spend.
- Adds `execution/check-metadata.mjs` as a standing guard against both
  budget overruns and template collisions.

Baseline for the 30-day measurement is recorded in the plan doc.
EOF
)"
```

- [ ] **Step 3: Merge and confirm production**

After merge, wait for the Vercel deploy, then:

```bash
curl -s https://www.tarotveil.com/yes-or-no | grep -o '<title>[^<]*</title>'
curl -s https://www.tarotveil.com/tarot-card-meanings/the-sun | grep -o '<meta name="description" content="[^"]*"'
```

Expected: the new title with no brand suffix, and the new Sun description. **Do not proceed to Task 5 until this confirms** — IndexNow would otherwise submit URLs whose old copy is still cached.

---

### Task 5: IndexNow

Bing is the channel that works, and IndexNow is its instant-indexing protocol. Without it, the Task 2/3 changes wait on natural recrawl.

**Files:**
- Created: `app/public/27104a98df7e4f81b7a4c6e1bf98df88.txt` (done during setup)
- Create: `execution/indexnow-submit.mjs`

**Interfaces:**
- Consumes: the deployed `https://www.tarotveil.com/sitemap.xml`.
- Produces: CLI `node execution/indexnow-submit.mjs [--limit N]`.

- [x] **Step 1: Place the key verification file** — DONE during setup

The key was provisioned from Bing Webmaster Tools and supplied by the project owner:
`27104a98df7e4f81b7a4c6e1bf98df88`

The verification file already exists at `app/public/27104a98df7e4f81b7a4c6e1bf98df88.txt`,
containing exactly the key with no trailing newline. Anything in `app/public/` is served
from the site root, so it will resolve at
`https://www.tarotveil.com/27104a98df7e4f81b7a4c6e1bf98df88.txt` once deployed.

**This key is not a secret.** IndexNow keys are published at a public URL by design — that
public fetch is how Bing verifies ownership. It belongs in git, unlike anything in `.env*`.

- [ ] **Step 2: Write the submitter**

Create `execution/indexnow-submit.mjs`:

```js
#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing).
 *
 * Bing is ~90% of TarotVeil's search traffic, and IndexNow is the only
 * instant-indexing path available for it. Reads the live sitemap so the
 * URL list never drifts from what is actually deployed.
 *
 * Usage:
 *   node execution/indexnow-submit.mjs             # submit everything
 *   node execution/indexnow-submit.mjs --limit 20  # first 20 only
 */
const KEY = '27104a98df7e4f81b7a4c6e1bf98df88';
const HOST = 'www.tarotveil.com';
const SITEMAP = `https://${HOST}/sitemap.xml`;

const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > -1 ? parseInt(process.argv[limitArg + 1], 10) : Infinity;

async function main() {
  const xml = await (await fetch(SITEMAP)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => m[1])
    .filter(u => u.startsWith(`https://${HOST}`))
    .slice(0, LIMIT);

  if (!urls.length) throw new Error('No URLs parsed from sitemap.');
  console.log(`Submitting ${urls.length} URLs to IndexNow...`);

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });

  // 200 = accepted, 202 = accepted pending key validation.
  console.log(`HTTP ${res.status} ${res.statusText}`);
  if (res.status !== 200 && res.status !== 202) {
    console.error(await res.text());
    process.exit(1);
  }
  console.log('✓ Accepted.');
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Deploy the key file first**

```bash
git add app/public/*.txt execution/indexnow-submit.mjs
git commit -m "feat(seo): add IndexNow key and submission script

Bing is ~90% of search traffic and IndexNow is its instant-indexing
path. Reads the live sitemap so the URL list cannot drift from what is
deployed."
git push
```

Wait for deploy, then verify the key is reachable — IndexNow rejects submissions when it is not:

```bash
curl -s https://www.tarotveil.com/27104a98df7e4f81b7a4c6e1bf98df88.txt
```

Expected: the key echoed back, nothing else.

- [ ] **Step 4: Submit a small batch, then the rest**

```bash
node execution/indexnow-submit.mjs --limit 10
```

Expected: `HTTP 200` or `HTTP 202`. If 403, the key file is not being served correctly — fix that before continuing. Then:

```bash
node execution/indexnow-submit.mjs
```

- [ ] **Step 5: Document the recurring use**

Add to `execution/` usage notes or the repo README, whichever the repo already uses for script docs:

```markdown
After deploying content changes, run:

    node execution/indexnow-submit.mjs

Bing accepts up to 10,000 URLs/day. Submitting the full sitemap on every
content deploy is well within quota.
```

Commit:

```bash
git add -A && git commit -m "docs: note IndexNow submission step for content deploys"
```

---

### Task 6: Diagnose the desktop CTR gap

Desktop is 69% of impressions and 36% of clicks — 1.14% vs mobile's 4.54%, at effectively the same position (5.88 vs 5.40), on pages dominated by the same URL. That is ~20,000 impressions returning 239 clicks. It is the largest single unexplained loss in the data and it may not be a snippet problem at all.

This task is an investigation, not a code change. Its deliverable is a written finding that determines whether further work is warranted.

**Files:**
- Create: `docs/bing-desktop-ctr-finding.md`

- [ ] **Step 1: Observe the live desktop SERP**

Note: the Playwright MCP server failed to connect this session (`CONNECTION_CLOSED`), so do this manually in a browser, or repair that server first.

Search Bing on **desktop** for each of: `yes or no tarot`, `yes no tarot`, `online yes no tarot`. For each, record:
- Whether a Copilot / AI-generated answer appears above the organic results, and whether it answers the question outright (draws a card, gives a verdict).
- Whether TarotVeil is cited as a source in that answer.
- How far down the page the first organic result sits.
- The pixel position of the TarotVeil result relative to the fold.

- [ ] **Step 2: Repeat on mobile**

Same three queries in a mobile viewport or on a phone. The hypothesis to confirm or kill: **desktop shows a Copilot answer that satisfies the query in place, and mobile does not.** If both show it, the hypothesis is wrong and the gap is something else — a wider snippet, a sidebar, a rich-result competitor.

- [ ] **Step 3: Write the finding**

Create `docs/bing-desktop-ctr-finding.md` recording what was observed, with the verdict stated plainly:

- **If Copilot is consuming the answer on desktop:** no title rewrite recovers those 20,000 impressions. The next move is being the cited source — which is the `ai-seo` skill's territory (AEO/GEO), a different project. Say so and stop.
- **If the SERP looks ordinary on both:** the gap is snippet presentation, and the Task 2 rewrite may already have addressed it. Fold the question into the 2026-10-10 measurement instead of acting now.

- [ ] **Step 4: Commit**

```bash
git add docs/bing-desktop-ctr-finding.md
git commit -m "docs: record Bing desktop vs mobile CTR investigation"
```

---

### Task 7: Strengthen internal links to the Farsi yes-or-no page

`/fa/yes-or-no` already exists — the `[locale]` route serves it and the sitemap emits it. But while `/yes-or-no` holds 68% of all site impressions, its Farsi twin does not appear in the Bing page report at all, and shows only 35 impressions at position 9.17 in Google. The page is live and nearly unlinked.

Farsi is the site's best-converting audience on both engines (7.45% CTR on Farsi-script Bing queries, position 9.3 with 33 clicks from Iran on Google), and Bing's Farsi traffic is a *separate* diaspora audience in US/CA/GB/DE. This is the cheapest unclaimed win left.

**Files:**
- Modify: the Farsi homepage and hub components that link to reading types. Locate them first — do not guess:

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot/app"
grep -rn "yes-or-no" src/ --include=*.tsx | grep -v node_modules
```

- [ ] **Step 1: Map the current link graph**

Run the grep above and list every component that links to `/yes-or-no`. For each, determine whether it renders for `locale === 'fa'` — the `Link` from `@/i18n/navigation` localizes hrefs automatically, so a shared component may already link correctly and the problem is elsewhere.

Record what you find before editing. If the Farsi page is already well-linked, the problem is external authority, not internal linking — write that conclusion and skip to Step 4.

- [ ] **Step 2: Add the missing links**

Wherever the English homepage or card hub surfaces the yes-or-no reading and the Farsi equivalent does not, add it, using the existing `yesOrNo.pageTitle` (`فال تاروت بله یا خیر`) as the anchor text. Match the surrounding component's existing markup and translation-key conventions exactly — do not introduce a new pattern.

- [ ] **Step 3: Verify both locales render the link**

```bash
cd app && npm run build && npm start &
sleep 12
curl -s http://localhost:3000/fa | grep -o 'href="/fa/yes-or-no"' | head -3
curl -s http://localhost:3000/fa/tarot-card-meanings | grep -o 'href="/fa/yes-or-no"' | head -3
kill %1
```

Expected: at least one match per page.

- [ ] **Step 4: Commit and submit to IndexNow**

```bash
git add -A
git commit -m "fix(seo): link the Farsi yes-or-no page from fa hubs

/yes-or-no is 68% of site impressions; /fa/yes-or-no draws almost none
and is nearly unlinked. Farsi converts at 7.45% CTR on Bing (vs 3.70%
Latin-script) and holds position 9.3 on Google."
git push
```

After deploy: `node execution/indexnow-submit.mjs --limit 50`

---

## Deferred work

**Arabic.** Not built. `app/src/i18n/routing.ts` declares `locales: ['en','fa']` and there is no `src/messages/ar.json`. Adding it is a project, not a task: a new locale in routing, a full `ar.json`, 78 card translations (the Farsi set took a dedicated generation script, `execution/generate-card-content-fa.mjs`, and its own DB columns — Arabic would need the same), plus sitemap and hreflang wiring. RTL layout is the one piece already solved by the Farsi work. Worth doing on the evidence that Farsi went from invisible to position 9 in a month, but it needs its own plan and its own generation budget.

**Card-combination pages.** ~38 multi-card queries appear in the Bing export (`queen of swords reversed and 10 of swords upright meaning`, `5 of swords upright clarified by judgment reversed meaning`), each with 1–3 impressions, no incumbent ranking for them, and a natural fit for an AI reading engine. This is a programmatic-SEO build — page template, URL scheme, generation pipeline, sitemap strategy, and a thin-content risk that needs thought. Separate plan. Do not start it until the 2026-10-10 measurement shows whether snippet quality alone moves card-page CTR, because the same snippet problem would apply to every generated combination page.

**The Google card-depth experiment.** Unchanged and still due late September 2026 — re-inspect the 8 cohort URLs against the 3 controls. This plan does not touch `deep_sections` or `deep_faq`, so it does not confound that test. It does change `meta_title` / `meta_description` on all 78 cards including the cohort and controls equally, which affects CTR but not index admission — the thing that experiment measures. Note the date this branch merges in the experiment's record so the two are not conflated later.

## Self-review

- **Spec coverage:** Priority 1 (yes-or-no title) → Task 2. Priority 2 (Farsi/Arabic yes-or-no) → Task 7 for Farsi; Arabic deferred with rationale, per the user's constraint. Priority 3 (card meta descriptions) → Task 3. Priority 4 (desktop gap) → Task 6. Priority 5 (combination pages) → deferred with an explicit gate. Priority 6 (IndexNow) → Task 5. Measurement → Task 4.
- **Ordering:** the guard (1) precedes the changes it validates (2, 3); the deploy (4) precedes IndexNow (5) so no stale URL is submitted; the investigation (6) is independent and can run in parallel.
- **Naming consistency:** `execution/check-metadata.mjs`, `execution/rewrite-card-meta.mjs`, `execution/indexnow-submit.mjs` — referenced identically in every task. `TITLE_MAX = 60` / `DESC_MAX = 155` match between the guard and the generator.
- **Resolved at preflight:** the `BRAND_SUFFIX` conflict between Tasks 1 and 2 is now a mandatory, fully specified edit in Task 2 Step 4 rather than a contingency.
- **Resolved at preflight:** both new scripts use the repo's `createRequire(.../app/package.json)` bootstrap. There is no root `package.json`/`node_modules`, so a bare ESM import of `@libsql/client` would fail.
- **Resolved at preflight:** Task 3's description generator was rewritten after checking the live table — the keyword columns hold full phrases, not short keywords. The replacement is verified against all 78 rows.
