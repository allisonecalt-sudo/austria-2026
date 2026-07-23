// ===========================================================================
// main.ts — renders the entire Austria 2026 brochure from src/trip.ts.
//
// What this is: the one renderer. Reads TRIP (single source of truth) and
//   builds all five guided blocks (cover → glance → days → sleep → practical).
// Why: spec rule A7 — zero hardcoded facts in HTML; everything flows from data.
// Notes: photos fail LOUD (a broken image shows a labeled placeholder, never a
//   silent gap — spec rule A11). The glance block draws a custom ROUTE RIBBON
//   (no Leaflet, no tiles — DELTA 1). Every named place carries 📍 Navigate +
//   ↗ Website (DELTA 2). A small floating 💬 button reuses src/supabase.ts.
// ===========================================================================

import type { Base, Day, DayBlock, DayShape, KitGroup, PlaceLinks, Photo } from './trip.js';
import { TRIP, mapsUrl } from './trip.js';
import { mountNotes } from './notes.js';
import { mountRoute } from './route.js';
import { mountNav } from './nav.js';

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

// --- place links: 📍 Navigate + ↗ Website (spec A9b / DELTA 2) --------------
// ONE predictable position, always last. `maps` is always built; `website`
// renders only when a trustworthy URL exists (omitted, never invented).
function linksHtml(name: string, links: PlaceLinks): string {
  const nav = `<a class="lnk lnk--map" href="${esc(mapsUrl(links.query))}" target="_blank" rel="noopener" aria-label="Navigate to ${esc(
    name,
  )}">📍 Navigate</a>`;
  const web = links.website
    ? `<a class="lnk lnk--web" href="${esc(links.website)}" target="_blank" rel="noopener" aria-label="Website for ${esc(
        name,
      )}">↗ Website</a>`
    : '';
  return `<span class="lnks">${nav}${web}</span>`;
}

// --- photo frame (fail-loud) ----------------------------------------------
// Photos EAGER-load (DELTA / photo fix): loading="lazy" let full-page
// screenshots capture empty frames before the image arrived (the old site's
// #1 failure). There are only ~12 small Wikimedia thumbs, so eager is cheap and
// guarantees every frame either shows its photo or the fail-loud placeholder.
function photoFrame(photo: Photo): HTMLElement {
  const frame = el('figure', 'photo-frame');
  const img = el('img');
  img.src = photo.src;
  img.alt = photo.alt;
  img.loading = 'eager';
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
// 2. AT A GLANCE — route ribbon (DELTA 1: replaces the Leaflet map)
// =========================================================================
function renderGlance(): HTMLElement {
  const sec = el('section', 'section');
  sec.id = 'glance';
  sec.appendChild(el('p', 'section-eyebrow', 'The trip at a glance'));
  sec.appendChild(
    el('h2', 'section-title', `Four bases, three moves — ${TRIP.meta.nights} nights`),
  );

  // The drawn route ribbon — pure HTML/CSS, no map tiles (mounted in boot()).
  const ribbon = el('div', 'glance__ribbon');
  ribbon.id = 'route-ribbon';
  sec.appendChild(ribbon);

  return sec;
}

// =========================================================================
// 3. DAY BY DAY
// =========================================================================
function renderBlock(block: DayBlock): HTMLElement {
  const icon = ICON[block.icon];
  // Drive time rides ON the line (DELTA 4): "· 25 min from base".
  const drive = block.driveFromBase
    ? `<span class="block__drive">· ${esc(block.driveFromBase)}</span>`
    : '';
  const lineHtml = `<span class="block__line">${esc(block.line)}${drive}</span>`;

  // A block expands if it has a detail OR a named place (place links go LAST,
  // inside the detail, in one predictable spot — spec A9b / DELTA 2).
  if (block.detail || block.place) {
    const d = el('details', 'block');
    const detailText = block.detail ? `<p class="block__text">${esc(block.detail)}</p>` : '';
    const placeLinks = block.place ? linksHtml(block.place.name, block.place.links) : '';
    d.innerHTML = `
      <summary>
        <span class="block__icon" aria-hidden="true">${icon}</span>
        ${lineHtml}
        <span class="block__chevron" aria-hidden="true">▾</span>
      </summary>
      <div class="block__detail">${detailText}${placeLinks}</div>
    `;
    return d;
  }
  const row = el('div', 'block block--plain');
  row.innerHTML = `
    <span class="block__icon" aria-hidden="true">${icon}</span>
    ${lineHtml}
  `;
  return row;
}

// --- day-shape options (DELTA 3) -------------------------------------------
// Renders 2–3 fully-formed day shapes for a free day. Each shape is a calm,
// pickable mini-plan; each stop is a named place with its drive time, tap to
// expand for detail + the 📍/↗ links.
function renderShapes(shapes: DayShape[]): HTMLElement {
  const wrap = el('div', 'shapes');
  wrap.appendChild(
    el(
      'p',
      'shapes__lead',
      'A day from here could look like one of these — recommendations, not orders:',
    ),
  );

  shapes.forEach((shape) => {
    const card = el('details', 'shape');
    const stops = shape.stops
      .map((s) => {
        const driveHtml = s.drive ? `<span class="shape__drive">${esc(s.drive)}</span>` : '';
        const detailText = s.detail ? `<p class="shape__text">${esc(s.detail)}</p>` : '';
        const placeLinks = s.links ? linksHtml(s.place, s.links) : '';
        const body =
          detailText || placeLinks
            ? `<div class="shape__detail">${detailText}${placeLinks}</div>`
            : '';
        return `
          <li class="shape__stop">
            <span class="shape__when">${esc(s.when)}</span>
            <span class="shape__stopbody">
              <span class="shape__place">${esc(s.place)}${s.drive ? ` <span class="shape__divider">·</span> ${driveHtml}` : ''}</span>
              <span class="shape__line">${esc(s.line)}</span>
              ${body}
            </span>
          </li>`;
      })
      .join('');
    card.innerHTML = `
      <summary>
        <span class="shape__name">${esc(shape.name)}</span>
        <span class="shape__summary">${esc(shape.summary)}</span>
        <span class="block__chevron" aria-hidden="true">▾</span>
      </summary>
      <ol class="shape__stops">${stops}</ol>
    `;
    wrap.appendChild(card);
  });
  return wrap;
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

  // Free-day day-shape options render right under the blocks (DELTA 3).
  if (day.shapes && day.shapes.length > 0) {
    right.appendChild(renderShapes(day.shapes));
  }

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
  // Scan layer always visible (name + status + chips); the blurb + 📍/↗ links
  // live in the tap-to-expand detail (spec A9b: lodging links in expanded view).
  body.innerHTML = `
    <div class="bed-card__topline">
      <span class="bed-card__name">${esc(base.name)}</span>
      <span class="status-pill status-pill--${booked ? 'booked' : 'open'}">${
        booked ? 'Booked ✓' : 'Still to pick'
      }</span>
    </div>
    <p class="bed-card__town">${esc(base.town)}</p>
    <div class="chips">${base.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>
    <p class="bed-card__dates">${esc(base.dateLabel)} · ${base.nights} ${
      base.nights === 1 ? 'night' : 'nights'
    }${booked ? ' · details on file' : ''}</p>
    <details class="bed-card__more">
      <summary>Details + links <span class="block__chevron" aria-hidden="true">▾</span></summary>
      <div class="bed-card__detail">
        <p class="bed-card__blurb">${esc(base.blurb)}</p>
        ${linksHtml(base.name, base.links)}
      </div>
    </details>
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
// 5. PRACTICAL — costs, essentials, on-trip kit
// =========================================================================
function renderPractical(): HTMLElement {
  const sec = el('section', 'section');
  sec.id = 'practical';
  sec.appendChild(el('p', 'section-eyebrow', 'The essentials'));
  sec.appendChild(el('h2', 'section-title', 'Everything’s booked'));

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

  // On-trip kit — every place, grouped by base, name · 📍 · ↗ (spec A9b).
  practical.appendChild(renderKit(TRIP.kit));

  sec.appendChild(practical);

  return sec;
}

// --- On-trip kit (DELTA 2) -------------------------------------------------
// One collapsible: every place of the trip, one line each, grouped by base —
// so mid-trip nothing needs hunting for a pin or a booking page.
function renderKit(groups: KitGroup[]): HTMLElement {
  const item = el('details', 'practical-item kit');
  const groupsHtml = groups
    .map((g) => {
      const rows = g.places
        .map(
          (p) => `
        <li class="kit__row">
          <span class="kit__place">${esc(p.name)}</span>
          ${linksHtml(p.name, p.links)}
        </li>`,
        )
        .join('');
      return `
        <div class="kit__group">
          <p class="kit__base">${esc(g.base)}</p>
          <ul class="kit__list">${rows}</ul>
        </div>`;
    })
    .join('');
  item.innerHTML = `
    <summary>On-trip kit — every pin + booking link<span aria-hidden="true">＋</span></summary>
    <div class="practical-item__body kit__body">
      <p class="kit__lead">Every place of the trip in one spot — tap 📍 to navigate, ↗ for the booking/official page.</p>
      ${groupsHtml}
    </div>
  `;
  return item;
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

  mountRoute('route-ribbon', TRIP.bases);
  mountNotes();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

mountNav();
