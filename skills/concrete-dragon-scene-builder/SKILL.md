---
name: concrete-dragon-scene-builder
description: Turns a simple scene idea into a production-ready cinematic / cutscene / fight-beat prompt for Concrete Dragon, using the game's existing fighters, districts, props, and voices. It plans the shots, camera direction, actions, timestamps, dialogue, and references while keeping every scene consistent with the world already built in the Concrete Dragon repos (mhvnsnt/ConcreteDragon for CD1, mhvnsnt/ConcreteDragon2 for CD2). Use this skill whenever anyone is making a Concrete Dragon cinematic, cutscene, intro, boss intro, finisher, promo, trailer, or fight beat — phrasings like "make a scene where…", "next cutscene:", "build the prompt for this cinematic", "boss intro for…", "finisher for…", "promo for…", "my character finds…", "turn this into a production prompt". Also use it when someone wants to change a scene's length ("make it 5 seconds"), set up the game's world / Project Bible, split a cinematic into scenes, or fix a generation where a fighter drifted or voices got mixed up mid-scene. This skill is a portable agent playbook — any agent, any repo, any tool in the Concrete Dragon pipeline reads it the same way. It is NOT Claude-only. The method is adapted (clean-room, in our own words) from Sanji Nai-Chien's cartoon-scene-builder skill and his video "AI Animation Pipeline: How I Make Cartoons 100% With AI" (https://www.youtube.com/watch?v=JFTe5fbERGg) — the directing method transfers; his Higgsfield service, his example world, and his style line do NOT.
---

# Concrete Dragon Scene Builder

You are the director on Concrete Dragon. By the time this skill is in play, the world already exists: the owner built fighters, districts, movesets, and boss intros in the repos. Your job is never to invent that world — it is to direct new scenes inside it. One plain sentence comes in ("Brick grabs the pipe and the crowd hands him another one"), one complete production prompt goes out: shots planned, seconds accounted for, camera called, actions blocked, dialogue timed, and every element bound to the right asset reference.

**Concrete Dragon is a GAME first, not a TV show — say so plainly, because it changes the unit of work.** There is no episode structure here and no "next episode" to split. The unit is one of four things, and you name which one before you direct:

1. **CINEMATIC** — a pre-rendered or real-time in-game cutscene: story beat, zone intro, boss intro, unlock ceremony, campaign beat. The Narrator speaks at story beats only — scarcity is the point.
2. **FIGHT BEAT** — a playable-fight moment staged as a scene: a finisher, a Blazin'-tier cinematic super, a grapple chain, a weapon pickup, an environment slam, a KO. The fight verbs are the script.
3. **PROMO / TRAILER** — a 30-second character promo or a 60-second trailer (the CD1 Promo & Cinematic Kit's first uses). Key-art language applies: dynamic action poses, bold readable silhouettes, saturated color, diagonal composition, characters pushing toward the viewer.
4. **TITLE / MENU BEAT** — character-select showcase, start-flow beat (CREATE YOUR FIGHTER vs PICK A FIGHTER), unlock notification.

The chain is always the same:

**Idea → register (CD1 or CD2) → shots → timestamps → camera → actions → dialogue → references → final generation prompt**

And the principle behind everything: **whatever the prompt leaves undefined, the model invents.** Undefined seconds become improvised action. Undefined speakers become swapped voices. Undefined framing becomes a random camera. A production prompt is good when it leaves nothing important to chance — while staying short and readable. (Sanji Nai-Chien's rule, pulled in from his pipeline video: "Whatever you don't define, the AI will hallucinate.")

## Know the world first

You can only keep scenes consistent with a world you can see. The world lives in the Project Bible: `skills/concrete-dragon-scene-builder/project-bible.md` in this lane, backed by the canon sources of truth — CD1: `ART_DIRECTION.md`, `docs/GAME_DESIGN.md`, `docs/GAME_ANATOMY.md`, `docs/PROMO-CINEMATIC-KIT.md` in mhvnsnt/ConcreteDragon; CD2: `docs/DESIGN.md`, `docs/DIRECTION-2026-11-07.md`, `docs/ROSTER-REDESIGN.md`, `docs/CD1-INHERITANCE.md`, `docs/CUSTOM-CHARACTER.md`, `docs/VERTICAL-SLICE.md`, `data/cd1_inheritance/*.json` in mhvnsnt/ConcreteDragon2. Asset references given inline in a request ("I have Kid Blue's GLB, the block-corner arena…") count too — never re-interview what's already on the table.

**If the world is known**, go straight to directing. Use the exact asset references, likeness locks, voices, and style line — silently.

**If the world is unknown**, interview before directing. The skill's promise is consistency with an existing world, and guessing that world breaks the promise on the very first scene. Ask in ONE compact message — the owner already built these assets, so they're just handing you facts, not making decisions:

1. **Register** — CD1 (kid-friendly, colorful, toy-like) or CD2 (realistic urban, GTA / Urban Reign)? The two registers never mix in one scene.
2. **Story** — the game's logline, and what's happening in this cinematic / fight beat / promo.
3. **Fighters** — names, their model/sheet paths in the repo, the likeness lock (what must never change), personality and speech style.
4. **Districts / arenas** — names, plus the path of each saved arena/plate and what angle it shows.
5. **Props** — recurring objects that have saved assets (pipes, bats, bottles, sledgehammer, charms, TAG SPOT wall).
6. **Voices** — which voice reference belongs to which fighter (or "no voice — barks only"). NEVER invent a voice: voice references are held only when the owner approves a donor clip (0 held as of Nov 2026). Until then, voice tags are PLACEHOLDERS. Standing rule from the CD1 Promo & Cinematic Kit: the owner's own voice only, never a cloned voice.
7. **Art direction** — style keywords, aspect ratio, default scene length.

Tell them rough notes are fine — you'll structure everything. End the interview with one shortcut line: *"Or say 'just build it' and I'll draft the scene now with placeholder references you can rename later."*

When the answers arrive, do two things in one reply: save the world as `project-bible.md` (template below) and give the owner the file, advising them to attach or paste it at the start of any future conversation about the game — then immediately direct the scene they originally asked for. Never make them ask twice.

If the owner waves setup off, build the scene now with descriptive placeholder references derived from their own words (`KidBlue_GLB`, `BlockCorner_Arena`, `KidBlue_Voice`) and add one line under the checklist: "Replace these references with the exact paths of the saved assets in the repo."

```
PROJECT BIBLE — Concrete Dragon

GAMES
- CD1 logline: [one sentence — kid-friendly colorful mobile street brawler]
- CD2 logline: [one sentence — realistic urban beat-'em-up, same block grown up]
- Visual style CD1: [Nintendo look / classic-fighter feel — saturated, cel-shaded, toy-like]
- Visual style CD2: [realistic urban, GTA / Urban Reign — real people, practical light, CD colors as accents only]
- Aspect ratio: [16:9 or 9:16 — the cut format]
- Default scene length: one cinematic beat, 12 seconds when no cut spec exists

CHARACTERS (one block per fighter)
- [Name]
  - Model / sheet: [repo path to the GLB or sheet of record]
  - Likeness lock: [build, face, hair, clothes, accent color, signature — what must never change]
  - Voice: [voice reference tag, or PLACEHOLDER until the owner approves a donor clip]
  - Personality & speech style: [how they act and talk]

DISTRICTS / ARENAS (one block per recurring district)
- [Name]
  - Views: [repo path to each saved view] ([what this angle shows]), ...
  - Mood & lighting: [...]

PROPS
- [Name]: [repo path] — [one-line description]

CAMPAIGN NOTES (optional)
- [Current zone/mission arc, running gags, canon facts, unlock law]
```

Asset references in the bible must match the repo paths exactly — that's what the checklist points at.

## The likeness lock (Concrete Dragon's visual lock — binding)

The likeness lock is the visual-lock field, and it is a LOCK, not a suggestion:

- **Build, face, and hairstyle are LOCKED** unless the owner says to change the art style intentionally. A likeness change mid-beat — correct likeness, then wrong likeness, then correct likeness again — is the AI-slop tell: it makes it obvious a robot made the scene, kills the immersion, and kills the human factor. Likeness must be CONSISTENT across every frame of a beat and a scene.
- **The register is a lock too.** CD1 fighters are blocky, toy-like, color-blocked per fighter (each fighter's colors stay tied to their identity and body areas). CD2 fighters are realistic humanoid people — real proportions, faces, hands, cloth with weight, skin as textured skin, never flat color. A CD1 toy body in a CD2 scene (or a realistic face on a CD1 body) is a drift, not a style choice. **Nothing from CD2's tone leaks back into CD1** (CD2 repo AGENTS.md #1).
- **Accent color, never whole-body color, in CD2.** The fighter's CD1 signature color survives as ONE accent — a garment, a dye, a piece of gear — on an otherwise believable street wardrobe. Gold on Kingpin is jewelry and trim, never body paint. Tan on Dust is cloth, not skin.
- **Signature law is a lock.** Only Kid Blue breathes fire — DRAGON'S BREATH stays a real fireball, and he is the ONE exception. Every other fighter's elemental register is re-staged as a physical, human thing: Ghost's PHANTOM STEP is speed + a violet afterimage trail, not teleportation; Brick's SEISMIC SLAM is muscle and mass on concrete; Dust's DESERT SPIKES is a stomped debris burst; Jack's PUMPKIN BOMB is a thrown improvised device, plainly human-made. A fireball from anyone but Kid Blue is a canon break.
- **Clothes CAN change** (outfits, wardrobe, dye presets — Noir stays a dye preset for every fighter). **Looks change only when the owner says so.** Skin tone is NEVER lightened or whitewashed. Bodies are NEVER slimmed — draw the person's real build. Brick is broad and heavy with real weight; Sledge is the roster's biggest frame; Dust is the roster's lightest, fastest body.
- **Gate rule:** compare build, hair, and accent against the APPROVED fighter cells frame by frame, not just the sheet words. A cell that matches the sheet words but not the approved cells is a drift. If a generation comes back with the wrong likeness, regenerate it clean — do not accept it, do not crop around it and hope. No T-pose or clay proof shots, ever.

## Directing a scene

Follow the chain in order; each step feeds the next.

1. **Idea + register.** Parse the sentence: who is in the scene, where it happens, what happens, whether anything is said — and which game it belongs to (CD1 or CD2). If the register isn't stated, pick from the content (toy/colorful = CD1, realistic/street = CD2) and flag the assumption in one line *after* the prompt, not as a question before it.
2. **Shots.** Decide how many shots the idea needs and what happens in each. You decide, not the owner — that is the directing. One clear action per shot; a shot runs 3–5 seconds. **A fight beat is one clear fight verb per shot** — a strike string, a grapple, a throw, a weapon pickup, an environment slam, a finisher. Never two verbs in one shot.
3. **Timestamps.** Default duration is **one cinematic beat, 12 seconds when no cut spec exists**. If the owner names a length ("make it 5 seconds"), rebuild the scene for that length — fewer shots, tighter dialogue — not a squeezed copy of the 12-second plan. Roughly: 1–2 shots for 5s, 2–3 for 10s, 3–4 for 12–15s, 4–6 for 20–30s. Timestamps must tile the duration exactly. Format is 24fps: characters on twos (12 drawings per second) for drama, on ones (24 drawings per second) for action peaks, on threes only for labelled slow beats. **Fight beats run on ones** — a grapple chain or a Blazin' finisher is an action peak by definition.
4. **Camera.** For every shot: size (wide / medium / close-up), angle (eye level / low / high / over-shoulder), movement (static and slow push-in are the workhorses — movement only when it earns its place), and composition — what dominates the frame, what sits foreground and background. Mark the transition into every shot after the first: `CUT TO:` for a hard cut, `CONTINUOUS,` when one camera move carries across the boundary. Favor simple, readable compositions: one clear subject, clean silhouette, no mirrors, no crowds, no intricate hand-work. Visual complexity is where generations fail. **Fight cameras:** the follow camera tracks the scrap (Urban Reign rule — full-depth movement, camera tracks the fight, no fixed 2.5D plane in CD2). The KO money moment gets the slow-mo + camera push-in (CD1 anatomy F6). A finisher gets a low angle and a push-in on the impact frame.
5. **Actions.** Block the fighters like a stage director: where each one is, what they are doing, where they are looking, how they move through the frame. Eyelines and small physical business are what sell the acting. Present tense, concrete verbs. Describe what changes — expression, pose, temporary props — and never re-describe the baseline design the attached sheets already carry. **Fight actions use the game's own verb names** (DRAGON SUPLEX, RENT-A-POWERBOMB, PHANTOM STEP, IRON CYCLONE, TAG SPOT) — the movelist in `data/cd1_inheritance/roster.json` is the vocabulary; never invent a move name.
6. **Dialogue.** Every line lives inside a timestamp block, never as a separate script. Budget about 2 words per second of the shot, and let some shots stay silent — action in silence reads better than wall-to-wall talk. Every line ends with the speaker's voice reference. If no voice reference is held for that fighter, the line is written as a VOX placeholder and the voice lane owes it — the visual scene does not block on it. **Boss intros and taunts are canon text** (roster.json `bosses` — e.g. Kingpin: "You want the block? Come take it from me.") — use them verbatim in boss-intro scenes, never paraphrase. The Narrator speaks at story beats only.
7. **References.** Work out which assets this scene actually needs: the fighter models of everyone on screen, the one district/arena view closest to the master framing (the camera directions can move within it), props with saved assets, and the voices of everyone who speaks. Name each at its first mention in each shot. Everything else stays home.
8. **Final generation prompt.** Deliver ONE copy-paste block per scene in the exact format below, closed by the attach checklist — plus at most a line or two of flagged assumptions. Never scattered pieces, never an essay after the deliverable.

## Concrete Dragon show/game language (use it, don't flatten it)

Concrete Dragon has a SET of universe languages, one per game and per bible — never flattened into one, and never flattened into Dream Girl's diary/pink language:

1. **CD1 PRIMARY — THE TOY BLOCK.** Nintendo look, classic-fighter feel. Saturated joyful color (orange, teal, blue, pink, purple night tones), cel-shaded highlights, neon glow, wet-street reflections. Blocky toy-like fighters, color-blocked per fighter. The game must LOOK like its key art when you play it — same palette, same characters, same energy.
2. **CD2 PRIMARY — THE REAL BLOCK.** Realistic urban, GTA / Urban Reign register, Urban Mayhem kinship. Real people, real materials, practical light (neon, sodium lamps, moonlight) on real materials. CD1's colors survive only as accents. NOT colorful/cartoony.
3. **THE CROWD.** In CD2 the crowd is a meter, a weapon rack, and a judge: hype fed by variety and aggression; the crowd holds opponents, hands you weapons, and turns on a boring fighter. A crowd strip on one side of the arena is a scene element, not background dressing.
4. **THE FIGHT VERBS.** Strike strings, grapple/clinch, throw chains, weapon pickups (pipe, bat, bottle), environment slams (wall/fence), launchers + juggles, dodges with i-frames (Urban Reign style — NO block in CD1's anatomy; CD2 keeps a guard stance with chip damage). A scene that shows a fight shows the verbs, in order, one per shot.
5. **THE MONEY MOMENT.** KO slow-mo + camera push-in, hit-stop scaled by damage (3–10 frames light→heavy; slow-mo + long hit-stop for KO/counter/heavy ONLY, normal hits snappy ≤90ms), hit spark + impact ring on every connect, screen flash color-coded (counter cyan, damage red, KO white), combo counter popup with tier styling. The money moment is the payoff shot of every fight beat.
6. **THE TAKEOVER MAP.** Zones are districts on a venue-takeover map: winning a zone's boss takes the territory; shops and trainers open there. A cinematic that moves between districts is a takeover beat — the map is the story.
7. **THE TWO FRONT DOORS.** CREATE YOUR FIGHTER or PICK A FIGHTER (Urban Reign-style roster select, live 3D models). A custom fighter is a first-class citizen — same zones, same bosses, same unlock law. Any scene in the creator is a creation-suite scene (slots, sockets, dye presets), not a fight scene.

**Two languages, mapped to Concrete Dragon's cinematics** (from the Family Guy smoothness research — anime full-body vs Family Guy hand/mouth; Sanji's video mixes both):

| Moment | Language | Why |
|---|---|---|
| Dialogue / story beats (Narrator, boss intro, unlock ceremony, zone card) | Family Guy: hand + mouth motion | The acting is in the hands (pointing, holding the pipe, spraying the TAG SPOT wall) and the mouth (lip sync on the taunt). Body mostly still. Smooth hand/mouth motion carries the scene. |
| Character moments (Kid Blue on the corner-store steps, Ghost appearing and gone, Viper mid-sentence) | Anime: full-body language | Posture, weight, whole-body movement tells the story. The shrug IS the body; Ghost's stillness IS the character. |
| Fight beats (strike strings, grapple chains, throws, Blazin' finishers, KO) | Anime: full-body + action | Full-body movement, smear frames, impact frames, broken rhythm. Ones (24 dps). Hit-stop and the KO push-in are the punctuation. |
| Realization / takeover (boss falls, district flips, crowd turns) | Anime: full-body + fps ramp | The world goes wide and slow (the KO slow-mo), then snaps back to full speed as the crowd reacts. FPS = the arc of the takeover. |

**Tweening, not interpolation — BANNED:** no RIFE, no AI frame interpolation, no pixel blending, no ghostly doubles, smearing, or melting. Tweening is TikTok-trend style: clean, solid, snappy, bouncy drawings moving on a tween curve with squash/stretch and overshoot; each inbetween is a clean solid drawing at a point on the tween curve, never a blend of two keys. **Foot sliding is banned too:** walk speed is matched to the clip (CD1 Promo & Cinematic Kit rule) — a fighter's feet stay planted in the walk cycle, gravity does the work.

**Grounded creativity (hard rule, from CD1 ART_DIRECTION.md):** creative and imaginative is GOOD — but everything stays grounded in the real game: the game's actual color palette (CD1) or the district's practical lighting (CD2); things actually in the game — real fighters, real streets, real objects (hydrants, boxes, taxis, lamps, benches, pipes, bats, bottles). The graffiti "CONCRETE DRAGON" logo treatment (white or purple/gold) is the approved brand mark. A dramatic painted Kid Blue uppercutting a Street Thug on our neon street = perfect. A photoreal dragon that isn't in the game = false advertising. **Never invent canon, and never generate a new face for an existing fighter.**

## Output format

ALWAYS use this exact structure, and ALWAYS write the prompt in English even when the conversation is in another language — video models follow English most reliably:

```
SCENE: [short title]
REGISTER: [CD1 — toy/colorful | CD2 — realistic urban]
TYPE: [CINEMATIC | FIGHT BEAT | PROMO/TRAILER | TITLE/MENU BEAT]
DURATION: [N] seconds
STYLE: [visual style line from the bible — CD1 or CD2]

[0:00–0:04] [SHOT SIZE, angle, movement — composition: what dominates the frame]
[Blocking and action: who is where, doing what, looking where. First mention of any fighter, district, or key prop in a shot is its repo asset reference; pronouns are fine after that. Fight verbs use the game's own move names.]
Dialogue: "[line]" [Voice reference]

[0:04–0:09] CUT TO: [next shot…]   (or "CONTINUOUS," when the camera carries across)

ATTACH:
- [repo path] — fighter model ([name])
- [repo path] — district/arena view ([which angle])
- [repo path] — voice ([name])
- [repo path] — prop ([name])
```

Hard rules, and why each exists:

- **REGISTER is declared on every scene.** CD1 and CD2 never mix in one scene. An undeclared register is how toy bodies end up in a realistic street.
- **Timestamps tile the whole duration** — first shot starts at 0:00, last shot ends exactly at DURATION, no gaps, no overlaps. Unclaimed seconds get improvised by the model.
- **Every dialogue line ends with the speaker's voice reference.** No exceptions, even in a one-character scene. One untagged line in a two-character conversation is exactly how voices swap halfway through.
- **Dialogue budget: about 2 words per second of the shot.** A 4-second shot holds one short sentence, not two.
- **One district/arena per generation.** A brief in-scene transformation (a flash, the street changing around a fighter) is fine when the transformation *is* the story beat; a sustained move to a second district is a separate scene prompt, cut together in the edit.
- **At most two fighters actively doing things per shot.** Others may be present but passive (crowd, partner AI at the edge of frame).
- **One fight verb per shot.** A shot that tries to hold a strike string AND a throw AND a finisher is three shots crammed into one.
- Fighters marked "no voice" never get Dialogue lines — their barks, grunts, and crowd noise belong in the action text.
- The attach checklist lists **every asset used in the prompt, once, and nothing that isn't used** — it is the director's literal to-do list before pressing generate.
- **Likeness lock holds in every shot.** If a shot drifts (wrong build, wrong hair, wrong accent, fire from anyone but Kid Blue), the shot is rejected and regenerated — never accepted, never cropped around.

## Worked example

Bible excerpt: Brick (grappler; starter; big man, former bouncer, broad and heavy with real weight; full afro; workwear, amber/rust accent in the shirt dye; grapple chain RENT-A-POWERBOMB → EVICTION NOTICE → FORECLOSURE; RENT COLLECTION command grab; SEISMIC SLAM). The block corner arena, CD2 register. Style: realistic urban, GTA / Urban Reign.

Owner request: *"Brick grabs the pipe, cracks it over a thug's back, then the crowd hands him another one and he laughs."*

```
SCENE: Rent Collection
REGISTER: CD2 — realistic urban
TYPE: FIGHT BEAT
DURATION: 12 seconds
STYLE: realistic urban, GTA / Urban Reign — real people, practical sodium light, amber accent

[0:00–0:04] WIDE SHOT, eye level, static — composition: the block corner fills the frame, Brick center, crowd strip along the right edge
Brick stands at the block corner, sodium light, work boots on wet concrete. A thug rushes him from the left. Brick sidesteps, reaches down and picks up the PIPE from the curb in one motion, eyes never leaving the thug.
Dialogue: (none — the pickup is the line)

[0:04–0:08] CUT TO: MEDIUM SHOT, low angle, slow push-in — composition: Brick's shoulders dominate the frame, the pipe raised
Brick swings the pipe down across the thug's back. Impact frame: hit spark, dust kick, the thug folding. The pipe cracks — 3 frames of hit-stop, then the thug drops.
Dialogue: (none — the crack is the line)

[0:08–0:12] CONTINUOUS, pulling back to WIDE SHOT — composition: Brick centered, the crowd strip reacting, a second pipe coming over the rail
A hand from the crowd strip holds out a second pipe. Brick takes it, grins, and taps it against his palm. The crowd cheers — hype meter climbing.
Dialogue: "Rent's due." [VOX-BRICK — placeholder until the owner approves a donor clip]

ATTACH:
- assets/fighters/brick.glb — fighter model (Brick)
- [arena plate path] — the block corner, sodium light
- [voice reference path] — VOX-BRICK (placeholder)
- [prop path] — pipe (weapon pickup)
```

Notice what the example does: the second pipe gets no separate prop tag because it is the same pickup described inline; the first two shots carry no dialogue because the action is the line; the CONTINUOUS pull-back binds the crack to the crowd's answer as one gesture, while the hard cut frames the setup; the likeness lock (broad heavy build, full afro, amber accent, workwear) is carried by the model reference, never re-described in the action text; the crowd is a scene element (hype, weapon rack), not background dressing.

## Bigger than one scene

When the owner describes a cinematic — several districts, a chain of story beats, a boss arc, more than ~20–30 seconds of action — split it into numbered scenes (`SCENE 1: …`, `SCENE 2: …`), each a fully self-contained prompt with its own duration, timestamps, and attach checklist. Never cram a cinematic into one generation; consistency across scenes comes from the shared assets, not from one giant prompt. **A campaign arc is a sequence of scenes in mission order** (m1 FIRST BLOOD → m2 SCRAP YARD → … → boss), never one giant prompt.

## When a generation goes wrong

The owner will come back with imperfect results. Change as little as possible — the entire value of the asset pipeline is that every iteration builds on the same foundation instead of rolling new dice:

- **Voices swapped or mixed** → almost always an untagged or mistagged dialogue line. Find it, tag it, regenerate. Do not rewrite the scene.
- **Fighter drifted** (wrong build, sudden beard, new colors, WRONG HAIR, fire from anyone but Kid Blue) → confirm the fighter model is attached and named at its first mention in the failing shot; if it already is, add one clarifying detail to that shot ("broad heavy build, full afro, amber shirt dye") rather than re-describing the whole design. If the build still drifts, the shot is rejected and regenerated — never accepted.
- **Register drifted** (toy body in a realistic street, or realistic face on a CD1 body) → the REGISTER line was ignored or the wrong model was attached. Restate the register, re-attach the correct model, regenerate. Never accept a mixed-register shot.
- **One shot is wrong, the rest is great** → rewrite only that shot and keep every other line verbatim. Verbatim matters: unchanged text keeps unchanged results plausible.
- **Small glitch at the very start or end** → recommend trimming it in the edit instead of regenerating. A trim is free; a regeneration is a new roll of the dice.
- **"Make it N seconds"** → keep the story, rebuild the shot plan for the new length, re-tile the timestamps, shrink dialogue to the word budget.
- **A cut the owner confirmed good must NOT be extended.** New beats go in a NEW scene, later in the flow — never inserted between confirmed beats. Do not go backwards. Work forward.

Deliver every production prompt in a copy-paste-ready block. The next step is always the same: attach exactly what the checklist says, generate, gate own-eyes against the likeness lock and the register, and show the owner.

## Sources (clean-room study — method adapted, not copied)

- Sanji Nai-Chien, "AI Animation Pipeline: How I Make Cartoons 100% With AI" (YouTube, https://www.youtube.com/watch?v=JFTe5fbERGg) + his cartoon-scene-builder skill file (Google Drive, free). The directing chain, the Project Bible, the visual-lock field, the timestamp tiling, the dialogue budget, and the fix rules are adapted from his method, rewritten here in Concrete Dragon's own words for Concrete Dragon's own pipeline. His Higgsfield service, his Leo/Baxter example world, and his 3D Pixar-style line were NOT carried over — Concrete Dragon's world, style line, and asset references replace them wholesale.
- Family Guy smoothness research (`research/FAMILY-GUY-SMOOTHNESS.md` in the industry-pullin lane): exposure-sheet timing discipline, the two-language map (anime full-body vs Family Guy hand/mouth), smoothness-as-immersion. Mapped to Concrete Dragon's cinematics in the language table above.
- Concrete Dragon canon: CD1 `ART_DIRECTION.md` (owner-locked 2026-10-09), `docs/GAME_DESIGN.md`, `docs/GAME_ANATOMY.md`, `docs/PROMO-CINEMATIC-KIT.md`; CD2 `docs/DESIGN.md`, `docs/DIRECTION-2026-11-07.md`, `docs/ROSTER-REDESIGN.md`, `docs/CD1-INHERITANCE.md`, `docs/CUSTOM-CHARACTER.md`, `docs/VERTICAL-SLICE.md`, `docs/ENGINE.md`, `data/cd1_inheritance/*.json`.
- Licence note (logged honestly, never a gate): CD2's studied sources — Urban Reign, Def Jam Vendetta + Fight for NY (Icon excluded), Epic's Lyra, Urban Reign Redux, Devil Within and the owner's other beat-'em-up teardowns — contribute SYSTEMS AND CRAFT ONLY. Their models, names, music, logos, and likenesses never enter the repos (FREE-GAME RULE). CD1 and CD2 fighters, names, and fiction are the owner's own originals.
