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
      <div className="flex justify-center gap-4 md:gap-8">
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

  // Celtic Cross layout
  return (
    <div className="relative mx-auto" style={{ width: '600px', height: '520px' }}>
      {/* Cross section */}
      <CelticPosition dc={cards[0]} idx={0} top={180} left={180} revealed={revealedIndices.has(0)} onReveal={onRevealCard} language={language} />
      <CelticPosition dc={cards[1]} idx={1} top={180} left={180} revealed={revealedIndices.has(1)} onReveal={onRevealCard} language={language} rotate />
      <CelticPosition dc={cards[2]} idx={2} top={290} left={180} revealed={revealedIndices.has(2)} onReveal={onRevealCard} language={language} />
      <CelticPosition dc={cards[3]} idx={3} top={180} left={50} revealed={revealedIndices.has(3)} onReveal={onRevealCard} language={language} />
      <CelticPosition dc={cards[4]} idx={4} top={70} left={180} revealed={revealedIndices.has(4)} onReveal={onRevealCard} language={language} />
      <CelticPosition dc={cards[5]} idx={5} top={180} left={310} revealed={revealedIndices.has(5)} onReveal={onRevealCard} language={language} />
      {/* Staff section */}
      <CelticPosition dc={cards[6]} idx={6} top={380} left={450} revealed={revealedIndices.has(6)} onReveal={onRevealCard} language={language} />
      <CelticPosition dc={cards[7]} idx={7} top={270} left={450} revealed={revealedIndices.has(7)} onReveal={onRevealCard} language={language} />
      <CelticPosition dc={cards[8]} idx={8} top={160} left={450} revealed={revealedIndices.has(8)} onReveal={onRevealCard} language={language} />
      <CelticPosition dc={cards[9]} idx={9} top={50} left={450} revealed={revealedIndices.has(9)} onReveal={onRevealCard} language={language} />
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
      <p className="text-xs text-purple-300 font-light text-center">{posName}</p>
    </motion.div>
  );
}

function CelticPosition({
  dc,
  idx,
  top,
  left,
  revealed,
  onReveal,
  language,
  rotate = false,
}: {
  dc: DrawnCard;
  idx: number;
  top: number;
  left: number;
  revealed: boolean;
  onReveal: (i: number) => void;
  language: 'en' | 'fa';
  rotate?: boolean;
}) {
  const posName = language === 'en' ? dc.position.name : dc.position.nameFA;

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-1"
      style={{ top, left, transform: rotate ? 'rotate(90deg)' : undefined }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.1 }}
    >
      <Card
        card={dc.card}
        reversed={dc.reversed}
        isRevealed={revealed}
        onReveal={() => onReveal(idx)}
        language={language}
        className="scale-75"
      />
      {!rotate && (
        <p className="text-[10px] text-purple-300/80 text-center">{posName}</p>
      )}
    </motion.div>
  );
}
