# TRANCHE WAVE 12 — S5 Counter SFX (TIER 3 item 12)

Date: 2026-10-08. Branch: `wave12-countersfx` (from `origin/main`).

## The gap
Counters were **silent**. The counter mechanic (foe in `windup` within 2.4/1.3 range → player
attacks with a neutral stick → `landHit(ce, …, 'COUNTER', 0.12, 0.35, false, true)`) already had
visual identity — cyan burst, screen flash, big "COUNTER!" popup — but the only audio was the
generic `hit1/2/3` thud shared with every normal hit. Counters never *read* audibly.

## Decision: distinct crack/chime, only on counter resolution
- **Asset:** `counter.mp3` = Kenney RPG Audio `metalPot3.ogg`, OGG→MP3 @96k, CC0 1.0
  (bundled License.txt: "Creative Commons Zero, CC0"). Chosen over `metalPot1/2` (slower
  attack, longer tail) and `metalClick`/`metalLatch` (too clicky/UI-like): metalPot3 is a
  sharp metallic "TING" — fast attack (~66ms), quick decay, clearly distinct from the
  thuddy `hit1–3`, the `crack.mp3` wall-thud, and the `swing1–3` whooshes.
- **Wiring:** new `sfxCounter()` (mirrors the wave-10 `sfxSwing()` pattern: ±6% pitch,
  `T.counterSfx` test hook). `landHit()` now plays `sfxCounter(0.85)` when `counter=true`
  **instead of** the generic random hit — counters are audibly distinct, not just layered.
  Normal hits, parries, and specials are untouched.
- **Embedding:** `game-3d/build/assets/counter.mp3` + registered in
  `build/asset-manifest.json` (build only embeds manifest-listed files) + credited in
  `game-3d/ASSETS_CREDITS.md` + added to the audio preload list in `unlockAudio()`.
- **Test hooks:** `__cdtest.counterDbg()` (`{counterSfx, counters, hits}`),
  `__cdtest.counterClear()`, `__cdtest.forceCounterWindup()` (stages nearest foe mid-windup
  in counter range with a neutral stick, so `doPunch` resolves as COUNTER not parry).

## Playtest proof (headless, `qa/playtest-countersfx.mjs`)
**16/16 PASS, zero page/console errors.** Highlights:
- Normal hit: `T.hits=1`, `T.counters=0`, `T.counterSfx=0` — counter SFX does NOT fire on normal hits.
- Real counter: `T.counters=1`, `T.counterSfx=1` — counter SFX fires exactly on counter resolution.
- `counter.mp3` decodes to a real `AudioBuffer` via `audioDbg(['counter'])`.
- 5 screenshots in `game-3d/shots-countersfx/` — all opened and eyes-on verified (title,
  mission start, normal hit, counter flash moment, post-counter); no black frames.

## Notes
- Playwright chromium used for headless (puppeteer chrome cache was missing after the
  fresh `npm install`); path updated in the playtest script.
- Pre-existing esbuild warning: duplicate `spawnBoss` key in `__cdtest` (lines 4768/4775) —
  not from this wave; left alone.
- `localStorage` save untouched; branch→PR only, no main push.
