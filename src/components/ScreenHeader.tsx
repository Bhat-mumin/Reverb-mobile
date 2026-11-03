import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, space } from '../theme';

export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + space.md }]}>
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

export function HeaderButton({ children, onPress, label }: { children: ReactNode; onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(244,240,255,0.12)', borderless: true }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.btn}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingBottom: space.md },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 30 },
  right: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  btn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
