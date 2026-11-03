export type ParsedName = { title: string; artist: string };

const AUDIO_EXT = /\.(mp3|m4a|aac|flac|wav|ogg|oga|opus|wma|amr|mka)$/i;

/**
 * Best-effort title/artist from a file name. We do NOT read ID3 tags yet, so this is only a
 * heuristic: "Artist - Title.mp3" splits on the first " - ", otherwise the whole name is the title.
 */
export function parseFileName(fileName: string): ParsedName {
  let base = fileName.replace(AUDIO_EXT, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  base = base.replace(/^\d{1,3}\s*[-.)]\s*/, '').trim(); // "01 - ", "07. "
  const split = base.indexOf(' - ');
  if (split > 0 && split < base.length - 3) {
    return { artist: base.slice(0, split).trim(), title: base.slice(split + 3).trim() };
  }
  return { title: base || 'Untitled', artist: 'Unknown artist' };
}

export function fingerprintOf(fileName: string, sizeBytes: number | undefined): string {
  return `${fileName.trim().toLowerCase()}|${sizeBytes ?? 'unknown'}`;
}

export function extensionOf(fileName: string): string {
  const m = /\.([A-Za-z0-9]{1,5})$/.exec(fileName);
  return m ? m[1].toLowerCase() : 'audio';
}
