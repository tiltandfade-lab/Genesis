#!/usr/bin/env python3
"""Package reusable ImageGen source sheets without admitting them to runtime.

The source images remain untouched. This script creates:
- neutral, palette-quantized, binary-alpha mask candidates;
- one exact 160x160 W5H5 masonry parent with five 32px courses;
- restrained derived normal and ORM companions for review;
- a labeled contact sheet and machine-readable QA receipt.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
PACK = ROOT / "assets/materials/golden/guard-post/v015"
SOURCE = PACK / "source"
ARTIFACTS = ROOT / "artifacts/golden-site-1-material-sources-v015"

MASK_SHEETS = {
    "reusable-ivy-kit": {
        "utilityTier": "mixed-universal-and-family-variant",
        "productionBudget": "high-for-roots-runners-connectors; bounded-for-distinctive-curls",
    },
    "contact-grime-kit": {
        "utilityTier": "universal-primitive",
        "productionBudget": "high",
    },
    "wet-edge-growth-kit": {
        "utilityTier": "mixed-universal-and-family-variant",
        "productionBudget": "high-for-runners-corners; bounded-for-outfall-fans",
    },
    "camera-neutral-tuft-kit": {
        "utilityTier": "mixed-universal-and-family-variant",
        "productionBudget": "high-for-radial-tufts; bounded-for-flower-and-reed-accents",
    },
    "recolorable-signifier-cloth-kit": {
        "utilityTier": "universal-attachment-primitive",
        "productionBudget": "high-shape-reuse; world-truth-controls-color-and-marking",
    },
    "architectural-relief-kit": {
        "utilityTier": "mixed-universal-family-and-specific-accent",
        "productionBudget": "high-for-bands-caps-surrounds; bounded-for-ornament",
    },
}


def quantize_neutral_mask(source: Path, output: Path) -> dict:
    image = Image.open(source).convert("RGBA")
    data = np.asarray(image, dtype=np.uint8).copy()
    alpha = np.where(data[:, :, 3] >= 128, 255, 0).astype(np.uint8)
    luma = np.rint(
        data[:, :, 0] * 0.2126
        + data[:, :, 1] * 0.7152
        + data[:, :, 2] * 0.0722
    ).astype(np.uint8)
    luma = np.clip(np.rint(luma / 24) * 24, 0, 255).astype(np.uint8)
    packed = np.zeros_like(data)
    packed[:, :, :3] = luma[:, :, None]
    packed[:, :, 3] = alpha
    Image.fromarray(packed).save(output)
    visible = packed[:, :, 3] > 0
    magenta = (
        visible
        & (packed[:, :, 0] > 120)
        & (packed[:, :, 0] > packed[:, :, 1] * 1.35)
        & (packed[:, :, 2] > packed[:, :, 1] * 1.35)
    )
    return {
        "source": str(source.relative_to(ROOT)),
        "output": str(output.relative_to(ROOT)),
        "size": list(image.size),
        "visiblePixels": int(visible.sum()),
        "transparentPixels": int((packed[:, :, 3] == 0).sum()),
        "partialAlphaPixels": int(((packed[:, :, 3] > 0) & (packed[:, :, 3] < 255)).sum()),
        "visibleMagentaFamilyPixels": int(magenta.sum()),
        "rgbMode": "neutral-luma-24-step",
        "alphaMode": "binary-threshold-128",
    }


def package_masonry() -> list[dict]:
    source = SOURCE / "defensive-masonry-five-course-source.png"
    image = Image.open(source).convert("RGB")
    width, height = image.size
    course_images = []
    for course in range(5):
        top = round(course * height / 5)
        bottom = round((course + 1) * height / 5)
        course_image = image.crop((0, top, width, bottom))
        course_images.append(course_image.resize((160, 32), Image.Resampling.NEAREST))
    albedo = Image.new("RGB", (160, 160))
    for course, course_image in enumerate(course_images):
        albedo.paste(course_image, (0, course * 32))
    albedo_data = np.asarray(albedo, dtype=np.uint8)
    albedo_data = np.clip(np.rint(albedo_data / 12) * 12, 0, 255).astype(np.uint8)
    albedo = Image.fromarray(albedo_data)
    albedo_path = PACK / "defensive-masonry-W5H5-albedo-160.png"
    albedo.save(albedo_path)

    height_field = (
        albedo_data[:, :, 0] * 0.2126
        + albedo_data[:, :, 1] * 0.7152
        + albedo_data[:, :, 2] * 0.0722
    ) / 255.0
    gradient_y, gradient_x = np.gradient(height_field)
    normal_x = -gradient_x * 2.25
    normal_y = gradient_y * 2.25
    normal_z = np.ones_like(normal_x)
    length = np.sqrt(normal_x**2 + normal_y**2 + normal_z**2)
    normal = np.stack(
        [
            normal_x / length * 0.5 + 0.5,
            normal_y / length * 0.5 + 0.5,
            normal_z / length * 0.5 + 0.5,
        ],
        axis=2,
    )
    normal_path = PACK / "defensive-masonry-W5H5-normal-160.png"
    Image.fromarray(np.clip(np.rint(normal * 255), 0, 255).astype(np.uint8)).save(
        normal_path
    )

    ao = np.clip(0.78 + height_field * 0.22, 0, 1)
    roughness = np.clip(0.94 - height_field * 0.08, 0.82, 0.96)
    metalness = np.zeros_like(ao)
    orm = np.stack([ao, roughness, metalness], axis=2)
    orm_path = PACK / "defensive-masonry-W5H5-orm-160.png"
    Image.fromarray(np.clip(np.rint(orm * 255), 0, 255).astype(np.uint8)).save(
        orm_path
    )
    receipts = [
        {
            "source": str(source.relative_to(ROOT)),
            "output": str(albedo_path.relative_to(ROOT)),
            "size": [160, 160],
            "pixelsPerFoot": 32,
            "physicalEnvelope": "W5H5",
            "courseCount": 5,
            "pixelsPerCourse": 32,
            "sampling": "nearest-no-mipmap",
            "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        },
        {
            "output": str(normal_path.relative_to(ROOT)),
            "size": [160, 160],
            "derivation": "restrained-luma-gradient-review-companion",
            "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        },
        {
            "output": str(orm_path.relative_to(ROOT)),
            "size": [160, 160],
            "channels": {"r": "ao", "g": "roughness", "b": "metalness"},
            "derivation": "restrained-luma-review-companion",
            "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        },
    ]

    def companion_maps(rgb: np.ndarray, stem: str) -> tuple[Path, Path]:
        local_height = (
            rgb[:, :, 0] * 0.2126 + rgb[:, :, 1] * 0.7152 + rgb[:, :, 2] * 0.0722
        ) / 255.0
        local_gradient_y, local_gradient_x = np.gradient(local_height)
        local_normal_x = -local_gradient_x * 2.25
        local_normal_y = local_gradient_y * 2.25
        local_normal_z = np.ones_like(local_normal_x)
        local_length = np.sqrt(
            local_normal_x**2 + local_normal_y**2 + local_normal_z**2
        )
        local_normal = np.stack(
            [
                local_normal_x / local_length * 0.5 + 0.5,
                local_normal_y / local_length * 0.5 + 0.5,
                local_normal_z / local_length * 0.5 + 0.5,
            ],
            axis=2,
        )
        normal_output = PACK / f"{stem}-normal.png"
        Image.fromarray(
            np.clip(np.rint(local_normal * 255), 0, 255).astype(np.uint8)
        ).save(normal_output)
        local_ao = np.clip(0.78 + local_height * 0.22, 0, 1)
        local_roughness = np.clip(0.94 - local_height * 0.08, 0.82, 0.96)
        local_orm = np.stack([local_ao, local_roughness, np.zeros_like(local_ao)], axis=2)
        orm_output = PACK / f"{stem}-orm.png"
        Image.fromarray(
            np.clip(np.rint(local_orm * 255), 0, 255).astype(np.uint8)
        ).save(orm_output)
        return normal_output, orm_output

    variant_offsets = {
        "a": [17, 61, 31, 83, 47],
        "b": [73, 23, 91, 41, 109],
        "c": [43, 101, 13, 67, 29],
    }
    variants: dict[str, np.ndarray] = {}
    for variant_id, offsets in variant_offsets.items():
        variant = np.zeros_like(albedo_data)
        for course, offset in enumerate(offsets):
            row = albedo_data[course * 32 : (course + 1) * 32]
            # Every variant shares the same course-specific twelve-pixel edge socket. Mirroring
            # that socket at the far edge makes adjacent modules meet through one continuing block
            # rather than a full-height mortar line at every five-foot solver boundary.
            row_luma = (
                row[:, :, 0] * 0.2126
                + row[:, :, 1] * 0.7152
                + row[:, :, 2] * 0.0722
            )
            best_start = 0
            best_score = -float("inf")
            for start in range(4, 145):
                window = row_luma[7:25, start : start + 12]
                score = float(np.percentile(window, 20) - np.std(window) * 0.24)
                if score > best_score:
                    best_score = score
                    best_start = start
            edge_socket = row[:, best_start : best_start + 12]
            interior = np.roll(row, offset, axis=1)[:, 12:148]
            variant[course * 32 : (course + 1) * 32] = np.concatenate(
                [edge_socket, interior, np.flip(edge_socket, axis=1)], axis=1
            )
        variants[variant_id] = variant
        stem = f"defensive-masonry-W5H5-bond-{variant_id}-160"
        albedo_output = PACK / f"{stem}-albedo.png"
        Image.fromarray(variant).save(albedo_output)
        normal_output, orm_output = companion_maps(variant, stem)
        receipts.append(
            {
                "output": str(albedo_output.relative_to(ROOT)),
                "normal": str(normal_output.relative_to(ROOT)),
                "orm": str(orm_output.relative_to(ROOT)),
                "size": [160, 160],
                "physicalEnvelope": "W5H5",
                "pixelsPerFoot": 32,
                "courseCount": 5,
                "pixelsPerCourse": 32,
                "bondSocket": "shared-course-edge-socket-v1",
                "variant": variant_id,
                "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
            }
        )

    w5h10 = np.concatenate([variants["a"], variants["c"]], axis=0)
    w5h10_stem = "defensive-masonry-W5H10-bond-proof-160x320"
    w5h10_albedo = PACK / f"{w5h10_stem}-albedo.png"
    Image.fromarray(w5h10).save(w5h10_albedo)
    w5h10_normal, w5h10_orm = companion_maps(w5h10, w5h10_stem)
    receipts.append(
        {
            "output": str(w5h10_albedo.relative_to(ROOT)),
            "normal": str(w5h10_normal.relative_to(ROOT)),
            "orm": str(w5h10_orm.relative_to(ROOT)),
            "size": [160, 320],
            "physicalEnvelope": "W5H10",
            "pixelsPerFoot": 32,
            "courseCount": 10,
            "pixelsPerCourse": 32,
            "bondSocket": "shared-course-edge-socket-v1",
            "composition": ["bond-a", "bond-c"],
            "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        }
    )

    w10h10 = np.concatenate(
        [
            np.concatenate([variants["c"], variants["a"]], axis=1),
            np.concatenate([variants["a"], variants["b"]], axis=1),
        ],
        axis=0,
    )
    w10h10_stem = "defensive-masonry-W10H10-bond-proof-320"
    w10h10_albedo = PACK / f"{w10h10_stem}-albedo.png"
    Image.fromarray(w10h10).save(w10h10_albedo)
    w10h10_normal, w10h10_orm = companion_maps(w10h10, w10h10_stem)
    receipts.append(
        {
            "output": str(w10h10_albedo.relative_to(ROOT)),
            "normal": str(w10h10_normal.relative_to(ROOT)),
            "orm": str(w10h10_orm.relative_to(ROOT)),
            "size": [320, 320],
            "physicalEnvelope": "W10H10",
            "pixelsPerFoot": 32,
            "courseCount": 10,
            "pixelsPerCourse": 32,
            "bondSocket": "shared-course-edge-socket-v1",
            "composition": ["bond-c", "bond-a", "bond-a", "bond-b"],
            "status": "TECHNICAL_CANDIDATE_NOT_APPROVED",
        }
    )
    return receipts


def package_runtime_primitives() -> list[dict]:
    """Compile a small semantic vocabulary from the source sheets.

    These are placement-ready review candidates, not a blanket admission of every generated form.
    Universal primitives get stable sockets and physical intent; stronger authored silhouettes are
    retained as bounded accents so specificity limits production rather than deleting useful art.
    """

    runtime = PACK / "runtime"
    runtime.mkdir(parents=True, exist_ok=True)

    def source_image(stem: str) -> Image.Image:
        return Image.open(PACK / f"{stem}-neutral-mask-hard-alpha.png").convert("RGBA")

    def alpha_trim(image: Image.Image, pad: int = 0) -> Image.Image:
        alpha = image.getchannel("A")
        bounds = alpha.getbbox()
        if not bounds:
            raise ValueError("runtime primitive crop contains no visible pixels")
        left, top, right, bottom = bounds
        return image.crop(
            (
                max(0, left - pad),
                max(0, top - pad),
                min(image.width, right + pad),
                min(image.height, bottom + pad),
            )
        )

    def fit_canvas(
        image: Image.Image,
        size: tuple[int, int],
        anchor: str = "center-bottom",
        maximum_fill: float = 0.94,
    ) -> Image.Image:
        canvas = Image.new("RGBA", size, (0, 0, 0, 0))
        scale = min(
            size[0] * maximum_fill / image.width,
            size[1] * maximum_fill / image.height,
        )
        resized = image.resize(
            (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
            Image.Resampling.NEAREST,
        )
        if anchor == "left-bottom":
            x = 0
        elif anchor == "right-bottom":
            x = size[0] - resized.width
        else:
            x = (size[0] - resized.width) // 2
        y = size[1] - resized.height
        canvas.alpha_composite(resized, (x, y))
        return canvas

    def exact_wrap_x(image: Image.Image) -> Image.Image:
        data = np.asarray(image, dtype=np.uint8).copy()
        # The same edge column at U=0 and U=1 gives a deterministic wrap socket without
        # softening the binary silhouette. Organic variation resumes immediately inside it.
        socket = np.maximum(data[:, 0], data[:, -1])
        data[:, 0] = socket
        data[:, -1] = socket
        return Image.fromarray(data)

    receipts = []

    def save(
        primitive_id: str,
        image: Image.Image,
        source_stem: str,
        utility_tier: str,
        production_budget: str,
        placement_socket: str,
    ) -> None:
        output = runtime / f"{primitive_id}.png"
        image.save(output)
        data = np.asarray(image.convert("RGBA"), dtype=np.uint8)
        visible = data[:, :, 3] > 0
        magenta = (
            visible
            & (data[:, :, 0] > 120)
            & (data[:, :, 0] > data[:, :, 1] * 1.35)
            & (data[:, :, 2] > data[:, :, 1] * 1.35)
        )
        receipts.append(
            {
                "id": primitive_id,
                "source": (
                    f"assets/materials/golden/guard-post/v015/"
                    f"{source_stem}-neutral-mask-hard-alpha.png"
                ),
                "output": str(output.relative_to(ROOT)),
                "size": list(image.size),
                "utilityTier": utility_tier,
                "productionBudget": production_budget,
                "placementSocket": placement_socket,
                "partialAlphaPixels": int(
                    ((data[:, :, 3] > 0) & (data[:, :, 3] < 255)).sum()
                ),
                "visibleMagentaFamilyPixels": int(magenta.sum()),
                "status": "RUNTIME_CANDIDATE_NOT_APPROVED",
            }
        )

    grime_source = source_image("contact-grime-kit")
    # The generated sheet's taller bands read as vegetation or stalagmites at gameplay scale.
    # Compile the low fourth-row apron as the universal contact primitive; retain the tall bands
    # in the source sheet as bounded damp/neglect variants.
    grime_apron = fit_canvas(
        alpha_trim(grime_source.crop((300, 700, 735, 815)), 2),
        (512, 128),
        "center-bottom",
        0.98,
    )
    grime_apron = exact_wrap_x(grime_apron)
    save(
        "contact-grime-apron-tileable-mask-512x128",
        grime_apron,
        "contact-grime-kit",
        "universal-primitive",
        "high",
        "wall-ground-contact-repeat-x",
    )
    # Runtime receivers need an albedo-safe companion, not the near-white neutral mask itself.
    # Preserve the identical reusable alpha socket while compressing visible luma into a neutral
    # mid-dark range that the material tint can grade. If this texture is ever sampled as colour
    # by a decal/fallback path, it reads as grime instead of pale clipped paper triangles.
    low_profile_grime = Image.new("RGBA", (512, 128), (0, 0, 0, 0))
    low_profile_grime.alpha_composite(
        grime_apron.resize((512, 48), Image.Resampling.NEAREST),
        (0, 80),
    )
    low_profile_grime = exact_wrap_x(low_profile_grime)
    grime_albedo_data = np.asarray(low_profile_grime, dtype=np.uint8).copy()
    grime_visible = grime_albedo_data[:, :, 3] > 0
    grime_luma = grime_albedo_data[:, :, 0].astype(np.float32)
    grime_value = np.clip(np.rint(54 + grime_luma * 0.38), 54, 148).astype(np.uint8)
    grime_albedo_data[:, :, :3] = 0
    grime_albedo_data[grime_visible, 0] = grime_value[grime_visible]
    grime_albedo_data[grime_visible, 1] = grime_value[grime_visible]
    grime_albedo_data[grime_visible, 2] = grime_value[grime_visible]
    save(
        "contact-grime-apron-low-profile-neutral-albedo-alpha-512x128",
        Image.fromarray(grime_albedo_data),
        "contact-grime-kit",
        "universal-primitive",
        "high",
        "wall-ground-contact-repeat-x",
    )

    ivy_source = source_image("reusable-ivy-kit")
    ivy_runner = alpha_trim(ivy_source.crop((430, 20, 700, 500)), 4)
    ivy_face_a = fit_canvas(ivy_runner, (256, 256), "left-bottom", 0.92)
    ivy_face_b = fit_canvas(
        ivy_runner.transpose(Image.Transpose.FLIP_LEFT_RIGHT),
        (256, 256),
        "right-bottom",
        0.92,
    )
    save(
        "ivy-corner-face-a-shared-left-mask-256",
        ivy_face_a,
        "reusable-ivy-kit",
        "universal-primitive",
        "high-for-corner-connectors",
        "two-face-corner-shared-left-ground-root",
    )
    save(
        "ivy-corner-face-b-shared-right-mask-256",
        ivy_face_b,
        "reusable-ivy-kit",
        "universal-primitive",
        "high-for-corner-connectors",
        "two-face-corner-shared-right-ground-root",
    )
    ivy_horizontal = fit_canvas(
        alpha_trim(ivy_source.crop((1120, 330, 1536, 500)), 4),
        (512, 128),
        "center-bottom",
        0.94,
    )
    save(
        "ivy-horizontal-runner-mask-512x128",
        exact_wrap_x(ivy_horizontal),
        "reusable-ivy-kit",
        "family-variant",
        "moderate",
        "horizontal-seam-repeat-x",
    )

    wet_source = source_image("wet-edge-growth-kit")
    wet_runner = fit_canvas(
        alpha_trim(wet_source.crop((20, 190, 760, 380)), 4),
        (512, 128),
        "center-bottom",
        0.94,
    )
    save(
        "wet-edge-runner-mask-512x128",
        exact_wrap_x(wet_runner),
        "wet-edge-growth-kit",
        "universal-primitive",
        "high-for-causal-wet-edges",
        "wet-edge-repeat-x",
    )

    tuft_source = source_image("camera-neutral-tuft-kit")
    radial_tuft = fit_canvas(
        alpha_trim(tuft_source.crop((100, 180, 340, 430)), 4),
        (160, 160),
        "center-bottom",
        0.9,
    )
    save(
        "radial-grass-tuft-mask-160",
        radial_tuft,
        "camera-neutral-tuft-kit",
        "universal-primitive",
        "high",
        "ground-point-cross-card-or-extrusion",
    )

    cloth_source = source_image("recolorable-signifier-cloth-kit")
    banner = fit_canvas(
        alpha_trim(cloth_source.crop((70, 30, 320, 510)), 4),
        (160, 320),
        "center-bottom",
        0.94,
    )
    save(
        "signifier-banner-long-mask-160x320",
        banner,
        "recolorable-signifier-cloth-kit",
        "universal-attachment-primitive",
        "high-shape-reuse",
        "wall-or-pole-hang-world-truth-color",
    )

    relief_source = source_image("architectural-relief-kit")
    relief_band = fit_canvas(
        alpha_trim(relief_source.crop((20, 150, 760, 410)), 4),
        (320, 96),
        "center-bottom",
        0.94,
    )
    save(
        "architectural-relief-band-mask-320x96",
        relief_band,
        "architectural-relief-kit",
        "universal-join-primitive",
        "high",
        "wall-course-band-W10",
    )
    return receipts


def checker(size: tuple[int, int], cell: int = 16) -> Image.Image:
    width, height = size
    result = Image.new("RGB", size, "#252722")
    draw = ImageDraw.Draw(result)
    for y in range(0, height, cell):
        for x in range(0, width, cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill="#353831")
    return result


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def make_contact_sheet(rows: list[dict]) -> Path:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    card_width, card_height = 560, 380
    columns = 2
    total_rows = math.ceil(len(rows) / columns)
    sheet = Image.new("RGB", (1200, 120 + total_rows * 410), "#11120f")
    draw = ImageDraw.Draw(sheet)
    draw.text((36, 24), "Golden Site 1 · Reusable Source Kit v015", fill="#f0e6d3", font=font(31))
    draw.text(
        (36, 68),
        "source candidates · neutral recolorable masks · binary alpha · no runtime admission",
        fill="#c99d4d",
        font=font(16),
    )
    for index, row in enumerate(rows):
        column = index % columns
        grid_row = index // columns
        left = 30 + column * 590
        top = 110 + grid_row * 410
        draw.rectangle((left, top, left + card_width, top + card_height), fill="#1a1b17", outline="#585043")
        title = row["id"].replace("-", " ").title()
        draw.text((left + 18, top + 14), title, fill="#ede3d2", font=font(19))
        draw.text(
            (left + 18, top + 42),
            row["utilityTier"],
            fill="#c99d4d",
            font=font(12),
        )
        preview_box = (left + 18, top + 70, left + card_width - 18, top + card_height - 48)
        preview_size = (preview_box[2] - preview_box[0], preview_box[3] - preview_box[1])
        preview = checker(preview_size)
        asset = Image.open(ROOT / row["output"]).convert("RGBA")
        scale = min(preview_size[0] / asset.width, preview_size[1] / asset.height)
        resized = asset.resize(
            (max(1, round(asset.width * scale)), max(1, round(asset.height * scale))),
            Image.Resampling.NEAREST,
        )
        preview.alpha_composite(
            resized, ((preview.width - resized.width) // 2, (preview.height - resized.height) // 2)
        ) if preview.mode == "RGBA" else None
        if preview.mode != "RGBA":
            preview = preview.convert("RGBA")
            preview.alpha_composite(
                resized,
                ((preview.width - resized.width) // 2, (preview.height - resized.height) // 2),
            )
        sheet.paste(preview.convert("RGB"), (preview_box[0], preview_box[1]))
        draw.text(
            (left + 18, top + card_height - 32),
            row["productionBudget"],
            fill="#aaa08e",
            font=font(11),
        )
    path = ARTIFACTS / "reusable-source-kit-v015-contact-sheet.png"
    sheet.save(path)
    return path


def main() -> None:
    PACK.mkdir(parents=True, exist_ok=True)
    mask_receipts = []
    contact_rows = []
    for stem, classification in MASK_SHEETS.items():
        source = PACK / f"{stem}-albedo-alpha.png"
        output = PACK / f"{stem}-neutral-mask-hard-alpha.png"
        receipt = quantize_neutral_mask(source, output)
        receipt.update(classification)
        receipt["id"] = stem
        receipt["status"] = "SOURCE_CANDIDATE_NOT_RUNTIME_ADMITTED"
        mask_receipts.append(receipt)
        contact_rows.append(
            {
                "id": stem,
                "output": receipt["output"],
                **classification,
            }
        )
    masonry_receipts = package_masonry()
    runtime_primitive_receipts = package_runtime_primitives()
    masonry_variants = [row for row in masonry_receipts if row.get("variant")]
    contact_rows.append(
        {
            "id": "defensive-masonry-W5H5",
            "output": masonry_receipts[0]["output"],
            "utilityTier": "universal-parent-material-candidate",
            "productionBudget": "one governed parent; variants share exact bond coordinates",
        }
    )
    contact_sheet = make_contact_sheet(contact_rows)
    receipt = {
        "schema": "GuardPostReusableSourceKitV015Receipt",
        "status": "SOURCE_CANDIDATE_NOT_RUNTIME_ADMITTED",
        "specificityLaw": (
            "specific forms are retained; production volume and default procedural eligibility "
            "decrease as specificity increases"
        ),
        "maskSheets": mask_receipts,
        "masonry": masonry_receipts,
        "runtimePrimitives": runtime_primitive_receipts,
        "contactSheet": str(contact_sheet.relative_to(ROOT)),
        "hardChecks": {
            "allMasksBinaryAlpha": all(row["partialAlphaPixels"] == 0 for row in mask_receipts),
            "allMasksVisibleMagentaFree": all(
                row["visibleMagentaFamilyPixels"] == 0 for row in mask_receipts
            ),
            "masonryW5H5Exact160": masonry_receipts[0]["size"] == [160, 160],
            "masonryFiveExact32pxCourses": (
                masonry_receipts[0]["courseCount"] == 5
                and masonry_receipts[0]["pixelsPerCourse"] == 32
            ),
            "masonryHasThreeSharedSocketBondVariants": (
                len(masonry_variants) == 3
                and len({row["variant"] for row in masonry_variants}) == 3
                and {row["bondSocket"] for row in masonry_variants}
                == {"shared-course-edge-socket-v1"}
            ),
            "masonryHasLinkedW5H10AndW10H10Proofs": (
                any(row.get("physicalEnvelope") == "W5H10" for row in masonry_receipts)
                and any(row.get("physicalEnvelope") == "W10H10" for row in masonry_receipts)
            ),
            "runtimePrimitivesBinaryAlpha": all(
                row["partialAlphaPixels"] == 0 for row in runtime_primitive_receipts
            ),
            "runtimePrimitivesVisibleMagentaFree": all(
                row["visibleMagentaFamilyPixels"] == 0
                for row in runtime_primitive_receipts
            ),
            "runtimePrimitivesHavePlacementSockets": all(
                bool(row["placementSocket"]) for row in runtime_primitive_receipts
            ),
        },
    }
    (PACK / "manifest.json").write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt["hardChecks"], indent=2))
    print(contact_sheet)


if __name__ == "__main__":
    main()
