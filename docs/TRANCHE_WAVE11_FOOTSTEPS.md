# TRANCHE WAVE 11 — S8 FOOTSTEPS (TIER 3 item 11, owner 2026-10-07)

## What
A dedicated 5-sample footstep SFX bank wired to REAL locomotion: the player and
walking enemies now make stride-tracked footfalls. Idle is silent, far enemies are
silent, and pushing against a wall makes no foot-skate sound.

## Assets (CC0, Kenney RPG Audio — already staged, manifest-designated for S8)
Picked 5 of the 10 staged `footstep00-09.ogg` by spectral analysis (centroid/RMS
spread bright→dark), loudness-normalized so the bank sits evenly:
- `step1.mp3` ← `Audio/footstep03.ogg` (bright, 2180 Hz centroid)
- `step2.mp3` ← `Audio/footstep00.ogg` (mid, 1635 Hz)
- `step3.mp3` ← `Audio/footstep08.ogg` (loudest attack, 1841 Hz)
- `step4.mp3` ← `Audio/footstep06.ogg` (mid-dark, 1452 Hz)
- `step5.mp3` ← `Audio/footstep09.ogg` (dark/gravelly, 1128 Hz, tail)
Converted OGG→MP3 (ffmpeg, mono 44.1kHz 96k) into `game-3d/build/assets/`, registered in
`build/asset-manifest.json` (the build only embeds manifest-listed files — the wave-10
lesson), credited in `ASSETS_CREDITS.md`. Dropped `footstep01/02/04/05/07` — the bank
stays tight; 5 varied samples + pitch jitter reads as natural without bloating the bundle.

## Wiring (`game-3d/src/main.js`)
- `unlockAudio()` decodes step1-5 alongside the existing keys.
- `sfxFootstep(dist, enemy)` helper: random pick of the 5 with ±6% pitch jitter,
  0.28 volume (sits under combat). Surface-appropriate per district pitch — cheap and
  real, one bank: overpass 1.08 (hard deck), industrial 0.88 (metal), yards/docks 0.94
  (gravel/deck), everything else 1.0. `T.stepSfx` / `T.stepEnemy` counters.
- **Player:** stride accumulator on ACTUAL ground covered per frame (1.9 units/stride),
  gated on `wantRun` (moving, not dodging/busy/airborne/knocked). Idle is silent.
  Displacement-tracking (not intended velocity) means pushing against a collider/wall
  makes no foot-skate sound — caught during the playtest (see Verification).
- **Enemies:** stride accumulator on actual ground covered in the `enemyAI` walk branch
  only (fighting/windup/recover silent). `sfxFootstep` culls enemies beyond 10 units and
  enforces a 380ms global voice cap — never a stampede.
- `__cdtest`: `stepDbg()` (counters + district + effective pitch rate), `stepClear()`,
  `estepN(n, dt)` (batch deterministic enemy-AI stepping), `audioDbg()` proves decode.

## Verification
- Playtest `game-3d/qa/playtest-footsteps.mjs`: **11/11 PASS**, zero page/console errors.
- step1-5 all decode to AudioBuffers; district wiring real (m1 neon → rate 1.0).
- Real keyboard locomotion (ArrowRight → stick.dx → playerUpdate): walked 8.96 units →
  4 steps, **exactly** floor(distance/1.9); idle 2.5s → counter flat (silent).
- Near enemy: thug walked 6.67 units toward the player → 3 enemy steps
  (stride ratio holds); driven deterministically via `estepN` chunks so the 380ms
  voice cap is respected in real time.
- Far enemy: 4 game-seconds of approach at 42 units → 0 steps (distance cull works).
- Proof shots `game-3d/shots-footsteps/` (eyes-on verified): title boot, m1 start,
  mid-walk stride frame, idle, thug approach/engagement, boss-warning frame from the
  far phase (player teleported to px 50 — legit game state).
- Headless notes: game-time runs ~10x slower than real time under swiftshader (measured
  0.44 u/s real on a 4.4 u/s run). The playtest polls positions/counters instead of
  fixed sleeps; enemy approach uses deterministic `estepN`. A transient
  `Page.captureScreenshot` CDP failure hit once — the playtest now uses a settling
  `shot()` helper with one retry.

## Decisions
- Displacement-tracked strides, not intended-velocity — pushing into walls is silent.
  (First version used intended velocity and played steps against the m1-start collider.)
- One 5-sample bank + district pitch shift, not per-district banks — cheap and real.
- Did NOT touch S5 counter SFX, S6/S7 UI+pickup, S1 layering, S15 mixing — separate tranches.
- Build-env note: `game-3d` has no `node_modules` (esbuild/three/puppeteer-core missing).
  Installed esbuild@0.24.2 + three@0.169.0 + puppeteer-core@23.11.1 at the workspace
  level (`~/workspace/package.json`, outside the repo) so `node build.mjs` and the
  `qa/*.mjs` playtests resolve. Future waves: no reinstall needed.
