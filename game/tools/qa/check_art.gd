extends SceneTree
## QA: verify every fighter's head.png loads (run after adding art).
## xvfb-run godot --headless --path game --script game/tools/qa/check_art.gd

func _initialize() -> void:
	var arts := ["rook", "vex", "brick", "sable", "juno", "mack", "iris", "hollow_point",
		"rook_noir", "vex_crimson", "bruno", "jinx"]
	var bad := 0
	for art in arts:
		var hp := "res://assets/art/%s/head.png" % art
		var t = load(hp) if ResourceLoader.exists(hp) else null
		if t == null:
			bad += 1
			print("QA FAIL art missing: ", art)
		else:
			print("QA ok: ", art, " ", t.get_size())
	# overlays: every catalog item x every fighter
	var cat_text := FileAccess.get_file_as_string("res://assets/customize/catalog.json")
	var cat: Dictionary = JSON.parse_string(cat_text)
	var items: Dictionary = cat.get("items", {})
	for f in ["rook", "vex", "brick", "sable", "juno", "mack", "iris", "hollow_point"]:
		for iid in items.keys():
			var spec: Dictionary = items[iid]
			for ci in spec.get("canvases", []).size():
				var c: String = spec["canvases"][ci]
				var fn: String = iid if ci == 0 else iid + "_" + c
				var p := "res://assets/art/customize/%s/%s.png" % [f, fn]
				if not ResourceLoader.exists(p):
					bad += 1
					print("QA FAIL overlay missing: ", f, "/", fn)
	print("QA check_art done, failures=", bad)
	quit(bad)
