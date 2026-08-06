import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';
import HomeLanding from './HomeLanding';

/**
 * Server wrapper for the landing page.
 * The landing UI itself is a client component ('use client'), which cannot
 * export metadata — so the canonical + hreflang tags live here.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: buildAlternates('/', locale),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeLanding />;
}
