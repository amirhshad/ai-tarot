import { Link } from '@/i18n/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('errors');
  const tc = await getTranslations('common');
  const tn = await getTranslations('nav');

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <p className="font-display text-6xl font-bold text-gold-400/30 mb-4">404</p>
          <h1 className="font-display text-2xl font-semibold text-white mb-3">
            {t('notFoundTitle')}
          </h1>
          <p className="font-body text-base font-medium text-stone-400 mb-8">
            {t('notFoundDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-2.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all"
            >
              {t('goHome')}
            </Link>
            <Link
              href="/reading/free"
              className="px-6 py-2.5 border border-gold-400/20 text-gold-400 font-display font-semibold text-sm tracking-wide rounded-sm hover:border-gold-400/40 transition-all"
            >
              {tc('getFreeReading')}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/tarot-card-meanings" className="text-stone-500 hover:text-gold-400 transition-colors">
              {tn('cardMeanings')}
            </Link>
            <Link href="/spreads" className="text-stone-500 hover:text-gold-400 transition-colors">
              {tn('spreads')}
            </Link>
            <Link href="/love-tarot" className="text-stone-500 hover:text-gold-400 transition-colors">
              {t('loveTarot')}
            </Link>
            <Link href="/yes-or-no" className="text-stone-500 hover:text-gold-400 transition-colors">
              {t('yesOrNo')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
