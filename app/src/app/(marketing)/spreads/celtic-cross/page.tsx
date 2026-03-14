import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const siteUrl = 'https://www.tarotveil.com';

export const metadata: Metadata = {
  title: 'Celtic Cross Tarot Spread — 10-Card Layout Guide | AI Tarot',
  description:
    'Master the Celtic Cross tarot spread: all 10 positions explained with meanings, tips, and an AI-powered sample reading. The most comprehensive tarot layout.',
  keywords: [
    'celtic cross tarot spread',
    'celtic cross tarot',
    '10 card tarot spread',
    'celtic cross layout',
    'AI tarot reading',
    'celtic cross positions',
    'celtic cross meaning',
  ],
  alternates: {
    canonical: `${siteUrl}/spreads/celtic-cross`,
  },
  openGraph: {
    title: 'Celtic Cross Tarot Spread — 10-Card Layout Guide | AI Tarot',
    description:
      'The definitive guide to the Celtic Cross tarot spread. All 10 positions explained with AI-powered interpretations.',
    url: `${siteUrl}/spreads/celtic-cross`,
    type: 'article',
  },
};

export default function CelticCrossSpreadPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Read a Celtic Cross Tarot Spread',
        description:
          'A comprehensive guide to the 10-card Celtic Cross tarot spread — the most detailed and popular tarot layout for in-depth readings.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Set a clear intention',
            text: 'The Celtic Cross works best with a focused question or situation. Take time to center yourself and clearly define what you want to explore.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Draw ten cards',
            text: 'Cards are laid in the traditional Celtic Cross pattern: a central cross of 6 cards plus a vertical staff of 4 cards on the right.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Read the central cross',
            text: 'The first 6 cards (Present, Challenge, Foundation, Recent Past, Crown, Near Future) form the core of the reading and reveal the immediate dynamics.',
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Read the staff',
            text: 'The final 4 cards (Self, Environment, Hopes & Fears, Outcome) provide deeper context about internal and external influences shaping the outcome.',
          },
        ],
        totalTime: 'PT10M',
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
            name: 'Celtic Cross',
            item: `${siteUrl}/spreads/celtic-cross`,
          },
        ],
      },
    ],
  };

  const positions = [
    {
      num: 1,
      name: 'Present',
      desc: 'Your current situation and state of mind. This is the heart of the reading — the central theme that everything else revolves around.',
      card: 'The Empress',
      cardSlug: 'the-empress',
      image: '/cards/major/m03.jpg',
    },
    {
      num: 2,
      name: 'Challenge',
      desc: 'The immediate obstacle or opposing force. This card crosses the first, literally representing what stands in your way. It\'s not always negative — sometimes the "challenge" is an abundance of options or a fear of success.',
      card: 'Five of Wands',
      cardSlug: 'five-of-wands',
      image: '/cards/minor/wands/w05.jpg',
    },
    {
      num: 3,
      name: 'Foundation',
      desc: 'The root cause — the deeper, often subconscious basis of the situation. This card reveals what\'s underneath the surface, the foundation your current reality is built on.',
      card: 'The High Priestess',
      cardSlug: 'the-high-priestess',
      image: '/cards/major/m02.jpg',
    },
    {
      num: 4,
      name: 'Recent Past',
      desc: 'Events from the recent past that are directly influencing the present. These aren\'t ancient history — they\'re the choices and circumstances from the last weeks or months that set the stage.',
      card: 'Six of Swords',
      cardSlug: 'six-of-swords',
      image: '/cards/minor/swords/s06.jpg',
    },
    {
      num: 5,
      name: 'Crown',
      desc: 'Your conscious goal — what you\'re aspiring toward or believe is the best possible outcome. Sometimes this card reveals that what you think you want differs from what the cards suggest you need.',
      card: 'The Sun',
      cardSlug: 'the-sun',
      image: '/cards/major/m19.jpg',
    },
    {
      num: 6,
      name: 'Near Future',
      desc: 'What\'s coming in the near term — the next few weeks. This isn\'t the final outcome but the next chapter. Understanding this position helps you prepare and make informed choices.',
      card: 'Page of Pentacles',
      cardSlug: 'page-of-pentacles',
      image: '/cards/minor/pentacles/p11.jpg',
    },
    {
      num: 7,
      name: 'Self',
      desc: 'How you see yourself in this situation — your internal state, attitude, and the role you\'re playing. This card often reveals blind spots about your own behavior or self-perception.',
      card: 'Knight of Cups',
      cardSlug: 'knight-of-cups',
      image: '/cards/minor/cups/c12.jpg',
    },
    {
      num: 8,
      name: 'Environment',
      desc: 'External influences — how others see you, social dynamics, workplace energy, or family pressures. This is the context you can\'t fully control but need to navigate.',
      card: 'Three of Pentacles',
      cardSlug: 'three-of-pentacles',
      image: '/cards/minor/pentacles/p03.jpg',
    },
    {
      num: 9,
      name: 'Hopes & Fears',
      desc: 'Your deepest hopes and hidden fears — which are often two sides of the same coin. What you most want is frequently what you most fear, and this card illuminates that tension.',
      card: 'Nine of Cups',
      cardSlug: 'nine-of-cups',
      image: '/cards/minor/cups/c09.jpg',
    },
    {
      num: 10,
      name: 'Outcome',
      desc: 'The likely outcome based on the current path. This isn\'t destiny — it\'s trajectory. The other nine cards show you why this outcome is forming, and where you might redirect your energy if you choose.',
      card: 'The World',
      cardSlug: 'the-world',
      image: '/cards/major/m21.jpg',
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
          <span className="text-stone-300">Celtic Cross</span>
        </nav>

        {/* Header */}
        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-gold-400/60 mb-2">
            Intermediate · 10 Cards · ~10 Minutes
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            Celtic Cross Tarot Spread
          </h1>
          <p className="font-body text-lg font-medium text-stone-300 leading-relaxed max-w-3xl mb-6">
            The Celtic Cross is the most iconic and comprehensive tarot spread in
            existence. Ten cards arranged in a cross and staff formation reveal
            your situation from every angle — conscious desires, hidden fears,
            external pressures, and the trajectory of events. When you need the
            full picture, this is the spread.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/reading/free"
              className="inline-block px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all"
            >
              Try a Free Reading
            </Link>
            <span className="text-xs text-stone-500">
              Celtic Cross available on{' '}
              <Link href="/#pricing" className="text-gold-400/70 hover:text-gold-400 transition-colors">
                Pro plan
              </Link>
            </span>
          </div>
        </div>

        {/* Visual Layout */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            The Layout
          </h2>
          <div className="p-6 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent">
            {/* Simplified visual representation */}
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2 max-w-lg mx-auto mb-4 px-2 sm:px-0">
              {/* Row 1: Crown */}
              <div className="col-start-2 col-span-1 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  5
                </div>
                <p className="text-[9px] text-stone-600 mt-1">Crown</p>
              </div>
              {/* Row 2: Past + Center + Challenge + Future */}
              <div className="col-start-1 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  4
                </div>
                <p className="text-[9px] text-stone-600 mt-1">Past</p>
              </div>
              <div className="col-start-2 text-center relative">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/15 border border-gold-400/30 flex items-center justify-center text-[10px] text-gold-400 font-display">
                  1
                </div>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-10 rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display rotate-90">
                  2
                </div>
                <p className="text-[9px] text-stone-600 mt-1">Center</p>
              </div>
              <div className="col-start-3 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  6
                </div>
                <p className="text-[9px] text-stone-600 mt-1">Future</p>
              </div>
              {/* Staff */}
              <div className="col-start-5 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  10
                </div>
                <p className="text-[9px] text-stone-600 mt-1">Outcome</p>
              </div>
              {/* Row 3: Foundation */}
              <div className="col-start-2 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  3
                </div>
                <p className="text-[9px] text-stone-600 mt-1">Foundation</p>
              </div>
              <div className="col-start-5 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  9
                </div>
                <p className="text-[9px] text-stone-600 mt-1">Hopes</p>
              </div>
              {/* Staff continued */}
              <div className="col-start-5 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  8
                </div>
                <p className="text-[9px] text-stone-600 mt-1">Environ.</p>
              </div>
              <div className="col-start-5 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  7
                </div>
                <p className="text-[9px] text-stone-600 mt-1">Self</p>
              </div>
            </div>
            <p className="text-center text-xs text-stone-600">
              The Cross (positions 1–6) reveals the situation. The Staff
              (positions 7–10) reveals the deeper context and outcome.
            </p>
          </div>
        </section>

        {/* All 10 Positions */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-8">
            All 10 Positions Explained
          </h2>

          {/* Cross */}
          <div className="mb-10">
            <h3 className="font-display text-lg font-semibold text-gold-400/70 mb-6 tracking-wide">
              The Cross — Your Situation
            </h3>
            <div className="space-y-8">
              {positions.slice(0, 6).map((pos) => (
                <div
                  key={pos.num}
                  className="flex gap-4"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gold-400/10 text-gold-400 font-display text-sm font-semibold flex items-center justify-center mt-0.5">
                    {pos.num}
                  </span>
                  <div>
                    <h4 className="font-display text-base font-semibold text-white mb-1">
                      {pos.name}
                    </h4>
                    <p className="font-body text-sm font-medium text-stone-400 leading-relaxed">
                      {pos.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff */}
          <div>
            <h3 className="font-display text-lg font-semibold text-gold-400/70 mb-6 tracking-wide">
              The Staff — Deeper Context
            </h3>
            <div className="space-y-8">
              {positions.slice(6).map((pos) => (
                <div
                  key={pos.num}
                  className="flex gap-4"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gold-400/10 text-gold-400 font-display text-sm font-semibold flex items-center justify-center mt-0.5">
                    {pos.num}
                  </span>
                  <div>
                    <h4 className="font-display text-base font-semibold text-white mb-1">
                      {pos.name}
                    </h4>
                    <p className="font-body text-sm font-medium text-stone-400 leading-relaxed">
                      {pos.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How AI reads it */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            How AI Interprets the Celtic Cross
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10 space-y-4">
            <p>
              The Celtic Cross is where AI tarot reading truly shines. A human
              reader must hold 10 cards and their interactions in mind
              simultaneously — a cognitive challenge even for experienced
              practitioners. Our AI processes all 10 positions at once, finding
              patterns and narrative threads that connect every card.
            </p>
            <p>
              You&apos;ll see how the Foundation card echoes in the Outcome, how
              your Hopes &amp; Fears might be blocking what the Crown position
              shows you want, and how the Environment is shaping forces you
              can&apos;t see directly. It&apos;s not 10 separate readings — it&apos;s
              one integrated story told from 10 perspectives.
            </p>
            <p>
              With up to 10 follow-up questions on Premium, you can drill into
              any card or explore how changing your approach might shift the
              Outcome card&apos;s trajectory.
            </p>
          </div>
        </section>

        {/* Sample cards grid */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">✦</span> Sample Reading Cards
          </h2>
          <p className="font-body text-sm font-medium text-stone-500 mb-6">
            Here&apos;s what a Celtic Cross reading might look like. Each card links
            to its full meaning page.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {positions.map((pos) => (
              <Link
                key={pos.num}
                href={`/cards/${pos.cardSlug}`}
                className="group text-center"
              >
                <div className="relative w-full aspect-[2/3] rounded overflow-hidden border border-gold-400/10 group-hover:border-gold-400/30 transition-all mb-1">
                  <Image
                    src={pos.image}
                    alt={`${pos.card} — ${pos.name} position`}
                    fill
                    sizes="(max-width: 640px) 60px, 80px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-[10px] text-stone-600">{pos.num}. {pos.name}</p>
                <p className="font-display text-[11px] text-stone-400 group-hover:text-gold-400 transition-colors leading-tight">
                  {pos.card}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            Tips for Celtic Cross Readings
          </h2>
          <ul className="space-y-3 font-body text-sm font-medium text-stone-400 leading-relaxed">
            {[
              'Use this spread for complex situations that need multi-angle analysis, not quick yes/no questions.',
              'Pay special attention to the relationship between positions 1 (Present) and 10 (Outcome) — they tell you where you are and where you\'re heading.',
              'The Challenge card (position 2) isn\'t your enemy. It often represents a growth edge or an energy you need to integrate.',
              'Compare positions 5 (Crown/aspirations) and 9 (Hopes & Fears). When they conflict, you\'ve found the core tension.',
              'Use follow-up questions to explore connections between specific cards — "How does my Foundation card affect the Outcome?"',
              'Don\'t rush it. The Celtic Cross rewards contemplation. Sit with the reading before acting on it.',
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
              href="/spreads/single-card"
              className="group p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                Single Card Reading
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                Quick daily guidance with one focused card.
              </p>
            </Link>
            <Link
              href="/spreads/three-card"
              className="group p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                Three-Card Spread
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                Past, present, and future in one narrative arc.
              </p>
            </Link>
          </div>
        </section>

        {/* Explore cards CTA */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            Learn the Cards
          </h2>
          <p className="font-body text-sm font-medium text-stone-400 mb-4">
            The Celtic Cross uses 10 of the 78 cards. Understanding each
            card&apos;s meaning deepens your reading experience.
          </p>
          <Link
            href="/tarot-card-meanings"
            className="text-sm text-gold-400 hover:text-gold-300 transition-colors font-medium"
          >
            Explore all 78 card meanings →
          </Link>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-12 border-t border-gold-400/[0.06]">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">
            Experience the Celtic Cross
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            Get an AI-powered Celtic Cross reading and see 10 cards woven into
            one comprehensive story about your situation.
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
