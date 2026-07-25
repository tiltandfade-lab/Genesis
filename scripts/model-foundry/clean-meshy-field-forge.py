"""Consolidate Meshy's field-forge islands into reusable ownership groups.

No source geometry is removed or replaced. The script recognizes the accepted
M059-A donor by its island and triangle counts, then joins its simple loose
parts into hearth, hood, bellows, and tool-fitting groups.

Usage:
  Blender --background --python clean-meshy-field-forge.py -- input.glb output.glb
"""
import json
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def arguments():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(args) != 2:
        raise SystemExit("Expected: input.glb output.glb")
    return Path(args[0]).resolve(), Path(args[1]).resolve()


def bounds(obj):
    corners = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    minimum = Vector(tuple(min(point[axis] for point in corners) for axis in range(3)))
    maximum = Vector(tuple(max(point[axis] for point in corners) for axis in range(3)))
    return {
        "minimum": minimum,
        "maximum": maximum,
        "center": (minimum + maximum) * 0.5,
        "size": maximum - minimum,
    }


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
if source_triangles != 1108:
    raise SystemExit(f"Expected the accepted 1,108-triangle donor; found {source_triangles}.")

bpy.context.view_layer.objects.active = source_mesh
source_mesh.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.separate(type="LOOSE")
bpy.ops.object.mode_set(mode="OBJECT")

parts = [obj for obj in bpy.context.selected_objects if obj.type == "MESH"]
if len(parts) != 60:
    raise SystemExit(f"Expected 60 useful loose islands; found {len(parts)}.")

groups = {
    "hearth_body_and_basin": [],
    "smoke_hood_and_supports": [],
    "bellows_and_air_pipe": [],
    "tool_ledges_and_sockets": [],
}

for obj in parts:
    record = bounds(obj)
    center = record["center"]

    # The bellows assembly occupies the isolated right-hand third. This also
    # captures the thick tuyere pipe that crosses toward the hearth.
    if center.x > 0.14:
        group = "bellows_and_air_pipe"
    # Hood shell, uprights, and caps all sit above the hearth working plane.
    elif center.z > 0.025:
        group = "smoke_hood_and_supports"
    # The left ledge and front hanging socket rail are spatially unambiguous.
    elif (
        center.x < -0.34
        and center.z > -0.13
    ) or (
        center.y < -0.18
        and center.z > -0.17
    ):
        group = "tool_ledges_and_sockets"
    else:
        group = "hearth_body_and_basin"

    groups[group].append(obj)

if any(not objects for objects in groups.values()):
    raise SystemExit(
        "Expected every forge ownership group to contain geometry; found "
        + json.dumps({name: len(objects) for name, objects in groups.items()})
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
    "GENESIS_FORGE_CLEANUP_REPORT="
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
