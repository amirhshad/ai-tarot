# Arabic Card Content — the remaining 70

**Date:** 2026-10-25
**Status:** Blocked by design, until the cohort reports
**Follows:** `docs/superpowers/specs/2026-10-06-arabic-card-content-phase-2-design.md`
**Shipped already:** the 8-card cohort (commits `397350c`, `917e8f0`, `f2f9753`)

## The one thing this plan is waiting for

**Do not generate these 70 cards yet.** The cohort exists to answer whether
Arabic card pages earn clicks, and that answer takes four weeks of data. $3 of
tokens is not what makes this decision — generating now forfeits the control
group and buys nothing, because the waiting cannot be shortened either way.

Measurement opens **2026-11-22** (four weeks after the cohort deploys).

## Decision rule — set now, so the result is not rationalised later

The cohort's 8 Arabic URLs, measured against three reference points we already
have numbers for:

| Reference | CTR | What it means for Arabic |
|---|---|---|
| **Arabic non-card pages** (`/ar/love-tarot`, `/ar/spreads/single-card`) | **6.6%** — 8 clicks / 122 impressions, avg position ~8 | The fairest comparison: same locale, same market, so it controls for everything but the page type |
| Farsi card pages | 1.6–16.7% per card | The locale where card pages demonstrably work |
| English card pages | **0.72%**, 57 of 79 never clicked once | The locale where they rank and earn nothing |

- **Arabic card CTR at or near the Arabic non-card rate (≳4%)** → generate the
  remaining 70. The page type works in this locale.
- **Near English's 0.72%** → **stop.** Do not add 70 pages that rank and earn
  nothing. Spend the effort on `/yes-or-no`, which is already 68% of
  impressions and 78% of clicks, and on the AEO snippet problem.
- **Not indexed at all after four weeks** → the blocker is discovery or
  authority, not content, and more content cannot fix it. Investigate crawling
  before generating anything.
- **Ambiguous (1–4%)** → extend to eight weeks rather than splitting the
  difference. A second cohort would cost another four weeks for a weaker signal
  than patience on this one.

### Which channel to measure

**Google first, Bing second** — the opposite of the Phase 2 spec, and the
opposite of English.

The spec said to judge this on Bing because Bing sends ~8x Google's clicks.
That is true of English. The channel split is **per-locale**: Farsi's traffic is
Google's, and every Arabic click the site has recorded so far is Google's too
(8 clicks across `/ar/love-tarot` and `/ar/spreads/single-card`). Judging Arabic
on Bing would be reading a channel it does not yet have.

Check both — `mcp__google-search-console__get_analytics` for Google,
`node execution/bing-wmt.mjs GetPageStats` for Bing — but weight Google, and
note that Arabic's own channel mix is itself an open question this cohort will
help answer.

Also compare against the **Arabic non-card pages' own trend** over the same
window, not just their current rate. If Arabic traffic as a whole moves, a flat
card CTR means something different.

## If the answer is "generate" — the execution path

### Prerequisite: a `--missing` selector (small, do it first)

`--all` selects all 78, which would regenerate the 8 cohort cards: wasted spend,
and it would overwrite content that has been live and measured. Add a selector
that picks cards with no `name_ar`, mirroring the fa script's
`WHERE name_fa IS NULL`:

```js
// execution/generate-card-content-ar.mjs
if (args.missing) {
  const r = await db.execute(
    "SELECT slug FROM card_content WHERE name_ar IS NULL OR trim(name_ar) = '' ORDER BY card_id",
  );
  return r.rows.map(x => x.slug);
}
```

Until that exists, pass the 70 slugs explicitly via `--cards=`.

### Then

1. `node execution/generate-card-content-ar.mjs --missing --submit`
   One batch of 70. Cost: **$3.04 batched** at the cohort's measured $0.044/card.
2. `--status` until `ended`. The cohort took ~3 minutes; 70 will be longer, and
   the 24h window is an expiry, not an SLA.
3. `--fetch`. Validation gates every DB write, so expect some rejections —
   budget a second pass at ~$0.50 for retries. Rejected cards are written as
   `.rejected.json` for reading by hand and are kept out of the database.
4. `--fetch` rebuilds `published-cards.json` automatically. **That is the
   publish step** — no code change. `CARD_CONTENT_LOCALES` already contains
   `'ar'`, and the per-card gate reads the manifest.
5. `/ar/tarot-card-meanings/suit-of-wands` comes back on its own once any Wand
   has Arabic content. It currently 404s because the cohort contains no Wand;
   `subHubAuthoredLocales` recomputes and the sitemap test already covers both
   directions.
6. `npm run verify`, then a production build, then deploy.
7. `node execution/indexnow-submit.mjs` — 70 new URLs is exactly what IndexNow
   is for.

### Budget

| Item | Cost |
|---|---|
| 70 cards, batched | $3.04 |
| Retry pass (~15%) | ~$0.50 |
| **Total** | **~$3.55** |

Measured, not estimated: 8,423 output tokens and ~2,090 input tokens per card,
Sonnet 5.5 at $2/$10, halved by the Batch API.

## The real constraint, stated plainly

**Review.** 70 cards is 1,120 Arabic values, on top of the cohort's 128. There
is no native Arabic reviewer available — that was decided on 2026-10-25, with
the cohort shipping unreviewed.

What the automated gates do and do not cover:

| Covered | Not covered |
|---|---|
| Not Farsi (no پ چ ژ گ ک ی, no ZWNJ, no standalone فال) | Grammar |
| Committed terminology (الأركانا الكبرى, suit names) | Register and tone |
| All 16 fields present and non-empty | Whether the prose is actually good |
| Snippet lengths within the Farsi band | Factual accuracy about the cards |
| No English fallback leaking into an Arabic page | Idiom, naturalness |

At 1,120 values, reading a sample is the only tractable option. Suggested: 10
cards at random across arcana, all 16 fields each. If that sample is clean,
accept the rest; if it is not, stop — the problem is the generation, not the
sample.

The mitigation that makes this tolerable is reversibility: delisting Arabic
card pages is `git revert f2f9753` plus an IndexNow resubmit.

## Open items that should not block, but should be known

**The `lastmod` anomaly.** As of 2026-10-25 all 78 cards carry
`updated_at = 2026-10-25`, including cards nothing touched. 70 rows share the
exact timestamp `09:28:14`, so one bulk `UPDATE` did it; `created_at` is intact,
so it was not a re-seed; and no script in this repo does a bulk update of
`card_content`. Most likely an external writer on the production Turso database
(the deployed app, or the n8n daily pipeline).

Impact on this plan: **none for the Arabic cohort** — those are new URLs, and
`lastmod` governs recrawl of changed pages, not discovery of new ones. But it
does mean the English deepening experiment stays unmeasurable, and 70 cards
currently advertise a change that did not happen. Worth root-causing before
trusting per-card recrawl signals again.

**The `مجموعة` collision.** The shipped `ar.json` uses it for both "suit" and
"deck". The generation prompt sidesteps it by reserving the word for suits, but
the UI bundle is unresolved. Arabic keyword data should settle it, and the
cohort is the first chance to get any.

**Arabic search-term variants.** The Farsi equivalent is `farsi-names.ts`. The
spec puts this out of scope and worth doing only if the cohort succeeds. It
stays out of scope here too — revisit after the decision.

**The locale-keyed schema migration.** Still deferred. 16 columns per locale is
48 at three locales and 64 at four, and `execution/output/zh-cards/` says a
fourth is coming. The mapper is now locale-generic, so the migration is no
longer a prerequisite for anything — it is a cleanup, and the Phase 2 spec's
four-step reversible sequence plus a 78-page rendered Farsi diff still applies
when it happens.
