#!/usr/bin/env python3
"""Package deterministic MM 1.3 Guard Post ground channels as candidate material v004."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
PARENT = ROOT / "assets/materials/golden/guard-post/v003"
EXPORT = ROOT / "dev/material-lane/exports/guard-post-ground-mm-v004/run-a"
OUTPUT = ROOT / "assets/materials/golden/guard-post/v004"
RECEIPT = ROOT / "dev/material-lane/receipts/guard-post-ground-mm-v004-export-receipt.json"

ROWS = (
    ("turf", "ground-upland-turf-albedo.png", "guard-ground-turf-v004"),
    ("road", "ground-upland-road-albedo.png", "guard-ground-road-v004"),
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def save_rgb(source: Path, target: Path) -> None:
    Image.open(source).convert("RGB").save(target, optimize=False)


def main() -> None:
    if not RECEIPT.exists():
        raise SystemExit(f"Missing deterministic MM export receipt: {RECEIPT}")
    OUTPUT.mkdir(parents=True, exist_ok=False)
    channels = {}
    for role, albedo_name, stem in ROWS:
        targets = {
            "albedo": OUTPUT / albedo_name,
            "height": OUTPUT / f"ground-upland-{role}-height.png",
            "normal": OUTPUT / f"ground-upland-{role}-normal.png",
            "orm": OUTPUT / f"ground-upland-{role}-orm.png",
        }
        sources = {
            "albedo": PARENT / albedo_name,
            "height": EXPORT / f"{stem}_heightmap.png",
            "normal": EXPORT / f"{stem}_normal.png",
            "orm": EXPORT / f"{stem}_orm.png",
        }
        for channel, source in sources.items():
            save_rgb(source, targets[channel])
        channels[role] = {
            channel: {
                "path": str(target.relative_to(ROOT)),
                "sha256": sha256(target),
            }
            for channel, target in targets.items()
        }
        if sha256(targets["albedo"]) != sha256(PARENT / albedo_name):
            raise SystemExit(f"{role} albedo identity changed during v004 packaging")
    payload = {
        "schemaVersion": 1,
        "packId": "guard-post-material-candidates-v004",
        "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        "parentPack": "assets/materials/golden/guard-post/v003/manifest.json",
        "materialMakerReceipt": str(RECEIPT.relative_to(ROOT)),
        "workflow": (
            "preserved seam-locked v003 albedo + semantic low-frequency MM 1.3 "
            "height/normal/AO/ORM"
        ),
        "materials": channels,
    }
    (OUTPUT / "manifest.json").write_text(json.dumps(payload, indent=2) + "\n")
    print(f"Packaged Guard Post ground v004 at {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
