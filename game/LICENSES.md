# Street Brawl M1 — License Manifest

All art, audio, and code in this slice. Rule: nothing ships that we can't relicense.

## Engine
- **Godot 4.4.1** — MIT license. https://godotengine.org/license

## Code
- All GDScript in `scripts/` — written fresh for this project, original,
  including `scripts/ai/bt.gd` (behavior-tree micro-framework) and
  `scripts/ai/street_thug_bt.gd` (example enemy brain).
- LimboAI (MIT, limbonaut/limboai) — evaluated, NOT vendored: upstream is
  GDExtension-only (needs per-platform SCons builds). See docs/EVAL_LIMBOAI.md.
- Ragdoll/reaction math: Hooke's-law spring-damper (public-domain mathematics) and
  second-order-dynamics concepts (public talk formulation); **no third-party code copied**.
- CBerry22 "Active Ragdoll in Godot 4" — evaluated only (3D PhysicalBone approach;
  not applicable to our 2D rig). No code taken. If ever used, check its repo license first.
- BANNON_IMPACT — internal concept from our own research; reimplemented natively.

## Art (`assets/art/`)
- All PNGs procedurally generated with PIL by our own tooling (`assets/tools/gen_art.py`,
  `gen_stage_ui.py`) — original work, no source images, no license encumbrance.
- Graffiti lettering uses system DejaVu Bold letterforms (styling original).
- See `assets/ASSET_MANIFEST.md` for the per-file log.

## Audio (`assets/sfx/` + runtime synth)
- numpy WAVs synthesized by our own tooling (`tools/gen_sfx.py`) — original.
- jsfxr WAVs (`jsfxr_*`) generated with **jsfxr** — **Unlicense** (public domain),
  no attribution required. Preset roll-ups + mutate pass via
  `tools/gen_sfx_jsfxr.mjs`; Params receipts saved as `.sfxr.json`.
- Runtime fallback synthesizer (`scripts/sfx.gd`) generates equivalent sounds in code.
- No samples, no loops, no third-party audio with restrictions.

## Props (`assets/props/`)
- ambientCG Concrete042A + Asphalt033 (2K PBR) — **CC0-1.0**, per-file `.LICENSE.txt`.
- Kenney City Kit: Commercial v2.1 — **CC0-1.0** (pack's own License.txt).
- Staged for the 3D stage pipeline; not consumed by M1.

## Shipped-client license audit (M1)
- [x] No GPL/AGPL code in the client.
- [x] No third-party assets with attribution requirements.
- [x] No network calls, no external links, no tracking.
