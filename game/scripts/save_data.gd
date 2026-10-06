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


func get_skin(p_kind: int) -> String:
	var def: Dictionary = Fighter.FIGHTER_DEFS.get(p_kind, Fighter.FIGHTER_DEFS[0])
	return str(selected_skin.get(str(p_kind), def["art"]))


func set_skin(p_kind: int, p_skin: String) -> void:
	selected_skin[str(p_kind)] = p_skin
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
	cfg.save(PATH)
