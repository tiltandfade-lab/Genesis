#!/usr/bin/env python3
"""Build the revised generic, parent-independent algae RGBA overlay for Guard Post runoff.

V005 was a useful rejected proof: its RGB baked masonry shadows into the condition sprite, coupling
algae to one brick bond. V006 removed the bond but introduced a regular diagonal color cadence.
V007 contains only irregular algae color clusters and coverage alpha. The renderer composites it
over the parent surface, which retains ownership of albedo rhythm, normals, ORM, and lighting.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
TURF = ROOT / "assets/materials/golden/guard-post/v004/ground-upland-turf-albedo.png"
REJECTED = ROOT / "assets/materials/golden/guard-post/v006/manifest.json"
OUTPUT = ROOT / "assets/materials/golden/guard-post/v007"
OVERLAY = OUTPUT / "generic-algae-causal-overlay-albedo-alpha.png"

PALETTE = (
    (42, 61, 37),
    (51, 76, 43),
    (64, 91, 51),
    (80, 105, 61),
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def clamp(value: float, low: float = 0.0, high: float = 255.0) -> int:
    return round(max(low, min(high, value)))


def main() -> None:
    if OUTPUT.exists():
        raise SystemExit(f"Refusing to overwrite existing candidate pack: {OUTPUT}")
    OUTPUT.mkdir(parents=True)
    turf = Image.open(TURF).convert("RGB")
    width, height = turf.size
    out = Image.new("RGBA", turf.size)
    pixels = out.load()

    for y in range(height):
        v = y / max(1, height - 1)
        for x in range(width):
            u = x / max(1, width - 1)
            tr, tg, tb = turf.getpixel((x, y))
            source_luma = (tr * 0.24 + tg * 0.58 + tb * 0.18) / 255.0
            green_bias = max(0.0, min(1.0, (tg - (tr + tb) * 0.5 + 45) / 110.0))

            # Generic algae color: a compact palette selected by source-sprite clusters. No parent
            # construction pixels participate, so the overlay can cross stone bonds and materials.
            palette_value = max(0.0, min(0.999, source_luma * 0.7 + green_bias * 0.3))
            pr, pg, pb = PALETTE[int(palette_value * len(PALETTE))]
            # No synthetic directional cadence: the source sprite's irregular clusters supply the
            # only color breakup, so the overlay cannot mint sedimentary stripes.
            fleck = 0.86 + 0.14 * source_luma

            # Reusable gravity/runoff coverage. Geometry and condition data decide the world-space
            # source and direction; this alpha only supplies broken pixel edges inside that envelope.
            centre = 0.5 + 0.035 * math.sin(v * math.tau * 2.0)
            half_width = 0.055 + 0.22 * (v ** 1.65)
            edge_rag = (source_luma - 0.5) * 0.052 + 0.012 * math.sin(x * 0.23 + y * 0.07)
            tongue_distance = abs(u - centre) - edge_rag
            tongue = max(0.0, min(1.0, (half_width - tongue_distance) / 0.055))
            tongue *= max(0.0, min(1.0, (v - 0.05) / 0.16))
            collection_edge = (
                0.74
                + 0.045 * math.sin(u * math.tau * 3.0)
                + (source_luma - 0.5) * 0.075
            )
            collection = max(0.0, min(1.0, (v - collection_edge) / 0.075))
            coverage = max(tongue * 0.76, collection * 0.68)
            coverage *= 0.72 + green_bias * 0.28

            pixels[x, y] = (
                clamp(pr * fleck),
                clamp(pg * fleck),
                clamp(pb * fleck),
                clamp(coverage * 158),
            )

    out.save(OVERLAY, optimize=False)
    payload = {
        "schemaVersion": 1,
        "packId": "guard-post-material-candidates-v007",
        "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        "parentPack": "assets/materials/golden/guard-post/v004/manifest.json",
        "rejectedPredecessor": {
            "path": str(REJECTED.relative_to(ROOT)),
            "reason": "generic RGB carried a regular diagonal color cadence",
        },
        "workflow": "deterministic sprite-derived generic RGBA condition overlay",
        "sources": [
            {
                "path": str(TURF.relative_to(ROOT)),
                "sha256": sha256(TURF),
                "role": "algae palette clustering and transparent-edge breakup only",
            }
        ],
        "materials": {
            "generic-algae-overlay": {
                "albedoAlpha": {
                    "path": str(OVERLAY.relative_to(ROOT)),
                    "sha256": sha256(OVERLAY),
                },
                "blendContract": {
                    "mode": "source-over-parent",
                    "parentOwns": ["albedo rhythm", "normal", "ORM", "lighting response"],
                    "overlayOwns": ["algae color", "coverage alpha"],
                    "maximumAlpha": 158,
                },
                "alphaLaw": (
                    "gravity tongue widens into lower damp collection; world geometry supplies "
                    "the outfall source and direction"
                ),
                "mechanicalEffect": "none",
            }
        },
    }
    (OUTPUT / "manifest.json").write_text(json.dumps(payload, indent=2) + "\n")
    print(f"Packaged generic algae overlay v007 at {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
