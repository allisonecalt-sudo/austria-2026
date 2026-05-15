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
        optionA: resolve(__dirname, 'option-a.html'),
        optionB: resolve(__dirname, 'option-b.html'),
        shabbat: resolve(__dirname, 'shabbat.html'),
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
