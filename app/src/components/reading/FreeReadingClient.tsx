'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Deck from '@/components/tarot/Deck';
import SpreadLayout from '@/components/tarot/SpreadLayout';
import UpsellPanel from '@/components/reading/UpsellPanel';
import ReadingFeedback from '@/components/reading/ReadingFeedback';
import { DrawnCard } from '@/lib/tarot/types';
import { drawCards, serializeDrawnCards } from '@/lib/tarot/shuffle';
import { getSpread } from '@/lib/tarot/spreads';
import type { ReadingTopic } from '@/lib/ai/prompts';

type Step = 'question' | 'draw' | 'reveal' | 'interpret';

const FREE_READING_KEY = 'tarotveil_anonymous_reading';

const TOPIC_CONFIG: Record<string, { title: string; titleFA: string; subtitle: string; subtitleFA: string; placeholder: string; placeholderFA: string; label: string; labelFA: string }> = {
  love: {
    title: 'Your Love Reading', titleFA: 'فال عشق شما',
    subtitle: 'Focus on your heart\u2019s question', subtitleFA: 'روی سؤال قلبی‌تان تمرکز کنید',
    placeholder: 'What would you like to know about your love life?', placeholderFA: 'درباره زندگی عاشقانه‌تان چه می‌خواهید بدانید؟',
    label: 'Love Reading', labelFA: 'فال عشق',
  },
  'yes-or-no': {
    title: 'Your Yes or No Reading', titleFA: 'فال بله یا خیر شما',
    subtitle: 'Ask a clear question for a direct answer', subtitleFA: 'یک سؤال روشن برای پاسخ مستقیم بپرسید',
    placeholder: 'Ask a yes or no question\u2026', placeholderFA: 'یک سؤال بله یا خیر بپرسید…',
    label: 'Yes or No Reading', labelFA: 'فال بله یا خیر',
  },
  career: {
    title: 'Your Career Reading', titleFA: 'فال شغلی شما',
    subtitle: 'Explore your professional path', subtitleFA: 'مسیر حرفه‌ای خود را کاوش کنید',
    placeholder: 'What would you like to know about your career?', placeholderFA: 'درباره مسیر شغلی‌تان چه می‌خواهید بدانید؟',
    label: 'Career Reading', labelFA: 'فال شغلی',
  },
};

export default function FreeReadingClient({ language = 'en' }: { language?: 'en' | 'fa' }) {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-12 text-center text-stone-400">{language === 'fa' ? 'در حال بارگذاری...' : 'Loading your reading...'}</div>}>
      <FreeReadingContent language={language} />
    </Suspense>
  );
}

function FreeReadingContent({ language }: { language: 'en' | 'fa' }) {
  const en = language === 'en';
  const searchParams = useSearchParams();
  const rawTopic = searchParams.get('topic');
  const selectedTopic: ReadingTopic = rawTopic && rawTopic in TOPIC_CONFIG ? rawTopic as ReadingTopic : null;
  const topicConfig = selectedTopic ? TOPIC_CONFIG[selectedTopic] : null;

  const [step, setStep] = useState<Step>('question');
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState('');
  const [error, setError] = useState('');

  const spread = getSpread('three-card')!;

  function handleQuestion() {
    setStep('draw');
  }

  function handleDraw() {
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
    setRevealedIndices(new Set(drawnCards.map((_, i) => i)));
  }

  const allRevealed = drawnCards.length > 0 && revealedIndices.size === drawnCards.length;

  async function handleGetReading() {
    if (drawnCards.length === 0) return;
    setIsInterpreting(true);
    setError('');

    try {
      const response = await fetch('/api/reading/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: serializeDrawnCards(drawnCards),
          question: question || undefined,
          topic: selectedTopic || undefined,
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
      let fullText = '';

      setStep('interpret');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              fullText += data.text;
              setInterpretation(fullText);
            }
            if (data.done) {
              saveToLocalStorage(fullText);
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

  function saveToLocalStorage(text: string) {
    try {
      const reading = {
        spreadType: 'three-card',
        cards: serializeDrawnCards(drawnCards),
        question: question || null,
        interpretation: text,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(FREE_READING_KEY, JSON.stringify(reading));
    } catch {
      // localStorage might not be available
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-white">
          {topicConfig ? (en ? topicConfig.title : topicConfig.titleFA) : (en ? 'Your Free Reading' : 'فال رایگان شما')}
        </h1>
        <p className="text-stone-400 text-sm mt-2">
          {step === 'question' && (topicConfig ? (en ? topicConfig.subtitle : topicConfig.subtitleFA) : (en ? 'What would you like to explore? (optional)' : 'چه چیزی را می‌خواهید کاوش کنید؟ (اختیاری)'))}
          {step === 'draw' && (en ? 'Focus your energy and draw your cards' : 'انرژی خود را متمرکز کنید و کارت‌ها را بکشید')}
          {step === 'reveal' && (en ? 'Tap each card to reveal it' : 'روی هر کارت بزنید تا آشکار شود')}
          {step === 'interpret' && (en ? '...Your reading is unfolding' : 'فال شما در حال آشکار شدن است...')}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {topicConfig ? (en ? topicConfig.label : topicConfig.labelFA) : (en ? 'Three-Card Spread' : 'سه کارت')} &middot; {en ? 'Past' : 'گذشته'} &middot; {en ? 'Present' : 'حال'} &middot; {en ? 'Future' : 'آینده'}
        </p>
      </div>

      {/* Step: Question */}
      {step === 'question' && (
        <div className="max-w-md mx-auto space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={topicConfig ? (en ? topicConfig.placeholder : topicConfig.placeholderFA) : (en ? "What's on your mind? (optional \u2014 leave blank for a general reading)" : 'چه چیزی در ذهنتان است؟ (اختیاری — برای فال عمومی خالی بگذارید)')}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400/50 resize-none"
          />
          <div className="text-center">
            <button
              onClick={handleQuestion}
              className="px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold rounded-sm text-base transition-all hover:shadow-[0_0_30px_rgba(212,160,67,0.3)]"
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
            cardsRemaining={spread.cardCount}
          />
        </div>
      )}

      {/* Step: Reveal & Interpret */}
      {(step === 'reveal' || step === 'interpret') && drawnCards.length > 0 && (
        <div className="space-y-6">
          <SpreadLayout
            cards={drawnCards}
            spreadType="three-card"
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
                className="px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold rounded-sm text-lg transition-all hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] disabled:opacity-50"
              >
                {isInterpreting ? (en ? 'Reading the cards...' : 'در حال خواندن کارت‌ها...') : (en ? 'Get Your Reading' : 'دریافت فال')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: Interpretation */}
      {step === 'interpret' && interpretation && (
        <>
          <div className="max-w-2xl mx-auto">
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <h2 className="text-xl font-display font-semibold text-gold-400 mb-4">{en ? 'Your Reading' : 'فال شما'}</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-amber-50/95 text-base sm:text-lg leading-7 sm:leading-8 whitespace-pre-wrap">
                  {interpretation}
                  {isInterpreting && (
                    <span className="inline-block w-2 h-4 bg-gold-400 animate-pulse ml-0.5" />
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback + Upsell after reading is done */}
          {!isInterpreting && (
            <>
              <ReadingFeedback />
              <UpsellPanel />
            </>
          )}
        </>
      )}

      {error && (
        <div className="max-w-md mx-auto p-4 rounded-xl bg-red-900/20 border border-red-700/30 text-center">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
