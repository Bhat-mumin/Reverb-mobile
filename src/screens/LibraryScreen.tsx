import { useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Artwork } from '../components/Artwork';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { HeaderButton, ScreenHeader } from '../components/ScreenHeader';
import { Sheet, SheetItem } from '../components/Sheet';
import { TrackRow } from '../components/TrackRow';
import { formatTime, pluralize } from '../domain/format';
import { sortTracks, type SortKey } from '../domain/library';
import type { Track } from '../domain/types';
import { useImport } from '../hooks/useImport';
import { useLibrary } from '../store/library';
import { usePlayer } from '../store/player';
import { useUI } from '../store/ui';
import { colors, fonts, radius, space } from '../theme';

type Tab = 'playlists' | 'songs' | 'liked';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recently added' },
  { key: 'title', label: 'Title' },
  { key: 'artist', label: 'Artist' },
];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, active && { color: colors.accentInk }]}>{label}</Text>
    </Pressable>
  );
}

function PlayButtons({ ids, disabled }: { ids: string[]; disabled?: boolean }) {
  const play = usePlayer((s) => s.playTracks);
  return (
    <View style={[styles.playRow, disabled && { opacity: 0.4 }]}>
      <Pressable
        disabled={disabled}
        onPress={() => play(ids, ids[0], { shuffle: false })}
        style={styles.playBtn}
        accessibilityRole="button"
        accessibilityLabel="Play all"
      >
        <Icon name="play" size={22} color={colors.accentInk} />
        <Text style={styles.playBtnText}>Play</Text>
      </Pressable>
      <Pressable
        disabled={disabled}
        onPress={() => play(ids, ids[Math.floor(Math.random() * ids.length)], { shuffle: true })}
        style={styles.shuffleBtn}
        accessibilityRole="button"
        accessibilityLabel="Shuffle play"
      >
        <Icon name="shuffle" size={20} color={colors.text} />
        <Text style={styles.shuffleText}>Shuffle</Text>
      </Pressable>
    </View>
  );
}

export function LibraryScreen() {
  const route = useRoute<any>();
  const [tab, setTab] = useState<Tab>('playlists');
  const [sort, setSort] = useState<SortKey>('recent');
  const [openId, setOpenId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<{ mode: 'create' | 'rename'; value: string } | null>(null);

  const tracks = useLibrary((s) => s.tracks);
  const playlists = useLibrary((s) => s.playlists);
  const likedIds = useLibrary((s) => s.likedIds);
  const createPlaylist = useLibrary((s) => s.createPlaylist);
  const renamePlaylist = useLibrary((s) => s.renamePlaylist);
  const deletePlaylist = useLibrary((s) => s.deletePlaylist);
  const play = usePlayer((s) => s.playTracks);
  const showToast = useUI((s) => s.showToast);
  const { importMusic, importing } = useImport();

  // Other tabs can deep-link to a playlist.
  const requested: string | undefined = route.params?.openPlaylistId;
  useEffect(() => {
    if (requested) {
      setTab('playlists');
      setOpenId(requested);
    }
  }, [requested, route.params]);

  // Android back button closes the open playlist first.
  useEffect(() => {
    if (!openId) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setOpenId(null);
      return true;
    });
    return () => sub.remove();
  }, [openId]);

  const allTracks = useMemo(() => sortTracks(Object.values(tracks), sort), [tracks, sort]);
  const likedTracks = useMemo(() => likedIds.map((id) => tracks[id]).filter((t): t is Track => !!t), [likedIds, tracks]);
  const open = openId ? playlists.find((p) => p.id === openId) : undefined;
  const openTracks = useMemo(
    () => (open ? open.trackIds.map((id) => tracks[id]).filter((t): t is Track => !!t) : []),
    [open, tracks],
  );

  const submitPrompt = () => {
    if (!prompt) return;
    if (prompt.mode === 'create') {
      const id = createPlaylist(prompt.value);
      if (id) {
        setOpenId(id);
        setTab('playlists');
      }
    } else if (open) {
      renamePlaylist(open.id, prompt.value);
    }
    setPrompt(null);
  };

  const confirmDelete = () => {
    if (!open) return;
    Alert.alert('Delete playlist?', `“${open.name}” will be deleted. Your songs stay in your library.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deletePlaylist(open.id); setOpenId(null); showToast('Playlist deleted'); } },
    ]);
  };

  // ----- Playlist detail -----
  if (openId) {
    if (!open) {
      return (
        <View style={styles.screen}>
          <ScreenHeader title="Playlist" />
          <EmptyState icon="alert-circle-outline" title="Playlist not found" body="It may have been deleted." actionLabel="Back to library" onAction={() => setOpenId(null)} />
        </View>
      );
    }
    const totalSec = openTracks.reduce((n, t) => n + (t.durationSec ?? 0), 0);
    const ids = openTracks.map((t) => t.id);
    return (
      <View style={styles.screen}>
        <ScreenHeader
          title=""
          right={
            <>
              <HeaderButton label="Back to library" onPress={() => setOpenId(null)}><Icon name="arrow-back" size={24} /></HeaderButton>
              <HeaderButton label="Rename playlist" onPress={() => setPrompt({ mode: 'rename', value: open.name })}><Icon name="create-outline" size={22} /></HeaderButton>
              <HeaderButton label="Delete playlist" onPress={confirmDelete}><Icon name="trash-outline" size={22} color={colors.danger} /></HeaderButton>
            </>
          }
        />
        <FlatList
          data={openTracks}
          keyExtractor={(t) => t.id}
          ListHeaderComponent={
            <View style={styles.detailHead}>
              <Artwork seed={open.id} size={150} round="lg" />
              <Text style={styles.detailTitle} numberOfLines={2}>{open.name}</Text>
              <Text style={styles.detailMeta}>
                {pluralize(openTracks.length, 'song')}{totalSec > 0 ? ` · ${formatTime(totalSec)}` : ''}
              </Text>
              <PlayButtons ids={ids} disabled={ids.length === 0} />
            </View>
          }
          ListEmptyComponent={
            <EmptyState icon="add-circle-outline" title="This playlist is empty" body="Open a song's ⋯ menu and choose “Add to playlist”." />
          }
          renderItem={({ item }) => <TrackRow track={item} playlistId={open.id} onPress={() => play(ids, item.id)} />}
          contentContainerStyle={{ paddingBottom: space.xl }}
        />
        {renderPrompt()}
      </View>
    );
  }

  // ----- Library tabs -----
  function renderPrompt() {
    return (
      <Sheet visible={prompt !== null} onClose={() => setPrompt(null)} title={prompt?.mode === 'rename' ? 'Rename playlist' : 'New playlist'}>
        <View style={styles.promptRow}>
          <TextInput
            autoFocus
            value={prompt?.value ?? ''}
            onChangeText={(v) => setPrompt((p) => (p ? { ...p, value: v } : p))}
            placeholder="Playlist name"
            placeholderTextColor={colors.muted}
            style={styles.promptInput}
            maxLength={60}
            returnKeyType="done"
            onSubmitEditing={submitPrompt}
            accessibilityLabel="Playlist name"
          />
          <Pressable onPress={submitPrompt} disabled={!prompt?.value.trim()} style={[styles.promptGo, !prompt?.value.trim() && { opacity: 0.4 }]} accessibilityRole="button" accessibilityLabel="Save">
            <Text style={styles.promptGoText}>Save</Text>
          </Pressable>
        </View>
      </Sheet>
    );
  }

  const count = Object.keys(tracks).length;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Your Library"
        right={
          <>
            <HeaderButton label="New playlist" onPress={() => setPrompt({ mode: 'create', value: '' })}><Icon name="albums-outline" size={22} /></HeaderButton>
            <HeaderButton label="Add music from this phone" onPress={importMusic}><Icon name={importing ? 'hourglass-outline' : 'add'} size={26} /></HeaderButton>
          </>
        }
      />
      <View style={styles.chips}>
        <Chip label="Playlists" active={tab === 'playlists'} onPress={() => setTab('playlists')} />
        <Chip label={`Songs · ${count}`} active={tab === 'songs'} onPress={() => setTab('songs')} />
        <Chip label={`Liked · ${likedTracks.length}`} active={tab === 'liked'} onPress={() => setTab('liked')} />
      </View>

      {tab === 'playlists' ? (
        <FlatList
          data={playlists}
          keyExtractor={(p) => p.id}
          ListEmptyComponent={<EmptyState icon="albums-outline" title="No playlists yet" body="Make one to group songs your way." actionLabel="New playlist" onAction={() => setPrompt({ mode: 'create', value: '' })} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => setOpenId(item.id)} style={styles.plRow} accessibilityRole="button" accessibilityLabel={`Open playlist ${item.name}`}>
              <Artwork seed={item.id} size={56} round="sm" />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.plName}>{item.name}</Text>
                <Text style={styles.plSub}>Playlist · {pluralize(item.trackIds.length, 'song')}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          )}
        />
      ) : tab === 'songs' ? (
        <FlatList
          data={allTracks}
          keyExtractor={(t) => t.id}
          ListHeaderComponent={
            allTracks.length ? (
              <View>
                <PlayButtons ids={allTracks.map((t) => t.id)} />
                <View style={styles.sortRow}>
                  {SORTS.map((s) => <Chip key={s.key} label={s.label} active={sort === s.key} onPress={() => setSort(s.key)} />)}
                </View>
              </View>
            ) : undefined
          }
          ListEmptyComponent={<EmptyState icon="musical-notes-outline" title="No songs yet" body="Add audio files from your phone to build your library." actionLabel="Add music" onAction={importMusic} />}
          renderItem={({ item }) => <TrackRow track={item} onPress={() => play(allTracks.map((t) => t.id), item.id)} />}
          contentContainerStyle={{ paddingBottom: space.xl }}
        />
      ) : (
        <FlatList
          data={likedTracks}
          keyExtractor={(t) => t.id}
          ListHeaderComponent={likedTracks.length ? <PlayButtons ids={likedTracks.map((t) => t.id)} /> : undefined}
          ListEmptyComponent={<EmptyState icon="heart-outline" title="No liked songs yet" body="Tap the heart on any song and it will show up here." />}
          renderItem={({ item }) => <TrackRow track={item} onPress={() => play(likedTracks.map((t) => t.id), item.id)} />}
          contentContainerStyle={{ paddingBottom: space.xl }}
        />
      )}
      {renderPrompt()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  chips: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm },
  sortRow: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm },
  chip: { paddingHorizontal: space.lg, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.text, fontFamily: fonts.semi, fontSize: 14 },
  plRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: 8 },
  plName: { color: colors.text, fontFamily: fonts.semi, fontSize: 16 },
  plSub: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
  playRow: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  playBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: space.xl, paddingVertical: 11 },
  playBtnText: { color: colors.accentInk, fontFamily: fonts.bold, fontSize: 16 },
  shuffleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: space.xl, paddingVertical: 11 },
  shuffleText: { color: colors.text, fontFamily: fonts.semi, fontSize: 16 },
  detailHead: { alignItems: 'center', paddingHorizontal: space.lg, paddingBottom: space.sm },
  detailTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 26, marginTop: space.lg, textAlign: 'center' },
  detailMeta: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, marginTop: 4 },
  promptRow: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.xl, paddingVertical: space.sm },
  promptInput: { flex: 1, color: colors.text, backgroundColor: colors.raised, borderRadius: radius.md, paddingHorizontal: space.lg, fontFamily: fonts.medium, fontSize: 16, height: 48 },
  promptGo: { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: space.lg, justifyContent: 'center' },
  promptGoText: { color: colors.accentInk, fontFamily: fonts.bold, fontSize: 15 },
});
