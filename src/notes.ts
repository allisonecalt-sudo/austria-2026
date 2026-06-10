// ===========================================================================
// notes.ts — small floating 💬 button → quick note to the austria_notes table.
//
// Reuses src/supabase.ts (insertNote) + the existing austria_notes table —
// the tandem-readable feedback channel (Claude reads notes between sessions).
// Self-contained: builds its own modal so it doesn't depend on any old CSS.
// Skipped nothing complex — this is the minimal version (text + who).
// ===========================================================================

import { insertNote } from './supabase.js';

function buildStyles(): void {
  if (document.getElementById('notes-style')) return;
  const style = document.createElement('style');
  style.id = 'notes-style';
  style.textContent = `
    .notes-backdrop{position:fixed;inset:0;z-index:9000;background:rgba(20,22,20,.42);
      display:flex;align-items:flex-end;justify-content:center;}
    .notes-modal{background:#fff;width:100%;max-width:520px;border-radius:16px 16px 0 0;
      padding:20px 18px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(0,0,0,.2);
      font-family:'Inter',system-ui,sans-serif;}
    .notes-modal h3{font-family:'Fraunces',serif;font-weight:500;font-size:20px;margin:0 0 4px;}
    .notes-modal p.sub{font-size:13px;color:#56564f;margin:0 0 14px;line-height:1.5;}
    .notes-modal label{font-size:13px;font-weight:600;color:#20211f;display:block;margin-bottom:6px;}
    .notes-modal select,.notes-modal textarea{width:100%;font:inherit;font-size:15px;padding:10px;
      border:1px solid #e6e2d8;border-radius:10px;background:#f7f5f0;}
    .notes-modal textarea{min-height:92px;resize:vertical;margin-bottom:12px;}
    .notes-modal .row{margin-bottom:12px;}
    .notes-actions{display:flex;gap:10px;justify-content:flex-end;}
    .notes-btn{font:inherit;font-size:14px;font-weight:600;padding:10px 16px;border-radius:10px;cursor:pointer;border:1px solid #e6e2d8;background:#fff;color:#20211f;}
    .notes-btn--go{background:#3f5d4e;color:#fff;border-color:#3f5d4e;}
    .notes-btn:disabled{opacity:.55;cursor:default;}
    .notes-status{font-size:13px;margin-top:10px;min-height:1em;color:#3f5d4e;}
    .notes-status--err{color:#a23b2e;}
    @media(min-width:520px){.notes-backdrop{align-items:center;}.notes-modal{border-radius:16px;}}
  `;
  document.head.appendChild(style);
}

function openModal(): void {
  const backdrop = document.createElement('div');
  backdrop.className = 'notes-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.innerHTML = `
    <div class="notes-modal">
      <h3>Leave a note</h3>
      <p class="sub">Anything — a swap idea, a dealbreaker, "let's skip that one." Read between sessions.</p>
      <div class="row">
        <label for="note-author">From</label>
        <select id="note-author">
          <option value="avital">Avital</option>
          <option value="allison">Allison</option>
        </select>
      </div>
      <div class="row">
        <label for="note-text">Note</label>
        <textarea id="note-text" placeholder="e.g. Skip the ice cave — too many stairs."></textarea>
      </div>
      <div class="notes-actions">
        <button class="notes-btn" type="button" data-close>Cancel</button>
        <button class="notes-btn notes-btn--go" type="button" data-send>Send</button>
      </div>
      <p class="notes-status" id="note-status"></p>
    </div>
  `;

  const close = (): void => backdrop.remove();
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.querySelector('[data-close]')?.addEventListener('click', close);

  const send = backdrop.querySelector<HTMLButtonElement>('[data-send]');
  const status = backdrop.querySelector<HTMLParagraphElement>('#note-status');
  send?.addEventListener('click', async () => {
    const text = backdrop.querySelector<HTMLTextAreaElement>('#note-text')?.value.trim() ?? '';
    const author = backdrop.querySelector<HTMLSelectElement>('#note-author')?.value ?? 'avital';
    if (!text) {
      if (status) status.textContent = 'Type something first.';
      return;
    }
    send.disabled = true;
    if (status) {
      status.className = 'notes-status';
      status.textContent = 'Sending…';
    }
    try {
      await insertNote({ option: 'general', note_text: text, author });
      if (status) status.textContent = 'Sent — thank you ✓';
      setTimeout(close, 1100);
    } catch {
      send.disabled = false;
      if (status) {
        status.className = 'notes-status notes-status--err';
        status.textContent = 'Could not send — try again.';
      }
    }
  });

  document.body.appendChild(backdrop);
  backdrop.querySelector<HTMLTextAreaElement>('#note-text')?.focus();
}

export function mountNotes(): void {
  buildStyles();
  const fab = document.createElement('button');
  fab.className = 'notes-fab';
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Leave a note');
  fab.textContent = '💬';
  fab.addEventListener('click', openModal);
  document.body.appendChild(fab);
}
