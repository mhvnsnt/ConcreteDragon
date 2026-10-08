# Integrations — Concrete Dragon (2026-10-06)

Shared kit: `~/workspace/api-wiring/` (qrng_seeds.py LIVE, jsfxr in node_modules,
asset_fetch.sh). Per-repo mapping: `~/workspace/api-wiring/REPO_INTEGRATION_MAP.md` §1.
Policy: prototype freely; licenses don't gate prototyping; audit before ship;
GPL/AGPL quarantined from ship paths.

## 1. QRNG build-time seeds — WIRED + LIVE
- `game/tools/build_seeds.py` fetches 6 true-random seeds at build time via the
  shared kit (ANU QRNG hardware → NIST beacon → OS CSPRNG fallback; all keyless).
- Stamps `game/assets/seeds/qrng_seeds.json`: seed + source + UTC time + version.
  This batch: all 6 from **anu-qrng** (vacuum-fluctuation hardware).
- `game/scripts/loot_rng.gd` (class_name `LootRng`) loads the manifest once and
  rolls from a `RandomNumberGenerator` seeded from the `lucky-drop` seed
  (hashed to 64-bit; reproducible per manifest). Falls back to randomized RNG if
  the manifest is missing.
- **Live in gameplay:** `fight.gd` wave-clear LUCKY! drop now rolls via
  `LootRng.lucky_hit(0.12)` / `LootRng.lucky_amount(wave)` instead of the global RNG.
- Run at build time (CI should run this before export): `python3 game/tools/build_seeds.py`
- Money link: provable fairness — every build's loot randomness is reproducible AND
  auditable to quantum hardware. That's a marketing claim competitors can't copy.

## 2. jsfxr SFX — WIRED + LIVE
- `game/tools/gen_sfx_jsfxr.mjs` bakes 4 sounds from jsfxr preset roll-ups
  (blipSelect / hitHurt / explosion / pickupCoin) + one mutate pass, seeded PRNG
  (seed=789514) for reproducible regeneration. Full Params JSON receipts saved as
  `.sfxr.json` next to each WAV.
- Baked into `game/assets/sfx/`: `jsfxr_ui_blip.wav`, `jsfxr_hit.wav`,
  `jsfxr_ko.wav`, `jsfxr_coin.wav` — all verified non-silent (wave module).
- **Live in gameplay:** registered in `sfx.gd`'s bank (playable via
  `sfx.play("jsfxr_*")`); `fight.gd` `on_hit_landed` alternates `jsfxr_hit` on
  40% of punch connects for impact variety; `on_ko` layers `jsfxr_ko` under `ko_bell`.
- License: jsfxr is **Unlicense** (public domain) — no attribution, no audit risk.
- Money link: game feel = retention. Real impact SFX on KO + hit variety makes the
  core loop juicier at $0 audio cost.

## 3. CC0 street assets — WIRED (staged for 3D stage pipeline)
- `game/assets/props/concrete/` — ambientCG Concrete042A 2K (Color/NormalGL/Roughness/AO)
- `game/assets/props/asphalt/` — ambientCG Asphalt033 2K (same maps)
- `game/assets/props/kenney-city-kit-commercial/` — Kenney City Kit: Commercial v2.1
  (219 files: FBX/GLB/OBJ storefronts, buildings, street props + PNG textures)
- All **CC0-1.0** with per-file `.LICENSE.txt` receipts (ambientCG) / pack License.txt
  (Kenney). Godot import notes in `game/assets/props/README.md`.
- Not consumed by the M1 2D-cute build — they are drop-in inventory for the 3D
  stage art pass, so stage V2 ships with $0 art cost and a mechanical pre-ship audit.
- Money link: richer game, $0 art cost. Every dollar of art budget stays in the pocket.

## 4. Staged (dormant) — need owner-created free-tier accounts
See `docs/staged/README.md`. Nothing here runs or phones home until activated.
- `game/scripts/staged/posthog.gd` — PostHog capture snippet (needs project API key;
  1M events/mo free). Retention analytics = the data that tells us what earns.
- `game/scripts/staged/sentry.gd` — Sentry crash snippet (needs DSN; 5k errors/mo
  free). A crashing game earns $0.
- `docs/staged/R2_HOSTING.md` — Cloudflare R2 config for $0-egress APK hosting
  (+ CI upload step + cost math: 10k downloads × 50MB = $45 on S3, $0 on R2).
- `docs/staged/ITCH_CHECKLIST.md` — condensed itch.io publish checklist (the
  fastest real-money rail: free publish, donations, 10% cut).

## Audit status (2026-10-06)
- [x] No GPL/AGPL code in client ship paths (all tooling is MIT/Unlicense/CC0/original).
- [x] No third-party assets with attribution requirements (CC0 + Unlicense = none needed).
- [x] License receipts in place for every pulled asset (`LICENSES.md` + per-file receipts).
- [x] Staged snippets are dormant: no network calls, no tracking in the shipped build.
