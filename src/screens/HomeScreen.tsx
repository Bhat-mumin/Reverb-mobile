import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Artwork } from '../components/Artwork';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { HeaderButton, ScreenHeader } from '../components/ScreenHeader';
import { pluralize } from '../domain/format';
import { mostPlayedIds, recentlyAddedIds, recentlyPlayedIds } from '../domain/library';
import { useImport } from '../hooks/useImport';
import { useLibrary } from '../store/library';
import { usePlayer } from '../store/player';
import { colors, fonts, space } from '../theme';

function greeting(): string {
  const h = new Date().getHours();
  return h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function Shelf({ title, ids }: { title: string; ids: string[] }) {
  const tracks = useLibrary((s) => s.tracks);
  const play = usePlayer((s) => s.playTracks);
  if (ids.length === 0) return null;
  return (
    <View style={styles.shelf}>
      <Text style={styles.shelfTitle}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={ids}
        keyExtractor={(id) => id}
        contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md }}
        renderItem={({ item }) => {
          const t = tracks[item];
          if (!t) return null;
          return (
            <Pressable onPress={() => play(ids, item)} style={styles.card} accessibilityRole="button" accessibilityLabel={`Play ${t.title} by ${t.artist}`}>
              <Artwork seed={t.id} size={140} />
              <Text numberOfLines={1} style={styles.cardTitle}>{t.title}</Text>
              <Text numberOfLines={1} style={styles.cardSub}>{t.artist}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const tracks = useLibrary((s) => s.tracks);
  const history = useLibrary((s) => s.history);
  const playlists = useLibrary((s) => s.playlists);
  const likedIds = useLibrary((s) => s.likedIds);
  const { importMusic, importing } = useImport();

  const shelves = useMemo(() => {
    const state = { tracks, history, playlists, likedIds };
    return {
      recent: recentlyPlayedIds(state, 12),
      most: mostPlayedIds(state, 12),
      added: recentlyAddedIds(state, 12),
      liked: likedIds.slice(0, 12),
    };
  }, [tracks, history, playlists, likedIds]);

  const count = Object.keys(tracks).length;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={greeting()}
        right={
          <HeaderButton label="Add music from this phone" onPress={importMusic}>
            <Icon name={importing ? 'hourglass-outline' : 'add'} size={26} />
          </HeaderButton>
        }
      />
      {count === 0 ? (
        <EmptyState
          icon="musical-notes-outline"
          title="Your library is empty"
          body="Reverb plays audio files you own. Pick songs from your phone to start listening — nothing is uploaded anywhere."
          actionLabel={importing ? 'Opening…' : 'Add music'}
          onAction={importMusic}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: space.xl }}>
          <Text style={styles.summary}>
            {pluralize(count, 'song')} · {pluralize(playlists.length, 'playlist')}
          </Text>
          <Shelf title="Jump back in" ids={shelves.recent} />
          <Shelf title="Liked songs" ids={shelves.liked} />
          <Shelf title="Most played" ids={shelves.most} />
          <Shelf title="Recently added" ids={shelves.added} />
          {playlists.length > 0 ? (
            <View style={styles.shelf}>
              <Text style={styles.shelfTitle}>Your playlists</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={playlists}
                keyExtractor={(p) => p.id}
                contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => navigation.navigate('Library', { openPlaylistId: item.id })}
                    style={styles.card}
                    accessibilityRole="button"
                    accessibilityLabel={`Open playlist ${item.name}`}
                  >
                    <Artwork seed={item.id} size={140} />
                    <Text numberOfLines={1} style={styles.cardTitle}>{item.name}</Text>
                    <Text numberOfLines={1} style={styles.cardSub}>{pluralize(item.trackIds.length, 'song')}</Text>
                  </Pressable>
                )}
              />
            </View>
          ) : null}
          <Text style={styles.note}>
            Recommendations use only what you've played and liked on this phone. Playing more music makes these shelves fuller.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  summary: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14, paddingHorizontal: space.lg, marginBottom: space.sm },
  shelf: { marginTop: space.lg },
  shelfTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 20, paddingHorizontal: space.lg, marginBottom: space.md },
  card: { width: 140 },
  cardTitle: { color: colors.text, fontFamily: fonts.semi, fontSize: 15, marginTop: space.sm },
  cardSub: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
  note: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, paddingHorizontal: space.lg, marginTop: space.xl, lineHeight: 17 },
});
