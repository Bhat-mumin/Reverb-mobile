import { StyleSheet, View } from 'react-native';
import { radius as R } from '../theme';
import { Icon } from './Icon';

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Local files carry no cover art (we don't read ID3 tags yet), so each track/playlist gets a
 * generated "ripple" cover: its colours come from a hash of the id, so it is stable across launches.
 */
export function Artwork({
  seed, size, round = 'md', dim = false,
}: { seed: string | undefined; size: number; round?: 'sm' | 'md' | 'lg'; dim?: boolean }) {
  const radius = round === 'sm' ? R.sm : round === 'lg' ? R.lg : R.md;
  const box = { width: size, height: size, borderRadius: radius };
  if (!seed) {
    return (
      <View style={[styles.base, box, { backgroundColor: '#2F2967' }]}>
        <Icon name="musical-notes" size={size * 0.4} color="#A9A3CF" />
      </View>
    );
  }
  const h = hash(seed) % 360;
  const bg = `hsl(${h}, 42%, ${dim ? 22 : 30}%)`;
  const ring = `hsla(${(h + 40) % 360}, 70%, 72%, 0.55)`;
  const ring2 = `hsla(${(h + 200) % 360}, 65%, 70%, 0.35)`;
  const cx = size * (0.25 + ((hash(seed + 'x') % 40) / 100));
  const cy = size * (0.55 + ((hash(seed + 'y') % 35) / 100));
  const rings = [0.3, 0.58, 0.88, 1.2];
  return (
    <View style={[styles.base, box, { backgroundColor: bg }]}>
      {rings.map((k, i) => {
        const d = size * k;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: d, height: d, borderRadius: d / 2,
              left: cx - d / 2, top: cy - d / 2,
              borderWidth: Math.max(1, size * 0.018),
              borderColor: i % 2 === 0 ? ring : ring2,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
