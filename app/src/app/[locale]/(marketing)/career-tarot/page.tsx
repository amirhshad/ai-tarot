import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

const siteUrl = 'https://www.tarotveil.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('careerTarot');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: [
      'career tarot reading',
      'career tarot',
      'work tarot reading',
      'job tarot',
      'AI career reading',
      'professional guidance tarot',
      'career change tarot',
    ],
    alternates: buildAlternates('/career-tarot'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: `${siteUrl}/career-tarot`,
      type: 'article',
    },
  };
}

const careerCards = [
  { name: 'The Emperor', slug: 'the-emperor', image: '/cards/major/m04.jpg' },
  { name: 'The Chariot', slug: 'the-chariot', image: '/cards/major/m07.jpg' },
  { name: 'Ace of Pentacles', slug: 'ace-of-pentacles', image: '/cards/minor/pentacles/p01.jpg' },
  { name: 'Three of Pentacles', slug: 'three-of-pentacles', image: '/cards/minor/pentacles/p03.jpg' },
  { name: 'Eight of Pentacles', slug: 'eight-of-pentacles', image: '/cards/minor/pentacles/p08.jpg' },
  { name: 'King of Wands', slug: 'king-of-wands', image: '/cards/minor/wands/w14.jpg' },
];

export default async function CareerTarotPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('careerTarot');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Career Tarot Reading — AI-Powered Work & Career Guidance',
        description:
          'Explore career decisions and professional growth with AI-powered career tarot readings.',
        author: { '@type': 'Organization', name: 'TarotVeil' },
        publisher: { '@type': 'Organization', name: 'TarotVeil' },
        mainEntityOfPage: `${siteUrl}/career-tarot`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Career Tarot',
            item: `${siteUrl}/career-tarot`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Can tarot help with career decisions?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Tarot can illuminate factors you may not be consciously considering in career decisions — hidden fears, unacknowledged strengths, or environmental dynamics. It is a reflection tool, not a career counselor, but many people find it clarifies their thinking.',
            },
          },
          {
            '@type': 'Question',
            name: 'What tarot cards indicate career success?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Cards like The Chariot (drive and victory), The Emperor (authority and structure), Three of Pentacles (skilled work and collaboration), and Ace of Pentacles (new financial or career opportunities) are traditionally strong indicators of professional success.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the best spread for career questions?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A Three-Card Spread framed as Situation-Action-Outcome works well for specific career decisions. For complex situations like a major career change, the Celtic Cross provides a comprehensive multi-angle view.',
            },
          },
        ],
      },
    ],
  };

  const reveals = [
    { title: t('revealJobTitle'), desc: t('revealJobDesc') },
    { title: t('revealDynamicsTitle'), desc: t('revealDynamicsDesc') },
    { title: t('revealDirectionTitle'), desc: t('revealDirectionDesc') },
    { title: t('revealGrowthTitle'), desc: t('revealGrowthDesc') },
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
          <span className="text-stone-300">{t('breadcrumbCareerTarot')}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-10 mb-16">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative w-[180px] h-[300px] rounded-md overflow-hidden border border-gold-400/20">
              <Image
                src="/cards/major/m07.jpg"
                alt="The Chariot tarot card — career tarot reading"
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
              href="/reading/free?topic=career"
              className="inline-block px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all"
            >
              {t('ctaButton')}
            </Link>
          </div>
        </div>

        {/* What Career Tarot Reveals */}
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

        {/* Questions */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            {t('questionsTitle')}
          </h2>
          <ul className="space-y-3 font-body text-sm font-medium text-stone-300 leading-relaxed">
            {questions.map((q, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gold-400/40 flex-shrink-0">&#10022;</span>
                <span className="italic">&ldquo;{q}&rdquo;</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Key Career Cards */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            {t('keyCardsTitle')}
          </h2>
          <p className="font-body text-sm font-medium text-stone-400 mb-6 leading-relaxed">
            {t('keyCardsDesc')}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {careerCards.map((card) => (
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

        {/* Best Spreads */}
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
                { name: 'Eight of Pentacles', image: '/cards/minor/pentacles/p08.jpg' },
                { name: 'The Hanged Man', image: '/cards/major/m12.jpg' },
                { name: 'Ace of Wands', image: '/cards/minor/wands/w01.jpg' },
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

        {/* Related */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            {t('relatedTitle')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/love-tarot"
              className="group p-4 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-sm font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('relatedLoveTarot')}
              </h3>
              <p className="font-body text-xs font-medium text-stone-500">
                {t('relatedLoveTarotDesc')}
              </p>
            </Link>
            <Link
              href="/yes-or-no"
              className="group p-4 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-sm font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('relatedYesOrNo')}
              </h3>
              <p className="font-body text-xs font-medium text-stone-500">
                {t('relatedYesOrNoDesc')}
              </p>
            </Link>
            <Link
              href="/tarot-card-meanings"
              className="group p-4 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-sm font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('relatedCardMeanings')}
              </h3>
              <p className="font-body text-xs font-medium text-stone-500">
                {t('relatedCardMeaningsDesc')}
              </p>
            </Link>
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
            href="/reading/free?topic=career"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            {t('bottomCtaButton')}
          </Link>
        </section>
      </div>
    </>
  );
}
