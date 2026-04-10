'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');

  return (
    <footer className="border-t border-white/10 bg-black/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} TarotVeil.{' '}
          {t('disclaimer')}
        </p>
        <div className="flex gap-4">
          <Link href="/tarot-card-meanings" className="hover:text-gray-300 transition-colors">
            {tn('cardMeanings')}
          </Link>
          <Link href="/spreads" className="hover:text-gray-300 transition-colors">
            {tn('spreads')}
          </Link>
          <Link href="/about" className="hover:text-gray-300 transition-colors">
            {tn('about')}
          </Link>
          <Link href="/privacy" className="hover:text-gray-300 transition-colors">
            {t('privacy')}
          </Link>
          <Link href="/terms" className="hover:text-gray-300 transition-colors">
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
