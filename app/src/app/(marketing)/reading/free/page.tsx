'use client';

import { useState } from 'react';
import Deck from '@/components/tarot/Deck';
import SpreadLayout from '@/components/tarot/SpreadLayout';
import UpsellPanel from '@/components/reading/UpsellPanel';
import { DrawnCard } from '@/lib/tarot/types';
import { drawCards, serializeDrawnCards } from '@/lib/tarot/shuffle';
import { getSpread } from '@/lib/tarot/spreads';

type Step = 'question' | 'draw' | 'reveal' | 'interpret';

const FREE_READING_KEY = 'tarotveil_anonymous_reading';

export default function FreeReadingPage() {
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
          Your Free Reading
        </h1>
        <p className="text-stone-400 text-sm mt-2">
          {step === 'question' && 'What would you like to explore? (optional)'}
          {step === 'draw' && 'Focus your energy and draw your cards'}
          {step === 'reveal' && 'Tap each card to reveal it'}
          {step === 'interpret' && 'Your reading is unfolding...'}
        </p>
        <p className="text-xs text-purple-400/50 mt-1">
          Three-Card Spread &middot; Past &middot; Present &middot; Future
        </p>
      </div>

      {/* Step: Question */}
      {step === 'question' && (
        <div className="max-w-md mx-auto space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What's on your mind? (optional — leave blank for a general reading)"
            rows={3}
            className="w-full bg-purple-950/50 border border-purple-700/50 rounded-xl px-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-gold-400/50 resize-none"
          />
          <div className="text-center">
            <button
              onClick={handleQuestion}
              className="px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold rounded-sm text-base transition-all hover:shadow-[0_0_30px_rgba(212,160,67,0.3)]"
            >
              Continue
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
            language="en"
          />

          {step === 'reveal' && !allRevealed && (
            <div className="text-center">
              <button
                onClick={handleRevealAll}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Reveal all cards
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
                {isInterpreting ? 'Reading the cards...' : 'Get Your Reading'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: Interpretation */}
      {step === 'interpret' && interpretation && (
        <>
          <div className="max-w-2xl mx-auto">
            <div className="p-6 rounded-2xl bg-purple-950/30 border border-purple-800/20">
              <h2 className="text-lg font-display font-semibold text-gold-400 mb-4">Your Reading</h2>
              <div className="prose prose-invert prose-purple max-w-none">
                <p className="text-purple-100 leading-relaxed whitespace-pre-wrap">
                  {interpretation}
                  {isInterpreting && (
                    <span className="inline-block w-2 h-4 bg-gold-400 animate-pulse ml-0.5" />
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Upsell panel after reading is done */}
          {!isInterpreting && <UpsellPanel />}
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
