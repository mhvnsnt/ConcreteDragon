class_name BT
## Minimal behavior-tree micro-framework for Concrete Dragon enemy AI (Godot 4).
## Original code — no third-party dependency.
##
## Why not upstream LimboAI: it is GDExtension-only now (needs SCons + godot-cpp
## compiled per export platform). See docs/EVAL_LIMBOAI.md. This file delivers the
## same BT pattern (Selector/Sequence/Condition/Action + blackboard) as pure
## GDScript, drop-in for the 2D M1 tree.
##
## Usage:
##   var tree := BT.Tree.new()
##   tree.blackboard.set("fighter", self)
##   tree.root = BT.Selector.new([
##       BT.Sequence.new([BT.Condition.new(_is_hurt), BT.Action.new(_wait_out_hit)]),
##       BT.Action.new(_attack),
##   ])
##   # then each think tick: tree.tick(delta)

enum Status { SUCCESS, FAILURE, RUNNING }


class Blackboard:
	var data: Dictionary = {}

	func set_value(key: String, value) -> void:
		data[key] = value

	func get_value(key: String, default_value = null):
		return data.get(key, default_value)

	func has_value(key: String) -> bool:
		return data.has(key)


class BTNode:
	func tick(_bb: Blackboard) -> int:
		return Status.FAILURE


class Sequence extends BTNode:
	var children: Array = []
	var _current: int = 0

	func _init(p_children: Array = []) -> void:
		children = p_children

	func tick(bb: Blackboard) -> int:
		while _current < children.size():
			var s: int = (children[_current] as BTNode).tick(bb)
			if s == Status.RUNNING:
				return Status.RUNNING
			if s == Status.FAILURE:
				_current = 0
				return Status.FAILURE
			_current += 1
		_current = 0
		return Status.SUCCESS


class Selector extends BTNode:
	var children: Array = []
	var _current: int = 0

	func _init(p_children: Array = []) -> void:
		children = p_children

	func tick(bb: Blackboard) -> int:
		while _current < children.size():
			var s: int = (children[_current] as BTNode).tick(bb)
			if s == Status.RUNNING:
				return Status.RUNNING
			if s == Status.SUCCESS:
				_current = 0
				return Status.SUCCESS
			_current += 1
		_current = 0
		return Status.FAILURE


class Condition extends BTNode:
	var fn: Callable

	func _init(p_fn: Callable) -> void:
		fn = p_fn

	func tick(bb: Blackboard) -> int:
		return Status.SUCCESS if fn.call(bb) else Status.FAILURE


class Action extends BTNode:
	var fn: Callable

	func _init(p_fn: Callable) -> void:
		fn = p_fn

	func tick(bb: Blackboard) -> int:
		return int(fn.call(bb))


class Tree:
	var root: BTNode
	var blackboard: Blackboard = Blackboard.new()

	func tick(_delta: float) -> int:
		if root == null:
			return Status.FAILURE
		return root.tick(blackboard)
