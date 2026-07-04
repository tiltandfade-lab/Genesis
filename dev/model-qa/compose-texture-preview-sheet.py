#!/usr/bin/env python3
"""dev/model-qa/compose-texture-preview-sheet.py — composes the 12 individual
dev/model-qa/chatgpt-swatch/preview/NN-*.png renders (from capture-texture-preview.mjs) into one
labeled 4-wide x 3-tall sheet: dev/model-qa/chatgpt-swatch/texture-preview-12.png

Each cell already carries its own in-page label baked in by texture-preview.html; this script
just tiles the 12 primary (vc:OFF) shots into a grid with a thin border + a header bar noting
the round-trip test. Run from repo root: python3 dev/model-qa/compose-texture-preview-sheet.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PREVIEW_DIR = os.path.join(HERE, "chatgpt-swatch", "preview")
OUT_PATH = os.path.join(HERE, "chatgpt-swatch", "texture-preview-12.png")

# the 12 primary (vc:OFF) shots in mapping order
CELLS = [
    "01-mon-dragon.png",
    "02-mon-lizard.png",
    "03-mon-snake.png",
    "04-mon-wolf.png",
    "05-mon-troll.png",
    "06-mon-skeleton.png",
    "07-spider.png",
    "08-mon-armor.png",
    "09-npc-cultist.png",
    "10-mon-needleblight.png",
    "11-mon-fireelem.png",
    "12-mon-shadow.png",
]

COLS, ROWS = 4, 3
BORDER = 3
HEADER_H = 40
BG = (10, 9, 8)
BORDER_COL = (36, 29, 21)
HEADER_TEXT_COL = (232, 217, 176)

imgs = [Image.open(os.path.join(PREVIEW_DIR, f)).convert("RGB") for f in CELLS]
cw, ch = imgs[0].size
for im in imgs:
    assert im.size == (cw, ch), f"cell size mismatch: {im.size} vs {(cw, ch)}"

sheet_w = COLS * cw + (COLS + 1) * BORDER
sheet_h = HEADER_H + ROWS * ch + (ROWS + 1) * BORDER

sheet = Image.new("RGB", (sheet_w, sheet_h), BORDER_COL)
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 16)
except Exception:
    font = ImageFont.load_default()
draw.rectangle([0, 0, sheet_w, HEADER_H], fill=BG)
draw.text((12, 11), "CHATGPT MATERIAL-TEXTURE ROUND-TRIP — 12 creatures × engine PS1 pass (dither+snap+1/3-res)",
           fill=HEADER_TEXT_COL, font=font)

for i, im in enumerate(imgs):
    col, row = i % COLS, i // COLS
    x = BORDER + col * (cw + BORDER)
    y = HEADER_H + BORDER + row * (ch + BORDER)
    sheet.paste(im, (x, y))

sheet.save(OUT_PATH)
print(f"wrote {OUT_PATH} ({sheet_w}x{sheet_h})")
