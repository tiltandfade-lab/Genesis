#!/usr/bin/env python3
"""Package a pixel-preserving Guard Post daylight palette candidate.

This pass changes only per-pixel HSV value/saturation. It never resamples, sharpens, blurs,
repaints, or derives normals from illustrated albedo. Existing semantic normal/ORM maps remain the
parents. The curves are study-driven candidates, not automatic material approval.
"""

from __future__ import annotations

import colorsys
import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "assets/materials/golden/guard-post/v010"

RECIPES = {
    "ground-upland-turf-albedo.png": {
        "source": ROOT / "assets/materials/golden/guard-post/v004/ground-upland-turf-albedo.png",
        "valuePivot": 0.40,
        "valueTarget": 0.45,
        "valueGain": 2.50,
        "saturationGain": 1.35,
        "saturationBias": 0.02,
    },
    "ground-upland-road-albedo.png": {
        "source": ROOT / "assets/materials/golden/guard-post/v004/ground-upland-road-albedo.png",
        "valuePivot": 0.44,
        "valueTarget": 0.49,
        "valueGain": 2.25,
        "saturationGain": 1.32,
        "saturationBias": 0.018,
    },
    "ground-scree-albedo.png": {
        "source": ROOT / "assets/materials/golden/guard-post/v001/ground-scree-albedo.png",
        "valuePivot": 0.43,
        "valueTarget": 0.48,
        "valueGain": 1.20,
        "saturationGain": 1.22,
        "saturationBias": 0.012,
    },
    "masonry-rough-albedo.png": {
        "source": ROOT / "assets/materials/golden/guard-post/v001/masonry-rough-albedo.png",
        "valuePivot": 0.55,
        "valueTarget": 0.62,
        "valueGain": 1.50,
        "saturationGain": 1.18,
        "saturationBias": 0.008,
    },
    "masonry-ashlar-albedo.png": {
        "source": ROOT / "assets/materials/golden/guard-post/v001/masonry-ashlar-albedo.png",
        "valuePivot": 0.75,
        "valueTarget": 0.82,
        "valueGain": 1.30,
        "saturationGain": 1.15,
        "saturationBias": 0.006,
    },
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def grade(source: Path, destination: Path, recipe: dict[str, float | Path]) -> None:
    image = Image.open(source).convert("RGBA")
    output = Image.new("RGBA", image.size)
    graded = []
    for red, green, blue, alpha in image.getdata():
        hue, saturation, value = colorsys.rgb_to_hsv(
            red / 255.0, green / 255.0, blue / 255.0
        )
        value = clamp(
            float(recipe["valueTarget"])
            + (value - float(recipe["valuePivot"])) * float(recipe["valueGain"])
        )
        saturation = clamp(
            saturation * float(recipe["saturationGain"])
            + float(recipe["saturationBias"])
        )
        out_red, out_green, out_blue = colorsys.hsv_to_rgb(hue, saturation, value)
        graded.append(
            (
                round(out_red * 255),
                round(out_green * 255),
                round(out_blue * 255),
                alpha,
            )
        )
    output.putdata(graded)
    output.save(destination, optimize=True)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    outputs = []
    for name, recipe in RECIPES.items():
        source = Path(recipe["source"])
        destination = OUTPUT / name
        grade(source, destination, recipe)
        outputs.append(
            {
                "id": name.removesuffix(".png"),
                "source": str(source.relative_to(ROOT)),
                "sourceSha256": sha256(source),
                "output": str(destination.relative_to(ROOT)),
                "outputSha256": sha256(destination),
                "size": list(Image.open(destination).size),
                "transform": {
                    key: value
                    for key, value in recipe.items()
                    if key != "source"
                },
            }
        )
    manifest = {
        "schemaVersion": 1,
        "packId": "guard-post-study-palette-v010",
        "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        "derivation": "pixel-preserving HSV point transform from sprite-derived parents",
        "resampling": "none",
        "normalOrmPolicy": "retain existing semantic parent maps without modification",
        "studyTargets": {
            "daylightP98": [85, 100],
            "environmentSaturationMean": [41, 78],
            "source": "docs/FFT-TS-RESEARCH-EXTERNAL.md",
        },
        "outputs": outputs,
    }
    (OUTPUT / "manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    print(OUTPUT / "manifest.json")


if __name__ == "__main__":
    main()
