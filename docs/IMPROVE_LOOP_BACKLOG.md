# CONCRETE DRAGON — Improve-Loop Backlog (study-backed)

**Owner:** improve-loop lane (checkpoint `concrete-dragon-improve-loop.json`).
**Method:** each item is backed by a shipped reference game (see `docs/BEATEMUP_TEARDOWN.md`),
ranked by feel-value per implementation risk. Items covered by an open wave PR are marked —
the loop does NOT duplicate them; it verifies and fills around them.

**Wave PR coverage (2026-10-09, all OPEN, all GitHub-marked MERGEABLE/CLEAN vs main):**
PR #1 S8 footsteps · #2 S5 counter SFX · #3 S6/S7 UI+pickup · #4 S1 hit layering ·
#5 S15 mixing · #6 Y8 daily seeded run · #7 VFX variety · #8 infra chrome path.
⚠️ Loop audit finding: each PR is clean vs main alone, but the branches conflict
WITH EACH OTHER (all touch `unlockAudio`/hook regions of `main.js`) — they must land
in order with conflict resolution between merges, or be rebased. Do not batch-merge blind.

## Cycle 1 (2026-10-09) — shipped
- **F10 haptics** (`navigator.vibrate` on KO/counter/heavy/player-hurt + settings toggle):
  mobile-brawler standard — every top mobile brawler uses haptics on big moments;
  scoped to big moments only per the feel law (snappy normals stay clean).
  Verified: `qa/playtest-haptics.mjs` (buzz counter fires on all four sites, vibrate
  stub proves the settings toggle gates the call path, zero page/console errors).

## Ranked open backlog (not covered by any wave/PR)

### P1 — Boss theme music (S13)
**Refs:** every game in the teardown (SoR4, Final Fight, TMNT) swaps music for bosses —
the music change IS the "this is an event" signal, bigger than the HP bar.
**Gap:** one `music.mp3` loop plays everywhere; boss fights get no audio identity.
**Work:** needs a second loop asset (nothing suitable staged — Kenney packs are SFX-only;
synth-compose a darker/faster loop in the style of the existing `music.mp3`, or source
CC0) + switch on `bossRef` spawn/defeat + keep S15 ducking coherent.
**Risk:** medium (asset quality is the risk, not code).

### P2 — Grab/throw (C8)
**Refs:** Final Fight / Double Dragon / Scott Pilgrim — walk-in grab with held sequence
+ directional throw is the genre's core crowd-control verb; "grab from stagger" is the
universal pattern. (Note: `doGrapple` + wrestling finishers exist for STAGGERED foes —
full walk-in grab/throw loop is the gap.)
**Gap:** no walk-in grapple; crowd control is punch-only.
**Work:** walk-in grab state, held mash sequence, forward/back throw choice, throw-into-
crowd damage (TMNT lesson: thrown enemies damage others).
**Risk:** medium-high (touches enemyAI + player state machine). Deferred "pass 2" by
design — keep deferred until P1 lands.

### P3 — Weapons (C11)
**Refs:** Final Fight / TMNT / SoR4 — pickup, limited-use, throwable; breakables feed
the weapon economy.
**Gap:** no weapon pickups (breakables spill cash/health/special only).
**Risk:** medium (needs pickup type + swing anim + durability). Deferred "pass 2".

### P4 — Back attack (C9) / air attack (C10)
**Refs:** Double Dragon (positional strikes), Fight'N Rage (air game as combo tool).
**Gap:** no hitting behind; jump is movement-only.
**Risk:** low-medium. Deferred "pass 2".

### P5 — Run codes (Y10) / achievements (Y11)
**Refs:** SoR4 lifetime score, DBGT performance scoring.
**Gap:** no shareable run codes, no achievement list.
**Risk:** low. Deferred until leaderboards phase per design.

### P6 — PWA install (M9)
**Gap:** manifest/icons only in the old Godot build.
**Risk:** low. Deferred until web build stabilizes per design.

## Playtest methodology notes (learned cycle 1 — keep)
- Headless swiftshader is render-bound (~2fps @844x390); game uses variable dt
  clamped at 0.05 + wall-clock `setTimeout` for hit resolution — sim runs ~0.1x.
  Do NOT fast-forward naively: `__cdtest.step` already exists (drives playerUpdate
  only) — the loop's `ff()` hook runs the FULL `frame()`; name hooks uniquely
  (duplicate object-literal keys silently shadow!).
- SHRINE blessing overlay pauses the sim mid-run — playtests must dismiss it
  (click `.blessCard`) like a player would, or results are invalid.
- Busy-poll `playerDbg().busy`, never fixed sleeps (tranche pattern).
- Eyes on screenshots every cycle; counters/hooks for audio-haptic verification.
