import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const siteUrl = 'https://www.tarotveil.com';

export const metadata: Metadata = {
  title: 'Love Tarot Reading — AI Relationship & Love Guidance',
  description:
    'Get a free AI love tarot reading for relationship guidance. Explore romantic connections, compatibility, and emotional clarity with narrative tarot interpretations.',
  keywords: [
    'love tarot reading',
    'relationship tarot',
    'love tarot',
    'AI love reading',
    'tarot love spread',
    'romance tarot',
    'soulmate tarot',
    'relationship guidance tarot',
  ],
  alternates: {
    canonical: `${siteUrl}/love-tarot`,
  },
  openGraph: {
    title: 'Love Tarot Reading — AI Relationship & Love Guidance | TarotVeil',
    description:
      'AI-powered love tarot readings that explore your romantic life with narrative depth. Free readings available.',
    url: `${siteUrl}/love-tarot`,
    type: 'article',
  },
};

const loveCards = [
  { name: 'The Lovers', slug: 'the-lovers', image: '/cards/major/m06.jpg' },
  { name: 'Two of Cups', slug: 'two-of-cups', image: '/cards/minor/cups/c02.jpg' },
  { name: 'The Empress', slug: 'the-empress', image: '/cards/major/m03.jpg' },
  { name: 'Ace of Cups', slug: 'ace-of-cups', image: '/cards/minor/cups/c01.jpg' },
  { name: 'Ten of Cups', slug: 'ten-of-cups', image: '/cards/minor/cups/c10.jpg' },
  { name: 'Knight of Cups', slug: 'knight-of-cups', image: '/cards/minor/cups/c12.jpg' },
];

export default function LoveTarotPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Love Tarot Reading — AI-Powered Relationship Guidance',
        description:
          'Explore your romantic life with AI-powered love tarot readings. Narrative interpretations for relationships, compatibility, and emotional clarity.',
        author: { '@type': 'Organization', name: 'TarotVeil' },
        publisher: { '@type': 'Organization', name: 'TarotVeil' },
        mainEntityOfPage: `${siteUrl}/love-tarot`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Love Tarot',
            item: `${siteUrl}/love-tarot`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Can tarot predict my love life?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Tarot does not predict a fixed future. Instead, it reveals patterns, energies, and dynamics in your romantic life, helping you understand what is influencing your relationships and what you might consider moving forward.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the best tarot spread for love questions?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The Three-Card Spread (past-present-future) works well for relationship trajectory. For deeper analysis, the Celtic Cross reveals hidden influences, fears, and likely outcomes in your love life.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does AI love tarot reading differ from traditional?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'AI love tarot reads all your cards together as one relationship narrative rather than giving isolated card meanings. It identifies patterns between cards and weaves them into a cohesive story about your romantic situation.',
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
          <span className="text-stone-300">Love Tarot</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-10 mb-16">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative w-[180px] h-[300px] rounded-md overflow-hidden border border-gold-400/20">
              <Image
                src="/cards/major/m06.jpg"
                alt="The Lovers tarot card — love tarot reading"
                fill
                sizes="180px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs tracking-[0.2em] uppercase text-gold-400/60 mb-2">
              Relationships &middot; Romance &middot; Emotional Clarity
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
              Love Tarot Reading
            </h1>
            <p className="font-body text-lg font-medium text-stone-300 leading-relaxed mb-6">
              Whether you are navigating a new connection, deepening an existing
              relationship, or healing from heartbreak, a love tarot reading
              illuminates the emotional currents shaping your romantic life. Our
              AI reads all your cards together, weaving them into a narrative
              about your love story — not just isolated card meanings.
            </p>
            <Link
              href="/reading/free?topic=love"
              className="inline-block px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all"
            >
              Get a Free Love Reading
            </Link>
          </div>
        </div>

        {/* What Love Tarot Reveals */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            What a Love Tarot Reading Reveals
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Relationship Dynamics',
                desc: 'Understand the energy between you and your partner. Are you aligned or pulling in different directions? What unspoken patterns are at play?',
              },
              {
                title: 'Emotional Blocks',
                desc: 'Identify fears, past wounds, or self-sabotaging patterns that may be preventing you from fully opening up to love.',
              },
              {
                title: 'Compatibility Insights',
                desc: 'Explore how your energies interact with a potential or current partner. The cards reveal shared strengths and areas of friction.',
              },
              {
                title: 'Future Trajectory',
                desc: 'See where your relationship is heading based on current patterns. Not fixed fate — but the path you are on if nothing changes.',
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

        {/* Questions to Ask */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            Questions to Ask in a Love Reading
          </h2>
          <p className="font-body text-sm font-medium text-stone-400 mb-4 leading-relaxed">
            The most powerful love readings come from open-ended questions that
            invite insight rather than demanding a yes/no answer:
          </p>
          <ul className="space-y-3 font-body text-sm font-medium text-stone-300 leading-relaxed">
            {[
              'What energy is shaping my love life right now?',
              'What do I need to understand about my current relationship?',
              'What is blocking me from finding the connection I want?',
              'How can I strengthen the bond with my partner?',
              'What should I know before entering this new relationship?',
              'What lesson is this heartbreak trying to teach me?',
            ].map((q, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gold-400/40 flex-shrink-0">&#10022;</span>
                <span className="italic">&ldquo;{q}&rdquo;</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Key Love Cards */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            Key Cards in Love Readings
          </h2>
          <p className="font-body text-sm font-medium text-stone-400 mb-6 leading-relaxed">
            While every card can appear in a love reading, these cards carry
            particularly strong romantic significance:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {loveCards.map((card) => (
              <Link
                key={card.slug}
                href={`/tarot-card-meanings/${card.slug}`}
                className="group text-center"
              >
                <div className="relative w-full aspect-[2/3] rounded overflow-hidden border border-gold-400/10 group-hover:border-gold-400/30 transition-all mb-2">
                  <Image
                    src={card.image}
                    alt={`${card.name} tarot card`}
                    fill
                    sizes="(max-width: 640px) 80px, 100px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="font-display text-[11px] text-stone-400 group-hover:text-gold-400 transition-colors leading-tight">
                  {card.name}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Best Spreads for Love */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            Best Spreads for Love Questions
          </h2>
          <div className="space-y-4">
            <Link
              href="/spreads/three-card"
              className="group block p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                Three-Card Spread
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                Frame it as You / Them / The Relationship — or Past / Present /
                Future of your love life. Simple and powerful.
              </p>
            </Link>
            <Link
              href="/spreads/celtic-cross"
              className="group block p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                Celtic Cross Spread
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                For complex relationship situations. Ten cards reveal hidden
                fears, external influences, and the likely trajectory of your
                love life.
              </p>
            </Link>
          </div>
        </section>

        {/* Sample Reading */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">&#10022;</span> Sample Love
            Reading
          </h2>
          <div className="p-6 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent">
            <p className="text-xs text-stone-500 mb-4">
              Question: &ldquo;What do I need to understand about my current
              relationship?&rdquo;
            </p>
            <div className="flex gap-4 mb-4">
              {[
                { name: 'Two of Cups', image: '/cards/minor/cups/c02.jpg' },
                { name: 'The Moon', image: '/cards/major/m18.jpg' },
                { name: 'Ten of Pentacles', image: '/cards/minor/pentacles/p10.jpg' },
              ].map((card) => (
                <div key={card.name} className="text-center">
                  <div className="relative w-[55px] h-[90px] rounded overflow-hidden mx-auto mb-1">
                    <Image
                      src={card.image}
                      alt={card.name}
                      fill
                      sizes="55px"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500">{card.name}</p>
                </div>
              ))}
            </div>
            <div className="font-body text-sm font-medium text-stone-300 leading-relaxed italic">
              <p>
                &ldquo;The Two of Cups at the foundation confirms a genuine,
                reciprocal connection — this relationship started from a place of
                mutual recognition. But The Moon in the present reveals that
                something important remains unspoken. There are feelings,
                fears, or truths that neither of you has surfaced yet. This
                is not deception — it is the natural fog that settles when
                vulnerability feels risky. The Ten of Pentacles ahead suggests
                that if you can navigate through this uncertainty with honesty,
                the relationship has the foundation for something lasting and
                deeply secure.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            Love Tarot FAQ
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can tarot predict my love life?',
                a: 'Tarot does not predict a fixed future. It reveals patterns, energies, and dynamics in your romantic life — helping you understand what influences your relationships and what you might consider going forward. Think of it as a mirror, not a crystal ball.',
              },
              {
                q: 'What is the best tarot spread for love questions?',
                a: 'The Three-Card Spread works well for relationship trajectory (past/present/future or you/them/the relationship). For deeper analysis, the Celtic Cross reveals hidden influences, fears, and likely outcomes.',
              },
              {
                q: 'How does AI love tarot differ from traditional?',
                a: 'Our AI reads all your cards together as one relationship narrative rather than giving isolated meanings. It finds patterns between cards and weaves them into a cohesive story about your romantic situation — then you can ask follow-up questions to explore specific aspects.',
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
            Explore Your Love Story
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            Get a free AI love tarot reading. Ask about your relationship,
            compatibility, or what the cards see ahead for your romantic life.
          </p>
          <Link
            href="/reading/free?topic=love"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            Get a Free Love Reading
          </Link>
          <p className="mt-6 font-body text-sm text-stone-500">
            Want to learn what each card means?{' '}
            <Link href="/tarot-card-meanings" className="text-gold-400/70 hover:text-gold-400 transition-colors underline underline-offset-2">
              Explore all 78 tarot card meanings
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
