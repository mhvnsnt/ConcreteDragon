# Concrete Dragon — 3D Asset Pull-In Log

STAGING ONLY. Nothing in this folder is wired into the playable build.
Integration needs the owner's explicit okay per item.

## Staged (verified downloads, 2026-10-06)

### 1. Faux asphalt texture pack — para (CC0 1.0)
- Path: `textures/faux_asphalt_texture_pack.zip` (16.4 MB, 9 seamless PNGs, 512–2048px)
- Source: https://lpc.opengameart.org/comment/21312 (license shown on page: CC0; author notes "public domain")
- Verified: valid zip, 9 PNGs extract cleanly
- Fit: street-ground variation for new districts; seamless tiling suits the procedural road builder in `kit/src/main.js` (`buildStreet`)

### 2. "Joyfully" loop — MintoDog (CC0 1.0)
- Path: `audio/joyfully_loop_bpm170.mp3` (3.7 MB, 170 BPM, ~1.5 min seamless loop)
- Source: http://opengameart.org/content/joyfully (license shown on page: CC0)
- Verified: valid MPEG layer III, 320 kbps, ID3v2.3
- Fit: upbeat menu/KO-celebration music candidate; the build inlines mono 32 kHz MP3, so this would be downsampled at integration time

## Cataloged (CC0 confirmed, NOT yet downloaded — staged on approval)

3. **Crowd Cheering — SoundBiterSFX (CC0)**, 45s crowd wave, freesound: https://freesound.org/people/SoundBiterSFX/sounds/730908/ — needs free freesound login to download; flag for key-harvester/account lane
4. **KayKit City Builder Bits 1.0 (CC0)** — already in the build pipeline; additional packs (more buildings/props) at https://kaykit.com — candidate for district variety
5. **Kenney Impact Sounds / Interface Sounds (CC0)** — already in the build; Kenney's "Music Jingles" (CC0) at https://kenney.nl — candidate for KO/victory stingers
6. **OpenGameArt "Boxing ring" bell + crowd (CC0)** — already in the build ("Fast fight battle music" by bonsaiheldin)

## License policy for this folder
- CC0 / public domain ONLY lands here. Anything with attribution requirements (CC-BY) gets noted, not downloaded, until the owner approves attribution handling.
- Each entry above records: file, author, license, source URL, verification, fit. Keep this up with every new pull-in.
