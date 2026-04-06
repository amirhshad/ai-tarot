/**
 * One-time migration: update meta_title and meta_description for all card pages
 * to use SEO-optimized templates based on GSC query analysis.
 *
 * Usage:
 *   npx tsx scripts/update-card-meta.ts          # dry-run (default)
 *   npx tsx scripts/update-card-meta.ts --apply   # apply changes
 *
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.
 */
import { createClient } from '@libsql/client';

const dryRun = !process.argv.includes('--apply');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function buildMetaTitle(name: string): string {
  return `${name} Tarot Meaning — Upright, Reversed & Yes or No | TarotVeil`;
}

function buildMetaDescription(name: string): string {
  // Avoid "What does the The Fool mean?" — drop article when name already has one
  const article = /^the /i.test(name) ? '' : 'the ';
  return `What does ${article}${name} mean? Upright & reversed meanings for love, career, feelings, and yes-or-no readings. Plus card combinations and free AI tarot reading.`;
}

async function main() {
  console.log(dryRun ? '=== DRY RUN (pass --apply to write) ===' : '=== APPLYING CHANGES ===');

  const result = await db.execute('SELECT slug, name, meta_title, meta_description FROM card_content ORDER BY card_id');

  let changed = 0;
  for (const row of result.rows) {
    const slug = row.slug as string;
    const name = row.name as string;
    const oldTitle = row.meta_title as string;
    const oldDesc = row.meta_description as string;

    const newTitle = buildMetaTitle(name);
    const newDesc = buildMetaDescription(name);

    if (oldTitle === newTitle && oldDesc === newDesc) continue;

    changed++;
    console.log(`\n[${slug}]`);
    if (oldTitle !== newTitle) {
      console.log(`  title:  ${oldTitle}`);
      console.log(`      ->  ${newTitle}`);
    }
    if (oldDesc !== newDesc) {
      console.log(`  desc:   ${oldDesc.slice(0, 80)}...`);
      console.log(`     ->   ${newDesc.slice(0, 80)}...`);
    }

    if (!dryRun) {
      await db.execute({
        sql: `UPDATE card_content SET meta_title = ?, meta_description = ?, updated_at = datetime('now') WHERE slug = ?`,
        args: [newTitle, newDesc, slug],
      });
    }
  }

  console.log(`\n${changed} card(s) ${dryRun ? 'would be updated' : 'updated'} out of ${result.rows.length}.`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
