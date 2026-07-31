#!/usr/bin/env python3
"""Package the readable parent-independent Guard Post ground-contact grime trim."""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = ROOT / "assets/materials/golden/guard-post/v013"
OUTPUT = OUTPUT_DIR / "lower-wall-readable-ground-contact-grime-albedo-alpha.png"
MANIFEST = OUTPUT_DIR / "manifest.json"
LOW_W, LOW_H, SCALE = 128, 32, 4


def periodic(x: int, y: int, seed: int) -> float:
    phase = x / LOW_W * math.tau
    return (
        math.sin(phase * 2 + seed * 0.19) * 0.42
        + math.sin(phase * 5 + y * 0.53 + seed * 0.31) * 0.31
        + math.sin(phase * 11 - y * 0.37 + seed * 0.11) * 0.19
        + math.sin(phase * 17 + y * 0.83) * 0.08
    )


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    rgba = np.zeros((LOW_H, LOW_W, 4), dtype=np.uint8)
    for x in range(LOW_W):
        phase = x / LOW_W * math.tau
        # The Guard wall sits above an exposed foundation course. A short alpha column disappears
        # entirely into that course and makes the trim appear not to fit the façade. Preserve an
        # irregular upper silhouette, but guarantee enough rise to cross the foundation.
        rise = 27.0 + 2.6 * math.sin(phase * 2 + 0.6)
        rise += 1.8 * math.sin(phase * 5 - 1.1)
        rise += 0.9 * math.sin(phase * 9 + 0.4)
        rise = max(22.0, min(31.0, rise))
        for y in range(LOW_H):
            from_bottom = LOW_H - 1 - y
            if from_bottom > rise + 2:
                continue
            vertical = max(0.0, min(1.0, 1.0 - from_bottom / rise))
            breakup = periodic(x, y, 47)
            island = vertical + breakup * 0.30
            if from_bottom > 2 and island < 0.12:
                continue
            contact = max(0.0, 1.0 - from_bottom / 7.0)
            alpha = 52 + vertical * 166 + breakup * 30
            alpha = max(alpha, contact * (226 + 18 * math.sin(phase * 4 + 0.8)))
            alpha = int(max(0, min(246, round(alpha))))

            color_noise = periodic(x, y, 89)
            damp = max(0.0, min(1.0, vertical * 0.72 + contact * 0.28))
            rgba[y, x, 0] = int(max(0, min(255, 55 - damp * 9 + color_noise * 8)))
            rgba[y, x, 1] = int(max(0, min(255, 45 - damp * 5 + color_noise * 7)))
            rgba[y, x, 2] = int(max(0, min(255, 27 - damp * 3 + color_noise * 5)))
            rgba[y, x, 3] = alpha

    rgba[:, -1] = rgba[:, 0]
    image = Image.fromarray(rgba).resize(
        (LOW_W * SCALE, LOW_H * SCALE), Image.Resampling.NEAREST
    )
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT, optimize=True)
    pixels = np.asarray(image)
    bottom_alpha = pixels[-1, :, 3]
    manifest = {
        "schemaVersion": 1,
        "packId": "guard-post-readable-ground-contact-grime-v013",
        "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        "output": str(OUTPUT.relative_to(ROOT)),
        "outputSha256": sha256(OUTPUT),
        "size": list(image.size),
        "method": "periodic 128x32 pixel trim enlarged 4x with nearest-neighbor",
        "supersedesForProof": "guard-post-ground-contact-grime-v012",
        "receiverIndependence": {
            "containsConstructionPattern": False,
            "containsMortarShadow": False,
            "containsBakedReceiverLighting": False,
            "owns": ["brown-olive-discoloration", "coverage-alpha"],
            "parentOwns": ["construction-rhythm", "normal", "ORM", "lighting-response"],
        },
        "contactChecks": {
            "bottomRowMinimumAlpha": int(bottom_alpha.min()),
            "bottomRowOccupiedShare": float((bottom_alpha > 0).mean()),
            "leftRightEdgeMeanAbsoluteDifference": float(
                np.abs(
                    pixels[:, 0].astype(np.int16) - pixels[:, -1].astype(np.int16)
                ).mean()
            ),
        },
        "projection": {
            "mode": "parent-fragment-receiver-band",
            "wrap": "repeat-x-clamp-y",
            "verticalRule": "texture-bottom-is-actual-committed-terrain-contact",
        },
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    if int(bottom_alpha.min()) <= 0:
        raise RuntimeError("Ground-contact alpha must remain continuous")
    print(MANIFEST)


if __name__ == "__main__":
    main()
