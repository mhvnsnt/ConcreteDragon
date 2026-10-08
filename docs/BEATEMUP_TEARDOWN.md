# CONCRETE DRAGON — Beat-Em-Up Teardown & Design Spec

**Date:** 2026-10-06 · **Purpose:** Reference-backed design for the beat-em-up evolution.
Owner directive: current menus are ugly/boring — every design decision below is
backed by a shipped reference game, not guesswork.

**Direction (owner-locked):** 3D side-scrolling beat-em-up. Walk forward/backward
(+ depth) across scrolling street levels with missions. Inspirations: Streets of
Rage 1–4, Fatal Fury series, Dragon Ball GT: Transformation (GBA),
Streets of Fury. NOT a stationary 1v1 fighter.

---

## 1. STREETS OF RAGE 1–4 (Sega / Dotemu, 1991–2020)

### Character select
- SoR2/3: full-body character sprites on a city-backdrop select screen, each with
  visible stat bars (power / speed / jump / stamina). You see the FIGHTER, not an icon.
- SoR4: starts with 4 fighters; the select screen shows a **blanked-out 5th slot**
  that teases an unlockable (Adam Hunter) — locked content is visible as a
  silhouette with a hint, which drives replay ("who is that?").
- Lesson: show full-body fighters + stat bars; tease locked fighters as silhouettes.

### Unlock / progression (SoR4 — the modern standard)
- Adam Hunter unlocks by **completing Stage 4 of the story** (milestone unlock).
- 12 retro characters unlock via **lifetime score thresholds** (200,000 → 1,150,000
  points): every point ever earned counts. Score comes from hits, combo chains,
  pickups, time bonus, remaining-health bonus, unused-star bonus, and a letter
  rank (S/A/B/C/D) per stage.
- Lesson: two unlock tracks — (a) milestone unlocks (beat mission X / boss Y),
  (b) lifetime-score thresholds. Both are pure gameplay, no paywalls.

### Level / world structure (SoR2 — the genre template)
- **8 stages**, each with a distinct theme + end-of-stage boss:
  1. Downtown / Bar → boss Barbon · 2. Bridge → Jet · 3. Amusement Park → Zamza ·
  4. Stadium → Abadede · 5. Ship → R. Bear · 6. Jungle → Souther & Stealth ·
  7. Munitions Factory → Particle & Molecule · 8. Syndicate Stronghold → Mr. X
- Stages are walks through themed zones with enemy waves, then a boss arena.
- Lesson: mission = themed walk with escalating waves + boss at the end.
  District identity per mission is the genre's core content unit.

### Enemy variety + variants (SoR2 — the masterclass)
- ~18 enemy archetypes, each with **named palette/behavior variants**:
  - Galsia (street punk): variants Brash, Joseph, B.T., Jonathan, Garam… — later
    variants get more HP and weapons (knives).
  - Donovan (skinhead thug): variants Martin, Gonzalez, Z, Brown… — gains an
    **uppercut that counters the player's jump kicks** (behavior change, not just stats).
  - Signal (mohawk): variants named by jacket color — Y.Signal, R.Signal, B.Signal…
  - Bikers: variants named after weather — Fog, Storm, Typhoon, Hail…
- Variants escalate by: HP, damage, new moves, weapons, aggression.
- Lesson: enemy "families" with named variants that gain new behaviors as the
  player progresses. Names are short and evocative — our equivalent of the
  3D-demo street style (Street Thug → Thug Enforcer → …).

### Items & interactables
- Breakable containers (trash cans, crates, arcade cabinets, vases) hide food
  (apple = small heal, roast chicken = full heal), cash bags, gold bars, 1-ups.
- Weapons: knife, lead pipe, katana — pickup, limited use, throwable.
- Lesson: breakables + pickups break up combat pacing and reward exploration.

### HUD
- Portrait + name + health bar (top-left for P1), score top-center, lives,
  combo counter, boss health bar on boss fights.
- Lesson: persistent identity (portrait + name + HP), combo counter prominent,
  boss HP bar as an event.

**Sources:** Sega Retro (segaretro.org/Streets_of_Rage_4/Playable_characters),
Eurogamer unlock guide, Gamepur unlock guide, Sega Retro SoR2 enemies/stages.

---

## 2. FATAL FURY SERIES (SNK, 1991–2025)

### The two-plane system (the depth-movement reference)
- Original Fatal Fury: **two planes** — foreground and background lanes. A button
  combination shifts the fighter between planes; used offensively and defensively.
- Fatal Fury 3 / Real Bout: **three planes**; fighters auto-return to the center
  lane after a moment (keeps the fight moving — a deliberate anti-stall design).
- Fatal Fury: City of the Wolves (2025): two-lane battles return — lane-switch
  attacks, **cross-lane combos** (combos that carry across planes), lane-dependent
  actions (different moves available per lane).
- Lesson for us: depth (z) movement must be meaningful — dodge INTO the
  background/foreground to evade, and attacks should be able to reach across
  depth. Auto-settling toward a "home" depth keeps brawls from stalling.

### Character select / presentation
- Large character portraits with names; roster grew across entries; guest/DLC
  characters handled as full select-screen additions.
- Bosses (Geese Howard) are presented as events with intro dialogue.

### Stages
- Rounds use different times of day per stage; destructible scenery at stage
  edges; ring-outs in Real Bout (alternate win condition).

**Sources:** Xbox Wire / SNK on City of the Wolves two-lane system (2025),
Nintendo Life reviews of Fatal Fury 3 and Real Bout Special.

---

## 3. DRAGON BALL GT: TRANSFORMATION (GBA, Webfoot/Atari, 2005)

The owner's explicit handheld reference — "what works with limited buttons"
maps directly to touch controls.

### Structure
- 2D belt-scrolling beat-em-up. **Story mode is planet-by-planet**
  (Imecka → … → Earth → Tuffle Planet), each planet = a mission with a
  **boss at the end** (final boss: Golden Great Ape Baby Vegeta).
- **3-character team = lives**: Goku/Pan/Trunks; the player switches between
  them mid-level; unused characters recover energy. Dying swaps to the next.
- Zeni (currency) awarded per stage based on **performance: time, combos,
  power-ups collected** — spent to **purchase/unlock additional game modes**.
- 9 playable characters total; unlockables include Super Saiyan forms,
  Piccolo, Vegeta. Unlocks are gameplay-earned.
- Modes: Story, Standard, Endurance, Boss Endurance, Robot Swarm.
- Lesson: mission-per-location structure; team/lives system; performance-scored
  currency that unlocks content; character forms as unlockable variants.

**Sources:** Giant Bomb wiki, Dragon Ball Wiki (fandom), vizzed.com.

---

## 4. STREETS OF FURY EX (Guard Crush Games, 2015 — the indie proof)

Two developers. Dream-Build-Play finalist. The "small team can do this" proof.

- **"Security Level"** — a lifetime progression meter; raising it unlocks new
  characters, game modes, and content. (Same idea as SoR4's lifetime score.)
- **Story mode: hunt gang leaders in their respective districts** — district =
  mission, boss = gang leader. Directly matches our district plan.
- 24 playable characters; 4-player co-op; dodge, air combos, cancels, "furies"
  (super moves); 5 difficulty levels; survival / versus / challenge modes.
- Cautionary lesson (from reviews): the loop "enter area → fight cloned enemies
  → move on" gets repetitive WITHOUT enemy variety, breakables, or weapons.
  Variety is not optional — it's the genre's oxygen.

**Sources:** Steam store page, Hardcore Gaming 101, Defunct Games review.

---

---

# EXPANDED TEARDOWNS (2026-10-06 — owner directive)

Side-scroller deep pass: Final Fight, Double Dragon, TMNT arcade, River City Ransom,
Scott Pilgrim vs The World, Fight'N Rage, The TakeOver, Guardian Heroes, plus a deeper
Streets of Rage 4 pass. Focus: full move lists, jump mechanics, level complexity and
progression tricks, enemy variety systems, signature differentiators.
Research by subagent via web search (summarized/paraphrased from public guides —
no verbatim FAQ text). Wiring status noted per finding.

### Already wired into the build (2026-10-06)
- Directional moves (→/←/↓ + HIT) — SoR4 Blitz / Scott Pilgrim dash attacks
- Jump + dive-kick jump attacks — Final Fight / Fight'N Rage
- Desperation attack (HP cost) — Final Fight (DDG×2)
- Taunt builds special meter — TMNT: Shredder's Revenge
- Palette-swap enemy variant tiers — SoR4 / TMNT Foot colors
- Destructibles spill pickups (breakables economy) — Final Fight / TMNT / SoR4
- 5 difficulties incl. Mania-style top end — SoR4 (Easy→Mania)
- Procedural infinite missions (Street Circuit) + escalating modifiers — Guardian Heroes branching spirit, SoR4 escalation

## 5. Final Fight (arcade, Capcom 1989)

**1. Full move list.** Two buttons (attack, jump). Ground combos are hit-gated chains: e.g. Haggar's Gut Punch → second Gut Punch (only comes out if the first hits) → branches into Suplex Behind (up/down/back + attack) or Side Hammer (attack again). Cody: punch combos ending in hook/uppercut; Guy: fast chop combos ending in elbow or spin-kick. Jump kick (attack in air), dropkick (directional jump + attack), body splash (down + attack during jump), with cancel variants (dropkick → body splash). Rear jump: press jump then immediately back — a long backward leap from which only the downward air attack is allowed. Grapple: walk into an enemy to grab; while holding: headbutt/face punches (repeatable "locked" sequence), throw (forward + attack), Suplex Behind (back + attack), positional walk-around. Jump grapple: jump onto an enemy then attack → piledriver (Haggar's signature). Special (jump + attack together): drains health if it connects, unusable at a sliver of life — Haggar: Double Lariat; Cody: tornado spin kick; Guy: Bushin spinning kick. Weapons: attack picks up/swings; Cody uniquely keeps reusing the knife without it breaking.

**2. Jump mechanics.** Jump is short and low; jump kicks are a primary spacing tool. Rear jump gives a long backward arc for repositioning. Guy uniquely gets an off-the-wall jump in areas with walls.

**3. Level complexity / progression.** 6 rounds across Metro City (Slum → factory/subway → Bay Area → Uptown → rooftop). Enemies spawn from doors, manholes, screen edges. Breakables (phone booths, barrels, tires, crates) hide food and weapons. Escalation via enemy HP/damage, simultaneous enemy count, and nastier types deeper in (knife/pipe carriers, firebomb throwers). No branching.

**4. Enemy variety.** ~10 types with palette-swap toughness tiers (Bred/Dug punks, G. Oriber the fat guy, Simons, Andore variants). Roles: grapplers (Poison/Roxy flip kicks), heavy charges (G. Oriber), weapon users, firebombers. Bosses: Damnd (punch rush), Sodom (katana), Abigail (rushing powerhouse), Rolento (grenades, staff vaults), Hugo Andore (piledriver grabs, too heavy to throw), Belger (crossbow → wheelchair final phase).

**5. Signature system.** The grab/throw wrestling system — walk-in grapples with held sequences, directional throw choices, the jump-in piledriver — plus the health-draining desperation special (jump + attack) that became genre standard.

---

## 6. Double Dragon (arcade, Technos 1987)

**1. Full move list.** Three-button layout (punch, kick, jump). Elbow smash (punch + jump together) — the meta-defining move; instant knockdown, spammable on wakeup. Hair-pull grab: hit a stunned enemy twice, then grab; follow-ups: knee strikes or over-shoulder throw (punch) / hair-pull kick (kick). Jump kick: press punch or kick in air; jumping straight up lets you pick direction (punch = kick right, kick = kick left). Headbutt, knee kick, whirlwind/backward kick, back elbow — positional strikes relative to facing (e.g. elbow hits enemies behind you). Weapons: punch picks up/uses; bats/whips swing, knives/dynamite/oil drums throw. Knock weapons out of enemy hands first. Press jump to break enemy grabs.

**2. Jump mechanics.** Dedicated jump button; jump kicks are directional (left/right/neutral). The elbow (punch+jump) is grounded but functions as the game's strongest punish. Jump also escapes holds and is the "continue" button.

**3. Level complexity / progression.** 4 missions: City Slum, Industrial Area, Forest (cliff climb, death-drop pit), Boss Hideout. Light environmental variety: ladder climbs, a pit, per-area weapon placements. The NES port adds the famous RPG "technical level" system — score over 999 = level-up unlocking new moves (headbutt, uppercut, hair-pull, etc.) across 7 levels. Arcade escalation: enemy count, HP, weapon-carrier frequency.

**4. Enemy variety.** Black Warriors gang with distinct AI: Williams (jump kickers, weapon users), Roper (knife), Linda (whip, fast punches), Bolo (tall, shoulder charges), Abobo (mid-boss bruiser, slaps, throws barrels), O'Hara/Chin Ta (karate), Jeff (palette leader), Willy (final boss — machine gunner, must be disarmed). Final twist: 1P vs 2P duel for Marian after Willy falls.

**5. Signature system.** Directional/positional strikes on a 3-button layout (elbows and kicks depend on which way the enemy is relative to you) plus grab-from-stagger (hit twice → grab → throw/knee) that every later brawler copied. The NES port's score-driven move-unlock system is the ancestor of River City Ransom's RPG layer.

---

## 7. TMNT Arcade (1989, Konami)

**1. Full move list.** 8-way joystick + 2 buttons (attack, jump). Attack: weapon swing; each turtle differs in range/speed (Donatello slowest, longest reach with bo; Raphael fastest, shortest with sai; Leonardo balanced katanas; Michelangelo fast mid-range nunchaku). Special (jump + attack together): spinning weapon sweep for Leo/Mikey/Donnie; Raphael instead rolls along the ground and finishes with a kick stab. Grab/throw: land hits then pull with joystick to throw Foot soldiers overhead — thrown enemies damage others on landing. Spring off walls in designated areas. Weapons are permanent (no degradation).

**2. Jump mechanics.** Standard jump + jump kick/attack. Wall-spring sections launch you into high jump attacks; Raphael's roll is a ground-travel alternative to jumping.

**3. Level complexity / progression.** 7 scenes: The Big Apple 3 A.M. (city street), Alleycat Blues, Sewer Surfin', through the Technodrome assault — includes a sewer-surfing auto-scroller, a rooftop/fire-escape sequence, wall-spring zones, and a mid-level Super Krang beam barrage. Breakables everywhere: traffic cones, parking meters, fire hydrants, exploding oil drums (damage enemies); pizza power-ups for health. Up to 4-player simultaneous co-op.

**4. Enemy variety.** Foot Soldiers in color-coded tiers (purple basic, blue with hooks, white with nunchaku, red shuriken throwers, yellow disc throwers) with rising aggression; Mousers, Roadkill Rodney wheel-bots, Stone Warriors; bosses Rocksteady, Bebop, Baxter Stockman (fly form with machine gun), the Shredder (gun → mutated super form).

**5. Signature system.** Wall-slam damage bonus — enemies take extra damage when slammed/thrown into walls or solid objects, making positioning (not just mashing) the core skill. Combined with overhead throws that bowl through crowds, the whole game is about using the environment as a weapon.

---

## 8. River City Ransom (NES, Technos 1989)

**1. Full move list.** Punch (A) and kick (B); the base kit is tiny but shops sell technique books adding moves: Acro Circus, Stone Hands, Dragon Feet, Grand Slam, Killer Kick (run + B, hold B to stay airborne), Drill (down, down), Headbutt (run + B), HeadBomb (hold B), Wheelbarrow Throw (grab downed enemy with A, hold B), Flip Throw (close + B), Glide Chop (jump + up, up), Jet Kick (hold B half a second), Slap Happy (run + A), Charge It (hold A), Slam Punk (close + A), Deadly Shot (run + jump + B), Nitro Port (forward x3), Speed Drop (grab with B, jump + up up), Shuriken (run + down down), Twin Kick (jump + mash B), Flying Kick (hold B, tap A). Weapon-specific: Pulper (down, down with stick/pipe/javelin), Chain Chump (down, down with chain). Weapons: stick, lead pipe, wooden crate, tire (rideable), javelin, chain, double chain (longest range), brass knuckles, rock, trash can (covers an enemy's head), paint box, cones. Punch picks up, kick throws; items persist on the ground and are fully reusable.

**2. Jump mechanics.** Jump + attack = jump punch/kick; techniques modify it (Glide Chop, Twin Kick, Speed Drop dive). The tire can be ridden. Jump is mostly spacing/dodge since many techniques are ground-based.

**3. Level complexity / progression.** Non-linear open world: roam River City freely, backtrack, enemies respawn on re-entry. Shops are safe zones selling food (heals + permanently raises Punch, Kick, Weapon, Agility, Stamina, Defense), technique books, spa treatments. Death is not game over — you lose half your cash. Password system saves stats/skills/money/bosses. Difficulty is player-driven: grind money from re-fighting bosses/gangs, buy stats, push further. An options menu can even tune difficulty, gravity, speed, and enemy count on the fly.

**4. Enemy variety.** Nine gangs, color-coded by T-shirt with distinct attack patterns: Generic Dudes, Frat Guys, Jocks, Squids, The Mob, International Players, Plague, Cowboys, River City High's crew. Gang leaders act as bosses with unique moves; final boss Slick at River City High. AI differs per gang (some prefer jump kicks, some weapons, some grapples).

**5. Signature system.** The brawler-RPG hybrid: persistent stat progression (food literally makes you stronger), a purchasable technique library, an open backtrackable city, and economic grinding as the core loop — the game is about getting rich and jacked, not just reaching the end.

---

## 9. Scott Pilgrim vs. The World: The Game (Ubisoft, 2010)

**1. Full move list.** Three attack buttons (fast, strong, super) + block, jump, throw, powerslide, taunt. Moves unlock by leveling up (per-character levels). Fast attack chain; strong attack stuns instantly; super attack costs willpower/guts — crowd-clear. Dash attacks: run + fast = sliding kick (passes through enemies, sets up combos); run + strong = shoulder tackle (short range, big damage, launches). Back attack (attack with enemy behind you): backward elbow. Low attack (down + fast): crouching kick hitting downed enemies. Grapple combo (left/right + fast near enemy): stomach punches, mash for more hits, combos into throw. Double Attack (fast then quickly strong): interrupt kidney-punch. Ground & Pound (down + strong near downed enemy). Tech Attack 1 (up + strong), Tech Attack 2 (down + strong): big directional specials (e.g. Scott's fiery upward punch). Block (some attacks unblockable), jump kick, powerslide (down-forward + jump — dodge + movement), taunt (makes enemies angrier). Support summon per character (e.g. Scott calls Knives Chau to stun all enemies); supports and supers scale with willpower.

**2. Jump mechanics.** Jump + fast/strong for jump kicks; jump is used to dodge and hit elevated enemies. No real air combos — air is for repositioning and drop-ins.

**3. Level complexity / progression.** 7 levels, one per evil ex (Matthew Patel → Lucas Lee → Todd Ingram → Roxie Richter → Katayanagi twins → Gideon Graves), each a themed Toronto district with pattern-heavy boss fights (Patel's invincibility disco spotlight, demon hipster chick summons). Subspace shortcuts: optional mini-game detours (fighting waves of flying pigs) that warp you ahead. Shops sell stat boosts (Strength, Defense, Speed, Willpower), health, XP snacks; leveling unlocks the move list. Complete Edition cheat extras: Boss Rush, Survival Horror, Blood mode.

**4. Enemy variety.** Street punks → paparazzi (camera-flash stun attacks) → demon hipster chicks → robots → vegan-powered bosses. Each evil ex has multi-phase patterns with summons and invincibility windows. Palette-swap tiers escalate HP/aggression per world. Unlockables: Nega Scott, Mr. Chau.

**5. Signature system.** RPG progression fused to a classic brawler: persistent per-character levels, a real move-unlock tree bought with XP, willpower as a super/summon resource, shops as build-crafting — plus taunt/support-strike flavor systems that make co-op chaotic.

---

## 10. Fight'N Rage (Seba Games, 2017)

**1. Full move list.** Three buttons (punch, jump, special). Punch combo chains auto-flow into forward/backward throws; holding up/down stalls other foes while throwing. Dash (double-tap direction); dash attacks (Norris's slide kick, Gal's Run Knee) cancel into another dash on hit and can be steered/canceled early with back. Special (costs HP unless the free-use timer is ready): per-character — Gal's spinning attacks, Ricardo's Tauro Uppercut (down, up + attack) and spinning lariat, Norris's slide combos. Secret moves: Gal — jump/fall backward, then up + attack on landing; Gal second — Run Knee, hold attack, down-up + attack on landing; Ricardo — Turbo Uppercut, hold attack, release on landing; Norris — 360 motion + special. Jump attacks: normal jump attack, jump + down + attack dive, air specials; juggle chains (blow-back → jump down+attack → air attack → special). Grabs: walk-in grabs; escape enemy grapples by tapping jump or special at the right moment. Parry: press toward an incoming attack just before it lands — negates it and grants a free special (no HP cost).

**2. Jump mechanics.** Jump is a combo tool first: jump attacks, dive kicks, and air specials all chain into juggles. Combined with dash-canceling, the air game is closer to a fighting game than a classic brawler.

**3. Level complexity / progression.** ~20+ short stages with branching path choices and multiple endings (route/performance-dependent). Stages mix street, industrial, and boss sequences; unlockable training/dojo and survival modes. Escalation: faster, armored, and grab-heavy enemies; later stages demand parry/juggle mastery.

**4. Enemy variety.** Three playable archetypes mirror enemy design: Gal (fast combo), F. Norris (balanced), Ricardo (slow powerhouse). Enemies: punk rushers, big bruisers, martial artists, bosses with "get off me" anti-grab moves and telegraphed patterns (machine-gun boss, bison-charge boss). Enemies telegraph clearly by design.

**5. Signature system.** Cancel-everything responsiveness + the parry: nearly every move cancels into something else, every attack can be evaded/parried/countered, specials recharge a free use every ~8 seconds, and parrying grants a free special — a fighting-game defensive layer (parry → free special → juggle) inside a brawler.

---

## 11. The TakeOver (Pelikan13, 2019)

**1. Full move list.** Punch + kick buttons with a branching combo flowchart. Punch/kick chains have branch points — e.g. kick,kick,kick → swing kick → punch → elbow → kick → rapid kicks → loops back to swing kick, creating potentially infinite loops. Launchers, juggle hits, ground bounces; maintaining combos fills meters faster. Grab/throw, dash attack, jump kick, jump-in attacks. Weapons: crowbars, katanas, machine guns in levels; each of the four playable characters also carries a sidearm pistol with scarce ammo for ranged pokes. Health-draining screen-clearing specials. Super meter (fills on landed hits, drains on damage taken; locks once maxed): punch + kick = full-screen blast. Rage meter (fills the same way): L3 activates — auto-blocks incoming attacks, double damage until depleted; best saved for bosses.

**2. Jump mechanics.** Functional but basic: jump kick for spacing and drop-ins, air attacks extend juggles. Jumping is mainly a combo-extension tool (launch → air hits → land → continue) rather than a movement system.

**3. Level complexity / progression.** ~22 levels across 7 stages and 20+ locations with constant gimmicks: bulldozer chase, falling lightning, sewer slime from above, an all-gun mutant stage with infinite ammo, breakable-laden streets. Two vehicle stages: a timed car-chase shooter (destroy enemy cars, avoid civilian cars, bonus time per kill) and a jet shooting stage (slide a reticle, survive to the goal). Three difficulties (Easy/Normal/Hard — Hard forces stage-1 start, no continues, faster/more aggressive enemies). Modes: Arcade, Survival, Challenge, unlockable Relay (swap all four characters in real time).

**4. Enemy variety.** ~20+ types with readable AI roles: gunmen, pipe/bat carriers, big blockers (must be hit during their attack startup), rushers, mutants. Enemy intros teach the counter. Stage-set bosses are genuinely hard, pattern-based fights.

**5. Signature system.** The dual-meter economy (Super + Rage, both built by aggression and punished by taking damage) plus the combo-flowchart design — punch/kick chains with explicit branch points and infinite loops — and a per-character firearm as a permanent ranged option.

---

## 12. Guardian Heroes (Treasure/Sega, Saturn 1996)

**1. Full move list.** Weak attack, strong attack, magic button, jump, guard — with Street Fighter-style motion inputs. Ground chains mix weak/strong; guard blocks; break attacks escape crowds. Specials via motion inputs: e.g. half-circle + magic = homing fireballs; dragon-punch/hurricane-kick-style physical specials (no MP cost, spammable). Per-character magic lists (Randy the black mage, Nicole the white mage with a luck-modified spell selection, Serena the knight/mage hybrid, Han the tank, Ginjirou the ninja) — powerful spells cost more MP and briefly drain you, leaving you open. MP regenerates by landing physical attacks, forcing a melee/magic rhythm.

**2. Jump mechanics.** Jump by pushing up (fighting-game style). Air attacks and air specials per character; jumping also dodges between planes.

**3. Level complexity / progression.** Branching-path story: after every level you choose where to go, leading to different levels, bosses, allies, and one of five endings. Stages include the Village of the Undead and Sky Spirit's Castle. Between scenes, an RPG level-up screen distributes points into six stats: Strength (damage + knockback distance), Vitality (HP), Intelligence (spell size/power), Mental Protection (MP + magic resistance), Agility (move/execution speed), Luck (damage variance + Nicole's spell selection). Versus mode: up to 6 players with ~45 unlockable fighters (heroes, bosses, monsters, civilians).

**4. Enemy variety.** Undead warriors, mages, beastmen, knights; bosses including Kanon the wizard and the Golden Silver. Archetype AI varies (casters keep distance, bruisers rush). The undead Golden Warrior is an NPC companion you command (attack/defend/Berserk — Berserk makes him rampage with powerful magic).

**5. Signature system.** Three-plane combat (foreground/middle/background, switched with shoulder buttons) eliminates the genre's eternal "line up on the Y-axis" problem and frees the buttons for fighting-game motion inputs — plus the branching story with five endings and the commandable NPC companion.

---

## 13. Streets of Rage 4 (Dotemu/Lizardcube/Guard Crush, 2020) — deep pass

**1. Full move list.** Per character: punch combo, jump attack, grab/throw (walk-in; mash attack to escape enemy grabs — some bosses like Max Thunder can't be grabbed and have permanent armor), plus:
- Blitz: double-tap forward + attack — dash attack (Axel: Grand Upper; Blaze: Hishousouzan; Cherry: Flying Knee; Floyd: Thunder Twins; Adam: Uzi Punch; Estel: Boot Mark; Max: Power Slide; Shiva: Final Crash; Roo: Handbrake; Zan: Elbow Slam).
- Defensive special (back + special): "get off me" crowd-clear (Axel: Dragon Wing; Blaze: Embukyaku; Cherry: Sound Check; Floyd: Thunder Sphere; Adam: Chopper; Estel: Flashbang).
- Offensive special (forward/neutral + special): big damage (Axel: Dragon Smash; Blaze: Kikou Shou; Cherry: Townshend Smash; Floyd: Magnetic Grab; Adam: Howl Fang; Estel: Police Tackle).
- Air special (special in air): e.g. Axel's Dragon Dive, Blaze's Tobi Kyaku.
- Star move: screen-clearing super fueled by collectible stars in breakables (Axel: Dragon Burst; Blaze: Tamashi Age; Cherry: Stage Entrance; Floyd: Rakushin Beam; Adam: Sword Strike; Estel: Tactical Support). Extra stars earned by zapping hidden "Bare Knuckle" arcade cabinets with a taser to fight retro bosses.
- Every character has an alternate move set (e.g. Blaze's Chou Reppa Dan, Energy Burst, Spirit Knife) — effectively two kits per fighter. Unlockable 16-bit retro characters (SoR1/2/3 versions of Axel, Blaze, Adam, Skate, Max, Zan, Shiva, Roo) with original kits.

**2. Jump mechanics.** Jump kick as the standard safe approach; air specials give real air offense; jump-ins start combos. No double jump; modest air control — depth lives in ground combos and juggles.

**3. Level complexity / progression.** 12 stages (Streets, Police Precinct, Cargo Ship, Art Gallery, Concert finale) with set pieces: throwing enemies out of windows, precinct lockdowns, elevator fights, a motorcycle chase, hidden retro-boss arcade cabinets. Breakables (crates, phone booths, arcade machines) hide stars, weapons (pipes, knives, tasers, bottles), food. Escalation: palette-swap tiers with new moves (Galsia variants, Donovan, R. Signal, Goro, Gem, Kickboxer, Bongo, Gourmand with body-splash juggles), more simultaneous spawns, reactive AI that dodges and punishes. Score + stage grade per level; lifetime score unlocks retro characters. Difficulty: Easy → Normal → Hard → Hardest → Mania.

**4. Enemy variety.** Large roster with explicit palette-swap tiers (the classic SoR system): Galsia (basic punk) → Donovan → R. Signal → Goro (boxer) → Gem (dropkick girl) → Kickboxer → Bongo (fat) → Gourmand (sumo splash) → Dylan (knife) → Raven (claw) → Murphy (cop), each tier faster/tankier with new attacks. Mini-bosses: the Y twins, Max Thunder (secret, armor, grab-immune), Mr. X, Ms. Y. Enemy AI is notably reactive: they dodge, back off, team up, punish whiffed specials.

**5. Signature system.** The health-risk special economy: specials cost HP, but lost HP is recoverable (green) — land hits without taking damage to win it back. This turns specials from panic buttons into calculated risk. Combined with wall-bounce juggling (knock enemies into walls and each other for extended combos) and per-character star moves, SoR4 is the modern template for "aggression is defense."

---

## Cross-game pattern notes (for Concrete Dragon design)

- **Desperation input (jump+attack)** appears in Final Fight, TMNT, Double Dragon (as punch+jump elbow), The TakeOver: a universal panic button, usually HP-gated.
- **Grab from stagger** (Double Dragon, Final Fight, Scott Pilgrim, Fight'N Rage): hit an enemy twice → grab → throw/knee. The genre's core crowd-control verb.
- **Palette-swap tiering** (SoR4, TMNT Foot colors, River City Ransom gangs, Double Dragon Jeff/Abobo colors): same skeleton, new colors + stats + 1-2 new moves = cheap roster depth.
- **Breakables as economy** (FF phone booths, TMNT oil drums, RCR shops, SoR4 stars, Scott Pilgrim shops): every game funds its power fantasy through the environment.
- **Movement-as-offense**: dash attacks exist in nearly all modern entries (Fight'N Rage, SoR4 Blitz, Scott Pilgrim, The TakeOver) — a gap in the oldest games.
- **Signature differentiators worth stealing**: Guardian Heroes' 3 planes (solves Y-axis lining frustration); SoR4's recoverable-HP specials (risk/reward); Fight'N Rage's parry→free special; River City Ransom's purchasable technique library + open city; TMNT's wall-slam bonus damage; The TakeOver's Rage auto-block mode; Scott Pilgrim's level-unlocked move tree.

*Sources: en.wikipedia.org (TMNT arcade, River City Ransom, Guardian Heroes), turtlepedia.fandom.com, gamefaqs.gamespot.com move lists (Final Fight arcade, Double Dragon arcade, River City Ransom, The TakeOver, Scott Pilgrim, Streets of Rage 4), gamingbolt.com (SoR4 wiki), segaretro.org (SoR4 characters), screenrant.com (SoR4 secrets), rockpapershotgun.com + steamcommunity.com + gamenguides.com (Fight'N Rage), gamespot.com + eurogamer.net + thegamer.com (Scott Pilgrim), nintendolife.com + everything2.com (River City Ransom).*

---

---

## 14. CONCRETE DRAGON — DESIGN SPEC (reference-backed)

### 5.1 Design rules (the law for all menus/UI)
1. **Show the fighter, never an icon.** Full-body 3D model on select
   (SoR2/SoR4 show full-body fighters; DBGT box art leads with characters).
   Colored circles are banned.
2. **Stat bars, not stat text.** Power / Speed / Toughness as bars
   (SoR2/3 select-screen convention) — readable at a glance on a phone.
3. **Tease locked fighters as silhouettes** with the unlock condition written
   under them (SoR4's blanked-out Adam slot). Mystery drives replays.
4. **One street identity everywhere:** near-black purple base (#150f2a),
   concrete gray, hazard-yellow (#ffcf2e) for actions, hot pink/cyan neon
   accents. Graffiti-weight display type (Impact/Black stack). No generic
   blue-gradient mobile-game look.
5. **Stage/mission cards look like fight posters** (SoR stage intros):
   district name big, palette swatch, boss name, best-wave record.
6. **HUD keeps identity persistent:** fighter name + HP bar top-left,
   cash top-right, combo counter big and centered (SoR combo counter),
   boss HP bar as a full-width event banner.
7. **Touch-first:** minimum 56px touch targets; movement = left-half drag
   (virtual stick); attacks = right-side buttons (punch / heavy / special /
   dodge). Nothing requires multi-touch precision.
8. **Every screen answers "what do I do next" in under 2 seconds.**

### 5.2 Screens
- **TITLE:** CONCRETE DRAGON logo, animated street backdrop (the 3D scene
  idling), TAP TO START. Meta line: best wave, cash.
- **CHARACTER SELECT:** live 3D model on a turntable (drag to rotate), name,
  street-style tagline, stat bars, skin row (style-only), locked silhouettes
  with unlock conditions, FIGHT button.
- **MISSION SELECT:** district cards in a horizontal scroll — district name,
  palette, mission list with boss + unlock rewards + best records.
- **SHOP:** Power / Tough / Hustle upgrades + supporter skin packs (cosmetic).
- **RESULTS:** KNOCKED OUT / MISSION CLEAR, stats (KOs, best combo, cash),
  unlock banners ("KINGPIN UNLOCKED AS PLAYABLE"), shop, FIGHT AGAIN.
- **HUD (in mission):** HP bars + names, cash, combo, special meter, mission
  progress bar (distance to boss), boss HP banner.

### 5.3 World / mission structure
- **District = mission set.** District has: name, palette (sky/fog/lights/
  building tints per the owner's art rule), mission list.
- **Mission = scrolling walk:** start at x=0, walk right; enemy spawn points
  along the route (SoR "enter area → fight → move on"); breakables (trash
  cans/crates) with cash/food; **boss arena at the end**.
- **Enemy families with named variants** (SoR2 system): base archetype
  (Street Thug) → variants gain HP, new moves, weapons, aggression as
  missions progress. Variants get street-style names.
- **Bosses are events:** intro banner + HP bar + 2–3 telegraphed attack
  patterns (Fatal Fury boss-presentation lesson). Beating a boss **unlocks
  them as playable** (owner directive) + unlocks the next mission.

### 5.4 Roster / progression
- Start: 3 fighters (Kid Blue / Ghost / Brick — names owner-vetoable).
- Unlock tracks (SoR4's two-track system, adapted):
  - **Milestone:** beat boss X → unlock fighter Y (bosses become playable).
  - **Missions:** clear mission → unlock its reward fighter.
- Data-driven FIGHTERS table: id, name, tagline, hp/dmg/spd, unlock rule,
  skin list. Save tracks unlocked roster.
- Style-not-power: skins and supporter packs are cosmetic only. Forever.

### 5.5 Combat (touch beat-em-up)
- Move: left-half drag (virtual stick) — x (forward/back) + z (depth,
  Fatal Fury lane lesson: depth dodges evade).
- Punch (tap), Heavy (button — slower, armor-break, bigger hit-stop within
  the feel law), Special (button — meter filled by dealing/taking damage,
  Urban Reign/Brawl Stars rule), **Dodge (button — quick sidestep with
  i-frames; NO block — owner's Urban Reign call)**.
- Launcher + juggles: every 3rd chained hit launches; taps while airborne
  juggle with damage falloff (Urban Reign's core combo shape).
- Counter: tap on the "!" telegraph (existing system, keep).
- Near-miss: dodge through an attack at the last moment → style cash bonus.
- Feel law (inviolable): slow-mo + long hit-stop for KO/counter/heavy/special
  only; normal hits stay snappy (≤90ms hit-stop).

### 5.6 Replayability
- **Daily seeded run** (DBGT's performance scoring + SoR4's lifetime score):
  date-seeded spawn sequence, one scored attempt per day, local leaderboard.
- **Local leaderboards:** best wave / best combo / fastest boss KO per
  device + shareable run code.
- **Endless mode** (existing waves) stays as the survival ladder.
- **Crowd: conditional** — sideline crowds only on missions flagged
  `crowd: true`, never everywhere (owner directive).

### 5.7 Content pipeline (ongoing, CC0-only)
- KayKit/Kenney mannequins, city packs, props (trash cans, crates, hydrants —
  SoR breakables need props); staged textures for district grounds.
- License manifest kept current (`game-3d/build/asset-manifest` + ASSETS_CREDITS.md).
