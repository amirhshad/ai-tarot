import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

const siteUrl = 'https://www.tarotveil.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('spreadSingleCard');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: [
      'one card tarot reading',
      'single card tarot',
      'daily tarot card',
      'one card pull',
      'AI tarot reading',
      'tarot card of the day',
      'yes or no tarot',
    ],
    alternates: buildAlternates('/spreads/single-card'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: `${siteUrl}/spreads/single-card`,
      type: 'article',
    },
  };
}

export default async function SingleCardSpreadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('spreadSingleCard');

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

  const whenToUse = [
    { title: t('useDailyTitle'), desc: t('useDailyDesc') },
    { title: t('useClarityTitle'), desc: t('useClarityDesc') },
    { title: t('useYesNoTitle'), desc: t('useYesNoDesc') },
    { title: t('useLearningTitle'), desc: t('useLearningDesc') },
  ];

  const steps = [
    { step: '1', title: t('step1Title'), desc: t('step1Desc') },
    { step: '2', title: t('step2Title'), desc: t('step2Desc') },
    { step: '3', title: t('step3Title'), desc: t('step3Desc') },
  ];

  const tips = [t('tip1'), t('tip2'), t('tip3'), t('tip4'), t('tip5')];

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
          <Link href="/spreads" className="hover:text-gold-400 transition-colors">
            {t('breadcrumbSpreads')}
          </Link>
          <span>/</span>
          <span className="text-stone-300">{t('breadcrumbSingleCard')}</span>
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
              {t('tagline')}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
              {t('pageTitle')}
            </h1>
            <p className="font-body text-lg font-medium text-stone-300 leading-relaxed mb-6">
              {t('heroDescription')}
            </p>
            <Link
              href="/reading/free"
              className="inline-block px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all"
            >
              {t('ctaButton')}
            </Link>
          </div>
        </div>

        {/* When to use */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            {t('whenToUseTitle')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {whenToUse.map((item) => (
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
            {t('howItWorksTitle')}
          </h2>
          <div className="space-y-6 pl-8 border-l border-gold-400/10">
            {steps.map((item) => (
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
            {t('positionTitle')}
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10 space-y-4">
            <p>{t('positionP1')}</p>
            <p>{t('positionP2')}</p>
          </div>
        </section>

        {/* Sample Reading */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">✦</span> {t('sampleTitle')}
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
                  {t('sampleCardDrawn')}
                </p>
                <p className="font-display text-lg font-semibold text-white">
                  <Link
                    href="/tarot-card-meanings/the-star"
                    className="hover:text-gold-400 transition-colors"
                  >
                    {t('sampleCardName')}
                  </Link>{' '}
                  <span className="text-stone-500 font-normal">&middot; {t('sampleUpright')}</span>
                </p>
              </div>
            </div>
            <div className="font-body text-sm font-medium text-stone-300 leading-relaxed italic">
              <p>&ldquo;{t('sampleText')}&rdquo;</p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            {t('tipsTitle')}
          </h2>
          <ul className="space-y-3 font-body text-sm font-medium text-stone-400 leading-relaxed">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gold-400/40 flex-shrink-0">&middot;</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Related Spreads */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            {t('relatedTitle')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/spreads/three-card"
              className="group p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('relatedThreeCard')}
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                {t('relatedThreeCardDesc')}
              </p>
            </Link>
            <Link
              href="/spreads/celtic-cross"
              className="group p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('relatedCelticCross')}
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                {t('relatedCelticCrossDesc')}
              </p>
            </Link>
          </div>
        </section>

        {/* Explore cards CTA */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            {t('learnTitle')}
          </h2>
          <p className="font-body text-sm font-medium text-stone-400 mb-4">
            {t('learnDesc')}
          </p>
          <Link
            href="/tarot-card-meanings"
            className="text-sm text-gold-400 hover:text-gold-300 transition-colors font-medium"
          >
            {t('learnLink')}
          </Link>
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
            href="/reading/free"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            {t('bottomCtaButton')}
          </Link>
        </section>
      </div>
    </>
  );
}
