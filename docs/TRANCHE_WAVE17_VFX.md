# TRANCHE WAVE 17 — VFX VARIETY (TIER 6 item 25, owner 2026-10-06)

## What
The 3D brawler's combat feedback was all one look: a single canvas-gradient spark texture
(`sparkTex`) driving every burst. This tranche wires the **Kenney Particle Pack** (CC0) billboard
sprites into four VFX families so KOs, hits, specials, and wall thuds each read differently:
- **KO bursts** — expanding shockwave ring (`circle`) + flare flash + `smoke` puffs + `spark`/`star` shower (bigger on boss KOs).
- **Hit-impact pops** — `muzzle` flash + `star`/`spark` flecks on EVERY landed hit (counters get a bigger pop).
- **Special-move VFX** — `flame`/`fire` for damage specials (DESPERATION ×2, slam, stance finishers, signatures, MEGA SUPER) and `magic`/`twirl`/`light` for tech specials (BURST combo-breaker, dash, blink).
- **Edge-bounce dust** — `smoke`/`dirt` puffs on wave-9 wall thuds.

## Assets (CC0, Kenney Particle Pack — was staged, now wired)
12 PNGs extracted from `game/assets/staging/vfx/kenney_particle-pack.zip` (`PNG (Transparent)/`),
downscaled to 128px (soft gradients — visually identical at burst render sizes, 158KB total)
into `game-3d/build/assets/vfx/`: circle, dirt, fire, flame, flare, light, magic, muzzle,
smoke, spark, star, twirl. Registered in `build/asset-manifest.json` (the build only embeds
manifest-listed files — wave-10 lesson applied), credited in `game-3d/ASSETS_CREDITS.md`.
Variants hand-picked: `circle_03` (shockwave ring), `muzzle_02`, `star_01` (4-point glint),
`smoke_01`, `magic_02` (rune circle) — each eyes-on checked before staging.

## Wiring (`game-3d/src/main.js`)
- `loadVfxTex()` decodes the 12 PNGs at init (same data-URI `Image` pattern as `loadTexVariants`);
  a failed decode skips that sprite family gracefully — recipes never throw.
- Pooled sprite system: `vfxGet`/`vfxKill`/`vfxOne`/`updateVfx` — sprites are `THREE.Sprite`
  (billboarded by definition), pooled to zero per-frame allocation, hard cap 320 live
  (recycles oldest). Each pooled sprite carries two materials (additive + normal blending)
  so smoke/dirt render correctly without material recompiles on spawn.
- Perf: `vfxQ()` = 0.45 on `lowFx` (U9 low quality / auto-degrade) — halves every burst count.
- Recipes: `vfxImpact(pos, heavy)` in `landHit`; `vfxKO(pos, boss)` in `killEnemy`;
  `vfxSpecial(pos, 'flame'|'magic'|'both')` in doSpecial (DESPERATION/BURST), doSpecial2
  (dash/blink/slam), doDesperation, doStanceFin (4 finishers), doMotionSpecial `present()`
  (flame for fireball/orb/groundwave sigs, magic otherwise), `megaHit` ('both');
  `vfxDust(pos)` in the wave-9 edge-bounce `bounced` block.
- `__cdtest`: `vfxDbg()` (ko/hit/spc/dust counters, tex list, `texOk` decode count, live/pool),
  `vfxClear()`, `vfxLowFx(on)` (proves the low-quality cap).

## Verification
- Playtest `game-3d/qa/playtest-vfx.mjs`: **17/17 PASS**, zero page/console errors.
- 12/12 textures decode; BURST fires magic VFX; KO fires ring+smoke+spark; edge-bounce fires
  dust; lowFx cap verified (q 0.45 → q 1).
- Proof shots `game-3d/shots-vfx/` (eyes-on verified, incl. zoom crops): hit-impact muzzle
  flash on the thug's head, BURST magic ring+orb, KO shockwave ring, edge-bounce smoke
  shockwave. Sprites billboard and fade correctly; no defects found.
- Headless note: the puppeteer Chrome cache was wiped by the VM replacement — installed
  chrome@131.0.6778.204 via `npx puppeteer browsers install chrome`; ALL `qa/playtest-*.mjs`
  scripts still point at the old 154.x path and need the same path bump.

## Decisions
- One variant per sprite family, 128px — the full pack's 100+ variants would bloat the
  55MB build for no visible gain; variety comes from color/velocity/life jitter, not PNGs.
- New pooled system runs ALONGSIDE the old `burst()`/`sparks` (untouched) — additive
  colored sparks still do the cheap work, Kenney sprites add the read. No rewrite risk.
- Negative gravity on flames (they rise) and `grow` on rings/smoke give the two signature
  motions: shockwave expansion and rising fire.
- Style-not-power: VFX is pure presentation — no damage, timing, or hitbox changes.
