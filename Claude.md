# Agent Instructions

> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency. This system fixes that mismatch.

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- SOPs written in Markdown, live in `directives/`
- Define the goals, inputs, tools/scripts to use, outputs, and edge cases
- Natural language instructions, like you'd give a mid-level employee

**Layer 2: Orchestration (Decision making)**
- This is you. Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, ask for clarification, update directives with learnings
- You're the glue between intent and execution

**Layer 3: Execution (Doing the work)**
- The Next.js web application in `app/` (primary product code)
- Utility scripts in `execution/` for operational tasks
- Environment variables and API tokens stored in `app/.env.local` and `.env`

**Why this works:** if you do everything yourself, errors compound. 90% accuracy per step = 59% success over 5 steps. The solution is push complexity into deterministic code. That way you just focus on decision-making.

## Operating Principles

**1. Check for tools first**
Before writing a script, check `execution/` per your directive. Only create new scripts if none exist.

**2. Self-anneal when things break**
- Read error message and stack trace
- Fix the script and test it again (unless it uses paid tokens/credits/etc—in which case you check w user first)
- Update the directive with what you learned (API limits, timing, edge cases)

**3. Update directives as you learn**
Directives are living documents. When you discover API constraints, better approaches, common errors, or timing expectations—update the directive. But don't create or overwrite directives without asking unless explicitly told to.

## Self-annealing loop

Errors are learning opportunities. When something breaks:
1. Fix it
2. Update the tool
3. Test tool, make sure it works
4. Update directive to include new flow
5. System is now stronger

## AI Tarot Platform

An AI-powered conversational tarot reading platform with narrative-driven interpretations, conversational follow-ups, crypto-random card draws, and multi-language support.

### Architecture

```
User → Next.js App → Supabase Auth → Draw Cards (client-side crypto) → Claude API → Streaming Interpretation
                   → Stripe Billing → Subscription Management
                   → Supabase DB → Reading History + Follow-ups
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + Tailwind CSS | SSR, SEO, RTL support, Vercel Edge |
| AI (Free) | Claude Haiku 4.5 | Fast, cost-effective readings |
| AI (Paid) | Claude Sonnet 4 | Deep narrative interpretation |
| Randomization | Web Crypto API (client-side) | Cryptographic Fisher-Yates shuffle |
| Backend | Next.js API Routes | Serverless, auto-scaling |
| Database | Supabase (PostgreSQL + Auth) | Auth, RLS, reading storage |
| Payments | Stripe Billing | Subscriptions, webhooks |
| Hosting | Vercel | Global CDN, edge rendering |
| Analytics | PostHog | Funnels, feature flags, A/B testing |
| Email | Resend + React Email | Transactional + marketing |
| i18n | next-intl | English + Farsi (RTL) + Arabic |

### Directory Structure

```
.
├── app/                    # Next.js web application (primary codebase)
│   ├── src/
│   │   ├── app/            # Pages and API routes
│   │   │   ├── (marketing)/  # Landing, login, signup
│   │   │   ├── (app)/        # Dashboard, reading, settings, billing
│   │   │   └── api/          # reading/, stripe/, auth/
│   │   ├── components/     # React components
│   │   │   ├── tarot/        # Card, Deck, SpreadLayout
│   │   │   ├── reading/      # InterpretationStream, FollowUpChat
│   │   │   ├── ui/           # Shared UI primitives
│   │   │   ├── layout/       # Header, Footer
│   │   │   └── billing/      # PricingTable, PlanBadge
│   │   ├── lib/            # Core logic
│   │   │   ├── tarot/        # deck.ts, shuffle.ts, spreads.ts, types.ts
│   │   │   ├── ai/           # client.ts, prompts.ts, streaming.ts
│   │   │   ├── supabase/     # client.ts, server.ts
│   │   │   ├── stripe/       # client.ts, config.ts, helpers.ts
│   │   │   └── i18n/         # config.ts, request.ts
│   │   ├── messages/       # en.json, fa.json (translations)
│   │   ├── store/          # Zustand stores
│   │   └── middleware.ts   # Auth + i18n + route protection
│   └── public/
│       └── cards/          # Tarot card images (major/, minor/)
├── directives/             # SOPs in Markdown
├── execution/              # Utility scripts (seeds, generators)
├── .tmp/                   # Intermediate files (never commit)
├── .env                    # Root environment variables
└── Claude.md               # This file
```

### Pricing Tiers

| Feature | Free | Pro ($7.99/mo) | Premium ($14.99/mo) |
|---------|------|----------------|---------------------|
| Readings/Day | 1 single + 1 three-card/week | Unlimited | Unlimited + custom |
| AI Model | Haiku (short summary) | Sonnet (deep narrative) | Sonnet (deep narrative) |
| Follow-ups | 0 | 5 per reading | 10 per reading |
| Languages | English | English + Farsi | English + Farsi + Arabic |
| History | Last 5 | Full + search | Full + trend analysis |

### Database Tables (Supabase)

- **profiles** — User profile extending auth.users (tier, language, stripe IDs)
- **readings** — Tarot readings (spread type, cards JSON, interpretation, model used)
- **follow_ups** — Conversation messages within a reading (role, content)
- **usage** — Weekly reading counters for free tier limits
- **waitlist** — Pre-launch email collection

### API Routes

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /` | No | Marketing landing page |
| `GET /dashboard` | Yes | User dashboard |
| `GET /reading/new` | Yes | New reading flow |
| `POST /api/reading` | Yes | Create reading + stream AI interpretation |
| `POST /api/reading/[id]/follow-up` | Yes | Follow-up question within reading |
| `POST /api/stripe/checkout` | Yes | Create Stripe checkout session |
| `POST /api/stripe/webhook` | No (Stripe signature) | Handle subscription events |
| `POST /api/stripe/portal` | Yes | Stripe billing portal redirect |

### Five Competitive Pillars

1. **Narrative Interpretation** — AI reads all cards together as one cohesive story
2. **Conversational Follow-up** — 5–10 follow-up questions per reading with full context
3. **Crypto-Random Cards** — Fisher-Yates shuffle with crypto.getRandomValues(), verifiable
4. **Context-Aware Readings** — Interpretations reference real-world context when relevant
5. **Multi-Language Native** — English + Farsi (cultural depth, not translation) + Arabic

### Key Commands

```bash
# Development
cd app && npm run dev          # Start dev server
cd app && npm run build        # Production build

# Deployment
# Deployed via Vercel (auto-deploy on git push)
```

### MCP Servers Available

- **Supabase** — Database operations, migrations, schema management
- **Playwright** — Browser automation for testing
- **Context7** — Documentation lookup for libraries

## Summary

You sit between human intent (directives) and deterministic execution (Next.js app + utility scripts). Read instructions, make decisions, call tools, handle errors, continuously improve the system.

Be pragmatic. Be reliable. Self-anneal.
