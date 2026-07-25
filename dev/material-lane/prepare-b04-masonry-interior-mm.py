#!/usr/bin/env python3
"""Prepare restrained sprite-first MM graphs for B04 masonry and floors."""

from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SOURCE_ROOT = HERE / "source-sprites/b04-masonry-interior-v001"
GUIDE_ROOT = HERE / "depth-guides/b04-masonry-interior-mm-v003"
GRAPH_ROOT = HERE / "graphs/b04-masonry-interior-mm-v003"
MANIFEST = HERE / "manifests/b04-masonry-interior-mm-v003.source.json"

spec = importlib.util.spec_from_file_location("b01_mm_helpers", HERE / "prepare-b01-fast-lane-mm.py")
if spec is None or spec.loader is None:
    raise RuntimeError("Could not load B01 MM helper implementation.")
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)

MATERIALS = (
    {"id": "wall-ashlar-dressed", "label": "Dressed ashlar", "fixture": "wall", "source": "wall-ashlar-dressed-selected-v001.png", "guide_mode": "dark_seam_residual", "guide_radius": 16, "guide_contrast": 1.05, "graph_blur": 2, "normal": 0.18, "ao": 0.16, "roughness": 0.78, "depth_scale": 0.012, "intent": "Fine ashlar joints receive restrained recess; dressed faces stay calm."},
    {"id": "wall-rough-hewn-block", "label": "Rough-hewn block", "fixture": "wall", "source": "wall-rough-hewn-block-selected-v001.png", "guide_mode": "dark_seam_residual", "guide_radius": 18, "guide_contrast": 1.10, "graph_blur": 2, "normal": 0.22, "ao": 0.18, "roughness": 0.84, "depth_scale": 0.017, "intent": "Construction joints and broad face facets gain low relief without embossing painted tooling."},
    {"id": "wall-dry-stack-fieldstone", "label": "Dry-stack fieldstone", "fixture": "wall", "source": "wall-dry-stack-fieldstone-selected-v001.png", "guide_mode": "dark_seam_residual", "guide_radius": 14, "guide_contrast": 1.12, "graph_blur": 2, "normal": 0.22, "ao": 0.20, "roughness": 0.86, "depth_scale": 0.018, "intent": "Tight dry joints recess while individual color variation remains albedo."},
    {"id": "wall-brick", "label": "Brick", "fixture": "wall", "source": "wall-brick-selected-v001.png", "guide_mode": "dark_seam_residual", "guide_radius": 11, "guide_contrast": 0.95, "graph_blur": 2, "normal": 0.18, "ao": 0.17, "roughness": 0.82, "depth_scale": 0.012, "intent": "Mortar grid gains shallow readable depth without turning every brick shade into elevation."},
    {"id": "wall-plastered-rubble", "label": "Plastered rubble", "fixture": "wall", "source": "wall-plastered-rubble-selected-v001.png", "guide_mode": "broad_luminance", "guide_radius": 12, "guide_contrast": 0.70, "graph_blur": 3, "normal": 0.20, "ao": 0.09, "roughness": 0.88, "depth_scale": 0.007, "intent": "Only broad hand-trowelled undulation lifts; fine plaster character stays flat."},
    {"id": "floor-flagstone", "label": "Flagstone", "fixture": "floor", "source": "floor-flagstone-selected-v001.png", "guide_mode": "dark_seam_residual", "guide_radius": 15, "guide_contrast": 1.05, "graph_blur": 2, "normal": 0.20, "ao": 0.18, "roughness": 0.82, "depth_scale": 0.014, "intent": "Slab joints recess gently; broad stone colors do not become steps."},
    {"id": "floor-plank", "label": "Plank floor", "fixture": "floor", "source": "floor-plank-selected-v001.png", "guide_mode": "dark_seam_residual", "guide_radius": 12, "guide_contrast": 0.90, "graph_blur": 2, "normal": 0.18, "ao": 0.16, "roughness": 0.72, "depth_scale": 0.010, "intent": "Every board crevice gains shallow depth; painted wood grain remains unembossed."},
    {"id": "floor-packed-earth", "label": "Packed earth", "fixture": "floor", "source": "floor-packed-earth-selected-v001.png", "guide_mode": "broad_luminance", "guide_radius": 10, "guide_contrast": 1.30, "graph_blur": 3, "normal": 0.26, "ao": 0.10, "roughness": 0.90, "depth_scale": 0.008, "intent": "Compaction patches gain extremely shallow broad relief."},
    {"id": "floor-cobble", "label": "Cobble floor", "fixture": "floor", "source": "floor-cobble-selected-v001.png", "guide_mode": "dark_seam_residual", "guide_radius": 10, "guide_contrast": 1.02, "graph_blur": 2, "normal": 0.20, "ao": 0.18, "roughness": 0.84, "depth_scale": 0.014, "intent": "Packed cobble gaps recess while painted stone highlights remain albedo character."},
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
        graph_path = GRAPH_ROOT / f"b04-{material['id']}-v003.ptex"
        helpers.height_guide(source, material).save(guide)
        graph_payload = helpers.graph(material, source, guide)
        graph_payload["label"] = f"B04 masonry/interior / {material['label']} / sprite-first MM v003"
        graph_path.write_text(json.dumps(graph_payload, indent=2) + "\n")
        entries.append({
            **material,
            "source": str(source.relative_to(ROOT)),
            "sourceSha256": sha256(source),
            "heightGuide": str(guide.relative_to(ROOT)),
            "heightGuideSha256": sha256(guide),
            "graph": str(graph_path.relative_to(ROOT)),
            "graphSha256": sha256(graph_path),
        })
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps({
        "schemaVersion": 1,
        "checkpoint": "B04-masonry-interior-sprite-first-MM-v003",
        "workflow": "accepted orthographic source sprite -> subject-aware height guide -> MM normal/AO/ORM",
        "controlledRule": "Selected sprite remains exact albedo authority; walls and floors retain native square texel aspect on their fixtures.",
        "existingLiveParentage": {
            "GP-MM-STONE-V001": "two coursed and two fitted-rubble candidates remain live and are not re-authored",
            "ashlar": "reuses B02 institutional dressed-ashlar sprite-first parent",
        },
        "sourceGateReceipt": "dev/material-lane/proofs/b04-masonry-interior-v001/b04-masonry-interior-selected-source-receipt-v002.json",
        "materials": entries,
    }, indent=2) + "\n")
    print(f"Prepared {len(entries)} B04 MM graphs.")


if __name__ == "__main__":
    main()
