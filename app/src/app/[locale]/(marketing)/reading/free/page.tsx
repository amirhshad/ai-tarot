import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import FreeReadingClient from '@/components/reading/FreeReadingClient';
import { buildAlternates } from '@/lib/seo/alternates';

const siteUrl = 'https://www.tarotveil.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('freeReading');

  return {
    title: `${t('pageTitle')} | TarotVeil`,
    description: t('pageSubtitle'),
    alternates: buildAlternates('/reading/free'),
    openGraph: {
      title: `${t('pageTitle')} | TarotVeil`,
      description: t('pageSubtitle'),
      url: `${siteUrl}/reading/free`,
    },
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ topic?: string }>;
}

const VALID_TOPICS = ['general', 'love', 'yes-or-no', 'career'];

export default async function FreeReadingPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { topic } = await searchParams;
  const hasTopic = topic && VALID_TOPICS.includes(topic);

  // If a topic is selected (via URL), render the interactive client component
  if (hasTopic) {
    return <FreeReadingClient language={locale === 'fa' ? 'fa' : 'en'} />;
  }

  const t = await getTranslations('freeReading');

  // Otherwise, render the topic selection as static server HTML (SEO-friendly)
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header — server-rendered for crawlers */}
      <div className="text-center">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-white">
          {t('pageTitle')}
        </h1>
        <p className="text-stone-400 text-sm mt-2">
          {t('pageSubtitle')}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {t('pageNote')}
        </p>
      </div>

      {/* Topic selection — static HTML with links, works without JS */}
      <div className="max-w-lg mx-auto space-y-3">
        <Link
          href="/reading/free?topic=general"
          className="w-full flex items-center gap-4 p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-gold-400/30 hover:bg-white/[0.04] transition-all duration-300 text-left group"
        >
          <span className="text-2xl text-gold-400/50 group-hover:text-gold-400/90 transition-colors w-10 text-center flex-shrink-0">
            &#10024;
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-medium text-white group-hover:text-gold-400 transition-colors">
              {t('topicGeneral')}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">{t('topicGeneralDesc')}</p>
          </div>
        </Link>

        <Link
          href="/reading/free?topic=love"
          className="w-full flex items-center gap-4 p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-gold-400/30 hover:bg-white/[0.04] transition-all duration-300 text-left group"
        >
          <span className="text-2xl text-gold-400/50 group-hover:text-gold-400/90 transition-colors w-10 text-center flex-shrink-0">
            &#9825;
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-medium text-white group-hover:text-gold-400 transition-colors">
              {t('topicLove')}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">{t('topicLoveDesc')}</p>
          </div>
        </Link>

        <Link
          href="/reading/free?topic=career"
          className="w-full flex items-center gap-4 p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-gold-400/30 hover:bg-white/[0.04] transition-all duration-300 text-left group"
        >
          <span className="text-2xl text-gold-400/50 group-hover:text-gold-400/90 transition-colors w-10 text-center flex-shrink-0">
            &#9734;
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-medium text-white group-hover:text-gold-400 transition-colors">
              {t('topicCareer')}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">{t('topicCareerDesc')}</p>
          </div>
        </Link>

        <Link
          href="/reading/free?topic=yes-or-no"
          className="w-full flex items-center gap-4 p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-gold-400/30 hover:bg-white/[0.04] transition-all duration-300 text-left group"
        >
          <span className="text-2xl text-gold-400/50 group-hover:text-gold-400/90 transition-colors w-10 text-center flex-shrink-0">
            &#10710;
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-medium text-white group-hover:text-gold-400 transition-colors">
              {t('topicYesOrNo')}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">{t('topicYesOrNoDesc')}</p>
          </div>
        </Link>
      </div>

      {/* SEO content — visible to crawlers, provides context */}
      <div className="max-w-2xl mx-auto pt-8 border-t border-white/[0.06]">
        <h2 className="font-display text-lg font-medium text-white mb-3">{t('howItWorksTitle')}</h2>
        <div className="grid gap-4 sm:grid-cols-3 text-center">
          <div>
            <div className="text-2xl text-gold-400/60 mb-1">1</div>
            <h3 className="text-sm font-medium text-white">{t('step1Title')}</h3>
            <p className="text-xs text-stone-500 mt-1">{t('step1Desc')}</p>
          </div>
          <div>
            <div className="text-2xl text-gold-400/60 mb-1">2</div>
            <h3 className="text-sm font-medium text-white">{t('step2Title')}</h3>
            <p className="text-xs text-stone-500 mt-1">{t('step2Desc')}</p>
          </div>
          <div>
            <div className="text-2xl text-gold-400/60 mb-1">3</div>
            <h3 className="text-sm font-medium text-white">{t('step3Title')}</h3>
            <p className="text-xs text-stone-500 mt-1">{t('step3Desc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
