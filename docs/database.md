# Database Schema (Supabase)

## Tables

### profiles
User profile extending `auth.users`.
- tier (free / pro / premium)
- language preference
- Stripe customer ID, subscription ID
- RLS: users can only read/update their own profile

### readings
Tarot readings stored per user.
- spread type (single, three-card, custom)
- cards JSON (positions, card IDs, reversed flag)
- interpretation text
- model used (haiku / sonnet)
- RLS: users can only access their own readings

### follow_ups
Conversation messages within a reading.
- reading ID (FK)
- role (user / assistant)
- content
- RLS: inherited from parent reading ownership

### usage
Weekly reading counters for free tier rate limiting.
- user ID, week start date
- single count, three-card count
- RLS: users can only read/update their own usage

### waitlist
Pre-launch email collection.
- email, created_at
- No auth required for insert; read restricted to service role

## RLS Principles

- Every table with user data has RLS enabled
- Policies use `auth.uid()` to scope access
- Service role key is used only in server-side API routes, never exposed to client
- Prefer `security definer` functions for complex operations that need cross-table access
