#!/usr/bin/env python3
"""Build the Assetforge citizenship-v2 low-light before/after proof.

The old CL-R2 capture is the rejected lit-standee-v1 renderer. The candidate directory must be
produced by dev/capture-clay-sprite-citizenship.cjs against the current production renderer.
This script does not manufacture a renderer mock: it crops the same real CL-F03 cast from both
banked runs and binds the visual board to the candidate capture's machine-readable contract.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "build"))
import assetforge_apps as apps  # noqa: E402


DEFAULT_BASELINE = ROOT / "dev" / "clay-captures" / "cl-r2-sprite-citizenship"
DEFAULT_CANDIDATE = (
    ROOT / "dev" / "model-qa" / "assetforge-real" / "runs" / "citizenship" / "renderer-v2"
)
DEFAULT_OUTPUT = (
    ROOT / "dev" / "model-qa" / "assetforge-real" / "runs" / "citizenship" / "low-light-proof"
)
CONTEXTS = (
    ("05-dark-production.png", "moonlit / lowest-value stress"),
    ("06-warm-production.png", "torchlit / warm-color stress"),
    ("07-cool-production.png", "magic glow / cool-color stress"),
    ("08-day-production.png", "daylit / over-bright negative control"),
)
# Human fighter, flaming skeleton, and wraith: the three play-scale figures that made the old
# one-level minification failure easiest to read. Coordinates are on the CL-R2 1696x1352 capture.
STRESS_CROP = (540, 535, 1165, 845)


def labeled_crop(image: Image.Image, label: str) -> Image.Image:
    crop = image.convert("RGB").crop(STRESS_CROP)
    crop = ImageOps.fit(crop, (750, 372), method=Image.Resampling.NEAREST)
    draw = ImageDraw.Draw(crop)
    draw.rectangle((0, 0, 750, 34), fill=(13, 15, 18))
    draw.text((10, 10), label, font=apps.font(), fill=(239, 235, 224))
    return crop.convert("RGBA")


def run(baseline_dir: Path, candidate_dir: Path, output_dir: Path, force: bool) -> dict:
    apps.guarded_reset(output_dir, force)
    receipt_path = candidate_dir / "cl-r2-sprite-citizenship-receipt.json"
    candidate_receipt = apps.read_json(receipt_path)
    assertions = candidate_receipt.get("assertions", {})
    required = {
        "rendererUsesCitizenshipV2",
        "rendererUsesPerceptualReadabilityFloor",
        "everyLoadedSpriteUsesMipmappedMinification",
        "everyStandeeUsesAlphaToCoverage",
    }
    missing = sorted(required - set(assertions))
    if missing:
        raise SystemExit(f"ERROR: candidate receipt lacks citizenship-v2 assertions: {missing}")

    rows = []
    sources = []
    for filename, context in CONTEXTS:
        baseline_path = baseline_dir / filename
        candidate_path = candidate_dir / filename
        baseline = Image.open(baseline_path)
        candidate = Image.open(candidate_path)
        rows.append(
            (
                labeled_crop(baseline, f"v1 rejected · {context}"),
                labeled_crop(candidate, f"v2 candidate · {context}"),
            )
        )
        sources.extend(
            [
                {"role": f"v1-{context}", "path": apps.repo_path(baseline_path), "sha256": apps.sha256_file(baseline_path)},
                {"role": f"v2-{context}", "path": apps.repo_path(candidate_path), "sha256": apps.sha256_file(candidate_path)},
            ]
        )

    gutter = 14
    header = 70
    board = Image.new(
        "RGBA",
        (750 * 2 + gutter * 3, header + 372 * len(rows) + gutter * (len(rows) + 1)),
        (28, 28, 31, 255),
    )
    draw = ImageDraw.Draw(board)
    draw.text((gutter, 18), "Sprite citizenship v2 · real Clayroom renderer A/B", font=apps.font(), fill=(245, 237, 216))
    draw.text(
        (gutter, 42),
        "same CL-F03 cast · fighter / skeleton / wraith stress crop · no sprite art replaced",
        font=apps.font(),
        fill=(172, 179, 185),
    )
    y = header + gutter
    for before, after in rows:
        board.alpha_composite(before, (gutter, y))
        board.alpha_composite(after, (gutter * 2 + 750, y))
        y += 372 + gutter
    board_path = output_dir / "citizenship-v2-before-after.png"
    board.save(board_path)

    contract = candidate_receipt["timeline"]["settled"]["renderContract"]
    result = {
        "schemaVersion": 1,
        "proof": "assetforge-sprite-citizenship-v2",
        "technicalStatus": "PASS" if all(assertions[name] for name in required) else "FAIL",
        "claimBoundary": (
            "The board compares real production-renderer captures. It proves improved play-scale "
            "sampling and low-light color retention on prototype art; it does not admit any sprite art."
        ),
        "baseline": "lit-standee-v1",
        "candidate": contract["recipe"],
        "candidateContract": {
            "readabilityFloor": contract["readabilityFloor"],
            "realmTintStrength": contract["realmTintStrength"],
            "textureCount": len(contract["textures"]),
            "materialCount": len(contract["materials"]),
        },
        "assertions": {name: assertions[name] for name in sorted(required)},
        "sources": sources,
        "candidateCaptureReceipt": apps.repo_path(receipt_path),
        "proofBoard": apps.repo_path(board_path),
    }
    apps.write_json(output_dir / "receipt.json", result)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline-dir", type=Path, default=DEFAULT_BASELINE)
    parser.add_argument("--candidate-dir", type=Path, default=DEFAULT_CANDIDATE)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    result = run(args.baseline_dir, args.candidate_dir, args.output_dir, args.force)
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["technicalStatus"] == "PASS" else 1)


if __name__ == "__main__":
    main()
