import { TRIP, LODGING_COORDS, STANDALONE_POIS } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// =====================================================================
// Leaflet ambient types — minimal surface for the moment-3 mini-map.
// Leaflet itself is loaded from CDN in index.html. Kept narrow because
// the full type set lives in page-map.ts; landing only needs marker +
// fitBounds + tileLayer.
// =====================================================================
interface MiniMap {
  fitBounds(latLngs: Array<[number, number]>, opts?: { padding?: [number, number] }): void;
  invalidateSize(): void;
}
interface MiniMarker {
  bindTooltip(
    html: string,
    opts?: { permanent?: boolean; direction?: string; offset?: [number, number] },
  ): MiniMarker;
  addTo(m: MiniMap): MiniMarker;
}
interface MiniLeaflet {
  map(el: HTMLElement | string, opts?: Record<string, unknown>): MiniMap;
  tileLayer(
    url: string,
    opts: { attribution: string; maxZoom: number },
  ): { addTo(m: MiniMap): void };
  marker(latLng: [number, number], opts?: Record<string, unknown>): MiniMarker;
  divIcon(opts: Record<string, unknown>): unknown;
  polyline(
    latLngs: Array<[number, number]>,
    opts?: Record<string, unknown>,
  ): { addTo(m: MiniMap): void };
}

// Local accessor — we deliberately DON'T augment `Window.L` here because
// page-map.ts already does that with a different (richer) type and the
// two pages share the same global namespace at type-check time.
function getLeaflet(): MiniLeaflet | undefined {
  return (window as unknown as { L?: MiniLeaflet }).L;
}

// Anchors for the moment-3 preview map. Each is one of the 4 bases.
// Coords pulled from trip-data.ts so the map of the trip and the preview
// can never drift out of sync.
//   - Salzburg base: Bergland Hotel (4-min walk to Chabad — primary as of Tue May 19 PM).
//   - Zell am See: Aparthotel Zell am See (2-nt alpine-lake first half).
//   - Gosau: Der Ulmenhof (2-nt lakes-region second half).
//   - Airport: Landhaus Grünau (1-nt pre-flight; near SZG terminal).
//
// v4 restructure 2026-05-19: replaced Obertraun + Schafbergspitze summit
// (dropped from the trip when Avital counter-proposed the Zell+Gosau shape)
// with the new Zell + Gosau bases.
//
// If any coord is missing (shouldn't happen — trip-data.ts is canonical),
// we surface a console.warn (fail-loud rule) and skip the pin rather than
// silently hide it.
interface ShapeAnchor {
  key: 'salzburg' | 'zell-am-see' | 'gosau' | 'airport';
  label: string;
  sub: string;
  latLng: [number, number] | null;
}

function getShapeAnchors(): ShapeAnchor[] {
  const salzburgLodging = LODGING_COORDS['Bergland Hotel - Adults only'];
  const zellLodging = LODGING_COORDS['Aparthotel Zell am See'];
  const gosauLodging = LODGING_COORDS['Der Ulmenhof (Gosau)'];
  const airportLodging = LODGING_COORDS['Landhaus Grünau'];
  const airportPoi = STANDALONE_POIS.find((p) => p.id === 'salzburg-airport');
  // Prefer the actual airport-lodging coord; fall back to the airport POI
  // if the lodging coord ever drifts out of the dataset.
  const airportLatLng: [number, number] | null = airportLodging
    ? [airportLodging.lat, airportLodging.lng]
    : airportPoi
      ? [airportPoi.lat, airportPoi.lng]
      : null;

  const anchors: ShapeAnchor[] = [
    {
      key: 'salzburg',
      label: 'Salzburg',
      sub: 'Shabbat · 2 nights',
      latLng: salzburgLodging ? [salzburgLodging.lat, salzburgLodging.lng] : null,
    },
    {
      key: 'zell-am-see',
      label: 'Zell am See',
      sub: 'alpine lake · 2 nights',
      latLng: zellLodging ? [zellLodging.lat, zellLodging.lng] : null,
    },
    {
      key: 'gosau',
      label: 'Gosau',
      sub: 'Salzkammergut · 2 nights',
      latLng: gosauLodging ? [gosauLodging.lat, gosauLodging.lng] : null,
    },
    {
      key: 'airport',
      label: 'SZG airport',
      sub: 'last sleep · 1 night',
      latLng: airportLatLng,
    },
  ];

  for (const a of anchors) {
    if (!a.latLng) {
      console.warn(`[shape-map] missing coord for anchor "${a.key}" — pin skipped`);
    }
  }
  return anchors;
}

function initShapeMap(): void {
  const el = document.querySelector<HTMLDivElement>('#moment-map');
  if (!el) return;
  const L = getLeaflet();
  if (!L) {
    console.warn('[shape-map] Leaflet not loaded — preview map skipped');
    el.classList.add('moment-map--unavailable');
    return;
  }

  const anchors = getShapeAnchors().filter(
    (a): a is ShapeAnchor & { latLng: [number, number] } => a.latLng !== null,
  );
  if (anchors.length === 0) return;

  const map = L.map(el, {
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: false,
    touchZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false,
    attributionControl: true,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    maxZoom: 18,
  }).addTo(map);

  // Pins — interactive now (was non-interactive). Lets touch users tap to
  // see the label without dragging/zooming. Wrapper is 30×30 invisible
  // touch target via CSS (.moment-map-pin-wrap) so fingers don't miss
  // the small visible dot.
  for (const a of anchors) {
    const icon = L.divIcon({
      html: `<span class="moment-map-pin moment-map-pin--${a.key}" aria-hidden="true"></span>`,
      className: 'moment-map-pin-wrap',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    L.marker(a.latLng, { icon, interactive: true, keyboard: false })
      .bindTooltip(`<strong>${escapeHtml(a.label)}</strong><br />${escapeHtml(a.sub)}`, {
        permanent: false,
        direction: 'top',
        offset: [0, -6],
      })
      .addTo(map);
  }

  // Route shape — visual hint of the week's loop. Not literal driving
  // route; OSRM would over-engineer this. A subtle dashed polyline reads
  // as "these connect" without lying about turn-by-turn.
  const byKey = Object.fromEntries(anchors.map((a) => [a.key, a.latLng])) as Record<
    ShapeAnchor['key'],
    [number, number]
  >;
  // Route order matches the actual driving sequence: SZG → Salzburg →
  // Zell → Gosau → SZG airport-side. Doubled SZG endpoint shows the loop
  // close without lying about literal turn-by-turn (no OSRM call).
  const routeOrder: Array<ShapeAnchor['key']> = [
    'airport',
    'salzburg',
    'zell-am-see',
    'gosau',
    'airport',
  ];
  const routePts = routeOrder.map((k) => byKey[k]).filter((p): p is [number, number] => !!p);
  if (routePts.length >= 2) {
    const line = L.polyline(routePts, {
      color: '#0033a0',
      weight: 2.5,
      opacity: 0.55,
      dashArray: '6 6',
      interactive: false,
    }).addTo(map);

    // Scroll-into-view draw animation — fires once when the moment is
    // first visible. Uses SVG stroke-dashoffset trick: compute the path's
    // total length, set dasharray = length, dashoffset = length (invisible),
    // then on intersect set dashoffset = 0 (CSS transition does the rest).
    const pathEl = (line as unknown as { _path?: SVGPathElement })._path;
    if (pathEl && 'IntersectionObserver' in window) {
      try {
        const length = pathEl.getTotalLength();
        pathEl.classList.add('moment-route-animating');
        pathEl.style.strokeDasharray = `${length}`;
        pathEl.style.strokeDashoffset = `${length}`;
        const io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                // Defer one frame so the CSS transition picks up the change.
                requestAnimationFrame(() => {
                  pathEl.style.strokeDashoffset = '0';
                });
                io.disconnect();
                // Restore the dashed look ~1.6s after the draw completes
                // by re-applying the original 6-6 dash pattern.
                window.setTimeout(() => {
                  pathEl.classList.remove('moment-route-animating');
                  pathEl.style.strokeDasharray = '6 6';
                  pathEl.style.strokeDashoffset = '0';
                }, 1700);
              }
            }
          },
          { threshold: 0.25 },
        );
        io.observe(el);
      } catch (err) {
        // getTotalLength can fail on some Safari edge cases. Fall back
        // to the static dashed line — no animation, but the polyline is
        // already visible.
        console.warn('[shape-map] route animation skipped:', err);
      }
    }
  }

  map.fitBounds(
    anchors.map((a) => a.latLng),
    { padding: [28, 28] },
  );
  // Recompute on next frame in case fonts/layout shifted height.
  requestAnimationFrame(() => map.invalidateSize());
}

function bindLanding(): void {
  // Cost bindings — used in the CTA strip
  const totalEur = document.querySelectorAll<HTMLSpanElement>('[data-bind="total-eur"]');
  totalEur.forEach((el) => (el.textContent = TRIP.totalCostEur.toLocaleString('en-US')));
  const totalNis = document.querySelectorAll<HTMLSpanElement>('[data-bind="total-nis"]');
  totalNis.forEach((el) => (el.textContent = TRIP.totalCostNis.toLocaleString('en-US')));
  const ceiling = document.querySelectorAll<HTMLSpanElement>('[data-bind="ceiling"]');
  ceiling.forEach((el) => (el.textContent = TRIP.ceilingEur.toLocaleString('en-US')));

  // Day strip — moment 5. Each card now shows the BASE pin color in a strip
  // along the top edge so Avital can orient geographically while swiping
  // (Allison 2026-05-17 — IA rethink: "show base pin color per day").
  const strip = document.querySelector<HTMLDivElement>('#day-strip');
  if (strip) {
    // Updated 2026-05-19 for v4 4-base restructure.
    const baseLabel: Record<string, string> = {
      salzburg: 'Salzburg',
      'zell-am-see': 'Zell am See',
      gosau: 'Gosau',
      'salzburg-airport': 'Airport',
      // deprecated 2026-05-19, fallback only
      hallstatt: 'Mountain anchor',
      schafbergspitze: 'Summit',
      'lodge-am-krippenstein': 'Summit',
      airport: 'Airport',
    };
    strip.innerHTML = TRIP.days
      .map((d, i) => {
        const isPeak = !!d.tarabridgeMoment;
        const baseKey = d.sleepWhere;
        return `
          <a class="day-strip-card day-strip-card--${escapeHtml(baseKey)}" href="itinerary.html#${escapeHtml(d.id)}">
            <span class="day-strip-basebar" aria-hidden="true"></span>
            <img class="day-strip-photo" loading="lazy" decoding="async" src="${escapeHtml(d.hero.src)}" alt="${escapeHtml(d.hero.alt)}" />
            <div class="day-strip-body">
              <div class="day-strip-eyebrow">
                Day ${i + 1} · ${escapeHtml(d.dateLabel)}
                <span class="day-strip-basetag day-strip-basetag--${escapeHtml(baseKey)}" title="Sleeping at ${escapeHtml(baseLabel[baseKey] ?? baseKey)}">●&nbsp;${escapeHtml(baseLabel[baseKey] ?? baseKey)}</span>
              </div>
              <div class="day-strip-title">${escapeHtml(d.headline)}</div>
              <div class="day-strip-foot">
                <span>☀ ${escapeHtml(d.sunset.time)}</span>
                ${isPeak ? '<span class="peak">⭐ Peak</span>' : '<span></span>'}
              </div>
            </div>
          </a>`;
      })
      .join('');
  }

  // Mini-map — moment 3 ("The shape of it"). Static-feeling preview of the
  // 4-base geography (v4 restructure 2026-05-19): Salzburg / Zell am See /
  // Gosau / SZG airport-side. Dragging + zoom disabled so it reads as a
  // "shape" not an app — taps on legend or the "See full map →" CTA route
  // to map.html for the real interactive experience.
  initShapeMap();

  // Nav style switch — when hero is on-screen, nav is translucent over
  // the photo; off-screen, nav becomes solid on the cream background.
  const nav = document.querySelector<HTMLElement>('#top-nav');
  const hero = document.querySelector<HTMLElement>('#m-hero');
  if (nav && hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) {
            nav.classList.toggle('nav--overlay', entry.isIntersecting);
            nav.classList.toggle('nav--solid', !entry.isIntersecting);
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(hero);
  }
}

bindLanding();
initNotesWidget();
initChatPlanPopup();
