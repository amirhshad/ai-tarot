#!/usr/bin/env node
/**
 * Read-only CLI for the Bing Webmaster Tools API.
 *
 * Why: Bing is ~90% of TarotVeil's search traffic (see
 * docs/bing-desktop-ctr-finding and the SEO baseline notes), but the only
 * way to look at that data has been exporting CSVs by hand from the
 * Webmaster Tools UI. This makes it queryable live from the CLI so it can
 * be the primary measurement tool for SEO work going forward.
 *
 * SAFETY: the BING_WEBMASTER_API_KEY in app/.env.local is unscoped — the
 * same key that reads stats can also call RemoveSite, AddBlockedUrl
 * (deindex a page), AddSiteRoles (grant account access to a stranger),
 * SaveCrawlSettings, SubmitSiteMove, etc. This script hard-codes an
 * allowlist of read-only methods (ALLOWED_METHODS below) and is the ONLY
 * way this key should be called from the command line. There is
 * deliberately no "raw method" escape hatch, no --force flag, and no way
 * to pass an arbitrary method name through to the API — see
 * isMethodAllowed() for the two independent checks (allowlist +
 * mutating-verb-prefix guard) that both must pass before any network call
 * is made.
 *
 * Auth: plain query parameter (?apikey=...). GetUserSites confirmed this
 * works and that the site is registered as "https://tarotveil.com/" (no
 * www) — that is the --site default. Responses wrap the payload in a
 * top-level "d".
 *
 * Usage:
 *   node execution/bing-wmt.mjs <Method> [positional args...] [--site URL] [--json] [--out FILE] [--limit N]
 *   node execution/bing-wmt.mjs --help
 *
 * Examples:
 *   node execution/bing-wmt.mjs GetUserSites
 *   node execution/bing-wmt.mjs GetRankAndTrafficStats
 *   node execution/bing-wmt.mjs GetQueryStats --limit 10
 *   node execution/bing-wmt.mjs GetPageQueryStats /yes-or-no
 *   node execution/bing-wmt.mjs GetUrlInfo https://www.tarotveil.com/yes-or-no
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_SITE = 'https://tarotveil.com/';
const API_BASE = 'https://ssl.bing.com/webmaster/api.svc/json';

// ---------------------------------------------------------------------
// Method allowlist. Every entry is READ-ONLY. Each definition says which
// positional CLI args it needs and how they map onto Bing query params.
// `siteUrl` is injected automatically from --site / DEFAULT_SITE for every
// method except GetUserSites, so it is not listed in `params` below.
// ---------------------------------------------------------------------
const ALLOWED_METHODS = {
  GetUserSites: {
    needsSite: false,
    params: [],
    help: 'GetUserSites                        (no args) — list sites this key can access',
  },
  GetRankAndTrafficStats: {
    needsSite: true,
    params: [],
    help: 'GetRankAndTrafficStats [--site URL]  daily clicks/impressions for the whole site',
  },
  GetQueryStats: {
    needsSite: true,
    params: [],
    help: 'GetQueryStats [--site URL]           per-query stats (aggregated across dates for table output)',
  },
  GetPageStats: {
    needsSite: true,
    params: [],
    help: 'GetPageStats [--site URL]            per-page stats (aggregated across dates for table output)',
  },
  GetPageQueryStats: {
    needsSite: true,
    params: [{ name: 'page', label: '<page>' }],
    help: 'GetPageQueryStats <page> [--site URL] queries that led to one page',
  },
  GetQueryPageStats: {
    needsSite: true,
    params: [{ name: 'query', label: '<query>' }],
    help: 'GetQueryPageStats <query> [--site URL] pages that matched one query',
  },
  GetUrlTrafficInfo: {
    needsSite: true,
    params: [{ name: 'url', label: '<url>' }],
    help: 'GetUrlTrafficInfo <url> [--site URL]  clicks/impressions for one URL',
  },
  GetUrlInfo: {
    needsSite: true,
    params: [{ name: 'url', label: '<url>' }],
    help: 'GetUrlInfo <url> [--site URL]         index details (crawl/discovery dates) for one URL',
  },
  GetCrawlStats: {
    needsSite: true,
    params: [],
    help: 'GetCrawlStats [--site URL]           daily crawl stats (status codes, errors)',
  },
  GetCrawlIssues: {
    needsSite: true,
    params: [],
    help: 'GetCrawlIssues [--site URL]          crawl issues Bing has flagged',
  },
  GetUrlSubmissionQuota: {
    needsSite: true,
    params: [],
    help: 'GetUrlSubmissionQuota [--site URL]   remaining URL-submission quota',
  },
  GetLinkCounts: {
    needsSite: true,
    params: [],
    help: 'GetLinkCounts [--site URL]           inbound link counts',
  },
};

// Belt and braces: even if a future edit adds a mutating method to
// ALLOWED_METHODS above by mistake, this prefix guard still rejects it.
// Every method this script actually supports is read-only (Get*), so this
// pattern should never legitimately match anything we call.
const MUTATING_METHOD_PATTERN = /^(Add|Remove|Submit|Save|Update|Enable|Verify|Fetch)/i;

function isMethodAllowed(method) {
  if (!Object.prototype.hasOwnProperty.call(ALLOWED_METHODS, method)) return false;
  if (MUTATING_METHOD_PATTERN.test(method)) return false;
  return true;
}

/** Strip the apikey query param out of a URL so it never reaches output. */
function redact(url) {
  return String(url).replace(/([?&]apikey=)[^&]*/i, '$1***REDACTED***');
}

function printHelp() {
  console.log('Read-only CLI for the Bing Webmaster Tools API.\n');
  console.log('Usage:');
  console.log('  node execution/bing-wmt.mjs <Method> [positional args...] [--site URL] [--json] [--out FILE] [--limit N]\n');
  console.log(`Default --site: ${DEFAULT_SITE}\n`);
  console.log('Allowed methods (read-only only — this list cannot be extended from the CLI):');
  for (const def of Object.values(ALLOWED_METHODS)) {
    console.log('  ' + def.help);
  }
  console.log('\nFlags:');
  console.log('  --site URL   site to query (default: ' + DEFAULT_SITE + ')');
  console.log('  --json       print raw JSON instead of a table');
  console.log('  --out FILE   write raw JSON to FILE instead of stdout');
  console.log('  --limit N    cap printed rows (does not affect the request)');
}

function loadEnv() {
  const raw = readFileSync(join(ROOT, 'app', '.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, '');
  }
}

/**
 * Parse a Microsoft JSON date like "/Date(1773532800000)/" or
 * "/Date(1757462400000-0700)/" into "YYYY-MM-DD". The trailing timezone
 * offset (if present) is part of the encoding, not extra digits to keep —
 * confirmed against live GetRankAndTrafficStats output, which returns the
 * form without an offset (UTC midnight per day).
 */
function parseMsDate(value) {
  if (typeof value !== 'string') return value;
  const m = value.match(/^\/Date\((-?\d+)([+-]\d{4})?\)\/$/);
  if (!m) return value;
  const ms = parseInt(m[1], 10);
  return new Date(ms).toISOString().slice(0, 10);
}

/** Recursively convert any /Date(...)/ strings in an object/array to YYYY-MM-DD. */
function convertDates(value) {
  if (Array.isArray(value)) return value.map(convertDates);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = typeof v === 'string' && /^\/Date\(/.test(v) ? parseMsDate(v) : convertDates(v);
    }
    return out;
  }
  return value;
}

function parseArgs(argv) {
  const flags = { site: DEFAULT_SITE, json: false, out: null, limit: null };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--site') flags.site = argv[++i];
    else if (arg === '--json') flags.json = true;
    else if (arg === '--out') flags.out = argv[++i];
    else if (arg === '--limit') flags.limit = parseInt(argv[++i], 10);
    else if (arg === '--help' || arg === '-h') flags.help = true;
    else positional.push(arg);
  }
  return { flags, positional };
}

async function callBing(method, params) {
  const key = process.env.BING_WEBMASTER_API_KEY;
  if (!key) throw new Error('BING_WEBMASTER_API_KEY not found in app/.env.local');

  const url = new URL(`${API_BASE}/${method}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  }
  url.searchParams.set('apikey', key);

  let res;
  try {
    res = await fetch(url.toString());
  } catch (err) {
    throw new Error(`Network error calling ${method}: ${err.message} (${redact(url.toString())})`);
  }

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from ${method} (HTTP ${res.status}) at ${redact(url.toString())}: ${text.slice(0, 300)}`);
  }

  if (!res.ok || json.ErrorCode !== undefined) {
    const msg = json.Message || `HTTP ${res.status}`;
    throw new Error(`Bing API error calling ${method} (${redact(url.toString())}): ${msg}`);
  }

  return json.d;
}

/**
 * GetQueryStats / GetPageStats return one row per (query-or-page, date),
 * not aggregated totals. Aggregate by the label field and sort by
 * impressions desc so --limit and table output show genuine "top N"
 * results — confirmed against live data (GetQueryStats surfaces "yes or
 * no tarot" / "yes and no tarot ai" near the top only after aggregating;
 * the raw per-date rows are not sorted that way).
 */
function aggregateByLabel(rows, sourceField, outLabel) {
  const byLabel = new Map();
  for (const row of rows) {
    const label = row[sourceField];
    if (!byLabel.has(label)) {
      byLabel.set(label, { [outLabel]: label, Clicks: 0, Impressions: 0 });
    }
    const agg = byLabel.get(label);
    agg.Clicks += row.Clicks || 0;
    agg.Impressions += row.Impressions || 0;
  }
  return [...byLabel.values()].sort((a, b) => b.Impressions - a.Impressions);
}

function toRows(method, data) {
  if (Array.isArray(data)) {
    // Bing reuses the QueryStats schema (field name "Query") for the page
    // endpoints too, where the value is actually a page URL — confirmed
    // against live GetPageStats/GetPageQueryStats output. Relabel for
    // clarity in table output.
    // GetPageQueryStats answers "which queries led to this page?" -> rows are queries.
    // GetQueryPageStats answers "which pages matched this query?" -> rows are pages.
    if (method === 'GetQueryStats' || method === 'GetPageQueryStats') return aggregateByLabel(data, 'Query', 'Query');
    if (method === 'GetPageStats' || method === 'GetQueryPageStats') return aggregateByLabel(data, 'Query', 'Page');
    return data;
  }
  // Single-object responses (GetUrlTrafficInfo, GetUrlInfo, GetUrlSubmissionQuota) -> one row.
  return [data];
}

function printTable(rows, limit) {
  if (!rows.length) {
    console.log('(no rows)');
    return;
  }
  const shown = limit ? rows.slice(0, limit) : rows;
  const columns = Object.keys(shown[0]).filter((k) => k !== '__type');
  const widths = columns.map((c) =>
    Math.max(c.length, ...shown.map((r) => String(r[c] ?? '').length))
  );
  const line = (cells) => cells.map((c, i) => String(c).padEnd(widths[i])).join('  ');
  console.log(line(columns));
  console.log(line(widths.map((w) => '-'.repeat(w))));
  for (const row of shown) {
    console.log(line(columns.map((c) => row[c] ?? '')));
  }
  if (limit && rows.length > limit) {
    console.log(`... (${rows.length - limit} more rows not shown; raise --limit or use --json)`);
  }
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));

  if (flags.help || positional.length === 0) {
    printHelp();
    return;
  }

  const method = positional[0];

  if (!isMethodAllowed(method)) {
    const allowed = Object.keys(ALLOWED_METHODS).join(', ');
    console.error(`Refused: "${method}" is not a read-only method this script permits to call.`);
    console.error(`Allowed methods: ${allowed}`);
    console.error('No network request was made.');
    process.exitCode = 1;
    return;
  }

  const def = ALLOWED_METHODS[method];
  const restArgs = positional.slice(1);

  if (restArgs.length < def.params.length) {
    console.error(`"${method}" requires: ${def.params.map((p) => p.label).join(' ')}`);
    process.exitCode = 1;
    return;
  }

  loadEnv();

  const params = {};
  if (def.needsSite) params.siteUrl = flags.site;
  def.params.forEach((p, i) => {
    params[p.name] = restArgs[i];
  });

  let data;
  try {
    data = await callBing(method, params);
  } catch (err) {
    // err.message already goes through redact() inside callBing(); never
    // print the raw caught error object, which could carry an unredacted URL.
    console.error(err.message);
    process.exitCode = 1;
    return;
  }

  const converted = convertDates(data);

  if (flags.out) {
    writeFileSync(flags.out, JSON.stringify(converted, null, 2));
    console.log(`Wrote JSON to ${flags.out}`);
    return;
  }

  if (flags.json) {
    console.log(JSON.stringify(converted, null, 2));
    return;
  }

  const rows = toRows(method, converted);
  printTable(rows, flags.limit);
}

main().catch((err) => {
  // Last-resort catch: still must never leak the key even here.
  console.error(err && err.message ? err.message : String(err));
  process.exitCode = 1;
});
