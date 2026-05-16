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
}

export interface InsertNoteInput {
  option: NoteOption;
  day_id?: string | null;
  activity_id?: string | null;
  note_text: string;
  author?: string;
}

export async function insertNote(input: InsertNoteInput): Promise<Note> {
  const body = {
    option: input.option,
    day_id: input.day_id ?? null,
    activity_id: input.activity_id ?? null,
    note_text: input.note_text,
    author: input.author ?? 'avital',
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

export async function listNotes(): Promise<Note[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/austria_notes?select=*&order=created_at.desc`, {
    headers,
  });
  if (!res.ok) {
    throw new Error(`List failed (${res.status})`);
  }
  return (await res.json()) as Note[];
}
