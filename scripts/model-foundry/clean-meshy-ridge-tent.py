"""Convert Meshy's mirrored-open ridge tent into a front-open, back-closed donor.

Usage:
  Blender --background --python clean-meshy-ridge-tent.py -- input.glb output.glb
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


def make_back_panel(name, x_min, x_max, rear_y, z_min, z_apex, thickness):
    inner_y = rear_y - thickness * 0.5
    outer_y = rear_y + thickness * 0.5
    vertices = [
        (x_min, inner_y, z_min),
        (x_max, inner_y, z_min),
        (0.0, inner_y, z_apex),
        (x_min, outer_y, z_min),
        (x_max, outer_y, z_min),
        (0.0, outer_y, z_apex),
    ]
    faces = [
        (0, 1, 2),
        (3, 5, 4),
        (0, 3, 4, 1),
        (0, 2, 5, 3),
        (1, 4, 5, 2),
    ]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


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
records = [{"object": obj, **bounds(obj), "faces": len(obj.data.polygons)} for obj in parts]

roof_records = sorted(records, key=lambda record: record["faces"], reverse=True)[:2]
if [record["faces"] for record in roof_records] != [157, 157]:
    raise SystemExit(
        f"Expected two 157-face roof shells; found {[record['faces'] for record in roof_records]}."
    )

roof_minimum = Vector(tuple(min(record["minimum"][axis] for record in roof_records) for axis in range(3)))
roof_maximum = Vector(tuple(max(record["maximum"][axis] for record in roof_records) for axis in range(3)))
scene_center_y = (roof_minimum.y + roof_maximum.y) * 0.5
rear_records = [
    record
    for record in records
    if record["center"].y > scene_center_y
    and abs(record["center"].x) > 0.08
    and record["faces"] in (24, 36)
]
if sorted(record["faces"] for record in rear_records) != [24, 24, 36, 36]:
    raise SystemExit(
        "Expected two rear flap bundles and two rear ties; found "
        f"{sorted(record['faces'] for record in rear_records)}."
    )

for record in rear_records:
    bpy.data.objects.remove(record["object"], do_unlink=True)

back_panel = make_back_panel(
    "cloth_back_panel",
    roof_minimum.x,
    roof_maximum.x,
    roof_maximum.y,
    roof_minimum.z,
    roof_maximum.z,
    max(0.008, (roof_maximum.y - roof_minimum.y) * 0.01),
)

remaining_records = [record for record in records if record not in rear_records]
groups = {
    "cloth_shell": [back_panel],
    "cloth_front_treatment": [],
    "timber_frame": [],
    "ridge_lashings": [],
}
for record in remaining_records:
    obj = record["object"]
    if record in roof_records or record["faces"] == 20:
        category = "cloth_shell"
    elif record["faces"] == 36 and abs(record["center"].x) > 0.08:
        category = "cloth_front_treatment"
    elif record["faces"] == 24:
        category = "cloth_front_treatment"
    elif record["faces"] == 36:
        category = "ridge_lashings"
    elif record["faces"] in (14, 16, 30):
        category = "timber_frame"
    else:
        raise SystemExit(f"Unclassified retained part with {record['faces']} faces.")
    groups[category].append(obj)


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

for obj in kept:
    obj.data.calc_loop_triangles()
report = {
    "source": str(source),
    "output": str(output),
    "sourceLooseParts": len(parts),
    "rearPartsRemoved": len(rear_records),
    "backPanelAdded": back_panel.name,
    "outputObjects": len(kept),
    "outputTriangles": sum(len(obj.data.loop_triangles) for obj in kept),
}
print("GENESIS_TENT_CLEANUP_REPORT=" + json.dumps(report, separators=(",", ":")))
