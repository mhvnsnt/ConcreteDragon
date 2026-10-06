# Street Brawl M1 — Asset Manifest

All art and audio assets for the Street Brawl M1 vertical slice were **generated
procedurally by Python code written for this project** (PIL + numpy drawing and
synthesis). No third-party assets, no stock media, no ripped content, no
AshLane / Bannon / Brutal Fist material. Every file below is original work with
**no license encumbrance** — safe to ship in a commercial product.

Generators (kept for reproducibility, also original code):
- `tools/gen_art.py` — fighter paper-doll parts
- `tools/gen_stage_ui.py` — stage background + UI icons
- `tools/gen_sfx.py` — all sound effects

## Art (`assets/art/`)

Style: cute chibi, thick `#222` outlines, flat bright colors. Fighters drawn in
3/4 view facing RIGHT (both eyes visible, cute chibi readability). Each fighter
part is a 256×256 RGBA PNG with a transparent background. Pivot fractions in
`pivots.json` are the joint attachment point as (x, y) fractions of the canvas.
Assembled fighter height ≈ 480 px (verified by compositing the parts).

### ROOK — balanced boxer, cheerful tough (`art/rook/`)
Tan skin `#f2b880`, black short hair, big determined cute eyes, slight smile.
- `head.png` — big chibi head, neck pivot bottom-center (0.50, 0.82)
- `torso.png` — navy tank top `#1d3557`, navy shorts (0.50, 0.05)
- `arm_u.png` — upper arm (0.50, 0.04)
- `arm_f.png` — forearm + big RED boxing glove `#e63946` (0.50, 0.05)
- `leg_t.png` — thigh (0.50, 0.03)
- `leg_s.png` — shin + red shoe (0.50, 0.04)

### VEX — fast kickboxer, smug (`art/vex/`)
Light-brown skin `#c98d5e`, teal headband `#2ec4b6` with tails, confident smirk,
one raised eyebrow.
- `head.png` — neck pivot (0.50, 0.82)
- `torso.png` — purple crop top `#7b2ff7`, black shorts (0.50, 0.05)
- `arm_u.png` — upper arm (0.50, 0.04)
- `arm_f.png` — forearm + teal hand-wrapped fist, smaller than a glove (0.50, 0.05)
- `leg_t.png` — thigh (0.50, 0.03)
- `leg_s.png` — shin + bare foot with teal ankle wrap (0.50, 0.04)

### Stage & UI
- `art/stage.png` — 1280×720 full-bleed background (RGB, no alpha by design):
  bright blue daytime sky, sun, clouds, distant skyline, brick building wall with
  original "STREET BRAWL" graffiti, windows, door, string lights, fire hydrant,
  trash can, sidewalk, asphalt road. Ground/fight line at y=600. No brand names,
  no real logos, nothing copyrighted.
- `art/coin.png` — 96×96 gold coin with `$` emboss (RGBA, transparent)
- `art/star.png` — 96×96 gold star (RGBA, transparent)

## SFX (`assets/sfx/`) — 44100 Hz, 16-bit mono WAV, all numpy-synthesized

| File | Duration | Description |
|---|---|---|
| `punch_thump.wav` | 0.15s | low thump (85 Hz sine + noise snap) |
| `punch2.wav` | 0.15s | variant thump (110 Hz, snappier) |
| `kick_whoosh.wav` | 0.25s | noise sweep |
| `whiff.wav` | 0.15s | airy high-passed noise |
| `block_clack.wav` | 0.12s | woody clack (resonant partials) |
| `launcher_whoosh.wav` | 0.30s | rising sweep 200→800 Hz |
| `hurt.wav` | 0.20s | synth yelp, downward pitch blip 620→210 Hz (no voice) |
| `ko_bell.wav` | 0.80s | bell ding (inharmonic partials) |
| `cheer.wav` | 2.0s | crowd-ish filtered noise swell + whistle blips |
| `ui_click.wav` | 0.06s | short UI blip |
| `win_jingle.wav` | 2.5s | happy 4-note arpeggio (C5 E5 G5 C6 square wave) + echo |
| `cash_blip.wav` | 0.15s | coin ding, two sine pings |
| `counter_ding.wav` | 0.30s | bright alert ding |
| `countdown_beep.wav` | 0.15s | 880 Hz beep |
| `go.wav` | 0.40s | ascending two-tone (660→988 Hz) |
| `glass_break.wav` | 0.35s | **runtime-synthesized** (no WAV file): noise crash + 6 high shard pings |
| `bat_crack.wav` | 0.12s | **runtime-synthesized** (no WAV file): woody crack 240→70 Hz |

### jsfxr batch (`assets/sfx/jsfxr_*`) — baked 2026-10-06 with jsfxr (Unlicense / public domain)

## Weapons (2026-10-06) — 100% procedural, no assets
- Bat, chain, bottle drawn in code (`Fighter.WeaponDraw`, `_draw` primitives only).
- Ground pickups (`FightScreen.WeaponPickup`) reuse the same procedural drawing.
- No PNGs, no WAV files, no third-party material — nothing to license.
Generator: `tools/gen_sfx_jsfxr.mjs` (preset roll-ups + one mutate pass, seeded PRNG
seed=789514; full Params receipts in `.sfxr.json` next to each WAV).

| File | Duration | Description |
|---|---|---|
| `jsfxr_ui_blip.wav` | 0.12s | blipSelect preset — menu/UI tap blip |
| `jsfxr_hit.wav` | 0.16s | hitHurt preset — punch impact variant (alternates on punch connects) |
| `jsfxr_ko.wav` | 0.41s | explosion preset — KO heavy impact (layered under ko_bell in `on_ko`) |
| `jsfxr_coin.wav` | 0.11s | pickupCoin preset — cash pickup sparkle |

## Props (`assets/props/`) — CC0-1.0, staged for the 3D stage pipeline
Not consumed by the M1 2D-cute build; drop-in inventory for the next art pass.
Every file carries a `.LICENSE.txt` receipt (or the pack's own License.txt).

- `props/concrete/` — ambientCG **Concrete042A** 2K: Color + NormalGL + Roughness + AO
  (https://ambientcg.com/, CC0-1.0)
- `props/asphalt/` — ambientCG **Asphalt033** 2K: Color + NormalGL + Roughness + AO
  (https://ambientcg.com/, CC0-1.0)
- `props/kenney-city-kit-commercial/` — Kenney **City Kit: Commercial v2.1** (219 files:
  FBX/GLB/OBJ storefronts, buildings, street props + PNG textures;
  https://kenney.nl/assets/city-kit-commercial, CC0-1.0)

## Seeds (`assets/seeds/qrng_seeds.json`) — build-time quantum randomness
Stamped by `tools/build_seeds.py` via the shared kit `qrng_seeds.py` (ANU QRNG
hardware / NIST beacon — keyless, public). Each build's manifest records every
seed with its source, so LUCKY! loot rolls (`scripts/loot_rng.gd`) are reproducible
(same manifest → same sequence) and auditable. This batch: 6 seeds, all `anu-qrng`.

## Verification (2026-10-06)
- All 12 fighter PNGs open as 256×256 RGBA with real transparent pixels.
- `stage.png` is 1280×720 RGB (full-bleed background, intentionally no alpha).
- `coin.png` / `star.png` are 96×96 RGBA with transparency.
- All 15 WAVs verified via `wave` module: 1 channel, 16-bit, 44100 Hz, durations
  match spec, peak amplitude ≈ 0.9, non-silent.
- Paper-doll assembly visually verified: both fighters composite to ≈480 px
  tall, pivots align, parts read clearly.

## Originality statement
All art and SFX in `assets/art/` and the numpy `assets/sfx/` batch were produced
by the generator scripts in `tools/` from primitive shapes and math — original
works with no license encumbrance. (Body text in graffiti/icons uses the system
DejaVu Sans Bold font for letterforms only.) Additionally `assets/` now contains:
(1) jsfxr-baked SFX — generated by **jsfxr**, which is released under the
**Unlicense** (public domain), no attribution required; (2) `assets/props/`
PBR sets and the Kenney pack — all **CC0-1.0** with per-file license receipts.
No AshLane, Bannon, or Brutal Fist content appears anywhere. Nothing in
`assets/` carries attribution requirements or GPL/AGPL code — the pre-ship
license audit stays mechanical.
