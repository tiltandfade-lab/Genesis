#!/usr/bin/env python3
"""Assetforge — manifest-driven visual asset compilers for Genesis.

Implemented families:

    python3 build/assetforge.py emote init SPRITE_SLUG
    python3 build/assetforge.py emote ingest JOB_JSON RETURNED_SHEET
    python3 build/assetforge.py emote review VISUAL_REVIEW_JSON
    python3 build/assetforge.py emote self-test
    python3 build/assetforge.py boundary compile MANIFEST --output-dir DIR
    python3 build/assetforge.py repeat compile MANIFEST --output-dir DIR
    python3 build/assetforge.py prop-kit compile MANIFEST --output-dir DIR
    python3 build/assetforge.py condition compile MANIFEST --output-dir DIR
    python3 build/assetforge.py palette compile MANIFEST --output-dir DIR
    python3 build/assetforge.py trim compile MANIFEST --output-dir DIR
    python3 build/assetforge.py decal compile MANIFEST --output-dir DIR
    python3 build/assetforge.py citizenship compile MANIFEST --output-dir DIR
    python3 build/assetforge.py atlas compile MANIFEST --output-dir DIR
    python3 build/assetforge.py material compile MANIFEST --output-dir DIR
    python3 build/assetforge.py regression compare MANIFEST --output-dir DIR
    python3 build/assetforge.py suite self-test

The emote family accepts a registered monster, NPC, or PC sprite and writes a self-contained
ImageGen production packet. The other families compile deterministic topology, repeat, kit, state,
palette, trim, decal, citizenship, atlas, material-map, and regression products. Outputs remain
under quarantine by default and are never admitted into the live registry by this script.

Dependency: Pillow. Everything after image generation is deterministic from the source image,
job manifest, returned sheet, and algorithm version.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import shutil
import statistics
import sys
from collections import Counter
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any, Iterable

try:
    from PIL import Image, ImageDraw, ImageFont, ImageOps
except ImportError:
    print("ERROR: Assetforge requires Pillow (`python3 -m pip install Pillow`).", file=sys.stderr)
    raise SystemExit(1)

from assetforge_apps import dispatch as dispatch_apps
from assetforge_apps import register_parsers as register_app_parsers


ROOT = Path(__file__).resolve().parents[1]
V2_MANIFEST = ROOT / "dev" / "sprite-manifests" / "v2-manifest.json"
CORPUS_SIZING = ROOT / "dev" / "model-qa" / "corpus-sizing.json"
SPRITE_OVERLAY = ROOT / "dev" / "model-qa" / "sprite-tags-overlay.json"
STYLE_ROOT = ROOT / "dev" / "model-qa" / "sprite-sheets"
DEFAULT_EMOTE_ROOT = ROOT / "dev" / "model-qa" / "emote-factory"

ALGORITHM_VERSION = "sprite-emote-v1"
CHROMA_RGB = (255, 0, 255)
CHROMA_HEX = "#FF00FF"
ALPHA_CUTOFF = 24

GENESIS_EMOTE_CORE = (
    {
        "id": "neutral",
        "label": "Neutral",
        "cue": "Characteristic baseline expression and ready stance; alive and specific, but not signaling a strong emotion.",
    },
    {
        "id": "angry",
        "label": "Angry",
        "cue": "Anger or hostile intent at maximum readable clarity without changing equipment.",
    },
    {
        "id": "happy",
        "label": "Happy",
        "cue": "Unmistakable warmth, delight, or relieved happiness while remaining the same individual.",
    },
    {
        "id": "near-death",
        "label": "Near death",
        "cue": "Severe exhaustion and pain, slumped but still a complete grounded standee with the full loadout.",
    },
    {
        "id": "resting",
        "label": "Resting",
        "cue": "A quiet seated field-rest pose, contemplative and momentarily unguarded, with the weapon safely settled; no grass, scenery, or added prop.",
        "heightPolicy": "licensed-compression",
    },
    {
        "id": "rear-view",
        "label": "Rear view",
        "cue": "The same individual viewed from directly behind after a 180-degree turn; reveal true back anatomy and equipment attachment, never a mirrored front.",
    },
)

SELF_TEST_SLUGS = (
    "spr-pc-human-fighter-male",
    "spr-fantasy-land-worker-dragonborn",
    "spr-fantasy-goblin-warrior",
    "spr-fantasy-dire-wolf",
)


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise SystemExit(f"ERROR: missing required file: {repo_path(path)}")
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
    resolved = path.resolve()
    try:
        return resolved.relative_to(ROOT).as_posix()
    except ValueError:
        return str(resolved)


def resolve_repo_path(value: str | Path) -> Path:
    path = Path(value)
    return path if path.is_absolute() else ROOT / path


def safe_id(value: str) -> str:
    result = re.sub(r"[^a-z0-9-]+", "-", value.lower()).strip("-")
    if not result:
        raise ValueError("identifier cannot be empty")
    return result


def assert_quarantine_output(path: Path) -> None:
    """Refuse broad and live-production targets before any Assetforge write."""
    resolved = path.resolve()
    forbidden = {
        Path("/"),
        Path.home().resolve(),
        ROOT.resolve(),
        ROOT.parent.resolve(),
        Path.cwd().resolve(),
        (ROOT / "dev").resolve(),
        (ROOT / "dev" / "model-qa").resolve(),
    }
    if resolved in forbidden or len(resolved.parts) < 4:
        raise SystemExit(f"ERROR: refusing to clear broad output directory: {resolved}")
    for live_root in (
        ROOT / "assets",
        ROOT / "build",
        ROOT / "data",
        ROOT / "docs",
        ROOT / "Engine",
        ROOT / "Reference",
        ROOT / "src",
    ):
        if resolved == live_root.resolve() or live_root.resolve() in resolved.parents:
            raise SystemExit(f"ERROR: refusing live Assetforge output directory: {resolved}")


def guarded_remove_tree(path: Path) -> None:
    """Remove one explicit derived-output directory while refusing broad workspace targets."""
    assert_quarantine_output(path)
    resolved = path.resolve()
    shutil.rmtree(resolved)


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = (
        "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
        if bold
        else "/System/Library/Fonts/Supplemental/Arial.ttf",
    )
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            pass
    return ImageFont.load_default()


def alpha_bbox(image: Image.Image, cutoff: int = ALPHA_CUTOFF) -> tuple[int, int, int, int] | None:
    alpha = image.convert("RGBA").getchannel("A")
    return alpha.point(lambda value: 255 if value >= cutoff else 0).getbbox()


def normalized_bbox(
    bbox: tuple[int, int, int, int] | None, width: int, height: int
) -> list[float] | None:
    if bbox is None:
        return None
    x0, y0, x1, y1 = bbox
    return [
        round(x0 / width, 6),
        round(y0 / height, 6),
        round(x1 / width, 6),
        round(y1 / height, 6),
    ]


def foot_contact(
    image: Image.Image, bbox: tuple[int, int, int, int] | None
) -> tuple[float, float] | None:
    if bbox is None:
        return None
    alpha = image.convert("RGBA").getchannel("A")
    px = alpha.load()
    x0, _y0, x1, y1 = bbox
    row = max(0, y1 - 1)
    xs = [x for x in range(x0, x1) if px[x, row] >= ALPHA_CUTOFF]
    if not xs:
        return None
    return (
        round((sum(xs) / len(xs)) / max(1, image.width - 1), 6),
        round(row / max(1, image.height - 1), 6),
    )


def manifest_entry(slug: str) -> dict[str, Any]:
    manifest = load_json(V2_MANIFEST)
    hits: list[dict[str, Any]] = []
    for sheet in manifest.get("sheets", []):
        for cell in sheet.get("cells", []):
            if cell.get("slug") == slug:
                hits.append(
                    {
                        "sheetId": sheet.get("id"),
                        "realm": sheet.get("realm"),
                        "kind": sheet.get("kind"),
                        "cell": cell.get("n"),
                        "name": cell.get("name"),
                        "cue": cell.get("cue"),
                    }
                )
    if len(hits) != 1:
        raise SystemExit(
            f"ERROR: sprite slug must resolve exactly once in {repo_path(V2_MANIFEST)}; "
            f"{slug!r} resolved {len(hits)} times"
        )
    hit = hits[0]
    if hit["kind"] not in {"monster", "npc", "pc"}:
        raise SystemExit(
            f"ERROR: emote v1 accepts kind monster/npc/pc; {slug!r} is {hit['kind']!r}"
        )
    return hit


def style_authority(realm: str) -> tuple[Path, str]:
    path = STYLE_ROOT / ("pc-characters.md" if realm == "pc" else f"{realm}.md")
    if not path.exists():
        raise SystemExit(f"ERROR: no style authority for realm {realm!r}: {repo_path(path)}")
    lines = [
        line.strip()
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.startswith("Style block:")
    ]
    if len(lines) != 1:
        raise SystemExit(
            f"ERROR: expected exactly one `Style block:` in {repo_path(path)}, found {len(lines)}"
        )
    return path, lines[0]


def subject_dimensions(source: Image.Image, kind: str) -> dict[str, Any]:
    bbox = alpha_bbox(source)
    if bbox is None:
        raise SystemExit("ERROR: source sprite contains no visible pixels")
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    ratio = width / max(1, height)

    # The production authority defaults character cells to 4:5. For non-humanoids, the actual
    # source silhouette selects a declared family ratio rather than forcing it into character art.
    if kind in {"pc", "npc"}:
        aspect, dims, reason = (
            "4:5",
            (320, 400),
            "Character default: source is a PC/NPC full-body figure.",
        )
    elif ratio <= 0.68:
        aspect, dims, reason = (
            "4:6",
            (320, 480),
            f"Subject-derived: source visible silhouette is tall ({ratio:.3f} width/height).",
        )
    elif ratio <= 0.92:
        aspect, dims, reason = (
            "4:5",
            (320, 400),
            f"Subject-derived: source visible silhouette is character-like ({ratio:.3f} width/height).",
        )
    elif ratio <= 1.18:
        aspect, dims, reason = (
            "1:1",
            (384, 384),
            f"Subject-derived: source visible silhouette is approximately square ({ratio:.3f} width/height).",
        )
    elif ratio <= 1.55:
        aspect, dims, reason = (
            "5:4",
            (400, 320),
            f"Subject-derived: source visible silhouette is wide ({ratio:.3f} width/height).",
        )
    else:
        aspect, dims, reason = (
            "3:2",
            (480, 320),
            f"Subject-derived: source visible silhouette is strongly landscape ({ratio:.3f} width/height).",
        )
    return {
        "sourceVisibleAspect": round(ratio, 6),
        "cellAspect": aspect,
        "cellWidthPx": dims[0],
        "cellHeightPx": dims[1],
        "aspectStatus": "default" if kind in {"pc", "npc"} else "subject-derived",
        "aspectReason": reason,
    }


def source_contract(slug: str, source: Image.Image) -> dict[str, Any]:
    sizing = load_json(CORPUS_SIZING)
    overlay = load_json(SPRITE_OVERLAY)
    bbox = alpha_bbox(source)
    foot = foot_contact(source, bbox)
    sized = sizing.get(slug, {})
    tagged = overlay.get(slug, {})
    return {
        "pixelDimensions": [source.width, source.height],
        "contentBounds": normalized_bbox(bbox, source.width, source.height),
        "footX": foot[0] if foot else 0.5,
        "footY": foot[1] if foot else 1.0,
        "worldHeightFeet": sized.get("feet"),
        "sizeBand": sized.get("sizeBand"),
        "registryScale": tagged.get("scale"),
        "sizingSource": repo_path(CORPUS_SIZING) if sized else None,
    }


def job_prompt(job: dict[str, Any]) -> str:
    production = job["production"]
    subject = job["subject"]
    source = job["source"]
    states = job["states"]
    state_lines = "\n".join(
        f"{index}. **{state['label']}** (`{state['id']}`) — {state['cue']}"
        for index, state in enumerate(states, 1)
    )
    identity_locks = "\n".join(f"- {lock}" for lock in job["identityLocks"])
    requested = production["requestedCanvas"]
    return f"""# Assetforge sprite-emote generation packet

## Job

- jobId: `{job['jobId']}`
- spriteSlug: `{subject['slug']}`
- exact subject: **{subject['name']}**
- registry kind: `{subject['kind']}`
- realm: `{subject['realm']}`
- source reference: `{source['path']}`
- source SHA-256: `{source['sha256']}`
- source cue: {subject['cue']}

Attach the source reference image to the generation call. It is the identity authority. Produce the
same individual in every cell.

## Production format

- sheetId: `{job['jobId']}`
- gridColumns: {production['gridColumns']}
- gridRows: {production['gridRows']}
- capacity: {production['capacity']}
- subjectCount: {len(states)} discrete static states of one identity
- cellAspect: `{production['cellAspect']}`
- aspectStatus: `{production['aspectStatus']}`
- aspectReason: {production['aspectReason']}
- cellWidthPx: {production['cellWidthPx']}
- cellHeightPx: {production['cellHeightPx']}
- requestedCanvas: `{requested[0]} × {requested[1]}`
- chromaKey: `{production['chromaKey']}`
- camera: `{production['camera']}`
- order: left-to-right, then top-to-bottom

{job['style']['exactBlock']}

## Family-specific mechanical instructions

This is a sprite-emote sheet. Repeating the exact same individual across cells is required and is a
family-specific exception to the ordinary distinct-subject sprite-sheet rule. These are discrete
static expression/state variants, **not animation frames**.

Use one complete full-body state per cell. Keep uniform cell boundaries. No subject, weapon, wing,
horn, tail, effect, or shadow may cross a cell boundary. Keep the entire subject visible with
padding: no cropped feet, head, equipment, limb, wing, horn, or tail. Match the reference's
ground-level/eye-level camera, pixel density, apparent scale, lighting direction, and ground line.
Match its facing direction in cells 1–5. Cell 6 (`rear-view`) is the sole viewpoint exception:
rotate the same individual 180 degrees and show the true back, without mirroring the front art or
changing scale. Maintain a consistent baseline across all cells.

Background must be solid `{production['chromaKey']}` filling every non-subject pixel. No
transparency, scenery, floor plane, labels, dividers, watermark, background shadow, haze, or
key-color contamination. The state must read through the subject itself.

For humanoids, facial expression and body language must both read at cell resolution. For
non-humanoids, communicate state through the anatomy the subject actually has—eyes, ears, hackles,
tail, wings, stance, compression, reach, silhouette, and licensed signature effects. Do not force a
human face onto a creature.

## Identity locks

{identity_locks}

Only expression, gesture, and the minimum pose change necessary to communicate the requested state
may change.

## States, one per cell in row-major order

{state_lines}

## Return inspection

Re-open the returned image and record actual canvas, six occupied cells, row-major state order,
complete silhouettes, chroma purity, source identity, equipment continuity, camera, scale,
baseline, and style. A generation may be regenerated once with the violated clause repeated
exactly. Generated does not mean passed.

Receipt fields:

```text
jobId
outputPath
requestedCanvas
actualCanvas
requestedCellAspect
actualDerivedCellDimensions
generationProvider
generationModel
generationCallId
seed
stateCountExpected
stateCountObserved
inspection: PASS | FAIL
failureReasons[]
regenerationCount
```
"""


def create_emote_job(
    slug: str,
    jobs_dir: Path,
    version: int = 1,
    states: Iterable[dict[str, str]] = GENESIS_EMOTE_CORE,
    cell_aspect_override: str | None = None,
    force: bool = False,
) -> tuple[dict[str, Any], Path, Path]:
    record = manifest_entry(slug)
    source_path = ROOT / "assets" / "sprites" / f"{slug}.png"
    if not source_path.exists():
        raise SystemExit(f"ERROR: registered sprite has no live source PNG: {repo_path(source_path)}")
    try:
        source = Image.open(source_path).convert("RGBA")
    except Exception as exc:
        raise SystemExit(
            f"ERROR: source is not a readable PNG (is it an unsmudged Git LFS pointer?): "
            f"{repo_path(source_path)}: {exc}"
        )

    style_path, style_block = style_authority(record["realm"])
    dimensions = subject_dimensions(source, record["kind"])
    if cell_aspect_override is not None:
        supported_aspects = {
            "4:6": (320, 480),
            "4:5": (320, 400),
            "1:1": (384, 384),
            "5:4": (400, 320),
            "3:2": (480, 320),
        }
        override_dims = supported_aspects[cell_aspect_override]
        dimensions.update(
            {
                "cellAspect": cell_aspect_override,
                "cellWidthPx": override_dims[0],
                "cellHeightPx": override_dims[1],
                "aspectStatus": "provisional-test",
                "aspectReason": (
                    f"Explicit Assetforge override from the subject-derived "
                    f"{dimensions['cellAspect']} candidate; retain comparison evidence."
                ),
            }
        )
    states_list = [dict(item) for item in states]
    if len(states_list) != 6:
        raise SystemExit("ERROR: sprite-emote-v1 currently requires exactly six ordered states")
    ids = [safe_id(item["id"]) for item in states_list]
    if len(ids) != len(set(ids)):
        raise SystemExit("ERROR: emote state ids must be unique")
    for item, state_id in zip(states_list, ids):
        item["id"] = state_id

    job_id = f"emote-{slug}-v{version:03d}"
    jobs_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = jobs_dir / f"{job_id}.job.json"
    prompt_path = jobs_dir / f"{job_id}.prompt.md"
    if not force and (manifest_path.exists() or prompt_path.exists()):
        raise SystemExit(
            f"ERROR: job already exists: {repo_path(manifest_path)} (use --force to reproduce it)"
        )

    requested_canvas = [
        dimensions["cellWidthPx"] * 3,
        dimensions["cellHeightPx"] * 2,
    ]
    job = {
        "schemaVersion": 1,
        "family": "sprite-emote",
        "algorithmVersion": ALGORITHM_VERSION,
        "jobId": job_id,
        "created": date.today().isoformat(),
        "source": {
            "path": repo_path(source_path),
            "sha256": sha256_file(source_path),
            **source_contract(slug, source),
        },
        "subject": {
            "slug": slug,
            "name": record["name"],
            "realm": record["realm"],
            "kind": record["kind"],
            "cue": record["cue"],
            "manifestPath": repo_path(V2_MANIFEST),
            "sheetId": record["sheetId"],
            "cell": record["cell"],
        },
        "style": {
            "authority": repo_path(style_path),
            "exactBlock": style_block,
        },
        "states": states_list,
        "identityLocks": [
            "Preserve the exact individual: apparent age, face/head anatomy, body plan, proportions, skin/fur/scales, and major markings.",
            "Preserve every clothing, armor, weapon, and carried-equipment identity; keep them on the same side of the body.",
            "Preserve realm palette, pixel grid/density, outline language, value hierarchy, and lighting direction.",
            "Preserve camera, apparent world scale, grounding, and foot/contact line; preserve source facing in all states except the explicitly licensed rear-view.",
            "For rear-view only, rotate the same individual 180 degrees and reveal the true back; preserve physical equipment attachment and never mirror the front artwork.",
            "Do not add or remove limbs, horns, wings, tail sections, equipment, trophies, scenery, or replacement effects.",
            "Do not turn states into progressive action frames; each cell must stand alone as one readable portrayal.",
        ],
        "production": {
            "gridColumns": 3,
            "gridRows": 2,
            "capacity": 6,
            "cellAspect": dimensions["cellAspect"],
            "aspectStatus": dimensions["aspectStatus"],
            "aspectReason": dimensions["aspectReason"],
            "cellWidthPx": dimensions["cellWidthPx"],
            "cellHeightPx": dimensions["cellHeightPx"],
            "requestedCanvas": requested_canvas,
            "chromaKey": CHROMA_HEX,
            "camera": "Match the source ground-level/eye-level projection; source-facing for states 1–5 and a true 180-degree back view for rear-view.",
            "order": "left-to-right, then top-to-bottom",
        },
        "proof": {
            "alphaCutoff": ALPHA_CUTOFF,
            "chromaTolerance": 60,
            "minimumBorderClearance": 0.99,
            "maximumBaselineDelta": 0.05,
            "maximumRelativeHeightDelta": 0.25,
            "minimumLicensedCompressionRatio": 0.4,
            "maximumLicensedCompressionRatio": 1.05,
            "minimumSourcePaletteCoverage": 0.45,
            "maximumMagentaEdgeResidue": 0.04,
            "maximumCellAspectError": 0.08,
            "visualIdentity": "REVIEW_REQUIRED",
        },
        "generation": {
            "promptPath": repo_path(prompt_path),
            "provider": None,
            "model": None,
            "generationCallId": None,
            "seed": None,
        },
        "admission": {
            "scope": "candidate-only",
            "defaultRuntimePriority": "pc-or-boss",
            "tasteApproval": None,
            "approvedBy": None,
        },
    }
    write_json(manifest_path, job)
    prompt_path.write_text(job_prompt(job), encoding="utf-8")
    return job, manifest_path, prompt_path


def is_chroma(rgb: tuple[int, int, int], tolerance: int) -> bool:
    return math.sqrt(
        (rgb[0] - CHROMA_RGB[0]) ** 2
        + (rgb[1] - CHROMA_RGB[1]) ** 2
        + (rgb[2] - CHROMA_RGB[2]) ** 2
    ) <= tolerance


def opaque_border_clearance(image: Image.Image, cutoff: int = ALPHA_CUTOFF) -> float:
    alpha = image.getchannel("A")
    px = alpha.load()
    coords = (
        [(x, 0) for x in range(image.width)]
        + [(x, image.height - 1) for x in range(image.width)]
        + [(0, y) for y in range(1, image.height - 1)]
        + [(image.width - 1, y) for y in range(1, image.height - 1)]
    )
    if not coords:
        return 1.0
    clear = sum(1 for x, y in coords if px[x, y] < cutoff)
    return clear / len(coords)


def keyed_cell(cell: Image.Image, tolerance: int) -> Image.Image:
    result = cell.convert("RGBA")
    px = result.load()
    for y in range(result.height):
        for x in range(result.width):
            r, g, b, a = px[x, y]
            if a < ALPHA_CUTOFF or is_chroma((r, g, b), tolerance):
                px[x, y] = (r, g, b, 0)
    defringe(result)
    return result


def edge_pixels(image: Image.Image) -> list[tuple[int, int]]:
    px = image.load()
    points: list[tuple[int, int]] = []
    for y in range(image.height):
        for x in range(image.width):
            if px[x, y][3] < ALPHA_CUTOFF:
                continue
            for nx, ny in (
                (x - 1, y),
                (x + 1, y),
                (x, y - 1),
                (x, y + 1),
                (x - 1, y - 1),
                (x + 1, y - 1),
                (x - 1, y + 1),
                (x + 1, y + 1),
            ):
                if (
                    nx < 0
                    or ny < 0
                    or nx >= image.width
                    or ny >= image.height
                    or px[nx, ny][3] < ALPHA_CUTOFF
                ):
                    points.append((x, y))
                    break
    return points


def defringe(image: Image.Image, erode_excess: int = 60, despill: float = 0.25) -> None:
    """Remove chroma-key crust only on the alpha-adjacent edge band."""
    px = image.load()
    for _ in range(2):
        changed = False
        for x, y in edge_pixels(image):
            r, g, b, a = px[x, y]
            if min(r, b) - g > erode_excess:
                px[x, y] = (r, g, b, 0)
                changed = True
        if not changed:
            break
    for x, y in edge_pixels(image):
        r, g, b, a = px[x, y]
        if r > g and b > g:
            px[x, y] = (
                g + int((r - g) * despill),
                g,
                g + int((b - g) * despill),
                a,
            )


def magenta_edge_residue(image: Image.Image) -> float:
    points = edge_pixels(image)
    if not points:
        return 0.0
    px = image.load()
    residue = 0
    for x, y in points:
        r, g, b, _a = px[x, y]
        # Deliberately narrow: this detects key-color crust, not legitimate purple costume pixels.
        if r >= 150 and b >= 150 and g <= 100 and min(r, b) - g >= 80:
            residue += 1
    return residue / len(points)


def dominant_palette(image: Image.Image, bins: int = 32, limit: int = 32) -> list[tuple[int, int, int]]:
    rgba = image.convert("RGBA")
    step = max(1, int(math.sqrt((rgba.width * rgba.height) / 20000)))
    counts: Counter[tuple[int, int, int]] = Counter()
    for y in range(0, rgba.height, step):
        for x in range(0, rgba.width, step):
            r, g, b, a = rgba.getpixel((x, y))
            if a < ALPHA_CUTOFF:
                continue
            counts[
                (
                    min(255, (r // bins) * bins + bins // 2),
                    min(255, (g // bins) * bins + bins // 2),
                    min(255, (b // bins) * bins + bins // 2),
                )
            ] += 1
    return [color for color, _count in counts.most_common(limit)]


def palette_coverage(
    image: Image.Image,
    palette: list[tuple[int, int, int]],
    distance_limit: float = 48.0,
) -> float:
    if not palette:
        return 0.0
    rgba = image.convert("RGBA")
    step = max(1, int(math.sqrt((rgba.width * rgba.height) / 20000)))
    seen = matched = 0
    limit_sq = distance_limit * distance_limit
    for y in range(0, rgba.height, step):
        for x in range(0, rgba.width, step):
            r, g, b, a = rgba.getpixel((x, y))
            if a < ALPHA_CUTOFF:
                continue
            seen += 1
            nearest = min(
                (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2 for pr, pg, pb in palette
            )
            if nearest <= limit_sq:
                matched += 1
    return matched / seen if seen else 0.0


def trim_with_padding(image: Image.Image, padding: int = 4) -> Image.Image:
    bbox = alpha_bbox(image)
    if bbox is None:
        return Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    x0, y0, x1, y1 = bbox
    return image.crop(
        (
            max(0, x0 - padding),
            max(0, y0 - padding),
            min(image.width, x1 + padding),
            min(image.height, y1 + padding),
        )
    )


@dataclass
class StateResult:
    state: dict[str, str]
    keyed: Image.Image
    trimmed: Image.Image
    bbox: tuple[int, int, int, int] | None
    metrics: dict[str, Any]
    path: Path


def checkerboard(size: tuple[int, int], cell: int = 10) -> Image.Image:
    out = Image.new("RGBA", size, (46, 45, 43, 255))
    draw = ImageDraw.Draw(out)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle(
                    (x, y, min(size[0], x + cell), min(size[1], y + cell)),
                    fill=(58, 56, 52, 255),
                )
    return out


def contain_nearest(image: Image.Image, box: tuple[int, int]) -> Image.Image:
    return ImageOps.contain(image, box, Image.Resampling.NEAREST)


def proof_board(
    job: dict[str, Any],
    source: Image.Image,
    states: list[StateResult],
    gates: dict[str, bool],
) -> Image.Image:
    background = (20, 20, 18, 255)
    panel = (34, 33, 29, 255)
    ink = (238, 231, 215, 255)
    quiet = (166, 158, 142, 255)
    copper = (205, 139, 78, 255)
    green = (111, 184, 131, 255)
    red = (224, 100, 92, 255)
    board = Image.new("RGBA", (1600, 1120), background)
    draw = ImageDraw.Draw(board)
    draw.text((42, 28), "ASSETFORGE / SPRITE-EMOTE PROOF", fill=ink, font=font(30, True))
    draw.text((42, 70), job["jobId"], fill=quiet, font=font(17))
    draw.text(
        (42, 98),
        "Technical proof only — visual identity and taste remain review-required.",
        fill=copper,
        font=font(16),
    )

    # Source authority.
    draw.rounded_rectangle((40, 140, 370, 720), radius=10, fill=panel)
    draw.text((62, 160), "SOURCE AUTHORITY", fill=ink, font=font(19, True))
    source_box = checkerboard((280, 430))
    source_view = contain_nearest(source, (250, 390))
    source_box.alpha_composite(
        source_view,
        ((source_box.width - source_view.width) // 2, source_box.height - source_view.height - 18),
    )
    board.alpha_composite(source_box, (65, 205))
    draw.text((62, 651), job["subject"]["name"], fill=ink, font=font(15))
    draw.text(
        (62, 678),
        f"{job['subject']['kind']} · {job['subject']['realm']}",
        fill=quiet,
        font=font(14),
    )

    # State cards.
    card_w, card_h = 370, 280
    origin_x, origin_y = 405, 140
    for index, result in enumerate(states):
        row, col = divmod(index, 3)
        x = origin_x + col * 390
        y = origin_y + row * 300
        draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=10, fill=panel)
        draw.text((x + 16, y + 14), result.state["id"].upper(), fill=ink, font=font(17, True))
        view_box = checkerboard((338, 212))
        view = contain_nearest(result.keyed, (320, 194))
        vx = (view_box.width - view.width) // 2
        vy = (view_box.height - view.height) // 2
        view_box.alpha_composite(view, (vx, vy))
        foot_y = result.metrics.get("footY")
        if isinstance(foot_y, (int, float)):
            line_y = max(0, min(view_box.height - 1, int(vy + foot_y * view.height)))
            ImageDraw.Draw(view_box).line((0, line_y, view_box.width, line_y), fill=copper, width=1)
        board.alpha_composite(view_box, (x + 16, y + 48))
        foot_text = (
            f"{result.metrics['footY']:.3f}"
            if isinstance(result.metrics.get("footY"), (int, float))
            else "missing"
        )
        draw.text(
            (x + 16, y + 264),
            f"foot {foot_text} · height {result.metrics.get('heightOccupancy', 0):.3f} · palette {result.metrics.get('sourcePaletteCoverage', 0):.2f}",
            fill=quiet,
            font=font(11),
        )

    # Play-scale strip.
    draw.text((42, 768), "PLAY-SCALE READ (64 px content height target)", fill=ink, font=font(18, True))
    strip_y = 810
    for index, result in enumerate(states):
        x = 45 + index * 255
        draw.rounded_rectangle((x, strip_y, x + 225, strip_y + 145), radius=8, fill=panel)
        sprite = result.trimmed
        content_bbox = alpha_bbox(sprite)
        content_height = (content_bbox[3] - content_bbox[1]) if content_bbox else sprite.height
        scale = 64 / max(1, content_height)
        play = sprite.resize(
            (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale))),
            Image.Resampling.NEAREST,
        )
        board.alpha_composite(play, (x + (225 - play.width) // 2, strip_y + 18))
        draw.line((x + 8, strip_y + 88, x + 217, strip_y + 88), fill=copper, width=1)
        draw.text((x + 12, strip_y + 108), result.state["id"], fill=ink, font=font(13))

    passed = sum(1 for value in gates.values() if value)
    status = all(gates.values())
    draw.rounded_rectangle((40, 985, 1560, 1085), radius=10, fill=panel)
    draw.text(
        (62, 1008),
        f"MECHANICAL IDENTITY {'PASS' if status else 'FAIL'}  ·  {passed}/{len(gates)} gates",
        fill=green if status else red,
        font=font(22, True),
    )
    failures = [name for name, value in gates.items() if not value]
    footer = "Visual identity: REVIEW_REQUIRED" if not failures else "Failed: " + ", ".join(failures)
    draw.text((62, 1048), footer[:185], fill=quiet, font=font(14))
    return board


def validate_job(job: dict[str, Any], job_path: Path) -> None:
    if job.get("schemaVersion") != 1:
        raise SystemExit(f"ERROR: unsupported job schema in {repo_path(job_path)}")
    if job.get("family") != "sprite-emote":
        raise SystemExit(f"ERROR: job is not a sprite-emote family: {repo_path(job_path)}")
    if job.get("algorithmVersion") != ALGORITHM_VERSION:
        raise SystemExit(
            f"ERROR: job algorithm {job.get('algorithmVersion')!r} is not {ALGORITHM_VERSION!r}"
        )
    states = job.get("states", [])
    if len(states) != 6 or len({state.get("id") for state in states}) != 6:
        raise SystemExit("ERROR: emote v1 job must contain exactly six unique states")


def visual_review_template(
    job: dict[str, Any],
    technical_receipt_path: Path,
    proof_board_path: Path,
) -> dict[str, Any]:
    common_checks = (
        "stateRead",
        "identityContinuity",
        "anatomyAndHands",
        "equipmentPresenceAndAttachment",
        "equipmentGripAndContact",
        "silhouetteContinuity",
        "playScaleRead",
    )
    states: dict[str, Any] = {}
    for state in job["states"]:
        checks = {name: None for name in common_checks}
        if state["id"] == "rear-view":
            checks["trueRearConstructionNotMirror"] = None
            checks["rearEquipmentAttachment"] = None
        states[state["id"]] = {
            "label": state["label"],
            "verdict": None,
            "checks": checks,
            "notes": "",
        }
    return {
        "schemaVersion": 1,
        "family": "sprite-emote-visual-review",
        "jobId": job["jobId"],
        "spriteSlug": job["subject"]["slug"],
        "technicalReceipt": repo_path(technical_receipt_path),
        "proofBoard": repo_path(proof_board_path),
        "reviewer": None,
        "reviewedOn": None,
        "states": states,
        "overallNotes": "",
        "allowedCheckValues": ["PASS", "FAIL"],
        "instructions": (
            "Inspect the source, full-size states, and play-scale row. Set every applicable check "
            "to PASS or FAIL and each state verdict to PASS or FAIL. Any FAIL rejects visual "
            "identity. Blank checks keep the review incomplete. Technical PASS cannot fill these."
        ),
    }


def compile_visual_review(review_path: Path, output_path: Path | None = None) -> dict[str, Any]:
    review = load_json(review_path)
    if review.get("schemaVersion") != 1 or review.get("family") != "sprite-emote-visual-review":
        raise SystemExit(f"ERROR: not a v1 sprite-emote visual review: {repo_path(review_path)}")
    states = review.get("states")
    if not isinstance(states, dict) or not states:
        raise SystemExit("ERROR: visual review has no states")

    failed: list[str] = []
    incomplete: list[str] = []
    for state_id, state in states.items():
        verdict = state.get("verdict")
        if verdict == "FAIL":
            failed.append(f"{state_id}:verdict")
        elif verdict != "PASS":
            incomplete.append(f"{state_id}:verdict")
        checks = state.get("checks", {})
        if not isinstance(checks, dict) or not checks:
            incomplete.append(f"{state_id}:checks")
            continue
        for check_name, check_value in checks.items():
            if check_value == "FAIL":
                failed.append(f"{state_id}:{check_name}")
            elif check_value != "PASS":
                incomplete.append(f"{state_id}:{check_name}")

    if failed:
        status = "FAIL"
    elif incomplete or not review.get("reviewer") or not review.get("reviewedOn"):
        status = "INCOMPLETE"
    else:
        status = "PASS"
    result = {
        "schemaVersion": 1,
        "family": "sprite-emote-visual-review-receipt",
        "jobId": review.get("jobId"),
        "spriteSlug": review.get("spriteSlug"),
        "reviewSource": repo_path(review_path),
        "reviewSourceSha256": sha256_file(review_path),
        "reviewer": review.get("reviewer"),
        "reviewedOn": review.get("reviewedOn"),
        "visualIdentity": status,
        "failedChecks": failed,
        "incompleteChecks": incomplete,
        "runtimeAdmission": "CANDIDATE" if status == "PASS" else "REJECTED",
        "notes": review.get("overallNotes", ""),
    }
    output_path = output_path or review_path.with_name("visual-review-receipt.json")
    write_json(output_path, result)
    return result


def ingest_emote_job(
    job_path: Path,
    sheet_path: Path,
    output_dir: Path | None = None,
    force: bool = False,
) -> dict[str, Any]:
    job = load_json(job_path)
    validate_job(job, job_path)
    source_path = resolve_repo_path(job["source"]["path"])
    if not source_path.exists():
        raise SystemExit(f"ERROR: source sprite missing: {repo_path(source_path)}")
    actual_source_hash = sha256_file(source_path)
    if actual_source_hash != job["source"]["sha256"]:
        raise SystemExit(
            "ERROR: source sprite hash changed after job creation; initialize a new versioned job"
        )
    if not sheet_path.exists():
        raise SystemExit(f"ERROR: returned sheet missing: {repo_path(sheet_path)}")

    output_dir = output_dir or DEFAULT_EMOTE_ROOT / "outputs" / job["jobId"]
    assert_quarantine_output(output_dir)
    if output_dir.exists() and any(output_dir.iterdir()):
        if not force:
            raise SystemExit(
                f"ERROR: output directory is not empty: {repo_path(output_dir)} (use --force)"
            )
        guarded_remove_tree(output_dir)
    states_dir = output_dir / "states"
    states_dir.mkdir(parents=True, exist_ok=True)

    try:
        source = Image.open(source_path).convert("RGBA")
        sheet = Image.open(sheet_path).convert("RGBA")
    except Exception as exc:
        raise SystemExit(f"ERROR: unreadable PNG input: {exc}")

    production = job["production"]
    proof = job["proof"]
    columns = int(production["gridColumns"])
    rows = int(production["gridRows"])
    if sheet.width % columns or sheet.height % rows:
        receipt = {
            "schemaVersion": 1,
            "family": "sprite-emote",
            "algorithmVersion": ALGORITHM_VERSION,
            "jobId": job["jobId"],
            "technicalStatus": "FAIL",
            "mechanicalIdentity": "FAIL",
            "visualIdentity": "REVIEW_REQUIRED",
            "failureReasons": ["sheet-dimensions-not-divisible-by-grid"],
            "inputs": {
                "job": repo_path(job_path),
                "sheet": repo_path(sheet_path),
                "sheetSha256": sha256_file(sheet_path),
                "actualCanvas": [sheet.width, sheet.height],
            },
        }
        write_json(output_dir / "receipt.json", receipt)
        return receipt

    cell_width = sheet.width // columns
    cell_height = sheet.height // rows
    requested_ratio = production["cellWidthPx"] / production["cellHeightPx"]
    actual_ratio = cell_width / cell_height
    aspect_error = abs(actual_ratio - requested_ratio) / requested_ratio
    source_palette = dominant_palette(source)
    atlas = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    state_results: list[StateResult] = []

    for index, state in enumerate(job["states"]):
        row, col = divmod(index, columns)
        raw = sheet.crop(
            (
                col * cell_width,
                row * cell_height,
                (col + 1) * cell_width,
                (row + 1) * cell_height,
            )
        )
        keyed = keyed_cell(raw, int(proof["chromaTolerance"]))
        bbox = alpha_bbox(keyed)
        foot = foot_contact(keyed, bbox)
        if bbox is None:
            height_occupancy = width_occupancy = 0.0
        else:
            width_occupancy = (bbox[2] - bbox[0]) / cell_width
            height_occupancy = (bbox[3] - bbox[1]) / cell_height
        metrics = {
            "contentBounds": normalized_bbox(bbox, cell_width, cell_height),
            "footX": foot[0] if foot else None,
            "footY": foot[1] if foot else None,
            "widthOccupancy": round(width_occupancy, 6),
            "heightOccupancy": round(height_occupancy, 6),
            "borderClearance": round(opaque_border_clearance(keyed), 6),
            "magentaEdgeResidue": round(magenta_edge_residue(keyed), 6),
            "sourcePaletteCoverage": round(palette_coverage(keyed, source_palette), 6),
            "heightPolicy": state.get("heightPolicy", "standard"),
        }
        trimmed = trim_with_padding(keyed)
        state_path = states_dir / f"{job['subject']['slug']}--{state['id']}.png"
        trimmed.save(state_path)
        atlas.alpha_composite(keyed, (col * cell_width, row * cell_height))
        state_results.append(
            StateResult(
                state=state,
                keyed=keyed,
                trimmed=trimmed,
                bbox=bbox,
                metrics=metrics,
                path=state_path,
            )
        )

    populated = [result for result in state_results if result.bbox is not None]
    foot_values = [
        float(result.metrics["footY"])
        for result in populated
        if result.metrics["footY"] is not None
    ]
    standard_heights = [
        float(result.metrics["heightOccupancy"])
        for result in populated
        if result.metrics["heightPolicy"] == "standard"
    ]
    compressed_heights = [
        float(result.metrics["heightOccupancy"])
        for result in populated
        if result.metrics["heightPolicy"] == "licensed-compression"
    ]
    median_foot = statistics.median(foot_values) if foot_values else 0.0
    median_height = statistics.median(standard_heights) if standard_heights else 0.0
    max_baseline_delta = (
        max(abs(value - median_foot) for value in foot_values) if foot_values else 1.0
    )
    max_relative_height_delta = (
        max(
            abs(value - median_height) / max(median_height, 0.0001)
            for value in standard_heights
        )
        if standard_heights
        else 1.0
    )
    compressed_height_ratios = [
        value / max(median_height, 0.0001) for value in compressed_heights
    ]

    gates = {
        "sourceHashMatchesJob": actual_source_hash == job["source"]["sha256"],
        "sheetDimensionsDivisibleByGrid": True,
        "cellAspectWithinTolerance": aspect_error <= proof["maximumCellAspectError"],
        "allRequiredStatesPopulated": len(populated) == len(job["states"]),
        "cellBordersClear": all(
            result.metrics["borderClearance"] >= proof["minimumBorderClearance"]
            for result in state_results
        ),
        "magentaEdgeResidueWithinLimit": all(
            result.metrics["magentaEdgeResidue"] <= proof["maximumMagentaEdgeResidue"]
            for result in state_results
        ),
        "sharedBaselineWithinTolerance": (
            len(foot_values) == len(job["states"])
            and max_baseline_delta <= proof["maximumBaselineDelta"]
        ),
        "relativeHeightWithinTolerance": (
            len(standard_heights) + len(compressed_heights) == len(job["states"])
            and max_relative_height_delta <= proof["maximumRelativeHeightDelta"]
        ),
        "licensedCompressionWithinEnvelope": all(
            proof["minimumLicensedCompressionRatio"]
            <= ratio
            <= proof["maximumLicensedCompressionRatio"]
            for ratio in compressed_height_ratios
        ),
        "sourcePaletteCoverageWithinBudget": all(
            result.metrics["sourcePaletteCoverage"]
            >= proof["minimumSourcePaletteCoverage"]
            for result in state_results
        ),
        "atlasDimensionsMatchSheet": atlas.size == sheet.size,
    }

    atlas_path = output_dir / "atlas.png"
    board_path = output_dir / "proof-board.png"
    metadata_path = output_dir / "atlas.json"
    receipt_path = output_dir / "receipt.json"
    visual_review_path = output_dir / "visual-review.json"
    atlas.save(atlas_path)
    proof_board(job, source, state_results, gates).save(board_path)

    atlas_states: dict[str, Any] = {}
    for index, result in enumerate(state_results):
        row, col = divmod(index, columns)
        x = col * cell_width
        y = row * cell_height
        atlas_states[result.state["id"]] = {
            "label": result.state["label"],
            "index": index,
            "frame": {"x": x, "y": y, "width": cell_width, "height": cell_height},
            "uv": {
                "u0": round(x / atlas.width, 8),
                "v0": round(y / atlas.height, 8),
                "u1": round((x + cell_width) / atlas.width, 8),
                "v1": round((y + cell_height) / atlas.height, 8),
            },
            "contentBounds": result.metrics["contentBounds"],
            "footX": result.metrics["footX"],
            "footY": result.metrics["footY"],
            "worldHeightFeet": job["source"].get("worldHeightFeet"),
            "statePath": repo_path(result.path),
            "stateSha256": sha256_file(result.path),
        }

    metadata = {
        "schemaVersion": 1,
        "family": "sprite-emote-atlas",
        "algorithmVersion": ALGORITHM_VERSION,
        "jobId": job["jobId"],
        "spriteSlug": job["subject"]["slug"],
        "sourceSha256": actual_source_hash,
        "atlasPath": repo_path(atlas_path),
        "atlasDimensions": [atlas.width, atlas.height],
        "grid": [columns, rows],
        "cellDimensions": [cell_width, cell_height],
        "order": "row-major",
        "states": atlas_states,
        "runtimeAdmission": "CANDIDATE",
    }
    write_json(metadata_path, metadata)
    write_json(
        visual_review_path,
        visual_review_template(job, receipt_path, board_path),
    )

    technical_pass = all(gates.values())
    receipt = {
        "schemaVersion": 1,
        "family": "sprite-emote",
        "algorithmVersion": ALGORITHM_VERSION,
        "jobId": job["jobId"],
        "spriteSlug": job["subject"]["slug"],
        "subjectKind": job["subject"]["kind"],
        "inputs": {
            "job": repo_path(job_path),
            "jobSha256": sha256_file(job_path),
            "source": repo_path(source_path),
            "sourceSha256": actual_source_hash,
            "sheet": repo_path(sheet_path),
            "sheetSha256": sha256_file(sheet_path),
        },
        "generation": {
            "provider": job.get("generation", {}).get("provider"),
            "model": job.get("generation", {}).get("model"),
            "generationCallId": job.get("generation", {}).get("generationCallId"),
            "seed": job.get("generation", {}).get("seed"),
            "promptPath": job.get("generation", {}).get("promptPath"),
        },
        "format": {
            "requestedCanvas": production["requestedCanvas"],
            "actualCanvas": [sheet.width, sheet.height],
            "requestedCellAspect": production["cellAspect"],
            "requestedCellDimensions": [
                production["cellWidthPx"],
                production["cellHeightPx"],
            ],
            "actualDerivedCellDimensions": [cell_width, cell_height],
            "cellAspectRelativeError": round(aspect_error, 6),
            "stateCountExpected": len(job["states"]),
            "stateCountObserved": len(populated),
        },
        "crossStateMetrics": {
            "medianFootY": round(median_foot, 6),
            "maximumBaselineDelta": round(max_baseline_delta, 6),
            "medianHeightOccupancy": round(median_height, 6),
            "maximumRelativeHeightDelta": round(max_relative_height_delta, 6),
            "licensedCompressionRatios": [
                round(value, 6) for value in compressed_height_ratios
            ],
        },
        "states": {
            result.state["id"]: {
                **result.metrics,
                "path": repo_path(result.path),
                "sha256": sha256_file(result.path),
            }
            for result in state_results
        },
        "gates": gates,
        "mechanicalIdentity": "PASS" if technical_pass else "FAIL",
        "visualIdentity": "REVIEW_REQUIRED",
        "tasteStatus": "REVIEW_REQUIRED",
        "runtimeAdmission": "CANDIDATE",
        "technicalStatus": "PASS" if technical_pass else "FAIL",
        "failureReasons": [name for name, passed in gates.items() if not passed],
        "outputs": {
            "atlas": repo_path(atlas_path),
            "atlasSha256": sha256_file(atlas_path),
            "metadata": repo_path(metadata_path),
            "metadataSha256": sha256_file(metadata_path),
            "proofBoard": repo_path(board_path),
            "proofBoardSha256": sha256_file(board_path),
            "visualReview": repo_path(visual_review_path),
            "visualReviewSha256": sha256_file(visual_review_path),
        },
    }
    write_json(receipt_path, receipt)
    return receipt


def recolor_unrelated(image: Image.Image) -> Image.Image:
    result = image.convert("RGBA")
    px = result.load()
    for y in range(result.height):
        for x in range(result.width):
            r, g, b, a = px[x, y]
            if a >= ALPHA_CUTOFF:
                # A deliberately unrelated high-cyan synthetic negative palette.
                luminance = (r + g + b) // 3
                px[x, y] = (0, min(255, 140 + luminance // 3), 255, a)
    return result


def synthetic_emote_sheet(
    job: dict[str, Any],
    mutation: str | None = None,
) -> Image.Image:
    production = job["production"]
    source = Image.open(resolve_repo_path(job["source"]["path"])).convert("RGBA")
    cell_width = production["cellWidthPx"]
    cell_height = production["cellHeightPx"]
    columns = production["gridColumns"]
    rows = production["gridRows"]
    sheet = Image.new(
        "RGBA",
        (cell_width * columns, cell_height * rows),
        (*CHROMA_RGB, 255),
    )
    source_bbox = alpha_bbox(source)
    source_height = (source_bbox[3] - source_bbox[1]) if source_bbox else source.height
    target_height = round(cell_height * 0.62)
    scale = target_height / max(1, source_height)
    sprite = source.resize(
        (max(1, round(source.width * scale)), max(1, round(source.height * scale))),
        Image.Resampling.NEAREST,
    )
    sprite_bbox = alpha_bbox(sprite)
    if sprite_bbox:
        sprite = sprite.crop(sprite_bbox)
    baseline = round(cell_height * 0.88)

    for index, _state in enumerate(job["states"]):
        if mutation == "missing-state" and index == len(job["states"]) - 1:
            continue
        row, col = divmod(index, columns)
        item = sprite
        if mutation == "palette-drift" and index == len(job["states"]) - 1:
            item = recolor_unrelated(sprite)
        x = col * cell_width + (cell_width - item.width) // 2
        y = row * cell_height + baseline - item.height
        if mutation == "baseline-drift" and index == len(job["states"]) - 1:
            y -= round(cell_height * 0.18)
        sheet.alpha_composite(item, (x, y))

    if mutation == "boundary-contamination":
        draw = ImageDraw.Draw(sheet)
        # Non-key pixels touch the left boundary of the first cell.
        draw.rectangle((0, cell_height // 2, 8, cell_height // 2 + 20), fill=(255, 80, 40, 255))
    return sheet


def run_emote_self_test(output_dir: Path, force: bool = False) -> dict[str, Any]:
    assert_quarantine_output(output_dir)
    if output_dir.exists() and any(output_dir.iterdir()):
        if not force:
            raise SystemExit(
                f"ERROR: self-test output is not empty: {repo_path(output_dir)} (use --force)"
            )
        guarded_remove_tree(output_dir)
    jobs_dir = output_dir / "jobs"
    fixtures_dir = output_dir / "fixtures"
    runs_dir = output_dir / "runs"
    fixtures_dir.mkdir(parents=True, exist_ok=True)

    results: list[dict[str, Any]] = []
    jobs: dict[str, tuple[dict[str, Any], Path]] = {}
    for slug in SELF_TEST_SLUGS:
        job, job_path, _prompt_path = create_emote_job(slug, jobs_dir, force=True)
        jobs[slug] = (job, job_path)
        sheet_path = fixtures_dir / f"{slug}--valid.png"
        synthetic_emote_sheet(job).save(sheet_path)
        receipt = ingest_emote_job(
            job_path,
            sheet_path,
            runs_dir / slug / "valid",
            force=True,
        )
        results.append(
            {
                "fixture": f"{slug}:valid-transport",
                "expected": "PASS",
                "actual": receipt["technicalStatus"],
                "receipt": repo_path(runs_dir / slug / "valid" / "receipt.json"),
            }
        )

    negative_slug = "spr-fantasy-goblin-warrior"
    negative_job, negative_job_path = jobs[negative_slug]
    for mutation in (
        "missing-state",
        "baseline-drift",
        "palette-drift",
        "boundary-contamination",
    ):
        sheet_path = fixtures_dir / f"{negative_slug}--{mutation}.png"
        synthetic_emote_sheet(negative_job, mutation=mutation).save(sheet_path)
        receipt = ingest_emote_job(
            negative_job_path,
            sheet_path,
            runs_dir / negative_slug / mutation,
            force=True,
        )
        results.append(
            {
                "fixture": f"{negative_slug}:{mutation}",
                "expected": "FAIL",
                "actual": receipt["technicalStatus"],
                "failureReasons": receipt.get("failureReasons", []),
                "receipt": repo_path(runs_dir / negative_slug / mutation / "receipt.json"),
            }
        )

    review_source = runs_dir / SELF_TEST_SLUGS[0] / "valid" / "visual-review.json"
    pass_review = load_json(review_source)
    pass_review["reviewer"] = "Assetforge self-test"
    pass_review["reviewedOn"] = date.today().isoformat()
    for state in pass_review["states"].values():
        state["verdict"] = "PASS"
        state["checks"] = {name: "PASS" for name in state["checks"]}
    pass_review_path = output_dir / "reviews" / "all-pass.json"
    write_json(pass_review_path, pass_review)
    pass_review_result = compile_visual_review(
        pass_review_path,
        output_dir / "reviews" / "all-pass-receipt.json",
    )
    results.append(
        {
            "fixture": "visual-review:all-checks-pass",
            "expected": "PASS",
            "actual": pass_review_result["visualIdentity"],
            "receipt": repo_path(output_dir / "reviews" / "all-pass-receipt.json"),
        }
    )

    fail_review = json.loads(json.dumps(pass_review))
    fail_review["states"]["rear-view"]["verdict"] = "FAIL"
    fail_review["states"]["rear-view"]["checks"]["anatomyAndHands"] = "FAIL"
    fail_review["states"]["rear-view"]["notes"] = "Synthetic malformed-hand negative control."
    fail_review_path = output_dir / "reviews" / "rear-hand-fail.json"
    write_json(fail_review_path, fail_review)
    fail_review_result = compile_visual_review(
        fail_review_path,
        output_dir / "reviews" / "rear-hand-fail-receipt.json",
    )
    results.append(
        {
            "fixture": "visual-review:rear-hand-fail",
            "expected": "FAIL",
            "actual": fail_review_result["visualIdentity"],
            "failedChecks": fail_review_result["failedChecks"],
            "receipt": repo_path(output_dir / "reviews" / "rear-hand-fail-receipt.json"),
        }
    )

    try:
        assert_quarantine_output(ROOT / "assets" / "unsafe-emote-output")
        live_output_rejected = False
    except SystemExit:
        live_output_rejected = True
    passed = all(item["actual"] == item["expected"] for item in results) and live_output_rejected
    summary = {
        "schemaVersion": 1,
        "suite": "assetforge-sprite-emote-v1",
        "algorithmVersion": ALGORITHM_VERSION,
        "technicalStatus": "PASS" if passed else "FAIL",
        "fixtures": results,
        "assertions": {
            "pcAccepted": results[0]["actual"] == "PASS",
            "npcAccepted": results[1]["actual"] == "PASS",
            "humanoidMonsterAccepted": results[2]["actual"] == "PASS",
            "nonHumanoidMonsterAccepted": results[3]["actual"] == "PASS",
            "missingStateRejected": results[4]["actual"] == "FAIL",
            "baselineDriftRejected": results[5]["actual"] == "FAIL",
            "paletteDriftRejected": results[6]["actual"] == "FAIL",
            "boundaryContaminationRejected": results[7]["actual"] == "FAIL",
            "completeVisualReviewAccepted": results[8]["actual"] == "PASS",
            "rearHandVisualFailureRejected": results[9]["actual"] == "FAIL",
            "liveAssetOutputRejected": live_output_rejected,
        },
    }
    write_json(output_dir / "self-test-receipt.json", summary)
    return summary


def parse_states(path: Path | None) -> tuple[dict[str, str], ...]:
    if path is None:
        return GENESIS_EMOTE_CORE
    value = load_json(path)
    if not isinstance(value, list):
        raise SystemExit("ERROR: --states JSON must be an array")
    required = {"id", "label", "cue"}
    for index, state in enumerate(value):
        if not isinstance(state, dict) or not required.issubset(state):
            raise SystemExit(
                f"ERROR: state {index} must be an object with id, label, and cue"
            )
    return tuple(value)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    families = parser.add_subparsers(dest="family", required=True)
    emote = families.add_parser("emote", help="discrete sprite-emote compiler")
    actions = emote.add_subparsers(dest="action", required=True)

    init = actions.add_parser("init", help="write a versioned emote job and exact prompt packet")
    init.add_argument("slug", help="registered monster, NPC, or PC sprite slug")
    init.add_argument("--version", type=int, default=1)
    init.add_argument("--states", type=Path, help="JSON array of six {id,label,cue} states")
    init.add_argument(
        "--cell-aspect",
        choices=("4:6", "4:5", "1:1", "5:4", "3:2"),
        help="explicit provisional aspect override; default derives from the source contract",
    )
    init.add_argument("--jobs-dir", type=Path, default=DEFAULT_EMOTE_ROOT / "jobs")
    init.add_argument("--force", action="store_true")

    ingest = actions.add_parser("ingest", help="compile and prove a returned emote sheet")
    ingest.add_argument("job", type=Path)
    ingest.add_argument("sheet", type=Path)
    ingest.add_argument("--output-dir", type=Path)
    ingest.add_argument("--force", action="store_true")

    test = actions.add_parser("self-test", help="run positive class fixtures and red-first controls")
    test.add_argument("--output-dir", type=Path, default=DEFAULT_EMOTE_ROOT / "self-test")
    test.add_argument("--force", action="store_true")

    review = actions.add_parser(
        "review",
        help="compile a filled visual anatomy/identity checklist into an admission receipt",
    )
    review.add_argument("review", type=Path)
    review.add_argument("--output", type=Path)
    register_app_parsers(families)
    return parser


def main() -> None:
    args = build_parser().parse_args()
    if args.family == "emote" and args.action == "init":
        job, manifest_path, prompt_path = create_emote_job(
            args.slug,
            args.jobs_dir,
            version=args.version,
            states=parse_states(args.states),
            cell_aspect_override=args.cell_aspect,
            force=args.force,
        )
        print(
            json.dumps(
                {
                    "status": "OK",
                    "jobId": job["jobId"],
                    "job": repo_path(manifest_path),
                    "prompt": repo_path(prompt_path),
                    "sourceSha256": job["source"]["sha256"],
                    "runtimeAdmission": "CANDIDATE",
                },
                indent=2,
            )
        )
        return

    if args.family == "emote" and args.action == "ingest":
        receipt = ingest_emote_job(
            args.job,
            args.sheet,
            output_dir=args.output_dir,
            force=args.force,
        )
        print(json.dumps(receipt, indent=2))
        if receipt.get("technicalStatus") != "PASS":
            raise SystemExit(1)
        return

    if args.family == "emote" and args.action == "self-test":
        summary = run_emote_self_test(args.output_dir, force=args.force)
        print(json.dumps(summary, indent=2))
        if summary["technicalStatus"] != "PASS":
            raise SystemExit(1)
        return

    if args.family == "emote" and args.action == "review":
        result = compile_visual_review(args.review, args.output)
        print(json.dumps(result, indent=2))
        if result["visualIdentity"] != "PASS":
            raise SystemExit(1)
        return

    app_result = dispatch_apps(args)
    if app_result is not None:
        if app_result:
            raise SystemExit(app_result)
        return

    raise SystemExit("ERROR: unsupported Assetforge command")


if __name__ == "__main__":
    main()
