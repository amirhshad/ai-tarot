import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

const siteUrl = 'https://www.tarotveil.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return {
    title: `${t('pageTitle')} — AI-Powered Narrative Tarot`,
    description:
      'TarotVeil uses AI to weave tarot card readings into cohesive narrative stories. Crypto-random draws, multi-language support, and conversational depth.',
    alternates: buildAlternates('/about'),
    openGraph: {
      title: t('pageTitle'),
      description:
        'AI-powered tarot readings that tell a story. Learn how TarotVeil combines cryptographic randomness with narrative AI interpretation.',
      url: `${siteUrl}/about`,
      type: 'website',
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const tc = await getTranslations('common');

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Breadcrumbs */}
      <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-gold-400 transition-colors">{tc('home')}</Link>
        <span>/</span>
        <span className="text-stone-300">{t('pageTitle')}</span>
      </nav>

      <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-6">
        {t('pageTitle')}
      </h1>

      <div className="font-body text-base font-medium text-stone-300 leading-relaxed space-y-6">
        <p>{t('introP1')}</p>

        <h2 className="font-display text-2xl font-semibold text-white pt-4">
          {t('howItWorksTitle')}
        </h2>
        <p>{t('howItWorksP1')}</p>
        <p>{t('howItWorksP2')}</p>

        <h2 className="font-display text-2xl font-semibold text-white pt-4">
          {t('approachTitle')}
        </h2>
        <p>{t('approachP1')}</p>
        <p>{t('approachP2')}</p>

        <h2 className="font-display text-2xl font-semibold text-white pt-4">
          {t('privacyTitle')}
        </h2>
        <p>{t('privacyP1')}</p>

        <h2 className="font-display text-2xl font-semibold text-white pt-4">
          {t('spreadsTitle')}
        </h2>
        <ul className="space-y-2 pl-4">
          <li className="flex gap-3">
            <span className="text-gold-400/40 flex-shrink-0">-</span>
            <span><strong className="text-white">{t('singleCard')}</strong> — {t('singleCardDesc')}</span>
          </li>
          <li className="flex gap-3">
            <span className="text-gold-400/40 flex-shrink-0">-</span>
            <span><strong className="text-white">{t('threeCard')}</strong> — {t('threeCardDesc')}</span>
          </li>
          <li className="flex gap-3">
            <span className="text-gold-400/40 flex-shrink-0">-</span>
            <span><strong className="text-white">{t('celticCross')}</strong> — {t('celticCrossDesc')}</span>
          </li>
          <li className="flex gap-3">
            <span className="text-gold-400/40 flex-shrink-0">-</span>
            <span><strong className="text-white">{t('horseshoe')}</strong> — {t('horseshoeDesc')}</span>
          </li>
        </ul>

        <h2 className="font-display text-2xl font-semibold text-white pt-4">
          {t('multiLangTitle')}
        </h2>
        <p>{t('multiLangP1')}</p>
      </div>

      {/* CTA */}
      <section className="mt-12 p-8 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent text-center">
        <h2 className="font-display text-xl font-semibold text-white mb-3">
          {t('ctaTitle')}
        </h2>
        <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
          {t('ctaDescription')}
        </p>
        <Link
          href="/reading/free"
          className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
        >
          {t('ctaButton')}
        </Link>
        <p className="mt-6 font-body text-sm text-stone-500">
          {t('exploreLink')}{' '}
          <Link href="/tarot-card-meanings" className="text-gold-400/70 hover:text-gold-400 transition-colors underline underline-offset-2">
            {t('exploreLinkText')}
          </Link>
        </p>
      </section>
    </div>
  );
}
