# Concrete Dragon — 3D Platformer Mechanics Inspiration Study
**Stored in repo docs per RESEARCH-TO-REPO LAW (owner 2026-10-16). Source: `~/workspace/research_notes/3d-platformer-inspiration-study-20261010-0218/report.md` (deep-research mission, 2026-10-10). All findings are index-sourced (search + page text), NOT hands-on verified. Validation status: mechanics marked "WIRED" below have been implemented and playtested in Concrete Dragon; everything else is a candidate awaiting a grey-box prototype — a finding without a pull-in is incomplete work.**

**Gap note vs existing docs:** `RESEARCH_NINTENDO_VISUAL.md` covers the Nintendo LOOK (key art, cinematics, camera language). `RESEARCH_FIGHTER_MECHANICS.md` covers the fighter FEEL (Final Fight / SoR / SF / Tekken combat). This doc covers the MOVEMENT/FEEL PHILOSOPHY from 3D platformers (Mario 64 / Sunshine / Sonic Adventure / Luigi's Mansion) — momentum, camera-as-character, one-deep-tool, character verbs, hub-as-playground, tug-of-war grapples. No duplication by design.**

---
## 1. SUPER MARIO 64 — Movement Feel & Camera

### Stealable ideas (ranked by impact)

**1.1 Never let the player fully stop: moves feed into and break out of each other.** (Highest impact)
The defining quality of Mario 64's movement is that moves chain or cancel: chain jumps, flip off walls, add long jumps without slowing; dive from the air and instantly flip upright into a sprint; long-jump over thin air and ground-pound onto a tiny target. Eurogamer's retrospective frames it as "countless deliberate quirks to keep movement going at any cost." A brawler steals this as a combo/traversal grammar: punch strings cancel into dodges, dodges into dive-kicks, knockdowns into sprint recovery — the fighter should feel like a pinball that never fully halts, not a statue between attacks. Momentum management, not button timing, becomes the skill ceiling.
*Source: https://www.eurogamer.net/what-made-super-mario-64-so-special (index, crawled ~310 days ago)*

**1.2 Make signature moves fixed-commitment and "already max power."**
The backflip, side flip, and triple jump don't scale with button-hold time — they're full-power the instant they fire; the skill is getting the spacing right and finessing the landing mid-air. For Concrete Dragon: make specials (launcher, dive-bomb, dash uppercut) instant, single-press, full-commitment bursts. Depth comes from *where and when*, not charge meters. This is also cheaper to implement and reads better in a fast brawler.
*Source: https://www.eurogamer.net/is-super-mario-64s-movement-still-the-best-in-gaming (index)*

**1.3 Analog-feel locomotion: graded speed, visible lean, acceleration ease-in.**
Mario 64 maps stick tilt to tiptoe→walk→sprint, and turns have real heft — the famous torso-first "superbike lean" before a side flip. Steal: even on digital inputs, give fighters acceleration curves, a visible lean into direction changes, and a brief "compression" crouch before bursts. This is what makes blocky characters feel alive instead of sliding tokens. (Miyamoto reportedly spent months on movement before building anything else — a uwm.edu design essay confirms the priority.)
*Sources: https://www.eurogamer.net/is-super-mario-64s-movement-still-the-best-in-gaming (index); https://sites.uwm.edu/digital-cultures-collaboratory/2021/02/01/the-freedom-of-super-mario-64/ (index)*

**1.4 One move, three jobs: the dive.**
Mario's dive attacks enemies *without stopping his momentum*, or after a jump becomes an instant speed burst. Steal a single shoulder-dive for Concrete Dragon that is simultaneously a gap-closer, an attack, and a repositioning tool. One input, context-dependent payoff — maximum moveset density per button, which matters for an indie control scheme.
*Source: https://videodb.org/super-mario-64-retrospective/BRAKFmTcxfI (index)*

**1.5 Lakitu cam: low, close, and characterful — never a sterile top-down.**
Mario 64's camera sits closer and lower than its successors, giving a hand-held, "selfie-stick" involvement — including an upward whiplash snap to the sky when Mario pirouettes. Pietriots notes Lakitu's refusal to pass through walls was a clever way of hiding technical limits ("self-aware"). For a brawler: keep the camera low behind the fighters so jumps and launchers punch *up* into frame; give it slight lag/sway personality; slice or fade geometry rather than clipping. Bonus charm: personify the camera in-fiction (a drone filming the street fights) the way Lakitu justified the then-novel controllable camera to players.
*Sources: https://www.eurogamer.net/is-super-mario-64s-movement-still-the-best-in-gaming (index); https://pietriots.com/2021/04/23/super-mario-64-still-wallkicking/ (index); https://www.avclub.com/super-mario-64-introduced-the-camera-as-a-friend-and-fo-1798250469 (index)*

**1.6 Teach space without preaching: the Bob-omb Battlefield opening.**
The first level is a safe, open, friendly arena that teaches 3D movement through play, not text: landmarks (mountain, floating island, cannon) act as navigational beacons; the first mission is simply "climb the mountain," teaching verticality; rolling iron balls on the path force the player to develop depth perception; the giant Chain Chomp teaches scale and fear wordlessly. Steal: Concrete Dragon's first stage should be a readable plaza with one big legible objective (reach the boss at the top of the parking structure), environmental hazards that teach dodging by doing, and a miniboss whose size alone communicates threat.
*Sources: http://goombastomp.com/super-mario-64-level-bob-omb-battlefield/ (index); https://247videogame.com/mario-64s-bob-omb-battlefield-is-gamings-most-important-3d-platforming-level-art-of-the-level/ (index); https://feliciarondo.com/reviews/video-games/2025/Super-Mario-64/course/1.Bob-omb-Battlefield/ (index)*

**1.7 Star structure: few dense arenas × many objectives.**
15 courses, 6 missions each, 120 stars (70 to finish): the same space revisited with new goals, plus off-path collectibles (100-coin stars, red coins) and a per-world star checklist on the pause screen. For a $4.99 indie: build a small roster of dense street arenas, each with 5–6 "jobs" (beat the boss, 100-hit combo, find hidden pickups, time trial). Asset-efficient, replayability-rich.
*Sources: http://www.mariowiki.com/SM64 (index); https://www.thesixthaxis.com/2010/09/13/mario-64-a-modern-masterpiece/comment-page-2/ (index)*

**1.8 The hub is itself the biggest level (Peach's Castle).**
The castle is explorable, secret-stuffed (ceiling painting, tiny hole to the aquarium), and opens gradually with star count — progression you can walk through. Steal: one explorable neighborhood hub for Concrete Dragon that physically grows as you earn "rep" — new alleys unboard, rooftops unlock — with secrets that teach advanced moves.
*Sources: https://www.syfy.com/syfy-wire/peachs-castle-was-the-best-part-of-super-mario-64?amp (index); https://www.eurogamer.net/what-made-super-mario-64-so-special (index)*

---

## 2. SUPER MARIO SUNSHINE — Tool Versatility, Hub, Joyful Aesthetic

### Stealable ideas (ranked by impact)

**2.1 One tool, multiple verbs — designed from "function" first.** (Highest impact)
FLUDD's nozzles (spray / hover / turbo / rocket) are one device with modal verbs. Crucially, per Tezuka in a Washington Post interview, FLUDD was invented to solve a real design problem: 3D space was hard to judge in Mario 64, so hover became a "slow fall in low gravity" mistake-corrector, and water beat enemies because stomping in 3D was unreliable. Steal the method: identify Concrete Dragon's hardest-feeling problem (e.g., judging 3D spacing in a brawl) and invent *one* signature gadget with 3 modes to solve it — e.g., a chain-whip that pulls enemies in (spacing fix), launches the fighter upward (verticality), or dashes (reposition). One button, modal, deep.
*Sources: https://nintendoeverything.com/mario-devs-on-f-l-u-d-d-in-super-mario-sunshine-importance-of-function-in-character-design-more/ (index); https://www.eurogamer.net/super-mario-sunshine-retrospective (index)*

**2.2 A safety-net mechanic that makes players bolder.**
FLUDD's hover is described as "a variation on Smash Bros. rescue moves" — because falling in Sunshine is often worse than death, the safety net removes frustration and players attempt far crazier traversal. Steal: generous air recovery in Concrete Dragon (air-dash reset on hit, forgiving juggle windows) so players attempt risky aerial combos instead of playing safe. Boldness is fun; the net is what buys it.
*Source: https://www.eurogamer.net/super-mario-sunshine-retrospective (index)*

**2.3 The hub as playground, not menu (Delfino Plaza).**
Eurogamer calls Delfino Plaza "one of the all-time great videogame playgrounds... often more fun than the levels it hosts": jetskiing, Superman jumps, impromptu banana basketball, launching durians over beach parasols. Steal: Concrete Dragon's hub street should be a toy box between missions — kickable trash cans, bouncy awnings, smashable crates with silly physics. Players will idle in your game instead of quitting to menu, and every toy teaches a mechanic.
*Sources: https://www.eurogamer.net/super-mario-sunshine-retrospective (index); https://www.neogaf.com/threads/super-mario-sunshine-gaf-opinion.1411183/page-2 (index)*

**2.4 Saturated joy on gritty bones: progress made visible as brightness.**
Sunshine's look — bright clear colors, shimmering water, crisp shadows, tropical music — plus one killer detail: as you progress, the world literally gets lighter, rewarding progress. Steal directly for the "gritty brawler, Nintendo brightness" brief: render the streets in saturated primaries, and make each reclaimed district visibly brighten — neon signs flicker on, grime washes into color. Progress readable at a glance, no UI needed. (Also: Shadow Mario shows an ominous villain can work inside a cartoony palette — your boss designs can be menacing without going desaturated.)
*Sources: https://theyorkerarchive.github.io/2012/www.theyorker.co.uk/news/games/6366.html (index); https://www.cbr.com/this-beachside-romp-is-one-of-super-marios-best-adventures (index)*

**2.5 Environmental contrast as game state (clean vs. graffiti).**
Isle Delfino's beauty vs. Shadow Mario's pollution: cleaning is visible progress. Steal: enemy "turf" rendered desaturated/grimy; reclaiming streets restores color. The city itself becomes the progress bar.
*Sources: https://www.cbr.com/this-beachside-romp-is-one-of-super-marios-best-adventures (index); https://www.eurogamer.net/super-mario-sunshine-retrospective (index)*

**2.6 Interconnected world-building.**
You can see Ricco Harbor from Bianco Hills and Pinna Park from Serena Beach — everything visibly connected, "feels like a vacation." Steal: let players see the next boss's tower from the hub; keep skyline continuity between districts. Cheap (it's just vista geometry) and hugely grounding.
*Source: https://www.neogaf.com/threads/super-mario-sunshine-gaf-opinion.1411183/page-2 (index)*

**2.7 Keep the tool a "silent partner" — and never strip it in mandatory missions.**
Two cautionary lessons. One: Eurogamer argues FLUDD's most-hated trait was its constant chatter — it would have landed better as a silent partner like the Poltergust. Two: Miyamoto built FLUDD as a mistake-corrector, then the mandatory FLUDD-less secret courses punished players for relying on it — a decision he reportedly called cruel and regretted, and which directly shaped Galaxy (one-button spin; brutal challenges moved to optional post-game). Steal: Concrete Dragon's gadget communicates through animation and feel, never tutorial voice; and if you ever design "no-gadget" challenge missions, keep them optional.
*Sources: https://www.eurogamer.net/super-mario-sunshine-retrospective (index); https://www.tiktok.com/@lostdelfino/video/7609880560550350110 (index, paraphrased design-trivia summary)*

---

## 3. SONIC ADVENTURE 1 & 2 — Character Playstyles, Speed, Visual Dynamism

### Stealable ideas (ranked by impact)

**3.1 Character-specific campaigns: different verbs, not skins.** (Highest impact)
SA1 shipped six genuinely distinct playstyles: Sonic's speed-platforming, Tails' races, Knuckles' emerald-shard treasure hunting, Amy's evasion, Gamma's timed shooting (Big's fishing is the widely-cited misstep). SA2 condensed this to three pillars — speed / treasure hunting / mech combat — reskinned across hero and dark casts. Steal: give Concrete Dragon 3–4 fighters who each play a different game inside the same engine — e.g., a brawler, a grappler built around the tug-of-war loop (see §4), a speedster with time-trial missions, a "hunter" who must find hidden targets in an arena. Roster depth without roster bloat.
*Sources: https://fextralife.com/retrospective-sonic-adventure/?query-0-page=2 (index); https://tvtropes.org/pmwiki/posts.php?discussion=12985657500a57372900&page=2716 (index)*

**3.2 Match each fighter's verbs to their theme.**
Tails' campaign works because his arc is independence and his gameplay is literally beating Sonic at his own game (GameRant). Steal: each Concrete Dragon fighter's mission verbs should echo their story — the ex-cop gets timed "raid" missions; the street kid gets chase/escape missions. Theme-verb alignment is free characterization.
*Source: https://gamerant.com/sonic-adventure-playable-characters-ranked/ (index)*

**3.3 The Chao Garden: a cyclical side loop that feeds the main game.**
The garden is the series' great retention mechanic: destroy robots → collect animals/parts → raise and race Chao → a calming contrast to breakneck action, and "something to think about and plan for" after the story ends. The loop is cyclical — main game feeds garden, garden rewards feed back. Steal: a low-stakes side hook for Concrete Dragon — e.g., a stray-dog hangout or crew clubhouse you supply with pickups found in levels; feeding/caring grants small combat buffs or cosmetic unlocks. For a $4.99 game, this is the cheapest possible retention engine, and it gives non-combat players a reason to stay.
*Source: https://Www.Thegamer.com/sega-its-time-to-bring-back-the-chao-garden-sonic-adventure-yuji-naka/ (index)*

**3.4 SA2's "bursting toward the viewer" key-art energy.**
Yuji Uekawa's SA1/SA2 art direction — graffiti-like radical poses, metallic shading, characters lunging at the viewer (exhibit notes even cite City Escape concept art of "tricked-out semi trucks barreling towards you"). Steal: Concrete Dragon's key art, victory poses, and UI should lunge toward the camera — low-angle hero shots, motion smears, speed lines, graffiti-piece composition. The attitude is in the *framing*, not the polygon count.
*Sources: https://www.sonicstadium.org/forums/topic/14019-the-evolution-of-modern-sonic/page/3/ (index); https://news.tailschannel.com/35-years-of-speed-art-exhibit/ (index); https://segaretro.org/Yuji_Uekawa (index)*

**3.5 Cinematic set-piece stages where the environment shows off.**
SA2 imitated Hollywood action blockbusters — spectacular set pieces were "a rarity among 3D platformers" — while keeping moment-to-moment gameplay simple. Steal: one or two spectacle stages (runaway truck chase, collapsing scaffolding) where the environment does the showing off and combat stays basic. Scripted spectacle is cheap compared to systemic depth and sells trailers.
*Source: https://Www.Cbr.com/sonic-adventure-2-set-3d-sonic-game-standard/ (index)*

**3.6 The tonal blend: gritty-industrial enemies vs. colorful heroes.**
SA2 deliberately contrasted militarized, industrial robotic enemies against colorful foes, "redefining Sonic as an action series" without losing brightness. This is the exact formula the mission asks for: gritty street-brawler enemies, saturated Nintendo-bright heroes and streets.
*Source: https://Www.Cbr.com/sonic-adventure-2-set-3d-sonic-game-standard/ (index)*

**3.7 Don't ship Big the Cat: every playstyle must clear the fun bar.**
Big's fishing is remembered as the misstep that proves the rule — variety is not an excuse for filler (Fextralife). GameRant adds the subtler warning: Tails' flight *breaks* stages whose level design wasn't built for it. Steal: prototype each fighter's verb set in a grey box; if a gimmick isn't fun or the arenas don't serve it, cut it before content is built around it.
*Sources: https://fextralife.com/retrospective-sonic-adventure/?query-0-page=2 (index); https://gamerant.com/sonic-adventure-playable-characters-ranked/ (index)*

---

## 4. LUIGI'S MANSION — Atmosphere, Single Deep Mechanic, Limited Moveset

### Stealable ideas (ranked by impact)

**4.1 The tug-of-war: combat as negotiation, not button-mashing.** (Highest impact)
The Poltergust loop — stun with flash, latch the vacuum, pull *opposite* the ghost's flight path while it drags you around the room — makes every capture feel like a struggle. Steal: build Concrete Dragon's grapple/throw system as directional tug-of-war — enemies resist along an axis, the player reads and counter-pulls, mashing is punished (you get dragged). Instantly more tactile than any combo string, and it works with two buttons.
*Sources: https://vectree.io/pdf/c/luigis-mansion (index); https://TechRaptor.Net/gaming/reviews/luigis-mansion-review-ghost-hunting-on-go (index)*

**4.2 Slam: turn one enemy into a weapon against the rest.**
Luigi's Mansion 3 added the slam — violently whip ghosts back and forth, and slamming one ghost into another auto-stuns it, enabling chains. This is brawler crowd-control 101 and it emerges from *one* mechanic. Steal: a grab-and-slam where the held enemy becomes a projectile; chaining slams builds the combo meter. Simple to implement, endlessly fun, reads great on screen.
*Source: https://wccftech.com/review/luigis-mansion-3-bustin-good/ (index)*

**4.3 One tool, endless applications (the Poltergust principle).**
Suck, blow, tablecloths, fans, carrying items, plus element medals (fire/water/ice) that burn doors, freeze sludge, water plants — the vacuum is combat tool, puzzle tool, and world-interaction tool. Steal: Concrete Dragon's special move (e.g., a shockwave clap or the §2.1 chain-whip) should also work on the environment — clear debris, power generators, blow back projectiles, trigger switches. One mechanic doing triple duty is how small games feel big.
*Sources: https://vectree.io/pdf/c/luigis-mansion (index); https://gamefaqs.gamespot.com/gamecube/516494-luigis-mansion/reviews/119581 (index)*

**4.4 Limited moveset stays fun through enemy variety, not player combos.**
Luigi basically does two things, yet it never gets monotonous: bone-throwing ghosts, shockwave-slammers, money-shaking grabbers, and portrait ghosts that each demand a unique setup (open a window, answer a question, suck up the food). LM3's reviewers marvel at the "wide variety of puzzles and challenges... using this limited moveset" with "no complex button combos." Steal: keep Concrete Dragon's player moveset small and readable; invest design budget in *enemy behaviors* and mini-boss "expose the weak point" setups. Depth for players, scope control for devs.
*Sources: https://Gamefaqs.gamespot.com/gamecube/516494-luigis-mansion/reviews/105990 (index); https://wccftech.com/review/luigis-mansion-3-bustin-good/ (index); http://www.gamereactor.eu/luigis-mansion-3-review/ (index)*

**4.5 Atmosphere through light, not asset density.**
GameSpot's review calls it "a virtual textbook of video game special effects": real-time flashlight shadows on/around/behind everything, lightning draping shadows over furniture, dust motes, visible breath. The 2001 original's muted palette and shadow play are still cited as more atmospheric than its brighter sequels ("less is more"). Steal for an indie budget: carry Concrete Dragon's gritty-street mood with dramatic lighting — flickering neon, passing headlights sweeping alleys, rain sheen, lightning cracks — rather than dense geometry. Light is cheaper than assets and more evocative.
*Sources: http://www.gamespot.com/reviews/luigis-mansion-review/1900-2823415/ (index); https://vocal.media/gamers/2001-luigi-s-mansion (index)*

**4.6 Dollhouse cross-section camera for interiors.**
Luigi's Mansion plays at a fixed side angle with walls that dissolve as Luigi goes deeper — it elegantly solves 3D camera occlusion and looks stylish doing it. Steal: for Concrete Dragon's interior stages (warehouses, parking garages, clubs), use an auto-slicing dollhouse camera instead of fighting a follow-cam indoors. Distinctive, readable, cheap.
*Source: http://www.gamespot.com/reviews/luigis-mansion-review/1900-2823415/ (index)*

**4.7 Layered goals per space: survive → clear → maximize → perfect → hard mode.**
Luigi's Mansion layers replayability: stay alive, clear rooms, maximize money, capture portrait ghosts flawlessly, then a harder mode. Steal: per-arena goal layers for Concrete Dragon — clear, S-rank, collectibles, no-damage — driving replays without new content. This is the $4.99 retention model.
*Source: https://gamefaqs.gamespot.com/gamecube/516494-luigis-mansion/reviews/119581 (index)*

**4.8 Risk meters on tools (the overheating vacuum).**
The Poltergust heats up with use — push it to 10 and Luigi's pants catch fire. A tiny risk/reward dial on a spammable tool. Steal: put a heat meter on Concrete Dragon's gadget or slam — spam it and it backfires briefly. Creates rhythm (burst → vent → burst) from one number.
*Source: http://www.gamespot.com/articles/e3-2001-first-look-at-luigis-mansion/1100-2761425/ (index)*

---

## 5. SYNTHESIS — Top 10 Cross-Game Principles for Concrete Dragon

Ordered by impact (expected return on fun per unit of indie dev effort):

| # | Principle | Source games | One-line build directive |
|---|-----------|--------------|--------------------------|
| 1 | **Momentum is the fun: never let the player fully stop** | Mario 64 | Every move cancels into or feeds the next (punch→dodge→dive→sprint); design "deliberate quirks that keep movement going at any cost" |
| 2 | **One deep tool beats ten shallow ones** | Sunshine (FLUDD), Luigi's Mansion (Poltergust) | One signature gadget with 3+ verbs across combat, traversal, and environment interaction; invent it to fix your hardest-feeling problem |
| 3 | **Character-specific verbs, not skins** | Sonic Adventure 1 & 2 | 3–4 fighters, each with genuinely different mission verbs (brawler / grappler / speedster / hunter); theme-matched to their story |
| 4 | **Camera as character: low, close, lunging** | Mario 64 (Lakitu), SA2 (key art), Luigi's Mansion (dollhouse) | Low close follow-cam with personality outdoors; auto-slicing dollhouse cam indoors; key art and victory poses bursting toward the viewer |
| 5 | **Teach through geometry, not text** | Mario 64 (Bob-omb Battlefield) | First arena is a safe readable playground; hazards teach dodging by doing; landmarks are beacons; bosses telegraph threat through scale |
| 6 | **Saturated joy on gritty bones; progress = brightness** | Sunshine, SA2 tonal blend | Saturated primaries, dramatic lighting over asset density; reclaimed districts visibly brighten; gritty enemies vs. colorful heroes |
| 7 | **The hub is a playground, not a menu** | Mario 64 (castle), Sunshine (Delfino Plaza) | One explorable neighborhood hub full of physics toys that secretly teach mechanics; it physically grows with player progress |
| 8 | **A cyclical side loop feeding the main game** | SA1/SA2 (Chao Garden) | One low-stakes nurturing/collecting hook (crew hangout, stray dog) supplied by level pickups, granting small combat buffs — cheapest retention in the genre |
| 9 | **Few dense arenas × many objectives; enemy variety over player combos** | Mario 64 (stars), Luigi's Mansion (portrait ghosts) | Small arena roster, 5–6 "jobs" each, layered goals (clear/S-rank/no-damage); invest in enemy behaviors and weak-point setups, not longer player movelists |
| 10 | **Combat as struggle: tug-of-war grabs + enemy-as-weapon slams** | Luigi's Mansion (1 & 3) | Directional grapple where enemies resist and mashing is punished; grab-and-slam turns one enemy into a projectile against the crowd |

### Cross-cutting cautions (learned from their mistakes)
- **Never strip the core tool in mandatory missions** (Sunshine's FLUDD-less courses — Miyamoto's reported regret; keep challenge variants optional). *Source: https://www.tiktok.com/@lostdelfino/video/7609880560550350110 (index)*
- **Don't ship Big the Cat** — cut any fighter verb or gimmick that isn't fun in grey-box prototype; variety never excuses filler. *Source: https://fextralife.com/retrospective-sonic-adventure/?query-0-page=2 (index)*
- **Keep the tool a silent partner** — gadget communicates through animation/feel, not chatter or tutorial voice. *Source: https://www.eurogamer.net/super-mario-sunshine-retrospective (index)*
- **Build unique verbs bespoke arenas** — a movement power that breaks level design not built for it (Tails' flight) is a net negative; design arenas around each fighter's verbs. *Source: https://gamerant.com/sonic-adventure-playable-characters-ranked/ (index)*

---

## Could Not Verify / Open Questions
- **Hands-on feel is secondhand.** The mission correctly scoped this to analyses and documentation; none of the movement-feel claims above were verified by playing. Any "feel" prescription (acceleration curves, camera lag) needs grey-box prototyping, not citation.
- **TikTok design-trivia source.** The Miyamoto "cruel/regret" FLUDD anecdote comes from a TikTok design account's summary (@lostdelfino), not a primary interview transcript I could open. Treat as plausible-but-single-sourced; the underlying lesson (don't strip core tools mandatorily) is well-supported elsewhere (Galaxy's design direction).
- **Missing parameter from mission:** none — the mission was fully specified (games, focus areas, deliverable shape).
- **Scope not covered:** SA1's Adventure Fields as hub spaces (mentioned in passing in sources but not deeply analyzed); Luigi's Mansion 2/3 beyond the slam/plunger additions; Sunshine's blue-coin economy tuning.

## Sources
All read 2026-10-10 via `browser_search` index snippets (flag: `index`). Per-source detail notes live in `notes/`.

- Movement: https://www.eurogamer.net/is-super-mario-64s-movement-still-the-best-in-gaming · https://www.eurogamer.net/what-made-super-mario-64-so-special · https://sites.uwm.edu/digital-cultures-collaboratory/2021/02/01/the-freedom-of-super-mario-64/ · https://videodb.org/super-mario-64-retrospective/BRAKFmTcxfI · http://www.mariowiki.com/SM64 · https://ukikipedia.net/mediawiki/index.php?title=Special:MobileDiff/19685...19694&mobileaction=toggle_view_mobile
- Camera & teaching: https://www.avclub.com/super-mario-64-introduced-the-camera-as-a-friend-and-fo-1798250469 · https://pietriots.com/2021/04/23/super-mario-64-still-wallkicking/ · http://www.mariowiki.com/Lakitu_Bros. · http://goombastomp.com/super-mario-64-level-bob-omb-battlefield/ · https://247videogame.com/mario-64s-bob-omb-battlefield-is-gamings-most-important-3d-platforming-level-art-of-the-level/ · https://www.avclub.com/super-mario-64-had-perfectly-paced-difficulty-1798261498 · https://feliciarondo.com/reviews/video-games/2025/Super-Mario-64/course/1.Bob-omb-Battlefield/
- Structure/hub: https://www.thesixthaxis.com/2010/09/13/mario-64-a-modern-masterpiece/comment-page-2/ · https://www.syfy.com/syfy-wire/peachs-castle-was-the-best-part-of-super-mario-64?amp
- Sunshine: https://shmuplations.com/mariosunshine/ (2002 dev interviews) · https://nintendoeverything.com/mario-devs-on-f-l-u-d-d-in-super-mario-sunshine-importance-of-function-in-character-design-more/ (WaPo dev interview) · https://www.eurogamer.net/super-mario-sunshine-retrospective · https://theyorkerarchive.github.io/2012/www.theyorker.co.uk/news/games/6366.html · https://www.cbr.com/this-beachside-romp-is-one-of-super-marios-best-adventures · https://www.neogaf.com/threads/super-mario-sunshine-gaf-opinion.1411183/page-2 · https://www.tiktok.com/@lostdelfino/video/7609880560550350110
- Sonic: https://fextralife.com/retrospective-sonic-adventure/?query-0-page=2 · https://gamerant.com/sonic-adventure-playable-characters-ranked/ · https://tvtropes.org/pmwiki/posts.php?discussion=12985657500a57372900&page=2716 · https://Www.Thegamer.com/sega-its-time-to-bring-back-the-chao-garden-sonic-adventure-yuji-naka/ · https://Www.Cbr.com/sonic-adventure-2-set-3d-sonic-game-standard/ · https://www.sonicstadium.org/forums/topic/14019-the-evolution-of-modern-sonic/page/3/ · https://news.tailschannel.com/35-years-of-speed-art-exhibit/ · https://segaretro.org/Yuji_Uekawa
- Luigi's Mansion: http://www.gamespot.com/reviews/luigis-mansion-review/1900-2823415/ · http://www.gamespot.com/articles/e3-2001-first-look-at-luigis-mansion/1100-2761425/ · http://gamespot.com/articles/e3-2001-hands-onluigis-mansion/1100-2761883/ · https://vectree.io/pdf/c/luigis-mansion · https://Gamefaqs.gamespot.com/gamecube/516494-luigis-mansion/reviews/105990 · https://gamefaqs.gamespot.com/gamecube/516494-luigis-mansion/reviews/119581 · https://TechRaptor.Net/gaming/reviews/luigis-mansion-review-ghost-hunting-on-go · https://wccftech.com/review/luigis-mansion-3-bustin-good/ · http://www.gamereactor.eu/luigis-mansion-3-review/ · https://vocal.media/gamers/2001-luigi-s-mansion
