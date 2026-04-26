'use client';

import { motion } from 'framer-motion';
import { DrawnCard, SpreadType } from '@/lib/tarot/types';
import Card from './Card';

interface SpreadLayoutProps {
  cards: DrawnCard[];
  spreadType: SpreadType;
  revealedIndices: Set<number>;
  onRevealCard: (index: number) => void;
  language?: 'en' | 'fa';
}

export default function SpreadLayout({
  cards,
  spreadType,
  revealedIndices,
  onRevealCard,
  language = 'en',
}: SpreadLayoutProps) {
  if (spreadType === 'single') {
    return (
      <div className="flex justify-center">
        <CardSlot
          drawnCard={cards[0]}
          index={0}
          revealed={revealedIndices.has(0)}
          onReveal={onRevealCard}
          language={language}
        />
      </div>
    );
  }

  if (spreadType === 'three-card') {
    return (
      <div className="flex justify-center gap-2 sm:gap-3 md:gap-8 px-2">
        {cards.map((dc, i) => (
          <CardSlot
            key={i}
            drawnCard={dc}
            index={i}
            revealed={revealedIndices.has(i)}
            onReveal={onRevealCard}
            language={language}
          />
        ))}
      </div>
    );
  }

  if (spreadType === 'horseshoe') {
    // Horseshoe arc layout (U-shape):
    //   [0]                 [6]
    //     [1]             [5]
    //       [2]   [3]   [4]
    // Uses flex rows to avoid absolute positioning issues with labels
    return (
      <div className="flex flex-col items-center gap-1 sm:gap-2 px-2">
        {/* Top row: positions 0 and 6 */}
        <div className="flex justify-center gap-16 sm:gap-24 md:gap-40">
          <CardSlot drawnCard={cards[0]} index={0} revealed={revealedIndices.has(0)} onReveal={onRevealCard} language={language} />
          <CardSlot drawnCard={cards[6]} index={6} revealed={revealedIndices.has(6)} onReveal={onRevealCard} language={language} />
        </div>
        {/* Middle row: positions 1 and 5 */}
        <div className="flex justify-center gap-8 sm:gap-16 md:gap-24">
          <CardSlot drawnCard={cards[1]} index={1} revealed={revealedIndices.has(1)} onReveal={onRevealCard} language={language} />
          <CardSlot drawnCard={cards[5]} index={5} revealed={revealedIndices.has(5)} onReveal={onRevealCard} language={language} />
        </div>
        {/* Bottom row: positions 2, 3, 4 */}
        <div className="flex justify-center gap-1 sm:gap-2 md:gap-4">
          <CardSlot drawnCard={cards[2]} index={2} revealed={revealedIndices.has(2)} onReveal={onRevealCard} language={language} />
          <CardSlot drawnCard={cards[3]} index={3} revealed={revealedIndices.has(3)} onReveal={onRevealCard} language={language} />
          <CardSlot drawnCard={cards[4]} index={4} revealed={revealedIndices.has(4)} onReveal={onRevealCard} language={language} />
        </div>
      </div>
    );
  }

  // Celtic Cross — traditional layout, no CSS scale.
  // Uses sm-sized cards so everything fits without scrolling.
  //
  //  Cross (left):            Staff (right, bottom→top):
  //          [4]                    [9]
  //   [3]  [0+1]  [5]              [8]
  //          [2]                    [7]
  //                                [6]
  //
  // Card sizes match the 'sm' Card variant:
  //   mobile: 70×120, sm: 80×137, md: 90×154, lg: 100×172

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="flex justify-center gap-2 sm:gap-4 md:gap-6">
        {/* Cross section */}
        <div className="relative w-[220px] h-[380px] sm:w-[256px] sm:h-[435px] md:w-[286px] md:h-[486px] lg:w-[316px] lg:h-[540px] flex-shrink-0">
          {/* Crown — top center */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            <CelticCard dc={cards[4]} idx={4} revealed={revealedIndices.has(4)} onReveal={onRevealCard} language={language} size="sm" />
          </div>
          {/* Past — middle left */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0">
            <CelticCard dc={cards[3]} idx={3} revealed={revealedIndices.has(3)} onReveal={onRevealCard} language={language} size="sm" />
          </div>
          {/* Present — center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">
            <CelticCard dc={cards[0]} idx={0} revealed={revealedIndices.has(0)} onReveal={onRevealCard} language={language} size="sm" />
          </div>
          {/* Challenge — center, rotated */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] rotate-90"
            style={{ pointerEvents: revealedIndices.has(1) ? 'none' : 'auto', zIndex: revealedIndices.has(1) ? 0 : 2 }}
          >
            <CelticCard dc={cards[1]} idx={1} revealed={revealedIndices.has(1)} onReveal={onRevealCard} language={language} size="sm" hideLabel />
          </div>
          {/* Future — middle right */}
          <div className="absolute top-1/2 -translate-y-1/2 right-0">
            <CelticCard dc={cards[5]} idx={5} revealed={revealedIndices.has(5)} onReveal={onRevealCard} language={language} size="sm" />
          </div>
          {/* Foundation — bottom center */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <CelticCard dc={cards[2]} idx={2} revealed={revealedIndices.has(2)} onReveal={onRevealCard} language={language} size="sm" />
          </div>
        </div>

        {/* Staff column — bottom to top: 6, 7, 8, 9 */}
        <div className="flex flex-col justify-between flex-shrink-0">
          <CelticCard dc={cards[9]} idx={9} revealed={revealedIndices.has(9)} onReveal={onRevealCard} language={language} size="sm" />
          <CelticCard dc={cards[8]} idx={8} revealed={revealedIndices.has(8)} onReveal={onRevealCard} language={language} size="sm" />
          <CelticCard dc={cards[7]} idx={7} revealed={revealedIndices.has(7)} onReveal={onRevealCard} language={language} size="sm" />
          <CelticCard dc={cards[6]} idx={6} revealed={revealedIndices.has(6)} onReveal={onRevealCard} language={language} size="sm" />
        </div>
      </div>
    </div>
  );
}

function CardSlot({
  drawnCard,
  index,
  revealed,
  onReveal,
  language,
}: {
  drawnCard: DrawnCard;
  index: number;
  revealed: boolean;
  onReveal: (i: number) => void;
  language: 'en' | 'fa';
}) {
  const posName = language === 'en' ? drawnCard.position.name : drawnCard.position.nameFA;

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
    >
      <Card
        card={drawnCard.card}
        reversed={drawnCard.reversed}
        isRevealed={revealed}
        onReveal={() => onReveal(index)}
        language={language}
      />
      <p className="text-xs text-gray-400 font-light text-center">{posName}</p>
    </motion.div>
  );
}

function CelticCard({
  dc,
  idx,
  revealed,
  onReveal,
  language,
  hideLabel = false,
  size,
}: {
  dc: DrawnCard;
  idx: number;
  revealed: boolean;
  onReveal: (i: number) => void;
  language: 'en' | 'fa';
  hideLabel?: boolean;
  size?: 'default' | 'sm';
}) {
  const posName = language === 'en' ? dc.position.name : dc.position.nameFA;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.08 }}
    >
      <Card
        card={dc.card}
        reversed={dc.reversed}
        isRevealed={revealed}
        onReveal={() => onReveal(idx)}
        language={language}
        size={size}
      />
      {!hideLabel && (
        <p className="text-[10px] sm:text-[11px] text-gray-400/70 font-light text-center mt-1 whitespace-nowrap">
          {posName}
        </p>
      )}
    </motion.div>
  );
}
