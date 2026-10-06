# Mechanics Harvest — Staged Implementations (2026-10-06)

The mechanics in `docs/MECHANICS_HARVEST.md` are DESIGN PATTERNS harvested from
74 games — most need no third-party code (they're implemented in the game's own
systems). This log tracks what is ACTUALLY staged here vs. what lives elsewhere.
Nothing is wired into the playable build; the build worker owns wiring.

## Staged here
(none yet — Wave 1 of this harvest focused on the design mine. Code drops land
in later passes as mechanics are approved for implementation.)

## Already staged elsewhere (reused by harvest mechanics)
- `game/assets/staging/combat/` — nipplejs v0.10.2 (MIT): virtual joystick
  (serves: blitz move, dash-strike, motion inputs, hop)
- `game/assets/staging/systems/` — seedrandom v3.0.5 (MIT): daily seeded runs
  (serves: mission forks, daily mutators)
- `game/assets/staging/vfx/` — Kenney Particle Pack (CC0): hit/KO VFX
  (serves: VFX slow-mo, finisher cinematics)
- `game/assets/staging/audio/` — Kenney RPG/UI Audio (CC0): SFX beds
  (serves: layered impact SFX, announcer stingers)
- `game/assets/staging/ui/` — Kenney UI packs + OFL fonts (CC0/OFL): menus
  (serves: move list UI, pause menu, mission grades, mask loadout)

## License rule
Every staged item verified at pull time: no GPL/AGPL in shipped code; CC0/CC-BY
preferred for art (attribution logged); MIT/Apache-2.0/ISC for code. Gaps are
logged, never faked.
