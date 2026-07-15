#!/usr/bin/env python3
"""Build an actual A/B/C shield extrusion proof from one deterministic flat source."""

from __future__ import annotations

import json
import math
import os
import sys
from pathlib import Path

TOOLS = Path(os.environ.get("GENESIS_OFFLINE_ART_TOOLS", "/private/tmp/genesis-offline-art-tools"))
sys.path.insert(0, str(TOOLS))

import numpy as np
import cv2
import trimesh
from PIL import Image
from scipy.spatial import Delaunay
from shapely.geometry import Point, Polygon

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).parent / "faceted-extrusion-proof"
OUT.mkdir(parents=True, exist_ok=True)

BOUNDARY = np.array([
    [0.00321, 1.07000], [-0.09936, 0.95782], [-0.22756, 0.91776],
    [-0.25321, 0.85365], [-0.32372, 0.88571], [-0.36859, 0.82160],
    [-0.42628, 0.80558], [-0.38782, 0.70141], [-0.37500, 0.46103],
    [-0.32372, 0.16455], [-0.26603, 0.06038], [-0.28526, -0.01974],
    [-0.20833, -0.01974], [0.01603, -0.18000], [0.21474, -0.02776],
    [0.29808, -0.00372], [0.27885, 0.07641], [0.34936, 0.28474],
    [0.39423, 0.70942], [0.42628, 0.81359], [0.36859, 0.82962],
    [0.33654, 0.87769], [0.25962, 0.85365], [0.24679, 0.90974],
    [0.11859, 0.94981],
])


def clean_chroma_texture(source: Path, output: Path) -> Path:
    image = Image.open(source).convert("RGBA")
    pixels = np.array(image)
    key = (pixels[:, :, 0] >= 200) & (pixels[:, :, 1] <= 90) & (pixels[:, :, 2] >= 180)
    pixels[key, 3] = 0
    ys, xs = np.where(pixels[:, :, 3] > 96)
    cleaned = Image.fromarray(pixels).crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
    scale = max(1, math.ceil(512 / max(cleaned.size)))
    cleaned.resize((cleaned.width * scale, cleaned.height * scale), Image.Resampling.NEAREST).save(output)
    return output


def source_texture() -> Path:
    return clean_chroma_texture(
        ROOT / "assets/icons/shield.png",
        OUT / "fantasy-shield-flat-orthographic-source.png",
    )


def uv_for(points: np.ndarray) -> np.ndarray:
    low, high = BOUNDARY.min(axis=0), BOUNDARY.max(axis=0)
    return np.column_stack(((points[:, 0] - low[0]) / (high[0] - low[0]), (points[:, 1] - low[1]) / (high[1] - low[1])))


def boundary_for_texture(texture_path: Path) -> np.ndarray:
    pixels = np.array(Image.open(texture_path).convert("RGBA"))
    mask = np.where(pixels[:, :, 3] > 96, 255, 0).astype(np.uint8)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    contour = max(contours, key=cv2.contourArea)
    epsilon = max(1.5, cv2.arcLength(contour, True) * 0.002)
    points = cv2.approxPolyDP(contour, epsilon, True)[:, 0, :].astype(float)
    min_xy, max_xy = points.min(axis=0), points.max(axis=0)
    height = max(max_xy[1] - min_xy[1], 1.0)
    return np.column_stack((
        (points[:, 0] - (min_xy[0] + max_xy[0]) / 2) / height * 1.25,
        1.07 - (points[:, 1] - min_xy[1]) / height * 1.25,
    ))


def triangulated_points(inner: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    poly = Polygon(inner)
    points = [*inner.tolist()]
    # Purposeful vertical/radial bands follow the heraldic construction rather than random noise.
    for y in (-0.02, 0.20, 0.43, 0.66, 0.86):
        for x in (-0.36, -0.18, 0.0, 0.18, 0.36):
            jitter = 0.018 * math.sin((x * 19.0) + (y * 13.0))
            p = (x + jitter, y)
            if poly.buffer(-0.035).contains(Point(p)):
                points.append(p)
    points = np.asarray(points, dtype=float)
    tri = Delaunay(points).simplices
    keep = []
    for face in tri:
        centroid = points[face].mean(axis=0)
        if poly.covers(Point(centroid)):
            keep.append(face)
    return points, np.asarray(keep, dtype=int)


def oriented_faces(vertices: np.ndarray, faces: np.ndarray, positive: bool) -> np.ndarray:
    result = faces.copy()
    for i, face in enumerate(result):
        a, b, c = vertices[face]
        normal_z = np.cross(b - a, c - a)[2]
        if (normal_z > 0) != positive:
            result[i] = face[[0, 2, 1]]
    return result


def shell_mesh(depth: float, bevel: float, inner: np.ndarray, faceted: bool) -> trimesh.Trimesh:
    n = len(BOUNDARY)
    z_back, z_outer, z_front = -depth / 2, depth / 2 - bevel, depth / 2
    body_scale = 0.94 if faceted else 1.0
    body_boundary = BOUNDARY * np.array([body_scale, body_scale]) + np.array([0.0, (1.0 - body_scale) * 0.42])
    vertices = []
    vertices.extend([[x, y, z_back] for x, y in body_boundary])
    vertices.extend([[x, y, z_outer] for x, y in body_boundary])
    vertices.extend([[x, y, z_front] for x, y in inner])
    faces = []
    for i in range(n):
        j = (i + 1) % n
        faces.extend([[i, j, n + j], [i, n + j, n + i]])
        faces.extend([[n + i, n + j, 2 * n + j], [n + i, 2 * n + j, 2 * n + i]])
    back_tri = Delaunay(body_boundary).simplices
    poly = Polygon(body_boundary)
    for face in back_tri:
        if poly.covers(Point(body_boundary[face].mean(axis=0))):
            faces.append(face.tolist())
    vertices = np.asarray(vertices, dtype=float)
    faces = oriented_faces(vertices, np.asarray(faces, dtype=int), positive=True)
    material = trimesh.visual.material.PBRMaterial(
        name="aged-bronze-and-dark-wood-shell", baseColorFactor=[96, 71, 45, 255],
        metallicFactor=0.32, roughnessFactor=0.68,
    )
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
    mesh.visual = trimesh.visual.texture.TextureVisuals(uv=np.zeros((len(vertices), 2)), material=material)
    if faceted:
        mesh.unmerge_vertices()
        mesh.fix_normals()
    return mesh


def build_variant(texture_path: Path, mode: str, output_stem: str = "fantasy-shield") -> tuple[Path, dict]:
    depth = 0.10
    bevel = 0.0 if mode == "plain" else 0.018
    # Preserve the exact decorative silhouette on the front. The faceted body recedes behind it.
    inner = BOUNDARY.copy()
    if mode == "plain":
        points = inner.copy()
        candidate_faces = Delaunay(points).simplices
        polygon = Polygon(inner)
        faces = np.asarray([
            face for face in candidate_faces
            if polygon.covers(Point(points[face].mean(axis=0)))
        ], dtype=int)
    else:
        points, faces = triangulated_points(inner)
    z = np.full(len(points), depth / 2)
    if mode == "faceted":
        boundary_count = len(inner)
        for i in range(boundary_count, len(points)):
            x, y = points[i]
            # Purposeful heraldic folds: a central crown with recessed side fields. The boundary,
            # point, and mount plane stay pinned; this is structure, not random triangle noise.
            crown = 0.042 * max(0.0, 1.0 - abs(x) / 0.34)
            lower_taper = 0.72 + 0.28 * max(0.0, min(1.0, (y + 0.08) / 0.88))
            z[i] += crown * lower_taper - 0.009 * abs(x) / 0.34
    vertices = np.column_stack((points, z))
    faces = oriented_faces(vertices, faces, positive=True)
    front = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
    material = trimesh.visual.material.PBRMaterial(
        name="flat-orthographic-albedo", baseColorTexture=Image.open(texture_path).convert("RGBA"),
        metallicFactor=0.02, roughnessFactor=0.84, alphaMode="MASK", alphaCutoff=0.3,
    )
    front.visual = trimesh.visual.texture.TextureVisuals(uv=uv_for(points), material=material)
    if mode == "faceted":
        front.unmerge_vertices()
        front.fix_normals()
    shell = shell_mesh(depth, bevel, inner, mode == "faceted")
    scene = trimesh.Scene({"orthographic-face": front, "bevel-and-shell": shell})
    output = OUT / f"{output_stem}-{mode}.glb"
    output.write_bytes(trimesh.exchange.gltf.export_glb(scene))
    loaded = trimesh.load(output, force="scene", process=False)
    face_count = sum(len(g.faces) for g in loaded.geometry.values())
    return output, {"faces": face_count, "depth": depth, "bevel": bevel, "reliefAmplitude": 0.0 if mode == "plain" else 0.051}


def main() -> None:
    global BOUNDARY
    texture = source_texture()
    plain, plain_stats = build_variant(texture, "plain")
    faceted, faceted_stats = build_variant(texture, "faceted")
    v4_texture = OUT / "fantasy-shield-v4.png"
    original_boundary = BOUNDARY.copy()
    BOUNDARY = boundary_for_texture(v4_texture)
    v4_faceted, v4_stats = build_variant(v4_texture, "faceted", "fantasy-shield-v4")
    BOUNDARY = original_boundary
    legacy = Path("dev/model-foundry/extruded-props/glb/fantasy-shield.glb")
    report = {
        "schema": "genesis.faceted-extrusion-proof.v1",
        "verdict": "QA_PENDING", "runtimeAdmittedCount": 0,
        "sourceContract": "matched geometry comparison: original ornate art versus regenerated faceted-v4 art",
        "variants": [
            {"id": "legacy", "label": "A · original shield + legacy raw contour slab", "output": legacy.as_posix(), "knownVerdict": "FAIL"},
            {"id": "original-faceted", "label": "B · original art + new faceted extrusion", "output": faceted.relative_to(ROOT).as_posix(), "knownVerdict": "REFERENCE", **faceted_stats},
            {"id": "v4-faceted", "label": "C · regenerated v4 art + same extrusion", "output": v4_faceted.relative_to(ROOT).as_posix(), "knownVerdict": "QA_PENDING", **v4_stats},
        ],
        "views": ["front-three-quarter", "reverse-light", "grazing-side", "topology-diagnostic"],
    }
    (OUT / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
