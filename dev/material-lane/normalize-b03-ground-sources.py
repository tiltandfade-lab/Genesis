#!/usr/bin/env python3
"""Normalize selected B03 ground sprites to the pinned 512px delivery size."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "dev/material-lane/source-sprites/b03-exterior-ground-v001"
RECEIPT = ROOT / "dev/material-lane/proofs/b03-exterior-ground-v001/b03-source-normalization-v001.json"
SOURCES = (
    ("grass-meadow", "grass-meadow-seamlocked-v001.png"),
    ("worn-path", "worn-path-source-v001.png"),
    ("mud", "mud-seamlocked-v001.png"),
    ("gravel-scree", "gravel-scree-seamlocked-v001.png"),
    ("marsh-bog", "marsh-bog-seamlocked-v001.png"),
)
SIZE = 512


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    records = []
    for material_id, filename in SOURCES:
        source = SOURCE_DIR / filename
        output = SOURCE_DIR / f"{material_id}-selected-v001.png"
        image = Image.open(source).convert("RGB")
        normalized = image.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
        normalized.save(output)
        records.append(
            {
                "id": material_id,
                "source": str(source.relative_to(ROOT)),
                "sourceSha256": sha256(source),
                "sourceDimensions": list(image.size),
                "output": str(output.relative_to(ROOT)),
                "outputSha256": sha256(output),
                "outputDimensions": list(normalized.size),
                "method": "square-preserving Lanczos normalization to pinned 512px delivery size",
            }
        )
    RECEIPT.parent.mkdir(parents=True, exist_ok=True)
    RECEIPT.write_text(
        json.dumps(
            {
                "schema": "genesis.material-source-normalization.v1",
                "targetDimensions": [SIZE, SIZE],
                "records": records,
            },
            indent=2,
        )
        + "\n"
    )
    print(f"Normalized {len(records)} B03 sources to {SIZE}px.")


if __name__ == "__main__":
    main()
