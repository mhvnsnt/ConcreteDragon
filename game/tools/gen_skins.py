#!/usr/bin/env python3
"""Wave-1 DLC skin packs for Concrete Dragon. 100% procedural, original artwork.

Reuses gen_art.py primitives (canvas, outline_poly, DARK, draw_head, draw_arm_u,
draw_leg_t). Paper-doll layout and pivots are IDENTICAL to the base fighters,
so skins are drop-in for the fighter rig — style only, no power.

Skins:
  rook_noir   — "Noir Rook"      (Midnight pack): black/gold attire, crimson gloves
  vex_crimson — "Crimson Vex"    (Bloodline pack): crimson/black attire, crimson wraps

Output: m1/assets/skins/<skin>/*.png + skins/pivots.json
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_art as G
from PIL import ImageDraw

SKIN_ROOT = os.path.expanduser(
    "~/workspace/money-machine-hq/tracks/street-brawl/m1/assets/skins")
os.makedirs(SKIN_ROOT, exist_ok=True)

DARK = G.DARK
C = G.C

# ---------------------------------------------------------------- rook_noir torso
def draw_torso_rook_noir():
    img = G.canvas(); d = ImageDraw.Draw(img)
    skin = G.ROOK_SKIN
    black = (22, 22, 30, 255); gold = (245, 197, 24, 255)
    # neck stub
    d.rounded_rectangle([112, 6, 144, 44], radius=10, fill=skin, outline=DARK, width=7)
    # black tank top, gold trim
    d.rounded_rectangle([52, 30, 204, 178], radius=34, fill=black, outline=DARK, width=9)
    d.arc([96, 22, 160, 78], start=15, end=165, fill=gold, width=7)
    d.arc([40, 60, 90, 130], start=90, end=270, fill=gold, width=6)
    d.arc([166, 60, 216, 130], start=270, end=90, fill=gold, width=6)
    # gold chest emblem (diamond)
    G.outline_poly(d, [(128, 96), (150, 122), (128, 148), (106, 122)], gold, w=5)
    # black shorts, gold stripe
    d.rounded_rectangle([64, 168, 192, 236], radius=26, fill=black, outline=DARK, width=9)
    d.line([(128, 200), (128, 236)], fill=DARK, width=6)
    d.line([(70, 196), (186, 196)], fill=gold, width=5)
    return img

def draw_arm_f_rook_noir(skin):
    img = G.canvas(); d = ImageDraw.Draw(img)
    crimson = (178, 24, 38, 255); gold = (245, 197, 24, 255)
    d.rounded_rectangle([104, 6, 152, 100], radius=24, fill=skin, outline=DARK, width=8)
    # gold cuff
    d.rounded_rectangle([96, 86, 160, 118], radius=12, fill=gold,
                        outline=DARK, width=7)
    # crimson glove
    d.ellipse([52, 104, 204, 226], fill=crimson, outline=DARK, width=10)
    d.ellipse([150, 150, 204, 200], fill=crimson, outline=DARK, width=8)
    d.arc([70, 118, 150, 200], start=90, end=270, fill=(120, 14, 24, 255), width=10)
    d.ellipse([82, 128, 112, 158], fill=(255, 255, 255, 110))
    return img

def draw_leg_s_rook_noir(skin):
    img = G.canvas(); d = ImageDraw.Draw(img)
    crimson = (178, 24, 38, 255); gold = (245, 197, 24, 255)
    d.rounded_rectangle([104, 4, 152, 116], radius=24, fill=skin, outline=DARK, width=8)
    # crimson shoe, gold laces
    d.rounded_rectangle([84, 100, 186, 168], radius=30, fill=crimson, outline=DARK, width=9)
    d.rounded_rectangle([150, 100, 186, 168], radius=18, fill=(130, 16, 26, 255))
    d.rectangle([84, 148, 186, 168], fill=(245, 245, 245, 255))
    d.line([(84, 148), (186, 148)], fill=DARK, width=5)
    for x in (110, 130, 150):
        d.line([(x, 112), (x+10, 128)], fill=gold, width=5)
    return img

# ---------------------------------------------------------------- vex_crimson torso
def draw_torso_vex_crimson():
    img = G.canvas(); d = ImageDraw.Draw(img)
    skin = G.VEX_SKIN
    crimson = (193, 18, 28, 255); darkcrim = (140, 12, 20, 255); char = (34, 34, 40, 255)
    d.rounded_rectangle([112, 6, 144, 44], radius=10, fill=skin, outline=DARK, width=7)
    # crimson crop top, black trim band
    d.rounded_rectangle([58, 52, 198, 150], radius=30, fill=crimson, outline=DARK, width=9)
    d.rounded_rectangle([58, 128, 198, 150], radius=11, fill=char)
    d.line([(128, 52), (128, 128)], fill=darkcrim, width=5)
    d.arc([98, 46, 158, 96], start=15, end=165, fill=(255, 255, 255, 255), width=6)
    # midriff
    d.rounded_rectangle([96, 152, 160, 190], radius=12, fill=skin, outline=DARK, width=7)
    # charcoal shorts, crimson stripe
    d.rounded_rectangle([66, 184, 190, 244], radius=24, fill=char,
                        outline=DARK, width=9)
    d.line([(128, 212), (128, 244)], fill=DARK, width=6)
    d.line([(72, 210), (184, 210)], fill=crimson, width=5)
    return img

def draw_arm_f_vex_crimson(skin):
    img = G.canvas(); d = ImageDraw.Draw(img)
    crimson = (193, 18, 28, 255); darkcrim = (140, 12, 20, 255)
    d.rounded_rectangle([104, 6, 152, 110], radius=24, fill=skin, outline=DARK, width=8)
    for y in (30, 58, 86):
        d.rectangle([100, y, 156, y+16], fill=crimson, outline=DARK, width=5)
    d.rounded_rectangle([92, 100, 164, 172], radius=30, fill=skin, outline=DARK, width=9)
    d.line([(96, 124), (160, 124)], fill=crimson, width=12)
    d.line([(96, 148), (160, 148)], fill=crimson, width=12)
    d.line([(96, 124), (160, 124)], fill=DARK, width=3)
    d.line([(96, 148), (160, 148)], fill=DARK, width=3)
    for x in (112, 128, 144):
        d.line([(x, 150), (x, 166)], fill=DARK, width=4)
    # dark crimson knuckle shading
    d.arc([96, 104, 160, 168], start=180, end=360, fill=darkcrim, width=6)
    return img

def draw_leg_s_vex_crimson(skin):
    img = G.canvas(); d = ImageDraw.Draw(img)
    crimson = (193, 18, 28, 255)
    d.rounded_rectangle([104, 4, 152, 120], radius=24, fill=skin, outline=DARK, width=8)
    d.rounded_rectangle([98, 108, 158, 140], radius=12, fill=crimson, outline=DARK, width=7)
    d.rounded_rectangle([88, 132, 188, 180], radius=24, fill=skin, outline=DARK, width=9)
    for i, x in enumerate((158, 170, 180)):
        d.line([(x, 152), (x+4, 172)], fill=DARK, width=4)
    return img

def draw_head_vex_crimson(skin):
    # vex head, but headband/wraps recolored crimson instead of teal
    img = G.canvas(); d = ImageDraw.Draw(img)
    cx, cy, r = 128, 124, 86
    hair_color = (58, 38, 24, 255)
    crimson = (193, 18, 28, 255)
    d.ellipse([cx-r-14, cy-r+8, cx+r+14, cy+r+26], fill=hair_color)
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=skin, outline=DARK, width=9)
    d.ellipse([138, 108, 188, 162], fill=(255, 255, 255, 255), outline=DARK, width=6)
    d.ellipse([152, 120, 176, 148], fill=DARK)
    d.ellipse([158, 124, 168, 136], fill=(255, 255, 255, 255))
    d.ellipse([88, 112, 124, 152], fill=(255, 255, 255, 255), outline=DARK, width=5)
    d.ellipse([99, 122, 117, 142], fill=DARK)
    d.ellipse([103, 125, 110, 133], fill=(255, 255, 255, 255))
    d.arc([186, 148, 206, 168], start=270, end=90, fill=DARK, width=5)
    G.outline_poly(d, [(134, 66), (194, 56), (192, 70), (132, 80)], (40, 26, 18, 255), w=4)
    G.outline_poly(d, [(86, 96), (122, 92), (120, 104), (84, 108)], (40, 26, 18, 255), w=4)
    d.arc([130, 160, 204, 202], start=10, end=150, fill=DARK, width=6)
    d.line([(196, 168), (208, 162)], fill=DARK, width=6)
    d.ellipse([176, 176, 182, 182], fill=DARK)
    # crimson headband tails + band + knot
    G.outline_poly(d, [(70, 66), (34, 96), (44, 130), (66, 104)], crimson, w=5)
    G.outline_poly(d, [(72, 78), (44, 128), (58, 158), (84, 112)], crimson, w=5)
    d.arc([cx-r-2, cy-r-6, cx+r+2, cy+r+6], start=195, end=345, fill=crimson, width=24)
    d.ellipse([52, 52, 84, 84], fill=crimson, outline=DARK, width=5)
    return img

# ---------------------------------------------------------------- build skins
skins = {
    "rook_noir": {
        "display": "Noir Rook",
        "pack": "Midnight",
        "parts": {
            "head.png":  G.draw_head(G.ROOK_SKIN, (25, 25, 28, 255), "rook"),
            "torso.png": draw_torso_rook_noir(),
            "arm_u.png": G.draw_arm_u(G.ROOK_SKIN),
            "arm_f.png": draw_arm_f_rook_noir(G.ROOK_SKIN),
            "leg_t.png": G.draw_leg_t(G.ROOK_SKIN),
            "leg_s.png": draw_leg_s_rook_noir(G.ROOK_SKIN),
        },
    },
    "vex_crimson": {
        "display": "Crimson Vex",
        "pack": "Bloodline",
        "parts": {
            "head.png":  draw_head_vex_crimson(G.VEX_SKIN),
            "torso.png": draw_torso_vex_crimson(),
            "arm_u.png": G.draw_arm_u(G.VEX_SKIN),
            "arm_f.png": draw_arm_f_vex_crimson(G.VEX_SKIN),
            "leg_t.png": G.draw_leg_t(G.VEX_SKIN),
            "leg_s.png": draw_leg_s_vex_crimson(G.VEX_SKIN),
        },
    },
}

BASE_PIVOTS = {
    "head.png":  [0.50, 0.82],
    "torso.png": [0.50, 0.05],
    "arm_u.png": [0.50, 0.04],
    "arm_f.png": [0.50, 0.05],
    "leg_t.png": [0.50, 0.03],
    "leg_s.png": [0.50, 0.04],
}

pivots = {}
for name, spec in skins.items():
    fdir = os.path.join(SKIN_ROOT, name)
    os.makedirs(fdir, exist_ok=True)
    for fname, img in spec["parts"].items():
        img.save(os.path.join(fdir, fname))
        print("wrote", name, fname)
    pivots[name] = dict(BASE_PIVOTS)

with open(os.path.join(SKIN_ROOT, "pivots.json"), "w") as f:
    json.dump(pivots, f, indent=2)
print("wrote skins/pivots.json")

with open(os.path.join(SKIN_ROOT, "SKINS.md"), "w") as f:
    f.write("# Concrete Dragon — Wave-1 DLC Skin Packs\n\n")
    f.write("Procedurally generated by `tools/gen_skins.py` (PIL, original code).\n")
    f.write("No third-party assets — no license encumbrance, safe to ship.\n")
    f.write("Paper-doll layout and pivots are identical to the base fighters;\n")
    f.write("skins are drop-in for the fighter rig. Style only, zero power.\n\n")
    for name, spec in skins.items():
        f.write(f"## {spec['display']} (`{name}/`) — {spec['pack']} pack\n")
        f.write("Parts: head, torso, arm_u, arm_f, leg_t, leg_s (256x256 RGBA PNG).\n\n")
print("wrote skins/SKINS.md")
