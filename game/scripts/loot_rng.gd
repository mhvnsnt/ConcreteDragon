class_name LootRng
extends RefCounted
## QRNG-seeded randomness for loot / encounter rolls (Concrete Dragon).
##
## Build-time tool game/tools/build_seeds.py stamps true-random seeds
## (ANU QRNG hardware or NIST beacon — both keyless, public) into
## res://assets/seeds/qrng_seeds.json with source attribution.
## This class loads that manifest once and rolls from a RandomNumberGenerator
## seeded from the "lucky-drop" seed, so every build's loot sequence is
## reproducible (same manifest => same sequence) AND auditable (manifest
## records which quantum hardware produced each seed).
## If the manifest is missing, falls back to a randomized generator.

const MANIFEST := "res://assets/seeds/qrng_seeds.json"

static var _rng: RandomNumberGenerator = null
static var _source: String = "missing-manifest-fallback"


static func _ensure() -> void:
	if _rng != null:
		return
	_rng = RandomNumberGenerator.new()
	_rng.randomize()
	if not FileAccess.file_exists(MANIFEST):
		return
	var f := FileAccess.open(MANIFEST, FileAccess.READ)
	if f == null:
		return
	var data: Variant = JSON.parse_string(f.get_as_text())
	if data == null or not (data is Dictionary) or not data.has("seeds"):
		return
	for entry in (data as Dictionary)["seeds"]:
		if entry is Dictionary and entry.get("purpose") == "lucky-drop":
			# Manifest seeds are 128-bit strings (JSON-safe); GDScript int is
			# 64-bit, so hash down — still fully deterministic per manifest.
			_rng.seed = abs(hash(str(entry.get("seed", "0"))))
			_source = str(entry.get("source", "unknown"))
			return


## P(chance) roll for the LUCKY! bonus drop on wave-clear.
static func lucky_hit(chance: float) -> bool:
	_ensure()
	return _rng.randf() < chance


## Amount of a LUCKY! drop, wave-scaled like the rest of the economy.
static func lucky_amount(wave: int) -> int:
	_ensure()
	return _rng.randi_range(5, 15 + wave)


## Which build-time quantum source this run's loot is drawn from (auditing).
static func source() -> String:
	_ensure()
	return _source
