# Phone Pusher — install Xbox Dev Mode packages from your phone

The Xbox Device Portal only listens on your **local network** (Microsoft
designed it that way — there is no cloud deploy for Dev Mode). But your phone
*is* on that network: when the Xbox runs off your phone hotspot, your phone
is the router. So the phone is the installer. Two ways, hardest last:

## Option 1 — XB Homebrew Vault (Android app, no script)

**XB Homebrew Vault** (open source, `marcelofrau/xb-homebrew-vault` on
GitHub — download its Android APK from its Releases page and install it)
connects to an Xbox in Developer Mode over Wi-Fi and wraps the whole portal
in a phone UI:

- One-click install with automatic dependency resolution
- Install `.appx`/`.msix` from a **URL** or sharing link — send it a link,
  it fetches and pushes the package itself (no manual file juggling)
- Browse/manage installed packages without the portal web pages

Use this if you mostly install **other people's packages** (emulators like
RetroArch/Dolphin/PPSSPP/XBSX2, homebrew). Setup inside the app: enter the
Xbox's portal address (`https://<xbox-ip>:11443`) and the portal
username/password you set in Dev Home → Remote Access Settings.

## Option 2 — push-to-xbox.sh (Termux script, for our own builds)

For our own packages (the Concrete Dragon shell and updates), a scripted
push is more repeatable than tapping:

1. Install **Termux** (from F-Droid or GitHub — not the outdated Play Store
   build), then in Termux: `pkg install curl`
2. Get this script onto the phone once (clone this repo in Termux with
   `git clone`, or download the single file from GitHub).
3. Xbox in Dev Mode, Device Portal enabled, and note its IP (Dev Home shows
   it; on an Android hotspot it's usually `192.168.43.x`).
4. Run (if the file isn't executable after download, call it via `bash`
   or `chmod +x` it first):
   ```
   ./push-to-xbox.sh 192.168.43.2 https://…/ConcreteDragonShell.appx
   ```
   or with a local file + cert:
   ```
   ./push-to-xbox.sh 192.168.43.2 ./ConcreteDragonShell.appx ./ConcreteDragonShell.cer
   ```
5. It prompts for the portal username/password (never saved), installs the
   certificate first when present, uploads the package, and polls the
   install state.

Portal quirks the script already handles: **Basic** auth (not Digest),
self-signed portal cert (`-k`), mandatory `?package=<filename>` parameter,
signing certificate before package, status at
`/api/app/packagemanager/state`.

## After any install

On the Xbox in Dev Home: select the app → **View details** → set its type
to **Game** (gets 5 GB RAM + full GPU instead of the 1 GB / 45% "App"
limits). Then launch.

## Honest limits

- First push must originate **inside** the network — that's this phone.
  Nobody can beam the first package in from the cloud; anyone claiming
  otherwise is selling a retail-mode loophole Microsoft has closed before.
- Hotspot IP can change between sessions; re-check it in Dev Home.
- This script was syntax-checked (`bash -n`) on Linux but cannot be
  end-to-end tested until it meets a real Xbox — first run is the test.
