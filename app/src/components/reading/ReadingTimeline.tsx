'use client';

import Link from 'next/link';
import type { ReadingRow } from '@/lib/db/queries';
import DeleteReadingButton from '@/components/reading/DeleteReadingButton';

interface ReadingTimelineProps {
  readings: ReadingRow[];
  language?: 'en' | 'fa';
  onDelete?: (readingId: string) => void;
}

function formatSpreadType(type: string): string {
  return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatTopic(topic: string | null): string | null {
  if (!topic) return null;
  const map: Record<string, string> = {
    'love': 'Love',
    'career': 'Career',
    'yes-or-no': 'Yes/No',
  };
  return map[topic] || topic;
}

function groupByDate(readings: ReadingRow[]): { date: string; readings: ReadingRow[] }[] {
  const groups: Map<string, ReadingRow[]> = new Map();
  for (const reading of readings) {
    const date = new Date(reading.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date)!.push(reading);
  }
  return Array.from(groups.entries()).map(([date, readings]) => ({ date, readings }));
}

export default function ReadingTimeline({ readings, language = 'en', onDelete }: ReadingTimelineProps) {
  const groups = groupByDate(readings);

  if (readings.length === 0) return null;

  return (
    <div className="relative" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Vertical timeline line */}
      <div className="absolute top-0 bottom-0 left-[7px] w-[2px] bg-amber-400/20" />

      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.date}>
            {/* Date heading */}
            <h3 className="text-sm font-medium text-gray-400 mb-4 pl-8">
              {group.date}
            </h3>

            <div className="space-y-3">
              {group.readings.map((reading) => {
                const topicLabel = formatTopic(reading.topic);
                const snippet = reading.interpretation
                  ? reading.interpretation.slice(0, 120) + (reading.interpretation.length > 120 ? '...' : '')
                  : null;

                return (
                  <Link
                    key={reading.id}
                    href={`/reading/${reading.id}`}
                    className="relative flex items-start pl-8 group"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[3px] top-2 w-[10px] h-[10px] rounded-full bg-amber-400/60 group-hover:bg-amber-400 transition-colors border-2 border-black" />

                    {/* Content */}
                    <div className="flex-1 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-amber-400/20 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-amber-400">
                            {formatSpreadType(reading.spread_type)}
                          </span>
                          {topicLabel && (
                            <>
                              <span className="text-gray-600">·</span>
                              <span className="text-xs text-gray-400">{topicLabel}</span>
                            </>
                          )}
                        </div>
                        {onDelete && (
                          <span onClick={(e) => e.preventDefault()}>
                            <DeleteReadingButton readingId={reading.id} onDeleted={() => onDelete(reading.id)} />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 truncate">
                        {reading.question || 'General reading'}
                      </p>
                      {snippet && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {snippet}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
