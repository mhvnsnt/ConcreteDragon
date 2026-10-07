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

## parts/ wave 2 — species/outfit variation (owner 2026-10-06)
| Pack | Source | License | Contents → use |
|------|--------|---------|----------------|
| kenney-cube-pets (24 GLB + colormap) | https://kenney.nl/assets/cube-pets (direct zip) | CC0 (bundled License.txt) | tiger/lion/polar/fox/dog/monkey + 18 more animated animals — heads as animal-head masks, bodies as beast enemies |
| quaternius-animated-animals/wolf.glb | https://quaternius.com/packs/ultimateanimatedanimals.html via https://poly.pizza/m/P1gU3Qkr9r | CC0 (page badge + "Public Domain (CC0)" label) | rigged animated wolf — werewolf/beast head mask + body |
| quaternius-monsters (9 GLB) | https://quaternius.com/packs/ultimatemonsters.html via poly.pizza model pages (see parts/quaternius-monsters/LICENSE.md) | CC0 (page badge + per-model "Public Domain (CC0)") | dino, dragon-evolved, yeti, zombie, demon, blue-demon, ghost, orc, ghost-skull — species roster + bosses |
| quaternius-humanoids (4 GLB) | https://quaternius.com/packs/ultimatedanimatedcharacter.html via poly.pizza model pages (see parts/quaternius-humanoids/LICENSE.md) | CC0 (page badge + per-model "Public Domain (CC0)") | man/ninja/adventurer/king — street civilians, crowd NPCs, outfit variants |

Per-pack LICENSE.md files in each parts/<pack>/ dir. All downloads verified
(valid glTF magic, animated rigs intact on spot check).

## Logged gaps — wave 2 (not faked)
- **Quaternius Drive folders quota-blocked** (shared-egress IP rate limit):
  pulled the same CC0 packs via Poly Pizza mirrors instead (identical Quaternius
  CC0 content). Full 12-animal / 50-monster / 52-humanoid sets re-fetchable from
  the Drive folders in each LICENSE.md when quota clears.
- **Sports outfits:** no CC0 3D sports-character pack exists (all paid /
  restrictive / print-licensed — rejected). Per spec §8: sports uniforms via
  painted texture variants (owner's texture-customization directive).
- **Animal-head masks:** no clean CC0 wearable-mask 3D pack (3D-print STL
  market — rejected). Per spec §8: animal heads as `head`-bone attachments.

## Wave 4 — deep hunt (2026-10-07, owner pushed back on "no free vampires/sports")

| Pack | Source | License | Contents → use |
|------|--------|---------|----------------|
| oga-carmilla-vampire (blend + texture) | https://opengameart.org/content/carmilla-vampire | CC-BY 4.0 (badge verified; attribution: JellyLion) | real 3D vampire character — vampire boss/unlockable; NEEDS Blender→GLB |
| oga-jellylion-halloween (3 blends + textures) | https://opengameart.org/content/cute-skull-character + /content/emotional-ghosts | CC0 (badges verified) | skull-with-coat character; happy + sad ghosts; NEEDS Blender→GLB |
| quaternius-witch (1 animated GLB, 24 anims) | https://poly.pizza/m/QBEOV9ZUT8 (Quaternius) | CC-BY (page badge; attribution: Quaternius) | real 3D witch — witch enemy/boss |

### Logged gaps — wave 4 (honest deep search)
- **Mummies (3D):** none free. Searched OGA (mummy/mummies/pharaoh/sarcophagus, paginated), Poly Pizza, Quaternius full catalog (80+ packs), Kenney. All hits 2D sprites or CC-BY-SA (excluded). Fallback: bandage painted texture on humanoid body (spec §9).
- **Sports players (3D):** none downloadable free. OGA = 2D only (basketball pixel art, CC0 equipment sprite packs, SVG). Poly Pizza = balls/equipment only (verified AmericanFootball thumbnail = just a ball). Kenney Sports Pack = 2D tiles. Quaternius = no sports pack. itch.io = games not assets. Buildbox = signup + proprietary license (rejected). ArtStation = $49 (rejected). **Actionable:** Sketchfab has CC-BY 3D basketball players ("v0 Team Player Basketball Stylized Character", "male_character_Basketball_Player" by Tulio Portela) + "Dead Baseball Player" — but Sketchfab downloads need an authenticated login; grab with owner/build login. No free American-football player found anywhere. Fallback: jersey painted textures + CC0 equipment props (spec §9).
- **Sketchfab auth wall:** search API works anonymously; the /download endpoint returns "Authentication credentials were not provided."

## Wave 5 — arenas/weapons/humans/environments + animation hunt (2026-10-07)

| Pack | Source | License | Contents → use |
|------|--------|---------|----------------|
| kenney-car-kit (50 GLB) | https://kenney.nl/assets/car-kit (direct zip) | CC0 (bundled License.txt) | cars, cones, barriers, car debris — street props + thrown/breakable weapons |
| kenney-city-kit-commercial (41 GLB) | https://kenney.nl/assets/city-kit-commercial (direct zip) | CC0 (bundled License.txt) | commercial buildings, storefronts — city district backdrops |
| kenney-city-kit-roads (95 GLB) | https://kenney.nl/assets/city-kit-roads (direct zip) | CC0 (bundled License.txt) | roads, lamps, hydrants, fences, barriers — street ground plane + environmental weapons |
| kenney-furniture-kit (140 GLB) | https://kenney.nl/assets/furniture-kit (direct zip) | CC0 (bundled License.txt) | tables/chairs/sofas/shelves — THROWABLE/SMASHABLE weapons, interior arenas |
| pp-arenas-weapons (4 GLB) | Poly Pizza model pages (see parts/pp-arenas-weapons/LICENSE.md) | CC-BY ×3 (Clifford, MacGillivray, Zsky) + CC0 ×1 (CreativeTrio) | wrestling ring, boxing ring, 2 baseball bats |
| pp-quaternius-brawlers/for-ashlane (4 GLB) | Poly Pizza (see parts/pp-quaternius-brawlers/LICENSE.md) | CC0 (page badges) | Farmer/Worker/Adventurer/Casual — 62-joint rig, 24 clips (Punch_L/R, Kick_L/R, HitRecieve, Death). **FOR ASHLANE repo.** |

Per-pack LICENSE.md files in each parts/<pack>/ dir. All GLBs verified (valid glTF magic; Quaternius clip sets read from JSON).

### Browser-pull list (Sketchfab account exists — needs browser session)
- MMA Octagon by wesamtufail — CC-BY — https://sketchfab.com/3d-models/mma-octagon-a7aef586a9c34fe789c9b2c4acb45588
- Sledgehammer by MelonMan — license TBD — https://sketchfab.com/3d-models/sledgehammer-fe17e37490ac412a8911c3a4bac5ce7e
- Sledgehammer game asset by Oliver Wobst — CC-BY — https://sketchfab.com/3d-models/sledgehammer-game-asset-cdfabbef2573450190120ae3c2e82042
- High Poly Trashcan by caz — CC-BY — https://sketchfab.com/3d-models/high-poly-trashcan-85a88d20029b4cb18f925d06ea43ab5d
- KayKit Character Animations (itch.io free tier) — https://kaylousberg.itch.io/kaykit-character-animations

### Logged gaps — wave 5 (honest)
- **Steel cage / cell structure:** no free CC0/CC-BY 3D cage found (all paid, print-licensed, or trademarked "Hell in a Cell"). Build from Kenney fence/barrier parts or browser-pull a CC cage.
- **Kenney rate limit:** 5 more packs (city-kit-industrial, graveyard, modular-dungeon, fantasy-town, factory) truncated by kenney.nl on shared egress IP — retry later.
- **Quaternius Drive:** quota-blocked; used Poly Pizza CC0 mirrors for the 4 brawlers.
- **KayKit itch.io:** free download needs browser session (download key flow).

## Wave 6 — universe models + animations (2026-10-07, owner: "more models and animations that fit our universe too")

| Pack | Source | License | Contents → use |
|------|--------|---------|----------------|
| kenney-city-kit-industrial (37 GLB) | https://kenney.nl/assets/city-kit-industrial (direct zip) | CC0 (bundled License.txt) | industrial buildings/warehouses/smokestacks — industrial districts |
| kenney-factory-kit (143 GLB) | https://kenney.nl/assets/factory-kit (direct zip) | CC0 (bundled License.txt) | machinery/conveyors/pipes/containers — factory arenas, smashables |
| kenney-fantasy-town-kit (167 GLB) | https://kenney.nl/assets/fantasy-town-kit (direct zip) | CC0 (bundled License.txt) | town buildings/market stalls/towers — district backdrops |
| kaykit-adventures-anims (5 GLB) | https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 | CC0 (bundled LICENSE.txt) | 5 chars × ~75 clips: Unarmed Punch_A/B, Kick, Dodge x4, Hit, Death — THE fight-animation library; itch.io download was JS-blocked, GitHub carries identical clips |
| pp-street-culture (15 GLB) | Poly Pizza model pages (see parts/pp-street-culture/LICENSE.md) | CC-BY ×12 (dook/Google) + CC0 ×3 | boomboxes, graffiti walls, basketball hoops, fire escapes, subway cars, food carts, lowriders |
| pp-animated-fighters (6 GLB) | Poly Pizza model pages (see parts/pp-animated-fighters/LICENSE.md) | CC0 ×4 + CC-BY ×2 (dook) | skeleton (15 clips), zombie (16), robot-enemy (7), enemy-small (8, Punch), knight, female-fighter |
| pp-street-weapons (5 GLB) | Poly Pizza model pages (see parts/pp-street-weapons/LICENSE.md) | CC0 ×1 + CC-BY ×4 | chain, pipe, duct-pipe, beer/water bottles |
| pp-more-creatures (4 GLB) | Poly Pizza model pages (see parts/pp-more-creatures/LICENSE.md) | CC0 ×1 + CC-BY ×3 | scarecrow, goblin, frog (animated), giant squid |

Per-pack LICENSE.md files in each parts/<pack>/ dir. All GLBs verified (valid glTF magic; clip sets read from GLB JSON).

### Browser-pull candidates — wave 6 (Sketchfab session signed in as MHVNSNT)
- Boxing Gloves - Right Handed by Gohar.Munir — CC-BY — https://sketchfab.com/3d-models/boxing-gloves-right-handed-1ae09e8e4959418b9c4274f9515c5d29
- Crowbar - Game Ready Low Poly by Wonderful Optics Workshop — CC-BY — https://sketchfab.com/3d-models/crowbar-game-ready-low-poly-ec466870e57b4198b57b854bf9d37beb

### Logged gaps — wave 6 (honest)
- **Kenney graveyard-pack / modular-dungeon-pack:** slugs don't exist on kenney.nl (closest: mini-dungeon, modular-cave-kit); graveyard covered by kaykit-halloween-bits (wave 3).
- **Sketchfab MelonMan sledgehammer:** Standard license, no download — skipped per CC-only rule (browser task verified).
- **KayKit itch.io animations:** JS-driven download uncapturable — SOLVED via GitHub CC0 repos (identical clips).
