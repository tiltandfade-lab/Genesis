"""Remove near-duplicate loose shells from a Meshy rock-cluster GLB.

Usage:
  Blender --background --python clean-meshy-rock-cluster.py -- input.glb output.glb
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
    size = maximum - minimum
    return {
        "minimum": minimum,
        "maximum": maximum,
        "center": (minimum + maximum) * 0.5,
        "size": size,
        "volume": size.x * size.y * size.z,
    }


source, output = arguments()
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))

source_meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
if len(source_meshes) != 1:
    raise SystemExit(f"Expected one source mesh; found {len(source_meshes)}.")

source_mesh = source_meshes[0]
bpy.context.view_layer.objects.active = source_mesh
source_mesh.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.separate(type="LOOSE")
bpy.ops.object.mode_set(mode="OBJECT")
parts = [obj for obj in bpy.context.selected_objects if obj.type == "MESH"]

scene_corners = [obj.matrix_world @ Vector(corner) for obj in parts for corner in obj.bound_box]
scene_minimum = Vector(tuple(min(point[axis] for point in scene_corners) for axis in range(3)))
scene_maximum = Vector(tuple(max(point[axis] for point in scene_corners) for axis in range(3)))
scene_reach = max(scene_maximum - scene_minimum)
records = [{"object": obj, **bounds(obj)} for obj in parts]

groups = []
unused = set(range(len(records)))
while unused:
    seed = unused.pop()
    group = [seed]
    candidates = list(unused)
    for candidate in candidates:
        center_delta = (records[seed]["center"] - records[candidate]["center"]).length
        size_delta = max(abs(records[seed]["size"][axis] - records[candidate]["size"][axis]) for axis in range(3))
        if center_delta < scene_reach * 0.03 and size_delta < scene_reach * 0.03:
            unused.remove(candidate)
            group.append(candidate)
    groups.append(group)

if len(parts) != 6 or len(groups) != 3 or any(len(group) != 2 for group in groups):
    raise SystemExit(
        f"Expected three duplicate pairs from six loose shells; found {len(parts)} parts and "
        f"group sizes {[len(group) for group in groups]}."
    )

kept = []
removed = []
for group in groups:
    ordered = sorted(group, key=lambda index: records[index]["volume"], reverse=True)
    kept.append(records[ordered[0]]["object"])
    removed.extend(records[index]["object"] for index in ordered[1:])

for obj in removed:
    bpy.data.objects.remove(obj, do_unlink=True)

kept.sort(key=lambda obj: bounds(obj)["center"].x)
names = ["rock_left_subordinate", "rock_primary", "rock_right_subordinate"]
for obj, name in zip(kept, names):
    obj.name = name
    obj.data.name = name
    obj.data.materials.clear()
    obj.select_set(True)

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

report = {
    "source": str(source),
    "output": str(output),
    "sourceLooseShells": len(parts),
    "duplicateShellsRemoved": len(removed),
    "keptRockObjects": [obj.name for obj in kept],
    "outputVertices": sum(len(obj.data.vertices) for obj in kept),
    "outputTriangles": sum(len(obj.data.loop_triangles) for obj in kept),
}
print("GENESIS_ROCK_CLEANUP_REPORT=" + json.dumps(report, separators=(",", ":")))
