'use client';

import { useTranslations } from 'next-intl';
import { SpreadType } from '@/lib/tarot/types';
import { SPREADS, getAvailableSpreads } from '@/lib/tarot/spreads';
import { spreadName, spreadDescription } from '@/lib/tarot/localized';
import type { Locale } from '@/i18n/locales';

interface SpreadSelectorProps {
  tier: string;
  selectedSpread: SpreadType | null;
  onSelect: (type: SpreadType) => void;
  language?: Locale;
  allowedSpreads?: SpreadType[];
}

export default function SpreadSelector({
  tier,
  selectedSpread,
  onSelect,
  language = 'en',
  allowedSpreads,
}: SpreadSelectorProps) {
  const t = useTranslations('reading');
  const allSpreads = Object.values(SPREADS);
  const available = getAvailableSpreads(tier);
  const availableTypes = new Set(available.map(s => s.type));

  // Filter by allowed spreads if provided (e.g., yes/no only allows single + three-card)
  const visibleSpreads = allowedSpreads
    ? allSpreads.filter(s => allowedSpreads.includes(s.type))
    : allSpreads;

  return (
    <div className={`grid grid-cols-1 ${visibleSpreads.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 max-w-2xl mx-auto`}>
      {visibleSpreads.map((spread) => {
        const isAvailable = availableTypes.has(spread.type);
        const isSelected = selectedSpread === spread.type;
        const name = spreadName(spread, language);
        const desc = spreadDescription(spread, language);

        return (
          <button
            key={spread.type}
            onClick={() => isAvailable && onSelect(spread.type)}
            disabled={!isAvailable}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              isSelected
                ? 'border-amber-400 bg-white/[0.06] shadow-lg shadow-amber-400/10'
                : isAvailable
                  ? 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  : 'border-white/5 bg-white/[0.01] opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">{name}</h3>
              <span className="text-xs text-gray-500">{spread.cardCount} cards</span>
            </div>
            <p className="text-sm text-gray-400">{desc}</p>
            {!isAvailable && (
              <p className="text-xs text-amber-400 mt-2">
                {t('requiresTier', { tier: spread.minimumTier })}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
