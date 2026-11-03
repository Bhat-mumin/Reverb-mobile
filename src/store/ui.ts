import { create } from 'zustand';

type UIState = {
  nowPlayingOpen: boolean;
  queueOpen: boolean;
  actionsFor: { trackId: string; playlistId?: string } | null;
  addToPlaylistFor: string[] | null;
  toast: { id: number; text: string } | null;
  openNowPlaying: () => void;
  closeNowPlaying: () => void;
  openQueue: () => void;
  closeQueue: () => void;
  openActions: (trackId: string, playlistId?: string) => void;
  closeActions: () => void;
  openAddToPlaylist: (trackIds: string[]) => void;
  closeAddToPlaylist: () => void;
  showToast: (text: string) => void;
};

let toastSeq = 0;

export const useUI = create<UIState>((set) => ({
  nowPlayingOpen: false,
  queueOpen: false,
  actionsFor: null,
  addToPlaylistFor: null,
  toast: null,
  openNowPlaying: () => set({ nowPlayingOpen: true }),
  closeNowPlaying: () => set({ nowPlayingOpen: false, queueOpen: false }),
  openQueue: () => set({ queueOpen: true }),
  closeQueue: () => set({ queueOpen: false }),
  openActions: (trackId, playlistId) => set({ actionsFor: { trackId, playlistId } }),
  closeActions: () => set({ actionsFor: null }),
  openAddToPlaylist: (trackIds) => set({ addToPlaylistFor: trackIds, actionsFor: null }),
  closeAddToPlaylist: () => set({ addToPlaylistFor: null }),
  showToast: (text) => set({ toast: { id: ++toastSeq, text } }),
}));
