import { Pressable, StyleSheet, Text, View } from 'react-native';
import { currentId } from '../domain/queue';
import { useLibrary } from '../store/library';
import { usePlayer } from '../store/player';
import { useUI } from '../store/ui';
import { colors, fonts, MINI_PLAYER_HEIGHT, radius, space } from '../theme';
import { Artwork } from './Artwork';
import { Icon } from './Icon';

/** Persistent player above the tab bar. Tap anywhere (except the buttons) to open Now Playing. */
export function MiniPlayer() {
  const trackId = usePlayer((s) => currentId(s.queue));
  const track = useLibrary((s) => (trackId ? s.tracks[trackId] : undefined));
  const liked = useLibrary((s) => (trackId ? s.likedIds.includes(trackId) : false));
  const toggleLike = useLibrary((s) => s.toggleLike);
  const playing = usePlayer((s) => s.playing);
  const buffering = usePlayer((s) => s.buffering);
  const position = usePlayer((s) => s.positionSec);
  const duration = usePlayer((s) => s.durationSec);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const openNowPlaying = useUI((s) => s.openNowPlaying);

  if (!track) return null;
  const frac = duration > 0 ? Math.min(1, position / duration) : 0;

  return (
    <Pressable onPress={openNowPlaying} style={styles.wrap} accessibilityRole="button" accessibilityLabel={`Now playing ${track.title}. Open player`}>
      <Artwork seed={track.id} size={44} round="sm" />
      <View style={styles.text}>
        <Text numberOfLines={1} style={styles.title}>{track.title}</Text>
        <Text numberOfLines={1} style={styles.sub}>{track.artist}</Text>
      </View>
      <Pressable onPress={() => toggleLike(track.id)} hitSlop={8} style={styles.btn} accessibilityRole="button" accessibilityLabel={liked ? 'Remove from liked songs' : 'Add to liked songs'}>
        <Icon name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? colors.accent : colors.text} />
      </Pressable>
      <Pressable onPress={togglePlay} hitSlop={8} style={styles.btn} accessibilityRole="button" accessibilityLabel={playing ? 'Pause' : 'Play'}>
        <Icon name={buffering ? 'hourglass-outline' : playing ? 'pause' : 'play'} size={30} color={colors.text} />
      </Pressable>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${frac * 100}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: MINI_PLAYER_HEIGHT, marginHorizontal: space.sm, marginBottom: space.xs,
    flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.sm,
    backgroundColor: colors.raised, borderRadius: radius.md, overflow: 'hidden',
  },
  text: { flex: 1 },
  title: { color: colors.text, fontFamily: fonts.semi, fontSize: 15 },
  sub: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 1 },
  btn: { padding: 4 },
  progressTrack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, backgroundColor: 'rgba(244,240,255,0.12)' },
  progressFill: { height: 2, backgroundColor: colors.accent },
});
