// notes.html controller.
// v3 (2026-05-16) — live status visibility for Avital.
//   - Polls every 15s for status pill (counts + latest note status).
//   - Polls every 30s for "applied in last 10 min" feed at top.
//   - Each note tap-to-expand shows full text + relative-time status.
//
// Honest about latency: this site reads Supabase REST directly. No fake
// "Claude is typing" — only what the DB actually reports.

import { listNotes, type Note, type NoteStatus } from './supabase.js';
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

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.round((now - then) / 1000));
  if (diffSec < 45) return 'just now';
  if (diffSec < 90) return '1 min ago';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatTime(iso);
}

const STATUS_ICON: Record<NoteStatus, string> = {
  pending: '🕐',
  seen: '👁',
  applied: '✅',
};

const STATUS_WORD: Record<NoteStatus, string> = {
  pending: 'pending',
  seen: 'Claude has seen it',
  applied: 'Claude applied it',
};

function statusBadge(status: NoteStatus): string {
  return `<span class="status-badge status-badge--${status}">${STATUS_ICON[status]} ${STATUS_WORD[status]}</span>`;
}

function noteHtml(n: Note): string {
  const scope = n.day_id ? n.day_id : 'whole trip';
  // Strict-mode runtime guard — DB could theoretically return new status values.
  const status: NoteStatus = (['pending', 'seen', 'applied'] as const).includes(
    n.status as NoteStatus,
  )
    ? (n.status as NoteStatus)
    : 'pending';
  return `
    <details class="note-item status-${escapeHtml(status)}">
      <summary>
        <div class="note-summary-row">
          <span class="note-summary-status">${statusBadge(status)}</span>
          <span class="note-summary-time">${escapeHtml(relativeTime(n.created_at))}</span>
        </div>
        <div class="note-summary-preview">${escapeHtml(n.note_text.slice(0, 140))}${
          n.note_text.length > 140 ? '…' : ''
        }</div>
      </summary>
      <div class="note-body">
        <div class="note-fulltext">${escapeHtml(n.note_text)}</div>
        <div class="note-meta">
          <span>📌 ${escapeHtml(scope)}</span>
          <span>👤 ${escapeHtml(n.author)}</span>
          <span>🕒 ${escapeHtml(formatTime(n.created_at))}</span>
        </div>
      </div>
    </details>`;
}

function updateStatusBar(notes: Note[]): void {
  const counts = { pending: 0, seen: 0, applied: 0 };
  for (const n of notes) {
    if (n.status === 'pending') counts.pending += 1;
    else if (n.status === 'seen') counts.seen += 1;
    else if (n.status === 'applied') counts.applied += 1;
  }
  const set = (key: string, val: string): void => {
    const el = document.querySelector<HTMLElement>(`[data-bind="${key}"]`);
    if (el) el.textContent = val;
  };
  set('ns-total', String(notes.length));
  set('ns-pending', String(counts.pending));
  set('ns-seen', String(counts.seen));
  set('ns-applied', String(counts.applied));

  // Latest note's status, only for avital so we don't surface Allison's own
  // entries as "your last note."
  const latest = notes.find((n) => n.author === 'avital') ?? notes[0];
  const latestEl = document.querySelector<HTMLElement>('[data-bind="ns-latest"]');
  if (latestEl) {
    if (!latest) {
      latestEl.textContent = 'No notes yet — tap 💬 to leave one.';
    } else {
      const status: NoteStatus = (['pending', 'seen', 'applied'] as const).includes(
        latest.status as NoteStatus,
      )
        ? (latest.status as NoteStatus)
        : 'pending';
      latestEl.innerHTML = `Your last note from <strong>${escapeHtml(
        relativeTime(latest.created_at),
      )}</strong>: ${statusBadge(status)}`;
    }
  }
}

function updateAppliedFeed(notes: Note[]): void {
  const feed = document.querySelector<HTMLDivElement>('#notes-applied-feed');
  if (!feed) return;
  const tenMinAgo = Date.now() - 10 * 60 * 1000;
  // Updated_at would be more accurate but the API only has created_at — we
  // approximate by showing applied notes from the recent window. Honest
  // limitation: an old note flipped to applied won't surface here.
  const recent = notes.filter(
    (n) => n.status === 'applied' && new Date(n.created_at).getTime() > tenMinAgo,
  );
  if (recent.length === 0) {
    feed.hidden = true;
    feed.innerHTML = '';
    return;
  }
  feed.hidden = false;
  feed.innerHTML = recent
    .map(
      (n) => `
      <div class="applied-card">
        <span class="applied-card__icon">✅</span>
        <div>
          <div class="applied-card__label">Claude just applied:</div>
          <div class="applied-card__text">${escapeHtml(n.note_text)}</div>
          <div class="applied-card__time">${escapeHtml(relativeTime(n.created_at))}</div>
        </div>
      </div>`,
    )
    .join('');
}

async function load(): Promise<void> {
  const root = document.querySelector<HTMLDivElement>('#notes-list');
  const countEl = document.querySelector<HTMLSpanElement>('[data-bind="note-count"]');
  if (!root) return;
  try {
    const notes = await listNotes();
    if (countEl) countEl.textContent = String(notes.length);
    updateStatusBar(notes);
    updateAppliedFeed(notes);
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

// First paint shows a loading skeleton instead of leaving the pill blank.
function paintLoading(): void {
  const root = document.querySelector<HTMLDivElement>('#notes-list');
  if (root) root.innerHTML = '<p style="color:#4b5a62">Loading…</p>';
}

paintLoading();
void load();

// Two pollers. Both are best-effort — fail silent, retry next tick.
// 15s for status pill (the heartbeat Avital is watching).
setInterval(() => {
  void load();
}, 15000);

// 30s applied-feed already covered by load(); keep separate hook in case we
// later split endpoints, but for now load() handles both.

initNotesWidget();
