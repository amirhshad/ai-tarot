import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal');

  return {
    title: t('privacyTitle'),
    description: 'TarotVeil privacy policy. Learn how we handle your data, readings, and personal information.',
    alternates: buildAlternates('/privacy'),
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal');

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-8">
        {t('privacyTitle')}
      </h1>
      <div className="font-body text-base font-medium leading-relaxed space-y-6">
        <p className="text-stone-400 text-sm">{t('privacyLastUpdated')}</p>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('privacy1Title')}</h2>
          <p className="text-stone-300">{t('privacy1Content')}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('privacy2Title')}</h2>
          <p className="text-stone-300">{t('privacy2Content')}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('privacy3Title')}</h2>
          <p className="text-stone-300">{t('privacy3Content')}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('privacy4Title')}</h2>
          <p className="text-stone-300">{t('privacy4Content')}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('privacy5Title')}</h2>
          <p className="text-stone-300">{t('privacy5Content')}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('privacy6Title')}</h2>
          <p className="text-stone-300">{t('privacy6Content')}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">{t('privacy7Title')}</h2>
          <p className="text-stone-300">{t('privacy7Content')}</p>
        </section>
      </div>
    </div>
  );
}
