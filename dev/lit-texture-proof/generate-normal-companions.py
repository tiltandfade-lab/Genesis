#!/usr/bin/env python3
"""Generate deterministic companion normal maps for two shipped Genesis textures.

The source texture paths may be hydrated PNGs or Git LFS pointer files. When a
pointer is encountered, the generator resolves the verified object from the
repository's local LFS store without mutating the production asset checkout.
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
from scipy.ndimage import gaussian_filter


REPO = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
GENERATED = HERE / "generated"
HEIGHT_CONTRAST = 0.8
TEXTURES = (
    {
        "id": "fantasy-floor",
        "source": "assets/textures/fantasy-floor-1.png",
        "strength": 8.0,
    },
    {
        "id": "fantasy-wall",
        "source": "assets/textures/fantasy-wall-1.png",
        "strength": 7.0,
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
    pointer_bytes = checkout_path.read_bytes()
    pointer_text = pointer_bytes.decode("utf-8", errors="ignore")
    match = LFS_PATTERN.match(pointer_text)
    if not match:
        return checkout_path, {
            "kind": "hydrated",
            "oidSha256": sha256_bytes(pointer_bytes),
            "declaredSize": len(pointer_bytes),
        }

    oid, declared_size = match.group(1), int(match.group(2))
    common_git_dir = subprocess.check_output(
        ["git", "rev-parse", "--git-common-dir"],
        cwd=REPO,
        text=True,
    ).strip()
    common_git_path = Path(common_git_dir)
    if not common_git_path.is_absolute():
        common_git_path = (REPO / common_git_path).resolve()
    object_path = common_git_path / "lfs" / "objects" / oid[:2] / oid[2:4] / oid
    object_bytes = object_path.read_bytes()
    if len(object_bytes) != declared_size:
        raise RuntimeError(f"LFS size mismatch for {relative}: {len(object_bytes)} != {declared_size}")
    if sha256_bytes(object_bytes) != oid:
        raise RuntimeError(f"LFS SHA-256 mismatch for {relative}")
    return object_path, {
        "kind": "lfs",
        "oidSha256": oid,
        "declaredSize": declared_size,
    }


def srgb_to_linear(rgb: np.ndarray) -> np.ndarray:
    return np.where(
        rgb <= 0.04045,
        rgb / 12.92,
        ((rgb + 0.055) / 1.055) ** 2.4,
    )


def periodic_derivative(height: np.ndarray, axis: int) -> np.ndarray:
    return (np.roll(height, -1, axis=axis) - np.roll(height, 1, axis=axis)) * 0.5


def periodic_component(source: np.ndarray) -> np.ndarray:
    """Return Moisan's periodic component of a 2D image.

    The removed smooth component carries the opposite-edge mismatch. Using the
    periodic component for height inference prevents the companion normal from
    introducing a seam even when painted color has a small boundary mismatch.
    """

    height, width = source.shape
    boundary = np.zeros_like(source, dtype=np.float64)
    top_delta = source[-1, :] - source[0, :]
    left_delta = source[:, -1] - source[:, 0]
    boundary[0, :] = top_delta
    boundary[-1, :] = -top_delta
    boundary[:, 0] += left_delta
    boundary[:, -1] -= left_delta

    yy = np.arange(height, dtype=np.float64)[:, None]
    xx = np.arange(width, dtype=np.float64)[None, :]
    denominator = (
        2.0 * np.cos(2.0 * np.pi * xx / width)
        + 2.0 * np.cos(2.0 * np.pi * yy / height)
        - 4.0
    )
    denominator[0, 0] = 1.0
    smooth_spectrum = np.fft.fft2(boundary) / denominator
    smooth_spectrum[0, 0] = 0.0
    smooth = np.fft.ifft2(smooth_spectrum).real
    return source - smooth


def seam_rms(rgb: np.ndarray) -> dict:
    f = rgb.astype(np.float32)
    vertical = np.sqrt(np.mean((f[:, 0] - f[:, -1]) ** 2))
    horizontal = np.sqrt(np.mean((f[0] - f[-1]) ** 2))
    vertical_interior = np.sqrt(np.mean(np.diff(f, axis=1) ** 2))
    horizontal_interior = np.sqrt(np.mean(np.diff(f, axis=0) ** 2))
    return {
        "vertical": round(float(vertical), 4),
        "horizontal": round(float(horizontal), 4),
        "verticalRelativeToInterior": round(float(vertical / max(vertical_interior, 1e-8)), 4),
        "horizontalRelativeToInterior": round(float(horizontal / max(horizontal_interior, 1e-8)), 4),
    }


def derive_height_and_normal(rgb_u8: np.ndarray, strength: float) -> tuple[np.ndarray, np.ndarray]:
    rgb = srgb_to_linear(rgb_u8.astype(np.float32) / 255.0)
    luma = rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722
    luma = periodic_component(luma)
    base = gaussian_filter(luma, sigma=0.8, mode="wrap")
    broad = gaussian_filter(luma, sigma=4.0, mode="wrap")
    detail = base - broad
    low, high = np.percentile(base, [2.0, 98.0])
    normalized = np.clip((base - low) / max(high - low, 1e-8), 0.0, 1.0)
    detail_scale = np.percentile(np.abs(detail), 96.0)
    detail_normalized = np.clip(detail / max(detail_scale, 1e-8), -1.0, 1.0)
    height = np.clip(normalized * 0.82 + (detail_normalized * 0.5 + 0.5) * 0.18, 0.0, 1.0)
    height = np.clip(0.5 + (height - 0.5) * HEIGHT_CONTRAST, 0.0, 1.0)

    dx = periodic_derivative(height, axis=1)
    dy = periodic_derivative(height, axis=0)
    normal = np.dstack((-dx * strength, -dy * strength, np.ones_like(height)))
    normal /= np.maximum(np.linalg.norm(normal, axis=2, keepdims=True), 1e-8)
    height_u8 = np.uint8(np.round(height * 255.0))
    normal_u8 = np.uint8(np.round(np.clip(normal * 0.5 + 0.5, 0.0, 1.0) * 255.0))
    return height_u8, normal_u8


def main() -> None:
    GENERATED.mkdir(parents=True, exist_ok=True)
    records = []
    for spec in TEXTURES:
        source_path, lineage = resolve_source(spec["source"])
        source_bytes = source_path.read_bytes()
        image = Image.open(source_path).convert("RGB")
        rgb = np.asarray(image)
        if image.size != (256, 256):
            raise RuntimeError(f"Expected 256x256 source for {spec['source']}, found {image.size}")

        albedo_path = GENERATED / f"{spec['id']}-albedo.png"
        height_path = GENERATED / f"{spec['id']}-height.png"
        normal_path = GENERATED / f"{spec['id']}-normal.png"
        albedo_path.write_bytes(source_bytes)
        height, normal = derive_height_and_normal(rgb, spec["strength"])
        Image.fromarray(height).save(height_path, optimize=False)
        Image.fromarray(normal).save(normal_path, optimize=False)

        copied_albedo = albedo_path.read_bytes()
        normal_z = normal[..., 2].astype(np.float32) / 255.0 * 2.0 - 1.0
        records.append(
            {
                "id": spec["id"],
                "source": spec["source"],
                "sourceStorage": lineage,
                "dimensions": [image.width, image.height],
                "normalStrength": spec["strength"],
                "albedo": {
                    "path": str(albedo_path.relative_to(REPO)),
                    "sha256": sha256_bytes(copied_albedo),
                    "byteIdenticalToSourceObject": copied_albedo == source_bytes,
                },
                "height": {
                    "path": str(height_path.relative_to(REPO)),
                    "sha256": sha256_bytes(height_path.read_bytes()),
                    "contrast": HEIGHT_CONTRAST,
                    "range": [int(height.min()), int(height.max())],
                },
                "normal": {
                    "path": str(normal_path.relative_to(REPO)),
                    "sha256": sha256_bytes(normal_path.read_bytes()),
                    "meanZ": round(float(normal_z.mean()), 6),
                    "seamRms": seam_rms(normal),
                },
            }
        )

    report = {
        "schemaVersion": 1,
        "proofId": "GENESIS-NORMAL-LAYER-AB-V001",
        "method": "periodic-plus-smooth luminance height to tangent-space normal",
        "claimBoundary": (
            "This proves independent normal-map layering on unchanged albedo. "
            "It does not claim luminance inference is final production sprite authoring."
        ),
        "textures": records,
    }
    (GENERATED / "normal-layer-metrics.json").write_text(
        json.dumps(report, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
