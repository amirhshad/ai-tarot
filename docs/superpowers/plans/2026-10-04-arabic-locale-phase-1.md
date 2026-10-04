# Arabic Locale Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An Arabic speaker can land on TarotVeil, draw cards, and receive a genuine Arabic narrative reading end to end, with all marketing and app UI in warm Modern Standard Arabic.

**Architecture:** Replace the codebase's binary `'en' | 'fa'` model with a locale-keyed one in the three places Phase 1 touches — a new `src/i18n/locales.ts` module, a `localized` sidecar on tarot types, and `Record<Locale, …>` tables in `prompts.ts`. Arabic then arrives as data rather than code. `card-queries.ts` and its `_fa` DB columns are untouched, so Phase 1 needs no migration.

**Tech Stack:** Next.js 14 (App Router), next-intl, TypeScript, Tailwind, vitest, `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-10-04-arabic-locale-design.md`

## Global Constraints

- Register: warm Modern Standard Arabic (الفصحى). Not formal/news register, not dialect.
- Arabic prompt and UI content is **authored natively**, never translated from Farsi. Follow `directives/prompt-engineering.md` → Cultural Depth → Arabic: desert, oasis, light-and-guidance metaphors; warmth and dignity.
- No deterministic prediction language in any locale. Arabic must avoid `ستفعل` / `سيحدث` / `توقّع` in favour of reflective forms (`تدعوك البطاقات إلى`, `قد تجد`, `تشير هذه الطاقة إلى`).
- Brand name in Arabic stays Latin `TarotVeil`. No transliteration.
- Arabic date/number formatting locale is exactly `ar-u-nu-latn` (Latin digits).
- Arabic fonts: `Amiri` for display, `Noto Naskh Arabic` for body. `/ar` must not ship Vazirmatn; `/fa` must not ship Amiri or Noto Naskh.
- Crisis guidance in Arabic is region-neutral — direct to local emergency services, never a specific number.
- `node execution/prompt-freeze.mjs` must pass at every commit. Per the runner's own rules: a CHANGED or REMOVED frozen prompt is a failure; an ADDED prompt is allowed. If the gate reports a change to an `en` or `fa` key, that is a bug — fix the code, never re-freeze.
- **`--update` is forbidden in Tasks 1-10, with exactly one exception: Task 11 step 2b.** Allowing added keys is not the same as recording them, and an unrecorded Arabic prompt is an unguarded one — a later refactor could change Arabic reading voice with nothing to catch it. So the Arabic keys are frozen once, deliberately, at the end, after review has settled the Arabic content. That re-freeze must be proved additive: the snapshot diff may contain insertions only.
- `cd app && npm run verify` (tsc + vitest + freeze) is the definition of green.
- One concern per commit (`CLAUDE.md` principle 7).
- Phase 1 touches no SQL and adds no migration.

## Review Focus

Five failure modes the spec implies but which no task's happy-path tests would catch. Each has a test assigned to the task that owns the code.

1. **Latin brand inside an Arabic RTL string mangles punctuation.** `'%s | TarotVeil'` in an RTL context makes the `|` and surrounding text reorder visibly. Expected: the Latin run is bidi-isolated so the separator renders where it was written. → Task 7.
2. **Unknown locale in the URL.** `/de/spreads`, `/ar-SA/`, or a truncated prefix must 404 or fall back to English, never render a half-localized page or throw. → Task 1.
3. **`profile.language` disagrees with the browsing locale.** A user with `language: 'ar'` browsing `/en` currently gets `requestLanguage || profile?.language` — an Arabic interpretation inside an English page. Expected: the URL locale wins for the reading. → Task 8.
4. **A key present in `en.json` but missing from `ar.json`** renders English text mid-Arabic page via next-intl's fallback, silently. Expected: a test fails before deploy. → Task 6.
5. **A card or spread position missing Arabic** would put an English card name inside an Arabic prompt. Expected: `tsc` fails, and a test asserts non-empty Arabic for all 78 cards and 21 positions. → Tasks 2 and 3.

---

## File Structure

**Created:**
- `app/src/i18n/locales.ts` — the locale list, `Locale` type, and every locale-derived constant (`isRtl`, `toLocale`, `BRAND`, `HTML_LANG`). Single source of truth.
- `app/src/i18n/locales.test.ts` — tests for the above.
- `app/src/lib/tarot/localized.ts` — accessors over the `localized` sidecar (`cardName`, `cardKeywords`, `spreadName`, `spreadDescription`, `positionName`, `positionDescription`).
- `app/src/lib/tarot/localized.test.ts`
- `app/src/messages/ar.json` — Arabic UI strings, structurally identical to `en.json`.
- `app/src/messages/parity.test.ts` — asserts key parity across all three message files.

**Modified:**
- `app/src/i18n/routing.ts` — derive `locales` from `LOCALES`.
- `app/src/middleware.ts` — build the locale-strip regex from `LOCALES`.
- `app/src/lib/tarot/types.ts` — `nameFA`/`keywordsFA`/`descriptionFA` → `localized` sidecar.
- `app/src/lib/tarot/deck.ts` — 78 cards gain `localized.fa` + `localized.ar`.
- `app/src/lib/tarot/spreads.ts` — 4 spreads + 21 positions gain `localized`.
- `app/src/lib/tarot/index.ts` — re-export `./localized`.
- `app/src/lib/ai/prompts.ts` — `_EN`/`_FA` constant pairs → `Record<Locale, …>` tables; `language: 'en' | 'fa'` → `language: Locale`.
- `execution/prompt-freeze.fixtures.ts` — `LANGUAGES` gains `'ar'`.
- `app/src/app/[locale]/layout.tsx` — fonts, `dir`, metadata, JSON-LD via the locale module.
- `app/src/app/globals.css` — Arabic font stack.
- `app/src/components/layout/Header.tsx` — two-way toggle → three-locale dropdown.
- `app/src/app/[locale]/(app)/settings/page.tsx` — Arabic `<option>`.
- `app/src/lib/seo/alternates.ts` — loop `LOCALES`; optional locale subset.
- `app/src/app/sitemap.ts` — three-locale `withAlternates`; Arabic excluded from card-meaning routes.
- `app/src/components/reading/ReadingLoadingAnimation.tsx` — `MESSAGES` keyed by locale, gains Arabic.
- The `'en' | 'fa'` prop unions in: `FollowUpChat.tsx`, `SpreadSelector.tsx`, `ReadingFilters.tsx`, `FreeReadingClient.tsx`, `ReadingTimeline.tsx`, `CardFace.tsx`, `Card.tsx`, `SpreadLayout.tsx`, `PricingTable.tsx`.
- `app/src/app/api/reading/route.ts`, `api/reading/free/route.ts`, `api/reading/[id]/follow-up/route.ts` — `language` via `toLocale`.
- `app/src/app/[locale]/(app)/dashboard/page.tsx`, `(marketing)/daily/page.tsx` — inline bilingual ternaries → message keys.
- `app/src/app/[locale]/(marketing)/tarot-card-meanings/**` — `notFound()` for `ar`.
- `app/src/lib/tarot/spreads.test.ts`, `daily.test.ts` — updated for the sidecar.

---

### Task 1: Locale module, routing, and middleware

**Files:**
- Create: `app/src/i18n/locales.ts`
- Create: `app/src/i18n/locales.test.ts`
- Modify: `app/src/i18n/routing.ts`
- Modify: `app/src/middleware.ts:36` (the `pathWithoutLocale` regex)

**Interfaces:**
- Consumes: nothing.
- Produces: `LOCALES`, `Locale`, `TranslatedLocale`, `isRtl(locale: Locale): boolean`, `toLocale(value: string | undefined | null): Locale`, `BRAND: Record<Locale, string>`, `HTML_LANG: Record<Locale, string>`, `LOCALE_LABELS: Record<Locale, string>`, `localePathPattern(): RegExp`. Every later task imports from `@/i18n/locales`.

- [ ] **Step 1: Write the failing test**

Create `app/src/i18n/locales.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  LOCALES,
  isRtl,
  toLocale,
  BRAND,
  HTML_LANG,
  LOCALE_LABELS,
  localePathPattern,
  type Locale,
} from './locales';

describe('LOCALES', () => {
  it('contains exactly en, fa, ar with en first', () => {
    expect(LOCALES).toEqual(['en', 'fa', 'ar']);
  });

  it('has no duplicates', () => {
    expect(new Set(LOCALES).size).toBe(LOCALES.length);
  });
});

describe('isRtl', () => {
  it('is true for fa and ar, false for en', () => {
    expect(isRtl('en')).toBe(false);
    expect(isRtl('fa')).toBe(true);
    expect(isRtl('ar')).toBe(true);
  });
});

describe('toLocale', () => {
  it('passes through every supported locale', () => {
    for (const locale of LOCALES) {
      expect(toLocale(locale)).toBe(locale);
    }
  });

  // Review Focus 2: an unknown prefix must degrade to English, never throw.
  it.each([
    ['de', 'unsupported language'],
    ['ar-SA', 'region subtag we do not route'],
    ['AR', 'wrong case'],
    ['', 'empty string'],
    ['../fa', 'traversal-looking junk'],
  ])('falls back to en for %s (%s)', (input) => {
    expect(toLocale(input)).toBe('en');
  });

  it('falls back to en for undefined and null', () => {
    expect(toLocale(undefined)).toBe('en');
    expect(toLocale(null)).toBe('en');
  });
});

describe('per-locale constant tables', () => {
  it.each([
    ['BRAND', BRAND],
    ['HTML_LANG', HTML_LANG],
    ['LOCALE_LABELS', LOCALE_LABELS],
  ])('%s covers every locale with a non-empty value', (_name, table) => {
    for (const locale of LOCALES) {
      expect((table as Record<Locale, string>)[locale]?.trim()).toBeTruthy();
    }
    expect(Object.keys(table as object).sort()).toEqual([...LOCALES].sort());
  });

  it('keeps the brand Latin in every locale per the spec', () => {
    expect(BRAND.en).toBe('TarotVeil');
    expect(BRAND.ar).toBe('TarotVeil');
  });

  it('forces Latin digits for Arabic date formatting', () => {
    expect(HTML_LANG.ar).toBe('ar-u-nu-latn');
    const formatted = new Date('2026-10-04T00:00:00Z').toLocaleDateString(HTML_LANG.ar, {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    });
    expect(formatted).toMatch(/\d/);          // Latin digits present
    expect(formatted).not.toMatch(/[٠-٩]/); // no Arabic-Indic digits
  });

  it('labels each locale in its own script', () => {
    expect(LOCALE_LABELS.en).toBe('English');
    expect(LOCALE_LABELS.fa).toBe('فارسی');
    expect(LOCALE_LABELS.ar).toBe('العربية');
  });
});

describe('localePathPattern', () => {
  it('strips a leading locale prefix', () => {
    expect('/ar/dashboard'.replace(localePathPattern(), '')).toBe('/dashboard');
    expect('/fa/reading/new'.replace(localePathPattern(), '')).toBe('/reading/new');
    expect('/en'.replace(localePathPattern(), '')).toBe('');
  });

  it('does not strip a path that merely starts with locale letters', () => {
    expect('/article'.replace(localePathPattern(), '')).toBe('/article');
    expect('/far-future'.replace(localePathPattern(), '')).toBe('/far-future');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/i18n/locales.test.ts`
Expected: FAIL — `Failed to resolve import "./locales"`.

- [ ] **Step 3: Write the implementation**

Create `app/src/i18n/locales.ts`:

```ts
/**
 * The locale list and every constant derived from it.
 *
 * This module is the single source of truth: `routing.ts`, the middleware, the
 * tarot data accessors, and the prompt tables all derive from `LOCALES` rather
 * than repeating a literal union. Adding a locale means adding it here and
 * fixing the type errors that follow — which is the point.
 */

export const LOCALES = ['en', 'fa', 'ar'] as const;

export type Locale = (typeof LOCALES)[number];

/** Locales that need translated content. English is the canonical source. */
export type TranslatedLocale = Exclude<Locale, 'en'>;

export const DEFAULT_LOCALE: Locale = 'en';

const RTL_LOCALES = new Set<Locale>(['fa', 'ar']);

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}

/**
 * Narrow an untrusted string to a Locale, defaulting to English.
 *
 * Replaces the `(locale === 'fa' ? 'fa' : 'en')` coercions. Deliberately
 * total rather than throwing: a malformed cookie, request body, or URL should
 * degrade to English, not 500.
 */
export function toLocale(value: string | undefined | null): Locale {
  return (LOCALES as readonly string[]).includes(value ?? '')
    ? (value as Locale)
    : DEFAULT_LOCALE;
}

/**
 * Brand name per locale.
 *
 * Arabic keeps the Latin wordmark. Arabic has no clean transliteration of
 * "v" — ف yields "Tarotfil" and ڤ is Persian/dialectal — and Latin brand names
 * are standard for tech products in Arab markets. Farsi's transliteration is
 * already established, so it stays.
 */
export const BRAND: Record<Locale, string> = {
  en: 'TarotVeil',
  fa: 'تاروت‌ویل',
  ar: 'TarotVeil',
};

/**
 * BCP-47 tag for `Intl` formatting.
 *
 * Arabic pins `-u-nu-latn` because bare `ar` renders Arabic-Indic digits
 * (٢٠٢٦), while Arabic-language digital products overwhelmingly use Latin
 * digits. Farsi keeps `fa-IR`, whose Persian digits are expected there.
 */
export const HTML_LANG: Record<Locale, string> = {
  en: 'en-US',
  fa: 'fa-IR',
  ar: 'ar-u-nu-latn',
};

/** Language-switcher labels, each in its own script. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fa: 'فارسی',
  ar: 'العربية',
};

/**
 * Matches a leading `/<locale>` path segment, for stripping the prefix before
 * route matching. Anchored and segment-bounded so `/article` is not read as
 * the `ar` locale followed by `ticle`.
 */
export function localePathPattern(): RegExp {
  return new RegExp(`^/(?:${LOCALES.join('|')})(?=/|$)`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npx vitest run src/i18n/locales.test.ts`
Expected: PASS, all cases.

- [ ] **Step 5: Derive routing from LOCALES**

Replace `app/src/i18n/routing.ts` entirely:

```ts
import { defineRouting } from 'next-intl/routing';
import { LOCALES, DEFAULT_LOCALE } from './locales';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  localeCookie: false,
});
```

- [ ] **Step 6: Derive the middleware regex from LOCALES**

In `app/src/middleware.ts`, add to the imports:

```ts
import { localePathPattern } from './i18n/locales';
```

Replace the hardcoded strip:

```ts
  const pathWithoutLocale = pathname.replace(/^\/(en|fa)/, '') || '/';
```

with:

```ts
  const pathWithoutLocale = pathname.replace(localePathPattern(), '') || '/';
```

- [ ] **Step 7: Verify the whole suite still passes**

Run: `cd app && npm run verify`
Expected: PASS. `tsc` clean, all tests green, prompt freeze reports no changed or removed prompts. Nothing Arabic exists yet, so the freeze output must be entirely unchanged.

- [ ] **Step 8: Commit**

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git add app/src/i18n/locales.ts app/src/i18n/locales.test.ts app/src/i18n/routing.ts app/src/middleware.ts
git commit -m "feat(i18n): add locale module and register the ar locale

LOCALES becomes the single source of truth; routing and the middleware
prefix regex derive from it rather than repeating an en|fa literal.

The regex is segment-bounded so /article is not parsed as the ar locale
followed by 'ticle'."
```

---

### Task 2: Tarot types, accessors, and Arabic spreads

**Files:**
- Modify: `app/src/lib/tarot/types.ts:7-40` (`TarotCard`, `SpreadPosition`, `SpreadDefinition`)
- Create: `app/src/lib/tarot/localized.ts`
- Create: `app/src/lib/tarot/localized.test.ts`
- Modify: `app/src/lib/tarot/spreads.ts` (all 4 spreads, 21 positions)
- Modify: `app/src/lib/tarot/index.ts`
- Modify: `app/src/lib/tarot/spreads.test.ts:40-52`

**Interfaces:**
- Consumes: `Locale`, `TranslatedLocale` from `@/i18n/locales`.
- Produces: `TarotCard.localized: Record<TranslatedLocale, { name: string; keywords: string[] }>`; `SpreadPosition.localized` and `SpreadDefinition.localized`, both `Record<TranslatedLocale, { name: string; description: string }>`; accessors `cardName(card, locale)`, `cardKeywords(card, locale)`, `spreadName(spread, locale)`, `spreadDescription(spread, locale)`, `positionName(position, locale)`, `positionDescription(position, locale)` — all returning `string` except `cardKeywords`, which returns `string[]`. Task 3 fills `DECK`; Task 4 consumes the accessors.

Note on ordering: this task makes `localized` required on `TarotCard`, so `deck.ts` will not compile until Task 3. Run `npx vitest run src/lib/tarot/localized.test.ts` in step 4 rather than the full suite, and expect `tsc` to stay red until Task 3 lands. The commit at step 8 is therefore a deliberately incomplete checkpoint; Task 3's commit restores green.

- [ ] **Step 1: Write the failing test**

Create `app/src/lib/tarot/localized.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { LOCALES, type Locale } from '@/i18n/locales';
import { SPREADS } from './spreads';
import {
  spreadName,
  spreadDescription,
  positionName,
  positionDescription,
} from './localized';

describe('spread accessors', () => {
  it('returns the canonical English fields for en', () => {
    const single = SPREADS.single;
    expect(spreadName(single, 'en')).toBe('Single Card');
    expect(spreadDescription(single, 'en')).toBe('A quick insight into your question or situation.');
  });

  it('returns the Farsi sidecar for fa', () => {
    expect(spreadName(SPREADS.single, 'fa')).toBe('تک کارت');
  });

  it('returns Arabic for ar and never English', () => {
    const ar = spreadName(SPREADS.single, 'ar');
    expect(ar.trim()).toBeTruthy();
    expect(ar).not.toBe('Single Card');
    expect(ar).toMatch(/[؀-ۿ]/);
  });
});

// Review Focus 5: a missing Arabic string would leak English into an Arabic
// prompt. tsc catches an absent key; this catches a present-but-empty one.
describe('every spread and position is complete in every locale', () => {
  for (const locale of LOCALES) {
    it(`has non-empty name and description for all spreads in ${locale}`, () => {
      for (const spread of Object.values(SPREADS)) {
        expect(spreadName(spread, locale).trim(), `${spread.type}.name.${locale}`).not.toBe('');
        expect(
          spreadDescription(spread, locale).trim(),
          `${spread.type}.description.${locale}`,
        ).not.toBe('');
      }
    });

    it(`has non-empty name and description for all 21 positions in ${locale}`, () => {
      let counted = 0;
      for (const spread of Object.values(SPREADS)) {
        for (const position of spread.positions) {
          const label = `${spread.type}.${position.index}.${locale}`;
          expect(positionName(position, locale).trim(), `${label}.name`).not.toBe('');
          expect(positionDescription(position, locale).trim(), `${label}.description`).not.toBe('');
          counted += 1;
        }
      }
      expect(counted).toBe(21);
    });

    it(`uses Arabic script for every ar spread string`, () => {
      if (locale !== 'ar') return;
      for (const spread of Object.values(SPREADS)) {
        expect(spreadName(spread, 'ar')).toMatch(/[؀-ۿ]/);
        for (const position of spread.positions) {
          expect(positionName(position, 'ar')).toMatch(/[؀-ۿ]/);
        }
      }
    });
  }
});

describe('locale coverage is driven by LOCALES', () => {
  it('handles every locale without throwing', () => {
    for (const locale of LOCALES as readonly Locale[]) {
      expect(() => spreadName(SPREADS['celtic-cross'], locale)).not.toThrow();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/lib/tarot/localized.test.ts`
Expected: FAIL — `Failed to resolve import "./localized"`.

- [ ] **Step 3: Restructure the types**

In `app/src/lib/tarot/types.ts`, add the import at the top:

```ts
import type { TranslatedLocale } from '@/i18n/locales';
```

Replace the `TarotCard`, `SpreadPosition`, and `SpreadDefinition` interfaces with:

```ts
/**
 * `name` and `keywords` are the canonical English. Slugs, image paths, and DB
 * rows derive from them, and the English prompt path reads them directly, so
 * duplicating English into `localized` would create two sources of truth.
 *
 * `localized` is an exhaustive Record rather than a Partial on purpose: a card
 * missing Arabic is a compile error, not an English name appearing mid-Arabic
 * reading.
 */
export interface TarotCard {
  id: number;
  name: string;
  arcana: Arcana;
  suit?: Suit;
  number: number;
  court?: Court;
  keywords: string[];
  localized: Record<TranslatedLocale, { name: string; keywords: string[] }>;
  image: string;
}

export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
  position: SpreadPosition;
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

Leave `Arcana`, `Suit`, `Court`, `SpreadType`, `Tier`, `Reading`, and `FollowUp` unchanged.

- [ ] **Step 4: Write the accessors**

Create `app/src/lib/tarot/localized.ts`:

```ts
/**
 * Locale-aware reads over the `localized` sidecar.
 *
 * Call sites use these rather than indexing `localized` directly, so that the
 * English-is-canonical rule lives in one place.
 */
import type { Locale } from '@/i18n/locales';
import type { SpreadDefinition, SpreadPosition, TarotCard } from './types';

export function cardName(card: TarotCard, locale: Locale): string {
  return locale === 'en' ? card.name : card.localized[locale].name;
}

export function cardKeywords(card: TarotCard, locale: Locale): string[] {
  return locale === 'en' ? card.keywords : card.localized[locale].keywords;
}

export function spreadName(spread: SpreadDefinition, locale: Locale): string {
  return locale === 'en' ? spread.name : spread.localized[locale].name;
}

export function spreadDescription(spread: SpreadDefinition, locale: Locale): string {
  return locale === 'en' ? spread.description : spread.localized[locale].description;
}

export function positionName(position: SpreadPosition, locale: Locale): string {
  return locale === 'en' ? position.name : position.localized[locale].name;
}

export function positionDescription(position: SpreadPosition, locale: Locale): string {
  return locale === 'en' ? position.description : position.localized[locale].description;
}
```

Add to `app/src/lib/tarot/index.ts`:

```ts
export * from './localized';
```

- [ ] **Step 5: Convert spreads.ts**

Rewrite `app/src/lib/tarot/spreads.ts`'s `SPREADS` so each spread and position carries `localized` with both `fa` (moved verbatim from the existing `nameFA`/`descriptionFA`) and `ar` (new). The Arabic below is authored to the warm-MSA constraint. Keep `getSpread` and `getAvailableSpreads` unchanged.

```ts
import { SpreadDefinition } from './types';

export const SPREADS: Record<string, SpreadDefinition> = {
  single: {
    type: 'single',
    name: 'Single Card',
    description: 'A quick insight into your question or situation.',
    localized: {
      fa: { name: 'تک کارت', description: 'بینشی سریع درباره سؤال یا موقعیت شما.' },
      ar: { name: 'بطاقة واحدة', description: 'لمحة سريعة تُضيء سؤالك أو موقفك.' },
    },
    cardCount: 1,
    minimumTier: 'free',
    positions: [
      {
        index: 0,
        name: 'The Card',
        description: 'The core message for your question.',
        localized: {
          fa: { name: 'کارت', description: 'پیام اصلی برای سؤال شما.' },
          ar: { name: 'البطاقة', description: 'الرسالة الجوهرية لسؤالك.' },
        },
      },
    ],
  },

  'three-card': {
    type: 'three-card',
    name: 'Three Card Spread',
    description: 'Past, present, and future — a narrative arc of your situation.',
    localized: {
      fa: { name: 'سه کارت', description: 'گذشته، حال و آینده — روایتی از وضعیت شما.' },
      ar: { name: 'ثلاث بطاقات', description: 'الماضي والحاضر والمستقبل — قوسٌ يحكي موقفك.' },
    },
    cardCount: 3,
    minimumTier: 'free',
    positions: [
      {
        index: 0,
        name: 'Past',
        description: 'What has led you to this moment.',
        localized: {
          fa: { name: 'گذشته', description: 'آنچه شما را به این لحظه رسانده است.' },
          ar: { name: 'الماضي', description: 'ما ساقك إلى هذه اللحظة.' },
        },
      },
      {
        index: 1,
        name: 'Present',
        description: 'Where you stand right now.',
        localized: {
          fa: { name: 'حال', description: 'جایی که اکنون در آن قرار دارید.' },
          ar: { name: 'الحاضر', description: 'حيث تقف الآن.' },
        },
      },
      {
        index: 2,
        name: 'Future',
        description: 'What is unfolding ahead of you.',
        localized: {
          fa: { name: 'آینده', description: 'آنچه در پیش روی شماست.' },
          ar: { name: 'المستقبل', description: 'ما يتكشّف أمامك.' },
        },
      },
    ],
  },

  'celtic-cross': {
    type: 'celtic-cross',
    name: 'Celtic Cross',
    description: 'The classic 10-card spread for deep, comprehensive readings.',
    localized: {
      fa: { name: 'صلیب سلتی', description: 'گسترش کلاسیک ده کارتی برای خوانش‌های عمیق و جامع.' },
      ar: { name: 'الصليب السلتي', description: 'الانتشار الكلاسيكي بعشر بطاقات، للقراءات العميقة الشاملة.' },
    },
    cardCount: 10,
    minimumTier: 'pro',
    positions: [
      {
        index: 0,
        name: 'Present',
        description: 'Your current situation and state of mind.',
        localized: {
          fa: { name: 'حال', description: 'وضعیت و حالت ذهنی فعلی شما.' },
          ar: { name: 'الحاضر', description: 'موقفك الراهن وحالُ ذهنك.' },
        },
      },
      {
        index: 1,
        name: 'Challenge',
        description: 'The immediate challenge or obstacle you face.',
        localized: {
          fa: { name: 'چالش', description: 'چالش یا مانع فوری پیش روی شما.' },
          ar: { name: 'التحدّي', description: 'التحدّي أو العقبة التي تواجهك الآن.' },
        },
      },
      {
        index: 2,
        name: 'Foundation',
        description: 'The root cause or basis of the situation.',
        localized: {
          fa: { name: 'بنیاد', description: 'علت ریشه‌ای یا پایه وضعیت.' },
          ar: { name: 'الأساس', description: 'الجذر الذي نبت منه هذا الموقف.' },
        },
      },
      {
        index: 3,
        name: 'Recent Past',
        description: 'Recent events that have influenced the present.',
        localized: {
          fa: { name: 'گذشته نزدیک', description: 'رویدادهای اخیر مؤثر بر حال.' },
          ar: { name: 'الماضي القريب', description: 'أحداثٌ قريبة ألقت بظلّها على حاضرك.' },
        },
      },
      {
        index: 4,
        name: 'Crown',
        description: 'Your goal or the best possible outcome.',
        localized: {
          fa: { name: 'تاج', description: 'هدف شما یا بهترین نتیجه ممکن.' },
          ar: { name: 'التاج', description: 'غايتك، أو أفضل ما قد يثمر.' },
        },
      },
      {
        index: 5,
        name: 'Near Future',
        description: 'What will happen in the coming weeks.',
        localized: {
          fa: { name: 'آینده نزدیک', description: 'آنچه در هفته‌های آینده رخ خواهد داد.' },
          ar: { name: 'المستقبل القريب', description: 'ما تحمله الأسابيع المقبلة.' },
        },
      },
      {
        index: 6,
        name: 'Self',
        description: 'How you see yourself in this situation.',
        localized: {
          fa: { name: 'خود', description: 'نگاه شما به خودتان در این وضعیت.' },
          ar: { name: 'الذات', description: 'كيف ترى نفسك في هذا الموقف.' },
        },
      },
      {
        index: 7,
        name: 'Environment',
        description: 'External influences and how others see you.',
        localized: {
          fa: { name: 'محیط', description: 'تأثیرات بیرونی و نگاه دیگران به شما.' },
          ar: { name: 'المحيط', description: 'المؤثّرات الخارجية، وكيف يراك الآخرون.' },
        },
      },
      {
        index: 8,
        name: 'Hopes & Fears',
        description: 'Your deepest hopes and hidden fears.',
        localized: {
          fa: { name: 'امیدها و ترس‌ها', description: 'عمیق‌ترین امیدها و ترس‌های پنهان شما.' },
          ar: { name: 'الآمال والمخاوف', description: 'أعمق ما ترجوه، وأخفى ما تخشاه.' },
        },
      },
      {
        index: 9,
        name: 'Outcome',
        description: 'The likely outcome based on the current path.',
        localized: {
          fa: { name: 'نتیجه', description: 'نتیجه محتمل بر اساس مسیر فعلی.' },
          ar: { name: 'المحصّلة', description: 'ما يُرجَّح أن يثمر إن بقيت على هذا الدرب.' },
        },
      },
    ],
  },

  horseshoe: {
    type: 'horseshoe',
    name: 'Horseshoe Spread',
    description: 'A 7-card arc for decision-making and path-forward questions.',
    localized: {
      fa: { name: 'نعل اسب', description: 'یک گسترش ۷ کارتی برای تصمیم‌گیری و سؤالات مسیر پیش رو.' },
      ar: { name: 'انتشار حَذوة الفرس', description: 'قوسٌ من سبع بطاقات، لأسئلة القرار واختيار الدرب.' },
    },
    cardCount: 7,
    minimumTier: 'pro',
    positions: [
      {
        index: 0,
        name: 'Past Influences',
        description: 'What past events have shaped this situation.',
        localized: {
          fa: { name: 'تأثیرات گذشته', description: 'رویدادهای گذشته‌ای که این وضعیت را شکل داده‌اند.' },
          ar: { name: 'مؤثّرات الماضي', description: 'أحداثٌ ماضية نحتت هذا الموقف.' },
        },
      },
      {
        index: 1,
        name: 'Present Situation',
        description: 'Where you stand right now.',
        localized: {
          fa: { name: 'وضعیت فعلی', description: 'جایی که اکنون در آن قرار دارید.' },
          ar: { name: 'الموقف الراهن', description: 'حيث تقف الآن.' },
        },
      },
      {
        index: 2,
        name: 'Hidden Factors',
        description: 'Subconscious influences you may not be aware of.',
        localized: {
          fa: { name: 'عوامل پنهان', description: 'تأثیرات ناخودآگاهی که ممکن است از آن‌ها آگاه نباشید.' },
          ar: { name: 'العوامل الخفيّة', description: 'مؤثّراتٌ في لاوعيك قد لا تنتبه إليها.' },
        },
      },
      {
        index: 3,
        name: 'Your Approach',
        description: 'Your attitude and how you are handling this.',
        localized: {
          fa: { name: 'رویکرد شما', description: 'نگرش شما و نحوه برخوردتان با این موضوع.' },
          ar: { name: 'نهجك', description: 'موقفك الداخلي، وكيف تتعامل مع هذا الأمر.' },
        },
      },
      {
        index: 4,
        name: 'Obstacles',
        description: 'Challenges and blockages you face.',
        localized: {
          fa: { name: 'موانع', description: 'چالش‌ها و موانعی که با آن‌ها روبرو هستید.' },
          ar: { name: 'العقبات', description: 'ما يعترض طريقك من تحدّيات وسدود.' },
        },
      },
      {
        index: 5,
        name: 'External Influences',
        description: 'People and circumstances affecting the outcome.',
        localized: {
          fa: { name: 'تأثیرات بیرونی', description: 'افراد و شرایطی که بر نتیجه تأثیر می‌گذارند.' },
          ar: { name: 'المؤثّرات الخارجية', description: 'أشخاصٌ وظروفٌ تُبدّل المحصّلة.' },
        },
      },
      {
        index: 6,
        name: 'Likely Outcome',
        description: 'Where this path leads if you stay the course.',
        localized: {
          fa: { name: 'نتیجه محتمل', description: 'این مسیر به کجا منتهی می‌شود اگر همین راه را ادامه دهید.' },
          ar: { name: 'المحصّلة المُرجَّحة', description: 'إلى أين يفضي هذا الدرب إن واصلت السير فيه.' },
        },
      },
    ],
  },
};

export function getSpread(type: string): SpreadDefinition | undefined {
  return SPREADS[type];
}

export function getAvailableSpreads(tier: string): SpreadDefinition[] {
  const tierOrder = { free: 0, pro: 1, premium: 2 };
  const userTierLevel = tierOrder[tier as keyof typeof tierOrder] ?? 0;

  return Object.values(SPREADS).filter(spread => {
    const spreadTierLevel = tierOrder[spread.minimumTier as keyof typeof tierOrder] ?? 0;
    return spreadTierLevel <= userTierLevel;
  });
}
```

- [ ] **Step 6: Update the existing spreads test**

In `app/src/lib/tarot/spreads.test.ts`, the assertions at lines 40-52 reference the removed fields. Replace the `nameFA`/`descriptionFA` assertions with sidecar equivalents:

```ts
        expect(position.localized.fa.name.trim(), `${spread.type}.${position.index}.fa.name`).not.toBe('');
        expect(position.localized.fa.description.trim()).not.toBe('');
```

and for the spread-level pair:

```ts
      expect(spread.localized.fa.name.trim()).not.toBe('');
      expect(spread.localized.fa.description.trim()).not.toBe('');
```

Arabic completeness is already covered by `localized.test.ts`, so do not duplicate it here.

- [ ] **Step 7: Run the targeted tests**

Run: `cd app && npx vitest run src/lib/tarot/localized.test.ts src/lib/tarot/spreads.test.ts`
Expected: PASS. `npm run verify` will still fail at `tsc` because `deck.ts` has not been converted — that is expected and Task 3 fixes it.

- [ ] **Step 8: Commit**

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git add app/src/lib/tarot/types.ts app/src/lib/tarot/localized.ts app/src/lib/tarot/localized.test.ts app/src/lib/tarot/spreads.ts app/src/lib/tarot/spreads.test.ts app/src/lib/tarot/index.ts
git commit -m "refactor(tarot): locale-keyed sidecar on types; Arabic spreads

nameFA/descriptionFA become localized[locale], an exhaustive Record so a
missing Arabic string is a compile error rather than English text leaking
into an Arabic reading.

deck.ts does not compile until the next commit converts its 78 cards."
```

---

### Task 3: Arabic card names and keywords for all 78 cards

**Files:**
- Modify: `app/src/lib/tarot/deck.ts` (all 78 card literals **and** the minor-arcana builder helper at lines 173-181)
- Modify: `app/src/lib/tarot/daily.test.ts:95`
- Create: `app/src/lib/tarot/deck.test.ts`
- Modify (repoint field reads at the accessors — see Step 4b): `app/src/components/tarot/CardFace.tsx:13`, `app/src/components/tarot/SpreadLayout.tsx:151,189`, `app/src/components/reading/SpreadSelector.tsx:35-36`, `app/src/components/reading/FollowUpChat.tsx:163,295,303,427`, `app/src/app/[locale]/(app)/reading/[id]/page.tsx:69-70`, `app/src/app/[locale]/(marketing)/daily/page.tsx:55,85-86`

**Interfaces:**
- Consumes: `TarotCard.localized` from Task 2; `cardName`/`cardKeywords` from `./localized`.
- Produces: a `DECK` of 78 cards each carrying `localized.fa` and `localized.ar`. Task 4's prompt tables read these through the accessors.

**Naming scheme — follow it exactly so the 56 minor cards are consistent.**

Majors (use these exact strings):

| # | English | Arabic |
|---|---|---|
| 0 | The Fool | الأحمق |
| 1 | The Magician | الساحر |
| 2 | The High Priestess | الكاهنة العظمى |
| 3 | The Empress | الإمبراطورة |
| 4 | The Emperor | الإمبراطور |
| 5 | The Hierophant | الكاهن الأعظم |
| 6 | The Lovers | العاشقان |
| 7 | The Chariot | العربة |
| 8 | Strength | القوّة |
| 9 | The Hermit | الناسك |
| 10 | Wheel of Fortune | عجلة الحظ |
| 11 | Justice | العدالة |
| 12 | The Hanged Man | المُعلَّق |
| 13 | Death | الموت |
| 14 | Temperance | الاعتدال |
| 15 | The Devil | الشيطان |
| 16 | The Tower | البُرج |
| 17 | The Star | النجمة |
| 18 | The Moon | القمر |
| 19 | The Sun | الشمس |
| 20 | Judgement | الحُكم |
| 21 | The World | العالَم |

Minors are generated as `<rank> <suit>`:

- Suits: Wands → `العصي`, Cups → `الكؤوس`, Swords → `السيوف`, Pentacles → `الدنانير`.
- Ranks: Ace → `آس`, Two → `اثنان من`, Three → `ثلاثة من`, Four → `أربعة من`, Five → `خمسة من`, Six → `ستة من`, Seven → `سبعة من`, Eight → `ثمانية من`, Nine → `تسعة من`, Ten → `عشرة من`, Page → `غلام`, Knight → `فارس`, Queen → `ملكة`, King → `مَلِك`.
- Ace takes no `من`: `آس العصي`. Numbered ranks do: `ثلاثة من السيوف`. Courts take no `من`: `ملكة الكؤوس`, `فارس الدنانير`.

Keywords: translate each English keyword as a noun phrase in MSA, matching the existing Farsi list's length (4 per card). Keep them nominal (`بدايات`), not verbal (`أن تبدأ`).

- [ ] **Step 1: Write the failing test**

Create `app/src/lib/tarot/deck.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { LOCALES } from '@/i18n/locales';
import { DECK } from './deck';
import { cardName, cardKeywords } from './localized';

describe('DECK integrity', () => {
  it('holds 78 cards with unique ids', () => {
    expect(DECK).toHaveLength(78);
    expect(new Set(DECK.map((c) => c.id)).size).toBe(78);
  });
});

// Review Focus 5: an English card name inside an Arabic prompt is the failure
// this guards. tsc catches an absent key; these catch empty or untranslated.
describe('every card is complete in every locale', () => {
  for (const locale of LOCALES) {
    it(`has a non-empty name for all 78 cards in ${locale}`, () => {
      for (const card of DECK) {
        expect(cardName(card, locale).trim(), `${card.name}.name.${locale}`).not.toBe('');
      }
    });

    it(`has exactly 4 non-empty keywords for all 78 cards in ${locale}`, () => {
      for (const card of DECK) {
        const keywords = cardKeywords(card, locale);
        expect(keywords, `${card.name}.keywords.${locale}`).toHaveLength(4);
        for (const keyword of keywords) {
          expect(keyword.trim(), `${card.name}.keywords.${locale}`).not.toBe('');
        }
      }
    });
  }

  /**
   * The Arabic Unicode block U+0600-U+06FF contains the Persian-only letters
   * too, so "is in the Arabic block" does not prove "is Arabic". Assert the
   * absence of Persian-specific forms as well — otherwise pasting the Farsi
   * column into the ar slot would pass.
   */
  it('uses Arabic script, not Persian, for every Arabic name and keyword', () => {
    const PERSIAN_ONLY = /[\u067E\u0686\u0698\u06AF\u06A9\u06CC]/; // پ چ ژ گ ک ی
    for (const card of DECK) {
      const name = cardName(card, 'ar');
      expect(name, card.name).toMatch(/[\u0600-\u06FF]/);
      expect(name, `${card.name} uses Persian letters`).not.toMatch(PERSIAN_ONLY);
      for (const keyword of cardKeywords(card, 'ar')) {
        expect(keyword, `${card.name} keyword`).toMatch(/[\u0600-\u06FF]/);
        expect(keyword, `${card.name} keyword uses Persian letters`).not.toMatch(PERSIAN_ONLY);
      }
    }
  });

  it('never reuses a Farsi string as the Arabic one', () => {
    for (const card of DECK) {
      expect(cardName(card, 'ar'), card.name).not.toBe(cardName(card, 'fa'));
      expect(cardKeywords(card, 'ar'), card.name).not.toEqual(cardKeywords(card, 'fa'));
    }
  });

  it('never reuses the English name as the Arabic name', () => {
    for (const card of DECK) {
      expect(cardName(card, 'ar')).not.toBe(card.name);
    }
  });

  it('gives every card a distinct Arabic name', () => {
    const names = DECK.map((c) => cardName(c, 'ar'));
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
    expect(duplicates, `duplicate Arabic names: ${duplicates.join(', ')}`).toHaveLength(0);
  });
});

describe('Arabic minor-arcana naming scheme', () => {
  const SUITS = { wands: 'العصي', cups: 'الكؤوس', swords: 'السيوف', pentacles: 'الدنانير' };

  it('ends every minor card name with its suit noun', () => {
    for (const card of DECK) {
      if (card.arcana !== 'minor' || !card.suit) continue;
      const suit = SUITS[card.suit];
      expect(cardName(card, 'ar'), `${card.name} should end with ${suit}`).toContain(suit);
    }
  });

  it('uses the bare آس form for aces and من for numbered ranks', () => {
    const ace = DECK.find((c) => c.name === 'Ace of Wands')!;
    expect(cardName(ace, 'ar')).toBe('آس العصي');
    const three = DECK.find((c) => c.name === 'Three of Swords')!;
    expect(cardName(three, 'ar')).toBe('ثلاثة من السيوف');
    const queen = DECK.find((c) => c.name === 'Queen of Cups')!;
    expect(cardName(queen, 'ar')).toBe('ملكة الكؤوس');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/lib/tarot/deck.test.ts`
Expected: FAIL — `deck.ts` cards lack `localized`, so TypeScript errors surface as a transform failure.

- [ ] **Step 3: Convert deck.ts**

For each of the 78 card literals, move the Farsi into the sidecar and add Arabic. Worked example for the first three majors:

```ts
import { TarotCard } from './types';

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0, name: 'The Fool',
    arcana: 'major', number: 0,
    keywords: ['beginnings', 'innocence', 'spontaneity', 'free spirit'],
    localized: {
      fa: { name: 'احمق', keywords: ['آغاز', 'معصومیت', 'خودانگیختگی', 'روح آزاد'] },
      ar: { name: 'الأحمق', keywords: ['بدايات', 'براءة', 'عفويّة', 'روح حُرّة'] },
    },
    image: '/cards/major/m00.jpg',
  },
  {
    id: 1, name: 'The Magician',
    arcana: 'major', number: 1,
    keywords: ['manifestation', 'resourcefulness', 'power', 'inspired action'],
    localized: {
      fa: { name: 'جادوگر', keywords: ['تجلی', 'تدبیر', 'قدرت', 'عمل الهام‌بخش'] },
      ar: { name: 'الساحر', keywords: ['تَجلٍّ', 'حُسن تدبير', 'قوّة', 'فِعلٌ مُلهَم'] },
    },
    image: '/cards/major/m01.jpg',
  },
  {
    id: 2, name: 'The High Priestess',
    arcana: 'major', number: 2,
    keywords: ['intuition', 'sacred knowledge', 'divine feminine', 'subconscious'],
    localized: {
      fa: { name: 'کاهنه اعظم', keywords: ['شهود', 'دانش مقدس', 'مؤنث الهی', 'ناخودآگاه'] },
      ar: { name: 'الكاهنة العظمى', keywords: ['حَدْس', 'معرفة مُقدَّسة', 'أنوثة إلهية', 'اللاوعي'] },
    },
    image: '/cards/major/m02.jpg',
  },
  // … continue for all 78, preserving each card's existing id, name, arcana,
  // suit, number, court, keywords, and image exactly as they are today.
];
```

**The 56 minor cards are not literals.** `deck.ts` builds them through a helper whose signature currently takes `nameFA: string` and `keywordsFA: string[]` (around lines 173-181). Change that helper to take the `localized` record instead, and pass Farsi plus Arabic at each of its 56 call sites. Derive every Arabic minor name from the scheme above rather than improvising per card.

Rules while converting:
- Never alter `id`, `name`, `arcana`, `suit`, `number`, `court`, `keywords`, or `image`. Only move Farsi into `localized.fa` and add `localized.ar`.
- Copy each Farsi name and keyword array verbatim. A typo here changes a frozen Farsi prompt and trips the gate in Task 4.
- Derive every minor-arcana Arabic name from the scheme above — do not improvise per card.

- [ ] **Step 4: Fix the daily test's field reference**

In `app/src/lib/tarot/daily.test.ts`, line 95 asserts `card.nameFA`. Replace with:

```ts
    expect(card.localized.fa.name).toBeTruthy();
    expect(card.localized.ar.name).toBeTruthy();
```

- [ ] **Step 4b: Repoint every remaining field read at the accessors**

Task 2 removed `nameFA`/`descriptionFA`/`keywordsFA`, and six files outside the tarot library still read them. Until they are repointed, `tsc` stays red and every later task's `npm run verify` gate fails — so they belong here, with the change that broke them.

Replace each read with the matching accessor from `@/lib/tarot/localized`. The pattern is always the same: a `language === 'en' ? X.name : X.nameFA` ternary becomes `cardName(X, language)` (or `positionName`, `spreadName`, `spreadDescription`, `cardKeywords`).

| File | Lines | Change |
|---|---|---|
| `components/tarot/CardFace.tsx` | 13 | `cardName(card, language)` |
| `components/tarot/SpreadLayout.tsx` | 151, 189 | `positionName(drawnCard.position, language)` / `positionName(dc.position, language)` |
| `components/reading/SpreadSelector.tsx` | 35-36 | `spreadName(spread, language)` / `spreadDescription(spread, language)` |
| `components/reading/FollowUpChat.tsx` | 163, 295, 427 | `cardName(card, language)` / `cardName(drawnExtraCard.card, language)` |
| `components/reading/FollowUpChat.tsx` | 303 | `cardKeywords(drawnExtraCard.card, language).join(...)` — keep the existing `en ? ', ' : '، '` joiner as-is; Task 8 replaces it with the locale table |
| `app/[locale]/(app)/reading/[id]/page.tsx` | 69-70 | `cardName(dc.card, language)` / `positionName(dc.position, language)` |
| `app/[locale]/(marketing)/daily/page.tsx` | 55, 85-86 | `cardName(card, locale)` / `cardKeywords(card, locale)` |

These files currently type `language` as `'en' | 'fa'`, which is assignable to `Locale`, so no signature change is needed here. Task 8 widens those unions.

**Do not touch two look-alikes.** `components/billing/PricingTable.tsx` has its own `nameFA` on a local pricing-plan object, and `execution/generate-card-content-fa.mjs` has a local `nameFA` variable. Neither is a `TarotCard` field. Leave both exactly as they are.

- [ ] **Step 5: Run the tests**

Run: `cd app && npx vitest run src/lib/tarot/`
Expected: PASS, including the 78-card completeness and naming-scheme assertions.

- [ ] **Step 6: Verify the Farsi data survived the move**

Run: `cd app && npx tsc --noEmit`

Expected: errors in **`app/src/lib/ai/prompts.ts` only.** That file is the last reader of the removed fields and belongs to Task 4, which restructures it wholesale — repointing it mechanically here would be thrown away and risks the byte-exact prompt requirement. An error in any *other* file means Step 4b missed one.

Then run the test suite: `cd app && npx vitest run` — expected fully green.

Do **not** run `npm run verify` as your gate: the prompt-freeze step imports `prompts.ts`, so it cannot execute until Task 4 lands. The red window Task 2 opened closes at the end of Task 4, not here.

Once Task 4 completes, **the prompt freeze must report no changed prompts** — proof that no Farsi card name or keyword was altered while being moved into the sidecar. If the freeze reports a change, a Farsi string was mistyped in step 3. Fix the typo; do not re-freeze.

- [ ] **Step 7: Commit**

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git add app/src/lib/tarot/deck.ts app/src/lib/tarot/deck.test.ts app/src/lib/tarot/daily.test.ts
git commit -m "feat(tarot): Arabic names and keywords for all 78 cards

Farsi moves into localized.fa unchanged; Arabic is added. The prompt
freeze passing unchanged is the proof that no Farsi string drifted
during the move.

Minor-arcana names follow one scheme (rank + suit noun, آس without من)
rather than being improvised per card; a test asserts the scheme."
```

---

### Task 4: Refactor prompts.ts to locale-keyed tables — en/fa only

**This is the safety-proof task. No Arabic prompt content is added here.** The deliverable is a refactor whose correctness is proved by the freeze snapshot not moving.

**Files:**
- Modify: `app/src/lib/ai/prompts.ts` (whole file)

**Interfaces:**
- Consumes: `Locale` from `@/i18n/locales`; `cardName`, `cardKeywords`, `spreadName`, `positionName`, `positionDescription` from `@/lib/tarot/localized`.
- Produces: `buildInterpretationPrompt`, `buildFollowUpPrompt`, `buildQuestionMessage`, `buildExtraCardContext` — all with `language: Locale` instead of `language: 'en' | 'fa'`. Also `FORBIDDEN_PATTERNS_EN` (unchanged name and content). Task 5 adds the `ar` entries to the tables this task creates.

- [ ] **Step 1: Confirm the snapshot baseline**

The gate cannot run yet — it imports `prompts.ts`, which does not compile until your refactor lands. So take the baseline from the snapshot file itself, which has not been touched on this branch:

```bash
shasum -a 256 execution/prompt-freeze.snapshot.json
```

Expected, exactly:

```
a6a024b207a81b4fcdd83698fcab337baa578e0d32e390e164d3556625c9555e
```

If it differs, stop and report — something has already modified the snapshot and the proof this task rests on is void.

`execution/prompt-freeze.snapshot.json` must still hash to that value when you finish, and it must not appear in your commit at all. Your refactor is the thing that makes the gate runnable again; when it runs, it must report zero changed prompts.

- [ ] **Step 2: Restructure the constant pairs into locale tables**

In `app/src/lib/ai/prompts.ts`, add to the imports:

```ts
import type { Locale } from '@/i18n/locales';
import {
  cardName,
  cardKeywords,
  spreadName,
  positionName,
  positionDescription,
} from '@/lib/tarot/localized';
```

Convert each `_EN`/`_FA` pair into a single table, keeping the existing string bodies **byte-for-byte**.

The tables cannot be `Record<Locale, …>` yet: that would demand an `ar` key, and the only values available in this task are English ones, which would ship English as Arabic. Declare a file-local alias instead:

```ts
/**
 * Locales with authored prompt content. Arabic joins in the next commit; until
 * then this alias is narrower than Locale, so tsc flags any caller that passes
 * a locale we cannot yet write a prompt for.
 */
type PromptLocale = Extract<Locale, 'en' | 'fa'>;
```

Tables are `Record<PromptLocale, …>` and the four exported signatures take `language: PromptLocale`. Task 5 deletes this alias in one line once the Arabic bodies exist, and `tsc` then points at every table still missing an `ar` key. This keeps every commit compiling and makes the widening impossible to do by halves.

Apply it:

```ts
const SPREAD_SHAPES: Record<PromptLocale, Record<SpreadType, string>> = {
  en: { /* the four existing SPREAD_SHAPES_EN bodies, unchanged */ },
  fa: { /* the four existing SPREAD_SHAPES_FA bodies, unchanged */ },
};

const NARRATIVE_STRUCTURE: Record<PromptLocale, string> = {
  en: /* existing NARRATIVE_STRUCTURE_EN body */,
  fa: /* existing NARRATIVE_STRUCTURE_FA body */,
};

const VOICE_CONSTRAINTS: Record<PromptLocale, string> = {
  en: /* existing VOICE_CONSTRAINTS_EN body */,
  fa: /* existing VOICE_CONSTRAINTS_FA body */,
};

const SAFETY_BOUNDARIES: Record<PromptLocale, string> = {
  en: /* existing SAFETY_BOUNDARIES_EN body */,
  fa: /* existing SAFETY_BOUNDARIES_FA body */,
};

const TOPIC_INSTRUCTIONS: Record<string, Record<PromptLocale, string>> = {
  love: { en: /* existing */, fa: /* existing */ },
  'yes-or-no': { en: /* existing */, fa: /* existing */ },
  career: { en: /* existing */, fa: /* existing */ },
};
```

Leave `FORBIDDEN_PATTERNS_EN` exactly as it is, name included. Task 5 adds its Arabic sibling.

- [ ] **Step 3: Convert the per-locale prose blocks into tables too**

The four builders each hold two large template literals selected by `isEnglish`. Replace each with a table lookup so adding Arabic in Task 5 is a data edit. For `buildInterpretationPrompt`, the system prompt becomes:

```ts
const SYSTEM_PREAMBLE: Record<PromptLocale, (parts: {
  spreadShape: string;
  narrativeStructure: string;
  wordRange: string;
}) => string> = {
  en: ({ spreadShape, narrativeStructure, wordRange }) => `You are a master tarot reader who weaves ancient symbolism with modern psychological insight. Your interpretations are renowned for their narrative depth and emotional resonance.
${spreadShape}${narrativeStructure}

Guidelines:
- Write in flowing, evocative prose — not bullet points or lists
- Address the querent directly using "you"
- Be specific and vivid, not generic. Avoid clichés like "trust the journey" without grounding them in the specific cards drawn
- End with a clear, actionable insight the querent can take with them
- Length: ${wordRange} words
${VOICE_CONSTRAINTS.en}
${SAFETY_BOUNDARIES.en}`,

  fa: ({ spreadShape, narrativeStructure, wordRange }) => `شما یک فالگیر استاد تاروت هستید که نمادگرایی کهن را با بینش روان‌شناختی مدرن پیوند می‌زنید. تفسیرهای شما به خاطر عمق روایی و طنین عاطفی‌شان مشهورند.
${spreadShape}${narrativeStructure}

راهنما:
- به نثر روان و تصویری بنویسید، نه فهرست یا نقطه‌ای
- مستقیماً با مراجعه‌کننده صحبت کنید
- خاص و زنده باشید، نه کلی
- از حکمت ایرانی و تمثیل‌های فرهنگی بهره ببرید، اما هرگز شعر یا بیت نقل نکنید
- با یک بینش عملی روشن پایان دهید
- طول: ${wordRange} کلمه
${VOICE_CONSTRAINTS.fa}
${SAFETY_BOUNDARIES.fa}`,
};
```

**Whitespace is load-bearing.** Every newline, every `${…}` position, and the absence of a trailing newline must match the original exactly, or the freeze trips. Copy the bodies; do not retype them.

Apply the same treatment to:
- The orientation words: `const ORIENTATION: Record<PromptLocale, { upright: string; reversed: string }> = { en: { upright: 'Upright', reversed: 'Reversed' }, fa: { upright: 'ایستاده', reversed: 'معکوس' } };`
- The keyword joiner: `const KEYWORD_JOIN: Record<PromptLocale, string> = { en: ', ', fa: '، ' };`
- `buildInterpretationPrompt`'s `userMessage` (single vs multi-card × locale) → `USER_MESSAGE: Record<PromptLocale, { single: (…) => string; multi: (…) => string }>`.
- `buildFollowUpPrompt`'s body → `FOLLOWUP_PROMPT: Record<PromptLocale, (parts) => string>`. Note the English branch interpolates `spread.name` and the Farsi branch `spread.nameFA`; both become `spreadName(spread, language)`.
- `buildQuestionMessage` → `QUESTION_PREFIX: Record<PromptLocale, (question: string) => string>`.
- `buildExtraCardContext`'s body and its `presenceNote` pair → `EXTRA_CARD: Record<PromptLocale, { repeat: string; fresh: string; body: (parts) => string }>`.

- [ ] **Step 4: Replace the card-field reads with accessors**

In `buildInterpretationPrompt`, `buildFollowUpPrompt`, and `buildExtraCardContext`, replace every `isEnglish ? dc.card.name : dc.card.nameFA` style ternary:

```ts
  const cardDescriptions = cards.map(dc => {
    const name = cardName(dc.card, language);
    const posName = positionName(dc.position, language);
    const posDesc = positionDescription(dc.position, language);
    const keywords = cardKeywords(dc.card, language).join(KEYWORD_JOIN[language]);
    const orientation = dc.reversed
      ? ORIENTATION[language].reversed
      : ORIENTATION[language].upright;

    return `- Position: ${posName} (${posDesc})\n  Card: ${name} (${orientation})\n  Keywords: ${keywords}`;
  }).join('\n\n');
```

Delete the now-unused `isEnglish` locals. Change all four exported signatures from `language: 'en' | 'fa'` to `language: PromptLocale`.

- [ ] **Step 5: Run the freeze gate — the proof**

Run:

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
node execution/prompt-freeze.mjs --verbose
```

Expected: **PASS with zero changed and zero removed prompts.** This proves the refactor altered no English or Farsi reading — not a constant, not the assembly order, not a conditional.

If it reports a change: a template literal's whitespace or interpolation drifted, or a Farsi string was retyped rather than copied. Run with `--verbose` to see the changed text, fix the code, and re-run. **Do not run `--update`.** Confirm the snapshot is untouched:

```bash
git diff --stat execution/prompt-freeze.snapshot.json
```

Expected: no output.

- [ ] **Step 6: Run the full verification**

Run: `cd app && npm run verify`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git add app/src/lib/ai/prompts.ts
git commit -m "refactor(ai): locale-keyed prompt tables, no content change

_EN/_FA constant pairs become Record<PromptLocale, T> tables and card
field ternaries become the tarot accessors. PromptLocale is deliberately
narrower than Locale until Arabic bodies exist.

The prompt freeze passing with zero changed prompts is the proof that no
English or Farsi reading changed. The snapshot file is deliberately
absent from this commit."
```

---

### Task 5: Arabic prompt content and the Arabic forbidden patterns

**Files:**
- Modify: `app/src/lib/ai/prompts.ts` (add `ar` entries; widen `PromptLocale`)
- Modify: `execution/prompt-freeze.fixtures.ts:28` (`LANGUAGES`)
- Create: `app/src/lib/ai/prompts.test.ts`

**Interfaces:**
- Consumes: the tables from Task 4.
- Produces: `FORBIDDEN_PATTERNS_AR: { label: string; pattern: RegExp }[]`; all four builders accepting `language: Locale`.

Authoring rules for every Arabic body:
- Warm MSA. Address the querent as **أنت** throughout; never switch to the plural or to a dialect pronoun.
- Draw on the directive's Arabic register: desert, oasis, light and guidance. Do not port the Farsi blocks' Persian literary references.
- Reflective, never predictive. Use `تدعوك البطاقات إلى أن تتأمّل`, `تشير هذه الطاقة إلى`, `قد تجد`. Never `ستفعل`, `سيحدث`, `توقّع أن`.
- Crisis guidance: region-neutral. `يُرجى الاتصال بخدمات الطوارئ المحلية أو بخط دعم نفسي في بلدك` — never a specific number.

- [ ] **Step 1: Write the failing test**

Create `app/src/lib/ai/prompts.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { LOCALES, type Locale } from '@/i18n/locales';
import { SPREADS } from '@/lib/tarot/spreads';
import { DECK } from '@/lib/tarot/deck';
import {
  buildInterpretationPrompt,
  buildFollowUpPrompt,
  buildQuestionMessage,
  buildExtraCardContext,
  FORBIDDEN_PATTERNS_AR,
  type ReadingTopic,
} from './prompts';
import type { DrawnCard, SpreadDefinition } from '@/lib/tarot/types';

function drawFor(spread: SpreadDefinition): DrawnCard[] {
  return spread.positions.map((position, i) => ({
    card: DECK[i],
    position,
    reversed: i % 2 === 1,
  }));
}

const TOPICS: ReadingTopic[] = [null, 'love', 'yes-or-no', 'career'];

describe('every locale renders every prompt', () => {
  for (const locale of LOCALES as readonly Locale[]) {
    it(`builds interpretation prompts for ${locale} across all spreads, tiers and topics`, () => {
      for (const spread of Object.values(SPREADS)) {
        for (const tier of ['free', 'pro'] as const) {
          for (const topic of TOPICS) {
            const { systemPrompt, userMessage } = buildInterpretationPrompt({
              spread, cards: drawFor(spread), language: locale, tier, topic,
            });
            expect(systemPrompt.length, `${spread.type}.${locale}.${tier}`).toBeGreaterThan(200);
            expect(userMessage.trim()).not.toBe('');
            expect(systemPrompt).not.toContain('undefined');
            expect(userMessage).not.toContain('undefined');
          }
        }
      }
    });

    it(`builds follow-up, question and extra-card prompts for ${locale}`, () => {
      const spread = SPREADS['three-card'];
      const followUp = buildFollowUpPrompt({
        spread, cards: drawFor(spread), interpretation: 'X', language: locale,
      });
      expect(followUp).not.toContain('undefined');
      expect(buildQuestionMessage({ question: 'Q?', language: locale })).not.toBe('');
      expect(
        buildExtraCardContext({ card: DECK[10], reversed: true, language: locale, originalCardIds: [] }),
      ).not.toContain('undefined');
    });
  }
});

describe('Arabic prompts are actually Arabic', () => {
  const spread = SPREADS['celtic-cross'];

  /**
   * Checks EVERY rendered surface, not just the system prompt. The orientation
   * words and keyword joiner are interpolated into the *user message*, so a
   * Farsi value copied into an `ar` table slot would not show up in
   * systemPrompt at all.
   */
  it('contains no Latin prose and no Persian-only letters, on every surface', () => {
    const PERSIAN_ONLY = /[\u067E\u0686\u0698\u06AF\u06A9\u06CC]/; // پ چ ژ گ ک ی
    const cards = drawFor(spread);

    const surfaces: [string, string][] = [];
    for (const topic of TOPICS) {
      const { systemPrompt, userMessage } = buildInterpretationPrompt({
        spread, cards, language: 'ar', tier: 'pro', topic,
      });
      surfaces.push([`system.${topic ?? 'none'}`, systemPrompt]);
      surfaces.push([`user.${topic ?? 'none'}`, userMessage]);
    }
    surfaces.push(['followup', buildFollowUpPrompt({
      spread, cards, interpretation: 'X', language: 'ar',
    })]);
    surfaces.push(['question', buildQuestionMessage({ question: 'س؟', language: 'ar' })]);
    for (const wasInOriginal of [false, true]) {
      surfaces.push([`extra.${wasInOriginal}`, buildExtraCardContext({
        card: DECK[10], reversed: true, language: 'ar',
        originalCardIds: wasInOriginal ? [DECK[10].id] : [],
      })]);
    }

    for (const [label, text] of surfaces) {
      expect(text, `${label} uses Persian letters`).not.toMatch(PERSIAN_ONLY);
      // No run of 4+ Latin letters: the register must not fall back to English.
      expect(text.replace(/TarotVeil/g, ''), `${label} has Latin prose`).not.toMatch(/[A-Za-z]{4,}/);
    }
  });

  it('avoids deterministic prediction verbs', () => {
    const { systemPrompt } = buildInterpretationPrompt({
      spread, cards: drawFor(spread), language: 'ar', tier: 'pro', topic: null,
    });
    // These appear only inside the safety block as things to avoid, so assert
    // on the instruction's presence rather than on raw absence.
    expect(systemPrompt).toContain('تدعوك البطاقات');
  });

  it('gives region-neutral crisis guidance with no phone number', () => {
    const { systemPrompt } = buildInterpretationPrompt({
      spread, cards: drawFor(spread), language: 'ar', tier: 'pro', topic: null,
    });
    expect(systemPrompt).toMatch(/الطوارئ/);

    // Scope the digit check to the crisis sentence. The prompt legitimately
    // carries a word-range ("1000-1100"), so asserting over the whole string
    // would fail a correct implementation.
    const crisisSentence = systemPrompt
      .split(/[\n.؟!]/)
      .find((line) => /الطوارئ/.test(line));
    expect(crisisSentence, 'crisis sentence not found').toBeDefined();
    expect(crisisSentence).not.toMatch(/\d/);
  });
});

describe('FORBIDDEN_PATTERNS_AR', () => {
  it('is non-empty and every entry is labelled', () => {
    expect(FORBIDDEN_PATTERNS_AR.length).toBeGreaterThan(4);
    for (const { label, pattern } of FORBIDDEN_PATTERNS_AR) {
      expect(label.trim()).not.toBe('');
      expect(pattern).toBeInstanceOf(RegExp);
    }
  });

  it('flags the constructions it targets', () => {
    const bad = [
      'ستجد الحب قريبًا',
      'السؤال الحقيقي هو ما تريده فعلًا',
      'جزء منك يعرف الجواب بالفعل',
      'وهذا أمر طبيعي تمامًا',
      'يا له من سؤال جميل',
    ];
    for (const sample of bad) {
      const hit = FORBIDDEN_PATTERNS_AR.some(({ pattern }) => pattern.test(sample));
      expect(hit, `expected a pattern to flag: ${sample}`).toBe(true);
    }
  });

  it('does not flag ordinary reflective Arabic', () => {
    const good = [
      'تدعوك البطاقات إلى أن تتأمّل في ما يجري حولك.',
      'تشير هذه الطاقة إلى مرحلة من الهدوء بعد اضطراب.',
      'قد تجد في هذا الموقف فرصةً لم تلتفت إليها.',
    ];
    for (const sample of good) {
      const flagged = FORBIDDEN_PATTERNS_AR.filter(({ pattern }) => pattern.test(sample));
      expect(flagged.map((f) => f.label), sample).toEqual([]);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/lib/ai/prompts.test.ts`
Expected: FAIL — `FORBIDDEN_PATTERNS_AR` is not exported, and `language: 'ar'` is not assignable to `PromptLocale`.

- [ ] **Step 3: Widen PromptLocale and add the Arabic table entries**

In `app/src/lib/ai/prompts.ts`, delete the `PromptLocale` alias and replace its uses with `Locale`:

```ts
// PromptLocale is gone — every table now covers every locale.
```

`tsc` will now point at each table missing an `ar` key. Add an authored Arabic body to every one: `SPREAD_SHAPES.ar` (all four spread types), `NARRATIVE_STRUCTURE.ar`, `VOICE_CONSTRAINTS.ar`, `SAFETY_BOUNDARIES.ar`, `TOPIC_INSTRUCTIONS.love.ar`, `TOPIC_INSTRUCTIONS['yes-or-no'].ar`, `TOPIC_INSTRUCTIONS.career.ar`, `SYSTEM_PREAMBLE.ar`, `ORIENTATION.ar` (`{ upright: 'مستقيمة', reversed: 'معكوسة' }`), `KEYWORD_JOIN.ar` (`'، '`), `USER_MESSAGE.ar`, `FOLLOWUP_PROMPT.ar`, `QUESTION_PREFIX.ar`, `EXTRA_CARD.ar`.

The `yes-or-no` topic needs its four answer formats in Arabic, matching the English structure: `نعم`, `لا`, `نعم، ولكن…`, `لا، إلّا إذا…`.

**Do not copy any `fa` value into its `ar` slot.** Farsi is written in Arabic script, so a copied value compiles cleanly and looks plausible while being the wrong language. The traps are `ORIENTATION` (`ایستاده`/`معکوس` are Farsi — Arabic is `مستقيمة`/`معكوسة`) and `EXTRA_CARD.repeat`/`.fresh`, which are Farsi prose. The test above catches these by rejecting the Persian-only letters ی and ک on every rendered surface.

**One legitimate exception:** `KEYWORD_JOIN.ar` is `'، '` — the same Arabic comma (U+060C) Farsi uses. That value genuinely coincides; it is not a copy-paste error.

- [ ] **Step 4: Add the Arabic forbidden patterns**

Add below `FORBIDDEN_PATTERNS_EN` in `app/src/lib/ai/prompts.ts`:

```ts
/**
 * The Arabic equivalents, targeting Arabic's own machine-translation tells
 * rather than being a port of the English patterns.
 *
 * Arabic has no case distinction, so `i` is pointless; `\b` is unreliable
 * against Arabic script in JS regex, so these match on the word forms
 * directly. Kept narrow: only constructions with a low false-positive rate in
 * a genuine reading belong here.
 */
export const FORBIDDEN_PATTERNS_AR: { label: string; pattern: RegExp }[] = [
  { label: 'deterministic future', pattern: /(?:^|\s)(?:سوف\s+\S+|س[يتن]\S+)\s+(?:قريبًا|حتمًا|بالتأكيد)/ },
  { label: 'the real question', pattern: /السؤال\s+الحقيقي\s+(?:هو|ليس)/ },
  { label: 'mind-reading', pattern: /(?:جزء\s+منك\s+يعرف|ما\s+تريده\s+فعل(?:ًا|ا)|تخشى\s+أن\s+تعترف)/ },
  // NOT إيذاء الذات — that is self-HARM, and flagging it would catch a reading
  // responding compassionately to a disclosure. The voice list bans self-SABOTAGE.
  // The shadda is optional because generated text usually omits it.
  { label: 'clinical language', pattern: /(?:نمط\s+التعل(?:ّ)?ق|تخريب\s+الذات|استجابة\s+الصدمة|جهازك\s+العصبي)/ },
  { label: 'reassurance padding', pattern: /(?:وهذا\s+أمر\s+طبيعي|لا\s+يوجد\s+جواب\s+خاطئ|كن\s+لطيف(?:ًا|ا)\s+مع\s+نفسك)/ },
  { label: 'flattering opener', pattern: /يا\s+له\s+من\s+سؤال\s+(?:جميل|عميق|رائع)/ },
  { label: 'meta-narration', pattern: /(?:لنبدأ\s+إذ(?:ًا|ا)|قبل\s+أن\s+نبدأ|للبطاقات\s+كثير\s+لتقوله)/ },
  { label: 'closing throat-clearing', pattern: /(?:^|\n)\s*(?:في\s+الخلاصة|في\s+النهاية|خلاصة\s+القول|الزبدة)/ },
];
```

- [ ] **Step 5: Run the prompt tests**

Run: `cd app && npx vitest run src/lib/ai/prompts.test.ts`
Expected: PASS. If the "no Latin prose" assertion fails, an English body was copied into an `ar` slot.

- [ ] **Step 6: Extend the freeze fixture matrix**

In `execution/prompt-freeze.fixtures.ts`, change line 28:

```ts
const LANGUAGES: Locale[] = ['en', 'fa', 'ar'];
```

and add the import:

```ts
import type { Locale } from '@/i18n/locales';
```

- [ ] **Step 7: Run the freeze gate**

Run:

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
node execution/prompt-freeze.mjs
```

Expected: **PASS, reporting added keys and zero changed or removed ones.** The runner's documented rules allow added prompts, so no `--update` is needed — the Arabic keys are simply new. The snapshot file stays untouched; confirm:

```bash
git diff --stat execution/prompt-freeze.snapshot.json
```

Expected: no output. If the gate instead reports a *changed* `en` or `fa` key, widening `PromptLocale` disturbed an existing body — fix it rather than re-freezing.

- [ ] **Step 8: Run the full verification and commit**

Run: `cd app && npm run verify`
Expected: PASS.

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git add app/src/lib/ai/prompts.ts app/src/lib/ai/prompts.test.ts execution/prompt-freeze.fixtures.ts
git commit -m "feat(ai): Arabic prompt family and Arabic forbidden patterns

Authored in warm MSA to the directive's Arabic register rather than
translated from the Farsi blocks. Crisis guidance is region-neutral: no
pan-Arab helpline number exists.

FORBIDDEN_PATTERNS_AR is new — the English set had no Arabic sibling, and
with no native reviewer these regexes are the only automated tone guard.

The freeze gate reports added keys only; en and fa are unchanged."
```

---

### Task 6: Arabic UI strings (`ar.json`) with a key-parity gate

**Files:**
- Create: `app/src/messages/ar.json`
- Create: `app/src/messages/parity.test.ts`

**Interfaces:**
- Consumes: `LOCALES` from `@/i18n/locales`.
- Produces: `ar.json`, structurally identical to `en.json` — 26 namespaces, 769 leaf keys. Every page that calls `getTranslations` renders Arabic once this exists.

Translation rules:
- Warm MSA. Address the reader as **أنت**.
- Keep every ICU placeholder (`{count}`, `{name}`) byte-identical — same name, same braces.
- Never translate the brand: `TarotVeil` stays Latin everywhere it appears in a value.
- SEO namespaces (`cardHub`, `loveTarot`, `careerTarot`, `yesOrNo`, `spreadsHub`, the four `spread*` namespaces) carry `metaTitle` and `metaDescription`. Write these as natural Arabic search phrasing — `قراءة التاروت`, `فال التاروت` is Persian and must not appear — not literal translations of the English.
- Preserve each value's rough length. Arabic runs ~15% longer than English; a value three times the English length will break layout.

- [ ] **Step 1: Write the failing test**

Create `app/src/messages/parity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { LOCALES, type Locale } from '@/i18n/locales';
import en from './en.json';
import fa from './fa.json';
import ar from './ar.json';

const BUNDLES: Record<Locale, unknown> = { en, fa, ar };

/** Flatten to dotted leaf paths so a missing or extra key names itself. */
function leafPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leafEntries(value: unknown, prefix = ''): [string, unknown][] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [[prefix, value]];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leafEntries(child, prefix ? `${prefix}.${key}` : key),
  );
}

const enPaths = leafPaths(en);

describe('message bundle parity', () => {
  /**
   * A floor, not an exact count. Later tasks legitimately add keys (inline
   * bilingual copy moves into the bundles), so pinning the exact number would
   * make a correct change fail. The floor still catches a truncated bundle.
   */
  it('en.json has at least the namespaces and keys it shipped with', () => {
    expect(Object.keys(en as object).length).toBeGreaterThanOrEqual(26);
    expect(enPaths.length).toBeGreaterThanOrEqual(769);
  });

  // Review Focus 4: a key missing from ar.json renders English mid-Arabic page
  // via next-intl's fallback, with no error. This is the gate that catches it.
  for (const locale of LOCALES) {
    if (locale === 'en') continue;

    it(`${locale}.json has exactly the same keys as en.json`, () => {
      const paths = leafPaths(BUNDLES[locale]);
      const missing = enPaths.filter((p) => !paths.includes(p));
      const extra = paths.filter((p) => !enPaths.includes(p));
      expect(missing, `missing from ${locale}.json`).toEqual([]);
      expect(extra, `not in en.json`).toEqual([]);
    });

    it(`${locale}.json has no empty values`, () => {
      for (const [path, value] of leafEntries(BUNDLES[locale])) {
        expect(typeof value, path).toBe('string');
        expect(String(value).trim(), path).not.toBe('');
      }
    });

    it(`${locale}.json preserves every ICU placeholder`, () => {
      const enMap = new Map(leafEntries(en));
      for (const [path, value] of leafEntries(BUNDLES[locale])) {
        const expected = String(enMap.get(path) ?? '').match(/\{[^}]+\}/g)?.sort() ?? [];
        const actual = String(value).match(/\{[^}]+\}/g)?.sort() ?? [];
        expect(actual, `placeholders in ${locale}.json → ${path}`).toEqual(expected);
      }
    });
  }

  it('ar.json is written in Arabic script, not left as English', () => {
    const untranslated: string[] = [];
    const enMap = new Map(leafEntries(en));
    for (const [path, value] of leafEntries(ar)) {
      const text = String(value);
      // Allow values that are legitimately just the brand or a bare number.
      if (/^(?:TarotVeil|[\d\s.,%+-]+)$/.test(text.trim())) continue;
      if (text === String(enMap.get(path))) untranslated.push(path);
      else if (!/[؀-ۿ]/.test(text)) untranslated.push(path);
    }
    expect(untranslated, `untranslated ar.json keys`).toEqual([]);
  });

  it('ar.json contains no Persian-specific letters', () => {
    const persian: string[] = [];
    for (const [path, value] of leafEntries(ar)) {
      if (/[پچژگکی]/.test(String(value))) persian.push(path);
    }
    expect(persian, `Persian letters (پ چ ژ گ ک ی) in ar.json`).toEqual([]);
  });

  it('keeps the brand Latin in ar.json', () => {
    for (const [path, value] of leafEntries(ar)) {
      expect(String(value), path).not.toMatch(/تاروت‌ویل|تاروتفيل/);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/messages/parity.test.ts`
Expected: FAIL — `Cannot find module './ar.json'`.

- [ ] **Step 3: Generate the Arabic bundle**

Start from the English structure so key order and nesting match:

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot/app"
cp src/messages/en.json src/messages/ar.json
```

Then translate every value in `src/messages/ar.json` in place, namespace by namespace, following the translation rules above. Work through them in this order so the highest-traffic copy gets the most care: `common`, `nav`, `footer`, `errors`, `landing`, `freeReading`, `reading`, `auth`, `dashboard`, `settings`, `billing`, `daily`, `spreadsHub`, the four `spread*` namespaces, `loveTarot`, `careerTarot`, `yesOrNo`, `about`, `legal`, `cardHub`, `cardDetail`, `subHub`, `subHubConfigs`.

`cardHub`, `cardDetail`, `subHub`, and `subHubConfigs` serve the card-meaning pages, which Task 10 gates off for Arabic. Translate them anyway — the parity test requires it, and Phase 2 needs them.

- [ ] **Step 4: Run the parity test**

Run: `cd app && npx vitest run src/messages/parity.test.ts`
Expected: PASS. The failure messages name any key that is missing, empty, still English, carries a wrong placeholder, or uses a Persian letter.

- [ ] **Step 5: Make a missing key loud in development**

The parity test catches an absent key before deploy, but next-intl's default
behaviour is to render the key path and continue. In development that should be
impossible to miss. Modify `app/src/i18n/request.ts`:

```ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    /**
     * A missing key silently falling back is how English text ends up mid-page
     * in a translated locale. `parity.test.ts` is the real gate; this makes a
     * gap visible the moment it is introduced locally.
     */
    onError(error) {
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
      console.error(error);
    },
  };
});
```

Confirm it works: temporarily delete a key from `ar.json`, load `/ar`, see the
error, then restore the key.

- [ ] **Step 6: Verify and commit**

Run: `cd app && npm run verify`
Expected: PASS.

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git add app/src/messages/ar.json app/src/messages/parity.test.ts app/src/i18n/request.ts
git commit -m "feat(i18n): Arabic UI strings with a key-parity gate

All 26 namespaces and 769 leaf keys in warm MSA. Every marketing page
already reads copy through getTranslations, so they render Arabic from
this commit.

The parity test is the real deliverable: a key missing from ar.json would
otherwise render English mid-Arabic page through next-intl's silent
fallback. It also pins ICU placeholders and rejects Persian letters."
```

---

### Task 7: Arabic rendering — fonts, direction, metadata, JSON-LD

**Files:**
- Modify: `app/src/app/[locale]/layout.tsx`
- Modify: `app/src/app/globals.css:112-121`
- Create: `app/src/app/bidi.test.ts`

**Interfaces:**
- Consumes: `Locale`, `toLocale`, `isRtl`, `BRAND`, `HTML_LANG` from `@/i18n/locales`.
- Produces: `isolateLtr(text: string): string` exported from `@/i18n/locales` (added here), used by any Arabic string that embeds a Latin run.

- [ ] **Step 1: Write the failing test**

Create `app/src/app/bidi.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { isolateLtr, BRAND } from '@/i18n/locales';

// Review Focus 1: a Latin wordmark inside an RTL string reorders the
// punctuation around it. '%s | TarotVeil' renders with the bar in the wrong
// place unless the Latin run is bidi-isolated.
describe('isolateLtr', () => {
  it('wraps text in First Strong Isolate and Pop Directional Isolate', () => {
    expect(isolateLtr('TarotVeil')).toBe('⁨TarotVeil⁩');
  });

  it('is idempotent so a twice-wrapped brand does not accumulate marks', () => {
    expect(isolateLtr(isolateLtr('TarotVeil'))).toBe('⁨TarotVeil⁩');
  });

  it('leaves an empty string alone', () => {
    expect(isolateLtr('')).toBe('');
  });

  it('isolates the Arabic brand so the title separator stays put', () => {
    const template = `%s | ${isolateLtr(BRAND.ar)}`;
    expect(template).toContain('⁨');
    expect(template.indexOf('|')).toBeLessThan(template.indexOf('⁨'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/app/bidi.test.ts`
Expected: FAIL — `isolateLtr` is not exported from `@/i18n/locales`.

- [ ] **Step 3: Add isolateLtr to the locale module**

Append to `app/src/i18n/locales.ts`:

```ts
const FSI = '⁨'; // First Strong Isolate
const PDI = '⁩'; // Pop Directional Isolate

/**
 * Bidi-isolate a Latin run so it can sit inside RTL text without dragging
 * neighbouring punctuation around it.
 *
 * The Arabic brand is the Latin wordmark, so `'%s | TarotVeil'` in an RTL
 * context renders the separator on the wrong side without this.
 */
export function isolateLtr(text: string): string {
  if (text === '') return '';
  if (text.startsWith(FSI) && text.endsWith(PDI)) return text;
  return `${FSI}${text}${PDI}`;
}
```

- [ ] **Step 4: Run the test**

Run: `cd app && npx vitest run src/app/bidi.test.ts`
Expected: PASS.

- [ ] **Step 5: Load the Arabic fonts and drive direction from the locale module**

In `app/src/app/[locale]/layout.tsx`, extend the font imports:

```ts
import { Inter, Cinzel, Vazirmatn, Amiri, Noto_Naskh_Arabic } from 'next/font/google';
```

Add after the `vazirmatn` declaration:

```ts
/** Display face for Arabic — Cinzel has no Arabic glyphs. */
const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
});

/** Body face for Arabic. Vazirmatn is Persian-optimised and stays on /fa. */
const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-naskh',
  display: 'swap',
});
```

Replace the `dir` and `fontClasses` lines in `LocaleLayout`:

```ts
  const current = toLocale(locale);
  const dir = isRtl(current) ? 'rtl' : 'ltr';

  // Per-locale font loading: /ar must not ship Vazirmatn and /fa must not ship
  // Amiri or Noto Naskh.
  const localeFonts: Record<Locale, string> = {
    en: '',
    fa: vazirmatn.variable,
    ar: `${amiri.variable} ${notoNaskhArabic.variable}`,
  };
  const fontClasses = `${inter.variable} ${cinzel.variable} ${localeFonts[current]}`;
```

and the `<html>` tag:

```tsx
    <html lang={current} dir={dir} className="dark">
```

Add the import:

```ts
import { toLocale, isRtl, BRAND, isolateLtr, type Locale } from '@/i18n/locales';
```

- [ ] **Step 6: Make the metadata and JSON-LD three-locale**

In `generateMetadata`, replace the `isFa` boolean with locale-keyed tables. The Arabic title and description must be authored, not translated from the Farsi:

```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const current = toLocale(locale);

  const titles: Record<Locale, string> = {
    en: 'TarotVeil — AI-Powered Tarot Readings That Tell Your Story',
    fa: 'تاروت‌ویل — فال تاروت آنلاین با تفسیر روایی هوش مصنوعی',
    ar: 'TarotVeil — قراءة التاروت بالذكاء الاصطناعي تحكي حكايتك',
  };

  const descriptions: Record<Locale, string> = {
    en: 'AI-powered tarot readings that weave your cards into one narrative story. Crypto-random draws, follow-up conversations, and multi-language support.',
    fa: 'فال تاروت آنلاین رایگان با تفسیر روایی هوش مصنوعی. کشیدن کارت تصادفی رمزنگاری شده، سؤالات بعدی و پشتیبانی چند زبانه.',
    ar: 'قراءة تاروت بالذكاء الاصطناعي تنسج بطاقاتك في حكاية واحدة. سحبٌ عشوائي مُعمّى، وأسئلة متابعة، ودعم لعدة لغات.',
  };

  const keywords: Record<Locale, string[]> = {
    en: ['tarot reading', 'AI tarot', 'online tarot', 'tarot card reading', 'free tarot reading', 'narrative tarot', 'tarot spread', 'three card tarot', 'celtic cross tarot', 'tarot interpretation'],
    fa: ['فال تاروت', 'فال تاروت آنلاین', 'فال تاروت رایگان', 'معنی کارت تاروت', 'تاروت با هوش مصنوعی', 'فال تاروت عشق', 'فال تاروت بله یا خیر', 'تاروت روزانه', 'fal tarot', 'tarot farsi'],
    ar: ['قراءة التاروت', 'تاروت مجاني', 'قراءة التاروت أونلاين', 'معاني بطاقات التاروت', 'تاروت بالذكاء الاصطناعي', 'تاروت الحب', 'تاروت نعم أو لا', 'تاروت يومي', 'انتشار التاروت', 'تفسير التاروت'],
  };

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: titles[current],
      // Isolation is needed only where a LATIN wordmark sits inside RTL text.
      // Farsi's brand is already Arabic script, so isolating it would add
      // invisible control characters to an indexed title for no benefit — see
      // brandForTitle in locales.ts.
      template: `%s | ${brandForTitle(current)}`,
    },
    description: descriptions[current],
    keywords: keywords[current],
    authors: [{ name: 'TarotVeil' }],
    // … keep the remaining existing fields unchanged
    category: 'entertainment',
  };
}
```

In `buildJsonLd`, replace the two `locale === 'fa'` conditionals:

```ts
function buildJsonLd(locale: string) {
  const current = toLocale(locale);
  const pageUrl = current === 'en' ? siteUrl : `${siteUrl}/${current}`;

  const siteDescriptions: Record<Locale, string> = {
    en: 'AI-powered narrative tarot readings with conversational depth.',
    fa: 'فال تاروت آنلاین با تفسیر روایی هوش مصنوعی — داستانی از کل کارت‌های شما.',
    ar: 'قراءة تاروت روائية بالذكاء الاصطناعي — حكاية تنسجها بطاقاتك كلّها.',
  };
  // … then use pageUrl, siteDescriptions[current], and inLanguage: current
  //     in the existing @graph, leaving Organization and SoftwareApplication
  //     as they are.
}
```

- [ ] **Step 7: Add the Arabic font stack to globals.css**

Replace the Farsi font-override block at `app/src/app/globals.css:112-121` with per-locale rules. The `[dir="rtl"]` fallback stays for anything not locale-tagged, but `[lang]` rules must come after it so they win:

```css
/* RTL fallback — applies to any RTL locale that has no specific stack below. */
[dir="rtl"] .font-body {
  font-family: var(--font-vazirmatn), var(--font-inter), system-ui, sans-serif;
}

[dir="rtl"] .font-display {
  font-family: var(--font-vazirmatn), var(--font-cinzel), serif;
}

/* Farsi — Vazirmatn is Persian-optimised. */
[lang="fa"] .font-body {
  font-family: var(--font-vazirmatn), var(--font-inter), system-ui, sans-serif;
}

[lang="fa"] .font-display {
  font-family: var(--font-vazirmatn), var(--font-cinzel), serif;
}

/* Arabic — Amiri carries the literary register; Noto Naskh keeps small UI
   text legible. Cinzel has no Arabic glyphs, so it is only a last resort. */
[lang="ar"] .font-body {
  font-family: var(--font-noto-naskh), var(--font-inter), system-ui, sans-serif;
}

[lang="ar"] .font-display {
  font-family: var(--font-amiri), var(--font-noto-naskh), serif;
}
```

- [ ] **Step 8: Verify in the browser**

Run: `cd app && npm run dev`

Then check, with the browser's computed-style inspector:
- `/ar` renders right-to-left, `<html lang="ar" dir="rtl">`.
- A `.font-display` heading on `/ar` computes to Amiri; `.font-body` computes to Noto Naskh Arabic.
- `/fa` still computes to Vazirmatn for both.
- View source on `/ar`: no `--font-vazirmatn` in the body class. View source on `/fa`: no `--font-amiri`.
- The browser tab title on an Arabic sub-page shows the separator and `TarotVeil` in the written order, not reordered.

- [ ] **Step 9: Verify and commit**

Run: `cd app && npm run verify`
Expected: PASS.

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git add app/src/i18n/locales.ts app/src/app/bidi.test.ts "app/src/app/[locale]/layout.tsx" app/src/app/globals.css
git commit -m "feat(i18n): Arabic rendering — Amiri/Noto Naskh, dir, metadata

Fonts load per locale so /ar does not ship Vazirmatn and /fa does not
ship Amiri. Cinzel has no Arabic glyphs, so Arabic display text needed a
real face rather than a fallback.

isolateLtr bidi-isolates the Latin wordmark: '%s | TarotVeil' otherwise
renders the separator on the wrong side in RTL."
```

---

### Task 8: Locale-aware components and API routes

**Files:**
- Modify: `app/src/components/reading/ReadingLoadingAnimation.tsx:5-29`
- Modify (prop unions `'en' | 'fa'` → `Locale`): `app/src/components/reading/FollowUpChat.tsx:20`, `SpreadSelector.tsx:10`, `ReadingFilters.tsx:17`, `FreeReadingClient.tsx:40,42,48`, `ReadingTimeline.tsx:9`, `app/src/components/tarot/CardFace.tsx:9`, `Card.tsx:21`, `SpreadLayout.tsx:12,149,185`, `app/src/components/billing/PricingTable.tsx:5`
- Modify: `app/src/app/api/reading/route.ts:38-41`, `api/reading/free/route.ts:15-18`, `api/reading/[id]/follow-up/route.ts:53-56`
- Modify: `app/src/app/[locale]/(app)/reading/new/page.tsx:46,359`, `(app)/reading/[id]/page.tsx:40`
- Modify: `app/src/app/[locale]/(app)/dashboard/page.tsx:39-90`, `(marketing)/daily/page.tsx:41-90`
- Modify: `app/src/app/[locale]/(marketing)/reading/free/page.tsx:22,45`
- Create: `app/src/app/api/reading/language.test.ts`

**Interfaces:**
- Consumes: `Locale`, `toLocale`, `BRAND`, `HTML_LANG` from `@/i18n/locales`; `resolveReadingLanguage` is created here.
- Produces: `resolveReadingLanguage(params: { requestLanguage?: string; urlLocale?: string; profileLanguage?: string }): Locale`, exported from `app/src/lib/ai/language.ts`.

- [ ] **Step 1: Write the failing test**

Create `app/src/app/api/reading/language.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resolveReadingLanguage } from '@/lib/ai/language';

// Review Focus 3: a user with profile.language 'ar' browsing /en currently
// gets an Arabic interpretation inside an English page, because the API reads
// `requestLanguage || profile?.language`. The URL locale must win.
describe('resolveReadingLanguage', () => {
  it('prefers an explicit request language', () => {
    expect(resolveReadingLanguage({ requestLanguage: 'ar', urlLocale: 'en', profileLanguage: 'fa' })).toBe('ar');
  });

  it('prefers the URL locale over the stored profile language', () => {
    expect(resolveReadingLanguage({ urlLocale: 'en', profileLanguage: 'ar' })).toBe('en');
    expect(resolveReadingLanguage({ urlLocale: 'ar', profileLanguage: 'en' })).toBe('ar');
  });

  it('falls back to the profile language when no URL locale is known', () => {
    expect(resolveReadingLanguage({ profileLanguage: 'ar' })).toBe('ar');
  });

  it('defaults to English when nothing is supplied', () => {
    expect(resolveReadingLanguage({})).toBe('en');
  });

  it('ignores unsupported values at every level', () => {
    expect(resolveReadingLanguage({ requestLanguage: 'de', urlLocale: 'ar' })).toBe('ar');
    expect(resolveReadingLanguage({ requestLanguage: 'de', profileLanguage: 'ru' })).toBe('en');
    expect(resolveReadingLanguage({ requestLanguage: 'ar-SA' })).toBe('en');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npx vitest run src/app/api/reading/language.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/ai/language"`.

- [ ] **Step 3: Write the resolver**

Create `app/src/lib/ai/language.ts`:

```ts
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/i18n/locales';

function supported(value: string | undefined | null): Locale | undefined {
  return (LOCALES as readonly string[]).includes(value ?? '') ? (value as Locale) : undefined;
}

/**
 * Decide which language a reading is generated in.
 *
 * Precedence: an explicit request body value, then the locale of the page the
 * reader is on, then their stored preference, then English.
 *
 * The URL beats the stored profile deliberately. Someone reading /en with
 * `language: 'ar'` saved is reading English right now, and an Arabic
 * interpretation inside an English page is worse than ignoring the preference.
 */
export function resolveReadingLanguage(params: {
  requestLanguage?: string;
  urlLocale?: string;
  profileLanguage?: string;
}): Locale {
  return (
    supported(params.requestLanguage) ??
    supported(params.urlLocale) ??
    supported(params.profileLanguage) ??
    DEFAULT_LOCALE
  );
}
```

- [ ] **Step 4: Run the test**

Run: `cd app && npx vitest run src/app/api/reading/language.test.ts`
Expected: PASS.

- [ ] **Step 5: Adopt the resolver in the three API routes**

In `app/src/app/api/reading/route.ts`, change the body type and the coercion:

```ts
    language?: string;
```

```ts
  const language = resolveReadingLanguage({
    requestLanguage: requestLanguage,
    profileLanguage: profile?.language,
  });
```

with `import { resolveReadingLanguage } from '@/lib/ai/language';`. Apply the same change in `api/reading/free/route.ts` and `api/reading/[id]/follow-up/route.ts`. The client already posts its locale as `language`, which is the URL locale, so it arrives as `requestLanguage` and wins.

- [ ] **Step 6: Widen the component prop unions**

In each of the files listed under **Files**, replace `'en' | 'fa'` with `Locale` and add `import type { Locale } from '@/i18n/locales';`. For example, in `app/src/components/tarot/Card.tsx:21`:

```ts
  language?: Locale;
```

In `FreeReadingClient.tsx`, the inline loading string at line 42 is a bilingual ternary. Replace it with a locale table:

```tsx
const LOADING_TEXT: Record<Locale, string> = {
  en: 'Loading your reading...',
  fa: 'در حال بارگذاری...',
  ar: 'جارٍ تحضير قراءتك...',
};

export default function FreeReadingClient({ language = 'en' }: { language?: Locale }) {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-12 text-center text-stone-400">{LOADING_TEXT[language]}</div>}>
```

In the three page files that coerce (`reading/new/page.tsx:46`, `reading/[id]/page.tsx:40`, `reading/free/page.tsx:45`), replace `(locale === 'fa' ? 'fa' : 'en') as 'en' | 'fa'` with `toLocale(locale)`. At `reading/new/page.tsx:359`, replace the `language === 'fa' ? 'خوانش شما' : 'Your Reading'` ternary with a locale table alongside the others, Arabic value `'قراءتك'`. At `reading/free/page.tsx:22`, replace the brand ternary with `BRAND[toLocale(locale)]`.

- [ ] **Step 7: Give the loading animation Arabic messages**

In `app/src/components/reading/ReadingLoadingAnimation.tsx`, replace the two arrays and the selector with one table:

```tsx
import type { Locale } from '@/i18n/locales';

const MESSAGES: Record<Locale, string[]> = {
  en: [
    'Sensing the energy of your cards...',
    'Reading the connections between them...',
    'Weaving your narrative...',
    'The story is taking shape...',
    'Almost ready to reveal your reading...',
  ],
  fa: [
    '...در حال حس کردن انرژی کارت‌های شما',
    '...در حال خواندن ارتباط بین آن‌ها',
    '...در حال بافتن روایت شما',
    '...داستان شما در حال شکل‌گیری است',
    '...تقریباً آماده است تا خوانش شما آشکار شود',
  ],
  ar: [
    '...نتحسّس طاقة بطاقاتك',
    '...نقرأ الروابط التي تجمعها',
    '...ننسج حكايتك',
    '...الحكاية تتشكّل الآن',
    '...أوشكت قراءتك أن تتكشّف',
  ],
};

interface ReadingLoadingAnimationProps {
  cardCount: number;
  language: Locale;
}
```

and in the component body:

```tsx
  const messages = MESSAGES[language];
```

- [ ] **Step 8: Move the dashboard and daily inline copy into messages**

`dashboard/page.tsx` has an `isFA` boolean driving two ternaries plus `spreadLabels` and `topicLabels` maps; `daily/page.tsx` has seven. These are UI strings that belong in the message bundles.

For each one, add a key to the matching namespace in all three of `en.json`, `fa.json`, and `ar.json` (the parity test from Task 6 enforces that you touch all three), then read it via `getTranslations`. The parity test asserts a key-count floor rather than an exact count, so adding keys here is expected and does not require editing that test. Replace the date formatting:

```ts
  const today = new Date().toLocaleDateString(HTML_LANG[current], { month: 'long', day: 'numeric', year: 'numeric' });
```

and in `dashboard/page.tsx`, the `date.toLocaleDateString('fa-IR')` / bare `toLocaleDateString()` branches become a single `date.toLocaleDateString(HTML_LANG[current])`.

Delete the `isFA` / `isFa` locals once nothing reads them.

- [ ] **Step 8b: Make the English and Farsi copy true again**

Shipping Arabic falsifies copy that already exists in the other two bundles. Fix these four values — the claims are user-facing and will be wrong the moment Arabic deploys:

| File | Key | Problem |
|---|---|---|
| `en.json` | `landing.faqA4` | Says "TarotVeil currently supports English and Farsi, **with Arabic coming soon**." Arabic now ships. |
| `fa.json` | `landing.faqA4` | Same claim in Farsi (`و عربی به‌زودی اضافه خواهد شد`). |
| `en.json` | `about.multiLangP1` | Lists only "English and Farsi (Persian)"; should include Arabic. |
| `fa.json` | `about.multiLangP1` | Same omission. |

Rewrite each so all three languages are named as supported, keeping the surrounding "culturally native, not just translated" point intact. The Arabic values were already written correctly in Task 6.

Note `premiumDesc` in both bundles already says "English + Farsi + Arabic" — it has been contradicting `faqA4` all along, and becomes correct on its own once you fix `faqA4`.

These are message-bundle values only; they do not touch `prompts.ts`, so the freeze gate is unaffected.

- [ ] **Step 9: Verify and commit**

Run: `cd app && npm run verify`
Expected: PASS, including the Task 6 parity test over the keys added in step 8.

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git add app/src/lib/ai/language.ts app/src/app/api/reading/language.test.ts app/src/components app/src/app/api "app/src/app/[locale]/(app)" "app/src/app/[locale]/(marketing)" app/src/messages
git commit -m "feat(i18n): locale-aware components, API routes and inline copy

The 'en' | 'fa' prop unions become Locale, and the coercion ternaries
become toLocale.

resolveReadingLanguage makes the URL locale beat the stored profile
language: someone on /en with language 'ar' saved was getting an Arabic
interpretation inside an English page.

Inline bilingual ternaries in dashboard and daily move into the message
bundles, and date formatting goes through HTML_LANG so Arabic renders
Latin digits."
```

---

### Task 9: Three-locale language switcher and settings

**Files:**
- Modify: `app/src/components/layout/Header.tsx:37-41` and the switcher button markup
- Modify: `app/src/app/[locale]/(app)/settings/page.tsx:70-74`

**Interfaces:**
- Consumes: `LOCALES`, `LOCALE_LABELS`, `toLocale` from `@/i18n/locales`; `trackLanguageSwitch` from `@/lib/analytics/events`.
- Produces: no new exports.

- [ ] **Step 1: Replace the two-way toggle with a dropdown**

In `app/src/components/layout/Header.tsx`, delete `toggleLanguage` and add:

```tsx
  const [langOpen, setLangOpen] = useState(false);

  function switchLanguage(next: Locale) {
    setLangOpen(false);
    if (next === locale) return;
    trackLanguageSwitch(locale, next);
    router.replace(pathname, { locale: next });
  }
```

with `import { LOCALES, LOCALE_LABELS, toLocale, type Locale } from '@/i18n/locales';`.

Replace the existing language button with a dropdown. Keep the surrounding Tailwind classes consistent with the neighbouring nav items:

```tsx
<div className="relative">
  <button
    onClick={() => setLangOpen(!langOpen)}
    className="text-sm text-gray-300 hover:text-amber-400 transition-colors px-2 py-1"
    aria-haspopup="listbox"
    aria-expanded={langOpen}
    aria-label="Change language"
  >
    {LOCALE_LABELS[toLocale(locale)]}
  </button>
  {langOpen && (
    <ul
      role="listbox"
      className="absolute end-0 mt-1 min-w-[8rem] rounded border border-white/10 bg-black/95 py-1 shadow-lg z-50"
    >
      {LOCALES.map((candidate) => (
        <li key={candidate}>
          <button
            role="option"
            aria-selected={candidate === locale}
            onClick={() => switchLanguage(candidate)}
            className={`block w-full px-3 py-1.5 text-start text-sm transition-colors hover:text-amber-400 ${
              candidate === locale ? 'text-amber-400' : 'text-gray-300'
            }`}
          >
            {LOCALE_LABELS[candidate]}
          </button>
        </li>
      ))}
    </ul>
  )}
</div>
```

Use the logical properties `end-0` and `text-start` rather than `right-0`/`text-left` so the menu aligns correctly in RTL.

- [ ] **Step 2: Add Arabic to the settings select**

In `app/src/app/[locale]/(app)/settings/page.tsx`, replace the hardcoded option list with one derived from `LOCALES`:

```tsx
{LOCALES.map((candidate) => (
  <option key={candidate} value={candidate}>
    {LOCALE_LABELS[candidate]}
  </option>
))}
```

`profile.language` is `TEXT` with no CHECK constraint, so `'ar'` persists with no migration.

- [ ] **Step 3: Verify in the browser**

Run: `cd app && npm run dev`

Check:
- The header dropdown lists English / فارسی / العربية and switches between all three, preserving the current path (`/spreads` → `/ar/spreads`).
- On `/ar`, the dropdown opens aligned to the correct side.
- Settings saves `ar` and the saved value survives a reload.

- [ ] **Step 4: Verify and commit**

Run: `cd app && npm run verify`
Expected: PASS.

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git add app/src/components/layout/Header.tsx "app/src/app/[locale]/(app)/settings/page.tsx"
git commit -m "feat(i18n): three-locale switcher and settings option

The two-way en/fa toggle cannot express three locales, so it becomes a
dropdown driven by LOCALES. Logical properties (end-0, text-start) keep
it aligned in RTL.

profile.language is TEXT with no CHECK, so persisting 'ar' needs no
migration."
```

---

### Task 10: hreflang, sitemap, and the Phase 2 gate on card-meaning routes

**Files:**
- Modify: `app/src/lib/seo/alternates.ts`
- Create: `app/src/lib/seo/alternates.test.ts`
- Modify: `app/src/app/sitemap.ts`
- Create: `app/src/app/sitemap.test.ts`
- Modify: `app/src/app/[locale]/(marketing)/tarot-card-meanings/page.tsx`, `[slug]/page.tsx`, `major-arcana/page.tsx`, `suit-of-cups/page.tsx`, `suit-of-swords/page.tsx`, `suit-of-wands/page.tsx`, `suit-of-pentacles/page.tsx`
- Modify: `app/src/components/layout/Header.tsx`, `Footer.tsx` (hide card-meaning links for `ar`)

**Interfaces:**
- Consumes: `LOCALES`, `toLocale`, `type Locale` from `@/i18n/locales`.
- Produces: `buildAlternates(path: string, locale?: string, options?: { locales?: readonly Locale[] })`; `CARD_CONTENT_LOCALES: readonly Locale[]` exported from `@/lib/seo/alternates`.

- [ ] **Step 1: Write the failing test**

Create `app/src/lib/seo/alternates.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildAlternates, CARD_CONTENT_LOCALES } from './alternates';

const SITE = 'https://www.tarotveil.com';

describe('buildAlternates', () => {
  it('emits one language entry per locale plus x-default', () => {
    const { languages } = buildAlternates('/spreads');
    expect(languages).toEqual({
      en: `${SITE}/spreads`,
      fa: `${SITE}/fa/spreads`,
      ar: `${SITE}/ar/spreads`,
      'x-default': `${SITE}/spreads`,
    });
  });

  it('self-references the canonical for each locale', () => {
    expect(buildAlternates('/spreads', 'en').canonical).toBe(`${SITE}/spreads`);
    expect(buildAlternates('/spreads', 'fa').canonical).toBe(`${SITE}/fa/spreads`);
    expect(buildAlternates('/spreads', 'ar').canonical).toBe(`${SITE}/ar/spreads`);
  });

  it('normalises the root path so no double slash appears', () => {
    const { canonical, languages } = buildAlternates('/', 'ar');
    expect(canonical).toBe(`${SITE}/ar`);
    expect(languages.en).toBe(`${SITE}/`);
    expect(canonical).not.toContain('//ar');
  });

  it('falls back to English for an unknown locale', () => {
    expect(buildAlternates('/spreads', 'de').canonical).toBe(`${SITE}/spreads`);
  });

  // The Phase 2 gate: Arabic card-meaning routes 404, so advertising an ar
  // hreflang for them would point crawlers at a dead URL.
  it('omits locales outside the given subset', () => {
    const { languages } = buildAlternates('/tarot-card-meanings', 'en', {
      locales: CARD_CONTENT_LOCALES,
    });
    expect(languages).toEqual({
      en: `${SITE}/tarot-card-meanings`,
      fa: `${SITE}/fa/tarot-card-meanings`,
      'x-default': `${SITE}/tarot-card-meanings`,
    });
    expect(languages).not.toHaveProperty('ar');
  });

  it('excludes Arabic from card content until Phase 2', () => {
    expect(CARD_CONTENT_LOCALES).toEqual(['en', 'fa']);
  });
});
```

Create `app/src/app/sitemap.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';

describe('sitemap', () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it('includes Arabic URLs for Phase 1 routes', () => {
    expect(urls).toContain('https://www.tarotveil.com/ar');
    expect(urls).toContain('https://www.tarotveil.com/ar/reading/free');
    expect(urls).toContain('https://www.tarotveil.com/ar/spreads');
  });

  // Arabic card-meaning pages 404 in Phase 1. Listing them would feed Search
  // Console a set of soft-404s and burn crawl budget on the ar namespace.
  it('lists no Arabic card-meaning URLs', () => {
    const arabicCardUrls = urls.filter((u) => u.startsWith('https://www.tarotveil.com/ar/tarot-card-meanings'));
    expect(arabicCardUrls).toEqual([]);
  });

  it('still lists English and Farsi card-meaning URLs', () => {
    expect(urls).toContain('https://www.tarotveil.com/tarot-card-meanings');
    expect(urls).toContain('https://www.tarotveil.com/fa/tarot-card-meanings');
  });

  it('never advertises an ar alternate on a card-meaning entry', () => {
    for (const entry of entries) {
      if (!entry.url.includes('tarot-card-meanings')) continue;
      expect(entry.alternates?.languages, entry.url).not.toHaveProperty('ar');
    }
  });

  it('emits no duplicate URLs', () => {
    const duplicates = urls.filter((u, i) => urls.indexOf(u) !== i);
    expect(duplicates).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app && npx vitest run src/lib/seo/alternates.test.ts src/app/sitemap.test.ts`
Expected: FAIL — `CARD_CONTENT_LOCALES` is not exported and no Arabic URLs exist.

- [ ] **Step 3: Rewrite alternates.ts**

```ts
import { LOCALES, toLocale, DEFAULT_LOCALE, type Locale } from '@/i18n/locales';

const SITE_URL = 'https://www.tarotveil.com';

/**
 * Locales with authored card-meaning content.
 *
 * Arabic is absent until Phase 2 fills the `_ar` columns. Those routes return
 * 404 for `ar`, so advertising an Arabic hreflang for them would point
 * crawlers at a dead URL — worse than advertising nothing.
 */
export const CARD_CONTENT_LOCALES: readonly Locale[] = ['en', 'fa'];

function localeUrl(locale: Locale, cleanPath: string): string {
  if (locale === DEFAULT_LOCALE) {
    return cleanPath === '' ? `${SITE_URL}/` : `${SITE_URL}${cleanPath}`;
  }
  return `${SITE_URL}/${locale}${cleanPath}`;
}

/**
 * Build hreflang alternates for a page. English has no prefix; other locales
 * are prefixed. The canonical always self-references the page's own locale.
 *
 * Pass `options.locales` for a page that exists in fewer locales than the site
 * does.
 */
export function buildAlternates(
  path: string,
  locale: string = DEFAULT_LOCALE,
  options: { locales?: readonly Locale[] } = {},
) {
  // Normalise the root path to '' so we emit '/' and '/ar' rather than '//'
  // and '/ar/' — hreflang must match the live URL exactly.
  const raw = path.startsWith('/') ? path : `/${path}`;
  const cleanPath = raw === '/' ? '' : raw.replace(/\/$/, '');

  const available = options.locales ?? LOCALES;
  const current = toLocale(locale);
  const effective = available.includes(current) ? current : DEFAULT_LOCALE;

  const languages: Record<string, string> = {};
  for (const candidate of available) {
    languages[candidate] = localeUrl(candidate, cleanPath);
  }
  languages['x-default'] = localeUrl(DEFAULT_LOCALE, cleanPath);

  return { canonical: localeUrl(effective, cleanPath), languages };
}
```

- [ ] **Step 4: Make the sitemap three-locale with a per-path locale set**

In `app/src/app/sitemap.ts`, give `withAlternates` an optional locale list:

```ts
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/i18n/locales';
import { CARD_CONTENT_LOCALES } from '@/lib/seo/alternates';

function withAlternates(
  path: string,
  entry: Omit<MetadataRoute.Sitemap[0], 'url'>,
  locales: readonly Locale[] = LOCALES,
): MetadataRoute.Sitemap {
  const urlFor = (locale: Locale) =>
    locale === DEFAULT_LOCALE
      ? (path === '' ? `${baseUrl}/` : `${baseUrl}${path}`)
      : `${baseUrl}/${locale}${path}`;

  const languages: Record<string, string> = { 'x-default': urlFor(DEFAULT_LOCALE) };
  for (const locale of locales) languages[locale] = urlFor(locale);

  return locales.map((locale) => ({ url: urlFor(locale), ...entry, alternates: { languages } }));
}
```

Then pass `CARD_CONTENT_LOCALES` as the third argument to every `withAlternates` call whose path starts with `/tarot-card-meanings` — the master hub, the five sub-hubs, and the 78 card slugs. Leave every other call on the default three locales.

- [ ] **Step 5: Gate the Arabic card-meaning routes**

In each of the seven card-meaning page files, add the Arabic gate immediately after the locale is read. For `tarot-card-meanings/page.tsx`:

```ts
import { notFound } from 'next/navigation';
import { toLocale } from '@/i18n/locales';
import { CARD_CONTENT_LOCALES } from '@/lib/seo/alternates';

// Arabic card content lands in Phase 2. Until then these routes would render
// English card text under an /ar/ URL, which is duplicate content in the
// Arabic namespace.
if (!CARD_CONTENT_LOCALES.includes(toLocale(locale))) notFound();
```

In `generateMetadata` for those same files, pass the subset so the page never advertises an `ar` alternate:

```ts
    alternates: buildAlternates('/tarot-card-meanings', locale, { locales: CARD_CONTENT_LOCALES }),
```

In `[slug]/page.tsx:141`, the redirect hardcodes the Farsi prefix. Replace:

```ts
    if (!fb || !deckCard) redirect(locale === 'fa' ? '/fa/tarot-card-meanings' : '/tarot-card-meanings');
```

with a locale-derived prefix:

```ts
    if (!fb || !deckCard) {
      const current = toLocale(locale);
      redirect(current === 'en' ? '/tarot-card-meanings' : `/${current}/tarot-card-meanings`);
    }
```

Also set `generateStaticParams` for `[slug]` to emit only `CARD_CONTENT_LOCALES`, so Next does not prerender 78 Arabic pages that immediately 404.

- [ ] **Step 6: Hide the card-meaning nav links for Arabic**

In `Header.tsx` and `Footer.tsx`, wrap each `/tarot-card-meanings` link so it only renders when the locale has card content:

```tsx
{CARD_CONTENT_LOCALES.includes(toLocale(locale)) && (
  <NavLink href="/tarot-card-meanings" current={pathname} label={t('cardMeanings')} />
)}
```

A visible link to a 404 is worse than an absent one.

- [ ] **Step 7: Run the tests**

Run: `cd app && npx vitest run src/lib/seo/alternates.test.ts src/app/sitemap.test.ts`
Expected: PASS.

- [ ] **Step 8: Verify and commit**

Run: `cd app && npm run verify`
Expected: PASS.

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git add app/src/lib/seo app/src/app/sitemap.ts app/src/app/sitemap.test.ts "app/src/app/[locale]/(marketing)/tarot-card-meanings" app/src/components/layout
git commit -m "feat(seo): three-locale hreflang; gate Arabic card pages to Phase 2

buildAlternates loops LOCALES and takes an optional locale subset, so a
page can exist in fewer locales than the site.

Arabic card-meaning routes 404, are absent from the sitemap, advertise no
ar hreflang, and their nav links are hidden. Without the gate they would
serve English card content under /ar/ URLs — duplicate content in the
Arabic namespace before Phase 2 ships."
```

---

### Task 11: End-to-end verification and deploy

**Files:** none modified. This task produces a verification record.

- [ ] **Step 1: Full green build**

Run:

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot/app"
npm run verify && npm run build
```

Expected: `tsc` clean, all tests pass, prompt freeze reports zero changed and zero removed prompts, production build succeeds.

- [ ] **Step 2: Confirm the snapshot was never re-frozen**

Run:

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git log --oneline -- execution/prompt-freeze.snapshot.json
```

Expected: no commits from this branch. If the snapshot was modified, an existing English or Farsi prompt changed somewhere and the drift was absorbed rather than fixed — investigate before deploying.

- [ ] **Step 2b: Freeze the Arabic prompts — the one deliberate re-freeze**

Through Task 10 the gate *allows* the 69 Arabic keys without *recording* them. That means Arabic reading voice is unprotected: a later refactor could change it and the gate would stay silent. Record them now, once, deliberately — this is the intended-change case `--update` exists for.

```bash
node execution/prompt-freeze.mjs --update
```

Then prove the re-freeze was purely additive. This is the check that preserves everything Task 4 established:

```bash
git diff --numstat execution/prompt-freeze.snapshot.json
```

Expected: insertions only, **zero deletions**. A non-zero deletion count means an existing English or Farsi hash was rewritten — in that case `git checkout execution/prompt-freeze.snapshot.json` to discard the re-freeze, and investigate, because an en/fa prompt has drifted somewhere in Tasks 5-10.

Confirm the recorded set is complete, then commit the snapshot on its own:

```bash
node execution/prompt-freeze.mjs    # expect: 207 prompts match, 0 new
git add execution/prompt-freeze.snapshot.json
git commit -m "chore(ai): freeze the Arabic prompts

Adding a locale is the intended-change case for a re-freeze. Verified
additive: the snapshot diff is insertions only, so every English and
Farsi hash Task 4 proved unchanged is still unchanged."
```

- [ ] **Step 3: Manual Arabic pass**

Run `cd app && npm run dev`, then walk through and confirm each:

- `/ar` renders RTL with Arabic type, no Latin prose outside the `TarotVeil` wordmark.
- The tab title separator renders in written order, not reordered.
- `/ar/spreads`, `/ar/love-tarot`, `/ar/career-tarot`, `/ar/yes-or-no`, `/ar/about`, `/ar/daily` all render fully in Arabic with no English fragments.
- `/ar/reading/free` runs a complete reading: the loading animation shows Arabic messages, and the interpretation is Arabic prose, not a list.
- Signed in: `/ar/reading/new` produces an Arabic reading; a follow-up question is answered in Arabic.
- `/ar/dashboard` shows Arabic labels and Latin digits in dates.
- `/ar/tarot-card-meanings` and `/ar/tarot-card-meanings/the-fool` both 404; the nav shows no card-meanings link on `/ar`.
- `/en` and `/fa` are unchanged throughout.

- [ ] **Step 4: Read one Arabic reading closely**

Generate a Celtic Cross reading on `/ar` and read it against the Global Constraints:

- One woven narrative, not a card-by-card walk.
- No deterministic prediction (`ستفعل`, `سيحدث`, `توقّع`).
- No Persian letters (پ چ ژ گ ک ی) and no Persian loan phrasing.
- Register is warm, not news-broadcast formal.
- Address stays **أنت** throughout.

Paste the reading through `FORBIDDEN_PATTERNS_AR` and confirm no pattern fires:

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot/app"
node -e "
const { FORBIDDEN_PATTERNS_AR } = require('./src/lib/ai/prompts.ts');
" 2>/dev/null || echo "Use the reading-quality-check skill, or a scratch vitest case, to run the patterns over the pasted text."
```

If a pattern fires, the Arabic prompt's voice constraints need tightening — fix `VOICE_CONSTRAINTS.ar` rather than loosening the pattern.

- [ ] **Step 5: Deploy and submit to IndexNow**

Push to deploy via Vercel, then:

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
node execution/indexnow-submit.mjs
```

- [ ] **Step 6: Verify the deployed hreflang**

Fetch the live sitemap and confirm Arabic URLs appear for Phase 1 routes and not for card-meaning routes:

```bash
curl -s https://www.tarotveil.com/sitemap.xml | grep -c '/ar/'
curl -s https://www.tarotveil.com/sitemap.xml | grep -c '/ar/tarot-card-meanings'
```

Expected: the first count is greater than zero; the second is exactly `0`.

- [ ] **Step 7: Update the project docs**

`CLAUDE.md` lists Arabic under i18n, which was aspirational and is now true for Phase 1. Add a line to the i18n row noting that Arabic card-meaning pages arrive in Phase 2, and record the Phase 2 scope in `directives/core-business-rules.md` if that is where deferred work is tracked. Commit:

```bash
cd "/Users/amir/Desktop/My Projects/AI Tarot"
git add CLAUDE.md AGENTS.md GEMINI.md directives
git commit -m "docs: record Arabic Phase 1 as shipped, Phase 2 as pending"
```

---

### Task 12: Arabic copy in the reading flow

**Runs before Task 11**, not after. It is numbered 12 only because it was added after the plan was written; Task 11 is the final verification and must stay last.

**Why this task exists.** Tasks 1-8 left the core reading flow serving Farsi to Arabic users. Four files hold large inline bilingual blocks keyed on a single boolean, `const en = language === 'en'`, so every non-English locale takes the Farsi branch. Verified live: `/ar/reading/free?topic=love` serves Persian on an Arabic page, 13 Persian-letter occurrences. Widening the type unions in Task 8 exposed this rather than causing it, since `'ar'` was previously unreachable in those branches.

This defeats the spec's Phase 1 goal — "an Arabic speaker can land, draw, and receive a genuine Arabic narrative reading end to end" — so it is not deferrable to Phase 2.

**Files:**
- Modify: `app/src/app/[locale]/(app)/reading/new/page.tsx` (19 `en ?` ternaries + the `TOPICS` array's `titleFA`/`descFA` fields)
- Modify: `app/src/components/reading/FreeReadingClient.tsx` (11 ternaries + the `TOPIC_CONFIG` record's `titleFA`/`subtitleFA`/`placeholderFA`/`labelFA` fields)
- Modify: `app/src/components/reading/FollowUpChat.tsx` (19 ternaries, two `const en` locals at lines 66 and 422)
- Modify: `app/src/app/[locale]/(app)/reading/[id]/page.tsx` (1 ternary)
- Modify: `app/src/messages/en.json`, `fa.json`, `ar.json`

**Interfaces:**
- Consumes: `Locale`, `toLocale` from `@/i18n/locales`; `useTranslations`/`getTranslations` from next-intl.
- Produces: no new exports. The deliverable is that no `en ?` ternary and no `*FA` field remains in these four files.

**Approach - move the copy into the message bundles, do not add a third branch.**

A `language === 'ar' ? x : en ? y : z` three-way ternary would work and is the wrong answer: it triples the inline prose, keeps Arabic coverage unenforced, and the next locale makes it worse. Task 8 established the pattern - UI copy lives in the bundles - and the parity test then guarantees Arabic coverage mechanically instead of by inspection.

So: for each string, add a key to the appropriate existing namespace (`reading`, `freeReading`) in all three bundles, copying the existing English and Farsi values **verbatim** from the inline code, and authoring the Arabic. Then read it through `useTranslations` (client components) or `getTranslations` (server components), following the pattern the 24 marketing pages already use.

`TOPICS` and `TOPIC_CONFIG` keep their structural fields (`key`, `symbol`) and lose their text fields, which become message lookups keyed by topic.

- [ ] **Step 1: Inventory the strings**

Before changing anything, list every string you will move: file, line, the English value, the Farsi value, and the message key you will give it. Put this table in your report. It is the checklist that makes the rest verifiable, and it is how a reviewer confirms nothing was dropped.

- [ ] **Step 2: Add the keys to all three bundles**

Copy English and Farsi verbatim - a retyped Farsi string is a silent content regression on a live locale. Author the Arabic in warm MSA, matching the terminology already committed (`انتشار` for a spread, `السائل` for the querent, `مستقيمة`/`معكوسة` for orientation).

Run `cd app && npx vitest run src/messages/parity.test.ts` - it fails until all three bundles carry every key, and its Persian-letter and brand assertions cover your Arabic automatically.

- [ ] **Step 3: Replace the ternaries, one file at a time**

After each file, run `cd app && npx tsc --noEmit` and confirm the file is clean before moving on. Delete each `const en = ...` local once nothing reads it.

- [ ] **Step 4: Prove the Farsi did not change**

This is the step that protects the live locale. For each of `/fa/reading/free?topic=love`, `?topic=career`, `?topic=yes-or-no`, capture the rendered page before and after your change and diff them. The visible Farsi text must be identical. Read the real dev port from the server's startup output - port 3000 is occupied by another server that lacks the Arabic locale.

- [ ] **Step 5: Prove Arabic no longer serves Persian**

For each of `/ar/reading/free?topic=love`, `?topic=career`, `?topic=yes-or-no`, and `/ar/reading/new`, count Persian-only letters in the rendered HTML:

    curl -s "http://localhost:PORT/ar/reading/free?topic=love" | grep -oE "[پچژگکی]" | wc -l

Expected: `0`. Before this task that count is 13 on the love page.

- [ ] **Step 6: Verify and commit**

Run `cd app && npm run verify`. The freeze gate must still read `207 prompts match the snapshot (69 new, allowed)` - this task touches no prompt bodies. Commit with a message naming the defect, the approach, and the Farsi-unchanged evidence.

---

## Phase 2 (not in this plan)

For the follow-up spec: `_ar` DB columns and their migration, 78 cards of Arabic card-meaning content (**paid token cost — needs explicit approval per `CLAUDE.md` principle 2**), the Arabic card-meaning and sub-hub pages, an Arabic equivalent of `FARSI_NAME_VARIANTS`, Arabic keyword research, and removing the `CARD_CONTENT_LOCALES` gate.
