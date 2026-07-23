// ===========================================================================
// gallery.ts — renders gallery.html: WOW — the by-pictures page.
//
// Why (Allison, 23 Jul 23:25): "by area just put pictures, cool pictures that
//   we can click on and see more — like if we see the picture and we're like
//   WOW what is that, then we click and it takes us there."
//
// Rules it follows:
//   • Only REAL photographs (the Wikimedia ones already verified for the
//     original cards). The researched additions carry honest category tiles,
//     not photos — a tile can't make anyone say wow, so they are not here.
//     Their cards remain one tap away on The Plan.
//   • Grouped by the three REGIONS (the overview's lesson), in trip order.
//   • Tap a photo → that thing's full card. The photo is the question,
//     the card is the answer.
//   • Lifetime picks carry the ⭐. Lazy-loaded — 30+ images on hotel wifi.
// ===========================================================================

import { ACTIVITIES } from './plan-data.js';
import { TABLE_ROWS } from './table-data.js';
import { mountNav } from './nav.js';
import { mountNotes } from './notes.js';

const REGION_OF_BED = [
  'Salzkammergut',
  'Zell am See & the Hohe Tauern',
  'Salzkammergut',
  'Salzburg & Berchtesgaden',
];
const REGION_ORDER = ['Salzkammergut', 'Zell am See & the Hohe Tauern', 'Salzburg & Berchtesgaden'];

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function regionFor(id: string): string {
  const t = TABLE_ROWS[id];
  if (!t) return REGION_ORDER[0];
  let best = 0;
  t.fromBase.forEach((m, i) => {
    if (m < t.fromBase[best]) best = i;
  });
  return REGION_OF_BED[best];
}

function render(): void {
  const root = document.getElementById('gallery');
  if (!root) return;

  const head = el('header', 'gwhead');
  head.appendChild(el('p', 'gwkick', 'see it, want it, tap it'));
  head.appendChild(el('h1', undefined, 'Wow'));
  head.appendChild(
    el(
      'p',
      'gwlede',
      'Just the pictures, by area. Tap any one and it takes you to the thing itself.',
    ),
  );
  root.appendChild(head);

  // Real photographs only — an honest category tile can't earn a wow.
  const withPhotos = ACTIVITIES.filter((a) => a.photo.includes('wikimedia'));

  for (const region of REGION_ORDER) {
    const mine = withPhotos.filter((a) => regionFor(a.id) === region);
    if (mine.length === 0) continue;
    // Stars first inside each region — the must-sees surface before the rest.
    mine.sort((x, y) => Number(Boolean(y.star)) - Number(Boolean(x.star)));

    const sec = el('section', 'gwsec');
    sec.appendChild(el('h2', 'gwsec-h', region));
    const grid = el('div', 'gwgrid');
    for (const a of mine) {
      const card = el('a', 'gwcard');
      card.href = `plan.html#${a.id}`;
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = a.photo;
      img.alt = a.name;
      // A photo that fails to load says nothing — remove the card rather than
      // showing a broken rectangle pretending to be a wow.
      img.addEventListener('error', () => card.remove());
      card.appendChild(img);
      const label = el('span', 'gwlabel');
      label.innerHTML = `${a.star ? '⭐ ' : ''}${a.emoji} ${a.name}`;
      card.appendChild(label);
      grid.appendChild(card);
    }
    sec.appendChild(grid);
    root.appendChild(sec);
  }

  const foot = document.getElementById('gw-foot');
  if (foot) {
    foot.innerHTML =
      'photos: Wikimedia Commons, already verified per card · <a href="plan.html">every option with the logistics →</a>';
  }
}

mountNav();
render();
mountNotes();
