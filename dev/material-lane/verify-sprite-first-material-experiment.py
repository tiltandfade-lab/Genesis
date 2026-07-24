#!/usr/bin/env python3
"""Measure identity preservation, depth signal, ORM validity, and seams."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent.parent
SOURCE_MANIFEST = (
    HERE / "manifests" / "sprite-first-material-experiment-v001.source.json"
)
EXPORT_RECEIPT = (
    HERE / "receipts" / "sprite-first-material-v001-export-receipt.json"
)
OUTPUT = HERE / "receipts" / "sprite-first-material-v001-verification.json"
RUN_A = HERE / "exports" / "sprite-first-material-v001" / "run-a"
RUN_B = HERE / "exports" / "sprite-first-material-v001" / "run-b"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rgb(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float64)


def rounded(value: float) -> float:
    return round(float(value), 4)


source_manifest = json.loads(SOURCE_MANIFEST.read_text())
export_receipt = json.loads(EXPORT_RECEIPT.read_text())
if not export_receipt["determinism"]["byteIdentical"]:
    raise RuntimeError("Material Maker export receipt is not deterministic")

results = []
for candidate in source_manifest["candidates"]:
    candidate_id = candidate["id"]
    stem = f"sprite-first-{candidate_id}-v001"
    files = {
        "albedo": RUN_A / f"{stem}_albedo.png",
        "height": RUN_A / f"{stem}_heightmap.png",
        "normal": RUN_A / f"{stem}_normal.png",
        "orm": RUN_A / f"{stem}_orm.png",
    }
    for channel, run_a in files.items():
        run_b = RUN_B / run_a.name
        if not run_a.exists() or not run_b.exists():
            raise RuntimeError(f"Missing {candidate_id} {channel} output")
        if sha256(run_a) != sha256(run_b):
            raise RuntimeError(f"Nondeterministic {candidate_id} {channel} output")

    albedo = rgb(files["albedo"])
    source_path = REPO_ROOT / candidate["source"]
    source_resized = np.asarray(
        Image.open(source_path)
        .convert("RGB")
        .resize((512, 512), Image.Resampling.BILINEAR),
        dtype=np.float64,
    )
    albedo_mae = np.abs(albedo - source_resized).mean()
    albedo_correlation = np.corrcoef(
        albedo.reshape(-1), source_resized.reshape(-1)
    )[0, 1]
    edge_lr_rms = np.sqrt(np.mean((albedo[:, 0] - albedo[:, -1]) ** 2))
    edge_tb_rms = np.sqrt(np.mean((albedo[0] - albedo[-1]) ** 2))

    height = np.asarray(Image.open(files["height"]).convert("L"), dtype=np.float64)
    normal = rgb(files["normal"])
    orm = rgb(files["orm"])
    roughness_expected = round(candidate["materialTreatment"]["roughness"] * 255)

    identity_preserved = albedo_mae < 3 and albedo_correlation > 0.99
    depth_signal_present = height.std() > 5 and max(normal[:, :, 0].std(), normal[:, :, 1].std()) > 2
    orm_valid = (
        orm[:, :, 2].max() == 0
        and abs(orm[:, :, 1].mean() - roughness_expected) <= 1
    )
    seamless_ready = max(edge_lr_rms, edge_tb_rms) <= 10
    results.append(
        {
            "id": candidate_id,
            "dimensions": [int(albedo.shape[1]), int(albedo.shape[0])],
            "sourceIdentity": {
                "bilinearResizeMeanAbsoluteError": rounded(albedo_mae),
                "pixelCorrelation": rounded(albedo_correlation),
                "preserved": bool(identity_preserved),
            },
            "seams": {
                "leftRightEdgeRms": rounded(edge_lr_rms),
                "topBottomEdgeRms": rounded(edge_tb_rms),
                "productionReady": bool(seamless_ready),
            },
            "depth": {
                "heightStdDev": rounded(height.std()),
                "normalMeanRgb": [rounded(value) for value in normal.mean(axis=(0, 1))],
                "normalStdDevRgb": [rounded(value) for value in normal.std(axis=(0, 1))],
                "signalPresent": bool(depth_signal_present),
            },
            "orm": {
                "meanRgb": [rounded(value) for value in orm.mean(axis=(0, 1))],
                "stdDevRgb": [rounded(value) for value in orm.std(axis=(0, 1))],
                "expectedRoughnessByte": roughness_expected,
                "metallicMaxByte": int(orm[:, :, 2].max()),
                "valid": bool(orm_valid),
            },
        }
    )

proof_pass = all(
    result["sourceIdentity"]["preserved"]
    and result["depth"]["signalPresent"]
    and result["orm"]["valid"]
    for result in results
)
production_ready = proof_pass and all(
    result["seams"]["productionReady"] for result in results
)
verification = {
    "schemaVersion": 1,
    "experimentId": source_manifest["experimentId"],
    "result": {
        "proofOfMethod": "PASS" if proof_pass else "FAIL",
        "productionReady": "PASS" if production_ready else "FAIL",
        "productionBlocker": (
            None
            if production_ready
            else "Generated source-sprite edges require a dedicated seamless repair pass."
        ),
    },
    "thresholds": {
        "identityMaeMax": 3,
        "identityCorrelationMin": 0.99,
        "heightStdDevMin": 5,
        "normalHorizontalStdDevMin": 2,
        "seamEdgeRmsMax": 10,
    },
    "candidates": results,
}
OUTPUT.write_text(json.dumps(verification, indent=2) + "\n")

print(
    f"{verification['result']['proofOfMethod']}: sprite-first method; "
    f"production-ready={verification['result']['productionReady']}."
)
print(OUTPUT.relative_to(Path.cwd()))
