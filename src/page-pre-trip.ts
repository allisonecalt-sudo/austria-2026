// Pre-trip checklist with Supabase persistence (tandem-readable).
//
// 2026-05-19 — migrated off localStorage per CLAUDE.md tandem rule:
// "If a piece of data lives somewhere you can't read or write...
// that breaks the tandem model." localStorage state was invisible to
// Claude; Supabase `austria_2026_state` table is readable + writable
// by both. Bankruptcy approach: any prior localStorage state is
// declared invalid and a banner notifies. New state goes to Supabase
// only.
//
// Each checkbox has data-key. State stored under Supabase keys
// `pretrip_checklist_item_<data-key>` with value `{ checked: boolean }`.
// Progress pill updates after every successful write.

import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';
import { listStateByPrefix, setState, deleteState } from './supabase.js';

const KEY_PREFIX = 'pretrip_checklist_item_';
const LEGACY_STORAGE_KEY = 'austria-pretrip-v1';
const BANKRUPTCY_NOTICE_KEY = 'pretrip_bankruptcy_notice_dismissed_v1';

interface CheckState {
  [key: string]: boolean;
}

function stateKey(dataKey: string): string {
  return `${KEY_PREFIX}${dataKey}`;
}

async function loadStateFromSupabase(): Promise<CheckState> {
  const rows = await listStateByPrefix(KEY_PREFIX);
  const state: CheckState = {};
  for (const row of rows) {
    const dataKey = row.key.slice(KEY_PREFIX.length);
    const value = row.value as { checked?: boolean } | null;
    if (value && value.checked === true) {
      state[dataKey] = true;
    }
  }
  return state;
}

function hadLegacyState(): boolean {
  try {
    return localStorage.getItem(LEGACY_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function clearLegacyState(): void {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

function bankruptcyDismissed(): boolean {
  try {
    return document.cookie.split(';').some((c) => c.trim().startsWith(`${BANKRUPTCY_NOTICE_KEY}=1`));
  } catch {
    return false;
  }
}

function dismissBankruptcyNotice(): void {
  try {
    document.cookie = `${BANKRUPTCY_NOTICE_KEY}=1; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
  } catch {
    // Ignore.
  }
}

function showBankruptcyBanner(): void {
  if (bankruptcyDismissed()) return;
  const main = document.querySelector('main');
  if (!main) return;
  const banner = document.createElement('div');
  banner.className = 'pretrip-bankruptcy-banner';
  banner.setAttribute('role', 'status');
  banner.innerHTML = `
    <p>
      <strong>Heads up —</strong> your previous checklist state was reset during the
      May 19 tandem-rule migration (storage moved from your browser to the
      Allison+Claude database so Claude can see your progress too). Start fresh
      below — it'll persist properly from here on.
    </p>
    <button type="button" class="pretrip-bankruptcy-dismiss" aria-label="Dismiss notice">
      Got it
    </button>
  `;
  main.insertBefore(banner, main.firstChild);
  const dismissBtn = banner.querySelector<HTMLButtonElement>('.pretrip-bankruptcy-dismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      dismissBankruptcyNotice();
      banner.remove();
    });
  }
}

function updateProgress(): void {
  const boxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-key]');
  const total = boxes.length;
  let done = 0;
  boxes.forEach((b) => {
    if (b.checked) done += 1;
  });
  const text = document.querySelector<HTMLElement>('[data-progress-text]');
  if (text) {
    text.textContent = `${done} / ${total} done`;
  }
  const pill = document.querySelector<HTMLElement>('[data-progress-pill]');
  if (pill) {
    if (done === total && total > 0) {
      pill.classList.add('checklist-progress-complete');
    } else {
      pill.classList.remove('checklist-progress-complete');
    }
  }
}

function applyStateToDom(state: CheckState): void {
  const boxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-key]');
  boxes.forEach((b) => {
    const key = b.dataset.key;
    if (key && state[key]) {
      b.checked = true;
      const item = b.closest('.checklist-item');
      if (item) item.classList.add('done');
    }
  });
}

function setSyncBadge(message: string, ok: boolean): void {
  const badge = document.querySelector<HTMLElement>('[data-sync-badge]');
  if (!badge) return;
  badge.textContent = message;
  badge.dataset.syncState = ok ? 'ok' : 'err';
}

function wireCheckboxes(): void {
  const boxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-key]');
  boxes.forEach((b) => {
    b.addEventListener('change', () => {
      const key = b.dataset.key;
      if (!key) return;
      const item = b.closest('.checklist-item');
      if (item) {
        if (b.checked) item.classList.add('done');
        else item.classList.remove('done');
      }
      updateProgress();
      // Optimistic UI; surface failure if the write doesn't land.
      const targetChecked = b.checked;
      const write = targetChecked
        ? setState(stateKey(key), { checked: true })
        : deleteState(stateKey(key));
      write
        .then(() => setSyncBadge('synced', true))
        .catch((err: Error) => {
          console.error('[pretrip] sync failed', err);
          setSyncBadge('sync failed — try again', false);
        });
    });
  });
}

function wireReset(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-reset-checklist]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const confirmed = window.confirm('Clear all checkmarks?');
    if (!confirmed) return;
    const boxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-key]');
    const deletions: Promise<void>[] = [];
    boxes.forEach((b) => {
      const key = b.dataset.key;
      if (key && b.checked) {
        deletions.push(deleteState(stateKey(key)));
      }
      b.checked = false;
      const item = b.closest('.checklist-item');
      if (item) item.classList.remove('done');
    });
    updateProgress();
    Promise.all(deletions)
      .then(() => setSyncBadge('synced', true))
      .catch((err: Error) => {
        console.error('[pretrip] reset sync failed', err);
        setSyncBadge('sync failed — refresh + retry', false);
      });
  });
}

async function init(): Promise<void> {
  // Show migration notice once if legacy localStorage had state.
  if (hadLegacyState()) {
    showBankruptcyBanner();
    clearLegacyState();
  }
  try {
    const state = await loadStateFromSupabase();
    applyStateToDom(state);
    setSyncBadge('synced', true);
  } catch (err) {
    console.error('[pretrip] load failed', err);
    setSyncBadge('load failed — checks won\'t persist', false);
  }
  wireCheckboxes();
  wireReset();
  updateProgress();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void init();
  });
} else {
  void init();
}

initNotesWidget();
initChatPlanPopup();
