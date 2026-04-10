import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

const siteUrl = 'https://www.tarotveil.com';

export const metadata: Metadata = {
  title: 'Tarot Spreads Guide — AI Tarot Spread Layouts | TarotVeil',
  description:
    'Learn the most popular tarot spreads: Single Card, Three-Card, and Celtic Cross. Step-by-step guides with position meanings and AI-powered sample readings.',
  keywords: [
    'tarot spreads',
    'tarot spread guide',
    'AI tarot spread',
    'tarot layouts',
    'three card spread',
    'celtic cross spread',
    'single card tarot',
    'horseshoe tarot spread',
    'seven card spread',
    'decision making tarot',
  ],
  alternates: {
    canonical: `${siteUrl}/spreads`,
  },
  openGraph: {
    title: 'Tarot Spreads Guide — AI Tarot Spread Layouts | TarotVeil',
    description:
      'Master the most popular tarot spreads with step-by-step guides, position meanings, and AI-powered interpretations.',
    url: `${siteUrl}/spreads`,
  },
};

const spreads = [
  {
    slug: 'single-card',
    name: 'Single Card Reading',
    cardCount: 1,
    difficulty: 'Beginner',
    timeEstimate: '2 minutes',
    description:
      'A focused pull for quick clarity. Perfect for daily guidance, yes/no questions, or when you need a single clear message.',
    image: '/cards/major/m17.jpg',
    tier: 'Free',
  },
  {
    slug: 'three-card',
    name: 'Three-Card Spread',
    cardCount: 3,
    difficulty: 'Beginner',
    timeEstimate: '5 minutes',
    description:
      'The classic Past\u2013Present\u2013Future arc. See where you\u2019ve been, where you stand, and what lies ahead in one cohesive narrative.',
    image: '/cards/major/m01.jpg',
    tier: 'Free',
  },
  {
    slug: 'celtic-cross',
    name: 'Celtic Cross Spread',
    cardCount: 10,
    difficulty: 'Intermediate',
    timeEstimate: '10 minutes',
    description:
      'The most comprehensive tarot layout. Ten cards reveal your situation from every angle — past influences, hidden fears, external forces, and the likely outcome.',
    image: '/cards/major/m10.jpg',
    tier: 'Pro',
  },
  {
    slug: 'horseshoe',
    name: 'Horseshoe Spread',
    cardCount: 7,
    difficulty: 'Intermediate',
    timeEstimate: '8 minutes',
    description:
      'The #1 middle-ground spread for decision-making. Seven cards trace a clear arc from past influences to likely outcome — perfect for "What should I do?" questions.',
    image: '/cards/major/m07.jpg',
    tier: 'Pro',
  },
];

export default function SpreadsIndexPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tarot Spreads Guide',
    description:
      'Complete guide to popular tarot spreads with AI-powered interpretations.',
    url: `${siteUrl}/spreads`,
    publisher: { '@type': 'Organization', name: 'TarotVeil' },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Spreads',
          item: `${siteUrl}/spreads`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Breadcrumbs */}
        <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-gold-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-stone-300">Spreads</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-white mb-4">
            Tarot Spread Guides
          </h1>
          <p className="font-body text-lg font-medium text-stone-400 max-w-2xl mx-auto">
            Choose the right spread for your question. From quick daily pulls to
            deep 10-card readings, each layout reveals a different dimension of
            your story.
          </p>
        </div>

        {/* Spread Cards */}
        <div className="grid gap-8">
          {spreads.map((spread) => (
            <Link
              key={spread.slug}
              href={`/spreads/${spread.slug}`}
              className="group flex flex-col sm:flex-row gap-6 p-6 rounded-sm border border-gold-400/[0.08] hover:border-gold-400/20 bg-gradient-to-b from-white/[0.02] to-transparent transition-all duration-300"
            >
              {/* Preview Image */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="relative w-[100px] h-[160px] rounded overflow-hidden">
                  <Image
                    src={spread.image}
                    alt={`${spread.name} preview`}
                    fill
                    sizes="100px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-display text-xl font-semibold text-white group-hover:text-gold-400 transition-colors">
                    {spread.name}
                  </h2>
                  {spread.tier === 'Pro' && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-gold-400 border border-gold-400/30 rounded-full">
                      Pro
                    </span>
                  )}
                </div>
                <p className="font-body text-base font-medium text-stone-400 mb-4 leading-relaxed">
                  {spread.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-stone-500">
                  <span>
                    <span className="text-stone-400">{spread.cardCount}</span>{' '}
                    {spread.cardCount === 1 ? 'card' : 'cards'}
                  </span>
                  <span>
                    <span className="text-stone-400">{spread.difficulty}</span>{' '}
                    level
                  </span>
                  <span>
                    ~<span className="text-stone-400">{spread.timeEstimate}</span>
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden sm:flex items-center text-stone-600 group-hover:text-gold-400 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {[
              {
                q: 'Which tarot spread should I use?',
                a: 'Start with a Single Card for quick daily guidance or yes/no questions. Use the Three-Card Spread for past-present-future narratives. Choose the Celtic Cross when you need a comprehensive, multi-angle analysis of a complex situation.',
              },
              {
                q: 'Do I need experience to use these spreads?',
                a: 'Not at all. TarotVeil\'s AI interprets every spread for you, weaving the cards into a cohesive narrative. The Single Card and Three-Card spreads are perfect for beginners, while the Celtic Cross offers deeper insights as you grow.',
              },
              {
                q: 'How does AI tarot interpretation differ from traditional reading?',
                a: 'Our AI reads all your cards together as one story — not isolated meanings. It considers card positions, relationships between cards, and the overall narrative arc to give you a reading that feels personal and cohesive.',
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="p-5 rounded-sm border border-gold-400/[0.06] bg-white/[0.01]"
              >
                <h3 className="font-display text-base font-semibold text-white mb-2">
                  {faq.q}
                </h3>
                <p className="font-body text-sm font-medium text-stone-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-12 mt-12 border-t border-gold-400/[0.06]">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">
            Ready to Try a Spread?
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            Get a free AI tarot reading and see how the cards weave together into
            your unique story.
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
