'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { TarotCard } from '@/lib/tarot/types';
import CardBack from './CardBack';
import CardFace from './CardFace';

interface CardProps {
  card: TarotCard;
  reversed: boolean;
  isRevealed?: boolean;
  onReveal?: () => void;
  language?: 'en' | 'fa';
  className?: string;
}

export default function Card({
  card,
  reversed,
  isRevealed = false,
  onReveal,
  language = 'en',
  className = '',
}: CardProps) {
  const [flipped, setFlipped] = useState(isRevealed);

  const handleClick = () => {
    if (!flipped) {
      setFlipped(true);
      onReveal?.();
    }
  };

  return (
    <div
      className={`relative cursor-pointer ${className}`}
      style={{ perspective: '1000px', width: '140px', height: '240px' }}
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
