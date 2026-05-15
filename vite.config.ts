import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// GitHub Pages serves at /austria-2026/ — base must match repo name.
// For local dev, base = "/".
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/austria-2026/' : '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        itinerary: resolve(__dirname, 'itinerary.html'),
        stay: resolve(__dirname, 'stay.html'),
        shabbat: resolve(__dirname, 'shabbat.html'),
        packing: resolve(__dirname, 'packing.html'),
        costs: resolve(__dirname, 'costs.html'),
        notes: resolve(__dirname, 'notes.html'),
        map: resolve(__dirname, 'map.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
}));
