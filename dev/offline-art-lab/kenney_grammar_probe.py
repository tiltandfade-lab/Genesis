#!/usr/bin/env python3
"""Extract a procedural parts grammar from staged Kenney GLBs.

The output describes reusable roles, modifier vocabulary, variant families, scale/complexity bands,
and low-complexity donor candidates. It does not install any mesh into the game.
"""

from __future__ import annotations

import argparse
import collections
import json
import os
import re
import sys
from pathlib import Path

TOOLS = Path(os.environ.get("GENESIS_OFFLINE_ART_TOOLS", "/private/tmp/genesis-offline-art-tools"))
sys.path.insert(0, str(TOOLS))

import numpy as np
import trimesh


ROLES = {
    "architecture": {"wall", "floor", "roof", "door", "gate", "window", "stairs", "stair", "bridge", "fence", "border", "pillar", "column", "building", "corridor", "room", "battlement", "brick", "tower", "chimney", "balcony"},
    "furniture": {"chair", "table", "bed", "bench", "cabinet", "shelf", "desk", "couch", "sofa", "stool", "drawer", "mirror", "sink", "bath", "toilet"},
    "container": {"barrel", "box", "crate", "chest", "bag", "basket", "bottle", "bucket", "sack", "urn", "coffin"},
    "practical-light": {"lamp", "lantern", "candle", "torch", "fire", "brazier", "lightpost", "light", "flame"},
    "mechanism": {"lever", "button", "switch", "conveyor", "pipe", "gear", "wheel", "machine", "valve", "generator", "piston", "vent"},
    "wilderness": {"tree", "rock", "bush", "plant", "grass", "flower", "trunk", "log", "mushroom", "pine", "cactus", "reed"},
    "food": {"apple", "bread", "meat", "fish", "fruit", "vegetable", "cheese", "cake", "bowl", "plate", "cup", "mug", "food"},
    "tool-weapon": {"sword", "axe", "hammer", "shovel", "pickaxe", "spear", "shield", "cannon", "weapon", "tool", "blade"},
    "sign-dressing": {"sign", "banner", "flag", "arrow", "carpet", "rug", "painting", "poster", "decal"},
}
MODIFIERS = {
    "small", "medium", "large", "tall", "short", "wide", "narrow", "long", "half", "double",
    "corner", "inner", "outer", "round", "square", "curved", "straight", "diagonal", "end",
    "damaged", "broken", "open", "closed", "empty", "full", "high", "low", "top", "base",
    "wood", "stone", "metal", "paint", "old", "hq", "bevel", "detail", "frame", "support",
}
VARIANT_TOKENS = MODIFIERS | {chr(c) for c in range(ord("a"), ord("z") + 1)} | {str(i) for i in range(1, 10)}


def tokens_for(stem: str) -> list[str]:
    stem = re.sub(r"([a-z])([A-Z])", r"\1-\2", stem).lower()
    return [token for token in re.split(r"[^a-z0-9]+", stem) if token]


def role_for(tokens: list[str]) -> str:
    scores = {role: len(set(tokens) & words) for role, words in ROLES.items()}
    winner, score = max(scores.items(), key=lambda item: item[1])
    return winner if score else "other"


def family_for(tokens: list[str]) -> str:
    core = [token for token in tokens if token not in VARIANT_TOKENS]
    return "-".join(core) if core else "-".join(tokens[:1])


def inspect(path: Path, pack: str) -> dict:
    try:
        scene = trimesh.load(path, force="scene", process=False)
        vertices = sum(len(g.vertices) for g in scene.geometry.values() if isinstance(g, trimesh.Trimesh))
        faces = sum(len(g.faces) for g in scene.geometry.values() if isinstance(g, trimesh.Trimesh))
        bounds = np.asarray(scene.bounds, dtype=float)
        extents = bounds[1] - bounds[0] if bounds.shape == (2, 3) else np.zeros(3)
        error = None
    except Exception as exc:
        vertices, faces, extents, error = 0, 0, np.zeros(3), str(exc)
    tokens = tokens_for(path.stem)
    return {
        "pack": pack, "name": path.name, "tokens": tokens, "role": role_for(tokens),
        "family": family_for(tokens), "modifiers": sorted(set(tokens) & MODIFIERS),
        "vertices": int(vertices), "faces": int(faces),
        "extents": [round(float(x), 6) for x in extents], "error": error,
    }


def percentile(values: list[int], p: int) -> int:
    return int(np.percentile(values, p)) if values else 0


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--staged-root", type=Path, default=Path("/private/tmp/genesis-offline-art-results/kenney/glb"))
    parser.add_argument("--out-dir", type=Path, default=Path("/private/tmp/genesis-offline-art-results/kenney"))
    args = parser.parse_args(); args.out_dir.mkdir(parents=True, exist_ok=True)

    records = []
    for pack_dir in sorted(p for p in args.staged_root.iterdir() if p.is_dir()):
        for path in sorted(pack_dir.glob("*.glb")):
            records.append(inspect(path, pack_dir.name))

    role_counts = collections.Counter(r["role"] for r in records)
    modifier_counts = collections.Counter(m for r in records for m in r["modifiers"])
    pack_counts = collections.Counter(r["pack"] for r in records)
    family_groups = collections.defaultdict(list)
    for record in records:
        family_groups[(record["pack"], record["family"])].append(record)
    families = []
    for (pack, family), members in family_groups.items():
        if len(members) >= 2:
            families.append({
                "pack": pack, "family": family, "count": len(members),
                "roles": sorted(set(m["role"] for m in members)),
                "modifiers": sorted(set(x for m in members for x in m["modifiers"])),
                "examples": [m["name"] for m in members[:10]],
            })
    families.sort(key=lambda x: (-x["count"], x["pack"], x["family"]))

    donor_candidates = {}
    for role in ROLES:
        candidates = sorted((r for r in records if r["role"] == role and not r["error"]), key=lambda r: (r["faces"], r["name"]))
        donor_candidates[role] = [{k: r[k] for k in ("pack", "name", "family", "faces", "extents")} for r in candidates[:12]]

    face_values = [r["faces"] for r in records if not r["error"]]
    report = {
        "schema": "genesis.kenney-grammar-probe.v1",
        "assetCount": len(records), "loadFailures": sum(bool(r["error"]) for r in records),
        "packCounts": dict(sorted(pack_counts.items())), "roleCounts": dict(role_counts.most_common()),
        "modifierCounts": dict(modifier_counts.most_common()),
        "complexityFaces": {"p10": percentile(face_values, 10), "p50": percentile(face_values, 50), "p90": percentile(face_values, 90), "max": max(face_values, default=0)},
        "variantFamilyCount": len(families), "largestVariantFamilies": families[:80],
        "lowComplexityDonorCandidates": donor_candidates,
    }
    (args.out_dir / "grammar.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({k: report[k] for k in ("assetCount", "loadFailures", "packCounts", "roleCounts", "modifierCounts", "complexityFaces", "variantFamilyCount")}, indent=2))


if __name__ == "__main__":
    main()
