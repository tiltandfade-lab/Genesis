#!/usr/bin/env python3
"""Package two ImageGen party sheets as exact 32px/ft standee candidates.

The physical subject axis is head-to-feet, not the full alpha bounds: staffs, spears, hats, cloaks,
and bows may extend the canvas without shrinking the actor. Outputs are palette-bounded, binary
alpha, nearest-resampled, individually padded PNGs with authored foot anchors.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage


ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "assets/sprites-golden/guard-post-v001"
SOURCE = PACK / "source"
ARTIFACT = ROOT / "artifacts/golden-site-1-sprites-v001"
TARGET_PPF = 32


SHEETS = {
    "pc-party": {
        "file": "pc-party-alpha.png",
        "members": [
            {
                "id": "pc-vanguard",
                "label": "PC Vanguard",
                "feet": 6.0,
                "column": 0,
                "bodyTopY": 139,
                "footY": 765,
                "anchorX": 280,
                "role": "pc-frontline",
            },
            {
                "id": "pc-caster",
                "label": "PC Caster",
                "feet": 5.7,
                "column": 1,
                "bodyTopY": 139,
                "footY": 765,
                "anchorX": 700,
                "role": "pc-control",
            },
            {
                "id": "pc-scout",
                "label": "PC Scout",
                "feet": 5.8,
                "column": 2,
                "bodyTopY": 143,
                "footY": 765,
                "anchorX": 1100,
                "role": "pc-ranged",
            },
            {
                "id": "pc-support",
                "label": "PC Support",
                "feet": 5.9,
                "column": 3,
                "bodyTopY": 136,
                "footY": 765,
                "anchorX": 1480,
                "role": "pc-support",
            },
        ],
    },
    "guard-detachment": {
        "file": "guard-detachment-alpha.png",
        "members": [
            {
                "id": "guard-captain",
                "label": "Guard Captain",
                "feet": 6.1,
                "column": 0,
                "bodyTopY": 230,
                "footY": 825,
                "anchorX": 250,
                "role": "guard-threshold",
            },
            {
                "id": "guard-crossbow",
                "label": "Guard Crossbow",
                "feet": 5.8,
                "column": 1,
                "bodyTopY": 223,
                "footY": 822,
                "anchorX": 615,
                "role": "guard-lookout",
            },
            {
                "id": "guard-heavy",
                "label": "Guard Heavy",
                "feet": 6.25,
                "column": 2,
                "bodyTopY": 231,
                "footY": 829,
                "anchorX": 1000,
                "role": "guard-barrier",
            },
            {
                "id": "guard-runner",
                "label": "Guard Runner",
                "feet": 5.7,
                "column": 3,
                "bodyTopY": 231,
                "footY": 826,
                "anchorX": 1400,
                "role": "guard-signal",
            },
        ],
    },
}


def ceil_to(value: int, quantum: int) -> int:
    return int(math.ceil(value / quantum) * quantum)


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in [
        Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
    ]:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def palette_bound(rgba: Image.Image, colors: int = 64) -> Image.Image:
    data = np.asarray(rgba, dtype=np.uint8).copy()
    alpha = np.where(data[:, :, 3] >= 128, 255, 0).astype(np.uint8)
    rgb = Image.fromarray(data[:, :, :3])
    quantized = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    result = np.asarray(quantized.convert("RGB"), dtype=np.uint8).copy()
    packed = np.zeros_like(data)
    packed[:, :, :3] = result
    packed[:, :, 3] = alpha
    packed[alpha == 0, :3] = 0
    return Image.fromarray(packed)


def isolate_member_component(sheet: Image.Image, member: dict) -> tuple[Image.Image, tuple[int, int, int, int], dict]:
    """Keep the connected actor silhouette, even when equipment crosses a sheet column.

    The component nearest the authored body anchor is the actor. Small disconnected details
    (such as a hanging staff jewel) are retained when their centroid falls inside the actor's
    primary bounding box. Other neighboring actors are removed before any crop is calculated.
    """

    alpha = np.asarray(sheet.getchannel("A"), dtype=np.uint8)
    mask = alpha >= 128
    labels, component_count = ndimage.label(mask, structure=np.ones((3, 3), dtype=np.uint8))
    sample_y = round((member["bodyTopY"] + member["footY"]) / 2)
    sample_x = member["anchorX"]
    yy, xx = np.where(mask)
    distances = (xx - sample_x) ** 2 + (yy - sample_y) ** 2
    nearest = int(np.argmin(distances))
    primary_label = int(labels[yy[nearest], xx[nearest]])
    if primary_label == 0:
        raise ValueError(f"{member['id']} has no primary connected component")

    primary_mask = labels == primary_label
    primary_y, primary_x = np.where(primary_mask)
    primary_bounds = (
        int(primary_x.min()),
        int(primary_y.min()),
        int(primary_x.max()) + 1,
        int(primary_y.max()) + 1,
    )
    keep_labels = {primary_label}
    component_areas = np.bincount(labels.ravel())
    for label_id in range(1, component_count + 1):
        if label_id == primary_label or component_areas[label_id] < 4:
            continue
        component_y, component_x = np.where(labels == label_id)
        centroid_x = float(component_x.mean())
        centroid_y = float(component_y.mean())
        if (
            primary_bounds[0] <= centroid_x < primary_bounds[2]
            and primary_bounds[1] <= centroid_y < primary_bounds[3]
        ):
            keep_labels.add(label_id)

    isolated_mask = np.isin(labels, list(keep_labels))
    isolated_y, isolated_x = np.where(isolated_mask)
    bounds = (
        max(0, int(isolated_x.min()) - 6),
        max(0, int(isolated_y.min()) - 6),
        min(sheet.width, int(isolated_x.max()) + 7),
        min(sheet.height, int(isolated_y.max()) + 7),
    )
    data = np.asarray(sheet, dtype=np.uint8).copy()
    data[~isolated_mask] = 0
    isolated = Image.fromarray(data)
    selected_pixels = int(isolated_mask.sum())
    selected_component_pixels = int(sum(component_areas[label_id] for label_id in keep_labels))
    return isolated, bounds, {
        "sourceConnectedComponents": component_count,
        "primaryComponent": primary_label,
        "retainedComponents": sorted(keep_labels),
        "selectedPixels": selected_pixels,
        "selectedComponentPixels": selected_component_pixels,
        "componentPreservedBeforeCrop": selected_pixels == selected_component_pixels,
        "primaryBounds": list(primary_bounds),
    }


def package_member(sheet: Image.Image, member: dict) -> dict:
    working, bounds, component_receipt = isolate_member_component(sheet, member)
    crop = working.crop(bounds)
    body_source_height = member["footY"] - member["bodyTopY"]
    target_body_height = round(member["feet"] * TARGET_PPF)
    scale = target_body_height / body_source_height
    resized = crop.resize(
        (
            max(1, round(crop.width * scale)),
            max(1, round(crop.height * scale)),
        ),
        Image.Resampling.NEAREST,
    )
    resized = palette_bound(resized)

    source_anchor_x = member["anchorX"] - bounds[0]
    source_anchor_y = member["footY"] - bounds[1]
    scaled_anchor_x = round(source_anchor_x * scale)
    scaled_anchor_y = round(source_anchor_y * scale)
    pad = 8
    left_extent = scaled_anchor_x
    right_extent = resized.width - scaled_anchor_x
    top_extent = scaled_anchor_y
    bottom_extent = resized.height - scaled_anchor_y
    canvas_width = ceil_to(2 * max(left_extent, right_extent) + pad * 2, 32)
    canvas_height = ceil_to(top_extent + bottom_extent + pad * 2, 32)
    target_anchor_x = canvas_width // 2
    target_anchor_y = canvas_height - pad - bottom_extent
    paste_x = target_anchor_x - scaled_anchor_x
    paste_y = target_anchor_y - scaled_anchor_y
    canvas = Image.new("RGBA", (canvas_width, canvas_height), (0, 0, 0, 0))
    canvas.alpha_composite(resized, (paste_x, paste_y))

    output = PACK / f"{member['id']}-32ppf.png"
    canvas.save(output)
    output_data = np.asarray(canvas, dtype=np.uint8)
    output_alpha = output_data[:, :, 3]
    output_bounds = canvas.getchannel("A").getbbox()
    if output_bounds:
        content_padding = {
            "left": output_bounds[0],
            "top": output_bounds[1],
            "right": canvas.width - output_bounds[2],
            "bottom": canvas.height - output_bounds[3],
        }
    else:
        content_padding = {"left": 0, "top": 0, "right": 0, "bottom": 0}
    minimum_padding = min(content_padding.values())
    visible = output_alpha > 0
    magenta = (
        visible
        & (output_data[:, :, 0] > 120)
        & (output_data[:, :, 0] > output_data[:, :, 1] * 1.35)
        & (output_data[:, :, 2] > output_data[:, :, 1] * 1.35)
    )
    return {
        "id": member["id"],
        "label": member["label"],
        "role": member["role"],
        "asset": str(output.relative_to(ROOT)),
        "worldHeightFeet": member["feet"],
        "pixelsPerFoot": TARGET_PPF,
        "bodySubjectHeightPixels": target_body_height,
        "bodyAxis": "authored-head-to-feet-excluding-equipment",
        "sourceBodyHeightPixels": body_source_height,
        "sourceCrop": list(bounds),
        "componentIsolation": component_receipt,
        "sourceScale": round(scale, 6),
        "canvasSize": list(canvas.size),
        "contentBoundsPixels": list(output_bounds) if output_bounds else None,
        "contentPaddingPixels": content_padding,
        "minimumTransparentPaddingPixels": minimum_padding,
        "unintendedCanvasEdgeContact": minimum_padding == 0,
        "declaredEquipmentPreserved": (
            component_receipt["componentPreservedBeforeCrop"] and minimum_padding >= 6
        ),
        "footX": round(target_anchor_x / canvas_width, 6),
        "footY": round(target_anchor_y / canvas_height, 6),
        "alphaCutoff": 0.5,
        "partialAlphaPixels": int(((output_alpha > 0) & (output_alpha < 255)).sum()),
        "visibleMagentaFamilyPixels": int(magenta.sum()),
        "paletteMaximumColors": 64,
        "sampling": "nearest-mag-no-mipmap-source-contract",
        "standeeExtrusion": True,
        "status": "GOLDEN_SITE_DENSITY_PROOF_CANDIDATE",
    }


def contact_sheet(rows: list[dict]) -> Path:
    ARTIFACT.mkdir(parents=True, exist_ok=True)
    card_w, card_h = 310, 420
    sheet = Image.new("RGB", (1320, 960), "#151512")
    draw = ImageDraw.Draw(sheet)
    draw.text((32, 24), "Golden Site 1 · 32 px/ft Party + Guard Proof", fill="#f0e6d3", font=font(30))
    draw.text(
        (32, 67),
        "subject density uses head-to-feet; equipment expands the canvas",
        fill="#c99d4d",
        font=font(16),
    )
    for index, row in enumerate(rows):
        col = index % 4
        grid_row = index // 4
        left = 28 + col * 322
        top = 110 + grid_row * card_h
        draw.rectangle((left, top, left + card_w, top + card_h - 12), fill="#22231f", outline="#5d5548")
        asset = Image.open(ROOT / row["asset"]).convert("RGBA")
        scale = min(260 / asset.width, 300 / asset.height)
        preview = asset.resize(
            (round(asset.width * scale), round(asset.height * scale)),
            Image.Resampling.NEAREST,
        )
        checker = Image.new("RGB", (270, 310), "#353831")
        check_draw = ImageDraw.Draw(checker)
        for y in range(0, checker.height, 12):
            for x in range(0, checker.width, 12):
                if (x // 12 + y // 12) % 2:
                    check_draw.rectangle((x, y, x + 11, y + 11), fill="#272923")
        checker = checker.convert("RGBA")
        checker.alpha_composite(
            preview,
            ((checker.width - preview.width) // 2, checker.height - preview.height - 4),
        )
        sheet.paste(checker.convert("RGB"), (left + 20, top + 42))
        draw.text((left + 16, top + 12), row["label"], fill="#eee4d4", font=font(17))
        draw.text(
            (left + 16, top + 362),
            f"{row['worldHeightFeet']:g} ft · {row['bodySubjectHeightPixels']} subject px",
            fill="#c99d4d",
            font=font(13),
        )
        draw.text(
            (left + 16, top + 386),
            f"32 px/ft · {row['canvasSize'][0]}×{row['canvasSize'][1]} canvas",
            fill="#aaa08e",
            font=font(12),
        )
    output = ARTIFACT / "party-guard-32ppf-contact-sheet.png"
    sheet.save(output)
    return output


def main() -> None:
    PACK.mkdir(parents=True, exist_ok=True)
    rows = []
    for sheet_id, definition in SHEETS.items():
        source = Image.open(SOURCE / definition["file"]).convert("RGBA")
        for member in definition["members"]:
            row = package_member(source, member)
            row["sheetId"] = sheet_id
            rows.append(row)
    sheet = contact_sheet(rows)
    receipt = {
        "schema": "GuardPostWorldPixelDensityPartyProofV1",
        "status": "GOLDEN_SITE_DENSITY_PROOF_CANDIDATE",
        "targetPixelsPerFoot": TARGET_PPF,
        "physicalLaw": (
            "head-to-feet subject axis owns density; equipment expands canvas without shrinking actor"
        ),
        "promptProvenance": "assets/sprites-golden/guard-post-v001/PROMPTS.md",
        "mechanicalEffect": "none",
        "members": rows,
        "contactSheet": str(sheet.relative_to(ROOT)),
        "hardChecks": {
            "eightMembers": len(rows) == 8,
            "allExact32PixelsPerFoot": all(
                row["bodySubjectHeightPixels"]
                == round(row["worldHeightFeet"] * TARGET_PPF)
                for row in rows
            ),
            "allBinaryAlpha": all(row["partialAlphaPixels"] == 0 for row in rows),
            "allVisibleMagentaFree": all(
                row["visibleMagentaFamilyPixels"] == 0 for row in rows
            ),
            "allExtrusionReady": all(row["standeeExtrusion"] for row in rows),
            "allSilhouettesIsolated": all(
                row["componentIsolation"]["componentPreservedBeforeCrop"] for row in rows
            ),
            "allCanvasEdgesPadded": all(
                not row["unintendedCanvasEdgeContact"]
                and row["minimumTransparentPaddingPixels"] >= 6
                for row in rows
            ),
            "allDeclaredEquipmentPreserved": all(
                row["declaredEquipmentPreserved"] for row in rows
            ),
        },
    }
    if not all(receipt["hardChecks"].values()):
        failed = [key for key, passed in receipt["hardChecks"].items() if not passed]
        raise RuntimeError(f"party/guard sprite hard checks failed: {', '.join(failed)}")
    (PACK / "manifest.json").write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt["hardChecks"], indent=2))
    print(sheet)


if __name__ == "__main__":
    main()
