# PROJECT BIBLE — Concrete Dragon

> The world the `concrete-dragon-scene-builder` skill directs inside. Canon sources of truth: CD1 — `ART_DIRECTION.md`, `docs/GAME_DESIGN.md`, `docs/GAME_ANATOMY.md`, `docs/PROMO-CINEMATIC-KIT.md` in mhvnsnt/ConcreteDragon; CD2 — `docs/DESIGN.md`, `docs/DIRECTION-2026-11-07.md`, `docs/ROSTER-REDESIGN.md`, `docs/CD1-INHERITANCE.md`, `docs/CUSTOM-CHARACTER.md`, `docs/VERTICAL-SLICE.md`, `data/cd1_inheritance/*.json` in mhvnsnt/ConcreteDragon2. If anything here conflicts with those docs/data, the docs/data win — flag the mismatch, never propagate it.

## GAMES

- **CD1 logline:** Addictive mobile street brawler — tap combat, ragdoll KOs, battle pass, live service. "Tap. Beat them down. Next enemy walks in. Every KO different." Kid-friendly, colorful, all-ages; the money engine. Three-minute fights, skill first / wallet second, deterministic progression, a fighter that feels like YOURS.
- **CD2 logline:** Same block, same names, grown up. A humanoid 3D street brawler: real-proportioned fighters with weight and faces, fighting in full 3D space on Urban Reign's chassis — free-depth movement, grapples as a co-equal pillar, weapons and environment attacks, a partner at your side — fused with Def Jam: Fight for NY's style blending and the crowd as a living system, carrying CD1's fiction, zone grammar, two-currency economy, boss→unlock loop, and forever modes.
- **The split (binding):** CD1 stays the all-ages, color-blocked game in its own repo, exactly as it is. CD2 is the grown-up sequel in its own repo. **Nothing from CD2's tone leaks back into CD1.** CD1 is not replaced, ported, or re-toned.
- **Visual style CD1:** LOOK = Nintendo, FEEL = classic fighters. Sonic pop-art energy, Zelda painterly composition, Mario / Sunshine vibrant saturated color + subtle cel shading, Sonic Adventure 2 dynamic action poses, Luigi's Mansion moody-but-playful lighting. Saturated joyful color — orange, teal, blue, pink, purple night tones. Blocky toy-like fighters, color-blocked per fighter ("different colored Lego pieces put together"). Colorful night-city streets, clean readable HUD, chunky touch controls. Key art: dynamic action poses, bold readable silhouettes, diagonal composition, characters pushing toward the viewer, gloss and light, neon glow, wet-street reflections.
- **Visual style CD2:** Visually realistic urban — GTA / Urban Reign universe, Urban Mayhem kinship (AshLane / Wizard Gang / Western Heart fiction played as a realistic beat-'em-up). Real human proportions, faces, hands, cloth with weight; skin as textured skin, never flat color. Practical light on real materials — neon, sodium lamps, moonlight. CD1's colors survive only as ACCENTS (a fighter's signature color on real clothing, district neon as practical lighting), never as whole-body color blocking. NOT colorful/cartoony.
- **Aspect ratio:** 16:9 (cut format; confirm per cut spec — CD1 is also portrait/mobile-first in play, cinematics 16:9).
- **Default scene length:** one cinematic beat, 12 seconds when no cut spec exists. Format: 24fps; characters on twos (12 drawings per second) for drama, on ones (24 drawings per second) for action peaks, on threes only for labelled slow beats. Fight beats run on ones.
- **Scene types (no episode structure — this is a game):** CINEMATIC (story beat, zone intro, boss intro, unlock ceremony), FIGHT BEAT (finisher, Blazin'-tier super, grapple chain, weapon pickup, environment slam, KO), PROMO/TRAILER (30s character promo, 60s trailer), TITLE/MENU BEAT (character select, CREATE vs PICK start flow, unlock notification).

## CHARACTERS — THE EIGHT (roster.json verbatim; redesigns per docs/ROSTER-REDESIGN.md)

### KID BLUE — all-rounder · starter · accent: blue (CD1 fire-orange is his *effect* color)
- **Model / sheet:** CD2 `assets/fighters/kid_blue.glb` (+ textures in `assets/fighters/`) — in production per step-1 spec. CD1: `game-3d/build/assets/fighter.glb` (toy form).
- **Likeness lock:** Young man, lean-athletic build, tall-ish. Grew up on the corner-store steps breaking up fights — the block's own kid, not a mascot. Fitted cap and sneakers in Concrete Blue (his name is the accent), plain tee under an open overshirt, jeans, hand wraps. Warm skin, short hair, determined kid-next-door face. "Balanced brawler. Big heart, bigger hands." Bio: "Grew up on the corner store steps, learned to fight breaking up fights. Fights for the block, not for himself. Every punch is a promise to the neighborhood that raised him."
- **Signature law (BINDING):** DRAGON'S BREATH stays a real fireball — he is the ONE exception, the block's urban legend. Everything else of his is fists. Secondary: DRAGON RUSH (shoulder-first dash through the pack). Mega: DRAGON'S JUDGMENT (Blazin'-tier cinematic finisher). Stance: RUSH STANCE. Finisher: LAUNCHER (pop-up juggle). Grapple finisher: DRAGON SUPLEX. Fury: DRAGON FURY.
- **Voice:** PLACEHOLDER — no voice reference held.
- **Personality & speech style:** Fights for the block, not for himself. Determined, big-hearted, direct.

### GHOST — striker · starter · accent: violet
- **Model / sheet:** CD2 GLB queued after the slice (roster order: Ghost first after Kid Blue + Brick). Likeness source until then: docs/ROSTER-REDESIGN.md + roster.json.
- **Likeness lock:** A woman nobody can place — slight, fast, quiet. Dark street clothes that eat the light, long hair tied back, violet as a SINGLE accent (scarf / lining / nail polish register — one note, not a costume). Pale-on-purpose styling is OUT; she reads as someone who dresses to not be remembered. "Fast striker. Blink and you lose." Bio: "Nobody knows where she came from. She appears, the fight ends, she is gone. The streets whisper she is settling a debt no one can name." Played straight: a person with a past, not a phantom.
- **Signature re-stage:** PHANTOM STEP is SPEED, not teleportation — a blink step/ducker so fast the game sells it with an afterimage trail (violet). Secondary: BLINK FLURRY. Mega: MIDNIGHT REQUIEM. Stance: WRAITH STANCE. Finisher: BLINK STRIKE. Grapple finisher: PHANTOM DRIVER.
- **Voice:** PLACEHOLDER — no voice reference held.
- **Personality & speech style:** Quiet, slight, fast. Settling a debt no one can name.

### BRICK — grappler · starter · accent: rent-day amber
- **Model / sheet:** CD2 `assets/fighters/brick.glb` (+ textures in `assets/fighters/`) — in production per step-1 spec. CD1 toy form in `game-3d/build/assets/`.
- **Likeness lock:** A big man — former bouncer, broad and heavy with REAL weight (the roster's highest mass after Sledge/Kingpin). Tenants love him. Workwear that fits his frame: tee stretched over muscle, work pants, boots, FULL AFRO (step-1 pick), amber/rust accent in the shirt dye. "Walking wall. Hits like rent day."
- **Signature:** RENT COLLECTION — a command grab, unchanged. Secondary: SEISMIC SLAM — muscle and mass on concrete, no magic. Mega: RENT DUE. Stance: PAYLOAD STANCE. Finisher: CURB STOMP. Grapple chain: RENT-A-POWERBOMB → EVICTION NOTICE → FORECLOSURE.
- **Voice:** PLACEHOLDER — no voice reference held.
- **Personality & speech style:** The block's landlord-enforcer with a soft spot for tenants. Direct, heavy, unhurried.

### KINGPIN — grappler · unlock: beat boss Kingpin (m1) · accent: gold
- **Model / sheet:** CD2 GLB queued (roster order after Ghost). Likeness source: docs/ROSTER-REDESIGN.md + roster.json.
- **Likeness lock:** The block's old power, older than the starters, heavyset and tailored. "Used to run this block" is a suit-and-watch performance now, played by a man who lost it all. Dark suit worn like armor, heavy chain (the roster's charisma ceiling), watch, rings. Gold is jewelry and trim, NEVER body paint. "Used to run this block. Now he runs with you."
- **Signature re-stage:** ROYAL DECREE was an orb in CD1; in CD2 it is a thrown signal — he snaps, and the *block* answers (a summoned enforcer's hit / a dropped street hazard), keeping the move's zoning role with human means. Secondary: KINGPIN'S WRATH. Mega: HOSTILE TAKEOVER. Stance: IRON THRONE. Finisher: GAVEL DROP. Grapple finisher: HOSTILE SUPLEX.
- **Voice:** PLACEHOLDER — no voice reference held.
- **Boss intro (canon, verbatim):** "HE RUNS THIS BLOCK" — taunt: "You want the block? Come take it from me." Boss signature: KING'S DECREE. Patterns: slam, charge, summon.

### SLEDGE — grappler · unlock: beat boss Sledge (m2) · accent: rust/iron
- **Model / sheet:** CD2 GLB queued. Likeness source: docs/ROSTER-REDESIGN.md + roster.json.
- **Likeness lock:** Demolition-crew foreman, the roster's BIGGEST frame, silent. A working man built like the yard he guards. Hi-vis stripped back to a worn work vest, heavy boots, gloves, close-cropped hair, dust in the seams of everything. He carries the sledgehammer as a *weapon pickup identity* (Step 2's environment/weapon system), NOT a permanent prop. "Yard enforcer. Swings first, talks never."
- **Signature:** IRON CYCLONE — a spinning hammer swing, physics and momentum. Secondary: WRECKING SWING. Mega: DEMOLITION DAY. Stance: DEMOLITION STANCE. Finisher: DEMOLITION. Grapple finisher: DEMOLITION DRIVER. No elemental effects.
- **Voice:** PLACEHOLDER — no voice reference held (and he barely talks by design).
- **Boss intro (canon, verbatim):** "THE YARD ENFORCER" — taunt: "…" Boss signature: WRECKING BALL. Patterns: slam, slam, charge.

### VIPER — striker · unlock: beat boss Viper (m3) · accent: green
- **Model / sheet:** CD2 GLB queued. Likeness source: docs/ROSTER-REDESIGN.md + roster.json.
- **Likeness lock:** Fast hands, faster mouth — a talker who fought her way into respect. Light, coiled, always mid-sentence. Green as ONE sharp accent (jacket lining / hair streak / nails), athletic streetwear, gloves off, wraps on. Her silhouette is motion: nothing on her hangs loose. "Fast hands, faster mouth."
- **Signature re-stage:** SERPENT'S WAKE was a ground wave; in CD2 it is a low sliding sweep-takedown that travels — the wake is the crowd of dust and the bodies it passes through. Secondary: VENOM DASH. Mega: SERPENT'S COIL. Stance: COIL STANCE. Finisher: FANG BARB. Grapple finisher: VENOM POWERBOMB. Boss signature: SERPENT'S EMBRACE (a clinch choke chain).
- **Voice:** PLACEHOLDER — no voice reference held.
- **Boss intro (canon, verbatim):** "FAST HANDS, FASTER MOUTH" — taunt: "Talk is cheap. Watch my hands." Patterns: flurry, charge, summon.

### DUST — striker · unlock: beat boss Rust (m4) · accent: desert tan
- **Model / sheet:** CD2 GLB queued. Likeness source: docs/ROSTER-REDESIGN.md + roster.json.
- **Likeness lock:** A drifter — lean, weather-beaten, arrives with the fight and leaves before it settles. The roster's LIGHTEST, FASTEST body. Sun-faded layers, dust-colored fabrics (tan as *cloth*, not skin), a wrap/scarf against the grit, worn boots. He looks traveled, not costumed. "Quick hands. Gone before you blink."
- **Signature re-stage:** DESERT SPIKES was a ground eruption; in CD2 it is a stomped debris burst — he kicks the street itself up (broken concrete, grit, a flipped street hazard) in a spike pattern. Secondary: DUST DEVIL. Mega: DUST BOWL — a full-arena dust-out brawl beat. Earth, never fire. Stance: STORM STANCE. Finisher: CYCLONE LIFT. Grapple finisher: DUST DEVIL DRIVER.
- **Voice:** PLACEHOLDER — no voice reference held.

### JACK — all-rounder · unlock: beat boss Pumpkin King (h3, Halloween) · accent: harvest orange
- **Model / sheet:** CD2 GLB queued. Likeness source: docs/ROSTER-REDESIGN.md + roster.json.
- **Likeness lock:** The harvest festival's fallen king — a seasonal legend the block half-believes. In CD2 he is a man who *wears the harvest*: the pumpkin is a carved festival mask and regalia he puts on, armor made of a season. Dark festival gear, the mask carried or worn, orange as lantern glow and trim. When the mask is OFF he is an ordinary, tired man — that contrast IS the character. "He wears the harvest. The harvest wears you."
- **Signature re-stage:** PUMPKIN BOMB is a thrown festival gourd packed as an improvised smoke/firework charge (a street weapon, human-made) — the one non-Kid-Blue "explosive" in the roster, and it is plainly a device, not a power. Secondary: CANDLE RUSH. Mega: GREAT PUMPKIN — plays the festival itself turning on the opponent (crowd system). Stance: HARVEST STANCE. Finisher: PORCH STOMP. Grapple finisher: HARVEST SUPLEX.
- **Voice:** PLACEHOLDER — no voice reference held.

### BOSSES AS PEOPLE (roster.json `bosses` — intros/taunts canon, verbatim)
- **RUST — "THE RUST GIANT"** — taunt: "Everything breaks. Even you." Signature: RUST STORM. Unlocks Dust. The scrap-yard giant.
- **THE CONCRETE DRAGON — "THE NAMESAKE"** — taunt: "I AM the concrete. I AM the dragon." Signature: DRAGON'S MAW. Re-staged in CD2 as a crew legend whose name the block fears (a person, not a creature). Unlocks the Dragon Fire skin for Kid Blue.
- **THE PUMPKIN KING — "HE WEARS THE HARVEST"** — taunt: "The harvest claims its due." Signature: ROYAL HARVEST. A man in the harvest mask, not a pumpkin creature. Unlocks Jack.
- **CARMILLA — "THE VAMPIRE QUEEN"** — taunt: "The night is mine, little brawler." Signature: BLOOD MOON. Re-staged in CD2 as a nightclub power in Dead Man's Row (a person, not a creature). No fighter unlock.
- **THE FOREMAN — "THE SHIFT NEVER ENDS"** — taunt: "Clock is ticking. So are you." Signature: OVERTIME. The Works' shift boss. Unlocks the Shop Foreman skin for Sledge.
- **THE WARDEN — "NO ONE LEAVES"** — taunt: "Nobody leaves my block." Signature: LOCKDOWN. The Steel Cell's keeper. Unlocks the Cell Block skin for Brick.
- **Unlock law (binding):** Beat a boss → play the boss (or their skin). Carried verbatim into CD2.

### THE NARRATOR
- **Role:** Speaks at STORY BEATS ONLY — scarcity is the point (canon law carried from CD1).
- **Voice:** PLACEHOLDER — no voice reference held. Standing rule (CD1 PROMO-CINEMATIC-KIT): the owner's own voice only, never a cloned voice.

### CUSTOM FIGHTER (create-a-fighter)
- **Role:** First-class citizen — same zones, same bosses, same unlock law, same economy. One of the two front doors at game start: CREATE YOUR FIGHTER or PICK A FIGHTER (Urban Reign-style roster select, live 3D models).
- **Likeness lock:** Built from CD2-original template bodies on the CD2 standard humanoid skeleton (never a generic stock-soldier base); parts via the slot/socket system (head / upper body / lower body / accessories; sockets: head_socket, hand_L, hand_R, back, waist, feet; shoes their own slot); dye presets incl. Noir for every fighter; gear and ink bought with cash raise charisma → crowd hype rate → crowd favor. Canon fighters are never edited in place — "Use as Base" copies a roster fighter into a custom slot.
- **Voice:** PLACEHOLDER — no voice reference held.

## DISTRICTS / ARENAS

### CD1 zones (7 + Side Hustles) — become districts on the CD2 takeover map
- **Z1 CONCRETE ORIGINS** — "Where it all started. Four blocks, four lessons." (start)
- **Z2 DEAD OF NIGHT** — "The graveyard shift. Things walk that should not." (unlock: m2)
- **Z3 THE MAZE** — "Dead ends, ambush pockets. The block fights back." (unlock: h3)
- **Z4 HIGH RISE** — "Up is the only way through. Jump." (unlock: z1)
- **Z5 THE UNDERGROUND** — "Below the streets, the tunnels remember everything." (unlock: p3)
- **Z6 THE WORKS** — "The factory never stopped. Neither do you." (unlock: u3)
- **Z7 STEEL CELL** — "Four walls, one way out. Through them." (unlock: w3)
- **SIDE HUSTLES** — "Endless scraps, daily grinds, infinite road." (start)

### CD2 districts (9) — CD1 palettes survive as LIGHTING DIRECTION ONLY
- **NEON ROW** — swatch #4fd1ff / #ff4fd8. Practical neon as lighting on real materials.
- **THE YARDS** — swatch #ff8c42 / #ffb03d. Sodium/amber yard light.
- **LITTLE HAVANA** — swatch #ffd166 / #2affd5.
- **DOCKSIDE** — swatch #8a9a9e / #5a8aa8. Cold grey-blue dock light.
- **DEAD MAN'S ROW** — swatch #9a4dff / #ff8c2a. Carmilla's ground; purple night + orange.
- **THE UNDERGROUND** — swatch #ffd166 / #3a6a8a. Tunnel amber + steel blue.
- **THE WORKS** — swatch #ff8c42 / #6ab8d8. Factory orange + steel.
- **THE OVERPASS** — swatch #ffb347 / #7af0ff.
- **THE IRONWORKS** — swatch #ffb35c / #4de1ff.
- **Arena asset paths:** TBD — no saved arena plates exist yet in either repo. CD2 arenas are the block corner (vertical-slice arena) + district sets built from `data/cd1_inheritance/zones.json` + the CD1 environment GLBs (`game-3d/build/assets/street.glb`, `roads.glb`, `industrial.glb`, Kenney City Kit props CC0 in `game/assets/props/`). Until plates exist, direct from the district lighting direction + the arena name.
- **Mood & lighting CD1:** colorful night-city streets, purple ambient light, neon glow, wet-street reflections. **CD2:** the district's practical light (neon, sodium, moon) on real materials.

## PROPS
- **Pipe / bat / bottle** — weapon pickups (limited durability, throwable, catchable — SoR4 model). CD2 Step 2: one pipe pickup + one wall/fence environment slam.
- **Sledgehammer** — Sledge's weapon-pickup identity (Step 2 environment/weapon system), NOT a permanent prop.
- **TAG SPOT wall** — spray the wall (3s, vulnerable). Big cash + 15 REP. A scene beat in its own right.
- **Charms (6, physical gear in CD2)** — BRASS KNUCKLES (+10% all damage, unlock: beat Kingpin), LUCKY DICE (+15% luck, unlock: circuit 5), SECOND WIND (revive once per mission at 1 HP, unlock: beat Sledge), CASH MAGNET (+25% cash, unlock: beat Viper), ADRENALINE (+20% energy gain, unlock: beat Rust), IRON WILL (+15 max HP, unlock: beat Pumpkin King). Bought/found in venue shops; same effects, same unlock bosses.
- **Graffiti "CONCRETE DRAGON" logo** (white or purple/gold) — the approved brand mark, in-world as signage/decals.
- **Breakables** — dumpsters, hydrants, cars, crates, barrels; some breakable, with pickups inside (health food, cash — SoR apple/chicken model).
- **Crowd strip** — CD2: a meter, a weapon rack, and a judge. Hype fed by variety and aggression; crowd holds opponents, hands you weapons, turns on a boring fighter.

## UNIVERSE LANGUAGES (one set per game, never flattened)
1. **CD1 — THE TOY BLOCK.** Nintendo look / classic-fighter feel. Saturated, cel-shaded, toy-like.
2. **CD2 — THE REAL BLOCK.** Realistic urban, GTA / Urban Reign. Real people, practical light, CD colors as accents only.
3. **THE CROWD.** Meter, weapon rack, judge (CD2).
4. **THE FIGHT VERBS.** Strike strings, grapple/clinch, throw chains, weapon pickups, environment slams, launchers + juggles, dodge with i-frames. One verb per shot.
5. **THE MONEY MOMENT.** KO slow-mo + camera push-in, hit-stop scaled by damage, hit spark + impact ring, color-coded screen flash (counter cyan / damage red / KO white), combo counter tiers.
6. **THE TAKEOVER MAP.** Zones are districts; winning a zone's boss takes the territory; shops/trainers open there.
7. **THE TWO FRONT DOORS.** CREATE YOUR FIGHTER or PICK A FIGHTER — live 3D models on the select screen.

## CAMPAIGN NOTES
- **Missions (26, in order):** m1 FIRST BLOOD, m2 SCRAP YARD, m3 NIGHT MARKET, m4 RUST BELT, m5 OVERPASS RUN, m6 FACTORY FLOOR, h1 GRAVEYARD SHIFT, h2 HARVEST MOON, h3 ALL HALLOWS, mz1 RAT RUN, mz2 SCRAP LABYRINTH, mz3 CRYPT WALK, p1 ROOFTOP RUN, p2 FIRE ESCAPE, p3 CRANE YARD, u1 TUNNEL RATS, u2 GHOST PLATFORM, u3 TERMINUS, w1 CONVEYOR LINE, w2 FURNACE FLOOR, w3 SMOKESTACK, c1 CHAIN LINK, c2 LOCKDOWN, c3 TOP OF THE CELL, endless ENDLESS SCRAP, daily DAILY RUN. Same ids/order/unlock chain/bosses as CD1. CD1's scroll-length stages become full-3D Urban Reign-style arenas and street runs inside their district.
- **Modes:** Zone campaign (7 zones + Side Hustles; zone arcs end in boss fights). ENDLESS SCRAP — mutator cycle every 30m walked: SWARM, BRUTES, FEVER, SECOND WIND, GLASS JAW; seeded procedural bosses (NIGHTMARE/IRON/BLOOD/RUSTED/HOWLING/VENOM/ASHEN/BRASS/HOLLOW/SAVAGE/CRIMSON/OBSIDIAN prefixes). DAILY RUN — date-seeded (YYYYMMDD mulberry32), one scored run, district rotates neon/overpass/industrial. Seasonal events — Halloween first, exclusive unlocks.
- **Economy:** Cash + REP. Cash: purses, drops, TAG SPOT, charms. REP: TAG SPOT +15 REP, wins/streaks; in CD2 REP converts to crowd hype rate + charisma. Upgrades: POWER (+12% damage/level), TOUGHNESS (HP), HUSTLE (cash/economy). Cosmetics NEVER affect power.
- **Vertical slice order (gates what exists to direct):** Step 0 two front doors → Step 1 Kid Blue + Brick, one arena (the block corner), full-depth movement + follow camera → Step 2 fight verbs → Step 3 one style blend (Brick earns a second style) → Step 4 one Blazin'-tier finisher + crowd → Step 5 OWNER PLAYTEST (verdict gates everything after). Nothing else gets built before this.
- **Style blending (CD2 identity):** start in one style; earn a second (and third) through the story; moveset hybridizes — strikes from one, grapples from another, a blended finisher. Trainers = how styles are earned (venue takeover + style blending lock together).
- **Engine:** Godot 4 first, architected for a later Unreal transition (Lyra = transition target). Data in engine-agnostic JSON, models/animations GLB on the standard humanoid skeleton, textures PNG, audio WAV/OGG. A cinematic prompt never names an engine-specific asset format.
- **Voice refs held 0/8.** Voice tags in any scene prompt are PLACEHOLDERS until the owner approves a donor clip per character. Never invent a voice. Owner's own voice only, never a cloned voice.
- **Skin-tone lock:** never whitewash/lighten any fighter. **Body fidelity:** draw the person's real build, never slim.
- **A cut the owner confirmed good must NOT be extended.** New beats go in a NEW scene, later in the flow — never inserted between confirmed beats. Work forward.
- **SUPERSEDED (do not use as canon):** CD1 `docs/GAME_DESIGN.md` §3 lists an old launch roster (Rook, Vex, Sable, Juno, Mack, Iris, Hollow Point). The live extracted `data/cd1_inheritance/roster.json` (Kid Blue, Ghost, Brick, Kingpin, Sledge, Viper, Dust, Jack) is canon; the GDD roster predates it.
- **OPEN (owner's call):** continuity — same cast redesigned as realistic people; whether they are literally "grown up" in-story is still open (DESIGN.md B7 #5).
- **Licence (logged honestly, never a gate):** CD2's studied sources — Urban Reign, Def Jam Vendetta + Fight for NY (Icon EXCLUDED), Epic's Lyra, Urban Reign Redux, Devil Within and the owner's other beat-'em-up teardowns — contribute systems and craft only. Their models, names, music, logos, and likenesses never enter the repos (FREE-GAME RULE). CD1/CD2 fighters, names, and fiction are the owner's own originals.
