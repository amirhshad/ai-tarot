import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import CardMeaningLink from '@/components/seo/CardMeaningLink';
import Image from 'next/image';
import { getDailyCard, getTodayDateStr } from '@/lib/tarot/daily';
import { generateCompletion, getDailyMaxTokens } from '@/lib/ai/client';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';
import { HTML_LANG, toLocale, type Locale } from '@/i18n/locales';
import { cardName as getCardName, cardKeywords as getCardKeywords } from '@/lib/tarot/localized';

export const revalidate = 86400; // ISR: regenerate once per day

const DAILY_SYSTEM_PROMPT: Record<Locale, string> = {
  en: `You are a wise and warm tarot reader. Provide today's daily card interpretation.
Write 100-150 words covering:
1. The card's core energy for today
2. Practical guidance for the reader
3. An uplifting closing thought

Be warm, specific, and conversational. Avoid generic platitudes. Write as if speaking directly to someone starting their day.
Do NOT use markdown formatting — no #, ##, **, or * symbols. Write in plain text only.`,
  fa: `شما یک فالگیر خردمند و مهربان تاروت هستید. تفسیر کارت روز را ارائه دهید.
۱۰۰ تا ۱۵۰ کلمه بنویسید که شامل:
۱. انرژی اصلی کارت برای امروز
۲. راهنمایی عملی برای خواننده
۳. یک فکر امیدبخش در پایان

به فارسی روان بنویسید. گرم، خاص و مکالمه‌ای باشید. از کلیشه‌ها پرهیز کنید. طوری بنویسید که انگار مستقیماً با کسی صحبت می‌کنید که روز خود را آغاز می‌کند.
از قالب‌بندی مارک‌داون استفاده نکنید — بدون #، ##، ** یا *. فقط متن ساده بنویسید.`,
  ar: `أنت قارئ تاروت حكيم ودافئ. قدّم تفسير بطاقة اليوم.
اكتب من 100 إلى 150 كلمة تتناول:
1. طاقة البطاقة الجوهرية لهذا اليوم
2. إرشاداً عملياً للقارئ
3. خاتمة تبعث على الأمل

اكتب بعربية فصحى سليمة وسهلة. كن دافئاً ومحدداً وقريباً من روح الحديث. تجنّب العبارات العامة المحفوظة. اكتب كأنك تخاطب شخصاً يبدأ يومه الآن.
لا تستخدم تنسيق ماركداون — بلا #، ##، ** أو *. اكتب نصاً عادياً فقط.`,
};

const DAILY_USER_MESSAGE: Record<Locale, (cardName: string, keywords: string[]) => string> = {
  en: (cardName, keywords) =>
    `Today's daily card is: ${cardName}\nKeywords: ${keywords.join(', ')}\n\nProvide today's daily tarot card interpretation.`,
  fa: (cardName, keywords) =>
    `کارت تاروت امروز: ${cardName}\nکلمات کلیدی: ${keywords.join('، ')}\n\nتفسیر کارت تاروت امروز را ارائه دهید.`,
  ar: (cardName, keywords) =>
    `بطاقة التاروت لهذا اليوم: ${cardName}\nالكلمات المفتاحية: ${keywords.join('، ')}\n\nقدّم تفسير بطاقة التاروت لهذا اليوم.`,
};

/**
 * Keyword-list separator per locale, mirroring KEYWORD_JOIN in prompts.ts.
 * The meta description's keyword list is user-visible in the SERP snippet, so
 * Arabic and Farsi need U+060C rather than a Latin comma.
 */
const KEYWORD_JOIN: Record<Locale, string> = {
  en: ', ',
  fa: '، ',
  ar: '، ',
};

/** Strip markdown formatting from AI output */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')  // headings
    .replace(/\*\*(.+?)\*\*/g, '$1')  // bold
    .replace(/\*(.+?)\*/g, '$1')  // italic
    .replace(/__(.+?)__/g, '$1')  // bold alt
    .replace(/_(.+?)_/g, '$1')  // italic alt
    .trim();
}

async function getDailyInterpretation(cardName: string, keywords: string[], locale: Locale): Promise<string> {
  const systemPrompt = DAILY_SYSTEM_PROMPT[locale];
  const userMessage = DAILY_USER_MESSAGE[locale](cardName, keywords);
  return generateCompletion(systemPrompt, userMessage, getDailyMaxTokens(locale), locale);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('daily');
  const current = toLocale(locale);
  const dateStr = getTodayDateStr();
  const card = getDailyCard(dateStr);
  const cardName = getCardName(card, current);
  const keywords = getCardKeywords(card, current).slice(0, 3).join(KEYWORD_JOIN[current]);
  const today = new Date().toLocaleDateString(HTML_LANG[current], { month: 'long', day: 'numeric', year: 'numeric' });

  return {
    title: t('metaTitle', { today, card: cardName }),
    description: t('metaDescription', { card: cardName, keywords }),
    alternates: buildAlternates('/daily', locale),
    openGraph: {
      title: t('ogTitle', { card: cardName, today }),
      description: t('ogDescription', { card: cardName }),
      type: 'article',
    },
  };
}

export default async function DailyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('daily');
  const tc = await getTranslations('common');

  const current = toLocale(locale);
  const dateStr = getTodayDateStr();
  const card = getDailyCard(dateStr);
  const cardName = getCardName(card, current);
  const cardKeywords = getCardKeywords(card, current);
  const today = new Date().toLocaleDateString(HTML_LANG[current], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const rawInterpretation = await getDailyInterpretation(cardName, cardKeywords, current);
  const interpretation = stripMarkdown(rawInterpretation);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-amber-400/80 text-sm font-medium uppercase tracking-wider mb-2">
          {t('label')}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          {cardName}
        </h1>
        <p className="text-gray-500 text-sm">{today}</p>
      </div>

      {/* Card Image */}
      <div className="flex justify-center mb-10">
        <div className="relative w-48 sm:w-56 aspect-[224/384] rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-amber-900/20">
          <Image
            src={card.image}
            alt={cardName}
            fill
            sizes="(min-width: 640px) 224px, 192px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {cardKeywords.map((kw) => (
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
        <CardMeaningLink
          slug={card.name.toLowerCase().replace(/\s+/g, '-')}
          className="text-sm text-gray-500"
          linkClassName="hover:text-amber-400 transition-colors"
        >
          {tc('learnMore')} {cardName} &rarr;
        </CardMeaningLink>
      </div>
    </div>
  );
}
