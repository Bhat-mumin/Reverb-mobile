/** Identifies where a track came from. New licensed providers add a value here. */
export type ProviderId = 'local';

export type Track = {
  id: string;
  /** Which provider supplied this track. Keeps imported data distinguishable from other sources. */
  source: ProviderId;
  title: string;
  artist: string;
  album?: string;
  /** Playable URI (file:// inside app storage for local tracks). */
  uri: string;
  /** Unknown until the file has been loaded once. */
  durationSec?: number;
  sizeBytes?: number;
  mimeType?: string;
  addedAt: number;
  /** Used for duplicate detection across imports. */
  fingerprint: string;
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type HistoryEntry = { trackId: string; playedAt: number };

export type RepeatMode = 'off' | 'all' | 'one';
