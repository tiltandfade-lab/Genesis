#!/usr/bin/env python3
"""Pack Guard Post condition cutouts into one deterministic runtime trim atlas.

The source art remains parent-independent RGBA. This packer owns only layout, a repeat-safe
horizontal grime band, and two explicitly paired corner-ivy faces. Geometry and engine facts own
contact topology, projection, maintenance interruption, and every mechanical consequence.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SOURCE = ROOT / "assets/materials/golden/guard-post/v008"
OUT = ROOT / "assets/materials/golden/guard-post/v009"
SIZE = 1024


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def alpha_crop(image: Image.Image, padding: int = 4) -> Image.Image:
    rgba = image.convert("RGBA")
    box = rgba.getchannel("A").getbbox()
    if box is None:
        raise RuntimeError("condition source has no visible alpha")
    left = max(0, box[0] - padding)
    top = max(0, box[1] - padding)
    right = min(rgba.width, box[2] + padding)
    bottom = min(rgba.height, box[3] + padding)
    return rgba.crop((left, top, right, bottom))


def contain(image: Image.Image, width: int, height: int) -> Image.Image:
    return ImageOps.contain(image.convert("RGBA"), (width, height), Image.Resampling.NEAREST)


def periodic_x(image: Image.Image, margin: int = 96) -> Image.Image:
    """Make the outer X edges identical while preserving the authored interior."""
    rgba = np.asarray(image.convert("RGBA"), dtype=np.float32)
    out = rgba.copy()
    width = rgba.shape[1]
    for offset in range(margin):
        strength = (1.0 - offset / max(1, margin - 1)) ** 2
        left = rgba[:, offset, :]
        right = rgba[:, width - 1 - offset, :]
        average = (left + right) * 0.5
        out[:, offset, :] = left * (1.0 - strength) + average * strength
        out[:, width - 1 - offset, :] = right * (1.0 - strength) + average * strength
    return Image.fromarray(np.uint8(np.rint(np.clip(out, 0, 255))))


def paste_center(
    atlas: Image.Image,
    image: Image.Image,
    rect: tuple[int, int, int, int],
    gutter: int = 12,
) -> None:
    x, y, width, height = rect
    # A real transparent gutter remains inside every discrete slot. Runtime UVs also inset by half
    # a texel; the two safeguards address different failures (packed art touching a boundary versus
    # the sampler selecting a neighbouring boundary texel).
    fitted = contain(image, max(1, width - gutter * 2), max(1, height - gutter * 2))
    atlas.alpha_composite(fitted, (x + (width - fitted.width) // 2, y + (height - fitted.height) // 2))


def paste_corner_face(
    atlas: Image.Image,
    image: Image.Image,
    rect: tuple[int, int, int, int],
    shared_edge: str,
    free_edge_gutter: int = 16,
    top_gutter: int = 12,
) -> None:
    """Bottom-align a paired ivy face and make its shared corner edge alpha-bearing."""
    x, y, width, height = rect
    fitted = contain(
        image,
        max(1, width - free_edge_gutter),
        max(1, height - top_gutter),
    )
    px = x if shared_edge == "left" else x + width - fitted.width
    py = y + height - fitted.height
    atlas.alpha_composite(fitted, (px, py))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    atlas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))

    grime_source = alpha_crop(
        Image.open(SOURCE / "lower-wall-grime-stain-runtime-albedo-alpha.png"))
    grime_band = grime_source.resize((SIZE, 256), Image.Resampling.NEAREST)
    grime_band = periodic_x(grime_band)
    atlas.alpha_composite(grime_band, (0, 0))

    moss_source = alpha_crop(Image.open(SOURCE / "seam-moss-runtime-albedo-alpha.png"))
    moss_rect = (128, 256, 768, 256)
    paste_center(atlas, moss_source, moss_rect)

    # No crop padding at the paired edge: the two projected faces meet at a real outer-corner
    # endpoint, so the art must also carry alpha to that endpoint. A centred card with equal gutters
    # on all four sides produced a perfectly uniform clean stripe at the corner.
    ivy_source = alpha_crop(
        Image.open(SOURCE / "corner-ivy-runtime-albedo-alpha.png"), padding=0)
    ivy_a_rect = (128, 512, 256, 256)
    ivy_b_rect = (640, 512, 256, 256)
    paste_corner_face(atlas, ivy_source, ivy_a_rect, shared_edge="left")
    paste_corner_face(
        atlas, ImageOps.mirror(ivy_source), ivy_b_rect, shared_edge="right")

    # Endpoint slots derive from the same repeat-safe grime band and fade only their free edge.
    grime_array = np.asarray(grime_band, dtype=np.uint8).copy()
    left_end = grime_array[:, :256, :].copy()
    right_end = grime_array[:, -256:, :].copy()
    fade = np.linspace(0, 1, 256, dtype=np.float32)
    left_end[:, :, 3] = np.uint8(np.rint(left_end[:, :, 3] * fade[None, :]))
    right_end[:, :, 3] = np.uint8(np.rint(right_end[:, :, 3] * fade[::-1][None, :]))
    atlas.alpha_composite(Image.fromarray(left_end), (0, 768))
    atlas.alpha_composite(Image.fromarray(right_end), (256, 768))

    # A compact column/drain junction pocket remains a discrete socket, not a repeated wall band.
    junction_rect = (640, 768, 256, 256)
    paste_center(atlas, moss_source, junction_rect)

    atlas_path = OUT / "guard-post-condition-trim-h4-v1-albedo-alpha-1024.png"
    atlas.save(atlas_path)
    runtime_path = OUT / "guard-post-condition-trim-h4-v1-albedo-alpha-512.png"
    atlas.resize((512, 512), Image.Resampling.NEAREST).save(runtime_path)

    slots = [
        {
            "id": "lower-wall-grime-repeat",
            "rectPx": [0, 0, 1024, 256],
            "uv": [0, 0.75, 1, 0.25],
            "sampleInsetPx": 0.5,
            "wrap": "repeat-x-clamp-y",
            "repeatWorldLength": 3.3,
            "semantic": "continuous wall-ground accumulation"
        },
        {
            "id": "seam-moss-pocket",
            "rectPx": list(moss_rect),
            "uv": [0.125, 0.5, 0.75, 0.25],
            "gutterPx": 6,
            "sampleInsetPx": 0.5,
            "wrap": "clamp",
            "semantic": "unequal seam/drain/step moss island"
        },
        {
            "id": "corner-ivy-face-a",
            "pairRef": "corner-ivy-wrap-01",
            "rectPx": list(ivy_a_rect),
            "uv": [0.125, 0.25, 0.25, 0.25],
            "sharedEdge": "left",
            "freeEdgeGutterPx": 8,
            "topGutterPx": 6,
            "bottomAligned": True,
            "sampleInsetPx": 0.5,
            "wrap": "clamp",
            "semantic": "first face of wall-wall plus wall-floor growth"
        },
        {
            "id": "corner-ivy-face-b",
            "pairRef": "corner-ivy-wrap-01",
            "rectPx": list(ivy_b_rect),
            "uv": [0.625, 0.25, 0.25, 0.25],
            "sharedEdge": "right",
            "freeEdgeGutterPx": 8,
            "topGutterPx": 6,
            "bottomAligned": True,
            "sampleInsetPx": 0.5,
            "wrap": "clamp",
            "semantic": "second face of wall-wall plus wall-floor growth"
        },
        {
            "id": "lower-wall-grime-left-end",
            "rectPx": [0, 768, 256, 256],
            "uv": [0, 0, 0.25, 0.25],
            "sampleInsetPx": 0.5,
            "wrap": "clamp",
            "semantic": "free-edge fade"
        },
        {
            "id": "lower-wall-grime-right-end",
            "rectPx": [256, 768, 256, 256],
            "uv": [0.25, 0, 0.25, 0.25],
            "sampleInsetPx": 0.5,
            "wrap": "clamp",
            "semantic": "free-edge fade"
        },
        {
            "id": "column-drain-junction-moss",
            "rectPx": list(junction_rect),
            "uv": [0.625, 0, 0.25, 0.25],
            "gutterPx": 6,
            "sampleInsetPx": 0.5,
            "wrap": "clamp",
            "semantic": "column base, outfall foot, stair return, or curb junction"
        }
    ]
    manifest = {
        "schemaVersion": 1,
        "schema": "genesis.condition-trim.h4-v1",
        "packId": "guard-post-condition-trim-v009",
        "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        "parentPack": "assets/materials/golden/guard-post/v008/manifest.json",
        "workflow": "ImageGen cutouts -> keyed RGBA -> deterministic condition trim packing",
        "ownership": {
            "sheet": ["condition color", "coverage alpha", "repeat/end/corner visual vocabulary"],
            "engine": ["contact topology", "placement", "flow", "maintenance", "mutation"],
            "materialMakerOptional": ["restrained roughness", "optional shallow normal", "affinity mutation"],
            "parent": ["construction rhythm", "base normal", "base ORM", "lighting response"]
        },
        "atlas": {
            "master": str(atlas_path.relative_to(ROOT)),
            "masterSha256": sha(atlas_path),
            "runtime": str(runtime_path.relative_to(ROOT)),
            "runtimeSha256": sha(runtime_path),
            "size": [512, 512]
        },
        "uvOrigin": "bottom-left",
        "slots": slots,
        "negativeControls": [
            "one stretched wall decal",
            "one independent decal per terrain tile",
            "Material Maker deciding corner topology",
            "condition sprite containing parent masonry shadows"
        ]
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"PASS: packed {len(slots)} condition trim slots into {runtime_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
