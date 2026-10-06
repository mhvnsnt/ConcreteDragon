extends Node
## Concrete Dragon — screen manager: select -> fight -> result.

var save: SaveData
var sfx: Sfx
var _current: Node = null


func _ready() -> void:
	save = SaveData.new()
	save.load_game()
	sfx = Sfx.new()
	add_child(sfx)
	if "--autotest" in OS.get_cmdline_user_args():
		start_fight()
	else:
		show_select()


func _swap(screen: Node) -> void:
	if _current:
		_current.queue_free()
	_current = screen
	add_child(screen)


func show_select() -> void:
	Engine.time_scale = 1.0
	var s := SelectScreen.new()
	s.setup(self, save)
	_swap(s)


func start_fight() -> void:
	Engine.time_scale = 1.0
	var f := FightScreen.new()
	f.setup(save, sfx, self)
	_swap(f)


func show_result(stats: Dictionary) -> void:
	Engine.time_scale = 1.0
	var r := ResultScreen.new()
	r.setup(self, save, sfx, stats)
	_swap(r)
