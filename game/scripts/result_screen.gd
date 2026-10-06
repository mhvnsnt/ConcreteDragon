class_name ResultScreen
extends Node2D
## Run over: staggered cash breakdown, upgrades, FIGHT AGAIN.

var main: Node = null
var save: SaveData = null
var sfx: Sfx = null
var stats := {}


func setup(p_main: Node, p_save: SaveData, p_sfx: Sfx, p_stats: Dictionary) -> void:
	main = p_main
	save = p_save
	sfx = p_sfx
	stats = p_stats


func _ready() -> void:
	# sfx lives on Main (added once); just use it
	var bg := ColorRect.new()
	bg.color = Color(0.08, 0.07, 0.12)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	# apply results
	var cash: int = int(stats["cash"])
	save.cash += cash
	save.losses += 1
	save.streak = 0
	save.save_game()

	var title := _label("KNOCKED OUT!", 110, Color("e63946"))
	title.position = Vector2(640 - 330, 50)
	add_child(title)
	var sub := _label("You cleared WAVE " + str(stats["wave"]) + "  •  " + str(stats["kills"]) + " KOs  •  best combo " + str(stats["max_combo"]), 34, Color.WHITE)
	sub.position = Vector2(640 - 380, 180)
	add_child(sub)

	# staggered reward lines (variable reward timing)
	var lines := [
		"Fight cash  +$" + str(cash),
		"Wave bonus  +$" + str(int(stats["wave"]) * 5),
	]
	var total := cash + int(stats["wave"]) * 5
	save.cash += int(stats["wave"]) * 5
	save.save_game()
	var y := 260.0
	for ln in lines:
		var l := _label(ln, 44, Color("ffd166"))
		l.position = Vector2(440, y)
		l.modulate.a = 0.0
		add_child(l)
		var tw := create_tween()
		tw.tween_interval(0.5 + y / 260.0 * 0.4)
		tw.tween_property(l, "modulate:a", 1.0, 0.25)
		tw.tween_callback(func() -> void: sfx.play("cash_blip", 1.0 + y / 2000.0))
		y += 60.0
	var tot := _label("TOTAL  $" + str(total), 60, Color("80ed99"))
	tot.position = Vector2(440, y + 10)
	tot.modulate.a = 0.0
	add_child(tot)
	var tw2 := create_tween()
	tw2.tween_interval(1.6)
	tw2.tween_property(tot, "modulate:a", 1.0, 0.3)
	tw2.tween_callback(func() -> void: sfx.play("win_jingle", 1.0, -4.0))

	# upgrades
	var uy := 470.0
	for u in [
		{"key": "up_power", "name": "POWER", "desc": "+damage"},
		{"key": "up_tough", "name": "TOUGH", "desc": "+max HP"},
		{"key": "up_hustle", "name": "HUSTLE", "desc": "+meter gain"},
	]:
		_make_upgrade(u, uy)
		uy += 62.0

	var again := Button.new()
	again.text = "FIGHT AGAIN"
	again.add_theme_font_size_override("font_size", 44)
	again.position = Vector2(440, 660 - 40)
	again.custom_minimum_size = Vector2(400, 80)
	_style_btn(again, Color("e63946"))
	again.pressed.connect(func() -> void: main.start_fight())
	add_child(again)

	var change := Button.new()
	change.text = "CHANGE FIGHTER"
	change.add_theme_font_size_override("font_size", 28)
	change.position = Vector2(880, 660 - 40)
	change.custom_minimum_size = Vector2(320, 80)
	_style_btn(change, Color(0.3, 0.3, 0.4))
	change.pressed.connect(func() -> void: main.show_select())
	add_child(change)

	var cash_l := _label("CASH: $" + str(save.cash), 36, Color("ffd166"))
	cash_l.position = Vector2(40, 620)
	cash_l.name = "CashLabel"
	add_child(cash_l)


func _make_upgrade(u: Dictionary, y: float) -> void:
	var key := str(u["key"])
	var lvl: int = save.get(key)
	var cost := SaveData.upgrade_cost(lvl)
	var b := Button.new()
	b.text = str(u["name"]) + " Lv" + str(lvl) + "  " + str(u["desc"]) + "  —  $" + str(cost)
	b.add_theme_font_size_override("font_size", 26)
	b.position = Vector2(440, y)
	b.custom_minimum_size = Vector2(400, 52)
	_style_btn(b, Color(0.2, 0.35, 0.3) if save.cash >= cost else Color(0.25, 0.25, 0.28))
	b.pressed.connect(func() -> void: _buy(key, cost))
	add_child(b)


func _buy(key: String, cost: int) -> void:
	var lvl: int = save.get(key)
	if save.cash < cost:
		sfx.play("block_clack", 0.7)
		return
	save.cash -= cost
	save.set(key, lvl + 1)
	save.save_game()
	sfx.play("win_jingle", 1.3, -6.0)
	main.show_result(stats)  # refresh


func _style_btn(b: Button, col: Color) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = col
	sb.set_corner_radius_all(14)
	b.add_theme_stylebox_override("normal", sb)
	var sb2: StyleBoxFlat = sb.duplicate()
	sb2.bg_color = col.lightened(0.15)
	b.add_theme_stylebox_override("hover", sb2)
	b.add_theme_stylebox_override("pressed", sb2)
	b.add_theme_color_override("font_color", Color.WHITE)


func _label(text: String, size: int, color: Color) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	l.add_theme_constant_override("outline_size", 6)
	return l
