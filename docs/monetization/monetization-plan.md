# Concrete Dragon — no-store monetization plan

**Constraint:** owner cannot pay the $25 Google Play developer fee. App-store publishing is OFF the table until earnings cover it. Everything below needs $0 upfront.

**Honest boundary (owner-set):** automation covers everything up to the money — revenue itself needs real buyers. Nothing below promises autonomous income. Every money claim here is a verified term, not a projection.

---

## Ranked paths by speed-to-first-dollar

### 1. Ko-fi tips — FASTEST (first dollar can land the same day the page goes live)

**What it is:** one-off tips ("buy me a coffee") linked from the game, README, and videos.
**Verified terms:** free plan, **0% platform fee on one-off tips** (5% only on memberships/shop sales; Gold ~$6/mo waives that). Money goes **directly to his own PayPal or Stripe** — Ko-fi never holds it, payouts are instant. Sources: ko-fi.com/pricing (via 2026-08-03 primary-source capture), Ko-fi vs Patreon breakdown.
**Why first:** no game changes needed, no review queue, no thresholds. A page can be live 10 minutes after account creation, and a tip lands in his PayPal immediately.

**NEEDS FROM HIM (~15 min, all clicks):**
1. Create account at https://ko-fi.com (~2 min)
2. Connect PayPal **or** Stripe in Ko-fi payment settings (~5 min)
3. Set page name (suggest `concretedragon` or his studio name), profile text, and a funding goal: **"$25 — Google Play developer fee"** (ties the milestone ladder to something fans can see) (~5 min)
4. Say the word — then the link gets wired into the itch page, README, and game builds by the agent team

**ALREADY PREPARED:** goal framing ($25 Play fee milestone), placement plan (itch page draft, README, game credits screen), fee math (0% on tips).

---

### 2. itch.io — BEST COMBINED PATH (audience + money + APK distribution in one page)

**What it is:** free publishing; browser-playable embed + downloadable files; pay-what-you-want or fixed price.
**Verified terms:** publishing is **free, no upfront fee, no approval queue**. Open revenue share — creator sets itch.io's cut **0–100%** (default 10%; payment processing ~2.9% + $0.30 separate). Two payout modes: **"Direct to you"** (money goes instantly to his own PayPal/Stripe, no hold) or **"Collected by itch.io, paid later"** (7-day hold per transaction, $5 minimum payout, tax interview required, manual review — first payouts slow). Sources: itch.io/docs/creators/payments, itch.io revenue guides.
**Why rank 2:** slightly slower than Ko-fi only because the page takes ~30 min to assemble — but it's the only path that also distributes the game (browser embed + APK download) and builds an audience, which feeds every other path.

**Pricing recommendation:** **Pay-what-you-want, $0 minimum** ("free to play, tips welcome") + **"Direct to you"** payments. Reasoning: zero audience → fixed price kills discovery; PWYW keeps play 100% free while fans can tip (itch data: PWYW buyers pay ~30% above minimum on average); Direct-to-you = first tip lands instantly in his PayPal. Revisit fixed price ($1.99–$4.99) at real traction.

**NEEDS FROM HIM (~30 min, all clicks):**
1. Create account at https://itch.io/register (~2 min)
2. Dashboard → New project; paste the ready-made copy from `docs/monetization/itch-page-draft.md` (~10 min)
3. Set pricing to PWYW $0 min; choose **Direct to you**; connect PayPal or Stripe (~5 min)
4. Upload the web build + the signed APK (downloaded from the latest green GitHub Actions run) and the 3 screenshots in `docs/monetization/screenshots/` (~10 min)
5. Hit Publish (can stay Draft until he approves)

**ALREADY PREPARED:** complete page draft (`docs/monetization/itch-page-draft.md`: title, tagline, description, tags, pricing, payment mode), 3 real gameplay screenshots (`docs/monetization/screenshots/`), shot list for cover art + GIF, pre-publish game fix list.

---

### 3. Direct APK sideload (via the itch.io page) — $0 extra setup

**What it is:** the CI already builds a **signed** APK (`street-brawl.apk`, package `com.orionenterprises.streetbrawl`) on every push. The itch.io page hosts it as a download; players install directly.
**Install instructions for players (goes on the itch page):**
1. Download the APK on your Android phone
2. Open it → Android asks to allow "Install unknown apps" for your browser → Allow
3. Tap Install (Play Protect may show an "Unknown app" warning — tap **Install anyway**; this is normal for sideloaded apps)
4. Updates: download the new APK and install over the old one — same signature, so data carries over
**Gotchas:** Play Protect warnings scare some users (expected, dismissible); no auto-updates (players re-download); can't reach users who only install from Play Store. No Android-version assertions here — CI export presets don't pin a min SDK in the repo; verify on a real device before promising compatibility.

**NEEDS FROM HIM:** nothing beyond the itch.io steps above (he downloads the APK from Actions → uploads to itch).
**ALREADY PREPARED:** CI builds + signs the APK on every push; install-instruction copy above; package name and signing notes in `docs/PUBLISHING.md`.

---

### 4. CrazyGames — BIGGEST LONG-TERM UPSIDE, slowest first dollar

**What it is:** browser-game portal (~tens of millions of monthly players); revenue from ads shown around/in the game.
**Verified terms (official docs, docs.crazygames.com/faq, checked 2026-10-06):** Godot is a supported engine. **No exclusivity required** (multi-portal OK). The **CrazyGames SDK is REQUIRED for Full Launch/monetization** (optional for Basic Launch). Pipeline: QA review → **Basic Launch** (soft launch, **ads disabled = $0 earned**) → performance gates → **Full Launch** (ads on, earnings start). Payouts: **€100 minimum**, monthly, via Tipalti (wire/ACH/eCheck/PayPal). **Revenue-share % is not publicly disclosed** (confirmed absent from their public docs as of Sept 2026). Content: must meet PEGI-12, no other-portal branding, no external ads, original content.
**Why rank 4:** real work before dollar one (SDK integration + QA review + Basic Launch performance gates), then a €100 threshold before any payout. Weeks-to-months to first payout even if everything goes right.

**NEEDS FROM HIM:**
1. Create developer account at https://developer.crazygames.com (~5 min)
2. Submit the game build + metadata when the agent team says the SDK build is ready
3. Business/tax details in Tipalti when the €100 threshold approaches (later)

**ALREADY PREPARED:** nothing yet — **next work item:** integrate the CrazyGames SDK v3 into the web export (gameplayStart/gameplayStop, midgame + rewarded ad hooks), then a portal-ready build checklist. Realistic earliest submission: after the in-game "STREET BRAWL" rename + SDK integration.

---

### 5. Poki — RANK LAST for revenue-share (deal structure conflicts with the plan)

**What it is:** large browser-game portal (600+ studios; top performers up to ~€1M/yr per their press).
**Verified terms:** **Poki SDK required.** Two deal types: (a) **web-exclusive for 5 years by default** — "preferred way of working," game runs only on Poki on the open web; or (b) **one-time flat licence fee, no revenue share.** Payout schedule and revenue-share % are **not published**. Free pre-agreement playtesting tool (Mystery Tile) is genuinely useful for QA.
**Why rank last:** the default web-exclusive deal **conflicts with the itch.io browser page and his own GitHub Pages build** — signing it would force taking the game down elsewhere. The non-exclusive alternative is a flat fee (no rev-share upside). Revisit only as a flat-fee licensing conversation much later, or if the strategy ever becomes Poki-first.

**NEEDS FROM HIM:** nothing now. (If ever pursued: developer application at developers.poki.com + SDK integration.)
**ALREADY PREPARED:** conflict analysis (above). The free Mystery Tile playtesting tool is worth using for QA regardless — no agreement required.

---

## Milestone ladder (owner-set): no-store earnings → Play Store

| Earned (withdrawable, no-store) | Unlock |
|---|---|
| **$25** | **Pay the $25 Google Play developer fee FROM EARNINGS.** Play path unlocks: Play Console account → create app → internal-testing AAB upload (steps already documented in `docs/PUBLISHING.md`, "UNLOCKS AT $25 EARNINGS" section). |
| **$50** | Fund the next build milestone (e.g. cover-art/GIF polish, or bank it). |
| **$75** | Bank / reinvest per owner call. |
| **$100** | CrazyGames' €100 payout threshold becomes reachable — portal path starts paying out. Reassess fixed pricing on itch.io. |

"Withdrawable" matters: Ko-fi tips are instant; itch.io "Direct to you" is instant; itch.io "Collected" payouts have a 7-day hold + $5 minimum. The ladder counts money he can actually move.

## Blockers / open questions

1. **Nothing technical blocks paths 1–3** — they need only his account creation + clicks.
2. **Pre-publish game fixes** (from real screenshots): intro splash still says "STREET BRAWL"; title logo overflows at 1280px; confirm ROOK/VEX are canon-approved names before they go public.
3. **CrazyGames SDK integration** is unstarted work — needs a build-system task, not an owner task.
4. **Poki exclusivity conflict** — do not sign a Poki web-exclusive deal without killing the itch/Pages browser builds; flagged so nobody does this accidentally.
5. No revenue projections anywhere in this plan — deliberately. First-dollar timing depends on real players finding the game.
