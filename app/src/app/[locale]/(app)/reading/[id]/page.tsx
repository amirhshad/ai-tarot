import { getSessionUser } from '@/lib/db/auth';
import { getProfile, getReading, getFollowUps } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { getSpread } from '@/lib/tarot/spreads';
import { deserializeDrawnCards } from '@/lib/tarot/shuffle';
import Image from 'next/image';
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
    <div className="max-w-2xl mx-auto space-y-8">
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
        <h2 className="text-sm font-medium text-gray-500 mb-4">
          {language === 'en' ? 'Cards Drawn' : 'کارت‌های کشیده شده'}
        </h2>
        <div className={`flex justify-center gap-4 ${cards.length > 3 ? 'flex-wrap' : ''}`}>
          {cards.map((dc, i) => {
            const name = language === 'en' ? dc.card.name : dc.card.nameFA;
            const posName = language === 'en' ? dc.position.name : dc.position.nameFA;
            return (
              <div key={i} className="flex flex-col items-center text-center w-[90px] sm:w-[110px]">
                <div className={`relative w-[80px] h-[133px] sm:w-[100px] sm:h-[167px] rounded-md overflow-hidden border border-amber-400/20 ${dc.reversed ? 'rotate-180' : ''}`}>
                  <Image
                    src={dc.card.image}
                    alt={dc.card.name}
                    fill
                    sizes="(max-width: 640px) 80px, 100px"
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{posName}</p>
                <p className="text-xs text-white font-medium mt-0.5">{name}</p>
                {dc.reversed && (
                  <span className="text-[10px] text-red-400 mt-0.5">
                    {language === 'en' ? 'Reversed' : 'معکوس'}
                  </span>
                )}
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
