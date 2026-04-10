import { setRequestLocale } from 'next-intl/server';
import SubHubPage, { generateSubHubMetadata } from '@/components/seo/SubHubPage';

export const metadata = generateSubHubMetadata('suit-of-pentacles');

export default async function SuitOfPentaclesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SubHubPage configKey="suit-of-pentacles" locale={locale} />;
}
