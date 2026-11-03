import { describe, expect, it } from 'vitest';
import { extensionOf, fingerprintOf, parseFileName } from './filename';
import { formatBytes, formatTime, pluralize } from './format';
import { searchPlaylists, searchTracks } from './search';
import type { Playlist, Track } from './types';

describe('parseFileName', () => {
  it('splits "Artist - Title"', () => {
    expect(parseFileName('Nusrat Fateh Ali Khan - Ali Maula Ali.mp3')).toEqual({
      artist: 'Nusrat Fateh Ali Khan', title: 'Ali Maula Ali',
    });
  });
  it('strips track numbers and underscores', () => {
    expect(parseFileName('07_-_Night_Drive.flac').title).toBe('Night Drive');
    expect(parseFileName('01. Sunrise.m4a').title).toBe('Sunrise');
  });
  it('falls back to the whole name', () => {
    expect(parseFileName('voice memo.m4a')).toEqual({ title: 'voice memo', artist: 'Unknown artist' });
    expect(parseFileName('.mp3').title).toBe('Untitled');
  });
  it('keeps a lone hyphen inside the title', () => {
    expect(parseFileName('Lo-fi beats.mp3').title).toBe('Lo-fi beats');
  });
});

describe('helpers', () => {
  it('fingerprints are case-insensitive', () => {
    expect(fingerprintOf('A.MP3', 5)).toBe(fingerprintOf('a.mp3', 5));
    expect(fingerprintOf('a.mp3', undefined)).toContain('unknown');
  });
  it('extensionOf', () => {
    expect(extensionOf('Song.FLAC')).toBe('flac');
    expect(extensionOf('noext')).toBe('audio');
  });
  it('formatTime', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65.9)).toBe('1:05');
    expect(formatTime(3725)).toBe('1:02:05');
    expect(formatTime(undefined)).toBe('–:––');
    expect(formatTime(-1)).toBe('–:––');
  });
  it('pluralize and formatBytes', () => {
    expect(pluralize(1, 'song')).toBe('1 song');
    expect(pluralize(2, 'song')).toBe('2 songs');
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB');
    expect(formatBytes(500)).toBe('1 KB');
  });
});

const trk = (id: string, title: string, artist: string, album?: string): Track => ({
  id, source: 'local', title, artist, album, uri: 'x', addedAt: 0, fingerprint: id,
});

describe('search', () => {
  const lib = [
    trk('1', 'Samjhawan', 'Arijit Singh'),
    trk('2', 'Darkhaast', 'Arijit Singh'),
    trk('3', 'Arijit Mashup', 'DJ X'),
    trk('4', 'Café del Mar', 'Various'),
  ];
  it('matches across title and artist and ranks title-prefix first', () => {
    const r = searchTracks(lib, 'arijit');
    expect(r.map((x) => x.id)[0]).toBe('3');
    expect(r).toHaveLength(3);
  });
  it('requires every word', () => {
    expect(searchTracks(lib, 'arijit dark').map((x) => x.id)).toEqual(['2']);
    expect(searchTracks(lib, 'arijit zzz')).toEqual([]);
  });
  it('ignores accents and case; empty query returns nothing', () => {
    expect(searchTracks(lib, 'CAFE').map((x) => x.id)).toEqual(['4']);
    expect(searchTracks(lib, '   ')).toEqual([]);
  });
  it('searches playlists by name', () => {
    const ps: Playlist[] = [{ id: 'p', name: 'Road trip', description: 'long drives', trackIds: [], createdAt: 0, updatedAt: 0 }];
    expect(searchPlaylists(ps, 'road')).toHaveLength(1);
    expect(searchPlaylists(ps, 'beach')).toHaveLength(0);
  });
});
