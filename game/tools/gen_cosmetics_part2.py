"""Part 2 — headgear painters. Appended into gen_cosmetics.py at build time."""
# (kept as a separate file during authoring; concatenated below)


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
