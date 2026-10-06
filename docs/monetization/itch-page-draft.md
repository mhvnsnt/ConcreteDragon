# Concrete Dragon — itch.io page draft (READY TO PASTE)

Status: DRAFT. Nothing published. Owner creates the itch.io account, pastes this in, uploads the files.
Page URL will be: `https://<owner-username>.itch.io/concrete-dragon`

---

## Page settings

- **Title:** Concrete Dragon
- **Short description / tagline:** Tap. Beat them down. Next enemy walks in. Every KO different.
- **Classification:** Games
- **Kind of project:** HTML — playable in browser (embed the web build)
- **Release status:** In development
- **Pricing:** Pay what you want — **minimum $0** (free to play, tips welcome)
- **Payments:** "Direct to you" (connect his PayPal or Stripe — money lands instantly, no 7-day hold, no tax interview)
- **itch.io revenue share:** leave default 10% (supports the platform; adjustable 0–100% anytime)
- **Genre:** Action
- **Tags:** beat-em-up, brawler, fighting, godot, 2d, cartoon, singleplayer, street
- **Additional files:** `street-brawl.apk` (signed CI build — Android sideload)

## Pricing recommendation (with reasoning)

**Pay-what-you-want, $0 minimum.** Not fixed-price, not "free with no payments."

1. Zero audience right now — any fixed price kills discovery before it starts.
2. PWYW keeps the game 100% free to play (maximum players) while letting fans tip.
3. itch.io's own data shows PWYW buyers pay ~30% above the minimum on average.
4. Combined with **"Direct to you"** payments, the first tip lands in his PayPal/Stripe **instantly** — no 7-day waiting period, no tax interview, no $5 payout minimum. Fastest real path to first dollar.
5. Revisit a fixed price ($1.99–$4.99) only when the game has real traction and reviews.

## Description (paste into the page body)

**CONCRETE DRAGON** is a fast, stupid-fun street brawler. Pick your fighter, tap to throw hands, and watch the next punk walk in. Every KO hits different.

> ⚠️ **This is an EARLY playable build** (v0.1.x). The core tap-to-brawl loop is in and fully playable right now — in your browser or on Android. New fighters, waves, and upgrades land with every update. You're playing the game as it's being built.

**What's in the build:**
- 🥊 **Two fighters:** ROOK (balanced boxer — big gloves, big heart) and VEX (fast kickboxer — blink and you're down)
- 👊 **One-thumb controls:** TAP = punch · SWIPE = heavy · SWIPE UP = launch · HOLD = block · TWO FINGERS = special
- 🌊 **Wave survival:** beat the punk, the next one walks in
- 💰 **Cash + special meter:** earn cash, charge your special, chase the KO
- 📱 **Play two ways:** right here in your browser, or download the Android APK below

**Free to play.** If it made you grin, toss a tip — every dollar goes straight back into the build.

Made by **Orion Enterprises LLC** with Godot 4.

---

## Screenshot / cover-art shot list

Already captured from the live build (in `docs/monetization/screenshots/` — real gameplay, 1280×800):

| File | Use on itch page | Notes |
|---|---|---|
| `01-fighter-select.png` | Screenshot 1 | "PICK YOUR FIGHTER" — ROOK vs VEX cards. Good first impression. |
| `02-wave-intro.png` | Screenshot 2 | "STREET BRAWL" wave intro — shows art style, HUD, controls legend. ⚠️ Rename to CONCRETE DRAGON in-game before publishing (see fix list). |
| `03-mid-fight.png` | Screenshot 3 / thumbnail candidate | Mid-fight action: Rook punching a PUNK, "2 HITS!", health bars. Best action shot. |

**Still needed (not yet captured):**
- [ ] **Cover art 630×500** (itch.io recommended size) — title logo on game art. Not generated yet; generate from the in-game logo/title treatment or the main card art before publishing.
- [ ] **Animated GIF** (~640px wide, a few seconds of the tap-to-punch loop) — itch pages with GIFs convert far better. Capture from the live build once the rename fix lands.
- [ ] **KO moment screenshot** — ragdoll KO frame, for the "Every KO different" promise. Capture on a newer build.

## Pre-publish fix list (game-side, before the itch page goes live)

1. **Intro splash still says "STREET BRAWL"** — visible in `02-wave-intro.png`. Rename to CONCRETE DRAGON in the game before publishing.
2. **Title screen logo overflows** — "CONCRETE DRAG…" is cut off at 1280px wide (`01-fighter-select.png`). Shrink/fit the title text.
3. **Character canon check (owner):** the build ships fighters **ROOK** and **VEX**. Confirm these names are canon-approved before they go on a public page.
4. Re-capture screenshots after fixes 1–2.

## Owner steps to publish (his clicks only — ~30 min)

1. Create account at https://itch.io/register (~2 min)
2. Dashboard → **Create new project** (~2 min)
3. Paste title/tagline/description/tags from this draft (~5 min)
4. Set **Pricing → Pay what you want, minimum $0**; Payments → **Direct to you** → connect PayPal or Stripe (~5 min)
5. Uploads: the web build (ZIP of the Pages export OR set "Embed in page" pointing at the game) + latest `street-brawl.apk` from GitHub Actions artifacts (~10 min)
6. Upload screenshots + cover art (~5 min)
7. **Publish** (page can start as Draft, flip to Public when ready)
