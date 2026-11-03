import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  addNext, addToEnd, currentId, cycleRepeat, emptyQueue, jumpTo, moveItem, next, previous, removeAt,
  setShuffle, startQueue, type QueueState,
} from '../domain/queue';
import { engine, type EngineStatus } from '../playback/engine';
import { useLibrary } from './library';
import { useUI } from './ui';

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;

type PlayerState = {
  queue: QueueState;
  rate: number;
  /** Saved every ~5s so the app can resume where it left off after a restart. */
  resumePositionSec: number;
  // Live state (not persisted)
  loadedTrackId: string | null;
  playing: boolean;
  buffering: boolean;
  positionSec: number;
  durationSec: number;
  error: string | null;

  playTracks: (ids: string[], startId: string, opts?: { shuffle?: boolean }) => void;
  togglePlay: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  seek: (sec: number) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  cycleRate: () => void;
  enqueueNext: (id: string) => void;
  enqueueEnd: (id: string) => void;
  removeFromQueue: (index: number) => void;
  moveInQueue: (from: number, to: number) => void;
  jumpToQueueIndex: (index: number) => void;
  clearQueue: () => void;
};

// Per-load bookkeeping so a play is counted once and a finish is handled once.
let recordedFor: string | null = null;
let durationSavedFor: string | null = null;
let finishHandledFor: string | null = null;

export const usePlayer = create<PlayerState>()(
  persist(
    (set, get) => {
      /** Load the queue's current track into the engine. Drops tracks that no longer exist. */
      function loadCurrent(autoplay: boolean, startAt = 0): boolean {
        let q = get().queue;
        const lib = useLibrary.getState().tracks;
        let guard = q.order.length;
        while (guard-- > 0 && q.order.length > 0) {
          const id = currentId(q);
          const track = id ? lib[id] : undefined;
          if (track) {
            recordedFor = null;
            durationSavedFor = null;
            finishHandledFor = null;
            set({
              queue: q,
              loadedTrackId: track.id,
              positionSec: startAt,
              durationSec: track.durationSec ?? 0,
              error: null,
              playing: false,
              buffering: true,
            });
            try {
              engine.load(track, { autoplay, startAtSec: startAt, rate: get().rate });
            } catch (e) {
              set({ error: 'Playback engine unavailable', buffering: false });
              useUI.getState().showToast('Playback is unavailable right now');
              return false;
            }
            return true;
          }
          q = removeAt(q, q.index).queue; // missing from library: skip it
        }
        engine.stop();
        set({ queue: q, loadedTrackId: null, playing: false, buffering: false, positionSec: 0, durationSec: 0 });
        return false;
      }

      function stopAtStart() {
        engine.pause();
        void engine.seekTo(0);
        set({ playing: false, positionSec: 0, resumePositionSec: 0 });
      }

      return {
        queue: emptyQueue(),
        rate: 1,
        resumePositionSec: 0,
        loadedTrackId: null,
        playing: false,
        buffering: false,
        positionSec: 0,
        durationSec: 0,
        error: null,

        playTracks: (ids, startId, opts) => {
          const cur = get().queue;
          const queue = startQueue(ids, startId, {
            shuffle: opts?.shuffle ?? cur.shuffle,
            repeat: cur.repeat,
          });
          set({ queue, resumePositionSec: 0 });
          loadCurrent(true);
        },

        togglePlay: () => {
          const s = get();
          if (s.queue.order.length === 0) return;
          if (s.loadedTrackId === null) {
            loadCurrent(true, s.resumePositionSec);
            return;
          }
          if (s.playing) {
            engine.pause();
            set({ playing: false });
          } else {
            engine.play();
            set({ playing: true });
          }
        },

        skipNext: () => {
          const r = next(get().queue, false);
          if (r.ended) return stopAtStart();
          set({ queue: r.queue, resumePositionSec: 0 });
          loadCurrent(true);
        },

        skipPrevious: () => {
          const r = previous(get().queue, get().positionSec);
          if (r.restart) {
            void engine.seekTo(0);
            set({ positionSec: 0 });
            return;
          }
          set({ queue: r.queue, resumePositionSec: 0 });
          loadCurrent(true);
        },

        seek: (sec) => {
          void engine.seekTo(sec);
          set({ positionSec: sec, resumePositionSec: sec });
        },

        toggleShuffle: () => set((s) => ({ queue: setShuffle(s.queue, !s.queue.shuffle) })),
        cycleRepeatMode: () => set((s) => ({ queue: { ...s.queue, repeat: cycleRepeat(s.queue.repeat) } })),

        cycleRate: () => {
          const i = PLAYBACK_RATES.findIndex((r) => r === get().rate);
          const rate = PLAYBACK_RATES[(i + 1) % PLAYBACK_RATES.length];
          engine.setRate(rate);
          set({ rate });
        },

        enqueueNext: (id) => {
          const empty = get().queue.order.length === 0;
          set((s) => ({ queue: addNext(s.queue, id) }));
          if (!empty) useUI.getState().showToast('Will play next');
        },
        enqueueEnd: (id) => {
          const empty = get().queue.order.length === 0;
          set((s) => ({ queue: empty ? addNext(s.queue, id) : addToEnd(s.queue, id) }));
          if (!empty) useUI.getState().showToast('Added to queue');
        },

        removeFromQueue: (index) => {
          const wasPlaying = get().playing;
          const r = removeAt(get().queue, index);
          set({ queue: r.queue });
          if (!r.removedCurrent) return;
          if (r.queue.order.length === 0) {
            engine.stop();
            set({ loadedTrackId: null, playing: false, positionSec: 0, durationSec: 0 });
          } else {
            loadCurrent(wasPlaying);
          }
        },

        moveInQueue: (from, to) => set((s) => ({ queue: moveItem(s.queue, from, to) })),

        jumpToQueueIndex: (index) => {
          set((s) => ({ queue: jumpTo(s.queue, index), resumePositionSec: 0 }));
          loadCurrent(true);
        },

        clearQueue: () => {
          engine.stop();
          set((s) => ({
            queue: { ...emptyQueue(), shuffle: s.queue.shuffle, repeat: s.queue.repeat },
            loadedTrackId: null,
            playing: false,
            buffering: false,
            positionSec: 0,
            durationSec: 0,
            resumePositionSec: 0,
          }));
        },
      };
    },
    {
      name: 'reverb.player.v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ queue: s.queue, rate: s.rate, resumePositionSec: s.resumePositionSec }),
    },
  ),
);

function onEngineStatus(s: EngineStatus) {
  const st = usePlayer.getState();
  const id = st.loadedTrackId;
  if (!id) return;

  if (s.error) {
    if (st.error !== s.error) {
      const t = useLibrary.getState().tracks[id];
      usePlayer.setState({ error: s.error, playing: false, buffering: false });
      useUI.getState().showToast(`Can't play ${t?.title ?? 'this track'}`);
    }
    return;
  }

  const patch: Partial<PlayerState> = { playing: s.playing, buffering: s.buffering && !s.playing };
  if (s.loaded && s.durationSec > 0) patch.durationSec = s.durationSec;
  if (!s.finished) {
    patch.positionSec = s.positionSec;
    if (Math.floor(s.positionSec / 5) !== Math.floor(st.resumePositionSec / 5)) {
      patch.resumePositionSec = s.positionSec;
    }
  }
  usePlayer.setState(patch);

  if (s.playing && recordedFor !== id) {
    recordedFor = id;
    useLibrary.getState().recordPlay(id); // a "play" is counted when playback starts
  }
  if (s.loaded && s.durationSec > 0 && durationSavedFor !== id) {
    durationSavedFor = id;
    useLibrary.getState().setDuration(id, s.durationSec);
  }
  if (s.finished && finishHandledFor !== id) {
    finishHandledFor = id;
    handleFinished();
  }
}

function handleFinished() {
  const st = usePlayer.getState();
  if (st.queue.repeat === 'one') {
    void engine.seekTo(0);
    engine.play();
    finishHandledFor = null;
    return;
  }
  const r = next(st.queue, true);
  if (r.ended) {
    engine.pause();
    void engine.seekTo(0);
    usePlayer.setState({ playing: false, positionSec: 0, resumePositionSec: 0 });
    return;
  }
  usePlayer.setState({ queue: r.queue, resumePositionSec: 0 });
  // loadCurrent is internal to the store closure; trigger it through the public API:
  usePlayer.getState().jumpToQueueIndex(r.queue.index);
}

let started = false;
/** Call once at app start. */
export async function initPlayback(): Promise<void> {
  if (started) return;
  started = true;
  await engine.init();
  engine.subscribe(onEngineStatus);
}
