import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

/** Rings that expand and fade behind the cover while music plays — the app's signature motion. */
export function RippleHalo({ size, active }: { size: number; active: boolean }) {
  const rings = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!active) {
      rings.forEach((v) => v.setValue(0));
      return;
    }
    const loops = rings.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 900),
          Animated.timing(v, { toValue: 1, duration: 2700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, rings]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
      {rings.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: size, height: size, borderRadius: size * 0.2,
            borderWidth: 2, borderColor: colors.accent,
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [active ? 0.5 : 0, 0] }),
            transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] }) }],
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
