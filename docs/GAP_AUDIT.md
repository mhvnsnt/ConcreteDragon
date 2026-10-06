# CONCRETE DRAGON — Gap Audit (2026-10-06)
Audited against docs/GAME_ANATOMY.md. Build audited: kit/src/main.js (concrete-dragon.html)
+ repo ~/workspace/street-brawl-cicd. Beat-em-up worker is rebuilding movement/menus —
items marked *(in progress)* are owned by that worker; pull-ins here must not duplicate it.

## 1. COMBAT MECHANICS
| ID | Item | Status | Note |
|----|------|--------|------|
| C1 | Basic attack string | HAVE | jab/cross/kick tap cycle |
| C2 | Heavy attack | MISSING | kick is heavier, no dedicated/charged heavy |
| C3 | Special move | MISSING | *(in progress)* |
| C4 | Super/ultimate | MISSING | no meter, no screen-clearer |
| C5 | Dodge | MISSING | *(in progress — Urban Reign style)* |
| C6 | Counter system | HAVE | "!" telegraph → tap = 2x damage |
| C7 | Launcher + juggle | MISSING | *(in progress)* |
| C8 | Grab/throw | MISSING | |
| C9 | Back attack | MISSING | |
| C10 | Air attack | MISSING | no jump at all |
| C11 | Weapon pickups | MISSING | |
| C12 | Near-miss bonus | MISSING | *(in progress)* |
| C13 | Enemy AI archetypes | PARTIAL | 4 stat-swap types + telegraphs; no real behaviors (rusher/grappler/shielded) |
| C14 | Boss fights | PARTIAL | KINGPIN = scaled stat boss, no phases/patterns *(in progress)* |
| C15 | Enemy variants evolve | PARTIAL | types cycle + scale; no visual/behavior evolution *(in progress)* |
| C16 | Combo scoring | HAVE | counter, best combo, combo cash bonus |
| C17 | Difficulty scaling | HAVE | waveSpec scales hp/dmg |

## 2. ART
| ID | Item | Status | Note |
|----|------|--------|------|
| A1 | Playable character models | HAVE | KayKit mannequins, tinted per fighter |
| A2 | Enemy models | HAVE | same rig, tint/scale variants |
| A3 | Boss models | HAVE | 1.35x scale KINGPIN |
| A4 | Animation set | PARTIAL | idle/run/punch/kick/hit/death (CC0 packs); no heavy, win pose, knockdown variety |
| A5 | District art | PARTIAL | one street; no per-district palettes *(in progress)* |
| A6 | Props | HAVE | dumpster, hydrant, cars, trash, boxes |
| A7 | Breakables + pickups | MISSING | |
| A8 | Hit VFX | HAVE | spark burst + impact ring |
| A9 | Special/super VFX | MISSING | |
| A10 | Crowd (conditional) | MISSING | owner: some missions only *(in progress)* |
| A11 | Skins/cosmetics | HAVE | data-driven, style-only |
| A12 | Graffiti/branding | HAVE | Concrete Dragon stage branding landed |

## 3. UI
| ID | Item | Status | Note |
|----|------|--------|------|
| U1 | Title menu | PARTIAL | select screen doubles as entry; no animated title *(in progress)* |
| U2 | Character select | PARTIAL | works (stats/skins/shop) but circle dots, not 3D preview *(in progress)* |
| U3 | Health bars | HAVE | functional; custom art pending from staged UI kit |
| U4 | Wave/combo/cash HUD | HAVE | |
| U5 | Special meter | MISSING | |
| U6 | Pause menu | MISSING | |
| U7 | Results screen | HAVE | |
| U8 | Shop | HAVE | Power/Tough/Hustle on select screen |
| U9 | Settings | MISSING | |
| U10 | Tutorial | HAVE | hint system, tap-to-punch prompts |
| U11 | Unlock ceremony | MISSING | |
| U12 | Leaderboards screen | MISSING | best_wave tracked, no board |
| U13 | Custom fonts | PARTIAL | 9 OFL fonts staged, not wired |
| U14 | 9-slice panels | MISSING | *(in progress)* |
| U15 | Icons | PARTIAL | 425+ staged, not wired |

## 4. AUDIO
| ID | Item | Status | Note |
|----|------|--------|------|
| S1 | Impact SFX | PARTIAL | 3 synth hits + pitch random; no layering |
| S2 | Whoosh | MISSING | |
| S3 | Dodge SFX | MISSING | (needs C5 first) |
| S4 | KO SFX | HAVE | bell + flash |
| S5 | Counter SFX | PARTIAL | flash + text, no distinct sound |
| S6 | UI SFX | HAVE | click |
| S7 | Pickup SFX | PARTIAL | cash click only |
| S8 | Footsteps | MISSING | |
| S9 | Crowd ambience | MISSING | (conditional with A10) |
| S10 | Street ambience | PARTIAL | crowd loop exists; no traffic/city bed |
| S11 | Menu music | HAVE | synth loop |
| S12 | Battle music | PARTIAL | one loop; no per-district |
| S13 | Boss theme | MISSING | |
| S14 | KO stinger | PARTIAL | bell doubles as stinger |
| S15 | Mixing buses | PARTIAL | mute flag; no buses, no ducking |

## 5. SYSTEMS
| ID | Item | Status | Note |
|----|------|--------|------|
| Y1 | Save system | HAVE | versioned localStorage key |
| Y2 | Settings persist | MISSING | (needs U9) |
| Y3 | Character unlocks | MISSING | *(in progress)* |
| Y4 | Skin system | HAVE | |
| Y5 | Upgrades | HAVE | style-not-power |
| Y6 | Level/mission structure | MISSING | *(in progress — beat-em-up worker)* |
| Y7 | Endless mode | HAVE | current core loop |
| Y8 | Daily seeded run | MISSING | |
| Y9 | Local leaderboards | PARTIAL | best_wave/wins tracked; no board |
| Y10 | Run codes | MISSING | |
| Y11 | Achievements | MISSING | |
| Y12 | Stats tracking | PARTIAL | wins/losses/KOs; no playtime |
| Y13 | Leaderboard anti-cheat | MISSING | defer to server phase |
| Y14 | Monetization hooks | PARTIAL | no-store plan docs; no in-game hooks |

## 6. GAME FEEL
| ID | Item | Status | Note |
|----|------|--------|------|
| F1 | Hit-stop scaling | HAVE | owner-tuned: snappy lights, big moments only |
| F2 | Camera shake | HAVE | |
| F3 | Hit particles | HAVE | |
| F4 | Damage numbers | HAVE | |
| F5 | Screen flash | HAVE | color-coded |
| F6 | KO slow-mo + push-in | PARTIAL | slow-mo HAVE; camera push-in MISSING |
| F7 | Hit-react anims | HAVE | |
| F8 | Edge bounce → juggle | MISSING | (needs C7) |
| F9 | Combo popup | HAVE | |
| F10 | Haptics | MISSING | |

## 7. MOBILE / WEB
| ID | Item | Status | Note |
|----|------|--------|------|
| M1 | Virtual joystick | MISSING | *(in progress — needed for scrolling)* |
| M2 | Touch buttons | MISSING | *(in progress)* |
| M3 | Tap-to-attack | HAVE | current scheme |
| M4 | Responsive layout | PARTIAL | portrait/landscape camera; HUD reflow basic |
| M5 | Perf scaling | HAVE | auto low-FX detector |
| M6 | No audio before gesture | HAVE | |
| M7 | Visibility pause | HAVE | |
| M8 | Offline single-file | HAVE | |
| M9 | Installable PWA | PARTIAL | manifest/icons in old Godot build only |
| M10 | Loading screen | HAVE | |
| M11 | No pull-to-refresh/gesture conflicts | MISSING | |
| M12 | Battery-conscious | HAVE | pixel-ratio cap + hidden pause |

## COUNT
- HAVE: 40 · PARTIAL: 24 · MISSING: 37 (of 101 items)
- 14 items tagged *(in progress)* — owned by the beat-em-up worker. Pull-ins below target the
  rest, highest value first: audio gaps, joystick code, district art, VFX, seeded-run code.
