import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { DECK } from '@/lib/tarot/deck';
import { cardToSlug } from '@/lib/tarot/slugs';
import { buildHubJsonLd } from '@/lib/seo/json-ld';

const siteUrl = 'https://www.tarotveil.com';

interface SubHubConfig {
  slug: string;
  title: string;
  heading: string;
  description: string;
  intro: string;
  filter: (card: (typeof DECK)[0]) => boolean;
}

export const SUB_HUB_CONFIGS: Record<string, SubHubConfig> = {
  'major-arcana': {
    slug: 'major-arcana',
    title: 'Major Arcana Tarot Meanings — All 22 Cards | TarotVeil',
    heading: 'Major Arcana Tarot Card Meanings',
    description: 'Explore all 22 Major Arcana tarot card meanings. Deep interpretations of The Fool through The World with upright, reversed, and love meanings.',
    intro: "The Major Arcana consists of 22 trump cards numbered 0 through 21, representing life's profound spiritual lessons and archetypal experiences. These cards carry the heaviest weight in a reading — when a Major Arcana card appears, it signals a significant life theme at play. From The Fool's leap of faith to The World's sense of completion, each card marks a milestone on the soul's journey through the human experience.",
    filter: c => c.arcana === 'major',
  },
  'suit-of-wands': {
    slug: 'suit-of-wands',
    title: 'Suit of Wands Tarot Meanings — All 14 Cards | TarotVeil',
    heading: 'Suit of Wands Tarot Card Meanings',
    description: 'Explore all 14 Wands tarot card meanings. Fire element cards covering creativity, passion, ambition, and willpower.',
    intro: 'The Suit of Wands is the fire element of the tarot deck, governing creativity, passion, ambition, and spiritual energy. Wands cards often appear when you are pursuing goals, starting new ventures, or channeling your inner drive. They speak to your sense of purpose, your creative spark, and your willpower to bring ideas into reality. From the raw potential of the Ace to the accomplished leadership of the King, this suit traces the arc of inspiration becoming action.',
    filter: c => c.suit === 'wands',
  },
  'suit-of-cups': {
    slug: 'suit-of-cups',
    title: 'Suit of Cups Tarot Meanings — All 14 Cards | TarotVeil',
    heading: 'Suit of Cups Tarot Card Meanings',
    description: 'Explore all 14 Cups tarot card meanings. Water element cards covering emotions, relationships, intuition, and love.',
    intro: 'The Suit of Cups represents the water element — emotions, relationships, intuition, and the inner world of feeling. These cards surface when matters of the heart are in focus: love, friendship, creative flow, and emotional healing. Cups reveal how you connect with others and with yourself on the deepest level. From the emotional awakening of the Ace to the diplomatic wisdom of the King, this suit maps the full spectrum of human feeling.',
    filter: c => c.suit === 'cups',
  },
  'suit-of-swords': {
    slug: 'suit-of-swords',
    title: 'Suit of Swords Tarot Meanings — All 14 Cards | TarotVeil',
    heading: 'Suit of Swords Tarot Card Meanings',
    description: 'Explore all 14 Swords tarot card meanings. Air element cards covering intellect, conflict, truth, and communication.',
    intro: 'The Suit of Swords corresponds to the air element — thought, intellect, communication, and conflict. These cards appear when mental clarity, difficult decisions, or truth-seeking are at the forefront. Swords cut through illusion but can also wound. They challenge you to think clearly, communicate honestly, and face uncomfortable realities. From the breakthrough clarity of the Ace to the commanding authority of the King, this suit tracks the power and peril of the mind.',
    filter: c => c.suit === 'swords',
  },
  'suit-of-pentacles': {
    slug: 'suit-of-pentacles',
    title: 'Suit of Pentacles Tarot Meanings — All 14 Cards | TarotVeil',
    heading: 'Suit of Pentacles Tarot Card Meanings',
    description: 'Explore all 14 Pentacles tarot card meanings. Earth element cards covering wealth, career, health, and material stability.',
    intro: 'The Suit of Pentacles represents the earth element — material wealth, career, physical health, and practical stability. These cards show up when your focus is on work, money, property, or building something tangible in the world. Pentacles ground your aspirations in reality and remind you that lasting success requires patience and steady effort. From the seed of opportunity in the Ace to the established security of the King, this suit maps your relationship with the material world.',
    filter: c => c.suit === 'pentacles',
  },
};

export function generateSubHubMetadata(configKey: string): Metadata {
  const config = SUB_HUB_CONFIGS[configKey];
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: `${siteUrl}/tarot-card-meanings/${config.slug}` },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `${siteUrl}/tarot-card-meanings/${config.slug}`,
    },
  };
}

export default function SubHubPage({ configKey }: { configKey: string }) {
  const config = SUB_HUB_CONFIGS[configKey];
  const cards = DECK.filter(config.filter)
    .sort((a, b) => a.number - b.number)
    .map(c => ({
      name: c.name,
      slug: cardToSlug(c),
      image: c.image,
    }));

  const pageUrl = `${siteUrl}/tarot-card-meanings/${config.slug}`;
  const jsonLd = buildHubJsonLd(config.heading, pageUrl, [
    { name: 'Home', url: siteUrl },
    { name: 'Tarot Card Meanings', url: `${siteUrl}/tarot-card-meanings` },
    { name: config.heading.replace(' Tarot Card Meanings', ''), url: pageUrl },
  ]);

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
          <Link href="/tarot-card-meanings" className="hover:text-gold-400 transition-colors">Tarot Card Meanings</Link>
          <span>/</span>
          <span className="text-stone-300">{config.heading.replace(' Tarot Card Meanings', '')}</span>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            {config.heading}
          </h1>
          <p className="font-body text-base font-medium text-stone-400 max-w-3xl leading-relaxed">
            {config.intro}
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-16">
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

        {/* CTA */}
        <section className="text-center py-12 border-t border-gold-400/[0.06]">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">
            Experience These Cards in a Reading
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            Get a free AI tarot reading and see how these cards weave together into your unique story.
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
