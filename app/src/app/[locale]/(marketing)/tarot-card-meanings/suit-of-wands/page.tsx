import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { assertCardContentLocale } from '@/lib/seo/alternates';
import SubHubPage, { generateSubHubMetadata } from '@/components/seo/SubHubPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generateSubHubMetadata('suit-of-wands', locale);
}

export default async function SuitOfWandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Arabic card content lands in Phase 2. Until then this route would render
  // English card text under an /ar/ URL, which is duplicate content in the
  // Arabic namespace.
  assertCardContentLocale(locale);

  setRequestLocale(locale);
  return <SubHubPage configKey="suit-of-wands" locale={locale} />;
}
