'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import SpreadSelector from '@/components/reading/SpreadSelector';
import Deck from '@/components/tarot/Deck';
import SpreadLayout from '@/components/tarot/SpreadLayout';
import { SpreadType, DrawnCard } from '@/lib/tarot/types';
import { drawCards } from '@/lib/tarot/shuffle';
import { SPREAD_COSTS } from '@/lib/credits/config';
import { getSpread } from '@/lib/tarot/spreads';
import { serializeDrawnCards } from '@/lib/tarot/shuffle';
import type { ReadingTopic } from '@/lib/ai/prompts';
import ReadingLoadingAnimation from '@/components/reading/ReadingLoadingAnimation';
import { toLocale } from '@/i18n/locales';

type Step = 'topic' | 'select-spread' | 'question' | 'draw' | 'reveal' | 'interpret';

/**
 * Structure only. Every string lives in the `reading` message namespace, keyed
 * by `messageKey`, so a new locale is a bundle entry rather than another branch
 * of a `language === 'en'` ternary.
 */
const TOPICS: { key: ReadingTopic; messageKey: string; symbol: string }[] = [
  { key: null, messageKey: 'general', symbol: '\u2728' },
  { key: 'love', messageKey: 'love', symbol: '\u2661' },
  { key: 'career', messageKey: 'career', symbol: '\u2606' },
  { key: 'yes-or-no', messageKey: 'yesOrNo', symbol: '\u29D6' },
];

/** Topic -> the placeholder message key for its question prompt. */
const TOPIC_PLACEHOLDERS: Record<string, string> = {
  love: 'placeholderLove',
  career: 'placeholderCareer',
  'yes-or-no': 'placeholderYesOrNo',
};

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
  const language = toLocale(locale);
  const t = useTranslations('reading');
  const [tier, setTier] = useState<string>('free');
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setTier(data.profile.tier || 'free');
        }
        if (data.credits) {
          setCredits(data.credits.balance);
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

  const questionPlaceholder = t(
    (topic && TOPIC_PLACEHOLDERS[topic]) || 'placeholderGeneral',
  );

  function handleSelectTopic(selected: ReadingTopic) {
    setTopic(selected);
    setSpreadType(null);
    setStep('select-spread');
  }

  function handleSelectSpread(type: SpreadType) {
    // Check affordability here rather than at interpretation time. The server
    // is authoritative either way, but finding out after drawing your cards is
    // a bad moment — and /api/auth/me already told us the balance.
    const cost = SPREAD_COSTS[type];
    if (credits !== null && credits < cost) {
      // String(), not the raw numbers: a numeric ICU argument gets formatted
      // with the locale's numbering system, which would turn the Latin digits
      // the Farsi copy has always rendered into Persian ones.
      const values = { cost: String(cost), credits: String(credits) };
      setError(
        tier === 'free'
          ? t('notEnoughCreditsToday', values)
          : t('notEnoughCreditsPeriod', values),
      );
      return;
    }
    setError('');
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
        <h1 className="text-2xl font-bold text-white">{t('newReading')}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {step === 'topic' && t('topicPrompt')}
          {step === 'select-spread' && t('chooseSpread')}
          {step === 'question' && t(topic === 'yes-or-no' ? 'askClearQuestion' : 'enterQuestion')}
          {step === 'draw' && t('drawCards')}
          {step === 'reveal' && t('tapToReveal')}
          {step === 'interpret' && t('unfolding')}
        </p>
      </div>

      {/* Step: Topic */}
      {step === 'topic' && (
        <div className="max-w-lg mx-auto space-y-3">
          {TOPICS.map((option) => (
            <button
              key={option.messageKey}
              onClick={() => handleSelectTopic(option.key)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-amber-400/30 hover:bg-white/[0.04] transition-all text-left group"
            >
              <span className="text-2xl text-amber-400/50 group-hover:text-amber-400/90 transition-colors w-10 text-center flex-shrink-0">
                {option.symbol}
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-medium text-white group-hover:text-amber-400 transition-colors">
                  {t(`topics.${option.messageKey}`)}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{t(`topics.${option.messageKey}Desc`)}</p>
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
              {t('back')}
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
              {t('back')}
            </button>
            <button
              onClick={handleQuestion}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-xl text-sm transition-colors"
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
                {t('revealAll')}
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

      {/* Step: Interpret — Revealed Reading */}
      {step === 'interpret' && interpretation && (
        <div
          className="max-w-2xl mx-auto space-y-6 transition-opacity duration-[600ms] ease-in"
          style={{ opacity: showInterpretation ? 1 : 0 }}
        >
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">
              {t('yourReading')}
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
                {t('viewFull')}
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
