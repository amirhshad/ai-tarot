'use client';

import { useState } from 'react';
import Link from 'next/link';
import PricingTable from '@/components/billing/PricingTable';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSubmitted(true);
    } catch {
      // Silently handle — will add proper error handling with Supabase
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative px-4 py-24 md:py-32 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="text-amber-400 text-5xl mb-6">&#10022;</div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Tarot Readings That{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400">
              Tell Your Story
            </span>
          </h1>
          <p className="text-lg md:text-xl text-purple-200/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Not generic card meanings — a narrative woven from your entire spread.
            AI-powered readings with real conversational depth,
            cryptographically random cards, and multi-language support.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-lg transition-colors"
            >
              Start Free Reading
            </Link>
            <a
              href="#features"
              className="px-8 py-3 border border-purple-500/50 text-purple-200 hover:border-purple-400 rounded-xl text-lg transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 border-t border-purple-800/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Choose Your Spread',
                desc: 'Single card for quick insight, three-card for past-present-future, or Celtic Cross for deep exploration.',
              },
              {
                step: '2',
                title: 'Draw Your Cards',
                desc: 'Cards are shuffled using cryptographic randomness — verifiable, fair, and truly random.',
              },
              {
                step: '3',
                title: 'Receive Your Story',
                desc: 'AI reads all cards together as one narrative. Ask follow-up questions to go deeper.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-800/50 border border-purple-600/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-amber-400 font-bold">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-purple-300/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20 border-t border-purple-800/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            What Makes Us Different
          </h2>
          <p className="text-purple-300/60 text-center mb-12 max-w-2xl mx-auto">
            We analyzed 25+ tarot platforms. Users consistently want depth, narrative, and genuine conversation. No one delivers it. We do.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Narrative Interpretation',
                desc: 'AI reads all cards together, building a cohesive story arc — not isolated per-card templates.',
                icon: '&#9998;',
              },
              {
                title: 'Conversational Follow-up',
                desc: 'Up to 10 follow-up questions per reading. Go deeper, explore specific cards, ask for clarification.',
                icon: '&#128172;',
              },
              {
                title: 'Crypto-Random Cards',
                desc: 'Fisher-Yates shuffle with cryptographic randomness. Transparent, verifiable, trustworthy.',
                icon: '&#128274;',
              },
              {
                title: 'Context-Aware Readings',
                desc: 'Interpretations can reference your real situation. Readings feel alive and specific, not generic.',
                icon: '&#127758;',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-purple-950/30 border border-purple-800/30"
              >
                <div
                  className="text-2xl mb-3"
                  dangerouslySetInnerHTML={{ __html: feature.icon }}
                />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-purple-300/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-20 border-t border-purple-800/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Simple Pricing
          </h2>
          <p className="text-purple-300/60 text-center mb-12">
            Start free. Upgrade when you want deeper readings.
          </p>
          <PricingTable />
        </div>
      </section>

      {/* Waitlist */}
      <section className="px-4 py-20 border-t border-purple-800/20">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Join the Waitlist
          </h2>
          <p className="text-purple-300/60 mb-6">
            Be the first to know when we launch. Early access + special pricing.
          </p>

          {submitted ? (
            <div className="p-4 rounded-xl bg-green-900/30 border border-green-700/30">
              <p className="text-green-300">You&apos;re on the list! We&apos;ll be in touch.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-purple-950/50 border border-purple-700/50 rounded-xl px-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400/50"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-colors"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
