import { describe, expect, it } from 'vitest';
import {
  addToPlaylist, addTracks, createPlaylist, deletePlaylist, emptyLibrary, mostPlayedIds, recentlyAddedIds,
  recentlyPlayedIds, recordPlay, removeFromPlaylist, removeTrack, renamePlaylist, setDuration, sortTracks, toggleLike,
  HISTORY_CAP,
} from './library';
import type { Track } from './types';

const t = (id: string, over: Partial<Track> = {}): Track => ({
  id, source: 'local', title: `Song ${id}`, artist: 'Artist', uri: `file:///${id}.mp3`,
  addedAt: 1000, fingerprint: `${id}.mp3|1`, ...over,
});

describe('addTracks', () => {
  it('adds new tracks and reports duplicates by fingerprint', () => {
    const first = addTracks(emptyLibrary(), [t('1'), t('2')]);
    expect(first.added).toHaveLength(2);
    const again = addTracks(first.state, [t('3', { fingerprint: '1.mp3|1' }), t('4')]);
    expect(again.added.map((x) => x.id)).toEqual(['4']);
    expect(again.duplicates.map((x) => x.id)).toEqual(['3']);
  });
  it('de-duplicates within one batch', () => {
    const r = addTracks(emptyLibrary(), [t('1'), t('2', { fingerprint: '1.mp3|1' })]);
    expect(r.added).toHaveLength(1);
  });
});

describe('removeTrack', () => {
  it('removes it from likes, playlists and history too', () => {
    let s = addTracks(emptyLibrary(), [t('1'), t('2')]).state;
    s = toggleLike(s, '1');
    s = createPlaylist(s, 'p', 'Mix', 1);
    s = addToPlaylist(s, 'p', ['1', '2'], 2).state;
    s = recordPlay(s, '1', 3);
    s = removeTrack(s, '1');
    expect(s.tracks['1']).toBeUndefined();
    expect(s.likedIds).toEqual([]);
    expect(s.playlists[0].trackIds).toEqual(['2']);
    expect(s.history).toEqual([]);
  });
});

describe('likes', () => {
  it('toggles, newest first, ignores unknown tracks', () => {
    let s = addTracks(emptyLibrary(), [t('1'), t('2')]).state;
    s = toggleLike(toggleLike(s, '1'), '2');
    expect(s.likedIds).toEqual(['2', '1']);
    expect(toggleLike(s, '1').likedIds).toEqual(['2']);
    expect(toggleLike(s, 'nope')).toBe(s);
  });
});

describe('playlists', () => {
  const base = () => addTracks(emptyLibrary(), [t('1'), t('2'), t('3')]).state;
  it('creates (trimmed), refuses empty names, renames, deletes', () => {
    let s = createPlaylist(base(), 'p', '  Road trip  ', 5);
    expect(s.playlists[0].name).toBe('Road trip');
    expect(createPlaylist(s, 'q', '   ', 6)).toBe(s);
    s = renamePlaylist(s, 'p', 'Night drive', 7);
    expect(s.playlists[0].name).toBe('Night drive');
    expect(deletePlaylist(s, 'p').playlists).toEqual([]);
  });
  it('skips duplicates and unknown tracks when adding', () => {
    let s = createPlaylist(base(), 'p', 'Mix', 1);
    const a = addToPlaylist(s, 'p', ['1', '2'], 2);
    expect(a.added).toBe(2);
    const b = addToPlaylist(a.state, 'p', ['2', '3', 'ghost'], 3);
    expect(b.added).toBe(1);
    expect(b.skipped).toBe(2);
    expect(b.state.playlists[0].trackIds).toEqual(['1', '2', '3']);
  });
  it('keeps track order and removes single tracks', () => {
    let s = createPlaylist(base(), 'p', 'Mix', 1);
    s = addToPlaylist(s, 'p', ['3', '1'], 2).state;
    expect(s.playlists[0].trackIds).toEqual(['3', '1']);
    s = removeFromPlaylist(s, 'p', '3', 3);
    expect(s.playlists[0].trackIds).toEqual(['1']);
  });
});

describe('history and shelves', () => {
  it('recently played is distinct and newest first', () => {
    let s = addTracks(emptyLibrary(), [t('1'), t('2'), t('3')]).state;
    s = recordPlay(recordPlay(recordPlay(recordPlay(s, '1', 1), '2', 2), '1', 3), '3', 4);
    expect(recentlyPlayedIds(s, 10)).toEqual(['3', '1', '2']);
    expect(recentlyPlayedIds(s, 2)).toEqual(['3', '1']);
  });
  it('most played needs at least two plays', () => {
    let s = addTracks(emptyLibrary(), [t('1'), t('2')]).state;
    s = recordPlay(recordPlay(recordPlay(s, '1', 1), '1', 2), '2', 3);
    expect(mostPlayedIds(s, 5)).toEqual(['1']);
  });
  it('history is capped', () => {
    let s = addTracks(emptyLibrary(), [t('1')]).state;
    for (let i = 0; i < HISTORY_CAP + 25; i++) s = recordPlay(s, '1', i);
    expect(s.history).toHaveLength(HISTORY_CAP);
  });
  it('recently added orders by addedAt', () => {
    const s = addTracks(emptyLibrary(), [t('1', { addedAt: 1 }), t('2', { addedAt: 9 }), t('3', { addedAt: 5 })]).state;
    expect(recentlyAddedIds(s, 2)).toEqual(['2', '3']);
  });
});

describe('setDuration and sorting', () => {
  it('only stores sensible durations', () => {
    const s = addTracks(emptyLibrary(), [t('1')]).state;
    expect(setDuration(s, '1', 0)).toBe(s);
    expect(setDuration(s, '1', NaN)).toBe(s);
    expect(setDuration(s, '1', 215).tracks['1'].durationSec).toBe(215);
  });
  it('sorts by title, artist, recency', () => {
    const list = [t('1', { title: 'b', artist: 'z', addedAt: 1 }), t('2', { title: 'a', artist: 'y', addedAt: 3 })];
    expect(sortTracks(list, 'title').map((x) => x.id)).toEqual(['2', '1']);
    expect(sortTracks(list, 'artist').map((x) => x.id)).toEqual(['2', '1']);
    expect(sortTracks(list, 'recent').map((x) => x.id)).toEqual(['2', '1']);
  });
});
