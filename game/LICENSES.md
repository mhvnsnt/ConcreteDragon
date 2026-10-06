# Street Brawl M1 — License Manifest

All art, audio, and code in this slice. Rule: nothing ships that we can't relicense.

## Engine
- **Godot 4.4.1** — MIT license. https://godotengine.org/license

## Code
- All GDScript in `scripts/` — written fresh for this project, original.
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
- All WAVs numpy-synthesized by our own tooling (`assets/tools/gen_sfx.py`) — original.
- Runtime fallback synthesizer (`scripts/sfx.gd`) generates equivalent sounds in code.
- No samples, no loops, no third-party audio.

## Shipped-client license audit (M1)
- [x] No GPL/AGPL code in the client.
- [x] No third-party assets with attribution requirements.
- [x] No network calls, no external links, no tracking.
