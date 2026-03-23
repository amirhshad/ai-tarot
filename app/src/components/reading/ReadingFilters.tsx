'use client';

import { useEffect, useRef } from 'react';

interface ReadingFiltersProps {
  search: string;
  spreadType: string;
  topic: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (value: string) => void;
  onSpreadTypeChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
  language?: 'en' | 'fa';
}

const SPREAD_OPTIONS = [
  { value: '', label: 'All Spreads' },
  { value: 'single', label: 'Single Card' },
  { value: 'three-card', label: 'Three Card' },
  { value: 'celtic-cross', label: 'Celtic Cross' },
];

const TOPIC_OPTIONS = [
  { value: '', label: 'All Topics' },
  { value: 'general', label: 'General' },
  { value: 'love', label: 'Love' },
  { value: 'career', label: 'Career' },
  { value: 'yes-or-no', label: 'Yes or No' },
];

export default function ReadingFilters({
  search,
  spreadType,
  topic,
  dateFrom,
  dateTo,
  onSearchChange,
  onSpreadTypeChange,
  onTopicChange,
  onDateFromChange,
  onDateToChange,
  onClear,
  language = 'en',
}: ReadingFiltersProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const hasFilters = search || spreadType || topic || dateFrom || dateTo;

  function handleSearchInput(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Sync controlled search input when cleared externally
  useEffect(() => {
    if (!search && searchRef.current && searchRef.current.value !== '') {
      searchRef.current.value = '';
    }
  }, [search]);

  const selectClass = "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50 appearance-none cursor-pointer";
  const inputClass = "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50";

  return (
    <div className="sticky top-14 z-40 bg-black/90 backdrop-blur-sm py-3 -mx-4 px-4 flex flex-wrap items-center gap-3" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Search */}
      <input
        ref={searchRef}
        type="text"
        placeholder="Search by question..."
        defaultValue={search}
        onChange={(e) => handleSearchInput(e.target.value)}
        className={`${inputClass} w-full sm:w-48`}
      />

      {/* Spread type */}
      <select
        value={spreadType}
        onChange={(e) => onSpreadTypeChange(e.target.value)}
        className={selectClass}
      >
        {SPREAD_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Topic */}
      <select
        value={topic}
        onChange={(e) => onTopicChange(e.target.value)}
        className={selectClass}
      >
        {TOPIC_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Date from */}
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        className={`${inputClass} w-36`}
        placeholder="From"
      />

      {/* Date to */}
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        className={`${inputClass} w-36`}
        placeholder="To"
      />

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-amber-400 transition-colors px-2 py-1"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
