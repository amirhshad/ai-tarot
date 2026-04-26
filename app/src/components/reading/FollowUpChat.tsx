'use client';

import { useState, useRef, useEffect } from 'react';
import { getFollowUpLimit } from '@/lib/stripe/config';
import { DECK } from '@/lib/tarot/deck';
import { TarotCard } from '@/lib/tarot/types';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  extraCard?: { cardId: number; reversed: boolean };
}

interface FollowUpChatProps {
  readingId: string;
  tier: string;
  existingMessages?: Message[];
  language?: 'en' | 'fa';
}

/** Draw a single crypto-random card with 50% reversal chance */
function drawOneCard(): { card: TarotCard; reversed: boolean } {
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  const index = randomValues[0] % DECK.length;
  const reversalBit = new Uint8Array(1);
  crypto.getRandomValues(reversalBit);
  return { card: DECK[index], reversed: reversalBit[0] > 127 };
}

export default function FollowUpChat({
  readingId,
  tier,
  existingMessages = [],
  language = 'en',
}: FollowUpChatProps) {
  const [messages, setMessages] = useState<Message[]>(existingMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [drawnExtraCard, setDrawnExtraCard] = useState<{ card: TarotCard; reversed: boolean } | null>(null);
  const [isCardRevealed, setIsCardRevealed] = useState(false);
  const [extraCardQuestion, setExtraCardQuestion] = useState('');
  const [showExtraCardInput, setShowExtraCardInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const limit = getFollowUpLimit(tier);
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const remaining = limit - userMessageCount;
  const canAsk = remaining > 0;

  const en = language === 'en';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  async function sendFollowUp(question: string, extraCard?: { cardId: number; reversed: boolean }) {
    setIsLoading(true);
    setStreamingText('');

    try {
      const response = await fetch(`/api/reading/${readingId}/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, extraCard, language }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to send follow-up');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

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
              setStreamingText(fullText);
            }
            if (data.done) {
              setMessages(prev => [...prev, { role: 'assistant', content: data.fullText }]);
              setStreamingText('');
            }
          }
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: en ? 'Something went wrong. Please try again.' : 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !canAsk || isLoading) return;

    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    await sendFollowUp(question);
  }

  function handleDrawExtraCard() {
    if (!canAsk || isLoading) return;
    setShowExtraCardInput(true);
  }

  function handleConfirmDrawExtraCard() {
    const drawn = drawOneCard();
    setDrawnExtraCard(drawn);
    setIsCardRevealed(false);
    setShowExtraCardInput(false);
  }

  function handleRevealExtraCard() {
    setIsCardRevealed(true);
  }

  async function handleSendExtraCard() {
    if (!drawnExtraCard || isLoading) return;

    const card = drawnExtraCard.card;
    const cardName = en ? card.name : card.nameFA;
    const orientation = drawnExtraCard.reversed
      ? (en ? 'Reversed' : 'معکوس')
      : (en ? 'Upright' : 'ایستاده');

    const question = extraCardQuestion.trim();
    const userContent = question
      ? (en
          ? `I drew an extra card: ${cardName} (${orientation}). My question: ${question}`
          : `من یک کارت اضافی کشیدم: ${cardName} (${orientation}). سؤال من: ${question}`)
      : (en
          ? `I drew an extra card for deeper insight: ${cardName} (${orientation}). How does this card add to or change the reading?`
          : `من یک کارت اضافی برای بینش عمیق‌تر کشیدم: ${cardName} (${orientation}). این کارت چگونه به خوانش اضافه می‌کند یا آن را تغییر می‌دهد؟`);

    const extraCardData = { cardId: card.id, reversed: drawnExtraCard.reversed };
    setMessages(prev => [...prev, { role: 'user', content: userContent, extraCard: extraCardData }]);
    setDrawnExtraCard(null);
    setIsCardRevealed(false);
    setExtraCardQuestion('');

    await sendFollowUp(userContent, extraCardData);
  }

  function handleCancelExtraCard() {
    setDrawnExtraCard(null);
    setIsCardRevealed(false);
    setExtraCardQuestion('');
    setShowExtraCardInput(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Messages */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white/[0.06] text-gray-200 border border-white/10'
              }`}
            >
              {msg.extraCard && (
                <ExtraCardBadge cardId={msg.extraCard.cardId} reversed={msg.extraCard.reversed} language={language} />
              )}
              <span className="whitespace-pre-wrap">{msg.content}</span>
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-white/[0.06] text-gray-200 border border-white/10">
              {streamingText}
              <span className="inline-block w-1.5 h-3 bg-amber-400 animate-pulse ml-0.5" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Extra Card Question Input */}
      {showExtraCardInput && !drawnExtraCard && (
        <div className="p-4 rounded-xl bg-white/[0.04] border border-amber-500/30 space-y-3">
          <p className="text-sm text-amber-400 font-medium text-center">
            {en ? 'What would you like the extra card to answer?' : 'می‌خواهید کارت اضافی به چه سؤالی پاسخ دهد؟'}
          </p>
          <input
            type="text"
            value={extraCardQuestion}
            onChange={e => setExtraCardQuestion(e.target.value)}
            placeholder={en ? 'e.g. What should I focus on next? (optional)' : 'مثلاً: روی چه چیزی تمرکز کنم؟ (اختیاری)'}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50"
            onKeyDown={e => { if (e.key === 'Enter') handleConfirmDrawExtraCard(); }}
          />
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleCancelExtraCard}
              className="px-4 py-2 border border-white/15 text-gray-400 rounded-xl text-sm hover:border-white/30 transition-colors"
            >
              {en ? 'Cancel' : 'لغو'}
            </button>
            <button
              onClick={handleConfirmDrawExtraCard}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              <span className="text-lg">&#9813;</span>
              {en ? 'Draw Card' : 'کشیدن کارت'}
            </button>
          </div>
        </div>
      )}

      {/* Extra Card Draw Area */}
      {drawnExtraCard && (
        <div className="p-4 rounded-xl bg-white/[0.04] border border-amber-500/30 space-y-4">
          <p className="text-sm text-amber-400 font-medium text-center">
            {en ? 'Your Extra Card' : 'کارت اضافی شما'}
          </p>
          <div className="flex justify-center">
            <div
              className="w-28 h-44 rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
              onClick={!isCardRevealed ? handleRevealExtraCard : undefined}
            >
              {isCardRevealed ? (
                <div className={`relative w-full h-full bg-slate-50 border-2 border-amber-500/60 rounded-xl ${drawnExtraCard.reversed ? 'rotate-180' : ''}`}>
                  <Image
                    src={drawnExtraCard.card.image}
                    alt={drawnExtraCard.card.name}
                    fill
                    className="object-contain p-0.5"
                    sizes="112px"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-700 to-indigo-900 border-2 border-amber-500/60 rounded-xl flex items-center justify-center">
                  <span className="text-amber-400 text-3xl">&#10022;</span>
                </div>
              )}
            </div>
          </div>

          {isCardRevealed && (
            <div className="text-center">
              <p className="text-white text-sm font-medium">
                {en ? drawnExtraCard.card.name : drawnExtraCard.card.nameFA}
                {drawnExtraCard.reversed && (
                  <span className="text-red-400 text-xs ml-1">
                    ({en ? 'Reversed' : 'معکوس'})
                  </span>
                )}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {(en ? drawnExtraCard.card.keywords : drawnExtraCard.card.keywordsFA).join(en ? ', ' : '، ')}
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <button
              onClick={handleCancelExtraCard}
              className="px-4 py-2 border border-white/15 text-gray-400 rounded-xl text-sm hover:border-white/30 transition-colors"
            >
              {en ? 'Cancel' : 'لغو'}
            </button>
            {!isCardRevealed ? (
              <button
                onClick={handleRevealExtraCard}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-xl text-sm transition-colors"
              >
                {en ? 'Reveal Card' : 'نمایش کارت'}
              </button>
            ) : (
              <button
                onClick={handleSendExtraCard}
                disabled={isLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-medium rounded-xl text-sm transition-colors"
              >
                {en ? 'Get Interpretation' : 'دریافت تفسیر'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      {canAsk && !drawnExtraCard && !showExtraCardInput ? (
        <div className="space-y-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={en ? 'Ask a follow-up question...' : 'سؤال بعدی خود را بپرسید...'}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-black font-medium rounded-xl text-sm transition-colors"
            >
              {en ? 'Ask' : 'بپرس'}
            </button>
          </form>

          <button
            onClick={handleDrawExtraCard}
            disabled={isLoading}
            className="w-full px-4 py-2.5 border border-dashed border-amber-500/40 text-amber-400 rounded-xl text-sm hover:bg-amber-500/10 hover:border-amber-500/60 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-lg">&#9813;</span>
            {en ? 'Draw an Extra Card' : 'کشیدن کارت اضافی'}
          </button>
        </div>
      ) : !drawnExtraCard ? (
        <div className="text-center py-5 px-4 bg-gradient-to-b from-amber-900/10 to-white/[0.02] rounded-xl border border-amber-500/20 space-y-4">
          <p className="text-sm text-gray-300">
            {limit === 0
              ? (en
                  ? 'Follow-up questions are available with Pro. Upgrade to explore your reading deeper.'
                  : 'سؤالات بعدی با اشتراک حرفه‌ای فعال می‌شوند.')
              : (en
                  ? 'You\'ve used all your follow-up questions for this reading.'
                  : 'تمام سؤالات بعدی این خوانش را استفاده کرده‌اید.')}
          </p>
          {limit === 0 && (
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href="/billing"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-xl text-sm transition-colors"
              >
                <span>&#9733;</span>
                {en ? 'Upgrade to Pro — $7.99/mo' : 'ارتقا به حرفه‌ای — ۷.۹۹$/ماه'}
              </a>
              <a
                href="/billing"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 rounded-xl text-sm transition-colors"
              >
                <span>&#10023;</span>
                {en ? 'Go Premium — $14.99/mo' : 'ویژه — ۱۴.۹۹$/ماه'}
              </a>
            </div>
          )}
        </div>
      ) : null}

      {/* Counter */}
      {limit > 0 && (
        <p className="text-sm text-gray-400 text-center">
          {en
            ? `${remaining} of ${limit} questions remaining`
            : `${remaining} از ${limit} سؤال باقی‌مانده`}
        </p>
      )}
    </div>
  );
}

/** Small inline badge showing the extra card in a message */
function ExtraCardBadge({ cardId, reversed, language }: { cardId: number; reversed: boolean; language: string }) {
  const card = DECK.find(c => c.id === cardId);
  if (!card) return null;

  const en = language === 'en';
  return (
    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
      <div className={`relative w-8 h-12 rounded overflow-hidden flex-shrink-0 ${reversed ? 'rotate-180' : ''}`}>
        <Image src={card.image} alt={card.name} fill className="object-contain" sizes="32px" />
      </div>
      <span className="text-xs opacity-80">
        {en ? card.name : card.nameFA}
        {reversed && ` (${en ? 'Reversed' : 'معکوس'})`}
      </span>
    </div>
  );
}
