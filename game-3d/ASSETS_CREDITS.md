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

Per-file manifest: `game-3d/build/asset-manifest.json`.

## Build

```bash
cd game-3d
npm ci
node build.mjs        # -> dist/concrete-dragon.html (single self-contained HTML)
```

The 3D models are CC0 KayKit mannequins tinted per fighter/skin. No real-person likenesses, no ripped meshes, no proprietary IP.
