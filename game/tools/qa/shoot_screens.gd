extends SceneTree
## QA screenshot driver for the CD customization lane.
## Captures: select pages, customize screen per slot, equipped preview.
## xvfb-run godot --path game --resolution 1280x720 --script game/tools/qa/shoot_screens.gd
## Output: game/tools/qa/shots/cd_<name>.png

var _frame := 0
var _main: Node = null
const OUT := "res://tools/qa/shots/"


func _initialize() -> void:
	_main = load("res://main.tscn").instantiate()
	root.add_child(_main)
	DirAccess.make_dir_recursive_absolute("res://tools/qa/shots")


func _shot(name: String) -> void:
	for i in range(30):
		await RenderingServer.frame_post_draw
		var tex = root.get_texture()
		if tex != null:
			var img := tex.get_image()
			var p := OUT + "cd_" + name + ".png"
			img.save_png(p)
			print("QA saved ", p)
			return
	print("QA FAILED shot ", name)


func _process(_delta: float) -> bool:
	_frame += 1
	match _frame:
		120:
			_shot("select_p0")
		140:
			var sel: Node = _main._current
			sel.get_node("PageNext").pressed.emit()
		200:
			_shot("select_p1")
		220:
			_main.save.cash = 99999
			for id in ["skimask_ink", "gloves_neon", "chain_dogtags",
					"paint_war", "eyes_ice", "lucha_barrio"]:
				_main.save.own_cosmetic(id)
			_main.show_customize()
		280:
			_shot("customize_headgear")
		300:
			var cz: Node = _main._current
			cz._on_item("headgear", "lucha_barrio")
			cz._on_item("gloves", "gloves_neon")
			cz._on_item("accessory", "chain_dogtags")
			cz._on_item("facepaint", "paint_war")
			cz._on_item("eyes", "eyes_ice")
			cz._on_slot_tab("headgear")
		360:
			_shot("customize_equipped")
		380:
			var cz2: Node = _main._current
			cz2._on_slot_tab("accessory")
		440:
			_shot("customize_accessory")
			return true
	return false
