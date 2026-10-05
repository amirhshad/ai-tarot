# Arabic free-tier model routing — implementation report

## Why

`docs/arabic-reading-sample-2026-10-05.md` holds a same-spread, same-cards,
same-prompt comparison between Haiku 4.5 (free) and Sonnet 5.5 (paid) on an
Arabic reading. Haiku made five clear grammatical errors in ~300 words; Sonnet
made zero in 403 words, including correct feminine agreement on a harder
construction Haiku avoided. The prompts are sound on both models — this is a
model-capability gap specific to Arabic morphology, not a prompt defect. The
fix: route free-tier Arabic readings to the capable model while keeping the
free tier's product limits (length, cost) unchanged.

## `client.ts` diff, explained

File: `app/src/lib/ai/client.ts`

1. **Named model constants.** `CHEAP_MODEL = 'claude-haiku-4-5-20251001'` and
   `CAPABLE_MODEL = 'claude-sonnet-5-5'` replace the repeated string literals
   in `getModel`, `getThinking`, and `generateCompletion`.

2. **`UPGRADED_FREE_LOCALES`** — a `ReadonlySet<Locale>` containing only
   `'ar'`. Its docblock carries the evidence summary, a pointer to the sample
   doc, and an explicit removal instruction: when a stronger cheap model
   ships and cleans up on that same sample, delete this set and the `locale`
   parameter threaded through `getModel` and its callers, and Arabic falls
   back to the cheap model like every other locale.

3. **`getModel(tier: Tier, locale?: Locale): string`** — unchanged signature
   shape for paid tiers (always `CAPABLE_MODEL`); for `free`, returns
   `CAPABLE_MODEL` only when `locale` is in `UPGRADED_FREE_LOCALES`, else
   `CHEAP_MODEL`. `locale` is optional so every existing non-Arabic caller
   needs no change in behavior.

4. **`getThinking(model: string): Anthropic.ThinkingConfigParam`** — re-keyed
   from `tier` to `model`, which is the core safety fix the task called out.
   Returns `'disabled'` for `CHEAP_MODEL`, `'between_tools'` otherwise. This
   is what prevents the 400: if Arabic free readings are routed to Sonnet
   while `getThinking` still branched on `tier === 'free'`, Sonnet would
   receive `'disabled'` and reject it. The docblock above it now explains
   both the permanent model-keyed asymmetry (Sonnet rejects `'disabled'`,
   Haiku rejects `'between_tools'`) and *why it now matters*: the free tier
   can resolve to either model depending on locale.

5. **Call sites inside `client.ts`** — `streamInterpretation` and
   `streamFollowUp` now compute `model = getModel(req.tier, req.locale)` once
   and pass that same `model` into both the `model:` field and
   `getThinking(model)`, so the pairing can never drift apart.

6. **`generateCompletion`** (daily card) — left on `CHEAP_MODEL` explicitly,
   with a comment noting it does not get the Arabic upgrade; this is a
   separate surface/spend decision per the task instructions.

7. **Exports** — `getModel`, `getThinking`, `CHEAP_MODEL`, `CAPABLE_MODEL` are
   now exported (previously only `getModel`), since the pairing-invariant
   test needs to call `getThinking` directly and compare against both model
   constants. `getMaxTokens` and `anthropic` stay unexported — no change to
   the rest of the module's public surface.

## Interfaces threaded with locale

`InterpretationRequest` and `FollowUpRequest` both gained `locale?: Locale`
(importing `Locale` from `@/i18n/locales`), passed through to `getModel` in
`streamInterpretation` and `streamFollowUp`.

## Call sites — before/after

All three routes already computed a `language: Locale` via
`resolveReadingLanguage(...)` in scope at the call to `streamInterpretation`
/ `streamFollowUp`. Only the call itself changed — no change to how the
language is resolved.

### `app/src/app/api/reading/route.ts`

Before:
```ts
stream = await streamInterpretation({
  systemPrompt,
  userMessage: userMessage + questionSuffix,
  tier,
  spreadType: spread.type,
});
```
After:
```ts
stream = await streamInterpretation({
  systemPrompt,
  userMessage: userMessage + questionSuffix,
  tier,
  spreadType: spread.type,
  locale: language,
});
```

### `app/src/app/api/reading/free/route.ts`

Before:
```ts
const stream = await streamInterpretation({
  systemPrompt,
  userMessage: userMessage + questionSuffix,
  tier: 'free',
});
```
After:
```ts
const stream = await streamInterpretation({
  systemPrompt,
  userMessage: userMessage + questionSuffix,
  tier: 'free',
  locale: language,
});
```

### `app/src/app/api/reading/[id]/follow-up/route.ts`

Before:
```ts
stream = await streamFollowUp({
  systemPrompt,
  messages,
  tier: tier as 'free' | 'pro' | 'premium',
});
```
After:
```ts
stream = await streamFollowUp({
  systemPrompt,
  messages,
  tier: tier as 'free' | 'pro' | 'premium',
  locale: language,
});
```

## Tests added

New file: `app/src/lib/ai/client.test.ts`

- `getModel` returns `CHEAP_MODEL` for free+`en`, free+`fa`, and free with no
  locale argument.
- `getModel` returns `CAPABLE_MODEL` for free+`ar`, and for `pro`/`premium` at
  every locale in `LOCALES` plus no locale.
- `getThinking(CHEAP_MODEL)` is `{ type: 'disabled' }`;
  `getThinking(CAPABLE_MODEL)` is `{ type: 'between_tools' }`.
- **The pairing invariant** (the assertion that would have caught the 400):
  for every combination of `tier` in `['free','pro','premium']` and `locale`
  in `[...LOCALES, undefined]`, `getThinking(getModel(tier, locale))` is
  `{ type: 'disabled' }` exactly when the resolved model is `CHEAP_MODEL`,
  and `{ type: 'between_tools' }` otherwise. This exercises the exact failure
  mode described in the task: if `getThinking` were ever keyed on `tier`
  again, this test would fail the moment `getModel('free', 'ar')` resolves to
  the capable model.

## `npm run verify` output

```
> tsc --noEmit && vitest run && node ../execution/prompt-freeze.mjs

 Test Files  18 passed (18)
      Tests  186 passed (186)   (180 existing + 6 new in client.test.ts)

✓ 207 prompts match the snapshot.
```

tsc clean, full suite green, freeze gate unmoved at 207 prompts (no prompt
text was touched).

## Daily-card note

`generateCompletion` (used for the daily card) still hardcodes `CHEAP_MODEL`
and was deliberately left unchanged per instructions. **Arabic daily-card
prose still runs on the cheap model** — the owner has not made a spend
decision for that surface, and this task does not make it for them.

## Removal path (for when a stronger cheap model ships)

Re-run the comparison in `docs/arabic-reading-sample-2026-10-05.md` against
the new cheap model. If it cleans up: delete `UPGRADED_FREE_LOCALES` and the
`locale` parameter from `getModel` (and the `locale` fields on
`InterpretationRequest`/`FollowUpRequest` and their three call sites) — Arabic
then falls back to the cheap model like every other locale. `getThinking`
stays keyed on model regardless, since that asymmetry is permanent.

---

# Follow-up: the daily card (2026-10-05)

The owner decided to extend the above to the daily card surface
(`/[locale]/daily`), which the previous pass deliberately left on
`CHEAP_MODEL`. Two traps were called out up front: (1) `generateCompletion`
passes no `thinking` param at all, which is only safe while it's pinned to
Haiku; (2) the daily prompts' own 100-150 word target was already too dense
for the existing flat `maxTokens = 300` ceiling on Farsi/Arabic, independent
of this model change.

## `client.ts` diff

```diff
+/**
+ * Max tokens for the daily card (generateCompletion), sized the same way as
+ * getMaxTokens above (~1.3x the worst case) but against the daily prompts'
+ * own 100-150 word target in prompts.ts for the daily page, not the reading
+ * targets above.
+ *
+ * Measured from a real Arabic reading: ~300 words consumed under 800 tokens,
+ * i.e. ~2.7 tokens/word — denser than English (~1.3) and close to Farsi's
+ * ~3.5. At the top of the range (150 words) that's ~405-525 tokens needed,
+ * so English's flat 300 ceiling silently truncates any RTL locale routed
+ * through it. 600 covers both fa and ar with headroom; en stays at 300 since
+ * ~1.3 tokens/word only needs ~195 for the same 150 words.
+ */
+function getDailyMaxTokens(locale: Locale): number {
+  return locale === 'fa' || locale === 'ar' ? 600 : 300;
+}

 /**
  * Non-streaming completion for simple use cases (e.g. daily card interpretation).
- * Always uses the cheap model for cost efficiency. This does not get the
- * Arabic-locale upgrade above — the daily card is a separate surface and a
- * separate spend decision the owner has not made.
+ * Uses the cheap model by default, except for locales in UPGRADED_FREE_LOCALES
+ * (currently just Arabic — see the comment above that set), which get the
+ * capable model like every other free-tier surface now does.
  */
 export async function generateCompletion(
   systemPrompt: string,
   userMessage: string,
   maxTokens = 300,
+  locale?: Locale,
 ): Promise<string> {
+  const model = getModel('free', locale);
+
   const response = await anthropic.messages.create({
-    model: CHEAP_MODEL,
+    model,
     max_tokens: maxTokens,
+    thinking: getThinking(model),
     system: systemPrompt,
     messages: [{ role: 'user', content: userMessage }],
   });

   const block = response.content[0];
   return block.type === 'text' ? block.text : '';
 }

-export { getModel, getThinking, CHEAP_MODEL, CAPABLE_MODEL };
+export { getModel, getThinking, getDailyMaxTokens, CHEAP_MODEL, CAPABLE_MODEL };
```

`generateCompletion` gained an optional trailing `locale` param so any
existing or future caller that doesn't pass one (there happen to be none
besides the daily page) keeps identical behavior when omitted — `getModel('free', undefined)`
resolves to `CHEAP_MODEL` exactly as the old hardcoded constant did, and
`getThinking` on that model still resolves to `'disabled'`, matching the
previous hardcoded-Haiku behavior exactly. The only new behavior is for a
locale in `UPGRADED_FREE_LOCALES`.

## `daily/page.tsx` diff

```diff
-import { generateCompletion } from '@/lib/ai/client';
+import { generateCompletion, getDailyMaxTokens } from '@/lib/ai/client';
@@
 async function getDailyInterpretation(cardName: string, keywords: string[], locale: Locale): Promise<string> {
   const systemPrompt = DAILY_SYSTEM_PROMPT[locale];
   const userMessage = DAILY_USER_MESSAGE[locale](cardName, keywords);
-  return generateCompletion(systemPrompt, userMessage, 300);
+  return generateCompletion(systemPrompt, userMessage, getDailyMaxTokens(locale), locale);
 }
```

No prompt text touched (word targets, tone, language — all unchanged).

## Farsi truncation — measured, not assumed

Rendered `/fa/daily` against the dev server (port 3100 — 3000 was occupied)
**before** the change, by fetching the page and extracting the rendered
interpretation paragraph:

- **Before:** 92 words, cut off mid-sentence:
  `...یک تصمیم به تأخیر انداختیدید؟ امروز روز خوبی برای` — ends on "today is a
  good day for" with nothing after it. This confirms the bug was live: the
  daily prompt targets 100-150 words but the response was truncated at 92,
  mid-clause, well short of even the low end of the target.

- **After** (same page, same `maxTokens` change applied, `getDailyMaxTokens('fa') = 600`):
  168 words, ends on a complete closing sentence: `...تو هم بخشی از این
  چرخهای. حرکت کن.` ("You too are part of this cycle. Move.") — a clean,
  deliberate ending, not a cutoff.

So: **the Farsi daily card was in fact truncating before this change**, and
the 600-token ceiling fixes it in this sample.

## Arabic output after the change

Rendered `/ar/daily` after the change:

- 149 words (within the 100-150 target), ends on a complete sentence:
  `...فاللحظة التي تنتظرها ربما تكون أقرب مما تظن.` ("...the moment you're
  waiting for may be closer than you think.")
- No Persian-only letters (پ چ ژ گ ک ی) found anywhere in the output —
  confirmed by scanning the extracted text for that character set.
- Dev server log showed `GET /ar/daily ... 200` with no 400/500 — the
  `thinking: getThinking(model)` fix means Sonnet got `'between_tools'`
  rather than no `thinking` param (which would have used Sonnet's default,
  untested here) or a hardcoded `'disabled'` (which would 400).

## Tests added (`client.test.ts`)

Added `describe('generateCompletion', ...)` and
`describe('getDailyMaxTokens', ...)`:

- Mocked `@anthropic-ai/sdk`'s `messages.create` via `vi.mock` +
  `vi.hoisted` (no live API calls) to capture the arguments `generateCompletion`
  passes through.
- Asserted `generateCompletion` resolves to `CHEAP_MODEL` for `en`, `fa`, and
  no-locale, and to `CAPABLE_MODEL` for `ar` — the same `UPGRADED_FREE_LOCALES`
  rule as `getModel`.
- Asserted the thinking param is never hardcoded/omitted: `'between_tools'`
  when the resolved model is `CAPABLE_MODEL`, `'disabled'` when it's
  `CHEAP_MODEL` — the same invariant the existing pairing test covers for
  `streamInterpretation`/`streamFollowUp`, now extended to `generateCompletion`.
- Asserted `getDailyMaxTokens('en') === 300`, `getDailyMaxTokens('fa') ===
  getDailyMaxTokens('ar') === 600`.

A `vi.hoisted` wrapper was needed around the mock factory because
`vi.mock(...)` itself is hoisted above regular `const` declarations by
vitest/Vite, so a plain `const createMock = vi.fn()` above `vi.mock(...)`
threw `ReferenceError: Cannot access 'createMock' before initialization` on
first run; `vi.hoisted` hoists the mock's own backing fn to the same point.

## Verify output

```
> app@0.1.0 verify
> tsc --noEmit && vitest run && node ../execution/prompt-freeze.mjs

 Test Files  18 passed (18)
      Tests  189 passed (189)   (186 existing + 3 new: generateCompletion x2, getDailyMaxTokens x1)
   Start at  21:36:21
   Duration  2.62s

✓ 207 prompts match the snapshot.
```

tsc clean, full suite green, freeze gate unmoved at 207 (no prompt text
touched, as required).

## Scope held

- `UPGRADED_FREE_LOCALES` untouched — still just `{'ar'}`.
- No prompt text (word targets, tone, language) changed in `prompts.ts` or
  the daily page's inline prompt constants.
- `getMaxTokens`'s existing reading ceilings (800/5000/3500/2800) untouched —
  the new `getDailyMaxTokens` is a separate function for the daily surface
  only, per the task's instruction to keep the two concerns apart.
- `.gitignore` left alone.
