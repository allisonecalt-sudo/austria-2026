// ===========================================================================
// sw.js — the service worker. Makes the trip app work with no signal.
//
// Why: she will be in alpine valleys and inside a Spar in Bad Goisern with one
// bar or none. A shopping list that shows a blank page in the shop is worse
// than a paper list. The pages, the plan data, and the last-seen shopping list
// all have to survive going offline.
//
// Strategy, deliberately different per kind of request:
//   • App shell (HTML)      — network first, fall back to cache. She still gets
//                             new builds when online, and the page when not.
//   • Hashed assets (JS/CSS)— cache first. The filename contains a content
//                             hash, so a cached copy can never be stale.
//   • Photos (Wikimedia)    — cache first, capped. Nice to have offline.
//   • Supabase              — NEVER cached for writes. GETs are network-first
//                             with a cache fallback so the list still renders
//                             offline; the app labels what it is showing.
//   • Open-Meteo            — not cached here; weather.ts keeps its own
//                             last-known copy in localStorage with an age label.
//
// VERSION must be bumped on every deploy or phones keep the old shell.
// ===========================================================================

const VERSION = 'austria-v5-2026-07-23-2225';
const SHELL = `shell-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const PHOTOS = `photos-${VERSION}`;
const DATA = `data-${VERSION}`;

const BASE = self.registration.scope; // .../austria-2026/

const PAGES = [
  'hub.html',
  'overview.html',
  'routes.html',
  'index.html',
  'plan.html',
  'favorites.html',
  'bases.html',
  'rain.html',
  'rank.html',
  'claude.html',
  'groceries.html',
  'info.html',
  'kosher.html',
  'certified.html',
  'shop.html',
  'manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // addAll fails the whole install if ANY url 404s, which would silently
      // leave her with no offline support at all. Add them individually.
      await Promise.all(
        PAGES.map(async (p) => {
          try {
            await cache.add(new Request(BASE + p, { cache: 'reload' }));
          } catch {
            /* one missing page must not sink the install */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const fresh = await fetch(request);
  if (fresh && fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // writes always go to the network

  const url = new URL(request.url);

  // Supabase: GET reads are network-first so the list renders offline.
  if (url.hostname.endsWith('.supabase.co')) {
    event.respondWith(networkFirst(request, DATA));
    return;
  }

  // Weather has its own labelled cache in weather.ts — don't double-cache.
  if (url.hostname === 'api.open-meteo.com') return;

  // Map tiles. Cache-first and capped by the browser's own eviction — the
  // point is that an area you have already looked at still draws in a valley
  // with no signal. Tiles never change, so a cached one is never stale.
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    event.respondWith(cacheFirst(request, PHOTOS));
    return;
  }

  // Wikimedia activity photos.
  if (url.hostname.endsWith('wikimedia.org') || url.hostname.endsWith('wikipedia.org')) {
    event.respondWith(cacheFirst(request, PHOTOS));
    return;
  }

  if (url.origin !== self.location.origin) return; // fonts etc — leave alone

  // Our own hashed build assets never change under a given name.
  if (url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }

  // Navigations and everything else same-origin: network first, cache fallback.
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      networkFirst(request, SHELL).catch(() => caches.match(BASE + 'hub.html')),
    );
    return;
  }

  event.respondWith(networkFirst(request, SHELL));
});
