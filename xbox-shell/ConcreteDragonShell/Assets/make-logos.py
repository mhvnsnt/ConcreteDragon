#!/usr/bin/env python3
"""Generate the shell's placeholder tile/splash PNGs (stdlib only).

The UWP package needs real PNG files for every asset named in the .csproj.
These are solid-color placeholders in Concrete Dragon neon green — swap in
real art later, keeping the same file names/sizes. Run from anywhere:

    python make-logos.py
"""
import os
import struct
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
GREEN = (0x9D, 0xFF, 0x57, 0xFF)      # game HUD green
DARK = (0x0B, 0x0B, 0x10, 0xFF)       # shell background

# filename -> (width, height, rgba)
ASSETS = {
    "StoreLogo.png": (50, 50, GREEN),
    "Square44x44Logo.scale-200.png": (88, 88, GREEN),
    "Square150x150Logo.scale-200.png": (300, 300, GREEN),
    "Wide310x150Logo.scale-200.png": (620, 300, GREEN),
    "SplashScreen.scale-200.png": (1240, 600, DARK),
    "LockScreenLogo.scale-200.png": (48, 48, GREEN),
}


def chunk(tag, data):
    body = tag + data
    return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)


def solid_png(path, w, h, rgba):
    raw = b""
    row = bytes(rgba) * w
    for _ in range(h):
        raw += b"\x00" + row  # filter type 0 per scanline
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def main():
    for name, (w, h, color) in ASSETS.items():
        out = os.path.join(HERE, name)
        solid_png(out, w, h, color)
        print("wrote", out, f"{w}x{h}")


if __name__ == "__main__":
    main()
