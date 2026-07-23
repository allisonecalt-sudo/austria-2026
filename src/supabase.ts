// Supabase REST client — minimal, no SDK. The anon key is safe to expose in a public site
// because RLS allows only insert + select on austria_notes (no auth, no PII).

const SUPABASE_URL = 'https://hpiyvnfhoqnnnotrmwaz.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwaXl2bmZob3Fubm5vdHJtd2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzIwNDEsImV4cCI6MjA4ODA0ODA0MX0.AsGhYitkSnyVMwpJII05UseS_gICaXiCy7d8iHsr6Qw';

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export type NoteOption = 'A' | 'B' | 'general';
export type NoteStatus = 'pending' | 'seen' | 'applied';

export interface Note {
  id: string;
  created_at: string;
  option: NoteOption;
  day_id: string | null;
  activity_id: string | null;
  note_text: string;
  author: string;
  status: NoteStatus;
  image_url: string | null;
}

export interface InsertNoteInput {
  option: NoteOption;
  day_id?: string | null;
  activity_id?: string | null;
  note_text: string;
  author?: string;
  image_url?: string | null;
}

export async function insertNote(input: InsertNoteInput): Promise<Note> {
  const body = {
    option: input.option,
    day_id: input.day_id ?? null,
    activity_id: input.activity_id ?? null,
    note_text: input.note_text,
    author: input.author ?? 'avital',
    image_url: input.image_url ?? null,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/austria_notes`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Insert failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as Note[];
  return data[0];
}

// Upload a photo to the austria-notes-photos bucket. Returns the public URL.
// Filename pattern: {timestamp}-{random}.{ext} — no PII, collision-resistant.
// Throws on failure so the caller can surface a toast.
export async function uploadNotePhoto(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/austria-notes-photos/${filename}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': file.type || 'image/jpeg',
    },
    body: file,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Photo upload failed (${res.status}): ${text}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/austria-notes-photos/${filename}`;
}

export async function listNotes(): Promise<Note[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/austria_notes?select=*&order=created_at.desc`, {
    headers,
  });
  if (!res.ok) {
    throw new Error(`List failed (${res.status})`);
  }
  return (await res.json()) as Note[];
}

// ---------------------------------------------------------------------------
// austria_2026_state — generic key/value table for tandem-readable state.
// Added 2026-05-19 to migrate pre-trip checklist off localStorage (tandem
// rule per CLAUDE.md: Claude must be able to read every piece of state).
// Schema: id uuid pk, key text unique, value jsonb, updated_at timestamptz.
// RLS allow-all-anon (same as austria_notes — no PII, public trip site).
// ---------------------------------------------------------------------------

export interface StateRow {
  id: string;
  key: string;
  value: unknown;
  updated_at: string;
}

// Fetch a single state row by key. Returns null if not found.
export async function getState<T = unknown>(key: string): Promise<T | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/austria_2026_state?select=value&key=eq.${encodeURIComponent(key)}&limit=1`,
    { headers },
  );
  if (!res.ok) {
    throw new Error(`getState(${key}) failed (${res.status})`);
  }
  const rows = (await res.json()) as { value: T }[];
  return rows.length > 0 ? rows[0].value : null;
}

// Fetch all state rows whose keys match a prefix (e.g. "pretrip_").
export async function listStateByPrefix(prefix: string): Promise<StateRow[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/austria_2026_state?select=*&key=like.${encodeURIComponent(prefix)}*&order=updated_at.desc`,
    { headers },
  );
  if (!res.ok) {
    throw new Error(`listStateByPrefix(${prefix}) failed (${res.status})`);
  }
  return (await res.json()) as StateRow[];
}

// Upsert a single state key. Uses PostgREST on_conflict to merge by `key`.
export async function setState(key: string, value: unknown): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/austria_2026_state?on_conflict=key`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`setState(${key}) failed (${res.status}): ${text}`);
  }
}

// Delete a state row by key. No-op if missing.
export async function deleteState(key: string): Promise<void> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/austria_2026_state?key=eq.${encodeURIComponent(key)}`,
    { method: 'DELETE', headers },
  );
  if (!res.ok) {
    throw new Error(`deleteState(${key}) failed (${res.status})`);
  }
}

// ---------------------------------------------------------------------------
// grocery_items — the shopping list, shared with the apartment Grocery app
// (same table, same Supabase project). Added 2026-07-23 for her ask: "make a
// duplicate of apt grocery app just avital and allison section and put that in
// austria app... we should have all the functionality to add stuff to our
// grocery so we can use on trip or take off."
//
// Scoped to `list_type = 'austria_2026'` ON PURPOSE: the trip list must not
// mix with the Jerusalem apartment list. Same table so Claude and the grocery
// app can both read it, separate rows so neither pollutes the other.
// ---------------------------------------------------------------------------

export const TRIP_LIST = 'austria_2026';

export interface GroceryItem {
  id: string;
  list_type: string;
  item_name: string;
  section: string | null;
  checked: boolean;
  quantity: number;
  paid_by: string | null;
  added_by: string | null;
  created_at: string;
}

export async function listGroceries(): Promise<GroceryItem[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/grocery_items?select=*&list_type=eq.${TRIP_LIST}&order=created_at.asc`,
    { headers },
  );
  if (!res.ok) throw new Error(`listGroceries failed (${res.status})`);
  return (await res.json()) as GroceryItem[];
}

export async function addGrocery(
  name: string,
  section: string,
  quantity: number,
  addedBy: string,
): Promise<GroceryItem> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/grocery_items`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({
      list_type: TRIP_LIST,
      item_name: name,
      section: section || 'Other',
      quantity,
      paid_by: 'joint',
      added_by: addedBy,
    }),
  });
  if (!res.ok) throw new Error(`addGrocery failed (${res.status}): ${await res.text()}`);
  return ((await res.json()) as GroceryItem[])[0];
}

export async function updateGrocery(id: string, patch: Partial<GroceryItem>): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/grocery_items?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`updateGrocery failed (${res.status})`);
}

export async function deleteGrocery(id: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/grocery_items?id=eq.${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`deleteGrocery failed (${res.status})`);
}

/** Catalog = the autocomplete vocabulary the apartment app already built up. */
export interface CatalogEntry {
  id: string;
  name: string;
  section: string | null;
}

export async function listCatalog(): Promise<CatalogEntry[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/grocery_catalog?select=id,name,section&order=name`,
    {
      headers,
    },
  );
  if (!res.ok) throw new Error(`listCatalog failed (${res.status})`);
  return (await res.json()) as CatalogEntry[];
}

/** The apartment app's Allison+Avital list — the source for "bring in what
 *  we already had". Read-only here; copying is an explicit user action. */
export async function listApartmentItems(): Promise<GroceryItem[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/grocery_items?select=*&list_type=eq.allison_avital&checked=eq.false&order=created_at.asc`,
    { headers },
  );
  if (!res.ok) throw new Error(`listApartmentItems failed (${res.status})`);
  return (await res.json()) as GroceryItem[];
}

/** Copy rows into the trip list, skipping anything already on it by name. */
export async function copyToTripList(rows: GroceryItem[]): Promise<number> {
  const existing = await listGroceries();
  const have = new Set(existing.map((r) => r.item_name.toLowerCase()));
  const fresh = rows
    .filter((r) => !have.has(r.item_name.toLowerCase()))
    .map((r) => ({
      list_type: TRIP_LIST,
      item_name: r.item_name,
      section: r.section ?? 'Other',
      quantity: r.quantity,
      paid_by: 'joint',
      added_by: r.added_by ?? '',
    }));
  if (fresh.length === 0) return 0;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/grocery_items`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify(fresh),
  });
  if (!res.ok) throw new Error(`copyToTripList failed (${res.status})`);
  return fresh.length;
}
