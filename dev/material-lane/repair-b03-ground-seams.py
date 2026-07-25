#!/usr/bin/env python3
"""Apply declared narrow toroidal locks to mildly failing B03 ground fields."""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "dev/material-lane/source-sprites/b03-exterior-ground-v001"
PROOF_DIR = ROOT / "dev/material-lane/proofs/b03-exterior-ground-v001"
JOBS = (
    ("grass-meadow", "grass-meadow-source-v001.png", 48),
    ("mud", "mud-source-v001.png", 32),
    ("gravel-scree", "gravel-scree-source-v001.png", 32),
    ("marsh-bog", "marsh-bog-source-v001.png", 40),
)


def rms(delta: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(delta.astype(np.float32)))))


def metrics(array: np.ndarray) -> dict[str, float | bool]:
    rgb = array[:, :, :3].astype(np.float32)
    x_jumps = np.sqrt(np.mean(np.square(rgb[:, 1:] - rgb[:, :-1]), axis=(0, 2)))
    y_jumps = np.sqrt(np.mean(np.square(rgb[1:] - rgb[:-1]), axis=(1, 2)))
    x_boundary = rms(rgb[:, 0] - rgb[:, -1])
    y_boundary = rms(rgb[0] - rgb[-1])
    x_ratio = x_boundary / max(float(np.percentile(x_jumps, 95)), 0.001)
    y_ratio = y_boundary / max(float(np.percentile(y_jumps, 95)), 0.001)
    return {
        "xBoundaryToInternalP95": round(x_ratio, 3),
        "yBoundaryToInternalP95": round(y_ratio, 3),
        "boundaryJumpGate": bool(x_ratio <= 1.10 and y_ratio <= 1.10),
    }


def lock_axis(array: np.ndarray, axis: int, band: int) -> np.ndarray:
    result = np.swapaxes(array.astype(np.float32).copy(), axis, 0)
    length = result.shape[0]
    for offset in range(band):
        preserve = 0.5 - 0.5 * math.cos(math.pi * offset / (band - 1))
        near = result[offset].copy()
        far = result[length - 1 - offset].copy()
        shared = (near + far) * 0.5
        result[offset] = shared * (1 - preserve) + near * preserve
        result[length - 1 - offset] = shared * (1 - preserve) + far * preserve
    return np.swapaxes(result, 0, axis)


def make_repeat(tile: Image.Image, output: Path) -> None:
    repeated = Image.new("RGB", (tile.width * 3, tile.height * 3))
    for row in range(3):
        for column in range(3):
            repeated.paste(tile, (column * tile.width, row * tile.height))
    repeated.save(output)


def main() -> None:
    PROOF_DIR.mkdir(parents=True, exist_ok=True)
    for material_id, filename, band in JOBS:
        source = SOURCE_DIR / filename
        before = np.asarray(Image.open(source).convert("RGB"))
        repaired = lock_axis(lock_axis(before, axis=1, band=band), axis=0, band=band)
        after = np.uint8(np.clip(np.rint(repaired), 0, 255))
        output = SOURCE_DIR / f"{material_id}-seamlocked-v001.png"
        repeat = PROOF_DIR / f"{material_id}-seamlocked-v001-repeat-3x3.png"
        receipt = PROOF_DIR / f"{material_id}-seamlocked-v001.json"
        tile = Image.fromarray(after)
        tile.save(output)
        make_repeat(tile, repeat)
        record = {
            "schema": "genesis.material-source-seam-repair.v1",
            "materialId": material_id,
            "source": str(source.relative_to(ROOT)),
            "output": str(output.relative_to(ROOT)),
            "repeat": str(repeat.relative_to(ROOT)),
            "method": "opposite-edge pair average with inward cosine feather",
            "repairBandPixels": band,
            "repairBandFractionPerEdge": round(band / before.shape[0], 4),
            "declaredScope": "continuous non-periodic top-down ground field; visual field-integrity review required",
            "before": metrics(before),
            "after": metrics(after),
        }
        receipt.write_text(json.dumps(record, indent=2) + "\n")
        print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
