// ===========================================================================
// link-check.mjs — verify every photo URL + external link in trip.ts resolves.
//
// Why: spec rule A8/A11 — a photo must actually show the thing it claims, and
//   broken images are a fail-loud concern. This script HEAD/GET-checks every
//   image URL in the data module so a rotted Wikimedia/Unsplash URL fails CI
//   instead of silently 404-ing on the live site.
//
// Network-gated: pass --net to actually hit the URLs (CI / on demand). Without
//   it, the script only validates that every URL is well-formed https — so the
//   default `npm run check:links` stays fast and offline-safe, and the live
//   network check is opt-in (CI runs it with --net).
// ===========================================================================

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const NET = process.argv.includes('--net');

const src = readFileSync(join(ROOT, 'src', 'trip.ts'), 'utf8');

// Pull every http(s) URL literal out of the data module (photos + website: links).
const urls = [...src.matchAll(/https?:\/\/[^\s'"`)]+/g)].map((m) => m[0]);

// ALSO build the Google Maps "Navigate" URLs from every `query:` field — these
// are generated at runtime by mapsUrl(), so they aren't literals in the source,
// but they ARE the 📍 Navigate links shown on the trip (DELTA 2). Include them
// so --net live-validates the Navigate URLs too (Google Maps search URLs 200).
const queries = [...src.matchAll(/query:\s*'([^']+)'/g)].map((m) => m[1]);
const mapsUrls = queries.map(
  (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
);

const unique = [...new Set([...urls, ...mapsUrls])];

if (unique.length === 0) {
  console.error('✗ link-check: found NO urls in src/trip.ts — that is suspicious.');
  process.exit(1);
}

// 1) shape check (always).
const malformed = unique.filter((u) => {
  try {
    const parsed = new URL(u);
    return parsed.protocol !== 'https:';
  } catch {
    return true;
  }
});
if (malformed.length > 0) {
  console.error('✗ link-check: malformed / non-https urls:');
  malformed.forEach((u) => console.error('   ' + u));
  process.exit(1);
}
console.log(`✓ link-check: ${unique.length} urls, all well-formed https`);

if (!NET) {
  console.log('  (offline mode — run with --net to verify they resolve)');
  process.exit(0);
}

// 2) live resolve check (--net).
// Wikimedia/Unsplash 429 (rate-limit) or 403 anonymous HEADs — send a real
// User-Agent and prefer a ranged GET, with a couple of retries on 429.
const UA =
  'Mozilla/5.0 (austria-2026 link-check; +https://github.com/allisonecalt-sudo/austria-2026)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(u) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(u, {
      method: 'GET',
      headers: { Range: 'bytes=0-0', 'User-Agent': UA },
      redirect: 'follow',
    });
    if (res.ok || res.status === 206) return null;
    if (res.status === 429) {
      await sleep(800 * (attempt + 1));
      continue;
    }
    return res.status;
  }
  return 429;
}

// HTTP 4xx/5xx = the page is GONE or broken → fatal (a dead link on the site).
// Network-level failures (DNS, TLS, connection refused/reset) usually mean the
// host blocks CI/cloud IPs (gosausee.com does) — retry once, then WARN only.
const dead = [];
const unreachable = [];
for (const u of unique) {
  try {
    const bad = await probe(u);
    if (bad !== null) dead.push(`${bad}  ${u}`);
  } catch {
    await sleep(1500);
    try {
      const bad = await probe(u);
      if (bad !== null) dead.push(`${bad}  ${u}`);
    } catch (err) {
      unreachable.push(`ERR (${err.message})  ${u}`);
    }
  }
}

if (unreachable.length > 0) {
  console.warn('\n⚠ link-check: unreachable from this network (NOT failing the build — likely CI-IP blocking; verify manually):');
  unreachable.forEach((d) => console.warn('   ' + d));
}
if (dead.length > 0) {
  console.error('\n✗ link-check: dead urls (HTTP error):');
  dead.forEach((d) => console.error('   ' + d));
  process.exit(1);
}
console.log(`✓ link-check: ${unique.length - unreachable.length}/${unique.length} urls resolve${unreachable.length ? ` (${unreachable.length} unreachable, warned)` : ''}`);
