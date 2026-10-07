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
4. **C2 heavy attack** — dedicated button; knockback.
5. **C5 dodge** — Urban Reign style (i-frames), NOT block. Needs S3 dodge SFX (below).
6. **C3 special move** — costs health or meter; invincible defensive variant (SoR4).
7. **C7 launcher + juggle** — pop enemy airborne, hit mid-air; **F8** edge-bounce follows.
8. **C12 near-miss bonus** — last-instant dodge = style cash.
9. **C5→U5 special meter** — HUD meter from `staging/ui/kenney-scifi` segmented bars.

## TIER 3 — audio gaps (all CC0, staged)
10. **S2 whooshes** — `kenney_rpg-audio.zip` swing/whoosh OGGs on missed attacks.
11. **S8 footsteps** — footstep00-07 OGGs, surface-appropriate.
12. **S5 counter SFX** — distinct crack/chime on counter (currently silent).
13. **S6/S7 UI + pickup** — `kenney_ui-audio.zip` clicks; pickup chime on cash.
14. **S1 layering** — layer rpg-audio impacts under existing synth hits (±5% pitch).
15. **S15 mixing** — music/sfx buses; music ducks under big hits.

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
