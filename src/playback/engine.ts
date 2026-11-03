import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from 'expo-audio';
import type { Track } from '../domain/types';

export type EngineStatus = {
  positionSec: number;
  durationSec: number;
  playing: boolean;
  buffering: boolean;
  loaded: boolean;
  finished: boolean;
  error: string | null;
};

type Listener = (s: EngineStatus) => void;

/**
 * Thin wrapper over expo-audio so the rest of the app never touches the native player directly.
 * One shared player instance; `load` swaps the source.
 */
class PlaybackEngine {
  private player: AudioPlayer | null = null;
  private listeners = new Set<Listener>();
  private ready = false;

  async init(): Promise<void> {
    if (this.ready) return;
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
      shouldPlayInBackground: true,
    });
    this.player = createAudioPlayer(null);
    this.player.addListener('playbackStatusUpdate', (s: AudioStatus) => this.emit(s));
    this.ready = true;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(s: AudioStatus) {
    const out: EngineStatus = {
      positionSec: s.currentTime ?? 0,
      durationSec: s.duration ?? 0,
      playing: s.playing,
      buffering: s.isBuffering,
      loaded: s.isLoaded,
      finished: s.didJustFinish,
      error: s.error ?? null,
    };
    this.listeners.forEach((fn) => fn(out));
  }

  load(track: Track, opts: { autoplay: boolean; startAtSec?: number; rate?: number }): void {
    const p = this.player;
    if (!p) throw new Error('Playback engine not initialised');
    p.replace({ uri: track.uri });
    if (opts.rate) p.setPlaybackRate(opts.rate);
    if (opts.startAtSec && opts.startAtSec > 1) void p.seekTo(opts.startAtSec);
    // Keeps playback alive in the background and shows lock-screen / notification controls.
    p.setActiveForLockScreen(true, { title: track.title, artist: track.artist, albumTitle: track.album });
    if (opts.autoplay) p.play();
  }

  play(): void { this.player?.play(); }
  pause(): void { this.player?.pause(); }
  seekTo(sec: number): Promise<void> { return this.player?.seekTo(Math.max(0, sec)) ?? Promise.resolve(); }
  setRate(rate: number): void { this.player?.setPlaybackRate(rate); }
  get position(): number { return this.player?.currentTime ?? 0; }

  stop(): void {
    this.player?.pause();
    this.player?.clearLockScreenControls();
  }
}

export const engine = new PlaybackEngine();
