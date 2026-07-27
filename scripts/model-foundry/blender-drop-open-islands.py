"""Remove only non-closed loose islands from a Meshy donor.

Usage:
  Blender --background --python blender-drop-open-islands.py -- input.glb output.glb

The operation is intentionally narrow: separate the imported mesh by loose parts, retain every
closed manifold part unchanged, discard open or non-manifold parts, join the survivors, strip
source materials and textures, and export a lightweight GLB.
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


def topology(obj):
    edge_faces = {}
    obj.data.calc_loop_triangles()
    for polygon in obj.data.polygons:
        vertices = polygon.vertices
        for index, left in enumerate(vertices):
            right = vertices[(index + 1) % len(vertices)]
            edge = tuple(sorted((left, right)))
            edge_faces[edge] = edge_faces.get(edge, 0) + 1
    return {
        "triangles": len(obj.data.loop_triangles),
        "boundaryEdges": sum(count == 1 for count in edge_faces.values()),
        "nonManifoldEdges": sum(count > 2 for count in edge_faces.values()),
    }


source, output = arguments()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(source))

meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
if not meshes:
    raise SystemExit("No mesh objects imported.")

bpy.ops.object.select_all(action="DESELECT")
for obj in meshes:
    obj.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1:
    bpy.ops.object.join()
model = bpy.context.view_layer.objects.active
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.separate(type="LOOSE")
bpy.ops.object.mode_set(mode="OBJECT")

kept = []
dropped = []
for obj in [item for item in bpy.context.scene.objects if item.type == "MESH"]:
    report = topology(obj)
    if report["boundaryEdges"] == 0 and report["nonManifoldEdges"] == 0:
        kept.append(obj)
    else:
        dropped.append(report)
        bpy.data.objects.remove(obj, do_unlink=True)

if not kept:
    raise SystemExit("No closed manifold islands remain.")

bpy.ops.object.select_all(action="DESELECT")
for obj in kept:
    obj.select_set(True)
bpy.context.view_layer.objects.active = kept[0]
if len(kept) > 1:
    bpy.ops.object.join()
model = bpy.context.view_layer.objects.active

model.data.materials.clear()
while model.data.uv_layers:
    model.data.uv_layers.remove(model.data.uv_layers[0])
while model.data.color_attributes:
    model.data.color_attributes.remove(model.data.color_attributes[0])
for material in list(bpy.data.materials):
    bpy.data.materials.remove(material)
for image in list(bpy.data.images):
    bpy.data.images.remove(image)

output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action="DESELECT")
model.select_set(True)
bpy.context.view_layer.objects.active = model
bpy.ops.export_scene.gltf(
    filepath=str(output),
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_materials="NONE",
    export_normals=False,
    export_tangents=False,
)

print(
    "GENESIS_DROP_OPEN_REPORT="
    + json.dumps(
        {
            "source": str(source),
            "output": str(output),
            "keptIslands": len(kept),
            "droppedIslands": len(dropped),
            "dropped": dropped,
            "outputBytes": output.stat().st_size,
        },
        separators=(",", ":"),
    )
)
