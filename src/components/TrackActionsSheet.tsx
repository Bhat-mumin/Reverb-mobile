import { Alert } from 'react-native';
import { useLibrary } from '../store/library';
import { usePlayer } from '../store/player';
import { useUI } from '../store/ui';
import { colors } from '../theme';
import { Icon } from './Icon';
import { Sheet, SheetItem } from './Sheet';

/** The "⋯" menu for a song. Rendered once at the app root. */
export function TrackActionsSheet() {
  const ctx = useUI((s) => s.actionsFor);
  const close = useUI((s) => s.closeActions);
  const openAddToPlaylist = useUI((s) => s.openAddToPlaylist);
  const track = useLibrary((s) => (ctx ? s.tracks[ctx.trackId] : undefined));
  const liked = useLibrary((s) => (ctx ? s.likedIds.includes(ctx.trackId) : false));
  const toggleLike = useLibrary((s) => s.toggleLike);
  const removeTrack = useLibrary((s) => s.removeTrack);
  const removeFromPlaylist = useLibrary((s) => s.removeFromPlaylist);
  const enqueueNext = usePlayer((s) => s.enqueueNext);
  const enqueueEnd = usePlayer((s) => s.enqueueEnd);

  if (!ctx || !track) return <Sheet visible={false} onClose={close}>{null}</Sheet>;
  const ic = (n: React.ComponentProps<typeof Icon>['name'], c: string = colors.text) => <Icon name={n} size={22} color={c} />;

  const confirmDelete = () => {
    close();
    Alert.alert(
      'Delete from library?',
      `“${track.title}” will be removed from every playlist and its imported copy deleted from this phone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeTrack(track.id) },
      ],
    );
  };

  return (
    <Sheet visible onClose={close} title={track.title}>
      <SheetItem label="Play next" icon={ic('play-forward-outline')} onPress={() => { enqueueNext(track.id); close(); }} />
      <SheetItem label="Add to queue" icon={ic('list-outline')} onPress={() => { enqueueEnd(track.id); close(); }} />
      <SheetItem label="Add to playlist" icon={ic('add-circle-outline')} onPress={() => openAddToPlaylist([track.id])} />
      <SheetItem
        label={liked ? 'Remove from liked songs' : 'Add to liked songs'}
        icon={ic(liked ? 'heart' : 'heart-outline', liked ? colors.accent : colors.text)}
        onPress={() => { toggleLike(track.id); close(); }}
      />
      {ctx.playlistId ? (
        <SheetItem
          label="Remove from this playlist"
          icon={ic('remove-circle-outline')}
          onPress={() => { removeFromPlaylist(ctx.playlistId!, track.id); close(); }}
        />
      ) : null}
      <SheetItem label="Delete from library" icon={ic('trash-outline', colors.danger)} danger onPress={confirmDelete} />
    </Sheet>
  );
}
