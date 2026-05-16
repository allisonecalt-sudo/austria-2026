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
        tripSummary: resolve(__dirname, 'trip-summary.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
}));
