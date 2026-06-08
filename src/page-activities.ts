// Activities BY LOCATION — "what's near each base."
//
// REWRITTEN 2026-06-08 — location-grouping pass. The previous v4 build
// looped EVERY destination under EVERY base (re-bucketed by drive time),
// so each activity appeared up to 4 times → a 19,670px repeating wall of
// 45 cards. This rewrite assigns each activity to ONE nearest base/area
// and renders calm, collapsible location groups so the owner opens the
// page and instantly sees "what's near wherever I'm sleeping."
//
// Location groups (each activity assigned exactly once):
//   - Near Salzburg            — city + Berchtesgaden day-radius (fromSalzburgMin)
//   - Near Zell am See / Kaprun — the Hohe Tauern cluster (glacier, Krimml,
//                                 Grossglockner, gorges on the south route)
//   - Near Gosau / Salzkammergut lakes — Hallstatt, Dachstein, Gosausee,
//                                 Wolfgangsee (fromHallstattMin)
//   - Salzburg airport         — sleep only, no activity radius (a note)
//
// Assignment is INFERRED from each destination's region + drive times (no
// trip-data.ts change): hohe-tauern → Zell; berchtesgaden → Salzburg;
// salzkammergut → whichever of Salzburg / Gosau (Hallstatt) it's closer to.
//
// Calm + scannable: neutral cards (match sleek.css), a tight one-line meta
// label per activity (drive · effort · type), collapsible groups (first one
// open, rest collapsed). Filter pills still work and auto-open any collapsed
// group that has a match.
//
// NO Montenegro comparisons (Avital's ban). NO winter photos.

import { NATURE_DESTINATIONS, type NatureDestination, type SunsetGrade } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';
import { initSharedShortlist, pickButtonOverlay } from './shortlist-shared.js';

// =====================================================================
// Location groups — "what's near each base."
// =====================================================================
type GroupKey = 'salzburg' | 'zell-am-see' | 'gosau' | 'salzburg-airport';

interface GroupSpec {
  key: GroupKey;
  name: string; // accordion summary name, e.g. "Near Salzburg"
  vibe: string; // one-liner under the summary
  nightsLabel: string;
  defaultOpen: boolean;
  // Minutes from THIS base to a given destination (drive proxy).
  driveMinutes: (d: NatureDestination) => number;
  // Bases with no real activity radius render a short note instead of cards.
  noteOnly?: string;
}

const SALZBURG: GroupSpec = {
  key: 'salzburg',
  name: 'Near Salzburg',
  vibe: 'Old Town walks + the Berchtesgaden day-radius (Königssee, Untersberg, the gorges). Shabbat = walking radius only.',
  nightsLabel: 'Fri-Sun · 2N · Shabbat',
  defaultOpen: true,
  driveMinutes: (d) => d.fromSalzburgMin,
};

const ZELL: GroupSpec = {
  key: 'zell-am-see',
  name: 'Near Zell am See / Kaprun',
  vibe: 'The Hohe Tauern side — Kitzsteinhorn glacier, Krimml falls, Grossglockner road, alpine gorges on the south route.',
  nightsLabel: 'Sun-Tue · 2N · alpine',
  defaultOpen: false,
  // No fromZell column in the data; Zell sits south of Salzburg, so use
  // fromSalzburgMin as an honest "further than Salzburg" proxy for ordering
  // within the group (the cluster is geographic, not minute-exact).
  driveMinutes: (d) => d.fromSalzburgMin,
};

const GOSAU: GroupSpec = {
  key: 'gosau',
  name: 'Near Gosau / Salzkammergut lakes',
  vibe: 'Vorderer Gosausee 5 min, Hallstatt 20 min, Krippenstein cable car 25 min, Schafberg cog ~50 min, Wolfgangsee — all as day-trips.',
  nightsLabel: 'Tue-Thu · 2N · lakes',
  defaultOpen: false,
  driveMinutes: (d) => d.fromHallstattMin,
};

const AIRPORT: GroupSpec = {
  key: 'salzburg-airport',
  name: 'Salzburg airport-side',
  vibe: 'Sleep only — car returned Thu eve, 10-min cab to the gate Friday.',
  nightsLabel: 'Thu-Fri · 1N sleep',
  defaultOpen: false,
  driveMinutes: (d) => d.fromSalzburgMin,
  noteOnly:
    'Thursday is the drive from Gosau (~1h20) → check in → return the rental at SZG. Friday is a 10-min cab to the gate. If Thursday afternoon feels open, Hohenwerfen castle + the Eisriesenwelt ice cave are 30-40 min off the Gosau→Salzburg route (they live under "Near Zell am See" above).',
};

// Render order: Salzburg, Zell, Gosau, Airport.
const GROUPS: GroupSpec[] = [SALZBURG, ZELL, GOSAU, AIRPORT];

// =====================================================================
// Assign each destination to exactly ONE group ("nearest base").
//   - hohe-tauern   → Zell am See / Kaprun cluster
//   - berchtesgaden → Salzburg day-radius
//   - salzkammergut → Salzburg or Gosau, whichever it's closer to
// =====================================================================
function groupFor(d: NatureDestination): GroupKey {
  if (d.region === 'hohe-tauern') return 'zell-am-see';
  if (d.region === 'berchtesgaden') return 'salzburg';
  // salzkammergut: closer to Hallstatt (Gosau) or to Salzburg?
  return d.fromHallstattMin < d.fromSalzburgMin ? 'gosau' : 'salzburg';
}

// =====================================================================
// Category taxonomy — fold NatureType into Avital-friendly labels for the
// filter pills. (Unchanged from v4.)
// =====================================================================
type Category =
  | 'sunset'
  | 'lake'
  | 'gorge'
  | 'waterfall'
  | 'cog-train'
  | 'cave'
  | 'village'
  | 'scenic-drive'
  | 'platform'
  | 'meadow';

interface CategorySpec {
  key: Category;
  label: string;
  icon: string;
}

const CATEGORIES: CategorySpec[] = [
  { key: 'sunset', label: 'Sunset spot', icon: '🌅' },
  { key: 'lake', label: 'Lake', icon: '🏞️' },
  { key: 'gorge', label: 'Gorge', icon: '🌊' },
  { key: 'waterfall', label: 'Waterfall', icon: '💧' },
  { key: 'cog-train', label: 'Cog train / gondola', icon: '🚠' },
  { key: 'cave', label: 'Cave', icon: '🕳️' },
  { key: 'village', label: 'Painted village', icon: '🏘️' },
  { key: 'scenic-drive', label: 'Scenic drive', icon: '🛣️' },
  { key: 'platform', label: 'Skywalk / viewpoint', icon: '🪜' },
  { key: 'meadow', label: 'Alpine meadow', icon: '🌾' },
];

// Short type label shown on the calm card meta-line.
const TYPE_LABEL: Record<NatureDestination['type'], string> = {
  lake: 'lake',
  gorge: 'gorge',
  waterfall: 'waterfall',
  peak: 'viewpoint',
  cave: 'cave',
  village: 'village',
  road: 'scenic drive',
  platform: 'skywalk',
  meadow: 'meadow',
  valley: 'valley',
};

function categoriesFor(d: NatureDestination): Category[] {
  const cats: Category[] = [];
  switch (d.type) {
    case 'lake':
      cats.push('lake');
      break;
    case 'gorge':
      cats.push('gorge');
      break;
    case 'waterfall':
      cats.push('waterfall');
      break;
    case 'cave':
      cats.push('cave');
      break;
    case 'village':
      cats.push('village');
      break;
    case 'road':
      cats.push('scenic-drive');
      break;
    case 'platform':
    case 'peak':
      cats.push('platform');
      if (
        d.id === 'schafbergspitze' ||
        d.id === 'krippenstein-5fingers' ||
        d.id === 'zwoelferhorn'
      ) {
        cats.push('cog-train');
      }
      break;
    case 'meadow':
      cats.push('meadow');
      break;
    case 'valley':
      cats.push('meadow');
      break;
  }
  if (d.sunset === 3) cats.push('sunset');
  return cats;
}

// =====================================================================
// HTML helpers
// =====================================================================
function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sunsetStars(n: SunsetGrade): string {
  return '🌅'.repeat(n);
}

// Effort word from walk + Avital-fit, kept to one token for the meta-line.
function effortWord(d: NatureDestination): string {
  if (d.walk === 'walk') return 'easy walk';
  if (d.avitalFitNote === 'may be too strenuous') return 'moderate';
  return 'easy hike';
}

// One-line value: feature trimmed to ~16 words so each card is one line.
function oneLiner(d: NatureDestination): string {
  const text = d.feature.trim();
  const words = text.split(/\s+/);
  if (words.length <= 16) return text;
  return words.slice(0, 15).join(' ') + '…';
}

// Drive link out per group (re-use the precomputed direction URLs).
function driveLink(group: GroupSpec, d: NatureDestination): string {
  switch (group.key) {
    case 'salzburg':
    case 'salzburg-airport':
      return d.links.mapsFromSalzburg;
    case 'gosau':
      return d.links.mapsFromHallstatt;
    case 'zell-am-see':
      return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('Zell am See, Austria')}&destination=${encodeURIComponent(d.localName ?? d.name)}`;
  }
}

// Sort within a group: sunset desc (sunsets are sacred), then drive asc.
function sortGroup(arr: NatureDestination[], group: GroupSpec): NatureDestination[] {
  return [...arr].sort((a, b) => {
    if (b.sunset !== a.sunset) return b.sunset - a.sunset;
    return group.driveMinutes(a) - group.driveMinutes(b);
  });
}

// =====================================================================
// Calm activity row — tight, one line each: name · drive · effort · type,
// with a sunset mark + map/links. No big photo block.
// =====================================================================
function activityRow(d: NatureDestination, group: GroupSpec): string {
  const mins = group.driveMinutes(d);
  const driveTxt = mins === 0 ? 'on-site' : `${mins} min`;
  const cats = categoriesFor(d);
  const mapsLink = driveLink(group, d);
  const pickBtnHtml = pickButtonOverlay(d.id, 'activity', d.name);

  const badge = d.lockedDay
    ? `<span class="act-row__badge act-row__badge--locked" title="In the itinerary">✓ ${escape(d.lockedDay)}</span>`
    : d.hiddenGem
      ? `<span class="act-row__badge act-row__badge--gem" title="Hidden gem">💎 gem</span>`
      : '';

  return `
    <article class="act-row" id="${d.id}-${group.key}" data-cats="${cats.join(' ')}" data-pick-card-id="${d.id}" data-pick-card-type="activity">
      <div class="act-row__main">
        <div class="act-row__head">
          <h4 class="act-row__title">${escape(d.name)}</h4>
          ${badge}
          ${d.sunset === 3 ? '<span class="act-row__sunset" title="Marquee sunset">🌅🌅🌅</span>' : ''}
        </div>
        <p class="act-row__meta">
          <span class="act-row__drive">🚗 ${driveTxt}</span>
          <span class="act-row__sep">·</span>
          <span>${escape(effortWord(d))}</span>
          <span class="act-row__sep">·</span>
          <span>${escape(TYPE_LABEL[d.type])}</span>
          ${d.sunset < 3 && d.sunset > 0 ? `<span class="act-row__sep">·</span><span>${sunsetStars(d.sunset)}</span>` : ''}
        </p>
        <p class="act-row__desc">${escape(oneLiner(d))}</p>
        <div class="act-row__links">
          <a href="${escape(mapsLink)}" target="_blank" rel="noreferrer noopener">Directions →</a>
          ${
            d.links.official
              ? `<a href="${escape(d.links.official)}" target="_blank" rel="noreferrer noopener">Official →</a>`
              : ''
          }
          <a href="${escape(d.links.wikipedia)}" target="_blank" rel="noreferrer noopener">Wikipedia →</a>
        </div>
      </div>
      ${pickBtnHtml}
    </article>`;
}

// =====================================================================
// One location group = a collapsible accordion.
// =====================================================================
function groupSection(group: GroupSpec, dests: NatureDestination[]): string {
  // Airport-style note-only group.
  if (group.noteOnly) {
    return `
      <details class="loc-group" id="base-${group.key}"${group.defaultOpen ? ' open' : ''}>
        <summary class="loc-group__summary">
          <span class="loc-group__name">${escape(group.name)}</span>
          <span class="loc-group__nights">${escape(group.nightsLabel)}</span>
          <span class="loc-group__count">sleep only</span>
        </summary>
        <div class="loc-group__body">
          <p class="loc-group__vibe">${escape(group.vibe)}</p>
          <p class="loc-group__note">${escape(group.noteOnly)}</p>
        </div>
      </details>`;
  }

  const sorted = sortGroup(dests, group);
  const rows = sorted.map((d) => activityRow(d, group)).join('');

  return `
    <details class="loc-group" id="base-${group.key}"${group.defaultOpen ? ' open' : ''}>
      <summary class="loc-group__summary">
        <span class="loc-group__name">${escape(group.name)}</span>
        <span class="loc-group__nights">${escape(group.nightsLabel)}</span>
        <span class="loc-group__count">${sorted.length} ${sorted.length === 1 ? 'thing' : 'things'}</span>
      </summary>
      <div class="loc-group__body">
        <p class="loc-group__vibe">${escape(group.vibe)}</p>
        <div class="act-rows">${rows}</div>
      </div>
    </details>`;
}

// =====================================================================
// Filter pills — start empty, tap to narrow. Auto-open any collapsed
// group that has a visible match so filtering never hides results.
// =====================================================================
function renderFilterPills(): void {
  const root = document.getElementById('acts-filterpills');
  if (!root) return;
  root.innerHTML = CATEGORIES.map(
    (c) =>
      `<button type="button" class="filter-chip" data-cat="${c.key}" aria-pressed="false">${c.icon} ${escape(c.label)}</button>`,
  ).join('');

  const clearBtn = document.getElementById('acts-filterclear') as HTMLButtonElement | null;

  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const btn = target.closest<HTMLButtonElement>('button.filter-chip');
    if (!btn) return;
    const isOn = btn.classList.toggle('is-on');
    btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
    applyFilters();
    if (clearBtn) clearBtn.hidden = document.querySelectorAll('.filter-chip.is-on').length === 0;
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.querySelectorAll<HTMLButtonElement>('.filter-chip.is-on').forEach((b) => {
        b.classList.remove('is-on');
        b.setAttribute('aria-pressed', 'false');
      });
      applyFilters();
      clearBtn.hidden = true;
    });
  }
}

function applyFilters(): void {
  const active = Array.from(document.querySelectorAll<HTMLButtonElement>('.filter-chip.is-on')).map(
    (b) => b.dataset.cat ?? '',
  );
  const rows = document.querySelectorAll<HTMLElement>('.act-row');
  if (active.length === 0) {
    rows.forEach((r) => (r.hidden = false));
    syncGroupVisibility(false);
    return;
  }
  rows.forEach((r) => {
    const cats = (r.dataset.cats ?? '').split(/\s+/);
    r.hidden = !active.some((a) => cats.includes(a));
  });
  syncGroupVisibility(true);
}

// When filtering: hide groups with no visible rows, and force-open the ones
// that do have a match (so a collapsed group never swallows results). When
// the filter clears, restore each group's default open/closed state.
function syncGroupVisibility(filtering: boolean): void {
  document.querySelectorAll<HTMLDetailsElement>('.loc-group').forEach((g) => {
    const rows = Array.from(g.querySelectorAll<HTMLElement>('.act-row'));
    if (rows.length === 0) return; // note-only group — leave as-is
    const hasVisible = rows.some((r) => !r.hidden);
    g.hidden = filtering && !hasVisible;
    if (filtering) {
      g.open = hasVisible;
    } else {
      const key = g.id.replace(/^base-/, '');
      const spec = GROUPS.find((s) => s.key === key);
      g.open = spec ? spec.defaultOpen : g.open;
    }
  });
}

// =====================================================================
// Bootstrap
// =====================================================================
function render(): void {
  const root = document.getElementById('acts-root');
  if (!root) return;

  // Bucket destinations into groups (each exactly once).
  const byGroup: Record<GroupKey, NatureDestination[]> = {
    salzburg: [],
    'zell-am-see': [],
    gosau: [],
    'salzburg-airport': [],
  };
  for (const d of NATURE_DESTINATIONS) byGroup[groupFor(d)].push(d);

  root.innerHTML = GROUPS.map((g) => groupSection(g, byGroup[g.key])).join('');
  renderFilterPills();
}

render();
initNotesWidget();
initSharedShortlist();
