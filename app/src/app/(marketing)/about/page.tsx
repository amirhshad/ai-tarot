import { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = 'https://www.tarotveil.com';

export const metadata: Metadata = {
  title: 'About TarotVeil — AI-Powered Narrative Tarot',
  description:
    'TarotVeil uses AI to weave tarot card readings into cohesive narrative stories. Crypto-random draws, multi-language support, and conversational depth.',
  alternates: { canonical: `${siteUrl}/about` },
  openGraph: {
    title: 'About TarotVeil',
    description:
      'AI-powered tarot readings that tell a story. Learn how TarotVeil combines cryptographic randomness with narrative AI interpretation.',
    url: `${siteUrl}/about`,
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Breadcrumbs */}
      <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-stone-300">About</span>
      </nav>

      <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-6">
        About TarotVeil
      </h1>

      <div className="font-body text-base font-medium text-stone-300 leading-relaxed space-y-6">
        <p>
          TarotVeil is an AI-powered tarot reading platform that does something most tarot apps
          don&apos;t: it tells a story. Instead of showing you isolated card meanings, TarotVeil
          weaves all the cards in your spread into one cohesive narrative, revealing how they
          connect and what they mean together in the context of your question.
        </p>

        <h2 className="font-display text-2xl font-semibold text-white pt-4">
          How It Works
        </h2>
        <p>
          Every reading begins with a cryptographically random card draw. TarotVeil uses the
          Web Crypto API with a Fisher-Yates shuffle, the same randomization standard used in
          security applications. No predetermined outcomes, no patterns, no tricks — just genuine
          randomness that mirrors the physical act of shuffling a real deck.
        </p>
        <p>
          Once your cards are drawn, AI interprets them as a unified reading. Not card-by-card
          definitions pulled from a database, but a flowing narrative that considers the
          positions, combinations, and relationships between every card in your spread. You can
          then ask follow-up questions to explore the reading further, creating a conversation
          with depth that goes beyond surface-level interpretations.
        </p>

        <h2 className="font-display text-2xl font-semibold text-white pt-4">
          Our Approach to Tarot
        </h2>
        <p>
          We treat tarot as a tool for self-reflection, not fortune-telling. TarotVeil will
          never tell you what will happen. Instead, it invites you to consider perspectives,
          patterns, and possibilities you might not have seen on your own. The cards act as a
          mirror, and the AI helps you interpret what you see.
        </p>
        <p>
          We respect the cultural and symbolic depth of the tarot tradition, particularly
          the Rider-Waite-Smith imagery that forms the foundation of modern tarot practice.
          Our interpretations draw from established tarot symbolism while remaining grounded
          in practical, psychologically informed guidance.
        </p>

        <h2 className="font-display text-2xl font-semibold text-white pt-4">
          Privacy &amp; Trust
        </h2>
        <p>
          Your readings are yours. TarotVeil does not share your questions, cards, or
          interpretations with anyone. We don&apos;t make medical, legal, or financial claims
          about tarot readings. We don&apos;t use manipulative design patterns to push
          purchases, and our free tier provides genuine, complete readings — not teasers
          designed to upsell.
        </p>

        <h2 className="font-display text-2xl font-semibold text-white pt-4">
          Available Spreads
        </h2>
        <ul className="space-y-2 pl-4">
          <li className="flex gap-3">
            <span className="text-gold-400/40 flex-shrink-0">-</span>
            <span><strong className="text-white">Single Card</strong> — Quick daily guidance or a focused answer</span>
          </li>
          <li className="flex gap-3">
            <span className="text-gold-400/40 flex-shrink-0">-</span>
            <span><strong className="text-white">Three-Card Spread</strong> — Past, present, and future perspective</span>
          </li>
          <li className="flex gap-3">
            <span className="text-gold-400/40 flex-shrink-0">-</span>
            <span><strong className="text-white">Celtic Cross</strong> — The most comprehensive 10-card reading</span>
          </li>
          <li className="flex gap-3">
            <span className="text-gold-400/40 flex-shrink-0">-</span>
            <span><strong className="text-white">Horseshoe Spread</strong> — 7 cards for decision-making</span>
          </li>
        </ul>

        <h2 className="font-display text-2xl font-semibold text-white pt-4">
          Multi-Language Support
        </h2>
        <p>
          TarotVeil supports readings in English and Farsi (Persian), with culturally
          adapted interpretations — not just translations, but meaning that resonates
          within each language&apos;s cultural context.
        </p>
      </div>

      {/* CTA */}
      <section className="mt-12 p-8 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent text-center">
        <h2 className="font-display text-xl font-semibold text-white mb-3">
          Try It Yourself
        </h2>
        <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
          Get a free AI tarot reading and see how your cards weave together into a story.
        </p>
        <Link
          href="/reading/free"
          className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
        >
          Get a Free Reading
        </Link>
        <p className="mt-6 font-body text-sm text-stone-500">
          Want to learn what each card means?{' '}
          <Link href="/tarot-card-meanings" className="text-gold-400/70 hover:text-gold-400 transition-colors underline underline-offset-2">
            Explore all 78 tarot card meanings
          </Link>
        </p>
      </section>
    </div>
  );
}
