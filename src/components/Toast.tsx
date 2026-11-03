import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUI } from '../store/ui';
import { colors, fonts, radius, space } from '../theme';

export function Toast() {
  const toast = useUI((s) => s.toast);
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    opacity.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(opacity, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [toast, opacity]);

  if (!toast) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { top: insets.top + space.md, opacity }]}>
      <Text style={styles.text}>{toast.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', alignSelf: 'center', maxWidth: '88%', zIndex: 100, elevation: 12,
    backgroundColor: colors.text, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: 10,
  },
  text: { color: colors.accentInk, fontFamily: fonts.semi, fontSize: 14 },
});
