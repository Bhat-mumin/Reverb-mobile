import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { pluralize } from '../domain/format';
import { useLibrary } from '../store/library';
import { useUI } from '../store/ui';
import { colors, fonts, radius, space } from '../theme';
import { Artwork } from './Artwork';
import { Icon } from './Icon';
import { Sheet } from './Sheet';

export function AddToPlaylistSheet() {
  const trackIds = useUI((s) => s.addToPlaylistFor);
  const close = useUI((s) => s.closeAddToPlaylist);
  const showToast = useUI((s) => s.showToast);
  const playlists = useLibrary((s) => s.playlists);
  const createPlaylist = useLibrary((s) => s.createPlaylist);
  const addToPlaylist = useLibrary((s) => s.addToPlaylist);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');

  const finish = (playlistId: string, playlistName: string) => {
    const r = addToPlaylist(playlistId, trackIds ?? []);
    showToast(
      r.added > 0
        ? `Added ${pluralize(r.added, 'song')} to ${playlistName}`
        : `Already in ${playlistName}`,
    );
    setNaming(false);
    setName('');
    close();
  };

  const create = () => {
    const id = createPlaylist(name);
    if (id) finish(id, name.trim());
  };

  return (
    <Sheet visible={trackIds !== null} onClose={() => { setNaming(false); close(); }} title="Add to playlist">
      {naming ? (
        <View style={styles.nameRow}>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder="Playlist name"
            placeholderTextColor={colors.muted}
            style={styles.input}
            maxLength={60}
            onSubmitEditing={create}
            returnKeyType="done"
            accessibilityLabel="Playlist name"
          />
          <Pressable onPress={create} style={[styles.go, !name.trim() && { opacity: 0.4 }]} disabled={!name.trim()} accessibilityRole="button" accessibilityLabel="Create playlist">
            <Text style={styles.goText}>Create</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setNaming(true)} style={styles.item} accessibilityRole="button" accessibilityLabel="New playlist">
          <View style={styles.newBadge}><Icon name="add" size={26} color={colors.accentInk} /></View>
          <Text style={styles.itemText}>New playlist</Text>
        </Pressable>
      )}
      <ScrollView>
        {playlists.map((p) => (
          <Pressable key={p.id} onPress={() => finish(p.id, p.name)} style={styles.item} accessibilityRole="button" accessibilityLabel={`Add to ${p.name}`}>
            <Artwork seed={p.id} size={44} round="sm" />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.itemText}>{p.name}</Text>
              <Text style={styles.sub}>{pluralize(p.trackIds.length, 'song')}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.xl, paddingVertical: 10 },
  itemText: { color: colors.text, fontFamily: fonts.semi, fontSize: 16 },
  sub: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  newBadge: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.xl, paddingVertical: space.sm },
  input: { flex: 1, color: colors.text, backgroundColor: colors.raised, borderRadius: radius.md, paddingHorizontal: space.lg, fontFamily: fonts.medium, fontSize: 16, height: 48 },
  go: { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: space.lg, justifyContent: 'center' },
  goText: { color: colors.accentInk, fontFamily: fonts.bold, fontSize: 15 },
});
