'use client';

import { Suspense, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Deck from '@/components/tarot/Deck';
import SpreadLayout from '@/components/tarot/SpreadLayout';
import UpsellPanel from '@/components/reading/UpsellPanel';
import ReadingFeedback from '@/components/reading/ReadingFeedback';
import ReadingLoadingAnimation from '@/components/reading/ReadingLoadingAnimation';
import { DrawnCard } from '@/lib/tarot/types';
import { drawCards, serializeDrawnCards } from '@/lib/tarot/shuffle';
import { getSpread } from '@/lib/tarot/spreads';
import type { ReadingTopic } from '@/lib/ai/prompts';
import type { Locale } from '@/i18n/locales';

type Step = 'question' | 'draw' | 'reveal' | 'interpret';

const FREE_READING_KEY = 'tarotveil_anonymous_reading';

/**
 * Message keys per topic — structure only. The copy lives in the `reading`
 * namespace of the bundles, so a new locale is a bundle entry rather than
 * another branch of an inline ternary. `subtitleKey` and `placeholderKey` point
 * outside `reading.free` because those strings are shared with the signed-in
 * flow in `reading/new`.
 */
const TOPIC_CONFIG: Record<string, { suffix: string; subtitleKey: string; placeholderKey: string }> = {
  love: { suffix: 'Love', subtitleKey: 'free.subtitleLove', placeholderKey: 'placeholderLove' },
  'yes-or-no': { suffix: 'YesOrNo', subtitleKey: 'askClearQuestion', placeholderKey: 'placeholderYesOrNo' },
  career: { suffix: 'Career', subtitleKey: 'free.subtitleCareer', placeholderKey: 'placeholderCareer' },
};

export default function FreeReadingClient({ language = 'en' }: { language?: Locale }) {
  const t = useTranslations('reading');
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-12 text-center text-stone-400">{t('free.loading')}</div>}>
      <FreeReadingContent language={language} />
    </Suspense>
  );
}

function FreeReadingContent({ language }: { language: Locale }) {
  const t = useTranslations('reading');
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
  const loadingStartRef = useRef<number>(0);

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
            if (data.text) {
              fullText += data.text;
            }
            if (data.done) {
              saveToLocalStorage(fullText);
              const elapsed = Date.now() - loadingStartRef.current;
              const minDisplayTime = 2000;
              if (elapsed < minDisplayTime) {
                await new Promise((r) => setTimeout(r, minDisplayTime - elapsed));
              }
              setInterpretation(fullText);
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
          {topicConfig ? t(`free.title${topicConfig.suffix}`) : t('free.title')}
        </h1>
        <p className="text-stone-400 text-sm mt-2">
          {step === 'question' && (topicConfig ? t(topicConfig.subtitleKey) : t('enterQuestion'))}
          {step === 'draw' && t('drawCards')}
          {step === 'reveal' && t('tapToReveal')}
          {step === 'interpret' && t('unfolding')}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {topicConfig ? t(`free.label${topicConfig.suffix}`) : t('free.threeCardSpread')} &middot; {t('free.past')} &middot; {t('free.present')} &middot; {t('free.future')}
        </p>
      </div>

      {/* Step: Question */}
      {step === 'question' && (
        <div className="max-w-md mx-auto space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={topicConfig ? t(topicConfig.placeholderKey) : t('placeholderGeneral')}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400/50 resize-none"
          />
          <div className="text-center">
            <button
              onClick={handleQuestion}
              className="px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold rounded-sm text-base transition-all hover:shadow-[0_0_30px_rgba(212,160,67,0.3)]"
            >
              {t('continue')}
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
                {t('revealAll')}
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
                {isInterpreting ? t('readingCards') : t('getReading')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: Interpret — Loading Animation */}
      {step === 'interpret' && !interpretation && (
        <ReadingLoadingAnimation cardCount={drawnCards.length} language={language} />
      )}

      {/* Step: Interpretation */}
      {step === 'interpret' && interpretation && (
        <>
          <div className="max-w-2xl mx-auto">
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <h2 className="text-xl font-display font-semibold text-gold-400 mb-4">{t('free.yourReading')}</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-amber-50/95 text-base sm:text-lg leading-7 sm:leading-8 whitespace-pre-wrap">
                  {interpretation}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback + Upsell after reading is done */}
          <ReadingFeedback />
          <UpsellPanel />
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
