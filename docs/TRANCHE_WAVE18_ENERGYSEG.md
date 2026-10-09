# TRANCHE WAVE 18 — SEGMENTED ENERGY BAR (TIER 2 item 9, owner 2026-10-09)

## What
The ENERGY meter is now a 10-cell segmented sci-fi bar (skewed parallelogram cells,
gap-divided) instead of a continuous gradient fill. Lit count rounds discretely with
`player.energy`; at 60+ energy the wrap pulses and the SPC button glows (existing
`ready` contract unchanged).

## Source note
`docs/WIRING_QUEUE.md` item 9 referenced `staging/ui/kenney-scifi` — that pack was
never actually pulled into the repo (no staged copy exists). Rather than add an
external pack dependency for two pixels of styling, the segmented look is rendered
natively (CSS + inline SVG-era conventions from U13/U14/U15): skewed `.spcSeg` divs
with cyan→magenta lit gradient + glow, dim unlit cells, pulse on `ready`. Zero new
assets, zero license surface, same sci-fi visual outcome.

## Wiring (`game-3d/src/main.js`, `game-3d/src/template.html`)
- `template.html`: `#spc` becomes a flex track; `.spcSeg` styles (skewX(-18deg),
  2px gaps, lit gradient + glow); `#spcWrap.ready .spcSeg.lit` pulse animation.
- `main.js`: `spcSegs()` lazily builds the 10 cells once; `setHud()` toggles `lit`
  per `Math.round(energy/energyMax*10)` instead of setting `#spc` width.
  `T.energySeg` counter + `__cdtest.energySegDbg()` playtest hook.
- `ready` semantics unchanged: `spcWrap` + `btnSpc` toggle at energy ≥ 60.

## Verification
- Playtest `game-3d/qa/playtest-energyseg.mjs`: **13/13 PASS**, zero page/console errors.
  Energy 0/30/65/100/45 → 0/3/7/10/5 lit cells; `spcWrap`/`btnSpc` `ready` classes flip at
  60+ (ON at 65/100, OFF at 0/30/45); `T.energySeg` counter matches lit count.
- Proof shots `game-3d/shots-energyseg/` (driver eyes-on): HUD crops at each energy level
  show skewed lit cells (cyan→magenta + glow) vs dim unlit cells; `hud-full.png` shows the
  meter in full-HUD context (5/10 lit at energy 45, bar reads cleanly at 844x390).
- Headless note: blessing overlay dismissed via `.blessCard` click per the loop's playtest
  methodology; chrome path = puppeteer 131 (infra fix, PR #8).

## Decisions
- Segments round (not floor/ceil) so the meter flips at mid-cell energy — reads as
  a gauge, not a countdown.
- Kept the cyan→magenta lit gradient to preserve the existing energy identity
  (same palette the `ready` glow and SPC button already use).
- No asset pack pulled — if the owner wants the actual Kenney sci-fi bar sprites
  later, they're CC0 at kenney.nl/assets/ui-pack-sci-fi and can slot into the
  `.spcSeg` backgrounds without touching the wiring.
