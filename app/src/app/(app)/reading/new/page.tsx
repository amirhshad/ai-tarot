'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SpreadSelector from '@/components/reading/SpreadSelector';
import Deck from '@/components/tarot/Deck';
import SpreadLayout from '@/components/tarot/SpreadLayout';
import { SpreadType, DrawnCard } from '@/lib/tarot/types';
import { drawCards } from '@/lib/tarot/shuffle';
import { getSpread } from '@/lib/tarot/spreads';
import { serializeDrawnCards } from '@/lib/tarot/shuffle';

type Step = 'select-spread' | 'question' | 'draw' | 'reveal' | 'interpret';

export default function NewReadingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select-spread');
  const [spreadType, setSpreadType] = useState<SpreadType | null>(null);
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState('');
  const [readingId, setReadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [tier, setTier] = useState<string>('free');
  const [language, setLanguage] = useState<'en' | 'fa'>('en');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setTier(data.profile.tier || 'free');
          setLanguage(data.profile.language || 'en');
        }
      })
      .catch(() => {});
  }, []);

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
    // Small delay for animation feel
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

    try {
      const response = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadType,
          cards: serializeDrawnCards(drawnCards),
          question: question || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get reading');
      }

      // Read the streaming response
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
              setReadingId(data.readingId);
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
        <h1 className="text-2xl font-bold text-white">New Reading</h1>
        <p className="text-purple-300/60 text-sm mt-1">
          {step === 'select-spread' && 'Choose your spread type'}
          {step === 'question' && 'What would you like to explore? (optional)'}
          {step === 'draw' && 'Focus your energy and draw your cards'}
          {step === 'reveal' && 'Tap each card to reveal it'}
          {step === 'interpret' && 'Your reading is unfolding...'}
        </p>
      </div>

      {/* Step: Select Spread */}
      {step === 'select-spread' && (
        <SpreadSelector
          tier={tier}
          selectedSpread={spreadType}
          onSelect={handleSelectSpread}
          language={language}
        />
      )}

      {/* Step: Question */}
      {step === 'question' && (
        <div className="max-w-md mx-auto space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What's on your mind? (optional — leave blank for a general reading)"
            rows={3}
            className="w-full bg-purple-950/50 border border-purple-700/50 rounded-xl px-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400/50 resize-none"
          />
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStep('select-spread')}
              className="px-6 py-2.5 border border-purple-700/50 text-purple-300 rounded-xl text-sm hover:border-purple-500/50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleQuestion}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-xl text-sm transition-colors"
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
                className="px-8 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-xl text-lg transition-colors"
              >
                {isInterpreting ? 'Reading the cards...' : 'Get Your Reading'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: Interpret */}
      {step === 'interpret' && interpretation && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-purple-950/30 border border-purple-800/20">
            <h2 className="text-lg font-semibold text-amber-400 mb-4">Your Reading</h2>
            <div className="prose prose-invert prose-purple max-w-none">
              <p className="text-purple-100 leading-relaxed whitespace-pre-wrap">
                {interpretation}
                {isInterpreting && (
                  <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse ml-0.5" />
                )}
              </p>
            </div>
          </div>

          {readingId && !isInterpreting && (
            <div className="text-center">
              <button
                onClick={() => router.push(`/reading/${readingId}`)}
                className="px-6 py-2.5 bg-purple-800/50 hover:bg-purple-700/50 text-purple-200 font-medium rounded-xl text-sm transition-colors"
              >
                View Full Reading & Follow-up
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
