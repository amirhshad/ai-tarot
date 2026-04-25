import { useTranslations } from 'next-intl';

export default function Disclaimer() {
  const t = useTranslations('common');
  return (
    <p className="text-xs text-stone-500 text-center mt-8">
      {t('tarotDisclaimer')}
    </p>
  );
}
