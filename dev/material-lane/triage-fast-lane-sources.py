#!/usr/bin/env python3
"""Triage selected sprite-first material candidates before MM derivation.

It measures both wrapped boundaries against ordinary internal pixel transitions,
renders a locked-aspect 3x3 repeat, and writes one batch receipt.  A failed
candidate is never silently promoted.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "dev/material-lane/source-sprites/b01-fast-lane-v001"
PROOF_DIR = ROOT / "dev/material-lane/proofs/b01-fast-lane-v001"
BOARD_PATH = PROOF_DIR / "b01-fast-lane-selected-candidates-v002.png"
RECEIPT_PATH = PROOF_DIR / "b01-fast-lane-selected-candidates-v002.json"

SOURCES = (
    (
        "Structural timber grain",
        "timber-structural-grain-seamlocked-v001.png",
        "ImageGen v001 + narrow continuous-field toroidal edge lock",
    ),
    (
        "Roof thatch",
        "roof-thatch-source-v002.png",
        "ImageGen prompt retry with explicit eight-course period",
    ),
    ("Roof turf / sod", "roof-turf-sod-source-v001.png", "raw ImageGen pass"),
    (
        "Roof hide / canvas",
        "roof-hide-canvas-tarp-source-v001.png",
        "raw ImageGen pass",
    ),
)


def rms(delta: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(delta.astype(np.float32)))))


def seam_metrics(image: Image.Image) -> dict[str, float | bool]:
    arr = np.asarray(image.convert("RGB"), dtype=np.float32)
    x_jumps = np.sqrt(np.mean(np.square(arr[:, 1:] - arr[:, :-1]), axis=(0, 2)))
    y_jumps = np.sqrt(np.mean(np.square(arr[1:] - arr[:-1]), axis=(1, 2)))
    x_boundary = rms(arr[:, 0] - arr[:, -1])
    y_boundary = rms(arr[0] - arr[-1])
    x_p95 = float(np.percentile(x_jumps, 95))
    y_p95 = float(np.percentile(y_jumps, 95))
    x_ratio = x_boundary / max(x_p95, 0.001)
    y_ratio = y_boundary / max(y_p95, 0.001)
    return {
        "left_right_rms": round(x_boundary, 3),
        "top_bottom_rms": round(y_boundary, 3),
        "internal_x_jump_p95": round(x_p95, 3),
        "internal_y_jump_p95": round(y_p95, 3),
        "x_boundary_to_internal_p95": round(x_ratio, 3),
        "y_boundary_to_internal_p95": round(y_ratio, 3),
        "boundary_jump_gate": bool(x_ratio <= 1.10 and y_ratio <= 1.10),
    }


def repeat_3x3(image: Image.Image) -> Image.Image:
    tile = image.convert("RGB")
    repeated = Image.new("RGB", (tile.width * 3, tile.height * 3))
    for row in range(3):
        for column in range(3):
            repeated.paste(tile, (column * tile.width, row * tile.height))
    return repeated


def fit(image: Image.Image, box: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(image, box, method=Image.Resampling.NEAREST)


def build_board(results: list[dict[str, object]]) -> None:
    width = 1680
    row_height = 470
    header_height = 120
    board = Image.new("RGB", (width, header_height + row_height * len(results)), "#151922")
    draw = ImageDraw.Draw(board)
    font = ImageFont.load_default()
    draw.text((36, 26), "B01 DIRECT-SPRITE FAST LANE — SELECTED CANDIDATES", fill="#f4ead7", font=font)
    draw.text(
        (36, 56),
        "Left: selected complete sprite.  Right: locked-aspect 3x3 repeat.  No Material Maker channels.",
        fill="#aeb8c8",
        font=font,
    )
    draw.text(
        (36, 82),
        "Boundary gate: each wrapped edge jump <= 1.10x the source's 95th-percentile internal transition.",
        fill="#aeb8c8",
        font=font,
    )

    for index, result in enumerate(results):
        top = header_height + index * row_height
        image = Image.open(ROOT / str(result["source"])).convert("RGB")
        metrics = result["metrics"]
        passed = bool(metrics["boundary_jump_gate"])
        status_color = "#70d890" if passed else "#ffb15c"
        draw.rectangle((0, top, width, top + row_height), fill="#1b202a" if index % 2 == 0 else "#171c25")
        draw.text((36, top + 24), str(result["label"]), fill="#f4ead7", font=font)
        draw.text(
            (36, top + 52),
            "TECH PASS" if passed else "REJECT",
            fill=status_color,
            font=font,
        )
        draw.text(
            (36, top + 82),
            (
                f"X boundary {metrics['x_boundary_to_internal_p95']:.2f}x p95   "
                f"Y boundary {metrics['y_boundary_to_internal_p95']:.2f}x p95"
            ),
            fill="#ccd3df",
            font=font,
        )
        draw.text((36, top + 112), "Single field", fill="#7f8a9b", font=font)
        draw.text((392, top + 112), "3x3 repeat", fill="#7f8a9b", font=font)

        single = fit(image, (300, 300))
        repeated = fit(repeat_3x3(image), (900, 300))
        board.paste(single, (36, top + 136))
        board.paste(repeated, (392, top + 136))

        # Mark the true tile joins without changing the source previews.
        join_x = (392 + 300, 392 + 600)
        for x in join_x:
            draw.line((x, top + 136, x, top + 435), fill="#ec5f67", width=1)
        draw.line((392, top + 236, 1291, top + 236), fill="#ec5f67", width=1)
        draw.line((392, top + 336, 1291, top + 336), fill="#ec5f67", width=1)

    BOARD_PATH.parent.mkdir(parents=True, exist_ok=True)
    board.save(BOARD_PATH)


def main() -> None:
    PROOF_DIR.mkdir(parents=True, exist_ok=True)
    results: list[dict[str, object]] = []
    for label, filename, method in SOURCES:
        source = SOURCE_DIR / filename
        image = Image.open(source).convert("RGB")
        results.append(
            {
                "label": label,
                "source": str(source.relative_to(ROOT)),
                "candidate_method": method,
                "dimensions": list(image.size),
                "metrics": seam_metrics(image),
            }
        )

    build_board(results)
    receipt = {
        "schema": "genesis.material-source-fast-lane-triage.v1",
        "policy": {
            "material_maker_applied": False,
            "boundary_gate_ratio": 1.10,
            "failed_route": "reject; never silent promotion",
        },
        "board": str(BOARD_PATH.relative_to(ROOT)),
        "results": results,
    }
    RECEIPT_PATH.write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt, indent=2))


if __name__ == "__main__":
    main()
