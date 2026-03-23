# Core Business Rules

## Pricing & Model Selection

| Tier | Price | AI Model | Interpretation Style |
|------|-------|----------|---------------------|
| Free | $0 | Claude Haiku 4.5 | Short summary (~150-300 words) |
| Pro | $7.99/mo | Claude Sonnet 4 | Deep narrative (~400-700 words) |
| Premium | $14.99/mo | Claude Sonnet 4 | Deep narrative + custom spreads |

**Model selection is server-side only.** The client sends the reading request; the server checks the user's tier from the `profiles` table and selects the model. Never trust client-provided model preferences.

## Rate Limits (Free Tier)

- 1 single-card reading per day
- 1 three-card reading per week
- Tracked in the `usage` table by week start date
- Reset logic: weekly counter resets on Monday 00:00 UTC

## Follow-up Limits

| Tier | Follow-ups per Reading |
|------|----------------------|
| Free | 0 |
| Pro | 5 |
| Premium | 10 |

Follow-ups are counted per reading, not per day. Each follow-up retains full context (original cards, interpretation, and all prior messages).

## Language Access

| Tier | Languages |
|------|-----------|
| Free | English only |
| Pro | English + Farsi |
| Premium | English + Farsi + Arabic |

## Reading History

| Tier | History Access |
|------|---------------|
| Free | Last 5 readings |
| Pro | Full history + search |
| Premium | Full history + search + trend analysis |

## Subscription Management

- Payments via Stripe Billing (checkout sessions, customer portal)
- Webhook events update the `profiles` table tier field
- On downgrade: access to paid features stops at period end, not immediately
- On cancellation: revert to free tier at period end
- Prefer Stripe's hosted checkout and portal — minimize custom payment UI
