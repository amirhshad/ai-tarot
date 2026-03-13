# TarotVeil.com — SEO Roadmap

> Created: 2026-03-13
> Last Updated: 2026-03-13
> Status: In Progress

## Current State Summary

- **Google Indexing**: ✅ Submitted to GSC, indexing requested (2026-03-13)
- **SEO Grade**: A- (technical foundation complete, content engine next)
- **Sitemap**: 89 URLs (static pages + 78 card pages + 4 spread pages)
- **Structured Data**: Comprehensive JSON-LD (WebSite, Organization, SoftwareApplication, FAQPage)
- **Competitors Indexed**: Tarotap, TarotCards.io, TarotReader.ai, PiTarot, BiddyTarot all rank well

---

## Phase A: Technical Quick Wins (Priority: Immediate)

Goal: Get indexed by Google and fix foundational SEO issues.
Timeline: 1-2 days of implementation.

### Checklist

- [x] **A1. Google Search Console Setup** ✅ (2026-03-13)
  - Verify domain ownership (DNS TXT record or HTML file method)
  - Submit sitemap.xml
  - Request indexing for key pages
  - Monitor crawl errors and coverage reports

- [x] **A2. Bing Webmaster Tools Setup** ✅ (2026-03-13)
  - Verify domain and submit sitemap
  - Import settings from Google Search Console if possible

- [x] **A3. Fix Meta Description Length** ✅ (2026-03-13)
  - Current: 191 characters (gets truncated in SERPs)
  - Target: ≤155 characters
  - File: `app/src/app/layout.tsx`
  - Rewrite to be punchy and keyword-rich while staying under limit

- [x] **A4. Add Open Graph Image** ✅ (2026-03-13)
  - Auto-generated via `app/src/app/opengraph-image.tsx` (Next.js edge runtime)
  - 1200×630, branded dark/gold design
  - Twitter card inherits from OG image automatically

- [x] **A5. Expand Sitemap** ✅ (2026-03-13)
  - Add `/reading/free` (priority 0.8)
  - Add future content pages as they're created (card meanings, spreads, blog)
  - File: `app/src/app/sitemap.ts`

- [x] **A6. Add hreflang Tags** ✅ (2026-03-13)
  - Add `<link rel="alternate" hreflang="en" href="...">` for English
  - Add `<link rel="alternate" hreflang="fa" href="...">` for Farsi
  - Add `<link rel="alternate" hreflang="x-default" href="...">` as fallback
  - Implementation: root layout or via Next.js metadata alternates

- [x] **A7. Fix Footer Links** ✅ (2026-03-13)
  - Privacy Policy link currently points to `#` — create real `/privacy` page
  - Terms of Service link currently points to `#` — create real `/terms` page
  - Add these pages to sitemap

- [x] **A8. Add /reading/free to Robots Allow-List** ✅ (2026-03-13)
  - Ensure `/reading/free` is not blocked by the `/reading/` disallow rule
  - File: `app/src/app/robots.ts`
  - Change disallow from `/reading/` to specific paths: `/reading/new`, `/reading/[id patterns]`
  - Or add explicit `allow: '/reading/free'` before the disallow

- [ ] **A9. Trim Title Tag**
  - Current: 76 characters — slightly over the ~60 char ideal for SERPs
  - Consider shortening or ensure key terms are front-loaded
  - File: `app/src/app/layout.tsx`

- [ ] **A10. Verify Structured Data**
  - Run all pages through Google Rich Results Test
  - Run through Schema Markup Validator
  - Fix any warnings or errors
  - URL: https://search.google.com/test/rich-results

---

## Phase B: Content Engine (Priority: High)

Goal: Build indexable content pages that target high-volume keywords and funnel users to readings.
Timeline: 2-4 weeks of implementation.

### B1. Tarot Card Meaning Pages (Highest ROI)

- [x] **Create 78 individual card pages** ✅ (2026-03-13) (`/cards/[slug]`)
  - URL pattern: `/cards/the-fool`, `/cards/ace-of-cups`, `/cards/ten-of-swords`
  - Each page includes: card image, upright meaning, reversed meaning, keywords, AI narrative
  - Internal link to "Get a reading featuring this card"
  - Target keywords: "[card name] meaning" (e.g., "the fool tarot card meaning")
  - Schema: Add `Article` or `WebPage` structured data per page

- [x] **Create card index page** (`/cards`) ✅ (2026-03-13)
  - Grid of all 78 cards organized by Major Arcana / Suits
  - Targets: "tarot card meanings" (9,900/mo), "major arcana" (880/mo)

- [x] **Programmatic generation** ✅ (2026-03-13)
  - Build from existing deck data in `app/src/lib/tarot/deck.ts`
  - Use `generateStaticParams` for static generation at build time
  - Add all 78 + index page to sitemap dynamically

### B2. Spread Guide Pages

- [x] **Three-Card Spread** (`/spreads/three-card`) ✅ (2026-03-13)
  - How it works, position meanings, sample reading, CTA
  - Target: "three card tarot spread" (8,100/mo)

- [x] **Celtic Cross** (`/spreads/celtic-cross`) ✅ (2026-03-13)
  - Detailed position guide, when to use, sample interpretation
  - Target: "celtic cross tarot spread" (1,500/mo)

- [x] **Single Card** (`/spreads/single-card`) ✅ (2026-03-13)
  - Quick guidance, daily use, beginner-friendly
  - Target: "one card tarot reading" (~1,000/mo)

- [x] **Spread index page** (`/spreads`) ✅ (2026-03-13)
  - Overview of all available spreads with links

### B3. Blog / Learn Section

- [ ] **Set up blog infrastructure** (`/learn/[slug]`)
  - MDX or database-backed posts
  - Proper metadata per post
  - Blog index page with pagination

- [ ] **Priority articles** (by keyword volume):
  - "How AI tarot reading works" — unique angle, low competition
  - "How to read tarot cards for beginners" (1,300/mo)
  - "Tarot card meanings: complete guide" (9,900/mo)
  - "What is a three card tarot spread?" (8,100/mo)
  - "Are online tarot readings accurate?" — addresses skepticism, conversion content
  - "Tarot vs Oracle cards: what's the difference?"
  - "How to ask tarot cards a question" — practical, high intent

### B4. Daily Tarot Page

- [ ] **Create /daily route**
  - Auto-generated daily card with short AI interpretation
  - Updates every 24 hours (ISR or cron)
  - Target: "daily tarot reading" (2,900/mo)
  - Add email signup: "Get your daily card in your inbox"
  - Creates fresh content signal for Google crawlers

### B5. Topic-Based Landing Pages

- [ ] `/love-tarot` — Love & relationship readings (4,400/mo)
- [ ] `/career-tarot` — Career & work guidance
- [ ] `/yes-or-no` — Simple yes/no tarot (3,000/mo)
- [ ] Each page: topic intro, relevant spread, sample reading, CTA to start

---

## Phase C: SEO Infrastructure & Growth (Priority: Medium-Term)

Goal: Build long-term organic dominance and diversify traffic sources.
Timeline: Ongoing, 1-3 months.

### C1. Internal Linking Strategy

- [ ] Every card meaning page links to related cards and relevant spreads
- [ ] Every spread page links to card meanings for sample cards shown
- [ ] Blog posts link to relevant card pages, spread pages, and reading CTA
- [ ] Reading results page (for logged-in users) links to card meaning pages
- [ ] Breadcrumb navigation on all content pages
- [ ] Add `BreadcrumbList` schema markup

### C2. Multi-Language SEO

- [ ] Create Farsi versions of card meaning pages
- [ ] Farsi blog content (not translations — culturally native)
- [ ] Proper hreflang implementation across all content pages
- [ ] Farsi sitemap entries
- [ ] Consider subdomain (fa.tarotveil.com) vs subdirectory (/fa/) — subdirectory preferred for SEO

### C3. Performance Optimization

- [ ] Achieve 90+ Lighthouse scores on all public pages
- [ ] Optimize Largest Contentful Paint (LCP) — hero image/text
- [ ] Minimize Cumulative Layout Shift (CLS) — card animations
- [ ] Optimize First Input Delay (FID) — interactive elements
- [ ] Image format: convert card PNGs to WebP/AVIF
- [ ] Implement `loading="lazy"` on below-fold images (Next.js default)

### C4. Advanced Structured Data

- [ ] `Article` schema on blog posts
- [ ] `BreadcrumbList` schema on all content pages
- [ ] `HowTo` schema on spread guide pages
- [ ] `VideoObject` schema if video content is added
- [ ] `Review` / `AggregateRating` schema if user reviews are implemented
- [ ] Validate all schemas quarterly

### C5. Off-Site SEO & Link Building

- [ ] Guest posts on astrology/wellness/spirituality blogs
- [ ] Get listed in tarot/astrology directories
- [ ] Create shareable content (infographics: "Your Tarot Cheat Sheet")
- [ ] Social media profiles linking back to tarotveil.com
- [ ] Pinterest strategy (tarot images are highly pinnable)
- [ ] YouTube channel with reading demos (embeds on site add dwell time)

### C6. AI Search Optimization

- [ ] Ensure structured data feeds AI Overviews (65% of AI-cited pages use schema)
- [ ] Concise, factual FAQ answers (AI engines prefer direct answers)
- [ ] Keep FAQPage schema updated with common user questions
- [ ] Monitor appearance in Google AI Overviews, ChatGPT, Perplexity

### C7. Analytics & Monitoring

- [ ] Google Search Console: monitor weekly
  - Crawl errors, index coverage, search performance
- [ ] Set up rank tracking for target keywords
- [ ] Monitor Core Web Vitals in Search Console
- [ ] PostHog: funnel tracking from organic landing → reading → signup → paid
- [ ] Monthly SEO report: impressions, clicks, CTR, avg position

---

## Keyword Target Map

| Page | Primary Keyword | Monthly Volume | Priority |
|------|----------------|---------------|----------|
| `/` (homepage) | "AI tarot reading" | ~2,000 | ✅ Done |
| `/reading/free` | "free tarot reading online" | 12,100 | Phase A |
| `/cards` | "tarot card meanings" | 9,900 | Phase B |
| `/cards/[slug]` (×78) | "[card name] meaning" | Varies | Phase B |
| `/spreads/three-card` | "three card tarot spread" | 8,100 | Phase B |
| `/spreads/celtic-cross` | "celtic cross spread" | 1,500 | Phase B |
| `/daily` | "daily tarot reading" | 2,900 | Phase B |
| `/love-tarot` | "love tarot reading" | 4,400 | Phase B |
| `/yes-or-no` | "yes or no tarot" | 3,000 | Phase B |
| `/learn/how-to-read-tarot` | "how to read tarot cards" | 4,400 | Phase B |
| `/learn/ai-tarot-guide` | "AI tarot reading online" | ~2,000 | Phase B |

---

## Competitor Benchmark

| Feature | TarotVeil | Tarotap | BiddyTarot | TarotCards.io |
|---------|-----------|---------|------------|---------------|
| Card meaning pages | ❌ | ✅ | ✅ (78 pages) | ✅ |
| Blog/Learn section | ❌ | ✅ | ✅ (massive) | Partial |
| Spread guides | ❌ | ✅ | ✅ | ❌ |
| Daily reading page | ❌ | ✅ | ✅ | ✅ |
| Multi-language | ✅ (en/fa) | ✅ (15+) | ❌ | ❌ |
| Structured data | ✅ | ✅ | ✅ | Partial |
| AI-powered readings | ✅ | ✅ | ❌ | ✅ |
| Conversational follow-up | ✅ | ❌ | ❌ | ❌ |
| Crypto-random cards | ✅ | ❌ | ❌ | ❌ |

**TarotVeil's moat**: AI narrative + follow-ups + crypto-random. But without content pages, nobody finds it.

---

## Success Metrics

| Metric | Current | 1 Month Target | 3 Month Target | 6 Month Target |
|--------|---------|---------------|----------------|----------------|
| Google indexed pages | 0 | 5-10 | 100+ | 150+ |
| Organic monthly traffic | 0 | 50-100 | 500-1,000 | 5,000+ |
| Keywords ranking (top 100) | 0 | 10-20 | 50-100 | 200+ |
| Keywords ranking (top 10) | 0 | 1-3 | 10-20 | 30+ |
| Domain Authority | N/A | 5-10 | 15-20 | 25+ |

---

## Notes & Learnings

_Update this section as you implement and discover new insights._

- 2026-03-13: Initial audit complete. Site not indexed. Strong technical base but zero content footprint.
- Competitor BiddyTarot dominates with 78 card meaning pages — this is the proven playbook.
- "AI tarot reading" is a low-competition keyword cluster — early mover advantage available.
- 65% of pages cited by Google AI Mode use schema markup — our structured data is an advantage.
