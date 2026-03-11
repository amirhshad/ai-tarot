'use client';

export default function CardBack() {
  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 border-2 border-amber-500/60 flex items-center justify-center overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-2 border border-amber-500/30 rounded-lg" />
      <div className="absolute inset-4 border border-amber-500/20 rounded-md" />
      <div className="text-center">
        <div className="text-amber-400 text-3xl mb-1">&#10022;</div>
        <div className="text-amber-300/60 text-xs tracking-[0.3em] uppercase font-light">
          Tarot
        </div>
        <div className="text-amber-400 text-3xl mt-1">&#10022;</div>
      </div>
    </div>
  );
}
