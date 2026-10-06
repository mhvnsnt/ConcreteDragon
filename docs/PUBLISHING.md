# Publishing Street Brawl

Every push to `main` automatically builds three things (Actions tab → latest run → Artifacts):

| Artifact | What it is | Use it for |
|---|---|---|
| `street-brawl-web` | Playable web build | Auto-deployed to **https://mhvnsnt.github.io/StreetBrawl/** — always the latest |
| `street-brawl.apk` | Signed Android package | Sideload directly onto any Android phone for testing |
| `street-brawl.aab` | Android App Bundle | Upload to Google Play (internal testing track) |

Version code bumps automatically every build (1000 + run number). Version name = `game/version.txt` + run number.

## Owner manual steps (one-time, ~15 minutes)

Everything else is automated. You only do this once:

1. **Create a Google Play developer account** — go to <https://play.google.com/console/signup>, pay the **$25 one-time fee**, verify your identity. (Google requires this; nobody can do it for you.)

2. **Create the app** — Play Console → *Create app* → name **Street Brawl**, default language English, type **Game**, free.

3. **Upload the first build** — Play Console → *Testing* → *Internal testing* → *Create new release* → upload the `street-brawl.aab` from the latest CI run's artifacts.

4. **Add yourself as a tester** — *Internal testing* → *Testers* → create an email list with your Gmail → open the **opt-in link** on your phone → install.

That's it. After that, each push rebuilds the AAB — download it from Actions and upload a new internal-testing release whenever you want testers on the latest.

## Signing (do this before any public release)

Right now CI signs with a **debug key** — fine for internal testing and sideloading, NOT for the Play Store production track.

Before going public, generate a real release keystore **once**:

```bash
keytool -genkeypair -v -keystore street-brawl-release.keystore \
  -alias streetbrawl -keyalg RSA -keysize 2048 -validity 10950
```

Then add three repository secrets (repo → Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 street-brawl-release.keystore` output |
| `ANDROID_KEYSTORE_ALIAS` | `streetbrawl` (or your alias) |
| `ANDROID_KEYSTORE_PASSWORD` | your keystore password |

CI picks them up automatically on the next push — no workflow changes needed.

> ⚠️ **Back up the keystore file somewhere safe** (and the password). If you lose it, Google will never let you update the app again — you'd have to publish as a brand-new app and lose all users/reviews.

## Later (not needed yet)

- **Closed/open testing tracks** — same upload flow, wider tester lists.
- **Production release** — requires the release keystore above, plus Play's data-safety form, content rating questionnaire, and store listing (screenshots, description). We'll do this when the game is ready.
- **Automated Play uploads** — a service account + the `r0adkll/upload-google-play` action can push the AAB straight to the internal track on every build. Phase 2, when uploads get frequent.
