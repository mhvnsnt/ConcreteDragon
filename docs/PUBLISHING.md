# Publishing Concrete Dragon — no-store plan

**MONEY BLOCKER (owner 2026-10-06):** the $25 Google Play developer fee cannot be paid right now — so there is no Play Console upload in this plan. Everything below earns without an app store. Per the owner's money-pipeline directive: once earnings hit the milestones ($25 → $50 → $75 → $100), the $25 fee becomes payable from earnings and Play Console goes back on the table — the AAB, release signing, and auto-bumping version codes are already in place for that day.

Full money-path research, ranked by speed-to-first-dollar with verified terms: `docs/monetization/monetization-plan.md`.

## Fastest real-money paths — do these first

### 1. itch.io page (~30 min, $0)

The single fastest way to real money + distribution. Publishing on itch.io is free — no upfront fees, no approval gate. A complete paste-ready page draft (title, tagline, description, tags, pricing, screenshots) lives at **`docs/monetization/itch-page-draft.md`**.

**What to upload:**
1. GitHub → **mhvnsnt/ConcreteDragon** → **Actions** → latest green **Build Concrete Dragon** run → download the **street-brawl-web** artifact, zip it → upload as a **browser-playable HTML5 game** (set viewport to the game's aspect)
2. Same run → download the **street-brawl-android** artifact, unzip → upload `street-brawl.apk` as a **downloadable file** for Android players

**Pricing:** **Pay what you want, $0 minimum** (free to play, tips welcome). itch.io lets buyers pay above the minimum, and PWYW buyers pay ~30% above the minimum on average. Revisit a fixed price ($1.99–$4.99) once the game has real traction.

**Payments:** choose **"Direct to you"** and connect PayPal or Stripe — tips land **instantly**, no 7-day hold, no tax interview, no payout minimum. (The alternative "Collected by itch.io, paid later" holds each transaction 7 days, requires a tax interview, and has a $5 payout minimum.)

**Revenue share:** itch.io's cut is adjustable **0–100%** (default 10%; payment processing ~2.9% + $0.30 separate). Keep the default 10%.

**Why first:** live in under an hour, built-in payments, zero cost to start, and the itch page doubles as the press/portal link.

### 2. Ko-fi tips page (~15 min, $0)

Stack on top of everything. **0% platform fee on one-off tips** (free plan); money goes **straight to your PayPal or Stripe** — Ko-fi never holds it.

1. Create account at https://ko-fi.com (~2 min)
2. Connect PayPal **or** Stripe in payment settings (~5 min)
3. Set page name + a funding goal: **"$25 — Google Play developer fee"** (~5 min)
4. Hand over the link — the agent team wires it into the itch page, README, and game builds

### 3. Direct APK sideload (already built by CI)

Every green CI run produces a **release-signed APK**. Share the itch.io download link or a QR code; players enable "install unknown apps" once. No store, no review, no fee. This is also how you run private betas — send the APK to testers directly.

Player install steps: download APK → allow "Install unknown apps" for the browser → Install (Play Protect may show an "Unknown app" warning — tap **Install anyway**, normal for sideloaded apps) → updates install over the old APK (same signature, data carries over).

### 4. Web-game portals — revenue share (when the game is polished)

Portals pay a share of ad revenue around your game. They are **selective** (review process, technical requirements) — submit once the game has real session length, not before. **Verified terms only** (checked 2026-10-06; neither portal publishes a revenue-share %):

- **CrazyGames** ([docs.crazygames.com/faq](https://docs.crazygames.com/faq/)): Godot supported, **no exclusivity required**. The **CrazyGames SDK is required for Full Launch/monetization** (optional for Basic Launch). Pipeline: QA review → **Basic Launch** (soft launch, **ads disabled = $0 earned**) → performance gates → **Full Launch** (ads on, earnings start). Payouts: **€100 minimum**, monthly, via Tipalti (wire/ACH/eCheck/PayPal). Revenue-share % **not publicly disclosed**.
- **Poki**: **Poki SDK required**. Default deal is **web-exclusive for 5 years** — this **conflicts with the itch.io browser page and the GitHub Pages build**; do NOT sign it without taking those down first. The non-exclusive alternative is a **one-time flat licence fee, no revenue share**. Payout schedule and rev-share % **not published**. Their free pre-agreement playtesting tool (Mystery Tile) is worth using for QA regardless.

Use the **CI web build** for submissions — it's the same artifact every push, so the portal copy stays fresh. CrazyGames SDK integration is queued agent-team work; nothing for the owner to do yet.

## What CI already does (nothing for you to do)

Every push to `main` triggers the **Build Concrete Dragon** workflow:

- Builds **Web**, **Android APK**, and **Android AAB** (Godot 4.7.2)
- Signs Android builds with the **release keystore** (`streetbrawl` alias, stored as repo secrets `ANDROID_KEYSTORE_BASE64` / `ANDROID_KEYSTORE_ALIAS` / `ANDROID_KEYSTORE_PASSWORD`; backup kept securely off-repo)
- Auto-bumps version code every run (app stores require always-increasing codes — ready for the day Play is affordable)
- Deploys the web build to **https://mhvnsnt.github.io/ConcreteDragon/** — always the latest, playable in any browser
- APK + AAB downloadable from the run's **Artifacts** (Actions tab → latest green run)
- The AAB is kept for a future store move; the APK is the sideload workhorse today

## Your manual steps (one-time, ~45 min total)

### 1. itch.io page (~30 min)

Paste from `docs/monetization/itch-page-draft.md`:

1. Create a free account at https://itch.io/register
2. **New project** → title **Concrete Dragon**, kind **Game**, HTML project
3. Upload the zipped web build → check **"This file will be played in the browser"**
4. Upload `street-brawl.apk` as an additional downloadable file
5. Pricing → **Pay what you want, $0 minimum**; Payments → **Direct to you** → connect PayPal or Stripe
6. Paste the description/tags from the draft; add the 3 screenshots in `docs/monetization/screenshots/`
7. Publish (can stay Draft until approved)

### 2. Ko-fi page (~15 min)

Account → connect PayPal/Stripe → set the **"$25 — Google Play developer fee"** goal → share the link.

### 3. Share the sideload APK (~10 min, optional)

From the itch page, copy the APK download link; post it wherever players are. Re-upload the fresh APK from each green Actions run — same page, new file.

## Milestone ladder → Play Store (owner-set)

| Earned (withdrawable, no-store) | Unlock |
|---|---|
| **$25** | Pay the $25 Play developer fee **from earnings** → Play path below unlocks |
| **$50 / $75 / $100** | Reinvest / bank per owner call; ~$100 puts CrazyGames' €100 payout threshold in range |

## 🔒 UNLOCKS AT $25 EARNINGS — Google Play path (parked, do not do yet)

**Play Console** — the moment earnings cover the $25 fee: create the developer account ($25 one-time + government ID verification at https://play.google.com/console/signup), create the app named **Concrete Dragon** (package `com.orionenterprises.streetbrawl` is already set and stays; App or Game → Game, Free), upload the CI-built AAB to **internal testing**. Release signing and version-code bumping are already configured — ~35 minutes of clicking, no engineering.

## Later (not needed yet)

- **Automated store uploads** — a service account + upload action can push the AAB on every build; phase 2, only if store uploads get frequent
- **CrazyGames / Poki submission** — when session length and polish justify it; SDK integration first

## Notes

- **Never lose the keystore.** Backup lives off-repo; repo secrets hold the working copy. Without it, a future Play listing couldn't be updated — you'd have to republish as a brand-new app.
- CI shows "using 33.0.2" build-tools warnings — benign; target SDK gets bumped before any production store release.
- **Money-claim rule:** portal revenue-share % figures floating around in industry guides are estimates, not contracts — neither CrazyGames nor Poki publishes one. Only itch.io's adjustable cut and Ko-fi's 0%-on-tips are published policy. No revenue projections in this plan, deliberately.
- **Pre-publish checklist** (from real screenshots 2026-10-06): the intro splash rename STREET BRAWL → CONCRETE DRAGON already landed; title-logo overflow at 1280px and ROOK/VEX canon-name confirmation are still open. Screenshots in `docs/monetization/screenshots/` are from the 2D build that was live at capture time — refresh them once the 3D build stabilizes.
