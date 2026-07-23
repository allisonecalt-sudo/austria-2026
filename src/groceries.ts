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
  deleteGrocery,
  listCatalog,
  listGroceries,
  updateGrocery,
  type CatalogEntry,
  type GroceryItem,
} from './supabase.js';
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
    status('');
  } catch {
    item.checked = !next; // roll back — never leave a lie on screen
    render();
    status('⚠ could not save that — check your signal and tap again');
  }
}

async function removeItem(item: GroceryItem): Promise<void> {
  const snapshot = [...items];
  items = items.filter((i) => i.id !== item.id);
  render();
  try {
    await deleteGrocery(item.id);
    status('');
  } catch {
    items = snapshot;
    render();
    status('⚠ could not remove that — tap again');
  }
}

async function clearChecked(): Promise<void> {
  const done = items.filter((i) => i.checked);
  if (done.length === 0) return;
  const snapshot = [...items];
  items = items.filter((i) => !i.checked);
  render();
  try {
    await Promise.all(done.map((i) => deleteGrocery(i.id)));
    status('');
  } catch {
    items = snapshot;
    render();
    status('⚠ could not clear those — tap again');
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

  try {
    const row = await addGrocery(name, section, qty, whoEl?.value ?? '');
    items.push(row);
    render();
    status('');
  } catch {
    input.value = name; // give her the text back rather than swallowing it
    status('⚠ could not add that — tap + Add again');
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
  mountNotes();
}

void main();

mountNav();
