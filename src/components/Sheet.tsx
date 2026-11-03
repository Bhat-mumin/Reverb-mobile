import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, space } from '../theme';

/** Bottom sheet. Android back button and tapping outside both close it. */
export function Sheet({
  visible, onClose, title, children,
}: { visible: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close" />
      <View style={styles.sheet}>
        <View style={styles.grab} />
        {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
        {children}
      </View>
    </Modal>
  );
}

export function SheetItem({
  label, icon, onPress, danger = false,
}: { label: string; icon?: ReactNode; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(244,240,255,0.08)' }}
      style={styles.item}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.itemIcon}>{icon}</View>
      <Text style={[styles.itemLabel, danger && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.scrim },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '75%',
    backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    paddingBottom: space.xl, paddingTop: space.sm,
  },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: space.md },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 18, paddingHorizontal: space.xl, paddingBottom: space.md },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.xl, paddingVertical: 14 },
  itemIcon: { width: 32 },
  itemLabel: { color: colors.text, fontFamily: fonts.medium, fontSize: 16 },
});
