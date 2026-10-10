class_name SaveData
extends RefCounted
## Persistent M1 save: cash, upgrades, record. No accounts, no network.

const PATH := "user://concretedragon.cfg"

var cash: int = 0
var up_power: int = 0
var up_tough: int = 0
var up_hustle: int = 0
var wins: int = 0
var losses: int = 0
var streak: int = 0
var selected: int = 0  # 0 = Rook, 1 = Vex
var selected_skin := {}  # str(kind) -> art subdir (style only, never power)

# Character customization suite (Phase 2, Track 2). Cosmetic-only: zero stats.
var owned_cosmetics := {}  # item_id -> true (purchased / unlocked)
var equipped := {}  # str(kind) -> {slot: item_id}; "accessory" holds an Array
var cosmetic_stock := {}  # {"date": "YYYY-MM-DD", "ids": [...]} daily rotation
var bosses_beaten := 0  # boss waves cleared (every 5th wave); gates boss items


func get_skin(p_kind: int) -> String:
	var def: Dictionary = Fighter.FIGHTER_DEFS.get(p_kind, Fighter.FIGHTER_DEFS[0])
	return str(selected_skin.get(str(p_kind), def["art"]))


func set_skin(p_kind: int, p_skin: String) -> void:
	selected_skin[str(p_kind)] = p_skin
	save_game()


func get_equipped(p_kind: int) -> Dictionary:
	var e: Dictionary = equipped.get(str(p_kind), {})
	# normalize: every slot present, accessory always an Array
	var out := {}
	for slot in Cosmetics.slots():
		if slot == "accessory":
			var a: Array = e.get(slot, [])
			out[slot] = a
		else:
			out[slot] = str(e.get(slot, ""))
	return out


func equip_cosmetic(p_kind: int, slot: String, item_id: String) -> void:
	var e := get_equipped(p_kind)
	if slot == "accessory":
		var a: Array = e[slot]
		if item_id == "":
			a.clear()
		elif not a.has(item_id):
			a.append(item_id)
		e[slot] = a
	else:
		e[slot] = item_id
	equipped[str(p_kind)] = e
	save_game()


func toggle_accessory(p_kind: int, item_id: String) -> void:
	var e := get_equipped(p_kind)
	var a: Array = e["accessory"]
	if a.has(item_id):
		a.erase(item_id)
	else:
		a.append(item_id)
	e["accessory"] = a
	equipped[str(p_kind)] = e
	save_game()


func own_cosmetic(item_id: String) -> void:
	owned_cosmetics[item_id] = true
	save_game()


static func upgrade_cost(level: int) -> int:
	return 100 * (level + 1)


func power_bonus() -> int:
	return up_power * 2


func tough_bonus() -> int:
	return up_tough * 12


func hustle_mult() -> float:
	return 1.0 + up_hustle * 0.15


func load_game() -> void:
	var cfg := ConfigFile.new()
	if cfg.load(PATH) != OK:
		return
	cash = int(cfg.get_value("meta", "cash", 0))
	up_power = int(cfg.get_value("meta", "up_power", 0))
	up_tough = int(cfg.get_value("meta", "up_tough", 0))
	up_hustle = int(cfg.get_value("meta", "up_hustle", 0))
	wins = int(cfg.get_value("meta", "wins", 0))
	losses = int(cfg.get_value("meta", "losses", 0))
	streak = int(cfg.get_value("meta", "streak", 0))
	selected = int(cfg.get_value("meta", "selected", 0))
	selected_skin = cfg.get_value("meta", "selected_skin", {})
	owned_cosmetics = cfg.get_value("meta", "owned_cosmetics", {})
	equipped = cfg.get_value("meta", "equipped", {})
	cosmetic_stock = cfg.get_value("meta", "cosmetic_stock", {})
	bosses_beaten = int(cfg.get_value("meta", "bosses_beaten", 0))


func save_game() -> void:
	var cfg := ConfigFile.new()
	cfg.set_value("meta", "cash", cash)
	cfg.set_value("meta", "up_power", up_power)
	cfg.set_value("meta", "up_tough", up_tough)
	cfg.set_value("meta", "up_hustle", up_hustle)
	cfg.set_value("meta", "wins", wins)
	cfg.set_value("meta", "losses", losses)
	cfg.set_value("meta", "streak", streak)
	cfg.set_value("meta", "selected", selected)
	cfg.set_value("meta", "selected_skin", selected_skin)
	cfg.set_value("meta", "owned_cosmetics", owned_cosmetics)
	cfg.set_value("meta", "equipped", equipped)
	cfg.set_value("meta", "cosmetic_stock", cosmetic_stock)
	cfg.set_value("meta", "bosses_beaten", bosses_beaten)
	cfg.save(PATH)
