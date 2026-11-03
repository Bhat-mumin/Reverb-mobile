import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { extensionOf, fingerprintOf, parseFileName } from '../domain/filename';
import type { Track } from '../domain/types';
import { makeId } from '../util/id';
import type { ImportFailure, ImportingProvider, ImportResult } from './MusicProvider';

function musicDir(): Directory {
  const dir = new Directory(Paths.document, 'music');
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/**
 * Imports audio files the user owns. Files are copied into app storage because Android file-picker
 * links can stop working after a restart; the copy is deleted again when the track is removed.
 */
export const LocalFilesProvider: ImportingProvider = {
  id: 'local',
  name: 'This device',

  async pickAndImport(now: number): Promise<ImportResult> {
    const picked = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (picked.canceled) return { tracks: [], failed: [], cancelled: true };

    const tracks: Track[] = [];
    const failed: ImportFailure[] = [];
    let dir: Directory;
    try {
      dir = musicDir();
    } catch (e) {
      return {
        tracks: [],
        failed: picked.assets.map((a) => ({ name: a.name, reason: 'Could not create app storage folder' })),
        cancelled: false,
      };
    }

    for (const asset of picked.assets) {
      try {
        const id = makeId();
        const dest = new File(dir, `${id}.${extensionOf(asset.name)}`);
        await new File(asset.uri).copy(dest);
        const { title, artist } = parseFileName(asset.name);
        tracks.push({
          id,
          source: 'local',
          title,
          artist,
          uri: dest.uri,
          sizeBytes: asset.size,
          mimeType: asset.mimeType,
          addedAt: now,
          fingerprint: fingerprintOf(asset.name, asset.size),
        });
      } catch (e) {
        failed.push({ name: asset.name, reason: e instanceof Error ? e.message : 'Copy failed' });
      }
    }
    return { tracks, failed, cancelled: false };
  },

  deleteStoredAudio(track: Track): void {
    try {
      const f = new File(track.uri);
      if (f.exists) f.delete();
    } catch {
      /* best effort */
    }
  },
};
