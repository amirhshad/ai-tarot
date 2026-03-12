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
      <div className="flex justify-center gap-3 md:gap-8 px-2">
        {cards.map((dc, i) => (
          <CardSlot
            key={i}
            drawnCard={dc}
            index={i}
            revealed={revealedIndices.has(i)}
            onReveal={onRevealCard}
            language={language}
            shrinkOnMobile
          />
        ))}
      </div>
    );
  }

  // Celtic Cross layout — grid-based for proper spacing
  // Cross (left):       [4-Crown]
  //              [3-Past] [0+1] [5-Future]
  //                    [2-Foundation]
  // Staff (right): [9-Outcome] [8-Hopes] [7-Environment] [6-Self]
  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 lg:gap-16 px-4">
      {/* ── Cross Section ── */}
      <div className="grid grid-cols-3 gap-x-2 gap-y-3 md:gap-x-4 md:gap-y-4 place-items-center">
        {/* Row 1: Crown (top center) */}
        <div className="col-start-2">
          <CelticCard dc={cards[4]} idx={4} revealed={revealedIndices.has(4)} onReveal={onRevealCard} language={language} />
        </div>

        {/* Row 2: Past | Present+Crossing | Future */}
        <div>
          <CelticCard dc={cards[3]} idx={3} revealed={revealedIndices.has(3)} onReveal={onRevealCard} language={language} />
        </div>
        <div className="relative">
          {/* Present card (below) */}
          <CelticCard dc={cards[0]} idx={0} revealed={revealedIndices.has(0)} onReveal={onRevealCard} language={language} />
          {/* Crossing card (on top, rotated) */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              zIndex: revealedIndices.has(1) ? 0 : 2,
              pointerEvents: revealedIndices.has(1) ? 'none' : 'auto',
            }}
          >
            <div className="rotate-90">
              <CelticCard dc={cards[1]} idx={1} revealed={revealedIndices.has(1)} onReveal={onRevealCard} language={language} hideLabel />
            </div>
          </div>
        </div>
        <div>
          <CelticCard dc={cards[5]} idx={5} revealed={revealedIndices.has(5)} onReveal={onRevealCard} language={language} />
        </div>

        {/* Row 3: Foundation (bottom center) */}
        <div className="col-start-2">
          <CelticCard dc={cards[2]} idx={2} revealed={revealedIndices.has(2)} onReveal={onRevealCard} language={language} />
        </div>
      </div>

      {/* ── Staff Section (vertical column, bottom to top) ── */}
      <div className="flex flex-row lg:flex-col-reverse gap-3 md:gap-4">
        {[6, 7, 8, 9].map((i) => (
          <CelticCard key={i} dc={cards[i]} idx={i} revealed={revealedIndices.has(i)} onReveal={onRevealCard} language={language} />
        ))}
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
  shrinkOnMobile = false,
}: {
  drawnCard: DrawnCard;
  index: number;
  revealed: boolean;
  onReveal: (i: number) => void;
  language: 'en' | 'fa';
  shrinkOnMobile?: boolean;
}) {
  const posName = language === 'en' ? drawnCard.position.name : drawnCard.position.nameFA;

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 ${shrinkOnMobile ? 'scale-[0.75] md:scale-100 origin-top' : ''}`}
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
      <p className="text-xs text-purple-300 font-light text-center">{posName}</p>
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
}: {
  dc: DrawnCard;
  idx: number;
  revealed: boolean;
  onReveal: (i: number) => void;
  language: 'en' | 'fa';
  hideLabel?: boolean;
}) {
  const posName = language === 'en' ? dc.position.name : dc.position.nameFA;

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
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
        className="scale-[0.65] md:scale-75 origin-top"
      />
      {!hideLabel && (
        <p className="text-[10px] md:text-xs text-purple-300/70 font-light text-center -mt-6 md:-mt-4">
          {posName}
        </p>
      )}
    </motion.div>
  );
}
