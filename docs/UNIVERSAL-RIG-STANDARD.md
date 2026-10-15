# UNIVERSAL RIG STANDARD — Production-Grade 3D Model Gate

**Owner law 2026-10-15.** This standard applies to EVERY repository with 3D
models: western-heart, Bannon, AshLane, Brutal-Fist, ConcreteDragon,
money-machine-hq. It covers games, shows, cutscenes, promo videos, entrance
kits — anything with a 3D model.

**No model ships to video, cutscenes, promos, or shows without passing.**
No exceptions.

## The pipeline (canonical)

The single source of truth is `tools/rig_repair/` in **mhvnsnt/western-heart**
(9 stages: detect → transfer → refit → reskin → separate → armpit → weldcap →
gate → proof). Every stage writes a versioned file. Inputs are NEVER touched.
Full method: `tools/rig_repair/README.md` in western-heart.

Do not fork the pipeline per game. Pull it canonical; improvements go back to
western-heart via PR.

## The gates (all must pass)

1. **Stretch gate: p99.9 edge stretch < 2.5** on every mesh, measured on the
   model's own clips AND the extreme-pose battery.
2. **Extreme-pose battery** (owner law 2026-10-15): arms full overhead, arms
   crossed tight, full wide stance + deep crouch, spine bent hard + twisted,
   combined wrestler arch. Every mesh, every pose: no tearing, no detached or
   floating parts, no mesh explosions. A Tekken model holds together cranked —
   ours do too.
3. **No hand-tooling, ever.** Fixes come ONLY from proven open-source automatic
   methods (Blender data transfer, voxel/surface heat diffuse skinning, the
   pipeline's own stages). Never manual weight painting, never hand edits.
   A fix is a program with a before/after number, not an artist's afternoon.
4. **Proof pictures.** Before/after renders in identical stress poses, opened
   and verified with human eyes before anything ships. A worker's "verified"
   is a claim, not a fact.
5. **Hard invariants:** max 4 bone influences per vertex, weights sum to 1,
   zero open edges (welded by position), zero NaN weights. Shipped-game format.

## Model-swap rule

Repaired models NEVER merge into a game without the owner's explicit OK
**per model**. The pipeline outputs repaired files + proof; the swap is his
call, one model at a time.

## Running it (this repo)

```bash
# one model
./tools/rig/run.sh --in <MODEL.glb>

# batch: every character model in this repo (see MODEL PATHS below)
./tools/rig/run.sh --batch
```

The runner pulls the canonical pipeline, runs every model through all 9 stages
+ gates, writes versioned outputs (`<tag>_<stage>.glb`) + JSON reports, and
renders proof pictures. It never modifies inputs and never merges swaps.

## MODEL PATHS (this repo)

Inventory taken from `main` 2026-10-15. Note: the batch glob in
`tools/rig/run.sh` covers `game-3d/build/assets/*.glb` (top level); the
`parts/` character/enemy files are listed here for now and should be wired
into the glob (or a second glob) when this is first run.

| Path | What | Count |
|---|---|---|
| `game-3d/build/assets/*.glb` | character + clip models: `fighter.glb`, 6 `anim_*.glb` clips, stage: `industrial`, `roads`, `street` | 10 |
| `game-3d/build/assets/parts/*.glb` | character parts / enemies: carmilla, demon, dragon-evolved, ghost-happy, ghost-sad, pumpkin-head, skull, spider, vampire-bat, witch, zombie, baseball-skeleton, basketball-rj, basketball-tulio | 14 |
| `game-3d/build/assets/props/*.glb` | props (`k_*`: barrier, chair, cone, fence, lamppost, table, tire, traffic cone) — props: weldcap only, not character gates | 8 |
| `game/assets/props/` | props (41 .glb + obj/fbx source + textures; 418 files total) — out of scope for character gates, still run through weldcap | 418 files, 41 .glb |

## When the pipeline updates

Re-run every model that hasn't passed the new stages. The standard only moves
forward — a model that passed v1 and fails v2 gets fixed, not grandfathered.

## History

- 2026-10-15: standard established (owner). Pipeline: western-heart
  `tools/rig_repair/` (PRs #164–166, #168, #177, #180). Case-2 transfer +
  extreme-pose battery: in build.
- Research: `tools/rig_repair/RESEARCH.md` (western-heart) — teardown rules,
  OSS tooling survey, the 2.5-gate path.
