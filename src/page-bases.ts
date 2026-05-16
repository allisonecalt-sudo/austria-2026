// Entry script for /bases.html — 4 base configuration options.
//
// Allison (2026-05-16 22:13): "give options!!! thats the ideas always optiposn"
// Allison (2026-05-16 22:14): "everyhting options!!!! an dpresent it so its
// eay to digest and use map"
//
// Renders:
//   1. Compare-strip: 4 small cards with one line each, scan at a glance
//   2. Salzburg laundry filter status callout (which Salzburg listings pass)
//   3. The 4 base-config cards — collapsed by default, expand on tap
//      Each expanded card has: pitch, drive matrix (bucketed), lodging picks,
//      daily flow, pros + cons, cost delta, map link

import {
  BASE_CONFIGS,
  TRIP,
  type BaseConfig,
  type BaseConfigDriveRow,
  type BaseConfigLodgingPick,
  type BudgetTier,
  type LodgingLaundry,
  type LodgingVibe,
} from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- Badge helpers (reused from page-stay.ts pattern) ---

function tierBadge(tier?: BudgetTier): string {
  if (!tier) return '';
  const map: Record<BudgetTier, string> = {
    lean: '💰 Lean',
    standard: '💰💰 Standard',
    splurge: '💰💰💰 Mid-high',
    'mid-high': '💰💰💰 Mid-high',
  };
  return `<span class="chip" title="Budget tier">${map[tier]}</span>`;
}

function vibeBadge(vibe?: LodgingVibe): string {
  if (!vibe || vibe === 'in-town') return '';
  const labels: Record<Exclude<LodgingVibe, 'in-town'>, string> = {
    'nature-view': '🌄 Nature view',
    'farm-stay': '🐐 Farm stay',
    'lake-edge': '🏞️ Lake edge',
    'forest-cabin': '🌲 Forest cabin',
  };
  return `<span class="chip" title="Setting">${labels[vibe]}</span>`;
}

function laundryBadge(l?: LodgingLaundry): string {
  if (!l || l === 'unknown') return '';
  const labels: Record<Exclude<LodgingLaundry, 'unknown'>, { text: string; cls: string }> = {
    'washer+dryer': { text: '🧺 Washer + dryer', cls: 'chip chip-good' },
    washer: { text: '🧺 Washer', cls: 'chip chip-good' },
    shared: { text: '🧺 Shared laundry', cls: 'chip chip-warn' },
    none: { text: '🚫 No laundry', cls: 'chip chip-bad' },
  };
  const x = labels[l];
  return `<span class="${x.cls}" title="Laundry status">${x.text}</span>`;
}

function bedroomBadge(b?: number | 'studio'): string {
  if (b === undefined) return '';
  const label = b === 'studio' ? 'Studio' : `${b} BR`;
  return `<span class="chip" title="Bedrooms">🛏 ${label}</span>`;
}

function bedsBadge(beds?: string): string {
  if (!beds) return '';
  return `<span class="chip" title="Beds">${escapeHtml(beds)}</span>`;
}

function chipRow(chips: string[]): string {
  const non = chips.filter(Boolean);
  if (non.length === 0) return '';
  return `<div class="day-meta" style="margin-top:0.6rem;">${non.join('')}</div>`;
}

function notableDetailsRow(details?: string[]): string {
  if (!details || details.length === 0) return '';
  const items = details.map((d) => `<li>${escapeHtml(d)}</li>`).join('');
  return `<ul class="notable-details">${items}</ul>`;
}

// --- Drive-matrix rendering ---

function bucketLabel(b: BaseConfigDriveRow['bucket']): string {
  switch (b) {
    case 'at-door':
      return 'At the door';
    case 'easy':
      return 'Easy (≤30 min)';
    case 'day-trip':
      return 'Day trip (≤1h)';
    case 'long-day':
      return 'Long day (>1h)';
  }
}

function bucketClass(b: BaseConfigDriveRow['bucket']): string {
  return `drive-bucket drive-bucket-${b}`;
}

function renderDriveMatrix(rows: BaseConfigDriveRow[]): string {
  // Group by bucket
  const buckets: Record<BaseConfigDriveRow['bucket'], BaseConfigDriveRow[]> = {
    'at-door': [],
    easy: [],
    'day-trip': [],
    'long-day': [],
  };
  rows.forEach((r) => buckets[r.bucket].push(r));
  const order: BaseConfigDriveRow['bucket'][] = ['at-door', 'easy', 'day-trip', 'long-day'];
  return order
    .filter((b) => buckets[b].length > 0)
    .map((b) => {
      const items = buckets[b]
        .sort((a, c) => a.fromBaseMin - c.fromBaseMin)
        .map(
          (r) =>
            `<li><span class="drive-min">${r.fromBaseMin} min</span> <span class="drive-name">${escapeHtml(r.destinationName)}</span></li>`,
        )
        .join('');
      return `
        <div class="${bucketClass(b)}">
          <div class="drive-bucket-head">${bucketLabel(b)} <span class="drive-bucket-count">${buckets[b].length}</span></div>
          <ul class="drive-bucket-list">${items}</ul>
        </div>`;
    })
    .join('');
}

// --- Lodging-pick card ---

function renderLodgingPick(p: BaseConfigLodgingPick): string {
  return `
    <a class="alt-card" href="${escapeHtml(p.url)}" target="_blank" rel="noreferrer noopener">
      <img class="alt-img" loading="lazy" src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}" />
      <div class="alt-body">
        <div class="alt-name">${escapeHtml(p.name)}</div>
        <div class="alt-meta">${escapeHtml(p.review)} · <strong>${escapeHtml(p.pricePerNight)}</strong></div>
        ${chipRow([
          vibeBadge(p.vibeTag),
          tierBadge(p.budgetTier),
          bedroomBadge(p.bedrooms),
          bedsBadge(p.beds),
          laundryBadge(p.laundry),
        ])}
        <p class="alt-note">${escapeHtml(p.note)}</p>
        ${notableDetailsRow(p.notableDetails)}
        <div class="alt-cta">View on Booking.com →</div>
      </div>
    </a>`;
}

// --- Pros / cons / flow ---

function renderProsCons(pros: string[], cons: string[]): string {
  const pros_li = pros.map((p) => `<li>${escapeHtml(p)}</li>`).join('');
  const cons_li = cons.map((c) => `<li>${escapeHtml(c)}</li>`).join('');
  return `
    <div class="pros-cons">
      <div class="pros-block">
        <h4>What works</h4>
        <ul>${pros_li}</ul>
      </div>
      <div class="cons-block">
        <h4>The trade-offs</h4>
        <ul>${cons_li}</ul>
      </div>
    </div>`;
}

function renderFlow(flow: BaseConfig['flow']): string {
  return flow
    .map(
      (f) => `
        <div class="flow-row">
          <div class="flow-label">${escapeHtml(f.label)}</div>
          <div class="flow-text">${escapeHtml(f.text)}</div>
        </div>`,
    )
    .join('');
}

// --- Cost-delta badge ---

function costDeltaBadge(eur: number): string {
  if (eur === 0) return '<span class="chip chip-good">📊 Baseline (€0)</span>';
  if (eur < 0) return `<span class="chip chip-good">📊 ${eur} (cheaper)</span>`;
  return `<span class="chip chip-warn">📊 +${eur} (pricier)</span>`;
}

function recommendedBadge(rec?: boolean): string {
  if (!rec) return '';
  return '<span class="chip chip-recommended">⭐ Current default</span>';
}

// --- Per-config card ---

function renderConfigCard(c: BaseConfig, idx: number): string {
  const openAttr = idx === 0 ? 'open' : ''; // First card expanded by default
  return `
    <details class="base-config" id="config-${c.id}" ${openAttr}>
      <summary class="base-config-summary">
        <div class="base-config-head">
          <div class="base-config-label">${escapeHtml(c.label)}</div>
          <div class="base-config-town">${escapeHtml(c.baseTown)} · ${escapeHtml(c.nightsAtBase)}</div>
          <div class="base-config-chips">${recommendedBadge(c.recommended)}${costDeltaBadge(c.costDeltaEur)}</div>
        </div>
        <div class="base-config-expand">Tap to expand ▾</div>
      </summary>
      <div class="base-config-body">
        <p class="base-config-pitch">${escapeHtml(c.pitch)}</p>

        <h3 class="base-config-section-head">Drive matrix — distance from this base to each of the 13 nature destinations</h3>
        <div class="drive-matrix">${renderDriveMatrix(c.driveMatrix)}</div>

        <h3 class="base-config-section-head">Daily flow under this config</h3>
        <div class="flow-grid">${renderFlow(c.flow)}</div>

        <h3 class="base-config-section-head">Lodging picks for this config (${c.lodging.length})</h3>
        <div class="alts-grid">${c.lodging.map(renderLodgingPick).join('')}</div>

        ${renderProsCons(c.pros, c.cons)}

        <div class="cost-delta-block">
          <h4>Cost delta vs Config A baseline</h4>
          <p>${escapeHtml(c.costDeltaNote)}</p>
        </div>

        <div class="base-config-map">
          <a class="map-link-btn" href="${escapeHtml(c.mapEmbedUrl)}" target="_blank" rel="noreferrer noopener">
            📍 Open ${escapeHtml(c.baseTown)} on Google Maps →
          </a>
          <p class="map-pin-note">${escapeHtml(c.mapPinNote)}</p>
        </div>
      </div>
    </details>`;
}

// --- Compare strip (always visible, scan-friendly) ---

function renderCompareStrip(): string {
  const rows = BASE_CONFIGS.map(
    (c) => `
      <a class="compare-card" href="#config-${c.id}">
        <div class="compare-card-label">${escapeHtml(c.label.replace(/^Config [A-Z] — /, ''))}</div>
        <div class="compare-card-meta">
          ${recommendedBadge(c.recommended)}${costDeltaBadge(c.costDeltaEur)}
        </div>
        <div class="compare-card-pitch">${escapeHtml(c.pitch.slice(0, 140))}…</div>
      </a>`,
  ).join('');
  return `
    <h2 style="margin-bottom:1rem;">The 4 options, at a glance</h2>
    <div class="compare-grid">${rows}</div>`;
}

// --- Salzburg laundry filter status ---
//
// Renders a callout at the top showing which Salzburg listings pass the
// in-unit-washer filter. This addresses the spec's "Salzburg lodging filter"
// requirement and fail-louds the gap.

function renderSalzburgLaundryStatus(): string {
  const salzburg = TRIP.lodgings.find((l) => l.baseKey === 'salzburg');
  if (!salzburg) return '';

  // Build a list of all Salzburg listings (pick + alts) with their laundry.
  type Row = { name: string; laundry?: LodgingLaundry; url: string };
  const rows: Row[] = [
    {
      name: salzburg.pickName + ' (current pick)',
      laundry: salzburg.pickLaundry,
      url: salzburg.pickUrl,
    },
    ...salzburg.alts.map((a) => ({ name: a.name, laundry: a.laundry, url: a.url })),
  ];

  const pass = rows.filter((r) => r.laundry === 'washer' || r.laundry === 'washer+dryer');
  const fail = rows.filter((r) => r.laundry === 'none');
  const unknown = rows.filter(
    (r) => !r.laundry || r.laundry === 'unknown' || r.laundry === 'shared',
  );

  const passLi = pass
    .map(
      (r) =>
        `<li><a href="${escapeHtml(r.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(r.name)}</a> — washer confirmed</li>`,
    )
    .join('');
  const failLi = fail
    .map(
      (r) =>
        `<li><a href="${escapeHtml(r.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(r.name)}</a> — <strong>no washer</strong></li>`,
    )
    .join('');
  const unkLi = unknown
    .map(
      (r) =>
        `<li><a href="${escapeHtml(r.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(r.name)}</a> — verify with host</li>`,
    )
    .join('');

  return `
    <div class="callout callout-laundry">
      <h3>🧺 Salzburg laundry filter — status</h3>
      <p>
        Per Allison's final form (2026-05-16): Salzburg base MUST have in-unit laundry. Washer
        alone = acceptable; washer + dryer = ideal. Listings below are split by status.
      </p>
      <h4 style="color: var(--green-deep); margin-top: 0.8rem;">✅ Passes filter (${pass.length})</h4>
      ${pass.length > 0 ? `<ul>${passLi}</ul>` : '<p><strong>Gap: none of the Salzburg picks have confirmed washers yet — see Unknown list below.</strong></p>'}
      ${
        fail.length > 0
          ? `<h4 style="color: #b04a3a; margin-top: 0.8rem;">❌ Fails filter (${fail.length})</h4><ul>${failLi}</ul>`
          : ''
      }
      ${
        unknown.length > 0
          ? `<h4 style="color: var(--ink-soft); margin-top: 0.8rem;">❓ Unknown / shared (${unknown.length})</h4><ul>${unkLi}</ul>`
          : ''
      }
      <p style="margin-top: 0.8rem; font-size: 0.9rem; color: var(--ink-soft);">
        <strong>Recommendation:</strong> swap the Salzburg pick from <em>master Linzergasse</em>
        (no washer) to <em>Sauerweingut</em>, <em>Pension Elisabeth</em>, or
        <em>Salzburg Topside Apartments</em> — all 3 have washers verified. master Linzergasse
        is great for Chabad proximity but fails the laundry filter.
      </p>
    </div>`;
}

// --- Render ---

function render(): void {
  const compare = document.querySelector<HTMLElement>('#bases-compare');
  if (compare) compare.innerHTML = renderCompareStrip();

  const laundry = document.querySelector<HTMLElement>('#salzburg-laundry-status');
  if (laundry) laundry.innerHTML = renderSalzburgLaundryStatus();

  const root = document.querySelector<HTMLDivElement>('#bases-root');
  if (root) {
    root.innerHTML = BASE_CONFIGS.map((c, i) => renderConfigCard(c, i)).join('');
  }
}

render();
initNotesWidget();
initChatPlanPopup();
