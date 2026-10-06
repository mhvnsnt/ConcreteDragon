# Publishing Concrete Dragon — no-store plan

**MONEY BLOCKER (owner 2026-10-06):** the $25 Google Play developer fee cannot be paid right now — so there is no Play Console upload in this plan. Everything below earns without an app store. Per the owner's money-pipeline directive: once earnings hit the milestones ($25 → $50 → $75 → $100), the $25 fee becomes payable from earnings and Play Console goes back on the table — the AAB, release signing, and auto-bumping version codes are already in place for that day.

## Fastest real-money path — do this first

### 1. itch.io page (~30 min, $0)

The single fastest way to real money. Publishing on itch.io is free — no upfront fees, no approval gate.

**Account needed:** free itch.io account (email signup, no ID).

**What to upload:**
1. GitHub → **mhvnsnt/ConcreteDragon** → **Actions** → latest green **Build Concrete Dragon** run → download the **street-brawl-web** artifact, zip it → upload as a **browser-playable HTML5 game** (set viewport to the game's aspect)
2. Same run → download the **street-brawl-android** artifact, unzip → upload `street-brawl.apk` as a **downloadable file** for Android players

**Pricing:** set a minimum price of **$0 with donations enabled** ("pay what you want") to start — itch.io lets buyers pay above the minimum. Once the game has content depth, test a $2.99–$4.99 minimum.

**Revenue share:** itch.io's default cut is **10%**, adjustable by you from **0–100%** in seller settings. Keep it at 10% — it's the best deal in the industry (Steam takes 30%).

**Why first:** live in under an hour, built-in payments and donations, zero cost to start, and the itch page doubles as the press/portal link.

### 2. Direct APK sideload (already built by CI)

Every green CI run produces a **release-signed APK**. Share the itch.io download link or a QR code; players enable "install unknown apps" once. No store, no review, no fee. This is also how you run private betas — send the APK to testers directly.

### 3. Web-game portals — revenue share (when the game is polished)

Portals pay a share of ad revenue around your game. They are **selective** (review process, technical requirements) — submit once the game has real session length, not before.

- **CrazyGames** (developer portal): upload the CI web build. Reported terms (2026 industry guides — **estimate, confirm current terms before committing**): ~60% developer share of ad revenue, ~70% of in-app purchases, monthly payouts via Tipalti once balance clears a €100 minimum. A documented 50% revenue-share boost exists for devs who take a short launch exclusivity, run the CrazyGames SDK, and allow syndication.
- **Poki** (Poki for Developers): reported split (**reported, not a verified contract**): developers keep 50% of revenue from players Poki brought, and 100% from players the developer brought themselves. Rewards driving your own traffic.

Use the **CI web build** for submissions — it's the same artifact every push, so the portal copy stays fresh.

### 4. Donations and tips (stack on top of everything)

- itch.io has a built-in donation button on pay-what-you-want pages — leave it on
- Add a support link (Ko-fi or similar — owner's call, needs his account) on the itch page and the GitHub Pages build

## What CI already does (nothing for you to do)

Every push to `main` triggers the **Build Concrete Dragon** workflow:

- Builds **Web**, **Android APK**, and **Android AAB** (Godot 4.7.2)
- Signs Android builds with the **release keystore** (`streetbrawl` alias, stored as repo secrets `ANDROID_KEYSTORE_BASE64` / `ANDROID_KEYSTORE_ALIAS` / `ANDROID_KEYSTORE_PASSWORD`; backup kept securely off-repo)
- Auto-bumps version code every run (app stores require always-increasing codes — ready for the day Play is affordable)
- Deploys the web build to **https://mhvnsnt.github.io/ConcreteDragon/** — always the latest, playable in any browser
- APK + AAB downloadable from the run's **Artifacts** (Actions tab → latest green run)
- The AAB is kept for a future store move; the APK is the sideload workhorse today

## Your manual steps (one-time, ~30 min total)

### 1. itch.io page (~20 min)

1. Create a free account at https://itch.io
2. **New project** → title **Concrete Dragon**, kind **Game**
3. Upload the zipped web build → check **"This file will be played in the browser"**
4. Upload `street-brawl.apk` as an additional downloadable file
5. Pricing → **$0 minimum, donations enabled** (or set your price)
6. Write the description (keywords: street brawler, tap fighter, knockout, ragdoll KO), add the GitHub Pages link as the demo URL
7. Publish

### 2. Share the sideload APK (~10 min)

1. From the itch page, copy the APK download link
2. Post it wherever your players are (socials, Discord, SMS to testers)
3. When a new build drops, re-upload the fresh APK from the latest green Actions run — same page, new file

## Later (not needed yet)

- **CrazyGames / Poki submission** — when session length and polish justify it; read their current terms and SDK requirements first
- **Play Console** — the moment earnings cover the $25 fee: create the developer account ($25 one-time + ID), create the app named **Concrete Dragon** (package `com.orionenterprises.streetbrawl` is already set and stays), upload the CI-built AAB to internal testing. Release signing and version-code bumping are already configured, so this step is ~35 minutes of clicking, no engineering
- **Automated store uploads** — a service account + upload action can push the AAB on every build; phase 2, only if store uploads get frequent

## Notes

- **Never lose the keystore.** Backup lives off-repo; repo secrets hold the working copy. Without it, a future Play listing couldn't be updated — you'd have to republish as a brand-new app.
- CI shows "using 33.0.2" build-tools warnings — benign; target SDK gets bumped before any production store release.
- Portal revenue-share numbers above are from public 2026 industry guides, not contracts — treat as a map, not a rate card. itch.io's 10%-adjustable cut is their published policy.
