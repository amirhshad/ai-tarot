import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

const siteUrl = 'https://www.tarotveil.com';

export const metadata: Metadata = {
  title: 'Three-Card Tarot Spread — Past, Present, Future | AI Tarot',
  description:
    'Learn the three-card tarot spread: past, present, and future positions explained. Step-by-step guide with AI-powered sample reading. Try it free at TarotVeil.',
  keywords: [
    'three card tarot spread',
    'three card reading',
    'past present future tarot',
    '3 card tarot spread',
    'AI tarot reading',
    'tarot spread guide',
    'three card tarot layout',
  ],
  alternates: {
    canonical: `${siteUrl}/spreads/three-card`,
  },
  openGraph: {
    title: 'Three-Card Tarot Spread — Past, Present, Future | AI Tarot',
    description:
      'Master the three-card tarot spread. Past, present, and future positions with AI-powered narrative interpretations.',
    url: `${siteUrl}/spreads/three-card`,
    type: 'article',
  },
};

export default function ThreeCardSpreadPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Do a Three-Card Tarot Spread',
        description:
          'A step-by-step guide to the three-card past, present, future tarot spread with AI interpretation.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Set your intention',
            text: 'Think about the situation or question you want the cards to address. The three-card spread works best with open-ended questions about transitions, decisions, or evolving situations.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Draw three cards',
            text: 'Draw three cards in sequence. The first represents the past, the second the present, and the third the future. On TarotVeil, cards are drawn using cryptographic randomization.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Read the narrative',
            text: 'The three cards form a story arc. The AI reads them together — not as three separate meanings, but as one evolving narrative that connects where you\'ve been to where you\'re heading.',
          },
        ],
        totalTime: 'PT5M',
        tool: [{ '@type': 'HowToTool', name: 'TarotVeil AI Tarot Platform' }],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Spreads',
            item: `${siteUrl}/spreads`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Three-Card Spread',
            item: `${siteUrl}/spreads/three-card`,
          },
        ],
      },
    ],
  };

  const positions = [
    {
      name: 'Past',
      card: 'Eight of Cups',
      cardSlug: 'eight-of-cups',
      cardImage: '/cards/minor/cups/c08.jpg',
      meaning:
        'What has led you to this moment. The past position reveals the foundation of your current situation — the choices, events, and energies that shaped where you are now.',
      sample:
        'The Eight of Cups in your past tells of a deliberate departure — something you walked away from, even though part of you wanted to stay. This wasn\'t impulsive; it was the quiet realization that what you had wasn\'t enough anymore.',
    },
    {
      name: 'Present',
      card: 'The Hermit',
      cardSlug: 'the-hermit',
      cardImage: '/cards/major/m09.jpg',
      meaning:
        'Where you stand right now. The present position shows your current state — your mindset, the energies surrounding you, and the central theme of this moment in your life.',
      sample:
        'The Hermit confirms you\'re in a period of intentional solitude and introspection. This isn\'t loneliness — it\'s withdrawal by choice. You\'re searching for answers that can only be found by going inward.',
    },
    {
      name: 'Future',
      card: 'Ace of Pentacles',
      cardSlug: 'ace-of-pentacles',
      cardImage: '/cards/minor/pentacles/p01.jpg',
      meaning:
        'What is unfolding ahead of you. The future position isn\'t fixed fate — it shows the most likely trajectory based on your current path and energies. It can be influenced by your choices.',
      sample:
        'The Ace of Pentacles ahead signals a tangible new beginning — a job offer, a creative project taking root, or a financial opportunity materializing. The introspection of The Hermit is leading you toward something real and grounded.',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Breadcrumbs */}
        <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-gold-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/spreads" className="hover:text-gold-400 transition-colors">
            Spreads
          </Link>
          <span>/</span>
          <span className="text-stone-300">Three-Card Spread</span>
        </nav>

        {/* Header */}
        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-gold-400/60 mb-2">
            Beginner · 3 Cards · ~5 Minutes
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            Three-Card Tarot Spread
          </h1>
          <p className="font-body text-lg font-medium text-stone-300 leading-relaxed max-w-3xl">
            The most popular tarot layout in the world — and for good reason.
            Three cards create a complete story: where you&apos;ve been, where
            you are, and where you&apos;re heading. Simple enough for
            beginners, deep enough for experienced readers.
          </p>
        </div>

        {/* Visual Layout */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            The Layout
          </h2>
          <div className="flex justify-center gap-6 md:gap-10 mb-4">
            {positions.map((pos) => (
              <div key={pos.name} className="text-center">
                <div className="relative w-[90px] h-[150px] md:w-[110px] md:h-[183px] rounded-md overflow-hidden border border-gold-400/15 mx-auto mb-3">
                  <Image
                    src={pos.cardImage}
                    alt={`${pos.card} in ${pos.name} position`}
                    fill
                    sizes="110px"
                    className="object-cover"
                  />
                </div>
                <p className="font-display text-sm font-semibold text-gold-400/70">
                  {pos.name}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-stone-600">
            Cards are laid left to right: Past → Present → Future
          </p>
        </section>

        {/* Position Deep Dives */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-8">
            Position Meanings
          </h2>
          <div className="space-y-10">
            {positions.map((pos, i) => (
              <div key={pos.name}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gold-400/10 text-gold-400 font-display text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {pos.name}
                  </h3>
                </div>
                <p className="font-body text-base font-medium text-stone-300 leading-relaxed mb-2 ml-10">
                  {pos.meaning}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            How AI Reads This Spread
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10 space-y-4">
            <p>
              Traditional tarot readers interpret each card separately, then try
              to synthesize a story. TarotVeil&apos;s AI works differently — it
              reads all three cards simultaneously, finding the narrative
              thread that connects them.
            </p>
            <p>
              The result is a cohesive story, not three disconnected meanings.
              You&apos;ll see how your past influences your present, and how your
              present choices are shaping the future the cards reveal.
            </p>
            <p>
              After your initial reading, you can ask up to 5 follow-up
              questions to explore specific cards or themes deeper — something no
              traditional deck can offer.
            </p>
          </div>
        </section>

        {/* Sample Reading */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">✦</span> Sample AI Reading
          </h2>
          <div className="p-6 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent space-y-6">
            {positions.map((pos) => (
              <div key={pos.name}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative w-[40px] h-[66px] rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={pos.cardImage}
                      alt={pos.card}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-gold-400/50">
                      {pos.name}
                    </p>
                    <p className="font-display text-sm font-semibold text-white">
                      <Link
                        href={`/tarot-card-meanings/${pos.cardSlug}`}
                        className="hover:text-gold-400 transition-colors"
                      >
                        {pos.card}
                      </Link>
                    </p>
                  </div>
                </div>
                <p className="font-body text-sm font-medium text-stone-300 leading-relaxed italic ml-[52px]">
                  &ldquo;{pos.sample}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* When to use */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            When to Use This Spread
          </h2>
          <ul className="space-y-3 font-body text-sm font-medium text-stone-400 leading-relaxed">
            {[
              'You\'re in a period of transition and want to understand the trajectory.',
              'You need more context than a single card but don\'t want a full Celtic Cross.',
              'You\'re facing a decision and want to see how it connects to your past and future.',
              'You\'re new to tarot and want a structured but accessible reading.',
              'You want a reading that tells a story, not just lists meanings.',
            ].map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gold-400/40 flex-shrink-0">·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Alternative Three-Card Layouts */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            Other Three-Card Variations
          </h2>
          <p className="font-body text-sm font-medium text-stone-400 mb-4 leading-relaxed">
            While Past–Present–Future is the classic, you can frame the same
            three positions differently depending on your question:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Mind · Body · Spirit',
                desc: 'Understand how an issue is affecting you on different levels.',
              },
              {
                title: 'Situation · Action · Outcome',
                desc: 'Get practical advice: what\'s happening, what to do, what to expect.',
              },
              {
                title: 'You · Them · The Relationship',
                desc: 'A focused lens for relationship questions and dynamics.',
              },
              {
                title: 'Option A · Option B · Advice',
                desc: 'Compare two choices side by side with guidance for deciding.',
              },
            ].map((variant) => (
              <div
                key={variant.title}
                className="p-4 rounded-sm border border-gold-400/[0.06] bg-white/[0.01]"
              >
                <h3 className="font-display text-sm font-semibold text-gold-400/70 mb-1">
                  {variant.title}
                </h3>
                <p className="font-body text-sm font-medium text-stone-500 leading-relaxed">
                  {variant.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Spreads */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            Explore Other Spreads
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/spreads/single-card"
              className="group p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                Single Card Reading
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                One card, one message. Quick daily guidance.
              </p>
            </Link>
            <Link
              href="/spreads/celtic-cross"
              className="group p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                Celtic Cross Spread
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                10 cards for the most comprehensive reading.
              </p>
            </Link>
            <Link
              href="/tarot-card-meanings"
              className="group p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                Tarot Card Meanings
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                Learn what every card means — upright, reversed, and in context.
              </p>
            </Link>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-12 border-t border-gold-400/[0.06]">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">
            Try the Three-Card Spread
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            Get a free AI tarot reading with the past–present–future spread. See
            how three cards weave together into your unique story.
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
