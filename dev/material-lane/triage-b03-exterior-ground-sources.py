#!/usr/bin/env python3
"""Measure and render the B03 exterior-ground source-sprite gate."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "dev/material-lane/source-sprites/b03-exterior-ground-v001"
PROOF_DIR = ROOT / "dev/material-lane/proofs/b03-exterior-ground-v001"
BOARD = PROOF_DIR / "b03-exterior-ground-selected-source-board-v003.png"
RECEIPT = PROOF_DIR / "b03-exterior-ground-selected-source-receipt-v003.json"
SOURCES = (
    ("grass-meadow", "Grass / meadow", "grass-meadow-selected-v001.png", "ImageGen v001 + 48px lock + 512px normalization"),
    ("worn-path", "Worn path", "worn-path-selected-v001.png", "raw ImageGen v001 + 512px normalization"),
    ("mud", "Mud", "mud-selected-v001.png", "ImageGen v001 + 32px lock + 512px normalization"),
    ("gravel-scree", "Gravel / scree", "gravel-scree-selected-v001.png", "ImageGen v001 + 32px lock + 512px normalization"),
    ("marsh-bog", "Marsh / bog", "marsh-bog-selected-v001.png", "ImageGen v001 + 40px lock + 512px normalization"),
)


def rms(delta: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(delta.astype(np.float32)))))


def metrics(image: Image.Image) -> dict[str, float | bool]:
    array = np.asarray(image.convert("RGB"), dtype=np.float32)
    x_jumps = np.sqrt(np.mean(np.square(array[:, 1:] - array[:, :-1]), axis=(0, 2)))
    y_jumps = np.sqrt(np.mean(np.square(array[1:] - array[:-1]), axis=(1, 2)))
    x_boundary = rms(array[:, 0] - array[:, -1])
    y_boundary = rms(array[0] - array[-1])
    x_p95 = float(np.percentile(x_jumps, 95))
    y_p95 = float(np.percentile(y_jumps, 95))
    x_ratio = x_boundary / max(x_p95, 0.001)
    y_ratio = y_boundary / max(y_p95, 0.001)
    return {
        "leftRightRms": round(x_boundary, 3),
        "topBottomRms": round(y_boundary, 3),
        "internalXJumpP95": round(x_p95, 3),
        "internalYJumpP95": round(y_p95, 3),
        "xBoundaryToInternalP95": round(x_ratio, 3),
        "yBoundaryToInternalP95": round(y_ratio, 3),
        "boundaryJumpGate": bool(x_ratio <= 1.10 and y_ratio <= 1.10),
    }


def repeated(image: Image.Image) -> Image.Image:
    tile = image.convert("RGB")
    result = Image.new("RGB", (tile.width * 3, tile.height * 3))
    for row in range(3):
        for column in range(3):
            result.paste(tile, (column * tile.width, row * tile.height))
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--allow-fail", action="store_true")
    args = parser.parse_args()
    PROOF_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for material_id, label, filename, method in SOURCES:
        source = SOURCE_DIR / filename
        image = Image.open(source).convert("RGB")
        results.append(
            {
                "id": material_id,
                "label": label,
                "source": str(source.relative_to(ROOT)),
                "selectionMethod": method,
                "dimensions": list(image.size),
                "metrics": metrics(image),
            }
        )

    width, header, row_height = 1680, 130, 470
    board = Image.new("RGB", (width, header + row_height * len(results)), "#11151c")
    draw = ImageDraw.Draw(board)
    font = ImageFont.load_default()
    draw.text((36, 26), "B03 EXTERIOR GROUND — SELECTED SOURCE GATE", fill="#f4ead7", font=font)
    draw.text((36, 58), "Top-down source sprites. Raw pass retained where possible; narrow continuous-field locks declared where used.", fill="#aeb8c8", font=font)
    draw.text((36, 86), "Numerical gate: each wrapped boundary <= 1.10x its ordinary internal p95 jump.", fill="#aeb8c8", font=font)
    for index, item in enumerate(results):
        top = header + index * row_height
        draw.rectangle((0, top, width, top + row_height), fill="#1b202a" if index % 2 == 0 else "#171c25")
        draw.text((36, top + 22), str(item["label"]).upper(), fill="#d8b66b", font=font)
        passed = bool(item["metrics"]["boundaryJumpGate"])
        draw.text((36, top + 52), "TECH PASS" if passed else "RETRY / REPAIR", fill="#70d890" if passed else "#ff6b6b", font=font)
        draw.text(
            (36, top + 80),
            f"X {item['metrics']['xBoundaryToInternalP95']:.3f}x p95   Y {item['metrics']['yBoundaryToInternalP95']:.3f}x p95   {item['selectionMethod']}",
            fill="#ccd3df",
            font=font,
        )
        image = Image.open(ROOT / str(item["source"])).convert("RGB")
        single = ImageOps.fit(image, (300, 300), method=Image.Resampling.NEAREST)
        tiled = ImageOps.fit(repeated(image), (900, 300), method=Image.Resampling.NEAREST)
        board.paste(single, (36, top + 130))
        board.paste(tiled, (392, top + 130))
        for x in (692, 992):
            draw.line((x, top + 130, x, top + 429), fill="#ec5f67", width=1)
        for y in (top + 230, top + 330):
            draw.line((392, y, 1291, y), fill="#ec5f67", width=1)
    board.save(BOARD)
    payload = {
        "schema": "genesis.exterior-ground-source-gate.v1",
        "materialMakerApplied": False,
        "boundaryGateRatio": 1.10,
        "board": str(BOARD.relative_to(ROOT)),
        "results": results,
    }
    RECEIPT.write_text(json.dumps(payload, indent=2) + "\n")
    print(json.dumps(payload, indent=2))
    if not args.allow_fail and not all(item["metrics"]["boundaryJumpGate"] for item in results):
        raise SystemExit("B03 source gate failed.")


if __name__ == "__main__":
    main()
