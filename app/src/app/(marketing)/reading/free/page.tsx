import Link from 'next/link';
import FreeReadingClient from '@/components/reading/FreeReadingClient';

interface PageProps {
  searchParams: Promise<{ topic?: string }>;
}

const VALID_TOPICS = ['general', 'love', 'yes-or-no', 'career'];

export default async function FreeReadingPage({ searchParams }: PageProps) {
  const { topic } = await searchParams;
  const hasTopic = topic && VALID_TOPICS.includes(topic);

  // If a topic is selected (via URL), render the interactive client component
  if (hasTopic) {
    return <FreeReadingClient />;
  }

  // Otherwise, render the topic selection as static server HTML (SEO-friendly)
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header — server-rendered for crawlers */}
      <div className="text-center">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-white">
          Free AI Tarot Reading
        </h1>
        <p className="text-stone-400 text-sm mt-2">
          Choose a topic for your three-card past, present, and future spread
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Crypto-random card draws &middot; Narrative AI interpretation &middot; No signup required
        </p>
      </div>

      {/* Topic selection — static HTML with links, works without JS */}
      <div className="max-w-lg mx-auto space-y-3">
        <Link
          href="/reading/free?topic=general"
          className="w-full flex items-center gap-4 p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-gold-400/30 hover:bg-white/[0.04] transition-all duration-300 text-left group"
        >
          <span className="text-2xl text-gold-400/50 group-hover:text-gold-400/90 transition-colors w-10 text-center flex-shrink-0">
            &#10024;
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-medium text-white group-hover:text-gold-400 transition-colors">
              General Reading
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Open-ended — explore whatever comes up</p>
          </div>
        </Link>

        <Link
          href="/reading/free?topic=love"
          className="w-full flex items-center gap-4 p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-gold-400/30 hover:bg-white/[0.04] transition-all duration-300 text-left group"
        >
          <span className="text-2xl text-gold-400/50 group-hover:text-gold-400/90 transition-colors w-10 text-center flex-shrink-0">
            &#9825;
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-medium text-white group-hover:text-gold-400 transition-colors">
              Love &amp; Relationships
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Romantic connections, compatibility, emotional clarity</p>
          </div>
        </Link>

        <Link
          href="/reading/free?topic=career"
          className="w-full flex items-center gap-4 p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-gold-400/30 hover:bg-white/[0.04] transition-all duration-300 text-left group"
        >
          <span className="text-2xl text-gold-400/50 group-hover:text-gold-400/90 transition-colors w-10 text-center flex-shrink-0">
            &#9734;
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-medium text-white group-hover:text-gold-400 transition-colors">
              Career &amp; Work
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Professional path, growth, and direction</p>
          </div>
        </Link>

        <Link
          href="/reading/free?topic=yes-or-no"
          className="w-full flex items-center gap-4 p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-gold-400/30 hover:bg-white/[0.04] transition-all duration-300 text-left group"
        >
          <span className="text-2xl text-gold-400/50 group-hover:text-gold-400/90 transition-colors w-10 text-center flex-shrink-0">
            &#10710;
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-medium text-white group-hover:text-gold-400 transition-colors">
              Yes or No
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">A direct answer to your question</p>
          </div>
        </Link>
      </div>

      {/* SEO content — visible to crawlers, provides context */}
      <div className="max-w-2xl mx-auto pt-8 border-t border-white/[0.06]">
        <h2 className="font-display text-lg font-medium text-white mb-3">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-3 text-center">
          <div>
            <div className="text-2xl text-gold-400/60 mb-1">1</div>
            <h3 className="text-sm font-medium text-white">Choose Your Topic</h3>
            <p className="text-xs text-stone-500 mt-1">Pick a focus area or go with a general reading</p>
          </div>
          <div>
            <div className="text-2xl text-gold-400/60 mb-1">2</div>
            <h3 className="text-sm font-medium text-white">Draw Three Cards</h3>
            <p className="text-xs text-stone-500 mt-1">Cryptographically random shuffle — no predetermined outcomes</p>
          </div>
          <div>
            <div className="text-2xl text-gold-400/60 mb-1">3</div>
            <h3 className="text-sm font-medium text-white">Get Your Narrative</h3>
            <p className="text-xs text-stone-500 mt-1">AI weaves all three cards into one cohesive story</p>
          </div>
        </div>
      </div>
    </div>
  );
}
