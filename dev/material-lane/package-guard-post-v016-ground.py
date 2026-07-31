#!/usr/bin/env python3
"""Package the 30-ft Guard Post turf parent at the canonical 32 px/ft density.

The ImageGen edit is retained verbatim under v016/source. This packager:
- resamples it to the exact 960×960 physical envelope with nearest sampling;
- palette-quantizes without dithering so authored pixel clusters remain explicit;
- seam-locks opposite borders through bounded paired crossfades;
- derives restrained normal and ORM companions from the final albedo;
- writes an auditable manifest without approving the candidate.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageFilter, ImageStat


ROOT = Path(__file__).resolve().parents[2]
SIZE = 960
SEAM_MARGIN = 72


def smooth01(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3.0 - 2.0 * value)


def paired_seam_lock(data: np.ndarray, axis: int, margin: int) -> np.ndarray:
    """Blend paired opposite borders to one exact periodic sample."""
    result = data.astype(np.float32).copy()
    length = result.shape[axis]
    source = result.copy()
    for offset in range(margin):
        inside = smooth01(offset / max(1, margin - 1))
        lo = offset
        hi = length - 1 - offset
        lo_slice = [slice(None)] * result.ndim
        hi_slice = [slice(None)] * result.ndim
        lo_slice[axis] = lo
        hi_slice[axis] = hi
        lo_value = source[tuple(lo_slice)]
        hi_value = source[tuple(hi_slice)]
        seam_value = (lo_value + hi_value) * 0.5
        result[tuple(lo_slice)] = seam_value * (1.0 - inside) + lo_value * inside
        result[tuple(hi_slice)] = seam_value * (1.0 - inside) + hi_value * inside
    return np.clip(np.rint(result), 0, 255).astype(np.uint8)


def edge_mae(image: Image.Image) -> dict[str, float]:
    rgb = image.convert("RGB")
    width, height = rgb.size

    def mae(a: Image.Image, b: Image.Image) -> float:
        return float(sum(ImageStat.Stat(ImageChops.difference(a, b)).mean) / 3)

    return {
        "leftRight": round(
            mae(
                rgb.crop((0, 0, 1, height)).resize((16, height)),
                rgb.crop((width - 1, 0, width, height)).resize((16, height)),
            ),
            4,
        ),
        "topBottom": round(
            mae(
                rgb.crop((0, 0, width, 1)).resize((width, 16)),
                rgb.crop((0, height - 1, width, height)).resize((width, 16)),
            ),
            4,
        ),
    }


def derive_normal_and_orm(albedo: Image.Image) -> tuple[Image.Image, Image.Image]:
    rgb = np.asarray(albedo.convert("RGB"), dtype=np.float32) / 255.0
    luma = rgb[:, :, 0] * 0.2126 + rgb[:, :, 1] * 0.7152 + rgb[:, :, 2] * 0.0722
    # Periodic central differences keep the data maps seam-compatible with the locked albedo.
    dx = (np.roll(luma, -1, axis=1) - np.roll(luma, 1, axis=1)) * 0.72
    dy = (np.roll(luma, -1, axis=0) - np.roll(luma, 1, axis=0)) * 0.72
    normal = np.dstack((-dx, dy, np.ones_like(luma)))
    normal /= np.maximum(np.linalg.norm(normal, axis=2, keepdims=True), 1e-6)
    normal_rgb = np.clip(np.rint((normal * 0.5 + 0.5) * 255), 0, 255).astype(np.uint8)

    local_average = (
        luma
        + np.roll(luma, 1, 0)
        + np.roll(luma, -1, 0)
        + np.roll(luma, 1, 1)
        + np.roll(luma, -1, 1)
    ) / 5.0
    occlusion = np.clip(0.86 + (luma - local_average) * 0.42, 0.7, 1.0)
    roughness = np.clip(0.9 + (0.5 - np.abs(luma - 0.5)) * 0.1, 0.88, 0.98)
    orm = np.dstack((occlusion, roughness, np.zeros_like(luma)))
    orm_rgb = np.clip(np.rint(orm * 255), 0, 255).astype(np.uint8)
    return Image.fromarray(normal_rgb), Image.fromarray(orm_rgb)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", default="v016", choices=["v016", "v017", "v018"])
    args = parser.parse_args()
    pack = ROOT / "assets/materials/golden/guard-post" / args.version
    source_path = pack / "source/ground-upland-turf-imagegen-source.png"
    albedo_path = pack / "ground-upland-turf-30ft-32ppf-albedo.png"
    normal_path = pack / "ground-upland-turf-30ft-32ppf-normal.png"
    orm_path = pack / "ground-upland-turf-30ft-32ppf-orm.png"
    manifest_path = pack / "manifest.json"
    pack.mkdir(parents=True, exist_ok=True)
    source = Image.open(source_path).convert("RGB")
    if args.version == "v018":
        # v011's reviewed macro composition is authoritative. v017 contributes only local
        # high-frequency articulation after a broad blur is removed, so it cannot redistribute
        # moss/soil masses or erase quiet zones.
        macro = Image.open(
            ROOT / "assets/materials/golden/guard-post/v011/ground-upland-turf-albedo.png"
        ).convert("RGB").resize((SIZE, SIZE), Image.Resampling.NEAREST)
        detail = source.resize((SIZE, SIZE), Image.Resampling.NEAREST)
        detail_blur = detail.filter(ImageFilter.BoxBlur(7))
        macro_data = np.asarray(macro, dtype=np.float32)
        detail_data = np.asarray(detail, dtype=np.float32)
        blur_data = np.asarray(detail_blur, dtype=np.float32)
        resized = Image.fromarray(
            np.clip(np.rint(macro_data + (detail_data - blur_data) * 0.28), 0, 255)
            .astype(np.uint8)
        )
    else:
        resized = source.resize((SIZE, SIZE), Image.Resampling.NEAREST)
    # No error-diffusion: its high-frequency noise would compete with authored clusters.
    quantized = resized.quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    quantized_rgb = quantized.convert("RGB")
    data = np.asarray(quantized_rgb, dtype=np.uint8)
    data = paired_seam_lock(data, axis=1, margin=SEAM_MARGIN)
    data = paired_seam_lock(data, axis=0, margin=SEAM_MARGIN)
    albedo = Image.fromarray(data)
    albedo.save(albedo_path)
    normal, orm = derive_normal_and_orm(albedo)
    normal.save(normal_path)
    orm.save(orm_path)

    visual_verdicts = {
        "v016": {
            "status": "REJECTED_IN_CONTEXT",
            "reason": "beige micro-pattern suppresses selected broad olive masses",
        },
        "v017": {
            "status": "REJECTED_IN_CONTEXT",
            "reason": "uniform moss-cushion carpet loses v011 irregular macro composition",
        },
        "v018": {
            "status": "PENDING_IN_CONTEXT_REVIEW",
            "reason": "v011-authoritative macro plus bounded v017 high-frequency articulation",
        },
    }
    manifest = {
        "schema": "GuardPostGroundMaterialPack" + args.version.upper(),
        "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        "source": str(source_path.relative_to(ROOT)),
        "sourceRole": "ImageGen precise-object-edit of v011 visual identity",
        "visualVerdict": visual_verdicts[args.version],
        "macroAuthority": (
            "assets/materials/golden/guard-post/v011/ground-upland-turf-albedo.png"
            if args.version == "v018"
            else None
        ),
        "detailContribution": (
            {"source": str(source_path.relative_to(ROOT)), "highPassStrength": 0.28,
             "blurRadiusPixels": 7}
            if args.version == "v018"
            else None
        ),
        "physicalEnvelope": {
            "widthFeet": 30,
            "heightFeet": 30,
            "combatCells": [6, 6],
            "pixelsPerFoot": 32,
            "exactPixelSize": [SIZE, SIZE],
        },
        "outputs": {
            "albedo": str(albedo_path.relative_to(ROOT)),
            "normal": str(normal_path.relative_to(ROOT)),
            "orm": str(orm_path.relative_to(ROOT)),
        },
        "sampling": {
            "albedo": "nearest-no-mipmap",
            "normalOrm": "linear-trilinear-mipmap",
            "paletteColors": 96,
            "resample": "nearest",
        },
        "seamLock": {
            "method": "bounded-paired-opposite-border-crossfade",
            "marginPixels": SEAM_MARGIN,
            "edgeMae": edge_mae(albedo),
            "exactBoundaryMatch": edge_mae(albedo)
            == {"leftRight": 0.0, "topBottom": 0.0},
        },
        "contentLaw": {
            "cameraNeutral": True,
            "bakedUprightTufts": False,
            "separateSemanticTuftDressingRequired": True,
            "mechanicalEffect": "none",
        },
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
