# itch.io publish checklist — Concrete Dragon

**The fastest real-money rail.** Free to publish, no approval gate, built-in
payments + donations, 10% default cut (adjustable 0–100%). Full strategy lives in
`docs/PUBLISHING.md` — this is the condensed do-it-today checklist.

**Needs:** free itch.io account. **The owner publishes** — workers never create
accounts in his name. All build artifacts are ready (CI produces them every push).

## Pre-flight (5 min)
- [ ] Latest green **Build Concrete Dragon** run on GitHub Actions
- [ ] Download artifacts: `street-brawl-web` (zip it) + `street-brawl-android` (the APK)
- [ ] Play the web build once at https://mhvnsnt.github.io/ConcreteDragon/ — confirm it runs

## Create the page (20 min)
1. [ ] itch.io → **New project** → title **Concrete Dragon**, kind **Game**, classification **Game**
2. [ ] Upload zipped web build → check **"This file will be played in the browser"** → viewport 1280×720
3. [ ] Upload `street-brawl.apk` as an additional downloadable file (Android sideload)
4. [ ] Pricing → **$0 minimum, donations ON** ("pay what you want"). Test $2.99–$4.99 minimum later once content is deeper
5. [ ] Description keywords: *street brawler, tap fighter, knockout, ragdoll KO, concrete dragon*
6. [ ] Add the GitHub Pages URL as the demo/external link
7. [ ] Cover art: use `game/assets/art/stage.png` or a gameplay screenshot (no AI-slop banners)
8. [ ] Publish → copy the page URL

## Day-one distribution (10 min)
- [ ] Post the itch URL + APK QR code wherever players are (socials, Discord, SMS to testers)
- [ ] Pin the itch link in the repo README

## When a new build drops
- [ ] Re-upload the fresh APK from the latest green Actions run — same page, new file
- [ ] Update the changelog line on the itch page (one sentence per build)

## Milestones → money ladder
- First donations land → they fund the $25 Play developer fee at the $25 milestone
- At $25 earned → Play Console account → upload the CI-built AAB (signing + version codes already configured)
- Session length justifies it → submit the CI web build to CrazyGames / Poki (revenue share)
