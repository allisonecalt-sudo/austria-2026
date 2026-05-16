// Pre-trip checklist with localStorage persistence.
// Each checkbox has data-key. State persisted under `austria-pretrip-v1`.
// Progress pill updates on every change. Reset button clears state.

import { initNotesWidget } from './notes-widget.js';

const STORAGE_KEY = 'austria-pretrip-v1';

interface CheckState {
  [key: string]: boolean;
}

function loadState(): CheckState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as CheckState;
    }
    return {};
  } catch {
    return {};
  }
}

function saveState(state: CheckState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota / private mode — silently degrade. Checkmarks still work for the session.
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

function wireCheckboxes(state: CheckState): void {
  const boxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-key]');
  boxes.forEach((b) => {
    b.addEventListener('change', () => {
      const key = b.dataset.key;
      if (!key) return;
      state[key] = b.checked;
      saveState(state);
      const item = b.closest('.checklist-item');
      if (item) {
        if (b.checked) item.classList.add('done');
        else item.classList.remove('done');
      }
      updateProgress();
    });
  });
}

function wireReset(state: CheckState): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-reset-checklist]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const confirmed = window.confirm('Clear all checkmarks?');
    if (!confirmed) return;
    for (const k of Object.keys(state)) {
      delete state[k];
    }
    saveState(state);
    const boxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-key]');
    boxes.forEach((b) => {
      b.checked = false;
      const item = b.closest('.checklist-item');
      if (item) item.classList.remove('done');
    });
    updateProgress();
  });
}

function init(): void {
  const state = loadState();
  applyStateToDom(state);
  wireCheckboxes(state);
  wireReset(state);
  updateProgress();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

initNotesWidget();
