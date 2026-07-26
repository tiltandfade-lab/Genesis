#!/usr/bin/env python3
"""Apply a narrow, deterministic toroidal edge lock to structural timber.

This is the fast-lane fallback for a visually good continuous field whose raw
ImageGen boundaries narrowly miss the seam gate.  It is deliberately unsuitable
for construction-period materials such as shingles, slate, or coursed masonry.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = (
    ROOT
    / "dev/material-lane/source-sprites/b01-fast-lane-v001"
    / "timber-structural-grain-source-v001.png"
)
OUTPUT = (
    ROOT
    / "dev/material-lane/source-sprites/b01-fast-lane-v001"
    / "timber-structural-grain-seamlocked-v001.png"
)
RECEIPT = (
    ROOT
    / "dev/material-lane/proofs/b01-fast-lane-v001"
    / "timber-structural-grain-seamlocked-v001.json"
)
BAND = 48


def rms(delta: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(delta.astype(np.float32)))))


def metrics(arr: np.ndarray) -> dict[str, float | bool]:
    rgb = arr[:, :, :3].astype(np.float32)
    x_jumps = np.sqrt(np.mean(np.square(rgb[:, 1:] - rgb[:, :-1]), axis=(0, 2)))
    y_jumps = np.sqrt(np.mean(np.square(rgb[1:] - rgb[:-1]), axis=(1, 2)))
    x_boundary = rms(rgb[:, 0] - rgb[:, -1])
    y_boundary = rms(rgb[0] - rgb[-1])
    x_p95 = float(np.percentile(x_jumps, 95))
    y_p95 = float(np.percentile(y_jumps, 95))
    x_ratio = x_boundary / max(x_p95, 0.001)
    y_ratio = y_boundary / max(y_p95, 0.001)
    return {
        "x_boundary_to_internal_p95": round(x_ratio, 3),
        "y_boundary_to_internal_p95": round(y_ratio, 3),
        "boundary_jump_gate": bool(x_ratio <= 1.10 and y_ratio <= 1.10),
    }


def lock_axis(arr: np.ndarray, axis: int, band: int) -> np.ndarray:
    """Make opposite edges identical, feathering inward with a cosine ramp."""

    out = np.swapaxes(arr.astype(np.float32).copy(), axis, 0)
    length = out.shape[0]
    for offset in range(band):
        preserve = 0.5 - 0.5 * math.cos(math.pi * offset / (band - 1))
        near = out[offset].copy()
        far = out[length - 1 - offset].copy()
        shared = (near + far) * 0.5
        out[offset] = shared * (1.0 - preserve) + near * preserve
        out[length - 1 - offset] = shared * (1.0 - preserve) + far * preserve
    return np.swapaxes(out, 0, axis)


def main() -> None:
    before = np.asarray(Image.open(SOURCE).convert("RGB"))
    repaired = lock_axis(before, axis=1, band=BAND)
    repaired = lock_axis(repaired, axis=0, band=BAND)
    after = np.clip(np.rint(repaired), 0, 255).astype(np.uint8)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(after).save(OUTPUT)

    receipt = {
        "schema": "genesis.material-source-seam-repair.v1",
        "source": str(SOURCE.relative_to(ROOT)),
        "output": str(OUTPUT.relative_to(ROOT)),
        "method": "opposite-edge pair average with inward cosine feather",
        "repair_band_pixels": BAND,
        "repair_band_fraction_per_edge": round(BAND / before.shape[0], 4),
        "construction_safe_scope": "continuous non-periodic fields only",
        "before": metrics(before),
        "after": metrics(after),
    }
    RECEIPT.parent.mkdir(parents=True, exist_ok=True)
    RECEIPT.write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt, indent=2))


if __name__ == "__main__":
    main()
