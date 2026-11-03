import { describe, expect, it } from 'vitest';
import {
  addNext, addToEnd, currentId, cycleRepeat, emptyQueue, jumpTo, moveItem, next, previous,
  removeAt, setShuffle, startQueue,
} from './queue';

// Small deterministic RNG so shuffle tests are repeatable.
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const ids = ['a', 'b', 'c', 'd', 'e'];
const off = { shuffle: false, repeat: 'off' as const };

describe('startQueue', () => {
  it('starts at the chosen track in order', () => {
    const q = startQueue(ids, 'c', off);
    expect(q.order).toEqual(ids);
    expect(currentId(q)).toBe('c');
  });
  it('with shuffle: chosen track first, same members, original kept', () => {
    const q = startQueue(ids, 'c', { shuffle: true, repeat: 'off' }, seeded(1));
    expect(q.order[0]).toBe('c');
    expect([...q.order].sort()).toEqual(ids);
    expect(q.original).toEqual(ids);
    expect(q.index).toBe(0);
  });
});

describe('next', () => {
  it('advances, then ends at the last track when repeat is off', () => {
    let q = startQueue(ids, 'd', off);
    const r1 = next(q, false); q = r1.queue;
    expect(currentId(q)).toBe('e'); expect(r1.ended).toBe(false);
    const r2 = next(q, true);
    expect(r2.ended).toBe(true);
    expect(currentId(r2.queue)).toBe('e');
  });
  it('repeat all wraps to the start', () => {
    const q = startQueue(ids, 'e', { shuffle: false, repeat: 'all' });
    const r = next(q, true);
    expect(r.ended).toBe(false);
    expect(currentId(r.queue)).toBe('a');
  });
  it('repeat one replays on auto-advance but the Next button still skips', () => {
    const q = startQueue(ids, 'b', { shuffle: false, repeat: 'one' });
    expect(currentId(next(q, true).queue)).toBe('b');
    expect(currentId(next(q, false).queue)).toBe('c');
  });
  it('empty queue ends', () => {
    expect(next(emptyQueue(), true).ended).toBe(true);
  });
});

describe('previous', () => {
  it('restarts the track after 3 seconds', () => {
    const q = startQueue(ids, 'c', off);
    const r = previous(q, 10);
    expect(r.restart).toBe(true);
    expect(currentId(r.queue)).toBe('c');
  });
  it('goes back a track early in the song', () => {
    const r = previous(startQueue(ids, 'c', off), 1);
    expect(r.restart).toBe(false);
    expect(currentId(r.queue)).toBe('b');
  });
  it('at the first track: restarts, or wraps with repeat all', () => {
    expect(previous(startQueue(ids, 'a', off), 1).restart).toBe(true);
    const wrap = previous(startQueue(ids, 'a', { shuffle: false, repeat: 'all' }), 1);
    expect(currentId(wrap.queue)).toBe('e');
  });
});

describe('shuffle toggling', () => {
  it('keeps the current track playing and restores order when turned off', () => {
    const base = startQueue(ids, 'c', off);
    const on = setShuffle(base, true, seeded(7));
    expect(currentId(on)).toBe('c');
    expect([...on.order].sort()).toEqual(ids);
    const back = setShuffle(on, false);
    expect(back.order).toEqual(ids);
    expect(currentId(back)).toBe('c');
  });
  it('is a no-op when unchanged', () => {
    const q = startQueue(ids, 'a', off);
    expect(setShuffle(q, false)).toBe(q);
  });
});

describe('queue editing', () => {
  it('addNext inserts after the current track', () => {
    const q = addNext(startQueue(ids, 'b', off), 'x');
    expect(q.order).toEqual(['a', 'b', 'x', 'c', 'd', 'e']);
    expect(currentId(q)).toBe('b');
  });
  it('addNext on an empty queue makes it current', () => {
    const q = addNext(emptyQueue(), 'x');
    expect(currentId(q)).toBe('x');
  });
  it('addToEnd appends and survives un-shuffle', () => {
    let q = addToEnd(setShuffle(startQueue(ids, 'a', off), true, seeded(3)), 'z');
    expect(q.order.at(-1)).toBe('z');
    q = setShuffle(q, false);
    expect(q.order).toEqual([...ids, 'z']);
  });
  it('removing a track before the current one keeps the same track playing', () => {
    const r = removeAt(startQueue(ids, 'd', off), 1);
    expect(r.removedCurrent).toBe(false);
    expect(currentId(r.queue)).toBe('d');
  });
  it('removing the current track points at the next one and says so', () => {
    const r = removeAt(startQueue(ids, 'b', off), 1);
    expect(r.removedCurrent).toBe(true);
    expect(currentId(r.queue)).toBe('c');
  });
  it('removing the last current track clamps the index', () => {
    const r = removeAt(startQueue(ids, 'e', off), 4);
    expect(r.removedCurrent).toBe(true);
    expect(currentId(r.queue)).toBe('d');
  });
  it('moveItem keeps the playing track playing', () => {
    const q0 = startQueue(ids, 'c', off);
    expect(currentId(moveItem(q0, 0, 4))).toBe('c');   // moved something from before to after
    expect(currentId(moveItem(q0, 4, 0))).toBe('c');   // moved something from after to before
    const moved = moveItem(q0, 2, 4);                   // moved the current track itself
    expect(currentId(moved)).toBe('c');
    expect(moved.order).toEqual(['a', 'b', 'd', 'e', 'c']);
  });
  it('jumpTo ignores out-of-range indexes', () => {
    const q = startQueue(ids, 'a', off);
    expect(jumpTo(q, 99)).toBe(q);
    expect(currentId(jumpTo(q, 3))).toBe('d');
  });
});

describe('cycleRepeat', () => {
  it('goes off → all → one → off', () => {
    expect(cycleRepeat('off')).toBe('all');
    expect(cycleRepeat('all')).toBe('one');
    expect(cycleRepeat('one')).toBe('off');
  });
});
