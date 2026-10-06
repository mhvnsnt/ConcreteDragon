class_name Fighter
extends Node2D
## Paper-doll street fighter. Procedural cute art by default (Part nodes draw
## themselves); set use_textures=true + textures dict to use real PNGs later.
## Origin = feet. Faces +x when facing==1.

signal died(f: Fighter)

const KIND_ROOK := 0
const KIND_VEX := 1

const MOVES := {
	"jab":      {"startup": 0.07, "active": 0.10, "recover": 0.16, "range": 165.0, "dmg": 6.0,  "kb": 130.0, "launch": 0.0,   "hitstop": 0.06, "shake": 0.22, "sfx": "punch_thump",    "meter": 8.0,  "height": "mid"},
	"heavy":    {"startup": 0.26, "active": 0.12, "recover": 0.34, "range": 185.0, "dmg": 13.0, "kb": 340.0, "launch": 0.0,   "hitstop": 0.10, "shake": 0.45, "sfx": "kick_whoosh",    "meter": 12.0, "telegraph": 0.45, "height": "low"},
	"launcher": {"startup": 0.16, "active": 0.12, "recover": 0.30, "range": 165.0, "dmg": 8.0,  "kb": 90.0,  "launch": 640.0, "hitstop": 0.09, "shake": 0.35, "sfx": "launcher_whoosh", "meter": 10.0, "height": "high"},
	"air":      {"startup": 0.04, "active": 0.12, "recover": 0.14, "range": 170.0, "dmg": 5.0,  "kb": 70.0,  "launch": 400.0, "hitstop": 0.05, "shake": 0.18, "sfx": "punch2",         "meter": 7.0,  "height": "mid"},
	"special":  {"startup": 0.22, "active": 0.22, "recover": 0.40, "range": 240.0, "dmg": 26.0, "kb": 560.0, "launch": 320.0, "hitstop": 0.16, "shake": 0.75, "sfx": "launcher_whoosh", "meter": 0.0,  "height": "high"},
}

const PALETTES := {
	0: {"skin": Color("f2b880"), "hair": Color("26232b"), "top": Color("1d3557"),
		"shorts": Color("1d3557"), "glove": Color("e63946"), "shoe": Color("e63946"),
		"accent": Color("e63946"), "line": Color("26232b")},
	1: {"skin": Color("c98d5e"), "hair": Color("2ec4b6"), "top": Color("7b2ff7"),
		"shorts": Color("26232e"), "glove": Color("2ec4b6"), "shoe": Color("2ec4b6"),
		"accent": Color("2ec4b6"), "line": Color("26232b")},
}

var kind := KIND_ROOK
var is_ai := false
var disp_name := "ROOK"
var facing := 1
var use_textures := false
var textures := {}
var skin_dir := ""  # art subdir actually loaded (base or selected skin)
var bt_brain = null  # optional behavior-tree brain (scripts/ai/); if set, _ai_update delegates to it

var max_hp := 100.0
var hp := 100.0
var meter := 0.0
var dmg_mult := 1.0
var speed_mult := 1.0

var state := "idle"
var state_t := 0.0
var vel := Vector2.ZERO
var grounded := true
var blocking := false
var attacking := false
var telegraphing := false
var dead := false
var attack_hit_done := false
var current_move := ""
var air_hits := 0  # juggle counter on the victim side

var walk_target_x := 0.0
var ai_think := 0.0
var ai_mode := "walkin"  # walkin, approach, retreat, hold
var _bounced := false  # ground-bounce used up for this launch

var J := {}        # joint nodes
var Parts := {}    # part draw nodes (Part procedural or Sprite2D textured)
var pose_cur := {}
var jvel := {}     # per-joint angular/positional velocity (spring-damper ragdoll layer)
var toughness := 1.0  # "chin strength": scales reaction impulse (higher = eats hits)
var tex_mode := false
var tex_scale := 0.5
var hips_base_y := -195.0
var flash := 0.0
var squash := Vector2.ONE
var body_scale := 1.0  # per-fighter size (bosses bigger)

var fight: Node = null  # set by FightScreen


func setup(p_kind: int, p_is_ai: bool, p_name: String) -> void:
	kind = p_kind
	is_ai = p_is_ai
	disp_name = p_name
	tex_mode = _try_load_textures()
	if tex_mode:
		_build_tex_rig()
	else:
		_build_rig()
	_reset_pose()


func _try_load_textures() -> bool:
	var sub := "rook" if kind == KIND_ROOK else "vex"
	var pj_path := "res://assets/art/pivots.json"
	if not ResourceLoader.exists(pj_path):
		return false
	var pj: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(pj_path))
	if pj == null or not pj.has(sub):
		return false
	var piv: Dictionary = pj[sub]
	var names := ["head", "torso", "arm_u", "arm_f", "leg_t", "leg_s"]
	for n in names:
		var tp := "res://assets/art/%s/%s.png" % [sub, n]
		if not ResourceLoader.exists(tp):
			return false
		tex_parts[n] = load(tp)
		tex_pivots[n] = piv[n + ".png"]
	return true


var tex_parts := {}
var tex_pivots := {}


func _tex_sprite(part_name: String) -> Sprite2D:
	var sp := Sprite2D.new()
	sp.texture = tex_parts[part_name]
	sp.centered = false
	var pv: Array = tex_pivots[part_name]
	sp.position = -Vector2(float(pv[0]) * 256.0, float(pv[1]) * 256.0) * tex_scale
	sp.scale = Vector2(tex_scale, tex_scale)
	return sp


func _tex_hang(part_name: String) -> float:
	# distance from pivot to far (bottom) end, in local px
	var pv: Array = tex_pivots[part_name]
	return (1.0 - float(pv[1])) * 256.0 * tex_scale


func _build_tex_rig() -> void:
	var s := tex_scale
	var thigh_hang := _tex_hang("leg_t")
	var shin_hang := _tex_hang("leg_s")
	var armu_hang := _tex_hang("arm_u")
	var armf_hang := _tex_hang("arm_f")
	var torso_hang := _tex_hang("torso")
	hips_base_y = -(thigh_hang + shin_hang)
	var hips := Node2D.new()
	hips.position = Vector2(0, hips_base_y)
	add_child(hips)
	J["hips"] = hips
	var chest := Node2D.new()
	chest.position = Vector2(0, -torso_hang)
	hips.add_child(chest)
	J["chest"] = chest
	var torso := _tex_sprite("torso")
	torso.z_index = 0
	chest.add_child(torso)
	Parts["torso"] = torso
	var head := _tex_sprite("head")
	head.z_index = 2
	head.position += Vector2(0, -10 * s)
	chest.add_child(head)
	Parts["head"] = head
	J["head"] = head
	for side in ["F", "B"]:
		var sx := 16.0 if side == "F" else -16.0
		var sh := Node2D.new()
		sh.position = Vector2(sx, -torso_hang * 0.10)
		chest.add_child(sh)
		J["sh" + side] = sh
		var ua := _tex_sprite("arm_u")
		ua.z_index = 2 if side == "F" else -2
		sh.add_child(ua)
		Parts["arm_u" + side] = ua
		var elb := Node2D.new()
		elb.position = Vector2(0, armu_hang)
		sh.add_child(elb)
		J["elb" + side] = elb
		var fa := _tex_sprite("arm_f")
		fa.z_index = 3 if side == "F" else -1
		elb.add_child(fa)
		Parts["arm_f" + side] = fa
	for side in ["F", "B"]:
		var sx2 := 15.0 if side == "F" else -15.0
		var hip := Node2D.new()
		hip.position = Vector2(sx2, 4)
		hips.add_child(hip)
		J["hip" + side] = hip
		var th := _tex_sprite("leg_t")
		th.z_index = -1 if side == "F" else -3
		hip.add_child(th)
		Parts["leg_t" + side] = th
		var knee := Node2D.new()
		knee.position = Vector2(0, thigh_hang)
		hip.add_child(knee)
		J["knee" + side] = knee
		var sn := _tex_sprite("leg_s")
		sn.z_index = -1 if side == "F" else -3
		knee.add_child(sn)
		Parts["leg_s" + side] = sn


# ---------------------------------------------------------------- rig ----

func _part(p_kind_name: String) -> Node2D:
	var p := Part.new()
	p.part_kind = p_kind_name
	p.palette = PALETTES[kind]
	p.fighter_kind = kind
	return p


func _build_rig() -> void:
	var pal: Dictionary = PALETTES[kind]
	# Hips root
	var hips := Node2D.new()
	hips.position = Vector2(0, -195)
	add_child(hips)
	J["hips"] = hips
	# Torso (draws upward from hips)
	var torso := _part("torso")
	torso.z_index = 0
	hips.add_child(torso)
	Parts["torso"] = torso
	# Chest = shoulders + head anchor
	var chest := Node2D.new()
	chest.position = Vector2(0, -120)
	hips.add_child(chest)
	J["chest"] = chest
	var head := _part("head")
	head.z_index = 2
	chest.add_child(head)
	Parts["head"] = head
	J["head"] = head
	# Arms
	for side in ["F", "B"]:
		var sx := 16.0 if side == "F" else -16.0
		var sh := Node2D.new()
		sh.position = Vector2(sx, -8)
		chest.add_child(sh)
		J["sh" + side] = sh
		var ua := _part("arm_u")
		ua.z_index = 2 if side == "F" else -2
		sh.add_child(ua)
		var elb := Node2D.new()
		elb.position = Vector2(0, 82)
		sh.add_child(elb)
		J["elb" + side] = elb
		var fa := _part("arm_f")
		fa.z_index = 3 if side == "F" else -1
		elb.add_child(fa)
	# Legs
	for side in ["F", "B"]:
		var sx2 := 15.0 if side == "F" else -15.0
		var hip := Node2D.new()
		hip.position = Vector2(sx2, 6)
		hips.add_child(hip)
		J["hip" + side] = hip
		var th := _part("leg_t")
		th.z_index = -1 if side == "F" else -3
		hip.add_child(th)
		var knee := Node2D.new()
		knee.position = Vector2(0, 96)
		hip.add_child(knee)
		J["knee" + side] = knee
		var sn := _part("leg_s")
		sn.z_index = -1 if side == "F" else -3
		knee.add_child(sn)


func _joint_names() -> Array:
	return ["hips_y", "hips_rot", "chest", "head", "shF", "elbF", "shB", "elbB",
		"hipF", "kneeF", "hipB", "kneeB", "body_rot", "body_y"]


func _reset_pose() -> void:
	for n in _joint_names():
		pose_cur[n] = 0.0
		jvel[n] = 0.0


## Spring-damper joint integration (active-ragdoll layer).
## Joints chase the animated pose target on springs; hits inject velocity.
## Low stiffness = floppy/flail (hit, launched, KO); high = snappy strikes.
## Attacker is always at local +x (front), so impulse signs are facing-agnostic.
func _apply_pose(p: Dictionary, stiff: float, damp: float, dt: float) -> void:
	for n in _joint_names():
		var target: float = p.get(n, 0.0)
		var x: float = pose_cur.get(n, 0.0)
		var v: float = jvel.get(n, 0.0)
		var force := -stiff * (x - target) - damp * v
		v += force * dt
		x += v * dt
		pose_cur[n] = x
		jvel[n] = v


func _jimp(joint: String, amount: float) -> void:
	jvel[joint] = float(jvel.get(joint, 0.0)) + amount


## Physics-driven hit reaction. impulse scales with impact; placement picks
## which joints eat it; toughness ("chin") shrugs part of it off. Randomized
## follow-through means no two knockdowns are ever identical.
func apply_impact(impulse: float, height: String) -> void:
	var hmult := 1.0
	if height == "high":
		hmult = 1.5
	elif height == "low":
		hmult = 0.7
	# head/chin snap (high hits whip the head hardest)
	_jimp("head", -impulse * 0.55 * hmult)
	_jimp("chest", -impulse * 0.32 * hmult)
	# arms windmill
	_jimp("shF", impulse * randf_range(0.4, 1.1))
	_jimp("shB", -impulse * randf_range(0.3, 0.9))
	_jimp("elbF", impulse * randf_range(0.2, 0.7))
	if height == "low":
		# legs buckle: hips drop, knees give
		_jimp("hips_y", impulse * 16.0)
		_jimp("hipF", impulse * 0.45)
		_jimp("kneeF", -impulse * 0.6)
		_jimp("kneeB", -impulse * 0.4)
	else:
		_jimp("hips_rot", -impulse * 0.10)
		_jimp("hips_y", impulse * 6.0)
	# occasional wild back-arm flail (the money detail)
	if randf() < 0.35:
		_jimp("shB", impulse * randf_range(0.8, 1.6))


func _push_joints() -> void:
	(J["hips"] as Node2D).position.y = hips_base_y + float(pose_cur["hips_y"])
	(J["hips"] as Node2D).rotation = float(pose_cur["hips_rot"])
	(J["chest"] as Node2D).rotation = float(pose_cur["chest"])
	(J["head"] as Node2D).rotation = float(pose_cur["head"])
	(J["shF"] as Node2D).rotation = float(pose_cur["shF"])
	(J["elbF"] as Node2D).rotation = float(pose_cur["elbF"])
	(J["shB"] as Node2D).rotation = float(pose_cur["shB"])
	(J["elbB"] as Node2D).rotation = float(pose_cur["elbB"])
	(J["hipF"] as Node2D).rotation = float(pose_cur["hipF"])
	(J["kneeF"] as Node2D).rotation = float(pose_cur["kneeF"])
	(J["hipB"] as Node2D).rotation = float(pose_cur["hipB"])
	(J["kneeB"] as Node2D).rotation = float(pose_cur["kneeB"])
	rotation = float(pose_cur["body_rot"])
	position.y = _ground_y + float(pose_cur["body_y"])
	scale = Vector2(facing * squash.x * body_scale, squash.y * body_scale)


var _ground_y := 0.0


# --------------------------------------------------------------- poses ----

func _pose_idle(t: float) -> Dictionary:
	var b: float = sin(t * 7.0) * 7.0
	var sway := sin(t * 3.1) * 0.05
	return {"hips_y": b, "hips_rot": 0.0, "chest": 0.08 + sway, "head": -0.05,
		"shF": -0.55 + sin(t * 7.0 + 1.0) * 0.06, "elbF": -1.25, "shB": -0.35, "elbB": -1.45,
		"hipF": -0.12, "kneeF": 0.18, "hipB": 0.14, "kneeB": 0.22,
		"body_rot": 0.0, "body_y": 0.0}


func _pose_walk(t: float) -> Dictionary:
	var s := sin(t * 11.0)
	var c := cos(t * 11.0)
	return {"hips_y": -abs(s) * 10.0, "hips_rot": s * 0.06, "chest": 0.12, "head": -0.06,
		"shF": -0.55 + c * 0.35, "elbF": -1.1, "shB": -0.35 - c * 0.35, "elbB": -1.3,
		"hipF": s * 0.55, "kneeF": maxf(0.1, -c * 0.7), "hipB": -s * 0.55, "kneeB": maxf(0.1, c * 0.7),
		"body_rot": 0.0, "body_y": 0.0}


func _pose_punch(ph: float) -> Dictionary:
	# ph 0..1 through the strike
	var ext := sin(ph * PI)
	return {"hips_y": -6.0, "hips_rot": -0.1 * ext, "chest": 0.28 * ext, "head": 0.0,
		"shF": lerpf(-0.55, -1.65, ext), "elbF": lerpf(-1.25, -0.08, ext),
		"shB": -0.3, "elbB": -1.5,
		"hipF": -0.2, "kneeF": 0.25, "hipB": 0.2, "kneeB": 0.3,
		"body_rot": 0.0, "body_y": 0.0}


func _pose_heavy(ph: float) -> Dictionary:
	var ext := sin(ph * PI)
	return {"hips_y": -4.0, "hips_rot": 0.12 * ext, "chest": -0.22 * ext, "head": -0.1,
		"shF": -0.4 - 0.5 * ext, "elbF": -0.9, "shB": -0.5 + 0.4 * ext, "elbB": -1.1,
		"hipF": lerpf(-0.12, -1.75, ext), "kneeF": lerpf(0.18, -0.15, ext),
		"hipB": 0.1, "kneeB": 0.35,
		"body_rot": 0.0, "body_y": 0.0}


func _pose_launcher(ph: float) -> Dictionary:
	var ext := sin(ph * PI)
	return {"hips_y": -14.0 * ext, "hips_rot": -0.12 * ext, "chest": -0.3 * ext, "head": -0.25 * ext,
		"shF": lerpf(0.5, -2.4, ext), "elbF": lerpf(-0.4, -0.15, ext),
		"shB": -0.4, "elbB": -1.4,
		"hipF": -0.3, "kneeF": 0.5, "hipB": 0.15, "kneeB": 0.3,
		"body_rot": 0.0, "body_y": 0.0}


func _pose_block() -> Dictionary:
	return {"hips_y": 16.0, "hips_rot": 0.0, "chest": 0.05, "head": -0.08,
		"shF": -1.05, "elbF": -1.9, "shB": -0.95, "elbB": -2.0,
		"hipF": -0.3, "kneeF": 0.55, "hipB": 0.2, "kneeB": 0.6,
		"body_rot": 0.0, "body_y": 0.0}


func _pose_hit() -> Dictionary:
	return {"hips_y": 6.0, "hips_rot": 0.1, "chest": -0.35, "head": -0.4,
		"shF": -0.2, "elbF": -0.7, "shB": 0.1, "elbB": -0.6,
		"hipF": -0.1, "kneeF": 0.25, "hipB": 0.25, "kneeB": 0.3,
		"body_rot": 0.0, "body_y": 0.0}


func _pose_launched(t: float) -> Dictionary:
	var flail := sin(t * 18.0) * 0.25
	return {"hips_y": 0.0, "hips_rot": 0.0, "chest": -0.5, "head": -0.5,
		"shF": -2.2 + flail, "elbF": -0.4, "shB": 0.6 - flail, "elbB": -0.5,
		"hipF": -0.9 + flail, "kneeF": 0.9, "hipB": 0.5 - flail, "kneeB": 0.8,
		"body_rot": -0.55 * facing, "body_y": 0.0}


func _pose_down() -> Dictionary:
	return {"hips_y": 0.0, "hips_rot": 0.0, "chest": 0.05, "head": 0.1,
		"shF": -0.3, "elbF": -0.5, "shB": 0.3, "elbB": -0.4,
		"hipF": -0.15, "kneeF": 0.2, "hipB": 0.15, "kneeB": 0.25,
		"body_rot": -1.45 * facing, "body_y": -120.0}


func _pose_ko() -> Dictionary:
	var p := _pose_down()
	p["head"] = 0.45
	p["shF"] = -2.6
	return p


func _pose_win(t: float) -> Dictionary:
	var b: float = absf(sin(t * 6.0)) * -22.0
	return {"hips_y": b, "hips_rot": 0.0, "chest": -0.12, "head": -0.2,
		"shF": -2.9, "elbF": -0.15, "shB": -0.4, "elbB": -1.2,
		"hipF": -0.15, "kneeF": 0.3, "hipB": 0.15, "kneeB": 0.35,
		"body_rot": 0.0, "body_y": 0.0}


func _pose_special(ph: float) -> Dictionary:
	var ext := sin(ph * PI)
	var p := _pose_punch(ph)
	p["shF"] = lerpf(-0.55, -1.8, ext)
	p["elbF"] = -0.05
	p["hips_rot"] = -0.25 * ext
	p["chest"] = 0.45 * ext
	return p


# -------------------------------------------------------------- combat ----

func start_attack(move_name: String) -> bool:
	if dead or state in ["down", "getup", "ko", "launched", "walkin"]:
		return false
	if state in ["punch", "heavy", "launcher", "air", "special"]:
		return false
	var mv: Dictionary = MOVES[move_name]
	if move_name == "special" and meter < 100.0:
		return false
	current_move = move_name
	# "jab" and "air" both use the punch pose track; every move maps to a
	# handled state (unhandled states freeze the fighter forever).
	state = "punch" if move_name in ["jab", "air"] else move_name
	if move_name == "air":
		current_move = "air"
	state_t = 0.0
	attack_hit_done = false
	attacking = true
	blocking = false
	telegraphing = mv.has("telegraph")
	if move_name == "special":
		meter = 0.0
		squash = Vector2(1.25, 0.8)
	return true


func start_block() -> void:
	if dead or state in ["down", "getup", "ko", "launched", "walkin"]:
		return
	if attacking:
		return
	state = "block"
	blocking = true


func stop_block() -> void:
	if state == "block":
		state = "idle"
		state_t = 0.0
	blocking = false


func add_meter(amount: float) -> void:
	if dead:
		return
	meter = minf(100.0, meter + amount)


func take_hit(mv: Dictionary, attacker: Fighter) -> void:
	if dead:
		return
	var dmg: float = float(mv["dmg"]) * attacker.dmg_mult
	var was_counter := attacker.telegraphing == false and telegraphing
	# blocking?
	if blocking and state == "block" and not (state == "launched"):
		var chip := dmg * 0.2
		hp -= chip
		flash = 0.12
		if fight and fight.has_method("on_blocked"):
			fight.on_blocked(self, attacker, chip)
		_check_death(attacker)
		return
	# counter bonus: hitting a telegraphing enemy
	if telegraphing:
		dmg *= 1.5
		if fight and fight.has_method("on_counter"):
			fight.on_counter(self, attacker, dmg)
	hp -= dmg
	flash = 0.14
	var height: String = str(mv.get("height", "mid"))
	var launch: float = mv["launch"]
	# ---- impact physics: velocity + placement vs chin ----
	var imp: float = (dmg * 0.55 + float(mv["kb"]) * 0.02) / toughness
	apply_impact(imp, height)
	telegraphing = false
	attacking = false
	blocking = false
	if launch > 0.0:
		vel.y = -launch
		vel.x = -facing * float(mv["kb"]) * 0.5
		grounded = false
		state = "launched"
		air_hits += 1
		_bounced = false
		# big chin shots send him spinning — the flip
		if imp > 12.0:
			_jimp("body_rot", randf_range(2.5, 5.0) * (-1.0 if randf() < 0.6 else 1.0))
		# juggle damage scaling for repeated air hits
		if air_hits > 1:
			hp += dmg * (1.0 - pow(0.72, air_hits - 1))  # refund part: net scaled
	elif imp > 17.0:
		# crumple: heavy body work folds him where he stands
		vel.x = -facing * float(mv["kb"]) * 0.35
		vel.y = 0.0
		grounded = true
		state = "down"
		_jimp("chest", imp * 0.5)
		_jimp("head", imp * 0.4)
	else:
		vel.x = -facing * float(mv["kb"])
		state = "hit"
	state_t = 0.0
	squash = Vector2(1.18, 0.82)
	if fight and fight.has_method("on_hit_landed"):
		fight.on_hit_landed(self, attacker, mv, dmg)
	_check_death(attacker)


func _check_death(attacker: Fighter) -> void:
	if hp <= 0.0 and not dead:
		hp = 0.0
		dead = true
		state = "ko"
		state_t = 0.0
		vel = Vector2(-facing * 260.0, -320.0)
		grounded = false
		attacking = false
		blocking = false
		telegraphing = false
		# KO flop: everything goes slack, limbs ballistic — no two KOs alike
		apply_impact(randf_range(10.0, 16.0) / toughness, "mid")
		_jimp("body_rot", randf_range(-4.0, 4.0))
		_jimp("hips_y", randf_range(60.0, 140.0))
		died.emit(self)
		if fight and fight.has_method("on_ko"):
			fight.on_ko(self, attacker)


func heal(amount: float) -> void:
	if dead:
		return
	hp = minf(max_hp, hp + amount)


# ---------------------------------------------------------------- tick ----

func _physics_process(delta: float) -> void:
	if fight == null:
		return
	state_t += delta
	var t := Time.get_ticks_msec() / 1000.0

	# timers
	if flash > 0.0:
		flash -= delta
	squash = squash.lerp(Vector2.ONE, minf(1.0, 10.0 * delta))

	# state machine
	match state:
		"idle", "block":
			vel.x = lerpf(vel.x, 0.0, minf(1.0, 12.0 * delta))
			_apply_pose(_pose_idle(t), 260.0, 22.0, delta)
		"walk":
			_apply_pose(_pose_walk(t), 300.0, 24.0, delta)
			var want := walk_target_x - position.x
			var dir := signf(want)
			if absf(want) < 12.0:
				vel.x = 0.0
				if not is_ai:
					state = "idle"
			else:
				vel.x = dir * 300.0 * speed_mult
		"walkin":
			_apply_pose(_pose_walk(t), 300.0, 24.0, delta)
			vel.x = -facing * 260.0 * speed_mult
			if (facing == 1 and position.x <= walk_target_x) or (facing == -1 and position.x >= walk_target_x):
				position.x = walk_target_x
				vel.x = 0.0
				state = "idle"
				state_t = 0.0
				if fight and fight.has_method("on_walkin_done"):
					fight.on_walkin_done(self)
		"punch", "air":
			_do_attack_pose(delta, "punch")
		"heavy":
			_do_attack_pose(delta, "heavy")
		"launcher":
			_do_attack_pose(delta, "launcher")
		"special":
			_do_attack_pose(delta, "special")
		"hit":
			vel.x = lerpf(vel.x, 0.0, minf(1.0, 8.0 * delta))
			_apply_pose(_pose_hit(), 90.0, 12.0, delta)
			if state_t > 0.28:
				state = "idle"
				state_t = 0.0
		"launched":
			_apply_pose(_pose_launched(t), 45.0, 8.0, delta)
		"down":
			_apply_pose(_pose_down(), 130.0, 20.0, delta)
			vel.x = lerpf(vel.x, 0.0, minf(1.0, 6.0 * delta))
			if state_t > 0.7 and not dead:
				state = "getup"
				state_t = 0.0
		"getup":
			_apply_pose(_pose_idle(t), 170.0, 22.0, delta)
			if state_t > 0.35:
				state = "idle"
				state_t = 0.0
		"ko":
			_apply_pose(_pose_ko(), 14.0, 6.0, delta)
			vel.x = lerpf(vel.x, 0.0, minf(1.0, 4.0 * delta))
		"win":
			vel.x = 0.0
			_apply_pose(_pose_win(t), 220.0, 22.0, delta)

	# gravity / ground
	if not grounded:
		vel.y += 2100.0 * delta
	position.x += vel.x * delta
	position.y += vel.y * delta
	if position.y >= _ground_y:
		position.y = _ground_y
		if not grounded:
			var impact_speed := vel.y
			vel.y = 0.0
			grounded = true
			if state == "launched" and impact_speed > 650.0 and not _bounced:
				# slammed down hard: bounce once, limbs everywhere
				_bounced = true
				vel.y = -impact_speed * 0.32
				vel.x *= 0.45
				grounded = false
				apply_impact(randf_range(4.0, 8.0), "low")
				if fight and fight.has_method("on_land"):
					fight.on_land(self)
			elif state == "ko" and impact_speed > 240.0:
				# KO bounce: ragdoll thud, settle differently every time
				vel.y = -impact_speed * 0.30
				vel.x *= 0.5
				grounded = false
				_jimp("head", randf_range(-3.0, 3.0))
				_jimp("shF", randf_range(-4.0, 4.0))
				_jimp("shB", randf_range(-4.0, 4.0))
				_jimp("hipF", randf_range(-3.0, 3.0))
				if fight and fight.has_method("on_land"):
					fight.on_land(self)
			else:
				if state == "launched":
					state = "ko" if dead else "down"
					state_t = 0.0
					vel.x *= 0.4
				if fight and fight.has_method("on_land"):
					fight.on_land(self)

	# keep in arena — slammed into the wall staggers back off it
	var pre_vx := vel.x
	position.x = clampf(position.x, 90.0, 1190.0)
	if (position.x <= 90.5 or position.x >= 1189.5) and absf(pre_vx) > 320.0:
		vel.x = -pre_vx * 0.35
		apply_impact(3.5, "mid")

	_push_joints()

	# flash
	if flash > 0.0:
		modulate = Color(1.6, 0.5, 0.5)
	elif telegraphing:
		var f := 0.5 + 0.5 * sin(t * 30.0)
		modulate = Color(1.0 + f * 0.6, 1.0, 1.0 - f * 0.4)
	else:
		modulate = Color.WHITE

	# AI
	if is_ai and not dead:
		_ai_update(delta)


func _do_attack_pose(delta: float, pname: String) -> void:
	var mv: Dictionary = MOVES[current_move]
	var total: float = mv["startup"] + mv["active"] + mv["recover"]
	var ph := clampf(state_t / total, 0.0, 1.0)
	match pname:
		"punch":
			_apply_pose(_pose_punch(ph), 420.0, 30.0, delta)
		"heavy":
			_apply_pose(_pose_heavy(ph), 380.0, 28.0, delta)
		"launcher":
			_apply_pose(_pose_launcher(ph), 400.0, 28.0, delta)
		"special":
			_apply_pose(_pose_special(ph), 420.0, 30.0, delta)
	# active window -> ask fight to resolve hit once
	if not attack_hit_done and state_t >= mv["startup"] and state_t <= mv["startup"] + mv["active"]:
		attack_hit_done = true
		if fight and fight.has_method("try_hit"):
			fight.try_hit(self, mv)
	# lunge forward a touch on heavies
	if pname in ["heavy", "special"] and state_t < mv["startup"] + mv["active"]:
		vel.x = facing * 160.0
	else:
		vel.x = lerpf(vel.x, 0.0, minf(1.0, 10.0 * delta))
	if state_t >= total:
		attacking = false
		telegraphing = false
		state = "idle"
		state_t = 0.0


# ------------------------------------------------------------------ AI ----

func _ai_update(delta: float) -> void:
	if bt_brain != null:
		bt_brain.think(delta)
		return
	if state in ["walkin", "hit", "launched", "down", "getup", "ko", "punch", "heavy", "launcher", "special"]:
		return
	var player: Fighter = fight.player
	if player == null or player.dead:
		state = "idle"
		return
	var dx: float = player.position.x - position.x
	var dist := absf(dx)
	facing = 1 if dx > 0.0 else -1
	ai_think -= delta
	# telegraph flash for heavies happens via start_attack
	match ai_mode:
		"approach":
			if dist < 150.0:
				ai_mode = "hold"
				ai_think = randf_range(0.25, 0.7)
				state = "idle"
			else:
				state = "walk"
				walk_target_x = player.position.x - facing * 140.0
		"retreat":
			state = "walk"
			walk_target_x = position.x - facing * 220.0
			if ai_think <= 0.0:
				ai_mode = "approach"
		"hold":
			state = "idle"
			vel.x = 0.0
			if ai_think <= 0.0:
				_decide_attack(dist, player)
	if ai_mode == "approach" and state == "idle":
		ai_mode = "hold"
		ai_think = 0.3


func _decide_attack(dist: float, player: Fighter) -> void:
	# react to player attack startup: sometimes block
	if player.attacking and dist < 260.0 and randf() < fight.ai_block_chance:
		start_block()
		ai_think = randf_range(0.4, 0.8)
		ai_mode = "hold"
		return
	stop_block()
	if dist > 420.0:
		ai_mode = "approach"
		return
	var r := randf()
	var aggro: float = fight.ai_aggro
	if r < 0.45 * aggro and dist < 175.0:
		start_attack("jab")
	elif r < (0.45 + 0.25) * aggro and dist < 200.0:
		start_attack("heavy")  # telegraphed -> counterable
	elif r < (0.70 + 0.12) * aggro and dist < 175.0:
		start_attack("launcher")
	elif r < 0.92:
		ai_mode = "retreat"
		ai_think = randf_range(0.4, 0.9)
	else:
		ai_mode = "approach"
	ai_think = randf_range(0.35, 0.9) / aggro
	ai_mode = "hold" if ai_mode != "approach" else "approach"


func on_player_attack_start(dist: float) -> void:
	# hook for fight to trigger AI reactions
	pass


# ---------------------------------------------------------------- Part ----

class Part:
	extends Node2D
	var part_kind := ""
	var palette := {}
	var fighter_kind := 0

	func _draw() -> void:
		var line: Color = palette.get("line", Color(0.15, 0.14, 0.17))
		var skin: Color = palette.get("skin", Color(0.95, 0.72, 0.53))
		match part_kind:
			"torso":
				_rr(Rect2(-37, -152, 74, 152), 26.0, palette["top"], line)
				# belt stripe
				draw_rect(Rect2(-37, -26, 74, 12), line)
				draw_rect(Rect2(-37, -24, 74, 8), palette["accent"])
			"head":
				var c := Vector2(0, -72)
				draw_circle(c, 66.0, line)
				draw_circle(c, 58.0, skin)
				# hair / headband
				if fighter_kind == 0:
					draw_arc(c + Vector2(0, -18), 56.0, PI, TAU, 24, palette["hair"], 22.0)
					draw_circle(c + Vector2(-30, -52), 14.0, palette["hair"])
					draw_circle(c + Vector2(30, -52), 14.0, palette["hair"])
				else:
					draw_arc(c + Vector2(0, -10), 58.0, PI * 1.05, TAU * 0.98, 24, palette["hair"], 16.0)
					# headband tails
					draw_line(c + Vector2(-52, -34), c + Vector2(-84, -6), palette["hair"], 12.0)
					draw_line(c + Vector2(-52, -26), c + Vector2(-80, 12), palette["hair"], 10.0)
				# eyes (cute, facing right)
				var eo := Vector2(10, 0)
				draw_circle(c + eo + Vector2(-16, -6), 11.0, Color.WHITE)
				draw_circle(c + eo + Vector2(20, -6), 11.0, Color.WHITE)
				draw_circle(c + eo + Vector2(-13, -4), 5.5, line)
				draw_circle(c + eo + Vector2(23, -4), 5.5, line)
				draw_circle(c + eo + Vector2(-11, -6), 2.0, Color.WHITE)
				draw_circle(c + eo + Vector2(25, -6), 2.0, Color.WHITE)
				# brows
				draw_line(c + eo + Vector2(-26, -24), c + eo + Vector2(-6, -20), line, 6.0)
				draw_line(c + eo + Vector2(10, -22), c + eo + Vector2(30, -26), line, 6.0)
				# mouth
				if fighter_kind == 0:
					draw_arc(c + eo + Vector2(2, 16), 14.0, 0.3, PI - 0.3, 16, line, 6.0)  # determined grin
				else:
					draw_arc(c + eo + Vector2(2, 20), 12.0, 0.5, PI - 0.9, 16, line, 6.0)  # smirk
				# cheek blush
				draw_circle(c + eo + Vector2(-30, 12), 8.0, Color(1, 0.5, 0.5, 0.35))
				draw_circle(c + eo + Vector2(34, 12), 8.0, Color(1, 0.5, 0.5, 0.35))
			"arm_u":
				_capsule(Vector2.ZERO, Vector2(0, 82), 30.0, skin, line)
			"arm_f":
				_capsule(Vector2.ZERO, Vector2(0, 66), 26.0, skin, line)
				var fc := Vector2(4, 88)
				if fighter_kind == 0:
					draw_circle(fc, 40.0, line)
					draw_circle(fc, 33.0, palette["glove"])  # big red boxing glove
					draw_arc(fc, 20.0, -0.6, 1.4, 12, line, 5.0)
				else:
					draw_circle(fc, 26.0, line)
					draw_circle(fc, 20.0, palette["glove"])  # teal wrapped fist
					draw_line(fc + Vector2(-14, -8), fc + Vector2(14, 8), line, 5.0)
					draw_line(fc + Vector2(-14, 8), fc + Vector2(14, -8), line, 5.0)
			"leg_t":
				_capsule(Vector2.ZERO, Vector2(0, 96), 36.0, palette["shorts"], line)
			"leg_s":
				_capsule(Vector2.ZERO, Vector2(0, 78), 28.0, skin, line)
				# shoe
				var sc := Vector2(10, 92)
				draw_ellipse(sc, 30.0, 20.0, line)
				draw_ellipse(sc, 24.0, 14.0, palette["shoe"])

	func _capsule(a: Vector2, b: Vector2, w: float, fill: Color, line: Color) -> void:
		draw_line(a, b, line, w + 9.0)
		draw_line(a, b, fill, w)
		draw_circle(a, (w + 9.0) / 2.0, line)
		draw_circle(a, w / 2.0, fill)
		draw_circle(b, (w + 9.0) / 2.0, line)
		draw_circle(b, w / 2.0, fill)

	func _rr(rect: Rect2, rad: float, fill: Color, line: Color) -> void:
		var sb := StyleBoxFlat.new()
		sb.bg_color = line
		sb.set_corner_radius_all(int(rad) + 5)
		draw_style_box(sb, rect.grow(5))
		var sb2 := StyleBoxFlat.new()
		sb2.bg_color = fill
		sb2.set_corner_radius_all(int(rad))
		draw_style_box(sb2, rect)

	func draw_ellipse(c: Vector2, rx: float, ry: float, col: Color) -> void:
		var pts := PackedVector2Array()
		for i in 20:
			var a := TAU * i / 20.0
			pts.append(c + Vector2(cos(a) * rx, sin(a) * ry))
		draw_colored_polygon(pts, col)
