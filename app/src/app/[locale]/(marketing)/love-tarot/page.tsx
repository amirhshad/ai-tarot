import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

const siteUrl = 'https://www.tarotveil.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('loveTarot');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
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
    alternates: buildAlternates('/love-tarot'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: `${siteUrl}/love-tarot`,
      type: 'article',
    },
  };
}

const loveCards = [
  { name: 'The Lovers', slug: 'the-lovers', image: '/cards/major/m06.jpg' },
  { name: 'Two of Cups', slug: 'two-of-cups', image: '/cards/minor/cups/c02.jpg' },
  { name: 'The Empress', slug: 'the-empress', image: '/cards/major/m03.jpg' },
  { name: 'Ace of Cups', slug: 'ace-of-cups', image: '/cards/minor/cups/c01.jpg' },
  { name: 'Ten of Cups', slug: 'ten-of-cups', image: '/cards/minor/cups/c10.jpg' },
  { name: 'Knight of Cups', slug: 'knight-of-cups', image: '/cards/minor/cups/c12.jpg' },
];

export default async function LoveTarotPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('loveTarot');

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

  const reveals = [
    { title: t('revealDynamicsTitle'), desc: t('revealDynamicsDesc') },
    { title: t('revealBlocksTitle'), desc: t('revealBlocksDesc') },
    { title: t('revealCompatibilityTitle'), desc: t('revealCompatibilityDesc') },
    { title: t('revealTrajectoryTitle'), desc: t('revealTrajectoryDesc') },
  ];

  const questions = [t('q1'), t('q2'), t('q3'), t('q4'), t('q5'), t('q6')];

  const faqs = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
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
            {t('breadcrumbHome')}
          </Link>
          <span>/</span>
          <span className="text-stone-300">{t('breadcrumbLoveTarot')}</span>
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
              {t('tagline')}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
              {t('pageTitle')}
            </h1>
            <p className="font-body text-lg font-medium text-stone-300 leading-relaxed mb-6">
              {t('heroDescription')}
            </p>
            <Link
              href="/reading/free?topic=love"
              className="inline-block px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all"
            >
              {t('ctaButton')}
            </Link>
          </div>
        </div>

        {/* What Love Tarot Reveals */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            {t('revealsTitle')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {reveals.map((item) => (
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
            {t('questionsTitle')}
          </h2>
          <p className="font-body text-sm font-medium text-stone-400 mb-4 leading-relaxed">
            {t('questionsIntro')}
          </p>
          <ul className="space-y-3 font-body text-sm font-medium text-stone-300 leading-relaxed">
            {questions.map((q, i) => (
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
            {t('keyCardsTitle')}
          </h2>
          <p className="font-body text-sm font-medium text-stone-400 mb-6 leading-relaxed">
            {t('keyCardsDesc')}
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
            {t('bestSpreadsTitle')}
          </h2>
          <div className="space-y-4">
            <Link
              href="/spreads/three-card"
              className="group block p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('bestSpreadThreeCard')}
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                {t('bestSpreadThreeCardDesc')}
              </p>
            </Link>
            <Link
              href="/spreads/celtic-cross"
              className="group block p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('bestSpreadCelticCross')}
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                {t('bestSpreadCelticCrossDesc')}
              </p>
            </Link>
          </div>
        </section>

        {/* Sample Reading */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">&#10022;</span> {t('sampleTitle')}
          </h2>
          <div className="p-6 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent">
            <p className="text-xs text-stone-500 mb-4">
              {t('sampleQuestion')}
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
              <p>&ldquo;{t('sampleText')}&rdquo;</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            {t('faqTitle')}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
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
            {t('bottomCtaTitle')}
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            {t('bottomCtaDesc')}
          </p>
          <Link
            href="/reading/free?topic=love"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            {t('bottomCtaButton')}
          </Link>
          <p className="mt-6 font-body text-sm text-stone-500">
            {t('exploreLink')}{' '}
            <Link href="/tarot-card-meanings" className="text-gold-400/70 hover:text-gold-400 transition-colors underline underline-offset-2">
              {t('exploreLinkText')}
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
