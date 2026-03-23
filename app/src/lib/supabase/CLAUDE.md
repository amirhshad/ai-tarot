# Supabase / Database — Local Rules

## Before editing files here, read:
- `docs/database.md` — Table schemas, RLS policies

## Rules

1. **Never bypass RLS.** All client-side queries go through the anon key with RLS enforced. The service role key is used only in server-side API routes (never in client components or middleware that runs on the edge).

2. **Never expose the service role key.** It must stay in server-side environment variables. Never import `server.ts` (which uses service role) in client components.

3. **Prefer RLS over application-level auth checks.** Let PostgreSQL enforce row-level security. Application-level checks are a backup, not the primary mechanism.

4. **Use `auth.uid()` in policies.** All user-scoped tables should have RLS policies that use `auth.uid()` to scope access. Never use custom session tokens or application-level user IDs in policies.

5. **Test migrations on a branch first.** Use Supabase branching (via MCP) to test schema changes before applying to production. Verify RLS policies work on the branch.

6. **Use `security definer` functions carefully.** When cross-table operations need elevated access, use `security definer` functions with explicit input validation. Document why the escalation is needed.

7. **Client vs Server imports.** `client.ts` uses the anon key (safe for browser). `server.ts` uses the service role key (server-only). `middleware.ts` uses the anon key for auth session refresh. Never mix these up.

## Key files
- `client.ts` — Browser-safe Supabase client (anon key)
- `server.ts` — Server-only Supabase client (service role key)
- `middleware.ts` — Auth session refresh middleware
