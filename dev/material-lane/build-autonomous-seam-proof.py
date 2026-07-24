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

import json
import math
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
        "boundary_jump_gate": bool(x_boundary <= x_p95 and y_boundary <= y_p95),
    }


def best_crop_origin(arr: np.ndarray, target: int) -> tuple[int, int]:
    """Find a crop whose opposing border neighborhoods already match well."""

    height, width = arr.shape[:2]
    max_x = width - target
    max_y = height - target

    def x_cost(x: int) -> float:
        left = arr[:, x : x + 8]
        right = arr[:, x + target - 8 : x + target][:, ::-1]
        return rms(left - right)

    def y_cost(y: int) -> float:
        top = arr[y : y + 8]
        bottom = arr[y + target - 8 : y + target][::-1]
        return rms(top - bottom)

    x = min(range(max_x + 1), key=x_cost)
    y = min(range(max_y + 1), key=y_cost)
    return x, y


def lock_opposing_edges(arr: np.ndarray, band: int = 64) -> np.ndarray:
    """Blend opposing border pairs to one shared edge without touching the core."""

    out = arr.astype(np.float32).copy()
    height, width = out.shape[:2]

    for i in range(band):
        keep = 0.5 - 0.5 * math.cos(math.pi * i / (band - 1))
        left = out[:, i].copy()
        right = out[:, width - 1 - i].copy()
        shared = (left + right) * 0.5
        out[:, i] = shared * (1.0 - keep) + left * keep
        out[:, width - 1 - i] = shared * (1.0 - keep) + right * keep

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
    target = 1024
    x, y = best_crop_origin(arr[:, :, :3], target)
    crop = arr[y : y + target, x : x + target]
    locked = lock_opposing_edges(crop, band=64)
    tile = Image.fromarray(locked).resize((SIZE, SIZE), Image.Resampling.NEAREST)
    return tile, {
        "method": "best-phase crop plus deterministic opposing-edge lock",
        "source": str(PLANK_SOURCE.relative_to(ROOT)),
        "crop": {"x": x, "y": y, "width": target, "height": target},
        "repair_band_source_pixels": 64,
    }


def extract_slate_components() -> list[Image.Image]:
    sheet = rgba(SLATE_COMPONENTS)
    half_w = sheet.width // 2
    half_h = sheet.height // 2
    components: list[Image.Image] = []
    for row in range(2):
        for col in range(2):
            quadrant = sheet.crop(
                (col * half_w, row * half_h, (col + 1) * half_w, (row + 1) * half_h)
            )
            alpha = quadrant.getchannel("A")
            bbox = alpha.point(lambda value: 255 if value >= 24 else 0).getbbox()
            if bbox is None:
                raise RuntimeError(f"No slate component found in quadrant {row},{col}")
            components.append(quadrant.crop(bbox))
    return components


def place_wrapped(canvas: Image.Image, sprite: Image.Image, x: int, y: int) -> None:
    width, height = canvas.size
    for dx in (-width, 0, width):
        for dy in (-height, 0, height):
            canvas.alpha_composite(sprite, (x + dx, y + dy))


def build_slate() -> tuple[Image.Image, dict[str, object]]:
    components = extract_slate_components()
    prepared = [
        ImageOps.contain(component, (102, 92), Image.Resampling.NEAREST)
        for component in components
    ]
    canvas = Image.new("RGBA", (SIZE, SIZE), (27, 38, 50, 255))
    x_step = 96
    y_step = 72
    columns = SIZE // x_step
    rows = SIZE // y_step

    # Bottom-to-top draw order preserves a coherent shingle overlap while the
    # modulo variant pattern closes over both dimensions.
    for row in reversed(range(-2, rows + 2)):
        offset = x_step // 2 if row % 2 else 0
        for col in range(-2, columns + 2):
            component = prepared[(row % 2) * 2 + (col % 2)]
            x = col * x_step + offset + (x_step - component.width) // 2
            y = row * y_step + (y_step - component.height) // 2
            place_wrapped(canvas, component, x, y)

    return canvas, {
        "method": "four ImageGen sprite units assembled on an exact toroidal grid",
        "component_sheet": str(SLATE_COMPONENTS.relative_to(ROOT)),
        "grid": {
            "canvas": [SIZE, SIZE],
            "x_step": x_step,
            "y_step": y_step,
            "columns": columns,
            "rows": rows,
            "stagger": x_step // 2,
        },
        "topology_proof": {
            "width_divisible_by_x_step": SIZE % x_step == 0,
            "height_divisible_by_y_step": SIZE % y_step == 0,
            "row_count_preserves_two-row_variant_period": rows % 2 == 0,
            "column_count_preserves_two-column_variant_period": columns % 2 == 0,
        },
    }


def repeat_3x3(tile: Image.Image) -> Image.Image:
    repeated = Image.new("RGBA", (tile.width * 3, tile.height * 3))
    for row in range(3):
        for col in range(3):
            repeated.alpha_composite(tile, (col * tile.width, row * tile.height))
    return repeated


def label(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str) -> None:
    draw.text(xy, text, fill=(238, 228, 205, 255), font=ImageFont.load_default())


def qa_board(plank: Image.Image, slate: Image.Image) -> Image.Image:
    board = Image.new("RGBA", (1600, 900), (19, 22, 27, 255))
    draw = ImageDraw.Draw(board)
    label(draw, (40, 24), "AUTONOMOUS SPRITE-FIRST SEAM PROOF — final tile + 3x3 repeat")
    for row, (name, tile) in enumerate((("PLANK / WRAP-REPAIR", plank), ("SLATE / MODULAR", slate))):
        y = 70 + row * 410
        preview = tile.resize((330, 330), Image.Resampling.NEAREST)
        repeat = repeat_3x3(tile).resize((990, 330), Image.Resampling.NEAREST)
        board.alpha_composite(preview, (40, y + 34))
        board.alpha_composite(repeat, (410, y + 34))
        label(draw, (40, y), name)
        label(draw, (410, y), "3x3 repeat")
    return board


def main() -> None:
    PROOF_DIR.mkdir(parents=True, exist_ok=True)
    plank, plank_recipe = build_plank()
    slate, slate_recipe = build_slate()

    outputs = {
        "plank": PROOF_DIR / "plank-autotile-v001.png",
        "plank_repeat": PROOF_DIR / "plank-autotile-repeat-3x3-v001.png",
        "slate": PROOF_DIR / "slate-autotile-v001.png",
        "slate_repeat": PROOF_DIR / "slate-autotile-repeat-3x3-v001.png",
        "board": PROOF_DIR / "autonomous-seam-proof-board-v001.png",
    }
    plank.save(outputs["plank"])
    repeat_3x3(plank).save(outputs["plank_repeat"])
    slate.save(outputs["slate"])
    repeat_3x3(slate).save(outputs["slate_repeat"])
    qa_board(plank, slate).save(outputs["board"])

    plank_metrics = seam_metrics(plank)
    slate_metrics = seam_metrics(slate)
    plank_status = "PASS" if plank_metrics["boundary_jump_gate"] else "FAIL"
    slate_status = (
        "PASS"
        if slate_metrics["boundary_jump_gate"]
        and all(slate_recipe["topology_proof"].values())
        else "FAIL"
    )
    receipt = {
        "schema_version": 1,
        "workflow": "ImageGen appearance -> deterministic sprite topology -> MM later",
        "output_size": [SIZE, SIZE],
        "gate": {
            "boundary_jump_rule": "boundary RMS must not exceed the 95th percentile of ordinary internal adjacent-pixel jumps",
            "topology_rule": "construction periods must close exactly over the output dimensions",
            "visual_proof": "3x3 repeat outputs are mandatory",
        },
        "materials": {
            "plank": {
                **plank_recipe,
                "metrics": plank_metrics,
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
    (PROOF_DIR / "autonomous-seam-proof-receipt-v001.json").write_text(
        json.dumps(receipt, indent=2) + "\n"
    )
    print(json.dumps(receipt, indent=2))
    if plank_status != "PASS" or slate_status != "PASS":
        raise SystemExit("Autonomous seam proof failed its acceptance gate.")


if __name__ == "__main__":
    main()
