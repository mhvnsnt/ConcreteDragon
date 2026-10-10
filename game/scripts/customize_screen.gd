class_name CustomizeScreen
extends Node2D
## GEAR — character customization (Phase 2 suite, Track 2).
## Live paper-doll preview + per-slot pickers. Cosmetic-only: zero stats.
## Reached from the select screen's GEAR button.

const SLOT_LABELS := {
	"headgear": "HEAD", "gloves": "GLOVES", "kicks": "KICKS",
	"accessory": "ACCESSORY", "facepaint": "FACE PAINT", "eyes": "EYES",
}

var main: Node = null
var save: SaveData = null
var _kind := 0
var _preview: Fighter = null
var _preview_wrap: Node2D = null
var _cash_label: Label = null
var _rows := {}  # slot -> VBoxContainer


func setup(p_main: Node, p_save: SaveData) -> void:
	main = p_main
	save = p_save
	_kind = save.selected


func _ready() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.08, 0.07, 0.12)
	bg.position = Vector2.ZERO
	bg.size = Vector2(1280, 720)
	add_child(bg)

	var title := _label("GEAR", 84, Color("ffd166"))
	title.position = Vector2(60, 16)
	title.size = Vector2(500, 100)
	add_child(title)
	var sub := _label("CUSTOMIZE — style only, never power", 26, Color(0.75, 0.75, 0.8))
	sub.position = Vector2(62, 100)
	sub.size = Vector2(600, 40)
	add_child(sub)

	_cash_label = _label("", 34, Color("ffd166"))
	_cash_label.position = Vector2(950, 40)
	_cash_label.size = Vector2(300, 50)
	_cash_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	add_child(_cash_label)

	# fighter tabs
	var kinds := Fighter.FIGHTER_DEFS.keys()
	for i in kinds.size():
		var k := int(kinds[i])
		var b := Button.new()
		b.text = str(Fighter.FIGHTER_DEFS[k]["name"])
		b.position = Vector2(62 + i * 200, 150)
		b.custom_minimum_size = Vector2(180, 52)
		b.add_theme_font_size_override("font_size", 30)
		b.pressed.connect(_on_tab.bind(k))
		add_child(b)

	# preview (live paper-doll fighter with equipped cosmetics)
	_preview_wrap = Node2D.new()
	_preview_wrap.position = Vector2(270, 660)
	_preview_wrap.scale = Vector2(1.05, 1.05)
	add_child(_preview_wrap)

	# slot rows on the right
	var y := 150.0
	for slot in Cosmetics.slots():
		var lab := _label(str(SLOT_LABELS.get(slot, slot.to_upper())), 28, Color(0.85, 0.85, 0.9))
		lab.position = Vector2(560, y)
		lab.size = Vector2(700, 36)
		add_child(lab)
		y += 38
		var vb := VBoxContainer.new()
		vb.position = Vector2(560, y)
		vb.custom_minimum_size = Vector2(700, 10)
		vb.add_theme_constant_override("separation", 4)
		add_child(vb)
		_rows[slot] = vb
		y += 86.0

	var back := Button.new()
	back.text = "← BACK"
	back.position = Vector2(62, 640)
	back.custom_minimum_size = Vector2(200, 56)
	back.add_theme_font_size_override("font_size", 30)
	back.pressed.connect(_on_back)
	add_child(back)

	_refresh_all()


func _label(text: String, size: int, color: Color) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.add_theme_color_override("font_outline_color", Color(0, 0, 0))
	l.add_theme_constant_override("outline_size", 6)
	return l


func _on_tab(k: int) -> void:
	_kind = k
	_refresh_all()


func _on_back() -> void:
	main.show_select()


func _refresh_all() -> void:
	_cash_label.text = "CASH: $" + str(save.cash)
	_refresh_preview()
	for slot in _rows.keys():
		_refresh_row(slot)


func _refresh_preview() -> void:
	if _preview:
		_preview.queue_free()
		_preview = null
	var def: Dictionary = Fighter.FIGHTER_DEFS[_kind]
	_preview = Fighter.new()
	_preview.setup(_kind, false, str(def["name"]), save.get_skin(_kind),
		save.get_equipped(_kind))
	_preview_wrap.add_child(_preview)


func _slot_items(slot: String) -> Array:
	var out := []
	for item_id in Cosmetics.items().keys():
		if str(Cosmetics.items()[item_id].get("slot")) == slot:
			out.append(item_id)
	return out


func _refresh_row(slot: String) -> void:
	var vb: VBoxContainer = _rows[slot]
	for c in vb.get_children():
		c.queue_free()
	var eq := save.get_equipped(_kind)
	var stock := Cosmetics.shop_stock(save)
	# "none" button for single-equip slots
	var items := _slot_items(slot)
	if slot != "accessory":
		items = ["__none__"] + items
	# chunk into rows of 4 so long catalogs don't overflow
	for ci in range(0, items.size(), 4):
		var hb := HBoxContainer.new()
		hb.add_theme_constant_override("separation", 6)
		vb.add_child(hb)
		for item_id in items.slice(ci, ci + 3):
			if item_id == "__none__":
				var nb := _item_button("None", Color(0.5, 0.5, 0.55), " unequip ",
					str(eq.get(slot, "")) == "")
				nb.pressed.connect(_on_unequip.bind(slot))
				hb.add_child(nb)
				continue
			hb.add_child(_make_item_button(slot, item_id, eq, stock))


func _make_item_button(slot: String, item_id: String, eq: Dictionary, stock: Array) -> Button:
	var item: Dictionary = Cosmetics.items()[item_id]
	var rarity := str(item.get("rarity", "Street"))
	var rc: Color = Cosmetics.rarity_color(rarity)
	var owned: bool = save.owned_cosmetics.get(item_id, false)
	var label := str(item.get("name", item_id))
	var equipped_now := false
	if slot == "accessory":
		equipped_now = (eq["accessory"] as Array).has(item_id)
	else:
		equipped_now = str(eq.get(slot, "")) == item_id
	var state := ""
	if equipped_now:
		state = " ✓"
	elif not owned:
		var lock := Cosmetics.lock_reason(save, item_id)
		if lock != "":
			state = " 🔒"
		else:
			var u: Dictionary = item.get("unlock", {})
			match str(u.get("type", "shop")):
				"shop":
					if stock.has(item_id):
						state = " $" + str(int(u.get("price", 0)))
					else:
						state = " ↻"
				"season":
					state = " CLAIM"
				"boss":
					state = " CLAIM"
	var b := _item_button(label, rc, state, equipped_now)
	b.tooltip_text = str(item.get("desc", "")) + " [" + rarity + "]"
	b.pressed.connect(_on_item.bind(slot, item_id))
	return b


func _item_button(label: String, rc: Color, state: String, active: bool) -> Button:
	var b := Button.new()
	b.text = label + state
	b.custom_minimum_size = Vector2(0, 44)
	b.add_theme_font_size_override("font_size", 20)
	b.add_theme_color_override("font_color", rc if not active else Color.WHITE)
	if active:
		var sb := StyleBoxFlat.new()
		sb.bg_color = Color(rc.r * 0.45, rc.g * 0.45, rc.b * 0.45)
		sb.set_corner_radius_all(8)
		sb.set_border_width_all(2)
		sb.border_color = rc
		b.add_theme_stylebox_override("normal", sb)
	return b


func _on_unequip(slot: String) -> void:
	save.equip_cosmetic(_kind, slot, "")
	_refresh_all()


func _on_item(slot: String, item_id: String) -> void:
	var item: Dictionary = Cosmetics.items()[item_id]
	var owned: bool = save.owned_cosmetics.get(item_id, false)
	if owned:
		if slot == "accessory":
			save.toggle_accessory(_kind, item_id)
		else:
			var eq := save.get_equipped(_kind)
			if str(eq.get(slot, "")) == item_id:
				save.equip_cosmetic(_kind, slot, "")
			else:
				save.equip_cosmetic(_kind, slot, item_id)
		_refresh_all()
		return
	# acquire path
	var lock := Cosmetics.lock_reason(save, item_id)
	if lock != "":
		return  # locked: button showed the reason
	var u: Dictionary = item.get("unlock", {})
	match str(u.get("type", "shop")):
		"shop":
			if not Cosmetics.shop_stock(save).has(item_id):
				return  # not in today's rotation
			var price := int(u.get("price", 0))
			if save.cash < price:
				return
			save.cash -= price
			save.own_cosmetic(item_id)
			save.save_game()
			_on_item(slot, item_id)  # equip what was just bought
		"season", "boss":
			save.own_cosmetic(item_id)
			_on_item(slot, item_id)
