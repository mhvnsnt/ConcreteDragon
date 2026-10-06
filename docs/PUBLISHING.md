# Publishing Concrete Dragon — owner's manual steps

Everything builds automatically. This doc covers the few things only you can do.

## What CI already does (nothing for you to do)

Every push to `main` triggers the **Build Concrete Dragon** workflow:

- Builds **Web**, **Android APK**, and **Android AAB** (Godot 4.7.2)
- Signs Android builds with the **release keystore** (`streetbrawl` alias, stored as repo secrets `ANDROID_KEYSTORE_BASE64` / `ANDROID_KEYSTORE_ALIAS` / `ANDROID_KEYSTORE_PASSWORD`; backup kept securely off-repo)
- Auto-bumps version code every run (Google Play requires always-increasing codes)
- Deploys the web build to **https://mhvnsnt.github.io/StreetBrawl/** — always the latest, playable in any browser
- APK + AAB downloadable from the run's **Artifacts** (Actions tab → latest green run)

## Your manual steps (one-time, ~35 min total)

### 1. Google Play developer account (~15 min, $25 one-time)

Only you can do this — Google requires your identity.

1. Go to https://play.google.com/console/signup
2. Pay the $25 one-time registration fee
3. Complete identity verification (government ID)

### 2. Create the app in Play Console (~10 min)

1. Play Console → **Create app**
2. App name: **Concrete Dragon** (owner pick 2026-10-06 — the store listing name can be edited anytime; the package `com.orionenterprises.streetbrawl` is already set and stays)
3. Default language, **App or Game → Game**, **Free**
4. Accept declarations, create

### 3. First AAB upload — internal testing (~10 min)

Google requires the first upload to be manual. After that it can be automated.

1. GitHub → **mhvnsnt/StreetBrawl** → **Actions** → latest green **Build Concrete Dragon** run
2. Download the **street-brawl-android** artifact, unzip → take `street-brawl.aab`
3. Play Console → your app → **Testing → Internal testing** → **Create new release**
4. Upload the AAB, add yourself as a tester (your Gmail), **Roll out**
5. Install on your phone from the internal-testing opt-in link — that's your private beta

## After that

- **Web players**: nothing to do — https://mhvnsnt.github.io/StreetBrawl/ updates on every push.
- **Play updates**: download the new AAB from Actions artifacts and upload a new internal-testing release (2 minutes).
- **Sideload APK**: the APK artifact installs on any Android phone directly (enable "install unknown apps").

## Later (not needed yet)

- **Automated Play uploads** — a service account + the `r0adkll/upload-google-play` action can push the AAB straight to the internal track on every build. Phase 2, when uploads get frequent — you'll create the service account in Play Console; ask when you want it.
- **Closed/open testing tracks** — same upload flow, wider tester lists.
- **Production release** — release signing is already configured; still needs Play's data-safety form, content-rating questionnaire, and store listing (screenshots, description). We'll do this when the game is ready.

## Notes

- **Never lose the keystore.** Backup lives off-repo; repo secrets hold the working copy. Without it, Google won't let you update the app — you'd have to republish as a brand-new app.
- CI shows "using 33.0.2" build-tools warnings — benign for now; we'll bump target SDK before the production Play release (Google requires recent targets for new apps).
