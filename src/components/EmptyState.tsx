import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, space } from '../theme';
import { Icon, type IconName } from './Icon';

export function EmptyState({
  icon, title, body, actionLabel, onAction,
}: { icon: IconName; title: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.badge}><Icon name={icon} size={34} color={colors.accent} /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.btn} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: space.xxl, paddingVertical: space.xxl },
  badge: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 22, textAlign: 'center' },
  body: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, textAlign: 'center', marginTop: space.sm, lineHeight: 21 },
  btn: { marginTop: space.xl, backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: space.xl, paddingVertical: 13 },
  btnText: { color: colors.accentInk, fontFamily: fonts.bold, fontSize: 16 },
});
