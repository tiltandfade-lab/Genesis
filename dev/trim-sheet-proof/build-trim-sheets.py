#!/usr/bin/env python3
"""Deterministically pack three shipped Genesis trim strips into one stable layout.

The source strips are already folded runtime assets. This proof derives role-specific
source bands from each strip and packs them with identical coordinates and dilated
gutters. It proves layout and projection, not final independent-band art authorship.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

OFFLINE_TOOLS = Path(
    os.environ.get("GENESIS_OFFLINE_ART_TOOLS", "/private/tmp/genesis-offline-art-tools")
)
if OFFLINE_TOOLS.is_dir():
    sys.path.insert(0, str(OFFLINE_TOOLS))

from PIL import Image, ImageDraw, ImageEnhance, ImageFont


REPO = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
GENERATED = HERE / "generated"
SHEET_SIZE = 512
GUTTER = 8
LAYOUT_ID = "architecture-core-v1"
SLOTS = (
    {
        "slotId": "plain-band",
        "semanticRole": "PLAIN_FALLBACK",
        "rectPx": [0, 8, 512, 48],
        "sourceCrop": [0, 0, 256, 12],
        "repeatWorldLength": 0.5,
        "physicalBandHeight": 0.08,
        "profileId": "profile-flat-01",
    },
    {
        "slotId": "base-course",
        "semanticRole": "BASE_COURSE",
        "rectPx": [0, 64, 512, 80],
        "sourceCrop": [0, 36, 256, 64],
        "repeatWorldLength": 1.0,
        "physicalBandHeight": 0.22,
        "profileId": "profile-square-proud-01",
    },
    {
        "slotId": "cornice",
        "semanticRole": "CORNICE",
        "rectPx": [0, 152, 512, 96],
        "sourceCrop": [0, 0, 256, 64],
        "repeatWorldLength": 1.0,
        "physicalBandHeight": 0.28,
        "profileId": "profile-bevel-proud-01",
    },
    {
        "slotId": "coping",
        "semanticRole": "COPING",
        "rectPx": [0, 256, 512, 72],
        "sourceCrop": [0, 0, 256, 28],
        "repeatWorldLength": 0.75,
        "physicalBandHeight": 0.18,
        "profileId": "profile-cap-flat-01",
    },
    {
        "slotId": "nosing",
        "semanticRole": "NOSING",
        "rectPx": [0, 336, 512, 64],
        "sourceCrop": [0, 18, 256, 44],
        "repeatWorldLength": 0.5,
        "physicalBandHeight": 0.12,
        "profileId": "profile-nose-bevel-01",
    },
    {
        "slotId": "curb",
        "semanticRole": "CURB",
        "rectPx": [0, 408, 512, 96],
        "sourceCrop": [0, 32, 256, 64],
        "repeatWorldLength": 1.0,
        "physicalBandHeight": 0.24,
        "profileId": "profile-square-proud-01",
    },
)
VARIANTS = (
    {
        "id": "fantasy-masonry",
        "title": "Fantasy Masonry",
        "realm": "fantasy",
        "materialFamily": "warm-carved-stone",
        "source": "assets/textures/fantasy-trim-1.png",
        "sourceWrap": "repeat",
        "grade": {"brightness": 1.0, "contrast": 1.0, "color": 1.0},
    },
    {
        "id": "gloom-crypt",
        "title": "Gloom Crypt",
        "realm": "gloom",
        "materialFamily": "dark-carved-stone",
        "source": "assets/textures/gloom-trim-1.png",
        "sourceWrap": "repeat",
        "grade": {"brightness": 1.02, "contrast": 0.96, "color": 0.92},
    },
    {
        "id": "chrome-industrial",
        "title": "Chrome Industrial",
        "realm": "chrome",
        "materialFamily": "painted-industrial-metal",
        "source": "assets/textures/chrome-trim-1.png",
        "sourceWrap": "mirror",
        "grade": {"brightness": 1.04, "contrast": 0.94, "color": 0.96},
    },
)
LFS_PATTERN = re.compile(
    r"^version https://git-lfs.github.com/spec/v1\n"
    r"oid sha256:([0-9a-f]{64})\n"
    r"size ([0-9]+)\n?$"
)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def resolve_source(relative: str) -> tuple[Path, dict]:
    checkout_path = REPO / relative
    checkout_bytes = checkout_path.read_bytes()
    match = LFS_PATTERN.match(checkout_bytes.decode("utf-8", errors="ignore"))
    if not match:
        return checkout_path, {
            "kind": "hydrated",
            "oidSha256": sha256_bytes(checkout_bytes),
            "declaredSize": len(checkout_bytes),
        }

    oid, declared_size = match.group(1), int(match.group(2))
    common_git_dir = subprocess.check_output(
        ["git", "rev-parse", "--git-common-dir"],
        cwd=REPO,
        text=True,
    ).strip()
    git_path = Path(common_git_dir)
    if not git_path.is_absolute():
        git_path = (REPO / git_path).resolve()
    object_path = git_path / "lfs" / "objects" / oid[:2] / oid[2:4] / oid
    object_bytes = object_path.read_bytes()
    if len(object_bytes) != declared_size or sha256_bytes(object_bytes) != oid:
        raise RuntimeError(f"Invalid LFS object for {relative}")
    return object_path, {
        "kind": "lfs",
        "oidSha256": oid,
        "declaredSize": declared_size,
    }


def repeated_band(source: Image.Image, crop: list[int], height: int, wrap: str) -> Image.Image:
    band = source.crop(tuple(crop)).convert("RGB")
    if band.width != 256:
        raise RuntimeError(f"Expected 256px source band, found {band.width}")
    right = band.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if wrap == "mirror" else band
    tiled = Image.new("RGB", (512, band.height))
    tiled.paste(band, (0, 0))
    tiled.paste(right, (256, 0))
    return tiled.resize((512, height), Image.Resampling.LANCZOS)


def grade_band(band: Image.Image, role: str, grade: dict) -> Image.Image:
    brightness = grade["brightness"]
    contrast = grade["contrast"]
    color = grade["color"]
    role_tuning = {
        "plain-band": (0.94, 0.72, 0.82),
        "base-course": (0.82, 1.02, 0.88),
        "cornice": (1.0, 1.0, 1.0),
        "coping": (1.05, 0.9, 0.92),
        "nosing": (1.08, 1.08, 1.0),
        "curb": (0.86, 0.94, 0.84),
    }[role]
    result = ImageEnhance.Brightness(band).enhance(brightness * role_tuning[0])
    result = ImageEnhance.Contrast(result).enhance(contrast * role_tuning[1])
    return ImageEnhance.Color(result).enhance(color * role_tuning[2])


def paste_with_dilation(sheet: Image.Image, band: Image.Image, rect: list[int]) -> None:
    x, y, width, height = rect
    if x != 0 or width != SHEET_SIZE:
        raise RuntimeError("V001 accepts full-width horizontal bands only")
    sheet.paste(band, (x, y))
    top = band.crop((0, 0, width, 1)).resize((width, GUTTER // 2), Image.Resampling.NEAREST)
    bottom = band.crop((0, height - 1, width, height)).resize(
        (width, GUTTER // 2),
        Image.Resampling.NEAREST,
    )
    sheet.paste(top, (x, max(0, y - GUTTER // 2)))
    sheet.paste(bottom, (x, min(SHEET_SIZE - GUTTER // 2, y + height)))


def debug_sheet() -> Image.Image:
    image = Image.new("RGB", (SHEET_SIZE, SHEET_SIZE), "#111317")
    draw = ImageDraw.Draw(image)
    colors = ("#6f7f91", "#9b684d", "#8c6aa4", "#657f66", "#b09545", "#7e5353")
    font = ImageFont.load_default()
    for index, slot in enumerate(SLOTS):
        x, y, width, height = slot["rectPx"]
        draw.rectangle((x, y, x + width - 1, y + height - 1), fill=colors[index])
        for marker_x in range(0, width, 64):
            draw.line((marker_x, y, marker_x, y + height - 1), fill="#ffffff", width=1)
        label = f"{slot['semanticRole']}  repeat={slot['repeatWorldLength']}m"
        draw.rectangle((8, y + 7, 8 + len(label) * 6 + 8, y + 21), fill="#0a0b0ccc")
        draw.text((12, y + 9), label, fill="#ffffff", font=font)
    return image


def main() -> None:
    GENERATED.mkdir(parents=True, exist_ok=True)
    debug_path = GENERATED / "architecture-core-v1-debug.png"
    debug_sheet().save(debug_path, optimize=False)
    variant_records = []
    for variant in VARIANTS:
        source_path, lineage = resolve_source(variant["source"])
        source = Image.open(source_path).convert("RGB")
        if source.size != (256, 64):
            raise RuntimeError(f"Expected 256x64 strip for {variant['source']}, found {source.size}")

        background = tuple(int(value) for value in source.resize((1, 1)).getpixel((0, 0)))
        sheet = Image.new("RGB", (SHEET_SIZE, SHEET_SIZE), background)
        slot_records = []
        for slot in SLOTS:
            band = repeated_band(
                source,
                slot["sourceCrop"],
                slot["rectPx"][3],
                variant["sourceWrap"],
            )
            band = grade_band(band, slot["slotId"], variant["grade"])
            paste_with_dilation(sheet, band, slot["rectPx"])
            slot_records.append(
                {
                    **{key: value for key, value in slot.items() if key != "sourceCrop"},
                    "sourceCrop": slot["sourceCrop"],
                    "uvRect": [
                        slot["rectPx"][0] / SHEET_SIZE,
                        slot["rectPx"][1] / SHEET_SIZE,
                        slot["rectPx"][2] / SHEET_SIZE,
                        slot["rectPx"][3] / SHEET_SIZE,
                    ],
                    "repeatAxis": "u",
                    "reversible": True,
                    "endpointPolicy": "plain-cap",
                    "fallbackSlotId": "plain-band",
                }
            )

        output_path = GENERATED / f"{variant['id']}-trim-sheet.png"
        sheet.save(output_path, optimize=False)
        source_bytes = source_path.read_bytes()
        variant_records.append(
            {
                "id": variant["id"],
                "title": variant["title"],
                "realm": variant["realm"],
                "materialFamily": variant["materialFamily"],
                "source": variant["source"],
                "sourceWrap": variant["sourceWrap"],
                "sourceStorage": lineage,
                "sourceSha256": sha256_bytes(source_bytes),
                "sourceDimensions": [source.width, source.height],
                "derivedRoleBands": True,
                "output": {
                    "path": str(output_path.relative_to(REPO)),
                    "sha256": sha256_bytes(output_path.read_bytes()),
                    "dimensions": [sheet.width, sheet.height],
                },
                "slots": slot_records,
            }
        )

    manifest = {
        "schemaVersion": 1,
        "proofId": "GENESIS-TRIM-SHEET-PROOF-V001",
        "layoutId": LAYOUT_ID,
        "version": 1,
        "authoringSize": [SHEET_SIZE, SHEET_SIZE],
        "runtimeSize": [SHEET_SIZE, SHEET_SIZE],
        "colorSpace": "srgb",
        "channels": ["baseColor"],
        "gutterPx": GUTTER,
        "packing": "full-width horizontal bands with vertical edge dilation",
        "repeatContract": "clamped atlas plus repeat-boundary run segmentation",
        "debugSheet": {
            "path": str(debug_path.relative_to(REPO)),
            "sha256": sha256_bytes(debug_path.read_bytes()),
        },
        "claimBoundary": (
            "This proves stable multi-band packing and mapped geometry reuse. "
            "Role bands are deterministic derivatives of each shipped single strip, "
            "not final independently authored production bands."
        ),
        "variants": variant_records,
    }
    manifest_path = GENERATED / "trim-sheet-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
