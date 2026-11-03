# Architecture decisions (ADR-style)

## ADR-1: Expo (React Native + TypeScript) for Android
**Decision.** Build the first client with Expo SDK 58.
**Why.** Fastest route to a runnable Android app; the compiler and a Metro bundle build could be run in the authoring
environment (no Android SDK was available there); one codebase can later target iOS. **Trade-off.** Lock-screen/background
playback and any future native Spotify SDK work need a development build rather than Expo Go. A native Kotlin app would give
finer media-session control; revisit if background playback proves limiting.

## ADR-2: Pure domain layer
Queue, shuffle, repeat, library, search and parsing are plain TypeScript functions with no React/audio imports
(`src/domain`). They are unit-tested (45 tests). UI and audio are thin layers on top.

## ADR-3: Provider abstraction for music sources
`MusicProvider` / `ImportingProvider` (`src/providers`). Today: `LocalFilesProvider` (files the user owns, copied into app
storage so Android file-picker links can't expire). Every `Track` has `source: ProviderId` so data from different providers
stays distinguishable (required by the brief for Spotify-imported metadata). Licensed or public-domain catalogues plug in here.

## ADR-4: Local-first, no backend yet
State lives on the device (zustand + AsyncStorage). The brief's backend/auth/sync/recommendation-service modules are **not built**;
they only make sense once there is a licensed catalogue or multi-device requirement. Decide that before adding servers.

## ADR-5: Spotify is a metadata integration, never an audio source
See `SPOTIFY_INTEGRATION.md`.

## Known design limits
- No ID3 reading: title/artist come from the file name (`Artist - Title.mp3`). Cover art is generated, not extracted.
- A "play" is counted when playback starts (Spotify counts after ~30s).
- The mini player is stacked above the tab bar and its height is reported to the navigator via a context; this has not been
  checked on a device.
- Android remote controls (headset/notification next/previous) are not wired; only metadata + the foreground service are set.
