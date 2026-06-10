// ===========================================================================
// route.ts — the ROUTE RIBBON that replaces the Leaflet map (DELTA 1).
//
// Her rule (Jun 10): "don't put a map if the UX/UI is terrible… if not just
//   don't put it in." The default OSM street-tile embed was functional, not
//   brochure-clean — so it's gone. This is a custom drawn route graphic:
//   pure HTML/CSS, NO tile dependency, no Leaflet, no network.
//
// Shape: the 4 bases as nodes in trip order, vertical on mobile (calm, readable
//   at 412px), with the drive leg labelled between consecutive nodes ("~1h20"),
//   nights per node, and a gold accent on the still-open Base 1. Matches the
//   forest/gold palette + serif/Inter type already in brochure.css.
// ===========================================================================

import type { Base } from './trip.js';

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/**
 * Render the route ribbon into the given element. No async, no fetch — it just
 * draws from the bases array. The open base gets the `.route__node--open` class
 * (gold); every other node is forest.
 */
export function mountRoute(elementId: string, bases: Base[]): void {
  const box = document.getElementById(elementId);
  if (!box) return;

  const ol = document.createElement('ol');
  ol.className = 'route';

  bases.forEach((b, i) => {
    const open = b.status === 'open';
    const nights = `${b.nights} ${b.nights === 1 ? 'night' : 'nights'}`;

    // Drive leg ABOVE this node (skip before the first node).
    if (i > 0 && b.legFromPrev) {
      const leg = document.createElement('li');
      leg.className = 'route__leg';
      leg.setAttribute('aria-hidden', 'true');
      leg.innerHTML = `
        <span class="route__leg-rail"></span>
        <span class="route__leg-time">🚗 ${esc(b.legFromPrev)}</span>
      `;
      ol.appendChild(leg);
    }

    const node = document.createElement('li');
    node.className = `route__node${open ? ' route__node--open' : ''}`;
    node.innerHTML = `
      <span class="route__dot">${i + 1}</span>
      <span class="route__body">
        <span class="route__place">${esc(b.ribbonLabel)}</span>
        <span class="route__sub">${esc(b.name)}</span>
      </span>
      <span class="route__nights">${esc(nights)}${open ? ' · still to pick' : ''}</span>
    `;
    ol.appendChild(node);
  });

  box.innerHTML = '';
  box.appendChild(ol);
}
