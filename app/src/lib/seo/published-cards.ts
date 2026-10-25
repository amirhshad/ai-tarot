import manifest from './published-cards.json';
import type { Locale } from '@/i18n/locales';
import { DECK } from '@/lib/tarot/deck';
import { cardToSlug } from '@/lib/tarot/slugs';

/**
 * Which locales each card has authored content in — the derived index behind
 * the per-card half of the Phase 2 gate.
 *
 * Generated from the database by `execution/build-card-locale-manifest.mjs`,
 * which `generate-card-content-ar.mjs --fetch` runs after a successful write.
 * The database remains the source of card *content*; this is the source of
 * truth for what is *published*.
 *
 * It is a bundled JSON file rather than a query because the gate has to answer
 * synchronously in three places a database cannot reach:
 *
 * - `CardMeaningLink`, a **client** component gating ~20 in-body links
 * - `generateStaticParams`, at build time
 * - the hub and sub-hub card lists
 *
 * One bundled source gates every surface identically. The cost is that a
 * content write without a manifest rebuild goes unpublished — which is the safe
 * direction to fail: a card that exists but is not listed, never a listed card
 * that 404s. `--check` in CI catches the staleness.
 */
const AUTHORED = manifest as Record<string, string[]>;

/**
 * The locales this card has content in, or `undefined` for a slug the manifest
 * does not know. `undefined` means "no per-card opinion" and callers fall back
 * to the site-wide `CARD_CONTENT_LOCALES` — see `cardLocales` in `alternates`.
 */
export function authoredLocales(slug: string): readonly Locale[] | undefined {
  return AUTHORED[slug] as readonly Locale[] | undefined;
}

/** Every slug in the manifest, in deck order. */
export function allManifestSlugs(): string[] {
  return Object.keys(AUTHORED);
}

/**
 * Which cards each sub-hub lists. Derived from the same `arcana`/`suit` fields
 * `SubHubPage`'s own configs use, so the two cannot disagree about membership
 * without the deck itself changing.
 */
const SUB_HUB_MEMBERS: Record<string, (card: (typeof DECK)[number]) => boolean> = {
  'major-arcana': c => c.arcana === 'major',
  'suit-of-wands': c => c.suit === 'wands',
  'suit-of-cups': c => c.suit === 'cups',
  'suit-of-swords': c => c.suit === 'swords',
  'suit-of-pentacles': c => c.suit === 'pentacles',
};

/**
 * The locales a sub-hub has anything to list in — the union of its cards'
 * authored locales.
 *
 * A sub-hub is only as published as its contents: the Phase 2 Arabic cohort
 * contains no Wand at all, so `/ar/tarot-card-meanings/suit-of-wands` has an
 * empty list and `SubHubPage` 404s it. This is what keeps the sitemap from
 * advertising that URL — a listed 404 is worse than an unlisted page.
 *
 * Returns `undefined` for an unknown slug, which callers read as "no opinion,
 * defer to `CARD_CONTENT_LOCALES`".
 */
export function subHubAuthoredLocales(subHubSlug: string): readonly Locale[] | undefined {
  const isMember = SUB_HUB_MEMBERS[subHubSlug];
  if (!isMember) return undefined;

  const union = new Set<Locale>();
  for (const card of DECK) {
    if (!isMember(card)) continue;
    for (const locale of AUTHORED[cardToSlug(card)] ?? []) union.add(locale as Locale);
  }
  return Array.from(union);
}
