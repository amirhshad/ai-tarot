import { Metadata } from 'next';
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
  summary: string;
};

const content = cardContent as Record<string, CardData>;

export const metadata: Metadata = {
  title: 'All 78 Tarot Card Meanings — AI Tarot Guide',
  description:
    'Explore all 78 tarot card meanings with AI-powered interpretations. Major Arcana, Wands, Cups, Swords, and Pentacles. Upright and reversed meanings for every card.',
  keywords: [
    'tarot card meanings',
    'AI tarot',
    'tarot guide',
    'major arcana meanings',
    'minor arcana meanings',
    'tarot card interpretation',
    'tarot card list',
  ],
  alternates: {
    canonical: `${siteUrl}/cards`,
  },
  openGraph: {
    title: 'All 78 Tarot Card Meanings — AI Tarot Guide | TarotVeil',
    description:
      'Complete guide to all 78 tarot card meanings with AI-powered narrative interpretations.',
    url: `${siteUrl}/cards`,
  },
};

type SuitSection = {
  title: string;
  description: string;
  cards: { name: string; slug: string; image: string; summary: string }[];
};

function buildSections(): SuitSection[] {
  const majorCards = DECK.filter(c => c.arcana === 'major').map(c => {
    const slug = cardToSlug(c);
    const data = content[slug];
    return { name: c.name, slug, image: c.image, summary: data?.summary || '' };
  });

  const suits: { key: string; title: string; desc: string }[] = [
    { key: 'wands', title: 'Suit of Wands', desc: 'Fire element — creativity, passion, ambition, and willpower.' },
    { key: 'cups', title: 'Suit of Cups', desc: 'Water element — emotions, relationships, intuition, and love.' },
    { key: 'swords', title: 'Suit of Swords', desc: 'Air element — intellect, conflict, truth, and communication.' },
    { key: 'pentacles', title: 'Suit of Pentacles', desc: 'Earth element — material wealth, career, health, and stability.' },
  ];

  const suitSections = suits.map(s => ({
    title: s.title,
    description: s.desc,
    cards: DECK
      .filter(c => c.suit === s.key)
      .sort((a, b) => a.number - b.number)
      .map(c => {
        const slug = cardToSlug(c);
        const data = content[slug];
        return { name: c.name, slug, image: c.image, summary: data?.summary || '' };
      }),
  }));

  return [
    { title: 'Major Arcana', description: "The 22 trump cards representing life's major themes and spiritual lessons.", cards: majorCards },
    ...suitSections,
  ];
}

function CardGrid({ cards }: { cards: SuitSection['cards'] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map(card => (
        <Link
          key={card.slug}
          href={`/cards/${card.slug}`}
          className="group p-3 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 bg-gradient-to-b from-white/[0.01] to-transparent transition-all duration-300 text-center"
        >
          <div className="relative w-[90px] h-[150px] mx-auto mb-3 rounded overflow-hidden">
            <Image
              src={card.image}
              alt={`${card.name} tarot card`}
              fill
              sizes="90px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <p className="font-display text-sm font-medium text-stone-300 group-hover:text-gold-400 transition-colors leading-tight">
            {card.name}
          </p>
        </Link>
      ))}
    </div>
  );
}

export default function CardsIndexPage() {
  const sections = buildSections();

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All 78 Tarot Card Meanings',
    description: 'Complete guide to all 78 tarot card meanings with AI-powered interpretations.',
    url: `${siteUrl}/cards`,
    publisher: { '@type': 'Organization', name: 'TarotVeil' },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Card Meanings', item: `${siteUrl}/cards` },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Breadcrumbs */}
        <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-stone-300">Card Meanings</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-white mb-4">
            78 Tarot Card Meanings
          </h1>
          <p className="font-body text-lg font-medium text-stone-400 max-w-2xl mx-auto">
            Explore every card in the Rider-Waite-Smith deck with AI-powered narrative interpretations.
            Upright and reversed meanings, plus how each card behaves in an AI tarot reading.
          </p>
        </div>

        {/* Sections */}
        {sections.map(section => (
          <section key={section.title} className="mb-16">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-white mb-2">{section.title}</h2>
              <p className="font-body text-sm font-medium text-stone-500">{section.description}</p>
            </div>
            <CardGrid cards={section.cards} />
          </section>
        ))}

        {/* Bottom CTA */}
        <section className="text-center py-12 border-t border-gold-400/[0.06]">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">
            See the Cards Come Alive
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            Get a free AI tarot reading and experience how these cards weave together into your unique story.
          </p>
          <Link
            href="/reading/free"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            Get a Free Reading
          </Link>
        </section>
      </div>
    </>
  );
}
