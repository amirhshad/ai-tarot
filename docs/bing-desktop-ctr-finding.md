# Bing desktop CTR investigation — finding

**Date:** 2026-09-10
**Question:** Why does desktop convert at 1.14% and mobile at 4.54%, on the same
pages at effectively the same position (5.88 vs 5.40)? Desktop is 69% of
impressions (20,875) and 36% of clicks (239).

**Method:** direct observation of the live Bing desktop SERP for `yes or no tarot`,
captured 2026-09-10. (Playwright MCP failed to connect this session, so this was
done by hand.)

## Verdict: confirmed — Copilot consumes the answer above the fold

The desktop SERP for `yes or no tarot` opens with a **Copilot Search** panel that
occupies the entire viewport. It answers the query outright:

> "A Yes-or-No tarot reading gives a simple 'yes,' 'no,' or 'maybe' answer by
> drawing one or more cards and interpreting their energy, with upright cards
> often leaning yes and reversed cards leaning no."

It then continues with "What Yes/No Tarot Is" and "How It Works" sections, a
"Read all" expander, and follow-up question chips. **The first organic result
(Astrology.com) is only just visible at the fold.** A user who wanted a quick
answer has already received one without scrolling.

This explains the device gap. It is not a snippet problem and **no title rewrite
recovers those impressions** — the impression is counted, the answer is consumed
on the SERP, and the click never happens. Mobile evidently does not surface the
same panel with the same dominance, which is why it converts 4x better.

## The important qualifier: we are already a cited source

TarotVeil is **not** shut out of the Copilot answer. It appears:

1. **Named in the answer body** — "Sites like Astrology.com and TarotVeil offer
   free one-card readings that provide a binary answer plus context."
2. **As an inline citation chip** (`tarotveil.com +1`) under that paragraph.
3. **2nd of 3 in the source panel**, above Evatarot.net, with the `/yes-or-no`
   URL.

So the AEO/GEO position is already partially won on the site's single most
important query. That reframes the problem: the goal is not to break into the
answer, it is to be cited **more prominently and more distinctively**, and to
give the reader a reason to click through rather than stop at the summary.

## Two concrete, actionable observations

**1. Copilot describes us inaccurately, and that is fixable.** It says TarotVeil
offers "free **one-card** readings", grouping us with Astrology.com. Our
yes-or-no reading draws **three** cards — that is the actual differentiator
against the one-card competitors, and Copilot missed it. The page's own copy is
the likely cause: `messages/en.json` mentions "single card" 10 times (mostly
`relatedSingleCard*` keys and tips) versus "three cards" 3 times. The strongest
distinguishing fact about the page is outnumbered 3:1 by language pointing at a
different product.

**2. Bing has not recrawled yet, so none of the new copy is being judged.** The
SERP still shows the pre-#5 title and description:

- Bing SERP: `Yes or No Tarot — Free AI Yes/No Tarot Reading | TarotVeil`
- Live site: `Free AI Yes or No Tarot — Instant Answer, No Signup`

The IndexNow submission (192 URLs, HTTP 200) fired minutes before this capture.
**Any read of CTR before the recrawl lands is measuring the old copy.**

## Also worth noting

- **Astrology.com holds ~8 rich sitelinks** in the #1 organic slot, consuming
  enormous vertical space. That is a brand-authority feature we cannot match
  directly by editing metadata.
- The "Deep dive into yes or no tarot" rail lists **`yes or no tarot ai`** as a
  suggested refinement — independent confirmation that the AI modifier, which
  converts at 38.5% for us, is a real and Bing-recognised query pattern.

## Recommendation

Treat this as an **answer-engine optimisation problem, not a snippet problem**.
The `ai-seo` skill is the right playbook. Highest-value moves, in order:

1. **Make the three-card structure unmissable on the page.** It is the fact that
   distinguishes us from every one-card competitor in that answer, and Copilot
   currently gets it wrong. Audit the `single card` copy that is drowning it out.
2. **Re-measure after the recrawl lands**, not before. Check the SERP again in
   ~1 week to confirm the new title and description are being shown.
3. **Do not spend further effort on desktop organic CTR for this query.** The
   ceiling is set by the Copilot panel, not by our metadata.
