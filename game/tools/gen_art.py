#!/usr/bin/env python3
"""Procedural art generator for Concrete Dragon M1 (100% original artwork).
Draws cute chibi paper-doll fighter parts, stage, and UI icons with PIL.
All shapes are drawn programmatically from primitive shapes - no external assets.
"""
import os, json, math
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "art")
os.makedirs(ROOT, exist_ok=True)
DARK = (34, 34, 34, 255)          # thick outline color #222
FONTB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

C = 256  # canvas size

def canvas():
    return Image.new("RGBA", (C, C), (0, 0, 0, 0))

def outline_poly(d, pts, fill, w=7):
    """Filled polygon with a thick dark outline."""
    d.line(pts + [pts[0]], fill=DARK, width=w, joint="curve")
    d.polygon(pts, fill=fill)

# ---------------------------------------------------------------- heads
def draw_head(skin, hair_color, style):
    img = canvas(); d = ImageDraw.Draw(img)
    cx, cy, r = 128, 124, 86
    if style == "vex":
        # flowing hair behind head (dark brown bob)
        d.ellipse([cx-r-14, cy-r+8, cx+r+14, cy+r+26], fill=hair_color)
    # skin head
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=skin, outline=DARK, width=9)
    if style == "rook":
        # short black hair: cap over the top of the head
        d.pieslice([cx-r+2, cy-r-12, cx+r-2, cy+10], start=180, end=360, fill=hair_color)
        # spiky fringe triangles along the hairline
        for x0, x1, y in [(58, 76, 74), (78, 96, 66), (98, 116, 62),
                          (118, 136, 62), (138, 156, 64), (158, 176, 68),
                          (178, 196, 74)]:
            outline_poly(d, [(x0, y), (x1, y), ((x0+x1)//2, y+26)], hair_color, w=5)
        # sideburn tufts
        outline_poly(d, [(48, 100), (66, 104), (56, 140)], hair_color, w=5)
        outline_poly(d, [(208, 100), (190, 104), (200, 140)], hair_color, w=5)
    # ---- face (3/4 view facing right) ----
    # right eye (big, viewer-right)
    d.ellipse([138, 108, 188, 162], fill=(255, 255, 255, 255), outline=DARK, width=6)
    d.ellipse([152, 120, 176, 148], fill=DARK)
    d.ellipse([158, 124, 168, 136], fill=(255, 255, 255, 255))
    # left eye (smaller, hint of the far eye)
    d.ellipse([88, 112, 124, 152], fill=(255, 255, 255, 255), outline=DARK, width=5)
    d.ellipse([99, 122, 117, 142], fill=DARK)
    d.ellipse([103, 125, 110, 133], fill=(255, 255, 255, 255))
    # nose bump on the right edge
    d.arc([186, 148, 206, 168], start=270, end=90, fill=DARK, width=5)
    if style == "rook":
        # determined angled brows
        outline_poly(d, [(132, 92), (192, 78), (190, 92), (130, 104)], (25, 25, 28, 255), w=4)
        outline_poly(d, [(84, 96), (122, 90), (120, 102), (82, 108)], (25, 25, 28, 255), w=4)
        # slight confident smile
        d.arc([118, 158, 190, 200], start=15, end=165, fill=DARK, width=6)
        # cheek blush
        d.ellipse([96, 158, 118, 174], fill=(240, 120, 120, 160))
        d.ellipse([188, 158, 208, 172], fill=(240, 120, 120, 160))
    else:
        # smug: one raised eyebrow, one flat
        outline_poly(d, [(134, 66), (194, 56), (192, 70), (132, 80)], (40, 26, 18, 255), w=4)
        outline_poly(d, [(86, 96), (122, 92), (120, 104), (84, 108)], (40, 26, 18, 255), w=4)
        # smirk, pulled to the right
        d.arc([130, 160, 204, 202], start=10, end=150, fill=DARK, width=6)
        d.line([(196, 168), (208, 162)], fill=DARK, width=6)
        # beauty mark
        d.ellipse([176, 176, 182, 182], fill=DARK)
    if style == "vex":
        teal = (46, 196, 182, 255)
        # headband tails flowing behind (left side), drawn over hair but band covers top
        outline_poly(d, [(70, 66), (34, 96), (44, 130), (66, 104)], teal, w=5)
        outline_poly(d, [(72, 78), (44, 128), (58, 158), (84, 112)], teal, w=5)
        # headband band across forehead
        d.arc([cx-r-2, cy-r-6, cx+r+2, cy+r+6], start=195, end=345, fill=teal, width=24)
        # knot
        d.ellipse([52, 52, 84, 84], fill=teal, outline=DARK, width=5)
    return img

# ---------------------------------------------------------------- torsos
def draw_torso_rook():
    img = canvas(); d = ImageDraw.Draw(img)
    skin = (242, 184, 128, 255); navy = (29, 53, 87, 255)
    # neck stub
    d.rounded_rectangle([112, 6, 144, 44], radius=10, fill=skin, outline=DARK, width=7)
    # tank top
    d.rounded_rectangle([52, 30, 204, 178], radius=34, fill=navy, outline=DARK, width=9)
    # neckline trim + armhole trim
    d.arc([96, 22, 160, 78], start=15, end=165, fill=(255, 255, 255, 255), width=7)
    d.arc([40, 60, 90, 130], start=90, end=270, fill=(255, 255, 255, 255), width=6)
    d.arc([166, 60, 216, 130], start=270, end=90, fill=(255, 255, 255, 255), width=6)
    # fabric shading stripe
    d.rounded_rectangle([70, 120, 96, 165], radius=10, fill=(45, 72, 110, 255))
    # shorts
    d.rounded_rectangle([64, 168, 192, 236], radius=26, fill=navy, outline=DARK, width=9)
    d.line([(128, 200), (128, 236)], fill=DARK, width=6)
    d.line([(70, 196), (186, 196)], fill=(255, 255, 255, 255), width=5)
    return img

def draw_torso_vex():
    img = canvas(); d = ImageDraw.Draw(img)
    skin = (201, 141, 94, 255); purp = (123, 47, 247, 255); teal = (46, 196, 182, 255)
    # neck stub
    d.rounded_rectangle([112, 6, 144, 44], radius=10, fill=skin, outline=DARK, width=7)
    # crop top
    d.rounded_rectangle([58, 52, 198, 150], radius=30, fill=purp, outline=DARK, width=9)
    d.rounded_rectangle([58, 128, 198, 150], radius=11, fill=teal)  # bottom trim band
    d.line([(128, 52), (128, 128)], fill=(150, 90, 255, 255), width=5)  # center seam
    d.arc([98, 46, 158, 96], start=15, end=165, fill=(255, 255, 255, 255), width=6)
    # midriff
    d.rounded_rectangle([96, 152, 160, 190], radius=12, fill=skin, outline=DARK, width=7)
    # black shorts
    d.rounded_rectangle([66, 184, 190, 244], radius=24, fill=(30, 30, 34, 255),
                        outline=DARK, width=9)
    d.line([(128, 212), (128, 244)], fill=DARK, width=6)
    d.line([(72, 210), (184, 210)], fill=teal, width=5)
    return img

# ---------------------------------------------------------------- arms
def draw_arm_u(skin):
    img = canvas(); d = ImageDraw.Draw(img)
    # upper arm capsule, shoulder at top
    d.rounded_rectangle([100, 8, 156, 132], radius=28, fill=skin, outline=DARK, width=8)
    d.rounded_rectangle([108, 30, 126, 110], radius=9, fill=(255, 255, 255, 60))  # sheen
    return img

def draw_arm_f_rook(skin):
    img = canvas(); d = ImageDraw.Draw(img)
    red = (230, 57, 70, 255)
    # forearm
    d.rounded_rectangle([104, 6, 152, 100], radius=24, fill=skin, outline=DARK, width=8)
    # white cuff
    d.rounded_rectangle([96, 86, 160, 118], radius=12, fill=(245, 245, 245, 255),
                        outline=DARK, width=7)
    # big boxing glove
    d.ellipse([52, 104, 204, 226], fill=red, outline=DARK, width=10)
    # thumb
    d.ellipse([150, 150, 204, 200], fill=red, outline=DARK, width=8)
    # glove shading + highlight
    d.arc([70, 118, 150, 200], start=90, end=270, fill=(170, 30, 42, 255), width=10)
    d.ellipse([82, 128, 112, 158], fill=(255, 255, 255, 110))
    return img

def draw_arm_f_vex(skin):
    img = canvas(); d = ImageDraw.Draw(img)
    teal = (46, 196, 182, 255)
    # forearm
    d.rounded_rectangle([104, 6, 152, 110], radius=24, fill=skin, outline=DARK, width=8)
    # teal hand-wrap bands around forearm
    for y in (30, 58, 86):
        d.rectangle([100, y, 156, y+16], fill=teal, outline=DARK, width=5)
    # wrapped fist (smaller than a glove)
    d.rounded_rectangle([92, 100, 164, 172], radius=30, fill=skin, outline=DARK, width=9)
    # wrap straps across knuckles
    d.line([(96, 124), (160, 124)], fill=teal, width=12)
    d.line([(96, 148), (160, 148)], fill=teal, width=12)
    d.line([(96, 124), (160, 124)], fill=DARK, width=3)
    d.line([(96, 148), (160, 148)], fill=DARK, width=3)
    # knuckle lines
    for x in (112, 128, 144):
        d.line([(x, 150), (x, 166)], fill=DARK, width=4)
    return img

# ---------------------------------------------------------------- legs
def draw_leg_t(skin):
    img = canvas(); d = ImageDraw.Draw(img)
    # thigh capsule, hip at top
    d.rounded_rectangle([92, 6, 164, 140], radius=34, fill=skin, outline=DARK, width=8)
    d.rounded_rectangle([102, 26, 122, 110], radius=10, fill=(255, 255, 255, 60))
    return img

def draw_leg_s_rook(skin):
    img = canvas(); d = ImageDraw.Draw(img)
    red = (230, 57, 70, 255)
    # shin
    d.rounded_rectangle([104, 4, 152, 116], radius=24, fill=skin, outline=DARK, width=8)
    # red shoe (chunky, pointing right)
    d.rounded_rectangle([84, 100, 186, 168], radius=30, fill=red, outline=DARK, width=9)
    d.rounded_rectangle([150, 100, 186, 168], radius=18, fill=(190, 40, 52, 255))  # toe
    d.rectangle([84, 148, 186, 168], fill=(245, 245, 245, 255))  # sole
    d.line([(84, 148), (186, 148)], fill=DARK, width=5)
    for x in (110, 130, 150):  # laces
        d.line([(x, 112), (x+10, 128)], fill=(255, 255, 255, 255), width=5)
    return img

def draw_leg_s_vex(skin):
    img = canvas(); d = ImageDraw.Draw(img)
    teal = (46, 196, 182, 255)
    # shin
    d.rounded_rectangle([104, 4, 152, 120], radius=24, fill=skin, outline=DARK, width=8)
    # teal ankle wrap
    d.rounded_rectangle([98, 108, 158, 140], radius=12, fill=teal, outline=DARK, width=7)
    # bare foot pointing right
    d.rounded_rectangle([88, 132, 188, 180], radius=24, fill=skin, outline=DARK, width=9)
    for i, x in enumerate((158, 170, 180)):  # toes
        d.line([(x, 152), (x+4, 172)], fill=DARK, width=4)
    return img

# ---------------------------------------------------------------- build fighters
ROOK_SKIN = (242, 184, 128, 255)
VEX_SKIN = (201, 141, 94, 255)

fighters = {
    "rook": {
        "head.png":  draw_head(ROOK_SKIN, (25, 25, 28, 255), "rook"),
        "torso.png": draw_torso_rook(),
        "arm_u.png": draw_arm_u(ROOK_SKIN),
        "arm_f.png": draw_arm_f_rook(ROOK_SKIN),
        "leg_t.png": draw_leg_t(ROOK_SKIN),
        "leg_s.png": draw_leg_s_rook(ROOK_SKIN),
    },
    "vex": {
        "head.png":  draw_head(VEX_SKIN, (58, 38, 24, 255), "vex"),
        "torso.png": draw_torso_vex(),
        "arm_u.png": draw_arm_u(VEX_SKIN),
        "arm_f.png": draw_arm_f_vex(VEX_SKIN),
        "leg_t.png": draw_leg_t(VEX_SKIN),
        "leg_s.png": draw_leg_s_vex(VEX_SKIN),
    },
}

for name, parts in fighters.items():
    fdir = os.path.join(ROOT, name)
    os.makedirs(fdir, exist_ok=True)
    for fname, img in parts.items():
        img.save(os.path.join(fdir, fname))
        print("wrote", name, fname)

# pivots: fraction of 256x256 canvas where the part attaches to its joint
pivots = {
    "rook": {
        "head.png":  [0.50, 0.82],  # neck (bottom-center of head)
        "torso.png": [0.50, 0.05],  # neck (top-center)
        "arm_u.png": [0.50, 0.04],  # shoulder
        "arm_f.png": [0.50, 0.05],  # elbow
        "leg_t.png": [0.50, 0.03],  # hip
        "leg_s.png": [0.50, 0.04],  # knee
    },
    "vex": {
        "head.png":  [0.50, 0.82],
        "torso.png": [0.50, 0.05],
        "arm_u.png": [0.50, 0.04],
        "arm_f.png": [0.50, 0.05],
        "leg_t.png": [0.50, 0.03],
        "leg_s.png": [0.50, 0.04],
    },
}
with open(os.path.join(ROOT, "pivots.json"), "w") as f:
    json.dump(pivots, f, indent=2)
print("wrote pivots.json")

# assembled preview sanity check (not a deliverable, just sizes)
head_h = 172; torso_h = 205; thigh_h = 120; shin_h = 150
print("approx assembled height:", head_h + torso_h + thigh_h + shin_h - 150, "px (overlaps subtracted)")
