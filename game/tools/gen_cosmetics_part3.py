"""Part 3 — face paint, eyes, gloves, kicks, chains, wrist pads + catalog + main."""


# ---------------- FACE PAINT (transparent overlays, paint marks only) ----------------

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
