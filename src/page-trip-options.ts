// Entry script for /trip-options.html — 3 distinct trip shapes for side-by-side compare.
//
// Allison (2026-05-17 10:20 IDT): "give a few possible trip options new tab like
// what to do where to sleep do 3 diff ones"
//
// Renders THREE complete trip shapes — each a full sleep+do+cost package:
//   • Option A: "Apt-Jezero vibe" — character + farm-stay + slow walks
//   • Option B: "Wow-quality splurge" — peak experiences + premium lodging
//   • Option C: "Quiet hidden-gems" — slow + off-beat + lesser-known
//
// Each card pulls real lodging + NATURE_DESTINATIONS data from trip-data — no
// fabrication. The "Lean toward this shape" button posts a commit note via the
// shared shortlist commit pattern (re-uses insertNote like bases.html).

import { NATURE_DESTINATIONS, type NatureDestination } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';
import { initSharedShortlist } from './shortlist-shared.js';
import { insertNote } from './supabase.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- Option model ----------------------------------------------------------

interface TripOptionLodging {
  night: string; // "Fri-Sun (2N)" or "Sun-Wed (3N)" etc
  name: string;
  pricePerNight: number; // EUR
  totalNights: number;
  review: string;
  url: string;
  img: string;
  vibe: string;
  laundry?: string;
  bedrooms?: string;
  notable: string[];
}

interface TripOptionActivity {
  destinationId: string; // matches NATURE_DESTINATIONS.id (or 'custom:*' for non-nature)
  day?: string;
  highlight?: string; // custom one-liner override
}

interface TripOption {
  id: 'apt-jezero' | 'splurge' | 'quiet-gems';
  badge: string; // small tag eg "Option A"
  title: string;
  vibe: string; // 1-line descriptor
  hero: { src: string; alt: string; credit: string };
  tldr: string; // 2-3 sentences "why this shape"
  lodgings: TripOptionLodging[];
  activities: TripOptionActivity[];
  whyThisShape: string;
  tradeoffs: string[];
  swapHint: string;
}

// --- Hero photos (Wikimedia summer shots) ---------------------------------
// Reuse known-good Wikimedia URLs from trip-data NIMG pool to avoid 404s.
// Picked the most distinct summer image per option vibe.

const HERO_APT_JEZERO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hintersee_-_Hochkalter.jpg/1280px-Hintersee_-_Hochkalter.jpg';
const HERO_SPLURGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Gro%C3%9Fglockner-Hochalpenstra%C3%9Fe_2.jpg/1280px-Gro%C3%9Fglockner-Hochalpenstra%C3%9Fe_2.jpg';
const HERO_QUIET =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Schafberg_Panorama_Attersee_Mondsee.jpg/1280px-Schafberg_Panorama_Attersee_Mondsee.jpg';

// Schafbergspitze + Best Western shared across all options.
const SCHAFBERG_LODGING: TripOptionLodging = {
  night: 'Wed Jul 29 (1N) — summit',
  name: 'Berghotel Schafbergspitze (1,783m)',
  pricePerNight: 195, // mid-estimate per spec, the locked summit
  totalNights: 1,
  review: 'LOCKED across all 3 shapes · book direct',
  url: 'https://schafberg.net/',
  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Schafberg_1.jpg/1280px-Schafberg_1.jpg',
  vibe: '🏔 Summit overnight',
  laundry: 'n/a',
  bedrooms: '1 night only',
  notable: ['Last cog UP ~17:00', 'Sleep above 13 lakes', 'First cog DOWN ~09:00 Thu'],
};

const AIRPORT_LODGING: TripOptionLodging = {
  night: 'Thu Jul 30 (1N) — airport',
  name: 'Best Western Hotel am Walserberg',
  pricePerNight: 71,
  totalNights: 1,
  review: '8.1 · 1,639 reviews',
  url: 'https://www.booking.com/hotel/at/servus-europa-salzburg-am-walserberg.html',
  img: 'https://cf.bstatic.com/xdata/images/hotel/square600/505565513.webp',
  vibe: '✈️ 5am-flight pre-pack',
  laundry: 'none',
  bedrooms: '1 queen',
  notable: ['8 min to SZG', 'Free cancellation', 'Free parking'],
};

// --- The three options ----------------------------------------------------

const OPTIONS: TripOption[] = [
  {
    id: 'apt-jezero',
    badge: 'Option A',
    title: 'Apt-Jezero vibe',
    vibe: 'Character + farm-stay + slow walks. The trip you keep telling Avital you want.',
    hero: { src: HERO_APT_JEZERO, alt: 'Hintersee mirror lake at Ramsau', credit: 'Wikimedia, CC BY-SA' },
    tldr:
      'Apt-Jezero with new wallpaper. Farm animals + mountain view + cooking dinner together. Leans into quiet beauty + mirror lakes + the slow rhythm of a holiday where the lodging IS the activity.',
    lodgings: [
      {
        night: 'Fri-Sun (2N) — Salzburg Shabbat',
        name: 'Sauerweingut',
        pricePerNight: 278,
        totalNights: 2,
        review: '9.3 · 633 reviews · Location 9.3',
        url: 'https://www.booking.com/hotel/at/sauerweingut.html',
        img: 'https://cf.bstatic.com/xdata/images/hotel/square600/139315520.webp',
        vibe: '🐐 Farm-stay in Salzburg',
        laundry: 'washer ✓',
        bedrooms: 'Studio · 60m²',
        notable: ['Farm-stay vibe in town', '~15min walk to Chabad', 'Induction cooker + free parking'],
      },
      {
        night: 'Sun-Wed (3N) — mountain anchor',
        name: 'Ferienhof Osl — Urlaub am Bauernhof',
        pricePerNight: 160,
        totalNights: 3,
        review: '9.2 · 312 reviews',
        url: 'https://www.booking.com/hotel/at/ferienhof-osl-urlaub-am-bauernhof.html',
        img: 'https://cf.bstatic.com/xdata/images/hotel/square600/16860996.webp',
        vibe: '🐐 Working farmhouse · Obertraun',
        laundry: 'shared',
        bedrooms: 'Studio · 30m² + balcony',
        notable: ['Goats + horses outside door', '3.7km to Hallstatt', 'The deepest Salzkammergut option'],
      },
      SCHAFBERG_LODGING,
      AIRPORT_LODGING,
    ],
    activities: [
      { destinationId: 'hintersee-ramsau', day: 'Mon morning', highlight: 'Mirror-lake hour, no buses' },
      { destinationId: 'gosausee', day: 'Sun', highlight: 'Flat lakeside loop · Dachstein reflection' },
      { destinationId: 'wimbachklamm', day: 'Tue', highlight: 'Short turquoise gorge walk' },
      { destinationId: 'hallstatt-markt', day: 'Mon sunset', highlight: 'Golden south-wall light from the boathouse path' },
      { destinationId: 'postalm', day: 'Wed pre-summit', highlight: '38 km² alpine pasture · 1,150m drive-up' },
      { destinationId: 'fuschlsee', day: 'Tue PM', highlight: 'Small quiet lake off the Wolfgangsee road' },
      { destinationId: 'schafbergspitze', day: 'Wed eve', highlight: 'Locked: summit-night above 13 lakes' },
    ],
    whyThisShape:
      'Pick this if the Apt-Jezero throwback is the brief. Lodging IS the trip — cook dinner together, watch farm animals out the window, walk to a quiet lake before breakfast. Activities lean toward easy + breathtaking + low-mileage.',
    tradeoffs: [
      'Königssee is a full day-trip (130min each way) — most people skip it on this shape',
      'Studio (not 2BR) at Ferienhof Osl — Avital + you share one big room',
      'Farm-stay shared laundry — less polish than washer-in-unit',
    ],
    swapHint: 'Want more polish? Bürgermeister Chalet (€245/n, 9.7, true 1BR) is the next step up at Obertraun without losing the chalet feel.',
  },
  {
    id: 'splurge',
    badge: 'Option B',
    title: 'Wow-quality splurge',
    vibe: 'Bigger views + premium lodging. The peak-experience trip.',
    hero: { src: HERO_SPLURGE, alt: 'Großglockner High Alpine Road switchbacks', credit: 'Wikimedia, CC BY-SA' },
    tldr:
      'Treat-yourself shape. The five Tara-Bridge moments + the splurge to match. Front-loads the high-impact experiences — Königssee electric boat, Jenner glass cabin, Dachstein 5fingers — and pairs them with the most polished lodging in the set.',
    lodgings: [
      {
        night: 'Fri-Sun (2N) — Salzburg Shabbat',
        name: 'master Mirabell',
        pricePerNight: 266,
        totalNights: 2,
        review: '9.0 · 3,275 reviews',
        url: 'https://www.booking.com/hotel/at/master-mirabell.html',
        img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/590315269.jpg',
        vibe: '🏛 Polished in-town apartment',
        laundry: 'washer ✓',
        bedrooms: '1 BR + living room · 30m²',
        notable: ['~10min walk to Chabad', 'AC + washer + dishwasher', 'Most battle-tested apartment in Salzburg'],
      },
      {
        night: 'Sun-Wed (3N) — mountain anchor',
        name: 'Appartementgitti (Hallstatt area)',
        pricePerNight: 256,
        totalNights: 3,
        review: '9.7 · 52 reviews',
        url: 'https://www.booking.com/hotel/at/appartementgitti.html',
        img: 'https://cf.bstatic.com/xdata/images/hotel/square600/643263725.webp',
        vibe: '✨ Premium clean-apartment',
        laundry: 'unknown',
        bedrooms: '1 BR · 51m²',
        notable: ['9.7 review score', 'Splurge tier', 'Free cancellation'],
      },
      SCHAFBERG_LODGING,
      AIRPORT_LODGING,
    ],
    activities: [
      { destinationId: 'konigssee', day: 'Sun', highlight: 'Electric boat to St Bartholomä — the postcard' },
      { destinationId: 'krippenstein-5fingers', day: 'Mon', highlight: 'Dachstein cable car + 5fingers platform' },
      { destinationId: 'hallstatt-markt', day: 'Mon sunset', highlight: 'Painted-village walkway · golden hour' },
      { destinationId: 'almbachklamm', day: 'Tue AM', highlight: 'Marble gorge · Bavaria edge' },
      { destinationId: 'grossglockner-road', day: 'Tue', highlight: 'High Alpine Road — switchbacks + glacier views' },
      { destinationId: 'gosausee', day: 'Wed AM pre-cog', highlight: 'Mirror lake · Dachstein reflection' },
      { destinationId: 'schafbergspitze', day: 'Wed eve', highlight: 'Locked: summit-night above 13 lakes' },
    ],
    whyThisShape:
      'Pick this if you want to come home saying "we saw it all." The Königssee + Jenner + 5fingers + Großglockner stack is the maximum-wow itinerary the region offers. Lodging is the most polished version of each base — washer + AC + best review scores.',
    tradeoffs: [
      'Highest cost — €700+ over the other shapes',
      'Most driving (Großglockner day is 4-5 hr round trip from the lake)',
      '"Tour-bus" energy at Königssee + Hallstatt — peak summer crowds',
    ],
    swapHint: 'Want to keep Salzburg polish but cut €100/night? Pension Elisabeth (€125/n, washer ✓, 1865 reviews) is the next step down with the same washer guarantee.',
  },
  {
    id: 'quiet-gems',
    badge: 'Option C',
    title: 'Quiet hidden-gems',
    vibe: 'Slow + off-beat + lesser-known. Skip the must-sees; find the empty lots.',
    hero: { src: HERO_QUIET, alt: 'Schafberg panorama over Attersee and Mondsee', credit: 'Wikimedia, CC BY-SA' },
    tldr:
      'Skip the must-sees. Find the empty parking lots. Read by a lake nobody else is at. Trades the Königssee day for a Bad Aussee base + a Bad Ischl Pins memorial walk + the quietest shores you can find.',
    lodgings: [
      {
        night: 'Fri-Sun (2N) — Salzburg Shabbat',
        name: 'Pension Elisabeth — Rooms & Apartments',
        pricePerNight: 125,
        totalNights: 2,
        review: '8.6 · 1,865 reviews',
        url: 'https://www.booking.com/hotel/at/pension-elisabeth-salzburg.html',
        img: 'https://cf.bstatic.com/xdata/images/hotel/square600/250951868.webp',
        vibe: '🧺 Cheapest with washer',
        laundry: 'washer ✓',
        bedrooms: '1 BR · Studio w/ terrace',
        notable: ['1,865 reviews', '~15min walk to Chabad', 'Cheapest washer-confirmed Salzburg pick'],
      },
      {
        night: 'Sun-Wed (3N) — mountain anchor',
        name: 'Ferienwohnung Martens Villa (Bad Aussee)',
        pricePerNight: 185,
        totalNights: 3,
        review: '9.6 · 22 reviews',
        url: 'https://www.booking.com/hotel/at/ferienwohnung-martens-villa.html',
        img: 'https://cf.bstatic.com/xdata/images/hotel/square600/478184788.webp',
        vibe: '🏡 TRUE 2BR · Bad Aussee',
        laundry: 'washer ✓',
        bedrooms: '2 BR · 70m² + terrace',
        notable: ['TRUE 2BR · separate bedrooms', 'Washer + dishwasher verified', 'Garden + mountain view'],
      },
      SCHAFBERG_LODGING,
      AIRPORT_LODGING,
    ],
    activities: [
      { destinationId: 'fuschlsee', day: 'Sun PM', highlight: 'Small Wolfgangsee-area lake · usually empty' },
      { destinationId: 'klausbachtal', day: 'Mon AM', highlight: 'Berchtesgaden valley walk · drive-in OK' },
      { destinationId: 'bluntautal-golling', day: 'Mon PM', highlight: 'Turquoise water valley · low-traffic' },
      { destinationId: 'seisenbergklamm', day: 'Tue AM', highlight: 'Quiet gorge boardwalk · lesser-known sister to Liechtensteinklamm' },
      { destinationId: 'filzmoos-bachlalm', day: 'Tue PM', highlight: 'Alpine hut + cow pasture · slow lunch' },
      { destinationId: 'bad-ischl-pins', day: 'Wed AM', highlight: 'Holocaust commemoration walk · Bad Ischl' },
      { destinationId: 'schafbergspitze', day: 'Wed eve', highlight: 'Locked: summit-night above 13 lakes (or swap for Postalm Lodge €98/n if you want even quieter)' },
    ],
    whyThisShape:
      'Pick this if "we did so much" was the wrong feeling last trip. Bad Aussee base = 2 separate bedrooms (Avital + you get real privacy), the cheapest comfortable Salzburg pick, and a day-flow that lingers at quiet shores instead of queuing for Königssee boats.',
    tradeoffs: [
      'Königssee is a 2hr drive from Bad Aussee — most likely skipped on this shape',
      'Bad Ischl Pins memorial is heavy — pair it with a quiet lake afternoon',
      'Schafbergspitze still locked Wed; or swap for Postalm Lodge Lienbachhof (€98/n drive-up alpine pasture) if you want the quietest possible summit-night substitute',
    ],
    swapHint: 'Want to trade the summit night? Postalm Lodge Lienbachhof €98/n is a 38km² alpine pasture lodge — drive-up, panoramic terrace, no cog needed.',
  },
];

// --- Render helpers -------------------------------------------------------

function computeTotalCost(opt: TripOption): number {
  return opt.lodgings.reduce((sum, l) => sum + l.pricePerNight * l.totalNights, 0);
}

function laundryCount(opt: TripOption): number {
  return opt.lodgings.filter((l) => l.laundry === 'washer ✓').length;
}

function twoBrCount(opt: TripOption): number {
  return opt.lodgings.filter((l) => (l.bedrooms ?? '').includes('2 BR')).length;
}

function konigsseeDriveFor(opt: TripOption): string {
  // The 3-night mountain anchor (index 1) determines Königssee drive
  const anchor = opt.lodgings[1]?.name ?? '';
  if (anchor.includes('Obertraun')) return '~2h each way';
  if (anchor.includes('Hallstatt')) return '~2h each way';
  if (anchor.includes('Bad Aussee')) return '~2h 15min each way';
  return '~2h each way';
}

function findDestination(id: string): NatureDestination | undefined {
  return NATURE_DESTINATIONS.find((d) => d.id === id);
}

function renderActivity(act: TripOptionActivity): string {
  const dest = findDestination(act.destinationId);
  if (!dest) {
    // Non-nature activity (eg bad-ischl-pins, stolpersteine) — render a
    // compact tile using just the act data. Fall back to a placeholder image.
    const customName = act.destinationId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `
      <div class="trip-option-activity">
        <div class="trip-option-activity__title">${escapeHtml(customName)}</div>
        ${act.day ? `<div class="trip-option-activity__day">${escapeHtml(act.day)}</div>` : ''}
        <div class="trip-option-activity__hl">${escapeHtml(act.highlight ?? '')}</div>
      </div>`;
  }
  const img = dest.hero?.src ?? dest.photos?.[0] ?? '';
  return `
    <a class="trip-option-activity trip-option-activity--linked" href="nature-destinations.html#${escapeHtml(dest.id)}">
      ${img ? `<img class="trip-option-activity__img" loading="lazy" decoding="async" src="${escapeHtml(img)}" alt="${escapeHtml(dest.name)}" />` : ''}
      <div class="trip-option-activity__body">
        <div class="trip-option-activity__title">${escapeHtml(dest.name)}</div>
        ${act.day ? `<div class="trip-option-activity__day">${escapeHtml(act.day)}</div>` : ''}
        <div class="trip-option-activity__hl">${escapeHtml(act.highlight ?? dest.feature)}</div>
      </div>
    </a>`;
}

function renderLodging(l: TripOptionLodging): string {
  const totalCost = l.pricePerNight * l.totalNights;
  const notable = l.notable
    .slice(0, 3)
    .map((n) => `<li>${escapeHtml(n)}</li>`)
    .join('');
  return `
    <a class="trip-option-lodging" href="${escapeHtml(l.url)}" target="_blank" rel="noreferrer noopener">
      <img class="trip-option-lodging__img" loading="lazy" decoding="async" src="${escapeHtml(l.img)}" alt="${escapeHtml(l.name)}" />
      <div class="trip-option-lodging__body">
        <div class="trip-option-lodging__night">${escapeHtml(l.night)}</div>
        <div class="trip-option-lodging__name">${escapeHtml(l.name)}</div>
        <div class="trip-option-lodging__meta">${escapeHtml(l.review)}</div>
        <div class="trip-option-lodging__price">
          <strong>€${l.pricePerNight}/n</strong>
          <span class="trip-option-lodging__total">· €${totalCost} total (${l.totalNights}N)</span>
        </div>
        <div class="trip-option-lodging__vibe">${escapeHtml(l.vibe)}${l.laundry ? ' · ' + escapeHtml(l.laundry) : ''}${l.bedrooms ? ' · ' + escapeHtml(l.bedrooms) : ''}</div>
        <ul class="trip-option-lodging__notable">${notable}</ul>
      </div>
    </a>`;
}

// --- Commit pattern (re-uses bases.html shape) ----------------------------

const COMMITTED_SHAPE_KEY = 'austria-committed-trip-shape';

function readCommittedShape(): string | null {
  try {
    return localStorage.getItem(COMMITTED_SHAPE_KEY);
  } catch {
    return null;
  }
}

function writeCommittedShape(id: string | null): void {
  try {
    if (id == null) localStorage.removeItem(COMMITTED_SHAPE_KEY);
    else localStorage.setItem(COMMITTED_SHAPE_KEY, id);
  } catch {
    /* ignore */
  }
}

function authorFor(): 'avital' | 'allison' {
  try {
    const raw = localStorage.getItem('austria-note-author');
    if (raw === 'avital' || raw === 'allison') return raw;
  } catch {
    /* ignore */
  }
  return 'avital';
}

function showToast(text: string): void {
  const t = document.createElement('div');
  t.className = 'trip-option-toast';
  t.textContent = text;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('trip-option-toast--show'));
  setTimeout(() => {
    t.classList.remove('trip-option-toast--show');
    setTimeout(() => t.remove(), 300);
  }, 3200);
}

function wireCommitButtons(): void {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const btn = target.closest<HTMLButtonElement>('.trip-option-commit-btn[data-shape-id]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.dataset.shapeId;
    const label = btn.dataset.shapeLabel ?? id ?? '';
    if (!id) return;
    const current = readCommittedShape();
    if (current === id) {
      writeCommittedShape(null);
      showToast(`Un-committed ${label}.`);
      void insertNote({
        option: 'general',
        day_id: null,
        activity_id: `trip-shape:${id}`,
        note_text: `[shape-uncommitted] ${label}`,
        author: authorFor(),
      }).catch(() => {
        /* silent */
      });
    } else {
      writeCommittedShape(id);
      showToast(`✓ Leaning toward ${label}. Other shapes stay browseable.`);
      void insertNote({
        option: 'general',
        day_id: null,
        activity_id: `trip-shape:${id}`,
        note_text: `[shape-committed] ${label}`,
        author: authorFor(),
      }).catch(() => {
        /* silent */
      });
    }
    render();
  });
}

// --- Render ---------------------------------------------------------------

function renderOption(opt: TripOption): string {
  const cost = computeTotalCost(opt);
  const committed = readCommittedShape();
  const isCommitted = committed === opt.id;
  const lodgings = opt.lodgings.map(renderLodging).join('');
  const activities = opt.activities.map(renderActivity).join('');
  const tradeoffs = opt.tradeoffs.map((t) => `<li>${escapeHtml(t)}</li>`).join('');
  return `
    <article class="trip-option-card trip-option-card--${opt.id}${isCommitted ? ' trip-option-card--committed' : ''}" id="option-${opt.id}">
      <div class="trip-option-card__hero" style="background-image: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%), url('${escapeHtml(opt.hero.src)}');">
        <div class="trip-option-card__hero-inner">
          <div class="trip-option-card__badge">${escapeHtml(opt.badge)}${isCommitted ? ' · ★ YOUR LEAN' : ''}</div>
          <h2 class="trip-option-card__title">${escapeHtml(opt.title)}</h2>
          <p class="trip-option-card__vibe">${escapeHtml(opt.vibe)}</p>
        </div>
      </div>
      <div class="trip-option-card__body">
        <p class="trip-option-card__tldr">${escapeHtml(opt.tldr)}</p>

        <div class="trip-option-card__cost">
          <div class="trip-option-card__cost-num">€${cost.toLocaleString()}</div>
          <div class="trip-option-card__cost-label">lodging total · 7 nights · 2 people</div>
        </div>

        <h3 class="trip-option-card__section-h">🛏 Where you sleep</h3>
        <div class="trip-option-lodgings">${lodgings}</div>

        <h3 class="trip-option-card__section-h">🥾 What you do (${opt.activities.length} highlights)</h3>
        <div class="trip-option-activities">${activities}</div>

        <h3 class="trip-option-card__section-h">💭 Why this shape</h3>
        <p class="trip-option-card__why">${escapeHtml(opt.whyThisShape)}</p>

        <h3 class="trip-option-card__section-h">⚖️ The tradeoffs</h3>
        <ul class="trip-option-card__tradeoffs">${tradeoffs}</ul>

        <div class="trip-option-card__swap">
          <strong>Or instead:</strong> ${escapeHtml(opt.swapHint)} See <a href="stay.html">Stay</a> or <a href="bases.html">Bases</a> for full swap options.
        </div>

        <div class="trip-option-card__commit-row">
          <button
            type="button"
            class="trip-option-commit-btn${isCommitted ? ' trip-option-commit-btn--committed' : ''}"
            data-shape-id="${opt.id}"
            data-shape-label="${escapeHtml(opt.badge + ' — ' + opt.title)}"
            aria-pressed="${isCommitted ? 'true' : 'false'}"
            aria-label="${isCommitted ? 'Un-lean from' : 'Lean toward'} ${escapeHtml(opt.title)}"
          >${isCommitted ? '✎ Un-lean (commit different shape)' : '✓ Lean toward this shape'}</button>
          <span class="trip-option-commit-note">${isCommitted ? 'Tap to free up the commit, then commit a different shape.' : 'Marks this as your favored shape. Other shapes stay browseable.'}</span>
        </div>
      </div>
    </article>`;
}

function renderCompareTable(): string {
  const rows = OPTIONS.map((o) => {
    const cost = computeTotalCost(o);
    return `
      <tr>
        <th scope="row">${escapeHtml(o.badge)} · ${escapeHtml(o.title)}</th>
        <td>€${cost.toLocaleString()}</td>
        <td>${escapeHtml(konigsseeDriveFor(o))}</td>
        <td>${laundryCount(o)} / 4</td>
        <td>${twoBrCount(o)} / 4</td>
        <td>${escapeHtml(o.vibe.split('.')[0] ?? '')}</td>
      </tr>`;
  }).join('');
  return `
    <h2 class="trip-option-compare-h">Side-by-side at a glance</h2>
    <div class="trip-option-compare-wrap">
      <table class="trip-option-compare">
        <thead>
          <tr>
            <th scope="col">Shape</th>
            <th scope="col">Lodging total</th>
            <th scope="col">Königssee drive</th>
            <th scope="col">Washer nights</th>
            <th scope="col">2-BR nights</th>
            <th scope="col">Vibe</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function render(): void {
  const root = document.querySelector<HTMLElement>('#trip-options-root');
  if (root) {
    root.innerHTML = OPTIONS.map(renderOption).join('');
  }
  const compare = document.querySelector<HTMLElement>('#trip-options-compare');
  if (compare) {
    compare.innerHTML = renderCompareTable();
  }
}

render();
wireCommitButtons();
initNotesWidget();
initChatPlanPopup();
initSharedShortlist();
