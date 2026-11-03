# Reverb (Android) — first build

An independent music player for **audio files you own**, with a Spotify-inspired layout and original branding.
Built with Expo (React Native + TypeScript). This is the first slice of the Reverb plan; see `docs/FEATURE_MATRIX.md`
for exactly what exists, what is tested, and what is not started.

## Run it on your Android phone (Expo Go)

1. Install **Node.js LTS** on your computer (nodejs.org).
2. Install **Expo Go** from the Play Store on your phone.
3. In this folder, in a terminal:
   ```
   npm install
   npx expo start
   ```
4. Put the phone and computer on the same Wi-Fi, open Expo Go and scan the QR code shown in the terminal.
5. In the app tap **+** (top right) → pick some audio files → tap a song.

> **Not verified on a device yet.** Everything below was checked with the TypeScript compiler, 45 unit tests, and a
> successful Android bundle build — but nobody has run it on a phone. Expect small layout/behaviour bugs on first run.
> Background playback and notification controls generally need a *development build* (`npx expo run:android`), not Expo Go.

## Commands
| Command | What it does |
|---|---|
| `npm test` | Unit tests for queue, library, search, file-name parsing |
| `npm run typecheck` | TypeScript check |
| `npx expo export --platform android` | Builds the Android JS bundle (proves everything compiles) |

## What it does today
Import local audio · play/pause · next/previous · seek · shuffle · repeat (off/all/one) · playback speed · queue (play next, add,
reorder, remove, jump) · liked songs · playlists (create, rename, delete, add/remove) · library sorting · search · home shelves from
your own play history · mini player + full-screen player · state restored after restart.

## What it does NOT do (yet)
No streaming catalogue, no accounts/sync, no Spotify linking, no lyrics, no crossfade/gapless, no recommendations engine,
no social features, no downloads (local files are already offline). Spotify's music **cannot** be played inside this app —
see `docs/SPOTIFY_INTEGRATION.md`.

## Layout
```
src/domain      pure logic (queue, library, search) + tests — no phone code
src/providers   where music comes from (local files today; add licensed providers here)
src/playback    expo-audio wrapper
src/store       zustand stores (library, player, ui), persisted with AsyncStorage
src/components  reusable UI     src/screens  tabs + player + queue
docs            architecture, feature matrix, Spotify investigation notes
```
