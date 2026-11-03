import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Artwork } from '../components/Artwork';
import { Icon } from '../components/Icon';
import { RippleHalo } from '../components/RippleHalo';
import { SeekBar } from '../components/SeekBar';
import { formatTime } from '../domain/format';
import { currentId } from '../domain/queue';
import { useLibrary } from '../store/library';
import { usePlayer } from '../store/player';
import { useUI } from '../store/ui';
import { colors, fonts, radius, space } from '../theme';

export function NowPlayingModal() {
  const open = useUI((s) => s.nowPlayingOpen);
  const close = useUI((s) => s.closeNowPlaying);
  const openQueue = useUI((s) => s.openQueue);
  const openAddToPlaylist = useUI((s) => s.openAddToPlaylist);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const trackId = usePlayer((s) => currentId(s.queue));
  const track = useLibrary((s) => (trackId ? s.tracks[trackId] : undefined));
  const liked = useLibrary((s) => (trackId ? s.likedIds.includes(trackId) : false));
  const toggleLike = useLibrary((s) => s.toggleLike);

  const playing = usePlayer((s) => s.playing);
  const buffering = usePlayer((s) => s.buffering);
  const position = usePlayer((s) => s.positionSec);
  const duration = usePlayer((s) => s.durationSec);
  const rate = usePlayer((s) => s.rate);
  const shuffle = usePlayer((s) => s.queue.shuffle);
  const repeat = usePlayer((s) => s.queue.repeat);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const skipNext = usePlayer((s) => s.skipNext);
  const skipPrevious = usePlayer((s) => s.skipPrevious);
  const seek = usePlayer((s) => s.seek);
  const toggleShuffle = usePlayer((s) => s.toggleShuffle);
  const cycleRepeatMode = usePlayer((s) => s.cycleRepeatMode);
  const cycleRate = usePlayer((s) => s.cycleRate);

  const art = Math.min(width - 72, 340);
  const rateLabel = `${rate}×`;

  return (
    <Modal visible={open && !!track} animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View style={[styles.screen, { paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.lg }]}>
        <View style={styles.top}>
          <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close player">
            <Icon name="chevron-down" size={30} />
          </Pressable>
          <Text style={styles.topLabel}>Now playing</Text>
          <Pressable onPress={openQueue} hitSlop={12} accessibilityRole="button" accessibilityLabel="Open queue">
            <Icon name="list" size={26} />
          </Pressable>
        </View>

        <View style={styles.artWrap}>
          <View style={{ width: art, height: art }}>
            <RippleHalo size={art} active={playing} />
            <Artwork seed={track?.id} size={art} round="lg" />
          </View>
        </View>

        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={2} style={styles.title}>{track?.title}</Text>
            <Text numberOfLines={1} style={styles.artist}>{track?.artist}</Text>
          </View>
          {track ? (
            <Pressable onPress={() => toggleLike(track.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={liked ? 'Remove from liked songs' : 'Add to liked songs'}>
              <Icon name={liked ? 'heart' : 'heart-outline'} size={28} color={liked ? colors.accent : colors.text} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.seek}>
          <SeekBar value={position} max={duration} onSeek={seek} disabled={duration <= 0} />
          <View style={styles.times}>
            <Text style={styles.time}>{formatTime(position)}</Text>
            <Text style={styles.time}>{duration > 0 ? formatTime(duration) : '–:––'}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={toggleShuffle} hitSlop={10} accessibilityRole="button" accessibilityState={{ selected: shuffle }} accessibilityLabel={shuffle ? 'Shuffle on' : 'Shuffle off'}>
            <Icon name="shuffle" size={26} color={shuffle ? colors.accent : colors.muted} />
          </Pressable>
          <Pressable onPress={skipPrevious} hitSlop={10} accessibilityRole="button" accessibilityLabel="Previous">
            <Icon name="play-skip-back" size={34} />
          </Pressable>
          <Pressable onPress={togglePlay} style={styles.playBtn} accessibilityRole="button" accessibilityLabel={playing ? 'Pause' : 'Play'}>
            <Icon name={buffering ? 'hourglass-outline' : playing ? 'pause' : 'play'} size={36} color={colors.accentInk} />
          </Pressable>
          <Pressable onPress={skipNext} hitSlop={10} accessibilityRole="button" accessibilityLabel="Next">
            <Icon name="play-skip-forward" size={34} />
          </Pressable>
          <Pressable onPress={cycleRepeatMode} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Repeat ${repeat}`}>
            <View>
              <Icon name="repeat" size={26} color={repeat === 'off' ? colors.muted : colors.accent} />
              {repeat === 'one' ? <Text style={styles.one}>1</Text> : null}
            </View>
          </Pressable>
        </View>

        <View style={styles.bottom}>
          <Pressable onPress={cycleRate} style={styles.chip} accessibilityRole="button" accessibilityLabel={`Playback speed ${rateLabel}`}>
            <Icon name="speedometer-outline" size={18} color={rate === 1 ? colors.muted : colors.accent} />
            <Text style={[styles.chipText, rate !== 1 && { color: colors.accent }]}>{rateLabel}</Text>
          </Pressable>
          <Pressable onPress={() => track && openAddToPlaylist([track.id])} style={styles.chip} accessibilityRole="button" accessibilityLabel="Add to playlist">
            <Icon name="add-circle-outline" size={18} color={colors.muted} />
            <Text style={styles.chipText}>Playlist</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.xl },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44 },
  topLabel: { color: colors.muted, fontFamily: fonts.semi, fontSize: 14, letterSpacing: 0.6 },
  artWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.lg },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 26, lineHeight: 30 },
  artist: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, marginTop: 4 },
  seek: { marginTop: space.lg },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.md },
  playBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  one: { position: 'absolute', top: 5, left: 0, right: 0, textAlign: 'center', color: colors.accent, fontFamily: fonts.bold, fontSize: 9 },
  bottom: { flexDirection: 'row', justifyContent: 'center', gap: space.md, marginTop: space.xl },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: 10 },
  chipText: { color: colors.muted, fontFamily: fonts.semi, fontSize: 14 },
});
