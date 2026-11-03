import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

/** Three bouncing bars; the only place the gold "pulse" colour appears. */
export function Equalizer({ playing, height = 14 }: { playing: boolean; height?: number }) {
  const bars = useRef([0.4, 0.8, 0.55].map((v) => new Animated.Value(v))).current;

  useEffect(() => {
    if (!playing) {
      bars.forEach((b, i) => b.setValue([0.35, 0.35, 0.35][i]));
      return;
    }
    const loops = bars.map((b, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(b, { toValue: 1, duration: 380 + i * 110, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(b, { toValue: 0.25, duration: 380 + i * 90, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [playing, bars]);

  return (
    <View style={[styles.row, { height }]}>
      {bars.map((b, i) => (
        <Animated.View key={i} style={[styles.bar, { height, transform: [{ scaleY: b }] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 3, borderRadius: 2, backgroundColor: colors.pulse },
});
