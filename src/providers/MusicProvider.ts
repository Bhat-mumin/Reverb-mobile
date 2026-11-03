import type { ProviderId, Track } from '../domain/types';

export type ImportFailure = { name: string; reason: string };
export type ImportResult = { tracks: Track[]; failed: ImportFailure[]; cancelled: boolean };

/**
 * A source of music. Only licensed/owned sources belong here: local files today; public-domain or
 * licensed catalogue providers can implement the same interface later. A Spotify linking provider would
 * supply library METADATA only — Spotify audio is never played or copied by this app.
 */
export interface MusicProvider {
  readonly id: ProviderId;
  readonly name: string;
}

export interface ImportingProvider extends MusicProvider {
  /** Ask the user for content and turn it into tracks. */
  pickAndImport(now: number): Promise<ImportResult>;
  /** Remove any stored audio belonging to this track. Never throws. */
  deleteStoredAudio(track: Track): void;
}
