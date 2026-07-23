// ===========================================================================
// hub.ts — renders hub.html: the ONE-STOP LANDING ZONE for the trip.
//
// Why this page exists (Allison, Jul 23 2026, verbatim): "want to have one
//   singular place that we can use while we on the trip and to manage all of
//   like these actions... it has to be very user friendly that you can like
//   navigate to the part that you want to navigate to and then based on that
//   navigation you in that section and that consolidated enough that we don't
//   have to jump between all of the different apps... goal is organized
//   clear, mobile friendly... like one stop shop for austria."
//
// Shape: NOT another wall of links. Four groups, big thumb-sized tiles, each
//   with one line saying what it is FOR — so the question "where do I tap"
//   has an obvious answer while standing in a supermarket aisle.
// Live numbers on the tiles (shopping count, picks count) come from Supabase
//   after paint — the page must be useful before the network answers.
// Mobile is the only surface that matters here; desktop just gets wider tiles.
// ===========================================================================

import { DAYS } from './plan-data.js';
import { allFavIds, loadFavs } from './favs.js';
import { listGroceries } from './supabase.js';

interface Tile {
  href: string;
  emoji: string;
  title: string;
  what: string;
  /** id of the badge span, filled in later from live data */
  badge?: string;
}

interface Group {
  title: string;
  tiles: Tile[];
}

// Which bed each night, and which day of the plan it is. One table, so the
// "tonight" strip can never disagree with the itinerary.
const NIGHTS: { date: string; bed: string; dayId: string }[] = [
  { date: '2026-07-24', bed: 'Bad Goisern', dayId: 'fri24' },
  { date: '2026-07-25', bed: 'Bad Goisern', dayId: 'shabbat' },
  { date: '2026-07-26', bed: 'Zell am See', dayId: 'sun26' },
  { date: '2026-07-27', bed: 'Zell am See', dayId: 'mon27' },
  { date: '2026-07-28', bed: 'Gosau', dayId: 'tue28' },
  { date: '2026-07-29', bed: 'Gosau', dayId: 'wed29' },
  { date: '2026-07-30', bed: 'Wals (by the airport)', dayId: 'thu30' },
];

const GROUPS: Group[] = [
  {
    title: 'Today',
    tiles: [
      {
        href: 'plan.html',
        emoji: '🗺',
        title: 'The Plan',
        what: 'Every option, day by day, with the logistics',
      },
      {
        href: 'favorites.html',
        emoji: '❤️',
        title: 'Our picks',
        what: 'Only what you hearted — as a table you can compare',
        badge: 'b-picks',
      },
      {
        href: 'bases.html',
        emoji: '🛏',
        title: 'From your bed',
        what: "What's close to wherever you woke up",
      },
      {
        href: 'rain.html',
        emoji: '☂',
        title: 'Rainy day',
        what: 'What still works when it pours',
      },
    ],
  },
  {
    title: 'Food',
    tiles: [
      {
        href: 'groceries.html',
        emoji: '🛒',
        title: 'Shopping list',
        what: 'Add, tick off, clear — shared, saves instantly',
        badge: 'b-shop',
      },
      {
        href: 'certified.html',
        emoji: '✅',
        title: 'Certified kosher',
        what: 'The easy path — products with a hechsher',
      },
      {
        href: 'kosher.html',
        emoji: '✡️',
        title: 'Kosher field guide',
        what: 'How to read an Austrian label',
      },
      {
        href: 'shop.html',
        emoji: '🔍',
        title: 'By ingredient',
        what: 'Shop by sight — the product photo grid',
      },
    ],
  },
  {
    title: 'Practical',
    tiles: [
      {
        href: 'info.html',
        emoji: '🔑',
        title: 'Trip info',
        what: 'Bookings, car, flights — behind your login',
      },
    ],
  },
  {
    title: 'Deciding',
    tiles: [
      {
        href: 'rank.html',
        emoji: '⭐',
        title: 'Rank it',
        what: 'Give hearts, let the order settle itself',
      },
      {
        href: 'claude.html',
        emoji: '💙',
        title: "Claude's pick",
        what: 'The week I would give you, if you want it decided',
      },
      {
        href: 'index.html',
        emoji: '📖',
        title: 'The brochure',
        what: 'The whole trip top to bottom — beds, days, notes',
      },
    ],
  },
];

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

/** Today, in Austria's timezone terms — good enough: the trip is one zone. */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function whereTonight(): { bed: string; day: string } | null {
  const night = NIGHTS.find((n) => n.date === todayISO());
  if (!night) return null;
  return { bed: night.bed, day: DAYS.find((d) => d.id === night.dayId)?.title ?? '' };
}

function render(): void {
  const root = document.getElementById('hub');
  if (!root) return;

  const wrap = el('div', 'hubwrap');

  const head = el('header', 'hubhead');
  head.appendChild(el('p', 'hubkick', 'Allison + Avital · 24–31 July 2026'));
  head.appendChild(el('h1', undefined, 'Austria'));

  // The one live line: where you are sleeping tonight, if the trip is on.
  const now = whereTonight();
  const strip = el('p', 'hubnow');
  if (now) {
    strip.innerHTML = `🛏 Tonight you sleep in <b>${now.bed}</b>${now.day ? ` · ${now.day}` : ''}`;
  } else {
    strip.innerHTML = '🛫 <b>Fri 24 Jul</b> — LY5193 departs 05:00, lands Salzburg 07:50';
  }
  head.appendChild(strip);
  wrap.appendChild(head);

  for (const g of GROUPS) {
    const sec = el('section', 'hubgroup');
    sec.appendChild(el('h2', 'hubgroup-h', g.title));
    const grid = el('div', 'hubgrid');
    for (const t of g.tiles) {
      const a = el('a', 'tile');
      (a as HTMLAnchorElement).href = t.href;
      const top = el('div', 'tile-top');
      top.appendChild(el('span', 'tile-emoji', t.emoji));
      if (t.badge) {
        const b = el('span', 'tile-badge');
        b.id = t.badge;
        top.appendChild(b);
      }
      a.appendChild(top);
      a.appendChild(el('h3', 'tile-title', t.title));
      a.appendChild(el('p', 'tile-what', t.what));
      grid.appendChild(a);
    }
    sec.appendChild(grid);
    wrap.appendChild(sec);
  }

  root.appendChild(wrap);

  const foot = document.getElementById('hub-foot');
  if (foot) {
    foot.innerHTML =
      'One place for the whole trip · add this page to your home screen · <a href="index.html">the full brochure →</a>';
  }
}

/** Live counts, after paint — the page is useful before these land. */
async function badges(): Promise<void> {
  const shop = document.getElementById('b-shop');
  const picks = document.getElementById('b-picks');

  listGroceries()
    .then((rows) => {
      const open = rows.filter((r) => !r.checked).length;
      if (shop) shop.textContent = open > 0 ? `${open} to buy` : 'empty';
    })
    .catch(() => {
      if (shop) shop.textContent = '—';
    });

  loadFavs()
    .then(() => {
      const n = allFavIds().length;
      if (picks) picks.textContent = n > 0 ? `${n} picked` : 'none yet';
    })
    .catch(() => {
      if (picks) picks.textContent = '—';
    });
}

render();
void badges();
