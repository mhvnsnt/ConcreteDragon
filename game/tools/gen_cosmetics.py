#!/usr/bin/env python3
"""Concrete Dragon — character customization art generator (Phase 2, Track 2).

Generates the 7-item customization suite as hand-drawn-style PNG overlays in
the game's paper-doll canvas space (256x256 RGBA, same as assets/art/<fighter>/).
All art is ORIGINAL (drawn by this script with PIL) — no third-party assets,
no license encumbrance. Style law: thick ink outlines (#26232b), flat fills,
simple white highlights — matches gen_art.py output.

Layout: game/assets/art/customize/<fighter>/<item_id>.png
Catalog: game/assets/customize/catalog.json (slots, rarity, unlock, prices).

Slots: headgear, gloves, kicks, accessory (multi-equip), facepaint, eyes.
Every cosmetic is cosmetic-only (zero stats) — enforced by the game code that
reads the catalog, never by the art.
"""
import json
import math
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
ART = os.path.join(GAME, "assets", "art")
OUT = os.path.join(ART, "customize")

INK = (38, 35, 43, 255)        # #26232b — the game's ink line color
WHITE = (245, 242, 235, 255)
HL = (255, 255, 255, 200)      # highlight white

FIGHTERS = ["rook", "vex"]

# Face landmarks, eyeballed from the shipped head.png art (256x256 canvas).
LAND = {
    "rook": {
        "skin": (242, 184, 128, 255),
        "face_c": (128, 150), "face_r": 95,
        "eye_l": (88, 155), "eye_r": (168, 155), "erx": 17, "ery": 19,
        "brow_y": 122, "mouth_y": 210,
        "hair_top": 20, "hair_bot": 112,   # baked hair vertical span
    },
    "vex": {
        "skin": (201, 141, 94, 255),
        "face_c": (128, 145), "face_r": 100,
        "eye_l": (85, 150), "eye_r": (170, 150), "erx": 18, "ery": 20,
        "brow_y": 117, "mouth_y": 205,
        "hair_top": 15, "hair_bot": 118,
    },
}

# Hand/foot regions on the arm_f / leg_s canvases (where the baked hand/foot is).
LIMB = {
    "rook": {"hand": (60, 148, 200, 248), "wrist": (95, 138, 162, 172),
             "foot": (58, 148, 198, 238)},
    "vex":  {"hand": (75, 138, 182, 238), "wrist": (100, 128, 158, 162),
             "foot": (62, 138, 192, 238)},
}


def base_img(fighter, part):
    return Image.open(os.path.join(ART, fighter, part + ".png")).convert("RGBA")


def blank():
    return Image.new("RGBA", (256, 256), (0, 0, 0, 0))


def save(img, fighter, name):
    d = os.path.join(OUT, fighter)
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, name + ".png")
    img.save(p)
    return p


def ring(d, box, fill, width=7):
    d.ellipse(box, outline=INK, width=width)
    d.ellipse([box[0] + width, box[1] + width, box[2] - width, box[3] - width],
              fill=fill)


def poly_ink(d, pts, fill, width=6, close=True):
    if close:
        d.polygon(pts, fill=fill, outline=INK)
    else:
        d.polygon(pts, fill=fill)
    # re-stroke thick: draw outline as lines for width>1 support on old PIL
    if close and width > 1:
        seq = list(pts) + [pts[0]]
        d.line(seq, fill=INK, width=width, joint="curve")


def ellipse_ink(d, box, fill, width=6):
    d.ellipse(box, fill=fill, outline=INK, width=width)


def rect_ink(d, box, fill, width=6):
    d.rectangle(box, fill=fill, outline=INK, width=width)


def highlight(d, box):
    """White gloss arc, top-left of a shape."""
    x0, y0, x1, y1 = box
    d.arc([x0 + 6, y0 + 4, x0 + (x1 - x0) * 0.55, y0 + (y1 - y0) * 0.5],
          start=150, end=250, fill=HL, width=7)


def repaste_eyes(img, fighter):
    """Re-paste the base eyes over whatever was drawn (for masks with eye holes)."""
    b = base_img(fighter, "head")
    L = LAND[fighter]
    for ec in (L["eye_l"], L["eye_r"]):
        box = (ec[0] - L["erx"] - 6, ec[1] - L["ery"] - 6,
               ec[0] + L["erx"] + 6, ec[1] + L["ery"] + 6)
        region = b.crop(box)
        # soft round mask so the hole reads as a hole, not a square
        m = Image.new("L", (box[2] - box[0], box[3] - box[1]), 0)
        ImageDraw.Draw(m).ellipse([0, 0, m.size[0], m.size[1]], fill=255)
        img.paste(region, box[:2], m)
    return img


def p_skimask(fighter):
    img = base_img(fighter, "head"); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx, cy = L["face_c"]; r = L["face_r"]
    # balaclava: full-face ink-black shell
    d.ellipse([cx - r - 4, cy - r - 2, cx + r + 4, cy + r + 6], fill=(24, 22, 30, 255))
    d.ellipse([cx - r - 4, cy - r - 2, cx + r + 4, cy + r + 6], outline=INK, width=7)
    # knit rib lines
    for yy in range(int(cy - r + 18), int(cy + r), 26):
        d.arc([cx - r + 8, yy, cx + r - 8, yy + 22], 200, 340, fill=(60, 58, 70, 255), width=3)
    img = repaste_eyes(img, fighter)
    d = ImageDraw.Draw(img)
    # white rims around the eye holes
    for ec in (L["eye_l"], L["eye_r"]):
        d.ellipse([ec[0] - L["erx"] - 10, ec[1] - L["ery"] - 10,
                   ec[0] + L["erx"] + 10, ec[1] + L["ery"] + 10],
                  outline=WHITE, width=5)
    # small mouth slit
    d.rounded_rectangle([cx - 22, L["mouth_y"] - 8, cx + 22, L["mouth_y"] + 10],
                        radius=8, fill=(10, 9, 12, 255), outline=WHITE, width=3)
    return img


def p_bandana(fighter):
    img = base_img(fighter, "head"); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx, cy = L["face_c"]; r = L["face_r"]
    crim = (198, 40, 55, 255)
    # band across forehead
    d.chord([cx - r - 2, cy - r - 6, cx + r + 2, cy - r + 118], start=180, end=360, fill=crim)
    d.arc([cx - r - 2, cy - r - 6, cx + r + 2, cy - r + 118], start=180, end=360, fill=INK, width=7)
    d.line([cx - r + 6, cy - r + 52, cx + r - 6, cy - r + 52], fill=INK, width=6)
    # paisley dots
    for i, px in enumerate(range(int(cx - r + 24), int(cx + r - 20), 34)):
        d.ellipse([px, cy - r + 22, px + 12, cy - r + 34], fill=WHITE)
        d.ellipse([px + 6, cy - r + 38, px + 14, cy - r + 46], fill=(255, 209, 102, 255))
    # knot at the side
    kx, ky = cx + r - 6, cy - r + 62
    poly_ink(d, [(kx, ky - 16), (kx + 34, ky - 26), (kx + 30, ky + 6), (kx - 4, ky + 12)], crim)
    d.line([kx + 30, ky + 6, kx + 44, ky + 34], fill=crim, width=10)
    d.line([kx + 30, ky + 6, kx + 44, ky + 34], fill=INK, width=14)
    d.line([kx + 30, ky + 6, kx + 44, ky + 34], fill=crim, width=8)
    return img


def p_hockey(fighter):
    img = base_img(fighter, "head"); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx, cy = L["face_c"]; r = L["face_r"]
    bone = (232, 226, 210, 255)
    d.ellipse([cx - r + 12, cy - r + 34, cx + r - 12, cy + r - 18], fill=bone)
    d.ellipse([cx - r + 12, cy - r + 34, cx + r - 12, cy + r - 18], outline=INK, width=8)
    # red stripes
    for yy in (cy - 30, cy + 40):
        d.arc([cx - r + 12, yy - 60, cx + r - 12, yy + 60], 200, 340, fill=(198, 40, 55, 255), width=12)
    # vent holes
    for yy in range(int(cy + 58), int(cy + r - 30), 22):
        for xx in range(int(cx - 40), int(cx + 44), 26):
            d.ellipse([xx, yy, xx + 9, yy + 12], fill=(30, 28, 34, 255))
    highlight(d, [cx - r + 12, cy - r + 34, cx + r - 12, cy + r - 18])
    img = repaste_eyes(img, fighter)
    d = ImageDraw.Draw(img)
    for ec in (L["eye_l"], L["eye_r"]):
        d.ellipse([ec[0] - L["erx"] - 8, ec[1] - L["ery"] - 8,
                   ec[0] + L["erx"] + 8, ec[1] + L["ery"] + 8], outline=INK, width=5)
    return img


def p_lucha(fighter):
    """Barrio Lucha — GENERIC lucha pattern (teal/pink diamonds). NOT Sombra Negra."""
    img = base_img(fighter, "head"); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx, cy = L["face_c"]; r = L["face_r"]
    teal = (46, 196, 182, 255); pink = (255, 79, 152, 255)
    d.ellipse([cx - r - 4, cy - r - 4, cx + r + 4, cy + r + 6], fill=teal)
    d.ellipse([cx - r - 4, cy - r - 4, cx + r + 4, cy + r + 6], outline=INK, width=7)
    # diamond pattern band
    for i in range(7):
        x = cx - r + 14 + i * 26
        poly_ink(d, [(x, cy - r + 26), (x + 13, cy - r + 44), (x, cy - r + 62), (x - 13, cy - r + 44)], pink, width=4)
    # side wings
    for s in (-1, 1):
        poly_ink(d, [(cx + s * (r - 6), cy - 10), (cx + s * (r + 26), cy + 30),
                      (cx + s * (r - 6), cy + 70)], pink, width=4)
    img = repaste_eyes(img, fighter)
    d = ImageDraw.Draw(img)
    for ec in (L["eye_l"], L["eye_r"]):
        d.ellipse([ec[0] - L["erx"] - 9, ec[1] - L["ery"] - 9,
                   ec[0] + L["erx"] + 9, ec[1] + L["ery"] + 9], outline=WHITE, width=4)
    # mouth opening
    d.ellipse([cx - 26, L["mouth_y"] - 14, cx + 26, L["mouth_y"] + 16],
              fill=L["skin"], outline=WHITE, width=4)
    d.arc([cx - 18, L["mouth_y"] - 8, cx + 18, L["mouth_y"] + 14], 20, 160, fill=INK, width=5)
    return img


def p_wolf(fighter):
    img = base_img(fighter, "head"); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx, cy = L["face_c"]; r = L["face_r"]
    fur = (122, 128, 140, 255); dark = (70, 74, 84, 255)
    # ears
    for s in (-1, 1):
        poly_ink(d, [(cx + s * (r - 44), cy - r + 6), (cx + s * (r - 10), cy - r - 52),
                      (cx + s * (r - 78), cy - r + 2)], fur)
        poly_ink(d, [(cx + s * (r - 48), cy - r - 2), (cx + s * (r - 22), cy - r - 34),
                      (cx + s * (r - 62), cy - r - 4)], (214, 150, 160, 255), width=4)
    # fur shell
    d.ellipse([cx - r - 2, cy - r, cx + r + 2, cy + r + 4], fill=fur)
    d.ellipse([cx - r - 2, cy - r, cx + r + 2, cy + r + 4], outline=INK, width=7)
    # fur tufts
    for i in range(9):
        a = math.pi * (0.08 + 0.84 * i / 8)
        x = cx + (r + 2) * math.cos(a); y = cy - (r) * math.sin(a) * 0.98
        d.line([x, y, x + 10 * math.cos(a + 2.6), y + 10 * math.sin(a + 2.6)], fill=dark, width=5)
    # snout over nose/mouth
    poly_ink(d, [(cx - 44, cy + 28), (cx + 44, cy + 28), (cx + 30, cy + 92), (cx - 30, cy + 92)],
             (200, 206, 216, 255))
    d.ellipse([cx - 14, cy + 44, cx + 14, cy + 60], fill=INK)  # nose
    d.line([cx, cy + 60, cx, cy + 78], fill=INK, width=5)
    d.arc([cx - 26, cy + 66, cx, cy + 96], 10, 170, fill=INK, width=5)
    d.arc([cx, cy + 66, cx + 26, cy + 96], 10, 170, fill=INK, width=5)
    img = repaste_eyes(img, fighter)
    return img


def p_tiger(fighter):
    img = base_img(fighter, "head"); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx, cy = L["face_c"]; r = L["face_r"]
    org = (240, 140, 40, 255)
    for s in (-1, 1):
        poly_ink(d, [(cx + s * (r - 50), cy - r + 10), (cx + s * (r - 14), cy - r - 46),
                      (cx + s * (r - 82), cy - r + 6)], org)
    d.ellipse([cx - r - 2, cy - r, cx + r + 2, cy + r + 4], fill=org)
    d.ellipse([cx - r - 2, cy - r, cx + r + 2, cy + r + 4], outline=INK, width=7)
    # stripes
    for i in range(6):
        a = math.pi * (0.12 + 0.76 * i / 5)
        x = cx + (r - 8) * math.cos(a); y = cy - (r - 6) * math.sin(a)
        d.line([x, y, x - 26 * math.cos(a), y + 30 * math.sin(a) + 18], fill=INK, width=9)
    for s in (-1, 1):
        d.line([cx + s * 60, cy + 40, cx + s * 88, cy + 52], fill=INK, width=7)
    # muzzle
    ellipse_ink(d, [cx - 46, cy + 40, cx + 46, cy + 100], (246, 230, 200, 255))
    d.ellipse([cx - 13, cy + 52, cx + 13, cy + 66], fill=INK)
    img = repaste_eyes(img, fighter)
    return img


def _hood_shell(d, L, fill, quilt=False):
    cx, cy = L["face_c"]; r = L["face_r"]
    d.ellipse([cx - r - 26, cy - r - 30, cx + r + 26, cy + r + 30], fill=fill)
    d.ellipse([cx - r - 26, cy - r - 30, cx + r + 26, cy + r + 30], outline=INK, width=8)
    # face opening: re-show the face (paste base face circle back)
    return cx, cy, r


def _hood_opening(img, fighter):
    b = base_img(fighter, "head"); L = LAND[fighter]
    cx, cy = L["face_c"]; r = L["face_r"]
    box = (cx - r + 16, cy - r + 40, cx + r - 16, cy + r - 24)
    region = b.crop(box)
    m = Image.new("L", (box[2] - box[0], box[3] - box[1]), 0)
    ImageDraw.Draw(m).ellipse([0, 0, m.size[0], m.size[1]], fill=255)
    img.paste(region, box[:2], m)
    d = ImageDraw.Draw(img)
    d.ellipse(box, outline=INK, width=7)
    return img


def p_hoodie(fighter):
    img = base_img(fighter, "head"); d = ImageDraw.Draw(img)
    L = LAND[fighter]
    _hood_shell(d, L, (52, 58, 78, 255))
    # drawstrings
    cx, cy = L["face_c"]; r = L["face_r"]
    for s in (-1, 1):
        d.line([cx + s * 44, cy + r - 44, cx + s * 50, cy + r + 6], fill=WHITE, width=7)
        d.ellipse([cx + s * 50 - 6, cy + r, cx + s * 50 + 6, cy + r + 12], fill=WHITE, outline=INK, width=3)
    img = _hood_opening(img, fighter)
    return img


def p_puffer(fighter):
    img = base_img(fighter, "head"); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx, cy = L["face_c"]; r = L["face_r"]
    rust = (176, 84, 30, 255)
    _hood_shell(d, L, rust)
    # quilt segments
    for i in range(5):
        a0 = math.pi * (0.05 + 0.9 * i / 5); a1 = math.pi * (0.05 + 0.9 * (i + 1) / 5)
        d.arc([cx - r - 26, cy - r - 30, cx + r + 26, cy + r + 30],
              start=180 - a1 * 180 / math.pi, end=180 - a0 * 180 / math.pi,
              fill=(120, 55, 20, 255), width=5)
    highlight(d, [cx - r - 26, cy - r - 30, cx + r + 26, cy + r + 30])
    img = _hood_opening(img, fighter)
    return img


def p_hoodvest(fighter):
    img = base_img(fighter, "head"); d = ImageDraw.Draw(img)
    L = LAND[fighter]
    _hood_shell(d, L, (44, 44, 52, 255))
    img = _hood_opening(img, fighter)
    return img


def p_hoodie_torso(fighter):
    img = blank(); d = ImageDraw.Draw(img)
    # drape over shoulders/chest
    poly_ink(d, [(52, 150), (204, 150), (218, 256), (38, 256)], (52, 58, 78, 255))
    d.line([128, 160, 128, 250], fill=INK, width=5)  # zipper
    for s in (-1, 1):
        d.line([128 + s * 40, 190, 128 + s * 46, 240], fill=WHITE, width=6)
    return img


def p_puffer_torso(fighter):
    img = blank(); d = ImageDraw.Draw(img)
    poly_ink(d, [(56, 140), (200, 140), (212, 256), (44, 256)], (176, 84, 30, 255))
    for yy in (180, 215, 248):
        d.line([52, yy, 204, yy], fill=(120, 55, 20, 255), width=5)
    return img


def p_hoodvest_torso(fighter):
    img = blank(); d = ImageDraw.Draw(img)
    # sleeveless vest: torso panels with arm holes
    rect_ink(d, [48, 150, 208, 256], (58, 60, 72, 255))
    for s in (-1, 1):
        d.ellipse([48 + (120 if s > 0 else -30), 150, 48 + (170 if s > 0 else 20), 230],
                  fill=(0, 0, 0, 0))  # arm holes read as negative space over base
    d.line([128, 160, 128, 250], fill=INK, width=5)
    return img


def p_mohawk(fighter):
    img = base_img(fighter, "head"); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx = 128; skin = L["skin"]
    # shave the baked hair: paint skin over the hair band except the center strip
    d.rectangle([20, L["hair_top"] - 8, 108, L["hair_bot"] + 6], fill=skin)
    d.rectangle([148, L["hair_top"] - 8, 236, L["hair_bot"] + 6], fill=skin)
    # mohawk strip with spikes
    pts = []
    for i in range(9):
        x = 108 + i * 5
        pts += [(x, 34), (x + 2.5, 2)]
    poly_ink(d, [(108, 40)] + pts + [(148, 40), (148, 108), (108, 108)], (26, 24, 32, 255))
    d.rectangle([108, 40, 148, 108], fill=(26, 24, 32, 255), outline=INK, width=6)
    for i, sx in enumerate(range(112, 148, 9)):
        d.polygon([(sx, 40), (sx + 4, 8 + (i % 3) * 8), (sx + 8, 40)], fill=(26, 24, 32, 255), outline=INK)
    return img


def p_locs(fighter):
    img = base_img(fighter, "head"); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx, cy = L["face_c"]; r = L["face_r"]
    loc = (74, 52, 38, 255); loc_d = (48, 34, 24, 255)
    # cap over baked hair
    d.chord([cx - r, cy - r - 4, cx + r, cy - r + 96], 180, 360, fill=loc)
    d.arc([cx - r, cy - r - 4, cx + r, cy - r + 96], 180, 360, fill=INK, width=7)
    # hanging locs down the sides
    for s in (-1, 1):
        for i, lx in enumerate([cx + s * (r - 18), cx + s * (r - 2), cx + s * (r + 12)]):
            w = 20 - i * 3
            d.rounded_rectangle([lx - w // 2, cy - 30, lx + w // 2, cy + r - 10 - i * 14],
                                radius=w // 2, fill=loc, outline=INK, width=5)
            for yy in range(int(cy - 10), int(cy + r - 20 - i * 14), 22):
                d.line([lx - w // 2 + 3, yy, lx + w // 2 - 3, yy], fill=loc_d, width=3)
    return img


def p_fade(fighter):
    img = base_img(fighter, "head"); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx = 128; skin = L["skin"]
    # buzz the sides down to skin, keep a short top
    d.rectangle([20, L["hair_top"] - 8, 236, L["hair_bot"] + 6], fill=skin)
    d.chord([cx - 62, 8, cx + 62, 118], 180, 360, fill=(30, 28, 34, 255))
    d.arc([cx - 62, 8, cx + 62, 118], 180, 360, fill=INK, width=6)
    # lightning bolt shaved design on the left
    bolt = [(52, 60), (78, 60), (64, 78), (84, 78), (48, 104), (60, 80), (44, 80)]
    d.polygon(bolt, fill=(210, 200, 190, 255))
    return img
def p_paint_cornerman(fighter):
    img = blank(); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx = 128
    for s in (-1, 1):
        for i in range(3):
            x0 = cx + s * (52 + i * 16); y0 = 168 + i * 6
            d.line([x0, y0, x0 + s * 26, y0 + 14], fill=WHITE, width=11)
            d.line([x0, y0, x0 + s * 26, y0 + 14], fill=INK, width=15)
            d.line([x0, y0, x0 + s * 26, y0 + 14], fill=WHITE, width=9)
    return img


def p_paint_war(fighter):
    img = blank(); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx = 128
    # black band across the eyes
    d.rounded_rectangle([40, 128, 216, 178], radius=20, fill=(22, 20, 26, 255))
    d.rounded_rectangle([40, 128, 216, 178], radius=20, outline=INK, width=5)
    # red cheek slashes
    for s in (-1, 1):
        for i in range(2):
            y0 = 196 + i * 18
            d.line([cx + s * 44, y0, cx + s * 78, y0 + 10], fill=(198, 40, 55, 255), width=9)
    img = repaste_eyes(img, fighter)
    return img


def p_paint_tag(fighter):
    """Graffiti-tag cheek mark — original 'CD' wildstyle."""
    img = blank(); d = ImageDraw.Draw(img)
    # bubble C
    d.arc([52, 168, 108, 224], 40, 320, fill=(255, 79, 152, 255), width=16)
    d.arc([52, 168, 108, 224], 40, 320, fill=INK, width=20)
    d.arc([52, 168, 108, 224], 40, 320, fill=(255, 79, 152, 255), width=12)
    # bubble D
    d.line([116, 172, 116, 220], fill=(46, 196, 182, 255), width=16)
    d.arc([116, 172, 172, 220], 270, 90, fill=(46, 196, 182, 255), width=16)
    d.line([116, 172, 116, 220], fill=INK, width=20)
    d.arc([116, 172, 172, 220], 270, 90, fill=INK, width=20)
    d.line([116, 172, 116, 220], fill=(46, 196, 182, 255), width=12)
    d.arc([116, 172, 172, 220], 270, 90, fill=(46, 196, 182, 255), width=12)
    # drips
    for x, ln in ((70, 18), (140, 24)):
        d.line([x, 222, x, 222 + ln], fill=(255, 79, 152, 255), width=6)
    return img


def p_paint_sugarskull(fighter):
    img = blank(); d = ImageDraw.Draw(img)
    L = LAND[fighter]; cx = 128
    bone = (240, 234, 220, 255)
    for ec in (L["eye_l"], L["eye_r"]):
        # petal eye sockets
        for k in range(8):
            a = k * math.pi / 4
            px = ec[0] + 30 * math.cos(a); py = ec[1] + 32 * math.sin(a)
            d.ellipse([px - 8, py - 8, px + 8, py + 8], fill=(255, 79, 152, 255), outline=INK, width=3)
        d.ellipse([ec[0] - 26, ec[1] - 28, ec[0] + 26, ec[1] + 28], fill=bone, outline=INK, width=5)
    # nose heart
    d.polygon([(cx, 196), (cx - 12, 182), (cx - 6, 172), (cx, 178), (cx + 6, 172), (cx + 12, 182)],
              fill=INK)
    # stitched mouth
    d.line([cx - 34, 218, cx + 34, 218], fill=INK, width=6)
    for x in range(cx - 28, cx + 30, 12):
        d.line([x, 210, x, 226], fill=INK, width=4)
    # forehead flower
    d.ellipse([cx - 10, 96, cx + 10, 116], fill=(255, 209, 102, 255), outline=INK, width=4)
    for k in range(6):
        a = k * math.pi / 3
        d.ellipse([cx + 22 * math.cos(a) - 7, 106 + 22 * math.sin(a) - 7,
                   cx + 22 * math.cos(a) + 7, 106 + 22 * math.sin(a) + 7],
                  fill=(46, 196, 182, 255), outline=INK, width=3)
    img = repaste_eyes(img, fighter)
    return img


# ---------------- EYES (transparent overlays, opaque recolored eyes) ----------------

def _eyes_base(fighter, iris, glow=False):
    img = blank(); d = ImageDraw.Draw(img)
    L = LAND[fighter]
    for ec in (L["eye_l"], L["eye_r"]):
        if glow:
            for rr, al in ((34, 60), (28, 110)):
                d.ellipse([ec[0] - rr, ec[1] - rr, ec[0] + rr, ec[1] + rr],
                          fill=iris[:3] + (al,))
        d.ellipse([ec[0] - L["erx"] - 3, ec[1] - L["ery"] - 3,
                   ec[0] + L["erx"] + 3, ec[1] + L["ery"] + 3], fill=WHITE)
        d.ellipse([ec[0] - 11, ec[1] - 12, ec[0] + 11, ec[1] + 12], fill=iris)
        d.ellipse([ec[0] - 6, ec[1] - 7, ec[0] + 6, ec[1] + 7], fill=INK)
        d.ellipse([ec[0] - 9, ec[1] - 11, ec[0] - 2, ec[1] - 4], fill=HL)
        d.ellipse([ec[0] - L["erx"] - 3, ec[1] - L["ery"] - 3,
                   ec[0] + L["erx"] + 3, ec[1] + L["ery"] + 3], outline=INK, width=6)
    return img


def p_eyes_amber(f): return _eyes_base(f, (217, 151, 13, 255))
def p_eyes_ice(f): return _eyes_base(f, (122, 217, 255, 255))
def p_eyes_violet(f): return _eyes_base(f, (154, 77, 255, 255))
def p_eyes_hollow(f): return _eyes_base(f, (150, 255, 240, 255), glow=True)


# ---------------- GLOVES (arm_f overlays) ----------------

def _glove(fighter, fill, cuff, deco=None):
    img = blank(); d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = LIMB[fighter]["hand"]
    # cuff at wrist
    d.rounded_rectangle([x0 + 12, y0 - 6, x1 - 12, y0 + 34], radius=10, fill=cuff, outline=INK, width=6)
    # mitt
    d.ellipse([x0, y0 + 18, x1, y1], fill=fill)
    d.ellipse([x0, y0 + 18, x1, y1], outline=INK, width=8)
    # thumb
    d.ellipse([x0 - 6, y0 + 52, x0 + 44, y0 + 108], fill=fill, outline=INK, width=7)
    highlight(d, [x0, y0 + 18, x1, y1])
    if deco:
        deco(d, x0, y0, x1, y1)
    return img


def _deco_laces(d, x0, y0, x1, y1):
    cx = (x0 + x1) / 2
    for i, yy in enumerate(range(int(y0 + 44), int(y0 + 84), 12)):
        d.line([cx - 22, yy, cx + 22, yy + (10 if i % 2 == 0 else -10)], fill=WHITE, width=5)


def _deco_stitch(d, x0, y0, x1, y1):
    d.arc([x0 + 14, y0 + 30, x1 - 14, y1 - 14], 200, 340, fill=(60, 40, 24, 255), width=4)


def _deco_scales(d, x0, y0, x1, y1):
    for yy in range(int(y0 + 40), int(y1 - 10), 20):
        for xx in range(int(x0 + 14), int(x1 - 10), 22):
            d.arc([xx, yy, xx + 20, yy + 16], 180, 360, fill=(20, 90, 60, 255), width=4)


def p_gloves_neon(f): return _glove(f, (255, 79, 152, 255), (46, 196, 182, 255), _deco_laces)
def p_gloves_work(f): return _glove(f, (139, 94, 52, 255), (70, 48, 28, 255), _deco_stitch)
def p_gloves_canvas(f): return _glove(f, (210, 180, 140, 255), (120, 100, 70, 255), _deco_laces)
def p_gloves_gold(f): return _glove(f, (36, 34, 40, 255), (255, 209, 102, 255), None)
def p_gloves_dragon(f): return _glove(f, (34, 139, 90, 255), (18, 70, 45, 255), _deco_scales)


# ---------------- KICKS (leg_s overlays) ----------------

def _kick(fighter, fill, sole, deco=None):
    img = blank(); d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = LIMB[fighter]["foot"]
    # ankle collar
    d.rounded_rectangle([x0 + 16, y0 - 10, x1 - 16, y0 + 30], radius=10, fill=fill, outline=INK, width=6)
    # shoe body
    d.rounded_rectangle([x0, y0 + 20, x1, y1 - 16], radius=18, fill=fill, outline=INK, width=8)
    # toe cap
    d.chord([x0 - 4, y0 + 34, x0 + 74, y1 - 8], 270, 90, fill=(fill[0] // 2, fill[1] // 2, fill[2] // 2, 255))
    # sole
    d.rounded_rectangle([x0 - 4, y1 - 22, x1 + 4, y1], radius=8, fill=sole, outline=INK, width=6)
    highlight(d, [x0, y0 + 20, x1, y1 - 16])
    if deco:
        deco(d, x0, y0, x1, y1)
    return img


def _kdeco_laces(d, x0, y0, x1, y1):
    cx = (x0 + x1) / 2
    for yy in range(int(y0 + 44), int(y0 + 84), 14):
        d.line([cx - 18, yy, cx + 18, yy], fill=WHITE, width=5)


def _kdeco_tread(d, x0, y0, x1, y1):
    for xx in range(int(x0 + 8), int(x1 - 4), 18):
        d.line([xx, y1 - 20, xx + 8, y1 - 4], fill=INK, width=4)


def p_kicks_canvas(f): return _kick(f, (210, 180, 140, 255), WHITE, _kdeco_laces)
def p_kicks_workboot(f): return _kick(f, (110, 72, 40, 255), (50, 34, 22, 255), _kdeco_tread)
def p_kicks_neon(f): return _kick(f, (255, 79, 152, 255), (46, 196, 182, 255), _kdeco_laces)
def p_kicks_gold(f): return _kick(f, (36, 34, 40, 255), (255, 209, 102, 255), _kdeco_laces)


# ---------------- CHAINS (torso overlays) ----------------

def p_chain_dogtags(fighter):
    img = blank(); d = ImageDraw.Draw(img)
    # ball chain arc
    for i in range(25):
        t = i / 24
        x = 66 + t * 124; y = 44 + math.sin(t * math.pi) * 44
        d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=(200, 204, 214, 255), outline=INK, width=2)
    # two tags
    for tx, ty in ((104, 104), (140, 112)):
        d.rounded_rectangle([tx - 16, ty - 22, tx + 16, ty + 22], radius=8,
                            fill=(214, 218, 228, 255), outline=INK, width=5)
        d.ellipse([tx - 4, ty - 18, tx + 4, ty - 10], outline=INK, width=3)
        for ly in (ty - 4, ty + 4, ty + 12):
            d.line([tx - 10, ly, tx + 10, ly], fill=(120, 126, 138, 255), width=3)
    return img


def p_chain_curb(fighter):
    img = blank(); d = ImageDraw.Draw(img)
    gold = (255, 209, 102, 255); dark = (170, 120, 40, 255)
    for i in range(13):
        t = i / 12
        x = 60 + t * 136; y = 46 + math.sin(t * math.pi) * 52
        d.ellipse([x - 13, y - 9, x + 13, y + 9], fill=gold, outline=INK, width=5)
        d.ellipse([x - 6, y - 4, x + 6, y + 4], fill=dark)
    return img


def p_medal_saint(fighter):
    img = blank(); d = ImageDraw.Draw(img)
    gold = (255, 209, 102, 255)
    for i in range(17):
        t = i / 16
        x = 78 + t * 100; y = 40 + math.sin(t * math.pi) * 34
        d.line([x - 5, y, x + 5, y], fill=gold, width=5)
    # medallion
    d.ellipse([104, 78, 152, 126], fill=gold, outline=INK, width=6)
    d.ellipse([110, 84, 146, 120], outline=(170, 120, 40, 255), width=3)
    # abstract saint: robed figure
    d.ellipse([120, 90, 136, 104], fill=(120, 90, 60, 255), outline=INK, width=3)
    poly_ink(d, [(116, 104), (140, 104), (134, 118), (122, 118)], (90, 110, 160, 255), width=3)
    return img


# ---------------- WRIST PADS (arm_f overlays) ----------------

def p_wristpad_neon(f):
    img = blank(); d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = LIMB[f]["wrist"]
    d.rounded_rectangle([x0, y0, x1, y1], radius=10, fill=(255, 79, 152, 255), outline=INK, width=6)
    d.line([x0 + 8, (y0 + y1) / 2, x1 - 8, (y0 + y1) / 2], fill=(46, 196, 182, 255), width=8)
    return img


def p_wristpad_leather(f):
    img = blank(); d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = LIMB[f]["wrist"]
    d.rounded_rectangle([x0, y0, x1, y1], radius=8, fill=(110, 72, 40, 255), outline=INK, width=6)
    for yy in (y0 + 10, (y0 + y1) / 2, y1 - 10):
        d.line([x0 + 6, yy, x1 - 6, yy], fill=(70, 44, 24, 255), width=3)
    return img
def write_catalog():
    out = {"schema": 1, "slots": ["headgear", "gloves", "kicks", "accessory", "facepaint", "eyes"],
           "rarities": ["Street", "Rare", "Epic", "Legendary"],
           "cosmetic_only": True,
           "items": {k: {kk: vv for kk, vv in v.items()} for k, v in CATALOG.items()}}
    p = os.path.join(GAME, "assets", "customize", "catalog.json")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w") as fh:
        json.dump(out, fh, indent=2)
    return p


def main():
    made = []
    for item_id, spec in CATALOG.items():
        for fighter in FIGHTERS:
            for canvas in spec["canvases"]:
                if canvas == "torso" and item_id in TORSO_PAINTERS:
                    fn = TORSO_PAINTERS[item_id]
                else:
                    fn = PAINTERS[item_id]
                img = globals()[fn](fighter)
                made.append(save(img, fighter, item_id if canvas == spec["canvases"][0]
                                 else "%s_%s" % (item_id, canvas)))
    cp = write_catalog()
    print("wrote %d PNGs + %s" % (len(made), cp))


if __name__ == "__main__":
    main()
