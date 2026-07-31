#!/usr/bin/env python3
"""Build a labeled four-bearing review sheet for the CL-F09 watchtower."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CAPTURE_ROOT = ROOT / "artifacts" / "architecture-clayroom" / "round-03"
OUTPUT = CAPTURE_ROOT / "watchtower-four-bearings-round-03-labeled.png"
SOURCES = [
    (
        "Q0 · PRODUCTION BEARING",
        CAPTURE_ROOT / "arch-af08-watchtower-ruin"
        / "25-arch-af08-watchtower-ruin-04-clean-production.png",
    ),
    *[
        (
            f"Q{turn} · +{turn * 90}°",
            CAPTURE_ROOT / "bearings" / f"tower-q{turn}"
            / f"25-arch-af08-watchtower-ruin-q{turn}-04-clean-production.png",
        )
        for turn in range(1, 4)
    ],
]

TILE_W, IMAGE_H, LABEL_H = 720, 405, 54
sheet = Image.new("RGB", (TILE_W * 2, (IMAGE_H + LABEL_H) * 2), "#17191c")
font_path = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
font = ImageFont.truetype(str(font_path), 24) if font_path.exists() else ImageFont.load_default()

for index, (label, source) in enumerate(SOURCES):
    image = Image.open(source).convert("RGB")
    image.thumbnail((TILE_W, IMAGE_H), Image.Resampling.LANCZOS)
    tile = Image.new("RGB", (TILE_W, IMAGE_H + LABEL_H), "#202328")
    tile.paste(image, ((TILE_W - image.width) // 2, (IMAGE_H - image.height) // 2))
    draw = ImageDraw.Draw(tile)
    draw.rectangle((0, IMAGE_H, TILE_W, IMAGE_H + LABEL_H), fill="#101216")
    draw.text((18, IMAGE_H + 13), label, font=font, fill="#eee7d9")
    sheet.paste(tile, ((index % 2) * TILE_W, (index // 2) * (IMAGE_H + LABEL_H)))

sheet.save(OUTPUT, optimize=True)
print(OUTPUT)
