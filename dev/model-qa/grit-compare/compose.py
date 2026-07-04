#!/usr/bin/env python3
"""dev/model-qa/grit-compare/compose.py — composes the director's-gate PSX resolution
comparison sheet: three labeled full-sheet panels (res=0.3333/0.4/0.5) side by side, plus a
2x-zoom crop row of one figure (FIGHTER, cell A1 / index 0) so the texel difference reads.
Comparison-only tooling (chore/grit-compare) — does not touch the engine or the QA gate.
"""
from PIL import Image, ImageDraw, ImageFont
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PANELS = [
    ("0.3333", "1/3  (current engine)"),
    ("0.4",    "1/2.5"),
    ("0.5",    "1/2"),
]
CELL, CH, DSF = 340, 430, 2  # ps1-sheet.html cell CSS size x deviceScaleFactor 2
FIGHTER_BOX = (0, 0, CELL*DSF, CH*DSF)  # index 0 = row0/col0 = FIGHTER

MARGIN = 24
LABEL_H = 44
GAP = 16
ZOOM_LABEL_H = 34

def load_font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()

font_label = load_font(28, bold=True)
font_sub = load_font(16)

imgs = [Image.open(os.path.join(HERE, f"classes-res-{label}.png")).convert("RGB") for label, _ in PANELS]
w, h = imgs[0].size
for im in imgs:
    assert im.size == (w, h), f"panel size mismatch: {im.size} vs {(w,h)}"

n = len(imgs)
panel_row_w = n * w + (n - 1) * GAP
total_w = panel_row_w + MARGIN * 2

# ---- crop the fighter cell (2x zoom = simple nearest-neighbor upscale of the crop) ----
crop_w, crop_h = FIGHTER_BOX[2] - FIGHTER_BOX[0], FIGHTER_BOX[3] - FIGHTER_BOX[1]
zoom_w, zoom_h = crop_w * 2, crop_h * 2
crops = [im.crop(FIGHTER_BOX).resize((zoom_w, zoom_h), Image.NEAREST) for im in imgs]

zoom_row_w = n * zoom_w + (n - 1) * GAP
total_w = max(total_w, zoom_row_w + MARGIN * 2)

top_block_h = LABEL_H + h
zoom_block_h = ZOOM_LABEL_H + zoom_h
total_h = MARGIN + top_block_h + GAP*2 + 40 + zoom_block_h + MARGIN  # +40 for a "FIGHTER 2x CROP" section header

canvas = Image.new("RGB", (total_w, total_h), (10, 9, 8))  # VOID_BG-ish background
draw = ImageDraw.Draw(canvas)

# ---- row 1: three full labeled panels ----
x = MARGIN + (total_w - MARGIN*2 - panel_row_w) // 2
y = MARGIN
for im, (label, sub) in zip(imgs, PANELS):
    draw.text((x + w//2, y), f"res = {label}", font=font_label, fill=(232, 217, 176), anchor="mt")
    draw.text((x + w//2, y + 30), sub, font=font_sub, fill=(150, 138, 116), anchor="mt")
    canvas.paste(im, (x, y + LABEL_H))
    x += w + GAP

# ---- section header for the zoom row ----
sec_y = MARGIN + top_block_h + GAP
draw.line([(MARGIN, sec_y), (total_w - MARGIN, sec_y)], fill=(60, 52, 40), width=1)
draw.text((total_w // 2, sec_y + 8), "FIGHTER — 2x zoom crop (texel-grit read)", font=font_label, fill=(216, 200, 162), anchor="mt")

# ---- row 2: three zoomed fighter crops ----
zy = sec_y + 8 + 40
zx = MARGIN + (total_w - MARGIN*2 - zoom_row_w) // 2
for crop, (label, sub) in zip(crops, PANELS):
    draw.text((zx + zoom_w//2, zy), f"res = {label}", font=font_sub, fill=(200, 188, 156), anchor="mt")
    canvas.paste(crop, (zx, zy + ZOOM_LABEL_H))
    zx += zoom_w + GAP

out_path = os.path.join(HERE, "side-by-side.png")
canvas.save(out_path)
print(f"wrote {out_path} ({canvas.size[0]}x{canvas.size[1]})")
