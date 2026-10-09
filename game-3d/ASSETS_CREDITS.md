# ASSETS_CREDITS.md — Concrete Dragon 3D web build

Every asset in `game-3d/build/assets/` is **CC0 1.0 (public domain)**. No royalties, no attribution required — credited anyway as good practice.

| File | Source |
|---|---|
| `fighter.glb` | KayKit — Character Animations 1.1 (Mannequin_Medium) |
| `anim_melee.glb`, `anim_general.glb`, `anim_move.glb` | KayKit — Character Animations 1.1 (10 clips) |
| `street.glb` | KayKit — City Builder Bits 1.0 (buildings, road, props, cars) |
| `hit1.mp3`, `hit2.mp3`, `hit3.mp3` | Kenney — Impact Sounds |
| `click.mp3` | Kenney — Interface Sounds |
| `bell.mp3`, `crowd.mp3` | OpenGameArt — "Boxing ring" pack |
| `music.mp3` | OpenGameArt — "Fast fight battle music" (bonsaiheldin) |
| `whoosh.mp3`, `step.mp3`, `crack.mp3`, `coin.mp3` | Kenney — RPG Audio (CC0 1.0) |
| `swing1.mp3` (knifeSlice), `swing2.mp3` (knifeSlice2), `swing3.mp3` (chop) | Kenney — RPG Audio (CC0 1.0) |
| `step1.mp3` (footstep03), `step2.mp3` (footstep00), `step3.mp3` (footstep08), `step4.mp3` (footstep06), `step5.mp3` (footstep09) — 5-step footstep bank | Kenney — RPG Audio (CC0 1.0) |
| `counter.mp3` (metalPot3) | Kenney — RPG Audio (CC0 1.0) |
| `uiclick.mp3` | Kenney — UI Audio (CC0 1.0) |
| `uiclick.mp3` (click2) | Kenney — UI Audio (CC0 1.0) |
| `pickup.mp3` (mouseclick1) | Kenney — UI Audio (CC0 1.0) — cash-pickup chime (S6/S7, 2026-10-08) |

## UI kit (embedded in `src/template.html` as data URIs — no external files)

- **Fonts:** Bungee, Anton, Bebas Neue — SIL Open Font License 1.1 (Google Fonts)
- **Concrete texture:** ambientCG PBRConcrete030 — CC0 1.0 (downscaled to 256px)
- **Button/UI icons** (fist, punch, lightning, padlock, trophy, cash, heart): Lorc via game-icons.net — **CC BY 3.0** (attribution: "Icons by Lorc via game-icons.net, CC BY 3.0"). Recolored from white originals.
- **9-slice panel/button/bar art:** authored in-house for this project (SVG, matches street style)

## Tip jar

- Donation link wired into title + results screens: **https://paypal.me/MarquisWhitacre** (owner-provided public link). Donations only — no paid power.

Per-file manifest: `game-3d/build/asset-manifest.json`.

## Build

```bash
cd game-3d
npm ci
node build.mjs        # -> dist/concrete-dragon.html (single self-contained HTML)
```

The 3D models are CC0 KayKit mannequins tinted per fighter/skin. No real-person likenesses, no ripped meshes, no proprietary IP.
