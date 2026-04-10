import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getDailyCard, getTodayDateStr } from '@/lib/tarot/daily';
import { generateCompletion } from '@/lib/ai/client';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

export const revalidate = 86400; // ISR: regenerate once per day

const DAILY_SYSTEM_PROMPT = `You are a wise and warm tarot reader. Provide today's daily card interpretation.
Write 100-150 words covering:
1. The card's core energy for today
2. Practical guidance for the reader
3. An uplifting closing thought

Be warm, specific, and conversational. Avoid generic platitudes. Write as if speaking directly to someone starting their day.`;

async function getDailyInterpretation(cardName: string, keywords: string[]): Promise<string> {
  const userMessage = `Today's daily card is: ${cardName}\nKeywords: ${keywords.join(', ')}\n\nProvide today's daily tarot card interpretation.`;
  return generateCompletion(DAILY_SYSTEM_PROMPT, userMessage, 300);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const dateStr = getTodayDateStr();
  const card = getDailyCard(dateStr);
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return {
    title: `Daily Tarot Card — ${today} — ${card.name}`,
    description: `Today's tarot card is ${card.name}. Discover what this card means for your day with our free daily tarot reading. Keywords: ${card.keywords.slice(0, 3).join(', ')}.`,
    alternates: buildAlternates('/daily'),
    openGraph: {
      title: `Daily Tarot: ${card.name} — ${today}`,
      description: `Today's card is ${card.name}. See what the tarot has in store for you today.`,
      type: 'article',
    },
  };
}

export default async function DailyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('daily');
  const tc = await getTranslations('common');

  const dateStr = getTodayDateStr();
  const card = getDailyCard(dateStr);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const interpretation = await getDailyInterpretation(card.name, card.keywords);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-amber-400/80 text-sm font-medium uppercase tracking-wider mb-2">
          {t('label')}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          {card.name}
        </h1>
        <p className="text-gray-500 text-sm">{today}</p>
      </div>

      {/* Card Image */}
      <div className="flex justify-center mb-10">
        <div className="relative w-48 sm:w-56 aspect-[224/384] rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-amber-900/20">
          <Image
            src={card.image}
            alt={card.name}
            fill
            sizes="(min-width: 640px) 224px, 192px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {card.keywords.map((kw) => (
          <span
            key={kw}
            className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20"
          >
            {kw}
          </span>
        ))}
      </div>

      {/* Interpretation */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-10">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">
          {t('todaysMessage')}
        </h2>
        <p className="text-amber-50/90 text-base sm:text-lg leading-7 sm:leading-8 whitespace-pre-wrap">
          {interpretation}
        </p>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4">
        <p className="text-gray-400 text-sm">
          {t('deeperReading')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/reading/free"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-colors text-center"
          >
            {tc('getFreeReading')}
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 border border-white/15 text-white hover:border-amber-400/50 hover:text-amber-400 rounded-xl transition-colors text-center"
          >
            {t('signUpAccess')}
          </Link>
        </div>
      </div>

      {/* Learn more link */}
      <div className="text-center mt-12">
        <Link
          href={`/tarot-card-meanings/${card.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-sm text-gray-500 hover:text-amber-400 transition-colors"
        >
          {tc('learnMore')} {card.name} &rarr;
        </Link>
      </div>
    </div>
  );
}
