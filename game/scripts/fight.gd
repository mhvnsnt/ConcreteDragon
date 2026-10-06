class_name FightScreen
extends Node2D
## M1 fight: the sacred loop — enemy walks in, you beat them down, next one
## comes. Waves escalate; every 5th wave is a boss. Tap=jab, swipe->=heavy,
## swipe-up=launcher, hold=block, two-finger=special.

const GROUND_Y := 600.0

var save: SaveData
var sfx: Sfx
var main: Node = null

var player: Fighter
var enemy: Fighter = null
var juice: Juice
var camera: Camera2D

var wave := 0
var phase := "banner"  # banner, walkin, fight, waveclear, gameover
var phase_t := 0.0
var cash_run := 0
var kills := 0
var combo := 0
var combo_t := 0.0
var max_combo := 0
var run_time := 0.0
var game_over := false

# AI difficulty (scales with wave)
var ai_aggro := 0.8
var ai_block_chance := 0.12

# touch tracking
var _touches := {}
var _special_used_this_touch := false
var autotest := false
var _test_t := 0.0
var _stall_frames := 0
var _stall_snap := ""

# HUD nodes
var hud: CanvasLayer
var hp_player: ProgressBar
var hp_enemy: ProgressBar
var hp_enemy_name: Label
var wave_label: Label
var cash_label: Label
var meter_bar: ProgressBar
var combo_label: Label
var hint_label: Label
var special_btn: Button
var banner_label: Label
var _big_banner: Label = null  # Juice.banner handle (freed before re-show)


func _big_text(text: String, color: Color, size: int = 110) -> void:
	if is_instance_valid(_big_banner):
		_big_banner.queue_free()
	_big_banner = Juice.banner(self, text, color, size)
	# auto-clear so banners never stack up or linger
	var tw := create_tween()
	tw.tween_interval(1.4)
	tw.tween_property(_big_banner, "modulate:a", 0.0, 0.4)
	tw.tween_callback(_big_banner.queue_free)


func setup(p_save: SaveData, p_sfx: Sfx, p_main: Node) -> void:
	save = p_save
	sfx = p_sfx
	main = p_main


func _ready() -> void:
	_build_stage()
	camera = Camera2D.new()
	camera.position = Vector2(640, 360)
	add_child(camera)
	juice = Juice.new()
	juice.camera = camera
	add_child(juice)
	# sfx lives on Main (added once); just use it
	autotest = "--autotest" in OS.get_cmdline_user_args()
	_spawn_player()
	_build_hud()
	_next_wave()


func _build_stage() -> void:
	# real stage art when present, procedural fallback otherwise
	if ResourceLoader.exists("res://assets/art/stage.png"):
		var sp := Sprite2D.new()
		sp.texture = load("res://assets/art/stage.png")
		sp.centered = false
		sp.position = Vector2.ZERO
		var sc := 1280.0 / sp.texture.get_width()
		sp.scale = Vector2(sc, sc)
		add_child(sp)
	else:
		add_child(StageDrawer.new())


func _spawn_player() -> void:
	player = Fighter.new()
	var kind: int = save.selected
	var def: Dictionary = Fighter.FIGHTER_DEFS.get(kind, Fighter.FIGHTER_DEFS[0])
	var nm := str(def["name"])
	player.setup(kind, false, nm, save.get_skin(kind))
	player.fight = self
	player.position = Vector2(430, GROUND_Y)
	player._ground_y = GROUND_Y
	player.facing = 1
	player.max_hp = 100.0 + save.tough_bonus()
	player.hp = player.max_hp
	player.dmg_mult = 1.0 + save.up_power * 0.12
	player.toughness = player.toughness + save.up_tough * 0.04
	add_child(player)


func _enemy_spec(w: int) -> Dictionary:
	if w % 5 == 0:
		return {"name": "BIG MO", "kind": Fighter.KIND_ROOK, "boss": true,
			"hp": 100.0 + w * 24.0, "dmg": 1.0 + w * 0.05, "speed": 0.85, "scale": 1.32,
			"tint": Color(1.0, 0.85, 0.85), "tough": 1.7}
	var cycle: String = ["PUNK", "BRUISER", "THUG"][(w - 1) % 3]
	match cycle:
		"PUNK":
			return {"name": "PUNK", "kind": Fighter.KIND_VEX, "boss": false,
				"hp": 30.0 + w * 8.0, "dmg": 0.85 + w * 0.04, "speed": 1.25, "scale": 0.95,
				"tint": Color(1.0, 0.9, 1.0), "tough": 0.8}
		"BRUISER":
			return {"name": "BRUISER", "kind": Fighter.KIND_ROOK, "boss": false,
				"hp": 48.0 + w * 11.0, "dmg": 1.15 + w * 0.05, "speed": 0.9, "scale": 1.12,
				"tint": Color(0.9, 1.0, 0.9), "tough": 1.3}
		_:
			return {"name": "THUG", "kind": Fighter.KIND_VEX if w % 2 == 0 else Fighter.KIND_ROOK, "boss": false,
				"hp": 38.0 + w * 9.0, "dmg": 1.0 + w * 0.045, "speed": 1.05, "scale": 1.0,
				"tint": Color(0.95, 0.95, 1.0), "tough": 1.0}


func _next_wave() -> void:
	wave += 1
	phase = "banner"
	phase_t = 0.0
	ai_aggro = minf(1.7, 0.7 + wave * 0.09)
	ai_block_chance = minf(0.45, 0.08 + wave * 0.03)
	var spec: Dictionary = _enemy_spec(wave)
	var is_boss: bool = spec["boss"]
	_show_banner(("BOSS: " if is_boss else "WAVE ") + str(wave) + ("  —  " + spec["name"] if is_boss else ""),
		Color("e63946") if is_boss else Color("ffd166"))
	if is_boss:
		sfx.play("counter_ding")
	else:
		sfx.play("countdown_beep", 0.8 + wave * 0.02)


func _spawn_enemy() -> void:
	# clear the previous wave's corpse (it got its 1.3s of glory)
	if enemy:
		enemy.queue_free()
		enemy = null
	var spec: Dictionary = _enemy_spec(wave)
	enemy = Fighter.new()
	enemy.setup(spec["kind"], true, spec["name"])
	enemy.fight = self
	enemy.position = Vector2(1420, GROUND_Y)
	enemy._ground_y = GROUND_Y
	enemy.facing = -1
	enemy.max_hp = spec["hp"]
	enemy.hp = enemy.max_hp
	enemy.dmg_mult = spec["dmg"]
	enemy.speed_mult = spec["speed"]
	enemy.toughness = spec["tough"]
	enemy.body_scale = spec["scale"]
	enemy.body_scale = spec["scale"]
	enemy.modulate = spec["tint"]
	enemy.walk_target_x = player.position.x + 300.0
	enemy.state = "walkin"
	enemy.ai_mode = "approach"
	add_child(enemy)
	phase = "fight"
	_update_enemy_hud()


func _process(delta: float) -> void:
	if game_over:
		return
	run_time += delta
	phase_t += delta

	# combo decay
	if combo > 0:
		combo_t -= delta
		if combo_t <= 0.0:
			combo = 0
			combo_label.visible = false

	match phase:
		"banner":
			if phase_t > 1.4:
				_spawn_enemy()
		"waveclear":
			if phase_t > 1.3:
				_next_wave()
		"gameover":
			if phase_t > 2.6:
				game_over = true
				main.show_result(_run_stats())

	# face the enemy
	if player and not player.dead and enemy and not enemy.dead:
		player.facing = 1 if enemy.position.x >= player.position.x else -1
		if enemy.state not in ["walkin"]:
			enemy.facing = 1 if player.position.x >= enemy.position.x else -1

	# autotest driver: mash buttons like an excited player
	if autotest and phase == "fight" and not player.dead:
		_test_t -= delta
		if _test_t <= 0.0:
			_test_t = randf_range(0.25, 0.6)
			var r := randf()
			if player.meter >= 100.0:
				_do_special()
			elif r < 0.55:
				_do_tap()
			elif r < 0.8:
				_do_heavy()
			else:
				_do_launcher()
	if autotest and Engine.get_physics_frames() % 600 == 0:
		print("[AUTOTEST] wave=", wave, " phase=", phase, " kills=", kills,
			" cash=", cash_run, " player_hp=", int(player.hp),
			" enemy=", enemy.disp_name if enemy else "none",
			" enemy_hp=", int(enemy.hp) if enemy else -1,
			" combo_max=", max_combo)
	# stall detector: snapshot key state, report if frozen
	if autotest:
		_stall_frames += 1
		if _stall_frames >= 1200:
			_stall_frames = 0
			var snap := str(wave) + "|" + phase + "|" + str(kills) + "|" + str(int(player.hp)) + "|" + str(int(enemy.hp) if enemy else -1)
			if snap == _stall_snap:
				print("[STALL] player state=", player.state, " pos=", player.position,
					" enemy state=", enemy.state if enemy else "none",
					" ai_mode=", enemy.ai_mode if enemy else "none",
					" epos=", enemy.position if enemy else Vector2.ZERO,
					" time_scale=", Engine.time_scale)
			_stall_snap = snap
		# visual verification snapshots (rendered runs only)
		var fr := Engine.get_physics_frames()
		if fr == 400:
			if DisplayServer.get_name() != "headless":
				var img := get_viewport().get_texture().get_image()
				var err := img.save_png("/tmp/sb_tex_400.png")
				print("[SNAP] frame ", fr, " err=", err)

	_update_hud()


# --------------------------------------------------------------- input ----

func _input(event: InputEvent) -> void:
	if game_over or phase == "gameover":
		return
	if event is InputEventScreenTouch:
		var t := event as InputEventScreenTouch
		if t.pressed:
			_touches[t.index] = {"pos": t.position, "start": t.position,
				"time": Time.get_ticks_msec() / 1000.0, "held_block": false}
			# two-finger tap = special
			if _touches.size() == 2 and player.meter >= 100.0 and not _special_used_this_touch:
				_special_used_this_touch = true
				_do_special()
		else:
			if _touches.has(t.index):
				var d: Dictionary = _touches[t.index]
				_release_touch(d, t.position)
				_touches.erase(t.index)
			if _touches.is_empty():
				_special_used_this_touch = false
			player.stop_block()
	elif event is InputEventScreenDrag:
		var dr := event as InputEventScreenDrag
		if _touches.has(dr.index):
			var d2: Dictionary = _touches[dr.index]
			d2["pos"] = dr.position
			# hold-to-block
			var held: float = Time.get_ticks_msec() / 1000.0 - float(d2["time"])
			var moved: float = (dr.position - d2["start"]).length()
			if held > 0.32 and moved < 30.0 and not bool(d2["held_block"]):
				d2["held_block"] = true
				player.start_block()
				sfx.play("block_clack", 1.4, -8.0)


func _release_touch(d: Dictionary, end_pos: Vector2) -> void:
	if bool(d["held_block"]):
		return
	var dt: float = Time.get_ticks_msec() / 1000.0 - float(d["time"])
	var swipe: Vector2 = end_pos - d["start"]
	if dt < 0.32 and swipe.length() < 42.0:
		_do_tap()
	elif swipe.length() > 85.0:
		if absf(swipe.x) > absf(swipe.y):
			_do_heavy()
		elif swipe.y < -85.0:
			_do_launcher()
		# swipe down: nothing (kept simple on purpose)


func _do_tap() -> void:
	if player.dead or phase != "fight":
		return
	if enemy and enemy.state == "launched" and absf(enemy.position.x - player.position.x) < 200.0:
		player.start_attack("air")
	else:
		player.start_attack("jab")


func _do_heavy() -> void:
	if player.dead or phase != "fight":
		return
	player.start_attack("heavy")


func _do_launcher() -> void:
	if player.dead or phase != "fight":
		return
	player.start_attack("launcher")


func _do_special() -> void:
	if player.dead or phase != "fight":
		return
	if player.start_attack("special"):
		Juice.popup(self, "SPECIAL!", player.position + Vector2(-60, -420), Color("ffd166"), 64)
		sfx.play("go", 0.7)


# -------------------------------------------------------------- combat ----

func _opponent_of(a: Fighter) -> Fighter:
	return enemy if a == player else player


func try_hit(attacker: Fighter, mv: Dictionary) -> void:
	var victim := _opponent_of(attacker)
	if victim == null or victim.dead:
		# whiff
		sfx.play("whiff", 1.0, -6.0)
		_check_nearmiss(attacker, victim, mv)
		return
	var dist := absf(victim.position.x - attacker.position.x)
	var reach: float = mv["range"] * (attacker.scale.x if attacker.scale.x > 0 else -attacker.scale.x)
	if dist <= reach:
		victim.take_hit(mv, attacker)
		if attacker == player:
			player.add_meter(float(mv["meter"]) * (1.0 + save.up_hustle * 0.15))
	else:
		sfx.play("whiff", 1.0, -6.0)
		_check_nearmiss(attacker, victim, mv)


func _check_nearmiss(attacker: Fighter, victim: Fighter, mv: Dictionary) -> void:
	# Heavy whiffed close to the player -> near-miss excitement + meter
	if victim == null or victim != player or player.dead:
		return
	if str(mv.get("sfx", "")) != "kick_whoosh":
		return
	var dist := absf(victim.position.x - attacker.position.x)
	if dist < 260.0:
		Juice.popup(self, "CLOSE!", player.position + Vector2(-40, -380), Color("80ed99"), 52)
		player.add_meter(12.0)
		sfx.play("counter_ding", 1.5, -6.0)


func on_hit_landed(victim: Fighter, attacker: Fighter, mv: Dictionary, dmg: float) -> void:
	sfx.play(str(mv["sfx"]), 1.0)
	juice.hit_stop(float(mv["hitstop"]))
	juice.add_shake(float(mv["shake"]))
	# damage number
	var col := Color("ffffff") if attacker == player else Color("ff8fa3")
	Juice.popup(self, str(int(dmg)), victim.position + Vector2(randf_range(-30, 30), -360), col, 40, 70.0, 0.7)
	if attacker == player:
		combo += 1
		combo_t = 1.4
		max_combo = maxi(max_combo, combo)
		if combo >= 2:
			combo_label.visible = true
			combo_label.text = str(combo) + " HITS!"
			combo_label.scale = Vector2(1.35, 1.35)
			var tw := create_tween()
			tw.tween_property(combo_label, "scale", Vector2.ONE, 0.15)
		if combo > 0 and combo % 10 == 0:
			Juice.popup(self, str(combo) + " HIT COMBO!", Vector2(500, 260), Color("ffd166"), 60)
			sfx.play("counter_ding", 1.2)
	else:
		player.add_meter(6.0 * (1.0 + save.up_hustle * 0.15))
		combo = 0
		combo_label.visible = false


func on_blocked(defender: Fighter, attacker: Fighter, chip: float) -> void:
	sfx.play("block_clack")
	Juice.popup(self, "BLOCK", defender.position + Vector2(-40, -360), Color("a8dadc"), 36, 60.0, 0.6)


func on_counter(victim: Fighter, attacker: Fighter, dmg: float) -> void:
	# victim was telegraphing and got hit -> attacker scores a counter
	_big_text("COUNTER!", Color("ffd166"), 96)
	sfx.play("counter_ding")
	juice.add_shake(0.5)
	if attacker == player:
		player.add_meter(15.0)


func on_land(f: Fighter) -> void:
	juice.add_shake(0.25)
	sfx.play("punch_thump", 0.6, -10.0)


func on_walkin_done(f: Fighter) -> void:
	pass


func on_ko(victim: Fighter, attacker: Fighter) -> void:
	sfx.play("ko_bell")
	juice.slow_mo(0.25, 1.1)
	juice.add_shake(1.0)
	_big_text("K.O.!", Color("e63946"), 150)
	if victim == player:
		phase = "gameover"
		phase_t = 0.0
		sfx.play("hurt", 0.7)
	else:
		kills += 1
		phase = "waveclear"
		phase_t = 0.0
		player.state = "win"
		player.state_t = 0.0
		sfx.play("cheer", 1.0, -4.0)
		# --- cash reward (staggered popups = variable reward timing) ---
		var spec: Dictionary = _enemy_spec(wave)
		var base: int = (40 + wave * 3) if spec["boss"] else (8 + wave * 2)
		var combo_bonus := mini(combo, 20)
		_award_cash(base, victim.position)
		if combo_bonus >= 5:
			_award_cash(combo_bonus, victim.position + Vector2(0, -60), "COMBO")
		if LootRng.lucky_hit(0.12):
			var lucky := LootRng.lucky_amount(wave)
			_award_cash(lucky, victim.position + Vector2(0, -120), "LUCKY!")
		# heal a little so runs keep rolling
		player.heal(player.max_hp * 0.12)
		Juice.popup(self, "+HP", player.position + Vector2(-30, -400), Color("80ed99"), 40)
		combo = 0
		combo_label.visible = false


func _award_cash(amount: int, pos: Vector2, tag: String = "") -> void:
	cash_run += amount
	var txt := "+$" + str(amount) if tag == "" else tag + " +$" + str(amount)
	var col := Color("ffd166") if tag == "" else Color("80ed99")
	# stagger: each popup delayed a touch for slot-machine feel
	var t := create_tween()
	t.tween_interval(randf_range(0.0, 0.35))
	t.tween_callback(func() -> void:
		Juice.popup(self, txt, pos + Vector2(randf_range(-40, 40), 0), col, 44)
		sfx.play("cash_blip", randf_range(0.95, 1.15)))


func _run_stats() -> Dictionary:
	return {"cash": cash_run, "kills": kills, "wave": wave, "max_combo": max_combo,
		"time": run_time, "won": false}


# ----------------------------------------------------------------- HUD ----

func _mk_label(text: String, size: int, color: Color) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.add_theme_color_override("font_outline_color", Color(0.08, 0.07, 0.12))
	l.add_theme_constant_override("outline_size", 6)
	return l


func _mk_bar(w: float, fill: Color) -> ProgressBar:
	var b := ProgressBar.new()
	b.min_value = 0
	b.max_value = 100
	b.value = 100
	b.custom_minimum_size = Vector2(w, 26)
	b.show_percentage = false
	var bg := StyleBoxFlat.new()
	bg.bg_color = Color(0.08, 0.07, 0.12, 0.85)
	bg.set_corner_radius_all(8)
	var fg := StyleBoxFlat.new()
	fg.bg_color = fill
	fg.set_corner_radius_all(8)
	b.add_theme_stylebox_override("background", bg)
	b.add_theme_stylebox_override("fill", fg)
	return b


func _build_hud() -> void:
	hud = CanvasLayer.new()
	add_child(hud)
	# player hp
	var pl := _mk_label(player.disp_name, 28, Color.WHITE)
	pl.position = Vector2(24, 14)
	hud.add_child(pl)
	hp_player = _mk_bar(340, Color("2ec4b6"))
	hp_player.position = Vector2(24, 48)
	hud.add_child(hp_player)
	# enemy hp
	hp_enemy_name = _mk_label("", 28, Color("ffb3c1"))
	hp_enemy_name.position = Vector2(916, 14)
	hp_enemy_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	hp_enemy_name.custom_minimum_size = Vector2(340, 34)
	hud.add_child(hp_enemy_name)
	hp_enemy = _mk_bar(340, Color("e63946"))
	hp_enemy.position = Vector2(916, 48)
	hud.add_child(hp_enemy)
	# wave
	wave_label = _mk_label("WAVE 1", 34, Color.WHITE)
	wave_label.position = Vector2(590, 12)
	hud.add_child(wave_label)
	# cash
	cash_label = _mk_label("$0", 34, Color("ffd166"))
	cash_label.position = Vector2(1090, 84)
	hud.add_child(cash_label)
	# meter
	var ml := _mk_label("SPECIAL", 22, Color("ffd166"))
	ml.position = Vector2(490, 648)
	hud.add_child(ml)
	meter_bar = _mk_bar(300, Color("ffd166"))
	meter_bar.position = Vector2(490, 672)
	hud.add_child(meter_bar)
	# combo
	combo_label = _mk_label("", 54, Color("ffd166"))
	combo_label.position = Vector2(950, 200)
	combo_label.visible = false
	hud.add_child(combo_label)
	# hint
	hint_label = _mk_label("TAP = PUNCH   SWIPE = HEAVY   SWIPE UP = LAUNCH   HOLD = BLOCK   2 FINGERS = SPECIAL", 24, Color(1, 1, 1, 0.85))
	hint_label.position = Vector2(180, 610)
	hud.add_child(hint_label)
	# big banner
	banner_label = _mk_label("", 110, Color.WHITE)
	banner_label.position = Vector2(340, 250)
	banner_label.visible = false
	hud.add_child(banner_label)
	# special button
	special_btn = Button.new()
	special_btn.text = "SPECIAL"
	special_btn.add_theme_font_size_override("font_size", 30)
	special_btn.position = Vector2(1050, 560)
	special_btn.custom_minimum_size = Vector2(200, 90)
	special_btn.visible = false
	special_btn.pressed.connect(_do_special)
	hud.add_child(special_btn)


func _show_banner(text: String, color: Color) -> void:
	banner_label.text = text
	banner_label.add_theme_color_override("font_color", color)
	banner_label.visible = true
	banner_label.modulate.a = 0.0
	banner_label.scale = Vector2(0.6, 0.6)
	var tw := create_tween().set_parallel(true)
	tw.tween_property(banner_label, "modulate:a", 1.0, 0.2)
	tw.tween_property(banner_label, "scale", Vector2(1.05, 1.05), 0.35).set_trans(Tween.TRANS_BACK)
	tw.chain().tween_interval(0.7)
	tw.tween_property(banner_label, "modulate:a", 0.0, 0.3)


func _update_enemy_hud() -> void:
	if enemy:
		hp_enemy_name.text = enemy.disp_name
		hp_enemy.max_value = enemy.max_hp
		hp_enemy.value = enemy.hp


func _update_hud() -> void:
	hp_player.max_value = player.max_hp
	hp_player.value = player.hp
	if enemy:
		hp_enemy.max_value = enemy.max_hp
		hp_enemy.value = enemy.hp
		if hp_enemy_name.text == "":
			_update_enemy_hud()
	wave_label.text = "WAVE " + str(wave)
	cash_label.text = "$" + str(cash_run)
	meter_bar.max_value = 100
	meter_bar.value = player.meter
	special_btn.visible = player.meter >= 100.0 and not player.dead and phase == "fight"
	if wave >= 3 and hint_label.modulate.a > 0.0:
		hint_label.modulate.a = maxf(0.0, hint_label.modulate.a - 0.005)


# --------------------------------------------------------------- stage ----

class StageDrawer:
	extends Node2D

	func _draw() -> void:
		# sky
		for i in 12:
			var t := i / 12.0
			var c := Color(0.35, 0.65, 0.95).lerp(Color(0.75, 0.9, 1.0), t)
			draw_rect(Rect2(0, i * 40, 1280, 42), c)
		# sun
		draw_circle(Vector2(1080, 110), 62, Color(1, 0.95, 0.6))
		draw_circle(Vector2(1080, 110), 52, Color(1, 0.98, 0.75))
		# clouds
		for cx in [220, 560, 880]:
			for o in [Vector2(-50, 0), Vector2(0, -18), Vector2(50, 0)]:
				draw_circle(Vector2(cx, 120) + o, 34, Color(1, 1, 1, 0.9))
		# distant skyline
		var rng := RandomNumberGenerator.new()
		rng.seed = 7
		var x := 0.0
		while x < 1280.0:
			var bw := rng.randf_range(70, 130)
			var bh := rng.randf_range(90, 210)
			draw_rect(Rect2(x, 430 - bh, bw, bh), Color(0.55, 0.6, 0.72))
			x += bw + rng.randf_range(4, 20)
		# brick building wall
		draw_rect(Rect2(0, 300, 1280, 180), Color(0.72, 0.42, 0.35))
		for ry in range(300, 480, 24):
			for rx in range(0, 1280, 64):
				var off := 32 if (ry / 24) % 2 == 0 else 0
				draw_rect(Rect2(rx + off + 1, ry + 1, 62, 22), Color(0.66, 0.38, 0.31))
		# graffiti tag
		var font := ThemeDB.fallback_font
		draw_string(font, Vector2(400, 420), "CONCRETE DRAGON", HORIZONTAL_ALIGNMENT_LEFT, -1, 96, Color(0.16, 0.14, 0.18))
		draw_string(font, Vector2(406, 414), "CONCRETE DRAGON", HORIZONTAL_ALIGNMENT_LEFT, -1, 96, Color(1, 0.85, 0.4))
		# string lights
		for i in range(0, 1280, 80):
			var lx := float(i)
			var ly := 300.0 - sin(lx / 1280.0 * PI) * 40.0
			draw_line(Vector2(lx, 290), Vector2(lx + 80, 290), Color(0.2, 0.18, 0.2), 3.0)
			var bulb := Color(1, 0.9, 0.5) if (i / 80) % 2 == 0 else Color(1, 0.6, 0.6)
			draw_circle(Vector2(lx + 40, ly + 14), 9, bulb)
		# sidewalk
		draw_rect(Rect2(0, 480, 1280, 60), Color(0.62, 0.62, 0.65))
		draw_rect(Rect2(0, 480, 1280, 8), Color(0.55, 0.55, 0.58))
		# road
		draw_rect(Rect2(0, 540, 1280, 180), Color(0.25, 0.25, 0.28))
		for dx in range(0, 1280, 90):
			draw_rect(Rect2(dx, 626, 46, 10), Color(0.95, 0.85, 0.4))
		# fight line glow
		draw_rect(Rect2(0, 596, 1280, 5), Color(1, 0.85, 0.4, 0.7))
