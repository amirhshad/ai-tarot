import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal');

  return {
    title: t('termsTitle'),
    description: 'TarotVeil terms of service. Usage terms for our AI-powered tarot reading platform.',
    alternates: buildAlternates('/terms'),
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal');

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-8">
        {t('termsTitle')}
      </h1>
      <div className="font-body text-base font-medium leading-relaxed space-y-6">
        <p className="text-stone-400 text-sm">{t('termsLastUpdated')}</p>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('terms1Title')}</h2>
          <p className="text-stone-300">{t('terms1Content')}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('terms2Title')}</h2>
          <p className="text-stone-300">{t('terms2Content')}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('terms3Title')}</h2>
          <p className="text-stone-300">{t('terms3Content')}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('terms4Title')}</h2>
          <p className="text-stone-300">{t('terms4Content')}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('terms5Title')}</h2>
          <p className="text-stone-300">{t('terms5Content')}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('terms6Title')}</h2>
          <p className="text-stone-300">{t('terms6Content')}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('terms7Title')}</h2>
          <p className="text-stone-300">{t('terms7Content')}</p>
        </section>
      </div>
    </div>
  );
}
