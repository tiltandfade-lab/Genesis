#!/usr/bin/env python3
"""Run every Assetforge compiler against named, decodable Genesis assets.

The synthetic suite remains the fast contract regression.  This qualification harness is the
production-shaped complement: it records tracked leaf sources and hashes, constructs only explicitly
declared staging composites, runs every compiler into quarantine, and keeps expected change detection
as a real negative control.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"
sys.path.insert(0, str(BUILD))

import assetforge  # noqa: E402
import assetforge_apps as apps  # noqa: E402


DEFAULT_OUTPUT = ROOT / "dev" / "model-qa" / "assetforge-real"

FIGHTER = ROOT / "assets" / "sprites" / "spr-pc-human-fighter-male.png"
FLOOR = ROOT / "assets" / "textures" / "fantasy-floor-1.png"
PLAQUE = ROOT / "assets" / "plaques" / "scene-banner.png"
DECAL_SOURCE = ROOT / "assets" / "decals" / "source" / "shared-crack-decal-set-3.png"
DECAL_SHEET = ROOT / "assets" / "decals" / "shared" / "shared-crack-decal-set-3.png"
SLATE_SHEET = (
    ROOT
    / "dev"
    / "material-lane"
    / "source-sprites"
    / "b01-autonomous-v001"
    / "roof-slate-components-alpha-v001.png"
)
CONDITION_ALBEDO = (
    ROOT / "dev" / "material-workbench-proof" / "generated" / "fantasy-floor-albedo.png"
)
CONDITION_AGED = (
    ROOT
    / "dev"
    / "material-workbench-proof"
    / "generated"
    / "fantasy-floor-albedo-aged.png"
)
CONDITION_WET_MASK = (
    ROOT
    / "dev"
    / "material-workbench-proof"
    / "generated"
    / "fantasy-floor-wetness-mask.png"
)
PALETTE = ROOT / "dev" / "model-qa" / "realm-palettes" / "fantasy.json"
PROP_SOURCES = (
    ("chest", ROOT / "assets" / "dressing" / "fantasy-obj-chest-closed.png"),
    ("shrine", ROOT / "assets" / "dressing" / "fantasy-obj-shrine-lit.png"),
    ("barrel", ROOT / "assets" / "dressing" / "fantasy-clutter-emptybarrel.png"),
)
EMOTE_JOB = (
    ROOT
    / "dev"
    / "model-qa"
    / "emote-factory"
    / "jobs"
    / "emote-spr-pc-human-fighter-male-v003.job.json"
)
EMOTE_SHEET = (
    ROOT
    / "dev"
    / "model-qa"
    / "emote-factory"
    / "returns"
    / "emote-spr-pc-human-fighter-male-v003-imagegen.png"
)


def tracked(path: Path) -> bool:
    result = subprocess.run(
        ["git", "ls-files", "--error-unmatch", apps.repo_path(path)],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    return result.returncode == 0


def image_evidence(path: Path, role: str, source_kind: str) -> dict[str, Any]:
    raw = path.read_bytes()
    if raw.startswith(b"version https://git-lfs.github.com/spec/v1"):
        raise RuntimeError(f"unhydrated Git LFS pointer cannot qualify as image evidence: {apps.repo_path(path)}")
    with Image.open(path) as probe:
        probe.verify()
    with Image.open(path) as image:
        image.load()
        mode = image.mode
        dimensions = [image.width, image.height]
    return {
        "id": role,
        "path": apps.repo_path(path),
        "sourceKind": source_kind,
        "tracked": tracked(path),
        "sha256": apps.sha256_file(path),
        "byteSize": len(raw),
        "decodable": True,
        "mode": mode,
        "dimensions": dimensions,
    }


def file_evidence(path: Path, role: str, source_kind: str) -> dict[str, Any]:
    raw = path.read_bytes()
    return {
        "id": role,
        "path": apps.repo_path(path),
        "sourceKind": source_kind,
        "tracked": tracked(path),
        "sha256": apps.sha256_file(path),
        "byteSize": len(raw),
        "decodable": True,
    }


def stage_prop_sheet(output: Path) -> tuple[Path, list[dict[str, Any]]]:
    cell_width = 360
    cell_height = 300
    sheet = Image.new("RGBA", (cell_width * len(PROP_SOURCES), cell_height), (0, 0, 0, 0))
    lineage = []
    for index, (asset_id, path) in enumerate(PROP_SOURCES):
        image = apps.transparent_rgb_clean(Image.open(path).convert("RGBA"))
        box = apps.alpha_bbox(image)
        if not box:
            raise RuntimeError(f"prop source has no visible content: {apps.repo_path(path)}")
        content = image.crop(box)
        content = ImageOps.contain(
            content,
            (cell_width - 40, cell_height - 40),
            Image.Resampling.LANCZOS,
        )
        x = index * cell_width + (cell_width - content.width) // 2
        y = cell_height - 20 - content.height
        sheet.alpha_composite(content, (x, y))
        lineage.append(
            {
                "id": asset_id,
                "source": apps.repo_path(path),
                "sourceSha256": apps.sha256_file(path),
                "sourceCrop": list(box),
                "stagedRect": [x, y, content.width, content.height],
            }
        )
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output)
    return output, lineage


def stage_condition_state(output: Path) -> tuple[Path, dict[str, Any]]:
    base = Image.open(CONDITION_ALBEDO).convert("RGB")
    aged = Image.open(CONDITION_AGED).convert("RGB")
    wet = Image.open(CONDITION_WET_MASK).convert("L")
    result = Image.new("RGB", base.size)
    base_pixels = base.load()
    aged_pixels = aged.load()
    wet_pixels = wet.load()
    target = result.load()
    age_amount = 0.85
    wet_amount = 0.65
    wet_darkening = 0.28
    for y in range(base.height):
        for x in range(base.width):
            local_wet = wet_amount * wet_pixels[x, y] / 255
            darkening = 1 - local_wet * wet_darkening
            target[x, y] = tuple(
                round(
                    (
                        base_pixels[x, y][channel] * (1 - age_amount)
                        + aged_pixels[x, y][channel] * age_amount
                    )
                    * darkening
                )
                for channel in range(3)
            )
    output.parent.mkdir(parents=True, exist_ok=True)
    result.save(output)
    return output, {
        "operation": "material-workbench-age-plus-wetness",
        "ageAmount": age_amount,
        "wetnessAmount": wet_amount,
        "wetDarkening": wet_darkening,
        "inputs": {
            apps.repo_path(CONDITION_ALBEDO): apps.sha256_file(CONDITION_ALBEDO),
            apps.repo_path(CONDITION_AGED): apps.sha256_file(CONDITION_AGED),
            apps.repo_path(CONDITION_WET_MASK): apps.sha256_file(CONDITION_WET_MASK),
        },
    }


def manifest(path: Path, payload: dict[str, Any]) -> Path:
    apps.write_json(path, payload)
    return path


def run(output_root: Path, force: bool) -> dict[str, Any]:
    apps.guarded_reset(output_root, force)
    manifests = output_root / "manifests"
    sources = output_root / "sources"
    runs = output_root / "runs"
    manifests.mkdir(parents=True)
    sources.mkdir(parents=True)
    runs.mkdir(parents=True)

    leaf_evidence = [
        image_evidence(FIGHTER, "fighter-sprite", "tracked-live-asset"),
        image_evidence(FLOOR, "fantasy-floor", "tracked-live-asset"),
        image_evidence(PLAQUE, "scene-banner", "tracked-live-asset"),
        image_evidence(DECAL_SOURCE, "crack-decal-source-master", "tracked-live-source"),
        image_evidence(DECAL_SHEET, "crack-decal-rgba-sheet", "tracked-live-asset"),
        image_evidence(SLATE_SHEET, "slate-component-sheet", "tracked-production-source"),
        image_evidence(CONDITION_ALBEDO, "condition-base", "tracked-derived-from-live"),
        image_evidence(CONDITION_AGED, "condition-aged", "tracked-derived-from-live"),
        image_evidence(CONDITION_WET_MASK, "condition-wet-mask", "tracked-derived-from-live"),
        file_evidence(PALETTE, "fantasy-realm-palette", "tracked-generated-configuration"),
        file_evidence(EMOTE_JOB, "emote-job", "tracked-generation-contract"),
        image_evidence(EMOTE_SHEET, "emote-return-sheet", "tracked-imagegen-return"),
    ]
    leaf_evidence.extend(
        image_evidence(path, f"prop-{asset_id}", "tracked-live-asset")
        for asset_id, path in PROP_SOURCES
    )

    prop_sheet, prop_lineage = stage_prop_sheet(sources / "prop-kit-real-sheet.png")
    condition_combined, condition_lineage = stage_condition_state(
        sources / "fantasy-floor-aged-wet.png"
    )
    staging_evidence = [
        {
            **image_evidence(prop_sheet, "prop-kit-staging-sheet", "qualification-composite"),
            "tracked": False,
            "lineage": prop_lineage,
        },
        {
            **image_evidence(
                condition_combined,
                "condition-aged-wet",
                "qualification-derived-from-tracked-live",
            ),
            "tracked": False,
            "lineage": condition_lineage,
        },
    ]

    fantasy_palette = json.loads(PALETTE.read_text(encoding="utf-8"))["colors"]
    common = {
        "schemaVersion": 1,
        "qualification": {
            "kind": "real-repository-asset",
            "admission": "candidate-only",
        },
    }
    jobs: dict[str, Path] = {
        "boundary": manifest(
            manifests / "boundary-real.json",
            {
                **common,
                "family": "boundary-autotile",
                "insideMaterial": {
                    "tile": apps.repo_path(FLOOR),
                    "sha256": apps.sha256_file(FLOOR),
                },
                "edgeLanguage": {
                    "borderWidthPx": 7,
                    "orientationPolicy": "rotatable-organic",
                    "phasePolicy": "world-locked",
                },
                "tileSizePx": 72,
                "seed": 73129,
                "allowSeamLock": True,
                "maxRepairableSourceEdgeDelta": 10,
            },
        ),
        "repeat": manifest(
            manifests / "repeat-real.json",
            {
                **common,
                "family": "modular-repeat",
                "componentSheet": apps.repo_path(SLATE_SHEET),
                "sourceSha256": apps.sha256_file(SLATE_SHEET),
                "chromaKey": "none",
                "grid": [3, 2],
                "minimumComponents": 6,
                "tileSizePx": 512,
                "componentWidthPx": 96,
                "componentResampling": "lanczos",
                "layout": "staggered-courses",
                "courseStepXPx": 82,
                "courseStepYPx": 72,
                "baseRGBA": [42, 53, 67, 255],
                "seed": 203,
            },
        ),
        "prop-kit": manifest(
            manifests / "prop-kit-real.json",
            {
                **common,
                "family": "prop-kit",
                "sheet": apps.repo_path(prop_sheet),
                "sourceSha256": apps.sha256_file(prop_sheet),
                "chromaKey": "none",
                "grid": [3, 1],
                "ids": [asset_id for asset_id, _ in PROP_SOURCES],
                "paddingPx": 8,
                "pruneDetachedFragments": True,
                "fragmentMergePx": 0,
                "maxPrunedAlphaRatio": 0.20,
            },
        ),
        "condition": manifest(
            manifests / "condition-real.json",
            {
                **common,
                "family": "condition-state",
                "source": apps.repo_path(CONDITION_ALBEDO),
                "sourceSha256": apps.sha256_file(CONDITION_ALBEDO),
                "chromaKey": "none",
                "expectedStateCount": 2,
                "maxChangedRatio": 0.25,
                "states": [
                    {"id": "aged", "path": apps.repo_path(CONDITION_AGED)},
                    {"id": "aged-wet", "path": apps.repo_path(condition_combined)},
                ],
            },
        ),
        "palette": manifest(
            manifests / "palette-real.json",
            {
                **common,
                "family": "palette-harmonizer",
                "source": apps.repo_path(FIGHTER),
                "sourceSha256": apps.sha256_file(FIGHTER),
                "chromaKey": "none",
                "paletteSource": apps.repo_path(PALETTE),
                "paletteSourceSha256": apps.sha256_file(PALETTE),
                "palette": fantasy_palette,
                "maxMeanDistance": 90,
                "minimumRankAgreement": 0.72,
            },
        ),
        "trim": manifest(
            manifests / "trim-real.json",
            {
                **common,
                "family": "trim-nine-slice",
                "source": apps.repo_path(PLAQUE),
                "sourceSha256": apps.sha256_file(PLAQUE),
                "chromaKey": "#FF00FF",
                "chromaTolerance": 55,
                "sourceInsets": [320, 0, 320, 0],
                "outputInsets": [46, 0, 46, 0],
                "targets": [[260, 40], [500, 40], [900, 40]],
            },
        ),
        "decal": manifest(
            manifests / "decal-real.json",
            {
                **common,
                "family": "decal-stamp",
                "sheet": apps.repo_path(DECAL_SHEET),
                "sourceSha256": apps.sha256_file(DECAL_SHEET),
                "sourceMaster": apps.repo_path(DECAL_SOURCE),
                "sourceMasterSha256": apps.sha256_file(DECAL_SOURCE),
                "chromaKey": "none",
                "alphaCutoff": 12,
                "isolationMode": "alpha-component-groups",
                "componentGroupAlphaCutoff": 0,
                "componentAnchors": [
                    [256, 256],
                    [768, 256],
                    [1280, 256],
                    [256, 768],
                    [768, 768],
                    [1280, 768],
                ],
                "ids": [
                    "impact",
                    "spiderweb",
                    "fault",
                    "craze",
                    "radial",
                    "branch",
                ],
                "maxBaseDimensionPx": 192,
                "atlasMaxWidthPx": 1536,
            },
        ),
        "citizenship": manifest(
            manifests / "citizenship-real.json",
            {
                **common,
                "family": "sprite-citizenship",
                "slug": "spr-pc-human-fighter-male",
                "source": apps.repo_path(FIGHTER),
                "sourceSha256": apps.sha256_file(FIGHTER),
                "chromaKey": "none",
                "worldHeightFeet": 6,
                "paddingPx": 4,
            },
        ),
        "atlas": manifest(
            manifests / "atlas-real.json",
            {
                **common,
                "family": "atlas-optimizer",
                "paddingPx": 3,
                "maxWidthPx": 1024,
                "maxBytes": 4_000_000,
                "assets": [
                    {
                        "id": asset_id,
                        "path": apps.repo_path(
                            runs / "prop-kit" / "candidate" / f"{asset_id}.png"
                        ),
                    }
                    for asset_id, _path in PROP_SOURCES
                ],
                "lineage": "prop-kit candidate outputs compiled from the tracked live assets",
            },
        ),
        "material": manifest(
            manifests / "material-real.json",
            {
                **common,
                "family": "material-map-baker",
                "albedo": apps.repo_path(FLOOR),
                "sourceSha256": apps.sha256_file(FLOOR),
                "seamRequired": True,
                "allowSeamLock": True,
                "maxRepairableSourceEdgeDelta": 10,
                "heightBlur": 1.2,
                "normalStrength": 1.8,
            },
        ),
        "regression": manifest(
            manifests / "regression-real-unchanged.json",
            {
                **common,
                "family": "visual-regression",
                "baseline": apps.repo_path(CONDITION_ALBEDO),
                "current": apps.repo_path(CONDITION_ALBEDO),
                "baselineSha256": apps.sha256_file(CONDITION_ALBEDO),
                "maximumDifference": 0,
            },
        ),
    }
    regression_changed_job = manifest(
        manifests / "regression-real-changed.json",
        {
            **common,
            "family": "visual-regression",
            "baseline": apps.repo_path(CONDITION_ALBEDO),
            "current": apps.repo_path(condition_combined),
            "baselineSha256": apps.sha256_file(CONDITION_ALBEDO),
            "maximumDifference": 0,
        },
    )

    results = []
    for family in apps.FAMILIES:
        receipt = apps.COMPILERS[family](jobs[family], runs / family / "candidate", True)
        results.append(
            {
                "family": family,
                "run": "candidate",
                "expected": "PASS",
                "actual": receipt["technicalStatus"],
                "failedGates": [name for name, passed in receipt["gates"].items() if not passed],
                "receipt": apps.repo_path(runs / family / "candidate" / "receipt.json"),
                "proofBoard": receipt["outputs"].get("proofBoard"),
            }
        )

    changed_receipt = apps.compile_regression(
        regression_changed_job,
        runs / "regression" / "real-change-control",
        True,
    )
    results.append(
        {
            "family": "regression",
            "run": "real-change-control",
            "expected": "FAIL",
            "actual": changed_receipt["technicalStatus"],
            "failedGates": [
                name for name, passed in changed_receipt["gates"].items() if not passed
            ],
            "receipt": apps.repo_path(
                runs / "regression" / "real-change-control" / "receipt.json"
            ),
            "proofBoard": changed_receipt["outputs"].get("proofBoard"),
        }
    )

    emote_receipt = assetforge.ingest_emote_job(
        EMOTE_JOB,
        EMOTE_SHEET,
        runs / "emote" / "candidate",
        force=True,
    )
    results.insert(
        0,
        {
            "family": "emote",
            "run": "candidate",
            "expected": "PASS",
            "actual": emote_receipt["technicalStatus"],
            "failedGates": emote_receipt["failureReasons"],
            "receipt": apps.repo_path(runs / "emote" / "candidate" / "receipt.json"),
            "proofBoard": emote_receipt["outputs"].get("proofBoard"),
            "visualIdentity": emote_receipt["visualIdentity"],
        },
    )

    navigation_cells = []
    seen = set()
    for result in results:
        if result["family"] in seen or not result.get("proofBoard"):
            continue
        seen.add(result["family"])
        navigation_cells.append(
            (
                f"{result['family']} · {result['actual']}",
                Image.open(ROOT / result["proofBoard"]).convert("RGBA"),
            )
        )
    apps.proof_board(
        "Assetforge real-asset qualification — navigation only",
        navigation_cells,
        output_root / "qualification-navigation-board.png",
        (310, 225),
        3,
    )

    expectation_ok = all(result["actual"] == result["expected"] for result in results)
    evidence = {
        "schemaVersion": 1,
        "leafSources": leaf_evidence,
        "qualificationStaging": staging_evidence,
        "allLeafSourcesTracked": all(item["tracked"] for item in leaf_evidence),
        "allImagesDecodable": all(item["decodable"] for item in leaf_evidence + staging_evidence),
    }
    apps.write_json(output_root / "source-evidence.json", evidence)
    summary = {
        "schemaVersion": 1,
        "qualification": "assetforge-real-v1",
        "technicalStatus": "PASS" if expectation_ok else "FAIL",
        "claimBoundary": (
            "Real tracked inputs, source hashes, compiler gates, and a real changed-image detector "
            "are proven here. Mechanical PASS does not grant runtime admission or replace individual "
            "human taste review."
        ),
        "processCount": 12,
        "runCount": len(results),
        "expectationsMet": sum(result["actual"] == result["expected"] for result in results),
        "sourceEvidence": apps.repo_path(output_root / "source-evidence.json"),
        "navigationBoard": apps.repo_path(output_root / "qualification-navigation-board.png"),
        "results": results,
    }
    apps.write_json(output_root / "qualification-receipt.json", summary)
    return summary


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--force", action="store_true")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    result = run(args.output_dir, args.force)
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["technicalStatus"] == "PASS" else 1)


if __name__ == "__main__":
    main()
