#!/usr/bin/env python3
"""Compile selected RGBA prop sprites into textured shallow GLBs for the ES-1 proof.

The geometry backend is an offline research spike (Shapely + Earcut through Trimesh), not a
production-backend decision. Production remains gated on R1/G1.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path

TOOLS = Path(os.environ.get("GENESIS_OFFLINE_ART_TOOLS", "/private/tmp/genesis-offline-art-tools"))
sys.path.insert(0, str(TOOLS))

import cv2
import numpy as np
import trimesh
from PIL import Image
from shapely.geometry import MultiPolygon, Polygon


PROOF = [
    {"id":"shield", "art":"assets/icons/shield.png", "realm":"fantasy", "expected":"EXTRUDE", "depth":0.09},
    {"id":"key", "art":"assets/icons/key.png", "realm":"fantasy", "expected":"EXTRUDE", "depth":0.055},
    {"id":"sign", "art":"assets/dressing/chrome-clutter-signfragment.png", "realm":"chrome", "expected":"EXTRUDE", "depth":0.06},
    {"id":"grate", "art":"assets/dressing/fantasy-obj-trap-hidden.png", "realm":"fantasy", "expected":"EXTRUDE", "depth":0.025},
    {"id":"lever", "art":"assets/dressing/gloom-obj-lever-left.png", "realm":"gloom", "expected":"EXTRUDE", "depth":0.14},
    {"id":"relief", "art":"assets/dressing/fantasy-painting-1.png", "realm":"fantasy", "expected":"EXTRUDE", "depth":0.07},
    {"id":"door", "art":"assets/dressing/chrome-obj-door-shut.png", "realm":"chrome", "expected":"EXTRUDE", "depth":0.12},
    {"id":"wreath", "art":"assets/dressing/gloom-flora-driedwreath.png", "realm":"gloom", "expected":"EXTRUDE", "depth":0.07},
    {"id":"screen", "art":"assets/dressing/chrome-clutter-brokenscreen.png", "realm":"chrome", "expected":"EXTRUDE", "depth":0.07},
    {"id":"crate", "art":"assets/dressing/fantasy-obj-container-intact.png", "realm":"fantasy", "expected":"FACED_BOX", "negative":True},
    {"id":"urn", "art":"assets/dressing/gloom-clutter-urnshard.png", "realm":"gloom", "expected":"MODEL_LATHE", "negative":True},
    {"id":"barrel", "art":"assets/dressing/fantasy-clutter-emptybarrel.png", "realm":"fantasy", "expected":"FACED_BOX", "negative":True},
]


def contours_to_geometry(alpha: np.ndarray, simplify: float = 0.004) -> tuple[Polygon | MultiPolygon, dict]:
    # Source sheets retain soft painted shadows at low alpha. They are appearance, not geometry.
    mask = np.where(alpha >= 96, 255, 0).astype(np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    contours, hierarchy = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    if hierarchy is None or not contours:
        raise ValueError("no alpha contour")
    hierarchy = hierarchy[0]
    image_area = mask.shape[0] * mask.shape[1]
    polygons = []
    for idx, contour in enumerate(contours):
        if hierarchy[idx][3] != -1:
            continue
        outer = contour[:, 0, :].astype(float)
        if abs(cv2.contourArea(contour)) < image_area * 0.001:
            continue
        holes = []
        child = hierarchy[idx][2]
        while child != -1:
            hole = contours[child][:, 0, :].astype(float)
            if abs(cv2.contourArea(contours[child])) >= image_area * 0.0005:
                holes.append(hole)
            child = hierarchy[child][0]
        polygon = Polygon(outer, holes)
        if not polygon.is_valid:
            polygon = polygon.buffer(0)
        if not polygon.is_empty:
            polygons.extend(list(polygon.geoms) if isinstance(polygon, MultiPolygon) else [polygon])
    if not polygons:
        raise ValueError("no valid polygon")
    raw_components = len(polygons)
    # Detached highlights, key-color crumbs, and painted motes are not physical islands by default.
    shape = max(polygons, key=lambda polygon: polygon.area)
    minx, miny, maxx, maxy = shape.bounds
    scale = max(maxx - minx, maxy - miny, 1.0)
    shape = shape.simplify(scale * simplify, preserve_topology=True)
    minx, miny, maxx, maxy = shape.bounds
    height = max(maxy - miny, 1.0)
    from shapely import affinity
    shape = affinity.translate(shape, xoff=-(minx + maxx) / 2, yoff=-maxy)
    shape = affinity.scale(shape, xfact=1 / height, yfact=-1 / height, origin=(0, 0))
    return shape, {"rawContourCount":len(contours), "sourceComponentCount":raw_components, "compiledComponentCount":1, "maskPixels":int((mask > 0).sum())}


def compile_one(root: Path, entry: dict, out_dir: Path) -> dict:
    art_path = root / entry["art"]
    if entry.get("negative"):
        return {**entry, "status":"ROUTER_REJECTED", "reason":f"{entry['expected']} required; single extrusion forbidden"}
    image = Image.open(art_path).convert("RGBA")
    source_pixels = np.array(image)
    magenta = (
        (source_pixels[:, :, 0] >= 200) & (source_pixels[:, :, 1] <= 90) &
        (source_pixels[:, :, 2] >= 180)
    )
    source_pixels[magenta, 3] = 0
    component_count, labels, stats, _ = cv2.connectedComponentsWithStats(
        np.where(source_pixels[:, :, 3] >= 96, 1, 0).astype(np.uint8), connectivity=8
    )
    if component_count > 1:
        dominant = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        source_pixels[labels != dominant, 3] = 0
    image = Image.fromarray(source_pixels)
    ys, xs = np.where(source_pixels[:, :, 3] >= 96)
    if not len(xs):
        raise ValueError("source image has no opaque pixels")
    image = image.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
    pixels = np.asarray(image)
    shape, stats = contours_to_geometry(pixels[:, :, 3])
    polygons = list(shape.geoms) if isinstance(shape, MultiPolygon) else [shape]
    pieces = [trimesh.creation.extrude_polygon(polygon, height=entry["depth"], engine="earcut") for polygon in polygons]
    mesh = trimesh.util.concatenate(pieces)
    mesh.remove_unreferenced_vertices()
    mesh.fix_normals()
    # Front/back preserve the source art; sides use edge-clamped UVs as a proof approximation.
    bounds = mesh.bounds
    width = max(bounds[1][0] - bounds[0][0], 1e-6)
    height = max(bounds[1][1] - bounds[0][1], 1e-6)
    uv = np.column_stack(((mesh.vertices[:, 0] - bounds[0][0]) / width, (mesh.vertices[:, 1] - bounds[0][1]) / height))
    front = trimesh.visual.material.PBRMaterial(
        name=f"{entry['realm']}-painted-face", baseColorTexture=image,
        metallicFactor=0.0, roughnessFactor=0.82, alphaMode="MASK", alphaCutoff=0.08,
    )
    realm_sides = {
        "fantasy": [122, 91, 55, 255],
        "gloom": [72, 62, 68, 255],
        "chrome": [66, 85, 96, 255],
    }
    side = trimesh.visual.material.PBRMaterial(
        name=f"{entry['realm']}-side-shell", baseColorFactor=realm_sides[entry["realm"]],
        metallicFactor=0.08 if entry["realm"] != "chrome" else 0.45, roughnessFactor=0.72,
    )
    front_faces = np.flatnonzero(np.abs(mesh.face_normals[:, 2]) > 0.9)
    side_faces = np.flatnonzero(np.abs(mesh.face_normals[:, 2]) <= 0.9)
    mesh.visual = trimesh.visual.texture.TextureVisuals(uv=uv, material=front)
    front_mesh = mesh.submesh([front_faces], append=True, repair=False)
    side_mesh = mesh.submesh([side_faces], append=True, repair=False)
    side_mesh.visual = trimesh.visual.texture.TextureVisuals(
        uv=np.zeros((len(side_mesh.vertices), 2)), material=side
    )
    output = out_dir / f"{entry.get('slug', entry['realm'] + '-' + entry['id'])}.glb"
    output.write_bytes(trimesh.exchange.gltf.export_glb(trimesh.Scene({"painted-faces":front_mesh, "side-shell":side_mesh})))
    reloaded = trimesh.load(output, force="scene", process=False)
    result = {
        **entry,
        "status":"TECHNICAL_ONLY",
        "technicalStatus":"COMPILED",
        "visualStatus":"QA_PENDING",
        "runtimeAdmitted":False,
        "output":output.relative_to(root).as_posix(),
        "sourceSha256":hashlib.sha256(art_path.read_bytes()).hexdigest(),
        "outputSha256":hashlib.sha256(output.read_bytes()).hexdigest(),
        "vertices":int(len(mesh.vertices)), "faces":int(len(mesh.faces)),
        "withinProofFaceBudget":bool(len(mesh.faces) <= 700),
        "watertight":bool(mesh.is_watertight), "windingConsistent":bool(mesh.is_winding_consistent),
        "bounds":[[round(float(x), 6) for x in row] for row in mesh.bounds], **stats,
        "reloadGeometryCount":len(reloaded.geometry),
    }
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path("."))
    parser.add_argument("--out-dir", type=Path, default=Path("dev/model-foundry/extruded-props"))
    parser.add_argument(
        "--allow-legacy-perspective-research", action="store_true",
        help="Compile known-invalid legacy perspective art for diagnostic comparison only.",
    )
    args = parser.parse_args(); root = args.root.resolve(); out = root / args.out_dir
    glb_dir = out / "glb"; glb_dir.mkdir(parents=True, exist_ok=True)
    results = [compile_one(root, entry, glb_dir) for entry in PROOF] if args.allow_legacy_perspective_research else []
    report = {
        "schema":"genesis.extruded-prop-proof.v1",
        "classification":"FAILED_LEGACY_SOURCE_DIAGNOSTIC: backend is not production-selected",
        "legacyPerspectiveOverride":args.allow_legacy_perspective_research,
        "coreRealms":["fantasy", "gloom", "chrome"],
        "technicalCompiled":sum(item.get("technicalStatus") == "COMPILED" for item in results),
        "routerRejected":sum(item["status"] == "ROUTER_REJECTED" for item in results),
        "visualVerdict":"FAIL",
        "runtimeAdmittedCount":0,
        "allCompiledReload":all(item.get("reloadGeometryCount", 1) > 0 for item in results),
        "allCompiledWinding":all(item.get("windingConsistent", True) for item in results),
        "faceBudgetPassCount":sum(item.get("withinProofFaceBudget", False) for item in results),
        "proof":results,
    }
    (out / "proof-report.json").write_text(json.dumps(report, indent=2) + "\n")
    source_manifest = json.loads((root / "dev/model-foundry/prop-source-manifest.json").read_text())
    library_dir = out / "library-glb"; library_dir.mkdir(parents=True, exist_ok=True)
    library_results = []
    for source in source_manifest["entries"]:
        if source["constructionClass"] != "EXTRUDE" or not source.get("art"):
            continue
        if source.get("sourceProjection") != "FLAT_ORTHOGRAPHIC_QA_PASS" and not args.allow_legacy_perspective_research:
            continue
        name = " ".join(filter(None, (source.get("archetype"), source.get("name"), source.get("slug"))))
        tokens = set(name.lower().replace("-", " ").split())
        depth = 0.12 if "door" in tokens else 0.14 if "lever" in tokens or "portal" in tokens else 0.025 if "trap" in tokens or "grate" in tokens else 0.07
        entry = {
            "id": source.get("slug", source["id"].replace(":", "-")), "slug": source.get("slug", source["id"].replace(":", "-")),
            "art": source["art"], "realm": source["realm"], "expected": "EXTRUDE", "depth": depth,
            "sourceRef": source["sourceRef"], "kind": source["kind"], "archetype": source.get("archetype"),
            "state": source.get("state"),
        }
        try:
            library_results.append(compile_one(root, entry, library_dir))
        except Exception as exc:
            library_results.append({
                **entry, "status":"TECHNICAL_FAILED", "technicalStatus":"COMPILE_FAILED",
                "visualStatus":"NOT_REVIEWABLE", "runtimeAdmitted":False,
                "error":f"{type(exc).__name__}: {exc}"
            })
    library_report = {
        "schema":"genesis.extruded-prop-library.v1", "coreRealms":["fantasy", "gloom", "chrome"],
        "classification":"FAILED_LEGACY_SOURCE_DIAGNOSTIC: not a candidate library and not runtime admitted",
        "legacyPerspectiveOverride":args.allow_legacy_perspective_research,
        "candidateCount":len(library_results),
        "technicalCompiled":sum(item.get("technicalStatus") == "COMPILED" for item in library_results),
        "technicalFailures":sum(item.get("technicalStatus") == "COMPILE_FAILED" for item in library_results),
        "withinFaceBudget":sum(item.get("withinProofFaceBudget", False) for item in library_results),
        "visualVerdict":"FAIL", "runtimeAdmittedCount":0,
        "assets":library_results,
    }
    (out / "library-report.json").write_text(json.dumps(library_report, indent=2) + "\n")
    print(json.dumps({key:report[key] for key in ("technicalCompiled", "routerRejected", "allCompiledReload", "allCompiledWinding", "visualVerdict", "runtimeAdmittedCount")}, indent=2))
    print(json.dumps({"libraryCandidates":library_report["candidateCount"], "libraryTechnicalCompiled":library_report["technicalCompiled"], "libraryTechnicalFailures":library_report["technicalFailures"], "libraryWithinFaceBudget":library_report["withinFaceBudget"], "visualVerdict":library_report["visualVerdict"], "runtimeAdmittedCount":library_report["runtimeAdmittedCount"]}, indent=2))


if __name__ == "__main__":
    main()
