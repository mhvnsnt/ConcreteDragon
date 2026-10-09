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

## Cycle 2 (2026-10-09) — shipped
- **G1 body collision** (owner gap-audit directive): circle colliders + separation
  for player/thugs/bosses (`resolveBodyCollision()` in `frame()`), iterate up to
  3x to kill chain residuals. Verified by `qa/sweep-collision.mjs` before/after.
  Branch `improveloop-c2`, PR #12 OPEN.

## Cycle 3 (2026-10-09) — watchdog-resumed, shipped
- **G2 copy fix** (no-false-advertising law): itch page draft + GAME_DESIGN.md said
  "HOLD = block" — the game has no block; HOLD HVY is focus-charge (absorb one
  hit, release = crumple strike). Copy now describes focus accurately.
- **ff() hook ported to main** so every cycle can playtest off main
  (`__cdtest.ff(n,dt)` drives full `frame()` without render).
- **Playtest verification** (`qa/playtest-improveloop-c3.mjs`, shots + results.json
  in `game-3d/shots-improveloop-c3/`, reviewed frame-by-frame): HUD present and
  correct; feet never below ground (minPy=0); facing matches movement; 5/6
  punches land (foe HP 70→0, combo popup, KO + cash reward); foes wind up and
  attack a passive player to a legitimate KO (game-over screen renders with
  stats); zero page/console errors. Collision interpenetration STILL PRESENT on
  main — expected, fixed by c2 (PR #12, awaiting merge), not a regression.
- Next: G3 enemies block/dodge (medium risk, touches enemyAI) is the top
  remaining code gap; P2/P3/P4 stay deferred to pass 2.

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
- LESSON (cycle 2): keyboard-driven playthroughs at 2fps are NOT real play —
  discrete presses land between frames and held-direction + punch becomes a
  lunge-dash (player blew from px=2 to px=53 untouched). Deterministic protocol:
  dispatch real KeyboardEvents via evaluate (same handler path as players),
  advance with `t.ff(n)`, then `await sleep()` in real time so wall-clock hit
  timeouts resolve before sampling. The `ff` hook is committed in src (cycle 2)
  so dist and source agree — never ship a phantom hook in dist again.

## OBVIOUS-DEFECT LAW (owner 2026-10-09 — the no-collision incident)
Standing, from the owner, effective immediately: if a reasonable player watching
the game would call it a bug on sight, it IS a bug — fix it, don't ask, don't
ship around it. Unless he explicitly approved it as a feature, it's a bug.
Every playtest sweeps this checklist:
1. character-vs-character collision — no interpenetration, ever
2. feet never below the ground plane
3. facing matches movement direction
4. hits visibly connect (impact + reaction, no whiffing through bodies)
5. no frozen/T-pose/idle-looking characters during action
6. HUD/UI present and correct

## Brawler-standards gap audit (owner directive 2026-10-09, cycle 2)
Audited the shipped build against the genre (SoR4, Final Fight, Urban Reign,
Def Jam, Yakuza). Verified PRESENT: hit-stop (scaled by moment), KO slow-mo,
screen shake, knockback/launch + juggle physics, edge-bounce, dodge i-frames,
focus armor (SFIV-style absorb on HOLD HVY), parry/counter system, grapple
finishers on staggered foes, enemy signature moves + windup warns, wave
director + spawn queues, endless mutators, boss intro card + boss HP bar,
combo counter, cash economy, food/health pickups, special meter + shockwave,
blitz lunges, difficulty select + rep scaling, tech recovery.
Ranked gaps:

### G1 — Body collision (P0, FIXED cycle 2)
Circle colliders + separation for player/thugs/bosses (`resolveBodyCollision()`
in `frame()`). Shipped build had only a weak enemy-enemy nudge in walk-state —
player-vs-enemy had nothing, so fighters walked straight through each other
(caught by owner in launch clips). Verified by qa/sweep-collision.mjs
before/after.

### G2 — Store copy says "HOLD = block"; game has no block (COPY FIX, no code)
HOLD HVY is focus-charge (absorb one hit, release = crumple strike) — not a
traditional block. The itch page draft advertises "HOLD = block". Per the
no-false-advertising law, fix the copy to describe focus accurately. A true
hold-block with chip damage is a design decision — logged, not built, until he
asks. (Note: SoR4 itself ships no block button; focus-armor is a legit brawler
answer — the bug is the copy, not the mechanic.)

### G3 — Enemies never block or dodge
Player offense is uncontested except by spacing — no enemy guards, no sidesteps.
SoR4/Final Fight enemies block; without it, late-game difficulty can only scale
via HP/damage numbers. Medium risk (touches enemyAI state machine).

### (boss music — separate worker lane as of 2026-10-09, loop stays off it)
