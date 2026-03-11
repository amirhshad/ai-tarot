'use client';

import { TarotCard } from '@/lib/tarot/types';
import Image from 'next/image';

interface CardFaceProps {
  card: TarotCard;
  reversed: boolean;
  language?: 'en' | 'fa';
}

export default function CardFace({ card, reversed, language = 'en' }: CardFaceProps) {
  const name = language === 'en' ? card.name : card.nameFA;

  return (
    <div
      className={`w-full h-full rounded-xl bg-slate-50 border-2 border-amber-500/60 flex flex-col items-center overflow-hidden ${
        reversed ? 'rotate-180' : ''
      }`}
    >
      {/* Card image area */}
      <div className="flex-1 w-full relative bg-gradient-to-b from-purple-50 to-slate-100 flex items-center justify-center p-2">
        <Image
          src={card.image}
          alt={card.name}
          fill
          className="object-contain p-1"
          sizes="180px"
          onError={(e) => {
            // Fallback if image doesn't exist yet
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {/* Fallback when no image */}
        <div className="absolute inset-0 flex items-center justify-center text-purple-400/40">
          <span className="text-5xl">&#9813;</span>
        </div>
      </div>

      {/* Card name */}
      <div className="w-full px-2 py-2 text-center bg-white border-t border-amber-500/30">
        <p className="text-xs font-medium text-slate-700 truncate">{name}</p>
        {reversed && (
          <p className="text-[10px] text-red-500 font-light">
            {language === 'en' ? 'Reversed' : 'معکوس'}
          </p>
        )}
      </div>
    </div>
  );
}
