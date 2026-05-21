// Floating "leave a note" button + modal. Posted to austria_notes.
// v2 (2026-05-15) — single-spine, no A/B options. Day picker only.

import { insertNote, uploadNotePhoto } from './supabase.js';

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
  btn.style.zIndex = '99999';
  return btn;
}

function buildModal(): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.style.zIndex = '100000';
  wrap.innerHTML = `
    <div class="modal">
      <h3>Leave Claude a note</h3>
      <div class="modal-row" style="margin-bottom:0.6rem;">
        <label style="display:flex;gap:0.5rem;align-items:center;">
          <strong>Who's this from?</strong>
          <select id="note-author" style="font-size:1rem;padding:0.3rem 0.5rem;border-radius:0.4rem;border:1px solid #c7b89c;">
            <option value="avital">Avital</option>
            <option value="allison">Allison</option>
          </select>
        </label>
      </div>
      <p class="sub">Type anything — agreement, disagreement, swap ideas, "I won't get up at 7am for Königssee," dealbreakers. Claude reads these between sessions and iterates.</p>
      <textarea id="note-text" placeholder="e.g. 'Skip the ice cave — I don't want to do 1400 stairs.'"></textarea>
      <div class="modal-row note-photo-row">
        <label for="note-photo" class="note-photo-label">
          <span>📷 Attach photos (optional, up to 8)</span>
          <span class="note-photo-hint">screenshots / photos of what's wrong — multi-select supported</span>
        </label>
        <input type="file" id="note-photo" accept="image/*" multiple />
        <div id="note-photo-preview" class="note-photo-preview" hidden></div>
      </div>
      <div class="modal-row">
        <label>Day (optional) <select id="note-day">
          <option value="">— whole trip —</option>
        </select></label>
      </div>
      <div class="modal-actions">
        <button class="btn" type="button" id="note-cancel">Cancel</button>
        <button class="btn primary" type="button" id="note-submit">Send</button>
      </div>
      <p class="sub" style="margin-top:0.5rem; opacity:0.7; font-size:0.78rem;">Press Ctrl+K anytime to open this. ESC to close. Your last "who" choice is remembered.</p>
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

function showToast(text: string, ms = 2400): HTMLDivElement {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  if (ms > 0) {
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, ms);
  }
  return t;
}

// After-submit confirmation flow.
// Honest about latency: notes are read between sessions, not instantly.
// The countdown is a heartbeat so Avital sees something is alive — but the
// label is "Allison's Claude will read this next session" — not a fake
// "reading now" claim. When/if status flips to 'seen' (Allison's session
// marks it), we show that too.
function showSubmitFlow(insertedId: string | null): void {
  const t = showToast('Saved! Allison’s Claude reads notes each session.', 0);
  // Step 1: 3.5s — saved confirmation.
  setTimeout(() => {
    t.textContent = 'Status → pending. Watch the feed on /notes.';
  }, 3500);
  // Step 2: 7s — fade out.
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 7000);

  // Light-touch poll: if the newly-inserted note flips to seen/applied within
  // 60s (rare but possible if Allison is mid-session), pop a follow-up toast.
  if (!insertedId) return;
  let attempts = 0;
  const maxAttempts = 6; // 6 * 10s = 60s
  const poll = setInterval(() => {
    attempts += 1;
    void fetch(
      `https://hpiyvnfhoqnnnotrmwaz.supabase.co/rest/v1/austria_notes?id=eq.${insertedId}&select=status`,
      {
        headers: {
          apikey:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwaXl2bmZob3Fubm5vdHJtd2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzIwNDEsImV4cCI6MjA4ODA0ODA0MX0.AsGhYitkSnyVMwpJII05UseS_gICaXiCy7d8iHsr6Qw',
        },
      },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((rows: { status: string }[] | null) => {
        if (!rows || rows.length === 0) return;
        const s = rows[0].status;
        if (s === 'seen') {
          showToast('👁 Claude has seen your last note.', 4000);
          clearInterval(poll);
        } else if (s === 'applied') {
          showToast('✅ Claude applied your last note.', 5000);
          clearInterval(poll);
        }
      })
      .catch(() => {
        /* silent — best effort */
      });
    if (attempts >= maxAttempts) clearInterval(poll);
  }, 10000);
}

export function initNotesWidget(): void {
  const cfg = getConfigFromBody();
  const fab = buildFab();
  const modal = buildModal();
  document.body.appendChild(fab);
  document.body.appendChild(modal);

  const textarea = modal.querySelector<HTMLTextAreaElement>('#note-text');
  const daySelect = modal.querySelector<HTMLSelectElement>('#note-day');
  const authorSelect = modal.querySelector<HTMLSelectElement>('#note-author');
  const cancelBtn = modal.querySelector<HTMLButtonElement>('#note-cancel');
  const submitBtn = modal.querySelector<HTMLButtonElement>('#note-submit');
  const photoInput = modal.querySelector<HTMLInputElement>('#note-photo');
  const photoPreview = modal.querySelector<HTMLDivElement>('#note-photo-preview');

  if (
    !textarea ||
    !daySelect ||
    !authorSelect ||
    !cancelBtn ||
    !submitBtn ||
    !photoInput ||
    !photoPreview
  ) {
    return;
  }

  // Multi-photo upload (Allison 2026-05-17 07:23: "I want to add multiple photos at once").
  // Internal accumulator separate from photoInput.files so user can add files across
  // multiple picks. Hard cap at MAX_PHOTOS to avoid runaway uploads. Object URLs are
  // revoked on remove/clear to avoid memory leaks.
  const MAX_PHOTOS = 8;
  const pendingPhotos: { file: File; url: string }[] = [];
  const renderPhotoGrid = (): void => {
    photoPreview.hidden = pendingPhotos.length === 0;
    photoPreview.innerHTML = '';
    pendingPhotos.forEach((entry, idx) => {
      const cell = document.createElement('div');
      cell.className = 'note-photo-cell';
      const img = document.createElement('img');
      img.alt = `preview ${idx + 1}`;
      img.src = entry.url;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'note-photo-clear';
      remove.setAttribute('aria-label', `Remove photo ${idx + 1}`);
      remove.textContent = '✕';
      remove.addEventListener('click', () => {
        URL.revokeObjectURL(entry.url);
        pendingPhotos.splice(idx, 1);
        renderPhotoGrid();
      });
      cell.appendChild(img);
      cell.appendChild(remove);
      photoPreview.appendChild(cell);
    });
  };
  const clearPhoto = (): void => {
    photoInput.value = '';
    pendingPhotos.forEach((e) => URL.revokeObjectURL(e.url));
    pendingPhotos.length = 0;
    renderPhotoGrid();
  };
  photoInput.addEventListener('change', () => {
    const files = photoInput.files ? Array.from(photoInput.files) : [];
    for (const file of files) {
      if (pendingPhotos.length >= MAX_PHOTOS) break;
      pendingPhotos.push({ file, url: URL.createObjectURL(file) });
    }
    photoInput.value = ''; // allow re-picking the same file or adding more
    renderPhotoGrid();
  });

  // Per Allison 2026-05-17 01:13: author toggle + persist last choice
  try {
    const savedAuthor = localStorage.getItem('austria-note-author');
    if (savedAuthor === 'allison' || savedAuthor === 'avital') {
      authorSelect.value = savedAuthor;
    }
  } catch {
    // storage unavailable
  }
  authorSelect.addEventListener('change', () => {
    try {
      localStorage.setItem('austria-note-author', authorSelect.value);
    } catch {
      // ignore
    }
  });

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
      let imageUrl: string | null = null;
      if (pendingPhotos.length > 0) {
        const uploaded: string[] = [];
        for (let i = 0; i < pendingPhotos.length; i++) {
          submitBtn.textContent = `Uploading ${i + 1}/${pendingPhotos.length}…`;
          try {
            const url = await uploadNotePhoto(pendingPhotos[i].file);
            uploaded.push(url);
          } catch (uploadErr) {
            const msg = uploadErr instanceof Error ? uploadErr.message : 'Unknown error';
            showToast(
              `Photo ${i + 1} upload failed: ${msg}. Note not sent — try again or remove that photo.`,
              5000,
            );
            return;
          }
        }
        // Multiple URLs joined with comma — admin/notes.html splits on comma for grid display
        imageUrl = uploaded.join(',');
      }
      submitBtn.textContent = 'Sending…';
      const inserted = await insertNote({
        option: 'general', // v2 single-spine — column kept for back-compat
        day_id: daySelect.value || null,
        activity_id: cfg.defaultActivityId,
        note_text: text,
        author: authorSelect.value || 'avital',
        image_url: imageUrl,
      });
      textarea.value = '';
      clearPhoto();
      close();
      showSubmitFlow(inserted?.id ?? null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Failed: ${msg}`, 4000);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
    }
  });
}
