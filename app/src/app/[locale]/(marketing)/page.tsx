'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import PricingTable from '@/components/billing/PricingTable';

/* ─── Fanned card data: iconic Major Arcana picks ─── */
const HERO_CARDS = [
  { src: '/cards/major/m02.jpg', name: 'The High Priestess', rotate: -18, x: -140, delay: 0.1 },
  { src: '/cards/major/m10.jpg', name: 'Wheel of Fortune', rotate: -9, x: -70, delay: 0.2 },
  { src: '/cards/major/m17.jpg', name: 'The Star', rotate: 0, x: 0, delay: 0.3 },
  { src: '/cards/major/m18.jpg', name: 'The Moon', rotate: 9, x: 70, delay: 0.4 },
  { src: '/cards/major/m19.jpg', name: 'The Sun', rotate: 18, x: 140, delay: 0.5 },
];

/* ─── Starfield background component ─── */
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number; phase: number }[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createStars() {
      stars.length = 0;
      const count = Math.floor((canvas!.width * canvas!.height) / 8000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          r: Math.random() * 1.2 + 0.2,
          speed: Math.random() * 0.3 + 0.05,
          opacity: Math.random() * 0.6 + 0.1,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const star of stars) {
        const twinkle = Math.sin(time * 0.001 * star.speed + star.phase) * 0.3 + 0.7;
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(212, 180, 120, ${star.opacity * twinkle})`;
        ctx!.fill();
      }
      animationId = requestAnimationFrame(draw);
    }

    resize();
    createStars();
    animationId = requestAnimationFrame(draw);

    window.addEventListener('resize', () => {
      resize();
      createStars();
    });

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/* ─── Ornamental divider ─── */
function Ornament() {
  return (
    <div className="flex items-center justify-center gap-4 my-6 opacity-30">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-400" />
      <svg width="16" height="16" viewBox="0 0 16 16" className="text-gold-400">
        <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="currentColor" />
      </svg>
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-400" />
    </div>
  );
}

/* ─── Section reveal wrapper ─── */
function RevealSection({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

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
      // Will add proper error handling
    }
  }

  return (
    <div className="relative flex flex-col overflow-x-hidden">
      <Starfield />

      {/* ══════════════ HERO ══════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16">
        {/* Ambient glow behind cards */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-amber-500/[0.03] blur-[100px]" />
        </div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="w-[400px] h-[300px] rounded-full bg-amber-500/[0.03] blur-[80px]" />
        </div>

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 text-center">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <h2 className="font-display text-sm md:text-base tracking-[0.4em] uppercase text-gold-400/70 mb-2">
              TarotVeil
            </h2>
            <Ornament />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-semibold text-white leading-[1.1] mt-4 mb-4 text-balance"
          >
            Reveal What the
            <br />
            <span className="text-shimmer">Cards Hold for You</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-body text-lg md:text-xl font-medium text-stone-300 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Not generic meanings — a narrative woven from your entire spread.
            AI-powered readings with true conversational depth.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              href="/reading/free"
              className="group relative px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,160,67,0.3)]"
            >
              <span className="relative z-10">Get a Free Reading</span>
              <div className="absolute inset-0 bg-gradient-to-b from-gold-300 to-gold-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <a
              href="#features"
              className="px-10 py-3.5 border border-gold-400/20 text-gold-400/80 font-display text-base tracking-wide rounded-sm hover:border-gold-400/40 hover:text-gold-400 transition-all duration-300"
            >
              Discover More
            </a>
          </motion.div>

          {/* ── Fanned Cards ── */}
          <div className="relative mx-auto h-[220px] sm:h-[320px] w-full max-w-[600px]">
            {HERO_CARDS.map((card, i) => (
              <motion.div
                key={card.name}
                className="absolute left-1/2 bottom-0 origin-bottom cursor-default w-[90px] h-[154px] sm:w-[140px] sm:h-[240px]"
                initial={{ opacity: 0, y: 60, rotate: 0, x: '-50%' }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: card.rotate,
                  x: `calc(-50% + ${card.x}px)`,
                }}
                transition={{
                  duration: 0.9,
                  delay: card.delay + 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -16,
                  scale: 1.06,
                  transition: { duration: 0.3, ease: 'easeOut' },
                }}
              >
                <div
                  className="relative w-full h-full rounded-md overflow-hidden card-glow"
                  style={{
                    animation: `float ${6 + i * 0.8}s ease-in-out ${i * 0.5}s infinite`,
                  }}
                >
                  {/* Card border frame */}
                  <div className="absolute inset-0 rounded-md border border-gold-400/20 z-10 pointer-events-none" />
                  <div className="absolute inset-[3px] rounded-sm border border-gold-400/10 z-10 pointer-events-none" />

                  <Image
                    src={card.src}
                    alt={card.name}
                    fill
                    sizes="(max-width: 640px) 90px, 140px"
                    className="object-cover"
                    priority={i < 3}
                  />

                  {/* Subtle vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Card names whisper */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="text-[11px] tracking-[0.2em] text-gold-400/25 font-display mt-6 uppercase"
          >
            The High Priestess &middot; Wheel of Fortune &middot; The Star &middot; The Moon &middot; The Sun
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-gold-400/20 flex justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-gold-400/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════ FREE READING ══════════════ */}
      <RevealSection className="relative px-4 py-24">
        <hr className="section-divider mb-20" />
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white text-center mb-2">
            Free Reading
          </h2>
          <p className="font-body text-base font-medium text-stone-400 text-center mb-4">
            Choose a topic for a personalized reading, or start a general one
          </p>
          <Ornament />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-14">
            {[
              {
                href: '/reading/free',
                title: 'General',
                desc: 'Open-ended three-card reading',
                symbol: '\u2728',
              },
              {
                href: '/reading/free?topic=love',
                title: 'Love',
                desc: 'Romantic connections & clarity',
                symbol: '\u2661',
              },
              {
                href: '/reading/free?topic=career',
                title: 'Career',
                desc: 'Professional path & growth',
                symbol: '\u2606',
              },
              {
                href: '/reading/free?topic=yes-or-no',
                title: 'Yes or No',
                desc: 'A direct answer to your question',
                symbol: '\u29D6',
              },
            ].map((topic, idx) => (
              <motion.div
                key={topic.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.6 }}
              >
                <Link
                  href={topic.href}
                  className="group block p-6 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent hover:border-gold-400/30 transition-all duration-500 text-center h-full relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-gold-400/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative text-2xl text-gold-400/50 group-hover:text-gold-400/90 transition-colors duration-500">
                    {topic.symbol}
                  </span>
                  <h3 className="relative font-display text-base font-medium text-white mt-3 mb-1.5 group-hover:text-gold-400 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="relative font-body text-xs font-medium text-stone-400 leading-relaxed">
                    {topic.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <RevealSection className="relative px-4 py-24">
        <hr className="section-divider mb-20" />
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white text-center mb-2">
            How It Works
          </h2>
          <Ornament />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            {[
              {
                step: 'I',
                title: 'Choose Your Spread',
                desc: 'Single card for quick insight, three-card for past-present-future, or Celtic Cross for deep exploration.',
              },
              {
                step: 'II',
                title: 'Draw Your Cards',
                desc: 'Cards are shuffled using cryptographic randomness — verifiable, fair, and truly random.',
              },
              {
                step: 'III',
                title: 'Receive Your Story',
                desc: 'AI reads all cards together as one narrative. Ask follow-up questions to go deeper.',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.7 }}
                className="text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border border-gold-400/20 group-hover:border-gold-400/40 transition-colors duration-500" />
                  <div className="absolute inset-[3px] rounded-full border border-gold-400/10" />
                  <span className="absolute inset-0 flex items-center justify-center font-display text-xl text-gold-400/80">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display text-lg font-medium text-white mb-3">{item.title}</h3>
                <p className="font-body text-base font-medium text-stone-300 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ══════════════ FEATURES ══════════════ */}
      <RevealSection id="features" className="relative px-4 py-24">
        <hr className="section-divider mb-20" />
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white text-center mb-2">
            What Sets Us Apart
          </h2>
          <p className="font-body text-base font-medium text-stone-400 text-center mb-4 max-w-xl mx-auto">
            We studied 25+ tarot platforms. Users want depth, narrative, and genuine conversation.
          </p>
          <Ornament />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14">
            {[
              {
                title: 'Narrative Interpretation',
                desc: 'AI reads all cards together, building a cohesive story arc — not isolated per-card templates.',
                symbol: '\u2727',
              },
              {
                title: 'Conversational Follow-up',
                desc: 'Up to 10 follow-up questions per reading. Go deeper, explore specific cards, ask for clarity.',
                symbol: '\u2726',
              },
              {
                title: 'Crypto-Random Cards',
                desc: 'Fisher-Yates shuffle with cryptographic randomness. Transparent, verifiable, trustworthy.',
                symbol: '\u2736',
              },
              {
                title: 'Context-Aware Readings',
                desc: 'Interpretations reference your real situation. Readings feel alive and specific, never generic.',
                symbol: '\u2735',
              },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group p-8 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent hover:border-gold-400/20 transition-all duration-500 relative overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-gold-400/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <span className="relative text-2xl text-gold-400/60 group-hover:text-gold-400/90 transition-colors duration-500">
                  {feature.symbol}
                </span>
                <h3 className="relative font-display text-lg font-medium text-white mt-4 mb-3">{feature.title}</h3>
                <p className="relative font-body text-base font-medium text-stone-300 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ══════════════ CARD SHOWCASE ══════════════ */}
      <RevealSection className="relative px-4 py-24">
        <hr className="section-divider mb-20" />
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-2">
            78 Cards, Infinite Stories
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-4">
            Every reading draws from the complete Rider-Waite-Smith deck
          </p>
          <Ornament />

          {/* Scrolling card strip */}
          <div className="relative mt-14 overflow-hidden" style={{ height: '200px' }}>
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#060208] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#060208] to-transparent z-10 pointer-events-none" />

            <motion.div
              className="flex gap-4 absolute"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            >
              {[...Array(2)].map((_, setIdx) =>
                Array.from({ length: 22 }, (_, i) => (
                  <div
                    key={`${setIdx}-${i}`}
                    className="flex-shrink-0 w-[120px] h-[190px] rounded-sm overflow-hidden border border-gold-400/10 relative"
                  >
                    <Image
                      src={`/cards/major/m${String(i).padStart(2, '0')}.jpg`}
                      alt={`Major Arcana ${i}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                ))
              )}
            </motion.div>
          </div>

          {/* CTA to card meanings */}
          <Link
            href="/tarot-card-meanings"
            className="inline-block mt-10 px-8 py-3 border border-gold-400/20 text-gold-400/80 font-display text-base tracking-wide rounded-sm hover:border-gold-400/40 hover:text-gold-400 transition-all duration-300"
          >
            Explore All 78 Card Meanings
          </Link>
        </div>
      </RevealSection>

      {/* ══════════════ PRICING ══════════════ */}
      <RevealSection id="pricing" className="relative px-4 py-24">
        <hr className="section-divider mb-20" />
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white text-center mb-2">
            Choose Your Path
          </h2>
          <p className="font-body text-base font-medium text-stone-400 text-center mb-4">
            Start free. Ascend when you seek deeper wisdom.
          </p>
          <Ornament />
          <div className="mt-14">
            <PricingTable onSelectPlan={(plan) => {
              window.location.href = `/signup?plan=${plan}`;
            }} />
          </div>
        </div>
      </RevealSection>

      {/* ══════════════ FAQ ══════════════ */}
      <RevealSection id="faq" className="relative px-4 py-24">
        <hr className="section-divider mb-20" />
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white text-center mb-2">
            Common Questions
          </h2>
          <Ornament />
          <div className="mt-14 space-y-6">
            {[
              {
                q: 'How does AI tarot reading work?',
                a: 'TarotVeil uses cryptographically random card draws combined with advanced AI to read all your cards together as one cohesive narrative — not isolated per-card templates. The AI considers every card, its position, and your question to weave a personalized story.',
              },
              {
                q: 'Are the tarot cards truly random?',
                a: 'Yes. We use the Web Crypto API with a Fisher-Yates shuffle algorithm, providing cryptographic-grade randomness that is verifiable, fair, and truly random — the same standard used in security applications.',
              },
              {
                q: 'Can I ask follow-up questions about my reading?',
                a: 'Yes. Pro users get 5 follow-up questions per reading, and Premium users get 10. The AI maintains full context of your spread, cards, and narrative for deeper exploration.',
              },
              {
                q: 'What languages does TarotVeil support?',
                a: 'TarotVeil currently supports English and Farsi, with Arabic coming soon. Our readings are culturally native — not just translated — offering depth that resonates with each language\'s traditions.',
              },
              {
                q: 'Is there a free plan?',
                a: 'Yes! You can try a free three-card reading right now — no signup required. Create a free account to save readings, ask follow-up questions, and access your reading history. No credit card required.',
              },
            ].map((faq, idx) => (
              <motion.details
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="group border border-gold-400/[0.08] rounded-sm overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer select-none hover:bg-white/[0.01] transition-colors duration-300">
                  <h3 className="font-display text-base md:text-lg font-medium text-white pr-4">{faq.q}</h3>
                  <span className="text-gold-400/40 group-open:rotate-45 transition-transform duration-300 text-xl flex-shrink-0">+</span>
                </summary>
                <div className="px-6 pb-6">
                  <p className="font-body text-base font-medium text-stone-300 leading-relaxed">{faq.a}</p>
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ══════════════ WAITLIST ══════════════ */}
      <RevealSection className="relative px-4 py-24 pb-32">
        <hr className="section-divider mb-20" />
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-10 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gold-400/[0.03] blur-[60px] pointer-events-none" />

            <h2 className="relative font-display text-2xl md:text-3xl font-semibold text-white mb-3">
              Join the Inner Circle
            </h2>
            <p className="relative font-body text-base font-medium text-stone-300 mb-8">
              Be first to know when new features arrive. Early access and special offerings await.
            </p>

            {submitted ? (
              <div className="relative p-4 rounded-sm border border-gold-400/20 bg-gold-400/[0.05]">
                <p className="font-body text-gold-400 text-base">
                  The cards have noted your presence. We&apos;ll be in touch.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="relative flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-white/[0.03] border border-gold-400/15 rounded-sm px-4 py-3 text-white font-body placeholder-stone-600 focus:outline-none focus:border-gold-400/40 transition-colors duration-300"
                />
                <button
                  type="submit"
                  className="px-7 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_20px_rgba(212,160,67,0.2)] transition-all duration-300"
                >
                  Join
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </RevealSection>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="relative border-t border-gold-400/[0.06] px-4 py-12 text-center">
        <p className="font-display text-xs tracking-[0.3em] uppercase text-gold-400/25">
          TarotVeil
        </p>
        <p className="font-body text-sm font-medium text-stone-400 mt-2">
          Where the cards speak and the stories unfold
        </p>
      </footer>
    </div>
  );
}
