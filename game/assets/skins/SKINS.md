# Concrete Dragon — DLC Skin Packs

Procedurally generated (PIL, original code) — no third-party assets,
no license encumbrance, safe to ship. Paper-doll layout and pivots match
the fighter rig schema; skins are drop-in. Style only, zero power.

## How skins load
- Skin PNG sets live in `assets/art/<skin_dir>/` (6 parts: head, torso,
  arm_u, arm_f, leg_t, leg_s, 256x256 RGBA).
- Pivots for every skin dir are merged into `assets/art/pivots.json`.
- `Fighter.FIGHTER_DEFS[kind]["skins"]` lists each fighter's skins;
  the first entry is the default. `Fighter.setup(kind, is_ai, name, skin)`
  takes an art subdir; `SaveData.get_skin()/set_skin()` persists the pick.
- The select screen shows a SKIN picker on any fighter with 2+ skins.
- `assets/skins/` keeps the pack sources + this doc; the shipped copies
  live under `assets/art/`.

## Noir Rook (`rook_noir/`) — Midnight pack
Rook skin. Black/gold attire, crimson gloves.

## Crimson Vex (`vex_crimson/`) — Bloodline pack
Vex skin. Crimson/black attire, crimson wraps.
