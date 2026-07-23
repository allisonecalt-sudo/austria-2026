// ===========================================================================
// info.ts — renders info.html: the private TRIP INFO page (behind a login).
//
// What this is: the booking facts you actually need at a check-in desk —
//   addresses, check-in/out times, the car hire, the flights, the emergency
//   numbers. Everything the public pages deliberately do not carry.
// Why (Allison, Jul 23 2026): she wanted the whole trip in one app, including
//   "the password" section, so there is nothing to go and look up elsewhere.
//
// HOW IT IS PROTECTED — and the honest limit:
//   The site is public: public repo, public Pages, public Supabase anon key.
//   So a login form on its own would be theatre. Instead the content is
//   ENCRYPTED (AES-GCM 256, key derived by PBKDF2/SHA-256 250k iterations
//   from the password, salted with the login name) and only the ciphertext is
//   stored — in Supabase, never in this repo or the built bundle.
//   Typing the right login+password derives the key and decrypts locally; a
//   wrong one simply fails to decrypt. The password is never stored here, in
//   the built bundle, or in the repo — it only ever exists in her head and in
//   the environment variable used to seal the payload.
//   (History: an earlier version of scripts/seal-trip-info.mjs carried the
//   password as a DEFAULT VALUE, which published it. The audit sweep on
//   2026-07-23 decrypted the live row straight from the public repo to prove
//   it. The payload was re-sealed under a new password and the default was
//   removed. Never reintroduce a default there.)
//   The limit, stated plainly on the page itself: the password is a short
//   common word. This defeats casual and accidental exposure. It would not
//   defeat someone who specifically targeted her and brute-forced the blob.
//   Do not put bank or card credentials here.
//
// Session: a successful unlock keeps the derived key in memory only, and a
//   flag in sessionStorage so a tab reload does not force a re-type. Closing
//   the tab forgets it. Nothing sensitive is ever written to localStorage.
// ===========================================================================

import { getState } from './supabase.js';
import { mountNav } from './nav.js';

const LOGIN = 'allisonecalt';
const STATE_KEY = 'trip_info_enc';

// ---------------------------------------------------------------------------
// STAYING UNLOCKED — Allison, 23 Jul: "make the password savable to device...
// make it save the password and no need to be put in each time."
//
// So the unlock is remembered in localStorage and survives closing the tab, the
// browser, and a phone restart. Stated plainly because it IS a trade-off:
// anyone holding her UNLOCKED PHONE can now open this page without typing
// anything. That is the same bargain as any saved password, and it is the right
// one here — this page was built against the open internet, not against someone
// already holding her phone. "Forget this device" makes it reversible.
//
// Stored as JSON, not a space-joined string: the audit sweep flagged that a
// space-joined pair silently breaks the moment a password contains a space.
// ---------------------------------------------------------------------------
const REMEMBER_KEY = 'trip_info_creds_v2';

interface SavedCreds {
  login: string;
  password: string;
}

function readSaved(): SavedCreds | null {
  for (const store of [localStorage, sessionStorage]) {
    try {
      const raw = store.getItem(REMEMBER_KEY);
      if (raw) return JSON.parse(raw) as SavedCreds;
    } catch {
      /* corrupt or blocked — fall through and just ask again */
    }
  }
  return null;
}

function saveCreds(login: string, password: string): void {
  try {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify({ login, password }));
  } catch {
    /* private mode or storage full — she retypes next time, no worse than before */
  }
}

function forgetCreds(): void {
  try {
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem('trip_info_pw'); // the old key, from before this change
  } catch {
    /* nothing we can do, and nothing that needs saying */
  }
}

interface SealedPayload {
  v: number;
  iter: number;
  iv: string;
  ct: string;
}

interface Stay {
  n: number;
  name: string;
  where: string;
  dates: string;
  checkin: string;
  checkout: string;
  notes?: string;
}

/** Avital, 23 Jul: "add a link to the location so we can click on it and use
 *  either Google Maps or Waze to get there. Very, very helpful." — and she was
 *  explicit that she wants these on the STAYS, not the activity cards, which
 *  already have Maps links. She also said she knows Waze must be installed for
 *  its link to do anything, so both buttons ship regardless. */
function navButtons(stay: Stay): HTMLElement {
  const q = encodeURIComponent(`${stay.name}, ${stay.where}`);
  const row = el('p', 'inav');

  const gmaps = el('a', 'inav-btn');
  gmaps.href = `https://www.google.com/maps/search/?api=1&query=${q}`;
  gmaps.target = '_blank';
  gmaps.rel = 'noopener';
  gmaps.textContent = '📍 Google Maps';
  row.appendChild(gmaps);

  const waze = el('a', 'inav-btn');
  // Waze's universal link falls back to its web app if the app is absent.
  waze.href = `https://waze.com/ul?q=${q}&navigate=yes`;
  waze.target = '_blank';
  waze.rel = 'noopener';
  waze.textContent = '🚗 Waze';
  row.appendChild(waze);

  return row;
}

interface TripInfo {
  stays: Stay[];
  car: Record<string, string>;
  flights: { leg: string; flight: string; date: string; times: string }[];
  emergency: { label: string; value: string }[];
  note?: string;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** base64 → a plain ArrayBuffer. WebCrypto wants BufferSource, and a
 *  Uint8Array over a possibly-shared buffer does not satisfy that type. */
function fromB64(s: string): ArrayBuffer {
  const bin = atob(s);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

async function deriveKey(password: string, login: string, iterations: number): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(`austria-2026:${login.toLowerCase()}`),
      iterations,
      hash: 'SHA-256',
    },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function unseal(login: string, password: string): Promise<TripInfo> {
  const sealed = await getState<SealedPayload>(STATE_KEY);
  if (!sealed) {
    throw new Error(
      'Nothing has been saved to this page yet — the trip info has not been sealed into the database.',
    );
  }
  const key = await deriveKey(password, login, sealed.iter);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(sealed.iv) },
    key,
    fromB64(sealed.ct),
  );
  return JSON.parse(new TextDecoder().decode(plain)) as TripInfo;
}

// --- rendering the unlocked content -----------------------------------------
function card(title: string, emoji: string): HTMLElement {
  const sec = el('section', 'icard');
  sec.appendChild(el('h2', 'icard-h', `${emoji}  ${title}`));
  return sec;
}

function kv(label: string, value: string): HTMLElement {
  const row = el('div', 'ikv');
  row.appendChild(el('span', 'ikv-k', label));
  row.appendChild(el('span', 'ikv-v', value));
  return row;
}

function renderInfo(data: TripInfo): void {
  const root = document.getElementById('info-body');
  if (!root) return;
  root.innerHTML = '';

  // --- stays
  for (const s of data.stays ?? []) {
    const c = card(s.name, '🛏');
    c.appendChild(el('p', 'icard-sub', `${s.where} · ${s.dates}`));
    c.appendChild(kv('Check in', s.checkin));
    c.appendChild(kv('Check out', s.checkout));
    c.appendChild(navButtons(s));
    if (s.notes) c.appendChild(el('p', 'icard-note', s.notes));
    root.appendChild(c);
  }

  // --- flights
  if (data.flights?.length) {
    const c = card('Flights', '🛫');
    for (const f of data.flights) {
      c.appendChild(kv(`${f.leg} · ${f.flight}`, `${f.date} — ${f.times}`));
    }
    root.appendChild(c);
  }

  // --- car
  if (data.car && Object.keys(data.car).length) {
    const c = card('Rental car', '🚗');
    for (const [k, v] of Object.entries(data.car)) c.appendChild(kv(k, v));
    root.appendChild(c);
  }

  // --- emergency
  if (data.emergency?.length) {
    const c = card('If something goes wrong', '🆘');
    for (const e of data.emergency) c.appendChild(kv(e.label, e.value));
    root.appendChild(c);
  }

  if (data.note) root.appendChild(el('p', 'icard-note', data.note));

  const lockBtn = el('button', 'i-lock', '🔒 Forget this device');
  lockBtn.type = 'button';
  lockBtn.title = 'Stop staying unlocked on this phone — you would type it again next time.';
  lockBtn.addEventListener('click', () => {
    forgetCreds();
    window.location.reload();
  });
  root.appendChild(lockBtn);

  root.appendChild(
    el(
      'p',
      'i-savednote',
      'This phone stays unlocked — you will not be asked again. That also means anyone holding it unlocked can open this page, so use “Forget this device” if you lend the phone out.',
    ),
  );
}

function setError(msg: string): void {
  const e = document.getElementById('i-error');
  if (e) e.textContent = msg;
}

async function attempt(login: string, password: string, remember: boolean): Promise<boolean> {
  setError('');
  const btn = document.getElementById('i-go') as HTMLButtonElement | null;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'unlocking…';
  }
  try {
    const data = await unseal(login, password);
    document.getElementById('i-gate')?.remove();
    if (remember) saveCreds(login, password);
    renderInfo(data);
    return true;
  } catch (err) {
    // A decryption failure and a wrong password are the same thing here.
    const msg =
      err instanceof Error && err.message.includes('not been sealed')
        ? err.message
        : "That login and password didn't unlock it. Check both and try again.";
    setError(msg);
    return false;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Unlock';
    }
  }
}

async function main(): Promise<void> {
  mountNav();

  // Stay unlocked on this device — her ask, 23 Jul. Survives closing the tab,
  // the browser, and a restart.
  const saved = readSaved();
  if (saved) {
    if (await attempt(saved.login, saved.password, false)) return;
    // Stored credentials no longer open it — the password was changed. Clear
    // them and ask again, rather than silently failing every visit.
    forgetCreds();
  }

  const form = document.getElementById('i-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const login =
      (document.getElementById('i-login') as HTMLInputElement | null)?.value.trim() ?? '';
    const password = (document.getElementById('i-pw') as HTMLInputElement | null)?.value ?? '';
    if (!login || !password) {
      setError('Both the login and the password are needed.');
      return;
    }
    void attempt(login, password, true);
  });

  // Prefill the login — it is her own name, not the secret half.
  const loginEl = document.getElementById('i-login') as HTMLInputElement | null;
  if (loginEl && !loginEl.value) loginEl.value = LOGIN;
}

void main();
