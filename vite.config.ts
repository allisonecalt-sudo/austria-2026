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
        return html.replace(
          /(<meta charset="UTF-8" \/>)/i,
          `$1\n    ${metaBlock}`,
        );
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
        main: resolve(__dirname, 'index.html'),
        itinerary: resolve(__dirname, 'itinerary.html'),
        stay: resolve(__dirname, 'stay.html'),
        rentalCar: resolve(__dirname, 'rental-car.html'),
        shabbat: resolve(__dirname, 'shabbat.html'),
        jewishSights: resolve(__dirname, 'jewish-sights.html'),
        packing: resolve(__dirname, 'packing.html'),
        costs: resolve(__dirname, 'costs.html'),
        notes: resolve(__dirname, 'notes.html'),
        map: resolve(__dirname, 'map.html'),
        natureDestinations: resolve(__dirname, 'nature-destinations.html'),
        topSunsets: resolve(__dirname, 'top-sunsets.html'),
        logistics: resolve(__dirname, 'logistics.html'),
        bases: resolve(__dirname, 'bases.html'),
        fridaySalzburg: resolve(__dirname, 'friday-salzburg.html'),
        sundaysClosed: resolve(__dirname, 'sundays-closed.html'),
        weatherPlanC: resolve(__dirname, 'weather-plan-c.html'),
        preTrip: resolve(__dirname, 'pre-trip.html'),
        cafes: resolve(__dirname, 'cafes.html'),
        drivingAustria: resolve(__dirname, 'driving-austria.html'),
        lakeSwimming: resolve(__dirname, 'lake-swimming.html'),
        waterActivities: resolve(__dirname, 'water-activities.html'),
        tripSummary: resolve(__dirname, 'trip-summary.html'),
        activities: resolve(__dirname, 'activities.html'),
        recommendations: resolve(__dirname, 'recommendations.html'),
        tripOptions: resolve(__dirname, 'trip-options.html'),
        schafbergspitze: resolve(__dirname, 'schafbergspitze.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
}));
