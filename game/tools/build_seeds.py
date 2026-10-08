#!/usr/bin/env python3
"""build_seeds.py — build-time QRNG seed stamping for Concrete Dragon.

Fetches true-random 64-bit seeds (ANU QRNG hardware / NIST beacon, no keys)
via the shared kit (~/workspace/api-wiring/qrng_seeds.py) and writes them
into game/assets/seeds/qrng_seeds.json with source attribution.

Why: the game's LUCKY! cash drops (fight.gd -> LootRng) are rolled from a
QRNG-seeded generator. Every build's seed batch is committed to the repo, so
loot randomness is both reproducible (same manifest = same sequence) and
auditable (manifest records which quantum hardware produced each seed).

Run at build time (CI runs this before export):
    python3 game/tools/build_seeds.py
"""
import json
import os
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)                       # game/
REPO = os.path.dirname(os.path.dirname(GAME))      # checkout root
KIT = os.path.expanduser("~/workspace/api-wiring")

sys.path.insert(0, KIT)
from qrng_seeds import get_seed  # noqa: E402  (shared kit, no keys needed)

PURPOSES = ["lucky-drop", "lucky-amount", "encounter", "daily", "spare-1", "spare-2"]

OUT_DIR = os.path.join(GAME, "assets", "seeds")
os.makedirs(OUT_DIR, exist_ok=True)

version = "unknown"
vfile = os.path.join(GAME, "version.txt")
if os.path.exists(vfile):
    version = open(vfile).read().strip()

seeds = []
for p in PURPOSES:
    seed, source = get_seed()
    seeds.append({"purpose": p, "seed": str(seed), "source": source})

manifest = {
    "game": "Concrete Dragon",
    "version": version,
    "generated_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "tool": "build_seeds.py via ~/workspace/api-wiring/qrng_seeds.py",
    "seeds": seeds,
}

out = os.path.join(OUT_DIR, "qrng_seeds.json")
with open(out, "w") as f:
    json.dump(manifest, f, indent=2)
    f.write("\n")

for s in seeds:
    print(f"purpose={s['purpose']:12s} seed={s['seed']}  [{s['source']}]")
print(f"wrote {out}")
