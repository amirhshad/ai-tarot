import { setRequestLocale } from 'next-intl/server';
import SubHubPage, { generateSubHubMetadata } from '@/components/seo/SubHubPage';

export const metadata = generateSubHubMetadata('major-arcana');

export default async function MajorArcanaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SubHubPage configKey="major-arcana" locale={locale} />;
}
