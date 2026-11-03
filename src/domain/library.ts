import type { HistoryEntry, Playlist, Track } from './types';

/** Pure library operations. The store wraps these; tests call them directly. */
export type LibraryState = {
  tracks: Record<string, Track>;
  playlists: Playlist[];
  likedIds: string[];
  history: HistoryEntry[];
};

export const emptyLibrary = (): LibraryState => ({ tracks: {}, playlists: [], likedIds: [], history: [] });

export const HISTORY_CAP = 500;

export function addTracks(
  s: LibraryState,
  incoming: Track[],
): { state: LibraryState; added: Track[]; duplicates: Track[] } {
  const known = new Set(Object.values(s.tracks).map((t) => t.fingerprint));
  const tracks = { ...s.tracks };
  const added: Track[] = [];
  const duplicates: Track[] = [];
  for (const t of incoming) {
    if (known.has(t.fingerprint)) {
      duplicates.push(t);
      continue;
    }
    known.add(t.fingerprint);
    tracks[t.id] = t;
    added.push(t);
  }
  return { state: { ...s, tracks }, added, duplicates };
}

export function removeTrack(s: LibraryState, id: string): LibraryState {
  if (!(id in s.tracks)) return s;
  const { [id]: _gone, ...tracks } = s.tracks;
  return {
    tracks,
    likedIds: s.likedIds.filter((x) => x !== id),
    history: s.history.filter((h) => h.trackId !== id),
    playlists: s.playlists.map((p) =>
      p.trackIds.includes(id) ? { ...p, trackIds: p.trackIds.filter((x) => x !== id) } : p,
    ),
  };
}

export function toggleLike(s: LibraryState, id: string): LibraryState {
  if (!(id in s.tracks)) return s;
  return s.likedIds.includes(id)
    ? { ...s, likedIds: s.likedIds.filter((x) => x !== id) }
    : { ...s, likedIds: [id, ...s.likedIds] }; // newest like first
}

export function createPlaylist(s: LibraryState, id: string, name: string, now: number, description = ''): LibraryState {
  const trimmed = name.trim();
  if (!trimmed) return s;
  const playlist: Playlist = { id, name: trimmed, description, trackIds: [], createdAt: now, updatedAt: now };
  return { ...s, playlists: [playlist, ...s.playlists] };
}

export function renamePlaylist(s: LibraryState, id: string, name: string, now: number): LibraryState {
  const trimmed = name.trim();
  if (!trimmed) return s;
  return { ...s, playlists: s.playlists.map((p) => (p.id === id ? { ...p, name: trimmed, updatedAt: now } : p)) };
}

export function deletePlaylist(s: LibraryState, id: string): LibraryState {
  return { ...s, playlists: s.playlists.filter((p) => p.id !== id) };
}

export function addToPlaylist(
  s: LibraryState,
  playlistId: string,
  trackIds: string[],
  now: number,
): { state: LibraryState; added: number; skipped: number } {
  const p = s.playlists.find((x) => x.id === playlistId);
  if (!p) return { state: s, added: 0, skipped: trackIds.length };
  const have = new Set(p.trackIds);
  const fresh = trackIds.filter((id) => id in s.tracks && !have.has(id));
  const unique = Array.from(new Set(fresh));
  if (unique.length === 0) return { state: s, added: 0, skipped: trackIds.length };
  const updated: Playlist = { ...p, trackIds: [...p.trackIds, ...unique], updatedAt: now };
  return {
    state: { ...s, playlists: s.playlists.map((x) => (x.id === playlistId ? updated : x)) },
    added: unique.length,
    skipped: trackIds.length - unique.length,
  };
}

export function removeFromPlaylist(s: LibraryState, playlistId: string, trackId: string, now: number): LibraryState {
  return {
    ...s,
    playlists: s.playlists.map((p) =>
      p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((x) => x !== trackId), updatedAt: now } : p,
    ),
  };
}

export function recordPlay(s: LibraryState, trackId: string, now: number): LibraryState {
  if (!(trackId in s.tracks)) return s;
  const history = [{ trackId, playedAt: now }, ...s.history].slice(0, HISTORY_CAP);
  return { ...s, history };
}

export function setDuration(s: LibraryState, id: string, sec: number): LibraryState {
  const t = s.tracks[id];
  if (!t || !Number.isFinite(sec) || sec <= 0) return s;
  if (t.durationSec !== undefined && Math.abs(t.durationSec - sec) < 0.5) return s;
  return { ...s, tracks: { ...s.tracks, [id]: { ...t, durationSec: sec } } };
}

/** Distinct track ids, most recently played first. */
export function recentlyPlayedIds(s: LibraryState, limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const h of s.history) {
    if (seen.has(h.trackId) || !(h.trackId in s.tracks)) continue;
    seen.add(h.trackId);
    out.push(h.trackId);
    if (out.length >= limit) break;
  }
  return out;
}

export function mostPlayedIds(s: LibraryState, limit: number): string[] {
  const counts = new Map<string, number>();
  for (const h of s.history) counts.set(h.trackId, (counts.get(h.trackId) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([id, n]) => n >= 2 && id in s.tracks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

export function recentlyAddedIds(s: LibraryState, limit: number): string[] {
  return Object.values(s.tracks)
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, limit)
    .map((t) => t.id);
}

export type SortKey = 'recent' | 'title' | 'artist';

export function sortTracks(tracks: Track[], key: SortKey): Track[] {
  const cmp = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });
  const copy = tracks.slice();
  if (key === 'title') return copy.sort((a, b) => cmp(a.title, b.title));
  if (key === 'artist') return copy.sort((a, b) => cmp(a.artist, b.artist) || cmp(a.title, b.title));
  return copy.sort((a, b) => b.addedAt - a.addedAt);
}
