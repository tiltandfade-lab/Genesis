"""Conservatively repair a Meshy GLB without changing its authored silhouette.

Usage:
  Blender --background --python blender-repair-meshy-candidate.py -- \
    input.glb output.glb [merge_factor]

`merge_factor` is multiplied by the imported model's largest bounding-box dimension. The default
is 0.0001. The script joins mesh objects, applies transforms, welds only nearby vertices, removes
degenerate geometry, recalculates normals, strips all material/image payloads, and exports one
untextured GLB. It does not remesh, decimate, smooth, fill holes, or union intentionally separate
parts.
"""

import json
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector


def arguments():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(args) not in (2, 3):
        raise SystemExit("Expected: input.glb output.glb [merge_factor]")
    factor = float(args[2]) if len(args) == 3 else 0.0001
    if factor < 0:
        raise SystemExit("merge_factor must be non-negative")
    return Path(args[0]).resolve(), Path(args[1]).resolve(), factor


def connected_components(mesh):
    adjacency = [set() for _ in mesh.vertices]
    for edge in mesh.edges:
        left, right = edge.vertices
        adjacency[left].add(right)
        adjacency[right].add(left)

    unseen = set(range(len(mesh.vertices)))
    components = 0
    while unseen:
        components += 1
        stack = [unseen.pop()]
        while stack:
            vertex = stack.pop()
            neighbors = adjacency[vertex] & unseen
            unseen.difference_update(neighbors)
            stack.extend(neighbors)
    return components


def mesh_report(obj):
    obj.data.calc_loop_triangles()
    face_counts = {}
    for polygon in obj.data.polygons:
        vertices = polygon.vertices
        for index, left in enumerate(vertices):
            right = vertices[(index + 1) % len(vertices)]
            edge = tuple(sorted((left, right)))
            face_counts[edge] = face_counts.get(edge, 0) + 1
    return {
        "vertices": len(obj.data.vertices),
        "edges": len(obj.data.edges),
        "polygons": len(obj.data.polygons),
        "triangles": len(obj.data.loop_triangles),
        "islands": connected_components(obj.data),
        "boundaryEdges": sum(count == 1 for count in face_counts.values()),
        "nonManifoldEdges": sum(count > 2 for count in face_counts.values()),
    }


source, output, merge_factor = arguments()
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

corners = [model.matrix_world @ Vector(corner) for corner in model.bound_box]
minimum = Vector(tuple(min(point[axis] for point in corners) for axis in range(3)))
maximum = Vector(tuple(max(point[axis] for point in corners) for axis in range(3)))
reach = max(maximum - minimum)
merge_distance = reach * merge_factor

before = mesh_report(model)
bm = bmesh.new()
bm.from_mesh(model.data)
if merge_distance > 0:
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=merge_distance)
bmesh.ops.dissolve_degenerate(bm, dist=max(merge_distance * 0.1, 1e-9), edges=list(bm.edges))
if bm.faces:
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
bm.to_mesh(model.data)
bm.free()
model.data.update()

for obj in [item for item in bpy.context.scene.objects if item.type == "MESH"]:
    obj.data.materials.clear()
    while obj.data.uv_layers:
        obj.data.uv_layers.remove(obj.data.uv_layers[0])
    while obj.data.color_attributes:
        obj.data.color_attributes.remove(obj.data.color_attributes[0])
for material in list(bpy.data.materials):
    bpy.data.materials.remove(material)
for image in list(bpy.data.images):
    bpy.data.images.remove(image)

after = mesh_report(model)
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
    "GENESIS_REPAIR_REPORT="
    + json.dumps(
        {
            "source": str(source),
            "output": str(output),
            "mergeFactor": merge_factor,
            "mergeDistance": merge_distance,
            "boundsSize": list(maximum - minimum),
            "before": before,
            "after": after,
            "outputBytes": output.stat().st_size,
        },
        separators=(",", ":"),
    )
)
