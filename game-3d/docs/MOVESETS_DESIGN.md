# Concrete Dragon — Character Movesets Design (movesets lane)

## Roster split

| Archetype | Characters | Identity |
|-----------|-----------|----------|
| GRAPPLER | BRICK, SLEDGE, KINGPIN | Chain throws (King-style), combo grapples, juggle grapples. Slow, huge damage up close. |
| STRIKER | GHOST, VIPER, DUST | Speed, multi-hit combos, projectiles/pressure. Fragile. |
| ALL-ROUNDER | KIDBLUE, JACK | Balanced kits, one signature each. |

## Universal: basic grab (all 8)
- GRP near any foe (range 2.0): grab connects → DELIVER (suplex motion) → damage → RECOVER (back to neutral).
- On staggered foe: existing wrestling finisher (bigger, keeps `wrestle` name).
- Grapplers: longer range (2.6), more damage, chains unlock.

## Chain throws (grapplers only) — Tekken King style
Every link = DELIVER (throw lands, own clip) + RECOVER (back to neutral, own clip).
After each recover, a timed input window (UI prompt). GRP in window → next link.
Whiff the window → chain ends, back to neutral.

**BRICK** (3 links) — "the landlord":
1. RENT-A-POWERBOMB (suplex) — 30 dmg
2. EVICTION NOTICE (german suplex) — 42 dmg
3. FORECLOSURE (powerbomb, launches) — 60 dmg + launch

**SLEDGE** (4 links, deepest) — "demolition":
1. YARD TOSS (hammer throw) — 28 dmg
2. SCRAP SUPLEX (suplex) — 38 dmg
3. GIRDER GERMAN (german suplex) — 50 dmg
4. DEMOLITION DAY (chokeslam, big launch) — 75 dmg + launch

**KINGPIN** (3 links) — "royal":
1. HOSTILE SUPLEX (suplex) — 32 dmg
2. ROYAL DECREE (powerbomb) — 45 dmg
3. HOSTILE TAKEOVER (chokeslam, launches) — 65 dmg + launch

## Combo grapples (grapplers)
Grab → knee/bodyshots (2-3 quick strikes, real punch clips) → throw deliver.
Implemented as chain variant: link 0 = strikes, then throw.

## Juggle grapples (grapplers)
Foe airborne/launched + GRP in range → air grab (pop-up german motion) → slam down + bounce.
Uses PopUpGermanSuplex clip.

## Clip map (retargeted mocap, real captures)
| Clip | Source | Used for |
|------|--------|----------|
| grab_basic_deliver | Suplex.fbx (throw segment) | universal basic grab |
| grab_basic_recover | Suplex.fbx (stand tail) | universal recover |
| chain_brick_d1/r1 | Suplex.fbx | Brick link 1 |
| chain_brick_d2/r2 | GermanSuplex.fbx | Brick link 2 |
| chain_brick_d3/r3 | PowerbombWhip.fbx | Brick link 3 (finisher) |
| chain_sledge_d1/r1 | HammerThrow.fbx | Sledge link 1 |
| chain_sledge_d2/r2 | Suplex.fbx | Sledge link 2 |
| chain_sledge_d3/r3 | GermanSuplex.fbx | Sledge link 3 |
| chain_sledge_d4/r4 | Chokeslam.fbx | Sledge link 4 (finisher) |
| chain_kingpin_d1/r1 | Suplex.fbx | Kingpin link 1 |
| chain_kingpin_d2/r2 | PowerbombWhip.fbx | Kingpin link 2 |
| chain_kingpin_d3/r3 | Chokeslam.fbx | Kingpin link 3 (finisher) |
| juggle_grab_deliver | PopUpGermanSuplex.fbx | air grab |
| juggle_grab_recover | PopUpGermanSuplex.fbx tail | air grab recover |

Victim: real hit clips (Hit_A/Hit_B/Death_A) + launch physics, timed to delivers.
(Two-person mocap doesn't exist in the library; victim reactions use the game's
real hit-reaction clips — standard brawler practice, not faked animation.)

## Striker / all-rounder kits (existing qcf/spc2, deepened)
Already data-driven and distinct (fireball/teleport/command-grab/orb/spin/
groundwave/erupt). This lane deepens: per-character combo routes in the movelist,
tuned stats, and ensures each special's FEEL matches its archetype
(strikers: faster startup, less damage; grapplers: slower, more damage).
