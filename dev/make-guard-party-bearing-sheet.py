#!/usr/bin/env python3
"""Build a labelled four-bearing review sheet for the Guard Post 32px/ft cast."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "artifacts/golden-site-1-sprites-v001/four-bearings-v2"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
        if bold
        else Path("/System/Library/Fonts/Supplemental/Arial.ttf")
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source",
        type=Path,
        default=DEFAULT_SOURCE,
        help="directory containing turn-0 through turn-3 capture folders",
    )
    parser.add_argument(
        "--capture-stem",
        default="16-gv-w2-guard-post-day",
        help="capture filename stem before -qN",
    )
    parser.add_argument(
        "--title",
        default="Golden Site 1 · 32 px/ft Party + Guard Placement",
    )
    parser.add_argument(
        "--subtitle",
        default="same plan · same mechanics · same cast · four quarter-turn bearings",
    )
    parser.add_argument(
        "--output-name",
        default="guard-post-party-guards-four-bearings.png",
    )
    args = parser.parse_args()
    source = args.source if args.source.is_absolute() else ROOT / args.source
    output = source / args.output_name
    paths = []
    for turn in range(4):
        filename = f"{args.capture_stem}-q{turn}-04c-beauty-closeup.png"
        candidates = [
            source / f"turn-{turn}" / filename,
            source / f"institutional-seed19-q{turn}" / filename,
            source / f"q{turn}" / filename,
        ]
        path = next((candidate for candidate in candidates if candidate.exists()), candidates[0])
        paths.append(path)
    images = [Image.open(path).convert("RGB") for path in paths]
    card_w, card_h = 820, 850
    header_h = 105
    canvas = Image.new("RGB", (card_w * 2, header_h + card_h * 2), "#171713")
    draw = ImageDraw.Draw(canvas)
    draw.text(
        (28, 20),
        args.title,
        fill="#f1e7d6",
        font=font(30, bold=True),
    )
    draw.text(
        (28, 62),
        args.subtitle,
        fill="#c99d4d",
        font=font(17),
    )
    for turn, image in enumerate(images):
        col, row = turn % 2, turn // 2
        left, top = col * card_w, header_h + row * card_h
        draw.rectangle(
            (left + 10, top + 10, left + card_w - 10, top + card_h - 10),
            fill="#24241f",
            outline="#716756",
            width=2,
        )
        label = f"Q{turn} · {turn * 90}°"
        draw.text((left + 30, top + 24), label, fill="#f1e7d6", font=font(22, bold=True))
        available_w = card_w - 40
        available_h = card_h - 85
        scale = min(available_w / image.width, available_h / image.height)
        preview = image.resize(
            (round(image.width * scale), round(image.height * scale)),
            Image.Resampling.LANCZOS,
        )
        paste_x = left + (card_w - preview.width) // 2
        paste_y = top + 68 + (available_h - preview.height) // 2
        canvas.paste(preview, (paste_x, paste_y))
    canvas.save(output)
    print(output)


if __name__ == "__main__":
    main()
