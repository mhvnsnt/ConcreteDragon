# Wiring enemy behavior trees

**Files:** `game/scripts/ai/bt.gd` (framework), `game/scripts/ai/street_thug_bt.gd`
(example brain). Original code — no license encumbrance.

## Attach a brain to an enemy

```gdscript
# wherever the enemy Fighter is spawned (e.g. fight.gd spawn_wave):
var enemy := Fighter.new()
enemy.setup(Fighter.KIND_ROOK, true, "STREET THUG")
var brain := StreetThugBT.new()
enemy.add_child(brain)
brain.setup(enemy)   # sets enemy.bt_brain; _ai_update() now delegates to the tree
```

Remove or never set `bt_brain` and the fighter falls back to the built-in
`ai_mode` state machine in `_ai_update()` — both can coexist in one wave.

## Writing a new enemy brain

1. Create `game/scripts/ai/<name>_bt.gd` with `class_name <Name>BT extends Node`.
2. In `setup(fighter)`: build a `BT.Tree`, put shared state on
   `tree.blackboard` (`"fighter"`, timers), assign `tree.root`.
3. Conditions are `BT.Condition.new(Callable)` returning bool; actions are
   `BT.Action.new(Callable)` returning `BT.Status.SUCCESS/FAILURE/RUNNING`.
4. Drive the fighter through public API only: `start_attack("jab"|"heavy"|
   "launcher"|"special")`, `start_block()`, `stop_block()`, `state = "walk"` +
   `walk_target_x`, `facing`, `vel`.
5. Always include a busy-state branch first (`fighter.state in
   StreetThugBT.BUSY_STATES` → `RUNNING`) so the brain never fights the
   animation state machine mid-hit, mid-KO, or mid-attack.

## Design notes (from the teardowns)

- Telegraphs stay: heavies/launchers must remain counterable (owner combat-feel
  law) — the tree never cancels a telegraph once `start_attack` commits.
- Enemy variants (SoR2 lesson) escalate by behavior, not just stats: clone
  `street_thug_bt.gd` for `thug_enforcer_bt.gd` etc. and change branch weights
  (block chance, aggression, new moves) per variant.
- Keep per-brain randomness seeded from the wave seed so daily seeded runs stay
  reproducible.
