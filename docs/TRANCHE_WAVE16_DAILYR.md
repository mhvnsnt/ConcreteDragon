# TRANCHE WAVE 16 — Y8 DAILY SEEDED RUN (TIER 5 item 21, owner 2026-10-06)

## What
The old DAILY SCRAP (70-unit neon alley, char-sum-of-UTC-date seed, partial seeding) is now
the full **Y8 DAILY RUN**: one local-date seed per day for every player, district rotation
over the 3 wired districts, a fixed 220-unit circuit, per-day best records on the Records
screen, and the date shown in the mission intro + HUD banner.

## Assets
- `game/assets/staging/systems/seedrandom.js` (MIT © 2019 David Bau) already staged — vendored
  **verbatim** into `game-3d/src/vendor/seedrandom.js` and bundled via esbuild
  (`import seedrandom from './vendor/seedrandom.js'`; esbuild CJS interop, no template change).
  NOT added to `build/asset-manifest.json` — the manifest is for base64 runtime assets (glb/mp3);
  JS libraries ship through the esbuild bundle. MIT needs no GPL quarantine, credited in
  `ASSETS_CREDITS.md` (copyright line + license + staging provenance).

## Wiring (`game-3d/src/main.js`)
- `dailySeed(dateLike)` — local-date YYYYMMDD integer (e.g. 20261009). Pure in its input, so
  playtests can assert determinism for a fixed date. `dailyDistrict()` rotates
  `['neon','overpass','industrial']` by `dayIndex % 3`; `dailyDateLabel()` → "OCT 9".
- `startMission('daily')`: `R = seedrandom(String(dailySeed()))`; mission gets
  `{ district: dailyDistrict(), len: 220, spawns: genDailySpawns(R, 220), dailyDate, dailySeed }`;
  `missionR = R` so `missionR()`/`R_safe()` consumers (breakable loot rolls, spawn-time fam
  picks, titan/frenzy rolls) are all seeded.
- **Determinism hole closed**: `buildStreet`/`buildRoads`/`buildIndustrial`/`buildLayout`/
  `spawnBreakables` took `seedFn` but called the module-level `rnd()` (= Math.random) for
  prop spacing/positions. All 46 `rnd(` calls in those five functions now go through a local
  `r2 = (a,b) => a + R() * (b - a)`. Audio/cosmetic `Math.random()` calls (pitch jitter, spark
  tints, names, scout ids) untouched — the run still feels alive.
- `genDailySpawns(R, len)` now covers the whole circuit (`at < len - 20`).
- Mission card: DAILY RUN button (existing `go` button styling + 9-slice `panel9g`), card
  shows today's rotated district swatch + `DAILY RUN — OCT 9 · THE IRONWORKS`; `dailyTag`
  shows `DAILY SEED 20261009 · 2026-10-09 · YOUR BEST: n`.
- Intro: letterboxed card gets a second caption `DAILY RUN — OCT 9 · SEED 20261009`;
  the fight-start banner reads `DAILY RUN — OCT 9 · DAILY RUN — BOSS: KINGPIN`.
- Records: `save.dailyBest = { date, wave, score, cash }` (waves = spawn groups cleared,
  stamped with the run's START date — a run that crosses midnight still counts for its start
  day); Records screen line `DAILY BEST — 2026-10-09: wave X / score Y`. Legacy `save.daily`
  kept for back-compat (menu RETRY label).
- `__cdtest`: `dailySeed`, `dailyDistrict`, `dailyDateLabel`, `dailySpawnTable`,
  `dailyBuild(date)` (rebuilds the daily street exactly like startMission, returns
  `{ district, seed, spawns, hash }` where hash = `name@x,z,ry` of every placed prop),
  `dbgUnlockMission`, `missionDbg`, `missionComplete`, `saveDbg`.
- `layoutRec` recorder inside `placeProp` — only active during `dailyBuild` test calls.

## Verification
- Playtest `game-3d/qa/playtest-dailyrun.mjs`: **23/23 PASS**, zero page/console errors.
- (a) `dailySeed('2026-10-09')` = 20261009 on two fresh page loads; (b) two `dailyBuild`
  calls → identical district, deep-equal 17-entry spawn tables, identical layout hash;
  (c) `dailySeed('2026-10-10')` = 20261010 ≠ 20261009, different layout hash.
- District rotation observed: 10-09 industrial → 10-10 neon → 10-11 overpass → 10-12 industrial.
- Proof shots `game-3d/shots-dailyrun/` (eyes-on verified): title, mission menu with
  DAILY RUN button + daily tag, intro card with `DAILY RUN — OCT 9 · SEED 20261009`,
  gameplay mid-run in THE IRONWORKS, Records screen with the DAILY BEST line.
- Headless note: buildStreet x3 per playtest run is the slow part (~200s total run).

## Decisions
- seedrandom (not the hand-rolled mulberry32 `seedPRNG`) drives the daily RNG — the queued
  MIT asset is now actually used; `seedPRNG` stays for circuit nodes/modifiers (unchanged).
- Daily modifiers (rollModifiers from win count) intentionally NOT reseeded — they're
  per-player progression flavor, not the shared course; the shared part (layout, spawns,
  loot rolls) is fully deterministic.
- Old UTC `todayStr()` char-sum seed replaced — it collided across dates and timezones.
