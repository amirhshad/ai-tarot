'use client';

import { SpreadType } from '@/lib/tarot/types';
import { SPREADS, getAvailableSpreads } from '@/lib/tarot/spreads';

interface SpreadSelectorProps {
  tier: string;
  selectedSpread: SpreadType | null;
  onSelect: (type: SpreadType) => void;
  language?: 'en' | 'fa';
}

export default function SpreadSelector({
  tier,
  selectedSpread,
  onSelect,
  language = 'en',
}: SpreadSelectorProps) {
  const allSpreads = Object.values(SPREADS);
  const available = getAvailableSpreads(tier);
  const availableTypes = new Set(available.map(s => s.type));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
      {allSpreads.map((spread) => {
        const isAvailable = availableTypes.has(spread.type);
        const isSelected = selectedSpread === spread.type;
        const name = language === 'en' ? spread.name : spread.nameFA;
        const desc = language === 'en' ? spread.description : spread.descriptionFA;

        return (
          <button
            key={spread.type}
            onClick={() => isAvailable && onSelect(spread.type)}
            disabled={!isAvailable}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              isSelected
                ? 'border-amber-400 bg-purple-900/50 shadow-lg shadow-amber-400/10'
                : isAvailable
                  ? 'border-purple-700/50 bg-purple-950/30 hover:border-purple-500/50'
                  : 'border-purple-900/30 bg-purple-950/10 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">{name}</h3>
              <span className="text-xs text-purple-400">{spread.cardCount} cards</span>
            </div>
            <p className="text-sm text-purple-300/70">{desc}</p>
            {!isAvailable && (
              <p className="text-xs text-amber-400 mt-2">
                {language === 'en' ? `Requires ${spread.minimumTier}` : `نیاز به ${spread.minimumTier}`}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
