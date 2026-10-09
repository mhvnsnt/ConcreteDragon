# CONCRETE DRAGON — Wiring Queue (2026-10-06)
Prioritized build order for the beat-em-up worker. Sources: staged pull-ins
(`game/assets/staging/` + `PULL_INS_LOG.md`) and prior UI haul (`staging/ui/`).
Wire in this order; playtest after each tier. Owner plays and vetoes — wire, don't perfect.

## TIER 1 — controls (the scrolling game needs these first)
1. **M1 virtual joystick** — `staging/combat/nipplejs.js` (MIT). Dynamic mode, left-side
   zone, floating origin. Movement for the scrolling levels.
2. **M2 touch buttons** — attack / heavy / special / dodge from `staging/ui/` Kenney art
   (≥44pt targets, glow press states). Replaces tap-anywhere as the primary scheme
   (keep tap as fallback).
3. **M11 gesture conflicts** — disable pull-to-refresh / tap-highlight on canvas.

## TIER 2 — combat depth (owner-approved 2026-10-06)
4. **C2 heavy attack** ✅ WIRED 2026-10-07 (verified in code — audit wave 8): dedicated HVY button
   (btnHvy + keyboard `k`), per-fighter HVY attacks with knockback (hitstop/shake), DUST LAUNCHER ↓+HVY,
   HEAT contextual finishers + FOCUS hold-HVY. No work needed.
5. **C5 dodge** ✅ WIRED 2026-10-07 (tranche wave 8): Urban Reign i-frames (dodgeT=0.35) already in;
   **S3 dodge SFX added** — dedicated dodge whoosh (reuses CC0 Kenney RPG Audio `whoosh.mp3` at
   1.6x pitch / 0.4 vol, distinct from attack whooshes) + grey dust-kick burst so the dodge reads
   audibly AND visually. `T.dodgeSfx` test hook + `__cdtest.dodgeTest()`. Playtest-verified
   (qa/playtest-dodgesfx.mjs, shots-dodgesfx/, 8/8 checks, zero errors).
6. **C3 special move** ✅ WIRED 2026-10-07 (verified in code — audit wave 8): motion specials costing
   energy (qcf), BURST combo-breaker (50 energy), DESPERATION (trades 10% max HP for AOE),
   DOJO shop buyable moves (spin/tackle/uppercut), per-fighter spc2 dash/blink/slam. No work needed.
7. **C7 launcher + juggle** ✅ WIRED 2026-10-07 (verified in code — audit wave 8): DUST LAUNCHER
   universal ↓+HVY pops enemies airborne (`LAUNCH!`), mid-air hits score `JUGGLE`, ANTI-INFINITE
   fairness (3x same move = auto-drop + READ!). **F8 edge-bounce WIRED 2026-10-07 (tranche wave 9)** —
   launched enemies carry horizontal knock velocity (`e.kvx`/`e.kvz`, set in `landHit()`'s launcher
   branch: `player.face` × 7.5 u/s + small z drift); while airborne, `enemyAI()` integrates it with
   air drag and bounces enemies off arena bounds (x ∈ [0.5, maxX], z ∈ [−1.4, 1.4]) — velocity
   reflected × 0.75, wall-thud SFX (CC0 `crack.mp3` @ 0.6 pitch) + grey burst + `EDGE BOUNCE!` popup
   + vy refresh so the juggle stays alive (Urban Reign style). Playtest `qa/playtest-edgebounce.mjs`
   13/13 PASS, zero errors, shots in `game-3d/shots-edgebounce/` (eyes-on verified). No new assets;
   bosses excluded from launcher as before.
8. **C12 near-miss bonus** ✅ WIRED 2026-10-07 (verified in code — audit wave 8): `nearMiss()` fires
   on any enemy attack landing during i-frames — cash bonus + `NEAR MISS +$` popup + click SFX.
   Re-verified by wave-8 playtest.
9. **C5→U5 special meter** ✅ WIRED 2026-10-07 (verified in code — audit wave 8): energy meter in
   HUD (`spc` bar), SPC button gets `ready` glow at 60+ energy, assists/purchases gate on it.
   Segmented-bar styling from `staging/ui/kenney-scifi` not yet applied — cosmetic polish only,
   not a mechanic gap.

## TIER 3 — audio gaps (all CC0, staged)
10. **S2 whooshes** ✅ WIRED 2026-10-07 (tranche wave 10): `swing1.mp3` (knifeSlice),
    `swing2.mp3` (knifeSlice2), `swing3.mp3` (chop) from `kenney_rpg-audio.zip`, OGG→MP3 into
    `game-3d/build/assets/`, registered in `build/asset-manifest.json` (build only embeds
    manifest-listed files), credited in `ASSETS_CREDITS.md`. `sfxSwing(vol, whiff)` plays a
    random swing whoosh (±8% pitch) on every player attack swing (doPunch, doHeavy both
    branches, doJumpAttack, doBlitz, releaseFocus); when the resolution hits NO enemy a
    louder whiff whoosh fires so misses read. Generic `whoosh.mp3` kept for dodge S3 /
    fanfares / specials. Playtest `qa/playtest-swingwhoosh.mjs` 16/16 PASS, zero errors,
    shots in `game-3d/shots-swingwhoosh/` (eyes-on verified). Decision doc
    `docs/TRANCHE_WAVE10_SWINGWHOOSH.md`.
11. **S8 footsteps** — footstep00-07 OGGs, surface-appropriate.
12. **S5 counter SFX** — distinct crack/chime on counter (currently silent).
13. **S6/S7 UI + pickup** — `kenney_ui-audio.zip` clicks; pickup chime on cash.
14. **S1 layering** — layer rpg-audio impacts under existing synth hits (±5% pitch).
15. **S15 mixing** ✅ WIRED 2026-10-08 (tranche wave 15): dedicated `musicGain` /
    `sfxGain` buses in `game-3d/src/main.js` — looped music + crowd ambience ride the music
    bus, every one-shot SFX rides the sfx bus (routed by loop flag inside `sfx()`, optional
    explicit `bus` param for exceptions). `duckMusic()` dips the music bus to ~40%
    (KO ~35%) on heavy hits / launchers / finishers / KO inside `landHit()`, ramping back
    to full over ~0.6s — subtle, never mutes, never touches the sfx bus. Light punches
    (`shake <= 0.25`) do not duck. `__cdtest`: `musicBusLevel()`, `mixDbg()/mixClear()`,
    `forceBigHit()/forceLauncherHit()/forceKOHit()`, `dbgFoePassive()`, `dbgStickDown()`.
    No new assets; CC0 manifest untouched. Playtest `game-3d/qa/playtest-mixing.mjs`
    26/26 PASS, zero errors, shots in `game-3d/shots-mixing/` (eyes-on verified).
    Decision doc `docs/TRANCHE_WAVE15_MIXING.md`.

## WIRED 2026-10-06 (beat-em-up worker)
- U6 pause menu ✅ (resume/restart/quit + difficulty + move list)
- U9 settings ✅ (mute + quality, persisted)
- Y9 local leaderboards ✅ (Records screen)
- U11 unlock ceremony ✅ (fanfare + pulsing banner)
- F6 camera push-in on KO ✅
- U13/U14/U15 fonts + 9-slice panels + icons ✅ (Bungee/Anton/Bebas, SVG 9-slice, game-icons.net CC BY 3.0)
- A7 breakables ✅ evolved → full destructibles (HP + debris + pickups)

## TIER 4 — world (districts)
16. **A5 district 2 (roads)** ✅ WIRED 2026-10-07 — `kenney_city-kit-roads.zip`: THE OVERPASS
    district (mission m5 OVERPASS RUN, z1): road deck, pillars, guardrails, lamps, construction props,
    hwy signs; own palette per owner art rule. BuildStreet routes overpass → buildRoads;
    barrier/cone/dumpster breakables; 149 colliders; $750 purse bonus. Playtest-verified.
17. **A5 district 3 (industrial)** ✅ WIRED 2026-10-07 — `kenney_city-kit-industrial.zip`: THE IRONWORKS
    district (mission m6 FACTORY FLOOR, z1): 8 factory blocks, chimneys, fuel tanks, shipping containers,
    solar arrays, water-tower landmark, windmill; own palette per owner art rule. BuildStreet routes
    industrial → buildIndustrial; container/tank/solar/crate breakables drop cash/health (smash SFX = crack,
    Kenney RPG Audio); 40+ colliders; THE FOREMAN boss; $750 purse bonus. Playtest-verified (6 screenshots,
    zero console/page errors).
18. **A7 breakables** — crates/barrels with cash/health pickups (SoR apple/chicken model);
    break SFX from rpg-audio. *(partial 2026-10-07: industrial breakables wired — SHIPPING CONTAINER /
    FUEL TANK / SOLAR PANEL / CRATE with cash+health drops; smash SFX confirmed as crack from Kenney
    RPG Audio; barrel prop not in either Kenney kit — containers serve as the heavy destructible)*

## TIER 5 — systems
19. **U6 pause menu** — resume/restart/settings/quit (uses 9-slice panels + fonts from ui/).
20. **U9 settings** — volume sliders, mute, quality toggle, control scheme choice; **Y2** persist.
21. **Y8 daily seeded run** — `staging/systems/seedrandom.js` (MIT); one seed/day for all players.
22. **Y9 local leaderboards** — best wave/combo/score board screen (data already tracked).
23. **U11 unlock ceremony** — "NEW FIGHTER UNLOCKED" moment (boss-defeat → playable).

## TIER 6 — feel + variety
24. **F6 camera push-in** on KO (slow-mo already HAVE).
25. **VFX variety** — `kenney_particle-pack.zip` sparks/smoke for KO bursts, special VFX (A9).
26. **U13/U14/U15** — wire staged OFL fonts, 9-slice panels, icons across all menus/HUD.

## DEFERRED (needs design or later phase)
- C8 grab/throw, C9 back attack, C10 air attack, C11 weapons — combat expansion pass 2.
- Y10 run codes, Y11 achievements, Y13 anti-cheat — after leaderboards land.
- S9 crowd ambience — needs freesound login (account lane); S13 boss theme — next audio pass.
- M9 PWA install — after web build stabilizes.

## Laws (never break while wiring)
Style-not-power · 3D-demo naming (Street Thug/Big Rico) · slow-mo for big moments only ·
CC0/manifest stays clean · localStorage save persists · commit incrementally.
