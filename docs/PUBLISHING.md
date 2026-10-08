# Street Brawl — Publishing Guide

Every push to `main` automatically builds the game: Android APK + Web build as
run artifacts, and the Web build deploys to
**https://mhvnsnt.github.io/StreetBrawl/** (always the latest build, playable
in a browser). Version code bumps automatically from the CI run number.

Getting the APK onto Google Play needs a few one-time manual steps from Real.
Everything after that is automatic.

## One-time setup (Real does this once)

### 1. Google Play developer account — ~$25, required
- Go to https://play.google.com/console/signup and pay the one-time $25
  registration fee. Identity verification is required (driver's license).
- This is the only step that costs money and can't be automated.

### 2. Create the app in Play Console
- Play Console → **Create app**. Name: `Street Brawl`. Default language:
  English (US). App or game: **Game**. Free.
- Complete the store listing basics (short description, icon, screenshots can
  come later — internal testing doesn't need the full listing).

### 3. First release on the internal testing track
- Play Console → **Testing → Internal testing** → **Create new release**.
- Upload the APK from the latest GitHub Actions run
  (Actions → Build Street Brawl → Artifacts → `street-brawl-apk-0.1.N`).
- Add testers: **Testers** tab → create an email list (your Gmail first).
- Google sends an opt-in link — open it on your phone to install.

### 4. (Optional but recommended) Automate Play uploads
After step 3 works once, set up the service account so CI uploads every push:
1. Google Cloud Console → create a project → **Service Accounts** → create one
   (e.g. `street-brawl-play-upload`).
2. Play Console → **Users and permissions** → **Invite new users** → paste the
   service account email → grant **Release Manager** on the Street Brawl app
   (app-level permission, not account-wide).
3. In GCP: service account → **Keys** → **Add key** → JSON → download.
4. GitHub repo → **Settings → Secrets and variables → Actions** → new secret
   named `PLAY_SERVICE_ACCOUNT_JSON` → paste the whole JSON file contents.
5. Done — from the next push on, CI uploads each APK to the internal track
   automatically. (The workflow skips this step until the secret exists.)

### 5. Signing (before any public release)
- The CI builds are signed with a throwaway debug key — fine for internal
  testing, **never** for production.
- Enroll in **Play App Signing** (Play Console → Setup → App signing) and let
  Google manage the signing key. Before the first production release, generate
  a dedicated **upload keystore** and store it as repo secrets
  (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASS`, `ANDROID_KEY_ALIAS`) —
  the workflow will be extended to use it. Ask Ashes when you're ready.

## Package name (locked on first upload)

`com.orionenterprises.streetbrawl` — set in `game/export_presets.cfg`. The
first APK uploaded to Play locks this forever. Don't change it.

## Versioning

- `version/code` = GitHub Actions run number (always increases — Play requires this).
- `version/name` = `0.1.<run number>`.
- Both are set automatically in CI; the values in the repo file are placeholders.

## Web build notes

- The Pages build is single-threaded (`variant/thread_support=false` is forced
  in CI) because GitHub Pages can't send the COOP/COEP headers threaded
  Godot builds need. If we ever move hosting, threading can be re-enabled.
- Play the latest build anytime: https://mhvnsnt.github.io/StreetBrawl/
