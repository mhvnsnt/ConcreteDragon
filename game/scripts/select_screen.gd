class_name SelectScreen
extends Node2D
## Pick your fighter. 8 fighters, 4 per page (UX law: big cards, one job).

var main: Node = null
var save: SaveData = null
var _cards := []
var _page := 0
const PAGE_SIZE := 4


func setup(p_main: Node, p_save: SaveData) -> void:
	main = p_main
	save = p_save


func _ready() -> void:
	# NOTE: Controls under a Node2D don't get viewport-relative anchors,
	# so the backdrop needs an explicit size (anchors alone = zero-size).
	var bg := ColorRect.new()
	bg.color = Color(0.08, 0.07, 0.12)
	bg.position = Vector2.ZERO
	bg.size = Vector2(1280, 720)
	add_child(bg)

	var title := _label("CONCRETE DRAGON", 120, Color("ffd166"))
	title.position = Vector2(0, 60)
	title.size = Vector2(1280, 150)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(title)
	var sub := _label("PICK YOUR FIGHTER", 44, Color.WHITE)
	sub.position = Vector2(0, 205)
	sub.size = Vector2(1280, 60)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(sub)

	var defs := []
	var keys := Fighter.FIGHTER_DEFS.keys()
	keys.sort()
	for ci in range(keys.size()):
		var kind: int = keys[ci]
		var dd: Dictionary = Fighter.FIGHTER_DEFS[kind]
		defs.append({"kind": kind, "name": dd["name"], "desc": dd["desc"],
			"x": [160.0, 660.0][ci % 2], "y": [150.0, 400.0][int(ci / 2) % 2],
			"page": int(ci / PAGE_SIZE)})
	_show_page(defs, 0)
	# pager: big thumb-sized buttons
	var prev := Button.new()
	prev.text = "◀"
	prev.add_theme_font_size_override("font_size", 44)
	prev.position = Vector2(40, 330)
	prev.custom_minimum_size = Vector2(90, 120)
	prev.pressed.connect(_on_page.bind(defs, -1))
	prev.name = "PagePrev"
	add_child(prev)
	var next := Button.new()
	next.text = "▶"
	next.add_theme_font_size_override("font_size", 44)
	next.position = Vector2(1150, 330)
	next.custom_minimum_size = Vector2(90, 120)
	next.pressed.connect(_on_page.bind(defs, 1))
	next.name = "PageNext"
	add_child(next)
	_update_pager(defs)

	var cash := _label("CASH: $" + str(save.cash), 36, Color("ffd166"))
	cash.position = Vector2(40, 640)
	add_child(cash)
	var rec := _label("WINS " + str(save.wins) + "   LOSSES " + str(save.losses), 28, Color(0.7, 0.7, 0.75))
	rec.position = Vector2(950, 648)
	add_child(rec)

	var gear := Button.new()
	gear.text = "⚙ GEAR"
	gear.position = Vector2(560, 636)
	gear.custom_minimum_size = Vector2(200, 56)
	gear.add_theme_font_size_override("font_size", 30)
	gear.pressed.connect(_on_gear)
	add_child(gear)


func _on_gear() -> void:
	main.show_customize()


func _show_page(defs: Array, page: int) -> void:
	_page = page
	for c in _cards:
		c.queue_free()
	_cards.clear()
	for d in defs:
		if int(d["page"]) == page:
			_cards.append(_make_card(d))
	_update_pager(defs)


func _on_page(defs: Array, dir: int) -> void:
	var pages := int(ceil(float(defs.size()) / PAGE_SIZE))
	_show_page(defs, (_page + dir + pages) % pages)


func _update_pager(defs: Array) -> void:
	var pages := int(ceil(float(defs.size()) / PAGE_SIZE))
	var prev := get_node_or_null("PagePrev")
	var next := get_node_or_null("PageNext")
	if prev:
		prev.visible = pages > 1
	if next:
		next.visible = pages > 1


func _label(text: String, size: int, color: Color) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	l.add_theme_constant_override("outline_size", 8)
	return l


func _make_card(d: Dictionary) -> Button:
	var kind := int(d["kind"])
	var def: Dictionary = Fighter.FIGHTER_DEFS[kind]
	var b := Button.new()
	b.position = Vector2(d["x"], d["y"])
	b.custom_minimum_size = Vector2(440, 230)
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
	var tr := TextureRect.new()
	tr.name = "Portrait"
	_refresh_portrait(tr, kind)
	tr.custom_minimum_size = Vector2(130, 130)
	tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	tr.position = Vector2(18, 18)
	b.add_child(tr)
	var nm := _label(d["name"], 44, Color.WHITE)
	nm.position = Vector2(165, 18)
	nm.size = Vector2(260, 60)
	b.add_child(nm)
	var ds := _label(d["desc"], 24, Color(0.8, 0.8, 0.85))
	ds.position = Vector2(165, 78)
	ds.size = Vector2(260, 70)
	b.add_child(ds)
	# skin picker (style only, never power)
	var skins: Array = def["skins"]
	if skins.size() > 1:
		var sk := Button.new()
		sk.name = "SkinBtn"
		sk.text = "SKIN: " + _skin_label(save.get_skin(kind))
		sk.add_theme_font_size_override("font_size", 22)
		sk.position = Vector2(165, 158)
		sk.custom_minimum_size = Vector2(255, 52)
		sk.pressed.connect(_on_skin_cycle.bind(kind, tr, sk))
		b.add_child(sk)
	b.pressed.connect(_on_pick.bind(kind))
	add_child(b)
	return b


func _skin_label(sub: String) -> String:
	return sub.replace("_", " ").to_upper()


func _refresh_portrait(tr: TextureRect, kind: int) -> void:
	var sub := save.get_skin(kind)
	var hp := "res://assets/art/%s/head.png" % sub
	if ResourceLoader.exists(hp):
		tr.texture = load(hp)
	else:
		tr.texture = null


func _on_skin_cycle(kind: int, tr: TextureRect, sk: Button) -> void:
	var def: Dictionary = Fighter.FIGHTER_DEFS[kind]
	var skins: Array = def["skins"]
	var cur := save.get_skin(kind)
	var nxt: String = skins[(skins.find(cur) + 1) % skins.size()]
	save.set_skin(kind, nxt)
	sk.text = "SKIN: " + _skin_label(nxt)
	_refresh_portrait(tr, kind)


func _on_pick(kind: int) -> void:
	save.selected = kind
	save.save_game()
	main.start_fight()
