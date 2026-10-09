#!/usr/bin/env python3
"""Concrete Dragon — wave-3 base fighters (Phase 2, Track 2).

Six new paper-doll fighters, 100% procedural ORIGINAL art in the CD
hand-drawn ink style (heavy #26232b outlines, cel shade, chibi-round).
Canon roster per docs/GAME_DESIGN.md:
  brick       — "BRICK, The Wrecking Ball": grappler. Huge, brick-red tank.
  sable       — "SABLE, The Patient Blade": counter-fighter. Lean, dark, precise.
  juno        — "JUNO, The Spark": rushdown. Athletic, bright, spiky.
  mack        — "MACK, The Quartermaster": weapon specialist. Older, scarred, olive.
  iris        — "IRIS, The Skyline": acrobatic. Lean/tall, violet/teal, ponytail.
  hollow_point— "HOLLOW POINT, The Empty Chamber": boss zoner. Imposing, dark coat,
                pale skin, glowing eyes.

Rig-compatible with rook/vex: same 256x256 paper-doll schema, same joint
geometry (neck stubs, shoulder/hip sockets, hand/foot boxes) so pivots.json
and the cosmetics overlay LAND/LIMB tables fit unchanged. Only the SKIN tone
varies per fighter in LAND; geometry landmarks match rook exactly.
"""
import os, json
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    "assets", "art")
C = 256
INK = (38, 35, 43, 255)       # the game's ink line color
HL = (255, 255, 255, 110)     # cel highlight

def canvas():
    return Image.new("RGBA", (C, C), (0, 0, 0, 0))

def rr(d, box, fill, radius=14, w=8, outline=INK):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=w)

def poly(d, pts, fill, w=7):
    d.line(pts + [pts[0]], fill=INK, width=w, joint="curve")
    d.polygon(pts, fill=fill)

def eye_pair(d, skin, cx, cy, style="round", lid=None):
    """Eyes at the shared landmark spots (88/168, 155), r 17x19."""
    for ex in (88, 168):
        d.ellipse([ex - 17, cy - 19, ex + 17, cy + 19],
                  fill=(255, 255, 255, 255), outline=INK, width=6)
        if style == "stern":
            d.ellipse([ex - 11, cy - 8, ex + 13, cy + 14], fill=INK)
        elif style == "calm":  # half-lidded
            d.ellipse([ex - 11, cy - 4, ex + 13, cy + 14], fill=INK)
            d.rectangle([ex - 17, cy - 19, ex + 17, cy - 2], fill=skin)
            d.line([(ex - 17, cy - 2), (ex + 17, cy - 2)], fill=INK, width=6)
        elif style == "glow":  # hollow point's baked glow
            d.ellipse([ex - 13, cy - 15, ex + 13, cy + 15], fill=(150, 255, 240, 255))
            d.ellipse([ex - 6, cy - 7, ex + 6, cy + 7], fill=INK)
        else:
            d.ellipse([ex - 11, cy - 8, ex + 13, cy + 12], fill=INK)
            d.ellipse([ex - 5, cy - 12, ex + 3, cy - 4], fill=(255, 255, 255, 255))
        if lid:
            d.line([(ex - 17, cy - 16), (ex + 17, cy - 16)], fill=INK, width=5)

def brows(d, y, style, cx=128):
    if style == "heavy":
        rr(d, [cx - 62, y - 10, cx - 12, y + 10], (25, 25, 28, 255), radius=6, w=4)
        rr(d, [cx + 12, y - 10, cx + 62, y + 10], (25, 25, 28, 255), radius=6, w=4)
    elif style == "sharp":
        poly(d, [(cx - 60, y + 8), (cx - 10, y - 6), (cx - 12, y + 8), (cx - 58, y + 18)], (25, 25, 28, 255), w=3)
        poly(d, [(cx + 10, y - 6), (cx + 60, y + 8), (cx + 58, y + 18), (cx + 12, y + 8)], (25, 25, 28, 255), w=3)
    elif style == "raised":
        d.line([(cx - 58, y), (cx - 12, y - 12)], fill=(25, 25, 28, 255), width=9)
        d.line([(cx + 12, y - 12), (cx + 58, y)], fill=(25, 25, 28, 255), width=9)
    else:  # flat
        rr(d, [cx - 58, y - 7, cx - 14, y + 7], (25, 25, 28, 255), radius=5, w=4)
        rr(d, [cx + 14, y - 7, cx + 58, y + 7], (25, 25, 28, 255), radius=5, w=4)

def head_base(d, skin, jaw, cx=128, cy=150, r=95):
    # neck stub (shared geometry)
    rr(d, [100, 196, 156, 244], skin, radius=14)
    if jaw == "square":   # brick: heavy squared jaw
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=skin, outline=INK, width=9)
        rr(d, [cx - 66, cy + 28, cx + 66, cy + 96], skin, radius=20)
    elif jaw == "sharp":   # sable: angular
        poly(d, [(cx - r + 6, cy - 60), (cx + r - 6, cy - 60), (cx + 58, cy + 40),
                 (cx, cy + 96), (cx - 58, cy + 40)], skin)
        d.ellipse([cx - r, cy - r, cx + r, cy + 20], fill=skin)
        d.arc([cx - r, cy - r, cx + r, cy + 20], 0, 180, fill=INK, width=9)
    elif jaw == "long":    # iris / hollow_point: taller face
        d.ellipse([cx - r + 8, cy - r, cx + r - 8, cy + r + 8], fill=skin, outline=INK, width=9)
    else:                  # round
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=skin, outline=INK, width=9)

def torso_base(d, top, top_d, shorts, shorts_d, skin, wide=0, vest=None):
    # neck stub (shared geometry)
    rr(d, [118, 0, 138, 22], skin, radius=8)
    x0, x1 = 48 - wide, 208 + wide
    rr(d, [x0, 16, x1, 190], top, radius=26)
    # cel shade
    d.rounded_rectangle([x0 + 10, 120, x1 - 10, 182], radius=16, fill=top_d)
    # collar
    d.arc([108, 8, 148, 44], 0, 180, fill=INK, width=7)
    if vest:  # mack's military vest straps
        d.rectangle([x0 + 18, 60, x0 + 52, 180], fill=vest, outline=INK, width=6)
        d.rectangle([x1 - 52, 60, x1 - 18, 180], fill=vest, outline=INK, width=6)
        for yy in (100, 140):
            d.line([(x0 + 18, yy), (x0 + 52, yy)], fill=INK, width=5)
            d.line([(x1 - 52, yy), (x1 - 18, yy)], fill=INK, width=5)
    # arm sockets (shared geometry)
    for sx in (x0 - 8, x1 - 18):
        d.ellipse([sx, 92, sx + 26, 118], fill=top, outline=INK, width=7)
    # shorts
    rr(d, [x0, 190, x1, 250], shorts, radius=18)
    d.line([(x0 + 8, 216), (x1 - 8, 216)], fill=shorts_d, width=6)
    d.line([(128, 190), (128, 250)], fill=INK, width=6)

def arm_u(d, skin, sleeve=None, thick=0):
    x0, x1 = 108 - thick, 148 + thick
    rr(d, [x0, 10, x1, 246], skin, radius=20)
    if sleeve:
        rr(d, [x0 - 4, 10, x1 + 4, 90], sleeve, radius=16)

def arm_f(d, skin, cuff, hand_fn, thick=0):
    x0, x1 = 104 - thick, 152 + thick
    rr(d, [x0, 10, x1, 150], skin, radius=20)
    rr(d, [x0 - 6, 96, x1 + 6, 150], cuff, radius=12)
    hand_fn(d, skin)

def leg_t(d, skin, pants=None, thick=0):
    x0, x1 = 100 - thick, 156 + thick
    rr(d, [x0, 8, x1, 248], skin, radius=22)
    if pants:
        rr(d, [x0 - 4, 8, x1 + 4, 200], pants, radius=18)

def leg_s(d, skin, foot_fn, thick=0):
    x0, x1 = 104 - thick, 152 + thick
    rr(d, [x0, 10, x1, 150], skin, radius=20)
    foot_fn(d, skin)

# ---- hand painters (fit inside LIMB hand box (60,148)-(200,248)) ----
def fist_bare(d, skin):  # brick: huge bare knuckles
    d.ellipse([52, 150, 204, 246], fill=skin, outline=INK, width=9)
    for kx in (84, 116, 148):
        d.arc([kx - 14, 158, kx + 14, 196], 180, 360, fill=INK, width=6)
    d.ellipse([52, 190, 110, 240], fill=skin, outline=INK, width=7)
def fist_tape(d, skin):  # sable: slim taped fists
    tape = (235, 230, 215, 255)
    d.ellipse([72, 158, 184, 242], fill=skin, outline=INK, width=9)
    for yy in (180, 200, 220):
        d.line([(72, yy), (184, yy)], fill=tape, width=10)
    d.line([(72, 180), (184, 180)], fill=INK, width=4)
    d.line([(72, 220), (184, 220)], fill=INK, width=4)
def glove_mma(d, skin):  # juno: open-finger MMA gloves
    d.ellipse([64, 156, 192, 244], fill=(200, 60, 40, 255), outline=INK, width=9)
    for fx in (96, 120, 144):
        d.rounded_rectangle([fx - 11, 150, fx + 11, 190], radius=8, fill=skin, outline=INK, width=6)
    d.ellipse([120, 200, 170, 236], fill=(200, 60, 40, 255), outline=INK, width=7)
def fist_wrap(d, skin):  # mack: worn wraps
    wrap = (210, 200, 180, 255)
    d.ellipse([66, 156, 190, 244], fill=skin, outline=INK, width=9)
    d.line([(80, 170), (176, 170)], fill=wrap, width=12)
    d.line([(70, 205), (186, 205)], fill=wrap, width=12)
    d.line([(80, 170), (176, 170)], fill=INK, width=3)
def fist_slim(d, skin):  # iris: light quick fists
    d.ellipse([74, 160, 182, 240], fill=skin, outline=INK, width=9)
    d.arc([100, 168, 156, 206], 180, 360, fill=INK, width=6)
def fist_heavy(d, skin):  # hollow_point: big dark gauntlet-fists
    dark = (45, 42, 55, 255)
    d.ellipse([58, 152, 198, 246], fill=dark, outline=INK, width=9)
    d.line([(70, 185), (186, 185)], fill=(122, 77, 255, 255), width=7)
    d.line([(70, 210), (186, 210)], fill=(122, 77, 255, 255), width=7)

# ---- foot painters (fit inside LIMB foot box (58,148)-(198,238)) ----
def boot_work(d, skin):
    dark = (70, 48, 30, 255)
    rr(d, [62, 150, 194, 232], dark, radius=20)
    d.rectangle([62, 210, 194, 232], fill=(40, 28, 18, 255), outline=INK, width=6)
    for yy in (172, 192):
        d.line([(76, yy), (180, yy)], fill=(40, 28, 18, 255), width=5)
def boot_combat(d, skin):
    dark = (52, 56, 50, 255)
    rr(d, [62, 148, 194, 230], dark, radius=20)
    d.rectangle([62, 208, 194, 230], fill=(30, 32, 30, 255), outline=INK, width=6)
    d.line([(110, 148), (110, 208)], fill=INK, width=6)
    for yy in (166, 186, 206):
        d.line([(110, yy), (150, yy)], fill=(150, 150, 140, 255), width=4)
def shoe_runner(d, skin):
    rr(d, [62, 160, 194, 228], (240, 120, 40, 255), radius=22)
    d.rectangle([62, 206, 194, 228], fill=(245, 242, 235, 255), outline=INK, width=6)
    d.line([(80, 170), (80, 200)], fill=(245, 242, 235, 255), width=8)
    d.line([(100, 170), (100, 200)], fill=(245, 242, 235, 255), width=8)
def shoe_light(d, skin):
    rr(d, [66, 164, 190, 226], (46, 196, 182, 255), radius=22)
    d.rectangle([66, 206, 190, 226], fill=(245, 242, 235, 255), outline=INK, width=6)
def boot_heavy(d, skin):
    dark = (35, 33, 45, 255)
    rr(d, [58, 146, 198, 232], dark, radius=20)
    d.rectangle([58, 210, 198, 232], fill=(20, 18, 26, 255), outline=INK, width=6)
    d.line([(70, 175), (186, 175)], fill=(122, 77, 255, 255), width=6)
def foot_tape(d, skin):
    tape = (235, 230, 215, 255)
    rr(d, [66, 160, 190, 228], skin, radius=20)
    d.line([(66, 190), (190, 190)], fill=tape, width=12)
    d.rectangle([66, 208, 190, 228], fill=tape, outline=INK, width=6)

# ================================================================== HEADS
def brick_head():
    img = canvas(); d = ImageDraw.Draw(img)
    skin = (225, 170, 120, 255)
    head_base(d, skin, "square", r=100)
    # buzz cut
    d.pieslice([28, 40, 228, 150], start=180, end=360, fill=(60, 45, 35, 255))
    d.arc([28, 40, 228, 150], 180, 360, fill=INK, width=9)
    brows(d, 122, "heavy")
    eye_pair(d, skin, 128, 158, "stern")
    # flat mouth + chin crease
    d.line([(98, 212), (158, 212)], fill=INK, width=8)
    d.line([(108, 226), (148, 226)], fill=(180, 120, 80, 255), width=5)
    return img

def sable_head():
    img = canvas(); d = ImageDraw.Draw(img)
    skin = (140, 95, 65, 255)
    head_base(d, skin, "sharp", r=92)
    # shaved head sheen + goatee
    d.arc([36, 52, 220, 200], 200, 340, fill=HL, width=14)
    poly(d, [(108, 218), (148, 218), (128, 244)], (30, 28, 32, 255), w=5)
    brows(d, 120, "sharp")
    eye_pair(d, skin, 128, 155, "calm")
    d.line([(104, 206), (152, 206)], fill=INK, width=7)
    return img

def juno_head():
    img = canvas(); d = ImageDraw.Draw(img)
    skin = (240, 200, 150, 255)
    head_base(d, skin, "round", r=94)
    # spiky hair
    poly(d, [(34, 120), (60, 30), (95, 70), (128, 18), (161, 70), (196, 30), (222, 120),
             (200, 100), (170, 105), (128, 88), (86, 105), (56, 100)], (255, 170, 40, 255))
    # headband
    d.rectangle([36, 108, 220, 132], fill=(200, 40, 55, 255), outline=INK, width=7)
    brows(d, 124, "raised")
    eye_pair(d, skin, 128, 158, "round")
    # wide grin
    d.arc([96, 186, 160, 230], 15, 165, fill=INK, width=8)
    return img

def mack_head():
    img = canvas(); d = ImageDraw.Draw(img)
    skin = (205, 150, 110, 255)
    head_base(d, skin, "square", r=96)
    # gray buzz + stubble beard
    d.pieslice([32, 46, 224, 152], start=180, end=360, fill=(130, 125, 120, 255))
    d.arc([32, 46, 224, 152], 180, 360, fill=INK, width=9)
    for xx in range(60, 200, 10):
        d.line([(xx, 205), (xx, 235)], fill=(120, 90, 70, 255), width=4)
    # scar over left eye
    d.line([(70, 132), (96, 172)], fill=(170, 90, 80, 255), width=7)
    d.line([(70, 132), (96, 172)], fill=INK, width=2)
    brows(d, 122, "flat")
    eye_pair(d, skin, 128, 157, "stern")
    d.line([(100, 210), (156, 208)], fill=INK, width=7)
    return img

def iris_head():
    img = canvas(); d = ImageDraw.Draw(img)
    skin = (230, 180, 140, 255)
    head_base(d, skin, "long", r=92)
    # high ponytail, violet
    d.ellipse([150, 8, 196, 120], fill=(122, 77, 255, 255), outline=INK, width=8)
    d.arc([40, 56, 216, 190], 180, 360, fill=(122, 77, 255, 255), width=0)
    d.pieslice([40, 56, 216, 170], start=180, end=360, fill=(122, 77, 255, 255))
    d.arc([40, 56, 216, 170], 180, 360, fill=INK, width=9)
    d.rectangle([150, 60, 178, 78], fill=(46, 196, 182, 255), outline=INK, width=6)
    brows(d, 122, "raised")
    eye_pair(d, skin, 128, 156, "round")
    # confident smirk
    d.arc([104, 192, 158, 226], 200, 340, fill=INK, width=8)
    return img

def hollow_point_head():
    img = canvas(); d = ImageDraw.Draw(img)
    skin = (200, 205, 195, 255)
    head_base(d, skin, "long", r=98)
    # bald + chamber tattoo markings
    d.arc([36, 50, 220, 190], 200, 340, fill=HL, width=12)
    for a in (0.6, 1.2):
        d.arc([88, 84, 168, 140], a * 57, (a + 0.5) * 57, fill=(122, 77, 255, 255), width=6)
    brows(d, 120, "sharp")
    eye_pair(d, skin, 128, 157, "glow")
    # stern flat mouth
    d.line([(102, 214), (154, 214)], fill=INK, width=9)
    return img

# ================================================================== BUILD
SKINS = {
    "brick":        (225, 170, 120, 255),
    "sable":        (140, 95, 65, 255),
    "juno":         (240, 200, 150, 255),
    "mack":         (205, 150, 110, 255),
    "iris":         (230, 180, 140, 255),
    "hollow_point": (200, 205, 195, 255),
}

def build(fighter):
    skin = SKINS[fighter]
    parts = {}
    if fighter == "brick":
        parts["head.png"] = brick_head()
        img = canvas(); d = ImageDraw.Draw(img)
        torso_base(d, (170, 60, 50, 255), (130, 40, 35, 255), (60, 55, 70, 255),
                   (45, 40, 52, 255), skin, wide=26)
        d.line([(70, 60), (186, 60)], fill=(245, 242, 235, 255), width=8)  # tank stripe
        parts["torso.png"] = img
        img = canvas(); arm_u(ImageDraw.Draw(img), skin, sleeve=(170, 60, 50, 255), thick=14); parts["arm_u.png"] = img
        img = canvas(); arm_f(ImageDraw.Draw(img), skin, (170, 60, 50, 255), fist_bare, thick=14); parts["arm_f.png"] = img
        img = canvas(); leg_t(ImageDraw.Draw(img), skin, pants=(60, 55, 70, 255), thick=12); parts["leg_t.png"] = img
        img = canvas(); leg_s(ImageDraw.Draw(img), skin, boot_work, thick=12); parts["leg_s.png"] = img
    elif fighter == "sable":
        parts["head.png"] = sable_head()
        img = canvas(); d = ImageDraw.Draw(img)
        torso_base(d, (90, 85, 70, 255), (70, 66, 54, 255), (45, 45, 50, 255),
                   (35, 35, 40, 255), skin, wide=-6)
        d.line([(128, 40), (128, 120)], fill=INK, width=5)  # gi seam
        parts["torso.png"] = img
        img = canvas(); arm_u(ImageDraw.Draw(img), skin, sleeve=(90, 85, 70, 255), thick=-4); parts["arm_u.png"] = img
        img = canvas(); arm_f(ImageDraw.Draw(img), skin, (90, 85, 70, 255), fist_tape, thick=-4); parts["arm_f.png"] = img
        img = canvas(); leg_t(ImageDraw.Draw(img), skin, pants=(45, 45, 50, 255), thick=-4); parts["leg_t.png"] = img
        img = canvas(); leg_s(ImageDraw.Draw(img), skin, foot_tape, thick=-4); parts["leg_s.png"] = img
    elif fighter == "juno":
        parts["head.png"] = juno_head()
        img = canvas(); d = ImageDraw.Draw(img)
        torso_base(d, (245, 140, 40, 255), (210, 110, 30, 255), (50, 50, 60, 255),
                   (40, 40, 48, 255), skin)
        d.line([(80, 100), (176, 100)], fill=(200, 40, 55, 255), width=10)  # chest bolt stripe
        parts["torso.png"] = img
        img = canvas(); arm_u(ImageDraw.Draw(img), skin, sleeve=(245, 140, 40, 255)); parts["arm_u.png"] = img
        img = canvas(); arm_f(ImageDraw.Draw(img), skin, (200, 40, 55, 255), glove_mma); parts["arm_f.png"] = img
        img = canvas(); leg_t(ImageDraw.Draw(img), skin, pants=(50, 50, 60, 255)); parts["leg_t.png"] = img
        img = canvas(); leg_s(ImageDraw.Draw(img), skin, shoe_runner); parts["leg_s.png"] = img
    elif fighter == "mack":
        parts["head.png"] = mack_head()
        img = canvas(); d = ImageDraw.Draw(img)
        torso_base(d, (110, 115, 85, 255), (88, 92, 68, 255), (55, 58, 50, 255),
                   (44, 46, 40, 255), skin, vest=(75, 78, 60, 255))
        parts["torso.png"] = img
        img = canvas(); arm_u(ImageDraw.Draw(img), skin, sleeve=(110, 115, 85, 255)); parts["arm_u.png"] = img
        img = canvas(); arm_f(ImageDraw.Draw(img), skin, (75, 78, 60, 255), fist_wrap); parts["arm_f.png"] = img
        img = canvas(); leg_t(ImageDraw.Draw(img), skin, pants=(55, 58, 50, 255)); parts["leg_t.png"] = img
        img = canvas(); leg_s(ImageDraw.Draw(img), skin, boot_combat); parts["leg_s.png"] = img
    elif fighter == "iris":
        parts["head.png"] = iris_head()
        img = canvas(); d = ImageDraw.Draw(img)
        torso_base(d, (122, 77, 255, 255), (95, 58, 210, 255), (40, 45, 55, 255),
                   (32, 36, 44, 255), skin, wide=-10)
        d.line([(96, 70), (160, 70)], fill=(46, 196, 182, 255), width=8)  # teal chest stripe
        parts["torso.png"] = img
        img = canvas(); arm_u(ImageDraw.Draw(img), skin, sleeve=(122, 77, 255, 255), thick=-6); parts["arm_u.png"] = img
        img = canvas(); arm_f(ImageDraw.Draw(img), skin, (46, 196, 182, 255), fist_slim, thick=-6); parts["arm_f.png"] = img
        img = canvas(); leg_t(ImageDraw.Draw(img), skin, pants=(40, 45, 55, 255), thick=-6); parts["leg_t.png"] = img
        img = canvas(); leg_s(ImageDraw.Draw(img), skin, shoe_light, thick=-6); parts["leg_s.png"] = img
    elif fighter == "hollow_point":
        parts["head.png"] = hollow_point_head()
        img = canvas(); d = ImageDraw.Draw(img)
        torso_base(d, (45, 42, 55, 255), (32, 30, 40, 255), (30, 28, 36, 255),
                   (22, 20, 28, 255), skin, wide=14)
        # long coat panels + purple trim
        d.line([(70, 60), (70, 190)], fill=(122, 77, 255, 255), width=6)
        d.line([(186, 60), (186, 190)], fill=(122, 77, 255, 255), width=6)
        d.line([(100, 130), (156, 130)], fill=INK, width=5)
        parts["torso.png"] = img
        img = canvas(); arm_u(ImageDraw.Draw(img), skin, sleeve=(45, 42, 55, 255), thick=6); parts["arm_u.png"] = img
        img = canvas(); arm_f(ImageDraw.Draw(img), skin, (45, 42, 55, 255), fist_heavy, thick=6); parts["arm_f.png"] = img
        img = canvas(); leg_t(ImageDraw.Draw(img), skin, pants=(30, 28, 36, 255), thick=6); parts["leg_t.png"] = img
        img = canvas(); leg_s(ImageDraw.Draw(img), skin, boot_heavy, thick=6); parts["leg_s.png"] = img
    return parts

BASE_PIVOTS = {
    "head.png":  [0.50, 0.82],
    "torso.png": [0.50, 0.05],
    "arm_u.png": [0.50, 0.04],
    "arm_f.png": [0.50, 0.05],
    "leg_t.png": [0.50, 0.03],
    "leg_s.png": [0.50, 0.04],
}

if __name__ == "__main__":
    for name in SKINS:
        parts = build(name)
        fdir = os.path.join(ROOT, name)
        os.makedirs(fdir, exist_ok=True)
        for fname, img in parts.items():
            img.save(os.path.join(fdir, fname))
            print("wrote", name, fname)
    piv_path = os.path.join(ROOT, "pivots.json")
    pivots = json.load(open(piv_path)) if os.path.exists(piv_path) else {}
    for name in SKINS:
        pivots[name] = dict(BASE_PIVOTS)
    json.dump(pivots, open(piv_path, "w"), indent=2)
    print("merged pivots:", sorted(pivots.keys()))
