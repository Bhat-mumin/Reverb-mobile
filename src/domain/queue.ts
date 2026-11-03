import type { RepeatMode } from './types';

/**
 * Pure playback-queue logic. No React, no audio: every function takes a state and returns a new one,
 * so shuffle/repeat/skip rules can be tested without a phone.
 */
export type QueueState = {
  /** Track ids in the order they will play (already shuffled when shuffle is on). */
  order: string[];
  /** The unshuffled sequence, kept so turning shuffle off restores it. */
  original: string[];
  index: number;
  shuffle: boolean;
  repeat: RepeatMode;
};

export type Rng = () => number;

export const emptyQueue = (): QueueState => ({
  order: [],
  original: [],
  index: 0,
  shuffle: false,
  repeat: 'off',
});

export const currentId = (q: QueueState): string | undefined => q.order[q.index];

export function shuffled<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function startQueue(
  ids: readonly string[],
  startId: string,
  opts: { shuffle: boolean; repeat: RepeatMode },
  rng: Rng = Math.random,
): QueueState {
  const original = ids.slice();
  const at = Math.max(0, original.indexOf(startId));
  if (!opts.shuffle) {
    return { order: original.slice(), original, index: at, shuffle: false, repeat: opts.repeat };
  }
  const rest = original.filter((_, i) => i !== at);
  const first = original[at];
  const order = first === undefined ? [] : [first, ...shuffled(rest, rng)];
  return { order, original, index: 0, shuffle: true, repeat: opts.repeat };
}

export type StepResult = { queue: QueueState; ended: boolean };

/** `auto` is true when a track finished by itself (repeat-one replays it), false for the Next button. */
export function next(q: QueueState, auto: boolean): StepResult {
  if (q.order.length === 0) return { queue: q, ended: true };
  if (auto && q.repeat === 'one') return { queue: q, ended: false };
  if (q.index + 1 < q.order.length) return { queue: { ...q, index: q.index + 1 }, ended: false };
  if (q.repeat === 'all') return { queue: { ...q, index: 0 }, ended: false };
  return { queue: q, ended: true };
}

export type PrevResult = { queue: QueueState; restart: boolean };

/** Within the first few seconds Previous goes back a track; later it restarts the current one. */
export function previous(q: QueueState, positionSec: number, restartAfterSec = 3): PrevResult {
  if (q.order.length === 0) return { queue: q, restart: true };
  if (positionSec > restartAfterSec) return { queue: q, restart: true };
  if (q.index > 0) return { queue: { ...q, index: q.index - 1 }, restart: false };
  if (q.repeat === 'all') return { queue: { ...q, index: q.order.length - 1 }, restart: false };
  return { queue: q, restart: true };
}

export function setShuffle(q: QueueState, on: boolean, rng: Rng = Math.random): QueueState {
  if (on === q.shuffle) return q;
  const cur = currentId(q);
  if (on) {
    if (cur === undefined) return { ...q, shuffle: true };
    const rest = q.order.filter((_, i) => i !== q.index);
    return { ...q, original: q.order.slice(), order: [cur, ...shuffled(rest, rng)], index: 0, shuffle: true };
  }
  const at = cur === undefined ? 0 : Math.max(0, q.original.indexOf(cur));
  return { ...q, order: q.original.slice(), index: at, shuffle: false };
}

export function cycleRepeat(mode: RepeatMode): RepeatMode {
  return mode === 'off' ? 'all' : mode === 'all' ? 'one' : 'off';
}

export function addToEnd(q: QueueState, id: string): QueueState {
  return { ...q, order: [...q.order, id], original: [...q.original, id] };
}

/** "Play next": insert right after the current track. */
export function addNext(q: QueueState, id: string): QueueState {
  if (q.order.length === 0) return { ...q, order: [id], original: [id], index: 0 };
  const order = q.order.slice();
  order.splice(q.index + 1, 0, id);
  const cur = currentId(q);
  const original = q.original.slice();
  const at = cur === undefined ? -1 : original.indexOf(cur);
  original.splice(at + 1, 0, id);
  return { ...q, order, original };
}

export type RemoveResult = { queue: QueueState; removedCurrent: boolean };

export function removeAt(q: QueueState, i: number): RemoveResult {
  if (i < 0 || i >= q.order.length) return { queue: q, removedCurrent: false };
  const id = q.order[i];
  const order = q.order.filter((_, k) => k !== i);
  const original = q.original.slice();
  const oi = original.indexOf(id);
  if (oi >= 0) original.splice(oi, 1);
  const removedCurrent = i === q.index;
  let index = q.index;
  if (i < q.index) index -= 1;
  if (index >= order.length) index = Math.max(0, order.length - 1);
  return { queue: { ...q, order, original, index }, removedCurrent };
}

export function moveItem(q: QueueState, from: number, to: number): QueueState {
  const n = q.order.length;
  if (from === to || from < 0 || to < 0 || from >= n || to >= n) return q;
  const order = q.order.slice();
  const [item] = order.splice(from, 1);
  order.splice(to, 0, item);
  let index = q.index;
  if (from === q.index) index = to;
  else if (from < q.index && to >= q.index) index -= 1;
  else if (from > q.index && to <= q.index) index += 1;
  return { ...q, order, index };
}

export function jumpTo(q: QueueState, i: number): QueueState {
  if (i < 0 || i >= q.order.length) return q;
  return { ...q, index: i };
}
