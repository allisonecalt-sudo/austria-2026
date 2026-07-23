// ===========================================================================
// map.ts — the map on the overview page.
//
// Why (Allison, 23 Jul): "add a map to this page so you can really visualise
//   where everything is."
//
// Decisions and why:
//   • Leaflet is BUNDLED from npm, not pulled off a CDN. The site has to work
//     in an alpine valley with one bar, and the service worker can only cache
//     what comes from our own origin. Tiles will grey out offline; the markers,
//     the route and the labels will not.
//   • It plots from src/table-data.ts — the SAME file the drive times come
//     from — so the map can never disagree with the tables. One dataset.
//   • Colour = which bed it is closest to, because that is the actual question
//     ("what is near where I am sleeping"), not which category it falls in.
//   • The four beds are numbered in trip order and joined by a line, so the
//     shape of the week is visible before you read a word: two clusters close
//     together in the Salzkammergut, one long reach south-west to Zell, then
//     back and out to Salzburg.
//   • Tapping a marker gives the name, the drive from the nearest bed, and a
//     link into that card. Nothing is decorative.
// ===========================================================================

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { byId } from './plan-data.js';
import { BASE_ORDER, TABLE_ROWS } from './table-data.js';

/** Bed colours, matching the three-region colouring on the overview page.
 *  Goisern and Gosau share a family because they ARE the same region. */
const BED_COLOUR = ['#3f5d4e', '#33597a', '#6b8f78', '#b98a2f'];
const BED_SHORT = ['Goisern', 'Zell', 'Gosau', 'Wals'];

function nearestBed(fromBase: number[]): number {
  let best = 0;
  fromBase.forEach((m, i) => {
    if (m < fromBase[best]) best = i;
  });
  return best;
}

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export function mountMap(hostId: string): void {
  const host = document.getElementById(hostId);
  if (!host) return;

  const rows = Object.values(TABLE_ROWS).filter(
    (r): r is typeof r & { lat: number; lng: number } => r.lat !== null && r.lng !== null,
  );
  if (rows.length === 0) {
    // Fail loud rather than showing an empty grey box.
    host.innerHTML =
      '<p class="mapfail">The map has no coordinates to plot — tell Claude, this is a bug.</p>';
    return;
  }

  const map = L.map(host, {
    scrollWheelZoom: false, // never hijack the page scroll on a phone
    attributionControl: true,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '© OpenStreetMap',
  }).addTo(map);

  // ---- the route between the four beds, in trip order ---------------------
  const bedPoints: [number, number][] = BASE_ORDER.map((b) => [b.lat, b.lng]);
  L.polyline(bedPoints, {
    color: '#20211f',
    weight: 2,
    opacity: 0.35,
    dashArray: '5 6',
  }).addTo(map);

  // ---- every activity, coloured by the bed it is closest to ---------------
  for (const r of rows) {
    const a = byId.get(r.id);
    if (!a) continue;
    const bed = nearestBed(r.fromBase);
    const mins = r.fromBase[bed];

    const dot = L.circleMarker([r.lat, r.lng], {
      radius: a.star ? 7 : 5,
      color: '#fff',
      weight: a.star ? 2 : 1,
      fillColor: BED_COLOUR[bed],
      fillOpacity: a.star ? 0.95 : 0.75,
    }).addTo(map);

    dot.bindPopup(
      `<b>${a.emoji} ${esc(a.name)}</b><br>` +
        `<span class="mp-drive">🚗 ${mins} min from ${esc(BED_SHORT[bed])}</span><br>` +
        `<span class="mp-what">${esc(a.what)}</span><br>` +
        `<a href="plan.html#${esc(r.id)}">Open this →</a>`,
    );
  }

  // ---- the beds themselves, numbered, drawn last so they sit on top -------
  BASE_ORDER.forEach((b, i) => {
    L.marker([b.lat, b.lng], {
      icon: L.divIcon({
        className: 'bedpin',
        html: `<span style="background:${BED_COLOUR[i]}">${i === 3 ? 4 : i === 2 ? 3 : i + 1}</span>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
      zIndexOffset: 1000,
    })
      .addTo(map)
      .bindPopup(`<b>🛏 ${esc(b.name)}</b><br><span class="mp-what">Where you sleep</span>`);
  });

  map.fitBounds(
    L.latLngBounds([...rows.map((r) => [r.lat, r.lng] as [number, number]), ...bedPoints]).pad(
      0.06,
    ),
  );

  // A phone rotating, or the section opening, both need a size recalculation.
  const nudge = (): void => {
    map.invalidateSize();
  };
  window.addEventListener('resize', nudge);
  window.setTimeout(nudge, 200);
  host.setAttribute('data-map-ready', 'true');
}
