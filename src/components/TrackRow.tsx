import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatTime } from '../domain/format';
import type { Track } from '../domain/types';
import { usePlayer } from '../store/player';
import { useUI } from '../store/ui';
import { colors, fonts, space } from '../theme';
import { Artwork } from './Artwork';
import { Equalizer } from './Equalizer';
import { Icon } from './Icon';

type Props = { track: Track; onPress: () => void; playlistId?: string };

export const TrackRow = memo(function TrackRow({ track, onPress, playlistId }: Props) {
  const isCurrent = usePlayer((s) => s.loadedTrackId === track.id);
  const playing = usePlayer((s) => s.playing);
  const openActions = useUI((s) => s.openActions);
  const sub = track.durationSec ? `${track.artist} · ${formatTime(track.durationSec)}` : track.artist;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(244,240,255,0.06)' }}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={`Play ${track.title} by ${track.artist}`}
    >
      <Artwork seed={track.id} size={48} round="sm" />
      <View style={styles.text}>
        <Text numberOfLines={1} style={[styles.title, isCurrent && { color: colors.accent }]}>{track.title}</Text>
        <Text numberOfLines={1} style={styles.sub}>{sub}</Text>
      </View>
      {isCurrent ? <Equalizer playing={playing} /> : null}
      <Pressable
        onPress={() => openActions(track.id, playlistId)}
        hitSlop={10}
        style={styles.more}
        accessibilityRole="button"
        accessibilityLabel={`More options for ${track.title}`}
      >
        <Icon name="ellipsis-vertical" size={20} color={colors.muted} />
      </Pressable>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: 8, gap: space.md },
  text: { flex: 1 },
  title: { color: colors.text, fontFamily: fonts.semi, fontSize: 16 },
  sub: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
  more: { padding: 6 },
});
