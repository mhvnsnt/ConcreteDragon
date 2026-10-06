class_name Sfx
extends Node
## Pooled sound player. Loads synthesized WAVs from assets/sfx/ when present;
## otherwise synthesizes each sound at runtime (AudioStreamWAV) so the game
## always has full audio juice. All sounds original.
## jsfxr_* entries are baked from jsfxr (Unlicense / public domain) via
## game/tools/gen_sfx_jsfxr.mjs — preset roll-ups + one mutate pass, params
## receipts saved as .sfxr.json next to each WAV.

var _pool: Array[AudioStreamPlayer] = []
var _bank: Dictionary = {}
var _sr := 22050


func _ready() -> void:
	for i in 10:
		var p := AudioStreamPlayer.new()
		add_child(p)
		_pool.append(p)
	var dir := "res://assets/sfx/"
	var names := ["punch_thump", "punch2", "kick_whoosh", "whiff", "block_clack",
		"launcher_whoosh", "hurt", "ko_bell", "cheer", "ui_click", "win_jingle",
		"cash_blip", "counter_ding", "countdown_beep", "go",
		"jsfxr_ui_blip", "jsfxr_hit", "jsfxr_ko", "jsfxr_coin"]
	for n in names:
		var path: String = dir + n + ".wav"
		if ResourceLoader.exists(path):
			_bank[n] = load(path)
		else:
			_bank[n] = _synth(n)


func play(sound_name: String, pitch: float = 1.0, vol_db: float = 0.0) -> void:
	if not _bank.has(sound_name):
		return
	for p in _pool:
		if not p.playing:
			p.stream = _bank[sound_name]
			p.pitch_scale = pitch * randf_range(0.94, 1.06)
			p.volume_db = vol_db
			p.play()
			return
	var p0: AudioStreamPlayer = _pool[0]
	p0.stream = _bank[sound_name]
	p0.pitch_scale = pitch
	p0.volume_db = vol_db
	p0.play()


# ------------------------------------------------------- synthesis ----

func _synth(kind: String) -> AudioStreamWAV:
	match kind:
		"punch_thump", "punch2":
			return _burst(0.14, 160.0, 60.0, 0.9, 0.0)
		"kick_whoosh", "whiff":
			return _noise_sweep(0.22, 0.5)
		"block_clack":
			return _burst(0.1, 900.0, 300.0, 0.7, 0.0)
		"launcher_whoosh":
			return _noise_sweep(0.3, 1.0)
		"hurt":
			return _slide(0.22, 500.0, 180.0, 0.6)
		"ko_bell":
			return _bell(0.9, 880.0)
		"cheer":
			return _noise_sweep(1.6, 0.25)
		"ui_click":
			return _burst(0.06, 1200.0, 800.0, 0.5, 0.0)
		"win_jingle":
			return _arp([523.0, 659.0, 784.0, 1046.0], 0.14)
		"cash_blip":
			return _arp([1318.0, 1760.0], 0.07)
		"counter_ding":
			return _bell(0.35, 1568.0)
		"countdown_beep":
			return _tone(0.15, 660.0, 0.6)
		"go":
			return _slide(0.4, 440.0, 880.0, 0.7)
	return _tone(0.1, 440.0, 0.5)


func _mk(data: PackedFloat32Array) -> AudioStreamWAV:
	var bytes := PackedByteArray()
	bytes.resize(data.size() * 2)
	for i in data.size():
		var v := int(clampf(data[i], -1.0, 1.0) * 32767.0)
		bytes[i * 2] = v & 0xFF
		bytes[i * 2 + 1] = (v >> 8) & 0xFF
	var w := AudioStreamWAV.new()
	w.format = AudioStreamWAV.FORMAT_16_BITS
	w.mix_rate = _sr
	w.stereo = false
	w.data = bytes
	return w


func _burst(dur: float, f0: float, f1: float, vol: float, _unused: float) -> AudioStreamWAV:
	var n := int(_sr * dur)
	var d := PackedFloat32Array()
	d.resize(n)
	for i in n:
		var t := float(i) / _sr
		var f := lerpf(f0, f1, float(i) / n)
		var env := exp(-6.0 * float(i) / n)
		d[i] = sin(TAU * f * t) * env * vol
	return _mk(d)


func _tone(dur: float, f: float, vol: float) -> AudioStreamWAV:
	var n := int(_sr * dur)
	var d := PackedFloat32Array()
	d.resize(n)
	for i in n:
		var t := float(i) / _sr
		var env := 1.0 - float(i) / n
		d[i] = sin(TAU * f * t) * env * vol
	return _mk(d)


func _slide(dur: float, f0: float, f1: float, vol: float) -> AudioStreamWAV:
	var n := int(_sr * dur)
	var d := PackedFloat32Array()
	d.resize(n)
	var phase := 0.0
	for i in n:
		var f := lerpf(f0, f1, float(i) / n)
		phase += TAU * f / _sr
		var env := 1.0 - float(i) / n
		d[i] = sin(phase) * env * vol
	return _mk(d)


func _noise_sweep(dur: float, vol: float) -> AudioStreamWAV:
	var n := int(_sr * dur)
	var d := PackedFloat32Array()
	d.resize(n)
	var last := 0.0
	for i in n:
		var w := randf_range(-1.0, 1.0)
		last = last * 0.7 + w * 0.3
		var env := sin(PI * float(i) / n)
		d[i] = last * env * vol
	return _mk(d)


func _bell(dur: float, f: float) -> AudioStreamWAV:
	var n := int(_sr * dur)
	var d := PackedFloat32Array()
	d.resize(n)
	for i in n:
		var t := float(i) / _sr
		var env := exp(-4.0 * float(i) / n)
		d[i] = (sin(TAU * f * t) + 0.5 * sin(TAU * f * 2.76 * t)) * env * 0.5
	return _mk(d)


func _arp(freqs: Array, note_dur: float) -> AudioStreamWAV:
	var n := int(_sr * note_dur * freqs.size())
	var d := PackedFloat32Array()
	d.resize(n)
	var per := int(_sr * note_dur)
	for ni in freqs.size():
		for i in per:
			var idx := ni * per + i
			if idx >= n:
				break
			var t := float(i) / _sr
			var env := exp(-3.0 * float(i) / per)
			var f: float = freqs[ni]
			# square-ish: sign of sine softened
			d[idx] += clampf(sin(TAU * f * t) * 2.0, -1.0, 1.0) * env * 0.35
	return _mk(d)
