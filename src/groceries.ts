// ===========================================================================
// groceries.ts — renders groceries.html: the trip shopping list.
//
// What this is: the Allison + Avital section of her apartment Grocery app,
//   rebuilt inside the Austria site so there is nothing to jump out to.
// Why it exists (Allison, Jul 23 2026): "make a duplicate of apt grocery app
//   just avital and allison section and put that in austria app... we should
//   have all the functionality to add stuff to our grocery so we can use on
//   trip or take off... like one stop shop for austria."
// Decided:
//   • Same `grocery_items` table as the apartment app — so Claude and both
//     apps read the same data — but scoped to list_type 'austria_2026'. The
//     trip list must not pollute the Jerusalem apartment list.
//   • Autocomplete reuses `grocery_catalog`, the vocabulary the apartment app
//     already built up. Typing "milk" offers the section she already assigned.
//   • Grouped by supermarket section, because that is the order you walk a
//     Spar — not the order you thought of things.
//   • Optimistic UI with a rollback: a tap must feel instant on a phone with
//     one bar of alpine signal, but a failed write has to say so, not lie.
// Mobile: one-thumb. 48px rows, big add bar pinned at the bottom of the card,
//   no hover-only affordances.
// ===========================================================================

import {
  addGrocery,
  copyToTripList,
  deleteGrocery,
  listApartmentItems,
  listCatalog,
  listGroceries,
  updateGrocery,
  type CatalogEntry,
  type GroceryItem,
} from './supabase.js';
import { autoFlush, dropPendingAdd, enqueue, pendingCount } from './outbox.js';
import { mountNotes } from './notes.js';
import { mountNav } from './nav.js';

const SECTIONS = [
  'Fruit',
  'Vegetables',
  'Dairy',
  'Bread & Wraps',
  'Meat & Fish',
  'Pantry',
  'Grains & Pasta',
  'Snacks & Chocolate',
  'Beverages',
  'Frozen',
  'Baking',
  'Spices',
  'Oils & Vinegar',
  'Nuts & Seeds',
  'Wine & Beer',
  'Personal Care',
  'Cleaning',
  'Other',
];

let items: GroceryItem[] = [];
let catalog: CatalogEntry[] = [];

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

function status(msg: string): void {
  const s = document.getElementById('g-status');
  if (s) s.textContent = msg;
}

function sectionRank(name: string): number {
  const i = SECTIONS.indexOf(name);
  return i < 0 ? SECTIONS.length : i;
}

// --- one row ----------------------------------------------------------------
function itemRow(item: GroceryItem): HTMLElement {
  const li = el('li', item.checked ? 'gi done' : 'gi');
  li.setAttribute('data-id', item.id);

  const box = el('button', 'gi-check');
  box.type = 'button';
  box.textContent = item.checked ? '✓' : '';
  box.setAttribute('aria-label', item.checked ? 'Uncheck' : 'Check off');
  box.setAttribute('aria-pressed', String(item.checked));
  box.addEventListener('click', () => void toggle(item));
  li.appendChild(box);

  const mid = el('div', 'gi-mid');
  const name = el('span', 'gi-name', item.item_name);
  mid.appendChild(name);
  if (item.quantity > 1) mid.appendChild(el('span', 'gi-qty', `×${item.quantity}`));
  li.appendChild(mid);

  const del = el('button', 'gi-del', '✕');
  del.type = 'button';
  del.setAttribute('aria-label', `Remove ${item.item_name}`);
  del.addEventListener('click', () => void removeItem(item));
  li.appendChild(del);

  return li;
}

// --- render -----------------------------------------------------------------
function render(): void {
  const mount = document.getElementById('g-list');
  if (!mount) return;
  mount.innerHTML = '';

  const open = items.filter((i) => !i.checked);
  const done = items.filter((i) => i.checked);

  const counter = document.getElementById('g-count');
  if (counter) {
    counter.textContent =
      items.length === 0 ? '' : `${open.length} to buy · ${done.length} in the cart`;
  }

  if (items.length === 0) {
    mount.appendChild(
      el(
        'p',
        'g-empty',
        'Nothing on the list yet. Add the first thing below — it saves for both of you straight away.',
      ),
    );
    return;
  }

  // Group the not-yet-bought items by supermarket section.
  const groups = new Map<string, GroceryItem[]>();
  for (const i of open) {
    const sec = i.section ?? 'Other';
    if (!groups.has(sec)) groups.set(sec, []);
    groups.get(sec)!.push(i);
  }
  const ordered = [...groups.entries()].sort((a, b) => sectionRank(a[0]) - sectionRank(b[0]));

  for (const [sec, list] of ordered) {
    const wrap = el('section', 'gsec');
    wrap.appendChild(el('h2', 'gsec-h', sec));
    const ul = el('ul', 'gi-list');
    for (const i of list) ul.appendChild(itemRow(i));
    wrap.appendChild(ul);
    mount.appendChild(wrap);
  }

  if (done.length > 0) {
    const wrap = el('section', 'gsec gsec-done');
    const head = el('div', 'gsec-donehead');
    head.appendChild(el('h2', 'gsec-h', `In the cart (${done.length})`));
    const clear = el('button', 'g-clear', 'Clear these');
    clear.type = 'button';
    clear.addEventListener('click', () => void clearChecked());
    head.appendChild(clear);
    wrap.appendChild(head);
    const ul = el('ul', 'gi-list');
    for (const i of done) ul.appendChild(itemRow(i));
    wrap.appendChild(ul);
    mount.appendChild(wrap);
  }
}

// --- actions (optimistic, with honest rollback) ------------------------------
async function toggle(item: GroceryItem): Promise<void> {
  const next = !item.checked;
  item.checked = next;
  render();
  try {
    await updateGrocery(item.id, { checked: next });
    syncNote();
  } catch {
    // Do NOT roll back: in a shop with no signal, undoing her tick would be
    // the wrong lie. Keep it ticked, queue the write, and say it's waiting.
    enqueue({ kind: 'update', id: item.id, checked: next });
    syncNote();
  }
}

async function removeItem(item: GroceryItem): Promise<void> {
  items = items.filter((i) => i.id !== item.id);
  render();
  // Something added offline and deleted again never needs to reach the server.
  if (dropPendingAdd(item.id)) {
    syncNote();
    return;
  }
  try {
    await deleteGrocery(item.id);
    syncNote();
  } catch {
    enqueue({ kind: 'delete', id: item.id });
    syncNote();
  }
}

async function clearChecked(): Promise<void> {
  const done = items.filter((i) => i.checked);
  if (done.length === 0) return;
  items = items.filter((i) => !i.checked);
  render();
  for (const i of done) {
    if (dropPendingAdd(i.id)) continue;
    try {
      await deleteGrocery(i.id);
    } catch {
      enqueue({ kind: 'delete', id: i.id });
    }
  }
  syncNote();
}

/** Her ask, Jul 23: "also bring in the shopping list already on apt app —
 *  that is relevant." Done once by hand; this is the button so she never has
 *  to ask again. Copies only unchecked items, and only ones not already here. */
async function pullFromApartment(): Promise<void> {
  const btn = document.getElementById('g-pull') as HTMLButtonElement | null;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'checking…';
  }
  try {
    const apt = await listApartmentItems();
    const n = await copyToTripList(apt);
    if (n > 0) {
      items = await listGroceries();
      render();
      status(`✓ brought in ${n} item${n > 1 ? 's' : ''} from the apartment list`);
    } else {
      status('nothing new on the apartment list — you already have it all');
    }
  } catch {
    status('⚠ could not reach the apartment list — check your signal');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '⬇ Bring in from apartment list';
    }
  }
}

async function submitAdd(): Promise<void> {
  const input = document.getElementById('g-input') as HTMLInputElement | null;
  const qtyEl = document.getElementById('g-qty') as HTMLInputElement | null;
  const secEl = document.getElementById('g-sec') as HTMLSelectElement | null;
  const whoEl = document.getElementById('g-who') as HTMLSelectElement | null;
  if (!input) return;

  const name = input.value.trim();
  if (name === '') return;
  const qty = Math.max(1, Number(qtyEl?.value ?? 1) || 1);
  // If she didn't pick a section, borrow the one the catalog already knows.
  const known = catalog.find((c) => c.name.toLowerCase() === name.toLowerCase());
  const section = secEl?.value || known?.section || 'Other';

  input.value = '';
  if (qtyEl) qtyEl.value = '1';
  if (secEl) secEl.value = '';
  hideAuto();
  status('saving…');

  const addedBy = whoEl?.value ?? '';
  try {
    const row = await addGrocery(name, section, qty, addedBy);
    items.push(row);
    render();
    syncNote();
  } catch {
    // Offline: keep the item on screen with a temporary id, and queue the
    // write. Losing what she typed in a supermarket is the failure that
    // matters most here, so this path must never drop it.
    const tempId = `local-${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
    items.push({
      id: tempId,
      list_type: 'austria_2026',
      item_name: name,
      section,
      checked: false,
      quantity: qty,
      paid_by: 'joint',
      added_by: addedBy,
      created_at: new Date().toISOString(),
    });
    enqueue({ kind: 'add', tempId, name, section, quantity: qty, addedBy });
    render();
    syncNote();
  }
}

// --- autocomplete from the catalog the apartment app already built -----------
function hideAuto(): void {
  const box = document.getElementById('g-auto');
  if (box) box.style.display = 'none';
}

function onInput(): void {
  const input = document.getElementById('g-input') as HTMLInputElement | null;
  const box = document.getElementById('g-auto');
  if (!input || !box) return;
  const q = input.value.trim().toLowerCase();
  if (q.length < 2) {
    hideAuto();
    return;
  }
  const hits = catalog.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  if (hits.length === 0) {
    hideAuto();
    return;
  }
  box.innerHTML = '';
  for (const h of hits) {
    const b = el('button', 'g-auto-item');
    b.type = 'button';
    b.innerHTML = `<span>${h.name}</span><span class="g-auto-sec">${h.section ?? ''}</span>`;
    b.addEventListener('click', () => {
      input.value = h.name;
      const secEl = document.getElementById('g-sec') as HTMLSelectElement | null;
      if (secEl && h.section) secEl.value = h.section;
      hideAuto();
      input.focus();
    });
    box.appendChild(b);
  }
  box.style.display = 'block';
}

function wireAddBar(): void {
  const secEl = document.getElementById('g-sec') as HTMLSelectElement | null;
  if (secEl) {
    for (const s of SECTIONS) {
      const o = document.createElement('option');
      o.value = s;
      o.textContent = s;
      secEl.appendChild(o);
    }
  }
  document.getElementById('g-add')?.addEventListener('click', () => void submitAdd());
  document.getElementById('g-pull')?.addEventListener('click', () => void pullFromApartment());
  const input = document.getElementById('g-input') as HTMLInputElement | null;
  input?.addEventListener('input', onInput);
  input?.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') {
      e.preventDefault();
      void submitAdd();
    }
  });
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.g-addwrap')) hideAuto();
  });
}

/** One line of truth about whether what she sees has actually been saved. */
function syncNote(): void {
  const n = pendingCount();
  if (n === 0) {
    status(navigator.onLine ? '' : 'offline — everything here is saved');
    return;
  }
  status(`offline · ${n} change${n > 1 ? 's' : ''} waiting to sync — they are safe, they will send when you get signal`);
}

/** Drain the queue on load and whenever the connection comes back. */
function startSync(): void {
  autoFlush(
    {
      add: (name, section, quantity, addedBy) => addGrocery(name, section, quantity, addedBy),
      update: (id, patch) => updateGrocery(id, patch),
      remove: (id) => deleteGrocery(id),
    },
    (r) => {
      if (r.sent > 0) {
        void listGroceries()
          .then((rows) => {
            items = rows;
            render();
          })
          .catch(() => undefined);
      }
      syncNote();
    },
    (tempId, realId) => {
      const row = items.find((i) => i.id === tempId);
      if (row) row.id = realId;
    },
  );
}

async function main(): Promise<void> {
  wireAddBar();
  status('loading…');
  try {
    [items, catalog] = await Promise.all([listGroceries(), listCatalog().catch(() => [])]);
    status('');
  } catch {
    status('⚠ could not load the list — check your signal and reload');
  }
  render();
  startSync();
  syncNote();
  window.addEventListener('offline', syncNote);
  window.addEventListener('online', syncNote);
  mountNotes();
}

void main();

mountNav();
