#!/usr/bin/env python3
"""Build the Guard Post's deterministic sprite-derived runoff condition decal.

The decal is not a random weathering sheet. Its RGB comes from the current masonry and turf
candidate parents; its alpha describes one reusable causal grammar: a narrow tongue under an
outfall widening into an irregular damp collection band. Geometry decides where water exists.
This texture only breaks the rectangular edge of that engine-owned condition projection.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
MASONRY = ROOT / "assets/materials/golden/guard-post/v001/masonry-rough-albedo.png"
TURF = ROOT / "assets/materials/golden/guard-post/v004/ground-upland-turf-albedo.png"
OUTPUT = ROOT / "assets/materials/golden/guard-post/v005"
DECAL = OUTPUT / "runoff-algae-causal-decal-albedo.png"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def clamp(value: float, low: float = 0.0, high: float = 255.0) -> int:
    return round(max(low, min(high, value)))


def main() -> None:
    if OUTPUT.exists():
        raise SystemExit(f"Refusing to overwrite existing candidate pack: {OUTPUT}")
    OUTPUT.mkdir(parents=True)
    masonry = Image.open(MASONRY).convert("RGB")
    turf = Image.open(TURF).convert("RGB").resize(masonry.size, Image.Resampling.NEAREST)
    width, height = masonry.size
    out = Image.new("RGBA", masonry.size)
    pixels = out.load()

    for y in range(height):
        v = y / max(1, height - 1)
        for x in range(width):
            u = x / max(1, width - 1)
            mr, mg, mb = masonry.getpixel((x, y))
            tr, tg, tb = turf.getpixel((x, y))
            turf_luma = (tr * 0.24 + tg * 0.58 + tb * 0.18) / 255.0
            masonry_luma = (mr + mg + mb) / (3.0 * 255.0)

            # A widening gravity tongue. Source-pixel luma perturbs its edge without inventing a
            # second noise source, retaining visible sprite clusters in both color and silhouette.
            centre = 0.5 + 0.035 * math.sin(v * math.tau * 2.0)
            half_width = 0.055 + 0.22 * (v ** 1.65)
            edge_rag = (turf_luma - 0.5) * 0.045 + 0.012 * math.sin(x * 0.23 + y * 0.07)
            tongue_distance = abs(u - centre) - edge_rag
            tongue = max(0.0, min(1.0, (half_width - tongue_distance) / 0.055))
            tongue *= max(0.0, min(1.0, (v - 0.05) / 0.16))

            # Water lingers at the lower edge. The boundary is broad and irregular, while small
            # clean holes survive wherever the source sprites are locally bright/dry.
            collection_edge = (
                0.74
                + 0.045 * math.sin(u * math.tau * 3.0)
                + (turf_luma - 0.5) * 0.075
            )
            collection = max(0.0, min(1.0, (v - collection_edge) / 0.075))
            clean_hole = max(0.0, min(1.0, (masonry_luma - 0.68) / 0.18))
            coverage = max(tongue * 0.86, collection * 0.78)
            coverage *= 1.0 - clean_hole * 0.32

            # Preserve the masonry's construction rhythm, then borrow moss color clusters from
            # the admitted turf parent. The tint is deliberately subdued: water history is a
            # secondary material read, not the site's focal accent.
            mixed_r = mr * 0.58 + tr * 0.42
            mixed_g = mg * 0.54 + tg * 0.46
            mixed_b = mb * 0.62 + tb * 0.38
            pixels[x, y] = (
                clamp(mixed_r * 0.58),
                clamp(mixed_g * 0.72),
                clamp(mixed_b * 0.5),
                clamp(coverage * 205),
            )

    out.save(DECAL, optimize=False)
    payload = {
        "schemaVersion": 1,
        "packId": "guard-post-material-candidates-v005",
        "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        "parentPack": "assets/materials/golden/guard-post/v004/manifest.json",
        "workflow": "deterministic sprite-derived RGBA causal-condition decal",
        "sources": [
            {
                "path": str(MASONRY.relative_to(ROOT)),
                "sha256": sha256(MASONRY),
                "role": "construction rhythm and value parent",
            },
            {
                "path": str(TURF.relative_to(ROOT)),
                "sha256": sha256(TURF),
                "role": "moss color clusters and alpha-edge perturbation parent",
            },
        ],
        "materials": {
            "runoff-algae": {
                "albedoAlpha": {
                    "path": str(DECAL.relative_to(ROOT)),
                    "sha256": sha256(DECAL),
                },
                "alphaLaw": (
                    "outfall tongue widens downhill into a damp collection band; "
                    "transparent texels preserve clean stone"
                ),
                "mechanicalEffect": "none",
            }
        },
    }
    (OUTPUT / "manifest.json").write_text(json.dumps(payload, indent=2) + "\n")
    print(f"Packaged Guard Post runoff condition v005 at {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
