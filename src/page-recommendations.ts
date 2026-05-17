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
import { buildRecommendations, typeIcon, mapFocusUrl, type RecommendationGroup, type SearchItem } from './search-index.js';

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
    ? `<img class="rec-card__img" src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" loading="lazy" />`
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

function init(): void {
  const root = document.getElementById('rec-root');
  if (!root) return;
  const groups = buildRecommendations();
  root.innerHTML = groups.map(renderSection).join('');
}

init();
