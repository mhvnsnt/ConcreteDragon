# TRANCHE WAVE 13 — S6/S7 UI click + pickup chime (TIER 3 item 13)

Date: 2026-10-08. Branch: `wave13-uipickup` (from `origin/main`). PR: #3.
Resumed from parent-side checkpoint after attempt-1 worker was killed by a daemon
restart mid-wiring — commit 1 (pickup.mp3) + partial `main.js` wiring survived.

## The gap
UI clicks used the right *sample* (`uiclick.mp3`, Kenney UI Audio `click2.ogg`) but
every call site invoked `sfx('uiclick', …)` ad hoc — no single identity, no playtest
hook, and several in-world gameplay plinks (tech, taunt, stance, focus, anti-infinite,
mascot bark) shared the call with real UI buttons. Cash pickups were silent-as-their-own:
the generic `sfx('coin')` fired on every pickup type, so cash never *read* audibly.

## Decision: one central UI-click function; dedicated cash chime, distinct-not-layered
- **Assets:** `uiclick.mp3` = Kenney UI Audio `click2.ogg` (pre-existing, already in
  `build/assets/` + manifest + credits from 2026-10-07). `pickup.mp3` = Kenney UI
  Audio `mouseclick1.ogg`, OGG→MP3 @96k, CC0 1.0 (bundled License.txt: "Creative
  Commons Zero, CC0"). mouseclick1 chosen for the chime because it's the brightest of
  the UI clicks (~8.9kHz centroid); played back 1.15x for chime character. Both
  registered in `build/asset-manifest.json` (build only embeds manifest-listed files),
  credited in `game-3d/ASSETS_CREDITS.md`, both in the `unlockAudio()` preload list.
- **Wiring:** new `sfxUiClick(vol, rate)` (mirrors the wave-10 `sfxSwing()` pattern:
  ±6% pitch jitter, `T.uiClickSfx` test hook) — all 30 existing `sfx('uiclick', …)`
  call sites now route through it (menus, pause, settings, dojo, store, shop,
  mission select, results, customize, credits, board, tech/taunt/stance/focus plinks —
  same sound as before, one consistent identity + counter).
- **Pickup chime:** new `sfxPickupChime(vol)` (mirrors the wave-12 `sfxCounter()`
  pattern: `T.pickupChimeSfx` test hook, 1.15x rate). Fires **only** on physical
  cash-pickup collection in `updatePickups()` — `awardCash()` takes a `quiet` flag so
  the pickup path skips the generic coin, and the shared `sfx('coin')` tail is gated
  off cash. Cash is audibly distinct, not layered (same philosophy as wave-12 counter
  SFX). Health/food/special pickups keep the generic coin; direct cash awards (KO
  purse, combo bonus, tag rewards) are not pickups and keep theirs.
- **Test hooks:** `__cdtest.uiClickDbg()/uiClickClear()`,
  `__cdtest.pickupChimeDbg()/pickupChimeClear()`, `__cdtest.dbgSpawnPickup(type)`
  (stages a physical pickup at the player for chime tests).
- **Embedding:** rebuilt `dist/concrete-dragon.html` (both new samples embedded
  base64 via the manifest; esbuild pre-existing `spawnBoss` duplicate-key warning
  unchanged — not from this wave).

## Playtest proof (headless, `qa/playtest-uipickup.mjs`)
**12/12 PASS, zero page/console errors.** Highlights:
- `uiclick.mp3` + `pickup.mp3` both decode to real `AudioBuffer`s via `audioDbg()`.
- Real UI button taps: `#pauseBtn` → `T.uiClickSfx` 0→1, `#resumeBtn` → 1→2.
- Staged HEALTH pickup collected → `T.pickupChimeSfx` stays 0 (chime is cash-only).
- Staged CASH pickup collected → chime fires exactly once; HUD cash $150→$173
  (proves the pickup actually collected, not just counted).
- Normal punch on a foe with no cash around → chime stays 0.
- 5 screenshots in `game-3d/shots-uipickup/` — all opened and eyes-on verified
  (title, mission start, pause overlay with RESUME/RESTART/MISSIONS + difficulty +
  sound/quality, post-cash-pickup with $173 HUD, close-range combat). No black
  frames, no placeholders.

## Notes
- `localStorage` save untouched; branch→PR only, no main push (PRs #1/#2 still await
  OWNER merge — never touch them).
- The wave-10/12 asset pattern (staging zip → 96k MP3 → manifest + credits) was
  followed exactly; license posture unchanged (CC0 throughout, manifest clean).
