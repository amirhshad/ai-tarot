import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

  return {
    title: t('loginTitle'),
  };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-amber-400 text-4xl mb-3">&#10022;</div>
          <h1 className="text-2xl font-bold text-white">{t('loginTitle')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('loginSubtitle')}</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
