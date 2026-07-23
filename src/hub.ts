// ===========================================================================
// hub.ts — renders hub.html: the ONE-STOP LANDING ZONE for the trip.
//
// Why this page exists (Allison, Jul 23 2026): "one singular place that we can
//   use while we're on the trip... consolidated enough that we don't have to
//   jump between all of the different apps... organized clear, mobile friendly."
//
// LAID OUT TO AVITAL'S SPEC (her voice notes, same day). Her words:
//   • "Take this pod that's in the screenshot and make that the landing page.
//      All the stuff at the top is meaningless and then you have to scroll
//      unnecessarily."          → the tiles are the FIRST thing on screen.
//   • "At the top, the places we're staying — just a bar, the shortcut to the
//      places we're staying. A thin cross-screen bar rather than the cards and
//      the tiles, because it's self-contained."
//      (and: "where I didn't say black" — she never asked for black; that was
//      a bad transcription of an earlier note.)
//   • "The kosher stuff, put in one card. We don't need four cards for it."
//   • "Rainy day is good but it's taking up a lot of space that I don't think
//      is needed."               → demoted to a slim row.
//   • "Don't emphasise the weather. You're not going to know what the weather
//      is and forecasts change."  → one quiet line, BELOW the tiles, and it
//      always states how old it is rather than implying it is live.
//   • "Booking deadlines I wouldn't put at the top, because we're going to use
//      this on the go."           → moved to the bottom.
//   • "The Plan is cool, Our picks is cool, From your bed I like, shopping list
//      is cool."                  → those four kept exactly as they were.
// ===========================================================================

// Side-effect import: nav.ts registers the service worker at module load.
// The hub deliberately has no nav bar (the page IS the nav), which meant
// the page she installs was the one page with NO offline support. Found
// by the design audit, 23 Jul.
import './nav.js';
import { DAYS } from './plan-data.js';
import { DAY_ROUTES } from './routes-data.js';
import { ageLabel, dayFor, describe, getWeather, verdict } from './weather.js';
import { allFavIds, loadFavs } from './favs.js';
import { listGroceries } from './supabase.js';

interface ExpandLink {
  href: string;
  emoji: string;
  label: string;
}

interface Tile {
  /** Omitted when the tile expands in place instead of navigating. */
  href?: string;
  emoji: string;
  title: string;
  what: string;
  /** id of the badge span, filled in later from live data */
  badge?: string;
  /** When present the tile opens these inline rather than navigating. */
  expands?: ExpandLink[];
}

interface Group {
  title: string;
  tiles: Tile[];
  /** Render as slim full-width rows instead of square tiles. */
  slim?: boolean;
}

// Which bed each night, and which day of the plan it is. One table, so the
// "tonight" bar can never disagree with the itinerary.
const NIGHTS: { date: string; bed: string; dayId: string }[] = [
  { date: '2026-07-24', bed: 'Bad Goisern', dayId: 'fri24' },
  { date: '2026-07-25', bed: 'Bad Goisern', dayId: 'shabbat' },
  { date: '2026-07-26', bed: 'Zell am See', dayId: 'sun26' },
  { date: '2026-07-27', bed: 'Zell am See', dayId: 'mon27' },
  { date: '2026-07-28', bed: 'Gosau', dayId: 'tue28' },
  { date: '2026-07-29', bed: 'Gosau', dayId: 'wed29' },
  { date: '2026-07-30', bed: 'Wals (by the airport)', dayId: 'thu30' },
];

// ---------------------------------------------------------------------------
// DON'T MISS — her brief: "imagine me and avital out in the mountains trying
// to plan our epic day... super important that we easily see the must-sees
// and the things you know we would want to do and not miss."
// The seven moments, each pinned to its day. One tap = that day's loop.
// ---------------------------------------------------------------------------
const MUST_SEE: { emoji: string; what: string; day: string; dayId: string }[] = [
  { emoji: '🚤', what: 'Königssee silent boat + the Obersee mirror', day: 'Thu', dayId: 'thu30' },
  {
    emoji: '🌅',
    what: 'Gosausee evening — e-boat, then the sunset from the shore',
    day: 'Wed',
    dayId: 'wed29',
  },
  {
    emoji: '🖐',
    what: '5 Fingers over the 400 m drop (clear morning)',
    day: 'Wed',
    dayId: 'wed29',
  },
  {
    emoji: '⛵',
    what: 'Zeller See sunset cruise — the Montenegro evening, if the sky breaks',
    day: 'Mon',
    dayId: 'mon27',
  },
  {
    emoji: '🧊',
    what: 'Eisriesenwelt — the largest ice cave on Earth, on the drive',
    day: 'Sun',
    dayId: 'sun26',
  },
  { emoji: '🕯️', what: 'Mauthausen — the remembrance anchor', day: 'Fri', dayId: 'fri24' },
  {
    emoji: '🏘',
    what: 'Hallstatt at dusk, supper on the lakefront, buses gone',
    day: 'Tue',
    dayId: 'tue28',
  },
];

const GROUPS: Group[] = [
  {
    title: 'Today',
    tiles: [
      {
        href: 'routes.html',
        emoji: '🔁',
        title: 'The Week',
        what: 'Each day door to door — today opens itself',
      },
      {
        href: 'overview.html',
        emoji: '🧭',
        title: 'Where you are',
        what: 'The map — what is near what',
      },
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
      // Avital: "the kosher stuff, put in one card. We don't need four cards."
      {
        emoji: '✡️',
        title: 'Kosher',
        what: 'Certified · reading a label · by ingredient',
        expands: [
          { href: 'certified.html', emoji: '✅', label: 'Certified — the easy path' },
          { href: 'kosher.html', emoji: '✡️', label: 'Field guide — reading a label' },
          { href: 'shop.html', emoji: '🔍', label: 'By ingredient — photo grid' },
        ],
      },
    ],
  },
  {
    title: 'When you need it',
    // Avital on Rainy day: "good but it's taking up a lot of space that I don't
    // think is needed for as much." Slim rows, not full tiles.
    slim: true,
    tiles: [
      { href: 'rain.html', emoji: '☂', title: 'Rainy day', what: 'What still works when it pours' },
      { href: 'info.html', emoji: '🔑', title: 'Trip info', what: 'Bookings, car, flights' },
      {
        href: 'rank.html',
        emoji: '⭐',
        title: 'Rank it',
        what: 'Give hearts, let the order settle',
      },
      {
        href: 'claude.html',
        emoji: '💙',
        title: "Claude's pick",
        what: 'The pre-forecast archive — see The Week',
      },
      {
        href: 'index.html',
        emoji: '📖',
        title: 'The brochure',
        what: 'The whole trip, top to bottom',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// BOOK BEFORE YOU FLY — things the research found that fall through if nobody
// acts. Avital asked for these NOT to be at the top ("we're going to use this
// on the go"), so they sit at the bottom. Hides itself once the trip starts.
// ---------------------------------------------------------------------------
interface UrgentItem {
  what: string;
  why: string;
  how: string;
}

const URGENT: UrgentItem[] = [
  {
    what: 'FROST family rafting',
    why: 'On request only, sold on no platform, needs 24 h notice — and no published minimum group size, so it may not run for two people.',
    how: 'Email info@frostrafting.at. Ask: will it run for two, what time, and confirm €55 pp.',
  },
  {
    what: 'FROST canyoning (Waterfall Park)',
    why: 'Published on their site but bookable on no channel at all. Season ends 31 Aug.',
    how: 'Same email. Ask whether you need shoes — that is €10 each extra.',
  },
  {
    what: 'Kayak / SUP on the Hallstättersee',
    why: 'Needs a day’s notice, and the office is only open Mon–Fri 09:00–12:00.',
    how: 'Phone +43 664 25 27 059 Friday morning at the latest for a Sat or Sun boat.',
  },
  {
    what: 'Cash — euro notes AND coins',
    why: 'The Hallstatt ferry, Kitzlochklamm and the Bad Goisern lake boat are CASH ONLY. Some gates are coin machines.',
    how: 'Draw it at the airport on landing.',
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

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/** Today, in Austria's terms — good enough: the trip is one timezone. */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function whereTonight(): { bed: string; day: string } | null {
  const night = NIGHTS.find((n) => n.date === todayISO());
  if (!night) return null;
  return { bed: night.bed, day: DAYS.find((d) => d.id === night.dayId)?.title ?? '' };
}

/** One tile — square by default, a slim full-width row when the group says so.
 *  A tile with `expands` opens its links in place instead of navigating. */
function tileNode(t: Tile, slim: boolean): HTMLElement {
  const cls = slim ? 'slimrow' : 'tile';

  if (t.expands) {
    const holder = el('div', 'tilewrap');
    const btn = el('button', `${cls} tile-exp`);
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = slim
      ? `<span class="slim-emoji">${t.emoji}</span><span class="slim-t">${esc(t.title)}</span><span class="slim-w">${esc(t.what)}</span><span class="slim-c">▾</span>`
      : `<span class="tile-top"><span class="tile-emoji">${t.emoji}</span><span class="tile-caret">▾</span></span><span class="tile-title">${esc(t.title)}</span><span class="tile-what">${esc(t.what)}</span>`;

    const sub = el('div', 'tilesub');
    for (const l of t.expands) {
      const a = el('a');
      a.href = l.href;
      a.innerHTML = `<span>${l.emoji}</span> ${esc(l.label)}`;
      sub.appendChild(a);
    }
    btn.addEventListener('click', () => {
      const open = btn.classList.toggle('open');
      sub.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    holder.appendChild(btn);
    holder.appendChild(sub);
    return holder;
  }

  const a = el('a', cls);
  a.href = t.href ?? '#';
  if (slim) {
    a.innerHTML =
      `<span class="slim-emoji">${t.emoji}</span><span class="slim-t">${esc(t.title)}</span>` +
      `<span class="slim-w">${esc(t.what)}</span>` +
      (t.badge ? `<span class="tile-badge" id="${t.badge}"></span>` : '');
    return a;
  }
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
  return a;
}

function renderUrgent(root: HTMLElement): void {
  // Landing day: the booking deadlines are gone, but the cash reminder is at
  // its MOST urgent at 07:50 in the arrivals hall. One slim line, one day.
  if (todayISO() === '2026-07-24') {
    const strip = el('p', 'urgent-landing');
    strip.textContent =
      '💶 Landing today — draw euro NOTES AND COINS at the airport. The Hallstatt ferry, Kitzlochklamm and the lake boat are cash-only.';
    root.appendChild(strip);
    return;
  }
  if (todayISO() > '2026-07-24') return; // mid-trip: this panel is noise

  const box = el('section', 'urgent');
  box.appendChild(el('h2', 'urgent-h', '⏰ Before you fly'));
  box.appendChild(
    el(
      'p',
      'urgent-sub',
      'Found by the research sweep. These fall through if nobody acts tonight.',
    ),
  );
  const list = el('ul', 'urgent-list');
  for (const u of URGENT) {
    const li = el('li');
    li.appendChild(el('span', 'urgent-what', u.what));
    li.appendChild(el('span', 'urgent-why', u.why));
    li.appendChild(el('span', 'urgent-how', u.how));
    list.appendChild(li);
  }
  box.appendChild(list);
  root.appendChild(box);
}

function render(): void {
  const root = document.getElementById('hub');
  if (!root) return;

  const wrap = el('div', 'hubwrap');

  // ---- the thin cross-screen bar, per Avital ------------------------------
  // Tapping it opens all four nights in place; it never navigates away.
  const now = whereTonight();
  const bar = el('button', 'bedbar');
  bar.type = 'button';
  bar.setAttribute('aria-expanded', 'false');
  // Before the trip: the outbound flight. During: tonight's bed. On the way
  // home: the RETURN flight — the audit caught the bar showing last week's
  // outbound on departure morning.
  const homeDay = todayISO() >= '2026-07-31';
  bar.innerHTML = now
    ? `<span class="bedbar-k">Tonight</span><span class="bedbar-v">🛏 ${esc(now.bed)}</span><span class="bedbar-c">▾</span>`
    : homeDay
      ? `<span class="bedbar-k">Fri 31</span><span class="bedbar-v">🛫 LY5194 09:55 → TLV 13:25</span><span class="bedbar-c">▾</span>`
      : `<span class="bedbar-k">Fri 24</span><span class="bedbar-v">🛫 05:00 → Salzburg 07:50</span><span class="bedbar-c">▾</span>`;

  const beds = el('div', 'bedlist');
  for (const n of NIGHTS) {
    // Each night is a LINK straight to that day on The Plan — her ask, so the
    // shortcut actually shortcuts instead of dumping you at a second link.
    const row = el('a', 'bedrow' + (n.date === todayISO() ? ' istonight' : ''));
    row.href = `plan.html#${n.dayId}`;
    const d = new Date(`${n.date}T12:00:00`).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
    });
    row.innerHTML =
      `<span class="bedrow-d">${d}</span><span class="bedrow-b">${esc(n.bed)}</span>` +
      `<span class="bedrow-go">›</span>`;
    beds.appendChild(row);
  }
  const detail = el('a', 'bedlist-more', '🔑 Addresses, check-in times, the car →');
  detail.href = 'info.html';
  beds.appendChild(detail);

  bar.addEventListener('click', () => {
    const open = bar.classList.toggle('open');
    beds.classList.toggle('open', open);
    bar.setAttribute('aria-expanded', String(open));
  });

  wrap.appendChild(bar);
  wrap.appendChild(beds);

  // The 07:00 sentence — the hub answered "where do we sleep" but never
  // "what is today". One line from The Week, only during the trip.
  const night = NIGHTS.find((n) => n.date === todayISO());
  if (night) {
    const dr = DAY_ROUTES.find((d) => d.dayId === night.dayId);
    if (dr) {
      const today = el('a', 'todayline');
      today.href = 'routes.html';
      today.innerHTML = `<b>Today</b> · ${esc(dr.title)} — ${esc(dr.headline)} →`;
      wrap.appendChild(today);
    }
  }

  // ---- DON'T MISS — visible before anything else asks for a decision ------
  const ms = el('section', 'mustsee');
  const msHead = el('button', 'mustsee-h');
  msHead.type = 'button';
  msHead.setAttribute('aria-expanded', 'false');
  msHead.innerHTML = `<span>⭐ Don't miss</span><span class="mustsee-sub">the 7 moments this week is built around</span><span class="mustsee-c">▾</span>`;
  const msList = el('div', 'mustsee-list');
  for (const m of MUST_SEE) {
    const a = el('a', 'mustsee-row');
    a.href = `routes.html#${m.dayId}`;
    a.innerHTML = `<span class="ms-emoji">${m.emoji}</span><span class="ms-what">${esc(m.what)}</span><span class="ms-day">${m.day}</span>`;
    msList.appendChild(a);
  }
  msHead.addEventListener('click', () => {
    const open = ms.classList.toggle('open');
    msHead.setAttribute('aria-expanded', String(open));
  });
  ms.appendChild(msHead);
  ms.appendChild(msList);
  wrap.appendChild(ms);

  // ---- the tiles, immediately. Nothing to scroll past. --------------------
  for (const g of GROUPS) {
    const sec = el('section', 'hubgroup');
    sec.appendChild(el('h2', 'hubgroup-h', g.title));
    const grid = el('div', g.slim ? 'hubslim' : 'hubgrid');
    for (const t of g.tiles) grid.appendChild(tileNode(t, Boolean(g.slim)));
    sec.appendChild(grid);
    wrap.appendChild(sec);
  }

  // ---- weather, de-emphasised, below the tiles ---------------------------
  const wx = el('p', 'hubwx-lite');
  wx.id = 'hub-wx';
  wrap.appendChild(wx);

  // ---- booking deadlines, at the bottom ----------------------------------
  renderUrgent(wrap);

  root.appendChild(wrap);

  const foot = document.getElementById('hub-foot');
  if (foot) {
    foot.innerHTML =
      'Add this page to your home screen · <a href="index.html">the full brochure →</a>';
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

/** One quiet line. Avital doubts a forecast can be current, so it never claims
 *  to be — it prints how old it is, every time. */
async function loadWeather(): Promise<void> {
  const mount = document.getElementById('hub-wx');
  if (!mount) return;

  let result;
  try {
    result = await getWeather();
  } catch {
    mount.textContent = 'No forecast right now — no signal, and nothing cached yet.';
    return;
  }

  const today = todayISO();
  if (today >= '2026-07-31') {
    mount.textContent = 'Fly-home day — 05:30 alarm, car back 06:30, LY5194 at 09:55.';
    return;
  }
  const night = NIGHTS.find((n) => n.date === today);
  const target = night ?? NIGHTS[0];
  const fc =
    result.forecasts.find((f) => f.base.name.startsWith(target.bed.split(' (')[0])) ??
    result.forecasts[0];
  const day = dayFor(fc, night ? today : NIGHTS[0].date);
  if (!day) {
    mount.textContent = 'The forecast has nothing for today — outside the 24–31 July window.';
    return;
  }

  const w = describe(day.code);
  const v = verdict(day);
  mount.innerHTML =
    `${w.icon} ${esc(fc.base.name)} ${day.tMin}–${day.tMax}°C, ${esc(w.label)} · sunset ${day.sunset} · ` +
    `<a href="${v.href}">${esc(v.cta)}</a> ` +
    `<span class="wxage">forecast, fetched ${ageLabel(result.fetchedAt)}${
      result.stale ? ', offline copy' : ''
    }</span>`;
}

render();
void badges();
void loadWeather();
