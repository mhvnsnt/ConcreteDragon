# props/ — CC0 street dressing (2026-10-06, integration worker)

All sets below are **CC0-1.0** with per-file license receipts. They are pulled for the
**3D stage pipeline** (Concrete Dragon's next art pass) — M1's current 2D-cute stage
does not consume them yet, so they land here as drop-in, zero-art-cost inventory
with a clean pre-ship audit trail.

## concrete/ — ambientCG Concrete042A (2K JPG)
Color + NormalGL (OpenGL Y+) + Roughness + AmbientOcclusion.
Source: https://ambientcg.com/ | License: CC0-1.0

## asphalt/ — ambientCG Asphalt033 (2K JPG)
Color + NormalGL + Roughness + AmbientOcclusion.
Source: https://ambientcg.com/ | License: CC0-1.0

## kenney-city-kit-commercial/ — Kenney City Kit: Commercial v2.1
219 files: FBX/GLB/OBJ street models (storefronts, buildings, street props) + PNG textures.
Source: https://kenney.nl/assets/city-kit-commercial | License: CC0-1.0 (pack's own License.txt)

## Godot import notes
- Use NormalGL (Y+) textures as the Normal map in StandardMaterial3D.
- JPGs import as compressed textures under GL Compatibility; no extra setup.
- Kenney GLB format/ folder is the fastest drop-in for Godot 4.
