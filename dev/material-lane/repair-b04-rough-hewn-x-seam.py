#!/usr/bin/env python3
"""Color-lock the aligned X boundary of the B04 rough-hewn masonry retry."""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "dev/material-lane/source-sprites/b04-masonry-interior-v001"
PROOF_DIR = ROOT / "dev/material-lane/proofs/b04-masonry-interior-v001"
BAND = 32


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


def main() -> None:
    PROOF_DIR.mkdir(parents=True, exist_ok=True)
    source = SOURCE_DIR / "wall-rough-hewn-block-source-v002.png"
    output = SOURCE_DIR / "wall-rough-hewn-block-seamlocked-v001.png"
    repeat = PROOF_DIR / "wall-rough-hewn-block-seamlocked-v001-repeat-3x3.png"
    receipt = PROOF_DIR / "wall-rough-hewn-block-seamlocked-v001.json"
    before = np.asarray(Image.open(source).convert("RGB"))
    after = before.astype(np.float32).copy()
    width = after.shape[1]
    for offset in range(BAND):
        preserve = 0.5 - 0.5 * math.cos(math.pi * offset / (BAND - 1))
        left = after[:, offset].copy()
        right = after[:, width - 1 - offset].copy()
        shared = (left + right) * 0.5
        after[:, offset] = shared * (1 - preserve) + left * preserve
        after[:, width - 1 - offset] = shared * (1 - preserve) + right * preserve
    after = np.uint8(np.clip(np.rint(after), 0, 255))
    tile = Image.fromarray(after)
    tile.save(output)
    repeated = Image.new("RGB", (tile.width * 3, tile.height * 3))
    for row in range(3):
        for column in range(3):
            repeated.paste(tile, (column * tile.width, row * tile.height))
    repeated.save(repeat)
    record = {
        "schema": "genesis.material-source-seam-repair.v1",
        "materialId": "wall-rough-hewn-block",
        "source": str(source.relative_to(ROOT)),
        "output": str(output.relative_to(ROOT)),
        "repeat": str(repeat.relative_to(ROOT)),
        "method": "X-only opposite-edge color average with inward cosine feather",
        "repairBandPixels": BAND,
        "repairBandFractionPerEdge": round(BAND / before.shape[1], 4),
        "declaredScope": "period-aligned masonry retry; color continuity only, joints preserved",
        "before": metrics(before),
        "after": metrics(after),
    }
    receipt.write_text(json.dumps(record, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
