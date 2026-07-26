#!/usr/bin/env python3
"""Verify source identity, inherited seams, MM signal, ORM, and determinism."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
MANIFEST = HERE / "manifests/b01-fast-lane-mm-v001.source.json"
SOURCE_RECEIPT = HERE / "proofs/b01-fast-lane-v001/b01-fast-lane-selected-candidates-v002.json"
EXPORT_RECEIPT = HERE / "receipts/b01-fast-lane-mm-v001-export-receipt.json"
OUTPUT = HERE / "receipts/b01-fast-lane-mm-v001-verification.json"
RUNS = [
    HERE / "exports/b01-fast-lane-mm-v001/run-a",
    HERE / "exports/b01-fast-lane-mm-v001/run-b",
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rgb(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float64)


def rounded(value: float) -> float:
    return round(float(value), 4)


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    source_receipt = json.loads(SOURCE_RECEIPT.read_text())
    export_receipt = json.loads(EXPORT_RECEIPT.read_text())
    if not export_receipt["determinism"]["byteIdentical"]:
        raise RuntimeError("Export receipt is not deterministic.")
    source_gates = {
        item["source"]: bool(item["metrics"]["boundary_jump_gate"])
        for item in source_receipt["results"]
    }

    results = []
    for material in manifest["materials"]:
        stem = f"b01-{material['id']}-v001"
        files = {
            "albedo": f"{stem}_albedo.png",
            "height": f"{stem}_heightmap.png",
            "normal": f"{stem}_normal.png",
            "orm": f"{stem}_orm.png",
        }
        for channel, filename in files.items():
            if not all((run / filename).exists() for run in RUNS):
                raise RuntimeError(f"Missing {material['id']} {channel}.")
            if sha256(RUNS[0] / filename) != sha256(RUNS[1] / filename):
                raise RuntimeError(f"Nondeterministic {material['id']} {channel}.")

        albedo = rgb(RUNS[0] / files["albedo"])
        source_image = Image.open(ROOT / material["source"]).convert("RGB")
        source_image = source_image.resize(
            # Hamming is the closest documented Pillow reference for MM 1.3's
            # detailed-source downsample (selected empirically across all
            # standard filters, not by relaxing the identity threshold).
            (albedo.shape[1], albedo.shape[0]),
            Image.Resampling.HAMMING,
        )
        source = np.asarray(source_image, dtype=np.float64)
        mae = np.abs(albedo - source).mean()
        corr = np.corrcoef(albedo.reshape(-1), source.reshape(-1))[0, 1]

        height = np.asarray(
            Image.open(RUNS[0] / files["height"]).convert("L"), dtype=np.float64
        )
        normal = rgb(RUNS[0] / files["normal"])
        orm = rgb(RUNS[0] / files["orm"])
        expected_roughness = round(float(material["roughness"]) * 255)
        identity = mae < 3 and corr > 0.99
        inherited = source_gates.get(material["source"], False)
        depth = height.std() > 1 and max(normal[:, :, 0].std(), normal[:, :, 1].std()) > 0.35
        orm_ok = (
            orm[:, :, 2].max() == 0
            and abs(orm[:, :, 1].mean() - expected_roughness) <= 1
        )
        results.append(
            {
                "id": material["id"],
                "dimensions": [int(albedo.shape[1]), int(albedo.shape[0])],
                "sourceIdentity": {
                    "meanAbsoluteError": rounded(mae),
                    "pixelCorrelation": rounded(corr),
                    "preserved": bool(identity),
                },
                "inheritedSourceSeamGate": {
                    "receipt": str(SOURCE_RECEIPT.relative_to(ROOT)),
                    "passed": bool(inherited),
                },
                "depth": {
                    "heightStdDev": rounded(height.std()),
                    "normalStdDevRgb": [
                        rounded(value) for value in normal.std(axis=(0, 1))
                    ],
                    "broadSignalPresent": bool(depth),
                },
                "orm": {
                    "meanRgb": [rounded(value) for value in orm.mean(axis=(0, 1))],
                    "expectedRoughnessByte": expected_roughness,
                    "metallicMaxByte": int(orm[:, :, 2].max()),
                    "valid": bool(orm_ok),
                },
            }
        )

    passed = all(
        item["sourceIdentity"]["preserved"]
        and item["inheritedSourceSeamGate"]["passed"]
        and item["depth"]["broadSignalPresent"]
        and item["orm"]["valid"]
        for item in results
    )
    report = {
        "schemaVersion": 1,
        "checkpoint": manifest["checkpoint"],
        "result": "PASS" if passed else "FAIL",
        "thresholds": {
            "albedoMaeMax": 3,
            "albedoCorrelationMin": 0.99,
            "heightStdDevMin": 1,
            "normalXYStdDevMin": 0.35,
            "roughnessByteTolerance": 1,
        },
        "materials": results,
    }
    OUTPUT.write_text(json.dumps(report, indent=2) + "\n")
    print(f"{report['result']}: B01 fast-lane MM verification.")


if __name__ == "__main__":
    main()
