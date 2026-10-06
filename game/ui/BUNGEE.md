# Bungee — street display type for Concrete Dragon UI

**Font:** Bungee Regular by David Jonathan Ross (The Bungee Project)
**License:** SIL Open Font License 1.1 — commercial use allowed, see `../fonts/OFL.txt`.
**Source:** https://github.com/google/fonts (ofl/bungee) — harvested 2026-10-06 (Wave 2)

Why Bungee: vertical urban-signage display face; matches the street/graffiti art
direction better than the placeholder `Impact`/DejaVu fallbacks. Shippable in
commercial builds under OFL (embed OK; do not rename/resell the font file itself).

## Use (Godot)
- `game/ui/theme.tres` sets Bungee as the project default font. Assign it to the
  `theme` property of any Control root (menu scenes, HUD) or set it project-wide
  via Project Settings → GUI → Theme → Custom (`theme.tres`).
- Title/labels: size 28–64. Body: 16–20 (Bungee is display-weight; small sizes
  stay bold but readable at 16px+).

## Use (web build) — next step
Copy `game/fonts/Bungee-Regular.ttf` into `game-3d/build/assets/`, add a manifest
entry in `game-3d/build/asset-manifest.json`, and `@font-face` it in
`src/template.html` (menu-redesign branch is actively editing that file — land
the font wiring there to avoid conflicts).
