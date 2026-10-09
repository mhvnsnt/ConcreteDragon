# TRANCHE WAVE 15 — S15 MIXING (TIER 3 item 15, owner 2026-10-08)

## What
Dedicated audio buses: background music + ambience ride a `musicGain` bus, every one-shot
effect rides an `sfxGain` bus. The music bus **ducks under big hits** — heavy attacks,
launchers, finishers, and KOs dip it to ~40% (KO slightly deeper, ~35%) with a ~0.6s ramp
back to full. Subtle by design: the duck never mutes music and never touches the sfx bus.

Before this tranche every sound connected straight to `actx.destination` — music and SFX
fought at the same level, so heavy hits never "landed" in the mix.

## Assets
None added — code-only tranche. CC0 manifest (`build/asset-manifest.json`,
`ASSETS_CREDITS.md`) untouched.

## Wiring (`game-3d/src/main.js`)
- `unlockAudio()` creates `musicBus` + `sfxBus` (both `gain=1`) wired to the destination
  before decoding. Music + crowd ambience keep their per-source volumes (0.32 / 0.25).
- `sfx(k, vol, loop, rate, bus)` gained an optional bus param; default routing is by
  loop flag: looped ambience (music, crowd) → music bus, everything else → sfx bus.
  The one-shot `crowdCheer()` therefore rides the sfx bus. Falls back to the destination
  if the buses don't exist yet (pre-unlock safety).
- `duckMusic(depth)`: `cancelScheduledValues` + quick dip (~50ms) + `linearRampToValueAtTime`
  back to 1.0 over ~0.6s. Guarded on `!musicBus || !actx || muted`. `T.ducks` test counter.
- Trigger sites in `landHit()` (the single choke point for every connected hit):
  - KO: `duckMusic(0.35)` alongside `killEnemy(e)` — the deepest dip for the biggest moment.
  - Heavy / launcher / finisher: labels `HEAVY`, `HEAT`, `DUST LAUNCHER`, `LAUNCHER`, or any
    hit with `shake >= 0.4` (stance finishers, blitz, desperation, boss signatures).
  - Light jabs/crosses/kicks (`shake <= 0.25`, including the every-3rd-hit pop-up launchers
    and SWEEP) do NOT duck — the mix breathes between big moments instead of pumping.
- `T.sfxCount` increments on every `sfx()` call (test hook: proves the sfx bus stays alive).
- `__cdtest` hooks: `musicBusLevel()` (current bus gain, 1.0 = full), `mixDbg()`,
  `mixClear()`, `forceBigHit()`, `forceLauncherHit()`, `forceKOHit()` (deterministic
  `landHit` paths mirroring doHeavy / ↓+HVY dust launcher / KO), `dbgFoePassive()`
  (passive punching-bag foe — a real enemy, no counter-attacks), `dbgStickDown()` (holds
  the stick down so `doHeavy` takes the real DUST LAUNCHER branch).

## Verification
- Playtest `game-3d/qa/playtest-mixing.mjs`: **26/26 PASS**, zero page/console errors.
  Headless chrome via `CHROME_PATH=/opt/meta-chromium/chrome` (the default puppeteer chrome
  path in the earlier scripts no longer exists on this VM — the env-var fallback in the
  script header handles it).
- Music + crowd decode to AudioBuffers; music bus starts at exactly 1.0.
- Light punches on a passive foe: `sfx=2` fired, `ducks=0`, level stays 1.0 (no duck).
- Real `doHeavy` connecting: bus dips (min 0.46 observed), recovers to 1.0, `ducks=1`.
- Real ↓+HVY DUST LAUNCHER: bus dips (min 0.408), recovers to 1.0.
- KO: foe dies, bus dips (min 0.437), recovers to 1.0, `sfx=3` — sfx bus untouched.
- Dip never approaches mute (all mins ≥ 0.3).
- Proof shots `game-3d/shots-mixing/` (eyes-on verified): boot screen, m1 start, heavy
  kick connecting on STREET THUG (enemy HP depleted), dust launcher with "2 HIT COMBO" +
  impact dust, KO with "4 HIT COMBO" + empty enemy bar + dropped cash pickup ($150→$158).
- Headless note: first run's output was lost (two chrome instances collided after a tool
  timeout); clean single-instance rerun 26/26 PASS.

## Decisions
- Bus routing by loop flag, not by key allowlist: any future looped ambience automatically
  rides the music bus; any future one-shot automatically rides the sfx bus. The optional
  explicit `bus` param stays for exceptions.
- Duck rule is `label`-based, not `shake`-only: the neutral jab cycle's pop-up launchers
  (shake 0.08–0.25) stay out of the duck so constant jabbing doesn't pump the music.
- KO dips deeper (0.35) than other big hits (0.4): the kill is the exclamation point.
- No finisher-name registry: stance finisher names are per-fighter strings, so the
  `shake >= 0.4` catch-all plus explicit labels covers them without a fragile list.
