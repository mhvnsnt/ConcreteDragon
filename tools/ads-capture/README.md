# Concrete Dragon ads capture pipeline (owner 2026-10-07)

Fixed-timestep real-gameplay capture: SwiftShader renders ~1-2fps in the VM, so
capture8.mjs patches performance.now + requestAnimationFrame via addInitScript —
every rendered frame advances game time exactly 1/30s, inputs scheduled by
frame number. Assembled at 30fps = true real-time playback.

Deliverables (in ~/workspace/concrete-dragon-ads/, owner reviews before publish):
- concrete-dragon-trailer.mp4 — 25s hype trailer, 1280x720, royalty-free beat (hype-beat.wav, code-generated)
- concrete-dragon-clip1..4.mp4 — 4x 5s vertical clips, 720x1280
- concrete-dragon-ad1..3.png — 3 static ad stills, 1280x720

Run: node capture8.mjs <frames> <outdir> <width> <height>
