#!/usr/bin/env python3
"""Headless mesh census and repair proof using Trimesh."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

TOOLS = Path(os.environ.get("GENESIS_OFFLINE_ART_TOOLS", "/private/tmp/genesis-offline-art-tools"))
sys.path.insert(0, str(TOOLS))

import numpy as np
import trimesh


REPO = Path(__file__).resolve().parents[2]
DEFAULT_OUT = Path("/private/tmp/genesis-offline-art-results/mesh")
DEFAULT_ASSETS = [
    "assets/models/kenney-mini-dungeon/chest.glb",
    "assets/models/kenney-mini-dungeon/gate.glb",
    "assets/models/kenney-mini-dungeon/column.glb",
    "assets/models/kenney-modular-dungeon-kit/stairs.glb",
    "assets/models/kenney-graveyard-kit/coffin-old.glb",
    "assets/models/kenney-graveyard-kit/lightpost-all.glb",
    "dev/model-qa/glb/grunt.glb",
]


def duplicate_face_count(faces: np.ndarray) -> int:
    if len(faces) == 0:
        return 0
    canonical = np.sort(faces, axis=1)
    return int(len(canonical) - len(np.unique(canonical, axis=0)))


def mesh_stats(mesh: trimesh.Trimesh) -> dict:
    extents = np.asarray(mesh.extents, dtype=float)
    positive = extents[extents > 1e-9]
    aspect = float(positive.max() / positive.min()) if len(positive) else 0.0
    nondegenerate = mesh.nondegenerate_faces()
    referenced = np.unique(mesh.faces.reshape(-1)) if len(mesh.faces) else np.array([], dtype=int)
    uv = getattr(mesh.visual, "uv", None)
    return {
        "vertices": int(len(mesh.vertices)), "faces": int(len(mesh.faces)),
        "extents": [round(float(v), 6) for v in extents], "aspectRatio": round(aspect, 5),
        "surfaceArea": round(float(mesh.area), 6), "volume": round(float(abs(mesh.volume)), 6) if mesh.is_volume else None,
        "watertight": bool(mesh.is_watertight), "windingConsistent": bool(mesh.is_winding_consistent),
        "isVolume": bool(mesh.is_volume), "bodyCount": int(mesh.body_count), "eulerNumber": int(mesh.euler_number),
        "degenerateFaces": int(len(mesh.faces) - int(nondegenerate.sum())),
        "duplicateFaces": duplicate_face_count(mesh.faces),
        "unreferencedVertices": int(len(mesh.vertices) - len(referenced)),
        "hasUv": bool(uv is not None and len(uv) == len(mesh.vertices)),
    }


def inspect_asset(path: Path) -> dict:
    loaded = trimesh.load(path, force="scene", process=False)
    geometries = []
    for name, geometry in loaded.geometry.items():
        if isinstance(geometry, trimesh.Trimesh):
            raw = mesh_stats(geometry)
            canonical = trimesh.Trimesh(vertices=geometry.vertices.copy(), faces=geometry.faces.copy(), process=True, validate=True)
            canonical_stats = mesh_stats(canonical)
            geometries.append({
                "name": name, **raw,
                "canonicalizedTopology": {
                    key: canonical_stats[key] for key in (
                        "vertices", "faces", "watertight", "windingConsistent", "isVolume",
                        "bodyCount", "degenerateFaces", "duplicateFaces", "unreferencedVertices"
                    )
                },
            })
    return {
        "path": str(path.relative_to(REPO)), "geometryCount": len(geometries),
        "vertices": sum(g["vertices"] for g in geometries), "faces": sum(g["faces"] for g in geometries),
        "allWatertight": all(g["watertight"] for g in geometries),
        "allWatertightAfterCanonicalization": all(g["canonicalizedTopology"]["watertight"] for g in geometries),
        "allWindingConsistent": all(g["windingConsistent"] for g in geometries),
        "allHaveUv": all(g["hasUv"] for g in geometries), "geometries": geometries,
    }


def broken_fixture() -> trimesh.Trimesh:
    box = trimesh.creation.box(extents=(2.0, 1.0, 1.5))
    vertices = np.vstack((box.vertices, [[6, 6, 6], [3, 0, 0], [3, 1, 0], [3, 0, 1]]))
    faces = np.vstack((box.faces, box.faces[0], [0, 0, 1], [len(box.vertices) + 1, len(box.vertices) + 2, len(box.vertices) + 3]))
    faces[1] = faces[1][::-1]
    return trimesh.Trimesh(vertices=vertices, faces=faces, process=False)


def repair(mesh: trimesh.Trimesh) -> trimesh.Trimesh:
    fixed = mesh.copy()
    fixed.update_faces(fixed.nondegenerate_faces())
    canonical = np.sort(fixed.faces, axis=1)
    _, unique_idx = np.unique(canonical, axis=0, return_index=True)
    fixed.update_faces(np.sort(unique_idx))
    fixed.remove_unreferenced_vertices()
    fixed.merge_vertices()
    fixed.fix_normals(multibody=True)
    return fixed


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    assets = [inspect_asset(REPO / rel) for rel in DEFAULT_ASSETS]
    bad = broken_fixture(); fixed_a, fixed_b = repair(bad), repair(bad)
    fixed_a.export(args.out_dir / "repaired-fixture.glb")
    report = {
        "schema": "genesis.mesh-foundry-probe.v1", "trimeshVersion": trimesh.__version__,
        "assets": assets,
        "corpus": {
            "assetCount": len(assets), "geometryCount": sum(a["geometryCount"] for a in assets),
            "vertices": sum(a["vertices"] for a in assets), "faces": sum(a["faces"] for a in assets),
            "watertightAssetFraction": round(sum(a["allWatertight"] for a in assets) / len(assets), 5),
            "watertightAfterCanonicalizationFraction": round(sum(a["allWatertightAfterCanonicalization"] for a in assets) / len(assets), 5),
            "uvCompleteAssetFraction": round(sum(a["allHaveUv"] for a in assets) / len(assets), 5),
        },
        "repairFixture": {
            "before": mesh_stats(bad), "after": mesh_stats(fixed_a),
            "deterministic": bool(np.array_equal(fixed_a.vertices, fixed_b.vertices) and np.array_equal(fixed_a.faces, fixed_b.faces)),
            "removedDegenerates": mesh_stats(fixed_a)["degenerateFaces"] == 0,
            "removedDuplicates": mesh_stats(fixed_a)["duplicateFaces"] == 0,
            "removedUnreferenced": mesh_stats(fixed_a)["unreferencedVertices"] == 0,
        },
    }
    (args.out_dir / "metrics.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
