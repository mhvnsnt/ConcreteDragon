#!/usr/bin/env python3
"""Procedural stage + UI icons for Concrete Dragon M1. 100% original PIL-drawn art."""
import os, math, random
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "art")
os.makedirs(ROOT, exist_ok=True)
DARK = (34, 34, 34, 255)
FONTB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
random.seed(7)

# ---------------------------------------------------------------- stage
W, H = 1280, 720
GROUND_Y = 600
img = Image.new("RGB", (W, H))
d = ImageDraw.Draw(img)

# sky gradient (bright blue)
for y in range(GROUND_Y):
    t = y / GROUND_Y
    r = int(90 + (200 - 90) * t); g = int(180 + (232 - 180) * t); b = int(255 + (255 - 255) * t)
    d.line([(0, y), (W, y)], fill=(r, g, b))

# cute sun with rays (top-left)
sx, sy, sr = 130, 110, 55
for i in range(12):
    a = math.radians(i * 30)
    d.line([(sx + math.cos(a) * (sr + 12), sy + math.sin(a) * (sr + 12)),
            (sx + math.cos(a) * (sr + 34), sy + math.sin(a) * (sr + 34))],
           fill=(255, 214, 64), width=9)
d.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(255, 226, 90), outline=(240, 180, 40), width=6)
d.ellipse([sx - 18, sy - 8, sx - 4, sy + 8], fill=(34, 34, 34))   # sleepy-happy face
d.ellipse([sx + 4, sy - 8, sx + 18, sy + 8], fill=(34, 34, 34))
d.arc([sx - 20, sy - 2, sx + 20, sy + 30], start=20, end=160, fill=(34, 34, 34), width=5)

# clouds
def cloud(x, y, s):
    for ox, oy, w, h in [(-70, 10, 90, 60), (-30, -15, 110, 70), (25, 5, 95, 62), (70, 15, 70, 50)]:
        d.ellipse([x + ox * s, y + oy * s, x + (ox + w) * s, y + (oy + h) * s],
                  fill=(255, 255, 255, 255))
cloud(480, 120, 1.0); cloud(900, 80, 0.8); cloud(1150, 180, 0.65); cloud(250, 200, 0.6)

# distant skyline (peeks above the wall)
for i, (bx, bw, bh) in enumerate([(0, 90, 180), (95, 70, 230), (170, 110, 150),
                                  (700, 80, 200), (785, 120, 160), (910, 70, 210),
                                  (985, 100, 140), (1090, 90, 190), (1185, 95, 165)]):
    top = 345 - bh
    col = (150, 170, 200) if i % 2 == 0 else (170, 185, 210)
    d.rectangle([bx, top, bx + bw, 345], fill=col, outline=(110, 130, 160), width=3)
    for wy in range(top + 18, 335, 26):           # windows
        for wx in range(bx + 12, bx + bw - 10, 24):
            d.rectangle([wx, wy, wx + 12, wy + 14], fill=(235, 244, 255))

# brick building wall (main backdrop), y=330..GROUND_Y
brick = (186, 92, 66)
d.rectangle([0, 330, W, GROUND_Y], fill=brick)
mortar = (150, 70, 52)
bw_, bh_ = 64, 30
for row in range(330, GROUND_Y, bh_):
    d.line([(0, row), (W, row)], fill=mortar, width=3)
    off = (bw_ // 2) if ((row - 330) // bh_) % 2 else 0
    for colx in range(-bw_, W + bw_, bw_):
        d.line([(colx + off, row), (colx + off, row + bh_)], fill=mortar, width=3)
# wall shading at edges
d.rectangle([0, 330, 40, GROUND_Y], fill=(0, 0, 0, 40))
d.rectangle([W - 40, 330, W, GROUND_Y], fill=(0, 0, 0, 40))

# windows on the wall (cute, original)
for wx in (120, 1160):
    d.rounded_rectangle([wx - 60, 390, wx + 60, 550], radius=14, fill=(120, 160, 200),
                        outline=DARK, width=8)
    d.line([(wx, 390), (wx, 550)], fill=DARK, width=5)
    d.line([(wx - 60, 470), (wx + 60, 470)], fill=DARK, width=5)
    d.rectangle([wx - 80, 550, wx + 80, 570], fill=(90, 60, 45), outline=DARK, width=6)  # sill

# door (left of graffiti)
d.rounded_rectangle([240, 450, 400, GROUND_Y], radius=10, fill=(90, 60, 45), outline=DARK, width=8)
d.ellipse([370, 520, 382, 532], fill=(255, 214, 64), outline=DARK, width=3)

# graffiti "CONCRETE DRAGON" - original lettering drawn as stroked text on a tilted layer
fb1 = ImageFont.truetype(FONTB, 88)
fb2 = ImageFont.truetype(FONTB, 88)
def graffiti_layer(text, font, fill, angle):
    bb = d.textbbox((0, 0), text, font=font, stroke_width=10)
    tw, th = bb[2] - bb[0] + 30, bb[3] - bb[1] + 30
    lay = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lay)
    ld.text((15 - bb[0], 15 - bb[1]), text, font=font, fill=fill,
            stroke_width=10, stroke_fill=DARK)
    return lay.rotate(angle, expand=True, resample=Image.BICUBIC)

g1 = graffiti_layer("CONCRETE", fb1, (255, 214, 64, 255), -4)
g2 = graffiti_layer("DRAGON", fb2, (255, 105, 180, 255), 3)
img.paste(g1, ((W - g1.width) // 2, 352), g1)
img.paste(g2, ((W - g2.width) // 2, 352 + g1.height - 24), g2)

# string lights overhead: two sagging wires with colorful bulbs
def wire(x0, y0, x1, y1, sag):
    pts = []
    for i in range(41):
        t = i / 40
        x = x0 + (x1 - x0) * t
        y = y0 + (y1 - y0) * t + math.sin(math.pi * t) * sag
        pts.append((x, y))
    return pts
bulb_cols = [(255, 90, 90), (255, 214, 64), (46, 196, 182), (255, 150, 90), (180, 130, 255)]
for (x0, y0, x1, y1, sag) in [(-20, 40, 660, 0, 90), (620, 0, 1300, 40, 90)]:
    pts = wire(x0, y0, x1, y1, sag)
    d.line(pts, fill=(40, 40, 40), width=4)
    for i in range(4, 40, 4):
        x, y = pts[i]
        col = bulb_cols[(i // 4) % len(bulb_cols)]
        d.line([(x, y), (x, y + 10)], fill=(40, 40, 40), width=3)
        d.ellipse([x - 9, y + 6, x + 9, y + 26], fill=col, outline=DARK, width=3)
        d.ellipse([x - 3, y + 9, x + 3, y + 15], fill=(255, 255, 255, 200))

# sidewalk (fight line at y=600), curb, asphalt road
d.rectangle([0, GROUND_Y, W, 662], fill=(205, 205, 205))
for sx_ in range(0, W, 160):
    d.line([(sx_, GROUND_Y), (sx_, 662)], fill=(160, 160, 160), width=4)
d.rectangle([0, 662, W, 674], fill=(120, 120, 120))          # curb
d.rectangle([0, 674, W, H], fill=(61, 61, 61))               # asphalt
for cx_ in range(40, W, 120):                                # dashed center line
    d.rectangle([cx_, 694, cx_ + 60, 704], fill=(240, 200, 60))

# cute props: fire hydrant + trash can (original simple shapes)
def hydrant(x, y):
    d.rounded_rectangle([x - 26, y - 90, x + 26, y], radius=14, fill=(230, 80, 80), outline=DARK, width=6)
    d.ellipse([x - 34, y - 70, x - 14, y - 44], fill=(230, 80, 80), outline=DARK, width=5)
    d.ellipse([x + 14, y - 70, x + 34, y - 44], fill=(230, 80, 80), outline=DARK, width=5)
    d.ellipse([x - 16, y - 112, x + 16, y - 84], fill=(200, 60, 60), outline=DARK, width=5)
hydrant(1050, GROUND_Y)
def trashcan(x, y):
    d.polygon([(x - 30, y - 80), (x + 30, y - 80), (x + 22, y), (x - 22, y)],
              fill=(110, 130, 150), outline=DARK, width=6)
    d.rectangle([x - 36, y - 96, x + 36, y - 80], fill=(90, 110, 130), outline=DARK, width=6)
    for lx in (-12, 0, 12):
        d.line([(x + lx, y - 70), (x + lx, y - 12)], fill=DARK, width=4)
trashcan(180, GROUND_Y)

img.save(os.path.join(ROOT, "stage.png"))
print("wrote stage.png")

# ---------------------------------------------------------------- UI icons
def coin():
    s = 96
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0)); dd = ImageDraw.Draw(im)
    dd.ellipse([4, 4, s - 4, s - 4], fill=(255, 210, 63, 255), outline=DARK, width=7)
    dd.ellipse([16, 16, s - 16, s - 16], fill=None, outline=(201, 143, 27, 255), width=5)
    dd.ellipse([20, 20, 48, 48], fill=(255, 240, 180, 160))  # shine
    f = ImageFont.truetype(FONTB, 52)
    bb = dd.textbbox((0, 0), "$", font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    dd.text(((s - tw) / 2 - bb[0], (s - th) / 2 - bb[1] - 2), "$", font=f,
            fill=(176, 120, 20, 255), stroke_width=3, stroke_fill=DARK)
    return im

def star():
    s = 96
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0)); dd = ImageDraw.Draw(im)
    cx = cy = s / 2; R, r = 42, 17
    pts = []
    for i in range(10):
        ang = math.radians(-90 + i * 36)
        rad = R if i % 2 == 0 else r
        pts.append((cx + math.cos(ang) * rad, cy + math.sin(ang) * rad))
    dd.line(pts + [pts[0]], fill=DARK, width=9, joint="curve")
    dd.polygon(pts, fill=(255, 210, 63, 255))
    dd.polygon([(cx - 14, cy - 26), (cx - 4, cy - 22), (cx - 10, cy - 8)],
               fill=(255, 244, 200, 220))  # sparkle
    return im

coin().save(os.path.join(ROOT, "coin.png"))
star().save(os.path.join(ROOT, "star.png"))
print("wrote coin.png, star.png")
