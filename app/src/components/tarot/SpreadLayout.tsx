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
    return (
      <div className="w-full overflow-x-auto px-4">
        <div className="relative mx-auto origin-top scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.85] xl:scale-100"
          style={{ width: 660, height: 520 }}
        >
          {[
            { idx: 0, top: 0,   left: 20  },  // top-left
            { idx: 1, top: 140, left: 80  },  // mid-left
            { idx: 2, top: 280, left: 140 },  // bottom-left
            { idx: 3, top: 280, left: 280 },  // bottom-center
            { idx: 4, top: 280, left: 420 },  // bottom-right
            { idx: 5, top: 140, left: 480 },  // mid-right
            { idx: 6, top: 0,   left: 540 },  // top-right
          ].map(({ idx, top, left }) => (
            <div key={idx} className="absolute" style={{ top, left, width: 100, height: 168 }}>
              <CardSlot
                drawnCard={cards[idx]}
                index={idx}
                revealed={revealedIndices.has(idx)}
                onReveal={onRevealCard}
                language={language}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Celtic Cross — matches traditional layout reference:
  //
  //  Cross (left):            Staff (right, bottom→top):
  //          [4]                    [9]
  //   [3]  [0+1]  [5]              [8]
  //          [2]                    [7]
  //                                [6]
  //
  // Card = 140×240. We use scale(0.55) on mobile → 77×132
  // and scale(0.7) on md+ → 98×168.
  // Positions calculated from center of cross.

  const cw = 98;   // card width at md scale
  const ch = 168;  // card height at md scale
  const gapX = 16; // horizontal gap between cards
  const gapY = 16; // vertical gap between cards
  const staffGap = 40; // gap between cross and staff

  // Cross center point
  const cx = cw * 1.5 + gapX; // center X of cross
  const cy = ch * 1.5 + gapY; // center Y of cross

  // Cross positions (center of each card)
  const crossPositions = [
    { idx: 0, top: cy - ch / 2,              left: cx - cw / 2 },                          // Present (center)
    { idx: 1, top: cy - ch / 2,              left: cx - cw / 2, crossing: true },           // Crossing (rotated)
    { idx: 2, top: cy + ch / 2 + gapY,       left: cx - cw / 2 },                          // Foundation (below)
    { idx: 3, top: cy - ch / 2,              left: cx - cw * 1.5 - gapX },                 // Past (left)
    { idx: 4, top: cy - ch * 1.5 - gapY,     left: cx - cw / 2 },                          // Crown (above)
    { idx: 5, top: cy - ch / 2,              left: cx + cw / 2 + gapX },                   // Future (right)
  ];

  // Staff column — right side, bottom to top: 6, 7, 8, 9
  const staffLeft = cx + cw * 1.5 + gapX + staffGap;
  const staffPositions = [9, 8, 7, 6].map((idx, row) => ({
    idx,
    top: row * (ch + gapY / 2),
    left: staffLeft,
  }));

  const totalW = staffLeft + cw;
  const totalH = ch * 3 + gapY * 2;

  return (
    <div className="w-full overflow-x-auto px-4">
      <div
        className="relative mx-auto origin-top scale-[0.55] sm:scale-[0.65] md:scale-[0.7] lg:scale-[0.85] xl:scale-100"
        style={{ width: totalW, height: totalH }}
      >
        {/* ── Cross ── */}
        {crossPositions.map(({ idx, top, left, crossing }) => (
          <div
            key={idx}
            className="absolute"
            style={{
              top,
              left,
              width: cw,
              height: ch,
              zIndex: crossing ? (revealedIndices.has(idx) ? 0 : 2) : 1,
              pointerEvents: crossing && revealedIndices.has(idx) ? 'none' : 'auto',
            }}
          >
            {crossing ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rotate-90">
                  <CelticCard dc={cards[idx]} idx={idx} revealed={revealedIndices.has(idx)} onReveal={onRevealCard} language={language} hideLabel />
                </div>
              </div>
            ) : (
              <CelticCard dc={cards[idx]} idx={idx} revealed={revealedIndices.has(idx)} onReveal={onRevealCard} language={language} />
            )}
          </div>
        ))}

        {/* ── Staff ── */}
        {staffPositions.map(({ idx, top, left }) => (
          <div key={idx} className="absolute" style={{ top, left, width: cw, height: ch }}>
            <CelticCard dc={cards[idx]} idx={idx} revealed={revealedIndices.has(idx)} onReveal={onRevealCard} language={language} />
          </div>
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
      />
      {!hideLabel && (
        <p className="text-[11px] text-gray-400/70 font-light text-center mt-1 whitespace-nowrap">
          {posName}
        </p>
      )}
    </motion.div>
  );
}
