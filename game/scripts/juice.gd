class_name Juice
extends Node2D
## Screen shake, hit-stop, slow-mo, and floating popup text.
## Attach to the fight scene; set camera to the Camera2D.

var camera: Camera2D
var _trauma: float = 0.0
var _base_offset: Vector2 = Vector2.ZERO
var _restore_timer: float = 0.0


func _ready() -> void:
	set_process(true)


func add_shake(amount: float) -> void:
	_trauma = minf(1.0, _trauma + amount)


func hit_stop(seconds: float) -> void:
	Engine.time_scale = 0.05
	_restore_timer = seconds


func slow_mo(scale: float, seconds: float) -> void:
	Engine.time_scale = scale
	_restore_timer = seconds


func _process(delta: float) -> void:
	if _restore_timer > 0.0:
		_restore_timer -= delta
		if _restore_timer <= 0.0:
			Engine.time_scale = 1.0
	if camera:
		if _trauma > 0.0:
			_trauma = maxf(0.0, _trauma - delta * 2.2)
			var s := _trauma * _trauma * 26.0
			camera.offset = _base_offset + Vector2(randf_range(-s, s), randf_range(-s, s))
		else:
			camera.offset = _base_offset


static func popup(parent: Node, text: String, pos: Vector2, color: Color,
		size: int = 44, rise: float = 90.0, life: float = 0.9) -> void:
	var lbl := Label.new()
	lbl.text = text
	lbl.add_theme_font_size_override("font_size", size)
	lbl.add_theme_color_override("font_color", color)
	lbl.add_theme_color_override("font_outline_color", Color(0.08, 0.07, 0.12))
	lbl.add_theme_constant_override("outline_size", 8)
	lbl.position = pos + Vector2(-120, -40)
	lbl.z_index = 50
	parent.add_child(lbl)
	var tw := parent.create_tween().set_parallel(true)
	tw.tween_property(lbl, "position:y", lbl.position.y - rise, life).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_property(lbl, "modulate:a", 0.0, life).set_delay(life * 0.45)
	tw.chain().tween_callback(lbl.queue_free)


static func banner(parent: Node, text: String, color: Color, size: int = 110) -> Label:
	## Big center-screen text (K.O.!, COUNTER!, etc.) that punches in.
	## Synchronous — no await, so callers can free/replace immediately.
	var lbl := Label.new()
	lbl.text = text
	lbl.add_theme_font_size_override("font_size", size)
	lbl.add_theme_color_override("font_color", color)
	lbl.add_theme_color_override("font_outline_color", Color(0.08, 0.07, 0.12))
	lbl.add_theme_constant_override("outline_size", 14)
	lbl.z_index = 60
	# estimated centering (no frame wait needed)
	var w := float(text.length()) * float(size) * 0.62
	lbl.position = Vector2(640.0 - w / 2.0, 300.0 - float(size) * 0.55)
	parent.add_child(lbl)
	lbl.pivot_offset = Vector2(w / 2.0, float(size) * 0.55)
	lbl.scale = Vector2(0.2, 0.2)
	var tw := parent.create_tween()
	tw.tween_property(lbl, "scale", Vector2(1.15, 1.15), 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_property(lbl, "scale", Vector2(1.0, 1.0), 0.12)
	return lbl
