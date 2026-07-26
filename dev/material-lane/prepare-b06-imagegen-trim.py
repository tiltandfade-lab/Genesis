#!/usr/bin/env python3
"""Seam-gate ImageGen trim sprites and prepare their MM 1.3 graphs."""

from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SRC = HERE / "source-sprites/b06-trim-imagegen-v001"
GRAPH = HERE / "graphs/b06-trim-imagegen-mm-v001"
GUIDE = HERE / "depth-guides/b06-trim-imagegen-mm-v001"
PROOF = HERE / "proofs/b06-trim-imagegen-v001"
MANIFEST = HERE / "manifests/b06-trim-imagegen-mm-v001.source.json"

spec = importlib.util.spec_from_file_location("helpers", HERE / "prepare-b01-fast-lane-mm.py")
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)
helpers.SIZE = 1024

ROLES = (
    ("plain-band", 96, [0, 0, 1024, 128], [0, 16, 1024, 96], "GP-TR-P00", "allow-cut", 1.00),
    ("base-course", 160, [0, 128, 1024, 192], [0, 144, 1024, 160], "GP-TR-P01", "plain-cap", 1.00),
    ("cornice-belt", 160, [0, 320, 1024, 192], [0, 336, 1024, 160], "GP-TR-P02", "plain-cap", 1.25),
    ("coping-cap", 128, [0, 512, 1024, 160], [0, 528, 1024, 128], "GP-TR-P03", "plain-cap", 1.00),
    ("stair-nosing", 96, [0, 672, 1024, 128], [0, 688, 1024, 96], "GP-TR-P04", "allow-cut", .75),
    ("curb-retaining", 192, [0, 800, 1024, 224], [0, 816, 1024, 192], "GP-TR-P05", "allow-cut", 1.25),
)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def x_metrics(image: Image.Image) -> dict[str, float | bool]:
    a = np.asarray(image.convert("RGB"), dtype=np.float32)
    boundary = float(np.sqrt(np.mean((a[:, 0] - a[:, -1]) ** 2)))
    jumps = np.sqrt(np.mean(np.diff(a, axis=1) ** 2, axis=(0, 2)))
    internal = float(np.percentile(jumps, 95))
    ratio = boundary / max(internal, .001)
    return {
        "leftRightRms": round(boundary, 4),
        "internalXJumpP95": round(internal, 4),
        "xBoundaryToInternalP95": round(ratio, 4),
        "boundaryJumpGate": bool(ratio <= 1.10),
    }


def seam_lock_x(image: Image.Image, band: int = 64) -> Image.Image:
    """Match circular U edges with a symmetric inward cosine feather."""
    a = np.asarray(image.convert("RGB"), dtype=np.float32).copy()
    for offset in range(band):
        inward = .5 - .5 * np.cos(np.pi * offset / (band - 1))
        shared = (a[:, offset] + a[:, -1 - offset]) * .5
        a[:, offset] = shared * (1 - inward) + a[:, offset] * inward
        a[:, -1 - offset] = shared * (1 - inward) + a[:, -1 - offset] * inward
    return Image.fromarray(np.uint8(np.clip(np.rint(a), 0, 255)))


def main() -> None:
    for directory in (GRAPH, GUIDE, PROOF):
        directory.mkdir(parents=True, exist_ok=True)
    entries, results = [], []
    for culture in ("institutional", "upland"):
        for role, safe_height, padded, safe, profile, endpoint, repeat_length in ROLES:
            raw = SRC / f"trim-{culture}-{role}-source-raw-v001.png"
            selected = SRC / f"trim-{culture}-{role}-source-v001.png"
            original = Image.open(raw).convert("RGB").resize((1024, 1024), Image.Resampling.LANCZOS)
            before = x_metrics(original)
            repaired = seam_lock_x(original)
            after = x_metrics(repaired)
            if not after["boundaryJumpGate"]:
                raise RuntimeError(f"U seam gate failed: {culture}/{role}: {after}")
            repaired.save(selected)

            material = {
                "id": f"trim-{culture}-{role}",
                "label": f"{culture.title()} {role.replace('-', ' ')}",
                "guide_mode": "dark_seam_residual",
                "guide_radius": 14,
                "guide_contrast": .82,
                "graph_blur": 2,
                "normal": .18,
                "ao": .15,
                "roughness": .80 if culture == "institutional" else .84,
                "depth_scale": .010,
                "intent": f"ImageGen-first {culture} {role}; geometry owns physical profile",
            }
            guide = GUIDE / f"trim-{culture}-{role}-height-guide-v001.png"
            graph_path = GRAPH / f"b06-trim-{culture}-{role}-v001.ptex"
            helpers.height_guide(selected, material).save(guide)
            payload = helpers.graph(material, selected, guide)
            payload["label"] = f"B06 GMM-N10 / ImageGen sprite first / {culture} / {role} / v001"
            for node in payload["nodes"]:
                if node["name"] == "Material":
                    node["parameters"]["size"] = 10
            graph_path.write_text(json.dumps(payload, indent=2) + "\n")
            entry = {
                **material,
                "culture": culture,
                "slotId": role,
                "safeHeight": safe_height,
                "paddedRectPx": padded,
                "safeContentRectPx": safe,
                "profileId": profile,
                "endpointPolicy": endpoint,
                "repeatWorldLength": repeat_length,
                "source": str(selected.relative_to(ROOT)),
                "sourceSha256": sha(selected),
                "rawImageGenSource": str(raw.relative_to(ROOT)),
                "rawImageGenSourceSha256": sha(raw),
                "heightGuide": str(guide.relative_to(ROOT)),
                "heightGuideSha256": sha(guide),
                "graph": str(graph_path.relative_to(ROOT)),
                "graphSha256": sha(graph_path),
            }
            entries.append(entry)
            results.append({
                "id": material["id"],
                "source": str(selected.relative_to(ROOT)),
                "rawSource": str(raw.relative_to(ROOT)),
                "selectionMethod": "ImageGen source normalized to 1024; U-only opposite-edge cosine seam lock (64 px); V remains clamp-only",
                "rawMetrics": before,
                "metrics": after,
            })
    receipt = PROOF / "b06-trim-imagegen-source-receipt-v001.json"
    receipt.write_text(json.dumps({
        "schema": "genesis.imagegen-trim-source-gate.v1",
        "axisContract": "repeat U; clamp V",
        "threshold": "wrapped U boundary <= 1.10x ordinary internal X p95 jump",
        "results": results,
    }, indent=2) + "\n")
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps({
        "schemaVersion": 1,
        "checkpoint": "B06-trim-imagegen-sprite-first-MM-v001",
        "layoutId": "genesis-architecture-core-h6-v1",
        "layoutVersion": 1,
        "authoringSize": [1024, 1024],
        "runtimeFold": [512, 512],
        "sourceGateReceipt": str(receipt.relative_to(ROOT)),
        "rejectedPredecessors": ["b06-trim-h6-mm-v001", "b06-trim-h6-mm-v002"],
        "materials": entries,
    }, indent=2) + "\n")
    print("PASS: prepared 12 ImageGen-first trim graphs; all U seams gated.")


if __name__ == "__main__":
    main()
