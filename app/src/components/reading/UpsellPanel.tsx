'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

export default function UpsellPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="max-w-2xl mx-auto mt-8"
    >
      <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.02] border border-white/10">
        <h3 className="text-center font-display text-lg text-gold-400 mb-2">
          Want to go deeper?
        </h3>
        <p className="text-center text-sm text-stone-400 mb-6">
          Create a free account to unlock more from your readings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UpsellCard
            icon="&#x2727;"
            title="Save This Reading"
            description="Create an account to save this reading to your history and revisit it anytime."
            cta="Sign Up Free"
            href="/signup"
          />
          <UpsellCard
            icon="&#x2726;"
            title="Ask Follow-ups"
            description="Go deeper with up to 5 follow-up questions about your reading."
            cta="Sign Up Free"
            href="/signup"
          />
          <UpsellCard
            icon="&#x2736;"
            title="Celtic Cross Spread"
            description="Unlock 10-card deep readings with richer narrative interpretation."
            cta="Go Pro"
            href="/signup?plan=pro"
            highlight
          />
        </div>
      </div>
    </motion.div>
  );
}

function UpsellCard({
  icon,
  title,
  description,
  cta,
  href,
  highlight = false,
}: {
  icon: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? 'border-gold-400/30 bg-gold-400/[0.04]' : 'border-white/10 bg-white/[0.03]'} flex flex-col`}>
      <span className="text-xl text-gold-400/70 mb-2">{icon}</span>
      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-stone-400 mb-4 flex-1">{description}</p>
      <Link
        href={href}
        className={`text-center text-xs font-medium px-4 py-2 rounded-lg transition-colors ${
          highlight
            ? 'bg-gradient-to-b from-gold-400 to-gold-600 text-black hover:shadow-[0_0_20px_rgba(212,160,67,0.2)]'
            : 'bg-white/10 hover:bg-white/15 text-gray-300'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
