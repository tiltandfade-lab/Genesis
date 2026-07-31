#!/usr/bin/env python3
"""Remove camera-facing tuft silhouettes without repainting the accepted v010 turf parent.

This is deliberately a bounded pixel-quilting pass, not a generative replacement material. Each
reviewed tuft owns an elliptical repaint mask. The packager searches the same seamless parent for
a tuft-free donor whose pixels best match the receiver immediately outside that mask, then copies
only the masked pixels. Pixels outside the reviewed masks remain byte-exact; reviewed masks that
cross an edge are sampled and written toroidally so the seamless parent stays seamless.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/materials/golden/guard-post/v010/ground-upland-turf-albedo.png"
OUTPUT = ROOT / "assets/materials/golden/guard-post/v011/ground-upland-turf-albedo.png"
MASK_PROOF = ROOT / "assets/materials/golden/guard-post/v011/ground-upland-turf-tuft-mask-proof.png"
COORDINATE_PROOF = ROOT / "assets/materials/golden/guard-post/v011/ground-upland-turf-coordinate-proof.png"
MANIFEST = ROOT / "assets/materials/golden/guard-post/v011/manifest.json"

# Centers and radii were reviewed against the 512 px v010 parent. They describe only the
# fan-shaped, camera-facing tuft clusters; small orientation-neutral moss and groundcover remain.
TUFT_CORES = [
    (91, 27, 18, 17), (152, 26, 17, 17), (343, 54, 17, 17),
    (493, 53, 17, 17), (184, 84, 18, 18), (106, 111, 18, 18),
    (457, 130, 18, 18), (78, 147, 13, 14), (111, 174, 15, 16),
    (304, 177, 18, 18), (145, 203, 14, 15), (79, 220, 18, 18),
    (492, 211, 18, 18), (76, 248, 14, 15), (369, 277, 18, 18),
    (433, 330, 18, 18), (472, 337, 14, 15), (499, 344, 16, 17),
    (305, 411, 19, 19), (44, 427, 14, 15), (141, 439, 18, 18),
    (488, 437, 18, 18), (82, 480, 18, 18), (181, 487, 18, 18),
    (466, 474, 18, 18),
    # Secondary fans were partially occluded by moss in the first visual review. They must be
    # declared too, otherwise the donor search can transplant them into a cleaned receiver.
    (29, 86, 17, 18), (111, 147, 17, 18), (190, 170, 17, 18),
    (386, 166, 18, 18), (394, 282, 13, 14), (193, 437, 18, 18),
]
# The dark fan blades extend well beyond their bright central cores. Quilting only the core leaves
# a recognizable crescent of directional blades, so every reviewed core receives a feather-safe
# guard radius.
TUFTS = [(cx, cy, rx + 8, ry + 6) for cx, cy, rx, ry in TUFT_CORES]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ellipse_offsets(rx: int, ry: int, inner: float, outer: float) -> tuple[np.ndarray, np.ndarray]:
    yy, xx = np.mgrid[-ry - 3 : ry + 4, -rx - 3 : rx + 4]
    normalized = (xx / rx) ** 2 + (yy / ry) ** 2
    selected = (normalized >= inner * inner) & (normalized <= outer * outer)
    return yy[selected], xx[selected]


def overlaps_reviewed_tuft(
    cx: int, cy: int, rx: int, ry: int, width: int, height: int
) -> bool:
    for tx, ty, trx, try_ in TUFTS:
        dx = min(abs(cx - tx), width - abs(cx - tx))
        dy = min(abs(cy - ty), height - abs(cy - ty))
        if dx <= rx + trx + 2 and dy <= ry + try_ + 2:
            return True
    return False


def choose_donor(source: np.ndarray, cx: int, cy: int, rx: int, ry: int) -> tuple[int, int]:
    # Compare only a narrow receiver ring outside the repaint mask. It is guaranteed not to include
    # the rejected tuft, and matching it prevents a pasted rectangular or circular halo.
    oy, ox = ellipse_offsets(rx, ry, 1.04, 1.20)
    height, width = source.shape[:2]
    target = source[(cy + oy) % height, (cx + ox) % width].astype(np.int32)
    candidates = []
    margin_x, margin_y = rx + 4, ry + 4
    for donor_y in range(margin_y, source.shape[0] - margin_y, 3):
        for donor_x in range(margin_x, source.shape[1] - margin_x, 3):
            if overlaps_reviewed_tuft(donor_x, donor_y, rx, ry, width, height):
                continue
            donor = source[donor_y + oy, donor_x + ox].astype(np.int32)
            # RGB boundary error plus a small distance penalty avoids repeatedly borrowing one
            # distant semantic region when several donors are visually equivalent.
            error = int(np.square(donor - target).sum())
            distance = abs(donor_x - cx) + abs(donor_y - cy)
            candidates.append((error + distance * 12, donor_y, donor_x))
    if not candidates:
        raise RuntimeError(f"No tuft-free donor for {(cx, cy, rx, ry)}")
    _, donor_y, donor_x = min(candidates)
    return donor_x, donor_y


def main() -> None:
    source_image = Image.open(SOURCE).convert("RGBA")
    source = np.asarray(source_image)
    output = source.copy()
    full_mask = np.zeros(source.shape[:2], dtype=bool)
    donor_receipts = []

    for cx, cy, rx, ry in TUFTS:
        donor_x, donor_y = choose_donor(source, cx, cy, rx, ry)
        yy, xx = np.mgrid[-ry : ry + 1, -rx : rx + 1]
        mask = (xx / rx) ** 2 + (yy / ry) ** 2 <= 1.0
        target_y = (cy + yy) % source.shape[0]
        target_x = (cx + xx) % source.shape[1]
        donor_sample = source[donor_y + yy, donor_x + xx]
        output[target_y[mask], target_x[mask]] = donor_sample[mask]
        full_mask[target_y[mask], target_x[mask]] = True
        donor_receipts.append(
            {
                "receiver": [cx, cy],
                "radius": [rx, ry],
                "donor": [donor_x, donor_y],
            }
        )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(output).save(OUTPUT, optimize=True)

    proof = source_image.copy()
    draw = ImageDraw.Draw(proof, "RGBA")
    for cx, cy, rx, ry in TUFTS:
        draw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), outline=(255, 40, 180, 255), width=2)
    proof.save(MASK_PROOF, optimize=True)

    coordinate_proof = source_image.copy()
    coordinate_draw = ImageDraw.Draw(coordinate_proof, "RGBA")
    for coordinate in range(0, 512, 32):
        coordinate_draw.line((coordinate, 0, coordinate, 511), fill=(255, 40, 180, 120), width=1)
        coordinate_draw.line((0, coordinate, 511, coordinate), fill=(255, 40, 180, 120), width=1)
        coordinate_draw.text((coordinate + 2, 2), str(coordinate), fill=(255, 255, 255, 255))
        if coordinate:
            coordinate_draw.text((2, coordinate + 2), str(coordinate), fill=(255, 255, 255, 255))
    coordinate_proof.save(COORDINATE_PROOF, optimize=True)

    outside_preserved = bool(np.array_equal(output[~full_mask], source[~full_mask]))
    manifest = {
        "schemaVersion": 2,
        "packId": "guard-post-tuftless-ground-v011",
        "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        "ruling": (
            "Preserve the v010 turf palette and low-ground breakup; remove camera-facing baked "
            "tufts and author readable tufts as separate multi-bearing dressing."
        ),
        "method": "reviewed-mask same-parent pixel quilting; no generative replacement in output",
        "source": str(SOURCE.relative_to(ROOT)),
        "sourceSha256": sha256(SOURCE),
        "output": str(OUTPUT.relative_to(ROOT)),
        "outputSha256": sha256(OUTPUT),
        "size": list(source_image.size),
        "reviewedTuftCount": len(TUFTS),
        "outsideMaskByteExact": outside_preserved,
        "edgePolicy": (
            "toroidal reviewed masks cross the seamless boundary; unmasked boundary pixels remain "
            "byte-exact and wrapped donor samples remain continuous across the tile seam"
        ),
        "donorReceipts": donor_receipts,
        "semanticMaps": {
            "normal": "assets/materials/golden/guard-post/v004/ground-upland-turf-normal.png",
            "orm": "assets/materials/golden/guard-post/v004/ground-upland-turf-orm.png",
            "policy": "retained; existing maps contain no directional tuft silhouettes"
        },
        "separateTuftDressing": {
            "status": "PLANNED_NOT_YET_IMPLEMENTED",
            "requiredRepresentations": [
                "crossed sprite cluster",
                "shallow extrusion",
                "another reviewed four-bearing representation"
            ]
        },
        "fillReferenceOnly": {
            "path": (
                "assets/materials/golden/guard-post/v011/"
                "ground-upland-turf-imagegen-tuftless-fill-candidate-v001.png"
            ),
            "status": "NOT_CONSUMED_BY_THIS_OUTPUT"
        }
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    if not outside_preserved:
        raise RuntimeError("Tuftless packaging changed pixels outside reviewed masks")
    print(MANIFEST)


if __name__ == "__main__":
    main()
