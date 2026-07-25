#!/usr/bin/env python3
"""Freeze accepted B04 sprite sources at the pinned 512px MM input size."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "dev/material-lane/source-sprites/b04-masonry-interior-v001"
PROOF_DIR = ROOT / "dev/material-lane/proofs/b04-masonry-interior-v001"
JOBS = (
    ("wall-ashlar-dressed-parent-v001.png", "wall-ashlar-dressed-selected-v001.png"),
    ("wall-rough-hewn-block-seamlocked-v001.png", "wall-rough-hewn-block-selected-v001.png"),
    ("wall-dry-stack-fieldstone-source-v001.png", "wall-dry-stack-fieldstone-selected-v001.png"),
    ("wall-brick-source-v002.png", "wall-brick-selected-v001.png"),
    ("wall-plastered-rubble-source-v001.png", "wall-plastered-rubble-selected-v001.png"),
    ("floor-flagstone-source-v001.png", "floor-flagstone-selected-v001.png"),
    ("floor-plank-source-v001.png", "floor-plank-selected-v001.png"),
    ("floor-packed-earth-seamlocked-v001.png", "floor-packed-earth-selected-v001.png"),
    ("floor-cobble-source-v001.png", "floor-cobble-selected-v001.png"),
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    records = []
    for source_name, output_name in JOBS:
        source = SOURCE_DIR / source_name
        output = SOURCE_DIR / output_name
        image = Image.open(source).convert("RGB")
        image.resize((512, 512), Image.Resampling.HAMMING).save(output)
        records.append({
            "source": str(source.relative_to(ROOT)),
            "sourceDimensions": list(image.size),
            "sourceSha256": sha256(source),
            "output": str(output.relative_to(ROOT)),
            "outputDimensions": [512, 512],
            "outputSha256": sha256(output),
            "filter": "Pillow HAMMING",
        })
    receipt = PROOF_DIR / "b04-source-normalization-v001.json"
    receipt.write_text(json.dumps({
        "schema": "genesis.material-source-normalization.v1",
        "targetDimensions": [512, 512],
        "records": records,
    }, indent=2) + "\n")
    print(f"Normalized {len(records)} selected B04 sources.")


if __name__ == "__main__":
    main()
