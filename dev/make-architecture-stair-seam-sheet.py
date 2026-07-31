#!/usr/bin/env python3
"""Build a labeled before/after sheet for the AF-21 stair-seam correction."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "architecture-clayroom"
BEFORE = (
    ARTIFACTS
    / "round-09-giant-ruin-day"
    / "38-arch-af21-grand-concourse-corner-04-clean-production.png"
)
AFTER = (
    ARTIFACTS
    / "round-12-giant-ruin-final"
    / "38-arch-af21-grand-concourse-corner-04-clean-production.png"
)
OUTPUT = (
    ARTIFACTS
    / "round-12-giant-ruin-final"
    / "af21-stair-seam-before-after-labeled.png"
)

font_path = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
label_font = (
    ImageFont.truetype(str(font_path), 28)
    if font_path.exists()
    else ImageFont.load_default()
)
detail_font = (
    ImageFont.truetype(str(font_path), 18)
    if font_path.exists()
    else ImageFont.load_default()
)

tile_size = (960, 540)
label_height = 98
sheet = Image.new("RGB", (tile_size[0] * 2, tile_size[1] + label_height), "#121419")
rows = [
    (
        BEFORE,
        "REJECTED · CONNECTOR PLATFORM",
        "Flights miss each other; upper body begins above the floor.",
        "#db766d",
    ),
    (
        AFTER,
        "REPAIRED · EXACT STAIR SEAM",
        "0 position/rise/width gap; higher flight grounded to floor.",
        "#78c69a",
    ),
]

for index, (path, title, detail, color) in enumerate(rows):
    image = Image.open(path).convert("RGB")
    image.thumbnail(tile_size, Image.Resampling.LANCZOS)
    x = index * tile_size[0]
    sheet.paste(image, (x + (tile_size[0] - image.width) // 2, 0))
    draw = ImageDraw.Draw(sheet)
    draw.rectangle(
        (x, tile_size[1], x + tile_size[0], tile_size[1] + label_height),
        fill="#181b20",
    )
    draw.text((x + 24, tile_size[1] + 14), title, font=label_font, fill=color)
    draw.text((x + 24, tile_size[1] + 57), detail, font=detail_font, fill="#d7dce5")

sheet.save(OUTPUT, optimize=True)
print(OUTPUT)
