#!/usr/bin/env python3
"""Prepare low-relief MM graphs for B03 exterior ground sprites."""

from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SOURCE_ROOT = HERE / "source-sprites/b03-exterior-ground-v001"
GUIDE_ROOT = HERE / "depth-guides/b03-exterior-ground-mm-v003"
GRAPH_ROOT = HERE / "graphs/b03-exterior-ground-mm-v003"
MANIFEST = HERE / "manifests/b03-exterior-ground-mm-v003.source.json"

spec = importlib.util.spec_from_file_location(
    "b01_mm_helpers", HERE / "prepare-b01-fast-lane-mm.py"
)
if spec is None or spec.loader is None:
    raise RuntimeError("Could not load B01 MM helper implementation.")
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)

MATERIALS = (
    {
        "id": "grass-meadow",
        "label": "Grass / meadow",
        "source": "grass-meadow-selected-v001.png",
        "guide_mode": "broad_luminance",
        "guide_radius": 7,
        "guide_contrast": 0.52,
        "graph_blur": 3,
        "normal": 0.17,
        "ao": 0.12,
        "roughness": 0.88,
        "depth_scale": 0.012,
        "intent": "Broad grass cushions gain shallow relief; individual blades and dither remain albedo character.",
    },
    {
        "id": "worn-path",
        "label": "Worn path",
        "source": "worn-path-selected-v001.png",
        "guide_mode": "broad_luminance",
        "guide_radius": 11,
        "guide_contrast": 0.38,
        "graph_blur": 3,
        "normal": 0.20,
        "ao": 0.10,
        "roughness": 0.84,
        "depth_scale": 0.008,
        "intent": "Compacted wear receives only broad shallow undulation; grit and straw marks stay flat.",
    },
    {
        "id": "mud",
        "label": "Mud",
        "source": "mud-selected-v001.png",
        "guide_mode": "broad_luminance",
        "guide_radius": 5,
        "guide_contrast": 0.34,
        "graph_blur": 3,
        "normal": 0.16,
        "ao": 0.12,
        "roughness": 0.66,
        "depth_scale": 0.015,
        "intent": "Clod boundaries gain restrained depth without turning every dark pixel into a trench.",
    },
    {
        "id": "gravel-scree",
        "label": "Gravel / scree",
        "source": "gravel-scree-selected-v001.png",
        "guide_mode": "broad_luminance",
        "guide_radius": 4,
        "guide_contrast": 0.28,
        "graph_blur": 3,
        "normal": 0.15,
        "ao": 0.11,
        "roughness": 0.82,
        "depth_scale": 0.011,
        "intent": "Stone groups separate at low relief while high-frequency chip noise stays subordinate.",
    },
    {
        "id": "marsh-bog",
        "label": "Marsh / bog",
        "source": "marsh-bog-selected-v001.png",
        "guide_mode": "broad_luminance",
        "guide_radius": 9,
        "guide_contrast": 0.46,
        "graph_blur": 3,
        "normal": 0.15,
        "ao": 0.11,
        "roughness": 0.70,
        "depth_scale": 0.011,
        "intent": "Peat and vegetation mats gain broad relief; wet-pocket color remains albedo, not a deep hole.",
    },
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    GUIDE_ROOT.mkdir(parents=True, exist_ok=True)
    GRAPH_ROOT.mkdir(parents=True, exist_ok=True)
    entries = []
    for material in MATERIALS:
        source = SOURCE_ROOT / str(material["source"])
        guide = GUIDE_ROOT / f"{material['id']}-height-guide-v001.png"
        graph_path = GRAPH_ROOT / f"b03-{material['id']}-v003.ptex"
        helpers.height_guide(source, material).save(guide)
        graph_payload = helpers.graph(material, source, guide)
        graph_payload["label"] = f"B03 exterior ground / {material['label']} / sprite-first MM v003"
        graph_path.write_text(json.dumps(graph_payload, indent=2) + "\n")
        entries.append(
            {
                **material,
                "source": str(source.relative_to(ROOT)),
                "sourceSha256": sha256(source),
                "heightGuide": str(guide.relative_to(ROOT)),
                "heightGuideSha256": sha256(guide),
                "graph": str(graph_path.relative_to(ROOT)),
                "graphSha256": sha256(graph_path),
            }
        )
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "checkpoint": "B03-exterior-ground-sprite-first-MM-v003",
                "workflow": "selected top-down ground sprite -> low-frequency height guide -> MM normal/AO/ORM",
                "controlledRule": "Selected sprite remains albedo authority; ground depth stays broad and quiet behind standees.",
                "sourceGateReceipt": "dev/material-lane/proofs/b03-exterior-ground-v001/b03-exterior-ground-selected-source-receipt-v003.json",
                "materials": entries,
            },
            indent=2,
        )
        + "\n"
    )
    print(f"Prepared {len(entries)} B03 exterior-ground MM graphs.")


if __name__ == "__main__":
    main()
