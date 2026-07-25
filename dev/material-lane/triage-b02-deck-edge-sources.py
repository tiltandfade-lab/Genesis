#!/usr/bin/env python3
"""Build the culture-labeled source gate for B02 deck-edge candidates."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "dev/material-lane/source-sprites/b02-deck-edge-v001"
PROOF_DIR = ROOT / "dev/material-lane/proofs/b02-deck-edge-selected-v001"
BOARD = PROOF_DIR / "b02-deck-edge-selected-source-board-v001.png"
RECEIPT = PROOF_DIR / "b02-deck-edge-selected-source-receipt-v001.json"
SOURCES = (
    ("Institutional", "Dressed ashlar", "institutional-dressed-ashlar-source-v001.png", "raw ImageGen pass"),
    ("Institutional", "Frontier coursing", "institutional-frontier-coursed-source-v003.png", "ImageGen phase retry v003"),
    ("Upland", "Fitted rubble upstand", "upland-fitted-rubble-upstand-seamlocked-v001.png", "ImageGen v001 + 32px continuous-field lock"),
    ("Upland", "Heavy timber edge", "upland-heavy-timber-edge-source-v002.png", "ImageGen periodic retry v002"),
    ("Upland", "Timber-cribbed rubble", "upland-timber-cribbed-rubble-source-v001.png", "raw ImageGen pass"),
)


def rms(delta: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(delta.astype(np.float32)))))


def metrics(image: Image.Image) -> dict[str, float | bool]:
    arr = np.asarray(image.convert("RGB"), dtype=np.float32)
    x_jumps = np.sqrt(np.mean(np.square(arr[:, 1:] - arr[:, :-1]), axis=(0, 2)))
    y_jumps = np.sqrt(np.mean(np.square(arr[1:] - arr[:-1]), axis=(1, 2)))
    xb = rms(arr[:, 0] - arr[:, -1])
    yb = rms(arr[0] - arr[-1])
    xp = float(np.percentile(x_jumps, 95))
    yp = float(np.percentile(y_jumps, 95))
    xr = xb / max(xp, 0.001)
    yr = yb / max(yp, 0.001)
    return {
        "leftRightRms": round(xb, 3),
        "topBottomRms": round(yb, 3),
        "internalXJumpP95": round(xp, 3),
        "internalYJumpP95": round(yp, 3),
        "xBoundaryToInternalP95": round(xr, 3),
        "yBoundaryToInternalP95": round(yr, 3),
        "boundaryJumpGate": bool(xr <= 1.10 and yr <= 1.10),
    }


def repeat(image: Image.Image) -> Image.Image:
    tile = image.convert("RGB")
    result = Image.new("RGB", (tile.width * 3, tile.height * 3))
    for row in range(3):
        for column in range(3):
            result.paste(tile, (column * tile.width, row * tile.height))
    return result


def main() -> None:
    PROOF_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for culture, label, filename, method in SOURCES:
        source = SOURCE_DIR / filename
        image = Image.open(source).convert("RGB")
        results.append(
            {
                "culture": culture,
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
    draw.text((36, 26), "B02 DECK-EDGE CULTURE CANDIDATES — SELECTED SOURCE GATE", fill="#f4ead7", font=font)
    draw.text((36, 58), "Surface pattern only. Cover height, crenels, rails, caps, collision, and endpoints remain geometry-owned.", fill="#aeb8c8", font=font)
    draw.text((36, 86), "Left: complete source sprite. Right: locked-aspect 3x3 repeat. Gate <= 1.10x internal p95 on both axes.", fill="#aeb8c8", font=font)
    for index, item in enumerate(results):
        top = header + index * row_height
        draw.rectangle((0, top, width, top + row_height), fill="#1b202a" if index % 2 == 0 else "#171c25")
        culture_color = "#d8b66b" if item["culture"] == "Institutional" else "#8db39a"
        draw.text((36, top + 22), str(item["culture"]).upper(), fill=culture_color, font=font)
        draw.text((146, top + 22), str(item["label"]), fill="#f4ead7", font=font)
        passed = bool(item["metrics"]["boundaryJumpGate"])
        draw.text((36, top + 52), "TECH PASS" if passed else "REJECT", fill="#70d890" if passed else "#ff6b6b", font=font)
        draw.text(
            (36, top + 80),
            f"X {item['metrics']['xBoundaryToInternalP95']:.2f}x p95   Y {item['metrics']['yBoundaryToInternalP95']:.2f}x p95   {item['selectionMethod']}",
            fill="#ccd3df",
            font=font,
        )
        image = Image.open(ROOT / str(item["source"])).convert("RGB")
        single = ImageOps.fit(image, (300, 300), method=Image.Resampling.NEAREST)
        tiled = ImageOps.fit(repeat(image), (900, 300), method=Image.Resampling.NEAREST)
        board.paste(single, (36, top + 130))
        board.paste(tiled, (392, top + 130))
        for x in (692, 992):
            draw.line((x, top + 130, x, top + 429), fill="#ec5f67", width=1)
        for y in (top + 230, top + 330):
            draw.line((392, y, 1291, y), fill="#ec5f67", width=1)
    board.save(BOARD)
    payload = {
        "schema": "genesis.deck-edge-source-gate.v1",
        "coverInvariant": "all candidates bind to equal cover-class geometry; source sprites own surface construction only",
        "materialMakerApplied": False,
        "boundaryGateRatio": 1.10,
        "board": str(BOARD.relative_to(ROOT)),
        "results": results,
    }
    RECEIPT.write_text(json.dumps(payload, indent=2) + "\n")
    print(json.dumps(payload, indent=2))
    if not all(item["metrics"]["boundaryJumpGate"] for item in results):
        raise SystemExit("B02 selected source gate failed.")


if __name__ == "__main__":
    main()
