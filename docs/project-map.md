# Project Map

```
.
├── app/                        # Next.js web application (primary codebase)
│   ├── src/
│   │   ├── app/                # Pages and API routes
│   │   │   ├── (marketing)/    #   Landing, login, signup
│   │   │   ├── (app)/          #   Dashboard, reading, settings, billing, history
│   │   │   └── api/            #   reading/, readings/, stripe/, auth/
│   │   ├── components/         # React components
│   │   │   ├── tarot/          #   Card, Deck, SpreadLayout
│   │   │   ├── reading/        #   InterpretationStream, FollowUpChat
│   │   │   ├── ui/             #   Shared UI primitives
│   │   │   ├── layout/         #   Header, Footer
│   │   │   └── billing/        #   PricingTable, PlanBadge
│   │   ├── lib/                # Core logic
│   │   │   ├── tarot/          #   deck.ts, shuffle.ts, spreads.ts, types.ts
│   │   │   ├── ai/             #   client.ts, prompts.ts, streaming.ts
│   │   │   ├── supabase/       #   client.ts, server.ts, middleware.ts
│   │   │   ├── stripe/         #   client.ts, config.ts, helpers.ts
│   │   │   └── i18n/           #   config.ts, request.ts
│   │   ├── messages/           # i18n: en.json, fa.json
│   │   ├── store/              # Zustand stores
│   │   └── middleware.ts       # Auth + i18n + route protection
│   └── public/
│       └── cards/              # Tarot card images (major/, minor/)
├── directives/                 # SOPs and business rules (Layer 1)
├── execution/                  # Utility scripts — seeds, generators (Layer 3)
├── docs/                       # Detailed specs and reference docs
├── .claude/                    # Skills, hooks, settings
├── .tmp/                       # Intermediate files (never commit)
└── CLAUDE.md                   # Agent constitution (this project)
```
