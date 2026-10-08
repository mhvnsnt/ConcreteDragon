# Crowd ambience loop — wiring

**Asset:** `game/assets/sfx/crowd_ambience_loop.wav` (30s, 44.1kHz stereo, ~5MB,
peak −7dBFS). Procedurally synthesized by `tools/gen_crowd_ambience.py` — original
work, no samples, no license encumbrance. The loop point is seamless (periodic
FFT filtering + integer-cycle swell envelope).

Purpose: menu / locker-room / character-select **bed** — quiet crowd murmur under
UI, distinct from the in-fight `crowd.mp3` cheer stings.

## Godot (M1 tree)
1. The `.import` file ships with `loop_mode=1` (forward loop) — the stream loops
   automatically on import.
2. Menu scene: add an `AudioStreamPlayer`, set `stream` to
   `res://assets/sfx/crowd_ambience_loop.wav`, `volume_db = -14`, `autoplay`
   (or `play()` on `_ready`), `bus = "Ambience"`.
3. Duck it on fight start: tween `volume_db` to −28 while the fight music/SFX
   take over; bring back on result screen. Keep it OUT of fight scenes (owner
   directive: crowd audio only where it belongs).

## Web build (game-3d) — next step
Add to `game-3d/build/asset-manifest.json` and start it alongside `music` on the
menu/character-select screen at low gain (`sfx('ambience', 0.12, true)`), stop on
fight start. (Menu code is on the menu-redesign branch — land wiring there.)
