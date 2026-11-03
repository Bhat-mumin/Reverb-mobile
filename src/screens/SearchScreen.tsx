import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Artwork } from '../components/Artwork';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { ScreenHeader } from '../components/ScreenHeader';
import { TrackRow } from '../components/TrackRow';
import { pluralize } from '../domain/format';
import { searchPlaylists, searchTracks } from '../domain/search';
import type { Playlist, Track } from '../domain/types';
import { useLibrary } from '../store/library';
import { usePlayer } from '../store/player';
import { colors, fonts, radius, space } from '../theme';

type Row =
  | { kind: 'header'; key: string; text: string }
  | { kind: 'track'; key: string; track: Track }
  | { kind: 'playlist'; key: string; playlist: Playlist };

export function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const tracks = useLibrary((s) => s.tracks);
  const playlists = useLibrary((s) => s.playlists);
  const play = usePlayer((s) => s.playTracks);

  const { songs, lists } = useMemo(
    () => ({ songs: searchTracks(Object.values(tracks), query), lists: searchPlaylists(playlists, query) }),
    [tracks, playlists, query],
  );

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    if (songs.length) {
      out.push({ kind: 'header', key: 'h-songs', text: `Songs · ${songs.length}` });
      songs.forEach((t) => out.push({ kind: 'track', key: `t-${t.id}`, track: t }));
    }
    if (lists.length) {
      out.push({ kind: 'header', key: 'h-lists', text: `Playlists · ${lists.length}` });
      lists.forEach((p) => out.push({ kind: 'playlist', key: `p-${p.id}`, playlist: p }));
    }
    return out;
  }, [songs, lists]);

  const trimmed = query.trim();
  const songIds = songs.map((t) => t.id);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Search" />
      <View style={styles.inputWrap}>
        <Icon name="search" size={20} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Songs, artists or playlists"
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search your library"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
            <Icon name="close-circle" size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: space.xl, flexGrow: 1 }}
        ListEmptyComponent={
          trimmed ? (
            <EmptyState icon="search-outline" title={`No results for “${trimmed}”`} body="Check the spelling, or try an artist or song name from your library." />
          ) : (
            <EmptyState icon="search-outline" title="Search your library" body="Find songs and playlists you've added to Reverb." />
          )
        }
        renderItem={({ item }) => {
          if (item.kind === 'header') return <Text style={styles.header}>{item.text}</Text>;
          if (item.kind === 'track') {
            return <TrackRow track={item.track} onPress={() => play(songIds, item.track.id)} />;
          }
          const p = item.playlist;
          return (
            <Pressable
              onPress={() => navigation.navigate('Library', { openPlaylistId: p.id })}
              style={styles.plRow}
              accessibilityRole="button"
              accessibilityLabel={`Open playlist ${p.name}`}
            >
              <Artwork seed={p.id} size={48} round="sm" />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.plName}>{p.name}</Text>
                <Text style={styles.plSub}>Playlist · {pluralize(p.trackIds.length, 'song')}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginHorizontal: space.lg, marginBottom: space.md, paddingHorizontal: space.lg, height: 48, borderRadius: radius.pill, backgroundColor: colors.surface },
  input: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 16, padding: 0 },
  header: { color: colors.text, fontFamily: fonts.bold, fontSize: 18, paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.xs },
  plRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: 8 },
  plName: { color: colors.text, fontFamily: fonts.semi, fontSize: 16 },
  plSub: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
});
