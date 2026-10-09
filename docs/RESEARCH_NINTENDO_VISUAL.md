# Nintendo Visual Language — Incorporation Plan for Concrete Dragon

Research date: 2026-10-09. Every claim below is either **CONFIRMED** (sourced to a real
interview, talk, article, or documented technique — citation included) or **SUGGESTION**
(my own application idea, clearly labeled). Nothing is invented as fact.

Owner's north stars: Sonic Adventure 2, Super Mario Sunshine, Luigi's Mansion, Zelda,
Mario. Goal: Nintendo LOOK (key art, cinematics, camera) + fighter FEEL.

---

## 1. KEY ART COMPOSITION

### 1a. Uekawa's SA1/SA2 character art language — CONFIRMED
Sega artist Yuji Uekawa produced the Sonic Adventure 1 & 2 artwork in a new style:
**black outlines, more humanoid proportions, longer limbs allowing "incredibly elastic
posturing,"** outlandish graffiti-like "radical" poses, and a metallic-like shading
treatment. (Sources: https://info.sonicretro.org/Sonic_Adventure/Artwork ;
https://old.sonicstadium.org/tag/yuji-uekawa/ ; fan analysis
https://www.sonicstadium.org/forums/topic/14019-the-evolution-of-modern-sonic/page/4/ )
Note: SA2 is Sega, not Nintendo — but it is one of the owner's explicit visual north
stars, so its language applies.

**HOW for Concrete Dragon (art pipeline):**
- Key art rule: every character rendered in a mid-action "radical" pose (punch
  extended, mid-kick, hair/clothes in motion) — never standing idle. Longer-limb
  proportions on key art even if in-game models are chunkier.
- Bold black outlines on all key-art/promo renders (toon outline pass), metallic-style
  specular highlights on jackets/chains/jewelry.
- Silhouette test: each character's key-art pose must read as a unique blob at
  thumbnail size (Sonic's quills / Knuckles' fists principle → Kid Blue's silhouette
  vs. thug silhouettes must not blur together).

### 1b. Nintendo's dynamic-pose box-art tradition — CONFIRMED
Nintendo's own box art history shows the pattern: the original Super Mario Bros. cover
captured "Mario in mid-air surrounded by obstacles," conveying "dynamic movement"
rather than a static portrait; post-crash-of-'83 Nintendo deliberately showed genuine
in-game action on packaging to build trust. (Source:
https://zyvorexan.com/news/super-mario-bros-box-art-original-cover-artwork-and-game-history )
Nintendo's Mario art was refined by Toei Animation veteran Yoichi Kotabe, who brought
an animator's eye — Kotabe: video games were "doing what the original animation
industry was forgetting," i.e. strong motion-first drawing. (Source:
http://www.mariowiki.com/Yoichi_Kotabe )
Drawing guides for Nintendo's house style emphasize: flat vibrant colors (don't
overcomplicate shading), expressive eyes as the personality anchor, and dynamic poses
over static ones. (Source:
https://Jpopasia.com/fulldisplay/5I2OKM/5OK099/HowToDrawNintendoHeroesAndVillains.pdf )

**HOW for Concrete Dragon (art pipeline):**
- Promo/key art = mid-action freeze frames: a punch at full extension, a dodge with
  motion smear, impact star-bursts. Diagonal composition (characters lunging across
  the frame corner-to-corner), never symmetrical head-on portraits.
- Flat, saturated color fields with simple cel shadow shapes — matches both the
  graffiti brand and cheap render cost.
- Eyes carry personality: even masked/street characters get readable eye shapes in
  key art (Nintendo's expressive-eye rule).

### 1c. Sunshine's saturated joyful palette — CONFIRMED
Super Mario Sunshine's identity is tropical saturation: director Yoshiaki Koizumi's
first lead-director role, producers Miyamoto and Tezuka; Miyamoto told the team he
wanted the GameCube Mario to be "something wild," and Koizumi pushed "more eccentric
and unusual action." (Sources:
https://www.nintendolife.com/news/2022/09/newly-translated-interviews-reveal-serious-debate-over-fludd-in-super-mario-sunshine ;
https://en.wikipedia.org/wiki/Super_Mario_Sunshine )
Tezuka's design law, stated in a Washington Post interview: design from **function** —
FLUDD's hover came from "the difficulty of handling 3-D space" in Mario 64, and
water-combat came from stomping being hard in 3D. Form follows the play problem.
(Source:
https://nintendoeverything.com/mario-devs-on-f-l-u-d-d-in-super-mario-sunshine-importance-of-function-in-character-design-more/ )

**HOW for Concrete Dragon:**
- Palette law: daytime street stages use Sunshine-grade saturation (blue sky, orange
  brick, teal hydrants, yellow cabs at full chroma). Night stages go Luigi's Mansion
  (see 1d), never muddy brown-grey.
- Function-first art: every visual flourish must answer a play question (impact flash
  = "your hit connected"; color-coded enemy tiers = readability), per Tezuka's law.

### 1d. Luigi's Mansion dramatic lighting — CONFIRMED
The original Luigi's Mansion (2001) built its identity on **lighting as gameplay**:
the flashlight wasn't just a tech showcase, it was "integral to the gameplay
experience"; the art direction used "muted color palette and detailed, shadowy
environments," and the core visual joke was "an unabashedly cartoonish character
reacting to an unabashedly disturbing environment." Character animation was
squash-and-stretch cartoon physics — Luigi flattens "like a piece of paper," face
"stretch to hilarious proportions." (Sources:
https://www.nintendolife.com/news/2011/09/feature_luigis_mansion_10th_anniversary ;
https://www.nintendolife.com/reviews/gamecube/luigis-mansion ;
https://vocal.media/gamers/2001-luigi-s-mansion )

**HOW for Concrete Dragon:**
- Night/alley stages: single-source dramatic lighting (streetlamp pools, neon signs)
  with deep shadows — cartoonish brawler characters inside a moody cinematic space
  = the Luigi's Mansion contrast joke, applied to street fighting.
- Hit reactions use squash-and-stretch exaggeration (face/body deform on heavy hits),
  not realistic ragdoll — sells impact and keeps the Nintendo cartoon register.
- **SUGGESTION:** a "flashlight equivalent" — e.g. phone-flashlight or lighter
  mechanics for dark interiors that double as gameplay (reveal hidden pickups).

---

## 2. IN-GAME CAMERA

### 2a. The camera as a character (Mario 64) — CONFIRMED
Miyamoto, in a 1999 Next Generation interview: "When playing computer games he
realized that **cameras were key to 3D games**. Many used fixed angles because it was
convenient for the developer, rather than the player. He wanted the camera to be
free." Nintendo personified the camera as Lakitu the cameraman — Miyamoto: "we need
people to understand why the camera is moving — so the camera itself is almost like
a character." (Sources: https://spritecell.com/shigeru-miyamoto-1995-1999/ ;
https://nintendoeverything.com/miyamoto-marios-origins-vr-approach-to-consoles-wii-us-struggles-training-staff-staying-with-nintendo-more/ )

**HOW for Concrete Dragon (camera code):**
- Camera philosophy: the camera is a ringside cameraman, not a surveillance drone.
  It should feel handheld-observant: slight lag, drift, and reframe on action — never
  a locked perfect track.
- Give the player nudge control (right-stick orbit nudge that recenters), honoring
  "free camera for the player, not the developer."

### 2b. Z-targeting / lock-on (Ocarina of Time) — CONFIRMED
Eiji Aonuma (Nintendo Power): 3D combat's core problems were (1) positioning to hit
in 3D space and (2) **opponents falling outside the frame**. Z-targeting's answer:
"the opponent would stay in front of the player, all the player's attacks would
converge on the opponent, and **the camera would always capture both the opponent
and the player onscreen**." Developed by Miyamoto and Yoshiaki Koizumi, who tuned
"game operability, camera-rotation speed, and even sound effects" together.
(Source: https://nintendoeverything.com/aonuma-explains-the-origins-of-z-targeting/ )
Koizumi: "Z-targeting flags one particular opponent, **telling the other enemies to
wait**" — the lock structures the whole encounter. (Source:
https://goombastomp.com/legend-of-zelda-ocarina-of-time-combat-analysis/ )
Miyamoto modeled the circling duel on **chanbara** (Japanese samurai-film sword
duels): two opponents circling with total attention. (Source:
https://noozify.com/article/gaming/20260929-nintendo-64-at-30-the-console-war-loser-that-wrote-3d-gamings-rules )

**HOW for Concrete Dragon (camera + combat code):**
- Implement a soft lock-on for the brawler: nearest-threat lock that keeps player
  AND locked enemy framed (camera pulls to fit both), attacks converge on the lock.
  This is the single biggest readability upgrade for a 3D brawler.
- Chanbara circling: when locked, movement becomes strafe/orbit around the target —
  instantly makes street fights look like staged martial-arts film duels.
- "Tell the other enemies to wait": AI director rule — off-lock enemies hold at the
  frame edge (taunt, circle, throw the occasional projectile) instead of dogpiling
  off-camera. Directly fixes the owner's complaint about enemies "walking into you
  and not attacking."

### 2c. Speed illusion without speed (Gears of War roadie run) — CONFIRMED
Cliff Bleszinski's GDC session: the "roadie run" sprint looks fast because of "the
wobbly camera, the slightly lower and wider field of vision" — an optical illusion;
characters only move 1.2x normal speed. Also: don't center the hero — centering
"only serves to block the player's view of the action." (Source:
https://www.gamespot.com/articles/gdc-session-tips-and-tricks-from-gears-of-war/1100-6235987/ )

**HOW for Concrete Dragon:**
- Dash/sprint: drop camera slightly, widen FOV ~10-15%, add subtle handheld wobble.
  Feels twice as fast for free.
- Default framing: player offset to the lower-third (rule-of-thirds), never dead
  center — keeps the incoming threat side of the screen open.

### 2d. Cut, don't just track (camera theory) — CONFIRMED
Game-camera pioneer (darwin3d.com "Cameras" article, widely cited in gamedev): from a
technical view "cameras are dirt cheap — a position, orientation, and field of view
is all you really need. There is absolutely no reason for games to use the same
camera, panning, swiveling, and gliding everywhere. **Camera cuts are a very
important part of storytelling**... Using the action line between the characters...
about ten degrees off the action line is good for the OTS cameras and 60 degrees is
good for the reaction shots." (Source: http://www.darwin3d.com/gamedev/articles/col0400.pdf )

**HOW for Concrete Dragon (cutscene system):**
- Cutscene camera = virtual multi-camera shoot: establish the action line between
  fighters, then CUT between group profile (perpendicular), over-the-shoulder
  (~10° off line), and reaction shots (~60°) instead of one gliding camera.
- Finisher/special-move cameras: hard cut to a dramatic low angle on impact, hold
  0.5s, cut back. Cheap, cinematic, very Nintendo-commercial.

---

## 3. CINEMATIC / CUTSCENE LANGUAGE

### 3a. SA2's "run and watch" spectacle segments — CONFIRMED
GameSpot's SA2 hands-on: the game had segments where "you simply hold a direction
button and watch as your character hits boost pads and does amazing stunts **from
dramatic camera angles**" — scripted spectacle beats with authored cameras inside
playable levels. (Source:
https://www.gamespot.com/articles/sonic-adventure-2-hands-on/1100-2708046/ )

**HOW for Concrete Dragon:**
- Chase/flee sequences: scripted "run and watch" beats — player holds forward while
  the camera cuts between dramatic angles (low chase cam, rooftop crane shot,
  through-the-fire-escape tracking). Spectacle without taking control away.
- Stage transitions (alley → rooftop → street) staged as SA2-style camera-showcase
  runs.

### 3b. Nintendo's show-don't-pause storytelling — SUGGESTION (pattern observed, not a cited doctrine)
Across Mario/Zelda/Luigi's Mansion, story beats play in-engine with the gameplay
camera language, short and skippable, never long pre-rendered films divorced from
play. **HOW:** all Concrete Dragon cutscenes in-engine, under 30 seconds each,
skippable, using the same character models and lighting as gameplay (no separate
"movie models" that create the fake-ad problem).

---

## 4. MASTER INCORPORATION CHECKLIST

| # | Technique | Source game | Applies to |
|---|---|---|---|
| 1 | Mid-action "radical" poses, black outlines, metallic highlights | SA1/SA2 (Uekawa) | Key art / promo pipeline |
| 2 | Diagonal composition, dynamic > static | Nintendo box-art tradition (SMB → Kotabe) | Key art / banners |
| 3 | Flat saturated color, expressive eyes | Nintendo house style | Character art direction |
| 4 | Sunshine-grade daytime saturation | Super Mario Sunshine | Stage lighting/palette |
| 5 | Function-first visuals (Tezuka's law) | Sunshine (dev interviews) | VFX/UI design rule |
| 6 | Dramatic single-source lighting, cartoon-in-moody-space | Luigi's Mansion | Night stages |
| 7 | Squash-and-stretch hit reactions | Luigi's Mansion | Animation |
| 8 | Camera-as-cameraman, player-nudgeable | Mario 64 (Miyamoto) | Camera code philosophy |
| 9 | Lock-on framing both fighters; attacks converge | Zelda OoT (Aonuma/Koizumi) | Combat camera |
| 10 | Chanbara circling strafe | Zelda OoT (Miyamoto) | Locked movement mode |
| 11 | Off-lock enemies "wait" at frame edge | Zelda OoT (Koizumi) | AI director |
| 12 | FOV widen + low wobble = speed illusion | Gears of War (GDC) | Dash feel |
| 13 | Hero off-center (rule of thirds) | Gears of War (GDC) | Default framing |
| 14 | Multi-camera cuts on action line (OTS ~10°, reaction ~60°) | Camera theory (darwin3d) | Cutscene system |
| 15 | "Run and watch" spectacle segments | SA2 (GameSpot hands-on) | Chase/transition sequences |
| 16 | In-engine, <30s, skippable cutscenes | Nintendo pattern (suggestion) | Cutscene system |

## 5. WHAT I COULD NOT SOURCE
- Specific SA2 cutscene direction interviews (who directed SA2's cinematics, their
  stated technique) — not found in this pass; the "dramatic camera angles" claim
  rests on GameSpot's hands-on description only.
- A citable breakdown of Mario Sunshine's exact color-script values — the
  "saturated joyful" read is consensus description, not a documented spec.
- Nintendo-internal key-art composition guidelines — Nintendo does not publish
  these; the box-art claims rest on historical analysis, not a Nintendo doc.

---
*Research by subagent, 2026-10-09. Sources are real pages fetched this session;
quotes are brief and attributed. Suggestions are labeled as such.*
