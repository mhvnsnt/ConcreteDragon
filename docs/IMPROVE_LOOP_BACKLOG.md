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
- DONE cycle 4: G3 enemies block/dodge shipped (see Cycle 4 entry). P2/P3/P4 stay deferred to pass 2.

## Cycle 4 (2026-10-09) — watchdog-resumed, shipped
- **G3 enemy block/dodge** (genre gap: player offense uncontested). Enemies in walk/recover
  (grounded, not staggered — mid-swing windup stays punishable) react at the single damage
  choke point (`landHit`):
  - **Sidestep**: 8-14% roll (thug 8%, knife 14%, boss 10%) — lateral shift 0.8-1.2 units,
    0.3s i-frames, dust + whoosh + `DODGED!` popup. The strike whiffs cleanly.
  - **Guard**: 12% roll (boss 22%) — chip damage only (12%, no crit/combo), 0.5s brace
    (faces player, holds), blue block flash + `BLOCKED -N` popup + pitched-down thud.
  - Cooldowns (guard 1.4-2.4s, dodge 1.5-2.5s) prevent permablock/permadodge.
  - Test hooks: `t.dbgG3(mode)` (guard/dodge/clean/windup), `T.guards`/`T.dodges`.
- **Verified headless** (`qa/playtest-improveloop-c4.mjs`, shots + g3-results.json in
  `game-3d/shots-improveloop-c4/`, frames reviewed by eye): guard chips 20->2 with
  guardT=0.5; dodge whiffs with 0.8-unit shift and dodgeT=0.3; clean hit lands full 20;
  windup enemy takes full+crit with NO reaction; walk regression (3.68 units, minPy=0);
  zero page/console errors.
- **Also fixed two broken-merge artifacts found on main** (the merged stack shipped
  unbuildable): duplicate `const go` (daily-run GO-button block) and a duplicated empty
  `ff` hook — esbuild caught them where `node --check` did not. Lesson for the merge lane:
  `node --check` is not enough; always build with esbuild after conflict resolution.
- Next: P2 grab/throw stays deferred (pass 2); wave/PR lanes untouched (PR #14 merged separately).

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

### P6 — Lock-on camera + chanbara circling (N9/N10)
**Refs:** Zelda OoT Z-targeting (Aonuma/Koizumi — see docs/RESEARCH_NINTENDO_VISUAL.md §2b): lock keeps player AND enemy framed, attacks converge; Miyamoto's chanbara circling duel model.
**Gap:** no lock-on; camera doesn't guarantee both fighters framed; movement is free-run always.
**Work:** soft lock-on (nearest threat), camera pulls to frame player+locked enemy, attacks converge on lock; locked movement becomes strafe/orbit.
**Risk:** medium (touches camera + combat + movement).

### P7 — AI director: off-lock enemies hold at frame edge (N11)
**Refs:** Zelda OoT Koizumi — "Z-targeting tells the other enemies to wait" (see docs/RESEARCH_NINTENDO_VISUAL.md §2b).
**Gap:** enemies dogpile/walk in without attacking (owner complaint 2026-10-09).
**Work:** AI director rule — off-lock enemies hold at frame edge (taunt, circle, occasional projectile); only N engage at once. Pairs with enemy-AI research track.
**Risk:** medium (touches enemyAI).

### P8 — Dash feel: FOV widen + camera wobble (N12)
**Refs:** Gears of War roadie run, GDC (see docs/RESEARCH_NINTENDO_VISUAL.md §2c).
**Gap:** dash feels flat.
**Work:** on dash: drop camera slightly, widen FOV 10-15%, subtle handheld wobble.
**Risk:** low.

### P9 — Rule-of-thirds framing (N13)
**Refs:** Gears GDC — don't center the hero (see docs/RESEARCH_NINTENDO_VISUAL.md §2c).
**Gap:** player likely centered, blocking threat-side view.
**Work:** default camera offsets player to lower-third; incoming-threat side stays open.
**Risk:** low.

### P10 — Cutscene multi-camera system (N14)
**Refs:** darwin3d camera theory (see docs/RESEARCH_NINTENDO_VISUAL.md §2d): cut between OTS (~10° off action line) and reaction (~60°) instead of one gliding cam.
**Gap:** no cutscene camera language.
**Work:** virtual multi-camera: establish action line, cut between profile/OTS/reaction; finisher cams — hard cut to low angle on impact, hold 0.5s, cut back.
**Risk:** medium-high (needs cutscene system).

### P11 — "Run and watch" spectacle segments (N15)
**Refs:** SA2 GameSpot hands-on (see docs/RESEARCH_NINTENDO_VISUAL.md §3a).
**Gap:** stage transitions are plain.
**Work:** chase/transition sequences — hold-forward with dramatic authored camera cuts (low chase, crane, tracking).
**Risk:** medium.

### P12 — Squash-and-stretch hit reactions (N7)
**Refs:** Luigi's Mansion (see docs/RESEARCH_NINTENDO_VISUAL.md §1d).
**Gap:** hit reactions likely realistic/stiff.
**Work:** exaggerate with squash-stretch deform on heavies, not ragdoll.
**Risk:** low-medium (animation).

### P13 — Night stage dramatic lighting (N6)
**Refs:** Luigi's Mansion single-source lighting (see docs/RESEARCH_NINTENDO_VISUAL.md §1d).
**Gap:** night stages may be flat-lit.
**Work:** streetlamp pools, neon signs, deep shadows on night/alley stages.
**Risk:** low-medium (lighting).

### P14 — HUMAN-PERSPECTIVE UX LAW (owner 2026-10-09)
**Refs:** owner directive — the character-select incident. AI builds dense/tiny/logically-complete; humans need big/clear/few. See ~/AGENTS.md HUMAN-PERSPECTIVE UX LAW.
**Gap:** character select crams options into a tiny thin bottom scroll window; menus generally dense and un-thumbable.
**Work:** (1) character select redesign FIRST: big cards, paged or horizontal, human-sized touch targets; (2) paged menus everywhere (no vertical scroll marathons); (3) glanceable hierarchy, breathing room. Menu research track (cd-menu-ui-research) producing the full spec.
**Risk:** medium (touches all menus). GLOBAL — applies to every game repo.

### P15 — Hitstop retune (the #1 feel-per-line change)
**Refs:** Street Fighter norm 9f lights / 13f heavies; Guilty Gear Xrd 7f/10f (see docs/RESEARCH_FIGHTER_MECHANICS.md). CD jab freezes ~2f.
**Gap:** hitstop severely under-tuned; hits feel weightless.
**Work:** retune `ATK` table toward 6-16f by move weight; accept cancels during hitstop (SF2 2-in-1 rule).
**Risk:** low (table values).

### P16 — SoR4 health rally (desperation rework)
**Refs:** Streets of Rage 4 — desperation HP banked as recoverable green health if you keep attacking (see docs/RESEARCH_FIGHTER_MECHANICS.md).
**Gap:** CD desperation costs 10% HP permanently — pure punishment.
**Work:** bank the cost as rally health; attacking recovers it; taking hits loses it.
**Risk:** low-medium.

### P17 — Tekken counter-hit properties
**Refs:** Tekken — counter-hits grant NEW properties (knockdown/stun/juggle), not just 2x damage (see docs/RESEARCH_FIGHTER_MECHANICS.md).
**Gap:** CD counters are flat 2x damage.
**Work:** CH launcher always launches; CH heavy crumples into grapple loop.
**Risk:** low-medium.

### P18 — Back attack input (SoR4)
**Refs:** Streets of Rage 4 (see docs/RESEARCH_FIGHTER_MECHANICS.md).
**Gap:** no hitting behind; jump is movement-only (also P4).
**Work:** dedicated back-attack input; rear positional strikes.
**Risk:** low-medium.

### P19 — Juggle damage scaling + bound slam (Tekken)
**Refs:** Tekken juggle scaling; Tekken 6 bound (one per combo) (see docs/RESEARCH_FIGHTER_MECHANICS.md).
**Gap:** juggles likely unscaled; no bound extension.
**Work:** scale juggle hits down per hit; one bound-slam extension per combo.
**Risk:** medium.

### P20 — Enemy AI rework: hover/commit + surround slots (owner #1 complaint)
**Refs:** pliskin92/supergereinaction hover-vs-commit; SoR surround slots; 2-attacker cap; OpenBOR (see docs/RESEARCH_ENEMY_AI.md for links + diagnosis).
**Gap:** enemies beeline to player's exact position (main.js ~4118-4141), no standoff/strafe/slots; strike gate (adz<0.65) slower than strafe so they trail forever; ROOKIE 1.45-3.1s recoveries; `setTimeout` hit delivery whiffs during hitstop.
**Work:** per-enemy hesitate/slot/preferGap fields; attack director (2-token cap + 6 surround slots); walk→hover/commit/reposition; game-time delayed-hit queue replacing setTimeout; keep windup telegraph + aggro scalar.
**Risk:** medium-high (touches enemyAI core). Fixes promo videos too.

### P21 — Character select redesign (UX LAW flagship)
**Refs:** SF6 character select as art; Zelda scrolling criticism; touch-target minimums 44px (see docs/RESEARCH_MENU_UI.md).
**Gap:** tiny thin bottom scroll window; 112px cards; 34px skin dots; unbounded roster growth.
**Work:** 3 swipeable pages, 6 big cards/page (150px+), page dots + arrows, scout crew to own sub-page, selection fanfare, 44px minimum touch targets.
**Risk:** medium. Sets the pattern for all menus.

### P22 — Paged mission select + menu art spec
**Refs:** see docs/RESEARCH_MENU_UI.md.
**Gap:** vertical scroll menus; plain text boxes; undifferentiated sounds.
**Work:** one zone per page, horizontal mission cards, 56px GO button; graffiti headers, panel9 treatments, styled dialogs, per-action sounds, animated page indicators, idle-life backgrounds.
**Risk:** medium.
