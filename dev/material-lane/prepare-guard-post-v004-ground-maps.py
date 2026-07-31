#!/usr/bin/env python3
"""Prepare semantic low-relief MM 1.3 graphs for the Guard Post v003 ground parents."""

from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path

from PIL import Image


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
PARENT = ROOT / "assets/materials/golden/guard-post/v003"
SOURCE_ROOT = HERE / "source-sprites/guard-post-ground-v004"
GUIDE_ROOT = HERE / "depth-guides/guard-post-ground-mm-v004"
GRAPH_ROOT = HERE / "graphs/guard-post-ground-mm-v004"
MANIFEST = HERE / "manifests/guard-post-ground-mm-v004.source.json"

spec = importlib.util.spec_from_file_location(
    "b01_mm_helpers", HERE / "prepare-b01-fast-lane-mm.py"
)
if spec is None or spec.loader is None:
    raise RuntimeError("Could not load the canonical MM 1.3 graph helpers.")
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)

MATERIALS = (
    {
        "id": "guard-ground-turf-v004",
        "label": "Guard Post upland turf",
        "parent": "ground-upland-turf-albedo.png",
        "guide_mode": "broad_luminance",
        "guide_radius": 9,
        "guide_contrast": 0.30,
        "graph_blur": 3,
        "normal": 0.12,
        "ao": 0.07,
        "roughness": 0.90,
        "depth_scale": 0.006,
        "intent": (
            "Only broad turf cushions become relief; painted grass blades, color clusters, "
            "and dithering remain albedo identity."
        ),
    },
    {
        "id": "guard-ground-road-v004",
        "label": "Guard Post compacted road",
        "parent": "ground-upland-road-albedo.png",
        "guide_mode": "broad_luminance",
        "guide_radius": 13,
        "guide_contrast": 0.24,
        "graph_blur": 3,
        "normal": 0.10,
        "ao": 0.05,
        "roughness": 0.86,
        "depth_scale": 0.004,
        "intent": (
            "Only broad compaction undulation becomes relief; grit, straw, and painted wear "
            "remain flat so the traffic ribbon stays quiet."
        ),
    },
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    SOURCE_ROOT.mkdir(parents=True, exist_ok=True)
    GUIDE_ROOT.mkdir(parents=True, exist_ok=True)
    GRAPH_ROOT.mkdir(parents=True, exist_ok=True)
    entries = []
    for material in MATERIALS:
        parent = PARENT / str(material["parent"])
        source = SOURCE_ROOT / f"{material['id']}-albedo.png"
        Image.open(parent).convert("RGB").save(source, optimize=False)
        guide = GUIDE_ROOT / f"{material['id']}-height-guide.png"
        helpers.height_guide(source, material).save(guide, optimize=False)
        graph_path = GRAPH_ROOT / f"{material['id']}.ptex"
        graph_payload = helpers.graph(material, source, guide)
        graph_payload["label"] = (
            f"Golden Site 1 / {material['label']} / semantic low-relief MM 1.3 v004"
        )
        graph_path.write_text(json.dumps(graph_payload, indent=2) + "\n")
        entries.append(
            {
                **material,
                "parent": str(parent.relative_to(ROOT)),
                "parentSha256": sha256(parent),
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
                "checkpoint": "Golden-Site-1-guard-ground-MM-v004",
                "workflow": (
                    "v003 seam-locked sprite albedo -> semantic low-frequency height guide "
                    "-> Material Maker 1.3 height/normal/AO/ORM"
                ),
                "controlledRule": (
                    "Albedo pixels retain identity; only broad substrate structure becomes "
                    "lighting relief."
                ),
                "parentManifest": (
                    "assets/materials/golden/guard-post/v003/manifest.json"
                ),
                "materials": entries,
            },
            indent=2,
        )
        + "\n"
    )
    print(f"Prepared {len(entries)} Guard Post ground graphs for Material Maker 1.3.")


if __name__ == "__main__":
    main()
