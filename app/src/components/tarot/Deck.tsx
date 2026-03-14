'use client';

import { motion } from 'framer-motion';
import CardBack from './CardBack';

interface DeckProps {
  onDraw: () => void;
  isDrawing: boolean;
  cardsRemaining?: number;
}

export default function Deck({ onDraw, isDrawing, cardsRemaining }: DeckProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={onDraw}
        disabled={isDrawing}
        className="relative disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Stacked deck effect */}
        <div className="relative" style={{ width: '140px', height: '240px' }}>
          <div className="absolute top-1 left-1 w-full h-full opacity-40">
            <CardBack />
          </div>
          <div className="absolute top-0.5 left-0.5 w-full h-full opacity-60">
            <CardBack />
          </div>
          <div className="absolute inset-0">
            <CardBack />
          </div>
        </div>
      </motion.button>

      <p className="text-sm text-gray-400 font-light">
        {isDrawing ? 'Drawing...' : 'Tap to draw'}
      </p>

      {cardsRemaining !== undefined && (
        <p className="text-xs text-gray-500">
          {cardsRemaining} cards in spread
        </p>
      )}
    </div>
  );
}
