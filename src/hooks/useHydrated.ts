import { useEffect, useState } from 'react';
import { useLibrary } from '../store/library';
import { usePlayer } from '../store/player';

/** True once both persisted stores have loaded from disk. */
export function useHydrated(): boolean {
  const [ready, setReady] = useState(() => useLibrary.persist.hasHydrated() && usePlayer.persist.hasHydrated());
  useEffect(() => {
    const check = () => setReady(useLibrary.persist.hasHydrated() && usePlayer.persist.hasHydrated());
    const unsubs = [useLibrary.persist.onFinishHydration(check), usePlayer.persist.onFinishHydration(check)];
    check();
    return () => unsubs.forEach((u) => u());
  }, []);
  return ready;
}
