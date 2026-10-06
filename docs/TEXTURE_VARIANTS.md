# Texture Variants — tint × texture customization (owner 2026-10-06)

Players choose **tint** (color) and **texture** (paint) independently per fighter.
Final pixel = texture map × tint color (Three.js `color × map` multiply).

## Registry

`TEXVARIANTS` in `game-3d/src/main.js`:

```js
const TEXVARIANTS = [
  { id: 'patchwork', name: 'PATCHWORK', file: 'tex-patchwork.png', desc: 'Signature painted pieces' },
  { id: 'original', name: 'KAYKIT ORIGINAL', embedded: true, desc: 'Stock mannequin texture' },
];
```

## How to add a new texture variant

1. Paint a 512×512 PNG in the **same UV zone layout** as `tex-patchwork.png`:
   - Top half: 8 vertical strips, 64px each (4 grayscale dark→light, 4 color: blue/green/orange/red).
     Body-part UVs land on these strips — keep them flat solid colors (no gradients) for
     the signature patchwork look.
   - Bottom-left 256×256: face zone (keep the simple face or paint a neutral one).
   - Bottom-right 256×256: chest-plate zone (blue surround, blank white plate — **no text**,
     no placeholder names; the old "manny" tag was a defect).
2. Save as `game-3d/build/assets/tex-<id>.png`.
3. Add `{"file": "tex-<id>.png", "source": "<pack name> (<license>)"}` to
   `game-3d/build/asset-manifest.json` — `build.mjs` bundles it as base64 automatically.
4. Add `{ id: '<id>', name: '<NAME>', file: 'tex-<id>.png', desc: '...' }` to `TEXVARIANTS`.
   That's it — the select-screen picker, save/load, and showcase wire up automatically.

## Rules (binding)

- **Character Look Law**: every texture must carry the painted multi-piece design in the same
  style — never flat untextured parts. Tint multiply only works if the map has painted pieces.
- **CC0-clean**: only CC0 / public-domain / owned textures. Log the source in the manifest.
- **Style-only**: textures never affect stats (style-not-power).
- Enemies/bosses/crowd use `patchwork` unless a variant is passed explicitly.
- `save.tex[fid]` persists the choice; default is `patchwork`.

## Plumbing

- `texObjs` (id → THREE.Texture) filled at boot: `loadTexVariants()` decodes the PNGs,
  the GLB's embedded map is captured as `original`.
- `texObj(fid)` resolves the fighter's equipped texture; `makeFighterRaw(tint, x, face, scale, tex)`
  applies it per mesh (`o.material.map = tex`).
- `sRGB`: decoded PNG textures get `colorSpace = THREE.SRGBColorSpace` to match GLB behavior.
