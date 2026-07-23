// ===========================================================================
// outbox.ts — the offline write queue for the shopping list.
//
// Why this exists: the single most likely real failure of this whole app is
//   her standing in a Spar in Bad Goisern with no signal, adding "milk", and
//   losing it. Optimistic UI alone does not fix that — it just shows the item
//   until the page reloads, then the item is gone. That is the app lying.
//
// So every mutation goes through here:
//   • Try it on the network immediately.
//   • If it fails, PERSIST it to localStorage and keep the optimistic row.
//   • Flush automatically when the browser comes back online, and on load.
//   • The UI is told how many writes are still waiting, so she is never
//     misled into thinking a change is saved when it is not.
//
// This is the one place localStorage holds real state, and it is deliberate:
// it is a transient outbox, not the record. The record is still Supabase, and
// the queue drains into it. Nothing ends up only on her phone for long.
// ===========================================================================

const KEY = 'austria_grocery_outbox_v1';

export type PendingOp =
  | { kind: 'add'; tempId: string; name: string; section: string; quantity: number; addedBy: string }
  | { kind: 'update'; id: string; checked: boolean }
  | { kind: 'delete'; id: string };

export interface OutboxHandlers {
  add: (name: string, section: string, quantity: number, addedBy: string) => Promise<{ id: string }>;
  update: (id: string, patch: { checked: boolean }) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

function read(): PendingOp[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingOp[]) : [];
  } catch {
    return [];
  }
}

function write(ops: PendingOp[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ops));
  } catch {
    /* storage blocked — nothing better we can do, and the UI still says pending */
  }
}

export function pendingCount(): number {
  return read().length;
}

export function enqueue(op: PendingOp): void {
  const ops = read();
  // Collapse redundant ops on the same row so a dozen taps don't queue a dozen
  // writes: the last state of a row is the only one that matters.
  if (op.kind === 'update') {
    const i = ops.findIndex((o) => o.kind === 'update' && o.id === op.id);
    if (i >= 0) {
      ops[i] = op;
      write(ops);
      return;
    }
  }
  if (op.kind === 'delete') {
    // A delete supersedes any queued update on the same row.
    const kept = ops.filter((o) => !((o.kind === 'update' || o.kind === 'delete') && o.id === op.id));
    kept.push(op);
    write(kept);
    return;
  }
  ops.push(op);
  write(ops);
}

/** Drop a queued add that was never synced (she deleted it while offline). */
export function dropPendingAdd(tempId: string): boolean {
  const ops = read();
  const kept = ops.filter((o) => !(o.kind === 'add' && o.tempId === tempId));
  if (kept.length === ops.length) return false;
  write(kept);
  return true;
}

/**
 * Try to send everything queued. Stops at the first failure and keeps the rest
 * — order matters (an update to a row that has not been created yet would 404).
 * Returns how many ops drained, and how many are still waiting.
 */
export async function flush(
  handlers: OutboxHandlers,
  onIdMapped?: (tempId: string, realId: string) => void,
): Promise<{ sent: number; remaining: number }> {
  let ops = read();
  let sent = 0;

  while (ops.length > 0) {
    const op = ops[0];
    try {
      if (op.kind === 'add') {
        const row = await handlers.add(op.name, op.section, op.quantity, op.addedBy);
        onIdMapped?.(op.tempId, row.id);
        // Any queued op that referred to the temp id now refers to the real one.
        ops = ops.map((o) =>
          o.kind !== 'add' && o.id === op.tempId ? { ...o, id: row.id } : o,
        ) as PendingOp[];
      } else if (op.kind === 'update') {
        await handlers.update(op.id, { checked: op.checked });
      } else {
        await handlers.remove(op.id);
      }
    } catch {
      // Still offline (or the row is gone). Keep the queue and stop.
      write(ops);
      return { sent, remaining: ops.length };
    }
    ops.shift();
    sent++;
    write(ops);
  }

  write([]);
  return { sent, remaining: 0 };
}

/** Call once per page: drain on load and whenever the connection returns. */
export function autoFlush(
  handlers: OutboxHandlers,
  after: (r: { sent: number; remaining: number }) => void,
  onIdMapped?: (tempId: string, realId: string) => void,
): void {
  const run = (): void => {
    if (pendingCount() === 0) return;
    void flush(handlers, onIdMapped).then(after);
  };
  window.addEventListener('online', run);
  run();
}
