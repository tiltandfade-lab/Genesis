#!/usr/bin/env python3
"""Prepare the Golden Site 1 v003 ground pair without redrawing its sprite albedo.

The v002 ImageGen road already passes the boundary/internal edge gate and is only normalized.
The v002 turf misses mildly on both axes, so it receives the same declared narrow continuous-field
cosine lock proven by B03 before normalization. Originals remain untouched.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/materials/golden/guard-post/v002"
OUTPUT = ROOT / "assets/materials/golden/guard-post/v003"
PROOF = ROOT / "dev/material-lane/proofs/guard-post-ground-v003"
SIZE = 512
TURF_REPAIR_BAND = 48

JOBS = (
    {
        "id": "ground-upland-turf",
        "source": "ground-upland-turf-imagegen-candidate-v001.png",
        "output": "ground-upland-turf-albedo.png",
        "repair": True,
    },
    {
        "id": "ground-upland-road",
        "source": "ground-upland-road-imagegen-candidate-v001.png",
        "output": "ground-upland-road-albedo.png",
        "repair": False,
    },
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


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
        "xBoundaryRms": round(x_boundary, 3),
        "yBoundaryRms": round(y_boundary, 3),
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
    OUTPUT.mkdir(parents=True, exist_ok=True)
    PROOF.mkdir(parents=True, exist_ok=True)
    records = []
    for job in JOBS:
        source_path = SOURCE / job["source"]
        source_image = Image.open(source_path).convert("RGB")
        before = np.asarray(source_image)
        prepared = before
        if job["repair"]:
            prepared = lock_axis(
                lock_axis(before, axis=1, band=TURF_REPAIR_BAND),
                axis=0,
                band=TURF_REPAIR_BAND,
            )
            prepared = np.uint8(np.clip(np.rint(prepared), 0, 255))
        normalized = Image.fromarray(prepared).resize(
            (SIZE, SIZE), Image.Resampling.LANCZOS
        )
        output_path = OUTPUT / job["output"]
        normalized.save(output_path)
        repeat_path = PROOF / f"{job['id']}-repeat-3x3.png"
        make_repeat(normalized, repeat_path)
        after = np.asarray(normalized)
        records.append(
            {
                "id": job["id"],
                "source": str(source_path.relative_to(ROOT)),
                "sourceSha256": sha256(source_path),
                "sourceDimensions": list(source_image.size),
                "output": str(output_path.relative_to(ROOT)),
                "outputSha256": sha256(output_path),
                "outputDimensions": list(normalized.size),
                "repeatProof": str(repeat_path.relative_to(ROOT)),
                "method": (
                    "opposite-edge pair average with inward cosine feather; "
                    "square-preserving Lanczos normalization"
                    if job["repair"]
                    else "untouched albedo; square-preserving Lanczos normalization"
                ),
                "repairBandPixels": TURF_REPAIR_BAND if job["repair"] else 0,
                "before": metrics(before),
                "after": metrics(after),
                "contextStatus": "technical-candidate-awaiting-governed-scene-review",
            }
        )

    manifest = {
        "schema": "GenesisGuardPostGroundCandidatePackV3",
        "version": 3,
        "status": "TECHNICAL_CANDIDATES_AWAITING_GUARD_POST_CONTEXT_REVIEW",
        "sourcePack": "assets/materials/golden/guard-post/v002/manifest.json",
        "policy": {
            "albedoAuthority": "v002 ImageGen source sprite; no redraw",
            "repairScope": "narrow continuous-field seam lock on turf only",
            "normalization": "512x512 Lanczos",
            "approval": "technical evidence is not in-context art approval",
        },
        "records": records,
    }
    manifest_path = OUTPUT / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    (PROOF / "guard-post-ground-v003-receipt.json").write_text(
        json.dumps(manifest, indent=2) + "\n"
    )
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
