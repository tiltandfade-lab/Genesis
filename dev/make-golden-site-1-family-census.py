#!/usr/bin/env python3
"""Build labeled Golden Site 1 breadth-review sheets from production captures."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CAPTURE_ROOT = ROOT / "artifacts" / "golden-site-1-family-census-2026-07-30"
CAPTURE_ROOT = DEFAULT_CAPTURE_ROOT
TILE_W, IMAGE_H, LABEL_H = 480, 270, 46
FONT_PATH = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
FONT = ImageFont.truetype(str(FONT_PATH), 19) if FONT_PATH.exists() else ImageFont.load_default()


def beauty(directory: str, turn: int, root: Path | None = None) -> Path:
    return (
        (root or CAPTURE_ROOT)
        / directory
        / f"16-gv-w2-guard-post-day-q{turn}-04c-beauty-closeup.png"
    )


def make_sheet(output_name: str, title: str, sources: list[tuple[str, Path]]) -> Path:
    columns = 4
    rows = (len(sources) + columns - 1) // columns
    title_h = 58
    sheet = Image.new(
        "RGB",
        (TILE_W * columns, title_h + (IMAGE_H + LABEL_H) * rows),
        "#17191c",
    )
    draw = ImageDraw.Draw(sheet)
    draw.rectangle((0, 0, sheet.width, title_h), fill="#0f1114")
    draw.text((18, 17), title, font=FONT, fill="#f0e8d8")

    for index, (label, source) in enumerate(sources):
        if not source.exists():
            raise FileNotFoundError(source)
        image = Image.open(source).convert("RGB")
        image.thumbnail((TILE_W, IMAGE_H), Image.Resampling.LANCZOS)
        tile = Image.new("RGB", (TILE_W, IMAGE_H + LABEL_H), "#202328")
        tile.paste(image, ((TILE_W - image.width) // 2, (IMAGE_H - image.height) // 2))
        tile_draw = ImageDraw.Draw(tile)
        tile_draw.rectangle((0, IMAGE_H, TILE_W, IMAGE_H + LABEL_H), fill="#101216")
        tile_draw.text((14, IMAGE_H + 12), label, font=FONT, fill="#eee7d9")
        x = (index % columns) * TILE_W
        y = title_h + (index // columns) * (IMAGE_H + LABEL_H)
        sheet.paste(tile, (x, y))

    output = CAPTURE_ROOT / output_name
    sheet.save(output, optimize=True)
    return output


def bearing_culture_sources(
    institutional_root: Path | None = None,
    upland_root: Path | None = None,
) -> list[tuple[str, Path]]:
    return [
        *[
            (
                f"INSTITUTIONAL · SEED 19 · Q{turn}",
                beauty(f"institutional-seed19-q{turn}", turn, institutional_root),
            )
            for turn in range(4)
        ],
        *[
            (
                f"UPLAND · SEED 19 · Q{turn}",
                beauty(f"upland-seed19-q{turn}", turn, upland_root),
            )
            for turn in range(4)
        ],
    ]


def mutation_control_sources() -> list[tuple[str, Path]]:
    return [
        ("NEUTRAL CLAY · SEED 19 · Q0", beauty("neutral-seed19-q0", 0)),
        ("INSTITUTIONAL · SEED 19 · Q0", beauty("institutional-seed19-q0", 0)),
        ("INSTITUTIONAL · SEED 101 · Q0", beauty("institutional-seed101-q0", 0)),
        ("INSTITUTIONAL · SEED 101 · Q2", beauty("institutional-seed101-q2", 2)),
        ("INSTITUTIONAL · SEED 202 · Q0", beauty("institutional-seed202-q0", 0)),
        ("INSTITUTIONAL · SEED 202 · Q2", beauty("institutional-seed202-q2", 2)),
        ("UPLAND · SEED 19 · Q0", beauty("upland-seed19-q0", 0)),
        ("UPLAND · SEED 19 · Q2", beauty("upland-seed19-q2", 2)),
    ]


def three_seed_bearing_sources() -> list[tuple[str, Path]]:
    return [
        *[
            (
                f"HERO · SEED 19 · Q{turn}",
                beauty(f"institutional-seed19-q{turn}", turn),
            )
            for turn in range(4)
        ],
        *[
            (
                f"MUTATION A · SEED 101 · Q{turn}",
                beauty(f"institutional-seed101-q{turn}", turn),
            )
            for turn in range(4)
        ],
        *[
            (
                f"MUTATION B · SEED 202 · Q{turn}",
                beauty(f"institutional-seed202-q{turn}", turn),
            )
            for turn in range(4)
        ],
    ]


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--capture-root",
        type=Path,
        default=DEFAULT_CAPTURE_ROOT,
        help="Directory containing the named production-capture folders.",
    )
    parser.add_argument(
        "--family-only",
        action="store_true",
        help="Build only the three-seed/four-bearing family sheet.",
    )
    parser.add_argument(
        "--culture-only",
        action="store_true",
        help="Build only the four-bearing/two-culture sheet.",
    )
    parser.add_argument("--institutional-root", type=Path)
    parser.add_argument("--upland-root", type=Path)
    args = parser.parse_args()
    CAPTURE_ROOT = args.capture_root.resolve()
    institutional_root = args.institutional_root.resolve() if args.institutional_root else None
    upland_root = args.upland_root.resolve() if args.upland_root else None
    if not args.culture_only:
        print(
            make_sheet(
                "00-three-seed-four-bearing-family-labeled.png",
                "GOLDEN SITE 1 · THREE MUTATIONS / FOUR BEARINGS · V018 TECHNICAL PARENT",
                three_seed_bearing_sources(),
            )
        )
    if args.family_only:
        raise SystemExit(0)
    print(
        make_sheet(
            "01-bearing-culture-census-labeled.png",
            "GOLDEN SITE 1 · FOUR-BEARING / CULTURE CENSUS",
            bearing_culture_sources(institutional_root, upland_root),
        )
    )
    if args.culture_only:
        raise SystemExit(0)
    print(
        make_sheet(
            "02-mutation-control-census-labeled.png",
            "GOLDEN SITE 1 · MUTATION / NEUTRAL-CONTROL CENSUS",
            mutation_control_sources(),
        )
    )
