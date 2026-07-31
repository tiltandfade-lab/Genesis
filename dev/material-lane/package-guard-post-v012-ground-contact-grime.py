#!/usr/bin/env python3
"""Package a generic, tileable lower-wall grime trim with continuous ground contact.

The trim contains no brick, block, mortar, or receiver shadow. Its RGB is a restrained neutral
earth/olive discoloration and its alpha alone supplies an irregular upward fade. The bottom row is
continuously occupied so a receiver mounted flush to its true support datum cannot produce the
uniform clean gap seen in the rejected v009 strip.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = ROOT / "assets/materials/golden/guard-post/v012"
OUTPUT = OUTPUT_DIR / "lower-wall-ground-contact-grime-albedo-alpha.png"
MANIFEST = OUTPUT_DIR / "manifest.json"
LOW_W, LOW_H, PIXEL_SCALE = 128, 32, 4


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def periodic_noise(x: int, y: int, seed: int) -> float:
    # Integer-period harmonics keep the left and right boundary phase compatible.
    phase = x / LOW_W * math.tau
    return (
        math.sin(phase * 3 + seed * 0.17) * 0.46
        + math.sin(phase * 7 + y * 0.91 + seed * 0.31) * 0.29
        + math.sin(phase * 13 - y * 0.47 + seed * 0.13) * 0.25
    )


def main() -> None:
    rgba = np.zeros((LOW_H, LOW_W, 4), dtype=np.uint8)
    for x in range(LOW_W):
        phase = x / LOW_W * math.tau
        rise = 24.0 + 4.2 * math.sin(phase * 2 + 0.4)
        rise += 3.1 * math.sin(phase * 5 - 0.8)
        rise += 1.8 * math.sin(phase * 11 + 1.6)
        rise = max(17.0, min(31.0, rise))
        for y in range(LOW_H):
            from_bottom = LOW_H - 1 - y
            if from_bottom > rise + 2:
                continue
            vertical = max(0.0, min(1.0, 1.0 - from_bottom / max(1.0, rise)))
            breakup = periodic_noise(x, y, 29)
            if from_bottom > 1 and vertical + breakup * 0.24 < 0.13:
                continue
            # Continuous but translucent bottom contact; opacity falls irregularly upward.
            alpha = 72 + vertical * 148 + breakup * 26
            contact_floor = max(0.0, 1.0 - from_bottom / 5.0)
            alpha = max(alpha, contact_floor * (218 + 24 * math.sin(phase * 5 + 0.3)))
            alpha = int(max(0, min(238, round(alpha))))

            color_noise = periodic_noise(x, y, 71)
            rgba[y, x, 0] = int(max(0, min(255, 83 + color_noise * 13)))
            rgba[y, x, 1] = int(max(0, min(255, 99 + color_noise * 12)))
            rgba[y, x, 2] = int(max(0, min(255, 56 + color_noise * 9)))
            rgba[y, x, 3] = alpha

    # Duplicate the boundary sample explicitly. Repeat wrapping therefore encounters the same
    # authored texel cluster on both sides instead of relying only on near-equal harmonic phases.
    rgba[:, -1] = rgba[:, 0]

    # The generated low-resolution cells are intentionally enlarged with nearest-neighbor. This
    # retains authored pixel clusters instead of adding filtered procedural noise.
    image = Image.fromarray(rgba, "RGBA").resize(
        (LOW_W * PIXEL_SCALE, LOW_H * PIXEL_SCALE), Image.Resampling.NEAREST
    )
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT, optimize=True)

    pixels = np.asarray(image)
    bottom_alpha = pixels[-1, :, 3]
    left_edge = pixels[:, 0]
    right_edge = pixels[:, -1]
    manifest = {
        "schemaVersion": 1,
        "packId": "guard-post-ground-contact-grime-v012",
        "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        "output": str(OUTPUT.relative_to(ROOT)),
        "outputSha256": sha256(OUTPUT),
        "size": list(image.size),
        "method": "periodic low-resolution trim mask enlarged 4x with nearest-neighbor",
        "receiverIndependence": {
            "containsConstructionPattern": False,
            "containsMortarShadow": False,
            "containsBakedReceiverLighting": False,
            "owns": ["generic-discoloration-rgb", "coverage-alpha"],
            "parentOwns": ["construction-rhythm", "normal", "ORM", "lighting-response"]
        },
        "contactChecks": {
            "bottomRowMinimumAlpha": int(bottom_alpha.min()),
            "bottomRowOccupiedShare": float((bottom_alpha > 0).mean()),
            "leftRightEdgeMeanAbsoluteDifference": float(
                np.abs(left_edge.astype(np.int16) - right_edge.astype(np.int16)).mean()
            )
        },
        "projection": {
            "mode": "receiver-local-trim",
            "wrap": "repeat-x-clamp-y",
            "verticalRule": "image-bottom-is-true-support-contact; irregular fade rises upward"
        }
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    if int(bottom_alpha.min()) <= 0:
        raise RuntimeError("The ground-contact row is not continuous")
    print(MANIFEST)


if __name__ == "__main__":
    main()
