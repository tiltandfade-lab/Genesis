#!/usr/bin/env python3
"""Blender-side compiler for the accepted Meshy Genesis donor pack.

Run:
  Blender --background --python scripts/model-foundry/build-meshy-runtime-pack.py
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = ROOT / "Reference/Meshy-Premium-Month-1/runtime-citizenship.json"
SOURCE_DIR = ROOT / "Reference/Meshy-Premium-Month-1/processed"
OUT_DIR = ROOT / "assets/models-normalized/meshy-genesis"
PROVENANCE_PATH = ROOT / "dev/model-foundry/MESHY-RUNTIME-PROVENANCE.json"
RECIPE_VERSION = "meshy-runtime-v1"
LOD_RATIOS = (1.0, 0.62, 0.36)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.textures):
        for datablock in list(datablocks):
            datablocks.remove(datablock)


def meshes():
    return sorted((obj for obj in bpy.context.scene.objects if obj.type == "MESH"), key=lambda obj: obj.name)


def island_role(asset, island, index):
    """Object-specific ownership rules for mixed-material one-mesh donors."""
    job_id = asset["jobId"]
    island.data.calc_loop_triangles()
    triangles = len(island.data.loop_triangles)
    points = [island.matrix_world @ Vector(corner) for corner in island.bound_box]
    center = Vector(tuple((min(point[axis] for point in points) + max(point[axis] for point in points)) / 2 for axis in range(3)))
    size = island.dimensions
    if job_id == "M052-A":
        if triangles >= 100 and abs(center.x) < 0.2:
            return "bell"
        if abs(center.x) > 0.2 or size.x > 0.5 or center.z > 0.3:
            return "yoke"
        return "striker"
    if job_id == "M057-A":
        # The fabricated basket is a set of simple twelve-triangle bars/connectors. The irregular,
        # higher-face-count closed islands are the packed stones.
        return "basket-frame" if triangles <= 12 else "stone-pack"
    if job_id == "M064-B":
        # Three high-face-count rounded vessels (plus their thin lids) are the ceramic jars. The
        # surrounding rectilinear low-poly islands are the timber rack/work surfaces.
        if triangles >= 100 or (triangles >= 30 and center.z > 0.2):
            return "jar"
        return "rack"
    return asset["parts"][index % len(asset["parts"])]


def semanticize_loose_islands(objects, asset):
    """Turn a one-object Meshy blob into a bounded set of role-owned mesh groups."""
    if len(objects) != 1:
        return objects
    source = objects[0]
    bpy.context.view_layer.objects.active = source
    source.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.separate(type="LOOSE")
    bpy.ops.object.mode_set(mode="OBJECT")
    islands = meshes()
    if len(islands) == 1:
        return islands
    islands.sort(key=lambda obj: (-(obj.dimensions.x * obj.dimensions.y * obj.dimensions.z), obj.name))
    roles = asset["parts"]
    groups = {role: [] for role in roles}
    for index, island in enumerate(islands):
        groups[island_role(asset, island, index)].append(island)
    result = []
    for role in roles:
        group = groups[role]
        if not group:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        for obj in group:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = group[0]
        bpy.ops.object.join()
        group[0].name = role
        result.append(group[0])
    return result


def bake_world_transforms(objects) -> None:
    for obj in objects:
        # glTF instancing is common for wheels, bars, and repeated braces. Each instance needs an
        # independent mesh before its object transform is baked; otherwise the shared datablock is
        # transformed repeatedly and later instances balloon or drift away from the chassis.
        if obj.data.users > 1:
            obj.data = obj.data.copy()
        obj.data.transform(obj.matrix_world)
        obj.matrix_world = Matrix.Identity(4)


def bounds(objects):
    points = [obj.matrix_world @ Vector(corner) for obj in objects for corner in obj.bound_box]
    minimum = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    maximum = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return minimum, maximum


def normalize(objects, target_axis: str, target_units: float):
    bake_world_transforms(objects)
    minimum, maximum = bounds(objects)
    dims = maximum - minimum
    axis = {"x": 0, "y": 1, "z": 2}[target_axis]
    scale = target_units / max(dims[axis], 1e-6)
    center = Vector(((minimum.x + maximum.x) / 2, (minimum.y + maximum.y) / 2, minimum.z))
    transform = Matrix.Scale(scale, 4) @ Matrix.Translation(-center)
    for obj in objects:
        obj.data.transform(transform)
    minimum, maximum = bounds(objects)
    return scale, minimum, maximum


def socket_position(socket_type: str, minimum: Vector, maximum: Vector):
    half_x = max(abs(minimum.x), abs(maximum.x))
    half_y = max(abs(minimum.y), abs(maximum.y))
    height = maximum.z
    # Values are emitted in Three.js coordinates: x horizontal, y up, z depth.
    positions = {
        "floor-mount": (0, 0, 0),
        "wall-mount": (0, height * 0.5, -half_y),
        "top-surface": (0, height, 0),
        "stack-top": (0, height, 0),
        "join-top": (0, height, 0),
        "join-west": (-half_x, height * 0.35, 0),
        "join-east": (half_x, height * 0.35, 0),
        "tow-point": (-half_x, height * 0.25, 0),
        "cargo-bed": (0, height * 0.55, 0),
        "entrance": (half_x, 0, 0),
        "display-face": (0, height * 0.62, half_y),
        "signal-top": (0, height, 0),
        "signal-origin": (0, height * 0.72, 0),
        "writing-surface": (0, height * 0.78, 0),
        "fire-origin": (0, height * 0.7, 0),
        "light-origin": (0, height * 0.72, half_y * 0.35),
        "flame-origin": (0, height * 0.78, half_y * 0.35),
        "hinge": (-half_x, height * 0.5, half_y),
        "occupant": (0, 0, 0),
        "supply": (0, height * 0.55, 0),
        "interaction": (half_x, height * 0.45, 0),
    }
    return [round(v, 5) for v in positions.get(socket_type, (0, height * 0.5, 0))]


def assign_metadata(objects, asset, minimum, maximum):
    parts = asset["parts"]
    part_materials = asset["partMaterials"]
    for index, obj in enumerate(objects):
        original_name = obj.name.lower()
        role = original_name if original_name in parts else parts[index % len(parts)]
        for token, named_role in asset.get("nameRoles", {}).items():
            if token in original_name:
                role = named_role
                break
        family = part_materials[role]
        obj.name = f'{asset["jobId"]}-{role}-{index + 1:02d}'
        obj.data.name = obj.name
        obj.data.materials.clear()
        obj["genesisDonor"] = {
            "jobId": asset["jobId"],
            "semanticPart": role,
            "materialFamily": family,
        }
    sockets = [{"type": kind, "position": socket_position(kind, minimum, maximum)} for kind in asset["sockets"]]
    root = bpy.data.objects.new(f'{asset["jobId"]}-{asset["slug"]}', None)
    bpy.context.collection.objects.link(root)
    for obj in objects:
        obj.parent = root
    root["genesisDonor"] = {
        "jobId": asset["jobId"],
        "slug": asset["slug"],
        "sockets": sockets,
        "footprint": asset["footprint"],
        "collision": asset["collision"],
        "scaleAxes": asset["scaleAxes"],
        "stateOwner": "site-runtime",
    }
    return sockets


def simplify(objects, ratio: float) -> None:
    if ratio >= 0.999:
        return
    for obj in objects:
        if len(obj.data.polygons) < 40:
            continue
        # Meshy donors sometimes instance one wheel/bar mesh several times. LOD generation
        # must not mutate shared source data or Blender refuses to apply the modifier.
        if obj.data.users > 1:
            obj.data = obj.data.copy()
        modifier = obj.modifiers.new(name="Genesis local LOD", type="DECIMATE")
        modifier.ratio = ratio
        modifier.use_collapse_triangulate = True
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        obj.select_set(False)


def compile_asset(asset):
    source = SOURCE_DIR / asset["source"]
    source_hash = sha256(source)
    base_record = None
    outputs = []
    for level, ratio in enumerate(LOD_RATIOS):
        clear_scene()
        bpy.ops.import_scene.gltf(filepath=str(source))
        objects = meshes()
        if not objects:
            raise RuntimeError(f"no mesh objects in {source}")
        objects = semanticize_loose_islands(objects, asset)
        scale, minimum, maximum = normalize(objects, asset["targetAxis"], asset["targetWorldUnits"])
        sockets = assign_metadata(objects, asset, minimum, maximum)
        simplify(objects, ratio)
        suffix = "" if level == 0 else f"-lod{level}"
        filename = f'{asset["slug"]}{suffix}.glb'
        output = OUT_DIR / filename
        bpy.ops.export_scene.gltf(
            filepath=str(output),
            export_format="GLB",
            export_extras=True,
            export_materials="NONE",
            export_cameras=False,
            export_lights=False,
        )
        outputs.append({"level": level, "file": filename, "ratio": ratio, "bytes": output.stat().st_size})
        if level == 0:
            base_record = {
                "sourceSha256": source_hash,
                "source": source.relative_to(ROOT).as_posix(),
                "canonicalScale": scale,
                "dimensions": [round(maximum.x - minimum.x, 5), round(maximum.z - minimum.z, 5), round(maximum.y - minimum.y, 5)],
                "sockets": sockets,
            }
    recipe_payload = json.dumps({"version": RECIPE_VERSION, "asset": asset, "sourceSha256": source_hash}, sort_keys=True)
    recipe_hash = hashlib.sha256(recipe_payload.encode()).hexdigest()
    index_entry = {
        "file": outputs[0]["file"],
        "lods": outputs,
        "recipeHash": recipe_hash,
        "admissionClass": "DIRECT_MODULATED",
        "canonicalScale": round(base_record["canonicalScale"], 8),
        "category": asset["category"],
        "semanticParts": asset["parts"],
        "materialFamilies": sorted(set(asset["partMaterials"].values())),
        "sockets": base_record["sockets"],
        "footprint": asset["footprint"],
        "collision": asset["collision"],
        "scaleAxes": asset["scaleAxes"],
        "stateOwner": "site-runtime",
        "companionLeaf": None,
    }
    return index_entry, {**base_record, "jobId": asset["jobId"], "slug": asset["slug"], "outputs": outputs, "recipeHash": recipe_hash}


def main():
    catalog = json.loads(CATALOG_PATH.read_text())
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    index, provenance = {}, []
    for asset in catalog["assets"]:
        print(f'Compiling {asset["jobId"]} {asset["slug"]}')
        index[asset["slug"]], record = compile_asset(asset)
        provenance.append(record)
    (OUT_DIR / "index.json").write_text(json.dumps(index, indent=2, sort_keys=True) + "\n")
    PROVENANCE_PATH.write_text(json.dumps({
        "schemaVersion": 1,
        "recipeVersion": RECIPE_VERSION,
        "catalog": CATALOG_PATH.relative_to(ROOT).as_posix(),
        "assets": provenance,
    }, indent=2) + "\n")
    print(f"Wrote {len(index)} assets, {len(index) * len(LOD_RATIOS)} GLBs")


if __name__ == "__main__":
    main()
