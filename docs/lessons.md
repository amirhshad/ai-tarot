# Lessons Learned

Append new entries after any fix, correction, or discovered edge case. Use the self-anneal skill.

Format:
```
## [YYYY-MM-DD] — Brief title
**What happened:** one sentence
**Root cause:** one sentence
**Prevention:** what was added/changed to prevent recurrence
```

---

## 2026-03-23 — Documentation restructure
**What happened:** Root CLAUDE.md had grown to 171 lines with tables, pricing, and architecture details, causing context dilution and forgotten business rules.
**Root cause:** No separation between constitution (how to behave) and reference material (specs, schemas, routes).
**Prevention:** Slim CLAUDE.md points to `docs/` for details and `directives/` for SOPs. Local CLAUDE.md files guard risky domains. Skills enforce quality checks.
