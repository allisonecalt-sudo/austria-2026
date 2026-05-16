// Floating "leave a note" button + modal. Posted to austria_notes.
// v2 (2026-05-15) — single-spine, no A/B options. Day picker only.

import { insertNote } from './supabase.js';

interface ModalConfig {
  defaultDayId: string | null;
  defaultActivityId: string | null;
}

function getConfigFromBody(): ModalConfig {
  const body = document.body;
  return {
    defaultDayId: body.dataset.dayId ?? null,
    defaultActivityId: body.dataset.activityId ?? null,
  };
}

function buildFab(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'fab';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Leave Claude a note');
  btn.innerHTML = '<span aria-hidden="true">💬</span><span>Leave Claude a note</span>';
  return btn;
}

function buildModal(): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.innerHTML = `
    <div class="modal">
      <h3>Leave Claude a note</h3>
      <p class="sub">Type anything — agreement, disagreement, swap ideas, "I won't get up at 7am for Königssee," dealbreakers. Allison's Claude reads these and iterates.</p>
      <textarea id="note-text" placeholder="e.g. 'Skip the ice cave — I don't want to do 1400 stairs.'"></textarea>
      <div class="modal-row">
        <label>Day (optional) <select id="note-day">
          <option value="">— whole trip —</option>
        </select></label>
      </div>
      <div class="modal-actions">
        <button class="btn" type="button" id="note-cancel">Cancel</button>
        <button class="btn primary" type="button" id="note-submit">Send</button>
      </div>
      <p class="sub" style="margin-top:0.5rem; opacity:0.7; font-size:0.78rem;">Press Ctrl+K anytime to open this. ESC to close.</p>
    </div>
  `;
  return wrap;
}

const DAY_OPTIONS: { id: string; label: string }[] = [
  { id: 'fri-jul-24', label: 'Fri Jul 24 — arrival + Shabbat' },
  { id: 'sat-jul-25', label: 'Sat Jul 25 — Shabbat in Salzburg' },
  { id: 'sun-jul-26', label: 'Sun Jul 26 — move to Hallstatt + Gosausee' },
  { id: 'mon-jul-27', label: 'Mon Jul 27 — Dachstein 5fingers + Hallstatt' },
  { id: 'tue-jul-28', label: 'Tue Jul 28 — Königssee (peak day)' },
  { id: 'wed-jul-29', label: 'Wed Jul 29 — Wolfgangsee + Schafberg' },
  { id: 'thu-jul-30', label: 'Thu Jul 30 — Werfen ice cave + transit' },
  { id: 'fri-jul-31', label: 'Fri Jul 31 — fly home' },
];

function showToast(text: string, ms = 2400): void {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, ms);
}

export function initNotesWidget(): void {
  const cfg = getConfigFromBody();
  const fab = buildFab();
  const modal = buildModal();
  document.body.appendChild(fab);
  document.body.appendChild(modal);

  const textarea = modal.querySelector<HTMLTextAreaElement>('#note-text');
  const daySelect = modal.querySelector<HTMLSelectElement>('#note-day');
  const cancelBtn = modal.querySelector<HTMLButtonElement>('#note-cancel');
  const submitBtn = modal.querySelector<HTMLButtonElement>('#note-submit');

  if (!textarea || !daySelect || !cancelBtn || !submitBtn) {
    return;
  }

  for (const d of DAY_OPTIONS) {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.label;
    daySelect.appendChild(opt);
  }
  if (cfg.defaultDayId) {
    daySelect.value = cfg.defaultDayId;
  }

  const open = (): void => {
    modal.classList.add('open');
    textarea.focus();
  };
  const close = (): void => {
    modal.classList.remove('open');
  };

  fab.addEventListener('click', open);
  cancelBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', (e) => {
    // Ctrl+K (or Cmd+K on Mac) opens the note modal globally.
    // Allison 2026-05-16: "create short for ctrl k fo rleave claude a cntoe"
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (!modal.classList.contains('open')) open();
      return;
    }
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });

  submitBtn.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text) {
      textarea.focus();
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try {
      await insertNote({
        option: 'general', // v2 single-spine — column kept for back-compat
        day_id: daySelect.value || null,
        activity_id: cfg.defaultActivityId,
        note_text: text,
        author: 'avital',
      });
      textarea.value = '';
      close();
      showToast('Saved. Allison will see it.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Failed: ${msg}`, 4000);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
    }
  });
}
