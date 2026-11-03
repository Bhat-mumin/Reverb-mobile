import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as ops from '../domain/library';
import type { LibraryState } from '../domain/library';
import type { Track } from '../domain/types';
import { LocalFilesProvider } from '../providers/LocalFilesProvider';
import { makeId } from '../util/id';

type Actions = {
  importFromDevice: () => Promise<{ added: number; duplicates: number; failed: number; cancelled: boolean }>;
  removeTrack: (id: string) => void;
  toggleLike: (id: string) => void;
  createPlaylist: (name: string) => string | null;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, trackIds: string[]) => { added: number; skipped: number };
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  recordPlay: (trackId: string) => void;
  setDuration: (trackId: string, sec: number) => void;
};

export type LibraryStore = LibraryState & Actions;

export const useLibrary = create<LibraryStore>()(
  persist(
    (set, get) => {
      const apply = (fn: (s: LibraryState) => LibraryState) =>
        set((s) => {
          const next = fn({ tracks: s.tracks, playlists: s.playlists, likedIds: s.likedIds, history: s.history });
          return next;
        });

      return {
        ...ops.emptyLibrary(),

        importFromDevice: async () => {
          const result = await LocalFilesProvider.pickAndImport(Date.now());
          if (result.cancelled) return { added: 0, duplicates: 0, failed: 0, cancelled: true };
          const merged = ops.addTracks(get(), result.tracks);
          set({ tracks: merged.state.tracks });
          // Imported copies we did not keep (duplicates) must not linger in app storage.
          merged.duplicates.forEach((t: Track) => LocalFilesProvider.deleteStoredAudio(t));
          return {
            added: merged.added.length,
            duplicates: merged.duplicates.length,
            failed: result.failed.length,
            cancelled: false,
          };
        },

        removeTrack: (id) => {
          const track = get().tracks[id];
          apply((s) => ops.removeTrack(s, id));
          if (track) LocalFilesProvider.deleteStoredAudio(track);
        },
        toggleLike: (id) => apply((s) => ops.toggleLike(s, id)),
        createPlaylist: (name) => {
          const id = makeId();
          const before = get().playlists.length;
          apply((s) => ops.createPlaylist(s, id, name, Date.now()));
          return get().playlists.length > before ? id : null;
        },
        renamePlaylist: (id, name) => apply((s) => ops.renamePlaylist(s, id, name, Date.now())),
        deletePlaylist: (id) => apply((s) => ops.deletePlaylist(s, id)),
        addToPlaylist: (playlistId, trackIds) => {
          const r = ops.addToPlaylist(get(), playlistId, trackIds, Date.now());
          set({ playlists: r.state.playlists });
          return { added: r.added, skipped: r.skipped };
        },
        removeFromPlaylist: (playlistId, trackId) =>
          apply((s) => ops.removeFromPlaylist(s, playlistId, trackId, Date.now())),
        recordPlay: (trackId) => apply((s) => ops.recordPlay(s, trackId, Date.now())),
        setDuration: (trackId, sec) => apply((s) => ops.setDuration(s, trackId, sec)),
      };
    },
    {
      name: 'reverb.library.v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ tracks: s.tracks, playlists: s.playlists, likedIds: s.likedIds, history: s.history }),
    },
  ),
);
