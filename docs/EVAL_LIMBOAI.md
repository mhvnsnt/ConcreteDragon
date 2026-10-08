# LimboAI evaluation — 2026-10-06 (content Wave 4)

**Repo:** https://github.com/limbonaut/limboai — **License: MIT** (Copyright
2023-2025 Serhii Snitsaruk and contributors; full text verified in clone).
Shippable in commercial products with the license notice included.

## Finding: upstream LimboAI is GDExtension-only — NOT vendored

The current upstream (`master`) is a C++ GDExtension: compiling it needs SCons,
a C++ toolchain, and the godot-cpp submodule, **built separately per export
platform** (Windows/Linux/macOS/Android/iOS/Web). It is not a drop-in GDScript
addon — dropping 20MB of uncompiled C++ into `game/addons/` would be dead
weight that CI cannot build today.

The old GDScript addon version no longer exists upstream (no `addons/` tree in
any fetched ref).

## What we did instead (real, shippable)

Delivered the same capability as original GDScript, sized for our 2D M1 tree:

- `game/scripts/ai/bt.gd` — micro behavior-tree framework (Selector, Sequence,
  Condition, Action, Blackboard, Tree). Original code, no dependency.
- `game/scripts/ai/street_thug_bt.gd` — example enemy brain (Street Thug) that
  drives a Fighter through its public API only: block-react on player attack
  startup, weighted jab/heavy/launcher selection, approach/hold spacing, KO-safe
  busy-state handling.
- `game/scripts/fighter.gd` — 3-line hook: if `fighter.bt_brain` is set,
  `_ai_update()` delegates to `brain.think(delta)`. Default AI untouched when
  unset.
- `docs/WIRING_ENEMY_BT.md` — how to attach brains to new enemy variants.

## When to revisit upstream LimboAI

If/when a 3D Godot branch needs a visual BT editor + debugger: build the
GDExtension via SCons for each export target, or pull prebuilt binaries from a
LimboAI release. The evaluation (license, build cost) is recorded here so that
step is mechanical. Until then, `scripts/ai/` is the sanctioned enemy-AI pattern.
