// sync-picks.ts
// READ-on-load sync for cross-device pick visibility.
//
// Problem (2026-05-17, P0 from Allison): Avital committed Config A and picked
// 3 nature spots at ~04:14-04:17 UTC. Fresh browser session on the other
// device shows zero of these — picks are written to Supabase (mirror) but no
// page reads them back. localStorage is per-device, so the "shared" name
// lied. This module adds the missing read path.
//
// Data shape in austria_notes:
//   activity_id = '<type>:<id>'  (e.g. 'nature:wimbachklamm', 'lodging:master-linzergasse', 'base-config:obertraun')
//   note_text   = '[picked] <label>' | '[unpicked] <label>' | '[base-config-committed] <label>' | '[base-config-uncommitted] <label>'
//   author      = 'avital' | 'allison'
//   created_at  = ISO timestamp
//
// Algorithm:
//   1. GET /rest/v1/austria_notes?or=(...)
//   2. Walk rows oldest→newest so later toggles overwrite earlier ones (the
//      May 17 testing flow: Avital picked master Linzergasse + Villa Maxglan
//      at 03:17, then unpicked at 03:17:48 — net state = both unpicked).
//   3. For each row, merge into the matching localStorage key:
//      - nature/activity/water/lake/sunset → austria-shortlist-shared-v1
//      - lodging                           → austria-lodging-picks
//      - base-config (committed)           → austria-committed-base-config (+ meta)
//      - base-config (uncommitted)         → remove austria-committed-base-config
//   4. Fire a CustomEvent('picks-synced') so each page re-renders its pick UI.
//
// Network failure = FAIL LOUD (console.error + window-level event), never
// silently render an empty shortlist as if the device had no picks.

const SUPABASE_URL = 'https://hpiyvnfhoqnnnotrmwaz.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwaXl2bmZob3Fubm5vdHJtd2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzIwNDEsImV4cCI6MjA4ODA0ODA0MX0.AsGhYitkSnyVMwpJII05UseS_gICaXiCy7d8iHsr6Qw';

const SHORTLIST_KEY = 'austria-shortlist-shared-v1';
const LODGING_PICKS_KEY = 'austria-lodging-picks';
const COMMITTED_BASE_KEY = 'austria-committed-base-config';
const COMMITTED_BASE_META_KEY = 'austria-committed-base-config-meta';
const LAST_SYNC_KEY = 'austria-picks-last-sync';

export type ShortlistTypeLite = 'nature' | 'activity' | 'water' | 'lake' | 'sunset';

interface ShortlistRecordLite {
  id: string;
  type: ShortlistTypeLite;
  label: string;
  picked_at: string;
  by: 'avital' | 'allison';
}

interface LodgingPickRecord {
  picked_at: string;
  by: 'avital' | 'allison';
}

interface NoteRow {
  id: string;
  created_at: string;
  activity_id: string | null;
  note_text: string;
  author: string;
}

export interface BaseCommitMeta {
  baseId: string;
  label: string;
  by: 'avital' | 'allison';
  committed_at: string; // ISO
}

const SHORTLIST_TYPES: ReadonlySet<string> = new Set([
  'nature',
  'activity',
  'water',
  'lake',
  'sunset',
]);

function parseActivityId(raw: string | null): { type: string; id: string } | null {
  if (!raw) return null;
  const idx = raw.indexOf(':');
  if (idx <= 0 || idx === raw.length - 1) return null;
  return { type: raw.slice(0, idx), id: raw.slice(idx + 1) };
}

// Extract the human label from "[action] <label>" — falls back to id if the
// note_text is malformed. We deliberately accept any "[...]" prefix so this
// doesn't drift if the marker set grows.
function parseLabel(noteText: string, fallback: string): string {
  const m = noteText.match(/^\[[^\]]+\]\s*(.+)$/);
  if (m && m[1]) return m[1].trim();
  return fallback;
}

function actionFromNote(noteText: string): string | null {
  const m = noteText.match(/^\[([^\]]+)\]/);
  return m ? m[1] : null;
}

function authorOf(row: NoteRow): 'avital' | 'allison' {
  return row.author === 'allison' ? 'allison' : 'avital';
}

// ---------------------------------------------------------------------------
// localStorage merge helpers — defensive: never throw, never wipe other keys.
// ---------------------------------------------------------------------------
function readShortlistMap(): Record<string, ShortlistRecordLite> {
  try {
    const raw = localStorage.getItem(SHORTLIST_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ShortlistRecordLite>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeShortlistMap(m: Record<string, ShortlistRecordLite>): void {
  try {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(m));
  } catch {
    /* quota / private mode — silent */
  }
}

function readLodgingPicks(): Record<string, LodgingPickRecord> {
  try {
    const raw = localStorage.getItem(LODGING_PICKS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LodgingPickRecord>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLodgingPicks(m: Record<string, LodgingPickRecord>): void {
  try {
    localStorage.setItem(LODGING_PICKS_KEY, JSON.stringify(m));
  } catch {
    /* silent */
  }
}

function writeCommittedBase(meta: BaseCommitMeta | null): void {
  try {
    if (meta == null) {
      localStorage.removeItem(COMMITTED_BASE_KEY);
      localStorage.removeItem(COMMITTED_BASE_META_KEY);
    } else {
      localStorage.setItem(COMMITTED_BASE_KEY, meta.baseId);
      localStorage.setItem(COMMITTED_BASE_META_KEY, JSON.stringify(meta));
    }
  } catch {
    /* silent */
  }
}

export function readCommittedBaseMeta(): BaseCommitMeta | null {
  try {
    const raw = localStorage.getItem(COMMITTED_BASE_META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BaseCommitMeta;
    if (parsed && typeof parsed === 'object' && parsed.baseId) return parsed;
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Apply rows to local state. Rows MUST be sorted oldest→newest before calling.
// ---------------------------------------------------------------------------
function applyRows(rows: NoteRow[]): {
  appliedPicks: number;
  appliedUnpicks: number;
  baseCommit: BaseCommitMeta | null;
  baseUncommitted: boolean;
} {
  const shortlist = readShortlistMap();
  const lodging = readLodgingPicks();
  let appliedPicks = 0;
  let appliedUnpicks = 0;
  let baseCommit: BaseCommitMeta | null = null;
  let baseUncommitted = false;

  for (const row of rows) {
    const action = actionFromNote(row.note_text);
    const parsed = parseActivityId(row.activity_id);
    if (!action) continue;

    // base-config: special-cased — single-value key, not a map.
    if (action === 'base-config-committed' && parsed && parsed.type === 'base-config') {
      baseCommit = {
        baseId: parsed.id,
        label: parseLabel(row.note_text, parsed.id),
        by: authorOf(row),
        committed_at: row.created_at,
      };
      baseUncommitted = false;
      continue;
    }
    if (action === 'base-config-uncommitted' && parsed && parsed.type === 'base-config') {
      baseCommit = null;
      baseUncommitted = true;
      continue;
    }

    if (!parsed) continue;

    // lodging picks live in their own map.
    if (parsed.type === 'lodging') {
      if (action === 'picked') {
        lodging[parsed.id] = { picked_at: row.created_at, by: authorOf(row) };
        appliedPicks++;
      } else if (action === 'unpicked') {
        if (lodging[parsed.id]) {
          delete lodging[parsed.id];
          appliedUnpicks++;
        }
      }
      continue;
    }

    // Shortlist-shared map (nature / activity / water / lake / sunset).
    if (SHORTLIST_TYPES.has(parsed.type)) {
      const compoundKey = `${parsed.type}:${parsed.id}`;
      if (action === 'picked') {
        shortlist[compoundKey] = {
          id: parsed.id,
          type: parsed.type as ShortlistTypeLite,
          label: parseLabel(row.note_text, parsed.id),
          picked_at: row.created_at,
          by: authorOf(row),
        };
        appliedPicks++;
      } else if (action === 'unpicked') {
        if (shortlist[compoundKey]) {
          delete shortlist[compoundKey];
          appliedUnpicks++;
        }
      }
    }
  }

  writeShortlistMap(shortlist);
  writeLodgingPicks(lodging);

  // Apply base-commit decision LAST so the latest wins. Only touch if we saw
  // a base-config row this sync — otherwise leave the local key alone.
  if (baseCommit) {
    writeCommittedBase(baseCommit);
  } else if (baseUncommitted) {
    writeCommittedBase(null);
  }

  try {
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch {
    /* silent */
  }

  return { appliedPicks, appliedUnpicks, baseCommit, baseUncommitted };
}

// ---------------------------------------------------------------------------
// Network: fetch all pick-relevant rows from austria_notes.
// ---------------------------------------------------------------------------
async function fetchPickRows(): Promise<NoteRow[]> {
  // PostgREST `or=(...)` clauses must escape the commas inside parens. The
  // `note_text=like.*` form works with anon-key + RLS allow-read.
  const params = new URLSearchParams({
    select: 'id,created_at,activity_id,note_text,author',
    order: 'created_at.asc',
    or: '(note_text.like.[picked]%,note_text.like.[unpicked]%,note_text.like.[base-config-committed]%,note_text.like.[base-config-uncommitted]%)',
  });
  const url = `${SUPABASE_URL}/rest/v1/austria_notes?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`sync-picks fetch failed (${res.status}): ${body.slice(0, 200)}`);
  }
  return (await res.json()) as NoteRow[];
}

// ---------------------------------------------------------------------------
// Public API — call from each page-*.ts on init. Idempotent + safe to call
// multiple times; second invocation per session is a no-op until 60s passes.
// ---------------------------------------------------------------------------
let inFlight: Promise<void> | null = null;
let lastRunAt = 0;

export interface SyncPicksOptions {
  /** Force re-fetch even if we synced within the last 60s. Default: false. */
  force?: boolean;
  /** Fire 'picks-synced' even when nothing changed. Default: true. */
  alwaysEmit?: boolean;
}

export async function syncPicksFromSupabase(opts: SyncPicksOptions = {}): Promise<void> {
  const force = opts.force ?? false;
  const alwaysEmit = opts.alwaysEmit ?? true;
  const now = Date.now();
  if (!force && now - lastRunAt < 60_000 && inFlight === null) {
    if (alwaysEmit) emitSyncedEvent({ skipped: true });
    return;
  }
  if (inFlight) return inFlight;

  inFlight = (async (): Promise<void> => {
    try {
      const rows = await fetchPickRows();
      const result = applyRows(rows);
      lastRunAt = Date.now();
      emitSyncedEvent({ skipped: false, ...result, rowCount: rows.length });
    } catch (err) {
      // FAIL LOUD per CLAUDE.md: a tool that defaults to silence when data
      // is missing is a tool that lies about its own competence.
      // eslint-disable-next-line no-console
      console.error('[sync-picks] FAILED — picks may be stale on this device', err);
      emitSyncFailedEvent(err);
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

function emitSyncedEvent(detail: Record<string, unknown>): void {
  try {
    window.dispatchEvent(new CustomEvent('picks-synced', { detail }));
  } catch {
    /* environments without CustomEvent — skip */
  }
}

function emitSyncFailedEvent(err: unknown): void {
  try {
    window.dispatchEvent(
      new CustomEvent('picks-sync-failed', {
        detail: { error: err instanceof Error ? err.message : String(err) },
      }),
    );
  } catch {
    /* skip */
  }
}

/**
 * Fire-and-forget wrapper — kicks off the sync without making the caller
 * await. Returns immediately. Use from page-*.ts top-level init code.
 */
export function startPicksSync(opts: SyncPicksOptions = {}): void {
  void syncPicksFromSupabase(opts);
}

// ---------------------------------------------------------------------------
// Read-only helper for page-recommendations.ts — gives a unified picked-list
// view across nature/activity/water/lake/sunset (the "Picked by both" section).
// ---------------------------------------------------------------------------
export interface PickedItem {
  type: ShortlistTypeLite | 'lodging';
  id: string;
  label: string;
  by: 'avital' | 'allison';
  picked_at: string;
}

export function getAllPickedItems(): PickedItem[] {
  const out: PickedItem[] = [];
  const shortlist = readShortlistMap();
  Object.values(shortlist).forEach((r) => {
    out.push({
      type: r.type,
      id: r.id,
      label: r.label,
      by: r.by,
      picked_at: r.picked_at,
    });
  });
  const lodging = readLodgingPicks();
  Object.entries(lodging).forEach(([id, rec]) => {
    out.push({
      type: 'lodging',
      id,
      label: id, // lodging label isn't stored locally — id is best we've got
      by: rec.by,
      picked_at: rec.picked_at,
    });
  });
  return out.sort((a, b) => a.picked_at.localeCompare(b.picked_at));
}
