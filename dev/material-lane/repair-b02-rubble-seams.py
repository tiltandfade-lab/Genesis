#!/usr/bin/env python3
"""Narrow continuous-field seam repair for the B02 irregular rubble candidate."""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "dev/material-lane/source-sprites/b02-deck-edge-v001/upland-fitted-rubble-upstand-source-v001.png"
OUTPUT = ROOT / "dev/material-lane/source-sprites/b02-deck-edge-v001/upland-fitted-rubble-upstand-seamlocked-v001.png"
RECEIPT = ROOT / "dev/material-lane/proofs/b02-deck-edge-v001/upland-fitted-rubble-upstand-seamlocked-v001.json"
REPEAT = ROOT / "dev/material-lane/proofs/b02-deck-edge-v001/upland-fitted-rubble-upstand-seamlocked-v001-repeat-3x3.png"
BAND = 32


def rms(delta: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(delta.astype(np.float32)))))


def metrics(arr: np.ndarray) -> dict[str, float | bool]:
    rgb = arr[:, :, :3].astype(np.float32)
    x_jumps = np.sqrt(np.mean(np.square(rgb[:, 1:] - rgb[:, :-1]), axis=(0, 2)))
    y_jumps = np.sqrt(np.mean(np.square(rgb[1:] - rgb[:-1]), axis=(1, 2)))
    x_boundary = rms(rgb[:, 0] - rgb[:, -1])
    y_boundary = rms(rgb[0] - rgb[-1])
    x_ratio = x_boundary / max(float(np.percentile(x_jumps, 95)), 0.001)
    y_ratio = y_boundary / max(float(np.percentile(y_jumps, 95)), 0.001)
    return {
        "x_boundary_to_internal_p95": round(x_ratio, 3),
        "y_boundary_to_internal_p95": round(y_ratio, 3),
        "boundary_jump_gate": bool(x_ratio <= 1.10 and y_ratio <= 1.10),
    }


def lock_axis(arr: np.ndarray, axis: int) -> np.ndarray:
    out = np.swapaxes(arr.astype(np.float32).copy(), axis, 0)
    length = out.shape[0]
    for offset in range(BAND):
        preserve = 0.5 - 0.5 * math.cos(math.pi * offset / (BAND - 1))
        near = out[offset].copy()
        far = out[length - 1 - offset].copy()
        shared = (near + far) * 0.5
        out[offset] = shared * (1 - preserve) + near * preserve
        out[length - 1 - offset] = shared * (1 - preserve) + far * preserve
    return np.swapaxes(out, 0, axis)


def main() -> None:
    before = np.asarray(Image.open(SOURCE).convert("RGB"))
    repaired = lock_axis(lock_axis(before, axis=1), axis=0)
    after = np.uint8(np.clip(np.rint(repaired), 0, 255))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    tile = Image.fromarray(after)
    tile.save(OUTPUT)
    repeated = Image.new("RGB", (tile.width * 3, tile.height * 3))
    for row in range(3):
        for column in range(3):
            repeated.paste(tile, (column * tile.width, row * tile.height))
    REPEAT.parent.mkdir(parents=True, exist_ok=True)
    repeated.save(REPEAT)
    record = {
        "schema": "genesis.material-source-seam-repair.v1",
        "materialId": "upland-fitted-rubble-upstand",
        "source": str(SOURCE.relative_to(ROOT)),
        "output": str(OUTPUT.relative_to(ROOT)),
        "repeat": str(REPEAT.relative_to(ROOT)),
        "method": "opposite-edge pair average with inward cosine feather",
        "repairBandPixels": BAND,
        "repairBandFractionPerEdge": round(BAND / before.shape[0], 4),
        "declaredScope": "irregular non-periodic fitted-stone field; visual joint-integrity review required",
        "rejectedAlternative": "modular component rescue v001-v002 passed topology but failed fitted-density taste",
        "before": metrics(before),
        "after": metrics(after),
    }
    RECEIPT.parent.mkdir(parents=True, exist_ok=True)
    RECEIPT.write_text(json.dumps(record, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
