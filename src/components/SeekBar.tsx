import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type HostInstance } from 'react-native';
import { colors } from '../theme';

/**
 * Draggable seek bar. While dragging it shows the finger position; the seek is only sent on release,
 * so audio doesn't stutter and the playing position doesn't fight the thumb.
 */
export function SeekBar({
  value, max, onSeek, disabled = false,
}: { value: number; max: number; onSeek: (sec: number) => void; disabled?: boolean }) {
  const [width, setWidth] = useState(0);
  const [dragFrac, setDragFrac] = useState<number | null>(null);
  const boxRef = useRef<HostInstance | null>(null);
  const left = useRef(0);
  const latest = useRef({ width: 0, max: 0, onSeek, disabled });
  latest.current = { width, max, onSeek, disabled };

  const fracAt = (pageX: number) => {
    const w = latest.current.width || 1;
    return Math.min(1, Math.max(0, (pageX - left.current) / w));
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled,
      onMoveShouldSetPanResponder: () => !latest.current.disabled,
      onPanResponderGrant: (e) => {
        const pageX = e.nativeEvent.pageX;
        boxRef.current?.measureInWindow((x: number) => {
          left.current = x;
          setDragFrac(fracAt(pageX));
        });
      },
      onPanResponderMove: (_e, g) => setDragFrac(fracAt(g.moveX)),
      onPanResponderRelease: (_e, g) => {
        const f = fracAt(g.moveX || g.x0);
        setDragFrac(null);
        latest.current.onSeek(f * latest.current.max);
      },
      onPanResponderTerminate: () => setDragFrac(null),
    }),
  ).current;

  const frac = dragFrac ?? (max > 0 ? Math.min(1, value / max) : 0);
  return (
    <View
      ref={boxRef}
      style={styles.hit}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      {...pan.panHandlers}
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${frac * 100}%` }]} />
      </View>
      <View style={[styles.thumb, { left: Math.max(0, frac * width - 7), opacity: disabled ? 0.3 : 1 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { height: 28, justifyContent: 'center' },
  track: { height: 4, borderRadius: 2, backgroundColor: 'rgba(244,240,255,0.18)', overflow: 'hidden' },
  fill: { height: 4, backgroundColor: colors.accent },
  thumb: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: colors.text, top: 7 },
});
