# Concrete Dragon — Xbox Shell (Dev Mode)

One install, then the game updates itself. This folder turns the **web build**
of Concrete Dragon into an Xbox One app without forking the game:

- `ConcreteDragonShell/` — a minimal UWP (C#) app whose only job is to host
  the live game at <https://mhvnsnt.github.io/ConcreteDragon/> full-screen in
  a WebView. It contains **no game code**.
- `phone-pusher/` — install the shell (or any `.appx`/`.msix`) from a phone,
  no PC needed at the console. See `phone-pusher/README.md`.

## Why a shell instead of packaging the game?

The game already ships as a single-file web build and already updates on the
web. Wrapping the *URL* instead of the *files* means:

1. Install the shell on the Xbox **once** (Dev Mode sideload, below).
2. Every future game update is just the normal web deploy — the shell loads
   the new version next launch. Nobody re-installs anything, ever.

The web build already speaks controller: standard Gamepad API support
(left stick/D-pad move, A punch/confirm, B heavy/back, X special, Y hold =
block, LB grapple, RB jump, View taunt, Start pause) lives in
`game-3d/src/main.js` ("XBOX / GAMEPAD input" section).

## One-time install on the Xbox (owner, at the console)

Prerequisites: Xbox One X/S in **Developer Mode** (Xbox Dev Mode app from the
Store + a Partner Center app developer account; the console is tied to *your*
Microsoft account — never share its password). Retail games/apps do not run
while in Dev Mode; reboot back to Retail Mode for them.

1. In Dev Home, enable **Remote Access / Xbox Device Portal** and set a
   portal username + password. Note the portal address, e.g.
   `https://192.168.43.2:11443`.
2. Get `ConcreteDragonShell` packaged as a signed `.appx`/`.msix`
   (see "Building the package" below).
3. Install it — pick one:
   - **Phone (recommended, our setup):** use `phone-pusher/push-to-xbox.sh`
     (Termux) or the XB Homebrew Vault Android app — `phone-pusher/README.md`.
   - **Browser:** open the portal address from any device on the same
     network, sign in, *My games & apps → Add*, choose the package (+ its
     `.cer` and dependencies if asked), Start.
   - **Visual Studio:** open the solution, target *Remote Machine* = the
     Xbox, x64, Deploy.
4. Back in Dev Home, select the app → *View details* → set app type to
   **Game** (5 GB RAM + full GPU, vs 1 GB / 45% as an "App").
5. Launch it. The dragon should load full-screen; the controller toast
   ("🎮 Controller connected") confirms gamepad input.

## Building the package (Windows required — but only for this step)

There is no way around Windows for producing a signed UWP package; the build
can happen on any Windows box or a **cloud Windows builder** (e.g. a
windows-latest CI runner — note this repo's GitHub Actions minutes situation
before relying on it — or a Windows VM). The console-side install is
phone-only either way.

1. Windows 10/11 + **Visual Studio 2022** with the *Universal Windows
   Platform development* workload.
2. Generate the placeholder tile logos (first time only):
   `python xbox-shell/ConcreteDragonShell/Assets/make-logos.py`
   (stdlib-only; replace the solid tiles with real art any time).
3. Open `xbox-shell/ConcreteDragonShell.sln`, set configuration
   **Release / x64**.
4. *Project → Publish → Create App Packages → Sideloading*, check
   "Generate app bundle: Always". If no certificate is configured, create a
   test certificate (Publisher must match `Package.appxmanifest`:
   `CN=ConcreteDragonDev`) and keep the `.cer` with the package — the portal
   install (and the phone pusher) installs the cert alongside the package.
5. Output lands in `AppPackages/` — that's the `.appx`/`.msix` (+ deps) to
   push to the console.

> This source has **not** been compiled on the authoring machine (Linux, no
> Visual Studio). It follows the standard VS UWP Blank App template shape;
> the first Windows build is the real compile test. Report errors back —
> don't assume it built.

## How updates flow after install

| Change | What the owner does |
|---|---|
| Game content/code (normal case) | Nothing. Web deploy updates the URL the shell loads. |
| Shell change (rare: URL move, new capability) | Rebuild package, push again with the phone pusher (2 minutes). |
| New homebrew/emulator | Phone pusher or XB Homebrew Vault from URL — no shell involved. |

## Known risks (read before betting playtime on it)

- **WebView engine age.** Xbox One UWP `WebView` is EdgeHTML-era, *not*
  modern Chromium/WebView2. Three.js/WebGL performance and Gamepad API
  behaviour inside it are **unproven** until tested on the real console.
  The cheap de-risk is the Edge test: open the live URL in the Xbox's Edge
  browser first (Retail Mode, zero installs). If the game runs well there,
  the shell is very likely fine; if Edge struggles, the shell will too and
  a Unity/native route becomes the honest path.
- **Publishing.** Microsoft currently states UWP games are no longer
  accepted in the Xbox Store; retail publishing is ID@Xbox (GDK, concept
  approval). This shell is for *your own console in Dev Mode* — personal
  testing — not a store submission.
- **Dev Mode limits.** Packages must be signed (test cert is fine), portal
  is LAN-only by Microsoft design, and the console must be signed in for
  deployment.
