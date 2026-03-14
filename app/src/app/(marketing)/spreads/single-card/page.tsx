import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const siteUrl = 'https://www.tarotveil.com';

export const metadata: Metadata = {
  title: 'Single Card Tarot Reading — One Card Pull Guide | AI Tarot',
  description:
    'Learn how to do a single card tarot reading. Perfect for daily guidance, yes/no questions, and quick clarity. Try a free AI one-card reading at TarotVeil.',
  keywords: [
    'one card tarot reading',
    'single card tarot',
    'daily tarot card',
    'one card pull',
    'AI tarot reading',
    'tarot card of the day',
    'yes or no tarot',
  ],
  alternates: {
    canonical: `${siteUrl}/spreads/single-card`,
  },
  openGraph: {
    title: 'Single Card Tarot Reading — One Card Pull Guide | AI Tarot',
    description:
      'Master the single card tarot reading. Quick guidance, daily pulls, and yes/no answers with AI-powered interpretations.',
    url: `${siteUrl}/spreads/single-card`,
    type: 'article',
  },
};

export default function SingleCardSpreadPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Do a Single Card Tarot Reading',
        description:
          'A step-by-step guide to performing a one-card tarot pull for daily guidance, quick clarity, or yes/no questions.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Focus your question',
            text: 'Take a moment to center yourself. Think about what you want guidance on — it can be a specific question or a general "what do I need to know today?" intention.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Draw your card',
            text: 'On TarotVeil, your card is drawn using cryptographic randomization — the same technology used in security systems — ensuring a truly fair and unbiased pull.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Read the interpretation',
            text: 'Our AI interprets the card in context of your question, explaining both upright and reversed meanings and what the card is asking you to consider.',
          },
        ],
        totalTime: 'PT2M',
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
            name: 'Single Card',
            item: `${siteUrl}/spreads/single-card`,
          },
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
          <Link href="/" className="hover:text-gold-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/spreads" className="hover:text-gold-400 transition-colors">
            Spreads
          </Link>
          <span>/</span>
          <span className="text-stone-300">Single Card</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-10 mb-16">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative w-[180px] h-[300px] rounded-md overflow-hidden border border-gold-400/20">
              <Image
                src="/cards/major/m17.jpg"
                alt="Single card tarot reading — The Star"
                fill
                sizes="180px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs tracking-[0.2em] uppercase text-gold-400/60 mb-2">
              Beginner · 1 Card · ~2 Minutes
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
              Single Card Tarot Reading
            </h1>
            <p className="font-body text-lg font-medium text-stone-300 leading-relaxed mb-6">
              The simplest and most direct way to consult the tarot. One card,
              one message. Whether you&apos;re starting your morning, facing a
              decision, or just checking in with yourself, a single card pull
              cuts through noise and delivers focused insight.
            </p>
            <Link
              href="/reading/free"
              className="inline-block px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all"
            >
              Try a Free Single Card Reading
            </Link>
          </div>
        </div>

        {/* When to use */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            When to Use a Single Card Reading
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Daily Guidance',
                desc: 'Pull a card each morning to set your intention for the day. Many tarot practitioners make this a daily ritual.',
              },
              {
                title: 'Quick Clarity',
                desc: 'When you need immediate insight on a situation but don\'t have time for a full spread.',
              },
              {
                title: 'Yes/No Questions',
                desc: 'Frame a binary question. Upright cards tend toward "yes" and reversed cards toward "no" — but the nuance matters.',
              },
              {
                title: 'Learning the Deck',
                desc: 'The best way to learn tarot card meanings is to pull one card daily and sit with its message.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-sm border border-gold-400/[0.06] bg-white/[0.01]"
              >
                <h3 className="font-display text-base font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="font-body text-sm font-medium text-stone-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            How It Works
          </h2>
          <div className="space-y-6 pl-8 border-l border-gold-400/10">
            {[
              {
                step: '1',
                title: 'Focus Your Question',
                desc: 'Take a breath. Think about what you want to know — or simply ask "what do I need to know today?" The clearer your intention, the more resonant the reading.',
              },
              {
                step: '2',
                title: 'Draw Your Card',
                desc: 'TarotVeil uses cryptographic randomization (the same technology that secures banking systems) to draw your card. No algorithms, no bias — just pure chance.',
              },
              {
                step: '3',
                title: 'Receive Your AI Interpretation',
                desc: 'Our AI doesn\'t just give you a textbook definition. It reads the card in context — considering the position (upright or reversed), your question, and the card\'s narrative arc — to deliver a personal, meaningful interpretation.',
              },
            ].map((item) => (
              <div key={item.step}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gold-400/10 text-gold-400 font-display text-sm font-semibold flex items-center justify-center">
                    {item.step}
                  </span>
                  <h3 className="font-display text-base font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="font-body text-sm font-medium text-stone-400 leading-relaxed ml-10">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Position meaning */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            The Position: &ldquo;The Card&rdquo;
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10 space-y-4">
            <p>
              In a single card reading, the card represents the core message for
              your question. It&apos;s not filtered through multiple positions or
              compared against other cards — it stands alone as the tarot&apos;s
              direct answer.
            </p>
            <p>
              This directness is what makes the single card pull so powerful.
              There&apos;s nowhere for the meaning to hide. The card you draw is
              the card you need.
            </p>
          </div>
        </section>

        {/* Sample Reading */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">✦</span> Sample AI Interpretation
          </h2>
          <div className="p-6 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-[60px] h-[100px] rounded overflow-hidden flex-shrink-0">
                <Image
                  src="/cards/major/m17.jpg"
                  alt="The Star tarot card"
                  fill
                  sizes="60px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs tracking-[0.15em] uppercase text-gold-400/50 mb-1">
                  Card Drawn
                </p>
                <p className="font-display text-lg font-semibold text-white">
                  <Link
                    href="/tarot-card-meanings/the-star"
                    className="hover:text-gold-400 transition-colors"
                  >
                    The Star
                  </Link>{' '}
                  <span className="text-stone-500 font-normal">· Upright</span>
                </p>
              </div>
            </div>
            <div className="font-body text-sm font-medium text-stone-300 leading-relaxed italic">
              <p>
                &ldquo;After the upheaval of The Tower, The Star arrives as quiet
                reassurance — you are exactly where you need to be. This card
                speaks of renewed hope after a difficult period. Whatever
                you&apos;ve been weathering, the worst has passed. The Star
                invites you to trust the process, pour your energy into healing,
                and believe that clarity is emerging. This isn&apos;t blind
                optimism; it&apos;s the calm confidence that comes after
                surviving something hard and realizing you&apos;re still
                standing.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            Tips for Better Single Card Readings
          </h2>
          <ul className="space-y-3 font-body text-sm font-medium text-stone-400 leading-relaxed">
            {[
              'Be specific with your question. "What should I focus on at work today?" is more powerful than "tell me about work."',
              'Don\'t re-draw if you don\'t like the answer. The first card is the message — sit with it.',
              'Journal your daily pulls. Patterns will emerge over time that reveal deeper insights.',
              'Pay attention to reversed cards. They\'re not "bad" — they often indicate internal or blocked energy.',
              'Use follow-up questions. On TarotVeil, you can ask the AI to elaborate on any part of your reading.',
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
                Past, present, and future in one narrative arc.
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
                10 cards for a comprehensive, deep reading.
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
            Deepen your readings by understanding each card&apos;s meaning.
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
            Pull Your Card
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            Get a free AI tarot reading with a single card pull. No signup
            required — just focus your question and draw.
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
