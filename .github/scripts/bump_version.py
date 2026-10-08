#!/usr/bin/env python3
"""Street Brawl CI: version + keystore wiring for export_presets.cfg.

- Sets Android version/code from the CI run number (always increases, which
  Google Play requires) and version/name to 0.1.<run>.
- Wires the CI-generated debug keystore into the Android preset.
- Forces Web thread_support=false so the GitHub Pages build runs without
  COOP/COEP headers (GitHub Pages can't send them).

Idempotent. Safe to run locally for testing.
"""
import argparse
import configparser
import sys
from pathlib import Path

PRESETS = Path(__file__).resolve().parents[2] / "game" / "export_presets.cfg"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-number", required=True, help="CI run number -> version/code")
    ap.add_argument("--keystore", default="", help="Path to debug keystore")
    ap.add_argument("--keystore-alias", default="androiddebugkey")
    ap.add_argument("--keystore-pass", default="android")
    ap.add_argument("--presets", default=str(PRESETS))
    args = ap.parse_args()

    cfg = configparser.ConfigParser(interpolation=None)
    cfg.optionxform = str  # keep Godot's option-name casing
    cfg.read(args.presets)

    touched = []
    for section in cfg.sections():
        if not section.startswith("preset.") or section.endswith(".options"):
            continue
        name = cfg.get(section, "name", fallback="").strip('"')
        opts = f"{section}.options"
        if opts not in cfg.sections():
            continue
        if name == "Android":
            cfg.set(opts, "version/code", args.run_number)
            cfg.set(opts, "version/name", f'"0.1.{args.run_number}"')
            if args.keystore:
                cfg.set(opts, "keystore/debug", f'"{args.keystore}"')
                cfg.set(opts, "keystore/debug_user", f'"{args.keystore_alias}"')
                cfg.set(opts, "keystore/debug_password", f'"{args.keystore_pass}"')
            touched.append(f"Android: version/code={args.run_number} version/name=0.1.{args.run_number}")
        elif name == "Web":
            cfg.set(opts, "variant/thread_support", "false")
            touched.append("Web: variant/thread_support=false (GitHub Pages safe)")

    if not touched:
        print("ERROR: no Android/Web presets found in", args.presets, file=sys.stderr)
        return 1

    with open(args.presets, "w") as f:
        cfg.write(f)
    for t in touched:
        print("bump:", t)
    return 0


if __name__ == "__main__":
    sys.exit(main())
