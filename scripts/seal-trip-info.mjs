// ===========================================================================
// seal-trip-info.mjs — encrypts the private trip facts and stores the
// CIPHERTEXT in Supabase. Run locally; never commit the plaintext.
//
// Why this exists: Allison wanted the booking details (addresses, check-in
// times, confirmation numbers, car hire) inside the trip site, behind a
// login. But the site is PUBLIC — public GitHub repo, public GitHub Pages,
// public Supabase anon key. A client-side "login" alone would be theatre:
// anyone could read the source or query the table.
//
// So the real protection is encryption, not the form:
//   • The payload is encrypted with AES-GCM 256.
//   • The key is derived with PBKDF2 (SHA-256, 250k iterations) from her
//     password, salted with her login name.
//   • Only the CIPHERTEXT goes to Supabase. No plaintext AND NO PASSWORD is in the repo,
//     the built bundle, or the GitHub source. Someone with the anon key gets
//     an opaque blob.
//   • The honest limit, told to her plainly: the password is a common word,
//     so an attacker who FINDS the blob and TARGETS her could brute-force it.
//     It is real protection against casual/accidental exposure, not against a
//     determined attacker. She chose this trade-off with that stated.
//
// Usage:  node scripts/seal-trip-info.mjs <path-to-plaintext.json>
// The plaintext file must live OUTSIDE the repo (use the scratchpad).
// ===========================================================================

import fs from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const SUPABASE_URL = 'https://hpiyvnfhoqnnnotrmwaz.supabase.co';
const ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwaXl2bmZob3Fubm5vdHJtd2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzIwNDEsImV4cCI6MjA4ODA0ODA0MX0.AsGhYitkSnyVMwpJII05UseS_gICaXiCy7d8iHsr6Qw';

// Must match src/info.ts exactly.
const LOGIN = 'allisonecalt';
// NEVER put a default here. A literal in this file is published: the repo is
// public, and this file also carries the PBKDF2 salt (LOGIN) and the Supabase
// anon key — so a default password hands over all three key inputs at once.
// That exact mistake was made and caught on 2026-07-23 by the audit sweep,
// which decrypted the live bookings straight from the repo. Fail closed.
const PASSWORD = process.env.TRIP_INFO_PASSWORD;
if (!PASSWORD) {
  console.error('✗ refusing to seal: set TRIP_INFO_PASSWORD in the environment.');
  console.error('  e.g.  TRIP_INFO_PASSWORD=... node scripts/seal-trip-info.mjs <file>');
  process.exit(1);
}
const ITERATIONS = 250000;
const STATE_KEY = 'trip_info_enc';

const b64 = (buf) => Buffer.from(buf).toString('base64');

async function deriveKey(password, login) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      // Salt is the login name — so BOTH the name and the password are needed.
      salt: enc.encode(`austria-2026:${login.toLowerCase()}`),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

const src = process.argv[2];
if (!src) {
  console.error('usage: node scripts/seal-trip-info.mjs <plaintext.json>');
  process.exit(1);
}
if (fs.realpathSync(src).startsWith(fs.realpathSync('.'))) {
  console.error('✗ refusing: the plaintext file is inside the repo. Put it in a scratchpad.');
  process.exit(2);
}

const plaintext = fs.readFileSync(src, 'utf8');
JSON.parse(plaintext); // fail loudly on malformed input rather than sealing junk

const key = await deriveKey(PASSWORD, LOGIN);
const iv = crypto.getRandomValues(new Uint8Array(12));
const ct = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  new TextEncoder().encode(plaintext),
);

const payload = { v: 1, iter: ITERATIONS, iv: b64(iv), ct: b64(ct) };

const res = await fetch(`${SUPABASE_URL}/rest/v1/austria_2026_state?on_conflict=key`, {
  method: 'POST',
  headers: {
    apikey: ANON,
    Authorization: `Bearer ${ANON}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal',
  },
  body: JSON.stringify({ key: STATE_KEY, value: payload }),
});

if (!res.ok) {
  console.error(`✗ upload failed (${res.status}): ${await res.text()}`);
  process.exit(3);
}
console.log(
  `✓ sealed ${plaintext.length} chars → ${STATE_KEY} (ciphertext ${payload.ct.length} b64 chars)`,
);
console.log('  plaintext stayed local and was NOT written into the repo.');
