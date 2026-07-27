"""Report loose-island geometry for material-ownership debugging.

Blender --background --python inspect-meshy-islands.py -- file.glb [...]
"""
import json
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def inspect(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    source = next(obj for obj in bpy.context.scene.objects if obj.type == "MESH")
    bpy.context.view_layer.objects.active = source
    source.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.separate(type="LOOSE")
    bpy.ops.object.mode_set(mode="OBJECT")
    rows = []
    for obj in (item for item in bpy.context.scene.objects if item.type == "MESH"):
        obj.data.calc_loop_triangles()
        edge_faces = {}
        for polygon in obj.data.polygons:
            vertices = polygon.vertices
            for index, left in enumerate(vertices):
                right = vertices[(index + 1) % len(vertices)]
                edge = tuple(sorted((left, right)))
                edge_faces[edge] = edge_faces.get(edge, 0) + 1
        points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
        minimum = [min(point[i] for point in points) for i in range(3)]
        maximum = [max(point[i] for point in points) for i in range(3)]
        rows.append({
            "triangles": len(obj.data.loop_triangles),
            "boundaryEdges": sum(count == 1 for count in edge_faces.values()),
            "nonManifoldEdges": sum(count > 2 for count in edge_faces.values()),
            "center": [round((minimum[i] + maximum[i]) / 2, 4) for i in range(3)],
            "size": [round(maximum[i] - minimum[i], 4) for i in range(3)],
        })
    rows.sort(key=lambda row: (-row["triangles"], row["center"]))
    return {"file": path.name, "islands": rows}


args = sys.argv[sys.argv.index("--") + 1:]
print("ISLAND_REPORT=" + json.dumps([inspect(Path(arg).resolve()) for arg in args]))
