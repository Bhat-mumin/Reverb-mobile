# Spotify integration — status and constraints

**Status: not implemented.** Only research notes below.

## What Spotify's own rules imply (checked 2026-11, partly from third-party summaries — re-verify at https://developer.spotify.com/documentation/web-api before building)
- Spotify announced restricted developer access in February 2026 (official post: developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security;
  migration guide: developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide).
- Summaries of those changes say new *Development Mode* apps need the **app owner to have Spotify Premium** and are limited to
  about **5 authorised users**; wider access (*Extended Quota*) is reported to require a registered business and large existing
  usage. **A Free account may therefore be unable to register/test an integration at all.** Confirm before investing.
- Several discovery endpoints (related artists, recommendations, audio features, 30-second previews, editorial playlists) were
  removed or gated for new apps since Nov 2024 — so Reverb's "similar artists" and recommendations must come from other data.
- Playback control through Spotify requires **Premium**. Spotify's audio can only be played through Spotify's own SDKs/app, never
  inside a third-party player. This app will not decode, record, copy or redistribute Spotify audio or bypass DRM.

## What a compliant integration could be
1. OAuth 2.0 Authorization Code + PKCE (no client secret on the phone), minimum scopes, state validation.
2. Tokens in secure storage (`expo-secure-store`), refresh + revoke handling, "Disconnect" and "Delete imported data" in settings.
3. Import *metadata only* (playlist names, descriptions, track order, album/artist names) into Reverb with `source: 'spotify'`.
4. Matching to *licensed/owned* audio is a separate, optional step; unmatched tracks stay as unavailable entries.
5. Export playlists back via the official API where permitted.

## Open questions for the owner
- Do you have (or will you get) a Spotify Premium account to register the developer app?
- Is a 5-user development limit acceptable for now?
