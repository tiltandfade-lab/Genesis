#!/usr/bin/env python3
"""Pack verified B06 MM strips into deterministic h6-v1 trim sheets."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
MANIFEST = HERE / "manifests/b06-trim-imagegen-mm-v001.source.json"
MM = HERE / "exports/b06-trim-imagegen-mm-v001"
OUT = HERE / "exports/b06-trim-packed-v001"
PROOF = HERE / "proofs/b06-trim-packed-v001"
RECEIPT = HERE / "receipts/b06-trim-packed-v001-receipt.json"
CHANNELS = {
    "basecolor": "_albedo.png",
    "normal": "_normal.png",
    "orm": "_orm.png",
    "height": "_heightmap.png",
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def affinity(height: Image.Image) -> Image.Image:
    h = np.asarray(height.convert("L"), dtype=np.float32) / 255
    blur = np.asarray(height.convert("L").filter(ImageFilter.GaussianBlur(9)), dtype=np.float32) / 255
    cavity = np.clip((blur - h) * 4 + .18 * (1 - h), 0, 1)
    gy, gx = np.gradient(h)
    edge = np.clip(np.hypot(gx, gy) * 12, 0, 1)
    ledge = np.clip(-gy * 18 + cavity * .35, 0, 1)
    rgba = np.dstack((cavity, edge, ledge, np.ones_like(h)))
    return Image.fromarray(np.uint8(np.rint(rgba * 255)), "RGBA")


def strip(image: Image.Image, safe_height: int) -> Image.Image:
    y = (image.height - safe_height) // 2
    return image.crop((0, y, image.width, y + safe_height))


def pack(run: str, culture: str, materials: list[dict]) -> dict:
    destination = OUT / run
    destination.mkdir(parents=True, exist_ok=True)
    sheets = {}
    for channel in ("basecolor", "normal", "orm", "affinity"):
        mode = "RGBA" if channel == "affinity" else "RGB"
        neutral = (0, 0, 0, 0) if channel == "affinity" else ((128, 128, 255) if channel == "normal" else (0, 0, 0))
        sheet = Image.new(mode, (1024, 1024), neutral)
        for item in materials:
            stem = Path(item["graph"]).stem
            if channel == "affinity":
                source = affinity(Image.open(MM / run / f"{stem}{CHANNELS['height']}"))
            else:
                source = Image.open(MM / run / f"{stem}{CHANNELS[channel]}").convert(mode)
            band = strip(source, int(item["safeHeight"]))
            px, py, pw, ph = item["paddedRectPx"]
            sx, sy, sw, sh = item["safeContentRectPx"]
            sheet.paste(band, (sx, sy))
            # 16px vertical dilation gutters; U has no gutter because it repeats.
            top = band.crop((0, 0, band.width, 1)).resize((pw, sy - py))
            bottom_h = py + ph - (sy + sh)
            bottom = band.crop((0, band.height - 1, band.width, band.height)).resize((pw, bottom_h))
            sheet.paste(top, (px, py))
            sheet.paste(bottom, (px, sy + sh))
        master = destination / f"trim-{culture}-h6-v1-{channel}-1024-v001.png"
        runtime = destination / f"trim-{culture}-h6-v1-{channel}-512-v001.png"
        sheet.save(master)
        sheet.resize((512, 512), Image.Resampling.LANCZOS).save(runtime)
        sheets[channel] = {"master": master.name, "runtime": runtime.name}
    metadata = {
        "schema": "genesis.trim-sheet.h6-v1",
        "culture": culture,
        "layoutId": "genesis-architecture-core-h6-v1",
        "masterSize": [1024, 1024],
        "runtimeSize": [512, 512],
        "wrap": {"u": "repeat", "v": "clamp"},
        "channels": sheets,
        "slots": [{
            "id": x["slotId"],
            "safeContentRectPx": x["safeContentRectPx"],
            "paddedRectPx": x["paddedRectPx"],
            "uv": [x["safeContentRectPx"][0] / 1024, x["safeContentRectPx"][1] / 1024,
                   x["safeContentRectPx"][2] / 1024, x["safeContentRectPx"][3] / 1024],
            "profileId": x["profileId"],
            "endpointPolicy": x["endpointPolicy"],
            "repeatWorldLength": x["repeatWorldLength"],
        } for x in materials],
    }
    meta_path = destination / f"trim-{culture}-h6-v1.trim-sheet.json"
    meta_path.write_text(json.dumps(metadata, indent=2) + "\n")
    return {"metadata": str(meta_path.relative_to(ROOT)), "sheets": sheets}


def proof_board(cultures: dict[str, dict], manifest: dict) -> None:
    PROOF.mkdir(parents=True, exist_ok=True)
    board = Image.new("RGB", (1800, 1540), "#171b22")
    draw = ImageDraw.Draw(board)
    draw.text((36, 24), "B06 IMAGEGEN-FIRST TRIM / H6-V1 PACK PROOF", fill="#f3ead7")
    draw.text((36, 54), "Native-aspect slot crops + 3x U repeat. No wall-fit squashing.", fill="#aeb8c8")
    for column, culture in enumerate(("institutional", "upland")):
        x0 = 36 + column * 882
        master = Image.open(OUT / "run-a" / cultures[culture]["sheets"]["basecolor"]["master"]).convert("RGB")
        board.paste(master.resize((420, 420), Image.Resampling.LANCZOS), (x0, 92))
        draw.text((x0, 520), culture.upper(), fill="#f3ead7")
        items = [m for m in manifest["materials"] if m["culture"] == culture]
        for row, item in enumerate(items):
            sx, sy, sw, sh = item["safeContentRectPx"]
            band = master.crop((sx, sy, sx + sw, sy + sh))
            repeat = Image.new("RGB", (768, max(52, int(sh * .75))))
            scaled = band.resize((256, repeat.height), Image.Resampling.LANCZOS)
            for i in range(3):
                repeat.paste(scaled, (i * 256, 0))
            y = 560 + row * 150
            board.paste(repeat, (x0, y))
            draw.text((x0, y + repeat.height + 5), item["slotId"], fill="#aeb8c8")
    board.save(PROOF / "b06-trim-packed-proof-board-v001.png")


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    all_outputs = {}
    for run in ("run-a", "run-b"):
        all_outputs[run] = {}
        for culture in ("institutional", "upland"):
            materials = [m for m in manifest["materials"] if m["culture"] == culture]
            all_outputs[run][culture] = pack(run, culture, materials)
    compared = {}
    for path_a in sorted((OUT / "run-a").iterdir()):
        path_b = OUT / "run-b" / path_a.name
        if not path_b.exists() or sha(path_a) != sha(path_b):
            raise RuntimeError(f"Nondeterministic pack: {path_a.name}")
        compared[path_a.name] = sha(path_a)
    proof_board(all_outputs["run-a"], manifest)
    RECEIPT.write_text(json.dumps({
        "schemaVersion": 1,
        "checkpoint": "B06-trim-h6-v1-packed-v001",
        "result": "PASS",
        "determinism": {"byteIdentical": True, "comparedFileCount": len(compared)},
        "hashes": compared,
        "reviewRoot": str((OUT / "run-a").relative_to(ROOT)),
        "proofBoard": str((PROOF / "b06-trim-packed-proof-board-v001.png").relative_to(ROOT)),
    }, indent=2) + "\n")
    print(f"PASS: packed {len(compared)} deterministic trim-sheet artifacts.")


if __name__ == "__main__":
    main()
