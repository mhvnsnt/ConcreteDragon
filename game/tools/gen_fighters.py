#!/usr/bin/env python3
"""Wave-2 new fighters for Concrete Dragon. 100% procedural, original artwork.

Two new paper-doll fighters with DISTINCT silhouettes (not recolors):
  bruno — "BRUNO, The Bouncer": ex-club bouncer. Wide torso, thick arms,
           heavy jaw. Slow, hits like a truck (toughness 1.6, speed 0.85).
  jinx  — "JINX, The Traceur": rooftop runner. Lean, slim limbs, headband.
           Fast, fragile (toughness 0.75, speed 1.25).

Same 256x256 paper-doll schema + pivot layout as the base fighters, so they
are drop-in for the fighter rig. Pivots merged into assets/art/pivots.json.
No third-party assets — no license encumbrance, safe to ship.
"""
import os, json, math
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    "assets", "art")
os.makedirs(ROOT, exist_ok=True)
DARK = (34, 34, 34, 255)
C = 256

def canvas():
    return Image.new("RGBA", (C, C), (0, 0, 0, 0))

def outline_poly(d, pts, fill, w=7):
    d.line(pts + [pts[0]], fill=DARK, width=w, joint="curve")
    d.polygon(pts, fill=fill)

# ================================================================== BRUNO
BRUNO_SKIN = (214, 164, 118, 255)
BRUNO_JACKET = (74, 94, 58, 255)      # olive bomber
BRUNO_JACKET_D = (56, 72, 44, 255)
BRUNO_GOLD = (245, 197, 24, 255)
BRUNO_PANTS = (44, 46, 58, 255)       # dark cargo

def bruno_head():
    img = canvas(); d = ImageDraw.Draw(img)
    skin = BRUNO_SKIN
    cx, cy = 128, 128
    # thick neck
    d.rounded_rectangle([100, 196, 156, 240], radius=14, fill=skin, outline=DARK, width=8)
    # heavy jaw head: wide ellipse + squared chin
    d.ellipse([cx-78, cy-84, cx+78, cy+84], fill=skin, outline=DARK, width=9)
    d.rounded_rectangle([cx-62, cy+30, cx+62, cy+92], radius=22, fill=skin, outline=DARK, width=9)
    # buzz cut
    d.pieslice([cx-80, cy-96, cx+80, cy+6], start=180, end=360, fill=(40, 32, 26, 255))
    # thick angry brows
    outline_poly(d, [(cx-58, cy-38), (cx-8, cy-48), (cx-10, cy-34), (cx-60, cy-24)], (25, 25, 28, 255), w=4)
    outline_poly(d, [(cx+8, cy-48), (cx+58, cy-38), (cx+60, cy-24), (cx+10, cy-34)], (25, 25, 28, 255), w=4)
    # eyes
    for ex in (cx-38, cx+22):
        d.ellipse([ex, cy-14, ex+34, cy+22], fill=(255, 255, 255, 255), outline=DARK, width=6)
        d.ellipse([ex+11, cy-4, ex+25, cy+12], fill=DARK)
    # flat mouth + chin scar
    d.line([(cx-30, cy+58), (cx+30, cy+58)], fill=DARK, width=7)
    d.line([(cx+40, cy+40), (cx+52, cy+62)], fill=(150, 60, 60, 255), width=5)
    return img

def bruno_torso():
    img = canvas(); d = ImageDraw.Draw(img)
    skin = BRUNO_SKIN
    # neck stub
    d.rounded_rectangle([108, 6, 148, 46], radius=10, fill=skin, outline=DARK, width=7)
    # WIDE bomber jacket torso
    d.rounded_rectangle([36, 30, 220, 182], radius=36, fill=BRUNO_JACKET, outline=DARK, width=10)
    # jacket opening + white tee
    outline_poly(d, [(104, 44), (152, 44), (140, 170), (116, 170)], (235, 235, 240, 255), w=6)
    # gold chain
    d.arc([92, 40, 164, 108], start=15, end=165, fill=BRUNO_GOLD, width=8)
    d.ellipse([120, 88, 136, 104], fill=BRUNO_GOLD, outline=DARK, width=4)
    # jacket shading
    d.rounded_rectangle([48, 120, 78, 168], radius=12, fill=BRUNO_JACKET_D)
    # cargo pants
    d.rounded_rectangle([56, 172, 200, 244], radius=24, fill=BRUNO_PANTS, outline=DARK, width=9)
    d.line([(128, 200), (128, 244)], fill=DARK, width=6)
    # cargo pockets
    for px in (76, 150):
        d.rounded_rectangle([px, 196, px+30, 224], radius=6, fill=BRUNO_JACKET_D, outline=DARK, width=5)
    return img

def bruno_arm_u():
    img = canvas(); d = ImageDraw.Draw(img)
    # thick jacket sleeve
    d.rounded_rectangle([96, 6, 160, 120], radius=30, fill=BRUNO_JACKET, outline=DARK, width=9)
    d.rounded_rectangle([96, 100, 160, 128], radius=12, fill=BRUNO_JACKET_D, outline=DARK, width=6)
    # skin forearm stub
    d.rounded_rectangle([104, 120, 152, 150], radius=16, fill=BRUNO_SKIN, outline=DARK, width=8)
    return img

def bruno_arm_f():
    img = canvas(); d = ImageDraw.Draw(img)
    # massive forearm
    d.rounded_rectangle([98, 6, 158, 110], radius=28, fill=BRUNO_SKIN, outline=DARK, width=9)
    # wrapped fist (huge)
    d.ellipse([48, 96, 208, 232], fill=BRUNO_SKIN, outline=DARK, width=11)
    for y in (130, 160, 190):
        d.line([(60, y), (196, y)], fill=DARK, width=6)
    d.ellipse([150, 150, 208, 206], fill=BRUNO_SKIN, outline=DARK, width=8)  # thumb
    return img

def bruno_leg_t():
    img = canvas(); d = ImageDraw.Draw(img)
    # baggy cargo thigh
    d.rounded_rectangle([92, 4, 164, 130], radius=30, fill=BRUNO_PANTS, outline=DARK, width=9)
    d.rounded_rectangle([100, 100, 156, 130], radius=10, fill=BRUNO_JACKET_D, outline=DARK, width=5)
    return img

def bruno_leg_s():
    img = canvas(); d = ImageDraw.Draw(img)
    d.rounded_rectangle([100, 4, 156, 110], radius=24, fill=BRUNO_SKIN, outline=DARK, width=8)
    # heavy boot
    d.rounded_rectangle([80, 96, 190, 170], radius=28, fill=(52, 40, 32, 255), outline=DARK, width=9)
    d.rectangle([80, 148, 190, 170], fill=(30, 24, 20, 255))
    d.line([(80, 148), (190, 148)], fill=DARK, width=5)
    for x in (108, 130, 152):
        d.line([(x, 108), (x+8, 126)], fill=BRUNO_GOLD, width=5)
    return img

# =================================================================== JINX
JINX_SKIN = (172, 118, 84, 255)
JINX_HOODIE = (38, 84, 92, 255)       # dark teal hoodie
JINX_HOODIE_D = (28, 62, 68, 255)
JINX_RED = (214, 48, 58, 255)         # headband red
JINX_JOGGER = (52, 54, 66, 255)

def jinx_head():
    img = canvas(); d = ImageDraw.Draw(img)
    skin = JINX_SKIN
    cx, cy, r = 128, 126, 72
    # slim neck
    d.rounded_rectangle([114, 190, 142, 232], radius=10, fill=skin, outline=DARK, width=7)
    # lean face
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=skin, outline=DARK, width=9)
    # red headband + tails
    d.arc([cx-r-2, cy-r-8, cx+r+2, cy+r+8], start=190, end=350, fill=JINX_RED, width=22)
    outline_poly(d, [(62, 60), (28, 92), (38, 124), (60, 98)], JINX_RED, w=5)
    outline_poly(d, [(64, 72), (38, 120), (52, 148), (78, 104)], JINX_RED, w=5)
    d.ellipse([48, 48, 78, 78], fill=JINX_RED, outline=DARK, width=5)
    # sharp eyes
    for ex, ew in ((cx-46, 30), (cx+14, 34)):
        outline_poly(d, [(ex, cy-16), (ex+ew, cy-20), (ex+ew-4, cy+2), (ex+4, cy+4)], (255, 255, 255, 255), w=5)
        d.ellipse([ex+8, cy-12, ex+22, cy+2], fill=DARK)
    # confident smirk
    d.arc([cx-10, cy+34, cx+58, cy+76], start=10, end=160, fill=DARK, width=6)
    return img

def jinx_torso():
    img = canvas(); d = ImageDraw.Draw(img)
    skin = JINX_SKIN
    # neck
    d.rounded_rectangle([112, 6, 144, 42], radius=10, fill=skin, outline=DARK, width=7)
    # SLIM hoodie torso
    d.rounded_rectangle([70, 30, 186, 168], radius=30, fill=JINX_HOODIE, outline=DARK, width=9)
    # hood bump behind shoulders
    d.ellipse([52, 26, 110, 90], fill=JINX_HOODIE_D, outline=DARK, width=7)
    # kangaroo pocket
    d.rounded_rectangle([92, 110, 164, 158], radius=14, fill=JINX_HOODIE_D, outline=DARK, width=6)
    # drawstrings
    for sx in (112, 144):
        d.line([(sx, 52), (sx, 92)], fill=(220, 220, 225, 255), width=5)
        d.ellipse([sx-6, 88, sx+6, 102], fill=(220, 220, 225, 255), outline=DARK, width=4)
    # red slash accent
    outline_poly(d, [(70, 60), (120, 52), (100, 160), (70, 160)], JINX_RED, w=0)
    # slim jogger waist
    d.rounded_rectangle([78, 162, 178, 236], radius=22, fill=JINX_JOGGER, outline=DARK, width=9)
    d.line([(128, 196), (128, 236)], fill=DARK, width=6)
    return img

def jinx_arm_u():
    img = canvas(); d = ImageDraw.Draw(img)
    # slim hoodie sleeve
    d.rounded_rectangle([106, 6, 150, 112], radius=22, fill=JINX_HOODIE, outline=DARK, width=8)
    d.rounded_rectangle([102, 96, 154, 122], radius=10, fill=JINX_HOODIE_D, outline=DARK, width=6)
    d.rounded_rectangle([108, 116, 148, 142], radius=14, fill=JINX_SKIN, outline=DARK, width=7)
    return img

def jinx_arm_f():
    img = canvas(); d = ImageDraw.Draw(img)
    # slim forearm
    d.rounded_rectangle([106, 6, 150, 104], radius=20, fill=JINX_SKIN, outline=DARK, width=8)
    # fingerless glove fist
    d.ellipse([92, 96, 164, 168], fill=JINX_SKIN, outline=DARK, width=9)
    d.rounded_rectangle([88, 108, 168, 142], radius=12, fill=(40, 40, 48, 255), outline=DARK, width=6)
    for x in (108, 128, 148):
        d.line([(x, 142), (x, 162)], fill=DARK, width=5)
    return img

def jinx_leg_t():
    img = canvas(); d = ImageDraw.Draw(img)
    # slim jogger thigh
    d.rounded_rectangle([104, 4, 152, 124], radius=22, fill=JINX_JOGGER, outline=DARK, width=8)
    d.line([(110, 100), (146, 100)], fill=JINX_RED, width=5)
    return img

def jinx_leg_s():
    img = canvas(); d = ImageDraw.Draw(img)
    d.rounded_rectangle([106, 4, 150, 104], radius=20, fill=JINX_SKIN, outline=DARK, width=8)
    # street sneaker
    outline_poly(d, [(96, 100), (170, 100), (186, 150), (150, 166), (96, 160)], (240, 240, 244, 255), w=8)
    d.line([(96, 140), (186, 140)], fill=JINX_RED, width=8)
    for x in (120, 140, 160):
        d.line([(x, 104), (x+6, 122)], fill=DARK, width=4)
    return img

# ------------------------------------------------------------------ build
BASE_PIVOTS = {
    "head.png":  [0.50, 0.82],
    "torso.png": [0.50, 0.05],
    "arm_u.png": [0.50, 0.04],
    "arm_f.png": [0.50, 0.05],
    "leg_t.png": [0.50, 0.03],
    "leg_s.png": [0.50, 0.04],
}

fighters = {
    "bruno": {
        "head.png": bruno_head(), "torso.png": bruno_torso(),
        "arm_u.png": bruno_arm_u(), "arm_f.png": bruno_arm_f(),
        "leg_t.png": bruno_leg_t(), "leg_s.png": bruno_leg_s(),
    },
    "jinx": {
        "head.png": jinx_head(), "torso.png": jinx_torso(),
        "arm_u.png": jinx_arm_u(), "arm_f.png": jinx_arm_f(),
        "leg_t.png": jinx_leg_t(), "leg_s.png": jinx_leg_s(),
    },
}

for name, parts in fighters.items():
    fdir = os.path.join(ROOT, name)
    os.makedirs(fdir, exist_ok=True)
    for fname, img in parts.items():
        img.save(os.path.join(fdir, fname))
        print("wrote", name, fname)

piv_path = os.path.join(ROOT, "pivots.json")
pivots = json.load(open(piv_path)) if os.path.exists(piv_path) else {}
for name in fighters:
    pivots[name] = dict(BASE_PIVOTS)
json.dump(pivots, open(piv_path, "w"), indent=2)
print("merged pivots:", sorted(pivots.keys()))
