# CONCRETE DRAGON — FIGHTER MECHANICS RESEARCH

**Date:** 2026-10-09 · **Purpose:** Incorporation plan for the mechanics north stars
(Final Fight, Streets of Rage, Street Fighter, Tekken) into Concrete Dragon's 3D street brawler combat.

**Method:** Game code read first (`game-3d/src/main.js`, ~5,500 lines), then targeted
research against real sources (frame-data docs, wiki system pages, developer-postmortem
coverage, community guides). Every mechanic below names its source game and source.

**Reading guide:** Each entry has WHAT (the mechanic), SOURCE (game + citation),
CD STATUS (what the game already does, with code refs), and MAP (how it incorporates).
Sections at the end separate **confirmed facts** from **suggestions**, and rank everything
by impact-per-effort.

---

## 0. WHAT CONCRETE DRAGON ALREADY HAS (code-grounded inventory)

Read from `game-3d/src/main.js` — this is the baseline the plan builds on:

**Player offense**
- 3-hit string: JAB → CROSS → KICK (`ATK` array, line ~3207), every 3rd neutral hit
  auto-launches via per-fighter `doFinisher`
- Directional normals: →+HIT lunge strike, ←+HIT retreat backfist, ↓+HIT low sweep
  launcher (SF/SoR-style directional inputs, `doPunch`)
- BLITZ: double-tap toward + HIT = lunging strike (Streets of Rage 4)
- 7 per-fighter finishers: blink strike, curb stomp AOE, gavel drop, demolition,
  venom DOT, cyclone juggle, classic launcher (`doFinisher`)
- Grapple: staggered enemy + grapple button = wrestling finisher (No More Heroes-style)
- Specials: `doSpecial` (dojo directional techniques, desperation variant),
  `doSpecial2`, `doDesperation` (Final Fight 360° spin, costs 10% HP)
- Taunt builds meter; full meter + taunt = RADICAL MODE 12s powered state (TMNT)
- Stance system: two switchable loadouts mid-fight (Double Dragon Neon)

**Defense**
- Parry: tap TOWARD the attacker on the '!' telegraph — negate, stagger attacker 1.2s,
  +energy (Fight'N Rage-inspired, `doParry`)
- Counter: hitting an enemy during its windup = 2x damage COUNTER
- Focus: absorb one hit, +15 energy (SFIV Focus Attack)
- Dodge with i-frames; last-instant dodge = WITCH TIME slow-mo (Bayonetta)
- Tech: tap HIT while knocked down = instant recovery + bounce + brief invuln (Smash)

**Hit feel (already built)**
- `landHit(e, dmg, label, hs, sh, launcher, counter)`: per-hit hitstop (`hs`) +
  screen shake (`sh`), spark bursts, impact VFX, damage popups, music ducking
- Current hitstop values: jab 0.03s, cross 0.04s, kick 0.08s, launcher 0.08s,
  counter 0.12s, gavel 0.16s, boss KO 0.12s + slow-mo
- Launchers: airborne + horizontal knockback velocity; WALL SPLAT bonus vs props;
  EDGE BOUNCE off arena walls back into juggle range (Urban Reign-style)
- Anti-infinite: same move 3x in one juggle = auto-drop + "READ!" popup
  (Skullgirls Undizzy-inspired)
- Style ranks D→SSS on hit variety (DMC); combo keep-alive 2.5s (SoR4)
- RAGE meter: damage taken builds rage, full = 8s +40% damage (The TakeOver);
  LAST STAND: sub-30% HP = +25% damage (Garou TOP)

**Enemies**
- 17 families (thug, rico, jabber, heavyd, stray + creature/seasonal fams), each with
  a signature move (`sig`) and mission-index variants
- AI state machine: `walk` → `windup` (0.5–1.0s telegraph + '!' warn) → `strike` →
  `recover`; bosses run pattern-based `bossAI` (slam/charge/summon/flurry)
- Separation steering so enemies don't stack

**Known gap (owner-reported 2026-10-09):** enemies "keep walking into you and not
attacking" — the walk state drives straight at the player (dx AND dz shrink together)
with no flanking, no y-axis alignment behavior, and no group coordination. The
promo videos expose it. Section 5 addresses this directly.

---

## 1. MOVE SYSTEMS

### 1a. Hitstop scaled to attack weight (Street Fighter / Guilty Gear norms)
- **WHAT:** Freeze both characters for N frames on impact. The single biggest
  contributor to "crunchy" hits (melonJS hit-stop PR notes it as "the single biggest
  contributor to making hits feel crunchy").
- **SOURCE:** Street Fighter norms — light ~9f, medium ~11f, heavy ~13f of hitstop
  (blockpunchkick research doc, citing SF frame data); Guilty Gear Xrd — lights 7f,
  heavies ~10f (arxiv game-feel survey). CritPoints: hitstop "sells that the collision
  actually happened" and in SF2 the 2-in-1 cancel exists *because* hitstop extends the
  cancel window — cancels input during hitstop execute when it ends, keeping combo
  timing consistent.
- **CD STATUS:** Hitstop exists per-hit but is light: jab 0.03s (~2f @60fps), cross
  ~2.5f, kick ~5f, launcher ~5f, counter ~7f, gavel ~10f. Genre norm for a jab is ~9f.
- **MAP:** Retune the `ATK` table's hitstop column toward genre norms: jab 0.10s,
  cross 0.12s, kick 0.16s, launcher 0.14s, keep counter/gavel where they are. Accept
  cancel inputs during hitstop (SF2 2-in-1 rule) so the string timing stays consistent.
  Effort: S. Impact: highest feel-per-line-changed in this doc.

### 1b. Specials that cost health but let you earn it back (Streets of Rage 4)
- **WHAT:** Specials drain your health bar — but the lost chunk is banked as
  recoverable "green health" that regenerates as you land hits without taking damage
  (Bloodborne rally-style). PlayStation Blog editors-choice piece: "lost health is
  banked, potentially recoverable… if you keep on the offensive."
- **SOURCE:** Streets of Rage 4 (Dotemu/Guard Crush/Lizardcube, 2020) —
  Rock Paper Shotgun review, PlayStation Blog, GameFAQs tip compilation all confirm
  the green-health rally mechanic.
- **CD STATUS:** `doDesperation` costs 10% current HP permanently (never lethal).
  No rally-back exists.
- **MAP:** Add `player.rallyHp` on desperation/special HP costs; landing hits converts
  rally back to real HP, taking a hit wipes it. This is THE SoR4 innovation over
  Final Fight's pure-cost desperation — it turns the panic button from punishment
  into a brave bet. Effort: S.

### 1c. Defensive special: invincible, uninterruptable, costs health (Streets of Rage 4)
- **WHAT:** Triangle with no direction = defensive special: full i-frames, cannot be
  interrupted, costs health. The dedicated "get off me" button.
- **SOURCE:** Streets of Rage 4 (PushSquare tips guide; GameFAQs: "Specials give
  benefits like temporary invulnerability").
- **CD STATUS:** Desperation is AOE damage but has no i-frames and doesn't interrupt
  enemy attacks in flight. Dodge has i-frames but no offense.
- **MAP:** Give `doDesperation` i-frames for its 0.55s duration (or add a distinct
  defensive-special input). Effort: S.

### 1d. Back attack (Streets of Rage 4)
- **WHAT:** Dedicated back-attack input (SoR4: back + attack, or R2) — hits enemies
  approaching from behind without turning.
- **SOURCE:** Streets of Rage 4 (PushSquare tips: "A back attack allows you to attack
  someone coming in from behind… we found it easier to just press R2").
- **CD STATUS:** No back attack. In crowds, enemies behind the player are handled only
  by AOE (desperation, slam finisher) or by turning.
- **MAP:** Add: attack button + away-from-facing flick = instant reverse strike using
  the backfist anim. High crowd-fight value, tiny scope. Effort: S.

### 1e. Motion-input specials (Street Fighter)
- **WHAT:** Specials executed by directional motions (QCF+P etc.) rather than buttons —
  the execution barrier IS the balance; whiffed inputs are punishable.
- **SOURCE:** Street Fighter series (pykuma command-list reference in research shows
  the full motion lexicon: QCF, DP, charge, 360).
- **CD STATUS:** CD already has `detectMotion()` + `doMotionSpecial` wired in `doPunch`
  ("fighting-game motion input + HIT (additive: plain tap combat unchanged)").
- **MAP:** Already present — no work needed. Note for completeness; the research
  confirms the design instinct matches genre canon.

---

## 2. COMBO ARCHITECTURE

### 2a. Counter hits change move PROPERTIES, not just damage (Tekken)
- **WHAT:** In Tekken, a counter hit (interrupting the opponent's startup) doesn't just
  deal more damage — the move GAINS new properties: knockdown, stun, or juggle states
  it wouldn't cause on normal hit (sdtekken Tekken 101 guide).
- **SOURCE:** Tekken series (sdtekken.com Tekken 101: "Sometimes a CH attack will
  cause a knockdown, stun, or juggle, when it would normally not on regular hit").
- **CD STATUS:** Counter = flat 2x damage (`landHit(..., counter=true)`). Properties
  don't change.
- **MAP:** Property upgrades on counter: counter-hit launcher ALWAYS launches
  (even vs bosses → mini-launch), counter-hit heavy causes crumple (long stun, sets up
  grapple — feeds the existing wrestling finisher loop), counter-hit sweep causes
  hard knockdown. Effort: S (branch on the existing `counter` flag in `landHit`).

### 2b. Bound: one ground-slam juggle extension per combo (Tekken 6)
- **WHAT:** A "Bound" move slams the airborne opponent into the ground; they bounce up
  vulnerable and the juggle continues. Exactly ONE Bound per combo — a second attempt
  just slams (SuperCombo Wiki Tekken 6/Bound; Tekken Wiki).
- **SOURCE:** Tekken 6 (2007) via SuperCombo Wiki and Tekken Wiki.
- **CD STATUS:** CD has launchers + air juggles + anti-infinite (3x same move = drop),
  but no slam-extension state. The DEMOLITION finisher knocks back; nothing spikes
  downward mid-juggle.
- **MAP:** Add a `boundUsed` flag per juggle: a designated spike move (↓+HIT on an
  airborne enemy, or the SLEDGE demo finisher) slams them down-bouncing instead of
  away, once per airtime. Gives juggles a Tekken-style mid-combo decision point.
  Effort: M.

### 2c. Juggle damage AND pushback scaling (Tekken)
- **WHAT:** Every hit in a juggle pushes the opponent slightly farther AND deals
  slightly less — the combo naturally decays instead of hitting a hard wall
  (TekkenZaibatsu via archive.supercombo.gg: "there is juggle scaling every hit in
  the combo pushes the opponent further away… there is also damage scaling").
- **SOURCE:** Tekken series (community combo theory, TekkenZaibatsu).
- **CD STATUS:** CD's anti-infinite is a hard cutoff (3x same move = "READ!" drop).
  No scaling curve.
- **MAP:** Add gentle per-juggle-hit damage falloff (e.g. ×0.92 compounding, floor
  0.4) and slight knockback growth. Softens the hard cutoff into a Tekken-like
  decay — combos still end, but they end gracefully. Keep the READ! rule as the
  backstop. Effort: S.

### 2d. Wall splat → guaranteed follow-up window (Tekken)
- **WHAT:** Wall splat leaves the opponent stuck and vulnerable; the rule of thumb is
  ~3 more hits connect depending on speed (archive.supercombo.gg Tekken thread).
- **SOURCE:** Tekken 4→8 wall system (sdtekken Tekken 101; GameSpy Tekken 6 guide:
  "slam into a wall… left vulnerable for a few seconds to further attack").
- **CD STATUS:** CD HAS wall splat (bonus damage + crumple vs props) and edge bounce
  (walls bounce launched enemies back into juggle range). But splat is a one-shot
  bonus, not a combo-extension window.
- **MAP:** On wall splat, set a `wallSplatT` window (~1.2s) during which the enemy is
  in crumple and takes +50% damage / guaranteed juggle-starter. Turns the existing
  wall interaction into Tekken-style wall combos. Effort: S-M.

### 2e. Ki Charge: voluntarily become counter-hittable for a payoff (Tekken)
- **WHAT:** 1+2+3+4 = hands glow 3–4s; your next hit is a guaranteed counter hit, but
  you CANNOT block while glowing (sdtekken Tekken 101).
- **SOURCE:** Tekken series.
- **CD STATUS:** CD's risk-reward vocabulary: taunt (vulnerable, builds meter), rage
  (get hit → deal more), last stand (low HP → +damage). No voluntary "disarm" buff.
- **MAP:** Taunt variant: hold taunt = KI CHARGE — 4s glow, next landed hit is an
  automatic COUNTER (with 2a's property upgrades), but dodge/parry are disabled while
  glowing. Fits the existing disrespect-as-gameplay taunt identity. Effort: S.

---

## 3. HIT REACTIONS AND IMPACT FEEL

### 3a. Hitstop discipline (both sides freeze; scale by weight; never zero)
- **WHAT:** Both attacker AND defender freeze (asymmetric freeze "feels wrong");
  scale with attack strength; even 2–3f minimum for readability
  (blockpunchkick research doc design guidelines).
- **SOURCE:** Cross-game consensus (SF/GG/Smash), summarized in the cited research doc.
- **CD STATUS:** `hitstop` is global (freezes everything — both sides by construction).
  Scaling exists but is compressed (see 1a).
- **MAP:** Covered by 1a's retune. One addition: Smash-style defender micro-vibration
  during hitstop (ssbwiki Hitlag: victim shakes while frozen) — cheap, sells impact.
  Effort: S.

### 3b. Impact frames (anime technique)
- **WHAT:** Single high-contrast stylized frames (sharp lines, radiating focus lines,
  inverted colors) inserted at the moment of impact — the signature anime technique
  for making collisions pop (Buttondown re:frame: "single frames… that employ
  high-contrast, stylized drawings… to make punches, collisions, or explosions
  really pop"). Prince of Persia: The Lost Crown uses them to punctuate its parry.
- **SOURCE:** Japanese animation grammar; modern game adoption documented at
  buttondown.com/re:frame.
- **CD STATUS:** CD has flash overlays (`flash('#ffffff')` on KO, color flashes on
  counter/rage), spark bursts, and slow-mo — but no held impact-frame beat.
- **MAP:** On heavy/counter/KO hits: 2–3 frame full-screen high-contrast impact card
  (white silhouette on black, or inverted palette) before the slow-mo resolves.
  This is the Nintendo-key-art-in-motion version of the art direction. Effort: M
  (needs 2–3 drawn frames per weight class, or a shader-based posterize pulse).

### 3c. Directional screen shake (Guilty Gear lesson)
- **WHAT:** Shake in a semantically meaningful direction beats random jitter —
  Guilty Gear Xrd shakes vertically on ground-bounces from air, horizontally on
  transverse slashes (arxiv game-feel survey citing Xrd).
- **SOURCE:** Guilty Gear Xrd -SIGN-/-Revelator- (via arxiv 2208.06155 survey).
- **CD STATUS:** `shake` is a scalar magnitude.
- **MAP:** Make shake a vector: launchers kick the camera up, wall splats shove it
  sideways, ground pounds drop it down. Effort: S (shake is already plumbed
  everywhere; just add direction).

### 3d. Crush properties on moves (Tekken)
- **WHAT:** Certain moves crush: high-crush (duck under highs, e.g. Bryan's d/f+3),
  low-crush (hop over lows — all hopkicks). A move in its crush frames simply makes
  the opponent's attack whiff (supercombo.gg Tekken TTT2 mechanics; sdtekken 101).
- **SOURCE:** Tekken 5+ crush system.
- **CD STATUS:** CD has dodge i-frames (whole-body, timed) but no move-embedded
  crush. The dive kick and sweep are natural candidates.
- **MAP:** Sweep (↓+HIT) gains high-crush during startup (ducks under enemy jabs);
  dive kick gains low-crush (hops over low sweeps). Teaches matchup thinking without
  new buttons. Effort: M (needs per-move crush windows + enemy attack height tags).

---

## 4. ENEMY / BOSS DESIGN (beat-em-up patterns)

### 4a. Group-fight AI: flank, align, surround (genre-wide beat-em-up AI)
- **WHAT:** The standard beat-em-up enemy brain (Construct community breakdown of
  SoR-style AI): enemies line up on the player's y-axis before attacking; melee
  enemies approach on x while holding above/below, then match y to strike; single
  enemies circle behind; groups spread to surround; ranged enemies hold x-distance
  while matching y.
- **SOURCE:** Beat-em-up genre consensus (construct.net SoR-style AI thread).
- **CD STATUS:** **This is the owner's reported bug.** CD's `walk` state reduces dx
  AND dz simultaneously — every enemy bee-lines for the player's exact position,
  producing the "walk into you and not attack" pile-up seen in the promos. No
  flanking, no y-alignment phase, no surround coordination.
- **MAP (highest gameplay priority):**
  1. Split approach into two phases: close x-distance while holding a y-offset
     (above/below the player), THEN match y when in x-range and only then enter
     windup. This alone fixes the pile-up.
  2. Assign surround slots: each engaged enemy takes an angle slot around the player
     (left/right/above/below in screen space); newcomers fill empty slots instead of
     stacking behind the leader.
  3. Cap concurrent attackers: 1–2 windups at once on normal, more on higher
     difficulties (SoR4's difficulty knob is mostly enemy COUNT — GameFAQs SoR4 FAQ:
     "The enemy AI level and strength appear to be the same in all difficulty
     settings… the higher the difficulty, the more enemies you face").
  Effort: M. Impact: fixes the #1 owner complaint; every promo video gets better.

### 4b. Archetype matrix: grappler / rushdown / zoner (fighting-game roles in brawler bodies)
- **WHAT:** Fighting games sort characters into grappler (slow, huge damage up close),
  rushdown (fast pressure), zoner (controls space). Beat-em-ups translate these into
  enemy behaviors: Andores (Final Fight) walk at you and grab; Holly Wood/El Gado
  slide in with multi-option offense (ResetEra Final Fight thread).
- **SOURCE:** Fighting-game archetype theory; Final Fight enemy design
  (ResetEra "enemies that grind your gears" thread).
- **CD STATUS:** 17 families exist with signatures, but roles are implicit. heavyd is
  the closest to grappler (charge), jabber/stray to rushdown (flurry, speed). No
  true zoner (nobody controls space at range — no projectiles on grunts).
- **MAP:** Formalize 3 roles in `ENEMY_FAMS` and design ONE new zoner family
  (projectile grunt — the SoR4 "grenade dudes" slot; ResetEra notes they're
  "annoyances to fight in groups" i.e. they work). Ranged pressure forces the
  player to use blitz/dive kick to close — creates the spacing game brawlers need.
  Effort: M (one family + projectile).

### 4c. Enemies grab the PLAYER (Final Fight)
- **WHAT:** In Final Fight, enemies grab YOU — walk into their range and you're held;
  escape with u+A. Andores "go into immediate attack mode when standing right next
  to you" (GameFAQs Capcom Beat-Em-Up Bundle guide).
- **SOURCE:** Final Fight arcade (capcom.fandom.com/wiki/Final_Fight;
  GameFAQs Final Fight move list: "Escape Enemy Grab: u + A").
- **CD STATUS:** One-directional: only the player grapples (staggered enemies).
  Enemies never grab. The player has no grab-escape interaction to learn.
- **MAP:** Give the grappler-archetype family (heavyd line) a grab: if it reaches
  point-blank during your busy frames, you're held 1s taking squeezes; mash HIT to
  break (Final Fight's u+A escape, adapted to one-button). Adds dread to the
  grappler and makes stagger/grapple interplay two-way. Effort: M.

### 4d. Boss pattern language (Final Fight / SoR2)
- **WHAT:** SoR2's 8 bosses are each a moveset thesis (Abadede = grappler, Jet =
  dive-bomb rushdown); Final Fight bosses mix grabs, charges, and weapon play.
  Patterns are telegraphed, punishable, and phase-shift.
- **SOURCE:** SoR2 boss roster (BEATEMUP_TEARDOWN.md already documents the 8-stage
  structure); Final Fight boss design (GameFAQs guides).
- **CD STATUS:** Bosses run pattern AI (slam/charge/summon/flurry) with '!' warns —
  solid foundation. 
- **MAP:** No new research needed; existing patterns match genre canon. One
  addition from Tekken: **unblockable spark telegraph** — Tekken marks unblockables
  with a distinct spark animation (sdtekken 101: "Most unblockable attacks are slow
  to execute and have the spark animation that gives them away"). Give boss
  unblockable patterns a unique visual tell (not just '!') so players learn the
  read. Effort: S.

---

## 5. ANIMATION PRINCIPLES

### 5a. Silhouette-first attack readability
- **WHAT:** "Players read fighters by their outlines before they notice colors or
  details… every key pose" should read as a solid black shape; Rivals of Aether's
  Dan Fornace applies the silhouette test to idle, attacks, AND anticipation frames
  (DashFight: How 2D Fighting Game Characters Are Designed).
- **SOURCE:** Fighting-game character design consensus (dashfight.com).
- **CD STATUS:** CD uses Mixamo clips (`Melee_Unarmed_Attack_Punch_A`, etc.) shared
  across families. Anticipation exists functionally (windup + '!' warn UI) but the
  clips themselves weren't chosen for silhouette contrast.
- **MAP:** Audit pass: screenshot each signature move's windup frame, fill it black,
  check the read at a glance. Where a windup silhouette is muddy, exaggerate via
  `ts` (timeScale) easing — hold the anticipation 2–3 frames longer (animation
  principle: anticipation), then snap the active frames faster. No new assets needed;
  it's timing curves on existing clips. Effort: M (audit) + S (retune).

### 5b. Anticipation / overshoot / settle (the 12 principles, fighting-game flavor)
- **WHAT:** Anticipation (wind-up in the opposite direction), overshoot (travel past
  the target), settle (recover to pose). The K-On!! baseball swing example: twist
  back first, swing past, settle — "the more space an action covers in a short span
  of time, the more visual impact it will have" (Wave Motion Cannon: Anticipations).
- **SOURCE:** Disney's 12 principles via wavemotioncannon.com.
- **CD STATUS:** `startTravel` uses smoothstep root motion (good — no snapping, per
  the NO FAKE ANIMATION law). Windups exist. What's missing is the overshoot beat:
  attacks stop AT the target rather than punching THROUGH it.
- **MAP:** Extend lunge/blitz travel 0.3 units PAST the target point before the
  settle-back. Two lines in `startTravel` call sites. Effort: S. This is the
  cheapest "weight" upgrade available.

### 5c. Get-up options (Tekken's ground game)
- **WHAT:** Tekken's ground game is a full subsystem: tech roll (either side), kip-up
  with damage, spring kick, low/mid wakeup kicks, rolling to avoid verticals
  (GameSpy Tekken 5 guide).
- **SOURCE:** Tekken 5 (ps2.gamespy.com guide).
- **CD STATUS:** CD has Smash-style tech (tap HIT while down = instant recovery +
  invuln). No directional choice, no wakeup attack.
- **MAP:** Extend tech: tech + direction = roll that way (keeps invuln); tech with
  no direction + immediate HIT = wakeup kick (small AOE, punishable if whiffed).
  Turns every knockdown into the Tekken guessing game. Effort: M.

---

## 6. PRIORITIZED INCORPORATION PLAN

Ranked by impact ÷ effort. "Effort" in one-builder days: S < 1d · M 1–3d · L 3–7d.

| # | Mechanic | Source | Effort | Why this rank |
|---|----------|--------|--------|---------------|
| 1 | Hitstop retune to genre norms (1a) | SF/GG | S | Biggest feel-per-line; promo videos instantly crunchier |
| 2 | Enemy group AI: flank/align/surround (4a) | SoR/FF genre AI | M | Fixes owner's #1 complaint; every video improves |
| 3 | Health rally on desperation (1b) | SoR4 | S | Turns panic button from punishment into brave bet |
| 4 | Counter-hit property upgrades (2a) | Tekken | S | Deepens the existing counter system; feeds grapple loop |
| 5 | Back attack input (1d) | SoR4 | S | Crowd fights are the genre; currently no answer behind you |
| 6 | Juggle scaling curve (2c) | Tekken | S | Graceful combo decay > hard READ! cutoff |
| 7 | Directional screen shake (3c) | GG Xrd | S | Nearly free; sells launchers vs slams differently |
| 8 | Overshoot on lunges (5b) | 12 principles | S | Cheapest "weight" upgrade; 2 lines |
| 9 | Bound slam extension (2b) | Tekken 6 | M | Mid-juggle decision point; signature Tekken feel |
| 10 | Wall-splat combo window (2d) | Tekken | S-M | Turns existing wall splat into wall combos |
| 11 | Ki-charge taunt variant (2e) | Tekken | S | Fits the disrespect-as-gameplay identity |
| 12 | Defensive-special i-frames (1c) | SoR4 | S | True "get off me" button |
| 13 | Zoner enemy family (4b) | FF/SoR4 | M | Spacing game; gives blitz/dive kick a job |
| 14 | Enemy grabs player (4c) | Final Fight | M | Two-way grapple; grappler dread |
| 15 | Crush properties (3d) | Tekken | M | Matchup depth; needs attack-height tags first |
| 16 | Wakeup option expansion (5c) | Tekken 5 | M | Knockdown becomes a guessing game |
| 17 | Impact frames (3b) | Anime/PoP | M | Needs art; biggest visual punch of the list |
| 18 | Silhouette audit + antic retune (5a) | FG design | M+S | No new assets; timing curves only |
| 19 | Boss unblockable spark tell (4d) | Tekken | S | Readability; small |
| 20 | Motion inputs | SF | — | Already built (`doMotionSpecial`); no work |

**Suggested build order (three tranches):**
- **Tranche A (feel, ~3d):** 1, 7, 8, 3, 12 — the game instantly feels heavier and
  braver with zero new systems.
- **Tranche B (depth, ~5d):** 4, 5, 6, 10, 11, 19 — counters, crowds, walls, and
  knockdowns gain decision points.
- **Tranche C (systems, ~2w):** 2, 13, 14, 15, 16, 17, 18 — new states and art;
  the Tekken-ization phase.

---

## 7. CONFIRMED FACTS vs SUGGESTIONS

**Confirmed facts (sourced, verifiable):**
- SF hitstop norms: light ~9f / medium ~11f / heavy ~13f; GG Xrd lights 7f, heavies
  ~10f ([1](https://github.com/randroids-dojo/blockpunchkick/blob/HEAD/Docs/Research-Fighting-Game-Mechanics.md), [2](https://arxiv.org/pdf/2208.06155v2))
- 3rd Strike parry: 10f ground window (6f held), 23f cooldown, no chip, no blockstun
  ([3](https://srk.shib.live/w/Street_Fighter_3:_3rd_Strike/System))
- Tekken Bound: exactly one per combo; low parry also bounds (BR)
  ([4](https://srk.shib.live/w/Tekken_6/Bound), [5](https://tekken.fandom.com/wiki/Bound))
- Tekken counter hits grant new properties (knockdown/stun/juggle), not just damage
  ([6](https://sdtekken.com/tekken-6/tekken-101/))
- Tekken wall splat → ~3 follow-up hits by speed ([7](https://archive.supercombo.gg/t/tekken-evolution-from-1-to-6/80953))
- Tekken juggle scaling: damage AND pushback scale per hit
  ([8](https://archive.supercombo.gg/t/question-about-combos-in-tekken/144971))
- Tekken crush: high-crush ducks highs, low-crush hops lows; all hopkicks crush low
  ([6](https://sdtekken.com/tekken-6/tekken-101/))
- Tekken throw breaks: tap 1/2/1+2 matching the grabbing limb; Tekken 7 widened the
  window; Tekken 8 simplified chain-throw breaks ([9](https://tekken.fandom.com/wiki/Throw))
- Tekken unblockables carry a distinct spark telegraph ([6](https://sdtekken.com/tekken-6/tekken-101/))
- Tekken ground options: tech roll (either side), kip-up, spring kick, wakeup
  low/mid kicks ([10](http://ps2.gamespy.com/playstation-2/tekken-5/guide/page_2.html))
- SoR4 specials: health cost banked as recoverable green health; defensive special
  has full i-frames; back attack input; throws have i-frames; grabbing = invincible
  ([11](https://blog.playstation.com/2020/06/26/editors-choice-streets-of-rage-4-is-a-sublime-example-of-pick-up-and-play-brilliance/), [12](https://www.pushsquare.com/news/2020/04/guide_streets_of_rage_4_-_tips_and_tricks_for_beginners), [13](https://Gamefaqs.gamespot.com/boards/246602-streets-of-rage-4/78695329))
- SoR4 difficulty knob is mostly enemy count, not AI smarts
  ([14](https://gamefaqs.gamespot.com/pc/271565-streets-of-rage-4/faqs/79699))
- Final Fight: walk-into grab (front/back), grab+attack = strikes, grab+direction =
  throw, thrown enemies damage others, special costs HP on connect, escape grab with
  u+A ([15](https://capcom.fandom.com/wiki/Final_Fight), [16](https://gamefaqs.gamespot.com/arcade/563208-final-fight/faqs/71366))
- Beat-em-up enemy AI: y-axis alignment, x-approach with y-offset, surround, single
  enemies circle behind ([17](https://www.construct.net/en/forum/construct-2/how-do-i-18/streets-of-rage-style-enemy-ai-77495))
- Hitstop: both sides freeze; cancels accepted during hitstop execute after, keeping
  timing consistent (SF2 2-in-1) ([18](https://critpoints.net/2017/05/17/hitstophitfreezehitlaghitpausehitshit/))
- Silhouette readability: players read outlines first; test every key pose as a black
  shape ([19](https://dashfight.com/news/how-2-d-fighting-game-characters-are-designed-animated-and-rigged-9271))
- Anticipation/overshoot/settle: wind up opposite, travel past, settle
  ([20](http://wavemotioncannon.com/2017/05/02/animation-principles-anticipations/))

**Suggestions (my synthesis — not sourced claims):**
- The exact hitstop retune values for CD (0.10/0.12/0.16s) are my judgment calls
  scaled from the confirmed genre norms to CD's faster arcade pace, not quotes.
- The three-tranche build order and all effort estimates are planning judgments.
- Which CD fighter gets which Bound/spike move, the zoner family's design, and the
  ki-charge specifics are design proposals, not genre facts.
- The claim that hitstop retune is "highest feel-per-line" is my prioritization
  opinion grounded in the melonJS "single biggest contributor" note, not a measured
  result on this game.

---

## 8. OPEN SOURCE PULL-INS (owner request: improve AI/gameplay with OSS)

The owner explicitly asked to "pull in open source for all of those things" to fix
the enemy AI and improve gameplay/promos. Concrete, reusable OSS targets:

1. **Behavior-tree AI** — the repo already has `docs/WIRING_ENEMY_BT.md` and
   `docs/EVAL_LIMBOAI.md` (LimboAI evaluation). Godot's LimboAI is MIT-licensed and
   Godot-native, but CD's shipped build is the **Three.js** `game-3d` version. For
   the JS build, the portable pattern is a hand-rolled BT/utility-AI over the
   existing `walk/windup/strike/recover` states — the flank/align/surround slots
   from 4a map 1:1 onto BT selector nodes. (Suggestion: implement the 4a behavior
   directly; no dependency required.)
2. **Frame-data tooling** — the pykuma project (linked in research) is a pure-Python
   3rd-Strike engine with frame-data validation via Pydantic; its *approach*
   (data-driven move tables with startup/active/recovery invariants) ports directly
   to CD's `ATK` array — currently `[clip, ts, delay, dmg, label, hs, sh]` with no
   active/recovery split. Adding active/recovery columns is the precondition for
   crush windows (3d) and real cancel windows (1a).
3. **Game-feel references** — melonJS's new `state.freeze()` hitstop primitive
   (MIT) is the cleanest open implementation of reentrant hitstop to crib the API
   shape from; SSBWiki's hitlag formula `(d/3 + 3)` frames is a public formula for
   damage-scaled hitstop if CD wants formula-driven instead of table-driven values.

No commits were made for this research (docs only, per instructions).
