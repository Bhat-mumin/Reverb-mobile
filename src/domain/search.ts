import type { Playlist, Track } from './types';

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

/** Every word typed must appear somewhere in title/artist/album. Title-prefix matches rank first. */
export function searchTracks(tracks: readonly Track[], query: string): Track[] {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const scored: { t: Track; score: number }[] = [];
  for (const t of tracks) {
    const title = norm(t.title);
    const hay = `${title} ${norm(t.artist)} ${norm(t.album ?? '')}`;
    if (!words.every((w) => hay.includes(w))) continue;
    let score = 1;
    if (title.startsWith(words[0])) score += 2;
    if (words.every((w) => title.includes(w))) score += 1;
    scored.push({ t, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.t.title.localeCompare(b.t.title)).map((x) => x.t);
}

export function searchPlaylists(playlists: readonly Playlist[], query: string): Playlist[] {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return playlists.filter((p) => words.every((w) => norm(`${p.name} ${p.description}`).includes(w)));
}
