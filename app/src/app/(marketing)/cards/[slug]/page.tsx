import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import cardContent from '@/data/card-content.json';
import { DECK } from '@/lib/tarot/deck';
import { cardToSlug } from '@/lib/tarot/slugs';

const siteUrl = 'https://www.tarotveil.com';

type CardData = {
  id: number;
  name: string;
  slug: string;
  arcana: string;
  suit: string | null;
  number: number;
  keywords: string[];
  upright: string;
  reversed: string;
  inReading: string;
  summary: string;
};

const content = cardContent as Record<string, CardData>;

function getRelatedCards(card: CardData): { name: string; slug: string; image: string }[] {
  const deckCard = DECK.find(c => c.id === card.id);
  if (!deckCard) return [];

  const related: typeof DECK = [];

  if (card.arcana === 'major') {
    // Previous and next Major Arcana
    const prev = DECK.find(c => c.arcana === 'major' && c.number === card.number - 1);
    const next = DECK.find(c => c.arcana === 'major' && c.number === card.number + 1);
    if (prev) related.push(prev);
    if (next) related.push(next);
    // Add a thematic minor card (same number from first suit)
    const thematic = DECK.find(c => c.arcana === 'minor' && c.number === (card.number % 14) + 1);
    if (thematic) related.push(thematic);
  } else {
    // Same suit neighbors
    const suitCards = DECK.filter(c => c.suit === card.suit).sort((a, b) => a.number - b.number);
    const idx = suitCards.findIndex(c => c.id === card.id);
    if (idx > 0) related.push(suitCards[idx - 1]);
    if (idx < suitCards.length - 1) related.push(suitCards[idx + 1]);
    // Add a Major Arcana with shared theme
    const majorMatch = DECK.find(c => c.arcana === 'major' && c.number === card.number);
    if (majorMatch) related.push(majorMatch);
  }

  return related.slice(0, 4).map(c => ({
    name: c.name,
    slug: cardToSlug(c),
    image: c.image,
  }));
}

export function generateStaticParams() {
  return Object.keys(content).map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const card = content[params.slug];
  if (!card) return {};

  const title = `${card.name} Tarot Card Meaning | AI Tarot Interpretation`;
  const description = `Discover the ${card.name} meaning in AI tarot readings. ${card.summary} Explore upright & reversed interpretations at TarotVeil.`;

  return {
    title,
    description,
    keywords: [
      `${card.name.toLowerCase()} tarot`,
      `${card.name.toLowerCase()} meaning`,
      `${card.name.toLowerCase()} tarot card`,
      'AI tarot',
      'tarot card meaning',
      ...card.keywords,
    ],
    alternates: {
      canonical: `${siteUrl}/cards/${card.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/cards/${card.slug}`,
      type: 'article',
    },
  };
}

export default function CardPage({ params }: { params: { slug: string } }) {
  const card = content[params.slug];
  if (!card) notFound();

  const deckCard = DECK.find(c => c.id === card.id);
  if (!deckCard) notFound();

  const related = getRelatedCards(card);
  const suitLabel = card.suit ? card.suit.charAt(0).toUpperCase() + card.suit.slice(1) : null;
  const arcanaLabel = card.arcana === 'major' ? 'Major Arcana' : `Minor Arcana — ${suitLabel}`;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `${card.name} Tarot Card Meaning — AI Tarot Interpretation`,
        description: card.summary,
        image: `${siteUrl}${deckCard.image}`,
        author: { '@type': 'Organization', name: 'TarotVeil' },
        publisher: { '@type': 'Organization', name: 'TarotVeil' },
        mainEntityOfPage: `${siteUrl}/cards/${card.slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Card Meanings', item: `${siteUrl}/cards` },
          { '@type': 'ListItem', position: 3, name: card.name, item: `${siteUrl}/cards/${card.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Breadcrumbs */}
        <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/cards" className="hover:text-gold-400 transition-colors">Card Meanings</Link>
          <span>/</span>
          <span className="text-stone-300">{card.name}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-10 mb-16">
          {/* Card Image */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative w-[220px] h-[370px] rounded-md overflow-hidden border border-gold-400/20">
              <Image
                src={deckCard.image}
                alt={`${card.name} tarot card — Rider-Waite-Smith deck`}
                fill
                sizes="220px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Card Info */}
          <div className="flex-1">
            <p className="text-xs tracking-[0.2em] uppercase text-gold-400/60 mb-2">
              {arcanaLabel} {card.arcana === 'major' && `· ${card.number}`}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
              {card.name} Tarot Card Meaning
            </h1>
            <p className="font-body text-lg font-medium text-stone-300 leading-relaxed mb-6">
              {card.summary}
            </p>

            {/* Keywords */}
            <div className="flex flex-wrap gap-2 mb-6">
              {card.keywords.map(keyword => (
                <span
                  key={keyword}
                  className="px-3 py-1 text-xs font-medium text-gold-400/70 border border-gold-400/15 rounded-full bg-gold-400/[0.03]"
                >
                  {keyword}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/reading/free"
              className="inline-block px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all"
            >
              Get a Free AI Reading
            </Link>
          </div>
        </div>

        {/* Upright Meaning */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">↑</span> Upright Meaning
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10">
            {card.upright}
          </div>
        </section>

        {/* Reversed Meaning */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">↓</span> Reversed Meaning
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10">
            {card.reversed}
          </div>
        </section>

        {/* In a Reading */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">✦</span> {card.name} in an AI Tarot Reading
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10">
            {card.inReading}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16 p-8 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent text-center">
          <h2 className="font-display text-xl font-semibold text-white mb-3">
            See {card.name} in Your Reading
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            Get a free AI tarot reading and discover how {card.name} connects with your unique spread.
          </p>
          <Link
            href="/reading/free"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            Get a Free Reading
          </Link>
        </section>

        {/* Related Cards */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold text-white mb-6">Related Cards</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(rel => (
                <Link
                  key={rel.slug}
                  href={`/cards/${rel.slug}`}
                  className="group p-4 rounded-sm border border-gold-400/[0.08] hover:border-gold-400/20 transition-all text-center"
                >
                  <div className="relative w-[80px] h-[130px] mx-auto mb-3 rounded overflow-hidden">
                    <Image
                      src={rel.image}
                      alt={rel.name}
                      fill
                      sizes="80px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="font-display text-sm text-stone-300 group-hover:text-gold-400 transition-colors">
                    {rel.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
