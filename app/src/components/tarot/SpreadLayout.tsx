'use client';

import React from 'react';
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

  // Celtic Cross — matches traditional layout reference:
  //
  //  Cross (left):            Staff (right, bottom→top):
  //          [4]                    [9]
  //   [3]  [0+1]  [5]              [8]
  //          [2]                    [7]
  //                                [6]

  const cw = 90;   // card width
  const ch = 154;  // card height
  const gapX = 10;
  const gapY = 10;
  const staffGap = 30;

  const cx = cw * 1.5 + gapX;
  const cy = ch * 1.5 + gapY;

  const crossPositions = [
    { idx: 0, top: cy - ch / 2,              left: cx - cw / 2 },
    { idx: 1, top: cy - ch / 2,              left: cx - cw / 2, crossing: true },
    { idx: 2, top: cy + ch / 2 + gapY,       left: cx - cw / 2 },
    { idx: 3, top: cy - ch / 2,              left: cx - cw * 1.5 - gapX },
    { idx: 4, top: cy - ch * 1.5 - gapY,     left: cx - cw / 2 },
    { idx: 5, top: cy - ch / 2,              left: cx + cw / 2 + gapX },
  ];

  const staffLeft = cx + cw * 1.5 + gapX + staffGap;
  const staffPositions = [9, 8, 7, 6].map((idx, row) => ({
    idx,
    top: row * (ch + gapY / 2),
    left: staffLeft,
  }));

  const totalW = staffLeft + cw;
  const totalH = ch * 3 + gapY * 2;

  return (
    <CelticCrossWrapper naturalWidth={totalW} naturalHeight={totalH}>
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
    </CelticCrossWrapper>
  );
}

/**
 * Wrapper that scales the Celtic Cross layout to fit the viewport
 * and collapses the container height to match the scaled size,
 * preventing unnecessary page scroll.
 */
function CelticCrossWrapper({
  naturalWidth,
  naturalHeight,
  children,
}: {
  naturalWidth: number;
  naturalHeight: number;
  children: React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.offsetWidth - 32; // px-4 padding
      const s = Math.min(1, availableWidth / naturalWidth);
      setScale(s);
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [naturalWidth]);

  return (
    <div ref={containerRef} className="w-full px-4">
      <div
        style={{
          height: naturalHeight * scale,
          position: 'relative',
        }}
      >
        <div
          style={{
            width: naturalWidth,
            height: naturalHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            position: 'absolute',
            left: '50%',
            marginLeft: -(naturalWidth / 2),
          }}
        >
          {children}
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
