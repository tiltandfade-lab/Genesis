#!/usr/bin/env python3
"""Generate deterministic, tile-safe material-condition maps for the workbench proof.

This is deliberately not luminance-to-height. Source luminance proposes thin structural
joints, but face discoloration never directly contributes height. Face relief comes from
a seeded geometric field and each material class supplies its own joint-depth response.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

TOOLS = Path(os.environ.get("GENESIS_OFFLINE_ART_TOOLS", "/private/tmp/genesis-offline-art-tools"))
sys.path.insert(0, str(TOOLS))

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, gaussian_filter1d, grey_closing, grey_dilation


REPO = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
GENERATED = HERE / "generated"
TEXTURES = (
    {
        "id": "fantasy-floor",
        "title": "Fantasy Floor",
        "source": "assets/textures/fantasy-floor-1.png",
        "class": "stone.irregular-paver.floor",
        "seed": 42011,
        "jointDepth": 0.48,
        "erosionDepth": 0.18,
        "chipDepth": 0.14,
        "faceRelief": 0.026,
        "normalBakeStrength": 7.0,
        "dryRoughness": 0.84,
    },
    {
        "id": "fantasy-wall",
        "title": "Fantasy Wall",
        "source": "assets/textures/fantasy-wall-1.png",
        "class": "stone.coursed-brick.wall",
        "seed": 42012,
        "jointDepth": 0.20,
        "erosionDepth": 0.075,
        "chipDepth": 0.055,
        "faceRelief": 0.008,
        "normalBakeStrength": 2.8,
        "dryRoughness": 0.88,
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


def normalize(values: np.ndarray, low_percentile: float = 2, high_percentile: float = 98) -> np.ndarray:
    low, high = np.percentile(values, [low_percentile, high_percentile])
    return np.clip((values - low) / max(float(high - low), 1e-8), 0.0, 1.0)


def smoothstep(values: np.ndarray, low: float, high: float) -> np.ndarray:
    values = np.clip((values - low) / max(high - low, 1e-8), 0.0, 1.0)
    return values * values * (3.0 - 2.0 * values)


def periodic_noise(shape: tuple[int, int], seed: int, sigma: float) -> np.ndarray:
    rng = np.random.default_rng(seed)
    noise = gaussian_filter(rng.standard_normal(shape), sigma=sigma, mode="wrap")
    return normalize(noise, 1, 99)


def structure_joint_mask(luma: np.ndarray, surface: str) -> np.ndarray:
    """Propose mortar/joints from thin local darkness with oriented line support.

    Broad discoloration is removed by the black top-hat operation. Oriented support
    suppresses isolated dark face spots while retaining coursing and paver boundaries.
    """

    fine = gaussian_filter(luma, sigma=0.55, mode="wrap")
    if surface == "floor":
        horizontal = grey_closing(fine, size=(5, 13), mode="wrap") - fine
        vertical = grey_closing(fine, size=(13, 5), mode="wrap") - fine
        compact = grey_closing(fine, size=(7, 7), mode="wrap") - fine
        proposal = np.maximum(np.maximum(horizontal, vertical), compact * 0.72)
        proposal = normalize(proposal, 55, 99.3)
        h_support = gaussian_filter(proposal, sigma=(0.8, 2.6), mode="wrap")
        v_support = gaussian_filter(proposal, sigma=(2.6, 0.8), mode="wrap")
        support = normalize(np.maximum(h_support, v_support), 35, 98)
        joint = proposal * (0.48 + support * 0.52)
        return smoothstep(joint, 0.16, 0.68)

    horizontal = grey_closing(fine, size=(4, 17), mode="wrap") - fine
    vertical = grey_closing(fine, size=(13, 4), mode="wrap") - fine
    proposal = np.maximum(horizontal, vertical * 0.86)
    proposal = normalize(proposal, 62, 99.4)
    h_support = gaussian_filter(proposal, sigma=(0.65, 3.8), mode="wrap")
    v_support = gaussian_filter(proposal, sigma=(2.8, 0.65), mode="wrap")
    support = normalize(np.maximum(h_support, v_support * 0.82), 45, 98.5)
    joint = proposal * support
    joint = smoothstep(joint, 0.2, 0.72)

    # Coursed masonry has a strong row-level prior: a joint remains a joint even where
    # mineral staining makes mortar and face equally dark. Detect narrow dark row minima
    # across the tile, then modulate them by local horizontal evidence so they stay organic.
    row_profile = fine.mean(axis=1)
    row_dark = grey_closing(row_profile, size=9, mode="wrap") - row_profile
    row_prior = smoothstep(normalize(row_dark, 38, 99.2), 0.16, 0.7)[:, None]
    horizontal_evidence = normalize(horizontal, 48, 99.2)
    course_joint = row_prior * (0.34 + horizontal_evidence * 0.66)
    return np.maximum(joint, course_joint)


def normal_from_height(height: np.ndarray, strength: float) -> np.ndarray:
    dx = (np.roll(height, -1, axis=1) - np.roll(height, 1, axis=1)) * 0.5
    dy = (np.roll(height, -1, axis=0) - np.roll(height, 1, axis=0)) * 0.5
    normal = np.dstack((-dx * strength, -dy * strength, np.ones_like(height)))
    normal /= np.maximum(np.linalg.norm(normal, axis=2, keepdims=True), 1e-8)
    return normal


def to_u8(values: np.ndarray) -> np.ndarray:
    return np.uint8(np.round(np.clip(values, 0.0, 1.0) * 255.0))


def normal_to_u8(normal: np.ndarray) -> np.ndarray:
    return to_u8(normal * 0.5 + 0.5)


def seam_metrics(image: np.ndarray) -> dict:
    values = image.astype(np.float32)
    vertical = float(np.sqrt(np.mean((values[:, 0] - values[:, -1]) ** 2)))
    horizontal = float(np.sqrt(np.mean((values[0] - values[-1]) ** 2)))
    vertical_local = float(np.sqrt(np.mean(np.diff(values, axis=1) ** 2)))
    horizontal_local = float(np.sqrt(np.mean(np.diff(values, axis=0) ** 2)))
    return {
        "vertical": round(vertical, 4),
        "horizontal": round(horizontal, 4),
        "verticalRelativeToInterior": round(vertical / max(vertical_local, 1e-8), 4),
        "horizontalRelativeToInterior": round(horizontal / max(horizontal_local, 1e-8), 4),
    }


def aged_albedo(rgb: np.ndarray, age_mask: np.ndarray, joint: np.ndarray, surface: str) -> np.ndarray:
    values = rgb.astype(np.float32) / 255.0
    luma = values[..., 0] * 0.2126 + values[..., 1] * 0.7152 + values[..., 2] * 0.0722
    mineral = np.array([0.62, 0.59, 0.52] if surface == "floor" else [0.58, 0.57, 0.52])
    desaturated = luma[..., None] * 0.82 + mineral * 0.18
    faded = np.clip(desaturated * 1.12 + 0.024, 0.0, 1.0)
    mix = age_mask[..., None] * (0.65 if surface == "floor" else 0.55)
    result = values * (1.0 - mix) + faded * mix
    grime = joint[..., None] * age_mask[..., None] * (0.22 if surface == "floor" else 0.16)
    return to_u8(result * (1.0 - grime))


def build_maps(rgb: np.ndarray, spec: dict) -> dict[str, np.ndarray]:
    surface = "floor" if spec["id"].endswith("floor") else "wall"
    luma = (
        rgb[..., 0].astype(np.float32) * 0.2126
        + rgb[..., 1].astype(np.float32) * 0.7152
        + rgb[..., 2].astype(np.float32) * 0.0722
    ) / 255.0
    joint = structure_joint_mask(luma, surface)

    face_field = periodic_noise(joint.shape, spec["seed"] + 1, 3.2) - 0.5
    base_height = np.clip(
        0.72 + face_field * spec["faceRelief"] - joint * spec["jointDepth"],
        0.05,
        0.95,
    )

    chip_noise = periodic_noise(joint.shape, spec["seed"] + 2, 1.15)
    expanded = grey_dilation(joint, size=(5, 5), mode="wrap")
    edge_band = np.clip(expanded - joint * 0.72, 0.0, 1.0)
    chip = edge_band * smoothstep(chip_noise, 0.48, 0.78)
    deep_joint = grey_dilation(joint, size=(3, 3), mode="wrap")
    erosion_mask = np.clip(deep_joint * 0.62 + chip * 0.78, 0.0, 1.0)
    eroded_height = np.clip(
        base_height
        - deep_joint * spec["erosionDepth"]
        - chip * spec["chipDepth"],
        0.025,
        0.95,
    )

    age_broad = periodic_noise(joint.shape, spec["seed"] + 3, 13 if surface == "floor" else 16)
    age_fine = periodic_noise(joint.shape, spec["seed"] + 4, 3.5)
    age_mask = smoothstep(age_broad * 0.57 + age_fine * 0.23 + joint * 0.20, 0.3, 0.8)

    pool = periodic_noise(joint.shape, spec["seed"] + 5, 16 if surface == "floor" else 11)
    if surface == "floor":
        wetness = smoothstep(joint * 0.52 + pool * 0.62, 0.28, 0.78)
    else:
        rng = np.random.default_rng(spec["seed"] + 6)
        streak = gaussian_filter1d(rng.random(joint.shape[1]), sigma=5.5, mode="wrap")
        streak = normalize(streak, 4, 96)
        streaks = np.tile(streak[None, :], (joint.shape[0], 1))
        vertical_variation = periodic_noise(joint.shape, spec["seed"] + 7, 18)
        wetness = smoothstep(
            joint * 0.34 + streaks * 0.42 + pool * 0.15 + vertical_variation * 0.09,
            0.25,
            0.67,
        )

    rough_variation = periodic_noise(joint.shape, spec["seed"] + 8, 4.5) - 0.5
    roughness = np.clip(spec["dryRoughness"] + rough_variation * 0.07 + joint * 0.035, 0.62, 0.98)

    return {
        "structure-mask": to_u8(joint),
        "height-base": to_u8(base_height),
        "normal-base": normal_to_u8(normal_from_height(base_height, spec["normalBakeStrength"])),
        "age-mask": to_u8(age_mask),
        "albedo-aged": aged_albedo(rgb, age_mask, joint, surface),
        "erosion-mask": to_u8(erosion_mask),
        "height-eroded": to_u8(eroded_height),
        "normal-eroded": normal_to_u8(normal_from_height(eroded_height, spec["normalBakeStrength"])),
        "wetness-mask": to_u8(wetness),
        "roughness-dry": to_u8(roughness),
    }


def save_png(path: Path, values: np.ndarray) -> None:
    Image.fromarray(values).save(path, optimize=False)


def main() -> None:
    GENERATED.mkdir(parents=True, exist_ok=True)
    records = []
    for spec in TEXTURES:
        source_path, lineage = resolve_source(spec["source"])
        source_bytes = source_path.read_bytes()
        image = Image.open(source_path).convert("RGB")
        if image.size != (256, 256):
            raise RuntimeError(f"Expected 256x256 source for {spec['source']}, found {image.size}")
        rgb = np.asarray(image)

        albedo_path = GENERATED / f"{spec['id']}-albedo.png"
        albedo_path.write_bytes(source_bytes)
        maps = build_maps(rgb, spec)
        output_records = {}
        for role, values in maps.items():
            path = GENERATED / f"{spec['id']}-{role}.png"
            save_png(path, values)
            output_records[role] = {
                "path": str(path.relative_to(REPO)),
                "sha256": sha256_bytes(path.read_bytes()),
                "range": [int(values.min()), int(values.max())],
                "mean": round(float(values.mean()), 4),
                "seamRms": seam_metrics(values),
            }

        copied_albedo = albedo_path.read_bytes()
        records.append(
            {
                "id": spec["id"],
                "title": spec["title"],
                "source": spec["source"],
                "sourceStorage": lineage,
                "class": spec["class"],
                "seed": spec["seed"],
                "dimensions": [image.width, image.height],
                "structureContract": {
                    "faceDiscolorationHeightGain": 0,
                    "jointProposal": "thin local darkness plus oriented line support",
                    "faceReliefSource": "seeded periodic geometric field",
                    "jointDepth": spec["jointDepth"],
                    "erosionDepth": spec["erosionDepth"],
                    "chipDepth": spec["chipDepth"],
                    "faceRelief": spec["faceRelief"],
                    "normalBakeStrength": spec["normalBakeStrength"],
                },
                "albedo": {
                    "path": str(albedo_path.relative_to(REPO)),
                    "sha256": sha256_bytes(copied_albedo),
                    "byteIdenticalToSourceObject": copied_albedo == source_bytes,
                },
                "maps": output_records,
            }
        )

    report = {
        "schemaVersion": 1,
        "proofId": "GENESIS-MATERIAL-CONDITION-WORKBENCH-V001",
        "method": "semantic-joint proposal plus class-scaled structure and deterministic condition masks",
        "claimBoundary": (
            "This proves independent deterministic age, erosion, and wetness controls on preserved source art. "
            "The automatic joint proposal remains an editable starting mask, not final semantic authorship."
        ),
        "textures": records,
    }
    (GENERATED / "condition-map-metrics.json").write_text(
        json.dumps(report, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
