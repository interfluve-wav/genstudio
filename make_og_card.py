#!/usr/bin/env python3
# GenStudio OG share card (1200x630). Self-contained, no deps beyond PIL.
import math, random
from PIL import Image, ImageDraw

W, H = 1200, 630
img = Image.new("RGB", (W, H), (14, 14, 18))
d = ImageDraw.Draw(img)

# background subtle radial glow
for r in range(420, 0, -20):
    a = int(10 * (1 - r / 420))
    d.ellipse([W//2 - r, H//2 - r, W//2 + r, H//2 + r],
               fill=(20 + a, 30 + a, 50 + a))

random.seed(7)
cx, cy = W // 2, H // 2
pal = [(91,160,255),(170,120,255),(80,220,200),(255,140,200),(255,200,90)]
sym = 16
for layer in range(6):
    rr = 70 + layer * 48
    n = sym * (1 + layer // 2)
    col = pal[layer % len(pal)]
    for k in range(n):
        ang = 2 * math.pi * k / n + layer * 0.2
        x = cx + math.cos(ang) * rr
        y = cy + math.sin(ang) * rr
        s = 10 + layer * 2
        d.polygon([(x, y - s), (x + s*0.6, y + s*0.5), (x - s*0.6, y + s*0.5)],
                   fill=col)

# title text (built-in default font, sized)
try:
    from PIL import ImageFont
    fbig = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttc", 132)
    fsub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttc", 40)
    ffeat = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttc", 30)
except Exception as e:
    fbig = ImageFont.load_default()
    fsub = ImageFont.load_default()
    ffeat = ImageFont.load_default()

# shift mandala left-of-center so text on the right reads clean
cx, cy = int(W * 0.36), H // 2
# (re-draw glow + glyphs centered on cx,cy)
img = Image.new("RGB", (W, H), (14, 14, 18))
d = ImageDraw.Draw(img)
for r in range(420, 0, -20):
    a = int(10 * (1 - r / 420))
    d.ellipse([cx - r, cy - r, cx + r, cy + r],
               fill=(20 + a, 30 + a, 50 + a))
random.seed(7)
sym = 16
for layer in range(6):
    rr = 60 + layer * 42
    n = sym * (1 + layer // 2)
    col = pal[layer % len(pal)]
    for k in range(n):
        ang = 2 * math.pi * k / n + layer * 0.2
        x = cx + math.cos(ang) * rr
        y = cy + math.sin(ang) * rr
        s = 9 + layer * 2
        d.polygon([(x, y - s), (x + s*0.6, y + s*0.5), (x - s*0.6, y + s*0.5)],
                   fill=col)

# text block on the right half
tx = int(W * 0.60)
d.text((tx, 120), "GenStudio", fill=(236, 236, 240), font=fbig)
d.text((tx + 4, 270), "100% original generative art — you own it.", fill=(155, 209, 255), font=fsub)
d.text((tx + 4, H - 90),
         "glyph fields · image masking · motion presets · transparent export",
         fill=(180, 180, 190), font=ffeat)
img.save("/Users/suhaas/GenStudio/og-card.png")
print("wrote og-card.png", img.size)
