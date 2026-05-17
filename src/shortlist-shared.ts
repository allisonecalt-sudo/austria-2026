// shortlist-shared.ts
// Cross-page pick / shortlist primitives — ports the page-stay.ts pattern
// (pick button + sticky bottom bar + localStorage + Supabase mirror) to
// every decision surface that isn't lodging.
//
// Mountain-Days Execute spec (2026-05-17): "the stay.html shortlist
// machinery is mature and beautiful — and it stops at stay.html. Other
// decision pages have nothing. Your job: port it."
//
// Storage key is INTENTIONALLY separate from stay's PICKS_STORAGE_KEY so
// lodging picks and trip-element picks live side-by-side, never collide,
// and can be reviewed together later.
//
// Public API:
//   pickButton(id, type, label?)       — HTML chip rendered into a card
//   togglePick(id, type, label)        — flip pick state + Supabase note
//   isPicked(id, type)                 — local read
//   getPicks(typeFilter?)              — array of {id,type,label,picked_at}
//   clearPicks()                       — wipe everything
//   initSharedShortlist(slotId?)       — wires bar + delegated click handler
//
// The bar renders into a slot you can opt-in to (<div id="shared-shortlist-bar-slot">),
// OR auto-injects at body-end if no slot is found. Idempotent — safe to call
// from every page-*.ts bootstrap.

import { insertNote } from './supabase.js';

// ---------------------------------------------------------------------------
// Types + storage
// ---------------------------------------------------------------------------
export type ShortlistType = 'nature' | 'activity' | 'water' | 'lake' | 'sunset' | 'base-config';

export interface ShortlistRecord {
  id: string;
  type: ShortlistType;
  label: string;
  picked_at: string; // ISO
  by: 'avital' | 'allison';
}

export type ShortlistMap = Record<string, ShortlistRecord>; // key = `${type}:${id}`

const STORAGE_KEY = 'austria-shortlist-shared-v1';
const AUTHOR_KEY = 'austria-note-author'; // shared with notes-widget.ts

function compoundKey(id: string, type: ShortlistType): string {
  return `${type}:${id}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readAll(): ShortlistMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ShortlistMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(m: ShortlistMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch {
    // private mode / quota — session-only pick still works
  }
}

function whoIsPicking(): 'avital' | 'allison' {
  try {
    const raw = localStorage.getItem(AUTHOR_KEY);
    if (raw === 'allison' || raw === 'avital') return raw;
  } catch {
    /* ignore */
  }
  return 'avital';
}

// ---------------------------------------------------------------------------
// Public read API
// ---------------------------------------------------------------------------
export function isPicked(id: string, type: ShortlistType): boolean {
  return Boolean(readAll()[compoundKey(id, type)]);
}

export function getPicks(typeFilter?: ShortlistType): ShortlistRecord[] {
  const all = Object.values(readAll());
  const filtered = typeFilter ? all.filter((r) => r.type === typeFilter) : all;
  return filtered.sort((a, b) => a.picked_at.localeCompare(b.picked_at));
}

export function clearPicks(): void {
  const all = readAll();
  const cleared = Object.values(all);
  writeAll({});
  refreshBar();
  refreshPickButtons();
  // Best-effort log to Supabase that the shortlist was cleared.
  if (cleared.length > 0) {
    void insertNote({
      option: 'general',
      day_id: null,
      activity_id: null,
      note_text: `[shortlist-cleared] ${cleared.length} pick(s) removed`,
      author: whoIsPicking(),
    }).catch(() => {
      /* silent */
    });
  }
}

// ---------------------------------------------------------------------------
// Public write API
// ---------------------------------------------------------------------------
export function togglePick(id: string, type: ShortlistType, label: string): boolean {
  const all = readAll();
  const key = compoundKey(id, type);
  let nowPicked: boolean;
  if (all[key]) {
    delete all[key];
    writeAll(all);
    nowPicked = false;
    void mirrorToSupabase(id, type, label, 'unpicked');
  } else {
    all[key] = {
      id,
      type,
      label,
      picked_at: new Date().toISOString(),
      by: whoIsPicking(),
    };
    writeAll(all);
    nowPicked = true;
    void mirrorToSupabase(id, type, label, 'picked');
  }
  refreshBar();
  refreshPickButtons();
  return nowPicked;
}

async function mirrorToSupabase(
  id: string,
  type: ShortlistType,
  label: string,
  action: 'picked' | 'unpicked',
): Promise<void> {
  try {
    await insertNote({
      option: 'general',
      day_id: null,
      activity_id: `${type}:${id}`,
      note_text: `[${action}] ${label} (${type})`,
      author: whoIsPicking(),
    });
  } catch {
    // Silent — local pick still works.
  }
}

// ---------------------------------------------------------------------------
// HTML helpers — pickButton + bottom bar markup
// ---------------------------------------------------------------------------
export function pickButton(id: string, type: ShortlistType, label: string): string {
  const picked = isPicked(id, type);
  const cls = picked ? 'pick-button pick-button--on' : 'pick-button';
  const text = picked ? '✓ Picked' : '+ Pick this';
  const aria = picked ? `Unpick ${label}` : `Pick ${label} for shortlist`;
  return `<button type="button" class="${cls}" data-pick-id="${escapeHtml(id)}" data-pick-type="${type}" data-pick-label="${escapeHtml(label)}" role="button" aria-pressed="${picked ? 'true' : 'false'}" aria-label="${escapeHtml(aria)}">${text}</button>`;
}

/**
 * Wrap pickButton() output in a top-right overlay container suitable for
 * sitting on top of a card's media (photo) area. Replaces the repeated
 * `<div style="position:absolute; top:0.7rem; right:0.7rem; z-index:5;">`
 * inline-style that lived in 5 different page-*.ts files. Card needs to
 * be `position: relative` for the absolute positioning to anchor.
 */
export function pickButtonOverlay(id: string, type: ShortlistType, label: string): string {
  return `<div class="pick-button-overlay">${pickButton(id, type, label)}</div>`;
}

const TYPE_GROUP_LABEL: Record<ShortlistType, string> = {
  nature: 'Nature',
  activity: 'Activities',
  water: 'Water',
  lake: 'Lakes',
  sunset: 'Sunsets',
  'base-config': 'Base config',
};

const TYPE_GROUP_ICON: Record<ShortlistType, string> = {
  nature: '🏞',
  activity: '⛰',
  water: '🚣',
  lake: '🏊',
  sunset: '🌅',
  'base-config': '🏠',
};

function chipHtml(r: ShortlistRecord): string {
  return `<span class="shortlist-shared-chip" title="${escapeHtml(r.label)} · ${TYPE_GROUP_LABEL[r.type]}">${TYPE_GROUP_ICON[r.type]} <span class="shortlist-shared-chip-name">${escapeHtml(r.label)}</span></span>`;
}

function barInnerHtml(): string {
  const picks = getPicks();
  if (picks.length === 0) return '';
  const visible = picks.slice(0, 4);
  const overflow = picks.length - visible.length;
  // Count distinct types — gives the "across N pages" line truth.
  const distinctTypes = new Set(picks.map((p) => p.type)).size;
  const chips = visible.map(chipHtml).join('');
  const more =
    overflow > 0
      ? `<span class="shortlist-shared-chip shortlist-shared-chip--more">+${overflow} more</span>`
      : '';
  return `
    <div class="shortlist-shared-bar__inner" role="region" aria-label="Your shortlist (${picks.length} items across ${distinctTypes} categor${distinctTypes === 1 ? 'y' : 'ies'})">
      <div class="shortlist-shared-bar__summary">
        <strong>${picks.length} picked</strong>
        <span class="shortlist-shared-bar__sub">across ${distinctTypes} categor${distinctTypes === 1 ? 'y' : 'ies'}</span>
      </div>
      <div class="shortlist-shared-bar__chips">${chips}${more}</div>
      <div class="shortlist-shared-bar__actions">
        <button type="button" class="shortlist-shared-btn shortlist-shared-btn--primary" id="shortlist-shared-review" aria-haspopup="dialog">Review →</button>
        <button type="button" class="shortlist-shared-btn shortlist-shared-btn--link" id="shortlist-shared-clear" aria-label="Clear all shortlist picks">Clear</button>
      </div>
    </div>`;
}

function reviewPanelHtml(): string {
  const picks = getPicks();
  if (picks.length === 0) return '';
  const grouped: Record<ShortlistType, ShortlistRecord[]> = {
    nature: [],
    activity: [],
    water: [],
    lake: [],
    sunset: [],
    'base-config': [],
  };
  picks.forEach((p) => grouped[p.type].push(p));

  const order: ShortlistType[] = ['base-config', 'nature', 'activity', 'water', 'lake', 'sunset'];
  const sections = order
    .filter((t) => grouped[t].length > 0)
    .map((t) => {
      const items = grouped[t]
        .map(
          (r) =>
            `<li class="shortlist-shared-review-item"><span class="shortlist-shared-review-name">${escapeHtml(r.label)}</span><button type="button" class="shortlist-shared-review-unpick" data-pick-id="${escapeHtml(r.id)}" data-pick-type="${r.type}" data-pick-label="${escapeHtml(r.label)}" aria-label="Remove ${escapeHtml(r.label)} from shortlist">✕</button></li>`,
        )
        .join('');
      return `
        <section class="shortlist-shared-review-section">
          <h3 class="shortlist-shared-review-head">${TYPE_GROUP_ICON[t]} ${TYPE_GROUP_LABEL[t]} <span class="shortlist-shared-review-count">${grouped[t].length}</span></h3>
          <ul class="shortlist-shared-review-list">${items}</ul>
        </section>`;
    })
    .join('');

  return `
    <div class="shortlist-shared-review-backdrop" id="shortlist-shared-review-backdrop" role="dialog" aria-modal="true" aria-label="Your shortlist">
      <div class="shortlist-shared-review-panel">
        <div class="shortlist-shared-review-header">
          <h2>Your shortlist · ${picks.length}</h2>
          <button type="button" class="shortlist-shared-review-close" id="shortlist-shared-review-close" aria-label="Close review">✕</button>
        </div>
        <p class="shortlist-shared-review-sub">Tap ✕ on any pick to remove it. Picks save locally and mirror to the trip's notes feed so Claude sees them between sessions.</p>
        ${sections}
        <div class="shortlist-shared-review-footer">
          <button type="button" class="shortlist-shared-btn shortlist-shared-btn--ghost" id="shortlist-shared-review-clear">Clear all picks</button>
        </div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Bar + button refresh — keep DOM in sync on every pick toggle
// ---------------------------------------------------------------------------
let barEl: HTMLDivElement | null = null;

function ensureBarEl(): HTMLDivElement {
  if (barEl && document.body.contains(barEl)) return barEl;
  const slot = document.getElementById('shared-shortlist-bar-slot');
  if (slot) {
    barEl = slot as HTMLDivElement;
    barEl.classList.add('shortlist-shared-bar');
  } else {
    const created = document.createElement('div');
    created.id = 'shared-shortlist-bar-slot';
    created.className = 'shortlist-shared-bar';
    document.body.appendChild(created);
    barEl = created;
  }
  return barEl;
}

function refreshBar(): void {
  const el = ensureBarEl();
  const inner = barInnerHtml();
  if (!inner) {
    el.hidden = true;
    el.innerHTML = '';
    document.body.classList.remove('has-shortlist-shared-bar');
    return;
  }
  el.hidden = false;
  el.innerHTML = inner;
  document.body.classList.add('has-shortlist-shared-bar');
}

function refreshPickButtons(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.pick-button[data-pick-id][data-pick-type]');
  buttons.forEach((btn) => {
    const id = btn.dataset.pickId;
    const type = btn.dataset.pickType as ShortlistType | undefined;
    if (!id || !type) return;
    const picked = isPicked(id, type);
    if (picked) {
      btn.classList.add('pick-button--on');
      btn.textContent = '✓ Picked';
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('pick-button--on');
      btn.textContent = '+ Pick this';
      btn.setAttribute('aria-pressed', 'false');
    }
  });
}

// ---------------------------------------------------------------------------
// Review modal open/close
// ---------------------------------------------------------------------------
let reviewBackdrop: HTMLElement | null = null;

function openReview(): void {
  closeReview();
  const html = reviewPanelHtml();
  if (!html) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const root = wrap.firstElementChild as HTMLElement | null;
  if (!root) return;
  document.body.appendChild(root);
  reviewBackdrop = root;
  root.addEventListener('click', (e) => {
    if (e.target === root) closeReview();
  });
  const closeBtn = root.querySelector<HTMLButtonElement>('#shortlist-shared-review-close');
  if (closeBtn) closeBtn.addEventListener('click', closeReview);
  const clearBtn = root.querySelector<HTMLButtonElement>('#shortlist-shared-review-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (typeof window.confirm === 'function') {
        const ok = window.confirm('Clear all picks from your shortlist? This cannot be undone.');
        if (!ok) return;
      }
      clearPicks();
      closeReview();
    });
  }
  root.querySelectorAll<HTMLButtonElement>('.shortlist-shared-review-unpick').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = b.dataset.pickId;
      const type = b.dataset.pickType as ShortlistType | undefined;
      const label = b.dataset.pickLabel ?? id ?? '';
      if (!id || !type) return;
      togglePick(id, type, label);
      // Re-open review with fresh content (or close if empty)
      if (getPicks().length === 0) closeReview();
      else openReview();
    });
  });
  document.body.classList.add('shortlist-shared-modal-open');
}

function closeReview(): void {
  if (reviewBackdrop && reviewBackdrop.parentNode) {
    reviewBackdrop.parentNode.removeChild(reviewBackdrop);
  }
  reviewBackdrop = null;
  document.body.classList.remove('shortlist-shared-modal-open');
}

// ---------------------------------------------------------------------------
// Click delegation — single document-level handler routes pick + bar buttons
// ---------------------------------------------------------------------------
let initDone = false;

export function initSharedShortlist(): void {
  if (initDone) {
    refreshBar();
    refreshPickButtons();
    return;
  }
  initDone = true;

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Pick button on any card
    const pickBtn = target.closest<HTMLButtonElement>('.pick-button[data-pick-id][data-pick-type]');
    if (pickBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = pickBtn.dataset.pickId;
      const type = pickBtn.dataset.pickType as ShortlistType | undefined;
      const label = pickBtn.dataset.pickLabel ?? id ?? '';
      if (!id || !type) return;
      togglePick(id, type, label);
      return;
    }

    // Bottom bar Review button
    if (target.closest('#shortlist-shared-review')) {
      e.preventDefault();
      openReview();
      return;
    }

    // Bottom bar Clear button
    if (target.closest('#shortlist-shared-clear')) {
      e.preventDefault();
      if (typeof window.confirm === 'function') {
        const ok = window.confirm('Clear all picks from your shortlist?');
        if (!ok) return;
      }
      clearPicks();
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reviewBackdrop) closeReview();
  });

  refreshBar();
  refreshPickButtons();
}
