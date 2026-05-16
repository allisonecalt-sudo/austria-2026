import { listNotes, type Note } from './supabase.js';
import { initNotesWidget } from './notes-widget.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function noteHtml(n: Note): string {
  const scope = n.day_id ? n.day_id : 'whole trip';
  return `
    <div class="note-item status-${escapeHtml(n.status)}">
      <div>${escapeHtml(n.note_text)}</div>
      <div class="note-meta">
        <span>📌 ${escapeHtml(scope)}</span>
        <span>👤 ${escapeHtml(n.author)}</span>
        <span>🕒 ${escapeHtml(formatTime(n.created_at))}</span>
        <span>· ${escapeHtml(n.status)}</span>
      </div>
    </div>`;
}

async function load(): Promise<void> {
  const root = document.querySelector<HTMLDivElement>('#notes-list');
  const countEl = document.querySelector<HTMLSpanElement>('[data-bind="note-count"]');
  if (!root) return;
  root.innerHTML = '<p style="color:#4b5a62">Loading…</p>';
  try {
    const notes = await listNotes();
    if (countEl) countEl.textContent = String(notes.length);
    if (notes.length === 0) {
      root.innerHTML =
        '<p style="color:#4b5a62">No notes yet. Once Avital types one, it appears here.</p>';
      return;
    }
    root.innerHTML = notes.map(noteHtml).join('');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    root.innerHTML = `<p style="color:#a04030">Failed to load: ${escapeHtml(msg)}</p>`;
  }
}

void load();
initNotesWidget();
