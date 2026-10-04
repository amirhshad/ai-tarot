# Arabic Locale — Phase 1: Working Arabic Product

**Date:** 2026-10-04
**Status:** Approved
**Phase:** 1 of 2 — the app shell, UI, and reading flow in Arabic. Phase 2 (78 cards of Arabic card-meaning content + the SEO pages that render it) is a separate spec and a separate plan.

## Problem

`CLAUDE.md` lists Arabic as a supported language. It is not. `routing.ts` declares `locales: ['en', 'fa']`, and Arabic appears nowhere in the codebase except as aspirational guidance in `directives/prompt-engineering.md`.

The deeper problem is structural. The codebase is built as a **binary** en/fa system, not an n-locale one:

- `TarotCard` carries `nameFA` and `keywordsFA` as sibling fields of `name`/`keywords`.
- `prompts.ts` pairs every content block as `_EN`/`_FA` constants and types language as `'en' | 'fa'`.
- ~50 occurrences hardcode the `'fa'` literal, most as two-way ternaries.
- `card-queries.ts` reads ~16 `_fa`-suffixed DB columns with English fallback.

Adding a third locale by cloning the suffix pattern (`nameAR`, `SPREAD_SHAPES_AR`, three-way ternaries) would work, but it degrades every locale-aware site into a 3-way conditional and removes the type system's ability to catch a missing translation. The presence of `execution/output/zh-cards/` in the working tree indicates a fourth locale is already in progress, so the pattern is at its breaking point now.

## Goal

An Arabic speaker can land on the site, draw cards, and receive a genuine Arabic narrative reading end to end, in warm Modern Standard Arabic. Arabic marketing pages render. No English text appears in an Arabic session.

## Constraints

| Constraint | Source | Consequence |
|---|---|---|
| Register: warm MSA (الفصحى), not formal, not dialect | Product decision, 2026-10-04 | Widest reach and best SEO; copy must avoid news-broadcast stiffness |
| No native Arabic reviewer | Stated, 2026-10-04 | The type system and automated voice-constraint patterns become the coverage check a human would otherwise be |
| Existing English and Farsi readings must not change | `execution/prompt-freeze.snapshot.json` | The freeze gate proves this mechanically; see §4 |
| Arabic cultural depth: desert/oasis/light-and-guidance metaphors, warmth and dignity | `directives/prompt-engineering.md` → Cultural Depth → Arabic | Arabic prompt blocks are authored natively, never translated from Farsi |
| Minimal, incremental changes; one concern per commit | `CLAUDE.md` principle 7 | The refactor and the Arabic content land as separate commits |

## Approach

**Refactor what Phase 1 touches; defer the DB column model to Phase 2.**

Convert the three places where the en/fa binary actually hurts — the tarot types/deck, `prompts.ts`, and the scattered `'fa'` ternaries — into a locale-keyed model. Arabic then arrives as **data**, not code.

`card-queries.ts` and its `_fa` columns are **not touched**. Only `tarot-card-meanings/[slug]/page.tsx` imports that module, and card-meaning content is Phase 2 by definition, so Phase 1 is entirely zero-DB. `language TEXT NOT NULL DEFAULT 'en'` in `sqlite.ts` has no CHECK constraint, so persisting `'ar'` as a user preference needs no migration either.

Approaches rejected:

- **Suffix clone (`_AR` everywhere).** Smallest diff, lowest risk to Farsi, but every locale-aware site becomes a 3-way conditional and nothing forces the Arabic branch to exist — a missed one silently serves English. Unacceptable given no native reviewer.
- **Full refactor including the DB column model.** Drags Phase 2's cost into Phase 1 for zero Phase 1 benefit, since Phase 1 never reads card content.

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Locale source of truth | New `src/i18n/locales.ts` | One list; `routing.ts` and middleware derive from it |
| Card/spread translations | `localized: Record<TranslatedLocale, …>` sidecar | Keeps `name` as canonical English for slugs/images/DB; exhaustive record makes a missing Arabic string a `tsc` error |
| Prompt content | `Record<Locale, …>` tables replacing `_EN`/`_FA` pairs | Arabic becomes data; next locale is data too |
| Refactor safety | Byte-identical prompt-freeze snapshot, verified before Arabic is added | Mechanical proof that no existing reading changed |
| Arabic date/number formatting | `ar-u-nu-latn` | Plain `'ar'` yields Arabic-Indic digits (١٢٣); most Arab digital products use Latin digits |
| Arabic typography | Amiri (display) + Noto Naskh Arabic (body) | Revived naskh carries the literary gravity the warm-MSA register implies; modern sans (Cairo/Tajawal) reads like a fintech app |
| Brand name in Arabic | Latin `TarotVeil`, unchanged | Standard practice for tech brands in Arab markets, and preserves brand equity. Arabic has no clean transliteration of "v" — ف gives "Tarotfil", ڤ is Persian/dialectal. Diverges deliberately from Farsi's تاروت‌ویل |
| Crisis-line guidance | Region-neutral "contact local emergency services" | Farsi hardcodes Iran's ۱۲۳/۱۱۵; no pan-Arab equivalent exists and a specific number would be wrong in 20 of 22 countries |
| `/ar/tarot-card-meanings/*` in Phase 1 | `notFound()`, excluded from sitemap and hreflang, nav links hidden | Those routes would serve English card content through the `_fa` fallback. English text on Arabic URLs is duplicate content that can poison the Arabic namespace before Phase 2 ships |

## 1. The Locale Module

New `src/i18n/locales.ts`:

```ts
export const LOCALES = ['en', 'fa', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export type TranslatedLocale = Exclude<Locale, 'en'>;   // 'fa' | 'ar'

export function isRtl(locale: Locale): boolean;          // true for fa, ar
export function toLocale(value: string | undefined): Locale;  // defaults to 'en'
export const BRAND: Record<Locale, string>;
export const HTML_LANG: Record<Locale, string>;          // en-US | fa-IR | ar-u-nu-latn
```

`routing.ts` derives `locales` from `LOCALES`. The middleware's `/^\/(en|fa)/` becomes a regex built from `LOCALES`.

`toLocale` replaces the `(locale === 'fa' ? 'fa' : 'en')` coercions. `isRtl` replaces the `dir` ternary in `[locale]/layout.tsx`. `BRAND` replaces the `locale === 'fa' ? 'تاروت‌ویل' : 'TarotVeil'` ternaries. `HTML_LANG` replaces the `toLocaleDateString('fa-IR')` / `isFA ? 'fa-IR' : 'en-US'` calls in `dashboard/page.tsx` and `daily/page.tsx`.

## 2. Tarot Data — Locale-Keyed Sidecar

`src/lib/tarot/types.ts`:

```ts
export interface TarotCard {
  id: number;
  name: string;                 // canonical English — unchanged
  keywords: string[];           // canonical English — unchanged
  localized: Record<TranslatedLocale, { name: string; keywords: string[] }>;
  arcana: Arcana;
  suit?: Suit;
  number: number;
  court?: Court;
  image: string;
}

export interface SpreadPosition {
  index: number;
  name: string;
  description: string;
  localized: Record<TranslatedLocale, { name: string; description: string }>;
}

export interface SpreadDefinition {
  type: SpreadType;
  name: string;
  description: string;
  localized: Record<TranslatedLocale, { name: string; description: string }>;
  cardCount: number;
  positions: SpreadPosition[];
  minimumTier: Tier;
}
```

`name` and `keywords` stay English because they are canonical: slugs derive from them, image paths and DB rows reference them, and the English prompt path reads them directly. Duplicating English into `localized` would create two sources of truth.

New accessors in `src/lib/tarot/localized.ts`, re-exported by `index.ts` — read sites never index `localized` directly:

```ts
export function cardName(card: TarotCard, locale: Locale): string;
export function cardKeywords(card: TarotCard, locale: Locale): string[];
export function spreadName(spread: SpreadDefinition, locale: Locale): string;
export function spreadDescription(spread: SpreadDefinition, locale: Locale): string;
export function positionName(position: SpreadPosition, locale: Locale): string;
export function positionDescription(position: SpreadPosition, locale: Locale): string;
```

`Record<TranslatedLocale, …>` is load-bearing: all 78 cards, 4 spreads, and 21 spread positions must carry Arabic or the build fails. With no native reviewer, the compiler is the coverage check.

`farsi-names.ts` (SEO search-term variants) is untouched — it feeds card-meaning pages, which are Phase 2.

## 3. prompts.ts — Locale-Keyed Blocks

Constants collapse from `_EN`/`_FA` pairs into tables:

```ts
const SPREAD_SHAPES: Record<Locale, Record<SpreadType, string>>;
const NARRATIVE_STRUCTURE: Record<Locale, string>;
const VOICE_CONSTRAINTS: Record<Locale, string>;
const SAFETY_BOUNDARIES: Record<Locale, string>;
const TOPIC_INSTRUCTIONS: Record<string, Record<Locale, string>>;
```

The four `language: 'en' | 'fa'` signatures become `language: Locale`. The `isEnglish` branches become table lookups. The Arabic connective prose inside the prompt assembly (the Farsi equivalent of "خوانش یک گسترش … بود") is authored, not templated from Farsi.

Arabic blocks to author, in warm MSA, to the directive's Arabic guidance:

- 4 spread shapes (single, three-card, celtic-cross, horseshoe)
- Narrative structure ("weave, don't list")
- Voice constraints
- Safety boundaries, with region-neutral crisis wording
- 3 topic instructions (love, yes-or-no, career)
- Question message
- Extra-card context

**New deliverable: `FORBIDDEN_PATTERNS_AR`.** The existing `FORBIDDEN_PATTERNS_EN` is English-only; the code comment records that the Farsi equivalents never got a native pass. With no Arabic reviewer, these regexes are the only automated tone guard. They target Arabic's own machine-translation tells and are not a port of the English patterns.

## 4. The Prompt-Freeze Gate — Sequenced as Proof

`execution/prompt-freeze.fixtures.ts` freezes **rendered** prompts across language × tier × topic. This is the refactor's safety proof, and the sequencing is mandatory. Two separate commits:

1. **Refactor only.** Run `node execution/prompt-freeze.mjs`. The snapshot must be **byte-identical**. Zero diff proves no existing English or Farsi reading changed — including that no block was dropped from one language, no assembly order shifted, and no conditional broke. **A diff here is a refactor bug. Never resolve it with `--update`.**
2. **Then add Arabic.** Extend the fixtures' `LANGUAGES` to `['en', 'fa', 'ar']`. The runner's own rules allow this: *"ADDED prompt -> allowed. New spreads and languages may add keys."* So the Arabic keys simply appear and the gate still guards every existing one. **`--update` is never run in this project** — a changed `en` or `fa` key always means a bug to fix, not a snapshot to re-bless.

Collapsing these into one commit forfeits the proof: with both changes in flight there is no moment at which an unchanged snapshot certifies the refactor alone.

## 5. RTL and Typography

The existing `[dir="rtl"]` rules in `globals.css` apply to Arabic automatically. What changes:

- `[lang="ar"] .font-body` → Noto Naskh Arabic; `[lang="ar"] .font-display` → Amiri. Cinzel has no Arabic glyphs, so display text needs a real Arabic face rather than falling back.
- Vazirmatn is Persian-optimized and must not serve Arabic. Font loading in `[locale]/layout.tsx` becomes a per-locale map, so `/ar` ships Amiri + Noto Naskh and `/fa` ships Vazirmatn — neither ships the other's fonts.
- `dir` comes from `isRtl(locale)`; `lang` from the locale.

## 6. Switcher, Settings, SEO

- **Header.** `locale === 'en' ? 'fa' : 'en'` cannot express three locales. Becomes a small dropdown listing all `LOCALES` with native-script labels (English / فارسی / العربية).
- **Settings.** Adds an Arabic `<option>`. `profile.language` accepts `'ar'` with no migration.
- **`buildAlternates`.** Loops `LOCALES` instead of hardcoding en/fa. Gains an optional locale-subset parameter so a page can advertise fewer locales than exist. `x-default` stays English.
- **`sitemap.ts`.** Adds Arabic URLs for all Phase 1 routes, excluding card-meaning routes.
- **Phase-2 gate.** For `locale === 'ar'`, `tarot-card-meanings/page.tsx`, its four suit sub-hubs, `major-arcana`, and `[slug]/page.tsx` return `notFound()`. They are excluded from the sitemap and from their own hreflang sets — advertising an `ar` URL that 404s is worse than not advertising it. Header and Footer links to card meanings are hidden for `ar`.
- After deploy: `node execution/indexnow-submit.mjs`.

## 7. Content Inventory

| Deliverable | Size |
|---|---|
| `src/messages/ar.json` | 26 namespaces, 769 leaf keys |
| Card names and keywords | 78 names, 312 keywords |
| Spreads | 4 × (name, description) + 21 positions × (name, description) |
| Arabic prompt family | ~10 blocks (§3) |
| `MESSAGES_AR` in `ReadingLoadingAnimation` | 5 strings |
| Inline bilingual copy moved to messages | `dashboard/page.tsx` (2 ternaries + `spreadLabels`/`topicLabels` maps), `daily/page.tsx` (7 ternaries) |
| `FORBIDDEN_PATTERNS_AR` | New; no Farsi precedent to copy |

The marketing pages need no per-page work: all 24 already read copy through `getTranslations`, so they render in Arabic once `ar.json` exists. Their only hardcoded locale logic is the brand-name ternaries, replaced by `BRAND`.

## 8. Error Handling and Fallback

Two different fallback philosophies, deliberately:

- **UI strings and tarot data: no silent fallback.** `Record<TranslatedLocale, …>` makes omissions build errors. next-intl's runtime key fallback remains as a last resort but should never fire; it is configured to warn loudly in development.
- **Card-meaning content: English fallback retained** in `card-queries.ts` (untouched), but unreachable for Arabic because those routes `notFound()` for `ar` in Phase 1.

`toLocale` defaults unknown values to `'en'` rather than throwing, so a malformed cookie or URL degrades to English instead of erroring.

## 9. Testing

`npm run verify` (tsc + vitest + prompt freeze) is the spine. Added coverage:

- `toLocale` (valid, invalid, undefined), `isRtl`, `HTML_LANG` completeness over `LOCALES`
- `cardName` / `cardKeywords` / spread and position accessors for each locale
- Every card in `DECK` has a non-empty Arabic name and 4 Arabic keywords; every spread position has Arabic name and description
- `buildAlternates` with and without a locale subset; `x-default` always English
- Arabic excluded from card-meaning sitemap entries
- `deck.test.ts`, `spreads.test.ts`, `daily.test.ts` reference `nameFA` and are updated to the accessors

Manual verification before calling Phase 1 done:

- `/ar` renders RTL, in Amiri/Noto Naskh, with no Latin text outside the brand
- A free reading runs end to end in Arabic; a signed-in reading and a follow-up chat also run in Arabic
- `/ar/tarot-card-meanings` and a card slug under `/ar/` both 404
- Language switcher moves between all three locales and preserves the path
- One full Arabic reading read closely for English leakage, Persian-isms, and deterministic-prediction phrasing ("ستفعل", "سيحدث")

## 10. Out of Scope

Deferred to Phase 2 (its own spec and plan):

- DB `_ar` columns and the migration that adds them
- 78 cards of generated Arabic card-meaning content — **paid token cost, requires explicit approval per `CLAUDE.md` principle 2**
- Arabic card-meaning pages, suit sub-hubs, and the Arabic `FARSI_NAME_VARIANTS` equivalent
- Arabic keyword research

Not planned in either phase:

- Native-speaker review loop. The design keeps all Arabic strings in `ar.json`, the deck's `localized` sidecar, and the prompt tables, so a later native pass is a contained swap rather than a hunt.
- Arabic email. `src/lib/email/templates/` is English-only with hardcoded `'en-US'` dates.
- Chinese (`zh`). The locale-keyed model makes a fourth locale substantially cheaper, but adding it is not this spec's job.
