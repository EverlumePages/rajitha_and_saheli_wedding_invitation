"""Make a transparent cut-out of an image that sits on a flat white background.

Flood-fills the white that touches the image border (plus large enclosed
pure-white gaps), softens the edge, crops to the subject and saves a PNG.

Re-run after replacing a source image:
  python scripts/make-couple-cutout.py                      (couple.png -> couple-cutout.png)
  python scripts/make-couple-cutout.py "single flower.jpeg" single-flower-cutout.png
Paths are inside the assests folder.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assests" / (sys.argv[1] if len(sys.argv) > 1 else "couple.png")
OUT = ROOT / "assests" / (sys.argv[2] if len(sys.argv) > 2 else "couple-cutout.png")

img = Image.open(SRC).convert("RGB")
w, h = img.size
r, g, b = img.split()

# Background-like pixels: bright and nearly colourless.
lo = ImageChops.darker(ImageChops.darker(r, g), b)
hi = ImageChops.lighter(ImageChops.lighter(r, g), b)
bright = lo.point(lambda v: 255 if v >= 236 else 0)
neutral = ImageChops.subtract(hi, lo).point(lambda v: 255 if v <= 16 else 0)
bg = ImageChops.multiply(bright, neutral)  # 255 where background-like

# Flood from every border pixel that is background-like; filled area becomes 128.
fill = bg.copy()
px = fill.load()
seeds = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + \
        [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
for s in seeds:
    if px[s] == 255:
        ImageDraw.floodfill(fill, s, 128, thresh=0)

# Large enclosed pure-white gaps (e.g. between arm and body) are background too.
pure = lo.point(lambda v: 255 if v >= 248 else 0)
pure = ImageChops.multiply(pure, neutral)
gap = pure.copy()
gpx = gap.load()
fpx = fill.load()
for y in range(0, h, 4):
    for x in range(0, w, 4):
        if gpx[x, y] == 255 and fpx[x, y] != 128:
            probe = gap.copy()
            ImageDraw.floodfill(probe, (x, y), 64, thresh=0)
            region = probe.point(lambda v: 255 if v == 64 else 0)
            area = region.histogram()[255]
            if area > 1500:
                fill.paste(128, mask=region)
            gap.paste(0, mask=region)  # never test this region again

background = fill.point(lambda v: 255 if v == 128 else 0)
# Grow the cut slightly into the anti-aliased fringe, then feather.
background = background.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
alpha = ImageChops.invert(background)

out = img.convert("RGBA")
out.putalpha(alpha)
bbox = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
pad = 6
bbox = (max(bbox[0] - pad, 0), max(bbox[1] - pad, 0), min(bbox[2] + pad, w), min(bbox[3] + pad, h))
out = out.crop(bbox)
out.save(OUT, optimize=True)
print(f"wrote {OUT.relative_to(ROOT)} {out.size[0]}x{out.size[1]} (crop {bbox})")
