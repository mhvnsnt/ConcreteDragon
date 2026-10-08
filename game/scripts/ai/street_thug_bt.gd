class_name StreetThugBT
extends Node
## Example enemy brain on the BT micro-framework (game/scripts/ai/bt.gd).
## Drives a Fighter through its PUBLIC API only: start_attack / start_block /
## stop_block / state / walk_target_x / vel / facing. No fighter.gd surgery beyond
## the 3-line bt_brain hook in _ai_update().
##
## Attach: fighter.add_child(StreetThugBT.new()); brain.setup(fighter)
## The brain only thinks while fighter.bt_brain == brain and fighter.is_ai.

const BUSY_STATES := ["hit", "launched", "down", "getup", "ko", "punch", "heavy",
	"launcher", "special", "walkin", "block"]

var tree: BT.Tree
var fighter: Fighter


func setup(p_fighter: Fighter) -> void:
	fighter = p_fighter
	tree = BT.Tree.new()
	tree.blackboard.set_value("fighter", fighter)
	tree.blackboard.set_value("cooldown_until", 0.0)
	tree.blackboard.set_value("block_until", 0.0)
	tree.root = BT.Selector.new([
		BT.Sequence.new([
			BT.Condition.new(_player_gone),
			BT.Action.new(_act_idle),
		]),
		BT.Sequence.new([
			BT.Condition.new(_is_busy),
			BT.Action.new(_act_wait),
		]),
		BT.Sequence.new([
			BT.Condition.new(_should_block),
			BT.Action.new(_act_block),
		]),
		BT.Sequence.new([
			BT.Condition.new(_in_strike_range),
			BT.Action.new(_act_attack),
		]),
		BT.Sequence.new([
			BT.Condition.new(_too_far),
			BT.Action.new(_act_approach),
		]),
		BT.Action.new(_act_hold),
	])
	fighter.bt_brain = self


func think(_delta: float) -> void:
	if fighter == null or fighter.fight == null:
		return
	tree.tick(_delta)


func _now() -> float:
	return Time.get_ticks_msec() / 1000.0


func _player() -> Fighter:
	return fighter.fight.player


func _dist() -> float:
	var p := _player()
	if p == null:
		return 99999.0
	return absf(p.position.x - fighter.position.x)


# --- Conditions -------------------------------------------------------------

func _player_gone(_bb: BT.Blackboard) -> bool:
	var p := _player()
	return p == null or p.dead


func _is_busy(_bb: BT.Blackboard) -> bool:
	return fighter.state in BUSY_STATES


func _should_block(bb: BT.Blackboard) -> bool:
	var p := _player()
	if p == null or not p.attacking:
		return false
	if _dist() > 260.0:
		return false
	if _now() < float(bb.get_value("block_until", 0.0)):
		return true  # already committed to the block
	return randf() < float(fighter.fight.ai_block_chance)


func _in_strike_range(bb: BT.Blackboard) -> bool:
	return _dist() <= 175.0 and _now() >= float(bb.get_value("cooldown_until", 0.0))


func _too_far(_bb: BT.Blackboard) -> bool:
	return _dist() > 420.0


# --- Actions ----------------------------------------------------------------

func _act_idle(_bb: BT.Blackboard) -> int:
	fighter.state = "idle"
	fighter.vel.x = 0.0
	return BT.Status.SUCCESS


func _act_wait(_bb: BT.Blackboard) -> int:
	# Mid-animation: let the state machine finish the move/hit/KO.
	return BT.Status.RUNNING


func _act_block(bb: BT.Blackboard) -> int:
	if _now() < float(bb.get_value("block_until", 0.0)):
		return BT.Status.RUNNING  # hold the block
	if fighter.state != "block":
		fighter.start_block()
		bb.set_value("block_until", _now() + randf_range(0.4, 0.8))
		return BT.Status.RUNNING
	fighter.stop_block()
	return BT.Status.SUCCESS


func _act_attack(bb: BT.Blackboard) -> int:
	var aggro: float = float(fighter.fight.ai_aggro)
	var r := randf()
	var move := "jab"
	if r < 0.45 * aggro:
		move = "jab"
	elif r < 0.70 * aggro:
		move = "heavy"  # telegraphed -> player can counter
	elif r < 0.82 * aggro:
		move = "launcher"
	else:
		bb.set_value("cooldown_until", _now() + randf_range(0.4, 0.9))
		return BT.Status.SUCCESS  # whiff the opening, reset
	fighter.stop_block()
	if fighter.start_attack(move):
		bb.set_value("cooldown_until", _now() + randf_range(0.35, 0.9) / maxf(aggro, 0.2))
		return BT.Status.SUCCESS
	return BT.Status.FAILURE


func _act_approach(_bb: BT.Blackboard) -> int:
	var p := _player()
	fighter.stop_block()
	fighter.state = "walk"
	fighter.walk_target_x = p.position.x - fighter.facing * 140.0
	return BT.Status.SUCCESS


func _act_hold(_bb: BT.Blackboard) -> int:
	# In range but on cooldown: hold ground, face the player.
	var p := _player()
	if p != null:
		fighter.facing = 1 if p.position.x > fighter.position.x else -1
	fighter.state = "idle"
	fighter.vel.x = 0.0
	return BT.Status.SUCCESS
