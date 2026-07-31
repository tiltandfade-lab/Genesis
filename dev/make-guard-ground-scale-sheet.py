#!/usr/bin/env python3
"""Assemble the deterministic Guard Post ground-scale calibration proof."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PROOF = ROOT / "artifacts/golden-site-1-ground-scale-v011"
CASES = [
    ("repeat-4p95", "3 CELLS · 4.95 m"),
    ("repeat-6p6", "4 CELLS · 6.60 m"),
    ("repeat-8p25", "5 CELLS · 8.25 m"),
    ("repeat-9p9", "6 CELLS · 9.90 m (OLD)"),
]
FRAME = "16-gv-w2-guard-post-day-q0-04c-beauty-closeup.png"


def main() -> None:
    images = [Image.open(PROOF / folder / FRAME).convert("RGB") for folder, _ in CASES]
    width = max(image.width for image in images)
    height = max(image.height for image in images)
    label_height = 42
    sheet = Image.new("RGB", (width * 2, (height + label_height) * 2), "#11100e")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=20)
    for index, (image, (_, label)) in enumerate(zip(images, CASES)):
        x = (index % 2) * width
        y = (index // 2) * (height + label_height)
        sheet.paste(image, (x, y + label_height))
        draw.rectangle((x, y, x + width, y + label_height), fill="#181713")
        draw.text((x + 14, y + 10), label, fill="#f2ead5", font=font)
    output = PROOF / "01-ground-physical-scale-labeled.png"
    sheet.save(output, optimize=True)
    print(output)


if __name__ == "__main__":
    main()
