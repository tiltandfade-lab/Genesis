#!/usr/bin/env python3
"""Audit the staged Kenney donor corpus and select a pack-balanced admission set.

This is an offline build tool. It never edits runtime registries or production modules.
"""

from __future__ import annotations

import argparse
import collections
import hashlib
import json
import math
import os
import re
import sys
from pathlib import Path

TOOLS = Path(os.environ.get("GENESIS_OFFLINE_ART_TOOLS", "/private/tmp/genesis-offline-art-tools"))
sys.path.insert(0, str(TOOLS))

import numpy as np
import trimesh


PACKS = (
    "brick-kit", "building-kit", "castle-kit", "city-kit-industrial", "factory-kit",
    "fantasy-town-kit", "food-kit", "furniture-kit", "modular-cave-kit", "nature-kit",
    "pirate-kit", "retro-fantasy-kit", "survival-kit",
)

ROLE_WORDS = {
    "architecture": {"wall", "floor", "roof", "door", "gate", "window", "stairs", "stair", "bridge", "fence", "border", "pillar", "column", "building", "corridor", "room", "battlement", "brick", "tower", "chimney", "balcony", "arch", "railing"},
    "furniture": {"chair", "table", "bed", "bench", "cabinet", "shelf", "desk", "couch", "sofa", "stool", "drawer", "mirror", "sink", "bath", "toilet", "counter", "bookcase"},
    "container": {"barrel", "box", "crate", "chest", "bag", "basket", "bottle", "bucket", "sack", "urn", "coffin", "jar"},
    "practical-light": {"lamp", "lantern", "candle", "torch", "fire", "brazier", "lightpost", "light", "flame"},
    "mechanism": {"lever", "button", "switch", "conveyor", "pipe", "gear", "wheel", "machine", "valve", "generator", "piston", "vent", "crane"},
    "wilderness": {"tree", "rock", "bush", "plant", "grass", "flower", "trunk", "log", "mushroom", "pine", "cactus", "reed", "cliff", "river", "path", "crop"},
    "food": {"apple", "bread", "meat", "fish", "fruit", "vegetable", "cheese", "cake", "bowl", "plate", "cup", "mug", "food"},
    "tool-weapon": {"sword", "axe", "hammer", "shovel", "pickaxe", "spear", "shield", "cannon", "weapon", "tool", "blade", "anchor"},
    "sign-dressing": {"sign", "banner", "flag", "arrow", "carpet", "rug", "painting", "poster", "decal", "cloth"},
}

MODIFIERS = {
    "small", "medium", "large", "tall", "short", "wide", "narrow", "long", "half", "double",
    "corner", "inner", "outer", "round", "square", "curved", "straight", "diagonal", "end",
    "damaged", "broken", "open", "closed", "empty", "full", "high", "low", "top", "base",
    "wood", "stone", "metal", "paint", "old", "hq", "lq", "bevel", "detail", "frame", "support",
}
VARIANT_TOKENS = MODIFIERS | {chr(c) for c in range(ord("a"), ord("z") + 1)} | {str(i) for i in range(1, 100)}

QUOTAS = {
    "architecture": 36,
    "furniture": 20,
    "container": 16,
    "mechanism": 16,
    "practical-light": 8,
    "wilderness": 22,
    "tool-weapon": 10,
    "sign-dressing": 8,
    "food": 8,
    "other": 6,
}

HIGH_VALUE = {
    "wall", "door", "doorway", "window", "stairs", "bridge", "cliff", "rock", "tree",
    "table", "chair", "bench", "cabinet", "shelf", "crate", "chest", "barrel", "urn",
    "lantern", "lamp", "candle", "torch", "lever", "switch", "pipe", "sign", "banner",
    "fountain", "altar", "shrine", "cage", "well", "column", "pillar", "rope",
}


def tokens_for(stem: str) -> list[str]:
    stem = re.sub(r"([a-z])([A-Z])", r"\1-\2", stem).lower()
    return [token for token in re.split(r"[^a-z0-9]+", stem) if token]


def role_for(tokens: list[str]) -> str:
    scores = {role: len(set(tokens) & words) for role, words in ROLE_WORDS.items()}
    winner, score = max(scores.items(), key=lambda item: (item[1], item[0]))
    return winner if score else "other"


def family_for(tokens: list[str]) -> str:
    core = [token for token in tokens if token not in VARIANT_TOKENS]
    return "-".join(core) if core else (tokens[0] if tokens else "unknown")


def safe_float(value) -> float | None:
    try:
        value = float(value)
    except (TypeError, ValueError):
        return None
    return round(value, 6) if math.isfinite(value) else None


def topology(mesh: trimesh.Trimesh) -> dict:
    return {
        "vertices": int(len(mesh.vertices)),
        "faces": int(len(mesh.faces)),
        "watertight": bool(mesh.is_watertight),
        "windingConsistent": bool(mesh.is_winding_consistent),
        "bodyCount": int(mesh.body_count),
        "eulerNumber": int(mesh.euler_number),
    }


def canonical_topology(mesh: trimesh.Trimesh) -> dict:
    clean = mesh.copy()
    clean.remove_infinite_values()
    clean.merge_vertices(merge_tex=False, merge_norm=False)
    clean.update_faces(clean.nondegenerate_faces())
    clean.update_faces(clean.unique_faces())
    clean.remove_unreferenced_vertices()
    return topology(clean)


def inspect(path: Path, pack: str) -> dict:
    tokens = tokens_for(path.stem)
    record = {
        "path": path.as_posix(),
        "pack": pack,
        "name": path.name,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "bytes": path.stat().st_size,
        "tokens": tokens,
        "role": role_for(tokens),
        "family": family_for(tokens),
        "modifiers": sorted(set(tokens) & MODIFIERS),
    }
    try:
        scene = trimesh.load(path, force="scene", process=False)
        meshes = [geometry for geometry in scene.geometry.values() if isinstance(geometry, trimesh.Trimesh)]
        bounds = np.asarray(scene.bounds, dtype=float)
        extents = bounds[1] - bounds[0] if bounds.shape == (2, 3) else np.zeros(3)
        finite = all(np.isfinite(mesh.vertices).all() and np.isfinite(mesh.faces).all() for mesh in meshes)
        raw = [topology(mesh) for mesh in meshes]
        canonical = [canonical_topology(mesh) for mesh in meshes]
        record.update({
            "loadError": None,
            "geometryCount": len(meshes),
            "vertices": sum(item["vertices"] for item in raw),
            "faces": sum(item["faces"] for item in raw),
            "bounds": [[safe_float(x) for x in row] for row in bounds] if bounds.shape == (2, 3) else None,
            "extents": [safe_float(x) for x in extents],
            "groundOffsetY": safe_float(bounds[0][1]) if bounds.shape == (2, 3) else None,
            "finite": bool(finite),
            "flatAxisCount": int(sum(float(x) < 1e-6 for x in extents)),
            "allHaveUv": all(hasattr(mesh.visual, "uv") and mesh.visual.uv is not None for mesh in meshes),
            "allWindingConsistent": all(item["windingConsistent"] for item in raw),
            "rawTopology": raw,
            "canonicalTopology": canonical,
        })
    except Exception as exc:
        record.update({
            "loadError": f"{type(exc).__name__}: {exc}", "geometryCount": 0, "vertices": 0,
            "faces": 0, "bounds": None, "extents": None, "groundOffsetY": None,
            "finite": False, "flatAxisCount": 3, "allHaveUv": False,
            "allWindingConsistent": False, "rawTopology": [], "canonicalTopology": [],
        })
    return record


def quality(record: dict) -> float:
    if record["loadError"] or not record["finite"] or record["faces"] <= 0:
        return -1e9
    score = 0.0
    score += 8.0 if record["allHaveUv"] else -4.0
    score += 4.0 if record["allWindingConsistent"] else -8.0
    score += 7.0 if 12 <= record["faces"] <= 800 else 2.0 if record["faces"] <= 1800 else -4.0
    score += 6.0 if record["flatAxisCount"] == 0 else -2.0
    score += 3.0 * len(set(record["tokens"]) & HIGH_VALUE)
    score += 2.0 if record["modifiers"] else 0.0
    return score


def admission_class(role: str) -> str:
    if role in {"furniture", "container"}:
        return "CHASSIS"
    if role in {"mechanism", "tool-weapon", "sign-dressing"}:
        return "PART_DONOR"
    return "DIRECT_MODULATED"


def select(records: list[dict]) -> list[dict]:
    selected = []
    selected_paths = set()
    pack_counts = collections.Counter()
    for role, quota in QUOTAS.items():
        candidates = sorted(
            (record for record in records if record["role"] == role),
            key=lambda record: (-quality(record), record["pack"], record["family"], record["name"]),
        )
        family_counts = collections.Counter()
        for record in candidates:
            if len([item for item in selected if item["role"] == role]) >= quota:
                break
            if quality(record) < 0 or record["path"] in selected_paths:
                continue
            if family_counts[(record["pack"], record["family"])] >= 2:
                continue
            if pack_counts[record["pack"]] >= 30:
                continue
            item = {
                "path": record["path"], "pack": record["pack"], "name": record["name"],
                "sha256": record["sha256"], "role": role, "family": record["family"],
                "modifiers": record["modifiers"], "faces": record["faces"],
                "extents": record["extents"], "admissionClass": admission_class(role),
                "intendedPart": f"{role}/{record['family']}",
                "reviewStatus": "CANDIDATE",
            }
            selected.append(item)
            selected_paths.add(record["path"])
            family_counts[(record["pack"], record["family"])] += 1
            pack_counts[record["pack"]] += 1
    return selected


def report_markdown(records: list[dict], selected: list[dict]) -> str:
    roles = collections.Counter(item["role"] for item in records)
    packs = collections.Counter(item["pack"] for item in records)
    selected_roles = collections.Counter(item["role"] for item in selected)
    selected_packs = collections.Counter(item["pack"] for item in selected)
    failures = [item for item in records if item["loadError"]]
    invalid = [item for item in records if not item["finite"]]
    flat = [item for item in records if item["flatAxisCount"]]
    lines = [
        "# Kenney donor corpus audit report", "",
        "Generated by `dev/model-foundry/kenney_audit.py`. Do not hand-edit counts.", "",
        f"- Assets inspected: **{len(records)}**", f"- Load failures: **{len(failures)}**",
        f"- Non-finite assets: **{len(invalid)}**", f"- Assets with one or more flat axes: **{len(flat)}**",
        f"- Candidate admission set: **{len(selected)}**", "",
        "## Pack coverage", "", "| pack | source | selected |", "| --- | ---: | ---: |",
    ]
    for pack in sorted(packs):
        lines.append(f"| {pack} | {packs[pack]} | {selected_packs[pack]} |")
    lines.extend(["", "## Role coverage", "", "| role | source | selected |", "| --- | ---: | ---: |"])
    for role in sorted(roles):
        lines.append(f"| {role} | {roles[role]} | {selected_roles[role]} |")
    lines.extend(["", "## Interpretation", "",
        "The admission set is a review queue, not an automatic runtime registry. Full source packs remain available.",
        "Candidates require canonical renders, semantic socket review, and Genesis material treatment before promotion.",
        "Flat-axis records are diagnostic: floors, cards, and panes may be intentionally planar.", "",
    ])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--models-root", type=Path, default=Path("assets/models"))
    parser.add_argument("--out-dir", type=Path, default=Path("dev/model-foundry"))
    args = parser.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)

    records = []
    for slug in PACKS:
        pack = f"kenney-{slug}"
        for path in sorted((args.models_root / pack).glob("*.glb")):
            records.append(inspect(path, pack))
    selected = select(records)

    census = {
        "schema": "genesis.kenney-mesh-census.v1",
        "assetCount": len(records),
        "packCount": len(PACKS),
        "loadFailures": sum(bool(item["loadError"]) for item in records),
        "assets": records,
    }
    admission = {
        "schema": "genesis.kenney-donor-admission.v1",
        "policy": "Candidates only. Runtime admission requires canonical render and semantic review.",
        "candidateCount": len(selected),
        "candidates": selected,
    }
    (args.out_dir / "kenney-census.json").write_text(json.dumps(census, indent=2) + "\n")
    (args.out_dir / "kenney-admission-manifest.json").write_text(json.dumps(admission, indent=2) + "\n")
    (args.out_dir / "KENNEY-AUDIT-REPORT.md").write_text(report_markdown(records, selected))
    print(json.dumps({
        "assets": len(records), "loadFailures": census["loadFailures"], "candidates": len(selected),
        "candidatePacks": dict(collections.Counter(item["pack"] for item in selected)),
        "candidateRoles": dict(collections.Counter(item["role"] for item in selected)),
    }, indent=2))


if __name__ == "__main__":
    main()
