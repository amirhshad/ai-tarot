# Arabic Card Content — Phase 2: cohort first

**Date:** 2026-10-06
**Status:** Draft, awaiting review
**Phase:** 2 of 2. Phase 1 (`2026-10-04-arabic-locale-design.md`) shipped the Arabic shell, UI and reading flow. This spec covers the card-meaning pages it deliberately gated.

## Problem

`/ar/tarot-card-meanings/*` returns 404 by design. `card-queries.ts` reads 17 `_fa`-suffixed columns with an **English fallback**, so ungating those routes without Arabic content would serve English card text under Arabic URLs — duplicate content in the Arabic namespace, on a site whose primary search channel is Bing.

Arabic's exclusion is encoded in exactly one place: `CARD_CONTENT_LOCALES` in `app/src/lib/seo/alternates.ts`. Adding `'ar'` re-enables the routes, the sitemap entries, the hreflang, the nav links, the 21 in-body links and the hidden homepage CTA together.

## The uncomfortable prior

Before committing to 78 Arabic pages, the evidence from the two locales that already have them:

| | English | Farsi |
|---|---|---|
| Bing ranking | page one, avg position 7.5 | positions 6–10 |
| Card pages' share of impressions | 17% | — |
| Card pages' share of clicks | **4%** | — |
| CTR | **0.72%** | earns real clicks |
| Never clicked once | **57 of 79** | — |

Meanwhile `/yes-or-no` alone is **68% of impressions and 78% of clicks**. And the August 2026 deepening experiment found that where ranking was not the constraint, adding depth changed click behaviour not at all.

So English card pages rank and earn nothing; Farsi card pages rank and earn. Arabic will resemble one or the other, and we do not know which. **That uncertainty, not token cost, is the reason to start with a cohort.**

## Goal

Answer one question for roughly a tenth of the full effort: **do Arabic card pages behave like Farsi (worth building out) or like English (not)?**

Secondary goal: leave the schema in a state where a fourth locale costs no migration.

## Decisions taken

| Decision | Choice | Rationale |
|---|---|---|
| Scope | **Cohort of 8, measure, then decide** | Mirrors the discipline already applied to the English indexation experiment. The full set is a one-line constant change away once the cohort reports. |
| Schema | **Restructure to locale-keyed rows** | Phase 1 deliberately deferred this rather than deciding it wrongly. 17 columns per locale is 51 at three and 68 at four, and `execution/output/zh-cards/` says a fourth is coming. |
| Generation model | **Sonnet 5.5, not Haiku** | Established 2026-10-05: Haiku produced five grammatical errors per ~300 words of Arabic, Sonnet zero in 403. See `docs/arabic-reading-sample-2026-10-05.md`. Generating 78 pages of flawed Arabic and indexing them permanently is worse than generating none. |
| Measurement channel | **Bing first** | Bing sends ~8× Google's clicks here. Conclusions from Search Console are Google conclusions and say nothing about the channel that pays. |

## Prerequisite — fix the sitemap's `lastmod` before generating anything

`app/src/app/sitemap.ts` hardcodes `CONTENT_LAST_MODIFIED = '2026-05-14'`. Every card entry carries that date regardless of when its content actually changed.

This is not a side issue. It is **why the English deepening experiment was inconclusive**: of eight deepened cohort pages, Google had recrawled only two a month after deploy; the other six were last fetched *before* the content shipped. The sitemap told Google nothing had changed, so it did not come back.

An Arabic cohort published under a five-month-old `lastmod` would be unmeasurable the same way. So:

**Wire `lastModified` to a real per-card content-change date** — a `content_updated_at` column on the card row, surfaced through `card-queries.ts` and read by the sitemap, so a regenerated card advertises a fresh date and an untouched one does not. This is a prerequisite of the experiment, not a nice-to-have.

## 1. Schema — locale-keyed rows

Today: one `cards` row per card, with 17 `_fa` columns beside the English ones.

Target: card content moves to a row per (card, locale). Sketch:

```
card_content
  card_slug      TEXT    NOT NULL
  locale         TEXT    NOT NULL     -- 'en' | 'fa' | 'ar' | …
  name           TEXT
  upright_meaning TEXT
  reversed_meaning TEXT
  love_relationships TEXT
  career_finances TEXT
  as_feelings    TEXT
  how_someone_sees_you TEXT
  advice         TEXT
  yes_or_no      TEXT
  featured_snippet TEXT
  upright_keywords TEXT  -- JSON
  reversed_keywords TEXT -- JSON
  combinations   TEXT    -- JSON
  faq            TEXT    -- JSON
  meta_title     TEXT
  meta_description TEXT
  content_updated_at TEXT -- the lastmod prerequisite
  PRIMARY KEY (card_slug, locale)
```

The English-only `deep_sections` / `deep_faq` / `deepened_at` / `deepened_model` columns from the August experiment move with the English row.

**Migration must be reversible and must not break Farsi.** Farsi card pages currently rank and earn clicks — they are the locale with the most to lose. Sequence:

1. Create `card_content` and backfill from the existing columns. Verify row counts and spot-check Farsi values byte-for-byte.
2. Switch `card-queries.ts` to read the new table, keeping the old columns in place.
3. Verify `/fa/tarot-card-meanings/*` renders identically — a before/after diff of rendered Farsi on all 78 pages, the same method Phase 1 used to protect Farsi.
4. Only then drop the old columns, in a separate migration.

`card-queries.ts`'s `rowToRichCardContent` loses its 17 `fa && row.x_fa ? … : row.x` ternaries and becomes a straight read of the requested locale's row, with an English fallback kept deliberately for a locale whose row is absent.

## 2. Cohort selection — eight cards, chosen from Farsi demand

The English experiment picked its cohort from cards already stuck at "Crawled – currently not indexed." Arabic has no such baseline: the pages do not exist.

The best available proxy for Arabic demand is **which cards already earn clicks in Farsi**. Farsi is the locale where card pages work, and it shares both script direction and a partially overlapping cultural market. Pull the per-URL Farsi card data with `node execution/bing-wmt.mjs` and take the eight highest-click `/fa/tarot-card-meanings/*` URLs.

Fall back to mirroring the English cohort (`the-tower`, `death`, `the-lovers`, `the-moon`, `three-of-swords`, `ten-of-swords`, `queen-of-pentacles`, `six-of-cups`) only if that data is not readily available — it buys cross-locale comparability at the cost of demand signal.

**The control group is the other 70 cards**, which stay gated and therefore 404. That is a cleaner control than the English experiment had: it compared deepened pages against shallow ones that were already indexed, whereas here the contrast is "exists" versus "does not," with no confounding prior index state.

## 3. Generation

Fork `execution/generate-card-content-fa.mjs` into `generate-card-content-ar.mjs`, or better, parameterise the existing script by locale — it is 298 lines and most of it is locale-agnostic.

Changes it needs:

- **Model: Sonnet 5.5**, not the hardcoded `claude-haiku-4-5-20251001`. (That constant needs changing anyway — Haiku 4.5 retires no sooner than 2026-10-15.)
- **Terminology injected into the prompt**, so generated prose matches what the UI already ships: a spread is `انتشار`, the querent `السائل`, orientations `مستقيمة`/`معكوسة`, suits `العصي`/`الكؤوس`/`السيوف`/`الدنانير`. Free generation does not know these — in the 2026-10-05 sample Sonnet wrote `الأوراق الكبرى` for the Major Arcana where the bundle says `الأركانا الكبرى`.
- **No Persian letters.** The same assertion `parity.test.ts` makes about `ar.json` should gate generated output: پ چ ژ گ ک ی must not appear.
- **`--limit` already exists** for cohort runs.

Two terminology questions Phase 1 deferred and this phase must settle, because they become indexed text:

- **`مجموعة` currently carries both "suit" and "deck"**, and both senses collide inside `cardHub`. Phase 1 left it rather than guess; Arabic keyword data should settle it.
- **`الأركانا الكبرى` versus `الأسرار الكبرى`** for Major Arcana. The transliteration is the dominant form in Arabic tarot content online; `الأسرار` reads more esoteric. This is a search question, not a style one.

## 4. Ungating

Add `'ar'` to `CARD_CONTENT_LOCALES`. Everything follows: routes stop 404ing, sitemap entries appear, hreflang gains `ar`, nav and in-body links unhide, the homepage CTA returns.

**For a cohort, the gate needs one more dimension.** `CARD_CONTENT_LOCALES` is all-or-nothing per locale, but a cohort means 8 Arabic slugs live and 70 gated. So the gate becomes a per-(locale, slug) check: a locale is enabled when it has content for *that card*, which the new `card_content` table can answer directly.

That is a better shape than a hardcoded cohort list — the gate asks the database rather than a constant, so publishing a card is a data operation and the full rollout needs no code change at all.

One test already asserts `CARD_CONTENT_LOCALES` equals `['en','fa']` — it will fail, deliberately, forcing the change to be conscious.

## 5. What to measure, and when

Publish the cohort, run `node execution/indexnow-submit.mjs`, then wait.

**At roughly four weeks**, for the 8 Arabic URLs:

- Are they indexed on Bing? (The English equivalents are, so absence would be surprising and informative.)
- What position, and what CTR against the Farsi card pages' and the English card pages' rates?
- Did impressions on existing Arabic pages change — i.e. did the cohort cannibalise or lift?

**The decision rule, set in advance so the result is not rationalised afterwards:**

- Arabic cohort CTR within range of **Farsi's** → generate the remaining 70. The pattern holds and the pages earn.
- Arabic cohort CTR near **English's 0.72%** → stop. Do not generate 70 more pages that rank and earn nothing; spend the effort on `/yes-or-no` and the AEO snippet problem, which is where 78% of clicks already come from.
- Not indexed at all after four weeks → the blocker is discovery or authority, not content, and generating more content cannot fix it.

## 6. Testing

- Migration: row-count parity, and a byte-for-byte Farsi comparison before and after the `card-queries.ts` switch.
- A rendered-output diff of all 78 `/fa/tarot-card-meanings/*` pages across the migration. Farsi is the locale with the most to lose.
- Generated Arabic: no Persian letters, every one of the 17 fields non-empty, committed terminology used.
- The per-(locale, slug) gate: a card with Arabic content renders; one without 404s; English and Farsi unaffected.
- `lastmod`: a regenerated card advertises a fresh date, an untouched one does not.

## 7. Out of scope

- The remaining 70 cards. That is the decision this phase exists to inform.
- Arabic equivalents of `farsi-names.ts` (search-term variants) — worth doing only if the cohort succeeds.
- The five signed-in surfaces still English in Arabic (`/history`, `/billing`, `/s/[token]`, both auth forms) and `PricingTable`'s ~26 strings. Tracked separately; unrelated to card content.
- Google. The `lastmod` fix may improve Google recrawl as a side effect, and the stalled English experiment may become measurable, but this phase is judged on Bing.

---

# Cost

## Token cost — genuinely trivial

Measured rather than estimated. A real generated card payload (`execution/output/zh-cards/ace-of-cups.json`) is 16 fields and 4,979 characters. The generation prompt template is 2,092 characters. Arabic runs ~0.53 tokens per character, measured from the 2026-10-05 reading.

| Per card | Tokens | Rate (Sonnet 5, $2/$10 per Mtok) | Cost |
|---|---|---|---|
| Input (prompt + English context) | ~800 | $2 / Mtok | $0.0016 |
| Output (17 Arabic fields) | ~4,500 | $10 / Mtok | $0.045 |
| **Total** | | | **~$0.047** |

| Run | Cards | Cost |
|---|---|---|
| **Cohort** | 8 | **~$0.38** |
| Full set | 78 | ~$3.65 |
| Full set, with a regeneration pass and retries | 78 × 2 | ~$7.30 |

On Haiku 4.5 ($1/$5) the full set would be ~$1.80 — but that buys the five-errors-per-300-words Arabic this project already rejected, so the $1.85 difference is not a real saving.

Rates are from the bundled Claude API reference (cached 2026-06-24); Sonnet 5.5 is not listed separately there, and this project's own migration record notes it shipped at the same $2/$10 as Sonnet 5. Worth confirming against live pricing before committing a budget, though the conclusion is insensitive to it — at ten times the rate the full set is still under $40.

## What this phase actually costs

The token bill is rounding error. The real costs:

| Cost | Size | Notes |
|---|---|---|
| **Schema migration** | The largest engineering item | Touches the working Farsi path, needs a reversible four-step sequence and a 78-page Farsi rendered-output diff. This is where the risk is, not in generation. |
| **The `lastmod` prerequisite** | Small, high leverage | A column, a query change, a sitemap change. Also unblocks the stalled English experiment. |
| **Script + gate changes** | Moderate | Parameterise by locale, change the model, inject terminology, make the gate per-(locale, slug). |
| **Review with no native Arabic reviewer** | Unbounded, and the real constraint | 8 cards × 17 fields is 136 Arabic values. The full set would be 1,326. Phase 1's experience was that every Arabic review pass found real defects, and that was with ~900 short UI strings. Long-form prose at this volume cannot be reviewed to the same standard by the same method. |
| **Index-bloat risk** | Not money | If Arabic behaves like English, 78 pages ranking page-one at 0.72% CTR is 78 pages of crawl budget earning nothing. |
| **Four weeks of waiting** | Calendar, not effort | The measurement cannot be rushed, and rushing it is what made the English experiment inconclusive. |

## The recommendation the numbers support

Because generation is ~$0.40 for the cohort, **cost is not the thing to optimise — sequence is.** Specifically: do the `lastmod` fix first and on its own. It is small, it is a prerequisite of this experiment, and it independently unblocks the English one that has been stalled since August. If the Arabic cohort then shows the Farsi pattern, the remaining 70 cards cost under $4 of tokens and the question becomes review capacity, not budget.
