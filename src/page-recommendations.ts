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
  type RecommendationGroup,
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

function renderCard(item: SearchItem): string {
  const img = item.img
    ? `<img class="rec-card__img" src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" />`
    : `<div class="rec-card__img rec-card__img--placeholder">${typeIcon(item.type)}</div>`;
  const loc = item.location ? `<div class="rec-card__loc">${escapeHtml(item.location)}</div>` : '';
  const mapUrl = mapFocusUrl(item);
  const mapBtn = mapUrl
    ? `<a href="${escapeHtml(mapUrl)}" class="rec-card__btn rec-card__btn--map">📍 See on map</a>`
    : `<span class="rec-card__btn rec-card__btn--map" aria-disabled="true" title="No map coordinates for this item — fail-loud per Avital trust rule.">📍 No map pin</span>`;
  return `
    <div class="rec-card-wrap">
      <a class="rec-card" href="${escapeHtml(item.url)}">
        ${img}
        <div class="rec-card__body">
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

function renderSection(group: RecommendationGroup): string {
  if (group.items.length === 0) return '';
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
        ${group.items.map(renderCard).join('')}
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
function renderCardWithPickBadge(item: SearchItem, badge: string): string {
  const html = renderCard(item);
  const inject = `<div class="rec-card__pick-badge" aria-label="Picked by ${escapeHtml(badge)}">✓ ${escapeHtml(badge)}</div>`;
  // Inject the badge as the first child of rec-card__body so it sits above
  // the title without disturbing card layout.
  return html.replace('<div class="rec-card__body">', `<div class="rec-card__body">${inject}`);
}

function init(): void {
  const root = document.getElementById('rec-root');
  if (!root) return;
  const groups = buildRecommendations();
  // Picked-by section ALWAYS renders first so it's above the fold.
  root.innerHTML = renderPickedSection() + groups.map(renderSection).join('');
}

init();

// Cross-device sync — when picks land from Supabase, re-render the page so
// the "Picked by Allison + Avital" section reflects the latest state.
window.addEventListener('picks-synced', () => {
  init();
});
startPicksSync();
