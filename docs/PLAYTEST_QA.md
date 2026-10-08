# CONCRETE DRAGON — Playtest & Visual QA Checklist

Applies to every 3D build before it reaches the owner. No build is "verified"
without walking this list. (Owner's deliverable-verification law, 2026-10-06.)

## 1. Automated gates (run first)

- `cd tracks/playable-ads/kit && node qa.mjs dist/<build>.html` — must exit 0.
  Checks: single-file (no external requests), size budget, no audio before first
  interaction, portrait + landscape re-fit.
- Telemetry: open the build, play one full run, then read `window.__playable`
  in the console — `events` must include `loaded`, `first_interaction`, at
  least one `ko`; `errors` must be empty; `frameMs` should stay under ~33ms on
  real hardware (SwiftShader numbers don't count).

## 2. Feel gates (owner's feel law)

- Normal hits: NO slow-mo. Hit-stop ≤ ~90ms on jabs/crosses, slightly more on
  kicks/heavies. Combos must never feel laggy (cumulative hit-stop cap).
- Slow-mo + long hit-stop ONLY on: KO blows, counters, heavy hits, finishers.
- VFX, SFX, and shake must land on the SAME frame as the hit (desync = fail).
- Enemy telegraph ("!") must be readable ≥150ms before the enemy's hit lands.
- Player attack startup must feel instant (≤ ~8 frames from tap to impact).

## 3. Visual gates

- Fighters never below the ground plane; shadows visible under both fighters.
- Facing: fighters face each other at all times (no crab-walking, no
  back-turned idles during combat).
- No ribbon/exploded geometry on any animation (sample EVERY clip: idle, walk,
  punch, kick, hit, death — not 2 of 6).
- Portrait + landscape: HUD readable, no overlap, safe-area respected.
- District art: correct palette per district; graffiti legible, no real-world
  brand names or logos anywhere.

## 4. Systems gates

- Character select → fight → KO → results → upgrades → fight again: full loop
  with no console errors and no stuck states.
- Save: cash/upgrades/best-wave persist across a full page reload.
- Upgrades apply visibly (damage numbers and HP bars change).
- Skins are cosmetic ONLY — equipping a skin changes no stat.
- Endless waves scale: wave 10 enemy must be noticeably tougher than wave 1.

## 5. Real-device gate (non-negotiable before "done")

- Play one full session on a real phone (owner's phone or a test device):
  portrait, touch only. Confirm: taps register, audio unlocks on first tap,
  no jank on KO slow-mo, battery-safe (no thermal runaway in 10 minutes).
- Capture 3 screenshots minimum (select screen, mid-fight, KO) and compare
  against the approved reference shots before shipping.

## 6. Regression gates (the 2D incident, 2026-10-06)

- The build served at the Pages URL MUST be the 3D Three.js game — verify by
  fetching the deployed URL and checking for Three.js markers and the absence
  of ad end-card strings. Never verify by package strings alone.
- Character names: only owner-approved names appear (current approved style:
  Street Thug / Big Rico — see docs/CONCRETE_DRAGON_SUGGESTIONS.md §0).
- No MRAID, no "PLAY FREE"/"PLAY NOW", no placeholder store links, no "not a
  real game" labeling anywhere in the shipped build.

## Tooling hooks for agents

- Headless capture: reuse `kit/qa.mjs` screenshot harness for proof shots.
- Add new defects to THIS checklist when the owner catches one a worker
  missed (checklist grows; defects don't repeat).
- File per-run results under `docs/proof/<date>/` with the screenshots —
  the worker's completion report must cite which frames were checked.
