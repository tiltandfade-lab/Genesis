#!/usr/bin/env python3
"""Build an exact-pose A/B card for the Guard Post contact-growth material pass."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BEFORE = (
    ROOT
    / "artifacts/golden-site-1-authored-rocks-v003/institutional-seed19-q1"
    / "16-gv-w2-guard-post-day-q1-04c-beauty-closeup.png"
)
AFTER = (
    ROOT
    / "artifacts/golden-site-1-condition-growth-v001/institutional-seed19-q1"
    / "16-gv-w2-guard-post-day-q1-04c-beauty-closeup.png"
)
OUTPUT = (
    ROOT
    / "artifacts/golden-site-1-condition-growth-v001"
    / "01-contact-growth-before-after.png"
)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    name = "Arial Bold.ttf" if bold else "Arial.ttf"
    candidate = Path("/System/Library/Fonts/Supplemental") / name
    if candidate.exists():
        return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def main() -> None:
    before = Image.open(BEFORE).convert("RGB")
    after = Image.open(AFTER).convert("RGB")
    if before.size != after.size:
        raise SystemExit(f"pose mismatch: {before.size} != {after.size}")

    # Exact same world/camera crop: retaining footing, guardroom foundation, and ivy corner.
    crop_box = (430, 330, 1324, 820)
    crops = [before.crop(crop_box), after.crop(crop_box)]
    panel_w, panel_h = 900, 585
    header_h = 112
    canvas = Image.new("RGB", (panel_w * 2, header_h + panel_h), "#171713")
    draw = ImageDraw.Draw(canvas)
    draw.text(
        (28, 18),
        "Golden Site 1 · Causal Contact-Growth A/B",
        fill="#f1e7d6",
        font=font(30, bold=True),
    )
    draw.text(
        (28, 62),
        "same seed · same Q1 camera · same geometry · only parent-material condition channels differ",
        fill="#c99d4d",
        font=font(16),
    )
    labels = [
        ("BEFORE", "grime + corner ivy; foundation growth largely absent"),
        ("AFTER", "edge-rooted moss enabled on wall, footing, and upward support"),
    ]
    for index, (image, (title, subtitle)) in enumerate(zip(crops, labels)):
        left = index * panel_w
        draw.rectangle(
            (left + 10, header_h + 10, left + panel_w - 10, header_h + panel_h - 10),
            fill="#24241f",
            outline="#716756",
            width=2,
        )
        draw.text(
            (left + 28, header_h + 23),
            title,
            fill="#f1e7d6",
            font=font(21, bold=True),
        )
        draw.text(
            (left + 28, header_h + 53),
            subtitle,
            fill="#bcb3a5",
            font=font(14),
        )
        available_w = panel_w - 40
        available_h = panel_h - 100
        scale = min(available_w / image.width, available_h / image.height)
        preview = image.resize(
            (round(image.width * scale), round(image.height * scale)),
            Image.Resampling.NEAREST,
        )
        x = left + (panel_w - preview.width) // 2
        y = header_h + 87 + (available_h - preview.height) // 2
        canvas.paste(preview, (x, y))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    main()
