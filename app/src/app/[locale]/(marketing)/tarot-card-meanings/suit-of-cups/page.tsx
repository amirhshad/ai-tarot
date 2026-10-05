import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { toLocale } from '@/i18n/locales';
import { CARD_CONTENT_LOCALES } from '@/lib/seo/alternates';
import SubHubPage, { generateSubHubMetadata } from '@/components/seo/SubHubPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generateSubHubMetadata('suit-of-cups', locale);
}

export default async function SuitOfCupsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Arabic card content lands in Phase 2. Until then this route would render
  // English card text under an /ar/ URL, which is duplicate content in the
  // Arabic namespace.
  if (!CARD_CONTENT_LOCALES.includes(toLocale(locale))) notFound();

  setRequestLocale(locale);
  return <SubHubPage configKey="suit-of-cups" locale={locale} />;
}
