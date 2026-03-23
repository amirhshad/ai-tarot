# Architecture

## High-Level Flow

```
User → Next.js App → Supabase Auth → Draw Cards (client-side crypto) → Claude API → Streaming Interpretation
                   → Stripe Billing → Subscription Management
                   → Supabase DB → Reading History + Follow-ups
```

## Technology Stack

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

## API Routes

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /` | No | Marketing landing page |
| `GET /dashboard` | Yes | User dashboard |
| `GET /reading/new` | Yes | New reading flow |
| `POST /api/reading` | Yes | Create reading + stream AI interpretation |
| `POST /api/reading/[id]/follow-up` | Yes | Follow-up question within reading |
| `GET /api/readings` | Yes | List readings with filtering + pagination |
| `POST /api/stripe/checkout` | Yes | Create Stripe checkout session |
| `POST /api/stripe/webhook` | No (Stripe signature) | Handle subscription events |
| `POST /api/stripe/portal` | Yes | Stripe billing portal redirect |

## MCP Servers

- **Supabase** — Database operations, migrations, schema management
- **Playwright** — Browser automation for testing
- **Context7** — Documentation lookup for libraries

## Deployment

- Hosted on **Vercel** with auto-deploy on git push
- Environment variables in `app/.env.local` (local) and Vercel dashboard (production)
- Edge rendering for marketing pages, serverless for API routes
