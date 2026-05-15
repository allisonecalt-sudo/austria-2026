// Floating "leave a note" button + modal. Posted to austria_notes.
// Imported on every page; reads `data-option` from <body> to default scope.

import { insertNote, type NoteOption } from './supabase.js';

interface ModalConfig {
  defaultOption: NoteOption;
  defaultDayId: string | null;
  defaultActivityId: string | null;
}

function getConfigFromBody(): ModalConfig {
  const body = document.body;
  const opt = body.dataset.option;
  const validOpt: NoteOption =
    opt === 'A' || opt === 'B' || opt === 'general' ? (opt as NoteOption) : 'general';
  return {
    defaultOption: validOpt,
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
      <p class="sub">Type anything — agreement, disagreement, swap ideas, dealbreakers. Allison's Claude reads these and iterates.</p>
      <textarea id="note-text" placeholder="e.g. 'Skip the Grossglockner — too long. Push more lakes.'"></textarea>
      <div class="modal-row">
        <label>About <select id="note-option">
          <option value="general">whole trip</option>
          <option value="A">Option A</option>
          <option value="B">Option B</option>
        </select></label>
        <label>Day (optional) <select id="note-day">
          <option value="">— any —</option>
        </select></label>
      </div>
      <div class="modal-actions">
        <button class="btn" type="button" id="note-cancel">Cancel</button>
        <button class="btn primary" type="button" id="note-submit">Send</button>
      </div>
    </div>
  `;
  return wrap;
}

const DAY_OPTIONS: { id: string; label: string }[] = [
  { id: 'fri-jul-24', label: 'Fri Jul 24 — arrival + Shabbat' },
  { id: 'sat-jul-25', label: 'Sat Jul 25 — Shabbat' },
  { id: 'sun-jul-26', label: 'Sun Jul 26' },
  { id: 'mon-jul-27', label: 'Mon Jul 27' },
  { id: 'tue-jul-28', label: 'Tue Jul 28' },
  { id: 'wed-jul-29', label: 'Wed Jul 29' },
  { id: 'thu-jul-30', label: 'Thu Jul 30' },
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
  const optionSelect = modal.querySelector<HTMLSelectElement>('#note-option');
  const daySelect = modal.querySelector<HTMLSelectElement>('#note-day');
  const cancelBtn = modal.querySelector<HTMLButtonElement>('#note-cancel');
  const submitBtn = modal.querySelector<HTMLButtonElement>('#note-submit');

  if (!textarea || !optionSelect || !daySelect || !cancelBtn || !submitBtn) {
    return;
  }

  // Populate day options
  for (const d of DAY_OPTIONS) {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.label;
    daySelect.appendChild(opt);
  }
  if (cfg.defaultDayId) {
    daySelect.value = cfg.defaultDayId;
  }
  optionSelect.value = cfg.defaultOption;

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
        option: optionSelect.value as NoteOption,
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
