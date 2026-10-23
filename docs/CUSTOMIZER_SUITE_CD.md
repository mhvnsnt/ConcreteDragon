# CUSTOMIZER SUITE — Concrete Dragon port (phase 2)

Port of the 7-item character-customization suite (chain-pendant orientation fix, masks,
gloves/wrist-pads/shoes/hoods, face-paint system, hairstyles, eye-color) from the
shared-universe build into Concrete Dragon's Three.js web customizer
(`game-3d/src/main.js`, `PART_DEFS`, `renderCustomize()`).

## 7-item suite → CD mapping

| # | Suite item (tech) | CD gear slot | PART_DEFS `slot` | Bone(s) | Status |
|---|---|---|---|---|---|
| 1 | Chain pendant orientation fix | CHAINS (accessory) | `accessory` | `chest` | DONE — `pendantChain()` helper; `neckchain` reoriented; `dogtags`, `curbchain`, `saintmedal` added |
| 2 | Masks | — (flavor) | `head` | `head` | DONE — `skimask`, `bandana`, `hockeymask`, `luchamask` (generic), `beastmask` |
| 3 | Gloves / wrist pads / shoes | GEAR GLOVES / GEAR BOOTS | `arms`, `boots` | `hand.l/r`, `wrist.l/r`, `lowerleg.l/r`, `foot.l/r` | DONE — `boxgloves`, `wristpads`, `forearmwraps`; `workboots`, `neonsneak`, `canvaslo`, `kickboots` |
| 4 | Hoods | GEAR JACKET (hoods live in `head` slot) | `head`, `torso` | `head`, `chest` | DONE — `hoodieup`, `pufferhood`, `hoodedvest` |
| 5 | Face paint system | — | — | — | OUT OF SCOPE (Three.js) — Godot skins follow-up |
| 6 | Hairstyles | — (flavor) | `head` | `head` | DONE — `fade`, `braids`, `mohawk`, `dreads` (painted-texture law) |
| 7 | Eye color | — | — | — | OUT OF SCOPE (Three.js) — Godot skins follow-up |

Face paint and eye color live in the Godot paper-doll skin pipeline
(`assets/art/<skin>/`, painted into head/texture variants like the existing
`rook_noir` / `vex_crimson` packs) — that is the Godot-side follow-up, out of
scope for this Three.js web port.

Cosmetic-only, zero stats — nothing here touches GEAR/stat code.

## Slot / bone table (new parts)

| id | name | slot | rar | bones |
|---|---|---|---|---|
| skimask | Ski Mask | head | street | head |
| bandana | Bandana | head | street | head |
| hockeymask | Hockey Mask | head | epic | head |
| luchamask | Lucha Mask | head | rare | head |
| beastmask | Beast Mask | head | legendary | head |
| hoodieup | Hood Up | head | street | head |
| pufferhood | Puffer Hood | head | rare | head |
| hoodedvest | Hooded Vest | torso | street | chest |
| fade | Fade | head | street | head |
| braids | Braids | head | rare | head |
| mohawk | Mohawk | head | epic | head |
| dreads | Dreads | head | legendary | head |
| boxgloves | Boxing Gloves | arms | rare | hand.l, hand.r |
| wristpads | Wrist Pads | arms | street | wrist.l, wrist.r |
| forearmwraps | Forearm Wraps | arms | street | lowerarm.l, lowerarm.r |
| workboots | Work Boots | boots | rare | foot.l, foot.r |
| neonsneak | Neon Sneakers | boots | epic | foot.l, foot.r |
| canvaslo | Canvas Lows | boots | street | foot.l, foot.r |
| kickboots | Kickboxer Boots | boots | rare | foot.l, foot.r |
| denimjacket | Denim Jacket | torso | street | chest |
| pufferjacket | Puffer Jacket | torso | rare | chest |
| varsity | Varsity Jacket | torso | epic | chest |
| neckchain | Neck Chain | accessory | rare | chest (reoriented via `pendantChain`) |
| dogtags | Dog Tags | accessory | street | chest |
| curbchain | Curb Chain | accessory | rare | chest |
| saintmedal | Saint Medallion | accessory | epic | chest |

Bones are Y-up dotted Rigify (`docs/PART_ATTACH_SPEC.md`); missing bones warn-and-skip
via `attachPart()` (`console.warn('[customizer] bone not found:', ...)`).

## Rarity scheme

`street` (grey `#9a9a9a`) · `rare` (blue `#4fa3ff`) · `epic` (purple `#c77dff`) ·
`legendary` (gold `#ffd166`). Part buttons in `renderCustomize()` show a colored `●`
badge; a legend row sits under the slot rows. Follows the CD design rarity tiers
(street/rare/epic/legendary) used by the live-service season machine.

## LOOK-LAW compliance

Every new part is built with `pmat(zoneHex, pattern)` — a painted 128×128 canvas
(patchwork pieces, dark ink outlines, highlight streak; patterns: `patchwork`,
`razor`, `mask`, `leather`) cached per hex+pattern — so per-fighter tint multiply
keeps working (the texture derives from the fighter's own zone hex). No flat
untextured geometry anywhere. Pre-existing flat `M.*` parts are grandfathered per
the 2026-10-08 rule and were not reworked.

## Canon-separation law (binding)

NOTHING from AshLane — no AshLane names, likenesses, assets, or canon. All parts
are CD-original street/district flavor: neon downtown (`neonsneak`), rust-belt
industrial (`workboots`), boardwalk (`canvaslo`), subway/street (`skimask`,
`bandana`, `hockeymask`, `dogtags`). `luchamask` is a GENERIC two-tone lucha
pattern — it must not resemble any real luchador identity, and it has no relation
to AshLane's Sombra Negra.

## How to add a part

1. Add an entry to `PART_DEFS` in `game-3d/src/main.js`, in the right slot section:
   `{ id, name, slot, rar, bones, build(g, M, zones) { ... } }`.
2. Build ONLY with `pmat(zones.<zone>, '<pattern>')` (keeps tint multiply); patterns:
   `patchwork` (garments), `razor` (buzzed lines), `mask` (two-tone), `leather` (creases).
3. For pendants use `pendantChain(g, M, zones, drop, (p, z) => {...})` — ring at the
   neck base, medallion facing +Z.
4. Use dotted Rigify bone names (`hand.l`, not `hand_L`).
5. `rar` must be one of `street` / `rare` / `epic` / `legendary` (drives the UI badge).
6. Rebuild (`node build.mjs` in `game-3d/`) and verify visually — head ~0.28 wide,
   face at +Z ~0.13; chest-local torso parts hang from `chest` origin.

## Persistence

Loadouts persist per fighter in `save.loadouts[fid] = { parts: {slot: pid}, zones: {...} }`
via `setPart()` / `setZone()` → `writeSave()`. `applyFighterCosmetics()` applies them
to the live fighter; scouted fighters keep their seeded parts until customized.

## Godot-side follow-up (out of scope)

The Godot build (`game/`) needs its own customizer surface (gear/customize scene from
the select screen, per the porting survey): attach these parts as bone-attach GLB parts
per `docs/PART_ATTACH_SPEC.md` (or bake into the paper-doll skin pipeline), add the
face-paint and eye-color paint passes in `assets/skins/`, and wire the Godot rarity/season
unlock machine. The Three.js customizer here is the content/UX reference for that work.
