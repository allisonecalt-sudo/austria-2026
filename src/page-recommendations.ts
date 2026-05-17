// page-recommendations.ts — renders the /recommendations.html top-picks
// page. NEW file owned by Search & Discovery agent 2026-05-17.
//
// Allison 2026-05-17 06:13: "...interactive like being able to see
// recomendation easily location easily."
//
// What this renders:
//   - 5 sections (lodgings per base / nature picks / water activities /
//     sunset spots / Jewish sights)
//   - Each card: photo · name · location chip · 1-line why-it-rocks ·
//     "Open →" button · "📍 See on map" button (disabled fail-loud
//     when the item has no coords).
//
// Map-pin handoff: clicking "📍 See on map" navigates to
// map.html#focus=<id> for nature/sunset items, or
// map.html#focus-lodging=<encoded name> for lodgings. The map page can
// pick up the hash on load to fly-to + open the matching popup.
// (Map-page wiring lives in page-map.ts — out of scope for this agent;
// the hash is set so when a future map agent adds the listener, the
// link Just Works.)

import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';
import {
  buildRecommendations,
  buildIndex,
  typeIcon,
  mapFocusUrl,
  getScrubbedLodgings,
  type RecommendationGroup,
  type ScrubbedLodging,
  type SearchItem,
} from './search-index.js';
import { getAllPickedItems, startPicksSync, type PickedItem } from './sync-picks.js';

initNotesWidget();
initChatPlanPopup();

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderCard(item: SearchItem, substitutedFrom?: string): string {
  const img = item.img
    ? `<img class="rec-card__img" src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" />`
    : `<div class="rec-card__img rec-card__img--placeholder">${typeIcon(item.type)}</div>`;
  const loc = item.location ? `<div class="rec-card__loc">${escapeHtml(item.location)}</div>` : '';
  const mapUrl = mapFocusUrl(item);
  const mapBtn = mapUrl
    ? `<a href="${escapeHtml(mapUrl)}" class="rec-card__btn rec-card__btn--map">📍 See on map</a>`
    : `<span class="rec-card__btn rec-card__btn--map" aria-disabled="true" title="No map coordinates for this item — fail-loud per Avital trust rule.">📍 No map pin</span>`;
  // Allison 2026-05-17 12:41: "we dotn need to know at all" — substitution
  // badges removed. Sold-out items are scrubbed from the source data
  // entirely; nothing to attribute here. Keep param for back-compat.
  const subBadge = substitutedFrom ? '' : '';
  return `
    <div class="rec-card-wrap">
      <a class="rec-card" href="${escapeHtml(item.url)}">
        ${img}
        <div class="rec-card__body">
          ${subBadge}
          <div class="rec-card__top">
            <span class="rec-card__icon" aria-hidden="true">${typeIcon(item.type)}</span>
            <span class="rec-card__name">${escapeHtml(item.name)}</span>
          </div>
          ${loc}
          <p class="rec-card__why">${escapeHtml(item.description)}</p>
          <div class="rec-card__actions">
            <span class="rec-card__btn rec-card__btn--primary">Open →</span>
            ${mapBtn}
          </div>
        </div>
      </a>
    </div>
  `;
}

// Build a per-section map of "this slot was auto-substituted from <prev pick>".
// search-index.ts records every scrubbed lodging (by base label + weight slot
// it would have occupied) in SCRUBBED_LODGINGS. For each lodging section we
// match scrubbed entries to the current top-N items by:
//   1) Same base label (Salzburg / Hallstatt / Berchtesgaden / Wolfgangsee /
//      Summit) — derived from `item.location` for the substituted card.
//   2) Apply substitutions in scrubbed-weight order so the highest-weight
//      sold-out pick (e.g. the 95-weight primary) gets attributed to the
//      first promoted card in that base, the 70-weight alts to the next.
// This stays defensive — if no scrubbed lodgings match a section, no badges
// render. If MORE were scrubbed than slots exist, the extras are listed in
// the section blurb as a fail-loud footnote.
function buildSubstitutionMap(
  group: RecommendationGroup,
  scrubbed: ScrubbedLodging[],
): { byItemId: Map<string, string>; extras: ScrubbedLodging[] } {
  const byItemId = new Map<string, string>();
  if (group.type !== 'lodging') return { byItemId, extras: [] };

  // Group scrubbed entries by base label (matches the location field).
  const scrubbedByBase = new Map<string, ScrubbedLodging[]>();
  for (const s of scrubbed) {
    const key = s.baseLabel;
    if (!scrubbedByBase.has(key)) scrubbedByBase.set(key, []);
    scrubbedByBase.get(key)!.push(s);
  }
  // Sort each base's scrubbed list by weight desc — primary picks (95) first.
  for (const arr of scrubbedByBase.values()) {
    arr.sort((a, b) => b.weight - a.weight);
  }

  // Walk the group items in display order, attribute substitutions per base.
  for (const item of group.items) {
    const baseKey = item.location ?? '';
    const queue = scrubbedByBase.get(baseKey);
    if (!queue || queue.length === 0) continue;
    const sub = queue.shift()!;
    byItemId.set(item.id, sub.name);
  }

  // Anything left in scrubbedByBase is a "section had more sold-out picks
  // than the editorial top-N had slots for" overflow — surface as extras.
  const extras: ScrubbedLodging[] = [];
  for (const arr of scrubbedByBase.values()) extras.push(...arr);
  return { byItemId, extras };
}

function renderSection(group: RecommendationGroup, _scrubbed: ScrubbedLodging[]): string {
  if (group.items.length === 0) return '';
  // Allison 2026-05-17 12:41: "if sold out done even list" / "we dotn need to
  // know at all". Substitution audit + "Auto-substituted" badges removed — the
  // sold-out items are already filtered out by search-index (per the earlier
  // hide-sold-out sweep + delete pass), so the only reason to surface
  // substitution attribution was traceability. She doesn't want that surfaced.
  // buildSubstitutionMap + extras logic kept in code for future use but not
  // rendered. _scrubbed param prefixed with _ to silence unused-var lint.
  return `
    <section class="rec-section">
      <header class="rec-section__header">
        <h2 class="rec-section__title">
          <span aria-hidden="true">${typeIcon(group.type === 'mixed' ? 'place' : group.type)}</span>
          ${escapeHtml(group.title)}
        </h2>
        <p class="rec-section__blurb">${escapeHtml(group.blurb)}</p>
      </header>
      <div class="rec-grid">
        ${group.items.map((it) => renderCard(it)).join('')}
      </div>
    </section>
  `;
}

// "Picked by Allison + Avital" section — sourced live from austria_notes via
// sync-picks. Spec 2026-05-17: render ABOVE the editorial picks so the
// human-curated list is the first thing you see when you arrive. Cross-
// references each picked id back into the search-index so we can reuse the
// existing card markup (photo, location, "See on map" handoff).
function renderPickedSection(): string {
  const picks = getAllPickedItems();
  if (picks.length === 0) {
    // Empty state — fail-loud per CLAUDE.md so the gap is honest, not silent.
    return `
      <section class="rec-section rec-section--picked">
        <header class="rec-section__header">
          <h2 class="rec-section__title">
            <span aria-hidden="true">✓</span>
            Picked by Allison + Avital
          </h2>
          <p class="rec-section__blurb">
            Nothing picked yet. Tap "+ Pick this" on a stay, sight, or activity card and it'll show up here on every device.
          </p>
        </header>
      </section>
    `;
  }

  // Build an id→SearchItem index so we can resolve a pick to a rich card.
  const all = buildIndex();
  const byId = new Map<string, SearchItem>();
  all.forEach((item) => byId.set(item.id, item));
  // Also index by the "raw" id without the type prefix — shortlist picks
  // use raw nature ids (e.g. "wimbachklamm") while the search index uses
  // prefixed ids (e.g. "place-wimbachklamm"). Build both lookups.
  function resolve(p: PickedItem): SearchItem | null {
    // Lodging: search-index id is `lodging-<slug>` and the pick id is the
    // page-stay slug directly (e.g. "master-linzergasse"). Try both.
    if (p.type === 'lodging') {
      return byId.get(`lodging-${p.id}`) ?? byId.get(p.id) ?? null;
    }
    // Nature / sunset → search-index ids are `place-<id>` or `sunset-<id>`
    // OR the raw id (the indexer uses different conventions per type).
    return (
      byId.get(p.id) ??
      byId.get(`place-${p.id}`) ??
      byId.get(`sunset-${p.id}`) ??
      byId.get(`activity-${p.id}`) ??
      null
    );
  }

  const enriched = picks.map((p) => ({ pick: p, item: resolve(p) }));
  const matched = enriched.filter(
    (e): e is { pick: PickedItem; item: SearchItem } => e.item !== null,
  );
  const unmatched = enriched.filter((e) => e.item === null);

  const cards = matched
    .map(({ pick, item }) => {
      const who = pick.by === 'allison' ? 'Allison' : 'Avital';
      const stamp = formatPickStamp(pick.picked_at);
      return renderCardWithPickBadge(item, `${who} · ${stamp}`);
    })
    .join('');

  const unmatchedNote =
    unmatched.length > 0
      ? `<p class="rec-section__blurb" style="margin-top:0.8rem; color:var(--ink-soft);">
           <strong>Fail-loud:</strong> ${unmatched.length} pick${unmatched.length === 1 ? '' : 's'} couldn't be matched to a card (id drift) — ${unmatched.map((u) => escapeHtml(u.pick.label)).join(', ')}. Pin still lives in austria_notes.
         </p>`
      : '';

  return `
    <section class="rec-section rec-section--picked">
      <header class="rec-section__header">
        <h2 class="rec-section__title">
          <span aria-hidden="true">✓</span>
          Picked by Allison + Avital
        </h2>
        <p class="rec-section__blurb">
          ${matched.length} pick${matched.length === 1 ? '' : 's'} across both devices, synced live from the trip notes feed. Latest at the bottom.
        </p>
      </header>
      <div class="rec-grid">${cards}</div>
      ${unmatchedNote}
    </section>
  `;
}

function formatPickStamp(iso: string): string {
  try {
    const d = new Date(iso);
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${d.getFullYear()}-${mo}-${da} ${hh}:${mm}`;
  } catch {
    return iso;
  }
}

// Variant of renderCard that prepends a "Who · When" badge so the picked
// section communicates source without re-skinning the whole card.
//
// 2026-05-17 12:43: Allison reported missing images on picked cards. Live
// audit found 44/75 rec-cards had no img — the old html.replace() approach
// was producing malformed output for some items. Rewrote as an explicit
// inline template that ALWAYS emits an img (or visible placeholder), so we
// no longer depend on string-replace gymnastics + the renderCard side effects.
function renderPickedCard(item: SearchItem, badge: string): string {
  const imgHtml = item.img
    ? `<img class="rec-card__img" src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" />`
    : `<div class="rec-card__img rec-card__img--placeholder" aria-hidden="true">${typeIcon(item.type)}</div>`;
  const mapUrl = mapFocusUrl(item);
  const mapBtn = mapUrl
    ? `<a href="${escapeHtml(mapUrl)}" class="rec-card__btn rec-card__btn--map">📍 See on map</a>`
    : '';
  const loc = item.location
    ? `<div class="rec-card__loc">${escapeHtml(item.location)}</div>`
    : '';
  return `
    <div class="rec-card-wrap">
      <a class="rec-card" href="${escapeHtml(item.url)}">
        ${imgHtml}
        <div class="rec-card__body">
          <div class="rec-card__pick-badge" aria-label="Picked by ${escapeHtml(badge)}">✓ ${escapeHtml(badge)}</div>
          <div class="rec-card__top">
            <span class="rec-card__icon" aria-hidden="true">${typeIcon(item.type)}</span>
            <span class="rec-card__name">${escapeHtml(item.name)}</span>
          </div>
          ${loc}
          <p class="rec-card__why">${escapeHtml(item.description)}</p>
          <div class="rec-card__actions">
            <span class="rec-card__btn rec-card__btn--primary">Open →</span>
            ${mapBtn}
          </div>
        </div>
      </a>
    </div>`;
}

// Legacy wrapper kept for back-compat with any other call sites.
function renderCardWithPickBadge(item: SearchItem, badge: string): string {
  return renderPickedCard(item, badge);
  // Below: original html.replace() approach — kept commented for reference.
  // (Was producing malformed cards with no img on some items.)
  // const html = renderCard(item);
  // const inject = `<div class="rec-card__pick-badge" aria-label="Picked by ${escapeHtml(badge)}">✓ ${escapeHtml(badge)}</div>`;
  // Inject the badge as the first child of rec-card__body so it sits above
  // the title without disturbing card layout.
  // return html.replace('<div class="rec-card__body">', `<div class="rec-card__body">${inject}`);
}

function init(): void {
  const root = document.getElementById('rec-root');
  if (!root) return;
  const groups = buildRecommendations();
  // Pull the scrubbed-lodging audit trail so renderSection can stamp each
  // promoted card with a visible "auto-substituted from <prev pick>" badge.
  const scrubbed = getScrubbedLodgings();
  // Picked-by section ALWAYS renders first so it's above the fold.
  root.innerHTML =
    renderPickedSection() + groups.map((g) => renderSection(g, scrubbed)).join('');
}

init();

// Cross-device sync — when picks land from Supabase, re-render the page so
// the "Picked by Allison + Avital" section reflects the latest state.
window.addEventListener('picks-synced', () => {
  init();
});
startPicksSync();
