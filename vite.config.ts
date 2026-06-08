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
      input: {
        // --- Canonical top-level pages (in the 4-item nav) ---
        // 2026-06-08 structure simplification: nav cut 6->4
        // (Trip · Stay · Logistics · Costs). Explore (activities) + the map
        // stay as off-nav pages reachable via in-page links; the five
        // logistics deep-dives (rental-car, packing, pre-trip, cafes,
        // driving-austria) were folded into logistics.html as collapsibles
        // and their standalone files deleted.
        main: resolve(__dirname, 'index.html'),
        itinerary: resolve(__dirname, 'itinerary.html'),
        stay: resolve(__dirname, 'stay.html'),
        logistics: resolve(__dirname, 'logistics.html'),
        costs: resolve(__dirname, 'costs.html'),
        // --- Off-nav pages (reachable from in-page links, not the top nav) ---
        activities: resolve(__dirname, 'activities.html'),
        notes: resolve(__dirname, 'notes.html'),
        map: resolve(__dirname, 'map.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
}));
