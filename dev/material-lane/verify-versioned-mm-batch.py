#!/usr/bin/env python3
"""Generic verification for sprite-first versioned MM batches."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rgb(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float64)


def rounded(value: float) -> float:
    return round(float(value), 4)


def source_gate(item: dict[str, object]) -> bool:
    metrics = item["metrics"]
    return bool(metrics.get("boundaryJumpGate", metrics.get("boundary_jump_gate", False)))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--source-receipt", type=Path, required=True)
    parser.add_argument("--export-receipt", type=Path, required=True)
    parser.add_argument("--export-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    for name in ("manifest", "source_receipt", "export_receipt", "export_dir", "output"):
        value = getattr(args, name)
        setattr(args, name, value if value.is_absolute() else (ROOT / value).resolve())

    manifest = json.loads(args.manifest.read_text())
    source_receipt = json.loads(args.source_receipt.read_text())
    export_receipt = json.loads(args.export_receipt.read_text())
    if not export_receipt["determinism"]["byteIdentical"]:
        raise RuntimeError("Export receipt is not deterministic.")
    gates = {item["source"]: source_gate(item) for item in source_receipt["results"]}
    runs = [args.export_dir / "run-a", args.export_dir / "run-b"]

    results = []
    for material in manifest["materials"]:
        stem = Path(material["graph"]).stem
        files = {
            "albedo": f"{stem}_albedo.png",
            "height": f"{stem}_heightmap.png",
            "normal": f"{stem}_normal.png",
            "orm": f"{stem}_orm.png",
        }
        for channel, filename in files.items():
            if not all((run / filename).exists() for run in runs):
                raise RuntimeError(f"Missing {material['id']} {channel}.")
            if sha256(runs[0] / filename) != sha256(runs[1] / filename):
                raise RuntimeError(f"Nondeterministic {material['id']} {channel}.")

        albedo = rgb(runs[0] / files["albedo"])
        source_image = Image.open(ROOT / material["source"]).convert("RGB").resize(
            (albedo.shape[1], albedo.shape[0]), Image.Resampling.HAMMING
        )
        source = np.asarray(source_image, dtype=np.float64)
        mae = np.abs(albedo - source).mean()
        corr = np.corrcoef(albedo.reshape(-1), source.reshape(-1))[0, 1]
        height = np.asarray(
            Image.open(runs[0] / files["height"]).convert("L"), dtype=np.float64
        )
        normal = rgb(runs[0] / files["normal"])
        orm = rgb(runs[0] / files["orm"])
        expected_roughness = round(float(material["roughness"]) * 255)
        identity = mae < 3 and corr > 0.99
        inherited = gates.get(material["source"], False)
        depth = height.std() > 1 and max(normal[:, :, 0].std(), normal[:, :, 1].std()) > 0.35
        orm_ok = (
            orm[:, :, 2].max() == 0
            and abs(orm[:, :, 1].mean() - expected_roughness) <= 1
        )
        results.append(
            {
                "id": material["id"],
                "culture": material.get("culture"),
                "dimensions": [int(albedo.shape[1]), int(albedo.shape[0])],
                "sourceIdentity": {
                    "meanAbsoluteError": rounded(mae),
                    "pixelCorrelation": rounded(corr),
                    "preserved": bool(identity),
                },
                "inheritedSourceSeamGate": {
                    "receipt": str(args.source_receipt.relative_to(ROOT)),
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
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n")
    print(f"{report['result']}: {manifest['checkpoint']} verification.")
    if not passed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
