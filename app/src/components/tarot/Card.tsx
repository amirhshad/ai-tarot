'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TarotCard } from '@/lib/tarot/types';
import CardBack from './CardBack';
import CardFace from './CardFace';

type CardSize = 'default' | 'sm';

const SIZE_CLASSES: Record<CardSize, string> = {
  default: 'w-[100px] h-[172px] sm:w-[120px] sm:h-[206px] md:w-[140px] md:h-[240px]',
  sm: 'w-[70px] h-[120px] sm:w-[80px] sm:h-[137px] md:w-[90px] md:h-[154px] lg:w-[100px] lg:h-[172px]',
};

interface CardProps {
  card: TarotCard;
  reversed: boolean;
  isRevealed?: boolean;
  onReveal?: () => void;
  language?: 'en' | 'fa';
  size?: CardSize;
  className?: string;
}

export default function Card({
  card,
  reversed,
  isRevealed = false,
  onReveal,
  language = 'en',
  size = 'default',
  className = '',
}: CardProps) {
  const [flipped, setFlipped] = useState(isRevealed);

  // Sync with parent state (e.g. "Reveal all" button)
  useEffect(() => {
    if (isRevealed && !flipped) {
      setFlipped(true);
    }
  }, [isRevealed]);

  const handleClick = () => {
    if (!flipped) {
      setFlipped(true);
      onReveal?.();
    }
  };

  return (
    <div
      className={`relative cursor-pointer ${SIZE_CLASSES[size]} ${className}`}
      style={{ perspective: '1000px' }}
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Back face */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <CardBack />
        </div>

        {/* Front face */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardFace card={card} reversed={reversed} language={language} />
        </div>
      </motion.div>
    </div>
  );
}
