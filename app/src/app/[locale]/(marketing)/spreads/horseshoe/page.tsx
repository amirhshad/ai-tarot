import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

const siteUrl = 'https://www.tarotveil.com';

export const metadata: Metadata = {
  title: 'Horseshoe Tarot Spread — 7-Card Decision Making Layout | AI Tarot',
  description:
    'Learn the horseshoe tarot spread: 7 cards tracing an arc from past influences to likely outcome. The best spread for decision-making and "What should I do?" questions. Try it at TarotVeil.',
  keywords: [
    'horseshoe tarot spread',
    'seven card tarot spread',
    '7 card spread',
    'decision making tarot',
    'horseshoe spread meaning',
    'AI tarot reading',
    'tarot spread guide',
    'what should I do tarot',
  ],
  alternates: {
    canonical: `${siteUrl}/spreads/horseshoe`,
  },
  openGraph: {
    title: 'Horseshoe Tarot Spread — 7-Card Decision Making Layout | AI Tarot',
    description:
      'Master the horseshoe tarot spread. Seven cards form a narrative arc for decision-making with AI-powered interpretations.',
    url: `${siteUrl}/spreads/horseshoe`,
    type: 'article',
  },
};

export default function HorseshoeSpreadPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Do a Horseshoe Tarot Spread',
        description:
          'A step-by-step guide to the 7-card horseshoe tarot spread for decision-making and path-forward questions.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Focus on your decision',
            text: 'Think about the choice or situation you need guidance on. The horseshoe spread works best with "What should I do?" and path-forward questions.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Draw seven cards',
            text: 'Draw seven cards in sequence. They form a horseshoe arc: past influences, present situation, hidden factors, your approach, obstacles, external influences, and likely outcome.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Read the narrative arc',
            text: 'The seven cards tell a progression story — from what shaped this moment to where your path leads. The AI weaves all seven positions into one cohesive narrative.',
          },
        ],
        totalTime: 'PT8M',
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
            name: 'Horseshoe Spread',
            item: `${siteUrl}/spreads/horseshoe`,
          },
        ],
      },
    ],
  };

  const positions = [
    {
      name: 'Past Influences',
      card: 'Six of Swords',
      cardSlug: 'six-of-swords',
      cardImage: '/cards/minor/swords/s06.jpg',
      meaning:
        'What past events have shaped this situation. This position reveals the foundation — the experiences, choices, and transitions that brought you to this crossroads.',
      sample:
        'The Six of Swords shows you\'ve already been through a difficult transition. You left troubled waters behind, carrying lessons from that journey. This wasn\'t easy, but it was necessary — and it\'s given you a clarity you didn\'t have before.',
    },
    {
      name: 'Present Situation',
      card: 'Two of Wands',
      cardSlug: 'two-of-wands',
      cardImage: '/cards/minor/wands/w02.jpg',
      meaning:
        'Where you stand right now. Your current state of mind, the energies surrounding you, and the central theme of this moment.',
      sample:
        'The Two of Wands confirms you\'re standing at a decision point, literally holding the world in your hands. You have options, and you know it. The restlessness you feel isn\'t anxiety — it\'s ambition wanting a direction.',
    },
    {
      name: 'Hidden Factors',
      card: 'The Moon',
      cardSlug: 'the-moon',
      cardImage: '/cards/major/m18.jpg',
      meaning:
        'Subconscious influences you may not be aware of. What\'s happening beneath the surface — fears, intuitions, or patterns that are quietly shaping your choices.',
      sample:
        'The Moon reveals that your subconscious is stirring with unresolved fears. Something from a past experience is casting shadows over this decision — not facts, but feelings. Trust your intuition here, but verify it against reality.',
    },
    {
      name: 'Your Approach',
      card: 'Knight of Pentacles',
      cardSlug: 'knight-of-pentacles',
      cardImage: '/cards/minor/pentacles/p12.jpg',
      meaning:
        'Your attitude and how you\'re handling this situation. The energy you\'re bringing to the decision — whether it\'s serving you or holding you back.',
      sample:
        'The Knight of Pentacles says you\'re approaching this methodically and carefully. You\'re not rushing — you\'re building a plan. This patience is a strength, but be careful it doesn\'t become paralysis disguised as preparation.',
    },
    {
      name: 'Obstacles',
      card: 'Five of Cups',
      cardSlug: 'five-of-cups',
      cardImage: '/cards/minor/cups/c05.jpg',
      meaning:
        'Challenges and blockages you face. What\'s standing between you and clarity — whether internal resistance or external circumstances.',
      sample:
        'The Five of Cups points to grief over what you might lose by choosing. You\'re focused on the cups that have spilled — the opportunities you\'d leave behind. But behind you stand two full cups you haven\'t turned to see yet.',
    },
    {
      name: 'External Influences',
      card: 'The Emperor',
      cardSlug: 'the-emperor',
      cardImage: '/cards/major/m04.jpg',
      meaning:
        'People and circumstances affecting the outcome. The environment, other people\'s expectations, and forces beyond your direct control.',
      sample:
        'The Emperor suggests an authority figure — a mentor, boss, or institution — whose structure and expectations are influencing your decision. Their stability could be supportive scaffolding or a rigid constraint, depending on how you engage with it.',
    },
    {
      name: 'Likely Outcome',
      card: 'The Chariot',
      cardSlug: 'the-chariot',
      cardImage: '/cards/major/m07.jpg',
      meaning:
        'Where this path leads if you stay the course. The most probable outcome based on the current trajectory and energies.',
      sample:
        'The Chariot is a powerful outcome — victory through willpower and determination. If you channel the methodical energy of the Knight of Pentacles and confront the fears The Moon revealed, you\'ll move forward with unstoppable momentum. The decision resolves in your favor, but only if you actually make it.',
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
          <span className="text-stone-300">Horseshoe Spread</span>
        </nav>

        {/* Header */}
        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-gold-400/60 mb-2">
            Intermediate · 7 Cards · ~8 Minutes
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            Horseshoe Tarot Spread
          </h1>
          <p className="font-body text-lg font-medium text-stone-300 leading-relaxed max-w-3xl">
            The #1 middle-ground spread for decision-making. Seven cards trace
            a clear arc from past influences through hidden factors and obstacles
            to the likely outcome — reading like a mini-story that&apos;s
            perfect for &quot;What should I do?&quot; questions.
          </p>
        </div>

        {/* Visual Layout */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            The Layout
          </h2>
          <div className="relative mx-auto mb-4" style={{ maxWidth: 600 }}>
            {/* Horseshoe arc */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {/* Top row: positions 0 and 6 (wide apart) */}
              <div className="w-full flex justify-between px-4 md:px-12 mb-2">
                {[positions[0], positions[6]].map((pos) => (
                  <div key={pos.name} className="text-center">
                    <div className="relative w-[70px] h-[116px] md:w-[90px] md:h-[150px] rounded-md overflow-hidden border border-gold-400/15 mx-auto mb-2">
                      <Image
                        src={pos.cardImage}
                        alt={`${pos.card} in ${pos.name} position`}
                        fill
                        sizes="90px"
                        className="object-cover"
                      />
                    </div>
                    <p className="font-display text-[10px] md:text-xs font-semibold text-gold-400/70">
                      {pos.name}
                    </p>
                  </div>
                ))}
              </div>
              {/* Middle row: positions 1 and 5 */}
              <div className="w-full flex justify-between px-10 md:px-20 mb-2">
                {[positions[1], positions[5]].map((pos) => (
                  <div key={pos.name} className="text-center">
                    <div className="relative w-[70px] h-[116px] md:w-[90px] md:h-[150px] rounded-md overflow-hidden border border-gold-400/15 mx-auto mb-2">
                      <Image
                        src={pos.cardImage}
                        alt={`${pos.card} in ${pos.name} position`}
                        fill
                        sizes="90px"
                        className="object-cover"
                      />
                    </div>
                    <p className="font-display text-[10px] md:text-xs font-semibold text-gold-400/70">
                      {pos.name}
                    </p>
                  </div>
                ))}
              </div>
              {/* Bottom row: positions 2, 3, 4 */}
              <div className="w-full flex justify-center gap-3 md:gap-6">
                {[positions[2], positions[3], positions[4]].map((pos) => (
                  <div key={pos.name} className="text-center">
                    <div className="relative w-[70px] h-[116px] md:w-[90px] md:h-[150px] rounded-md overflow-hidden border border-gold-400/15 mx-auto mb-2">
                      <Image
                        src={pos.cardImage}
                        alt={`${pos.card} in ${pos.name} position`}
                        fill
                        sizes="90px"
                        className="object-cover"
                      />
                    </div>
                    <p className="font-display text-[10px] md:text-xs font-semibold text-gold-400/70">
                      {pos.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-stone-600">
            Cards form a horseshoe arc: past on the left, future on the right, with hidden factors and obstacles at the base
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
              The horseshoe&apos;s strength is its narrative progression. Seven
              positions tell a complete story: what shaped this moment, where you
              stand, what&apos;s hidden, how you&apos;re approaching it, what&apos;s
              blocking you, who&apos;s influencing the outcome, and where it all leads.
            </p>
            <p>
              TarotVeil&apos;s AI reads all seven cards as one cohesive
              narrative — weaving connections between the hidden factors
              (position 3) and the obstacles (position 5), showing how your
              approach (position 4) either overcomes or reinforces the
              challenges ahead.
            </p>
            <p>
              After your initial reading, Pro members can ask up to 5
              follow-up questions to explore specific cards, dive deeper into
              the obstacles, or ask &quot;What if I change my approach?&quot;
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
              'You\'re facing a decision and want to understand all the factors before choosing.',
              'You want more depth than a three-card spread but less complexity than the Celtic Cross.',
              'You\'re asking "What should I do?" or "Which path should I take?"',
              'You suspect hidden influences or subconscious patterns are affecting your choices.',
              'You want to understand both internal obstacles and external forces at play.',
              'You need a reading that tells a clear progression story from cause to outcome.',
            ].map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gold-400/40 flex-shrink-0">·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Related Spreads */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            Explore Other Spreads
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/spreads/three-card"
              className="group p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                Three-Card Spread
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                Past, present, future — the classic narrative arc.
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
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-12 border-t border-gold-400/[0.06]">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">
            Try the Horseshoe Spread
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            Get an AI tarot reading with the 7-card horseshoe spread. See
            how seven cards weave together into your decision-making story.
          </p>
          <Link
            href="/reading/new"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            Start a Reading
          </Link>
        </section>
      </div>
    </>
  );
}
