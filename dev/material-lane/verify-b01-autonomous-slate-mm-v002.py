#!/usr/bin/env python3
"""Verify approved slate v006 identity, inherited seam gate, depth, and ORM."""
from __future__ import annotations
import hashlib, json
from pathlib import Path
import numpy as np
from PIL import Image
HERE = Path(__file__).resolve().parent; ROOT = HERE.parent.parent
SOURCE_MANIFEST = HERE / "manifests/b01-autonomous-slate-v006.source.json"
MM_MANIFEST = HERE / "manifests/b01-autonomous-slate-mm-v002.source.json"
EXPORT_RECEIPT = HERE / "receipts/b01-autonomous-slate-mm-v002-export-receipt.json"
OUTPUT = HERE / "receipts/b01-autonomous-slate-mm-v002-verification.json"
RUNS = [HERE / "exports/b01-autonomous-slate-mm-v002/run-a", HERE / "exports/b01-autonomous-slate-mm-v002/run-b"]
def sha256(p): return hashlib.sha256(p.read_bytes()).hexdigest()
source_manifest, mm_manifest, export_receipt = (json.loads(p.read_text()) for p in (SOURCE_MANIFEST, MM_MANIFEST, EXPORT_RECEIPT))
stem = "b01-autonomous-roof-slate-v002"; names = {c: f"{stem}_{s}.png" for c,s in {"albedo":"albedo","height":"heightmap","normal":"normal","orm":"orm"}.items()}
for name in names.values():
    if not all((run/name).exists() for run in RUNS): raise RuntimeError(f"Missing {name}")
    if sha256(RUNS[0]/name) != sha256(RUNS[1]/name): raise RuntimeError(f"Nondeterministic {name}")
source = np.asarray(Image.open(ROOT/mm_manifest["source"]).convert("RGB"), dtype=np.float64); albedo = np.asarray(Image.open(RUNS[0]/names["albedo"]).convert("RGB"), dtype=np.float64)
mae = float(np.abs(source-albedo).mean()); corr = float(np.corrcoef(source.reshape(-1),albedo.reshape(-1))[0,1])
height = np.asarray(Image.open(RUNS[0]/names["height"]).convert("L"),dtype=np.float64); normal = np.asarray(Image.open(RUNS[0]/names["normal"]).convert("RGB"),dtype=np.float64); orm = np.asarray(Image.open(RUNS[0]/names["orm"]).convert("RGB"),dtype=np.float64)
identity = mae < 3 and corr > .99; seam = source_manifest["acceptedSource"]["technicalGate"] == "PASS"; depth = height.std() > 1 and max(normal[:,:,0].std(),normal[:,:,1].std()) > .35; roughness = round(mm_manifest["materialTreatment"]["roughness"]*255); orm_ok = orm[:,:,2].max()==0 and abs(orm[:,:,1].mean()-roughness)<=1
passed = identity and seam and depth and orm_ok
report = {"schemaVersion":1,"assetId":mm_manifest["assetId"],"result":"PASS" if passed else "FAIL","sourceIdentity":{"meanAbsoluteError":round(mae,4),"pixelCorrelation":round(corr,4),"preserved":bool(identity)},"inheritedSourceSeamGate":{"manifest":str(SOURCE_MANIFEST.relative_to(ROOT)),"passed":bool(seam)},"depth":{"heightStdDev":round(float(height.std()),4),"normalStdDevRgb":[round(float(v),4) for v in normal.std(axis=(0,1))],"broadSignalPresent":bool(depth)},"orm":{"meanRgb":[round(float(v),4) for v in orm.mean(axis=(0,1))],"expectedRoughnessByte":roughness,"metallicMaxByte":int(orm[:,:,2].max()),"valid":bool(orm_ok)}}
OUTPUT.write_text(json.dumps(report,indent=2)+"\n"); print(f"{report['result']}: approved slate MM v002 verification.")
