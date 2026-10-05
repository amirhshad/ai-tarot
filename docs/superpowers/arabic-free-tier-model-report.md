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
