#!/usr/bin/env python3
"""Measure and assemble the CL-R1 one-variable-at-a-time capture card.

Usage:
  python3 dev/measure-cl-r1-causality.py <capture-dir>
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/sprites/spr-fantasy-goblin-warrior.png"

CARDS = [
    ("source", "SOURCE ART", SOURCE),
    ("01-color-wrong-untagged", "COLOUR · WRONG\nuntagged", None),
    ("02-color-production-srgb", "COLOUR · PRODUCTION\nsRGB", None),
    ("03-material-unlit", "MATERIAL · REFERENCE\nunlit", None),
    ("04-material-lit", "MATERIAL · PRODUCTION\nlit standee", None),
    ("05-sampling-wrong-linear", "SAMPLING · WRONG\nlinear blur", None),
    ("06-sampling-production-nearest", "SAMPLING · PRODUCTION\nnearest mag", None),
    ("07-tonemap-none", "TONE MAP · COMPARISON\nnone", None),
    ("08-tonemap-production-agx", "TONE MAP · PRODUCTION\nAgX", None),
    ("09-compositing-post-off", "COMPOSITING · COMPARISON\npost off", None),
    ("10-compositing-production-post", "COMPOSITING · PRODUCTION\npost on", None),
    ("11-energy-production-torch", "ENERGY · PRODUCTION\ntorch", None),
    ("12-energy-overpowered", "ENERGY · WRONG\nmax preview", None),
]


def percentile(values: list[float], fraction: float) -> float:
    if not values:
        return 0.0
    values = sorted(values)
    return values[min(len(values) - 1, int(len(values) * fraction))]


def measured_pixels(image: Image.Image, source: bool) -> list[tuple[int, int, int]]:
    rgba = image.convert("RGBA")
    pixels: list[tuple[int, int, int]] = []
    for red, green, blue, alpha in rgba.getdata():
        if source:
            if alpha >= 16:
                pixels.append((red, green, blue))
        else:
            # The causal cards use neutral clay. Retain coloured sprite pixels and
            # discard the achromatic floor/grid/base surrounding the silhouette.
            maximum = max(red, green, blue)
            minimum = min(red, green, blue)
            if maximum > 8 and maximum - minimum >= 10:
                pixels.append((red, green, blue))
    return pixels


def metrics(image: Image.Image, source: bool = False) -> dict[str, float | int]:
    pixels = measured_pixels(image, source)
    lumas: list[float] = []
    saturations: list[float] = []
    spreads: list[float] = []
    clipped = 0
    for red, green, blue in pixels:
        maximum = max(red, green, blue)
        minimum = min(red, green, blue)
        spread = maximum - minimum
        lumas.append(0.2126 * red + 0.7152 * green + 0.0722 * blue)
        saturations.append(0 if maximum == 0 else 255 * spread / maximum)
        spreads.append(spread)
        clipped += int(red >= 250 and green >= 250 and blue >= 250)
    count = len(pixels)
    return {
        "measuredPixels": count,
        "medianLuma": round(percentile(lumas, 0.5), 2),
        "p05Luma": round(percentile(lumas, 0.05), 2),
        "p95Luma": round(percentile(lumas, 0.95), 2),
        "meanSaturation": round(sum(saturations) / count, 2) if count else 0,
        "meanChromaSpread": round(sum(spreads) / count, 2) if count else 0,
        "clippedHighlightPct": round(100 * clipped / count, 3) if count else 0,
    }


def edge_strength(image: Image.Image) -> float:
    grey = image.convert("L")
    width, height = grey.size
    px = grey.load()
    total = 0
    samples = 0
    for y in range(height - 1):
        for x in range(width - 1):
            total += abs(px[x + 1, y] - px[x, y]) + abs(px[x, y + 1] - px[x, y])
            samples += 2
    return round(total / max(1, samples), 3)


def fit_nearest(image: Image.Image, width: int, height: int) -> Image.Image:
    scale = min(width / image.width, height / image.height)
    size = (max(1, int(image.width * scale)), max(1, int(image.height * scale)))
    return image.resize(size, Image.Resampling.NEAREST)


def make_contact_sheet(images: dict[str, Image.Image], output: Path) -> None:
    columns = 4
    tile_width, tile_height = 360, 275
    header_height = 92
    rows = math.ceil(len(CARDS) / columns)
    sheet = Image.new("RGB", (columns * tile_width, header_height + rows * tile_height), "#11151b")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=18)
    small = ImageFont.load_default(size=15)
    draw.text((24, 17), "CL-R1 · SPRITE / LIGHT CAUSALITY", fill="#edf2f7", font=font)
    draw.text(
        (24, 48),
        "Same production Clayroom. One named renderer variable changed per pair.",
        fill="#9fb0c1",
        font=small,
    )
    for index, (card_id, label, _) in enumerate(CARDS):
        col, row = index % columns, index // columns
        x0 = col * tile_width
        y0 = header_height + row * tile_height
        draw.rectangle(
            (x0 + 8, y0 + 8, x0 + tile_width - 8, y0 + tile_height - 8),
            fill="#1b222b",
            outline="#374454",
            width=2,
        )
        image = fit_nearest(images[card_id], tile_width - 48, tile_height - 92)
        ix = x0 + (tile_width - image.width) // 2
        iy = y0 + 20
        if image.mode == "RGBA":
            neutral = Image.new("RGB", image.size, "#4a4848")
            neutral.paste(image.convert("RGB"), (0, 0), image.getchannel("A"))
            sheet.paste(neutral, (ix, iy))
        else:
            sheet.paste(image.convert("RGB"), (ix, iy))
        draw.multiline_text(
            (x0 + 20, y0 + tile_height - 59),
            label,
            fill="#dce5ee",
            font=small,
            spacing=3,
        )
    sheet.save(output)


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    capture_dir = Path(sys.argv[1]).resolve()
    images: dict[str, Image.Image] = {}
    results: dict[str, object] = {
        "kind": "cl-r1-causality-measurements",
        "metric": (
            "Rec.709 display luma and HSV saturation over alpha-bearing source pixels or "
            "non-neutral rendered sprite pixels (RGB spread >=10)"
        ),
        "cards": {},
    }
    for card_id, _, explicit_path in CARDS:
        image_path = explicit_path or capture_dir / f"{card_id}-sprite.png"
        image = Image.open(image_path)
        images[card_id] = image.copy()
        results["cards"][card_id] = {
            "path": str(image_path.relative_to(ROOT)) if image_path.is_relative_to(ROOT) else str(image_path),
            "size": list(image.size),
            "metrics": metrics(image, source=card_id == "source"),
            "edgeStrength": edge_strength(image),
        }

    cards = results["cards"]
    results["pairDeltas"] = {
        "colourSpace": {
            "wrongToProductionSaturation": round(
                cards["02-color-production-srgb"]["metrics"]["meanSaturation"]
                - cards["01-color-wrong-untagged"]["metrics"]["meanSaturation"],
                2,
            ),
            "wrongToProductionChromaSpread": round(
                cards["02-color-production-srgb"]["metrics"]["meanChromaSpread"]
                - cards["01-color-wrong-untagged"]["metrics"]["meanChromaSpread"],
                2,
            ),
        },
        "sampling": {
            "linearToNearestEdgeStrength": round(
                cards["06-sampling-production-nearest"]["edgeStrength"]
                - cards["05-sampling-wrong-linear"]["edgeStrength"],
                3,
            )
        },
        "lightEnergy": {
            "productionToOverpoweredMedianLuma": round(
                cards["12-energy-overpowered"]["metrics"]["medianLuma"]
                - cards["11-energy-production-torch"]["metrics"]["medianLuma"],
                2,
            ),
            "productionToOverpoweredP95Luma": round(
                cards["12-energy-overpowered"]["metrics"]["p95Luma"]
                - cards["11-energy-production-torch"]["metrics"]["p95Luma"],
                2,
            ),
        },
    }

    metrics_path = capture_dir / "causality-measurements.json"
    metrics_path.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    sheet_path = capture_dir / "causality-contact-sheet.png"
    make_contact_sheet(images, sheet_path)
    print(f"CL_R1_CAUSAL_MEASURE_DONE cards={len(CARDS)}")
    print(f"wrote {metrics_path}")
    print(f"wrote {sheet_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
