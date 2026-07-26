#!/usr/bin/env python3
"""Prepare seam-isolated height guides and MM graphs for B02 deck-edge candidates."""

from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SOURCE_ROOT = HERE / "source-sprites/b02-deck-edge-v001"
GUIDE_ROOT = HERE / "depth-guides/b02-deck-edge-mm-v001"
GRAPH_ROOT = HERE / "graphs/b02-deck-edge-mm-v001"
MANIFEST = HERE / "manifests/b02-deck-edge-mm-v001.source.json"

spec = importlib.util.spec_from_file_location(
    "b01_mm_helpers", HERE / "prepare-b01-fast-lane-mm.py"
)
if spec is None or spec.loader is None:
    raise RuntimeError("Could not load B01 MM helper implementation.")
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)

MATERIALS = (
    {
        "id": "institutional-dressed-ashlar",
        "culture": "Institutional",
        "label": "Dressed ashlar",
        "source": "institutional-dressed-ashlar-source-v001.png",
        "guide_radius": 18,
        "normal": 0.22,
        "ao": 0.20,
        "roughness": 0.76,
        "depth_scale": 0.018,
        "intent": "Regular mortar gains restrained depth; pale replacement-block color stays albedo-only.",
    },
    {
        "id": "institutional-frontier-coursed",
        "culture": "Institutional",
        "label": "Frontier coursing",
        "source": "institutional-frontier-coursed-source-v003.png",
        "guide_radius": 18,
        "normal": 0.24,
        "ao": 0.22,
        "roughness": 0.82,
        "depth_scale": 0.020,
        "intent": "Measured course joints gain weight without embossing flat stone color.",
    },
    {
        "id": "upland-fitted-rubble-upstand",
        "culture": "Upland",
        "label": "Fitted rubble upstand",
        "source": "upland-fitted-rubble-upstand-seamlocked-v001.png",
        "guide_radius": 16,
        "normal": 0.28,
        "ao": 0.24,
        "roughness": 0.86,
        "depth_scale": 0.022,
        "intent": "Irregular fitted joints gain broad relief; individual stone pigments do not become height.",
    },
    {
        "id": "upland-heavy-timber-edge",
        "culture": "Upland",
        "label": "Heavy timber edge",
        "source": "upland-heavy-timber-edge-source-v002.png",
        "guide_radius": 15,
        "normal": 0.25,
        "ao": 0.20,
        "roughness": 0.72,
        "depth_scale": 0.018,
        "intent": "Rail, peg, rope, and board crevices gain shallow assembly depth; grain stays quiet.",
    },
    {
        "id": "upland-timber-cribbed-rubble",
        "culture": "Upland",
        "label": "Timber-cribbed rubble",
        "source": "upland-timber-cribbed-rubble-source-v001.png",
        "guide_radius": 16,
        "normal": 0.27,
        "ao": 0.23,
        "roughness": 0.78,
        "depth_scale": 0.021,
        "intent": "Crib members separate from packed infill without turning every stone mark into geometry.",
    },
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    GUIDE_ROOT.mkdir(parents=True, exist_ok=True)
    GRAPH_ROOT.mkdir(parents=True, exist_ok=True)
    entries = []
    for source_material in MATERIALS:
        material = {
            **source_material,
            "guide_mode": "dark_seam_residual",
            "guide_contrast": 1.15,
            "graph_blur": 2,
        }
        source = SOURCE_ROOT / str(material["source"])
        guide = GUIDE_ROOT / f"{material['id']}-height-guide-v001.png"
        graph_path = GRAPH_ROOT / f"b02-{material['id']}-v001.ptex"
        helpers.height_guide(source, material).save(guide)
        graph_path.write_text(json.dumps(helpers.graph(material, source, guide), indent=2) + "\n")
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
                "checkpoint": "B02-deck-edge-culture-candidates-MM-v001",
                "workflow": "selected culture source sprite -> seam-isolated height guide -> MM normal/AO/ORM",
                "coverInvariant": "all candidates use equal cover-class fixture geometry; sprite owns construction pattern only",
                "sourceGateReceipt": "dev/material-lane/proofs/b02-deck-edge-selected-v001/b02-deck-edge-selected-source-receipt-v001.json",
                "materials": entries,
            },
            indent=2,
        )
        + "\n"
    )
    print(f"Prepared {len(entries)} B02 deck-edge MM graphs.")


if __name__ == "__main__":
    main()
