# TRANCHE WAVE 10 — S2 SWING WHOOSHES (TIER 3 item 10, owner 2026-10-07)

## What
Dedicated attack swing-whoosh SFX + an audible **whiff** cue when an attack hits nothing.
Attacks previously reused the single generic `whoosh.mp3` (also used by dodge S3, fanfares,
specials) — misses had no distinct read at all.

## Assets (CC0, Kenney RPG Audio — already staged, manifest-designated for S2)
- `swing1.mp3` ← `Audio/knifeSlice.ogg`
- `swing2.mp3` ← `Audio/knifeSlice2.ogg`
- `swing3.mp3` ← `Audio/chop.ogg`
Converted OGG→MP3 (ffmpeg, mono 44.1kHz 96k) into `game-3d/build/assets/`, registered in
`build/asset-manifest.json` (the build only embeds manifest-listed files — this was the
root cause of the first failed decode attempt), credited in `ASSETS_CREDITS.md`.

## Wiring (`game-3d/src/main.js`)
- `unlockAudio()` decodes swing1-3 alongside the existing keys.
- `sfxSwing(vol, whiff)` helper: random pick of the 3 with ±8% pitch jitter; `whiff=true`
  plays louder and increments the whiff test counter. `T.swingSfx` / `T.whiffSfx` counters.
- Swing sites: `doPunch` (0.5), `doHeavy` dust-launcher (0.6), `doHeavy` standard (0.55, new —
  heavy had no swing sound), `doJumpAttack` (0.55), `doBlitz` (0.6), `releaseFocus` (0.6).
- Whiff sites (resolution finds no enemy): `doPunch`, `doHeavy` (both branches),
  `doJumpAttack` (`!hitAny`), `doBlitz` (lane scan), `releaseFocus` — all `sfxSwing(0.8, true)`.
- "Miss" = no enemy hit (destructibles still smash with their own SFX; fighting-game standard).
- `__cdtest`: `swingDbg()`, `swingClear()`, `audioDbg(keys)` (proves AudioBuffer decode).

The generic `whoosh.mp3` stays for dodge S3 (intentionally distinct, 1.6x pitch), fanfares, specials.

## Verification
- Playtest `game-3d/qa/playtest-swingwhoosh.mjs`: **16/16 PASS**, zero page/console errors.
- swing1-3 all decode to AudioBuffers; punch/heavy/blitz fire swing on the swing AND whiff
  on empty air; punch with foe in range fires swing with NO whiff.
- Proof shots `game-3d/shots-swingwhoosh/` (eyes-on verified): mission start, whiff punch,
  punch connecting with STREET THUG (impact burst, enemy HP depleted).
- Headless note: game-time runs slower than real time under swiftshader — the playtest polls
  `playerDbg().busy` for idle before each attack instead of fixed sleeps (fixed the first-run
  blitz false-fail).

## Decisions
- Whiff is louder-than-swing of the SAME swing bank, not a separate sound — keeps the audio
  identity tight (misses read as "your swing hit air", not a new UI event).
- did NOT touch enemy attack SFX or special-move whooshes — next audio passes (S5 counter,
  S8 footsteps) stay separate tranches.
