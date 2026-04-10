import { setRequestLocale } from 'next-intl/server';
import SubHubPage, { generateSubHubMetadata } from '@/components/seo/SubHubPage';

export const metadata = generateSubHubMetadata('suit-of-wands');

export default async function SuitOfWandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SubHubPage configKey="suit-of-wands" locale={locale} />;
}
