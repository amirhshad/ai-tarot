import { setRequestLocale } from 'next-intl/server';
import SubHubPage, { generateSubHubMetadata } from '@/components/seo/SubHubPage';

export const metadata = generateSubHubMetadata('suit-of-swords');

export default async function SuitOfSwordsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SubHubPage configKey="suit-of-swords" locale={locale} />;
}
