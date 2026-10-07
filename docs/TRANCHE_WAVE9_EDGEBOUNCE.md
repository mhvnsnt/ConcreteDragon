# Wave 9 tranche — F8 EDGE-BOUNCE (2026-10-07)

## Backlog source
`docs/WIRING_QUEUE.md` TIER 2 item 7 (C7 launcher + juggle): **"F8 edge-bounce NOT wired —
airborne enemies hitting arena bounds just clamp; no bounce-back into juggle range.
NEXT TRANCHE CANDIDATE."** This run wired it. One improvement only.

## What was built
Launched/airborne enemies now carry horizontal knock velocity (`e.kvx`, `e.kvz`),
set at launch time in `landHit()`'s launcher branch: away from the player along
`player.face` (7.5 u/s) plus a small random z component (1.5–3 u/s). While airborne,
`enemyAI()` integrates that velocity with air drag (decay factor 1.8/s) and, on
contact with any arena bound (x ∈ [0.5, maxX], z ∈ [−1.4, 1.4]), **bounces** the
enemy back into the arena with velocity reflected × 0.75 — Urban Reign style —
instead of clamping them dead at the wall:

- Bounce fires: CC0 Kenney UI-audio `crack.mp3` pitched to 0.6 as a wall thud, grey
  `burst()` impact VFX, `EDGE BOUNCE!` popup, small screen shake (0.25), and a vy
  refresh (≥ 1.8 while low) so the juggle stays alive off the wall.
- `T.bounces` counter + `ev('edgebounce')` event for the debug log.
- Test hooks: `__cdtest.edgeBounceTest()` (deterministic: launches a foe at the left
  wall, steps physics at 1/60 until bounce, reports reflection/clamp/airborne state),
  `__cdtest.launchFoeAt(px,pz,kvx,kvz)` and `__cdtest.foeAir()` for live drills.
- Bosses unaffected (launcher branch already excludes `e.boss`).
- Micro-velocities (< 0.3 u/s) are zeroed so enemies settle instead of jittering.

Implementation note: the airborne branch sets `e.root.position.x/z` directly —
`syncPos()` was deliberately NOT used because it would zero the airborne y.

## Why this way
- The game is a street brawler (singular): wall-bounce juggles are the Urban Reign
  reference mechanic the owner keeps coming back to; a launched enemy dying at an
  invisible wall was the one anti-feel gap left in the launcher/juggle system.
- No new assets: the thud is the already-shipped `crack.mp3` pitch-shifted at
  runtime; the impact burst reuses the existing particle system. Manifest clean,
  no GPL quarantine issues (all code authored in-house).
- Slow-mo left untouched (reserved for big moments per standing law).

## Verification
- `qa/playtest-edgebounce.mjs` **12/12 checks PASS, zero console/page errors** (final run 2026-10-07):
  - boot → m1 start → enemy present.
  - `edgeBounceTest` (deterministic): bounced=true, kvx reflected +21.17 (was −30),
    px clamped at 0.5, still airborne (juggle alive).
  - Live drill `launchFoeAt(3.0, 0, −12, 0.5)`: `edgebounce` event fired, foe back
    in-bounds airborne after the wall hit.
  - Real DUST LAUNCHER (↓+HVY): foe airborne with kvx=7.5, kvz=2.87 — horizontal
    knock velocity wires through the actual attack path, not just the test hook.
- Screenshots in `game-3d/shots-edgebounce/` — all 5 inspected eyes-on: boot, m1
  start, bounce-impact burst at the wall, enemy flying back into the arena,
  launcher pop-up moment. No visual corruption, HUD intact.
