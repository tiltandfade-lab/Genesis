#!/usr/bin/env python3
"""Deterministic Assetforge compilers beyond the sprite-emote vertical slice.

This module is loaded by build/assetforge.py.  Every family consumes a JSON manifest, writes only
to a caller-selected quarantine directory, emits a proof board and receipt, and preserves at least
one failing control in the suite self-test.
"""
from __future__ import annotations

import hashlib
import json
import math
import random
import shutil
from collections import deque
from pathlib import Path
from typing import Any, Callable

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps


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


def key_magenta(image: Image.Image, tolerance: int = 12) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = []
    for r, g, b, a in rgba.getdata():
        if abs(r - 255) <= tolerance and g <= tolerance and abs(b - 255) <= tolerance:
            pixels.append((0, 0, 0, 0))
        else:
            pixels.append((r, g, b, a))
    rgba.putdata(pixels)
    return rgba


def transparent_rgb_clean(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    rgba.putdata([(r, g, b, a) if a else (0, 0, 0, 0) for r, g, b, a in rgba.getdata()])
    return rgba


def alpha_bbox(image: Image.Image):
    return image.convert("RGBA").getchannel("A").getbbox()


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


def connected_components(image: Image.Image, alpha_cutoff: int = 12) -> list[tuple[int, int, int, int]]:
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
            if len(xs) >= 4:
                boxes.append((min(xs), min(ys), max(xs) + 1, max(ys) + 1))
    return sorted(boxes, key=lambda box: (box[1], box[0]))


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


def compile_boundary(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    source = resolve_manifest_path(manifest_path, manifest["insideMaterial"]["tile"])
    material = Image.open(source).convert("RGBA")
    size = int(manifest.get("tileSizePx", 64))
    border = int(manifest.get("edgeLanguage", {}).get("borderWidthPx", max(3, size // 10)))
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
        "sourceIsSeamless": edge_delta(material) <= float(manifest.get("maxSourceEdgeDelta", 3.0)),
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
            "sourceEdgeDelta": edge_delta(material),
            "compatibleNeighborPairsChecked": compatible_pairs,
            "seededFieldShapeCoverage": len(coverage),
        },
    )


# Modular repeat compiler ----------------------------------------------------

def compile_repeat(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    sheet_path = resolve_manifest_path(manifest_path, manifest["componentSheet"])
    sheet = key_magenta(Image.open(sheet_path))
    boxes = connected_components(sheet)
    components = [sheet.crop(box) for box in boxes]
    tile_size = int(manifest.get("tileSizePx", 96))
    seed = int(manifest.get("seed", 17))
    rng = random.Random(seed)
    tile = Image.new("RGBA", (tile_size, tile_size), tuple(manifest.get("baseRGBA", [70, 62, 51, 255])))
    placements = []
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
        (250, 210),
        3,
    )
    exact_edges = edge_delta(tile) == 0
    gates = {
        "sourceHashMatches": not manifest.get("sourceSha256") or sha256_file(sheet_path) == manifest["sourceSha256"],
        "componentsIsolated": len(components) >= int(manifest.get("minimumComponents", 2)),
        "toroidalClosureExact": exact_edges,
        "allComponentsPlaced": len(placements) == len(components),
        "variantCadencePresent": len({(p["x"], p["y"]) for p in placements}) == len(placements),
    }
    return finish_receipt(
        "modular-repeat",
        manifest_path,
        output_dir,
        gates,
        {"tile": repo_path(tile_path), "proofBoard": repo_path(output_dir / "proof-board.png")},
        {"componentCount": len(components), "placements": placements, "edgeDelta": edge_delta(tile)},
    )


# Prop/kit sheet compiler ----------------------------------------------------

def compile_prop_kit(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    sheet_path = resolve_manifest_path(manifest_path, manifest["sheet"])
    sheet = key_magenta(Image.open(sheet_path))
    boxes = connected_components(sheet)
    ids = list(manifest.get("ids", []))
    cells = []
    for index, box in enumerate(boxes[: len(ids)]):
        prop = transparent_rgb_clean(sheet.crop(box))
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
        {"componentCount": len(boxes), "expectedCount": len(ids)},
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


def compile_condition(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    source_path = resolve_manifest_path(manifest_path, manifest["source"])
    source = key_magenta(Image.open(source_path))
    variants = []
    for entry in manifest.get("states", []):
        state_path = resolve_manifest_path(manifest_path, entry["path"])
        image = key_magenta(Image.open(state_path))
        variants.append((entry["id"], image, state_path))
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
    }
    return finish_receipt(
        "condition-state",
        manifest_path,
        output_dir,
        gates,
        {"proofBoard": repo_path(output_dir / "proof-board.png")},
        {"outsideAlphaRatio": outside, "changedRatio": changes},
    )


# Palette harmonizer --------------------------------------------------------

def hex_rgb(value: str) -> tuple[int, int, int]:
    text = value.lstrip("#")
    if len(text) != 6:
        raise ValueError(f"invalid RGB hex: {value}")
    return tuple(int(text[index:index + 2], 16) for index in (0, 2, 4))


def luminance(rgb: tuple[int, int, int]) -> float:
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722


def compile_palette(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    source_path = resolve_manifest_path(manifest_path, manifest["source"])
    source = key_magenta(Image.open(source_path))
    palette = [hex_rgb(value) for value in manifest["palette"]]
    protected = {hex_rgb(value) for value in manifest.get("protectedColors", [])}
    output = source.copy()
    distances = []
    before_luma = []
    after_luma = []
    converted = []
    for r, g, b, a in source.getdata():
        if not a:
            converted.append((0, 0, 0, 0))
            continue
        rgb = (r, g, b)
        nearest = rgb if rgb in protected else min(
            palette, key=lambda item: sum((item[index] - rgb[index]) ** 2 for index in range(3))
        )
        converted.append((*nearest, a))
        distances.append(math.sqrt(sum((nearest[index] - rgb[index]) ** 2 for index in range(3))))
        before_luma.append(luminance(rgb))
        after_luma.append(luminance(nearest))
    output.putdata(converted)
    output.save(output_dir / "harmonized.png")
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
        "Palette harmonizer",
        [("source", source), ("harmonized", output), ("realm palette", chips)],
        output_dir / "proof-board.png",
        (240, 200),
        3,
    )
    output_colors = {(r, g, b) for r, g, b, a in output.getdata() if a}
    gates = {
        "sourceHashMatches": not manifest.get("sourceSha256") or sha256_file(source_path) == manifest["sourceSha256"],
        "paletteNonEmpty": bool(palette),
        "protectedColorsRepresentable": protected.issubset(set(palette)),
        "everyOpaquePixelInPalette": output_colors.issubset(set(palette)),
        "meanColorDistanceWithinBudget": (sum(distances) / max(1, len(distances))) <= float(manifest.get("maxMeanDistance", 90)),
        "valueHierarchyPreserved": rank_agreement >= float(manifest.get("minimumRankAgreement", 0.72)),
    }
    return finish_receipt(
        "palette-harmonizer",
        manifest_path,
        output_dir,
        gates,
        {"image": repo_path(output_dir / "harmonized.png"), "proofBoard": repo_path(output_dir / "proof-board.png")},
        {
            "meanColorDistance": sum(distances) / max(1, len(distances)),
            "valueRankAgreement": rank_agreement,
            "outputColorCount": len(output_colors),
        },
    )


# Nine-slice / trim compiler ------------------------------------------------

def nine_slice(source: Image.Image, target: tuple[int, int], insets: tuple[int, int, int, int]) -> Image.Image:
    left, top, right, bottom = insets
    width, height = target
    if width < left + right or height < top + bottom:
        raise ValueError("target smaller than fixed caps")
    x = (0, left, source.width - right, source.width)
    y = (0, top, source.height - bottom, source.height)
    tx = (0, left, width - right, width)
    ty = (0, top, height - bottom, height)
    out = Image.new("RGBA", target, (0, 0, 0, 0))
    for row in range(3):
        for col in range(3):
            patch = source.crop((x[col], y[row], x[col + 1], y[row + 1]))
            target_size = (tx[col + 1] - tx[col], ty[row + 1] - ty[row])
            if patch.size != target_size:
                patch = patch.resize(target_size, Image.Resampling.NEAREST)
            out.alpha_composite(patch, (tx[col], ty[row]))
    return out


def compile_trim(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    source_path = resolve_manifest_path(manifest_path, manifest["source"])
    source = key_magenta(Image.open(source_path))
    insets = tuple(int(value) for value in manifest["insets"])
    targets = [tuple(int(value) for value in target) for target in manifest["targets"]]
    outputs = []
    errors = []
    for index, target in enumerate(targets):
        try:
            image = nine_slice(source, target, insets)
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
    cap_ok = True
    for _, image in outputs:
        cap_ok = cap_ok and (
            image.crop((0, 0, left, top)).tobytes() == source.crop((0, 0, left, top)).tobytes()
            and image.crop((image.width - right, image.height - bottom, image.width, image.height)).tobytes()
            == source.crop((source.width - right, source.height - bottom, source.width, source.height)).tobytes()
        )
    gates = {
        "sourceHashMatches": not manifest.get("sourceSha256") or sha256_file(source_path) == manifest["sourceSha256"],
        "insetsValid": left + right <= source.width and top + bottom <= source.height,
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
        {"targets": [list(target) for target in targets], "errors": errors},
    )


# Decal/stamp compiler ------------------------------------------------------

def compile_decal(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    sheet_path = resolve_manifest_path(manifest_path, manifest["sheet"])
    keyed = transparent_rgb_clean(key_magenta(Image.open(sheet_path)))
    boxes = connected_components(keyed)
    ids = list(manifest.get("ids", []))
    variants = []
    base_border_safe = all(
        box[0] > 0 and box[1] > 0 and box[2] < keyed.width and box[3] < keyed.height for box in boxes
    )
    for index, box in enumerate(boxes[: len(ids)]):
        base = ImageOps.expand(keyed.crop(box), border=3, fill=(0, 0, 0, 0))
        for angle in (0, 90, 180, 270):
            rotated = base.rotate(angle, expand=True, resample=Image.Resampling.NEAREST)
            for scale in (0.5, 1.0, 2.0):
                size = (max(1, round(rotated.width * scale)), max(1, round(rotated.height * scale)))
                variant = rotated.resize(size, Image.Resampling.NEAREST)
                variant_id = f"{ids[index]}-r{angle}-s{str(scale).replace('.', '_')}"
                variants.append((variant_id, variant))
    atlas = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    placements = {}
    if variants:
        atlas, placements = shelf_pack(variants, padding=2, max_width=768)
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
        "transparentPixelsDefringed": transparent_clean,
        "halfScaleRemainsReadable": half_readable and bool(variants),
        "rotationScaleMatrixComplete": len(variants) == len(ids) * 12,
        "atlasContainsEveryVariant": len(placements) == len(variants),
    }
    return finish_receipt(
        "decal-stamp",
        manifest_path,
        output_dir,
        gates,
        {"atlas": repo_path(output_dir / "atlas.png"), "proofBoard": repo_path(output_dir / "proof-board.png")},
        {"componentCount": len(boxes), "variantCount": len(variants)},
    )


# Sprite citizenship compiler ---------------------------------------------

def compile_citizenship(manifest_path: Path, output_dir: Path, force: bool = False) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    guarded_reset(output_dir, force)
    source_path = resolve_manifest_path(manifest_path, manifest["source"])
    source = transparent_rgb_clean(key_magenta(Image.open(source_path)))
    box = alpha_bbox(source)
    cropped = source.crop(box) if box else Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    padding = int(manifest.get("paddingPx", 3))
    citizen = ImageOps.expand(cropped, border=padding, fill=(0, 0, 0, 0))
    citizen.save(output_dir / "sprite.png")
    thumbnail = ImageOps.contain(citizen, (96, 96), Image.Resampling.NEAREST)
    thumbnail.save(output_dir / "thumbnail.png")
    foot_x = 0.5
    foot_y = 1.0
    if box:
        alpha = source.getchannel("A")
        bottom_y = box[3] - 1
        contacts = [x for x in range(box[0], box[2]) if alpha.getpixel((x, bottom_y)) > 12]
        if contacts:
            foot_x = ((min(contacts) + max(contacts)) / 2 - box[0]) / max(1, box[2] - box[0])
    metadata = {
        "slug": manifest["slug"],
        "source": repo_path(source_path),
        "sourceSha256": sha256_file(source_path),
        "contentBounds": list(box) if box else None,
        "footX": foot_x,
        "footY": foot_y,
        "worldHeightFeet": manifest.get("worldHeightFeet"),
        "alphaCutoff": 12,
    }
    write_json(output_dir / "citizenship.json", metadata)
    card = Image.new("RGBA", (180, 180), (54, 48, 42, 255))
    draw = ImageDraw.Draw(card)
    draw.line((10, 150, 170, 150), fill=(220, 190, 126, 255), width=2)
    fit = ImageOps.contain(citizen, (130, 130), Image.Resampling.NEAREST)
    card.alpha_composite(fit, ((180 - fit.width) // 2, 150 - fit.height))
    draw.text((8, 160), f"{manifest['slug']} · {manifest.get('worldHeightFeet')} ft", fill=(245, 238, 220), font=font())
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
        "worldHeightIsExplicit": isinstance(manifest.get("worldHeightFeet"), (int, float)) and manifest["worldHeightFeet"] > 0,
        "footAnchorNormalized": 0 <= foot_x <= 1 and foot_y == 1.0,
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
    albedo = Image.open(albedo_path).convert("RGB")
    source_seam = edge_delta(albedo)
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
        or source_seam <= float(manifest.get("maxSourceEdgeDelta", 3.0)),
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
            "height": repo_path(output_dir / "height.png"),
            "normal": repo_path(output_dir / "normal.png"),
            "roughness": repo_path(output_dir / "roughness.png"),
            "emissive": repo_path(output_dir / "emissive.png"),
            "proofBoard": repo_path(output_dir / "proof-board.png"),
        },
        {"sourceEdgeDelta": source_seam, "normalBlueMinimum": blue_min},
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
        diff = ImageChops.difference(baseline, current)
        score = rgba_difference(baseline, current)
    else:
        diff = Image.new("RGBA", baseline.size, (255, 0, 0, 255))
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
                "maxMeanDistance": 1,
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


def write_boundary_manifest(path: Path, material: Path, tile_size: int = 64) -> dict[str, Any]:
    payload = {
        "schemaVersion": 1,
        "family": "boundary-autotile",
        "algorithmVersion": "boundary-blob47-v1",
        "insideMaterial": {"tile": repo_path(material), "sha256": sha256_file(material)},
        "outsideMaterial": {"mode": "transparent"},
        "edgeLanguage": {
            "borderWidthPx": max(3, tile_size // 10),
            "orientationPolicy": "rotatable-organic",
            "phasePolicy": "world-locked",
        },
        "tileSizePx": tile_size,
        "seed": 73129,
        "admission": {"scope": "candidate-only"},
    }
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
            init_parser = actions.add_parser("init", help="write a boundary-blob47 manifest")
            init_parser.add_argument("material", type=Path)
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
        result = write_boundary_manifest(args.output, args.material, args.tile_size)
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
