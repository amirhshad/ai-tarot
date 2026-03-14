import { getSessionUser } from '@/lib/db/auth';
import { getProfile, getReading, getFollowUps } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { getSpread } from '@/lib/tarot/spreads';
import { deserializeDrawnCards } from '@/lib/tarot/shuffle';
import FollowUpChat from '@/components/reading/FollowUpChat';
import ShareButton from '@/components/reading/ShareButton';
import ReadingFeedback from '@/components/reading/ReadingFeedback';

export default async function ReadingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user) return notFound();

  const reading = await getReading(id, user.id);
  if (!reading) return notFound();

  const profile = await getProfile(user.id);
  const followUps = await getFollowUps(id);

  const spread = getSpread(reading.spread_type);
  const cardsData = typeof reading.cards === 'string' ? JSON.parse(reading.cards) : reading.cards;
  const cards = spread
    ? deserializeDrawnCards(cardsData as { cardId: number; reversed: boolean; positionIndex: number }[], spread.positions)
    : [];

  const language = (profile?.language || 'en') as 'en' | 'fa';

  return (
    <div className="max-w-2xl mx-auto space-y-8" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white capitalize">
          {reading.spread_type.replace('-', ' ')} Reading
        </h1>
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
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Cards Drawn</h2>
        <div className="space-y-2">
          {cards.map((dc, i) => {
            const name = language === 'en' ? dc.card.name : dc.card.nameFA;
            const posName = language === 'en' ? dc.position.name : dc.position.nameFA;
            return (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{posName}</span>
                <span className="text-white">
                  {name}
                  {dc.reversed && (
                    <span className="text-red-400 text-xs ml-1">(Reversed)</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interpretation */}
      <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
        <h2 className="text-xl font-semibold text-amber-400 mb-4">
          {language === 'en' ? 'Your Reading' : 'خوانش شما'}
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-amber-50/95 text-base sm:text-lg leading-7 sm:leading-8 whitespace-pre-wrap">
            {reading.interpretation || 'Interpretation not available.'}
          </p>
        </div>
      </div>

      {/* Feedback */}
      <ReadingFeedback
        readingId={id}
        initialFeedback={reading.feedback === 1 ? true : reading.feedback === 0 ? false : null}
      />

      {/* Share */}
      <div className="flex justify-end">
        <ShareButton
          readingId={id}
          existingShareUrl={reading.share_token ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}/s/${reading.share_token}` : null}
        />
      </div>

      {/* Follow-up Chat */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
        <h2 className="text-lg font-semibold text-white mb-4">
          {language === 'en' ? 'Ask Follow-up Questions' : 'سؤالات بعدی'}
        </h2>
        <FollowUpChat
          readingId={id}
          tier={profile?.tier || 'free'}
          existingMessages={followUps.map(f => ({ role: f.role as 'user' | 'assistant', content: f.content }))}
          language={language}
        />
      </div>
    </div>
  );
}
