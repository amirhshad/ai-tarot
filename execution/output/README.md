# execution/output/ backups

Files named `card-meta-backup-<ISO-timestamp>.json` are produced by
`execution/rewrite-card-meta.mjs --write`. Each one captures the row values
that were **about to be overwritten at the moment that run started** — i.e.
it is a pre-write snapshot, not a snapshot of the final/desired state.

**The OLDEST backup for a given rewrite task is the true original — not the
newest.** If a script is re-run (e.g. to correct a bug in the generator), the
second run's backup contains the *first* run's output as its "old" values,
not the pre-task original. Restoring from "the newest backup" after multiple
runs will silently roll back to an intermediate, possibly-buggy generation
instead of the real starting point.

## 2026-09-10 card-meta rewrite (Bing SERP CTR recovery, Task 3)

- `card-meta-backup-2026-09-10T16-04-42-800Z.json` — **the pre-task original.**
  This is the first `--write` run's backup and holds the actual pre-rewrite
  `meta_title` / `meta_description` values for all 78 card rows. Restore from
  this file if the rewrite needs to be fully reverted.
- `card-meta-backup-2026-09-10T16-15-12-513Z.json` — a second run's backup,
  produced while fixing a description-collision defect found after the first
  write. Its "old" values are the first run's (partially buggy) output, not
  the original copy. Kept for audit trail only — do not restore from this
  file expecting to reach the original state.

An independent copy of the true pre-task original also exists at
`.superpowers/sdd/2026-09-10-bing-serp-ctr-recovery/PRE-TASK3-meta-backup.json`
(gitignored scratch directory, not durable — this README and the committed
`16-04-42-800Z.json` file above are the durable record).
