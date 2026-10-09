# IMPROVE-LOOP CYCLE 1 — F10 HAPTICS (2026-10-09)

## What
`navigator.vibrate` on big moments only: KO (45ms), counter (30ms), heavy hits
(25ms), HEAT finisher (35ms), player hurt (50ms). Never on normal hits — the feel
law (snappy lights stay clean) applies to haptics too. Mobile-brawler standard:
every top mobile brawler vibrates on big moments; touch games without it feel dead.

## Wiring (`game-3d/src/main.js`, `game-3d/src/template.html`)
- `buzz(ms)` helper next to the sfx helpers: increments `T.buzzN` test counter,
  skips when `save.haptics === false`, guards `navigator.vibrate` absence
  (desktop/headless no-op, never throws).
- `save.haptics = true` default (existing saves inherit ON via loadSave merge).
- Settings: HAPTICS row (`hapticsBtn`) between SOUND and QUALITY, same toggle
  pattern; turning ON fires a 20ms confirmation buzz.
- Call sites: KO banner, doPunch counter branch, doHeavy (dust launcher / HEAT /
  standard), hurtPlayer damage line.
- `__cdtest`: `buzzDbg()`, `buzzClear()`.

## Verification
- Playtest `game-3d/qa/playtest-haptics.mjs`: buzz counter fires on heavy-hit,
  counter resolution, KO, and player-hurt; a `navigator.vibrate` stub proves the
  settings toggle gates the real call path (ON = called, OFF = silent);
  settings button flips ON/OFF and persists via writeSave; zero page/console errors.
- Proof shot `game-3d/shots-improveloop-c1/haptics-ko.png`.

## Decisions
- Big moments only — no per-hit vibration (would be noise on a 60fps phone).
- Default ON (mobile-first game); one-tap OFF in settings, persisted.
- Counter increments even when vibrate is unavailable — the hook proves the
  game-logic wiring headless; the stub proves the device call path.

## Also in this cycle
- `ff(n, dt)` test hook: fast-forwards the FULL `frame()` sim without rendering
  (headless swiftshader is render-bound). Named `ff` because `__cdtest` already
  had a `step` hook (playerUpdate-only) — duplicate object-literal keys silently
  shadow, which cost a full debug cycle (documented in `docs/IMPROVE_LOOP_BACKLOG.md`).
- `docs/IMPROVE_LOOP_BACKLOG.md`: study-backed ranked backlog; wave-PR audit finding
  (PRs #1–#8 each MERGEABLE/CLEAN vs main per GitHub, but the branches conflict
  with EACH OTHER — land in order with resolution between merges).
