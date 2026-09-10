#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing).
 *
 * Bing is ~90% of TarotVeil's search traffic, and IndexNow is the only
 * instant-indexing path available for it. Reads the live sitemap so the
 * URL list never drifts from what is actually deployed.
 *
 * Usage:
 *   node execution/indexnow-submit.mjs             # submit everything
 *   node execution/indexnow-submit.mjs --limit 20  # first 20 only
 *
 * Recurring use: after deploying any content change (new/changed titles,
 * meta descriptions, card copy, new pages), run this with no arguments to
 * resubmit the full sitemap. Bing accepts up to 10,000 URLs/day, so
 * submitting the whole sitemap (currently 192 URLs) on every content
 * deploy is well within quota. No database access or bootstrap required —
 * this script only needs global fetch.
 */
const KEY = '27104a98df7e4f81b7a4c6e1bf98df88';
const HOST = 'www.tarotveil.com';
const SITEMAP = `https://${HOST}/sitemap.xml`;

const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > -1 ? parseInt(process.argv[limitArg + 1], 10) : Infinity;

async function main() {
  const xml = await (await fetch(SITEMAP)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => m[1])
    .filter(u => u.startsWith(`https://${HOST}`))
    .slice(0, LIMIT);

  if (!urls.length) throw new Error('No URLs parsed from sitemap.');
  console.log(`Submitting ${urls.length} URLs to IndexNow...`);

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });

  // 200 = accepted, 202 = accepted pending key validation.
  console.log(`HTTP ${res.status} ${res.statusText}`);
  if (res.status !== 200 && res.status !== 202) {
    console.error(await res.text());
    process.exit(1);
  }
  console.log('✓ Accepted.');
}

main().catch(e => { console.error(e); process.exit(1); });
