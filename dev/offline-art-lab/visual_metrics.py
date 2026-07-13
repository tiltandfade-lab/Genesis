#!/usr/bin/env python3
"""Structural visual measurements for mock/current-frame comparison.

This deliberately avoids pixel-registration metrics: a generated room is not expected to reproduce
the mock's exact pixels. It compares value distribution, edge/detail distribution, saliency placement,
negative-space proxy, saturation, and warm/cool balance. Those are diagnostic signals, never an
automatic taste verdict.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, sobel


REPO = Path(__file__).resolve().parents[2]
DEFAULT_OUT = Path("/private/tmp/genesis-offline-art-results/visual")
DEFAULT_PAIRS = [
    ("gloom", "ui-sketches/mock-frames/mock-01-gloom-combat.png", "dev/battle-gate/dungeon-loop/loop-02-room.png"),
    ("fantasy", "ui-sketches/mock-frames/vq-battle-scenes/01-fantasy-dungeon.png", "dev/battle-gate/wall-volumes/establishing.png"),
    ("octagon", "ui-sketches/mock-frames/vq-battle-scenes/12-gloom-octagon-room-shape.png", "dev/battle-gate/stage-c3-shapes/octagon.png"),
]


def load_rgb(path: Path, size=(640, 360)) -> np.ndarray:
    image = Image.open(path).convert("RGB")
    image.thumbnail(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, tuple(np.asarray(image.resize((1, 1)))[0, 0]))
    x = (size[0] - image.width) // 2
    y = (size[1] - image.height) // 2
    canvas.paste(image, (x, y))
    return np.asarray(canvas, dtype=np.float32) / 255.0


def grid_means(field: np.ndarray) -> list[float]:
    h, w = field.shape
    values = []
    for gy in range(3):
        for gx in range(3):
            cell = field[gy * h // 3 : (gy + 1) * h // 3, gx * w // 3 : (gx + 1) * w // 3]
            values.append(round(float(cell.mean()), 5))
    return values


def metrics(rgb: np.ndarray) -> tuple[dict, np.ndarray]:
    lum = rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    saturation = np.divide(mx - mn, np.maximum(mx, 1e-6))
    gx, gy = sobel(lum, axis=1), sobel(lum, axis=0)
    gradient = np.hypot(gx, gy) / 8.0
    local = np.abs(lum - gaussian_filter(lum, sigma=8.0))
    saliency = local * (0.65 + saturation * 0.35)
    saliency /= max(float(saliency.max()), 1e-8)

    yy, xx = np.indices(lum.shape)
    mass = float(saliency.sum())
    cx = float((xx * saliency).sum() / max(mass, 1e-8)) / lum.shape[1]
    cy = float((yy * saliency).sum() / max(mass, 1e-8)) / lum.shape[0]
    center_mask = (((xx / lum.shape[1]) - 0.5) / 0.34) ** 2 + (((yy / lum.shape[0]) - 0.5) / 0.34) ** 2 < 1

    block = 20
    quiet, total = 0, 0
    for y in range(0, lum.shape[0] - block + 1, block):
        for x in range(0, lum.shape[1] - block + 1, block):
            tile_l, tile_g = lum[y : y + block, x : x + block], gradient[y : y + block, x : x + block]
            quiet += int(float(tile_l.std()) < 0.045 and float(tile_g.mean()) < 0.035)
            total += 1

    p = np.histogram(lum, bins=64, range=(0, 1), density=False)[0].astype(np.float64)
    p /= max(p.sum(), 1)
    entropy = -float((p[p > 0] * np.log2(p[p > 0])).sum()) / math.log2(64)
    out = {
        "luminanceMean": round(float(lum.mean()), 5),
        "luminanceStd": round(float(lum.std()), 5),
        "darkFraction": round(float((lum < 0.22).mean()), 5),
        "midtoneFraction": round(float(((lum >= 0.22) & (lum < 0.72)).mean()), 5),
        "highlightFraction": round(float((lum >= 0.72).mean()), 5),
        "saturationMean": round(float(saturation.mean()), 5),
        "highSaturationFraction": round(float((saturation > 0.55).mean()), 5),
        "edgeDensity": round(float((gradient > 0.08).mean()), 5),
        "edgeGrid": grid_means(gradient),
        "luminanceGrid": grid_means(lum),
        "saliencyCentroid": [round(cx, 5), round(cy, 5)],
        "centralSaliencyFraction": round(float(saliency[center_mask].sum() / max(mass, 1e-8)), 5),
        "negativeSpaceProxy": round(quiet / max(total, 1), 5),
        "warmCoolBias": round(float((rgb[..., 0] - rgb[..., 2]).mean()), 5),
        "luminanceEntropy": round(entropy, 5),
    }
    return out, saliency


def compare(a: dict, b: dict) -> dict:
    scalar_keys = [
        "luminanceMean", "luminanceStd", "darkFraction", "midtoneFraction", "highlightFraction",
        "saturationMean", "highSaturationFraction", "edgeDensity", "centralSaliencyFraction",
        "negativeSpaceProxy", "warmCoolBias", "luminanceEntropy",
    ]
    deltas = {key: round(b[key] - a[key], 5) for key in scalar_keys}
    deltas["saliencyCentroidDistance"] = round(math.dist(a["saliencyCentroid"], b["saliencyCentroid"]), 5)
    deltas["edgeGridMeanAbsDelta"] = round(float(np.mean(np.abs(np.array(a["edgeGrid"]) - np.array(b["edgeGrid"])))), 5)
    deltas["luminanceGridMeanAbsDelta"] = round(float(np.mean(np.abs(np.array(a["luminanceGrid"]) - np.array(b["luminanceGrid"])))), 5)
    return deltas


def overlay(rgb: np.ndarray, saliency: np.ndarray, destination: Path) -> None:
    base = Image.fromarray(np.uint8(np.clip(rgb * 255, 0, 255)), "RGB")
    draw = ImageDraw.Draw(base)
    for x in (base.width // 3, base.width * 2 // 3):
        draw.line((x, 0, x, base.height), fill=(255, 255, 255), width=1)
    for y in (base.height // 3, base.height * 2 // 3):
        draw.line((0, y, base.width, y), fill=(255, 255, 255), width=1)
    yy, xx = np.indices(saliency.shape)
    mass = max(float(saliency.sum()), 1e-8)
    cx, cy = int((xx * saliency).sum() / mass), int((yy * saliency).sum() / mass)
    draw.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), outline=(255, 70, 40), width=3)
    destination.parent.mkdir(parents=True, exist_ok=True)
    base.save(destination)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    report = {"schema": "genesis.visual-metrics.v1", "pairs": {}}
    for name, ref_rel, current_rel in DEFAULT_PAIRS:
        ref_rgb, cur_rgb = load_rgb(REPO / ref_rel), load_rgb(REPO / current_rel)
        ref_metrics, ref_saliency = metrics(ref_rgb)
        cur_metrics, cur_saliency = metrics(cur_rgb)
        overlay(ref_rgb, ref_saliency, args.out_dir / f"{name}-reference-overlay.png")
        overlay(cur_rgb, cur_saliency, args.out_dir / f"{name}-current-overlay.png")
        report["pairs"][name] = {
            "reference": ref_rel, "current": current_rel,
            "referenceMetrics": ref_metrics, "currentMetrics": cur_metrics,
            "currentMinusReference": compare(ref_metrics, cur_metrics),
        }
    (args.out_dir / "metrics.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
