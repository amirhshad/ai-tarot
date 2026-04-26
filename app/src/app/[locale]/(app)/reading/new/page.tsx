'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import SpreadSelector from '@/components/reading/SpreadSelector';
import Deck from '@/components/tarot/Deck';
import SpreadLayout from '@/components/tarot/SpreadLayout';
import { SpreadType, DrawnCard } from '@/lib/tarot/types';
import { drawCards } from '@/lib/tarot/shuffle';
import { getSpread } from '@/lib/tarot/spreads';
import { serializeDrawnCards } from '@/lib/tarot/shuffle';
import type { ReadingTopic } from '@/lib/ai/prompts';
import ReadingLoadingAnimation from '@/components/reading/ReadingLoadingAnimation';

type Step = 'topic' | 'select-spread' | 'question' | 'draw' | 'reveal' | 'interpret';

const TOPICS: { key: ReadingTopic; title: string; titleFA: string; desc: string; descFA: string; symbol: string }[] = [
  { key: null, title: 'General Reading', titleFA: 'فال عمومی', desc: 'Open-ended — explore whatever comes up', descFA: 'آزاد — هر آنچه پیش آید کاوش کنید', symbol: '✨' },
  { key: 'love', title: 'Love & Relationships', titleFA: 'عشق و روابط', desc: 'Romantic connections, compatibility, emotional clarity', descFA: 'ارتباطات عاشقانه، سازگاری، وضوح عاطفی', symbol: '♡' },
  { key: 'career', title: 'Career & Work', titleFA: 'شغل و کار', desc: 'Professional path, growth, and direction', descFA: 'مسیر حرفه‌ای، رشد و جهت‌گیری', symbol: '☆' },
  { key: 'yes-or-no', title: 'Yes or No', titleFA: 'بله یا خیر', desc: 'A direct answer to your question', descFA: 'پاسخی مستقیم به سؤال شما', symbol: '⧖' },
];

// Yes/No topic only supports simple spreads
const YES_NO_SPREADS: SpreadType[] = ['single', 'three-card'];

export default function NewReadingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('topic');
  const [topic, setTopic] = useState<ReadingTopic>(null);
  const [spreadType, setSpreadType] = useState<SpreadType | null>(null);
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState('');
  const [readingId, setReadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showInterpretation, setShowInterpretation] = useState(false);
  const loadingStartRef = useRef<number>(0);

  const locale = useLocale();
  const language = (locale === 'fa' ? 'fa' : 'en') as 'en' | 'fa';
  const [tier, setTier] = useState<string>('free');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setTier(data.profile.tier || 'free');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (interpretation) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShowInterpretation(true);
        });
      });
    } else {
      setShowInterpretation(false);
    }
  }, [interpretation]);

  const en = language === 'en';

  const questionPlaceholder = topic === 'love'
    ? (en ? 'What would you like to know about your love life?' : 'درباره زندگی عاشقانه‌تان چه می‌خواهید بدانید؟')
    : topic === 'career'
      ? (en ? 'What would you like to know about your career?' : 'درباره مسیر شغلی‌تان چه می‌خواهید بدانید؟')
      : topic === 'yes-or-no'
        ? (en ? 'Ask a yes or no question…' : 'یک سؤال بله یا خیر بپرسید…')
        : (en ? "What's on your mind? (optional — leave blank for a general reading)" : 'چه چیزی در ذهنتان است؟ (اختیاری — برای فال عمومی خالی بگذارید)');

  function handleSelectTopic(t: ReadingTopic) {
    setTopic(t);
    setSpreadType(null);
    setStep('select-spread');
  }

  function handleSelectSpread(type: SpreadType) {
    setSpreadType(type);
    setStep('question');
  }

  function handleQuestion() {
    setStep('draw');
  }

  function handleDraw() {
    if (!spreadType) return;
    const spread = getSpread(spreadType);
    if (!spread) return;

    setIsDrawing(true);
    setTimeout(() => {
      const cards = drawCards(spread.cardCount, spread.positions);
      setDrawnCards(cards);
      setIsDrawing(false);
      setStep('reveal');
    }, 500);
  }

  function handleRevealCard(index: number) {
    setRevealedIndices(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  function handleRevealAll() {
    const allIndices = new Set(drawnCards.map((_, i) => i));
    setRevealedIndices(allIndices);
  }

  const allRevealed = drawnCards.length > 0 && revealedIndices.size === drawnCards.length;

  async function handleGetReading() {
    if (!spreadType || drawnCards.length === 0) return;
    setIsInterpreting(true);
    setError('');
    setInterpretation('');

    try {
      const response = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadType,
          cards: serializeDrawnCards(drawnCards),
          question: question || undefined,
          topic: topic || undefined,
          language,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get reading');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      setStep('interpret');
      loadingStartRef.current = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              const elapsed = Date.now() - loadingStartRef.current;
              const minDisplayTime = 2000;
              if (elapsed < minDisplayTime) {
                await new Promise((r) => setTimeout(r, minDisplayTime - elapsed));
              }
              setInterpretation(data.fullText);
              setReadingId(data.readingId);
              break;
            }
            if (data.error) {
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsInterpreting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{en ? 'New Reading' : 'فال جدید'}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {step === 'topic' && (en ? 'What would you like guidance on?' : 'در چه موضوعی راهنمایی می‌خواهید؟')}
          {step === 'select-spread' && (en ? 'Choose your spread type' : 'نوع گسترش را انتخاب کنید')}
          {step === 'question' && (topic === 'yes-or-no' ? (en ? 'Ask a clear question for a direct answer' : 'یک سؤال روشن برای پاسخ مستقیم بپرسید') : (en ? 'What would you like to explore? (optional)' : 'چه چیزی را می‌خواهید کاوش کنید؟ (اختیاری)'))}
          {step === 'draw' && (en ? 'Focus your energy and draw your cards' : 'انرژی خود را متمرکز کنید و کارت‌ها را بکشید')}
          {step === 'reveal' && (en ? 'Tap each card to reveal it' : 'روی هر کارت بزنید تا آشکار شود')}
          {step === 'interpret' && (en ? 'Your reading is unfolding...' : 'فال شما در حال آشکار شدن است...')}
        </p>
      </div>

      {/* Step: Topic */}
      {step === 'topic' && (
        <div className="max-w-lg mx-auto space-y-3">
          {TOPICS.map((t) => (
            <button
              key={t.title}
              onClick={() => handleSelectTopic(t.key)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-amber-400/30 hover:bg-white/[0.04] transition-all text-left group"
            >
              <span className="text-2xl text-amber-400/50 group-hover:text-amber-400/90 transition-colors w-10 text-center flex-shrink-0">
                {t.symbol}
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-medium text-white group-hover:text-amber-400 transition-colors">
                  {en ? t.title : t.titleFA}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{en ? t.desc : t.descFA}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step: Select Spread */}
      {step === 'select-spread' && (
        <div className="space-y-4">
          <SpreadSelector
            tier={tier}
            selectedSpread={spreadType}
            onSelect={handleSelectSpread}
            language={language}
            allowedSpreads={topic === 'yes-or-no' ? YES_NO_SPREADS : undefined}
          />
          <div className="text-center">
            <button
              onClick={() => setStep('topic')}
              className="px-6 py-2.5 border border-white/15 text-gray-400 rounded-xl text-sm hover:border-white/30 transition-colors"
            >
              {en ? 'Back' : 'بازگشت'}
            </button>
          </div>
        </div>
      )}

      {/* Step: Question */}
      {step === 'question' && (
        <div className="max-w-md mx-auto space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={questionPlaceholder}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 resize-none"
          />
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStep('select-spread')}
              className="px-6 py-2.5 border border-white/15 text-gray-400 rounded-xl text-sm hover:border-white/30 transition-colors"
            >
              {en ? 'Back' : 'بازگشت'}
            </button>
            <button
              onClick={handleQuestion}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-xl text-sm transition-colors"
            >
              {en ? 'Continue' : 'ادامه'}
            </button>
          </div>
        </div>
      )}

      {/* Step: Draw */}
      {step === 'draw' && (
        <div className="flex justify-center py-8">
          <Deck
            onDraw={handleDraw}
            isDrawing={isDrawing}
            cardsRemaining={spreadType ? getSpread(spreadType)?.cardCount : undefined}
          />
        </div>
      )}

      {/* Step: Reveal */}
      {(step === 'reveal' || step === 'interpret') && drawnCards.length > 0 && spreadType && (
        <div className="space-y-6">
          <SpreadLayout
            cards={drawnCards}
            spreadType={spreadType}
            revealedIndices={revealedIndices}
            onRevealCard={handleRevealCard}
            language={language}
          />

          {step === 'reveal' && !allRevealed && (
            <div className="text-center">
              <button
                onClick={handleRevealAll}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                {en ? 'Reveal all cards' : 'نمایش همه کارت‌ها'}
              </button>
            </div>
          )}

          {step === 'reveal' && allRevealed && (
            <div className="text-center">
              <button
                onClick={handleGetReading}
                disabled={isInterpreting}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-xl text-lg transition-colors"
              >
                {isInterpreting ? (en ? 'Reading the cards...' : 'در حال خواندن کارت‌ها...') : (en ? 'Get Your Reading' : 'دریافت فال')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: Interpret — Loading Animation */}
      {step === 'interpret' && !interpretation && (
        <ReadingLoadingAnimation cardCount={drawnCards.length} language={language} />
      )}

      {/* Step: Interpret — Revealed Reading */}
      {step === 'interpret' && interpretation && (
        <div
          className="max-w-2xl mx-auto space-y-6 transition-opacity duration-[600ms] ease-in"
          style={{ opacity: showInterpretation ? 1 : 0 }}
        >
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              {language === 'fa' ? 'خوانش شما' : 'Your Reading'}
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-amber-50/95 text-base sm:text-lg leading-7 sm:leading-8 whitespace-pre-wrap">
                {interpretation}
              </p>
            </div>
          </div>

          {readingId && (
            <div className="text-center">
              <button
                onClick={() => router.push(`/reading/${readingId}`)}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-gray-200 font-medium rounded-xl text-sm transition-colors"
              >
                {en ? 'View Full Reading & Follow-up' : 'مشاهده فال کامل و سؤالات بعدی'}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto p-4 rounded-xl bg-red-900/20 border border-red-700/30 text-center">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
