// ===========================================================================
// map.ts — ONE lightweight Leaflet/OSM map with base pins only (spec B2).
//
// Loaded from the Leaflet UMD CDN (CSS is linked in index.html). We type the
// minimal surface we use rather than pull in @types/leaflet, keeping the
// dependency footprint to zero npm packages. Numbered pins match the at-a-
// glance strip; the open base is gold.
// ===========================================================================

import type { Base } from './trip.js';

// Minimal Leaflet typings — only what we call (no `any`, no extra deps).
interface LMap {
  setView(center: [number, number], zoom: number): LMap;
  fitBounds(bounds: [number, number][], opts?: { padding?: [number, number] }): LMap;
  addLayer(layer: unknown): LMap;
}
interface LMarker {
  addTo(map: LMap): LMarker;
  bindPopup(html: string): LMarker;
}
interface LTileLayer {
  addTo(map: LMap): LTileLayer;
}
interface LDivIcon {
  __brand: 'divicon';
}
interface Leaflet {
  map(id: string, opts?: { scrollWheelZoom?: boolean; attributionControl?: boolean }): LMap;
  tileLayer(url: string, opts: { attribution: string; maxZoom: number }): LTileLayer;
  marker(latlng: [number, number], opts: { icon: LDivIcon }): LMarker;
  divIcon(opts: {
    className: string;
    html: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  }): LDivIcon;
}

declare global {
  interface Window {
    L?: Leaflet;
  }
}

const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

function loadLeaflet(): Promise<Leaflet> {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }
    const s = document.createElement('script');
    s.src = LEAFLET_JS;
    s.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    s.crossOrigin = '';
    s.onload = () => (window.L ? resolve(window.L) : reject(new Error('Leaflet failed to init')));
    s.onerror = () => reject(new Error('Leaflet script failed to load'));
    document.head.appendChild(s);
  });
}

export function mountMap(elementId: string, bases: Base[]): void {
  const box = document.getElementById(elementId);
  if (!box) return;

  loadLeaflet()
    .then((L) => {
      const map = L.map(elementId, { scrollWheelZoom: false, attributionControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 17,
      }).addTo(map);

      const pts: [number, number][] = [];
      bases.forEach((b, i) => {
        const latlng: [number, number] = [b.coord.lat, b.coord.lng];
        pts.push(latlng);
        const open = b.status === 'open';
        const icon = L.divIcon({
          className: '',
          html: `<div class="glance__pin${open ? ' glance__pin--open' : ''}">${i + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        L.marker(latlng, { icon })
          .addTo(map)
          .bindPopup(
            `<strong>${i + 1}. ${b.town}</strong><br>${b.name}<br>${b.nights} ${
              b.nights === 1 ? 'night' : 'nights'
            } · ${open ? 'still to pick' : 'booked'}`,
          );
      });

      if (pts.length > 1) {
        map.fitBounds(pts, { padding: [40, 40] });
      } else if (pts.length === 1) {
        map.setView(pts[0], 9);
      }
    })
    .catch((err: unknown) => {
      // Fail loud — show a labeled fallback, never a blank gray box.
      box.innerHTML =
        '<div class="photo-frame__broken" style="height:100%">⚠ map could not load — bases are listed below</div>';
      // eslint-disable-next-line no-console
      console.error('Map load failed:', err);
    });
}
