"""Close accidental open boundary loops in a Meshy GLB without remeshing its parts.

Usage:
  Blender --background --python blender-fill-meshy-boundaries.py -- input.glb output.glb

The source remains untouched. The script joins mesh objects, applies transforms, fills only
existing boundary loops, recalculates normals, strips material/UV/color payloads, and exports an
untextured GLB. It intentionally performs no vertex welding, union, decimation, smoothing, or
voxel remesh.
"""

import json
import sys
from pathlib import Path

import bmesh
import bpy


def arguments():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(args) != 2:
        raise SystemExit("Expected: input.glb output.glb")
    return Path(args[0]).resolve(), Path(args[1]).resolve()


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
    edge_faces = {}
    for polygon in obj.data.polygons:
        vertices = polygon.vertices
        for index, left in enumerate(vertices):
            right = vertices[(index + 1) % len(vertices)]
            edge = tuple(sorted((left, right)))
            edge_faces[edge] = edge_faces.get(edge, 0) + 1
    return {
        "vertices": len(obj.data.vertices),
        "edges": len(obj.data.edges),
        "polygons": len(obj.data.polygons),
        "triangles": len(obj.data.loop_triangles),
        "islands": connected_components(obj.data),
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

before = mesh_report(model)
bm = bmesh.new()
bm.from_mesh(model.data)
for _ in range(4):
    boundary_edges = [edge for edge in bm.edges if edge.is_boundary]
    if not boundary_edges:
        break
    before_count = len(boundary_edges)
    bmesh.ops.holes_fill(bm, edges=boundary_edges, sides=0)
    bm.edges.index_update()
    after_count = sum(edge.is_boundary for edge in bm.edges)
    if after_count >= before_count:
        break
if bm.faces:
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
bm.to_mesh(model.data)
bm.free()
model.data.update()

model.data.materials.clear()
while model.data.uv_layers:
    model.data.uv_layers.remove(model.data.uv_layers[0])
while model.data.color_attributes:
    model.data.color_attributes.remove(model.data.color_attributes[0])
for material in list(bpy.data.materials):
    bpy.data.materials.remove(material)
for image in list(bpy.data.images):
    bpy.data.images.remove(image)

after = mesh_report(model)
if after["boundaryEdges"] or after["nonManifoldEdges"]:
    raise SystemExit("Boundary repair did not produce closed manifold parts: " + json.dumps(after))

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
    "GENESIS_BOUNDARY_REPAIR_REPORT="
    + json.dumps(
        {
            "source": str(source),
            "output": str(output),
            "before": before,
            "after": after,
            "outputBytes": output.stat().st_size,
        },
        separators=(",", ":"),
    )
)
