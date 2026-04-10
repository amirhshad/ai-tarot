import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getReadingByShareToken } from '@/lib/db/queries';
import { getSpread } from '@/lib/tarot/spreads';
import { deserializeDrawnCards } from '@/lib/tarot/shuffle';

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const reading = await getReadingByShareToken(token);
  if (!reading) return { title: 'Reading Not Found' };

  const spread = getSpread(reading.spread_type);
  const spreadLabel = reading.spread_type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const cardsData = typeof reading.cards === 'string' ? JSON.parse(reading.cards) : reading.cards;
  const cards = spread
    ? deserializeDrawnCards(cardsData, spread.positions)
    : [];
  const cardNames = cards.map(dc => dc.card.name).join(', ');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    title: `${spreadLabel} Tarot Reading`,
    description: `A ${spreadLabel.toLowerCase()} tarot reading with ${cardNames}. Get your own free reading.`,
    openGraph: {
      title: `${spreadLabel} Tarot Reading`,
      description: `Cards drawn: ${cardNames}`,
      type: 'article',
      images: [`${baseUrl}/api/og/reading?token=${token}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${spreadLabel} Tarot Reading`,
      description: `Cards drawn: ${cardNames}`,
      images: [`${baseUrl}/api/og/reading?token=${token}`],
    },
  };
}

export default async function SharedReadingPage({ params }: Props) {
  const { token } = await params;
  const reading = await getReadingByShareToken(token);
  if (!reading) return notFound();

  const spread = getSpread(reading.spread_type);
  const cardsData = typeof reading.cards === 'string' ? JSON.parse(reading.cards) : reading.cards;
  const cards = spread
    ? deserializeDrawnCards(cardsData as { cardId: number; reversed: boolean; positionIndex: number }[], spread.positions)
    : [];

  const spreadLabel = reading.spread_type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-amber-400 text-2xl">&#10022;</span>
            <span className="font-semibold text-white tracking-wide">TarotVeil</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{spreadLabel} Reading</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date(reading.created_at).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {reading.question && (
            <p className="text-gray-300 text-sm mt-2 italic">&ldquo;{reading.question}&rdquo;</p>
          )}
        </div>

        {/* Cards */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Cards Drawn</h2>
          <div className="space-y-2">
            {cards.map((dc, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{dc.position.name}</span>
                <span className="text-white">
                  {dc.card.name}
                  {dc.reversed && (
                    <span className="text-red-400 text-xs ml-1">(Reversed)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-10">
          <h2 className="text-xl font-semibold text-amber-400 mb-4">The Reading</h2>
          <p className="text-amber-50/95 text-base sm:text-lg leading-7 sm:leading-8 whitespace-pre-wrap">
            {reading.interpretation || 'Interpretation not available.'}
          </p>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 p-8 rounded-2xl bg-gradient-to-b from-amber-500/5 to-transparent border border-amber-500/10">
          <p className="text-white font-medium text-lg">Want your own reading?</p>
          <p className="text-gray-400 text-sm">
            Get a personalized tarot reading with AI-powered narrative interpretation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/reading/free"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-colors"
            >
              Try a Free Reading
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 border border-white/15 text-white hover:border-amber-400/50 hover:text-amber-400 rounded-xl transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
