'use client';

import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { toLocale } from '@/i18n/locales';
import { CARD_CONTENT_LOCALES } from '@/lib/seo/alternates';

/**
 * A link to a card-meaning route that degrades to plain text where those
 * routes do not exist.
 *
 * Card-meaning routes `notFound()` for any locale outside
 * `CARD_CONTENT_LOCALES` — Arabic, until Phase 2 fills the `_ar` columns. The
 * header and footer drop their nav entries for such a locale, but ~20 further
 * links live in page bodies: card tiles on /love-tarot, sample-reading card
 * names on the spread pages, "learn more" CTAs, and the 404 page's own
 * suggestion list. Every one of them would be a visible link to a 404.
 *
 * The degradation is deliberately minimal: the same children, the same
 * `className`, wrapped in a `<span>` instead of an anchor. A card name that is
 * text instead of a link is the obvious fallback; inventing a visual
 * affordance for "this will exist in Phase 2" would be worse than silence.
 * `<span>` and `<a>` are both `display: inline` by default, so the box model
 * is unchanged and the callers' layout classes keep working.
 *
 * This is the single gate for every in-body link, so Phase 2's one-constant
 * change in `CARD_CONTENT_LOCALES` lights all of them back up at once — the
 * same property the constant already gives the routes, the sitemap and the
 * hreflang sets.
 *
 * A client component so one API serves every caller: the marketing pages are
 * server components, `HomeLanding` is a client component, and `not-found.tsx`
 * has no `params` to read a locale from. `useLocale()` works in all three
 * under the layout's `IntlProvider`, where a `locale` prop would not.
 */
export default function CardMeaningLink({
  slug,
  className,
  children,
}: {
  /** Card or sub-hub slug. Omit for the master hub. */
  slug?: string;
  className?: string;
  children: ReactNode;
}) {
  const locale = toLocale(useLocale());
  const href = slug ? `/tarot-card-meanings/${slug}` : '/tarot-card-meanings';

  if (!CARD_CONTENT_LOCALES.includes(locale)) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
