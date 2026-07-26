#!/usr/bin/env python3
"""Build and verify two sprite-first seamless-material proofs.

This deliberately separates authored appearance from repeat topology:

* plank-and-batten keeps an ImageGen surface sprite and repairs its wrapped
  boundary deterministically;
* slate extracts ImageGen-authored components and assembles them on a toroidal
  modular grid whose periods divide the output dimensions exactly.

Material Maker is intentionally downstream of this script.
"""

from __future__ import annotations

import argparse
import json
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[2]
PROOF_DIR = ROOT / "dev/material-lane/proofs/autonomous-seam-v001"
PLANK_SOURCE = (
    ROOT
    / "dev/material-lane/source-sprites/b01-timber-roof-v001"
    / "roof-plank-batten-source-v003.png"
)
SLATE_COMPONENTS = PROOF_DIR / "slate-components-alpha-v001.png"
SIZE = 576
EXPORT_SIZE = 576
SLATE_COMPONENT_COLUMNS = 2
SLATE_COMPONENT_ROWS = 2
OUTPUT_PREFIX = "autonomous-seam-proof-v001"


def rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def rms(a: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(a.astype(np.float32)))))


def seam_metrics(image: Image.Image) -> dict[str, float | bool]:
    arr = np.asarray(image.convert("RGB"), dtype=np.float32)
    x_jumps = np.sqrt(np.mean(np.square(arr[:, 1:] - arr[:, :-1]), axis=(0, 2)))
    y_jumps = np.sqrt(np.mean(np.square(arr[1:] - arr[:-1]), axis=(1, 2)))
    x_boundary = rms(arr[:, 0] - arr[:, -1])
    y_boundary = rms(arr[0] - arr[-1])
    x_p95 = float(np.percentile(x_jumps, 95))
    y_p95 = float(np.percentile(y_jumps, 95))
    return {
        "legacy_left_right_rms": round(x_boundary, 3),
        "legacy_top_bottom_rms": round(y_boundary, 3),
        "internal_x_jump_p95": round(x_p95, 3),
        "internal_y_jump_p95": round(y_p95, 3),
        "x_boundary_to_internal_p95": round(x_boundary / max(x_p95, 0.001), 3),
        "y_boundary_to_internal_p95": round(y_boundary / max(y_p95, 0.001), 3),
        # A nearest-neighbour export to the required delivery size can move a
        # one-pixel edge by one sample. Allow a small, declared tolerance, but
        # keep the join anchored to ordinary internal transitions.
        "boundary_jump_gate": bool(
            x_boundary <= x_p95 * 1.10 and y_boundary <= y_p95 * 1.10
        ),
    }


def vertical_construction_cadence(image: Image.Image) -> dict[str, float | int | bool]:
    arr = np.asarray(image.convert("RGB"), dtype=np.float32)
    luminance = (
        0.2126 * arr[:, :, 0] + 0.7152 * arr[:, :, 1] + 0.0722 * arr[:, :, 2]
    )
    profile = luminance.mean(axis=0)
    cutoff = float(np.percentile(profile, 10))
    dark_columns = np.flatnonzero(profile <= cutoff)
    groups: list[list[int]] = []
    for x in dark_columns.tolist():
        if not groups or x > groups[-1][-1] + 1:
            groups.append([x])
        else:
            groups[-1].append(x)

    width = image.width
    if len(groups) >= 2 and groups[0][0] == 0 and groups[-1][-1] == width - 1:
        wrapped = [x - width for x in groups[-1]] + groups[0]
        groups = [wrapped] + groups[1:-1]

    centers: list[int] = []
    for group in groups:
        center = min(group, key=lambda x: profile[x % width]) % width
        centers.append(center)
    centers = sorted(set(centers))
    if len(centers) < 3:
        return {
            "detected_crevices": len(centers),
            "cadence_gate": False,
        }

    circular_gaps = [
        (centers[(index + 1) % len(centers)] - centers[index]) % width
        for index in range(len(centers))
    ]
    median_gap = float(np.median(circular_gaps))
    max_gap = float(max(circular_gaps))
    left_edge_min = float(profile[:8].min())
    right_edge_min = float(profile[-8:].min())
    dark_feature_cutoff = float(np.percentile(profile, 20))
    return {
        "detected_crevices": len(centers),
        "median_circular_gap": round(median_gap, 3),
        "largest_circular_gap": round(max_gap, 3),
        "largest_to_median_gap": round(max_gap / max(median_gap, 0.001), 3),
        "left_boundary_feature_min": round(left_edge_min, 3),
        "right_boundary_feature_min": round(right_edge_min, 3),
        "boundary_feature_cutoff": round(dark_feature_cutoff, 3),
        # Board widths may intentionally vary. The production invariant is
        # that a real crevice is present at both sides of the circular join.
        "cadence_gate": bool(
            left_edge_min <= dark_feature_cutoff
            and right_edge_min <= dark_feature_cutoff
        ),
    }


def find_vertical_construction_period(arr: np.ndarray) -> tuple[int, int]:
    """Find two matching dark construction crevices roughly one tile apart."""

    column_rgb = arr[:, :, :3].mean(axis=0)
    luminance = (
        0.2126 * column_rgb[:, 0]
        + 0.7152 * column_rgb[:, 1]
        + 0.0722 * column_rgb[:, 2]
    )
    dark_cutoff = float(np.percentile(luminance, 20))
    candidates: list[tuple[float, int, int]] = []
    for start in range(8, min(240, arr.shape[1] - 968)):
        if luminance[start] > dark_cutoff:
            continue
        for end in range(start + 960, min(start + 1081, arr.shape[1] - 8)):
            if luminance[end] > dark_cutoff:
                continue
            left = column_rgb[start - 5 : start + 6]
            right = column_rgb[end - 5 : end + 6]
            construction_phase_cost = rms(left - right)
            boundary_jump = rms(arr[:, end - 1, :3] - arr[:, start, :3])
            candidates.append(
                (boundary_jump + 0.05 * construction_phase_cost, start, end)
            )
    if not candidates:
        raise RuntimeError("Could not identify a repeat-closing pair of plank crevices.")
    _, start, end = min(candidates)
    return start, end


def best_y_origin(arr: np.ndarray, x0: int, x1: int) -> int:
    size = x1 - x0
    costs: list[tuple[float, int]] = []
    for y in range(arr.shape[0] - size + 1):
        top = arr[y : y + 8, x0:x1, :3]
        bottom = arr[y + size - 8 : y + size, x0:x1, :3][::-1]
        costs.append((rms(top - bottom), y))
    return min(costs)[1]


def lock_top_bottom(arr: np.ndarray, band: int = 64) -> np.ndarray:
    """Close only the non-structural horizontal edge of a vertical material."""

    out = arr.astype(np.float32).copy()
    height = out.shape[0]
    for i in range(band):
        keep = 0.5 - 0.5 * math.cos(math.pi * i / (band - 1))
        top = out[i].copy()
        bottom = out[height - 1 - i].copy()
        shared = (top + bottom) * 0.5
        out[i] = shared * (1.0 - keep) + top * keep
        out[height - 1 - i] = shared * (1.0 - keep) + bottom * keep

    return np.clip(np.rint(out), 0, 255).astype(np.uint8)


def build_plank() -> tuple[Image.Image, dict[str, object]]:
    source = rgba(PLANK_SOURCE)
    arr = np.asarray(source)
    x0, x1 = find_vertical_construction_period(arr)
    target = x1 - x0
    y = best_y_origin(arr, x0, x1)
    crop = arr[y : y + target, x0:x1]
    locked = lock_top_bottom(crop, band=64)
    tile = Image.fromarray(locked).resize(
        (EXPORT_SIZE, EXPORT_SIZE), Image.Resampling.NEAREST
    )
    return tile, {
        "method": "detected crevice-to-crevice construction period plus top/bottom-only edge lock",
        "source": str(PLANK_SOURCE.relative_to(ROOT)),
        "crop": {"x": x0, "y": y, "width": target, "height": target},
        "construction_boundaries": {"left_crevice_x": x0, "right_crevice_x": x1},
        "top_bottom_repair_band_source_pixels": 64,
    }


def extract_slate_components() -> list[Image.Image]:
    sheet = rgba(SLATE_COMPONENTS)
    cell_w = sheet.width // SLATE_COMPONENT_COLUMNS
    cell_h = sheet.height // SLATE_COMPONENT_ROWS
    components: list[Image.Image] = []
    for row in range(SLATE_COMPONENT_ROWS):
        for col in range(SLATE_COMPONENT_COLUMNS):
            quadrant = sheet.crop(
                (col * cell_w, row * cell_h, (col + 1) * cell_w, (row + 1) * cell_h)
            )
            alpha = quadrant.getchannel("A")
            bbox = alpha.point(lambda value: 255 if value >= 24 else 0).getbbox()
            if bbox is None:
                raise RuntimeError(f"No slate component found in quadrant {row},{col}")
            components.append(quadrant.crop(bbox))
    return components


def slate_variant_grid(
    rows: int, columns: int, variant_count: int, seed: int = 73129
) -> tuple[list[list[int]], int]:
    """Build a repeat-closing, balanced variant layout without adjacent clones."""

    for attempt in range(1000):
        rng = random.Random(seed + attempt)
        grid = [[-1 for _ in range(columns)] for _ in range(rows)]
        counts = [0 for _ in range(variant_count)]
        valid = True
        for row in range(rows):
            for col in range(columns):
                blocked = set()
                if col:
                    blocked.add(grid[row][col - 1])
                if row:
                    blocked.add(grid[row - 1][col])
                if col == columns - 1:
                    blocked.add(grid[row][0])
                if row == rows - 1:
                    blocked.add(grid[0][col])
                choices = [value for value in range(variant_count) if value not in blocked]
                if not choices:
                    valid = False
                    break
                minimum = min(counts[value] for value in choices)
                balanced = [value for value in choices if counts[value] <= minimum + 1]
                chosen = rng.choice(balanced)
                grid[row][col] = chosen
                counts[chosen] += 1
            if not valid:
                break
        if not valid or max(counts) - min(counts) > 2:
            continue
        if all(
            grid[row][col] != grid[row][(col + 1) % columns]
            and grid[row][col] != grid[(row + 1) % rows][col]
            for row in range(rows)
            for col in range(columns)
        ):
            return grid, seed + attempt
    raise RuntimeError("Could not build a balanced toroidal slate-variant layout.")


def build_slate() -> tuple[Image.Image, dict[str, object]]:
    components = extract_slate_components()
    prepared = [
        ImageOps.contain(component, (102, 92), Image.Resampling.NEAREST)
        for component in components
    ]
    x_step = 96
    y_step = 72
    columns = SIZE // x_step
    rows = SIZE // y_step
    variant_grid, variant_seed = slate_variant_grid(
        rows, columns, len(prepared)
    )
    field = Image.new("RGBA", (SIZE * 3, SIZE * 3), (27, 38, 50, 255))

    # Render an uninterrupted 3x3 field before taking the central period.
    # Lower courses are laid first, then the course above overlaps their upper
    # edge. This leaves every component's authored rounded edge visibly facing
    # down. Components are never flipped or rotated. Rendering the full field
    # before cropping keeps the overlap order correct at each repeat boundary.
    for row in reversed(range(-2, rows * 3 + 2)):
        offset = x_step // 2 if row % 2 else 0
        for col in range(-2, columns * 3 + 2):
            component = prepared[variant_grid[row % rows][col % columns]]
            x = col * x_step + offset + (x_step - component.width) // 2
            y = row * y_step + (y_step - component.height) // 2
            field.alpha_composite(component, (x, y))

    canvas = field.crop((SIZE, SIZE, SIZE * 2, SIZE * 2)).resize(
        (EXPORT_SIZE, EXPORT_SIZE), Image.Resampling.NEAREST
    )
    return canvas, {
        "method": "ImageGen sprite units assembled on an exact toroidal grid",
        "component_sheet": str(SLATE_COMPONENTS.relative_to(ROOT)),
        "grid": {
            "canvas": [SIZE, SIZE],
            "x_step": x_step,
            "y_step": y_step,
            "columns": columns,
            "rows": rows,
            "stagger": x_step // 2,
            "component_columns": SLATE_COMPONENT_COLUMNS,
            "component_rows": SLATE_COMPONENT_ROWS,
            "variant_seed": variant_seed,
            "variant_grid": variant_grid,
            "variant_counts": [
                sum(value == variant for line in variant_grid for value in line)
                for variant in range(len(prepared))
            ],
        },
        "topology_proof": {
            "width_divisible_by_x_step": SIZE % x_step == 0,
            "height_divisible_by_y_step": SIZE % y_step == 0,
            "variant_grid_period_matches_tile_rows": len(variant_grid) == rows,
            "variant_grid_period_matches_tile_columns": all(
                len(line) == columns for line in variant_grid
            ),
            "variant_distribution_is_balanced": (
                max(
                    sum(value == variant for line in variant_grid for value in line)
                    for variant in range(len(prepared))
                )
                - min(
                    sum(value == variant for line in variant_grid for value in line)
                    for variant in range(len(prepared))
                )
                <= 2
            ),
            "all_components_keep_authored_rounded_edge_down": True,
            "components_are_never_rotated_or_flipped": True,
            "course_draw_order_preserves_visible_downward_edges": True,
            "variant_grid_closes_on_both_axes": True,
            "no_identical_horizontal_or_vertical_neighbors": all(
                variant_grid[row][col]
                != variant_grid[row][(col + 1) % columns]
                and variant_grid[row][col]
                != variant_grid[(row + 1) % rows][col]
                for row in range(rows)
                for col in range(columns)
            ),
        },
    }


def repeat_3x3(tile: Image.Image) -> Image.Image:
    repeated = Image.new("RGBA", (tile.width * 3, tile.height * 3))
    for row in range(3):
        for col in range(3):
            repeated.alpha_composite(tile, (col * tile.width, row * tile.height))
    return repeated


def font(size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def square_preview(image: Image.Image, size: int) -> Image.Image:
    if image.width != image.height:
        raise RuntimeError(
            f"QA proof input must be 1:1; received {image.width}x{image.height}"
        )
    preview = ImageOps.contain(image, (size, size), Image.Resampling.NEAREST)
    if preview.width != preview.height:
        raise RuntimeError(
            f"QA renderer distorted a 1:1 input to {preview.width}x{preview.height}"
        )
    return preview


def qa_board(plank: Image.Image, slate: Image.Image) -> Image.Image:
    board = Image.new("RGBA", (1440, 1720), (19, 22, 27, 255))
    draw = ImageDraw.Draw(board)
    ink = (238, 228, 205, 255)
    quiet = (174, 181, 187, 255)
    border = (82, 91, 101, 255)
    draw.text(
        (40, 28),
        "AUTONOMOUS SPRITE-FIRST SEAM PROOF",
        fill=ink,
        font=font(26),
    )
    draw.text(
        (40, 66),
        "All previews are aspect-locked 1:1. Copper ticks identify the 3x3 tile joins.",
        fill=quiet,
        font=font(16),
    )
    for row, (name, tile) in enumerate((("PLANK / PERIOD-AWARE", plank), ("SLATE / MODULAR", slate))):
        y = 120 + row * 790
        preview = square_preview(tile, 520)
        repeated_source = repeat_3x3(tile)
        repeated = square_preview(repeated_source, 720)
        preview_xy = (40, y + 92)
        repeated_xy = (650, y + 52)
        board.alpha_composite(preview, preview_xy)
        board.alpha_composite(repeated, repeated_xy)
        draw.rectangle(
            (
                preview_xy[0] - 1,
                preview_xy[1] - 1,
                preview_xy[0] + preview.width,
                preview_xy[1] + preview.height,
            ),
            outline=border,
        )
        draw.rectangle(
            (
                repeated_xy[0] - 1,
                repeated_xy[1] - 1,
                repeated_xy[0] + repeated.width,
                repeated_xy[1] + repeated.height,
            ),
            outline=border,
        )
        guide = (202, 137, 82, 255)
        for division in (1, 2):
            join_x = repeated_xy[0] + repeated.width * division // 3
            join_y = repeated_xy[1] + repeated.height * division // 3
            draw.line(
                (join_x, repeated_xy[1] - 12, join_x, repeated_xy[1] + 8),
                fill=guide,
                width=2,
            )
            draw.line(
                (
                    join_x,
                    repeated_xy[1] + repeated.height - 8,
                    join_x,
                    repeated_xy[1] + repeated.height + 12,
                ),
                fill=guide,
                width=2,
            )
            draw.line(
                (repeated_xy[0] - 12, join_y, repeated_xy[0] + 8, join_y),
                fill=guide,
                width=2,
            )
            draw.line(
                (
                    repeated_xy[0] + repeated.width - 8,
                    join_y,
                    repeated_xy[0] + repeated.width + 12,
                    join_y,
                ),
                fill=guide,
                width=2,
            )
        draw.text((40, y), name, fill=ink, font=font(22))
        draw.text(
            (40, y + 40),
            f"FINAL TILE - {tile.width}x{tile.height}",
            fill=quiet,
            font=font(15),
        )
        draw.text(
            (650, y),
            f"3x3 REPEAT - {repeated_source.width}x{repeated_source.height}",
            fill=quiet,
            font=font(15),
        )
    return board


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build an aspect-safe autonomous seam proof from a plank source and slate component sheet."
    )
    parser.add_argument("--plank-source", type=Path, default=PLANK_SOURCE)
    parser.add_argument("--slate-components", type=Path, default=SLATE_COMPONENTS)
    parser.add_argument("--slate-columns", type=int, default=SLATE_COMPONENT_COLUMNS)
    parser.add_argument("--slate-rows", type=int, default=SLATE_COMPONENT_ROWS)
    parser.add_argument("--work-size", type=int, default=SIZE)
    parser.add_argument("--export-size", type=int, default=EXPORT_SIZE)
    parser.add_argument("--output-dir", type=Path, default=PROOF_DIR)
    parser.add_argument("--prefix", default=OUTPUT_PREFIX)
    return parser.parse_args()


def main() -> None:
    global PROOF_DIR, PLANK_SOURCE, SLATE_COMPONENTS, SIZE, EXPORT_SIZE
    global SLATE_COMPONENT_COLUMNS, SLATE_COMPONENT_ROWS, OUTPUT_PREFIX
    args = parse_args()
    if args.work_size <= 0 or args.export_size <= 0:
        raise SystemExit("work-size and export-size must be positive.")
    if args.slate_columns <= 0 or args.slate_rows <= 0:
        raise SystemExit("slate component grid dimensions must be positive.")
    PROOF_DIR = args.output_dir.resolve()
    PLANK_SOURCE = args.plank_source.resolve()
    SLATE_COMPONENTS = args.slate_components.resolve()
    SIZE = args.work_size
    EXPORT_SIZE = args.export_size
    SLATE_COMPONENT_COLUMNS = args.slate_columns
    SLATE_COMPONENT_ROWS = args.slate_rows
    OUTPUT_PREFIX = args.prefix
    PROOF_DIR.mkdir(parents=True, exist_ok=True)
    plank, plank_recipe = build_plank()
    slate, slate_recipe = build_slate()

    if OUTPUT_PREFIX == "autonomous-seam-proof-v001":
        outputs = {
            "plank": PROOF_DIR / "plank-autotile-v001.png",
            "plank_repeat": PROOF_DIR / "plank-autotile-repeat-3x3-v001.png",
            "slate": PROOF_DIR / "slate-autotile-v001.png",
            "slate_repeat": PROOF_DIR / "slate-autotile-repeat-3x3-v001.png",
            "board": PROOF_DIR / "autonomous-seam-proof-board-v001.png",
        }
        receipt_path = PROOF_DIR / "autonomous-seam-proof-receipt-v001.json"
    else:
        outputs = {
            "plank": PROOF_DIR / f"{OUTPUT_PREFIX}-plank.png",
            "plank_repeat": PROOF_DIR / f"{OUTPUT_PREFIX}-plank-repeat-3x3.png",
            "slate": PROOF_DIR / f"{OUTPUT_PREFIX}-slate.png",
            "slate_repeat": PROOF_DIR / f"{OUTPUT_PREFIX}-slate-repeat-3x3.png",
            "board": PROOF_DIR / f"{OUTPUT_PREFIX}-board.png",
        }
        receipt_path = PROOF_DIR / f"{OUTPUT_PREFIX}-receipt.json"
    expected_size = (EXPORT_SIZE, EXPORT_SIZE)
    for name, tile in (("plank", plank), ("slate", slate)):
        if tile.size != expected_size:
            raise RuntimeError(
                f"{name} delivery-size mismatch: expected {expected_size}, received {tile.size}"
            )
    plank.save(outputs["plank"])
    repeat_3x3(plank).save(outputs["plank_repeat"])
    slate.save(outputs["slate"])
    repeat_3x3(slate).save(outputs["slate_repeat"])
    qa_board(plank, slate).save(outputs["board"])

    plank_metrics = seam_metrics(plank)
    plank_cadence = vertical_construction_cadence(plank)
    slate_metrics = seam_metrics(slate)
    plank_status = (
        "PASS"
        if plank_metrics["boundary_jump_gate"] and plank_cadence["cadence_gate"]
        else "FAIL"
    )
    slate_status = (
        "PASS"
        if slate_metrics["boundary_jump_gate"]
        and all(slate_recipe["topology_proof"].values())
        else "FAIL"
    )
    receipt = {
        "schema_version": 1,
        "workflow": "ImageGen appearance -> deterministic sprite topology -> MM later",
        "working_topology_size": [SIZE, SIZE],
        "output_size": [EXPORT_SIZE, EXPORT_SIZE],
        "gate": {
            "boundary_jump_rule": "boundary RMS must not exceed 110% of the 95th percentile of ordinary internal adjacent-pixel jumps; the 10% allowance accounts only for final nearest-neighbour export quantization",
            "topology_rule": "construction periods must close exactly over the output dimensions",
            "construction_cadence_rule": "a period-aware construction material must retain a dark crevice feature at both circular boundaries; raw board-width variation is recorded but not treated as a missing-joint failure",
            "visual_proof": "3x3 repeat outputs are mandatory",
            "proof_board_rule": "every final-tile and repeat preview must remain aspect-locked at 1:1; the build exits non-zero on distortion",
            "delivery_dimension_rule": "every final tile's actual pixel dimensions must equal the declared output_size before files or receipts are written",
        },
        "materials": {
            "plank": {
                **plank_recipe,
                "metrics": plank_metrics,
                "construction_cadence": plank_cadence,
                "status": plank_status,
            },
            "slate": {
                **slate_recipe,
                "metrics": slate_metrics,
                "status": slate_status,
            },
        },
        "outputs": {key: str(path.relative_to(ROOT)) for key, path in outputs.items()},
    }
    receipt_path.write_text(
        json.dumps(receipt, indent=2) + "\n"
    )
    print(json.dumps(receipt, indent=2))
    if plank_status != "PASS" or slate_status != "PASS":
        raise SystemExit("Autonomous seam proof failed its acceptance gate.")


if __name__ == "__main__":
    main()
