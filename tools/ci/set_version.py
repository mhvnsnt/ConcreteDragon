#!/usr/bin/env python3
"""Patch game/export_presets.cfg with CI version + keystore settings.

Run from the game/ directory:
    python3 ../tools/ci/set_version.py --version-code 1001 --version-name 0.1.0.5 \\
        --keystore /root/.android/debug.keystore --alias androiddebugkey --password android
"""
import argparse

p = argparse.ArgumentParser()
p.add_argument("--version-code", required=True)
p.add_argument("--version-name", required=True)
p.add_argument("--keystore", required=True)
p.add_argument("--alias", required=True)
p.add_argument("--password", required=True)
a = p.parse_args()

path = "export_presets.cfg"
lines = open(path).read().splitlines(keepends=True)
out = []
in_options = False
for line in lines:
    s = line.strip()
    if s.startswith("["):
        in_options = s.endswith(".options]")
        out.append(line)
        continue
    if in_options:
        if s.startswith("version/code="):
            line = f"version/code={a.version_code}\n"
        elif s.startswith("version/name="):
            line = f'version/name="{a.version_name}"\n'
        elif s.startswith("keystore/release="):
            line = f'keystore/release="{a.keystore}"\n'
        elif s.startswith("keystore/release_user="):
            line = f'keystore/release_user="{a.alias}"\n'
        elif s.startswith("keystore/release_password="):
            line = f'keystore/release_password="{a.password}"\n'
    out.append(line)
open(path, "w").write("".join(out))
print(f"patched export_presets.cfg: code={a.version_code} name={a.version_name}")
