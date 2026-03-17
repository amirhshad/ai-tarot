import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const siteUrl = 'https://www.tarotveil.com';

export const metadata: Metadata = {
  title: 'Yes or No Tarot — Free AI Yes/No Tarot Reading',
  description:
    'Get a free yes or no tarot reading with AI interpretation. Ask a question, draw one card, and receive a clear answer with nuanced guidance from TarotVeil.',
  keywords: [
    'yes or no tarot',
    'yes no tarot reading',
    'tarot yes or no',
    'free yes no tarot',
    'AI tarot yes or no',
    'one card yes no',
    'tarot answer',
  ],
  alternates: {
    canonical: `${siteUrl}/yes-or-no`,
  },
  openGraph: {
    title: 'Yes or No Tarot — Free AI Yes/No Tarot Reading | TarotVeil',
    description:
      'Quick yes or no tarot readings powered by AI. One card, one answer, with nuanced interpretation.',
    url: `${siteUrl}/yes-or-no`,
    type: 'article',
  },
};

const yesCards = [
  { name: 'The Sun', slug: 'the-sun', image: '/cards/major/m19.jpg' },
  { name: 'The World', slug: 'the-world', image: '/cards/major/m21.jpg' },
  { name: 'Ace of Cups', slug: 'ace-of-cups', image: '/cards/minor/cups/c01.jpg' },
  { name: 'The Star', slug: 'the-star', image: '/cards/major/m17.jpg' },
];

const noCards = [
  { name: 'The Tower', slug: 'the-tower', image: '/cards/major/m16.jpg' },
  { name: 'Five of Cups', slug: 'five-of-cups', image: '/cards/minor/cups/c05.jpg' },
  { name: 'Ten of Swords', slug: 'ten-of-swords', image: '/cards/minor/swords/s10.jpg' },
  { name: 'The Devil', slug: 'the-devil', image: '/cards/major/m15.jpg' },
];

export default function YesOrNoPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Do a Yes or No Tarot Reading',
        description:
          'A simple guide to using tarot cards for yes or no answers with AI-powered interpretation.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Frame a clear yes/no question',
            text: 'Think of a specific question that can be answered with yes or no. The clearer the question, the clearer the answer. Avoid compound questions.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Draw one card',
            text: 'Pull a single tarot card. On TarotVeil, your card is drawn using cryptographic randomization for a truly unbiased result.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Read the answer',
            text: 'Upright cards generally lean toward yes, reversed cards toward no. But the AI interpretation adds nuance, explaining conditions, timing, and what the card is really telling you.',
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
            name: 'Yes or No Tarot',
            item: `${siteUrl}/yes-or-no`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How accurate is yes or no tarot?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes or no tarot is best understood as a decision-making tool rather than a prediction method. It surfaces your subconscious leanings and highlights factors you may not have considered. The accuracy depends on the clarity of your question.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I ask the same yes or no question twice?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Most tarot practitioners advise against re-drawing. The first card is the message. If you feel uncertain, use a follow-up question to explore the nuance rather than re-asking the same question.',
            },
          },
          {
            '@type': 'Question',
            name: 'What does a reversed card mean in yes/no tarot?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Reversed cards generally lean toward no, but with important nuance. A reversed card often means not yet, not in this way, or there is something to address first. Our AI interpretation explains the specific context.',
            },
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
          <span className="text-stone-300">Yes or No Tarot</span>
        </nav>

        {/* Header */}
        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-gold-400/60 mb-2">
            Quick Answer &middot; 1 Card &middot; ~1 Minute
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            Yes or No Tarot Reading
          </h1>
          <p className="font-body text-lg font-medium text-stone-300 leading-relaxed max-w-3xl mb-6">
            Sometimes you need a straight answer. A yes or no tarot reading
            strips away complexity and gives you one card with one clear
            direction. But unlike a coin flip, the tarot adds context — the
            &ldquo;yes&rdquo; might come with a condition, and the
            &ldquo;no&rdquo; might reveal what needs to change first.
          </p>
          <Link
            href="/reading/free?topic=yes-or-no"
            className="inline-block px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all"
          >
            Ask Your Yes/No Question
          </Link>
        </div>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            How It Works
          </h2>
          <div className="space-y-6 pl-8 border-l border-gold-400/10">
            {[
              {
                step: '1',
                title: 'Frame Your Question',
                desc: 'Think of a specific yes/no question. "Should I take this job?" works better than "What should I do about work?" Keep it focused on one thing.',
              },
              {
                step: '2',
                title: 'Draw One Card',
                desc: 'A single card is drawn using cryptographic randomization — no algorithms influencing the result. Pure, unbiased chance.',
              },
              {
                step: '3',
                title: 'Read the Answer',
                desc: 'Upright cards generally lean yes. Reversed cards lean no. But the AI goes deeper, explaining the conditions, timing, and hidden factors behind the answer.',
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

        {/* Yes vs No Cards */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            Understanding Yes and No Cards
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Yes Cards */}
            <div className="p-5 rounded-sm border border-gold-400/[0.08] bg-white/[0.01]">
              <h3 className="font-display text-lg font-semibold text-white mb-1">
                Cards That Lean &ldquo;Yes&rdquo;
              </h3>
              <p className="font-body text-xs text-stone-500 mb-4">
                Positive energy, forward movement, alignment
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {yesCards.map((card) => (
                  <Link
                    key={card.slug}
                    href={`/tarot-card-meanings/${card.slug}`}
                    className="group text-center"
                  >
                    <div className="relative w-full aspect-[2/3] rounded overflow-hidden border border-gold-400/10 group-hover:border-gold-400/30 transition-all mb-1">
                      <Image
                        src={card.image}
                        alt={card.name}
                        fill
                        sizes="70px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 group-hover:text-gold-400 transition-colors">
                      {card.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* No Cards */}
            <div className="p-5 rounded-sm border border-gold-400/[0.08] bg-white/[0.01]">
              <h3 className="font-display text-lg font-semibold text-white mb-1">
                Cards That Lean &ldquo;No&rdquo;
              </h3>
              <p className="font-body text-xs text-stone-500 mb-4">
                Caution, delay, reassessment needed
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {noCards.map((card) => (
                  <Link
                    key={card.slug}
                    href={`/tarot-card-meanings/${card.slug}`}
                    className="group text-center"
                  >
                    <div className="relative w-full aspect-[2/3] rounded overflow-hidden border border-gold-400/10 group-hover:border-gold-400/30 transition-all mb-1">
                      <Image
                        src={card.image}
                        alt={card.name}
                        fill
                        sizes="70px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 group-hover:text-gold-400 transition-colors">
                      {card.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <p className="font-body text-xs text-stone-600 mt-4 text-center">
            Most cards are contextual — the AI interprets yes/no based on
            position, reversal, and your specific question.
          </p>
        </section>

        {/* The Nuance */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            Beyond Simple Yes and No
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10 space-y-4">
            <p>
              The real power of tarot yes/no readings is not the binary answer —
              it is the nuance. A yes or no tarot card rarely says a flat
              &ldquo;yes&rdquo; or &ldquo;no.&rdquo; Instead, it might say:
            </p>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <strong className="text-stone-300">Yes, but...</strong> — there
                is a condition to be aware of first.
              </li>
              <li>
                <strong className="text-stone-300">Not yet</strong> — the timing
                is not right, but the direction is favorable.
              </li>
              <li>
                <strong className="text-stone-300">No, because...</strong> — and
                here is what needs to change.
              </li>
              <li>
                <strong className="text-stone-300">
                  The question itself is wrong
                </strong>{' '}
                — you might be asking the wrong question entirely.
              </li>
            </ul>
            <p>
              This is where AI interpretation excels. Instead of a lookup table
              of yes/no answers, our AI reads the card in context of your
              specific question and explains what it actually means for your
              situation.
            </p>
          </div>
        </section>

        {/* Sample Reading */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">&#10022;</span> Sample Yes/No
            Reading
          </h2>
          <div className="p-6 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent">
            <p className="text-xs text-stone-500 mb-4">
              Question: &ldquo;Should I apply for this new position?&rdquo;
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-[60px] h-[100px] rounded overflow-hidden flex-shrink-0">
                <Image
                  src="/cards/major/m11.jpg"
                  alt="Justice tarot card"
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
                    href="/tarot-card-meanings/justice"
                    className="hover:text-gold-400 transition-colors"
                  >
                    Justice
                  </Link>{' '}
                  <span className="text-stone-500 font-normal">&middot; Upright</span>
                </p>
              </div>
            </div>
            <div className="font-body text-sm font-medium text-stone-300 leading-relaxed italic">
              <p>
                &ldquo;Yes — but on the condition that this is genuinely the
                right fit, not just an escape from where you are now. Justice
                upright signals that the outcome will be fair: if you are
                qualified and this aligns with your values, the application will
                be judged on its merits. This card asks you to be honest with
                yourself about your motivations. If this role serves your
                genuine growth, apply with confidence. If you are running from
                something rather than toward something, Justice suggests
                addressing that first.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            Tips for Better Yes/No Readings
          </h2>
          <ul className="space-y-3 font-body text-sm font-medium text-stone-400 leading-relaxed">
            {[
              'Ask one question at a time. "Should I move AND change jobs?" is two questions — split them up.',
              'Avoid questions about other people\'s feelings or decisions. Focus on what you can control.',
              'Do not re-draw if you dislike the answer. The first card is the message.',
              'Use follow-up questions to explore the nuance. "What conditions does this yes come with?"',
              'If you need more depth than yes/no, try a three-card spread instead.',
            ].map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gold-400/40 flex-shrink-0">&middot;</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Related */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            Explore More
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/spreads/single-card"
              className="group p-4 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-sm font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                Single Card Guide
              </h3>
              <p className="font-body text-xs font-medium text-stone-500">
                The full guide to single card readings.
              </p>
            </Link>
            <Link
              href="/love-tarot"
              className="group p-4 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-sm font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                Love Tarot
              </h3>
              <p className="font-body text-xs font-medium text-stone-500">
                Readings focused on romance and relationships.
              </p>
            </Link>
            <Link
              href="/tarot-card-meanings"
              className="group p-4 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-sm font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                Card Meanings
              </h3>
              <p className="font-body text-xs font-medium text-stone-500">
                Explore all 78 tarot card meanings.
              </p>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            Yes or No Tarot FAQ
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'How accurate is yes or no tarot?',
                a: 'Yes or no tarot is best understood as a decision-making tool, not a prediction method. It surfaces your subconscious leanings and highlights factors you may not have considered. Accuracy depends on the clarity of your question.',
              },
              {
                q: 'Can I ask the same question twice?',
                a: 'Most tarot practitioners advise against re-drawing. The first card is the message. If uncertain, use a follow-up question to explore the nuance rather than re-asking.',
              },
              {
                q: 'What does a reversed card mean?',
                a: 'Reversed cards generally lean toward "no" — but with nuance. A reversal often means "not yet," "not in this way," or "there is something to address first." Our AI explains the specific context for your question.',
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
        <section className="text-center py-12 border-t border-gold-400/[0.06]">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">
            Ask the Cards
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            Get a free yes or no tarot reading with AI-powered interpretation.
            One card, one answer, one clear direction.
          </p>
          <Link
            href="/reading/free?topic=yes-or-no"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            Get a Free Reading
          </Link>
        </section>
      </div>
    </>
  );
}
