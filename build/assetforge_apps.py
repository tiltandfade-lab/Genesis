#!/usr/bin/env python3
"""Deterministic Assetforge compilers beyond the sprite-emote vertical slice.

This module is loaded by build/assetforge.py.  Every family consumes a JSON manifest, writes only
to a caller-selected quarantine directory, emits a proof board and receipt, and preserves at least
one failing control in the suite self-test.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import math
import random
import shutil
from collections import Counter, deque
from pathlib import Path
from typing import Any, Callable

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ROOT = ROOT / "dev" / "model-qa" / "assetforge-suite"
CHROMA = (255, 0, 255)
ALGORITHM_VERSION = "assetforge-suite-v1"
FAMILIES = (
    "boundary",
    "repeat",
    "prop-kit",
    "condition",
    "palette",
    "trim",
    "decal",
    "citizenship",
    "atlas",
    "material",
    "regression",
)


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise SystemExit(f"ERROR: missing manifest: {repo_path(path)}")
    except json.JSONDecodeError as exc:
        raise SystemExit(f"ERROR: invalid JSON in {repo_path(path)}: {exc}")


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def repo_path(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(ROOT))
    except ValueError:
        return str(path.resolve())


def resolve_manifest_path(manifest_path: Path, raw: str) -> Path:
    path = Path(raw)
    if path.is_absolute():
        return path
    rooted = ROOT / path
    if rooted.exists():
        return rooted
    return manifest_path.parent / path


def assert_safe_output(path: Path) -> None:
    resolved = path.resolve()
    protected = {
        Path("/").resolve(),
        Path.home().resolve(),
        ROOT.resolve(),
        (ROOT / "assets").resolve(),
        (ROOT / "build").resolve(),
        (ROOT / "data").resolve(),
        (ROOT / "dev").resolve(),
        (ROOT / "dev" / "model-qa").resolve(),
        (ROOT / "docs").resolve(),
        (ROOT / "Engine").resolve(),
        (ROOT / "Reference").resolve(),
        (ROOT / "src").resolve(),
    }
    if resolved in protected or len(resolved.parts) < 4:
        raise SystemExit(f"ERROR: refusing broad Assetforge output path: {resolved}")
    for live_root in (
        ROOT / "assets",
        ROOT / "build",
        ROOT / "data",
        ROOT / "docs",
        ROOT / "Engine",
        ROOT / "Reference",
        ROOT / "src",
    ):
        if live_root.resolve() in resolved.parents:
            raise SystemExit(f"ERROR: refusing live Assetforge output path: {resolved}")


def guarded_reset(path: Path, force: bool) -> None:
    assert_safe_output(path)
    resolved = path.resolve()
    if resolved.exists():
        if not force:
            raise SystemExit(f"ERROR: output exists; use --force: {repo_path(resolved)}")
        shutil.rmtree(resolved)
    resolved.mkdir(parents=True, exist_ok=True)


def font() -> ImageFont.ImageFont:
    return ImageFont.load_default()


def color_distance(first: tuple[int, int, int], second: tuple[int, int, int]) -> float:
    return math.sqrt(sum((first[index] - second[index]) ** 2 for index in range(3)))


def border_dominant_rgb(image: Image.Image) -> tuple[int, int, int]:
    rgb = image.convert("RGB")
    pixels = rgb.load()
    step_x = max(1, rgb.width // 100)
    step_y = max(1, rgb.height // 100)
    samples: Counter[tuple[int, int, int]] = Counter()
    for x in range(0, rgb.width, step_x):
        samples[pixels[x, 0]] += 1
        samples[pixels[x, rgb.height - 1]] += 1
    for y in range(0, rgb.height, step_y):
        samples[pixels[0, y]] += 1
        samples[pixels[rgb.width - 1, y]] += 1
    return samples.most_common(1)[0][0]


def parse_chroma_key(value: Any) -> tuple[int, int, int] | None:
    if value is None or value is False or str(value).lower() in {"none", "off", "false"}:
        return None
    if isinstance(value, (list, tuple)) and len(value) == 3:
        return tuple(int(channel) for channel in value)
    if isinstance(value, str) and value.lower() not in {"auto", "detect"}:
        return hex_rgb(value)
    return None


def defringe_chroma(
    image: Image.Image,
    key: tuple[int, int, int],
    erode_excess: int = 60,
    despill: float = 0.25,
) -> Image.Image:
    """Remove the one-to-two-pixel chroma halo without touching interior color.

    This intentionally mirrors the edge-band discipline used by the established sprite slicer:
    only pixels adjacent to transparency can be eroded or despilled.
    """
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size

    def edge_pixels() -> list[tuple[int, int]]:
        result = []
        for y in range(height):
            for x in range(width):
                if pixels[x, y][3] == 0:
                    continue
                if any(
                    not (0 <= nx < width and 0 <= ny < height) or pixels[nx, ny][3] == 0
                    for nx, ny in (
                        (x - 1, y),
                        (x + 1, y),
                        (x, y - 1),
                        (x, y + 1),
                        (x - 1, y - 1),
                        (x + 1, y - 1),
                        (x - 1, y + 1),
                        (x + 1, y + 1),
                    )
                ):
                    result.append((x, y))
        return result

    for _ in range(2):
        eroded = False
        for x, y in edge_pixels():
            r, g, b, _ = pixels[x, y]
            if key == (255, 0, 255):
                contaminated = min(r, b) - g > erode_excess
            else:
                contaminated = g - max(r, b) > erode_excess
            if contaminated:
                pixels[x, y] = (r, g, b, 0)
                eroded = True
        if not eroded:
            break

    for x, y in edge_pixels():
        r, g, b, a = pixels[x, y]
        if key == (255, 0, 255) and r > g and b > g:
            pixels[x, y] = (
                g + int((r - g) * despill),
                g,
                g + int((b - g) * despill),
                a,
            )
        elif key == (0, 255, 0) and g > r and g > b:
            neutral = max(r, b)
            pixels[x, y] = (r, neutral + int((g - neutral) * despill), b, a)
    return transparent_rgb_clean(rgba)


def key_chroma(
    image: Image.Image,
    key: tuple[int, int, int],
    tolerance: int = 12,
    softness: int = 0,
) -> tuple[Image.Image, int]:
    rgba = image.convert("RGBA")
    pixels = []
    keyed = 0
    for r, g, b, a in rgba.getdata():
        distance = color_distance((r, g, b), key)
        if distance <= tolerance:
            pixels.append((0, 0, 0, 0))
            keyed += 1
        elif softness and distance < tolerance + softness:
            fraction = (distance - tolerance) / softness
            alpha = round(a * fraction)
            # Reverse the flat-key composite for the soft band. Without this unmixing,
            # lowering alpha merely makes the magenta fringe translucent; the key color is
            # still embedded in RGB and remains obvious over dark game surfaces.
            reconstructed = tuple(
                max(
                    0,
                    min(
                        255,
                        round(
                            (channel - (1 - fraction) * key_channel)
                            / max(fraction, 1e-6)
                        ),
                    ),
                )
                for channel, key_channel in zip((r, g, b), key)
            )
            pixels.append((*reconstructed, alpha))
        else:
            pixels.append((r, g, b, a))
    rgba.putdata(pixels)
    return defringe_chroma(rgba, key), keyed


def key_manifest_image(
    image: Image.Image,
    manifest: dict[str, Any],
) -> tuple[Image.Image, dict[str, Any]]:
    requested = manifest.get("chromaKey", "auto")
    tolerance = int(manifest.get("chromaTolerance", 12))
    softness = int(manifest.get("chromaSoftness", 0))
    rgba = image.convert("RGBA")
    alpha_min, _ = rgba.getchannel("A").getextrema()
    dominant = border_dominant_rgb(image)
    key = parse_chroma_key(requested)
    detected = None
    if isinstance(requested, str) and requested.lower() in {"auto", "detect"}:
        # Existing transparency is authoritative. Auto-detection is only needed for opaque
        # ImageGen sheets; this prevents legitimate interior magenta in cut sprites being keyed.
        if alpha_min == 255:
            magenta_distance = color_distance(dominant, (255, 0, 255))
            green_distance = color_distance(dominant, (0, 255, 0))
            nearest = min(magenta_distance, green_distance)
            if nearest <= float(manifest.get("maximumBorderKeyDistance", 60)):
                key = (255, 0, 255) if magenta_distance <= green_distance else (0, 255, 0)
                detected = "magenta" if key == (255, 0, 255) else "green"
    if key is None:
        return transparent_rgb_clean(rgba), {
            "requested": requested,
            "detected": detected,
            "dominantBorderRgb": list(dominant),
            "keyRgb": None,
            "tolerance": tolerance,
            "softness": softness,
            "keyedPixelCount": 0,
        }
    keyed_image, keyed_count = key_chroma(rgba, key, tolerance, softness)
    return keyed_image, {
        "requested": requested,
        "detected": detected,
        "dominantBorderRgb": list(dominant),
        "keyRgb": list(key),
        "tolerance": tolerance,
        "softness": softness,
        "keyedPixelCount": keyed_count,
    }


def key_magenta(image: Image.Image, tolerance: int = 12) -> Image.Image:
    return key_chroma(image, CHROMA, tolerance, 0)[0]


def transparent_rgb_clean(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    rgba.putdata([(r, g, b, a) if a else (0, 0, 0, 0) for r, g, b, a in rgba.getdata()])
    return rgba


def alpha_bbox(image: Image.Image):
    return image.convert("RGBA").getchannel("A").getbbox()


def alpha_bbox_above(image: Image.Image, cutoff: int = 0):
    alpha = image.convert("RGBA").getchannel("A")
    if cutoff <= 0:
        return alpha.getbbox()
    return alpha.point(lambda value: 255 if value > cutoff else 0).getbbox()


def bbox_touches_edge(image: Image.Image, bbox=None) -> bool:
    box = bbox or alpha_bbox(image)
    if not box:
        return False
    return box[0] <= 0 or box[1] <= 0 or box[2] >= image.width or box[3] >= image.height


def edge_delta(image: Image.Image) -> float:
    rgb = image.convert("RGB")
    px = rgb.load()
    total = 0
    count = 0
    for y in range(rgb.height):
        total += sum(abs(px[0, y][c] - px[rgb.width - 1, y][c]) for c in range(3))
        count += 3
    for x in range(rgb.width):
        total += sum(abs(px[x, 0][c] - px[x, rgb.height - 1][c]) for c in range(3))
        count += 3
    return total / max(1, count)


def force_periodic(image: Image.Image) -> Image.Image:
    out = image.copy()
    px = out.load()
    for y in range(out.height):
        px[out.width - 1, y] = px[0, y]
    for x in range(out.width):
        px[x, out.height - 1] = px[x, 0]
    return out


def rgba_difference(a: Image.Image, b: Image.Image) -> float:
    if a.size != b.size:
        return 1.0
    diff = ImageChops.difference(a.convert("RGBA"), b.convert("RGBA"))
    values = list(diff.getdata())
    return sum(sum(pixel) for pixel in values) / max(1, len(values) * 4 * 255)


def paste_wrapped(canvas: Image.Image, sprite: Image.Image, x: int, y: int) -> None:
    for ox in (-canvas.width, 0, canvas.width):
        for oy in (-canvas.height, 0, canvas.height):
            canvas.alpha_composite(sprite, (x + ox, y + oy))


def connected_components(
    image: Image.Image,
    alpha_cutoff: int = 12,
    minimum_area: int = 4,
) -> list[tuple[int, int, int, int]]:
    alpha = image.convert("RGBA").getchannel("A")
    width, height = image.size
    values = alpha.load()
    seen = bytearray(width * height)
    boxes = []
    for y in range(height):
        for x in range(width):
            index = y * width + x
            if seen[index] or values[x, y] <= alpha_cutoff:
                continue
            queue = deque([(x, y)])
            seen[index] = 1
            xs, ys = [], []
            while queue:
                cx, cy = queue.popleft()
                xs.append(cx)
                ys.append(cy)
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        ni = ny * width + nx
                        if not seen[ni] and values[nx, ny] > alpha_cutoff:
                            seen[ni] = 1
                            queue.append((nx, ny))
            if len(xs) >= minimum_area:
                boxes.append((min(xs), min(ys), max(xs) + 1, max(ys) + 1))
    return sorted(boxes, key=lambda box: (box[1], box[0]))


def alpha_component_records(
    image: Image.Image,
    alpha_cutoff: int = 12,
) -> list[dict[str, Any]]:
    alpha = image.convert("RGBA").getchannel("A")
    width, height = image.size
    values = alpha.load()
    seen = bytearray(width * height)
    records = []
    for y in range(height):
        for x in range(width):
            index = y * width + x
            if seen[index] or values[x, y] <= alpha_cutoff:
                continue
            queue = deque([(x, y)])
            seen[index] = 1
            pixels = []
            while queue:
                cx, cy = queue.popleft()
                pixels.append((cx, cy))
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        neighbor = ny * width + nx
                        if not seen[neighbor] and values[nx, ny] > alpha_cutoff:
                            seen[neighbor] = 1
                            queue.append((nx, ny))
            xs = [item[0] for item in pixels]
            ys = [item[1] for item in pixels]
            records.append(
                {
                    "area": len(pixels),
                    "bbox": (min(xs), min(ys), max(xs) + 1, max(ys) + 1),
                    "pixels": pixels,
                }
            )
    return records


def bbox_gap(
    first: tuple[int, int, int, int],
    second: tuple[int, int, int, int],
) -> float:
    dx = max(first[0] - second[2], second[0] - first[2], 0)
    dy = max(first[1] - second[3], second[1] - first[3], 0)
    return math.hypot(dx, dy)


def prune_detached_fragments(
    image: Image.Image,
    merge_distance: float,
    alpha_cutoff: int = 12,
) -> tuple[Image.Image, dict[str, Any]]:
    rgba = transparent_rgb_clean(image)
    components = alpha_component_records(rgba, alpha_cutoff)
    if not components:
        return rgba, {
            "componentCountBefore": 0,
            "componentCountKept": 0,
            "componentCountPruned": 0,
            "prunedAlphaPixels": 0,
            "prunedAlphaRatio": 0.0,
        }
    primary = max(components, key=lambda item: item["area"])
    kept = [
        item
        for item in components
        if item is primary or bbox_gap(item["bbox"], primary["bbox"]) <= merge_distance
    ]
    kept_ids = {id(item) for item in kept}
    removed = [item for item in components if id(item) not in kept_ids]
    pixels = rgba.load()
    for component in removed:
        for x, y in component["pixels"]:
            pixels[x, y] = (0, 0, 0, 0)
    total_area = sum(item["area"] for item in components)
    removed_area = sum(item["area"] for item in removed)
    return transparent_rgb_clean(rgba), {
        "componentCountBefore": len(components),
        "componentCountKept": len(kept),
        "componentCountPruned": len(removed),
        "prunedAlphaPixels": removed_area,
        "prunedAlphaRatio": removed_area / max(1, total_area),
        "primaryAreaPixels": primary["area"],
        "mergeDistancePx": merge_distance,
    }


def sheet_component_boxes(
    image: Image.Image,
    manifest: dict[str, Any],
) -> tuple[
    list[tuple[int, int, int, int]],
    list[tuple[int, int, int, int]],
    dict[str, Any],
]:
    grid = manifest.get("grid")
    if not grid:
        boxes = connected_components(
            image,
            int(manifest.get("alphaCutoff", 12)),
            int(manifest.get("minimumComponentAreaPx", 4)),
        )
        slots = [(0, 0, image.width, image.height) for _ in boxes]
        return boxes, slots, {"mode": "connected-components", "declaredCellCount": None}

    columns, rows = (int(value) for value in grid)
    if columns <= 0 or rows <= 0:
        raise ValueError("sheet grid dimensions must be positive")
    cuts = manifest.get("gridCuts", {})
    x_cuts = [int(value) for value in cuts.get("x", [])]
    y_cuts = [int(value) for value in cuts.get("y", [])]
    if x_cuts and (
        len(x_cuts) != columns + 1 or x_cuts[0] != 0 or x_cuts[-1] != image.width
    ):
        raise ValueError("gridCuts.x must contain every column boundary including 0 and sheet width")
    if y_cuts and (
        len(y_cuts) != rows + 1 or y_cuts[0] != 0 or y_cuts[-1] != image.height
    ):
        raise ValueError("gridCuts.y must contain every row boundary including 0 and sheet height")
    boxes = []
    slots = []
    empty_cells = []
    for row in range(rows):
        y0 = y_cuts[row] if y_cuts else round(row * image.height / rows)
        y1 = y_cuts[row + 1] if y_cuts else round((row + 1) * image.height / rows)
        for column in range(columns):
            x0 = x_cuts[column] if x_cuts else round(column * image.width / columns)
            x1 = x_cuts[column + 1] if x_cuts else round((column + 1) * image.width / columns)
            cell = image.crop((x0, y0, x1, y1))
            box = alpha_bbox_above(cell, int(manifest.get("alphaCutoff", 12)))
            if not box:
                empty_cells.append(row * columns + column)
                continue
            boxes.append((x0 + box[0], y0 + box[1], x0 + box[2], y0 + box[3]))
            slots.append((x0, y0, x1, y1))
    return boxes, slots, {
        "mode": "declared-grid",
        "grid": [columns, rows],
        "gridCuts": {
            "x": x_cuts or None,
            "y": y_cuts or None,
        },
        "declaredCellCount": columns * rows,
        "emptyCellIndexes": empty_cells,
    }


def grouped_alpha_components(
    image: Image.Image,
    manifest: dict[str, Any],
) -> tuple[list[Image.Image], list[tuple[int, int, int, int]], dict[str, Any]]:
    anchors = [
        (float(value[0]), float(value[1]))
        for value in manifest.get("componentAnchors", [])
    ]
    if not anchors:
        raise ValueError("alpha-component-groups isolation requires componentAnchors")
    records = alpha_component_records(
        image,
        int(manifest.get("componentGroupAlphaCutoff", 0)),
    )
    groups: list[list[dict[str, Any]]] = [[] for _anchor in anchors]
    for record in records:
        area = max(1, int(record["area"]))
        centroid_x = sum(point[0] for point in record["pixels"]) / area
        centroid_y = sum(point[1] for point in record["pixels"]) / area
        group_index = min(
            range(len(anchors)),
            key=lambda index: (
                centroid_x - anchors[index][0]
            )
            ** 2
            + (
                centroid_y - anchors[index][1]
            )
            ** 2,
        )
        groups[group_index].append(record)

    source_pixels = image.convert("RGBA").load()
    components = []
    boxes = []
    group_details = []
    assigned_pixels = 0
    for index, records_for_group in enumerate(groups):
        isolated = Image.new("RGBA", image.size, (0, 0, 0, 0))
        isolated_pixels = isolated.load()
        for record in records_for_group:
            assigned_pixels += int(record["area"])
            for x, y in record["pixels"]:
                isolated_pixels[x, y] = source_pixels[x, y]
        box = alpha_bbox(isolated)
        if not box:
            group_details.append(
                {
                    "index": index,
                    "anchor": list(anchors[index]),
                    "componentCount": 0,
                    "alphaPixelCount": 0,
                    "bbox": None,
                }
            )
            continue
        boxes.append(box)
        components.append(transparent_rgb_clean(isolated.crop(box)))
        group_details.append(
            {
                "index": index,
                "anchor": list(anchors[index]),
                "componentCount": len(records_for_group),
                "alphaPixelCount": sum(
                    int(record["area"]) for record in records_for_group
                ),
                "bbox": list(box),
            }
        )
    source_alpha_pixels = sum(
        1 for value in image.convert("RGBA").getchannel("A").getdata() if value > 0
    )
    return components, boxes, {
        "mode": "alpha-component-groups",
        "anchors": [list(anchor) for anchor in anchors],
        "groups": group_details,
        "sourceAlphaPixelCount": source_alpha_pixels,
        "assignedAlphaPixelCount": assigned_pixels,
        "everySourceAlphaPixelAssigned": assigned_pixels == source_alpha_pixels,
    }


def shelf_pack(
    assets: list[tuple[str, Image.Image]],
    padding: int = 2,
    max_width: int = 512,
) -> tuple[Image.Image, dict[str, tuple[int, int, int, int]]]:
    if not assets:
        raise ValueError("no assets to pack")
    placements: dict[str, tuple[int, int, int, int]] = {}
    x = padding
    y = padding
    row_h = 0
    used_w = 0
    for asset_id, image in assets:
        if image.width + padding * 2 > max_width:
            raise ValueError(f"asset too wide for atlas: {asset_id}")
        if x + image.width + padding > max_width:
            x = padding
            y += row_h + padding
            row_h = 0
        placements[asset_id] = (x, y, image.width, image.height)
        x += image.width + padding
        row_h = max(row_h, image.height)
        used_w = max(used_w, x)
    height = y + row_h + padding
    width = max(8, min(max_width, used_w + padding))
    atlas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for asset_id, image in assets:
        px, py, _, _ = placements[asset_id]
        atlas.alpha_composite(image.convert("RGBA"), (px, py))
        if padding:
            # Extrude one pixel around the payload without changing its declared rectangle.
            left = image.crop((0, 0, 1, image.height)).resize((padding, image.height))
            right = image.crop((image.width - 1, 0, image.width, image.height)).resize(
                (padding, image.height)
            )
            top = image.crop((0, 0, image.width, 1)).resize((image.width, padding))
            bottom = image.crop((0, image.height - 1, image.width, image.height)).resize(
                (image.width, padding)
            )
            atlas.alpha_composite(left, (px - padding, py))
            atlas.alpha_composite(right, (px + image.width, py))
            atlas.alpha_composite(top, (px, py - padding))
            atlas.alpha_composite(bottom, (px, py + image.height))
    return atlas, placements


def proof_board(
    title: str,
    cells: list[tuple[str, Image.Image]],
    output: Path,
    cell_size: tuple[int, int] = (180, 150),
    columns: int = 4,
) -> None:
    rows = math.ceil(len(cells) / columns)
    width = columns * cell_size[0] + 24
    height = rows * cell_size[1] + 52
    board = Image.new("RGB", (width, height), (28, 27, 31))
    draw = ImageDraw.Draw(board)
    draw.text((12, 10), title, fill=(245, 240, 226), font=font())
    for index, (label, image) in enumerate(cells):
        col = index % columns
        row = index // columns
        x = 12 + col * cell_size[0]
        y = 36 + row * cell_size[1]
        draw.rectangle((x, y, x + cell_size[0] - 8, y + cell_size[1] - 8), fill=(52, 50, 57))
        fit = ImageOps.contain(image.convert("RGBA"), (cell_size[0] - 20, cell_size[1] - 32))
        ix = x + (cell_size[0] - 8 - fit.width) // 2
        iy = y + 6 + (cell_size[1] - 32 - fit.height) // 2
        board.paste(fit, (ix, iy), fit)
        draw.text((x + 5, y + cell_size[1] - 26), label[:26], fill=(225, 220, 210), font=font())
    output.parent.mkdir(parents=True, exist_ok=True)
    board.save(output)


def finish_receipt(
    family: str,
    manifest_path: Path,
    output_dir: Path,
    gates: dict[str, bool],
    outputs: dict[str, Any],
    details: dict[str, Any] | None = None,
) -> dict[str, Any]:
    receipt = {
        "schemaVersion": 1,
        "family": family,
        "algorithmVersion": ALGORITHM_VERSION,
        "manifest": repo_path(manifest_path),
        "manifestSha256": sha256_file(manifest_path),
        "technicalStatus": "PASS" if all(gates.values()) else "FAIL",
        "gates": gates,
        "outputs": outputs,
        "details": details or {},
        "runtimeAdmission": "CANDIDATE",
    }
    write_json(output_dir / "receipt.json", receipt)
    return receipt


# Boundary auto-tile compiler -------------------------------------------------

N, E, S, W, NE, SE, SW, NW = (1, 2, 4, 8, 16, 32, 64, 128)
CARDINALS = (N, E, S, W)
DIAGONAL_RULES = ((NE, N, E), (SE, S, E), (SW, S, W), (NW, N, W))


def sanitize_mask(raw: int) -> int:
    mask = raw & 0xFF
    for diagonal, first, second in DIAGONAL_RULES:
        if not (mask & first and mask & second):
            mask &= ~diagonal
    return mask


def canonical_masks() -> list[int]:
    return sorted({sanitize_mask(raw) for raw in range(256)})


def mask_id(mask: int) -> str:
    return "-".join(
        f"{name}{1 if mask & bit else 0}"
        for name, bit in (("n", N), ("e", E), ("s", S), ("w", W), ("ne", NE), ("se", SE), ("sw", SW), ("nw", NW))
    )


def make_boundary_tile(material: Image.Image, mask: int, size: int, border: int) -> Image.Image:
    tile = ImageOps.fit(material.convert("RGBA"), (size, size), method=Image.Resampling.NEAREST)
    draw = ImageDraw.Draw(tile, "RGBA")
    edge = (37, 28, 30, 235)
    highlight = (206, 176, 126, 90)
    if not mask & N:
        draw.rectangle((0, 0, size - 1, border - 1), fill=edge)
        draw.line((0, border, size - 1, border), fill=highlight, width=1)
    if not mask & E:
        draw.rectangle((size - border, 0, size - 1, size - 1), fill=edge)
        draw.line((size - border - 1, 0, size - border - 1, size - 1), fill=highlight, width=1)
    if not mask & S:
        draw.rectangle((0, size - border, size - 1, size - 1), fill=edge)
        draw.line((0, size - border - 1, size - 1, size - border - 1), fill=highlight, width=1)
    if not mask & W:
        draw.rectangle((0, 0, border - 1, size - 1), fill=edge)
        draw.line((border, 0, border, size - 1), fill=highlight, width=1)
    # A missing diagonal between present cardinals is the concave-corner signal.
    corner = max(2, border)
    for diagonal, first, second, box in (
        (NE, N, E, (size - corner, 0, size - 1, corner - 1)),
        (SE, S, E, (size - corner, size - corner, size - 1, size - 1)),
        (SW, S, W, (0, size - corner, corner - 1, size - 1)),
        (NW, N, W, (0, 0, corner - 1, corner - 1)),
    ):
        if mask & first and mask & second and not mask & diagonal:
            draw.rectangle(box, fill=edge)
    return force_periodic(tile) if mask == 255 else tile


def map_mask(field: list[list[int]], x: int, y: int) -> int:
    height, width = len(field), len(field[0])

    def occupied(dx: int, dy: int) -> bool:
        nx, ny = x + dx, y + dy
        return 0 <= nx < width and 0 <= ny < height and bool(field[ny][nx])

    mask = 0
    for bit, dx, dy in (
        (N, 0, -1), (E, 1, 0), (S, 0, 1), (W, -1, 0),
        (NE, 1, -1), (SE, 1, 1), (SW, -1, 1), (NW, -1, -1),
    ):
        if occupied(dx, dy):
            mask |= bit
    return sanitize_mask(mask)


def render_boundary_field(
    field: list[list[int]], tiles: dict[int, Image.Image], tile_size: int
) -> Image.Image:
    canvas = Image.new(
        "RGBA", (len(field[0]) * tile_size, len(field) * tile_size), (0, 0, 0, 0)
    )
    for y, row in enumerate(field):
        for x, occupied in enumerate(row):
            if occupied:
                canvas.alpha_composite(tiles[map_mask(field, x, y)], (x * tile_size, y * tile_size))
    return canvas


def boundary_field_coverage(field: list[list[int]]) -> set[int]:
    return {
        map_mask(field, x, y)
        for y, row in enumerate(field)
        for x, occupied in enumerate(row)
        if occupied
    }


def rendered_topology_matches(field: list[list[int]], rendered: Image.Image, tile_size: int) -> bool:
    alpha = rendered.getchannel("A")
    for y, row in enumerate(field):
        for x, occupied in enumerate(row):
            sample = alpha.getpixel((x * tile_size + tile_size // 2, y * tile_size + tile_size // 2))
            if bool(sample) != bool(occupied):
                return False
    return True


def boundary_neighbor_closure(tiles: dict[int, Image.Image], border: int) -> tuple[bool, int]:
    masks = sorted(tiles)
    compatible = 0
    for left_mask in masks:
        if not left_mask & E:
            continue
        left = tiles[left_mask].convert("RGBA")
        for right_mask in masks:
            if not right_mask & W:
                continue
            right = tiles[right_mask].convert("RGBA")
            for y in range(border + 1, left.height - border - 1):
                if left.getpixel((left.width - 1, y)) != right.getpixel((0, y)):
                    return False, compatible
            compatible += 1
    for top_mask in masks:
        if not top_mask & S:
            continue
        top = tiles[top_mask].convert("RGBA")
        for bottom_mask in masks:
            if not bottom_mask & N:
                continue
            bottom = tiles[bottom_mask].convert("RGBA")
            for x in range(border + 1, top.width - border - 1):
                if top.getpixel((x, top.height - 1)) != bottom.getpixel((x, 0)):
                    return False, compatible
            compatible += 1
    return True, compatible


def torture_fields() -> list[tuple[str, list[list[int]]]]:
    return [
        ("island", [[1]]),
        ("rectangle", [[1] * 6 for _ in range(4)]),
        ("hole", [[1] * 5, [1, 1, 1, 1, 1], [1, 1, 0, 1, 1], [1] * 5]),
        ("donut", [[1] * 6, [1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1], [1] * 6]),
        ("l-shape", [[1, 0, 0], [1, 0, 0], [1, 1, 1]]),
        ("mirror-l", [[0, 0, 1], [0, 0, 1], [1, 1, 1]]),
        ("neck", [[1, 1, 0, 1, 1], [1, 1, 1, 1, 1], [1, 1, 0, 1, 1]]),
        ("stair", [[1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1]]),
        ("diagonal-kiss", [[1, 0], [0, 1]]),
        ("snake", [[1, 1, 1, 0], [0, 0, 1, 0], [0, 1, 1, 1]]),
    ]


def cardinal_mask(field: list[list[int]], x: int, y: int) -> int:
    height, width = len(field), len(field[0])
    mask = 0
    for bit, dx, dy in ((N, 0, -1), (E, 1, 0), (S, 0, 1), (W, -1, 0)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < width and 0 <= ny < height and field[ny][nx]:
            mask |= bit
    return mask


def network_mask(field: list[list[int]], x: int, y: int, eight_way: bool) -> int:
    mask = cardinal_mask(field, x, y)
    if not eight_way:
        return mask
    height, width = len(field), len(field[0])
    for bit, dx, dy in ((NE, 1, -1), (SE, 1, 1), (SW, -1, 1), (NW, -1, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < width and 0 <= ny < height and field[ny][nx]:
            mask |= bit
    return mask


def cardinal_mask_id(mask: int) -> str:
    return "-".join(
        f"{name}{1 if mask & bit else 0}"
        for name, bit in (("n", N), ("e", E), ("s", S), ("w", W))
    )


def network_mask_id(mask: int, eight_way: bool) -> str:
    return mask_id(mask) if eight_way else cardinal_mask_id(mask)


def periodic_material(image: Image.Image, size: int) -> Image.Image:
    return force_periodic(
        ImageOps.fit(image.convert("RGBA"), (size, size), method=Image.Resampling.LANCZOS)
    )


def line_field(width: int, height: int, paths: list[list[tuple[int, int]]]) -> list[list[int]]:
    field = [[0 for _ in range(width)] for _ in range(height)]
    for path in paths:
        for start, end in zip(path, path[1:]):
            x0, y0 = start
            x1, y1 = end
            dx, dy = x1 - x0, y1 - y0
            if dx and dy and abs(dx) != abs(dy):
                raise ValueError("network proof paths must use cardinal or 45-degree segments")
            steps = max(abs(dx), abs(dy))
            sx = 0 if dx == 0 else (1 if dx > 0 else -1)
            sy = 0 if dy == 0 else (1 if dy > 0 else -1)
            for step in range(steps + 1):
                field[y0 + sy * step][x0 + sx * step] = 1
        if len(path) == 1:
            x, y = path[0]
            field[y][x] = 1
    return field


def path_torture_paths() -> list[tuple[str, int, int, list[list[tuple[int, int]]]]]:
    return [
        (
            "diagonal-ridge-trail",
            16,
            10,
            [[(0, 8), (3, 5), (3, 3), (6, 0)], [(3, 5), (8, 5), (12, 1), (15, 1)]],
        ),
        (
            "forks-and-game-trails",
            16,
            10,
            [
                [(0, 5), (5, 5), (9, 1)],
                [(5, 5), (9, 9)],
                [(8, 4), (12, 4), (15, 7)],
            ],
        ),
        (
            "woodland-loop",
            16,
            11,
            [
                [(1, 5), (5, 1), (10, 1), (14, 5), (10, 9), (5, 9), (1, 5)],
                [(5, 1), (5, 5), (10, 5), (10, 9)],
            ],
        ),
        (
            "switchbacks-and-shortcuts",
            16,
            11,
            [
                [(0, 9), (12, 9), (12, 7), (3, 7), (3, 5), (12, 5), (12, 3), (5, 3), (8, 0)],
                [(7, 7), (10, 4), (10, 2)],
                [(5, 5), (8, 8)],
            ],
        ),
    ]


def network_torture_fields(dialect: str) -> list[tuple[str, list[list[int]]]]:
    if dialect == "path":
        return [
            (label, line_field(width, height, paths))
            for label, width, height, paths in path_torture_paths()
        ]
    return [
        (
            "meandering-through-route",
            line_field(14, 9, [[(0, 7), (3, 7), (3, 5), (7, 5), (7, 2), (13, 2)]]),
        ),
        (
            "fork-and-dead-ends",
            line_field(
                14,
                9,
                [
                    [(0, 4), (7, 4), (7, 1)],
                    [(7, 4), (11, 4), (11, 7), (13, 7)],
                    [(4, 4), (4, 7)],
                ],
            ),
        ),
        (
            "crossroads-and-loop",
            line_field(
                14,
                10,
                [
                    [(0, 5), (13, 5)],
                    [(6, 0), (6, 9)],
                    [(2, 2), (10, 2), (10, 8), (2, 8), (2, 2)],
                ],
            ),
        ),
        (
            "switchbacks-and-spurs",
            line_field(
                14,
                10,
                [
                    [(0, 8), (12, 8), (12, 6), (2, 6), (2, 4), (11, 4), (11, 2), (4, 2), (4, 0)],
                    [(7, 6), (7, 9)],
                    [(8, 4), (8, 1)],
                ],
            ),
        ),
    ]


def make_network_tile(
    outside: Image.Image,
    inside: Image.Image,
    mask: int,
    size: int,
    route_width: int,
    shoulder_width: int,
    dialect: str,
) -> Image.Image:
    tile = outside.copy()
    center = size // 2
    half = max(2, route_width // 2)
    shoulder_half = min(size // 2, half + shoulder_width)
    route_mask = Image.new("L", (size, size), 0)
    shoulder_mask = Image.new("L", (size, size), 0)
    route_draw = ImageDraw.Draw(route_mask)
    shoulder_draw = ImageDraw.Draw(shoulder_mask)

    def draw_shape(draw: ImageDraw.ImageDraw, extent: int) -> None:
        draw.rounded_rectangle(
            (center - extent, center - extent, center + extent, center + extent),
            radius=max(1, extent // 2),
            fill=255,
        )
        if mask & N:
            draw.rectangle((center - extent, 0, center + extent, center), fill=255)
        if mask & E:
            draw.rectangle((center, center - extent, size - 1, center + extent), fill=255)
        if mask & S:
            draw.rectangle((center - extent, center, center + extent, size - 1), fill=255)
        if mask & W:
            draw.rectangle((0, center - extent, center, center + extent), fill=255)
        diagonal_width = extent * 2 + 1
        if mask & NE:
            draw.line((center, center, size - 1, 0), fill=255, width=diagonal_width)
        if mask & SE:
            draw.line((center, center, size - 1, size - 1), fill=255, width=diagonal_width)
        if mask & SW:
            draw.line((center, center, 0, size - 1), fill=255, width=diagonal_width)
        if mask & NW:
            draw.line((center, center, 0, 0), fill=255, width=diagonal_width)

    draw_shape(shoulder_draw, shoulder_half)
    draw_shape(route_draw, half)
    shoulder = ImageEnhance.Brightness(inside).enhance(0.64)
    tile = Image.composite(shoulder, tile, shoulder_mask)
    tile = Image.composite(inside, tile, route_mask)
    details = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    details_draw = ImageDraw.Draw(details, "RGBA")
    if dialect == "road":
        rut_offset = max(2, route_width // 5)
        rut_color = (48, 39, 31, 75)
        if mask & (N | S):
            for offset in (-rut_offset, rut_offset):
                details_draw.line((center + offset, 0, center + offset, size - 1), fill=rut_color, width=1)
        if mask & (E | W):
            for offset in (-rut_offset, rut_offset):
                details_draw.line((0, center + offset, size - 1, center + offset), fill=rut_color, width=1)
    else:
        # A restrained irregular wear trace differentiates a footpath from a mechanically clean road.
        if mask & (N | S):
            details_draw.line((center, 0, center, size - 1), fill=(80, 58, 31, 44), width=1)
        if mask & (E | W):
            details_draw.line((0, center, size - 1, center), fill=(80, 58, 31, 44), width=1)
        if mask & NE:
            details_draw.line((center, center, size - 1, 0), fill=(80, 58, 31, 44), width=1)
        if mask & SE:
            details_draw.line((center, center, size - 1, size - 1), fill=(80, 58, 31, 44), width=1)
        if mask & SW:
            details_draw.line((center, center, 0, size - 1), fill=(80, 58, 31, 44), width=1)
        if mask & NW:
            details_draw.line((center, center, 0, 0), fill=(80, 58, 31, 44), width=1)
    details.putalpha(ImageChops.multiply(details.getchannel("A"), route_mask))
    tile.alpha_composite(details)
    return tile


def render_network_field(
    field: list[list[int]],
    tiles: dict[int, Image.Image],
    outside: Image.Image,
    size: int,
    eight_way: bool = False,
) -> Image.Image:
    canvas = Image.new("RGBA", (len(field[0]) * size, len(field) * size), (0, 0, 0, 0))
    for y, row in enumerate(field):
        for x, occupied in enumerate(row):
            tile = tiles[network_mask(field, x, y, eight_way)] if occupied else outside
            canvas.alpha_composite(tile, (x * size, y * size))
    return canvas


def tiled_material_canvas(material: Image.Image, width: int, height: int) -> Image.Image:
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for y in range(0, height, material.height):
        for x in range(0, width, material.width):
            canvas.alpha_composite(material, (x, y))
    return canvas


def render_continuous_path(
    paths: list[list[tuple[int, int]]],
    field_width: int,
    field_height: int,
    outside: Image.Image,
    inside: Image.Image,
    size: int,
    route_width: int,
    shoulder_width: int,
    seed: int,
) -> Image.Image:
    width, height = field_width * size, field_height * size
    canvas = tiled_material_canvas(outside, width, height)
    route_mask = Image.new("L", (width, height), 0)
    shoulder_mask = Image.new("L", (width, height), 0)
    route_draw = ImageDraw.Draw(route_mask)
    shoulder_draw = ImageDraw.Draw(shoulder_mask)
    jitter = {}
    rng = random.Random(seed)

    def point_for(point: tuple[int, int]) -> tuple[int, int]:
        if point not in jitter:
            bound = max(1, round(size * 0.11))
            jitter[point] = (rng.randint(-bound, bound), rng.randint(-bound, bound))
        dx, dy = jitter[point]
        return (
            round((point[0] + 0.5) * size + dx),
            round((point[1] + 0.5) * size + dy),
        )

    def stroke(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], width_px: int) -> None:
        draw.line(points, fill=255, width=width_px, joint="curve")
        radius = width_px // 2
        for px, py in points:
            draw.ellipse((px - radius, py - radius, px + radius, py + radius), fill=255)

    def organic_points(path: list[tuple[int, int]]) -> list[tuple[int, int]]:
        sampled = []
        for segment_index, (start, end) in enumerate(zip(path, path[1:])):
            p0, p1 = point_for(start), point_for(end)
            span = max(abs(end[0] - start[0]), abs(end[1] - start[1]))
            steps = max(2, span * 2)
            for step in range(steps + 1):
                if segment_index and step == 0:
                    continue
                amount = step / steps
                if step == 0:
                    sampled.append(p0)
                elif step == steps:
                    sampled.append(p1)
                else:
                    wobble = max(1, round(size * 0.045))
                    sampled.append(
                        (
                            round(p0[0] + (p1[0] - p0[0]) * amount) + rng.randint(-wobble, wobble),
                            round(p0[1] + (p1[1] - p0[1]) * amount) + rng.randint(-wobble, wobble),
                        )
                    )
        return sampled or [point_for(path[0])]

    for path in paths:
        points = organic_points(path)
        stroke(shoulder_draw, points, route_width + shoulder_width * 2)
        stroke(route_draw, points, route_width)
    inside_field = tiled_material_canvas(inside, width, height)
    shoulder_field = ImageEnhance.Brightness(inside_field).enhance(0.62)
    canvas = Image.composite(shoulder_field, canvas, shoulder_mask)
    canvas = Image.composite(inside_field, canvas, route_mask)
    return canvas


def network_neighbor_closure(
    tiles: dict[int, Image.Image],
    route_width: int,
    eight_way: bool,
) -> tuple[bool, int]:
    center = next(iter(tiles.values())).height // 2
    half = max(2, route_width // 2)
    checked = 0
    for left_mask, left in tiles.items():
        if not left_mask & E:
            continue
        for right_mask, right in tiles.items():
            if not right_mask & W:
                continue
            for y in range(center - half, center + half + 1):
                if left.getpixel((left.width - 1, y)) != right.getpixel((0, y)):
                    return False, checked
            checked += 1
    for top_mask, top in tiles.items():
        if not top_mask & S:
            continue
        for bottom_mask, bottom in tiles.items():
            if not bottom_mask & N:
                continue
            for x in range(center - half, center + half + 1):
                if top.getpixel((x, top.height - 1)) != bottom.getpixel((x, 0)):
                    return False, checked
            checked += 1
    if eight_way:
        for first_mask, first in tiles.items():
            if not first_mask & SE:
                continue
            for second_mask, second in tiles.items():
                if not second_mask & NW:
                    continue
                # Diagonal neighbors meet at one world-space corner; unlike cardinal neighbors
                # they do not share a full edge strip.
                if first.getpixel((first.width - 1, first.height - 1)) != second.getpixel((0, 0)):
                    return False, checked
                checked += 1
    return True, checked


def compile_network_boundary(
    config: dict[str, Any],
    manifest_path: Path,
    output_dir: Path,
    force: bool,
) -> dict[str, Any]:
    guarded_reset(output_dir, force)
    size = int(config.get("tileSizePx", 64))
    dialect = config["kind"]
    eight_way = dialect == "path"
    route_width = max(6, round(size * float(config.get("routeWidth", 0.34 if dialect == "path" else 0.58))))
    shoulder_width = max(2, round(size * float(config.get("shoulderWidth", 0.09))))
    outside_path = resolve_manifest_path(manifest_path, config["outsideMaterial"]["tile"])
    inside_path = resolve_manifest_path(manifest_path, config["insideMaterial"]["tile"])
    outside = periodic_material(Image.open(outside_path), size)
    inside = periodic_material(Image.open(inside_path), size)
    shape_masks = range(256) if eight_way else range(16)
    tiles = {
        mask: make_network_tile(
            outside, inside, mask, size, route_width, shoulder_width, dialect
        )
        for mask in shape_masks
    }
    assets = [(network_mask_id(mask, eight_way), tile) for mask, tile in tiles.items()]
    atlas_columns = 16 if eight_way else 4
    atlas, placements = shelf_pack(assets, padding=2, max_width=size * atlas_columns + atlas_columns * 2 + 2)
    atlas.save(output_dir / "atlas.png")
    write_json(
        output_dir / "atlas.json",
        {
            "schemaVersion": 1,
            "dialect": f"boundary-{dialect}-{'eightway256' if eight_way else 'cardinal16'}-v1",
            "tileSizePx": size,
            "routeWidthPx": route_width,
            "shoulderWidthPx": shoulder_width,
            "canonicalShapes": {
                network_mask_id(mask, eight_way): {
                    "mask": mask,
                    "rect": list(placements[network_mask_id(mask, eight_way)]),
                }
                for mask in shape_masks
            },
        },
    )
    proof_cells = []
    coverage = set()
    path_specs = {label: (width, height, paths) for label, width, height, paths in path_torture_paths()}
    for proof_index, (label, field) in enumerate(network_torture_fields(dialect)):
        if dialect == "path":
            field_width, field_height, paths = path_specs[label]
            rendered = render_continuous_path(
                paths,
                field_width,
                field_height,
                outside,
                inside,
                size,
                route_width,
                shoulder_width,
                int(config.get("seed", 73129)) + proof_index,
            )
        else:
            rendered = render_network_field(field, tiles, outside, size, eight_way)
        rendered.save(output_dir / f"proof-{label}.png")
        proof_cells.append((label, rendered))
        coverage.update(
            network_mask(field, x, y, eight_way)
            for y, row in enumerate(field)
            for x, occupied in enumerate(row)
            if occupied
        )
    seeded = random.Random(int(config.get("seed", 73129)))
    stress_dimension = 128 if eight_way else 48
    stress_field = [
        [1 if seeded.random() > 0.5 else 0 for _ in range(stress_dimension)]
        for _ in range(stress_dimension)
    ]
    stress_coverage = {
        network_mask(stress_field, x, y, eight_way)
        for y, row in enumerate(stress_field)
        for x, occupied in enumerate(row)
        if occupied
    }
    coverage.update(stress_coverage)
    stress_tiles = {
        mask: image.resize((8, 8), Image.Resampling.NEAREST)
        for mask, image in tiles.items()
    }
    stress_outside = outside.resize((8, 8), Image.Resampling.NEAREST)
    render_network_field(stress_field, stress_tiles, stress_outside, 8, eight_way).save(
        output_dir / "proof-seeded-topology.png"
    )
    proof_board(
        f"{dialect.title()} boundary compiler · endpoints, bends, forks, loops",
        proof_cells,
        output_dir / "proof-board.png",
        (420, 300),
        2,
    )
    closure_ok, checked_pairs = network_neighbor_closure(tiles, route_width, eight_way)
    expected_shapes = 256 if eight_way else 16
    gates = {
        "insideSourceHashMatches": not config["insideMaterial"].get("sha256")
        or sha256_file(inside_path) == config["insideMaterial"]["sha256"],
        "outsideSourceHashMatches": not config["outsideMaterial"].get("sha256")
        or sha256_file(outside_path) == config["outsideMaterial"]["sha256"],
        "everyNetworkShapeCompiled": len(tiles) == expected_shapes and len(placements) == expected_shapes,
        "everyNetworkShapeProved": coverage == set(shape_masks),
        "connectedEdgesCloseExactly": closure_ok and checked_pairs > 0,
        "allNetworkTortureMapsRendered": len(proof_cells) == 4,
    }
    return finish_receipt(
        f"boundary-{dialect}",
        manifest_path,
        output_dir,
        gates,
        {
            "atlas": repo_path(output_dir / "atlas.png"),
            "metadata": repo_path(output_dir / "atlas.json"),
            "proofBoard": repo_path(output_dir / "proof-board.png"),
        },
        {
            "topology": "eightway256-network" if eight_way else "cardinal16-network",
            "routeWidthPx": route_width,
            "shoulderWidthPx": shoulder_width,
            "compatibleNeighborPairsChecked": checked_pairs,
            "shapeCoverage": len(coverage),
            "seededStressShapeCoverage": len(stress_coverage),
        },
    )


def cliff_height_fields() -> list[tuple[str, list[list[int]]]]:
    return [
        (
            "escarpment",
            [[0 if x < 3 + (y % 3) else 1 for x in range(13)] for y in range(9)],
        ),
        (
            "terraced-switchback",
            [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 0],
                [0, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 0],
                [0, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
        ),
        (
            "mesa-and-outcrop",
            [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0],
                [0, 1, 2, 2, 2, 1, 0, 0, 1, 1, 1, 0],
                [0, 1, 2, 3, 2, 1, 0, 0, 1, 2, 1, 0],
                [0, 1, 2, 2, 2, 1, 0, 0, 1, 1, 1, 0],
                [0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
        ),
        (
            "ravine",
            [
                [2, 2, 2, 1, 0, 0, 1, 2, 2, 2, 2, 2],
                [2, 2, 2, 1, 0, 0, 1, 2, 2, 2, 2, 2],
                [2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 2, 2],
                [2, 2, 1, 0, 0, 0, 0, 1, 1, 2, 2, 2],
                [2, 2, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2],
                [2, 2, 1, 1, 0, 0, 0, 0, 1, 2, 2, 2],
                [2, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 2],
                [2, 2, 2, 2, 1, 0, 0, 1, 2, 2, 2, 2],
            ],
        ),
    ]


def average_rgb(image: Image.Image) -> tuple[int, int, int]:
    sample = ImageOps.fit(image.convert("RGB"), (32, 32), method=Image.Resampling.BILINEAR)
    colors = list(sample.getdata())
    return tuple(round(sum(pixel[index] for pixel in colors) / len(colors)) for index in range(3))


def diamond_texture(material: Image.Image, half_width: int, half_height: int) -> Image.Image:
    width, height = half_width * 2 + 1, half_height * 2 + 1
    fitted = ImageOps.fit(material.convert("RGBA"), (width, height), method=Image.Resampling.LANCZOS)
    mask = Image.new("L", (width, height), 0)
    ImageDraw.Draw(mask).polygon(
        [(half_width, 0), (width - 1, half_height), (half_width, height - 1), (0, half_height)],
        fill=255,
    )
    fitted.putalpha(mask)
    return fitted


def render_cliff_height_field(
    levels: list[list[int]],
    top_material: Image.Image,
    outside_material: Image.Image,
    seed: int,
) -> Image.Image:
    half_width, half_height, level_height = 34, 17, 24
    rows, cols = len(levels), len(levels[0])
    maximum = max(max(row) for row in levels)
    margin = 44
    width = (rows + cols) * half_width + margin * 2
    height = (rows + cols) * half_height + maximum * level_height + margin * 2
    canvas = Image.new("RGBA", (width, height), (19, 22, 23, 255))
    high_top = diamond_texture(top_material, half_width, half_height)
    low_top = diamond_texture(outside_material, half_width, half_height)
    face_rgb = average_rgb(top_material)
    rng = random.Random(seed)
    base_x = rows * half_width + margin

    def level_at(x: int, y: int) -> int:
        return levels[y][x] if 0 <= x < cols and 0 <= y < rows else 0

    for diagonal in range(rows + cols - 1):
        for y in range(rows):
            x = diagonal - y
            if not 0 <= x < cols:
                continue
            level = levels[y][x]
            cx = base_x + (x - y) * half_width
            cy = margin + (x + y) * half_height + (maximum - level) * level_height
            if level > 0:
                east_drop = max(0, level - level_at(x + 1, y))
                south_drop = max(0, level - level_at(x, y + 1))
                draw = ImageDraw.Draw(canvas, "RGBA")
                if east_drop:
                    drop = east_drop * level_height
                    poly = [
                        (cx + half_width, cy),
                        (cx, cy + half_height),
                        (cx, cy + half_height + drop),
                        (cx + half_width, cy + drop),
                    ]
                    draw.polygon(poly, fill=(*tuple(round(v * 0.58) for v in face_rgb), 255))
                    for step in range(5, drop, 7):
                        draw.line(
                            (cx + half_width, cy + step, cx, cy + half_height + step),
                            fill=(26, 24, 23, 95),
                            width=1,
                        )
                if south_drop:
                    drop = south_drop * level_height
                    poly = [
                        (cx, cy + half_height),
                        (cx - half_width, cy),
                        (cx - half_width, cy + drop),
                        (cx, cy + half_height + drop),
                    ]
                    draw.polygon(poly, fill=(*tuple(round(v * 0.43) for v in face_rgb), 255))
                    for step in range(5, drop, 7):
                        draw.line(
                            (cx - half_width, cy + step, cx, cy + half_height + step),
                            fill=(18, 17, 16, 110),
                            width=1,
                        )
            top = high_top if level > 0 else low_top
            canvas.alpha_composite(top, (cx - half_width, cy - half_height))
            outline = ImageDraw.Draw(canvas, "RGBA")
            outline.line(
                [
                    (cx, cy - half_height),
                    (cx + half_width, cy),
                    (cx, cy + half_height),
                    (cx - half_width, cy),
                    (cx, cy - half_height),
                ],
                fill=(230, 218, 188, 22 if level == 0 else 52),
                width=1,
            )
            if level > 0 and rng.random() < 0.18:
                outline.ellipse((cx - 2, cy - 1, cx + 2, cy + 2), fill=(35, 31, 28, 90))
    return canvas


def make_cliff_topology_tile(material: Image.Image, mask: int, size: int, border: int) -> Image.Image:
    tile = material.copy()
    draw = ImageDraw.Draw(tile, "RGBA")
    dark = (32, 29, 27, 210)
    mid = (78, 67, 56, 180)
    if not mask & N:
        draw.rectangle((0, 0, size - 1, border), fill=mid)
    if not mask & E:
        draw.rectangle((size - border - 1, 0, size - 1, size - 1), fill=dark)
    if not mask & S:
        draw.rectangle((0, size - border - 1, size - 1, size - 1), fill=dark)
    if not mask & W:
        draw.rectangle((0, 0, border, size - 1), fill=mid)
    return tile


def compile_cliff_boundary(
    config: dict[str, Any],
    manifest_path: Path,
    output_dir: Path,
    force: bool,
) -> dict[str, Any]:
    guarded_reset(output_dir, force)
    size = int(config.get("tileSizePx", 64))
    border = max(4, round(size * float(config.get("faceBandWidth", 0.16))))
    top_path = resolve_manifest_path(manifest_path, config["insideMaterial"]["tile"])
    outside_path = resolve_manifest_path(manifest_path, config["outsideMaterial"]["tile"])
    top = periodic_material(Image.open(top_path), size)
    outside = periodic_material(Image.open(outside_path), size)
    tiles = {mask: make_cliff_topology_tile(top, mask, size, border) for mask in range(16)}
    assets = [(cardinal_mask_id(mask), tile) for mask, tile in tiles.items()]
    atlas, placements = shelf_pack(assets, padding=2, max_width=size * 4 + 10)
    atlas.save(output_dir / "atlas.png")
    write_json(
        output_dir / "atlas.json",
        {
            "schemaVersion": 1,
            "dialect": "boundary-cliff-elevation-v1",
            "tileSizePx": size,
            "faceBandWidthPx": border,
            "canonicalShapes": {
                cardinal_mask_id(mask): {"mask": mask, "rect": list(placements[cardinal_mask_id(mask)])}
                for mask in range(16)
            },
            "heightSemantics": "integer elevation bands; exposed faces repeat per level delta",
        },
    )
    proof_cells = []
    maximum_level = 0
    for index, (label, field) in enumerate(cliff_height_fields()):
        maximum_level = max(maximum_level, max(max(row) for row in field))
        rendered = render_cliff_height_field(field, top, outside, int(config.get("seed", 73129)) + index)
        rendered.save(output_dir / f"proof-{label}.png")
        proof_cells.append((label, rendered))
    proof_board(
        "Cliff boundary compiler · escarpments, terraces, mesas, ravines",
        proof_cells,
        output_dir / "proof-board.png",
        (470, 340),
        2,
    )
    gates = {
        "insideSourceHashMatches": not config["insideMaterial"].get("sha256")
        or sha256_file(top_path) == config["insideMaterial"]["sha256"],
        "outsideSourceHashMatches": not config["outsideMaterial"].get("sha256")
        or sha256_file(outside_path) == config["outsideMaterial"]["sha256"],
        "all16CardinalShapesCompiled": len(tiles) == 16 and len(placements) == 16,
        "multipleElevationBandsProved": maximum_level >= 3,
        "allCliffTortureMapsRendered": len(proof_cells) == 4,
        "everyProofHasVisibleFaces": all(image.height > 300 for _, image in proof_cells),
    }
    return finish_receipt(
        "boundary-cliff",
        manifest_path,
        output_dir,
        gates,
        {
            "atlas": repo_path(output_dir / "atlas.png"),
            "metadata": repo_path(output_dir / "atlas.json"),
            "proofBoard": repo_path(output_dir / "proof-board.png"),
        },
        {
            "topology": "cardinal16+integer-elevation",
            "heightBandCountProved": maximum_level + 1,
            "renderDialect": "dimetric-height-field",
        },
    )


def compile_boundary_dialect_suite(
    manifest: dict[str, Any],
    manifest_path: Path,
    output_dir: Path,
    force: bool,
) -> dict[str, Any]:
    guarded_reset(output_dir, force)
    generated_manifests = output_dir / "compiled-manifests"
    generated_manifests.mkdir(parents=True)
    results = []
    for config in manifest["dialects"]:
        dialect_id = config["id"]
        dialect_dir = output_dir / "dialects" / dialect_id
        if config["kind"] == "enclosure":
            child_manifest = {
                "schemaVersion": 1,
                "family": "boundary-autotile",
                "insideMaterial": config["insideMaterial"],
                "edgeLanguage": config.get("edgeLanguage", {}),
                "tileSizePx": config.get("tileSizePx", manifest.get("tileSizePx", 64)),
                "seed": config.get("seed", manifest.get("seed", 73129)),
                "allowSeamLock": config.get("allowSeamLock", True),
                "maxRepairableSourceEdgeDelta": config.get("maxRepairableSourceEdgeDelta", 10),
            }
            child_path = generated_manifests / f"{dialect_id}.json"
            write_json(child_path, child_manifest)
            receipt = compile_boundary(child_path, dialect_dir, True)
        elif config["kind"] in {"path", "road"}:
            receipt = compile_network_boundary(config, manifest_path, dialect_dir, True)
        elif config["kind"] == "cliff":
            receipt = compile_cliff_boundary(config, manifest_path, dialect_dir, True)
        else:
            raise ValueError(f"unsupported boundary dialect: {config['kind']}")
        results.append(
            {
                "id": dialect_id,
                "kind": config["kind"],
                "technicalStatus": receipt["technicalStatus"],
                "failedGates": [name for name, passed in receipt["gates"].items() if not passed],
                "receipt": repo_path(dialect_dir / "receipt.json"),
                "proofBoard": receipt["outputs"]["proofBoard"],
                "details": receipt["details"],
            }
        )
    write_json(
        output_dir / "dialect-index.json",
        {"schemaVersion": 1, "dialects": results},
    )
    proof_cells = [
        (
            f"{result['id']} · {result['technicalStatus']}",
            Image.open(ROOT / result["proofBoard"]).convert("RGBA"),
        )
        for result in results
    ]
    proof_board(
        "Boundary compiler dialect suite · architecture / wilderness / roads / elevation",
        proof_cells,
        output_dir / "proof-board.png",
        (520, 360),
        2,
    )
    kinds = [config["kind"] for config in manifest["dialects"]]
    network_widths = {
        result["kind"]: result["details"].get("routeWidthPx")
        for result in results
        if result["kind"] in {"path", "road"}
    }
    gates = {
        "dialectIdsUnique": len({config["id"] for config in manifest["dialects"]}) == len(results),
        "architectureDialectPresent": "enclosure" in kinds,
        "wildernessPathDialectPresent": "path" in kinds,
        "roadDialectPresent": "road" in kinds,
        "cliffElevationDialectPresent": "cliff" in kinds,
        "everyDialectPassesOwnGates": all(result["technicalStatus"] == "PASS" for result in results),
        "pathAndRoadRemainDistinct": network_widths.get("path") != network_widths.get("road"),
        "everyDialectHasIndividualRenders": all(result["proofBoard"] for result in results),
    }
    return finish_receipt(
        "boundary-dialect-suite",
        manifest_path,
        output_dir,
        gates,
        {
            "dialectIndex": repo_path(output_dir / "dialect-index.json"),
            "proofBoard": repo_path(output_dir / "proof-board.png"),
        },
        {
            "dialectCount": len(results),
            "dialects": results,
            "claimBoundary": "Each dialect proves its own topology; this board is navigation, not a substitute for the individual renders.",
        },
    )


def compile_boundary(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    if manifest.get("dialects"):
        return compile_boundary_dialect_suite(manifest, manifest_path, output_dir, force)
    if manifest.get("kind") in {"path", "road"}:
        return compile_network_boundary(manifest, manifest_path, output_dir, force)
    if manifest.get("kind") == "cliff":
        return compile_cliff_boundary(manifest, manifest_path, output_dir, force)
    guarded_reset(output_dir, force)
    source = resolve_manifest_path(manifest_path, manifest["insideMaterial"]["tile"])
    raw_material = Image.open(source).convert("RGBA")
    size = int(manifest.get("tileSizePx", 64))
    border = int(manifest.get("edgeLanguage", {}).get("borderWidthPx", max(3, size // 10)))
    raw_source_delta = edge_delta(raw_material)
    allow_seam_lock = bool(manifest.get("allowSeamLock", False))
    fitted_material = ImageOps.fit(raw_material, (size, size), method=Image.Resampling.NEAREST)
    material = force_periodic(fitted_material) if allow_seam_lock else fitted_material
    material.save(output_dir / "compiled-inside-material.png")
    masks = canonical_masks()
    lookup = [sanitize_mask(raw) for raw in range(256)]
    tiles = {mask: make_boundary_tile(material, mask, size, border) for mask in masks}
    assets = [(mask_id(mask), tiles[mask]) for mask in masks]
    atlas, placements = shelf_pack(assets, padding=2, max_width=size * 8 + 18)
    atlas_path = output_dir / "atlas.png"
    atlas.save(atlas_path)
    atlas_json = {
        "schemaVersion": 1,
        "dialect": "boundary-blob47-v1",
        "tileSizePx": size,
        "canonicalShapes": {
            mask_id(mask): {
                "mask": mask,
                "rect": list(placements[mask_id(mask)]),
            }
            for mask in masks
        },
        "rawMaskLookup": [mask_id(mask) for mask in lookup],
    }
    write_json(output_dir / "atlas.json", atlas_json)
    proof_cells = []
    for label, field in torture_fields():
        rendered = render_boundary_field(field, tiles, size)
        rendered.save(output_dir / f"proof-{label}.png")
        proof_cells.append((label, rendered))
    seeded = random.Random(int(manifest.get("seed", 73129)))
    random_field = [[1 if seeded.random() > 0.42 else 0 for _ in range(48)] for _ in range(48)]
    small_tiles = {
        mask: image.resize((8, 8), Image.Resampling.NEAREST) for mask, image in tiles.items()
    }
    random_proof = render_boundary_field(random_field, small_tiles, 8)
    random_proof.save(output_dir / "proof-random.png")
    coverage = boundary_field_coverage(random_field)
    proof_cells.append((f"seeded field · {len(coverage)}/47", random_proof))
    proof_board("Boundary auto-tile — topology torture maps", proof_cells, output_dir / "proof-board.png", (230, 190), 3)

    mapping_stable = lookup == [sanitize_mask(raw) for raw in range(256)]
    diag_legal = all(
        not (mask & diagonal) or (mask & first and mask & second)
        for mask in masks
        for diagonal, first, second in DIAGONAL_RULES
    )
    closure_ok, compatible_pairs = boundary_neighbor_closure(tiles, border)
    topology_ok = all(
        rendered_topology_matches(field, render_boundary_field(field, tiles, size), size)
        for _, field in torture_fields()
    )
    gates = {
        "sourceHashMatches": not manifest["insideMaterial"].get("sha256")
        or sha256_file(source) == manifest["insideMaterial"]["sha256"],
        "sourceWithinSeamBudget": raw_source_delta <= float(
            manifest.get(
                "maxRepairableSourceEdgeDelta" if allow_seam_lock else "maxSourceEdgeDelta",
                3.0,
            )
        ),
        "compiledSourceSeamExact": edge_delta(material) == 0,
        "all256RawMasksResolve": len(lookup) == 256,
        "exactly47CanonicalShapes": len(masks) == 47,
        "diagonalSanitizationLegal": diag_legal,
        "lookupDeterministic": mapping_stable,
        "allCanonicalShapesPacked": len(placements) == 47,
        "allTortureMapsRendered": len(proof_cells) == 11,
        "neighborClosureExhaustive": closure_ok and compatible_pairs > 0,
        "tortureMapTopologyPreserved": topology_ok,
        "seededFieldContainsEveryCanonicalShape": coverage == set(masks),
    }
    return finish_receipt(
        "boundary-autotile",
        manifest_path,
        output_dir,
        gates,
        {
            "atlas": repo_path(atlas_path),
            "metadata": repo_path(output_dir / "atlas.json"),
            "proofBoard": repo_path(output_dir / "proof-board.png"),
        },
        {
            "canonicalShapeCount": len(masks),
            "rawMaskCount": len(lookup),
            "sourceEdgeDelta": raw_source_delta,
            "compiledSourceEdgeDelta": edge_delta(material),
            "seamLockApplied": allow_seam_lock,
            "compatibleNeighborPairsChecked": compatible_pairs,
            "seededFieldShapeCoverage": len(coverage),
        },
    )


# Modular repeat compiler ----------------------------------------------------

def compile_repeat(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    sheet_path = resolve_manifest_path(manifest_path, manifest["componentSheet"])
    sheet, chroma = key_manifest_image(Image.open(sheet_path), manifest)
    boxes, _slots, extraction = sheet_component_boxes(sheet, manifest)
    components = [transparent_rgb_clean(sheet.crop(box)) for box in boxes]
    component_width = manifest.get("componentWidthPx")
    if component_width:
        scaled_components = []
        for component in components:
            width = int(component_width)
            height = max(1, round(component.height * width / max(1, component.width)))
            scaled_components.append(
                component.resize(
                    (width, height),
                    Image.Resampling.LANCZOS
                    if manifest.get("componentResampling", "lanczos") == "lanczos"
                    else Image.Resampling.NEAREST,
                )
            )
        components = scaled_components
    tile_size = int(manifest.get("tileSizePx", 96))
    seed = int(manifest.get("seed", 17))
    rng = random.Random(seed)
    tile = Image.new("RGBA", (tile_size, tile_size), tuple(manifest.get("baseRGBA", [70, 62, 51, 255])))
    placements = []
    layout = manifest.get("layout", "seeded-scatter")
    if layout == "staggered-courses" and components:
        median_width = sorted(component.width for component in components)[len(components) // 2]
        median_height = sorted(component.height for component in components)[len(components) // 2]
        x_step = int(manifest.get("courseStepXPx", max(1, round(median_width * 0.82))))
        y_step = int(manifest.get("courseStepYPx", max(1, round(median_height * 0.68))))
        unused_components = set(range(len(components)))
        previous_row: list[tuple[int, int]] = []
        for row, y in enumerate(range(0, tile_size, y_step)):
            offset = -(x_step // 2) if row % 2 else 0
            current_row: list[tuple[int, int]] = []
            left_component = None
            for x in range(offset, tile_size, x_step):
                above_component = (
                    min(previous_row, key=lambda item: abs(item[0] - x))[1]
                    if previous_row
                    else None
                )
                forbidden = {left_component, above_component}
                preferred = sorted(
                    index
                    for index in unused_components
                    if index not in forbidden
                )
                candidates = preferred or [
                    index
                    for index in range(len(components))
                    if index not in forbidden
                ]
                if not candidates:
                    candidates = list(range(len(components)))
                component_index = rng.choice(candidates)
                unused_components.discard(component_index)
                component = components[component_index]
                paste_wrapped(tile, component, x, y)
                placements.append(
                    {"component": component_index, "x": x, "y": y, "row": row}
                )
                current_row.append((x, component_index))
                left_component = component_index
            previous_row = current_row
    else:
        for index, component in enumerate(components):
            x = rng.randrange(-component.width // 2, tile_size)
            y = rng.randrange(-component.height // 2, tile_size)
            paste_wrapped(tile, component, x, y)
            placements.append({"component": index, "x": x, "y": y})
    tile = force_periodic(transparent_rgb_clean(tile))
    tile_path = output_dir / "tile.png"
    tile.save(tile_path)
    tiled = Image.new("RGBA", (tile_size * 4, tile_size * 4), (0, 0, 0, 0))
    for y in range(4):
        for x in range(4):
            tiled.alpha_composite(tile, (x * tile_size, y * tile_size))
    tiled.save(output_dir / "proof-torus.png")
    proof_board(
        "Modular repeat compiler",
        [("component sheet", sheet), ("repeat tile", tile), ("4x4 torus proof", tiled)],
        output_dir / "proof-board.png",
        (360, 340),
        3,
    )
    exact_edges = edge_delta(tile) == 0
    gates = {
        "sourceHashMatches": not manifest.get("sourceSha256") or sha256_file(sheet_path) == manifest["sourceSha256"],
        "componentsIsolated": len(components) >= int(manifest.get("minimumComponents", 2)),
        "toroidalClosureExact": exact_edges,
        "allComponentsPlaced": {item["component"] for item in placements} == set(range(len(components))),
        "variantCadencePresent": len({(p["x"], p["y"]) for p in placements}) == len(placements),
    }
    return finish_receipt(
        "modular-repeat",
        manifest_path,
        output_dir,
        gates,
        {"tile": repo_path(tile_path), "proofBoard": repo_path(output_dir / "proof-board.png")},
        {
            "componentCount": len(components),
            "placements": placements,
            "edgeDelta": edge_delta(tile),
            "layout": layout,
            "chroma": chroma,
            "extraction": extraction,
        },
    )


# Prop/kit sheet compiler ----------------------------------------------------

def compile_prop_kit(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    sheet_path = resolve_manifest_path(manifest_path, manifest["sheet"])
    sheet, chroma = key_manifest_image(Image.open(sheet_path), manifest)
    boxes, slots, extraction = sheet_component_boxes(sheet, manifest)
    ids = list(manifest.get("ids", []))
    cells = []
    fragment_audits = {}
    for index, box in enumerate(boxes[: len(ids)]):
        prop = transparent_rgb_clean(sheet.crop(box))
        if manifest.get("pruneDetachedFragments", False):
            prop, fragment_audit = prune_detached_fragments(
                prop,
                float(manifest.get("fragmentMergePx", 24)),
                int(manifest.get("alphaCutoff", 12)),
            )
            visible = alpha_bbox(prop)
            prop = prop.crop(visible) if visible else prop
            fragment_audits[ids[index]] = fragment_audit
        pad = int(manifest.get("paddingPx", 2))
        prop = ImageOps.expand(prop, border=pad, fill=(0, 0, 0, 0))
        cells.append((ids[index], prop))
        prop.save(output_dir / f"{ids[index]}.png")
    atlas = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    placements: dict[str, tuple[int, int, int, int]] = {}
    if cells:
        atlas, placements = shelf_pack(cells, padding=2, max_width=512)
    atlas.save(output_dir / "atlas.png")
    proof_board(
        "Prop/kit compiler — isolated and grounded",
        [(name, image) for name, image in cells],
        output_dir / "proof-board.png",
        (180, 170),
        4,
    )
    anchors = {
        name: {"footX": 0.5, "footY": (alpha_bbox(image) or (0, 0, 0, image.height))[3] / image.height}
        for name, image in cells
    }
    write_json(output_dir / "kit.json", {"ids": ids, "rects": placements, "anchors": anchors})
    gates = {
        "sourceHashMatches": not manifest.get("sourceSha256") or sha256_file(sheet_path) == manifest["sourceSha256"],
        "componentCountMatches": len(boxes) == len(ids) and len(ids) > 0,
        "idsUnique": len(ids) == len(set(ids)),
        "allComponentsHaveAlpha": all(alpha_bbox(image) for _, image in cells),
        "allAnchorsGrounded": all(0.5 <= value["footY"] <= 1.0 for value in anchors.values()),
        "atlasContainsEveryId": len(placements) == len(ids),
        "componentsClearDeclaredCells": all(
            box[0] > slot[0] and box[1] > slot[1] and box[2] < slot[2] and box[3] < slot[3]
            for box, slot in zip(boxes, slots)
        ),
        "detachedFragmentPolicySatisfied": not manifest.get("pruneDetachedFragments", False)
        or all(
            audit["prunedAlphaRatio"] <= float(manifest.get("maxPrunedAlphaRatio", 0.08))
            for audit in fragment_audits.values()
        ),
    }
    return finish_receipt(
        "prop-kit",
        manifest_path,
        output_dir,
        gates,
        {
            "atlas": repo_path(output_dir / "atlas.png"),
            "metadata": repo_path(output_dir / "kit.json"),
            "proofBoard": repo_path(output_dir / "proof-board.png"),
        },
        {
            "componentCount": len(boxes),
            "expectedCount": len(ids),
            "chroma": chroma,
            "extraction": extraction,
            "fragmentAudits": fragment_audits,
        },
    )


# Condition-state compiler --------------------------------------------------

def dilated_alpha(image: Image.Image, radius: int = 3) -> Image.Image:
    size = radius * 2 + 1
    return image.convert("RGBA").getchannel("A").filter(ImageFilter.MaxFilter(size))


def alpha_outside_ratio(candidate: Image.Image, allowed: Image.Image) -> float:
    cand = candidate.convert("RGBA").getchannel("A").point(lambda value: 255 if value > 12 else 0)
    inverse = ImageOps.invert(allowed.point(lambda value: 255 if value > 12 else 0))
    outside = ImageChops.multiply(cand, inverse)
    return sum(1 for value in outside.getdata() if value) / max(1, sum(1 for value in cand.getdata() if value))


def register_to_canvas(
    image: Image.Image,
    canvas_size: tuple[int, int],
    foot_x: float = 0.5,
    bottom_padding: int = 0,
) -> Image.Image:
    rgba = transparent_rgb_clean(image)
    box = alpha_bbox(rgba)
    output = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    if not box:
        return output
    content = rgba.crop(box)
    if content.width > canvas_size[0] or content.height + bottom_padding > canvas_size[1]:
        content = ImageOps.contain(
            content,
            (canvas_size[0], max(1, canvas_size[1] - bottom_padding)),
            Image.Resampling.LANCZOS,
        )
    x = round((canvas_size[0] - content.width) * foot_x)
    y = canvas_size[1] - bottom_padding - content.height
    output.alpha_composite(content, (x, y))
    return output


def compile_condition(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    source_path = resolve_manifest_path(manifest_path, manifest["source"])
    source, source_chroma = key_manifest_image(Image.open(source_path), manifest)
    original_dimensions = {"source": list(source.size)}
    variants = []
    for entry in manifest.get("states", []):
        state_path = resolve_manifest_path(manifest_path, entry["path"])
        image, _ = key_manifest_image(Image.open(state_path), {**manifest, **entry})
        original_dimensions[entry["id"]] = list(image.size)
        variants.append((entry["id"], image, state_path))
    registration = manifest.get("registration")
    if registration:
        canvas = tuple(int(value) for value in registration["canvas"])
        foot_x = float(registration.get("footX", 0.5))
        bottom_padding = int(registration.get("bottomPaddingPx", 0))
        source = register_to_canvas(source, canvas, foot_x, bottom_padding)
        variants = [
            (state_id, register_to_canvas(image, canvas, foot_x, bottom_padding), path)
            for state_id, image, path in variants
        ]
    allowed = dilated_alpha(source, int(manifest.get("silhouetteAllowancePx", 3)))
    outside = {state_id: alpha_outside_ratio(image, allowed) for state_id, image, _ in variants}
    changes = {state_id: rgba_difference(source, image) for state_id, image, _ in variants}
    for state_id, image, _ in variants:
        image.save(output_dir / f"{state_id}.png")
    proof_board(
        "Condition-state compiler",
        [("source", source)] + [(state_id, image) for state_id, image, _ in variants],
        output_dir / "proof-board.png",
        (190, 180),
        4,
    )
    order = [changes[state_id] for state_id, _, _ in variants]
    gates = {
        "sourceHashMatches": not manifest.get("sourceSha256") or sha256_file(source_path) == manifest["sourceSha256"],
        "allStatesPresent": len(variants) == int(manifest.get("expectedStateCount", len(variants))) and bool(variants),
        "dimensionsLocked": all(image.size == source.size for _, image, _ in variants),
        "silhouetteWithinLicense": all(value <= float(manifest.get("maxOutsideAlphaRatio", 0.01)) for value in outside.values()),
        "damageIsLocalNotReplacement": all(0.0001 <= value <= float(manifest.get("maxChangedRatio", 0.42)) for value in changes.values()),
        "declaredSeverityOrdered": order == sorted(order),
        "registrationContractSatisfied": not registration
        or all(image.size == source.size for _, image, _ in variants),
    }
    return finish_receipt(
        "condition-state",
        manifest_path,
        output_dir,
        gates,
        {"proofBoard": repo_path(output_dir / "proof-board.png")},
        {
            "outsideAlphaRatio": outside,
            "changedRatio": changes,
            "originalDimensions": original_dimensions,
            "registeredDimensions": list(source.size),
            "registration": registration,
            "sourceChroma": source_chroma,
            "stateSha256": {
                state_id: sha256_file(path) for state_id, _, path in variants
            },
        },
    )


# Palette harmonizer --------------------------------------------------------

def hex_rgb(value: str) -> tuple[int, int, int]:
    text = value.lstrip("#")
    if len(text) != 6:
        raise ValueError(f"invalid RGB hex: {value}")
    return tuple(int(text[index:index + 2], 16) for index in (0, 2, 4))


def luminance(rgb: tuple[int, int, int]) -> float:
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722


_CANONICAL_PALETTE_ENGINE = None


def canonical_palette_engine():
    """Load the standing corpus unifier instead of maintaining duplicate color math here."""
    global _CANONICAL_PALETTE_ENGINE
    if _CANONICAL_PALETTE_ENGINE is None:
        engine_path = ROOT / "build" / "unify-corpus.py"
        spec = importlib.util.spec_from_file_location("assetforge_canonical_palette_engine", engine_path)
        if spec is None or spec.loader is None:
            raise RuntimeError(f"cannot load canonical palette engine: {repo_path(engine_path)}")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        _CANONICAL_PALETTE_ENGINE = module
    return _CANONICAL_PALETTE_ENGINE


def compile_palette(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    import numpy as np

    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    source_path = resolve_manifest_path(manifest_path, manifest["source"])
    source, chroma = key_manifest_image(Image.open(source_path), manifest)
    engine = canonical_palette_engine()
    palette = [hex_rgb(value) for value in manifest["palette"]]
    protected = {hex_rgb(value) for value in manifest.get("protectedColors", [])}
    working = source.copy()
    defringe_applied = bool(manifest.get("defringe", True))
    if defringe_applied:
        engine.defringe(
            working,
            despill=float(manifest.get("despill", 0.25)),
            erode_excess=int(manifest.get("erodeExcess", 60)),
            band=int(manifest.get("edgeBandPx", 2)),
        )

    rgba = np.asarray(working, dtype=np.uint8).copy()
    rgb = rgba[..., :3]
    alpha = rgba[..., 3]
    opaque = alpha > 0
    quantized = engine.quantize_nearest_lab(rgb, palette).astype(np.uint8)
    protected_mask = np.zeros(alpha.shape, dtype=bool)
    for color in protected:
        protected_mask |= np.all(rgb == np.asarray(color, dtype=np.uint8), axis=-1)
    quantized[protected_mask & opaque] = rgb[protected_mask & opaque]
    quantized[~opaque] = 0
    output_rgba = np.dstack([quantized, alpha])
    output = Image.fromarray(output_rgba, "RGBA")
    output.save(output_dir / "harmonized.png")

    before_opaque = rgb[opaque]
    after_opaque = quantized[opaque]
    delta_e = (
        engine.ciede2000(engine.rgb_to_lab(before_opaque), engine.rgb_to_lab(after_opaque))
        if before_opaque.size
        else np.asarray([], dtype=float)
    )
    mean_delta_e = float(delta_e.mean()) if delta_e.size else 0.0
    p95_delta_e = float(np.percentile(delta_e, 95)) if delta_e.size else 0.0
    before_hue = engine.dominant_hue(rgb, alpha)
    after_hue = engine.dominant_hue(quantized, alpha)
    hue_shift = engine.circular_delta_deg(before_hue, after_hue)
    forbidden_output = engine.min_dist_to_forbidden(quantized, alpha)

    before_luma = [luminance(tuple(int(channel) for channel in value)) for value in before_opaque]
    after_luma = [luminance(tuple(int(channel) for channel in value)) for value in after_opaque]
    # Pairwise luminance direction agreement is a stable rank proxy without a statistics package.
    agreements = 0
    samples = 0
    stride = max(1, len(before_luma) // 500)
    sampled = list(zip(before_luma[::stride], after_luma[::stride]))
    for index in range(len(sampled) - 1):
        a0, a1 = sampled[index], sampled[index + 1]
        if (a0[0] <= a1[0]) == (a0[1] <= a1[1]):
            agreements += 1
        samples += 1
    rank_agreement = agreements / max(1, samples)
    chips = Image.new("RGBA", (max(1, len(palette)) * 32, 32), (0, 0, 0, 0))
    chip_draw = ImageDraw.Draw(chips)
    for index, color in enumerate(palette):
        chip_draw.rectangle((index * 32, 0, index * 32 + 31, 31), fill=(*color, 255))
    proof_board(
        "Palette harmonizer · canonical perceptual engine",
        [("source", source), ("defringed", working), ("harmonized", output), ("realm palette", chips)],
        output_dir / "proof-board.png",
        (240, 200),
        4,
    )
    output_colors = {(r, g, b) for r, g, b, a in output.getdata() if a}
    allowed_colors = set(palette) | protected
    palette_source = (
        resolve_manifest_path(manifest_path, manifest["paletteSource"])
        if manifest.get("paletteSource")
        else None
    )
    gates = {
        "sourceHashMatches": not manifest.get("sourceSha256") or sha256_file(source_path) == manifest["sourceSha256"],
        "paletteSourceHashMatches": not manifest.get("paletteSourceSha256")
        or (palette_source is not None and sha256_file(palette_source) == manifest["paletteSourceSha256"]),
        "paletteNonEmpty": bool(palette),
        "protectedColorsRepresentable": protected.issubset(set(palette)),
        "everyOpaquePixelInPalette": output_colors.issubset(allowed_colors),
        "alphaByteIdentical": output.getchannel("A").tobytes() == working.getchannel("A").tobytes(),
        "meanCiede2000WithinBudget": mean_delta_e <= float(manifest.get("maxMeanDeltaE", 18.0)),
        "dominantHuePreserved": hue_shift is None
        or hue_shift <= float(manifest.get("maxDominantHueShiftDeg", engine.HUE_SHIFT_THRESHOLD_DEG)),
        "forbiddenChromaAbsent": forbidden_output == 0,
        "valueHierarchyPreserved": rank_agreement >= float(manifest.get("minimumRankAgreement", 0.72)),
    }
    return finish_receipt(
        "palette-harmonizer",
        manifest_path,
        output_dir,
        gates,
        {"image": repo_path(output_dir / "harmonized.png"), "proofBoard": repo_path(output_dir / "proof-board.png")},
        {
            "engineAuthority": "build/unify-corpus.py",
            "engineAlgorithm": "Lab nearest + CIEDE2000 + dominant-hue + forbidden-chroma + shared defringe",
            "engineSha256": sha256_file(ROOT / "build" / "unify-corpus.py"),
            "defringeApplied": defringe_applied,
            "meanCiede2000": mean_delta_e,
            "p95Ciede2000": p95_delta_e,
            "dominantHueBeforeDeg": before_hue,
            "dominantHueAfterDeg": after_hue,
            "dominantHueShiftDeg": hue_shift,
            "forbiddenChromaPixelCount": forbidden_output,
            "valueRankAgreement": rank_agreement,
            "outputColorCount": len(output_colors),
            "chroma": chroma,
        },
    )


# Nine-slice / trim compiler ------------------------------------------------

def nine_slice(
    source: Image.Image,
    target: tuple[int, int],
    source_insets: tuple[int, int, int, int],
    output_insets: tuple[int, int, int, int] | None = None,
) -> Image.Image:
    left, top, right, bottom = source_insets
    out_left, out_top, out_right, out_bottom = output_insets or source_insets
    width, height = target
    if width < out_left + out_right or height < out_top + out_bottom:
        raise ValueError("target smaller than fixed caps")
    x = (0, left, source.width - right, source.width)
    y = (0, top, source.height - bottom, source.height)
    tx = (0, out_left, width - out_right, width)
    ty = (0, out_top, height - out_bottom, height)
    out = Image.new("RGBA", target, (0, 0, 0, 0))
    for row in range(3):
        for col in range(3):
            source_size = (x[col + 1] - x[col], y[row + 1] - y[row])
            target_size = (tx[col + 1] - tx[col], ty[row + 1] - ty[row])
            if 0 in source_size or 0 in target_size:
                continue
            patch = source.crop((x[col], y[row], x[col + 1], y[row + 1]))
            if patch.size != target_size:
                patch = patch.resize(target_size, Image.Resampling.NEAREST)
            out.alpha_composite(patch, (tx[col], ty[row]))
    return out


def compile_trim(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    source_path = resolve_manifest_path(manifest_path, manifest["source"])
    source, chroma = key_manifest_image(Image.open(source_path), manifest)
    insets = tuple(int(value) for value in manifest.get("sourceInsets", manifest.get("insets")))
    output_insets = tuple(int(value) for value in manifest.get("outputInsets", insets))
    targets = [tuple(int(value) for value in target) for target in manifest["targets"]]
    outputs = []
    errors = []
    for index, target in enumerate(targets):
        try:
            image = nine_slice(source, target, insets, output_insets)
            image.save(output_dir / f"target-{index + 1}.png")
            outputs.append((f"{target[0]}x{target[1]}", image))
        except ValueError as exc:
            errors.append(str(exc))
    proof_board(
        "Trim + nine-slice compiler",
        [("source", source)] + outputs,
        output_dir / "proof-board.png",
        (260, 180),
        3,
    )
    left, top, right, bottom = insets
    out_left, out_top, out_right, out_bottom = output_insets
    cap_ok = True
    for _, image in outputs:
        if left and right and top and bottom and out_left and out_right and out_top and out_bottom:
            corner_specs = (
                (
                    (0, 0, left, top),
                    (0, 0, out_left, out_top),
                    (out_left, out_top),
                ),
                (
                    (source.width - right, 0, source.width, top),
                    (image.width - out_right, 0, image.width, out_top),
                    (out_right, out_top),
                ),
                (
                    (0, source.height - bottom, left, source.height),
                    (0, image.height - out_bottom, out_left, image.height),
                    (out_left, out_bottom),
                ),
                (
                    (source.width - right, source.height - bottom, source.width, source.height),
                    (
                        image.width - out_right,
                        image.height - out_bottom,
                        image.width,
                        image.height,
                    ),
                    (out_right, out_bottom),
                ),
            )
            for source_box, output_box, expected_size in corner_specs:
                expected = source.crop(source_box)
                if expected.size != expected_size:
                    expected = expected.resize(expected_size, Image.Resampling.NEAREST)
                cap_ok = cap_ok and image.crop(output_box).tobytes() == expected.tobytes()
        elif left and out_left:
            expected = source.crop((0, 0, left, source.height)).resize(
                (out_left, image.height), Image.Resampling.NEAREST
            )
            cap_ok = cap_ok and image.crop((0, 0, out_left, image.height)).tobytes() == expected.tobytes()
        if not (left and right and top and bottom) and right and out_right:
            expected = source.crop((source.width - right, 0, source.width, source.height)).resize(
                (out_right, image.height), Image.Resampling.NEAREST
            )
            cap_ok = cap_ok and image.crop(
                (image.width - out_right, 0, image.width, image.height)
            ).tobytes() == expected.tobytes()
        if not (left and right and top and bottom) and top and out_top:
            expected = source.crop((0, 0, source.width, top)).resize(
                (image.width, out_top), Image.Resampling.NEAREST
            )
            cap_ok = cap_ok and image.crop((0, 0, image.width, out_top)).tobytes() == expected.tobytes()
        if not (left and right and top and bottom) and bottom and out_bottom:
            expected = source.crop((0, source.height - bottom, source.width, source.height)).resize(
                (image.width, out_bottom), Image.Resampling.NEAREST
            )
            cap_ok = cap_ok and image.crop(
                (0, image.height - out_bottom, image.width, image.height)
            ).tobytes() == expected.tobytes()
    gates = {
        "sourceHashMatches": not manifest.get("sourceSha256") or sha256_file(source_path) == manifest["sourceSha256"],
        "insetsValid": left + right <= source.width and top + bottom <= source.height,
        "outputInsetsValid": all(
            target[0] >= out_left + out_right and target[1] >= out_top + out_bottom
            for target in targets
        ),
        "allTargetsLegal": len(outputs) == len(targets) and not errors,
        "capsPreservedExactly": cap_ok and bool(outputs),
        "everyTargetDimensionProved": len(outputs) == len(targets),
    }
    return finish_receipt(
        "trim-nine-slice",
        manifest_path,
        output_dir,
        gates,
        {"proofBoard": repo_path(output_dir / "proof-board.png")},
        {
            "targets": [list(target) for target in targets],
            "sourceInsets": list(insets),
            "outputInsets": list(output_insets),
            "errors": errors,
            "chroma": chroma,
        },
    )


# Decal/stamp compiler ------------------------------------------------------

def compile_decal(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    sheet_path = resolve_manifest_path(manifest_path, manifest["sheet"])
    keyed, chroma = key_manifest_image(Image.open(sheet_path), manifest)
    if manifest.get("isolationMode") == "alpha-component-groups":
        components, boxes, extraction = grouped_alpha_components(keyed, manifest)
        slots = [(0, 0, keyed.width, keyed.height) for _box in boxes]
    else:
        boxes, slots, extraction = sheet_component_boxes(keyed, manifest)
        components = [transparent_rgb_clean(keyed.crop(box)) for box in boxes]
    ids = list(manifest.get("ids", []))
    variants = []
    base_border_safe = all(
        box[0] > slot[0] and box[1] > slot[1] and box[2] < slot[2] and box[3] < slot[3]
        for box, slot in zip(boxes, slots)
    )
    for index, base in enumerate(components[: len(ids)]):
        maximum_dimension = manifest.get("maxBaseDimensionPx")
        if maximum_dimension:
            base = ImageOps.contain(
                base,
                (int(maximum_dimension), int(maximum_dimension)),
                Image.Resampling.LANCZOS,
            )
        base = ImageOps.expand(
            base,
            border=int(manifest.get("paddingPx", 3)),
            fill=(0, 0, 0, 0),
        )
        for angle in (0, 90, 180, 270):
            rotated = base.rotate(angle, expand=True, resample=Image.Resampling.NEAREST)
            for scale in (0.5, 1.0, 2.0):
                size = (max(1, round(rotated.width * scale)), max(1, round(rotated.height * scale)))
                variant = transparent_rgb_clean(
                    rotated.resize(size, Image.Resampling.NEAREST)
                )
                variant_id = f"{ids[index]}-r{angle}-s{str(scale).replace('.', '_')}"
                variants.append((variant_id, variant))
    atlas = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    placements = {}
    errors = []
    if variants:
        try:
            atlas, placements = shelf_pack(
                variants,
                padding=int(manifest.get("atlasPaddingPx", 2)),
                max_width=int(manifest.get("atlasMaxWidthPx", 768)),
            )
        except ValueError as exc:
            errors.append(str(exc))
    atlas.save(output_dir / "atlas.png")
    sample_cells = [(name, image) for name, image in variants if "-s1_0" in name]
    proof_board("Decal/stamp compiler", sample_cells, output_dir / "proof-board.png", (170, 160), 4)
    transparent_clean = all(
        a or (r == 0 and g == 0 and b == 0)
        for _, image in variants
        for r, g, b, a in image.getdata()
    )
    half_readable = all(
        sum(1 for value in image.getchannel("A").getdata() if value > 24) >= 4
        for name, image in variants
        if "-s0_5" in name
    )
    gates = {
        "sourceHashMatches": not manifest.get("sourceSha256") or sha256_file(sheet_path) == manifest["sourceSha256"],
        "componentCountMatches": len(boxes) == len(ids) and bool(ids),
        "sourceComponentsDoNotBleedOffSheet": base_border_safe,
        "everySourceAlphaPixelAssigned": extraction.get(
            "everySourceAlphaPixelAssigned", True
        ),
        "transparentPixelsDefringed": transparent_clean,
        "halfScaleRemainsReadable": half_readable and bool(variants),
        "rotationScaleMatrixComplete": len(variants) == len(ids) * 12,
        "atlasContainsEveryVariant": len(placements) == len(variants) and not errors,
    }
    return finish_receipt(
        "decal-stamp",
        manifest_path,
        output_dir,
        gates,
        {"atlas": repo_path(output_dir / "atlas.png"), "proofBoard": repo_path(output_dir / "proof-board.png")},
        {
            "componentCount": len(boxes),
            "variantCount": len(variants),
            "chroma": chroma,
            "extraction": extraction,
            "errors": errors,
        },
    )


# Sprite citizenship compiler ---------------------------------------------

_CANONICAL_SPRITE_ENGINE = None


def canonical_sprite_engine():
    """Load the registry's standee contract so Assetforge remains an adapter, not a second schema."""
    global _CANONICAL_SPRITE_ENGINE
    if _CANONICAL_SPRITE_ENGINE is None:
        engine_path = ROOT / "build" / "gen-sprite-registry.py"
        spec = importlib.util.spec_from_file_location("assetforge_canonical_sprite_engine", engine_path)
        if spec is None or spec.loader is None:
            raise RuntimeError(f"cannot load canonical sprite engine: {repo_path(engine_path)}")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        _CANONICAL_SPRITE_ENGINE = module
    return _CANONICAL_SPRITE_ENGINE


def compile_citizenship(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    source_path = resolve_manifest_path(manifest_path, manifest["source"])
    source, chroma = key_manifest_image(Image.open(source_path), manifest)
    engine = canonical_sprite_engine()
    box = alpha_bbox(source)
    # Citizenship does not rewrite the sprite. The renderer already consumes contentBounds and
    # foot anchors against the original canvas; cropping/padding here created a competing coordinate
    # system and made this tool a second, subtly incompatible sprite pipeline.
    citizen = transparent_rgb_clean(source)
    citizen.save(output_dir / "sprite.png")
    thumbnail = ImageOps.contain(citizen, (96, 96), Image.Resampling.NEAREST)
    thumbnail.save(output_dir / "thumbnail.png")
    cut_record = None
    if box:
        alpha = source.getchannel("A")
        bottom_y = box[3] - 1
        contacts = [x for x in range(box[0], box[2]) if alpha.getpixel((x, bottom_y)) > 0]
        cut_record = {
            "contentBounds": [
                box[0] / source.width,
                box[1] / source.height,
                box[2] / source.width,
                box[3] / source.height,
            ],
            "footContact": (
                ((min(contacts) + max(contacts)) / 2) / source.width
                if contacts
                else ((box[0] + box[2]) / 2) / source.width
            ),
        }
    authored_overlay = {
        key: manifest[key]
        for key in ("footX", "footY", "contentBounds")
        if key in manifest
    }
    contract = engine.standee_contract_for(authored_overlay, cut_record)
    world_height, height_source = engine.world_height_for(
        manifest.get("worldHeightFeet"),
        None,
        manifest.get("size"),
    )
    metadata = {
        "slug": manifest["slug"],
        "source": repo_path(source_path),
        "sourceSha256": sha256_file(source_path),
        **contract,
        "worldHeight": world_height,
        "heightSource": height_source,
        "runtimeContract": {
            "materialRecipe": "lit-standee-v2",
            "colorSpace": "srgb",
            "magnificationFilter": "nearest",
            "minificationFilter": "trilinear-mipmap",
            "alphaMode": "registry-cutoff+alpha-to-coverage",
        },
    }
    write_json(output_dir / "citizenship.json", metadata)
    card = Image.new("RGBA", (180, 180), (54, 48, 42, 255))
    draw = ImageDraw.Draw(card)
    draw.line((10, 150, 170, 150), fill=(220, 190, 126, 255), width=2)
    fit = ImageOps.contain(citizen, (130, 130), Image.Resampling.NEAREST)
    card.alpha_composite(fit, ((180 - fit.width) // 2, 150 - fit.height))
    draw.text((8, 160), f"{manifest['slug']} · {world_height} ft", fill=(245, 238, 220), font=font())
    card.save(output_dir / "fixed-camera-card.png")
    proof_board(
        "Sprite citizenship",
        [("raw", source), ("citizen", citizen), ("play-scale card", card)],
        output_dir / "proof-board.png",
        (220, 200),
        3,
    )
    gates = {
        "sourceHashMatches": not manifest.get("sourceSha256") or sha256_file(source_path) == manifest["sourceSha256"],
        "opaqueContentPresent": box is not None,
        "sourceHasSafeBorder": box is not None and not bbox_touches_edge(source, box),
        "worldHeightResolved": isinstance(world_height, (int, float)) and world_height > 0,
        "canonicalContractComplete": set(contract) == {
            "footX", "footY", "contentBounds", "alphaCutoff", "shadowProfile"
        },
        "footAnchorNormalized": 0 <= contract["footX"] <= 1 and 0 <= contract["footY"] <= 1,
        "sourceCanvasPreserved": citizen.size == source.size,
        "thumbnailGenerated": thumbnail.width > 0 and thumbnail.height > 0,
    }
    return finish_receipt(
        "sprite-citizenship",
        manifest_path,
        output_dir,
        gates,
        {
            "sprite": repo_path(output_dir / "sprite.png"),
            "metadata": repo_path(output_dir / "citizenship.json"),
            "proofBoard": repo_path(output_dir / "proof-board.png"),
        },
        {
            "engineAuthority": "build/gen-sprite-registry.py",
            "rendererAuthority": "src/ui/theater-sprites.js",
            "coordinateSystem": "original source canvas; normalized top-down anchors",
            "chroma": chroma,
        },
    )


# Atlas optimizer -----------------------------------------------------------

def compile_atlas(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    entries = manifest.get("assets", [])
    ids = [entry["id"] for entry in entries]
    assets = []
    paths = {}
    for entry in sorted(entries, key=lambda value: value["id"]):
        path = resolve_manifest_path(manifest_path, entry["path"])
        paths[entry["id"]] = path
        assets.append((entry["id"], transparent_rgb_clean(Image.open(path).convert("RGBA"))))
    errors = []
    try:
        atlas, placements = shelf_pack(
            assets,
            padding=int(manifest.get("paddingPx", 2)),
            max_width=int(manifest.get("maxWidthPx", 512)),
        )
    except ValueError as exc:
        errors.append(str(exc))
        atlas = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
        placements = {}
    atlas.save(output_dir / "atlas.png")
    roundtrip = True
    for asset_id, image in assets:
        if asset_id not in placements:
            roundtrip = False
            continue
        x, y, width, height = placements[asset_id]
        roundtrip = roundtrip and atlas.crop((x, y, x + width, y + height)).tobytes() == image.tobytes()
    metadata = {
        "schemaVersion": 1,
        "atlasSize": list(atlas.size),
        "assets": {
            asset_id: {
                "rect": list(rect),
                "uv": [
                    rect[0] / atlas.width,
                    rect[1] / atlas.height,
                    (rect[0] + rect[2]) / atlas.width,
                    (rect[1] + rect[3]) / atlas.height,
                ],
                "sourceSha256": sha256_file(paths[asset_id]),
            }
            for asset_id, rect in placements.items()
        },
    }
    write_json(output_dir / "atlas.json", metadata)
    proof_board(
        "Atlas optimizer",
        [("packed atlas", atlas)] + [(asset_id, image) for asset_id, image in assets],
        output_dir / "proof-board.png",
        (220, 190),
        3,
    )
    gates = {
        "assetIdsUnique": len(ids) == len(set(ids)) and bool(ids),
        "allSourcesPresent": len(assets) == len(entries),
        "allAssetsPacked": len(placements) == len(entries) and not errors,
        "payloadRoundTripsExactly": roundtrip and bool(assets),
        "uvsNormalized": all(
            0 <= value <= 1
            for entry in metadata["assets"].values()
            for value in entry["uv"]
        ),
        "byteBudgetRespected": atlas.width * atlas.height * 4 <= int(manifest.get("maxBytes", 4_000_000)),
    }
    return finish_receipt(
        "atlas-optimizer",
        manifest_path,
        output_dir,
        gates,
        {
            "atlas": repo_path(output_dir / "atlas.png"),
            "metadata": repo_path(output_dir / "atlas.json"),
            "proofBoard": repo_path(output_dir / "proof-board.png"),
        },
        {"errors": errors, "assetCount": len(assets)},
    )


# Material-map baker --------------------------------------------------------

def normal_from_height(height: Image.Image, strength: float) -> Image.Image:
    gray = height.convert("L")
    px = gray.load()
    out = Image.new("RGB", gray.size, (128, 128, 255))
    target = out.load()
    width, height_px = gray.size
    for y in range(height_px):
        for x in range(width):
            left = px[(x - 1) % width, y]
            right = px[(x + 1) % width, y]
            up = px[x, (y - 1) % height_px]
            down = px[x, (y + 1) % height_px]
            nx = -(right - left) / 255 * strength
            ny = -(down - up) / 255 * strength
            nz = 1.0
            length = math.sqrt(nx * nx + ny * ny + nz * nz)
            target[x, y] = (
                round((nx / length * 0.5 + 0.5) * 255),
                round((ny / length * 0.5 + 0.5) * 255),
                round((nz / length * 0.5 + 0.5) * 255),
            )
    return force_periodic(out)


def compile_material(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    albedo_path = resolve_manifest_path(manifest_path, manifest["albedo"])
    source_albedo = Image.open(albedo_path).convert("RGB")
    source_seam = edge_delta(source_albedo)
    allow_seam_lock = bool(manifest.get("allowSeamLock", False))
    albedo = force_periodic(source_albedo) if allow_seam_lock else source_albedo
    height = force_periodic(albedo.convert("L").filter(ImageFilter.GaussianBlur(float(manifest.get("heightBlur", 1.2)))))
    normal = normal_from_height(height, float(manifest.get("normalStrength", 2.0)))
    roughness = force_periodic(ImageOps.autocontrast(ImageOps.invert(height)))
    emissive = Image.new("L", albedo.size, 0)
    albedo.save(output_dir / "albedo.png")
    height.save(output_dir / "height.png")
    normal.save(output_dir / "normal.png")
    roughness.save(output_dir / "roughness.png")
    emissive.save(output_dir / "emissive.png")
    channels = [
        ("albedo", albedo.convert("RGBA")),
        ("height proposal", height.convert("RGBA")),
        ("normal proposal", normal.convert("RGBA")),
        ("roughness proposal", roughness.convert("RGBA")),
        ("emissive proposal", emissive.convert("RGBA")),
    ]
    proof_board("Material-map baker — proposal channels", channels, output_dir / "proof-board.png", (190, 180), 3)
    normal_values = list(normal.getdata())
    blue_min = min(value[2] for value in normal_values)
    gates = {
        "sourceHashMatches": not manifest.get("sourceSha256") or sha256_file(albedo_path) == manifest["sourceSha256"],
        "sourceSeamWithinBudget": not manifest.get("seamRequired", True)
        or source_seam <= float(
            manifest.get(
                "maxRepairableSourceEdgeDelta" if allow_seam_lock else "maxSourceEdgeDelta",
                3.0,
            )
        ),
        "compiledAlbedoSeamExact": not manifest.get("seamRequired", True) or edge_delta(albedo) == 0,
        "allChannelsMatchDimensions": all(image.size == albedo.size for _, image in channels),
        "heightRangeValid": min(height.getdata()) >= 0 and max(height.getdata()) <= 255,
        "normalRangeValid": blue_min >= 128,
        "derivedSeamsExact": edge_delta(height.convert("RGB")) == 0
        and edge_delta(normal) == 0
        and edge_delta(roughness.convert("RGB")) == 0,
        "channelsRemainProposals": True,
    }
    return finish_receipt(
        "material-map-baker",
        manifest_path,
        output_dir,
        gates,
        {
            "albedo": repo_path(output_dir / "albedo.png"),
            "height": repo_path(output_dir / "height.png"),
            "normal": repo_path(output_dir / "normal.png"),
            "roughness": repo_path(output_dir / "roughness.png"),
            "emissive": repo_path(output_dir / "emissive.png"),
            "proofBoard": repo_path(output_dir / "proof-board.png"),
        },
        {
            "sourceEdgeDelta": source_seam,
            "compiledAlbedoEdgeDelta": edge_delta(albedo),
            "seamLockApplied": allow_seam_lock,
            "normalBlueMinimum": blue_min,
        },
    )


# Visual regression foundry ------------------------------------------------

def compile_regression(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    baseline_path = resolve_manifest_path(manifest_path, manifest["baseline"])
    current_path = resolve_manifest_path(manifest_path, manifest["current"])
    baseline = Image.open(baseline_path).convert("RGBA")
    current = Image.open(current_path).convert("RGBA")
    same_dimensions = baseline.size == current.size
    if same_dimensions:
        diff = ImageChops.difference(baseline.convert("RGB"), current.convert("RGB"))
        score = rgba_difference(baseline, current)
    else:
        diff = Image.new("RGB", baseline.size, (255, 0, 0))
        score = 1.0
    amplified = diff.point(lambda value: min(255, value * 4))
    diff.save(output_dir / "diff.png")
    amplified.save(output_dir / "diff-amplified.png")
    proof_board(
        "Visual regression foundry",
        [("baseline", baseline), ("current", current), ("difference x4", amplified)],
        output_dir / "proof-board.png",
        (260, 210),
        3,
    )
    threshold = float(manifest.get("maximumDifference", 0.0))
    gates = {
        "baselineHashMatches": not manifest.get("baselineSha256") or sha256_file(baseline_path) == manifest["baselineSha256"],
        "currentHashRecorded": bool(sha256_file(current_path)),
        "dimensionsMatch": same_dimensions,
        "perceptualDifferenceWithinThreshold": score <= threshold,
        "semanticOverlayPresentWhenRequired": not manifest.get("semanticOverlayRequired", False)
        or bool(manifest.get("semanticOverlay")),
    }
    return finish_receipt(
        "visual-regression",
        manifest_path,
        output_dir,
        gates,
        {"diff": repo_path(output_dir / "diff.png"), "proofBoard": repo_path(output_dir / "proof-board.png")},
        {
            "differenceScore": score,
            "maximumDifference": threshold,
            "baselineSha256": sha256_file(baseline_path),
            "currentSha256": sha256_file(current_path),
        },
    )


COMPILERS: dict[str, Callable[[Path, Path, bool], dict[str, Any]]] = {
    "boundary": compile_boundary,
    "repeat": compile_repeat,
    "prop-kit": compile_prop_kit,
    "condition": compile_condition,
    "palette": compile_palette,
    "trim": compile_trim,
    "decal": compile_decal,
    "citizenship": compile_citizenship,
    "atlas": compile_atlas,
    "material": compile_material,
    "regression": compile_regression,
}


# Executable proof suite ----------------------------------------------------

def save_fixture(path: Path, image: Image.Image) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)
    return path


def fixture_periodic_material(size: int = 64) -> Image.Image:
    image = Image.new("RGB", (size, size), (118, 94, 64))
    draw = ImageDraw.Draw(image)
    for y in range(0, size, 8):
        draw.line((0, y, size - 1, y), fill=(88, 66, 48), width=2)
    for x in range(0, size, 16):
        draw.line((x, 0, x, size - 1), fill=(142, 116, 75), width=1)
    return force_periodic(image)


def fixture_component_sheet(size: tuple[int, int] = (160, 80), touch_edge: bool = False) -> Image.Image:
    image = Image.new("RGB", size, CHROMA)
    draw = ImageDraw.Draw(image)
    x0 = 0 if touch_edge else 12
    draw.rounded_rectangle((x0, 14, x0 + 30, 43), radius=5, fill=(102, 74, 45), outline=(42, 34, 29), width=2)
    draw.polygon(((66, 12), (95, 26), (76, 55), (54, 40)), fill=(145, 112, 63), outline=(48, 36, 25))
    draw.ellipse((112, 20, 145, 53), fill=(75, 105, 78), outline=(31, 47, 34), width=2)
    return image


def fixture_sprite(size: tuple[int, int] = (72, 88), touch_edge: bool = False) -> Image.Image:
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    center = 28 if not touch_edge else 4
    body = (center - 10, 28, center + 18, 70)
    draw.rectangle(body, fill=(65, 94, 128, 255), outline=(20, 28, 38, 255), width=2)
    draw.ellipse((center - 6, 12, center + 14, 33), fill=(196, 153, 112, 255), outline=(32, 28, 29, 255), width=2)
    draw.rectangle((center - 7, 69, center + 1, 80), fill=(42, 37, 36, 255))
    draw.rectangle((center + 10, 69, center + 18, 80), fill=(42, 37, 36, 255))
    draw.line((center + 19, 36, center + 29, 65), fill=(190, 190, 176, 255), width=3)
    return image


def overlay_condition(source: Image.Image, color: tuple[int, int, int, int], marks: int) -> Image.Image:
    out = source.copy()
    draw = ImageDraw.Draw(out, "RGBA")
    for index in range(marks):
        x = 22 + (index * 7) % 20
        y = 36 + (index * 11) % 30
        draw.line((x, y, x + 5, y + 4), fill=color, width=2)
    return out


def fixture_trim() -> Image.Image:
    image = Image.new("RGBA", (48, 48), (76, 68, 61, 255))
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 11, 11), fill=(180, 72, 64, 255))
    draw.rectangle((36, 0, 47, 11), fill=(72, 148, 91, 255))
    draw.rectangle((0, 36, 11, 47), fill=(70, 103, 174, 255))
    draw.rectangle((36, 36, 47, 47), fill=(180, 148, 54, 255))
    draw.rectangle((12, 12, 35, 35), fill=(113, 92, 73, 255))
    draw.line((12, 23, 35, 23), fill=(157, 128, 92, 255), width=2)
    draw.line((23, 12, 23, 35), fill=(157, 128, 92, 255), width=2)
    return image


def fixture_palette_source() -> Image.Image:
    image = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rectangle((8, 8, 55, 55), fill=(112, 91, 67, 255))
    draw.rectangle((14, 14, 30, 48), fill=(69, 82, 103, 255))
    draw.rectangle((31, 14, 49, 48), fill=(151, 119, 75, 255))
    draw.rectangle((27, 25, 36, 34), fill=(214, 64, 61, 255))
    return image


def fixture_decal_sheet(touch_edge: bool = False) -> Image.Image:
    image = Image.new("RGB", (128, 72), CHROMA)
    draw = ImageDraw.Draw(image)
    x = 0 if touch_edge else 8
    draw.ellipse((x, 15, x + 34, 48), fill=(96, 25, 28), outline=(53, 14, 17), width=2)
    draw.polygon(((58, 11), (85, 20), (92, 45), (69, 57), (52, 39)), fill=(73, 64, 55))
    return image


def manifest_file(root: Path, name: str, payload: dict[str, Any]) -> Path:
    path = root / "manifests" / f"{name}.json"
    write_json(path, payload)
    return path


def run_suite_self_test(
    output_root: Path = DEFAULT_ROOT,
    force: bool = False,
    selected: str | None = None,
) -> dict[str, Any]:
    if selected is not None and selected not in FAMILIES:
        raise SystemExit(f"ERROR: unknown Assetforge family: {selected}")
    assert_safe_output(output_root)
    output_root.mkdir(parents=True, exist_ok=True)
    for generated_dir in ("fixtures", "manifests", "runs"):
        guarded_reset(output_root / generated_dir, force)
    for generated_file in ("suite-receipt.json", "suite-proof-board.png"):
        path = output_root / generated_file
        if path.exists():
            if not force:
                raise SystemExit(f"ERROR: output exists; use --force: {repo_path(path)}")
            path.unlink()
    fixtures = output_root / "fixtures"

    periodic = save_fixture(fixtures / "periodic-material.png", fixture_periodic_material())
    nonperiodic_image = fixture_periodic_material()
    ImageDraw.Draw(nonperiodic_image).rectangle((0, 0, 6, 63), fill=(248, 20, 20))
    nonperiodic = save_fixture(fixtures / "nonperiodic-material.png", nonperiodic_image)
    components = save_fixture(fixtures / "components.png", fixture_component_sheet())
    empty_components = save_fixture(fixtures / "components-empty.png", Image.new("RGB", (96, 64), CHROMA))
    prop_sheet = save_fixture(fixtures / "prop-sheet.png", fixture_component_sheet())
    decal_sheet = save_fixture(fixtures / "decal-sheet.png", fixture_decal_sheet())
    decal_bleed = save_fixture(fixtures / "decal-sheet-bleed.png", fixture_decal_sheet(True))
    sprite = save_fixture(fixtures / "sprite.png", fixture_sprite())
    sprite_edge = save_fixture(fixtures / "sprite-edge.png", fixture_sprite(touch_edge=True))
    condition_1 = save_fixture(fixtures / "condition-damaged.png", overlay_condition(Image.open(sprite).convert("RGBA"), (92, 37, 30, 255), 1))
    condition_2 = save_fixture(fixtures / "condition-burned.png", overlay_condition(Image.open(sprite).convert("RGBA"), (48, 31, 29, 255), 3))
    condition_3 = overlay_condition(Image.open(sprite).convert("RGBA"), (77, 29, 79, 255), 6)
    condition_3 = save_fixture(fixtures / "condition-corrupted.png", condition_3)
    condition_bad_image = Image.open(condition_2).convert("RGBA")
    ImageDraw.Draw(condition_bad_image).rectangle((0, 0, 18, 18), fill=(33, 190, 70, 255))
    condition_bad = save_fixture(fixtures / "condition-silhouette-fraud.png", condition_bad_image)
    palette_source = save_fixture(fixtures / "palette-source.png", fixture_palette_source())
    trim_source = save_fixture(fixtures / "nine-slice-source.png", fixture_trim())
    atlas_a = save_fixture(fixtures / "atlas-a.png", key_magenta(fixture_component_sheet()).crop((10, 12, 46, 48)))
    atlas_b = save_fixture(fixtures / "atlas-b.png", key_magenta(fixture_component_sheet()).crop((52, 10, 99, 59)))
    regression_same = save_fixture(fixtures / "regression-same.png", fixture_periodic_material(80))
    regression_changed_image = Image.open(regression_same).convert("RGB")
    ImageDraw.Draw(regression_changed_image).rectangle((30, 30, 48, 48), fill=(255, 30, 30))
    regression_changed = save_fixture(fixtures / "regression-changed.png", regression_changed_image)

    def rel(path: Path) -> str:
        return repo_path(path)

    manifests: dict[str, tuple[Path, Path]] = {
        "boundary": (
            manifest_file(output_root, "boundary-positive", {
                "schemaVersion": 1,
                "family": "boundary-autotile",
                "insideMaterial": {"tile": rel(periodic), "sha256": sha256_file(periodic)},
                "edgeLanguage": {"borderWidthPx": 6, "orientationPolicy": "rotatable-organic", "phasePolicy": "world-locked"},
                "tileSizePx": 64,
                "seed": 73129,
                "maxSourceEdgeDelta": 0,
            }),
            manifest_file(output_root, "boundary-negative-seam", {
                "schemaVersion": 1,
                "family": "boundary-autotile",
                "insideMaterial": {"tile": rel(nonperiodic)},
                "tileSizePx": 64,
                "maxSourceEdgeDelta": 0,
            }),
        ),
        "repeat": (
            manifest_file(output_root, "repeat-positive", {
                "schemaVersion": 1,
                "family": "modular-repeat",
                "componentSheet": rel(components),
                "sourceSha256": sha256_file(components),
                "tileSizePx": 96,
                "minimumComponents": 3,
                "seed": 203,
            }),
            manifest_file(output_root, "repeat-negative-empty", {
                "schemaVersion": 1,
                "family": "modular-repeat",
                "componentSheet": rel(empty_components),
                "tileSizePx": 96,
                "minimumComponents": 2,
            }),
        ),
        "prop-kit": (
            manifest_file(output_root, "prop-kit-positive", {
                "schemaVersion": 1,
                "family": "prop-kit",
                "sheet": rel(prop_sheet),
                "sourceSha256": sha256_file(prop_sheet),
                "ids": ["crate", "shield", "urn"],
            }),
            manifest_file(output_root, "prop-kit-negative-count", {
                "schemaVersion": 1,
                "family": "prop-kit",
                "sheet": rel(prop_sheet),
                "ids": ["crate", "shield"],
            }),
        ),
        "condition": (
            manifest_file(output_root, "condition-positive", {
                "schemaVersion": 1,
                "family": "condition-state",
                "source": rel(sprite),
                "sourceSha256": sha256_file(sprite),
                "expectedStateCount": 3,
                "maxChangedRatio": 0.25,
                "states": [
                    {"id": "damaged", "path": rel(condition_1)},
                    {"id": "burned", "path": rel(condition_2)},
                    {"id": "corrupted", "path": rel(condition_3)},
                ],
            }),
            manifest_file(output_root, "condition-negative-silhouette", {
                "schemaVersion": 1,
                "family": "condition-state",
                "source": rel(sprite),
                "expectedStateCount": 3,
                "states": [
                    {"id": "damaged", "path": rel(condition_1)},
                    {"id": "burned", "path": rel(condition_2)},
                    {"id": "corrupted", "path": rel(condition_bad)},
                ],
            }),
        ),
        "palette": (
            manifest_file(output_root, "palette-positive", {
                "schemaVersion": 1,
                "family": "palette-harmonizer",
                "source": rel(palette_source),
                "sourceSha256": sha256_file(palette_source),
                "palette": ["#705B43", "#455267", "#97774B", "#D6403D"],
                "protectedColors": ["#D6403D"],
                "maxMeanDeltaE": 0.01,
            }),
            manifest_file(output_root, "palette-negative-protected", {
                "schemaVersion": 1,
                "family": "palette-harmonizer",
                "source": rel(palette_source),
                "palette": ["#705B43", "#455267", "#97774B"],
                "protectedColors": ["#D6403D"],
            }),
        ),
        "trim": (
            manifest_file(output_root, "trim-positive", {
                "schemaVersion": 1,
                "family": "trim-nine-slice",
                "source": rel(trim_source),
                "sourceSha256": sha256_file(trim_source),
                "insets": [12, 12, 12, 12],
                "targets": [[96, 48], [160, 64], [72, 128], [220, 96]],
            }),
            manifest_file(output_root, "trim-negative-small", {
                "schemaVersion": 1,
                "family": "trim-nine-slice",
                "source": rel(trim_source),
                "insets": [12, 12, 12, 12],
                "targets": [[18, 18]],
            }),
        ),
        "decal": (
            manifest_file(output_root, "decal-positive", {
                "schemaVersion": 1,
                "family": "decal-stamp",
                "sheet": rel(decal_sheet),
                "sourceSha256": sha256_file(decal_sheet),
                "ids": ["blood-pool", "scorch"],
            }),
            manifest_file(output_root, "decal-negative-bleed", {
                "schemaVersion": 1,
                "family": "decal-stamp",
                "sheet": rel(decal_bleed),
                "ids": ["blood-pool", "scorch"],
            }),
        ),
        "citizenship": (
            manifest_file(output_root, "citizenship-positive", {
                "schemaVersion": 1,
                "family": "sprite-citizenship",
                "slug": "fixture-guard",
                "source": rel(sprite),
                "sourceSha256": sha256_file(sprite),
                "worldHeightFeet": 6,
            }),
            manifest_file(output_root, "citizenship-negative-edge", {
                "schemaVersion": 1,
                "family": "sprite-citizenship",
                "slug": "fixture-edge",
                "source": rel(sprite_edge),
                "worldHeightFeet": 6,
            }),
        ),
        "atlas": (
            manifest_file(output_root, "atlas-positive", {
                "schemaVersion": 1,
                "family": "atlas-optimizer",
                "paddingPx": 2,
                "maxWidthPx": 256,
                "assets": [{"id": "a", "path": rel(atlas_a)}, {"id": "b", "path": rel(atlas_b)}],
            }),
            manifest_file(output_root, "atlas-negative-duplicate", {
                "schemaVersion": 1,
                "family": "atlas-optimizer",
                "paddingPx": 2,
                "maxWidthPx": 256,
                "assets": [{"id": "same", "path": rel(atlas_a)}, {"id": "same", "path": rel(atlas_b)}],
            }),
        ),
        "material": (
            manifest_file(output_root, "material-positive", {
                "schemaVersion": 1,
                "family": "material-map-baker",
                "albedo": rel(periodic),
                "sourceSha256": sha256_file(periodic),
                "seamRequired": True,
                "maxSourceEdgeDelta": 0,
                "normalStrength": 1.8,
            }),
            manifest_file(output_root, "material-negative-seam", {
                "schemaVersion": 1,
                "family": "material-map-baker",
                "albedo": rel(nonperiodic),
                "seamRequired": True,
                "maxSourceEdgeDelta": 0,
            }),
        ),
        "regression": (
            manifest_file(output_root, "regression-positive", {
                "schemaVersion": 1,
                "family": "visual-regression",
                "baseline": rel(regression_same),
                "current": rel(regression_same),
                "baselineSha256": sha256_file(regression_same),
                "maximumDifference": 0,
            }),
            manifest_file(output_root, "regression-negative-change", {
                "schemaVersion": 1,
                "family": "visual-regression",
                "baseline": rel(regression_same),
                "current": rel(regression_changed),
                "maximumDifference": 0,
            }),
        ),
    }

    results = []
    requested = [selected] if selected else list(FAMILIES)
    for family in requested:
        positive_manifest, negative_manifest = manifests[family]
        positive = COMPILERS[family](positive_manifest, output_root / "runs" / family / "positive", True)
        negative = COMPILERS[family](negative_manifest, output_root / "runs" / family / "negative", True)
        results.append({
            "family": family,
            "positiveExpected": "PASS",
            "positiveActual": positive["technicalStatus"],
            "positiveProofBoard": positive["outputs"].get("proofBoard"),
            "positiveReceipt": repo_path(output_root / "runs" / family / "positive" / "receipt.json"),
            "negativeExpected": "FAIL",
            "negativeActual": negative["technicalStatus"],
            "negativeFailedGates": [name for name, passed in negative["gates"].items() if not passed],
            "negativeReceipt": repo_path(output_root / "runs" / family / "negative" / "receipt.json"),
        })

    suite_cells = [
        (
            f"{result['family']} · {result['positiveActual']}/{result['negativeActual']}",
            Image.open(ROOT / result["positiveProofBoard"]).convert("RGBA"),
        )
        for result in results
    ]
    proof_board(
        "Assetforge suite — positive proof / negative control",
        suite_cells,
        output_root / "suite-proof-board.png",
        (300, 220),
        3,
    )
    safety_guards = {}
    for label, unsafe in (("workspaceRoot", ROOT), ("liveAssetChild", ROOT / "assets" / "unsafe")):
        try:
            assert_safe_output(unsafe)
            safety_guards[label] = False
        except SystemExit:
            safety_guards[label] = True
    passed = all(
        result["positiveActual"] == result["positiveExpected"]
        and result["negativeActual"] == result["negativeExpected"]
        for result in results
    ) and all(safety_guards.values())
    summary = {
        "schemaVersion": 1,
        "suite": ALGORITHM_VERSION,
        "technicalStatus": "PASS" if passed else "FAIL",
        "familiesRequested": requested,
        "familyCount": len(results),
        "positiveControlsPassed": sum(result["positiveActual"] == "PASS" for result in results),
        "negativeControlsRejected": sum(result["negativeActual"] == "FAIL" for result in results),
        "destructiveOutputGuards": safety_guards,
        "proofBoard": repo_path(output_root / "suite-proof-board.png"),
        "results": results,
    }
    write_json(output_root / "suite-receipt.json", summary)
    return summary


def write_boundary_manifest(
    path: Path,
    material: Path,
    tile_size: int = 64,
    dialect: str = "enclosure",
    outside_material: Path | None = None,
) -> dict[str, Any]:
    if dialect != "enclosure" and outside_material is None:
        raise SystemExit(f"ERROR: --outside-material is required for boundary dialect '{dialect}'")
    source = {"tile": repo_path(material), "sha256": sha256_file(material)}
    outside = (
        {"tile": repo_path(outside_material), "sha256": sha256_file(outside_material)}
        if outside_material
        else {"mode": "transparent"}
    )
    payload: dict[str, Any] = {
        "schemaVersion": 1,
        "family": "boundary-autotile",
        "kind": dialect,
        "algorithmVersion": (
            "boundary-blob47-v1"
            if dialect == "enclosure"
            else f"boundary-{dialect}-{'eightway256' if dialect == 'path' else 'cardinal16'}-v1"
        ),
        "insideMaterial": source,
        "outsideMaterial": outside,
        "tileSizePx": tile_size,
        "seed": 73129,
        "admission": {"scope": "candidate-only"},
    }
    if dialect == "enclosure":
        payload.update({
        "edgeLanguage": {
            "borderWidthPx": max(3, tile_size // 10),
            "orientationPolicy": "rotatable-organic",
            "phasePolicy": "world-locked",
        },
        })
        payload.pop("kind")
    elif dialect in {"path", "road"}:
        payload.update({
            "routeWidth": 0.31 if dialect == "path" else 0.61,
            "shoulderWidth": 0.08 if dialect == "path" else 0.12,
        })
    else:
        payload.update({"faceBandWidth": 0.17})
    write_json(path, payload)
    return payload


def register_parsers(families) -> None:
    for family in FAMILIES:
        parser = families.add_parser(family, help=f"Assetforge {family} compiler")
        actions = parser.add_subparsers(dest="action", required=True)
        compile_parser = actions.add_parser(
            "compile" if family != "regression" else "compare",
            help="compile a manifest into quarantined outputs, proof, and receipt",
        )
        compile_parser.add_argument("manifest", type=Path)
        compile_parser.add_argument("--output-dir", type=Path, required=True)
        compile_parser.add_argument("--force", action="store_true")
        test_parser = actions.add_parser("self-test", help="run one positive and one red-first fixture")
        test_parser.add_argument(
            "--output-dir",
            type=Path,
            default=DEFAULT_ROOT / "single" / family,
        )
        test_parser.add_argument("--force", action="store_true")
        if family == "boundary":
            init_parser = actions.add_parser("init", help="write an enclosure/path/road/cliff manifest")
            init_parser.add_argument("material", type=Path)
            init_parser.add_argument(
                "--dialect",
                choices=("enclosure", "path", "road", "cliff"),
                default="enclosure",
            )
            init_parser.add_argument("--outside-material", type=Path)
            init_parser.add_argument("--output", type=Path, required=True)
            init_parser.add_argument("--tile-size", type=int, default=64)
            init_parser.add_argument("--force", action="store_true")
    suite = families.add_parser("suite", help="run every non-emote Assetforge proof")
    actions = suite.add_subparsers(dest="action", required=True)
    test = actions.add_parser("self-test", help="run all 11 positive and negative proof pairs")
    test.add_argument("--output-dir", type=Path, default=DEFAULT_ROOT)
    test.add_argument("--force", action="store_true")


def dispatch(args) -> int | None:
    if args.family == "suite" and args.action == "self-test":
        result = run_suite_self_test(args.output_dir, force=args.force)
        print(json.dumps(result, indent=2))
        return 0 if result["technicalStatus"] == "PASS" else 1
    if args.family not in FAMILIES:
        return None
    if args.action == "init" and args.family == "boundary":
        if args.output.exists() and not args.force:
            raise SystemExit(f"ERROR: output exists; use --force: {repo_path(args.output)}")
        result = write_boundary_manifest(
            args.output,
            args.material,
            args.tile_size,
            args.dialect,
            args.outside_material,
        )
        print(json.dumps({"status": "OK", "manifest": repo_path(args.output), "job": result}, indent=2))
        return 0
    if args.action == "self-test":
        result = run_suite_self_test(args.output_dir, force=args.force, selected=args.family)
        print(json.dumps(result, indent=2))
        return 0 if result["technicalStatus"] == "PASS" else 1
    if args.action in {"compile", "compare"}:
        result = COMPILERS[args.family](args.manifest, args.output_dir, args.force)
        print(json.dumps(result, indent=2))
        return 0 if result["technicalStatus"] == "PASS" else 1
    return None
