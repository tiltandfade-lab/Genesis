"""Print a geometry inventory for one or more Meshy GLBs.

Usage:
  Blender --background --python inspect-meshy-glbs.py -- model.glb [...]
"""

import json
import sys
from pathlib import Path

import bpy
from mathutils import Vector


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


def edge_topology(mesh):
    edge_faces = {}
    for polygon in mesh.polygons:
        vertices = polygon.vertices
        for index, left in enumerate(vertices):
            right = vertices[(index + 1) % len(vertices)]
            edge = tuple(sorted((left, right)))
            edge_faces[edge] = edge_faces.get(edge, 0) + 1
    return {
        "boundaryEdges": sum(count == 1 for count in edge_faces.values()),
        "nonManifoldEdges": sum(count > 2 for count in edge_faces.values()),
    }


def inspect(source):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source))
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]

    triangles = 0
    vertices = 0
    islands = 0
    bounds = []
    meshes = []
    for obj in objects:
        obj.data.calc_loop_triangles()
        object_triangles = len(obj.data.loop_triangles)
        object_vertices = len(obj.data.vertices)
        object_islands = connected_components(obj.data)
        triangles += object_triangles
        vertices += object_vertices
        islands += object_islands
        meshes.append(
            {
                "name": obj.name,
                "triangles": object_triangles,
                "vertices": object_vertices,
                "islands": object_islands,
                "materials": len(obj.data.materials),
                **edge_topology(obj.data),
            }
        )
        bounds.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)

    minimum = [min(point[index] for point in bounds) for index in range(3)]
    maximum = [max(point[index] for point in bounds) for index in range(3)]
    size = [maximum[index] - minimum[index] for index in range(3)]
    return {
        "file": source.name,
        "bytes": source.stat().st_size,
        "objects": len(objects),
        "triangles": triangles,
        "vertices": vertices,
        "islands": islands,
        "materials": len(bpy.data.materials),
        "images": len(bpy.data.images),
        "size": [round(value, 5) for value in size],
        "meshes": meshes,
    }


args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
if not args:
    raise SystemExit("Expected at least one GLB path.")

print("MESHY_BATCH_INVENTORY_BEGIN")
print(json.dumps([inspect(Path(item).resolve()) for item in args], indent=2))
print("MESHY_BATCH_INVENTORY_END")
