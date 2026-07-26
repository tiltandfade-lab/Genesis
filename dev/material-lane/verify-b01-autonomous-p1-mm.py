#!/usr/bin/env python3
"""Verify B01 P1 source identity, conservative MM signal, inherited seams, and ORM."""
from __future__ import annotations
import hashlib, json
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
MANIFEST = HERE / "manifests/b01-autonomous-p1-mm-v001.source.json"
SOURCE_RECEIPT = HERE / "proofs/b01-autonomous-v001/b01-autonomous-v001-receipt.json"
EXPORT_RECEIPT = HERE / "receipts/b01-autonomous-p1-mm-v001-export-receipt.json"
OUTPUT = HERE / "receipts/b01-autonomous-p1-mm-v001-verification.json"
RUNS = [HERE / "exports/b01-autonomous-p1-mm-v001/run-a", HERE / "exports/b01-autonomous-p1-mm-v001/run-b"]

def sha256(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rgb(p): return np.asarray(Image.open(p).convert("RGB"), dtype=np.float64)
def value(v): return round(float(v), 4)

manifest, source_receipt, export_receipt = (json.loads(p.read_text()) for p in (MANIFEST, SOURCE_RECEIPT, EXPORT_RECEIPT))
if not export_receipt["determinism"]["byteIdentical"]: raise RuntimeError("Export receipt is not deterministic")
results = []
for material in manifest["materials"]:
    stem = f"b01-autonomous-{material['id']}-v001"
    files = {"albedo": f"{stem}_albedo.png", "height": f"{stem}_heightmap.png", "normal": f"{stem}_normal.png", "orm": f"{stem}_orm.png"}
    for channel, filename in files.items():
        if not all((run / filename).exists() for run in RUNS): raise RuntimeError(f"Missing {material['id']} {channel}")
        if sha256(RUNS[0] / filename) != sha256(RUNS[1] / filename): raise RuntimeError(f"Nondeterministic {material['id']} {channel}")
    albedo, source = rgb(RUNS[0] / files["albedo"]), rgb(ROOT / material["source"])
    if source.shape != albedo.shape: source = np.asarray(Image.fromarray(source.astype(np.uint8)).resize((albedo.shape[1], albedo.shape[0]), Image.Resampling.BILINEAR), dtype=np.float64)
    mae = np.abs(albedo - source).mean(); corr = np.corrcoef(albedo.reshape(-1), source.reshape(-1))[0, 1]
    height = np.asarray(Image.open(RUNS[0] / files["height"]).convert("L"), dtype=np.float64)
    normal, orm = rgb(RUNS[0] / files["normal"]), rgb(RUNS[0] / files["orm"])
    treatment = material["materialTreatment"]; expected_roughness = round(treatment["roughness"] * 255)
    inherited = source_receipt["materials"][material["sourceId"]]["status"] == "PASS"
    identity = mae < 3 and corr > .99
    depth = height.std() > 1 and max(normal[:,:,0].std(), normal[:,:,1].std()) > .35
    orm_ok = orm[:,:,2].max() == 0 and abs(orm[:,:,1].mean() - expected_roughness) <= 1
    results.append({"id": material["id"], "dimensions": [int(albedo.shape[1]), int(albedo.shape[0])], "sourceIdentity": {"meanAbsoluteError": value(mae), "pixelCorrelation": value(corr), "preserved": bool(identity)}, "inheritedSourceSeamGate": {"receipt": str(SOURCE_RECEIPT.relative_to(ROOT)), "status": source_receipt["materials"][material["sourceId"]]["status"], "passed": bool(inherited)}, "depth": {"heightStdDev": value(height.std()), "normalStdDevRgb": [value(v) for v in normal.std(axis=(0,1))], "broadSignalPresent": bool(depth)}, "orm": {"meanRgb": [value(v) for v in orm.mean(axis=(0,1))], "expectedRoughnessByte": expected_roughness, "metallicMaxByte": int(orm[:,:,2].max()), "valid": bool(orm_ok)}})
passed = all(r["sourceIdentity"]["preserved"] and r["inheritedSourceSeamGate"]["passed"] and r["depth"]["broadSignalPresent"] and r["orm"]["valid"] for r in results)
report = {"schemaVersion": 1, "checkpoint": manifest["checkpoint"], "result": "PASS" if passed else "FAIL", "thresholds": {"albedoMaeMax": 3, "albedoCorrelationMin": .99, "heightStdDevMin": 1, "normalXYStdDevMin": .35, "roughnessByteTolerance": 1}, "materials": results}
OUTPUT.write_text(json.dumps(report, indent=2) + "\n")
print(f"{report['result']}: B01 P1 MM verification.")
