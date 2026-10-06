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

### Species / creature sources
- **kaykit-skeletons** — full undead bodies (possessed/undead roster tier)
- **kenney-monster-builder-pack** (367 files) — 2D PNG ONLY, not 3D-attachable.
  Keep as concept reference for monster part design, do not wire as 3D.
- **kenney-animal-pack** (124 files) — 2D PNG ONLY. Same: reference only.
- **Dragon lead (verified, not yet pulled):** TactileDream's CC0 collection on
  OpenGameArt (https://opengameart.org/node/143343) contains **Mazo Dragon
  (.blend, CC0)**, **Anthro Dragon-like Char (.obj, CC0)**, **Daemon with
  rig + animations (CC0)**. Pull these for the Concrete Dragon boss tier and
  demon species. The game's namesake needs a real dragon — this is the source.

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
