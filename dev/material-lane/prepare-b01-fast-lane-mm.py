#!/usr/bin/env python3
"""Prepare construction-aware height guides and MM 1.3 graphs for B01 fast lane."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SOURCE_ROOT = HERE / "source-sprites/b01-fast-lane-v001"
GUIDE_ROOT = HERE / "depth-guides/b01-fast-lane-mm-v001"
GRAPH_ROOT = HERE / "graphs/b01-fast-lane-mm-v001"
MANIFEST = HERE / "manifests/b01-fast-lane-mm-v001.source.json"
SIZE = 512

MATERIALS = (
    {
        "id": "timber-structural-grain",
        "label": "Structural timber grain",
        "source": "timber-structural-grain-seamlocked-v001.png",
        "guide_mode": "broad_luminance",
        "guide_radius": 10,
        "guide_contrast": 0.55,
        "graph_blur": 3,
        "normal": 0.18,
        "ao": 0.12,
        "roughness": 0.68,
        "depth_scale": 0.012,
        "intent": "Very shallow broad wood relief; pixel grain and knots remain albedo character.",
    },
    {
        "id": "roof-thatch",
        "label": "Roof thatch",
        "source": "roof-thatch-source-v002.png",
        "guide_mode": "broad_luminance",
        "guide_radius": 3,
        "guide_contrast": 0.9,
        "graph_blur": 2,
        "normal": 0.30,
        "ao": 0.28,
        "roughness": 0.84,
        "depth_scale": 0.028,
        "intent": "Course gutters and bundled mass gain depth; individual straw pixels do not become spikes.",
    },
    {
        "id": "roof-turf-sod",
        "label": "Roof turf / sod",
        "source": "roof-turf-sod-source-v001.png",
        "guide_mode": "broad_luminance",
        "guide_radius": 7,
        "guide_contrast": 0.65,
        "graph_blur": 3,
        "normal": 0.22,
        "ao": 0.17,
        "roughness": 0.88,
        "depth_scale": 0.018,
        "intent": "Broad turf cushions gain low relief; grass dither remains flat sprite information.",
    },
    {
        "id": "roof-hide-canvas-tarp",
        "label": "Roof hide / canvas tarp",
        "source": "roof-hide-canvas-tarp-source-v001.png",
        "guide_mode": "dark_seam_residual",
        "guide_radius": 18,
        "guide_contrast": 1.35,
        "graph_blur": 2,
        "normal": 0.17,
        "ao": 0.16,
        "roughness": 0.80,
        "depth_scale": 0.012,
        "intent": "Stitched panel seams gain shallow relief without treating light and dark hides as different elevations.",
    },
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def wrapped_blur(image: Image.Image, radius: float) -> Image.Image:
    tiled = Image.new("L", (image.width * 3, image.height * 3))
    for row in range(3):
        for column in range(3):
            tiled.paste(image, (column * image.width, row * image.height))
    blurred = tiled.filter(ImageFilter.GaussianBlur(radius))
    return blurred.crop((image.width, image.height, image.width * 2, image.height * 2))


def height_guide(source: Path, material: dict[str, object]) -> Image.Image:
    rgb = Image.open(source).convert("RGB").resize((SIZE, SIZE), Image.Resampling.BILINEAR)
    lum = rgb.convert("L")
    broad = wrapped_blur(lum, float(material["guide_radius"]))
    if material["guide_mode"] == "broad_luminance":
        signal = np.asarray(broad, dtype=np.float32)
        signal = 128 + (signal - signal.mean()) * float(material["guide_contrast"])
    else:
        local = np.asarray(broad, dtype=np.float32)
        raw = np.asarray(lum, dtype=np.float32)
        dark_seams = np.maximum(local - raw, 0)
        dark_seams = np.asarray(
            wrapped_blur(Image.fromarray(np.uint8(np.clip(dark_seams * 4, 0, 255))), 1.5),
            dtype=np.float32,
        )
        signal = 196 - dark_seams * float(material["guide_contrast"])
    return Image.fromarray(np.uint8(np.clip(np.rint(signal), 0, 255)))


def graph(material: dict[str, object], source: Path, guide: Path) -> dict[str, object]:
    return {
        "connections": [
            {"from": "source", "from_port": 0, "to": "Material", "to_port": 0},
            {"from": "height_source", "from_port": 0, "to": "height", "to_port": 0},
            {"from": "height", "from_port": 0, "to": "normal", "to_port": 0},
            {"from": "height", "from_port": 0, "to": "ao", "to_port": 0},
            {"from": "metal", "from_port": 0, "to": "Material", "to_port": 1},
            {"from": "rough", "from_port": 0, "to": "Material", "to_port": 2},
            {"from": "normal", "from_port": 0, "to": "Material", "to_port": 4},
            {"from": "ao", "from_port": 0, "to": "Material", "to_port": 5},
            {"from": "height", "from_port": 0, "to": "Material", "to_port": 6},
        ],
        "label": f"B01 fast lane / {material['label']} / sprite-first MM v001",
        "name": str(material["id"]).replace("-", "_"),
        "node_position": {"x": 0, "y": 0},
        "nodes": [
            {
                "name": "source",
                "node_position": {"x": -600, "y": -120},
                "parameters": {"image": f"%PROJECT_PATH%/../../{source.relative_to(HERE)}"},
                "type": "image",
            },
            {
                "name": "height_source",
                "node_position": {"x": -600, "y": 170},
                "parameters": {"image": f"%PROJECT_PATH%/../../{guide.relative_to(HERE)}"},
                "type": "image",
            },
            {
                "name": "height",
                "node_position": {"x": -250, "y": 170},
                "parameters": {"param0": 9, "param1": material["graph_blur"], "param2": 1},
                "type": "fast_blur",
            },
            {
                "name": "normal",
                "node_position": {"x": 30, "y": 100},
                "parameters": {"param0": 9, "param1": material["normal"], "param2": 0, "param4": 1},
                "type": "normal_map",
            },
            {
                "name": "ao",
                "node_position": {"x": 30, "y": 260},
                "parameters": {"param0": 9, "param1": 16, "param2": material["ao"], "param3": 1},
                "type": "occlusion2",
            },
            {
                "name": "metal",
                "node_position": {"x": 30, "y": -220},
                "parameters": {"color": 0},
                "type": "uniform_greyscale",
            },
            {
                "name": "rough",
                "node_position": {"x": 30, "y": -100},
                "parameters": {"color": material["roughness"]},
                "type": "uniform_greyscale",
            },
            {
                "export_paths": {},
                "name": "Material",
                "node_position": {"x": 390, "y": 20},
                "parameters": {
                    "albedo_color": {"a": 1, "b": 1, "g": 1, "r": 1, "type": "Color"},
                    "ao": 1,
                    "depth_scale": material["depth_scale"],
                    "emission_energy": 1,
                    "metallic": 1,
                    "normal": 1,
                    "roughness": 1,
                    "size": 9,
                    "sss": 0,
                },
                "type": "material",
            },
        ],
    }


def main() -> None:
    GUIDE_ROOT.mkdir(parents=True, exist_ok=True)
    GRAPH_ROOT.mkdir(parents=True, exist_ok=True)
    entries = []
    for material in MATERIALS:
        source = SOURCE_ROOT / str(material["source"])
        guide = GUIDE_ROOT / f"{material['id']}-height-guide-v001.png"
        graph_path = GRAPH_ROOT / f"b01-{material['id']}-v001.ptex"
        height_guide(source, material).save(guide)
        graph_path.write_text(json.dumps(graph(material, source, guide), indent=2) + "\n")
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
                "checkpoint": "B01-fast-lane-sprite-first-MM-v001",
                "workflow": "selected complete source sprite -> construction-aware height guide -> MM normal/AO/ORM",
                "controlledRule": "Selected sprite remains albedo authority; depth guides suppress pixel noise and isolate subject-scale construction.",
                "sourceGateReceipt": "dev/material-lane/proofs/b01-fast-lane-v001/b01-fast-lane-selected-candidates-v002.json",
                "materials": entries,
            },
            indent=2,
        )
        + "\n"
    )
    print(f"Prepared {len(entries)} MM graphs and construction-aware height guides.")


if __name__ == "__main__":
    main()
