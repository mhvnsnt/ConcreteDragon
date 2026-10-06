# Concrete Dragon — Pull-Ins Log (2026-10-06)
Staged open-source assets/code for GAME_ANATOMY.md gaps. **Nothing here is wired into the
playable build** — the beat-em-up build worker consumes these per docs/WIRING_QUEUE.md.
Every item below had its license verified at pull time. No GPL/AGPL anywhere in this set.
Prior UI haul (separate worker): `ui/` — Kenney UI packs, 425 icons, 9 OFL fonts, 15 SVG icons.

## audio/ — fills S2, S3, S5, S6, S7, S8, S13, S14, S15
| File | Source | License | Contents → anatomy mapping |
|------|--------|---------|---------------------------|
| kenney_rpg-audio.zip (965KB) | https://kenney.nl/assets/rpg-audio | CC0 (bundled License.txt: "Creative Commons Zero, CC0") | footsteps S8, weapon swings/whooshes S2, impacts (layer under S1), coins/pickups S7, doors/chests (breakables A7) |
| kenney_ui-audio.zip (412KB) | https://kenney.nl/assets/ui-audio | CC0 (bundled License.txt) | clicks/confirms/errors S6, unlock fanfare S6, pause menu SFX |

## combat/ — fills M1, C5
| File | Source | License | Contents → anatomy mapping |
|------|--------|---------|---------------------------|
| nipplejs.js (20KB, v0.10.2) | https://unpkg.com/nipplejs@0.10.2/dist/nipplejs.js (repo: yoannmoinet/nipplejs) | MIT (package.json `"license": "MIT"`) | floating-origin virtual joystick, Brawl Stars style: joystick spawns at touch point, follows finger, left-side zone. Fills M1; input layer for C5 dodge + beat-em-up movement |

## systems/ — fills Y8
| File | Source | License | Contents → anatomy mapping |
|------|--------|---------|---------------------------|
| seedrandom.js (8.6KB, v3.0.5) | https://unpkg.com/seedrandom@3.0.5/seedrandom.js (repo: davidbau/seedrandom) | MIT (in-file header) | seeded RNG for Y8 daily seeded runs (`new Math.seedrandom("2026-10-07")`) |

## vfx/ — fills F3 (variety), A8 (variety)
| File | Source | License | Contents → anatomy mapping |
|------|--------|---------|---------------------------|
| kenney_particle-pack.zip (15MB) | https://kenney.nl/assets/particle-pack | CC0 (bundled License.txt) | 197 particle PNGs: sparks, smoke, flashes, magic hits — variety for hit sparks F3, KO bursts, special-move VFX A9/F6 |

## art/ — fills A5 (districts)
| File | Source | License | Contents → anatomy mapping |
|------|--------|---------|---------------------------|
| kenney_city-kit-roads.zip (2.8MB) | https://kenney.nl/assets/city-kit-roads | CC0 (bundled License.txt) | road/bridge/sidewalk/barrier pieces — scrolling street segments for new districts A5 |
| kenney_city-kit-industrial.zip (5MB) | https://kenney.nl/assets/city-kit-industrial | CC0 (bundled License.txt) | industrial buildings/warehouses — "Docks"/"Warehouse District" palette variant A5 |

## Logged gaps (not faked — no clean pull found this pass)
- **Boss theme music (S13) / battle loops (S12):** no verified-CC0 loopable battle track pulled; current synth loops suffice for now. Candidates for next pass: OpenGameArt CC0 battle themes (verify per-track license at pull time).
- **Crowd ambience (S9):** freesound CC0 crowd cheers need login — flagged for the account lane.
- **Graffiti-wall texture:** 3dtextures.me has one but JS-gated; pxhere CC0 photos logged as alternates in ui/UI_PULL_INS.md.
