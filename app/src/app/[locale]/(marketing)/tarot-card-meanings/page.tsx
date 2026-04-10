import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { DECK } from '@/lib/tarot/deck';
import { cardToSlug } from '@/lib/tarot/slugs';
import { buildHubJsonLd } from '@/lib/seo/json-ld';

const siteUrl = 'https://www.tarotveil.com';

export const metadata: Metadata = {
  title: 'Tarot Card Meanings — Complete Guide to All 78 Cards | TarotVeil',
  description:
    'Explore all 78 tarot card meanings with AI-powered interpretations. Major Arcana, Wands, Cups, Swords, and Pentacles — upright, reversed, love, and career meanings.',
  alternates: { canonical: `${siteUrl}/tarot-card-meanings` },
  openGraph: {
    title: 'Tarot Card Meanings — Complete Guide to All 78 Cards | TarotVeil',
    description: 'Complete guide to all 78 tarot card meanings with AI-powered narrative interpretations.',
    url: `${siteUrl}/tarot-card-meanings`,
  },
};

const SECTIONS = [
  {
    key: 'major',
    title: 'Major Arcana',
    slug: 'major-arcana',
    description: "22 trump cards representing life's major themes and spiritual lessons.",
    filter: (c: (typeof DECK)[0]) => c.arcana === 'major',
  },
  {
    key: 'wands',
    title: 'Suit of Wands',
    slug: 'suit-of-wands',
    description: 'Fire element — creativity, passion, ambition, and willpower.',
    filter: (c: (typeof DECK)[0]) => c.suit === 'wands',
  },
  {
    key: 'cups',
    title: 'Suit of Cups',
    slug: 'suit-of-cups',
    description: 'Water element — emotions, relationships, intuition, and love.',
    filter: (c: (typeof DECK)[0]) => c.suit === 'cups',
  },
  {
    key: 'swords',
    title: 'Suit of Swords',
    slug: 'suit-of-swords',
    description: 'Air element — intellect, conflict, truth, and communication.',
    filter: (c: (typeof DECK)[0]) => c.suit === 'swords',
  },
  {
    key: 'pentacles',
    title: 'Suit of Pentacles',
    slug: 'suit-of-pentacles',
    description: 'Earth element — material wealth, career, health, and stability.',
    filter: (c: (typeof DECK)[0]) => c.suit === 'pentacles',
  },
];

function CardGrid({ cards }: { cards: { name: string; slug: string; image: string }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map(card => (
        <Link
          key={card.slug}
          href={`/tarot-card-meanings/${card.slug}`}
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

export default function TarotCardMeaningsHub() {
  const jsonLd = buildHubJsonLd(
    'Tarot Card Meanings — Complete Guide to All 78 Cards',
    `${siteUrl}/tarot-card-meanings`,
    [
      { name: 'Home', url: siteUrl },
      { name: 'Tarot Card Meanings', url: `${siteUrl}/tarot-card-meanings` },
    ],
  );

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
          <span className="text-stone-300">Tarot Card Meanings</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-white mb-4">
            Tarot Card Meanings
          </h1>
          <p className="font-body text-lg font-medium text-stone-400 max-w-2xl mx-auto">
            Explore every card in the Rider-Waite-Smith deck with AI-powered narrative
            interpretations. Upright and reversed meanings, love, career, and yes/no guidance for all 78 cards.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map(section => {
          const cards = DECK.filter(section.filter)
            .sort((a, b) => a.number - b.number)
            .map(c => ({ name: c.name, slug: cardToSlug(c), image: c.image }));

          return (
            <section key={section.key} className="mb-16" id={section.slug}>
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-white mb-1">{section.title}</h2>
                  <p className="font-body text-sm font-medium text-stone-500">{section.description}</p>
                </div>
                <Link
                  href={`/tarot-card-meanings/${section.slug}`}
                  className="text-sm text-gold-400/70 hover:text-gold-400 transition-colors whitespace-nowrap"
                >
                  View all →
                </Link>
              </div>
              <CardGrid cards={cards} />
            </section>
          );
        })}

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[
              { q: 'How many tarot cards are there?', a: 'A standard tarot deck contains 78 cards: 22 Major Arcana cards representing major life themes, and 56 Minor Arcana cards divided into four suits (Wands, Cups, Swords, and Pentacles) that reflect day-to-day experiences.' },
              { q: 'What is the difference between Major and Minor Arcana?', a: 'Major Arcana cards represent significant life events, spiritual lessons, and deep archetypal themes. Minor Arcana cards deal with everyday situations and temporary influences. Both are equally important in a reading.' },
              { q: 'What does a reversed tarot card mean?', a: 'A reversed card appears upside-down in a spread. It often signals blocked energy, internalized qualities, or a need to look at the card\'s theme from a different angle — not simply the opposite of its upright meaning.' },
              { q: 'Can AI read tarot cards accurately?', a: 'AI tarot readings use advanced language models to provide insightful, nuanced interpretations based on card symbolism and position. While not mystical, they offer a powerful tool for self-reflection and exploring different perspectives on your situation.' },
              { q: 'Which tarot card is the most powerful?', a: 'No single card is "most powerful." However, Major Arcana cards like The Tower, Death, and The World carry significant weight in readings due to their transformative themes. Every card has its own unique power depending on context.' },
              { q: 'Do you need to be psychic to read tarot?', a: 'No. Tarot is a tool for structured self-reflection, not a psychic ability. Anyone can learn to read tarot by understanding card symbolism and developing their intuitive interpretation skills over time.' },
            ].map(faq => (
              <details key={faq.q} className="group border border-gold-400/[0.06] rounded-sm">
                <summary className="px-5 py-4 cursor-pointer font-display text-sm font-medium text-stone-300 group-open:text-gold-400 transition-colors">
                  {faq.q}
                </summary>
                <div className="px-5 pb-4 font-body text-sm font-medium text-stone-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
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
