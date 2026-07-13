#!/usr/bin/env python3
"""Deterministic texture-foundry probes: periodic seams, inpainting, dilation, and PBR channels."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path

TOOLS = Path(os.environ.get("GENESIS_OFFLINE_ART_TOOLS", "/private/tmp/genesis-offline-art-tools"))
sys.path.insert(0, str(TOOLS))

import cv2
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, gaussian_filter, sobel


REPO = Path(__file__).resolve().parents[2]
DEFAULT_OUT = Path("/private/tmp/genesis-offline-art-results/texture")


def seam_score(rgb: np.ndarray) -> float:
    rgb = rgb.astype(np.float32) / 255.0
    lr = np.abs(rgb[:, 0] - rgb[:, -1]).mean()
    tb = np.abs(rgb[0] - rgb[-1]).mean()
    return float((lr + tb) * 0.5)


def make_tileable(rgb: np.ndarray, band: int = 14) -> np.ndarray:
    h, w = rgb.shape[:2]
    shifted = np.roll(np.roll(rgb, h // 2, axis=0), w // 2, axis=1)
    mask = np.zeros((h, w), dtype=np.uint8)
    mask[max(0, h // 2 - band) : min(h, h // 2 + band + 1), :] = 255
    mask[:, max(0, w // 2 - band) : min(w, w // 2 + band + 1)] = 255
    repaired = cv2.inpaint(shifted, mask, 5, cv2.INPAINT_TELEA)
    return np.roll(np.roll(repaired, -(h // 2), axis=0), -(w // 2), axis=1)


def rgba_dilate(source: np.ndarray, gutter: int = 8) -> tuple[np.ndarray, dict]:
    h, w = source.shape[:2]
    canvas = np.zeros((h + gutter * 2, w + gutter * 2, 4), dtype=np.uint8)
    canvas[gutter : gutter + h, gutter : gutter + w] = source
    opaque = canvas[..., 3] > 0
    distances, indices = distance_transform_edt(~opaque, return_indices=True)
    nearest_rgb = canvas[indices[0], indices[1], :3]
    transparent = ~opaque
    canvas[transparent, :3] = nearest_rgb[transparent]
    dilation_band = transparent & (distances <= gutter)
    report = {
        "gutter": gutter,
        "opaquePixels": int(opaque.sum()),
        "transparentPixels": int(transparent.sum()),
        "transparentPixelsWithDilatedRgb": int(((canvas[..., :3].sum(axis=2) > 0) & transparent).sum()),
        "dilationBandPixels": int(dilation_band.sum()),
        "dilationBandMatchesNearestOpaque": bool(np.array_equal(canvas[dilation_band, :3], nearest_rgb[dilation_band])),
        "alphaPreserved": bool(np.array_equal(canvas[gutter : gutter + h, gutter : gutter + w, 3], source[..., 3])),
    }
    return canvas, report


def derive_channels(rgb: np.ndarray, strength: float = 2.2) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    f = rgb.astype(np.float32) / 255.0
    height = f[..., 0] * 0.2126 + f[..., 1] * 0.7152 + f[..., 2] * 0.0722
    height = gaussian_filter(height, sigma=0.8)
    dx, dy = sobel(height, axis=1) / 8.0, sobel(height, axis=0) / 8.0
    normal = np.dstack((-dx * strength, -dy * strength, np.ones_like(height)))
    normal /= np.maximum(np.linalg.norm(normal, axis=2, keepdims=True), 1e-8)
    normal_png = np.uint8(np.clip(normal * 0.5 + 0.5, 0, 1) * 255)
    local_detail = np.abs(height - gaussian_filter(height, sigma=5.0))
    roughness = np.uint8(np.clip(0.72 - local_detail * 2.4, 0.28, 0.92) * 255)
    return np.uint8(height * 255), normal_png, roughness


def sha(array: np.ndarray) -> str:
    return hashlib.sha256(array.tobytes()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--texture", default="assets/textures/fantasy-wall-1.png")
    parser.add_argument("--cutout", default="assets/dressing/fantasy-flora-ivywall.png")
    args = parser.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)

    source = np.asarray(Image.open(REPO / args.texture).convert("RGB").resize((256, 256), Image.Resampling.LANCZOS))
    tiled_a, tiled_b = make_tileable(source), make_tileable(source)
    before, after = seam_score(source), seam_score(tiled_a)

    h, w = source.shape[:2]
    yy, xx = np.indices((h, w))
    hole_mask = ((xx - w * 0.62) ** 2 + (yy - h * 0.47) ** 2 < (min(h, w) * 0.11) ** 2).astype(np.uint8) * 255
    damaged = source.copy(); damaged[hole_mask > 0] = 0
    telea = cv2.inpaint(damaged, hole_mask, 5, cv2.INPAINT_TELEA)
    ns = cv2.inpaint(damaged, hole_mask, 5, cv2.INPAINT_NS)
    region = hole_mask > 0
    telea_mae = float(np.abs(telea.astype(np.float32) - source)[region].mean())
    ns_mae = float(np.abs(ns.astype(np.float32) - source)[region].mean())
    mean_fill = damaged.copy(); mean_fill[region] = source[~region].mean(axis=0).astype(np.uint8)
    mean_mae = float(np.abs(mean_fill.astype(np.float32) - source)[region].mean())

    cutout = np.asarray(Image.open(REPO / args.cutout).convert("RGBA").resize((192, 192), Image.Resampling.LANCZOS))
    dilated, dilation_report = rgba_dilate(cutout)
    height, normal, roughness = derive_channels(tiled_a)
    Image.fromarray(tiled_a).save(args.out_dir / "tileable.png")
    Image.fromarray(damaged).save(args.out_dir / "inpaint-damaged.png")
    Image.fromarray(telea).save(args.out_dir / "inpaint-telea.png")
    Image.fromarray(ns).save(args.out_dir / "inpaint-navier-stokes.png")
    Image.fromarray(dilated).save(args.out_dir / "dilated-cutout.png")
    Image.fromarray(height).save(args.out_dir / "height.png")
    Image.fromarray(normal).save(args.out_dir / "normal.png")
    Image.fromarray(roughness).save(args.out_dir / "roughness.png")

    report = {
        "schema": "genesis.texture-foundry-probe.v1",
        "source": args.texture,
        "tileability": {
            "beforeEdgeMae": round(before, 6), "afterEdgeMae": round(after, 6),
            "improvementFraction": round((before - after) / max(before, 1e-9), 6),
            "deterministic": bool(np.array_equal(tiled_a, tiled_b)), "outputSha256": sha(tiled_a),
        },
        "inpainting": {
            "maskedPixels": int(region.sum()), "teleaMae": round(telea_mae, 4),
            "navierStokesMae": round(ns_mae, 4), "meanFillMae": round(mean_mae, 4),
            "best": min((telea_mae, "telea"), (ns_mae, "navier-stokes"), (mean_mae, "mean-fill"))[1],
        },
        "dilation": dilation_report,
        "channels": {
            "heightRange": [int(height.min()), int(height.max())],
            "normalMeanZ": round(float((normal[..., 2].astype(np.float32) / 255.0 * 2 - 1).mean()), 5),
            "roughnessRange": [int(roughness.min()), int(roughness.max())],
        },
    }
    (args.out_dir / "metrics.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
