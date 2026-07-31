#!/usr/bin/env python3
"""Compare the selected six-cell Guard Post ground parent with its 32 px/ft reconstruction.

The runtime pair is captured with identical seed, plan, camera, light, masonry, and condition.
The lower row shows the same physical ten-foot window from each thirty-foot source so the
difference between source density and runtime scale is inspectable without changing world scale.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts/golden-site-1-ground-density-v018"
RUNTIME_NAME = "16-gv-w2-guard-post-day-04c-beauty-closeup.png"
CASES = [
    {
        "id": "v011",
        "title": "V011 · SELECTED SIX-CELL MACRO",
        "subtitle": "512 px / 30 ft · ~17.1 source px/ft",
        "runtime": OUT / "v011-runtime" / RUNTIME_NAME,
        "source": ROOT
        / "assets/materials/golden/guard-post/v011/ground-upland-turf-albedo.png",
        "pixels_per_foot": 512 / 30,
    },
    {
        "id": "v018",
        "title": "V018 · SAME MACRO AUTHORITY",
        "subtitle": "960 px / 30 ft · exact 32 source px/ft",
        "runtime": OUT / "v018-runtime" / RUNTIME_NAME,
        "source": ROOT
        / "assets/materials/golden/guard-post/v018/ground-upland-turf-30ft-32ppf-albedo.png",
        "pixels_per_foot": 32,
    },
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold
             else "/System/Library/Fonts/Supplemental/Arial.ttf"),
        Path("/System/Library/Fonts/SFNS.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default(size=size)


def contain(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(size, Image.Resampling.LANCZOS)
    return copy


def ten_foot_crop(image: Image.Image, pixels_per_foot: float) -> Image.Image:
    span = round(10 * pixels_per_foot)
    left = (image.width - span) // 2
    top = (image.height - span) // 2
    return image.crop((left, top, left + span, top + span))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    canvas = Image.new("RGB", (2700, 2190), "#11100e")
    draw = ImageDraw.Draw(canvas)
    title_font = font(44, bold=True)
    heading_font = font(30, bold=True)
    body_font = font(24)
    small_font = font(21)

    draw.text((70, 42), "GOLDEN SITE 1 · SIX-CELL GROUND DENSITY DECISION",
              fill="#f4ecda", font=title_font)
    draw.text((70, 102),
              "Same 30 ft repeat, seed, battlefield, materials, light, and camera · no implicit witnesses",
              fill="#c8b776", font=body_font)

    column_width = 1240
    gap = 80
    x_positions = [70, 70 + column_width + gap]
    runtime_box = (column_width, 1240)
    source_box_size = 520

    for x, case in zip(x_positions, CASES):
        draw.rounded_rectangle((x, 160, x + column_width, 2140), radius=12,
                               fill="#1b1a16", outline="#706751", width=2)
        draw.text((x + 28, 184), case["title"], fill="#f4ecda", font=heading_font)
        draw.text((x + 28, 228), case["subtitle"], fill="#c8b776", font=small_font)

        runtime = Image.open(case["runtime"]).convert("RGB")
        runtime_view = contain(runtime, runtime_box)
        runtime_x = x + (column_width - runtime_view.width) // 2
        canvas.paste(runtime_view, (runtime_x, 276))
        draw.text((x + 28, 1535), "IDENTICAL GAMEPLAY CLOSE-UP",
                  fill="#f4ecda", font=small_font)

        source = Image.open(case["source"]).convert("RGB")
        crop = ten_foot_crop(source, case["pixels_per_foot"])
        crop = crop.resize((source_box_size, source_box_size), Image.Resampling.NEAREST)
        crop_x = x + (column_width - source_box_size) // 2
        canvas.paste(crop, (crop_x, 1580))
        draw.rectangle((crop_x, 1580, crop_x + source_box_size, 1580 + source_box_size),
                       outline="#a89b78", width=2)
        draw.text((x + 28, 2112), "CENTER 10 FT · NEAREST-NEIGHBOR INSPECTION",
                  fill="#aaa18d", font=small_font)

    output = OUT / "01-v011-v018-ground-density-comparison.png"
    canvas.save(output, optimize=True)
    print(output)


if __name__ == "__main__":
    main()
