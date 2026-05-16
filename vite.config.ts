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
        rentalCar: resolve(__dirname, 'rental-car.html'),
        shabbat: resolve(__dirname, 'shabbat.html'),
        jewishSights: resolve(__dirname, 'jewish-sights.html'),
        packing: resolve(__dirname, 'packing.html'),
        costs: resolve(__dirname, 'costs.html'),
        notes: resolve(__dirname, 'notes.html'),
        map: resolve(__dirname, 'map.html'),
        logistics: resolve(__dirname, 'logistics.html'),
        natureDestinations: resolve(__dirname, 'nature-destinations.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
}));
