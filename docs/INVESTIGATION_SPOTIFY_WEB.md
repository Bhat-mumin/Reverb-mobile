# Spotify web player — investigation notes (Milestone 1, partial)

**Scope actually covered:** `open.spotify.com` in desktop Chrome (≈1030–1365 px wide), first logged out, then signed in with a
**Free** account. **Not covered:** Spotify's Android app, any Premium-only behaviour, YouTube Music (not investigated at all).
Method: REA browser tools (screenshots + a few scripted clicks) against a Chrome the owner launched and logged in themselves.
Provenance tags: **[REA]** captured by REA · **[USER-SHOT]** screenshot supplied by the owner · **[USER-SAID]** reported, not seen
by me · **[INFERRED]** read from an icon/layout, not confirmed by interaction.

## Logged out
- **[REA]** Top bar: Home button, search box (placeholder "What do you want to play?") with a separate browse icon, links
  *Premium / Support / Download*, *Install App*, *Sign up*, *Log in*. See `evidence/spotify-web-logged-out-home.png`.
- **[REA]** Home: horizontal shelves headed "Trending songs" and "Popular artists", each with "Show all"; content localised to the region.
- **[REA]** Left "Your Library" panel shows "Create your first playlist" and a podcasts prompt; a cookie banner and a bottom
  "Preview of Spotify — Sign up to get unlimited songs and podcasts with occasional ads" bar (with "Sign up free").
- **[REA]** Search: typing navigates to `/search/<query>` with no Enter key; the main pane is blank briefly while loading;
  filter chips *All, Playlists, Songs, Artists, Albums, Podcasts & Shows* + a last chip **[USER-SHOT]** "Genres & Moods".
  Top result for "arijit singh" was a *playlist*, not the artist. `evidence/spotify-web-logged-out-search.png`
- **[USER-SHOT]** At ≈1365 px the Songs list sits in a right column beside Top result; at ≈1030 px it stacks below.
- **[REA]** Artist page `/artist/<id>`: large name, "53.3M monthly listeners", green play button, shuffle, Follow, "⋯"; a
  numbered "Popular" list with play counts and durations — play counts are visible logged out. `evidence/spotify-web-logged-out-artist.png`
- **[REA]** Clicking a song row once only selected/highlighted it (play triangle on the thumbnail, "+" save icon, duration, "⋯").
- **[USER-SAID]** You must log in to play music. (My own play-button click hung the tool, so I cannot confirm this myself.)

## Signed in (Free account)
(Screenshots not included in this package because they show the owner's name and library.)
- **[REA]** Top bar adds an **"Explore Premium"** pill, Install App, a bell, a friends/people icon and a circular profile avatar.
- **[REA]** Left Library: "+" and expand icons; filter chips *Playlists / Artists / Albums*; a dismissible promo card
  **"Import your music from other apps"** with an *Import library* button; a library search icon + "Recents" sort control; rows
  such as "Liked Songs (Playlist, pinned)" and albums.
- **[REA]** Home: chips *All / Music / Podcasts*, quick-access tiles, a "New release from <artist>" feature card with play and save
  buttons, and "Made For <user>" shelf with "Show all".
- **[REA]** Artist page: adds a "Verified by Spotify" badge and a small now-playing thumbnail next to the play/shuffle controls.
- **[REA]** Right side panel (Now Playing view): large cover, title, artists, a "+" save button and a **Lyrics preview** card.
- **[REA]** Queue panel (opened via the queue button): "Now playing" row (highlighted), then "Next from: <context>" list; the
  queue button shows a highlight dot while open.
- **[REA]** Bottom player bar: cover, title/artist, "+" save, shuffle, previous, play/pause, next, repeat, elapsed/remaining time
  with scrubber; right side has six icons **[INFERRED]** (lyrics, queue, connect-to-device, volume + slider, mini player, full screen).
  Only the queue button was confirmed by clicking.
- **[REA]** Settings (`/preferences`): *Account* (edit login methods, opens externally), *Language*, *Audio quality*
  (Streaming quality dropdown = "Automatic"; "Normalize volume" toggle, off), then *Your Library* (rest of page not captured).

## What this means for Reverb
Adopted as patterns (not assets): persistent bottom player, queue as "now playing + next up", filter chips in the library,
home shelves, search-as-you-type. Deliberately different: original name, palette, generated ripple artwork.
Spotify's "Import your music from other apps" card shows import/migration is something Spotify itself pushes — worth remembering
when deciding how much to invest in Reverb's own Spotify import.

## Still to investigate
Logged-out and Free **playback** behaviour (needs a human click — scripted play clicks hung the tool); device picker; full Settings;
mobile viewport; Premium-only features (needs a Premium account); all of YouTube Music.
