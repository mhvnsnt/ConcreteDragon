# Concrete Dragon — Enemy AI Fix Plan

**Date:** 2026-10-09 · **Status:** research + plan only (no game code written)
**Owner complaint (verified real):** CPU enemies walk into the player and don't attack. Ruins gameplay and promo videos.

---

## 1. Diagnosis — confirmed from the actual code

Live codebase is `game-3d/src/main.js` (Three.js, 5,497 lines; the build at `game-3d/dist/concrete-dragon.html` is what ships on itch.io). The Godot `game/scripts/ai/` behavior-tree framework is **legacy** — last touched 2026-10-07 in a workspace sweep, no recent commits; all live work lands in `game-3d`. The fix targets `game-3d/src/main.js` only.

The enemy brain is `enemyAI(e, dt)` at **main.js:4078** — a 3-state loop: `walk` → `windup` → `recover` → `walk`.

### 1a. Why enemies "walk into you" (confirmed)

- **Walk state (main.js ~4118–4141) drives every enemy at the player's exact position:** `e.px += Math.sign(dx) * …` and `e.pz += Math.sign(dz) * …` with `dx = player.px - e.px`. There is no standoff distance, no strafe, no flank assignment. Every live enemy converges on the single point `(player.px, player.pz)`.
- **Enemy–enemy separation is too weak to prevent the pile-up:** in-walk separation only pushes within 0.8 units at 1.5 u/s (main.js ~4124–4128), and the global `resolveBodyCollision()` (main.js:5057, `BODY_R = 0.45`) uses mass weighting (player 3, thug 1) that shoves *enemies* outward 3× harder than the player — so the pack hovers in a jittering ring pressed against the player instead of spacing itself.
- **No surround slots.** Classic brawlers assign attackers to positions around the player (front-left, front-right, back, etc.). Here all N enemies share one target point → conga line / dogpile.

### 1b. Why enemies "don't attack" (confirmed)

- **Strike gate (main.js:4142):** `if (adx < 1.35 && adz < 0.65 && e.aiT <= 0)` → windup. Two failure modes:
  1. **z-lag:** z-approach runs at 0.8× walk speed. If the player strafes in z, `adz` stays > 0.65 and the enemy trails forever, never entering windup.
  2. **Long recover on low aggro (main.js:4152):** `e.aiT = rnd(0.8, 1.7) / e.aggro`. Difficulty table (main.js:319–323): ROOKIE aggro 0.55 → recover is **1.45–3.1 s** between attacks; NORMAL aggro 1.0 → 0.8–1.7 s. Spawn delay (main.js:3165) is `rnd(0.4,1.2)/aggro` (0.7–2.2 s on ROOKIE). Net: on early difficulties each enemy attacks roughly every 2–4 s, and many die before a second swing. Reads as "walks in, stands there."
- **No reposition behavior:** after `recover` the enemy goes straight back to `walk` → beelines the player again. No back-off, no strafe, no feint — the visible loop is walk-in → (maybe) swing → idle → walk-in.
- **Hit delivery desync (main.js:4158 `enemyStrike`):** the damage lands via `setTimeout(260 ms)` — **real time, not game time**. During hitstop (`dt *= 0.05`), slow-mo, pause, or tab-switch the timer still fires; the re-check (`dx < 1.7 && dz < 0.85` at fire time) then silently whiffs. Attacks that "happened" deal nothing.
- **Regular enemies never block, dodge, or punish** — only bosses have `bossAI()` (main.js:4280) with a pattern system. Mooks are pure walk/swing dummies.

### 1c. What's already good (keep)

- **Telegraphed windup:** `showWarn(e)` + 0.5–0.9 s windup before every strike (main.js:4142–4152). Matches the owner combat-feel law (telegraphs stay, counterable).
- **Signature moves** per family (`ENEMY_FAMS[].sig`, main.js:434+) with per-archetype chance.
- **Difficulty scalar** `aggro` already plumbed through spawn, recover, and windup.
- **Test hooks:** `window.__cdfreeze`, `window.__cdtest` (`forceFoeSig`, `spawnFam`, `ff()` stepping) and the puppeteer harness pattern in `game-3d/qa/combat-smoke-v3.mjs`.

---

## 2. Open-source patterns to adopt (verified sources)

### P1. Hover-vs-commit (the core fix) — pliskin92/supergereinaction
Open-source Godot beat-em-up whose author hit **the exact same bug** and documented the fix in-code: an enemy that only walks to its preferred distance "would park fifty pixels short of its own swing and wait there forever — three minions, thirty seconds, not one blow thrown." Fix: two distances — off-cooldown the enemy **commits** (closes to `reach` and swings); on cooldown it **hovers** at `preferred_gap`. Plus: back off when too close instead of jittering on the spot; a WINDUP so blows are readable; combat resolution separated from the AI.
- https://github.com/pliskin92/supergereinaction (commit `9bc78ec`, files `godot/scripts/enemy.gd`, `combat.gd`)

### P2. Surround slots + Y-axis line-up — classic SoR breakdown
Community teardown of Streets of Rage AI: melee enemies get within x-range while staying **above or below the player** before matching its y-axis; single enemies **circle behind**; **groups surround**; ranged enemies hold x-distance on the player's y.
- https://www.construct.net/en/forum/construct-2/how-do-i-18/streets-rage-style-enemy-ai-77495

### P3. Per-enemy hesitation + attack formations — GameMaker brawler threads
"Improved enemy AI" thread: **soft collisions** (push apart harder the closer they get), **attack formations** (enemies take different positions rather than mobbing), approach from different directions, trigger attacks early when the player is close, erratic approach (zig-zag) instead of straight lines. Companion thread notes the classic convention: **only ~2 enemies attack while the rest linger**.
- https://forum.gamemaker.io/index.php?threads/improved-enemy-ai.100835/
- https://forum.gamemaker.io/index.php?threads/daredevil-beatem-up.7695/

### P4. OpenBOR — the open-source beat-em-up engine
The canonical open-source brawler engine (C, scriptable enemy AI). Useful as a reference implementation for brawler AI state machines and as proof the patterns below are genre-standard.
- https://github.com/rofl0r/openbor · https://github.com/sylphiawindy/openbor

### P5. Difficulty = aggression timer, not just stats — SoR2 Mania analysis
SoR2's higher difficulties make enemies "speedier and more aggressive," with AI that counters player actions (e.g., nearest enemy moves to intercept jumps). Lesson: scale **decision speed and commit willingness**, not just HP/damage — Concrete Dragon's `aggro` scalar is the right hook, currently underused.
- https://www.resetera.com/threads/streets-of-rage-2-beaten-on-mania-with-no-deaths-for-the-first-time.86612/page-2

---

## 3. Implementation plan (mapped to `game-3d/src/main.js`)

> Scope note: keep the AI "deliberately small" (P1). No framework swap — the fix is decision logic inside the existing `walk/windup/recover` states plus two new fields. Boss `bossAI()` untouched.

### 3.1 New per-enemy fields (set in `spawnEnemy`, main.js:3165)
- `e.hesitate` — one-shot random delay `rnd(0.2, 0.9)/aggro` before first commit (P1/P3: pack doesn't move as one organism).
- `e.slot` — assigned surround-slot index (P2), recomputed when the pack changes.
- `e.preferGap` — hover distance, e.g. `1.9 + rnd(0, 0.6)` (P1: hover outside strike range 1.35).

### 3.2 Attack director (new, ~30 lines; called from `frame()` before the enemy loop, main.js ~5110)
- Counts enemies with `ai === 'windup'`; caps concurrent windups at **2** (P3: only ~2 attack at once). Enemies that want to attack but find no token stay holders.
- Assigns surround slots: 6 slots around the player at radius ~2.2, angles spread (front-left, front-right, left, right, back-left, back-right); each holder takes the nearest free slot (P2).

### 3.3 Rework `walk` state (main.js ~4118–4141) into hover / commit / reposition
```
on enter walk:
  if e.hesitate > 0: e.hesitate -= dt; strafe slowly toward slot; return
  if i_am_attacker (hold token) and adx < 1.35 and adz < 0.65 and e.aiT <= 0:
      → windup (existing telegraph path, unchanged)
  else if too close (adx < 0.7): back off to preferGap        # P1: no jittering on the player
  else if holder or on cooldown: walk to assigned slot (x AND z), idle-strafe when there
  else (attacker, off cooldown): commit — close to reach*0.8, then strike gate
```
- Slot-seeking replaces "walk at player.px/pz" for holders → ends the dogpile (P2).
- Keep the existing `showWarn` telegraph and signature-move roll (main.js:4142–4152) exactly as-is.

### 3.4 Regular-enemy defense (small, new)
- When the player starts an attack within 2.2u and a random roll `< 0.12 * aggro` passes, non-boss enemies enter a 0.5 s `block` posture (reuse the player-facing `start_block`-style anim; no damage on block). Gives promo footage reactive enemies instead of statues. (P5: aggression scales with difficulty.)

### 3.5 Fix hit delivery desync (main.js:4158 `enemyStrike`, and `sigHitPlayer`)
- Replace `setTimeout`-based damage with a **game-time delayed-hit queue** processed in `frame()` (decrement by `dt`, so hitstop/slowmo/pause apply). Same for `sigHitPlayer` (main.js ~4201) and boss pattern timers. This is a correctness fix: strikes stop silently whiffing.

### 3.6 Difficulty wiring (uses existing `aggro`, main.js:319–323, 334)
- `hesitate` range, holder patience (how long before a holder requests the attacker token), attacker cap (2 on ROOKIE/STREET, 3 on BRUTAL), and block chance all scale with `e.aggro`. No new difficulty plumbing needed.

### Files/functions touched
| Change | Location |
|---|---|
| New fields `hesitate`, `slot`, `preferGap` | `spawnEnemy` (main.js:3145–3174, init at :3165) |
| Attack director (token cap + slot assignment) | new fn, called in `frame()` before enemy loop (main.js ~5110) |
| Walk-state rework (hover/commit/reposition) | `enemyAI` walk branch (main.js ~4118–4141) |
| Block posture for regulars | new branch in `enemyAI`, anim reuse |
| Game-time hit queue | `enemyStrike` (main.js:4158), `sigHitPlayer` (~4201), boss `execPattern` timers (~4312+) |
| Strike gate unchanged | main.js:4142 (keep `adx < 1.35 && adz < 0.65`) |
| Telegraph unchanged | `showWarn` path (main.js:4142–4152) |

---

## 4. Verification plan (playtest criteria)

Extend the existing harness pattern (`game-3d/qa/combat-smoke-v3.mjs` — puppeteer + `window.__cdtest` + deterministic `t.ff()` stepping; no new infra needed):

1. **No dogpile:** spawn 4 thugs, `ff(600)` (10 sim-s); assert mean enemy distance from player ≥ 1.6u and no two enemies within 0.9u of each other for > 1 s.
2. **Attack cadence:** with `t.forceFoeSig` disabled, over 20 sim-s each attacker lands ≥ 3 windups; assert time-between-first-contact-and-first-windup < 2.5 s on NORMAL.
3. **Attack cap:** with 5 enemies in range, assert concurrent `windup` count ≤ 2 at every sample.
4. **No z-trail:** player strafes in z continuously for 10 sim-s; assert every enemy enters windup at least once (kills the adz > 0.65 forever-trail).
5. **Hit lands:** force windup via `__cdtest`, player stationary in range; assert player HP decreases (catches setTimeout desync after the queue fix).
6. **Telegraph intact:** assert `showWarn` element appears on every windup (owner law: telegraphs stay).
7. **Screenshots:** capture 3 frames (surround ring formed, windup telegraph visible, post-strike recover spacing) for eyes-on review.
8. **Zero console/page errors** throughout (harness already asserts this).

---

## 5. Confirmed vs suggested

**Confirmed (read in the code):** the 3-state AI with no spacing/surround logic (1a); the strike-gate + long-recover mechanics behind "don't attack" (1b); `setTimeout` hit desync (1b); no block/dodge for regulars (1b); Godot BT side is legacy, live target is `game-3d/src/main.js`; windup telegraph + sig moves + aggro scalar already exist and should be kept (1c).

**Suggested (adopted from verified open-source sources, needs implementation + playtest):** hover-vs-commit distances, surround slots, 2-attacker token cap, per-enemy hesitation, back-off-when-close, regular-enemy block, game-time hit queue, difficulty-scaled patience. All patterns are genre-standard (P1–P5 above); exact constants (slot radius 2.2, preferGap 1.9, cap 2) are starting points to tune in playtest, not gospel.
