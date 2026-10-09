# TRANCHE WAVE 14 — S1 hit layering (TIER 3 item 14)

Date: 2026-10-08. Branch: `wave14-hitlayering` (from `origin/main`). PR: #4.

## The gap
Every punch/heavy/special resolution in the game plays one of the three Kenney Impact
Sounds synth hits (`hit1/2/3.mp3`) — but they hit dry. The attack *swings* got a
dedicated whoosh layer in wave 10; the impact *landing* had no texture under it, so
connected hits sounded thin next to the layered whiffs. TIER 3 item 14 (S1 layering)
calls for rpg-audio impacts layered under the existing synth hits (±5% pitch).

## Decision: subtle impact texture UNDER every synth hit, never replacing them
- **Assets (documented choice):** three timbres, all from `game/assets/staging/audio/kenney_rpg-audio.zip`
  (CC0 1.0, bundled license), OGG→MP3 @96k into `game-3d/build/assets/`, registered in
  `build/asset-manifest.json`, credited in `game-3d/ASSETS_CREDITS.md`:
  - `hitlayer1.mp3` = `metalPot2.ogg` (0.94s) — metallic clang, sharp smack edge. (metalPot1
    rejected: 1.46s, too long; metalPot2/3 are the punchiest transients.)
  - `hitlayer2.mp3` = `dropLeather.ogg` (0.42s) — leathery thud, meaty body-hit feel.
  - `hitlayer3.mp3` = `doorClose_2.ogg` (0.61s) — woody slam, adds mass.
  - Total added weight: ~26KB (12.1KB + 5.8KB + 8.1KB).
- **Wiring:** new `sfxHitLayer(vol, rate)` (mirrors the wave-10 `sfxSwing()` pattern):
  one random layer sample, low volume (`0.22 * vol` — subtle under the 0.9-vol synth
  hits), ±5% pitch jitter, `T.hitLayerSfx` test counter. Hooked **inside `sfx()`** so
  all ~30 existing `sfx('hit1'/'hit2'/'hit3', …)` call sites get the layer with zero
  per-site edits — hooked only for the `hit1/2/3` keys. The synth hit plays exactly
  as before underneath nothing is muted or replaced; the layer just adds texture.
  `T.synthHitSfx` counter added in the same hook proves the synth hits still resolve.
- **Test hooks:** `__cdtest.hitLayerDbg()` → `{ layer, synth }`,
  `__cdtest.hitLayerClear()`, plus `__cdtest.dbgFoePassive()` — puts living non-boss
  foes into a long `recover` state so the drill foe can't counter-attack mid-test
  (real enemy, takes real hits; just doesn't fight back during the drill).
- **Embedding:** rebuilt `dist/concrete-dragon.html` via `node build.mjs` (54.72 MB;
  all three samples base64-embedded via the manifest — verified in the shipped manifest
  and in the dist).

## Playtest proof (headless, `qa/playtest-hitlayering.mjs`, CHROME_PATH env)
**17/17 PASS, zero page/console errors.** Highlights:
- `hitlayer1-3` all decode to real `AudioBuffer`s via `audioDbg()`.
- Whiffed punch at empty air (zero foes on screen): synth 0, layer 0 — the layer fires
  ONLY under real hit resolutions, never on whiffs.
- Connected punch on a foe: synth ≥ 1 AND layer ≥ 1, and `layer === synth` (1:1 — the
  layer rides under every synth hit and never replaces one).
- Connected heavy (different hit call path): same 1:1 result.
- 4 screenshots in `game-3d/shots-hitlayering/` — all opened and eyes-on verified
  (title screen, m1 start, close-range punch contact, "2 HIT COMBO" heavy with impact
  burst). No black frames, no placeholders; combat is real.

## Notes
- Playtest hardening during this wave: the first two runs flaked on *test choreography*,
  not the game — (a) m1 spawns foes during long idle-waits so a "whiff" punch genuinely
  connected (tightened the whiff window; probe confirmed 0/0 with zero foes), (b) the
  spawned thug juggled the player so `busy` never cleared (added `dbgFoePassive()`),
  (c) headless Chrome crashed twice on a full /tmp (another worker's 498MB scratch —
  left untouched; moved my TMPDIR aside, /tmp later freed by its owner). Game behavior
  was correct throughout; the 1:1 layer:synth invariant held in every run.
- `localStorage` save untouched; branch→PR only, no main push (PRs #1/#2/#3 still await
  OWNER merge — never touch them).
- License posture unchanged (CC0 throughout, manifest + credits clean); no secrets in
  repo; no force-push.
