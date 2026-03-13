# SEO Phase A: Technical Quick Wins — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix foundational SEO issues so TarotVeil.com gets indexed by Google and presents well in SERPs and social shares.

**Architecture:** All changes are to the existing Next.js app. We modify metadata in `layout.tsx`, expand `sitemap.ts` and `robots.ts`, create two static legal pages, fix the `Footer` component links, and generate an OG image placeholder.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS

**Reference:** `docs/SEO-ROADMAP.md` — Phase A checklist

---

## Chunk 1: Metadata & Social Sharing Fixes

### Task 1: Shorten Meta Description

**Files:**
- Modify: `app/src/app/layout.tsx:27-28`

- [ ] **Step 1: Update meta description to ≤155 characters**

Replace the current 191-char description with a tighter version (153 chars):

```typescript
description:
  'AI-powered tarot readings that weave your cards into one narrative story. Crypto-random draws, follow-up conversations, and multi-language support.',
```

- [ ] **Step 2: Verify the build still works**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/app/layout.tsx
git commit -m "seo: shorten meta description to under 155 characters"
```

---

### Task 2: Add Open Graph Image & Twitter Image

**Files:**
- Modify: `app/src/app/layout.tsx:62-76` (openGraph and twitter metadata)
- Create: `app/public/images/og-default.png` (placeholder — 1200x630)

- [ ] **Step 1: Generate a placeholder OG image**

Create a simple 1200x630 OG image. For now we use a solid dark background with "TarotVeil" text. We can design a proper one later.

Use a Node script or manual creation — the key is having the file at the right path.

- [ ] **Step 2: Add `images` to openGraph metadata**

In `layout.tsx`, add the `images` array to the `openGraph` config:

```typescript
openGraph: {
  type: 'website',
  locale: 'en_US',
  url: siteUrl,
  siteName: 'TarotVeil',
  title: 'TarotVeil — AI-Powered Tarot Readings That Tell Your Story',
  description:
    'AI-powered narrative tarot readings with conversational depth. Crypto-random cards, multi-language support. Start your free reading today.',
  images: [
    {
      url: `${siteUrl}/images/og-default.png`,
      width: 1200,
      height: 630,
      alt: 'TarotVeil — AI-Powered Tarot Readings',
    },
  ],
},
```

- [ ] **Step 3: Add `images` to twitter metadata**

```typescript
twitter: {
  card: 'summary_large_image',
  title: 'TarotVeil — AI-Powered Tarot Readings',
  description:
    'Narrative tarot readings powered by AI. Not generic card meanings — a story woven from your entire spread.',
  images: [`${siteUrl}/images/og-default.png`],
},
```

- [ ] **Step 4: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add app/public/images/og-default.png app/src/app/layout.tsx
git commit -m "seo: add Open Graph and Twitter card images"
```

---

### Task 3: Add hreflang Alternate Language Tags

**Files:**
- Modify: `app/src/app/layout.tsx:59-61` (alternates section)

- [ ] **Step 1: Expand the `alternates` metadata**

Replace the current `alternates` block with:

```typescript
alternates: {
  canonical: siteUrl,
  languages: {
    'en': siteUrl,
    'fa': siteUrl,
    'x-default': siteUrl,
  },
},
```

This tells Google that both English and Farsi are served from the same URL (language toggle is client-side). When/if separate URL paths per language are added, update these to point to the correct paths.

- [ ] **Step 2: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/app/layout.tsx
git commit -m "seo: add hreflang alternate language tags for en/fa"
```

---

## Chunk 2: Robots, Sitemap, and Crawlability

### Task 4: Fix Robots.txt — Allow /reading/free

**Files:**
- Modify: `app/src/app/robots.ts`

The current `disallow: ['/reading/']` blocks `/reading/free` which is the main public conversion page. We need to explicitly allow it.

- [ ] **Step 1: Update robots.ts**

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/reading/free'],
        disallow: ['/api/', '/dashboard', '/reading/new', '/settings', '/billing'],
      },
    ],
    sitemap: 'https://www.tarotveil.com/sitemap.xml',
  };
}
```

Key changes:
- Explicitly allow `/reading/free`
- Change `/reading/` (blocks everything under reading) to `/reading/new` (only blocks the authenticated new-reading page)
- Individual reading pages (`/reading/[id]`) are still protected by auth middleware and won't be crawlable anyway, but won't show a blanket disallow

- [ ] **Step 2: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/app/robots.ts
git commit -m "seo: allow /reading/free in robots.txt, block only authenticated routes"
```

---

### Task 5: Expand Sitemap

**Files:**
- Modify: `app/src/app/sitemap.ts`

- [ ] **Step 1: Add /reading/free and legal pages to sitemap**

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.tarotveil.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/reading/free`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
```

- [ ] **Step 2: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/app/sitemap.ts
git commit -m "seo: expand sitemap with /reading/free, /privacy, /terms"
```

---

## Chunk 3: Legal Pages & Footer Fix

### Task 6: Create Privacy Policy Page

**Files:**
- Create: `app/src/app/(marketing)/privacy/page.tsx`

- [ ] **Step 1: Create the privacy policy page**

Create a minimal but real privacy policy page. This is a static marketing page.

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'TarotVeil privacy policy. Learn how we handle your data, readings, and personal information.',
  alternates: {
    canonical: 'https://www.tarotveil.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-8">
        Privacy Policy
      </h1>
      <div className="prose prose-invert prose-stone max-w-none font-body text-base font-medium leading-relaxed space-y-6">
        <p className="text-stone-400 text-sm">Last updated: March 13, 2026</p>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">1. Information We Collect</h2>
          <p className="text-stone-300">
            When you create an account, we collect your email address and authentication credentials.
            When you use our tarot reading service, we store your reading history including cards drawn,
            spread type, and AI-generated interpretations. Card draws use client-side cryptographic
            randomness and are not influenced by any server-side data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">2. How We Use Your Information</h2>
          <p className="text-stone-300">
            We use your information to provide and improve our tarot reading service, manage your
            subscription, and communicate service updates. Your readings are private and never shared
            with third parties. We do not sell your personal data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">3. Data Storage & Security</h2>
          <p className="text-stone-300">
            Your data is stored securely on Supabase (PostgreSQL) with row-level security policies.
            Authentication is handled through Supabase Auth. Payment information is processed and
            stored by Stripe — we never see or store your full card details.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">4. Third-Party Services</h2>
          <p className="text-stone-300">
            We use the following third-party services: Supabase (database and authentication),
            Stripe (payment processing), Anthropic (AI interpretation), Vercel (hosting and analytics),
            and PostHog (product analytics). Each service has its own privacy policy governing their
            handling of data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">5. Your Rights</h2>
          <p className="text-stone-300">
            You can access, update, or delete your account and reading history at any time through
            your settings page. To request complete data deletion, contact us at privacy@tarotveil.com.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">6. Cookies</h2>
          <p className="text-stone-300">
            We use essential cookies for authentication and session management. Analytics cookies
            (Vercel Analytics, PostHog) help us understand how our service is used. You can disable
            non-essential cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">7. Contact</h2>
          <p className="text-stone-300">
            For privacy-related questions, contact us at privacy@tarotveil.com.
          </p>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/app/\(marketing\)/privacy/page.tsx
git commit -m "seo: add privacy policy page"
```

---

### Task 7: Create Terms of Service Page

**Files:**
- Create: `app/src/app/(marketing)/terms/page.tsx`

- [ ] **Step 1: Create the terms of service page**

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'TarotVeil terms of service. Usage terms for our AI-powered tarot reading platform.',
  alternates: {
    canonical: 'https://www.tarotveil.com/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-8">
        Terms of Service
      </h1>
      <div className="prose prose-invert prose-stone max-w-none font-body text-base font-medium leading-relaxed space-y-6">
        <p className="text-stone-400 text-sm">Last updated: March 13, 2026</p>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">1. Service Description</h2>
          <p className="text-stone-300">
            TarotVeil is an AI-powered tarot reading platform that provides narrative interpretations
            of tarot card spreads. Our service is for entertainment and personal reflection purposes
            only. Readings should not be used as a substitute for professional advice in medical,
            legal, financial, or psychological matters.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">2. Accounts</h2>
          <p className="text-stone-300">
            You may use a limited free reading without an account. To access full features, you must
            create an account with a valid email address. You are responsible for maintaining the
            security of your account credentials.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">3. Subscriptions & Billing</h2>
          <p className="text-stone-300">
            Paid plans (Pro and Premium) are billed monthly through Stripe. You can cancel your
            subscription at any time through the billing page or Stripe customer portal. Cancellation
            takes effect at the end of your current billing period. Refunds are handled on a
            case-by-case basis.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">4. Fair Use</h2>
          <p className="text-stone-300">
            Free accounts are limited to 1 single-card reading per day and 1 three-card reading per
            week. Paid plans offer unlimited readings as described on our pricing page. We reserve
            the right to limit excessive automated usage.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">5. Intellectual Property</h2>
          <p className="text-stone-300">
            AI-generated reading interpretations are provided for your personal use. The TarotVeil
            brand, design, and platform code are proprietary. Tarot card imagery used is from the
            public domain Rider-Waite-Smith deck.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">6. Disclaimer</h2>
          <p className="text-stone-300">
            TarotVeil provides AI-generated tarot readings for entertainment purposes. We make no
            claims of supernatural ability or predictive accuracy. Card draws use cryptographic
            randomness and are not influenced by any external factors. The service is provided
            &ldquo;as is&rdquo; without warranties of any kind.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">7. Contact</h2>
          <p className="text-stone-300">
            For questions about these terms, contact us at support@tarotveil.com.
          </p>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/app/\(marketing\)/terms/page.tsx
git commit -m "seo: add terms of service page"
```

---

### Task 8: Fix Footer Links

**Files:**
- Modify: `app/src/components/layout/Footer.tsx`

- [ ] **Step 1: Update footer links to point to real pages**

```tsx
export default function Footer({ language = 'en' }: { language?: 'en' | 'fa' }) {
  return (
    <footer className="border-t border-white/10 bg-black/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} TarotVeil.{' '}
          {language === 'en' ? 'For entertainment purposes.' : 'برای سرگرمی.'}
        </p>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:text-gray-300 transition-colors">
            {language === 'en' ? 'Privacy' : 'حریم خصوصی'}
          </a>
          <a href="/terms" className="hover:text-gray-300 transition-colors">
            {language === 'en' ? 'Terms' : 'شرایط'}
          </a>
        </div>
      </div>
    </footer>
  );
}
```

Changes:
- `href="#"` → `href="/privacy"` and `href="/terms"`
- "AI Tarot" → "TarotVeil" (brand consistency)

- [ ] **Step 2: Verify build**

Run: `cd app && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/components/layout/Footer.tsx
git commit -m "seo: fix footer links to real privacy and terms pages"
```

---

## Chunk 4: OG Image Generation & Final Verification

### Task 9: Generate OG Image

**Files:**
- Create: `app/public/images/og-default.png`

- [ ] **Step 1: Generate a 1200x630 OG image**

Use a Node.js canvas script to create a branded OG image:

```bash
cd app && node -e "
const { createCanvas } = require('canvas');
const fs = require('fs');
const canvas = createCanvas(1200, 630);
const ctx = canvas.getContext('2d');

// Dark gradient background
const grad = ctx.createLinearGradient(0, 0, 0, 630);
grad.addColorStop(0, '#0a0612');
grad.addColorStop(1, '#060208');
ctx.fillStyle = grad;
ctx.fillRect(0, 0, 1200, 630);

// Gold accent line
ctx.strokeStyle = 'rgba(212, 160, 67, 0.3)';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(400, 300);
ctx.lineTo(800, 300);
ctx.stroke();

// Brand text
ctx.fillStyle = 'rgba(212, 160, 67, 0.8)';
ctx.font = '600 64px serif';
ctx.textAlign = 'center';
ctx.fillText('TarotVeil', 600, 270);

// Tagline
ctx.fillStyle = 'rgba(214, 211, 209, 0.7)';
ctx.font = '300 24px serif';
ctx.fillText('AI-Powered Tarot Readings That Tell Your Story', 600, 360);

fs.writeFileSync('public/images/og-default.png', canvas.toBuffer('image/png'));
console.log('OG image created');
"
```

**Fallback** if `canvas` package is not installed: create the image manually using any image editor (1200x630, dark purple/black background, gold "TarotVeil" text, tagline below). Or use Next.js OG Image generation (`app/src/app/opengraph-image.tsx`) instead:

```tsx
// app/src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TarotVeil — AI-Powered Tarot Readings';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom, #0a0612, #060208)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
        }}
      >
        <div style={{ color: 'rgba(212, 160, 67, 0.8)', fontSize: 64, fontWeight: 600 }}>
          TarotVeil
        </div>
        <div
          style={{
            color: 'rgba(214, 211, 209, 0.7)',
            fontSize: 24,
            marginTop: 24,
            fontWeight: 300,
          }}
        >
          AI-Powered Tarot Readings That Tell Your Story
        </div>
      </div>
    ),
    { ...size }
  );
}
```

This approach auto-generates the OG image at build time via Next.js — no external dependency needed.

- [ ] **Step 2: If using opengraph-image.tsx, update layout.tsx openGraph to remove hardcoded image URL**

When using the `opengraph-image.tsx` file convention, Next.js auto-sets the OG image metadata. You only need the explicit `images` array if using a static file in `public/`.

- [ ] **Step 3: Verify the OG image renders**

Run: `cd app && npx next build 2>&1 | tail -10`
Then check: `curl -s http://localhost:3000 | grep 'og:image'`

- [ ] **Step 4: Commit**

```bash
git add app/src/app/opengraph-image.tsx
git commit -m "seo: add auto-generated Open Graph image via Next.js"
```

---

### Task 10: Final Build Verification & SEO Roadmap Update

**Files:**
- Modify: `docs/SEO-ROADMAP.md` (tick off completed items)

- [ ] **Step 1: Run full build**

Run: `cd app && npx next build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Spot-check generated HTML**

Run: `cd app && npx next start &` then:
```bash
# Check meta tags
curl -s http://localhost:3000 | grep -E 'description|og:|hreflang|canonical'
# Check robots.txt
curl -s http://localhost:3000/robots.txt
# Check sitemap
curl -s http://localhost:3000/sitemap.xml
```

- [ ] **Step 3: Update SEO roadmap — tick off Phase A items**

Mark completed items in `docs/SEO-ROADMAP.md`:
- [x] A3. Fix Meta Description Length
- [x] A4. Add Open Graph Image
- [x] A5. Expand Sitemap
- [x] A6. Add hreflang Tags
- [x] A7. Fix Footer Links
- [x] A8. Add /reading/free to Robots Allow-List

Leave unchecked (manual steps):
- [ ] A1. Google Search Console Setup (requires manual domain verification)
- [ ] A2. Bing Webmaster Tools Setup (requires manual verification)
- [ ] A9. Trim Title Tag (optional, current title is acceptable)
- [ ] A10. Verify Structured Data (manual testing after deploy)

- [ ] **Step 4: Commit roadmap update**

```bash
git add docs/SEO-ROADMAP.md
git commit -m "seo: update roadmap with Phase A completion status"
```

---

## Post-Implementation: Manual Steps (Not Automatable)

These require browser access and account credentials:

1. **Google Search Console**: Go to https://search.google.com/search-console → Add property → verify via DNS TXT record or HTML file → Submit sitemap URL
2. **Bing Webmaster Tools**: Go to https://www.bing.com/webmasters → Import from GSC or verify separately
3. **Rich Results Test**: Go to https://search.google.com/test/rich-results → Test homepage URL
4. **PageSpeed Insights**: Go to https://pagespeed.web.dev → Test homepage and /reading/free
