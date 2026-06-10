// ===========================================================================
// main.ts — renders the entire Austria 2026 brochure from src/trip.ts.
//
// What this is: the one renderer. Reads TRIP (single source of truth) and
//   builds all five guided blocks (cover → glance → days → sleep → practical).
// Why: spec rule A7 — zero hardcoded facts in HTML; everything flows from data.
// Notes: photos fail LOUD (a broken image shows a labeled placeholder, never a
//   silent gap — spec rule A11). The map is one lightweight Leaflet/OSM embed
//   with base pins only. A small floating 💬 button reuses src/supabase.ts.
// ===========================================================================

import type { Base, Day, DayBlock, Photo } from './trip.js';
import { TRIP } from './trip.js';
import { mountNotes } from './notes.js';
import { mountMap } from './map.js';

// --- tiny DOM helpers ------------------------------------------------------
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  html?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

const ICON: Record<DayBlock['icon'], string> = {
  drive: '🚗',
  activity: '🥾',
  sunset: '🌅',
  food: '🍽',
  stay: '🛏',
  time: '🕑',
};

// --- photo frame (fail-loud) ----------------------------------------------
function photoFrame(photo: Photo): HTMLElement {
  const frame = el('figure', 'photo-frame');
  const img = el('img');
  img.src = photo.src;
  img.alt = photo.alt;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', () => {
    // Fail loud: replace the broken image with a labeled placeholder.
    img.remove();
    const broken = el(
      'div',
      'photo-frame__broken',
      `⚠ photo failed to load<br><small>${esc(photo.label)}</small>`,
    );
    frame.prepend(broken);
  });
  frame.appendChild(img);
  frame.appendChild(el('figcaption', 'photo-frame__label', esc(photo.label)));
  return frame;
}

// =========================================================================
// 1. COVER
// =========================================================================
function renderCover(): HTMLElement {
  const m = TRIP.meta;
  const sec = el('section', 'cover');
  sec.id = 'cover';

  const img = el('img', 'cover__photo');
  img.src = m.heroPhoto.src;
  img.alt = m.heroPhoto.alt;
  sec.appendChild(img);

  sec.appendChild(el('span', 'cover__credit', esc(m.heroPhoto.credit)));

  const inner = el('div', 'cover__inner');
  inner.innerHTML = `
    <p class="cover__eyebrow">${esc(m.heroPhoto.label)}</p>
    <h1 class="cover__title">${esc(m.name)}</h1>
    <p class="cover__subtitle">${esc(m.subtitle)}</p>
    <div class="cover__meta">
      <span>📅 ${esc(m.dateRange)}</span>
      <span>👣 ${esc(m.travelers)}</span>
      <span>🌙 ${m.nights} nights</span>
    </div>
    <span class="cover__status">${esc(m.statusLine)}</span>
  `;
  sec.appendChild(inner);
  return sec;
}

// =========================================================================
// 2. AT A GLANCE — map + base strip
// =========================================================================
function renderGlance(): HTMLElement {
  const sec = el('section', 'section');
  sec.id = 'glance';
  sec.appendChild(el('p', 'section-eyebrow', 'The trip at a glance'));
  sec.appendChild(
    el('h2', 'section-title', `Four bases, three moves — ${TRIP.meta.nights} nights`),
  );

  const mapBox = el('div', 'glance__map');
  mapBox.id = 'route-map';
  sec.appendChild(mapBox);

  const strip = el('ul', 'glance__strip');
  TRIP.bases.forEach((b, i) => {
    const li = el('li', `glance__leg${b.status === 'open' ? ' glance__leg--open' : ''}`);
    li.innerHTML = `
      <span class="glance__leg-num">${i + 1}</span>
      <span>
        <span class="glance__leg-name">${esc(b.town)}</span>
        <span class="glance__leg-town"> · ${esc(b.name)}</span>
      </span>
      <span class="glance__leg-nights">${b.nights} ${b.nights === 1 ? 'night' : 'nights'}</span>
    `;
    strip.appendChild(li);
  });
  sec.appendChild(strip);
  return sec;
}

// =========================================================================
// 3. DAY BY DAY
// =========================================================================
function renderBlock(block: DayBlock): HTMLElement {
  const icon = ICON[block.icon];
  if (block.detail) {
    const d = el('details', 'block');
    d.innerHTML = `
      <summary>
        <span class="block__icon" aria-hidden="true">${icon}</span>
        <span class="block__line">${esc(block.line)}</span>
        <span class="block__chevron" aria-hidden="true">▾</span>
      </summary>
      <div class="block__detail">${esc(block.detail)}</div>
    `;
    return d;
  }
  const row = el('div', 'block block--plain');
  row.innerHTML = `
    <span class="block__icon" aria-hidden="true">${icon}</span>
    <span class="block__line">${esc(block.line)}</span>
  `;
  return row;
}

function renderDay(day: Day): HTMLElement {
  const art = el('article', 'day');
  art.id = day.id;

  const grid = el('div', 'day__grid');

  const head = el('div', 'day__head');
  head.innerHTML = `
    <span class="day__date">${esc(day.dateLabel)} · ${esc(day.dayOfWeek)}</span>
    <h3 class="day__title">${esc(day.title)}</h3>
    <span class="day__logistics">${esc(day.logistics)}</span>
  `;
  grid.appendChild(head);

  const left = el('div', 'day__media');
  left.appendChild(photoFrame(day.photo));
  grid.appendChild(left);

  const right = el('div', 'day__content');
  right.appendChild(el('p', 'day__tldr', esc(day.tldr)));
  const blocks = el('ul', 'day__blocks');
  day.blocks.forEach((b) => {
    const li = el('li');
    li.appendChild(renderBlock(b));
    blocks.appendChild(li);
  });
  right.appendChild(blocks);
  grid.appendChild(right);

  art.appendChild(grid);
  return art;
}

function renderDays(): HTMLElement {
  const sec = el('section', 'section');
  sec.id = 'days';
  sec.appendChild(el('p', 'section-eyebrow', 'Day by day'));
  sec.appendChild(el('h2', 'section-title', 'The week, one day at a time'));
  TRIP.days.forEach((d) => sec.appendChild(renderDay(d)));
  return sec;
}

// =========================================================================
// 4. WHERE WE SLEEP
// =========================================================================
function renderBase(base: Base): HTMLElement {
  const card = el('article', 'bed-card');
  card.appendChild(photoFrame(base.photo));

  const body = el('div', 'bed-card__body');
  const booked = base.status === 'booked';
  body.innerHTML = `
    <div class="bed-card__topline">
      <span class="bed-card__name">${esc(base.name)}</span>
      <span class="status-pill status-pill--${booked ? 'booked' : 'open'}">${
        booked ? 'Booked ✓' : 'Still to pick'
      }</span>
    </div>
    <p class="bed-card__town">${esc(base.town)}</p>
    <div class="chips">${base.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>
    <p class="bed-card__blurb">${esc(base.blurb)}</p>
    <p class="bed-card__dates">${esc(base.dateLabel)} · ${base.nights} ${
      base.nights === 1 ? 'night' : 'nights'
    }${booked ? ' · details on file' : ''}</p>
  `;
  card.appendChild(body);
  return card;
}

function renderSleep(): HTMLElement {
  const sec = el('section', 'section');
  sec.id = 'sleep';
  sec.appendChild(el('p', 'section-eyebrow', 'Where we sleep'));
  sec.appendChild(el('h2', 'section-title', 'Four bases'));
  const grid = el('div', 'beds');
  TRIP.bases.forEach((b) => grid.appendChild(renderBase(b)));
  sec.appendChild(grid);
  return sec;
}

// =========================================================================
// 5. OPEN DECISIONS + PRACTICAL
// =========================================================================
function renderPractical(): HTMLElement {
  const sec = el('section', 'section');
  sec.id = 'practical';
  sec.appendChild(el('p', 'section-eyebrow', 'Open decisions + practical'));
  sec.appendChild(el('h2', 'section-title', 'One thing left to decide'));

  const dec = TRIP.openDecision;
  const decBox = el('div', 'decision');
  decBox.innerHTML = `
    <p class="decision__ask">${esc(dec.ask)}</p>
    <p class="decision__lean">${esc(dec.leaning)}</p>
    <ul class="decision__opts">
      ${dec.options
        .map(
          (o) => `
        <li class="decision__opt${o.recommended ? ' decision__opt--rec' : ''}">
          <span class="decision__opt-mark" aria-hidden="true">${o.recommended ? '★' : '○'}</span>
          <span>
            <span class="decision__opt-name">${esc(o.name)}</span>
            <span class="decision__opt-note">${esc(o.note)}</span>
          </span>
        </li>`,
        )
        .join('')}
    </ul>
    <p class="decision__fresh">${esc(dec.freshness)}</p>
  `;
  sec.appendChild(decBox);

  // Costs — one headline number, no dashboard (spec).
  const c = TRIP.costs;
  const costs = el('div', 'costs');
  costs.innerHTML = `
    <div class="costs__num">${esc(c.headline)}</div>
    <p class="costs__approx">${esc(c.approx)}</p>
    <div class="costs__split">
      ${c.perPerson
        .map(
          (p) =>
            `<div class="costs__person"><b>${esc(p.amount)}</b>${esc(p.who)}<br><span>${esc(
              p.note,
            )}</span></div>`,
        )
        .join('')}
    </div>
    <p class="costs__basis">${esc(c.basis)}</p>
  `;
  sec.appendChild(costs);

  // Practical accordion.
  const practical = el('div', 'practical');
  TRIP.practical.forEach((p) => {
    const item = el('details', 'practical-item');
    item.innerHTML = `
      <summary>${esc(p.label)}<span aria-hidden="true">＋</span></summary>
      <div class="practical-item__body">${esc(p.body)}</div>
    `;
    practical.appendChild(item);
  });
  sec.appendChild(practical);

  return sec;
}

// =========================================================================
// boot
// =========================================================================
function boot(): void {
  const root = document.getElementById('brochure');
  if (!root) {
    // eslint-disable-next-line no-console
    console.error('Brochure mount point #brochure missing');
    return;
  }
  root.appendChild(renderCover());
  root.appendChild(renderGlance());
  root.appendChild(renderDays());
  root.appendChild(renderSleep());
  root.appendChild(renderPractical());

  mountMap('route-map', TRIP.bases);
  mountNotes();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
