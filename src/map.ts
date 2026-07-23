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
import { isFav, loadFavs, toggleFav } from './favs.js';

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

const markers: Record<string, L.CircleMarker> = {};
let mapRef: L.Map | null = null;

/** Open a place's popup and centre it — used by list rows elsewhere on the
 *  page, so a name in a list and a dot on the map are the same object. */
export function focusMap(id: string): void {
  const m = markers[id];
  if (!m || !mapRef) return;
  mapRef.setView(m.getLatLng(), Math.max(mapRef.getZoom(), 12));
  m.openPopup();
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

  void loadFavs().catch(() => undefined); // hearts in popups; fine if late

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

    // Radius 11/9 not 7/5 — Avital, on her phone: "they're a little dark,
    // I can't actually get them." A dot you cannot tap is decoration.
    const dot = L.circleMarker([r.lat, r.lng], {
      radius: a.star ? 11 : 9,
      color: '#fff',
      weight: 2,
      fillColor: BED_COLOUR[bed],
      fillOpacity: a.star ? 0.95 : 0.85,
    }).addTo(map);

    markers[r.id] = dot;

    // Content built fresh on every open, so the heart state is never stale.
    dot.bindPopup(() => {
      const on = isFav(r.id);
      return (
        `<b>${a.emoji} ${esc(a.name)}</b><br>` +
        `<span class="mp-drive">🚗 ${mins} min from ${esc(BED_SHORT[bed])}</span><br>` +
        `<span class="mp-what">${esc(a.what)}</span><br>` +
        `<button type="button" class="mp-fav${on ? ' on' : ''}" data-fav="${esc(r.id)}">` +
        `${on ? '❤️ In your picks — tap to remove' : '🤍 Add to Our picks'}</button>` +
        `<a href="plan.html#${esc(r.id)}">Open the card →</a>`
      );
    });
  }

  // One delegated listener handles every popup's heart — add AND remove,
  // straight from the map (Avital: "add to the state, add to the state...
  // and we should also be able to remove things everywhere").
  map.on('popupopen', (e) => {
    const node = e.popup.getElement();
    const btn = node?.querySelector<HTMLButtonElement>('button.mp-fav');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-fav');
      if (!id) return;
      const on = toggleFav(id);
      btn.className = on ? 'mp-fav on' : 'mp-fav';
      btn.textContent = on ? '❤️ In your picks — tap to remove' : '🤍 Add to Our picks';
    });
  });
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

  mapRef = map;

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
