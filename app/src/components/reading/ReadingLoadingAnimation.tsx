'use client';

import { useState, useEffect } from 'react';

const MESSAGES_EN = [
  'Sensing the energy of your cards...',
  'Reading the connections between them...',
  'Weaving your narrative...',
  'The story is taking shape...',
  'Almost ready to reveal your reading...',
];

const MESSAGES_FA = [
  '...در حال حس کردن انرژی کارت‌های شما',
  '...در حال خواندن ارتباط بین آن‌ها',
  '...در حال بافتن روایت شما',
  '...داستان شما در حال شکل‌گیری است',
  '...تقریباً آماده است تا خوانش شما آشکار شود',
];

interface ReadingLoadingAnimationProps {
  cardCount: number;
  language: 'en' | 'fa';
}

export default function ReadingLoadingAnimation({ cardCount, language }: ReadingLoadingAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [messageFade, setMessageFade] = useState(true);
  const messages = language === 'fa' ? MESSAGES_FA : MESSAGES_EN;

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setMessageFade(false);
      timeoutId = setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
        setMessageFade(true);
      }, 300);
    }, 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center gap-8 py-12" role="status" aria-live="polite">
      {/* Glowing card silhouettes */}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            className="w-[52px] h-[78px] sm:w-[60px] sm:h-[90px] rounded-lg border-2 border-amber-400/40 animate-card-glow motion-reduce:animate-none motion-reduce:border-amber-400/70 motion-reduce:shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            style={{
              background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Rotating status message */}
      <p
        className="text-sm sm:text-base tracking-wider text-amber-400 transition-opacity duration-300"
        style={{ opacity: messageFade ? 1 : 0 }}
        dir={language === 'fa' ? 'rtl' : 'ltr'}
      >
        {messages[messageIndex]}
      </p>
    </div>
  );
}
