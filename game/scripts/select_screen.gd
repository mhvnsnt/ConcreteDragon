class_name SelectScreen
extends Node2D
## Pick your fighter: ROOK or VEX. Cute cards, TAP TO FIGHT.

var main: Node = null
var save: SaveData = null
var _cards := []


func setup(p_main: Node, p_save: SaveData) -> void:
	main = p_main
	save = p_save


func _ready() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.08, 0.07, 0.12)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var title := _label("CONCRETE DRAGON", 120, Color("ffd166"))
	title.position = Vector2(640 - 330, 60)
	add_child(title)
	var sub := _label("PICK YOUR FIGHTER", 44, Color.WHITE)
	sub.position = Vector2(640 - 220, 200)
	add_child(sub)

	var defs := [
		{"kind": 0, "name": "ROOK", "desc": "Balanced boxer.\nBig gloves, big heart.", "x": 240.0},
		{"kind": 1, "name": "VEX", "desc": "Fast kickboxer.\nBlink and you're down.", "x": 720.0},
	]
	for d in defs:
		_cards.append(_make_card(d))

	var cash := _label("CASH: $" + str(save.cash), 36, Color("ffd166"))
	cash.position = Vector2(40, 640)
	add_child(cash)
	var rec := _label("WINS " + str(save.wins) + "   LOSSES " + str(save.losses), 28, Color(0.7, 0.7, 0.75))
	rec.position = Vector2(950, 648)
	add_child(rec)


func _label(text: String, size: int, color: Color) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	l.add_theme_constant_override("outline_size", 8)
	return l


func _make_card(d: Dictionary) -> Button:
	var b := Button.new()
	b.position = Vector2(d["x"], 280)
	b.custom_minimum_size = Vector2(320, 330)
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.16, 0.15, 0.22)
	sb.set_corner_radius_all(18)
	sb.border_color = Color("ffd166") if int(d["kind"]) == save.selected else Color(0.35, 0.34, 0.42)
	sb.set_border_width_all(4)
	b.add_theme_stylebox_override("normal", sb)
	var sb2: StyleBoxFlat = sb.duplicate()
	sb2.bg_color = Color(0.22, 0.2, 0.3)
	b.add_theme_stylebox_override("hover", sb2)
	b.add_theme_stylebox_override("pressed", sb2)
	# portrait: head art (PNG if present, else procedural Part)
	var sub := "rook" if int(d["kind"]) == 0 else "vex"
	var hp := "res://assets/art/%s/head.png" % sub
	if ResourceLoader.exists(hp):
		var tr := TextureRect.new()
		tr.texture = load(hp)
		tr.custom_minimum_size = Vector2(150, 150)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.position = Vector2(85, 15)
		tr.scale = Vector2(1.0, 1.0)
		b.add_child(tr)
	else:
		var f := Fighter.new()
		f.setup(int(d["kind"]), false, "")
		f.position = Vector2(160, 300)
		for key in f.Parts:
			if key != "head":
				(f.Parts[key] as Node2D).visible = false
		f.J["hips"].visible = false
		var head := f.Parts["head"] as Node2D
		head.position = Vector2(0, 0)
		head.scale = Vector2(1.6, 1.6)
		b.add_child(f)
	var nm := _label(d["name"], 52, Color.WHITE)
	nm.position = Vector2(20, 190)
	b.add_child(nm)
	var ds := _label(d["desc"], 26, Color(0.8, 0.8, 0.85))
	ds.position = Vector2(20, 250)
	b.add_child(ds)
	b.pressed.connect(_on_pick.bind(int(d["kind"])))
	add_child(b)
	return b


func _on_pick(kind: int) -> void:
	save.selected = kind
	save.save_game()
	main.start_fight()
