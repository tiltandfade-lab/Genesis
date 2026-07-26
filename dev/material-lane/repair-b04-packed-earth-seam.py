#!/usr/bin/env python3
"""Apply a declared narrow toroidal lock to the mildly failing packed-earth field."""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "dev/material-lane/source-sprites/b04-masonry-interior-v001"
PROOF_DIR = ROOT / "dev/material-lane/proofs/b04-masonry-interior-v001"
BAND = 24


def rms(delta: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(delta.astype(np.float32)))))


def metrics(array: np.ndarray) -> dict[str, float | bool]:
    rgb = array[:, :, :3].astype(np.float32)
    x_jumps = np.sqrt(np.mean(np.square(rgb[:, 1:] - rgb[:, :-1]), axis=(0, 2)))
    y_jumps = np.sqrt(np.mean(np.square(rgb[1:] - rgb[:-1]), axis=(1, 2)))
    x_ratio = rms(rgb[:, 0] - rgb[:, -1]) / max(float(np.percentile(x_jumps, 95)), 0.001)
    y_ratio = rms(rgb[0] - rgb[-1]) / max(float(np.percentile(y_jumps, 95)), 0.001)
    return {
        "xBoundaryToInternalP95": round(x_ratio, 3),
        "yBoundaryToInternalP95": round(y_ratio, 3),
        "boundaryJumpGate": bool(x_ratio <= 1.10 and y_ratio <= 1.10),
    }


def lock_axis(array: np.ndarray, axis: int) -> np.ndarray:
    result = np.swapaxes(array.astype(np.float32).copy(), axis, 0)
    length = result.shape[0]
    for offset in range(BAND):
        preserve = 0.5 - 0.5 * math.cos(math.pi * offset / (BAND - 1))
        near = result[offset].copy()
        far = result[length - 1 - offset].copy()
        shared = (near + far) * 0.5
        result[offset] = shared * (1 - preserve) + near * preserve
        result[length - 1 - offset] = shared * (1 - preserve) + far * preserve
    return np.swapaxes(result, 0, axis)


def main() -> None:
    PROOF_DIR.mkdir(parents=True, exist_ok=True)
    source = SOURCE_DIR / "floor-packed-earth-source-v001.png"
    output = SOURCE_DIR / "floor-packed-earth-seamlocked-v001.png"
    repeat = PROOF_DIR / "floor-packed-earth-seamlocked-v001-repeat-3x3.png"
    receipt = PROOF_DIR / "floor-packed-earth-seamlocked-v001.json"
    before = np.asarray(Image.open(source).convert("RGB"))
    after = np.uint8(np.clip(np.rint(lock_axis(lock_axis(before, 1), 0)), 0, 255))
    tile = Image.fromarray(after)
    tile.save(output)
    repeated = Image.new("RGB", (tile.width * 3, tile.height * 3))
    for row in range(3):
        for column in range(3):
            repeated.paste(tile, (column * tile.width, row * tile.height))
    repeated.save(repeat)
    record = {
        "schema": "genesis.material-source-seam-repair.v1",
        "materialId": "floor-packed-earth",
        "source": str(source.relative_to(ROOT)),
        "output": str(output.relative_to(ROOT)),
        "repeat": str(repeat.relative_to(ROOT)),
        "method": "opposite-edge pair average with inward cosine feather",
        "repairBandPixels": BAND,
        "repairBandFractionPerEdge": round(BAND / before.shape[0], 4),
        "declaredScope": "continuous non-periodic top-down packed-earth field",
        "before": metrics(before),
        "after": metrics(after),
    }
    receipt.write_text(json.dumps(record, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
