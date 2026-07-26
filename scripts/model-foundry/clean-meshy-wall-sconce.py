"""Consolidate Meshy's accepted open wall-sconce islands by ownership.

No source geometry is removed or replaced. The script recognizes M068-A by
its exact triangle/island signature and joins its upper/lower basket shells,
six open ribs, centered support path, and wall-mount pieces.

Usage:
  Blender --background --python clean-meshy-wall-sconce.py -- input.glb output.glb
"""
import json
import sys
from pathlib import Path

import bpy


def arguments():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(args) != 2:
        raise SystemExit("Expected: input.glb output.glb")
    return Path(args[0]).resolve(), Path(args[1]).resolve()


def join_group(name, objects):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    joined = bpy.context.view_layer.objects.active
    joined.name = name
    joined.data.name = name
    joined.data.materials.clear()
    return joined


source, output = arguments()
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))

source_meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
if len(source_meshes) != 1:
    raise SystemExit(f"Expected one source mesh; found {len(source_meshes)}.")

source_mesh = source_meshes[0]
source_mesh.data.calc_loop_triangles()
source_triangles = len(source_mesh.data.loop_triangles)
if source_triangles != 648:
    raise SystemExit(f"Expected the accepted 648-triangle donor; found {source_triangles}.")

bpy.context.view_layer.objects.active = source_mesh
source_mesh.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.separate(type="LOOSE")
bpy.ops.object.mode_set(mode="OBJECT")

parts = [obj for obj in bpy.context.selected_objects if obj.type == "MESH"]
if len(parts) != 15:
    raise SystemExit(f"Expected 15 useful loose islands; found {len(parts)}.")

groups = {
    "basket_ring_and_ash_cup": [],
    "basket_open_ribs": [],
    "centered_cradle_arm_and_brace": [],
    "mounting_plate_and_bosses": [],
}

for obj in parts:
    obj.data.calc_loop_triangles()
    triangles = len(obj.data.loop_triangles)
    if triangles in (140, 98):
        group = "basket_ring_and_ash_cup"
    elif triangles in (16, 18):
        group = "basket_open_ribs"
    elif triangles in (32, 34, 44):
        group = "centered_cradle_arm_and_brace"
    elif triangles in (48, 50, 60):
        group = "mounting_plate_and_bosses"
    else:
        raise SystemExit(f"Unrecognized sconce island with {triangles} triangles.")
    groups[group].append(obj)

expected_group_counts = {
    "basket_ring_and_ash_cup": 2,
    "basket_open_ribs": 6,
    "centered_cradle_arm_and_brace": 4,
    "mounting_plate_and_bosses": 3,
}
actual_group_counts = {name: len(objects) for name, objects in groups.items()}
if actual_group_counts != expected_group_counts:
    raise SystemExit(
        "Sconce island signature changed; expected "
        + json.dumps(expected_group_counts)
        + " but found "
        + json.dumps(actual_group_counts)
    )

kept = [join_group(name, objects) for name, objects in groups.items()]

output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action="DESELECT")
for obj in kept:
    obj.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=str(output),
    export_format="GLB",
    use_selection=True,
    export_materials="NONE",
    export_normals=True,
    export_texcoords=False,
    export_yup=True,
)

group_report = {}
for obj in kept:
    obj.data.calc_loop_triangles()
    group_report[obj.name] = {
        "sourceIslands": len(groups[obj.name]),
        "triangles": len(obj.data.loop_triangles),
    }

print(
    "GENESIS_SCONCE_CLEANUP_REPORT="
    + json.dumps(
        {
            "source": str(source),
            "output": str(output),
            "sourceLooseParts": len(parts),
            "sourceTriangles": source_triangles,
            "outputObjects": len(kept),
            "outputTriangles": sum(item["triangles"] for item in group_report.values()),
            "groups": group_report,
        },
        separators=(",", ":"),
    )
)
