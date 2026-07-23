import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'node:path';

// Cache-bleed defense plugin.
// Context: 2026-05-17 P0 — fresh-localStorage mobile loads served WRONG
// body content on 4 of 10 pages (map.html got jewish-sights body, etc.).
// Root cause: GH-Pages serves HTML with `Cache-Control: max-age=600` via
// Fastly; rapid-fire deploys (10+ commits in 30 min) left browser + edge
// caches holding stale HTML pointing to bundle hashes from a prior build.
// Vite already hashes JS/CSS — only HTML needed cache-busting.
// GH-Pages does NOT honor _headers files, so we inject equivalent meta tags
// on every HTML page at build time. Belt-and-suspenders: also adds a
// per-build version stamp so devtools can verify what's actually loaded.
function htmlCacheBust(buildId: string): Plugin {
  const metaBlock = `<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <meta name="x-build-id" content="${buildId}" />`;
  return {
    name: 'html-cache-bust',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        // Inject right after <meta charset="UTF-8" /> so headers apply before
        // any other parsing decisions.
        return html.replace(/(<meta charset="UTF-8" \/>)/i, `$1\n    ${metaBlock}`);
      },
    },
  };
}

// GitHub Pages serves at /austria-2026/ — base must match repo name.
// For local dev, base = "/".
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/austria-2026/' : '/',
  plugins: [htmlCacheBust(new Date().toISOString())],
  build: {
    outDir: 'dist',
    rollupOptions: {
      // 2026-06-10 SCRATCH REBUILD: the brochure is ONE page. The old multi-
      // page site (itinerary/stay/logistics/costs/activities/notes/map .html)
      // lives on branch archive/pre-rebuild-2026-06-10 — pullable, nothing lost.
      input: {
        main: resolve(__dirname, 'index.html'),
        // 2026-07-17: options-menu + choosing tool (plan/rank), data-driven
        // from src/plan-data.ts — the "choose the week together" surfaces.
        plan: resolve(__dirname, 'plan.html'),
        rank: resolve(__dirname, 'rank.html'),
        claude: resolve(__dirname, 'claude.html'),
        // 2026-07-22: kosher-by-ingredient field guide (certified-first +
        // ingredient-based traffic-light triage). Static, no Supabase.
        kosher: resolve(__dirname, 'kosher.html'),
        // 2026-07-22: shop-by-sight visual product grid.
        shop: resolve(__dirname, 'shop.html'),
        // 2026-07-23: certified-only page (path 1), split out from shop.
        certified: resolve(__dirname, 'certified.html'),
        // 2026-07-23: the trip sliced by where you sleep — top 10 within
        // ~1.5h of each base, ranked. Data reused from src/plan-data.ts.
        bases: resolve(__dirname, 'bases.html'),
        // 2026-07-23: wet-weather fallbacks per base.
        rain: resolve(__dirname, 'rain.html'),
        // 2026-07-23 (Avital's ask): heart anything anywhere on the site and
        // it lands here — same by-the-bed view, filtered to only their picks.
        favorites: resolve(__dirname, 'favorites.html'),
        // 2026-07-23: the one-stop landing zone — her ask for "one singular
        // place we can use while we're on the trip".
        hub: resolve(__dirname, 'hub.html'),
        // 2026-07-23: the trip shopping list (Allison + Avital), same
        // grocery_items table as the apartment app, scoped to this trip.
        groceries: resolve(__dirname, 'groceries.html'),
        // 2026-07-23: private booking details behind a login. Content is
        // encrypted at rest in Supabase — nothing sensitive ships in the repo.
        info: resolve(__dirname, 'info.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
}));
