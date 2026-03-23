#!/bin/bash
# Pre-commit hook: block commits containing secrets or env files
# Install: cp .claude/hooks/pre-commit-protect.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

BLOCKED_PATTERNS=(
  '\.env$'
  '\.env\.local$'
  '\.env\.production$'
  'credentials\.json$'
  'service-account.*\.json$'
)

BLOCKED_CONTENT=(
  'sk_live_'        # Stripe live secret key
  'sk_test_'        # Stripe test secret key (still sensitive)
  'supabase_service_role'
  'ANTHROPIC_API_KEY'
)

staged_files=$(git diff --cached --name-only)

# Check file names
for pattern in "${BLOCKED_PATTERNS[@]}"; do
  matches=$(echo "$staged_files" | grep -E "$pattern" || true)
  if [ -n "$matches" ]; then
    echo "BLOCKED: Attempting to commit sensitive file(s):"
    echo "$matches"
    echo "Remove from staging with: git reset HEAD <file>"
    exit 1
  fi
done

# Check file contents for secrets
for pattern in "${BLOCKED_CONTENT[@]}"; do
  matches=$(git diff --cached -S"$pattern" --name-only || true)
  if [ -n "$matches" ]; then
    echo "BLOCKED: Found potential secret pattern '$pattern' in:"
    echo "$matches"
    echo "Review and remove the secret before committing."
    exit 1
  fi
done

exit 0
