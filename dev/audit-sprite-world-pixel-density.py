#!/usr/bin/env python3
"""Census live sprite sources against the 32-pixels-per-foot world-art standard.

This is deliberately read-only with respect to sprite art and registry data. It measures the alpha
content bounds of each runtime-resolvable cut sprite, compares that subject height with the
registry's canonical worldHeight, and writes an evidence report. A mismatch is a re-authoring
candidate; the audit never rescales a source or changes physical gameplay truth.
"""

from __future__ import annotations

import json
import re
import statistics
from pathlib import Path

from PIL import Image, UnidentifiedImageError


ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "data/sprite-registry.js"
OUTPUT_JSON = ROOT / "docs/intel/sprite-world-pixel-density.json"
OUTPUT_MD = ROOT / "docs/intel/sprite-world-pixel-density.md"
TARGET_PPF = 32
SUPPLEMENTAL_MANIFESTS = [
    ROOT / "assets/sprites-golden/guard-post-v001/manifest.json",
]


def field(body: str, key: str) -> str | None:
    match = re.search(rf"(?:^|, ){re.escape(key)}:(null|\"(?:[^\"\\]|\\.)*\"|-?\d+(?:\.\d+)?)", body)
    if not match or match.group(1) == "null":
        return None
    value = match.group(1)
    return json.loads(value) if value.startswith('"') else value


def registry_rows() -> list[dict]:
    rows = []
    entry_pattern = re.compile(r'^\s*"([^"]+)": \{(.*)\},?$')
    for line in REGISTRY.read_text().splitlines():
        match = entry_pattern.match(line)
        if not match:
            continue
        slug, body = match.groups()
        status = field(body, "status")
        world_height_raw = field(body, "worldHeight")
        if status != "cut" or world_height_raw is None:
            continue
        runtime_admitted = field(body, "runtimeAdmitted") or "legacy"
        legacy_asset = field(body, "legacyAsset")
        candidate_asset = field(body, "candidateAsset")
        selected = candidate_asset if runtime_admitted == "candidate" else legacy_asset
        if not selected:
            selected = f"assets/sprites/{slug}.png"
        rows.append(
            {
                "slug": slug,
                "worldHeightFeet": float(world_height_raw),
                "heightSource": field(body, "heightSource"),
                "runtimeAdmitted": runtime_admitted,
                "asset": selected,
            }
        )
    return rows


def supplemental_rows() -> list[dict]:
    rows = []
    for path in SUPPLEMENTAL_MANIFESTS:
        if not path.exists():
            continue
        manifest = json.loads(path.read_text())
        for member in manifest.get("members", []):
            rows.append(
                {
                    "slug": member["id"],
                    "worldHeightFeet": float(member["worldHeightFeet"]),
                    "heightSource": "authored-head-to-feet-axis",
                    "runtimeAdmitted": "golden-site-opt-in-proof",
                    "asset": member["asset"],
                    "authoredSubjectHeightPixels": int(member["bodySubjectHeightPixels"]),
                    "sourceManifest": str(path.relative_to(ROOT)),
                }
            )
    return rows


def measure(row: dict) -> dict:
    path = ROOT / row["asset"]
    result = dict(row)
    if not path.exists():
        result["verdict"] = "missing-source"
        return result
    try:
        image = Image.open(path).convert("RGBA")
    except UnidentifiedImageError:
        prefix = path.read_bytes()[:64]
        result["verdict"] = (
            "lfs-source-not-materialized"
            if prefix.startswith(b"version https://git-lfs.github.com/spec/v1")
            else "unreadable-source"
        )
        return result
    bounds = image.getchannel("A").getbbox()
    if not bounds:
        result.update(
            {
                "sourceSize": list(image.size),
                "verdict": "empty-alpha",
            }
        )
        return result
    alpha_content_height = bounds[3] - bounds[1]
    subject_height = int(row.get("authoredSubjectHeightPixels", alpha_content_height))
    expected = round(row["worldHeightFeet"] * TARGET_PPF)
    actual = subject_height / row["worldHeightFeet"]
    error_ratio = actual / TARGET_PPF - 1
    exact_tolerance = max(2, round(expected * 0.03))
    if abs(subject_height - expected) <= exact_tolerance:
        verdict = "target-compatible"
    elif actual < TARGET_PPF:
        verdict = "under-density-legacy"
    else:
        verdict = "over-density-legacy"
    result.update(
        {
            "sourceSize": list(image.size),
            "alphaBoundsPx": list(bounds),
            "alphaContentHeightPx": alpha_content_height,
            "subjectHeightPx": subject_height,
            "targetSubjectHeightPx": expected,
            "measuredPixelsPerFoot": round(actual, 4),
            "relativeError": round(error_ratio, 4),
            "verdict": verdict,
        }
    )
    return result


def markdown(receipt: dict) -> str:
    counts = receipt["counts"]
    lines = [
        "# Sprite World-Pixel-Density Census",
        "",
        f"Target: **{TARGET_PPF} px/ft of alpha-content subject height**.",
        "",
        "This is a census, not an approval pass. It changes neither source art nor canonical",
        "physical scale. Transparent canvas padding is excluded. When a governed source pack",
        "declares an authored head-to-feet axis, equipment may extend beyond that physical axis",
        "without falsely inflating character density.",
        "",
        "| Metric | Value |",
        "| --- | ---: |",
        f"| Registry rows with cut art and world height | {counts['eligible']} |",
        f"| Measured sources | {counts['measured']} |",
        f"| Target-compatible (±3%, minimum ±2 px) | {counts['targetCompatible']} |",
        f"| Under-density legacy | {counts['underDensity']} |",
        f"| Over-density legacy | {counts['overDensity']} |",
        f"| Missing/empty sources | {counts['unmeasured']} |",
        f"| Median measured px/ft | {receipt['distribution']['medianPixelsPerFoot']} |",
        "",
        "## Largest density mismatches",
        "",
        "| Sprite | Feet | Subject px | Measured px/ft | Verdict |",
        "| --- | ---: | ---: | ---: | --- |",
    ]
    for row in receipt["largestMismatches"]:
        lines.append(
            f"| `{row['slug']}` | {row['worldHeightFeet']:g} | "
            f"{row['subjectHeightPx']} | {row['measuredPixelsPerFoot']:.2f} | "
            f"{row['verdict']} |"
        )
    lines.extend(
        [
            "",
            "New or re-authored sprites should place the subject at `round(feet × 32)` pixels while",
            "allowing a larger padded frame. Existing mismatches require re-authoring, not runtime",
            "texture scaling disguised as compliance.",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    measured = [measure(row) for row in registry_rows() + supplemental_rows()]
    numeric = [row for row in measured if "measuredPixelsPerFoot" in row]
    values = [row["measuredPixelsPerFoot"] for row in numeric]
    receipt = {
        "schema": "SpriteWorldPixelDensityCensusV1",
        "targetPixelsPerFoot": TARGET_PPF,
        "measurement": (
            "authored head-to-feet subject axis when declared; otherwise "
            "alpha-content-height-pixels / canonical-worldHeight-feet"
        ),
        "mutationPolicy": "read-only; mismatch routes to re-authoring, never physical rescale",
        "counts": {
            "eligible": len(measured),
            "measured": len(numeric),
            "targetCompatible": sum(row["verdict"] == "target-compatible" for row in measured),
            "underDensity": sum(row["verdict"] == "under-density-legacy" for row in measured),
            "overDensity": sum(row["verdict"] == "over-density-legacy" for row in measured),
            "unmeasured": len(measured) - len(numeric),
        },
        "distribution": {
            "minimumPixelsPerFoot": round(min(values), 4) if values else None,
            "medianPixelsPerFoot": round(statistics.median(values), 4) if values else None,
            "maximumPixelsPerFoot": round(max(values), 4) if values else None,
        },
        "largestMismatches": sorted(
            numeric, key=lambda row: abs(row["relativeError"]), reverse=True
        )[:24],
        "rows": measured,
    }
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(receipt, indent=2) + "\n")
    OUTPUT_MD.write_text(markdown(receipt))
    print(json.dumps({"counts": receipt["counts"], "distribution": receipt["distribution"]}, indent=2))


if __name__ == "__main__":
    main()
