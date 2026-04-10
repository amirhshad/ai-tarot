import { setRequestLocale } from 'next-intl/server';
import SubHubPage, { generateSubHubMetadata } from '@/components/seo/SubHubPage';

export const metadata = generateSubHubMetadata('suit-of-cups');

export default async function SuitOfCupsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SubHubPage configKey="suit-of-cups" locale={locale} />;
}
