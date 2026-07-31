#!/usr/bin/env python3
"""Build the CL-F09 labeled 4×2 architecture review sheet from production captures."""

from pathlib import Path
import sys
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ROUND = sys.argv[1] if len(sys.argv) > 1 else "round-01"
SUITE = sys.argv[2] if len(sys.argv) > 2 else "suite-01"
CAPTURE_ROOT = ROOT / "artifacts" / "architecture-clayroom" / ROUND
OUTPUT = CAPTURE_ROOT / f"architecture-form-ladder-{ROUND}-labeled.png"
SUITE_1_ROWS = [
    ("AF-01 · ROAD CHECKPOINT", "arch-af01-road-checkpoint", "18"),
    ("AF-02 · ROADSIDE SHELTER", "arch-af02-roadside-shelter", "19"),
    ("AF-03 · EMBEDDED GUARDROOM", "arch-af03-embedded-guardroom", "20"),
    ("AF-04 · WORKSHOP SHED", "arch-af04-workshop-shed", "21"),
    ("AF-05 · COURTYARD RANGE", "arch-af05-courtyard-range", "22"),
    ("AF-06 · MARKET HALL", "arch-af06-market-hall", "23"),
    ("AF-07 · FORTIFIED GATEHOUSE", "arch-af07-gatehouse", "24"),
    ("AF-08 · WATCHTOWER RUIN", "arch-af08-watchtower-ruin", "25"),
]
SUITE_2_ROWS = [
    ("AF-09 · PARTY-WALL FRONTAGE", "arch-af09-party-wall-frontage", "26"),
    ("AF-10 · KEEPER + CELL BLOCK", "arch-af10-keeper-cell-block", "27"),
    ("AF-11 · SHAFT-HEAD + HOIST", "arch-af11-shaft-head-hoist", "28"),
    ("AF-12 · TERRACED COMMUNE", "arch-af12-terraced-commune", "29"),
    ("AF-13 · BRIDGEHOUSE + WATERWORK", "arch-af13-bridgehouse-waterwork", "30"),
    ("AF-14 · INN / MANOR · HIP ROOF", "arch-af14-inn-manor-hip", "31"),
    ("AF-15 · HILLSIDE STAIR STREET", "arch-af15-hillside-stair-street", "32"),
    ("AF-16 · GREAT HALL / LONGHOUSE", "arch-af16-great-hall", "33"),
]
MONUMENTAL_ROWS = [
    ("AF-17 · SANCTUARY NAVE · STAINED WALL", "arch-af17-sanctuary-nave", "34"),
    ("AF-18 · PALACE PROCESSIONAL COURT", "arch-af18-palace-processional-court", "35"),
    ("AF-19 · ARCANE CIVIC AQUEDUCT", "arch-af19-arcane-civic-aqueduct", "36"),
    ("AF-20 · STAR ARCHIVE ROTUNDA", "arch-af20-star-archive-rotunda", "37"),
]
ROWS = (MONUMENTAL_ROWS if SUITE == "monumental"
        else (SUITE_2_ROWS if SUITE == "suite-02" else SUITE_1_ROWS))

TILE_W, IMAGE_H, LABEL_H = 640, 360, 76
row_count = (len(ROWS) + 3) // 4
SHEET = Image.new("RGB", (TILE_W * 4, (IMAGE_H + LABEL_H) * row_count), "#17191c")
font_path = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
font = ImageFont.truetype(str(font_path), 23) if font_path.exists() else ImageFont.load_default()
small_font = ImageFont.truetype(str(font_path), 15) if font_path.exists() else ImageFont.load_default()

for index, (label, scene, capture) in enumerate(ROWS):
    source = CAPTURE_ROOT / scene / f"{capture}-{scene}-04-clean-production.png"
    image = Image.open(source).convert("RGB")
    image.thumbnail((TILE_W, IMAGE_H), Image.Resampling.LANCZOS)
    tile = Image.new("RGB", (TILE_W, IMAGE_H + LABEL_H), "#202328")
    tile.paste(image, ((TILE_W - image.width) // 2, (IMAGE_H - image.height) // 2))
    draw = ImageDraw.Draw(tile)
    draw.rectangle((0, IMAGE_H, TILE_W, IMAGE_H + LABEL_H), fill="#101216")
    draw.text((18, IMAGE_H + 10), label, font=font, fill="#eee7d9")
    receipt_path = CAPTURE_ROOT / scene / f"{capture}-{scene}-receipt.json"
    if receipt_path.exists():
        receipt = json.loads(receipt_path.read_text())
        variation = (
            receipt.get("settled", {})
            .get("terrain", {})
            .get("architecture", {})
            .get("variation")
        )
        if variation:
            op = variation["operators"]
            subtitle = (
                f"SEED {variation['seed']}  ·  Q{op['quarterTurn']}  ·  "
                f"MIRROR {'YES' if op['mirrorX'] else 'NO'}  ·  "
                f"X {op['scaleX']:.2f}  Z {op['scaleZ']:.2f}"
            )
            draw.text((18, IMAGE_H + 46), subtitle, font=small_font, fill="#aeb8c8")
    x = (index % 4) * TILE_W
    y = (index // 4) * (IMAGE_H + LABEL_H)
    SHEET.paste(tile, (x, y))

SHEET.save(OUTPUT, optimize=True)
print(OUTPUT)
