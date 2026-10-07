# PART ATTACH SPEC — Concrete Dragon character parts, species & environments

Owner directives 2026-10-06. Staged under `game/assets/staging/parts/` (character)
and `game/assets/staging/env/` (environments). **staging/ is gitignored by repo
convention** — this doc is the committed record. All packs CC0 (verified below).

## 1. THE LOOK LAW (binding)

`fighter.glb` = ONE rigged mannequin, ONE material `Character_Material` WITH a
painted texture map. Per-fighter tint MULTIPLIES over the texture (`color × map`
in three.js) — that's why fighters read as multi-colored pieces (green torso,
purple arm, etc.) shifted toward their signature color, never one flat color.

**Every part/accessory wired into the game MUST carry its own painted
multi-piece texture in the same style.** The per-fighter tint multiply then
keeps working on it. Flat untextured parts are BANNED unless they go through a
texture paint pass first. Packs below are marked ✓ (painted/textured, ready) or
⚠ (needs texture pass).

## 2. BONE ATTACHMENT POINTS (from fighter.glb — 28 nodes)

Rigify-style skeleton. Attach accessories to these bone names:

| Slot | Bone | Parts |
|---|---|---|
| Head | `head` (node 8) | hats, helmets, masks, horns, animal heads, crowns |
| Torso | `spine` (14), `chest` (13) | vests, jackets, armor, backpacks, capes |
| Shoulders | `upperarm.l` (12), `upperarm.r` (7) | shoulder pads, pauldrons |
| Hands | `hand.l` (9), `hand.r` (4) | gloves, gauntlets, claws, held weapons |
| Hips | `hips` (19) | belts, chains, skirts, tails |
| Feet | `foot.l` (1), `foot.r` (16) | boots, greaves |
| Full-body | `root` (20) | species replacements (skeleton, beast, demon bodies) |

Scale: fighter is normalized to 1.8 m at boot (`fighterHeight`). Model parts at
real-world scale; multiply by `fighter.scale` when attaching. Orientation: bones
are Y-up, character faces +Z in bind pose — verify per part in the preview
window before shipping (owner's eyes-on-everything rule).

Attachment method: `bone.add(partMesh)` after `skeleton.getBoneByName()`,
or bake the part into a cloned skin. Either way, parts inherit the fighter's
animation automatically.

## 3. PACK INVENTORY (all CC0, license verified from source)

### Character parts — 3D, ready to attach
| Pack | Files | License | Texture | Use |
|---|---|---|---|---|
| kaykit-adventurers | 72 (gltf) | CC0 — LICENSE.txt in repo, kaykit.com | ✓ painted atlas | 25+ weapons/accessories, 4 rigged characters |
| kaykit-skeletons | 34 (gltf) | CC0 — LICENSE.txt in repo | ✓ painted atlas | undead species variants, bones |
| kaykit-halloween | 270 (glb/gltf) | CC0 — LICENSE.txt in repo | ✓ painted atlas | horns, spooky accessories, possessed flavor |
| kenney-animated-characters-protagonists | 16 (fbx) | CC0 — License.txt | ✓ painted PNG skins | street-style skins (criminal, skater, cyborg) |
| kenney-animated-characters-retro | 12 (fbx) | CC0 — License.txt | ✓ painted PNG skins | retro fighter variants |
| kenney-animated-characters-survivors | 17 (fbx) | CC0 — License.txt | ✓ painted PNG skins | survivor/tough variants |
| kenney-blocky-characters | 150 (fbx) | CC0 — License.txt | ⚠ flat-shaded — texture pass needed | blocky body variants |
| kenney-mini-characters | 139 (glb/obj) | CC0 — License.txt | ⚠ flat-shaded — texture pass needed | chibi/small species |
| quaternius-rpg-characters | 60 (blend) | CC0 — License.txt | ⚠ .blend needs Blender→GLB export + texture check | fantasy classes, weapons |
| **kenney-cube-pets** (wave 2) | 24 (glb) | CC0 — License.txt + LICENSE.md | ✓ painted colormap | tiger/lion/bear/fox/dog/monkey heads → animal-head masks; full bodies → beast enemies |
| **quaternius-animated-animals** (wave 2) | 1 (glb) | CC0 — LICENSE.md | ✓ painted | wolf (rigged+animated) — werewolf/beast head mask + beast body |
| **quaternius-monsters** (wave 2) | 9 (glb) | CC0 — LICENSE.md | ✓ painted | dino, dragon-evolved, yeti, zombie, demon, blue-demon, ghost, orc, ghost-skull — species roster + bosses |
| **quaternius-humanoids** (wave 2) | 4 (glb) | CC0 — LICENSE.md | ✓ painted | man/ninja/adventurer/king — street civilians, crowd NPCs, outfit variants |
| **oga-carmilla-vampire** (wave 4) | 1 (blend + texture) | **CC-BY 4.0** — LICENSE.md (attribution: JellyLion) | ✓ painted texture (verify after GLB export) | **real 3D vampire character** — vampire boss/unlockable; ⚠ needs Blender→GLB export |
| **oga-jellylion-halloween** (wave 4) | 3 (blend + textures) | CC0 — LICENSE.md | verify after GLB export | skull-with-coat character; happy + sad ghosts — ghost enemies, skull NPC; ⚠ needs Blender→GLB export |
| **quaternius-witch** (wave 4) | 1 animated GLB (24 anims) | CC-BY — LICENSE.md (attribution: Quaternius) | ✓ vertex colors | **real 3D witch** — witch enemy/boss |

### Species / creature sources
- **kaykit-skeletons** — full undead bodies (possessed/undead roster tier)
- **quaternius-monsters** (wave 2, 3D ✓) — **dino** (dinosaur anthropomorph
  fighter/boss), **dragon-evolved** (dragon tier — the namesake boss),
  **yeti** (beast boss), **zombie** (undead variety), **demon / blue-demon**
  (possessed/demon fighters), **ghost / ghost-skull** (spectral enemies),
  **orc** (brute variant). All rigged + animated, painted, CC0.
- **kenney-cube-pets** (wave 2, 3D ✓) — 24 animated animals; tiger/lion/polar/
  fox/dog/monkey heads harvest as wearable animal-head masks (see §8);
  full bodies as beast enemies.
- **quaternius-animated-animals** (wave 2, 3D ✓) — rigged animated **wolf**
  (werewolf/beast archetype).
- **kenney-monster-builder-pack** (367 files) — 2D PNG ONLY, not 3D-attachable.
  Keep as concept reference for monster part design, do not wire as 3D.
- **kenney-animal-pack** (124 files) — 2D PNG ONLY. Same: reference only.
- **Dragon lead (additional source, verified):** TactileDream's CC0 collection on
  OpenGameArt (https://opengameart.org/node/143343) contains **Mazo Dragon
  (.blend, CC0)**, **Anthro Dragon-like Char (.obj, CC0)**, **Daemon with
  rig + animations (CC0)** — backup source for dragon/demon tier if more
  variety is needed beyond dragon-evolved.

### Environments — 3D, textured, CC0 (all KayKit, single-atlas look matches game)
| Pack | Files | Zone use |
|---|---|---|
| kaykit-city-builder | 208 | urban street zones (beat-em-up home turf) |
| kaykit-dungeon-remastered | 622 | interiors, hideouts, boss arenas |
| kaykit-furniture | 216 | interior dressing |
| kaykit-restaurant | 592 | interior zone (diner/gang hangout mission) |
| kaykit-medieval-hex | 996 | modular zone tiles, maze-like layouts |
| kaykit-prototype | 302 | greybox platforms — evolving 3D platforming levels |
| kaykit-space-base | 264 | sci-fi district (late-game wild zone) |

### 2D-only packs (do NOT wire as 3D — reference/concept only)
kenney-platformer-characters, kenney-robot-pack, kenney-shape-characters,
kenney-toon-characters — PNG sprite sheets. Useful as silhouette/concept
reference for new part designs, never as in-game 3D.
Wave-4 2D finds (logged, not staged): mummy-enemies (CC0 sprites),
Boss-Mummy.zip (CC0 sprites), mummy-1.2.zip (CC-BY sprites), basketball-player
(2D pixel art), football-pack / baseball-pack (CC0 2D equipment sprites — gloves,
balls; usable as 2D props only), robot-football-player (SVG).

## 4. ACCESSORY-UNLOCK PROGRESSION

- **Early (missions 1–10):** tint + scale variety only (current game). Parts:
  hats, masks, gloves from kaykit-adventurers.
- **Mid (bosses 1–3 beaten):** shoulder pads, vests, belts, boots. Unlock with
  each boss; boss's signature part becomes wearable.
- **Late (zone 2+):** species variants unlock — skeleton (kaykit-skeletons),
  possessed (halloween horns + dark tints), cyborg (kenney protagonists skins).
- **Endgame / infinite:** dragon tier (Mazo Dragon pull) — wings, tail, horns
  as ultimate unlocks; procedural part combinations for infinite bosses.

Rule: every boss drops their signature visual part. Beating = unlocking the
look, not just the character.

## 5. SPECIES-VARIANT PLAN

Not all fighters stay humanoid (owner: Street Fighter/KoF/Tekken variety —
demons, possessed, animal heads, literal bears):
1. **Undead** — kaykit-skeletons full-body swap (wired to same Rigify bones
   where possible, else standalone rig).
2. **Possessed/demon** — humanoid + halloween horns, glowing tint treatment,
   daemon pull from TactileDream CC0 set.
3. **Beast** — animal-head attachments (model new heads in the painted-texture
   style; kenney-animal-pack 2D as silhouette reference).
4. **Dragon** — Mazo Dragon / Anthro Dragon pull for the Concrete Dragon boss
   tier. This is the game's namesake — highest priority species pull.

## 6. ENVIRONMENT / ZONE PLAN (old-school beat-em-up structure)

Zone = 4–6 missions → boss → next zone. Districts evolve as you progress:
1. **Zone 1 — The Block** (kaykit-city-builder): pure side-scroll, back/forward.
2. **Zone 2 — Hideouts** (dungeon + furniture + restaurant): interiors, first
   verticality (stairs, platforms from prototype kit).
3. **Zone 3 — The Maze** (medieval-hex tiles): maze-like layouts, branching
   paths, up/down movement.
4. **Zone 4 — Neon/Space** (space-base): full 3D movement, platforms, wild
   modifiers.
Each zone reuses the beat-em-up loop (walk, fight, smash, boss) with new
geometry, palettes, and gimmicks — familiar rhythm, "oh damn, what's next?"
escalation. Crowd only in designated arena missions per owner rule.

## 7. WIRING ORDER FOR BUILD WORKER
1. kaykit-adventurers accessories (hats/weapons) — smallest, immediate win
2. kenney animated-character PNG skins as alt skins (look-law ✓)
3. Boss signature parts (mid-tier unlocks)
4. kaykit-city-builder street dressing in Zone 1
5. Species variants (skeleton → possessed → dragon pull)
6. Zone 2–4 environment rollout with platforming pieces
7. **(wave 2)** Animal-head masks on `head` bone (tiger/lion/wolf) — beast-fighter
   unlocks; quaternius-monsters as species-variant bosses/enemies;
   quaternius-humanoids as crowd/civilian variety
8. **(wave 2)** Sports jersey texture variants (see §8) + beast/demon roster
   expansion in later zones

## 8. WAVE 2 NOTES — MASKS, SPORTS, IP (owner 2026-10-06)

**Animal-head masks:** no clean CC0 "wearable mask" 3D pack exists (market is
3D-print STLs with restrictive licenses — rejected). Approach: harvest HEADS
from kenney-cube-pets (tiger, lion, polar, fox, dog, monkey) and
quaternius-animated-animals (wolf) and parent the head mesh to the fighter's
`head` bone, scaled to sit over the mannequin head like a mask/helmet. The
painted colormap keeps the look law. Lizard/reptile: quaternius-monsters
**dino** head serves the same role (dinosaur anthropomorph = full-body
alternative).

**Sports outfits:** no CC0 3D sports-character pack found (all paid/restrictive/
print-licensed — rejected). Approach per owner's texture-customization
directive: sports uniforms are PAINTED TEXTURE VARIANTS (football jersey,
boxing robe, baseball uniform, basketball kit) authored in the patchwork style
and equipped via the texture-variant system + tint. Sports props (balls,
gloves, bats) to be pulled if a CC0 source surfaces; until then, texture does
the work — boxing gloves can also be modeled as simple painted hand
attachments on `hand.l/r`.

**Vampires/werewolves:** vampire = quaternius-monsters **demon/blue-demon**
with pale tint + kaykit-halloween accessories; werewolf = **wolf** head mask +
beast body, full-moon zone modifier. Zombie variety: **zombie** + kaykit-
skeletons + tint shifts.

**IP RULE (binding):** inspired-by archetypes only. A Blanka-style green
beast-person is FINE; Blanka himself (name, exact look, backstory) is NEVER
used. Same for all franchise characters — archetypes in, names/likenesses
out. Builder-invented names need owner approval per standing rule.

## 9. WAVE 3 NOTES — HALLOWEEN/MONSTERS (owner 2026-10-06)

**Staged packs (all CC0-verified, per-pack LICENSE.md):**

| pack | models | license | use |
|---|---|---|---|
| kaykit-halloween-bits | 63 glTF | CC0 (Kay Lousberg) | graveyard env: graves, coffins, crypt, fences, dead trees, skulls, candles, lanterns; **pumpkin_orange_jackolantern.gltf = pumpkin-head harvest** |
| gobkit-animals | 38 GLB (rigged+animated, baked idle/attack/dead/walk) | CC0 1.0 | Bat → vampire bats; Shark/Anglerfish/Jellyfish/Whale → sea monsters (scale up); **Plesiosaurus → sea serpent**; Rat → giant rat; Owl/Fugu → ambient; minions A–D → Halloween grunt enemies; dinos → boss tier |
| oga-vampire-bat | 1 (.blend — NEEDS Blender→GLB conversion) | CC0 (rubberduck, OGA node 86190) | animated vampire bat, frost variant included |
| quaternius-spider | 1 animated GLB | CC0 (Quaternius via Poly Pizza) | giant spider enemy — scale up |

**Sea monster coverage:** Whale (scaled 3–4x) = leviathan boss; Plesiosaurus = sea serpent; Anglerfish/Jellyfish/Shark = deep-sea pack. No dedicated kraken found CC0-clean — paid/print-licensed options rejected.

**Humanoid gap — composition recipes (no clean CC0 3D vampire/witch/mummy found; web hunt exhausted OGA + Poly Pizza):**
- **Pumpkin-head guy (priority):** mount `pumpkin_orange_jackolantern.gltf` head on fighter `head` bone (mask approach, §8) + autumn-orange painted body texture. Unlockable Halloween character.
- **Tall thin suited figure (priority, original design — never a named character):** KayKit `Rogue_Hooded.glb` scaled (0.9, 1.25, 0.9) + near-black suit painted texture + pale blank head tint. Faceless by texture (no face paint on head zone).
- **Vampire:** `Rogue_Hooded.glb` or quaternius `man` + pale skin tint + dark cape tones + red-eye head-zone paint. Vampire bats (above) as companions/summons.
- **Witch:** KayKit `Mage.glb` (rigged + animated) + cone-hat attachment (primitive, painted) + dark dress texture variant. Broom = weapon attachment on `hand.r`.
- **Mummy:** quaternius `man`/KayKit body + full-body bandage painted texture (wrap pattern in patchwork style) + dusty tint.
- **Scarecrow:** jack-o-lantern head + straw-textured body (painted) — optional stretch.

**Env:** halloween-bits props → haunted-house/graveyard zone dressing; fog = shader/atmosphere (build-side). Seasonal event system (Halloween missions + unlocks) is build-worker scope.

## 10. WAVE 4 NOTES — DEEP HUNT: VAMPIRES / MUMMIES / SPORTS (owner 2026-10-06)

Owner pushed back on wave-3's "no free vampires/sports exist" claim — this wave dug deeper. **He was half right: a real 3D vampire WAS found.**

**Staged packs:**

| pack | models | license | use |
|---|---|---|---|
| oga-carmilla-vampire | 1 (.blend + painted texture — NEEDS Blender→GLB conversion) | **CC-BY 4.0** (JellyLion, OGA node carmilla-vampire; attribution required) | **real 3D vampire character** — the owner's lead. Original character named "Carmilla" (public-domain 1872 Le Fanu novella name; author states NOT modeled on any franchise character). Vampire boss/unlockable. |
| oga-jellylion-halloween | 3 (.blend — NEEDS Blender→GLB conversion) | CC0 (JellyLion) | cute skull-with-coat character (`cute_skull.blend`); happy + sad ghosts (`Ghosts2.blend`, `Ghosts4 sad ghost only.blend` + textures). Ghost enemies, skull NPC. |
| quaternius-witch | 1 animated GLB (24 anims: idle/walk/run/punch/kick/sword/death) | CC-BY (Quaternius via Poly Pizza; attribution required) | **real 3D witch** — staged by prior wave-4 attempt. Witch enemy/boss. |

**Mummies — honest gap (deep search, nothing CC0/CC-BY 3D found):**
Searched: OGA keywords (mummy, mummies, pharaoh, sarcophagus — paginated), Poly Pizza, Quaternius full catalog (80+ packs), Kenney full catalog. Results: `mummy-enemies` (CC0, 2D sprites), `Boss-Mummy.zip` (CC0, 2D PNG), `mummy-1.2.zip` (CC-BY, 2D PNG sprites), `little-mummy` (CC-BY-SA 4.0 — **excluded**, SA not allowed). No free 3D mummy exists. Fallback stays the wave-3 recipe: quaternius `man` + bandage painted texture.

**Sports characters — honest gap with one actionable lead:**
Searched: OGA (football/basketball/baseball player, sports character, jersey, cheerleader, referee), Poly Pizza, Kenney (Sports Pack = 2D top-down tiles only), Quaternius full catalog (no sports pack), itch.io (games only, no asset packs), Buildbox (signup + proprietary license — rejected), ArtStation ($49 — rejected). OGA hits were all 2D: `basketball-player` (2D pixel art, real-person likeness), `football-pack`/`baseball-pack` (CC0 2D equipment sprites — gloves/balls, useful as props), `robot-football-player` (SVG). Poly Pizza "AmericanFootball" verified as just a ball (thumbnail inspected).
**Actionable lead:** Sketchfab HAS downloadable CC-BY 3D players — "v0 Team Player Basketball Stylized Character" + "male_character_Basketball_Player" (by Tulio Portela), "Dead Baseball Player" — but Sketchfab downloads require an authenticated login, which the asset-hunt worker cannot do. **Build worker / owner: download these with a Sketchfab login and stage them.** No free American-football player found anywhere (only balls/fields).
Fallback stays the wave-3 recipe: sports via painted jersey textures on humanoid bodies + equipment props (balls, bats from CC0 packs).

**2D-only, logged not staged:** mummy-enemies, Boss-Mummy.zip sprites, mummy-1.2.zip sprites, basketball-player pixel art, football-pack/baseball-pack equipment sprites, robot-football-player SVG.
