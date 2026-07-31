#!/usr/bin/env python3
"""Build a labeled 4×2 before/after sheet for reviewed architecture growth proofs."""

from pathlib import Path
import json
import textwrap
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = ROOT / "artifacts" / "architecture-clayroom" / "round-06-canonical"
GROWTH = ROOT / "artifacts" / "architecture-clayroom" / "round-06-growth"
OUTPUT = GROWTH / "architecture-growth-before-after-round-06-labeled.png"
ROWS = [
    ("AF-09 · PARTY-WALL FRONTAGE", "arch-af09-party-wall-frontage", "26"),
    ("AF-10 · KEEPER + CELL BLOCK", "arch-af10-keeper-cell-block", "27"),
    ("AF-11 · SHAFT-HEAD + HOIST", "arch-af11-shaft-head-hoist", "28"),
    ("AF-12 · TERRACED COMMUNE", "arch-af12-terraced-commune", "29"),
    ("AF-13 · BRIDGEHOUSE + WATERWORK", "arch-af13-bridgehouse-waterwork", "30"),
    ("AF-14 · INN / MANOR", "arch-af14-inn-manor-hip", "31"),
    ("AF-15 · HILLSIDE STAIR STREET", "arch-af15-hillside-stair-street", "32"),
    ("AF-16 · GREAT HALL / LONGHOUSE", "arch-af16-great-hall", "33"),
]

TILE_W, IMAGE_H, LABEL_H = 720, 312, 114
SHEET = Image.new("RGB", (TILE_W * 4, (IMAGE_H + LABEL_H) * 2), "#111419")
font_path = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
font = ImageFont.truetype(str(font_path), 21) if font_path.exists() else ImageFont.load_default()
small = ImageFont.truetype(str(font_path), 14) if font_path.exists() else ImageFont.load_default()
tiny = ImageFont.truetype(str(font_path), 12) if font_path.exists() else ImageFont.load_default()


def load_frame(root: Path, scene: str, capture: str) -> Image.Image:
    path = root / scene / f"{capture}-{scene}-04-clean-production.png"
    image = Image.open(path).convert("RGB")
    image.thumbnail((TILE_W // 2, IMAGE_H), Image.Resampling.LANCZOS)
    return image


for index, (label, scene, capture) in enumerate(ROWS):
    tile = Image.new("RGB", (TILE_W, IMAGE_H + LABEL_H), "#202328")
    draw = ImageDraw.Draw(tile)
    before = load_frame(CANONICAL, scene, capture)
    after = load_frame(GROWTH, scene, capture)
    tile.paste(before, ((TILE_W // 2 - before.width) // 2, (IMAGE_H - before.height) // 2))
    tile.paste(after, (TILE_W // 2 + (TILE_W // 2 - after.width) // 2,
                       (IMAGE_H - after.height) // 2))
    draw.line((TILE_W // 2, 0, TILE_W // 2, IMAGE_H), fill="#0c0f13", width=3)
    draw.rectangle((0, 0, 84, 25), fill="#171b20")
    draw.rectangle((TILE_W // 2, 0, TILE_W // 2 + 80, 25), fill="#6b4934")
    draw.text((10, 5), "BEFORE", font=tiny, fill="#d6dbe0")
    draw.text((TILE_W // 2 + 10, 5), "GROWTH", font=tiny, fill="#fff2e2")
    draw.rectangle((0, IMAGE_H, TILE_W, IMAGE_H + LABEL_H), fill="#101216")
    draw.text((16, IMAGE_H + 8), label, font=font, fill="#eee7d9")

    receipt_path = GROWTH / scene / f"{capture}-{scene}-receipt.json"
    receipt = json.loads(receipt_path.read_text())
    architecture = receipt["settled"]["terrain"]["architecture"]
    growth = architecture.get("growth") or {}
    operations = [op.split(":", 1)[-1].replace("-", " ").upper()
                  for op in growth.get("operations", [])]
    summary = " · ".join(operations)
    lines = textwrap.wrap(summary, width=70)[:2]
    for line_index, line in enumerate(lines):
        draw.text((16, IMAGE_H + 44 + line_index * 17), line,
                  font=small, fill="#b9c3ce")
    mode = architecture.get("battleSpaceMode", "unclassified").replace("-", " ").upper()
    clearances = architecture.get("clearanceEnvelopes") or []
    profiles = sorted({row["profileId"] for row in clearances})
    footer = mode + ((" · " + ", ".join(profiles).upper()) if profiles else "")
    draw.text((16, IMAGE_H + 82), footer, font=tiny, fill="#8ea0b3")

    x = (index % 4) * TILE_W
    y = (index // 4) * (IMAGE_H + LABEL_H)
    SHEET.paste(tile, (x, y))

SHEET.save(OUTPUT, optimize=True)
print(OUTPUT)
