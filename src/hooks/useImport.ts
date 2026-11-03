import { useCallback, useState } from 'react';
import { pluralize } from '../domain/format';
import { useLibrary } from '../store/library';
import { useUI } from '../store/ui';

/** Opens the system file picker and reports the outcome in a toast. */
export function useImport() {
  const [busy, setBusy] = useState(false);
  const importFromDevice = useLibrary((s) => s.importFromDevice);
  const showToast = useUI((s) => s.showToast);

  const run = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await importFromDevice();
      if (r.cancelled) return;
      const parts: string[] = [];
      if (r.added > 0) parts.push(`Added ${pluralize(r.added, 'song')}`);
      if (r.duplicates > 0) parts.push(`${pluralize(r.duplicates, 'duplicate')} skipped`);
      if (r.failed > 0) parts.push(`${r.failed} failed`);
      showToast(parts.join(' · ') || 'Nothing to add');
    } catch (e) {
      showToast('Could not open files');
    } finally {
      setBusy(false);
    }
  }, [busy, importFromDevice, showToast]);

  return { importMusic: run, importing: busy };
}
