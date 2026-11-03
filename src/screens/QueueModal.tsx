import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Artwork } from '../components/Artwork';
import { Equalizer } from '../components/Equalizer';
import { Icon } from '../components/Icon';
import { pluralize } from '../domain/format';
import { useLibrary } from '../store/library';
import { usePlayer } from '../store/player';
import { useUI } from '../store/ui';
import { colors, fonts, space } from '../theme';

export function QueueModal() {
  const open = useUI((s) => s.queueOpen);
  const close = useUI((s) => s.closeQueue);
  const insets = useSafeAreaInsets();
  const tracks = useLibrary((s) => s.tracks);
  const queue = usePlayer((s) => s.queue);
  const playing = usePlayer((s) => s.playing);
  const jump = usePlayer((s) => s.jumpToQueueIndex);
  const remove = usePlayer((s) => s.removeFromQueue);
  const move = usePlayer((s) => s.moveInQueue);
  const clear = usePlayer((s) => s.clearQueue);

  const curIndex = queue.index;
  const cur = tracks[queue.order[curIndex] ?? ''];
  const upcoming = queue.order.slice(curIndex + 1).map((id, k) => ({ id, index: curIndex + 1 + k }));

  return (
    <Modal visible={open} animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View style={[styles.screen, { paddingTop: insets.top + space.sm, paddingBottom: insets.bottom }]}>
        <View style={styles.top}>
          <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close queue">
            <Icon name="chevron-down" size={30} />
          </Pressable>
          <Text style={styles.heading}>Queue</Text>
          <Pressable onPress={() => { clear(); close(); useUI.getState().closeNowPlaying(); }} hitSlop={12} accessibilityRole="button" accessibilityLabel="Clear queue">
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        </View>

        <FlatList
          data={upcoming}
          keyExtractor={(item) => `${item.index}:${item.id}`}
          ListHeaderComponent={
            <View>
              <Text style={styles.section}>Now playing</Text>
              {cur ? (
                <View style={styles.row}>
                  <Artwork seed={cur.id} size={48} round="sm" />
                  <View style={styles.text}>
                    <Text numberOfLines={1} style={[styles.title, { color: colors.accent }]}>{cur.title}</Text>
                    <Text numberOfLines={1} style={styles.sub}>{cur.artist}</Text>
                  </View>
                  <Equalizer playing={playing} />
                </View>
              ) : (
                <Text style={styles.empty}>Nothing is playing</Text>
              )}
              <Text style={styles.section}>Next up · {pluralize(upcoming.length, 'song')}</Text>
              {upcoming.length === 0 ? <Text style={styles.empty}>The queue is empty after this song.</Text> : null}
            </View>
          }
          renderItem={({ item }) => {
            const t = tracks[item.id];
            if (!t) return null;
            return (
              <Pressable onPress={() => jump(item.index)} style={styles.row} accessibilityRole="button" accessibilityLabel={`Play ${t.title}`}>
                <Artwork seed={t.id} size={48} round="sm" />
                <View style={styles.text}>
                  <Text numberOfLines={1} style={styles.title}>{t.title}</Text>
                  <Text numberOfLines={1} style={styles.sub}>{t.artist}</Text>
                </View>
                <Pressable
                  disabled={item.index - 1 === curIndex}
                  onPress={() => move(item.index, item.index - 1)}
                  hitSlop={6}
                  style={[styles.iconBtn, item.index - 1 === curIndex && { opacity: 0.25 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Move ${t.title} up`}
                >
                  <Icon name="chevron-up" size={22} color={colors.muted} />
                </Pressable>
                <Pressable
                  disabled={item.index === queue.order.length - 1}
                  onPress={() => move(item.index, item.index + 1)}
                  hitSlop={6}
                  style={[styles.iconBtn, item.index === queue.order.length - 1 && { opacity: 0.25 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Move ${t.title} down`}
                >
                  <Icon name="chevron-down" size={22} color={colors.muted} />
                </Pressable>
                <Pressable onPress={() => remove(item.index)} hitSlop={6} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={`Remove ${t.title} from queue`}>
                  <Icon name="close" size={22} color={colors.muted} />
                </Pressable>
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44, paddingHorizontal: space.xl },
  heading: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
  clear: { color: colors.accent, fontFamily: fonts.semi, fontSize: 15 },
  section: { color: colors.muted, fontFamily: fonts.semi, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', paddingHorizontal: space.lg, paddingTop: space.xl, paddingBottom: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: 8, gap: space.md },
  text: { flex: 1 },
  title: { color: colors.text, fontFamily: fonts.semi, fontSize: 16 },
  sub: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
  iconBtn: { padding: 4 },
  empty: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, paddingHorizontal: space.lg, paddingVertical: space.sm },
});
