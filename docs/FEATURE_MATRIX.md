# Feature completion matrix

Status ladder: Not investigated → Investigated → Specified → In development → Implemented → **Tested** → **Verified**.
**Tested** = covered by automated tests that pass. **Verified** = confirmed working on a real Android device. *Nothing is Verified yet.*

| Area | Feature | Status | Evidence / note |
|---|---|---|---|
| Player | Play / pause / seek | Implemented | Audio output untested on device |
| Player | Next / previous (restart after 3 s) | **Tested** (logic) | `queue.test.ts` |
| Player | Shuffle (keeps current track, restores order) | **Tested** (logic) | `queue.test.ts` |
| Player | Repeat off / all / one | **Tested** (logic) | `queue.test.ts` |
| Player | Queue: play next, add, remove, move, jump | **Tested** (logic); UI Implemented | `queue.test.ts` |
| Player | Playback speed (0.75–2×) | Implemented | Engine call untested on device |
| Player | Mini player + full-screen player | Implemented | Layout unchecked on device |
| Player | Resume after restart | Implemented | Persisted queue + position; untested |
| Player | Background playback / notification | In development | Foreground service configured; remote next/prev not wired |
| Player | Gapless, crossfade, EQ | Not started | |
| Player | Lyrics | Not started | Needs a licensed lyrics source |
| Library | Import local audio (duplicate detection) | Implemented (dup logic **Tested**) | Picker/copy untested on device |
| Library | Liked songs | **Tested** (logic) | `library.test.ts` |
| Library | Playlists: create / rename / delete / add / remove | **Tested** (logic); UI Implemented | `library.test.ts` |
| Library | Sort (recent / title / artist) | **Tested** (logic) | |
| Library | Folders, collaborative, custom artwork, descriptions UI | Not started | Description field exists in data only |
| Search | Local songs + playlists, accent-insensitive | **Tested** (logic) | `misc.test.ts` |
| Discovery | Home shelves from own history | Implemented (ranking **Tested**) | Not a recommendation engine |
| Discovery | Recommendations, radio, daily mixes, moods | Not started | Needs listening data + metadata |
| Premium-style | Offline | N/A for local files (already on device) | |
| Social | Friend activity, group listening | Not started | Needs backend |
| Accounts | Sign-in, sync, backend | Not started | See ADR-4 |
| Integrations | Spotify linking / import / sync | Specified (research only) | `SPOTIFY_INTEGRATION.md` — blocked on API access |
| Research | Spotify web player | Investigated (partial) | `INVESTIGATION_SPOTIFY_WEB.md` |
| Research | YouTube Music | **Not investigated** | |
| Quality | Type-check, 45 unit tests, Android bundle build | Passing | Run on the authoring machine, not a phone |
