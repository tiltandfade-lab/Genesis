"""Flatten conservative triangle pairs that are clearly intended as one structural plane.

Usage:
  Blender --background --python blender-flatten-structural-quad-pairs.py -- \
    input.glb output.glb [max_angle_degrees] [max_displacement_ratio]

Meshy Smart Topology emits triangles. Broad construction faces are commonly represented by two
triangles whose shared diagonal has a shallow accidental fold. This script finds only triangle
pairs where the shared edge behaves like a quad diagonal, fits one plane through their four
vertices, and solves the collected plane constraints without changing topology.

It does not remesh, decimate, weld, fill holes, join parts, or touch materials. Pairs that require
more than the allowed displacement are rejected. Exported normals are omitted so GLB does not
split the connected donor into independent per-face vertices merely to preserve flat shading.
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector


def arguments():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(args) not in (2, 3, 4):
        raise SystemExit(
            "Expected: input.glb output.glb [max_angle_degrees] [max_displacement_ratio]"
        )
    angle = float(args[2]) if len(args) >= 3 else 12.0
    displacement = float(args[3]) if len(args) >= 4 else 0.0125
    if not 0 < angle <= 30:
        raise SystemExit("max_angle_degrees must be in (0, 30].")
    if not 0 < displacement <= 0.05:
        raise SystemExit("max_displacement_ratio must be in (0, 0.05].")
    return Path(args[0]).resolve(), Path(args[1]).resolve(), angle, displacement


def topology_report(objects):
    boundary = 0
    nonmanifold = 0
    triangles = 0
    vertices = 0
    for obj in objects:
        mesh = obj.data
        mesh.calc_loop_triangles()
        triangles += len(mesh.loop_triangles)
        vertices += len(mesh.vertices)
        counts = {}
        for polygon in mesh.polygons:
            indices = polygon.vertices
            for index, left in enumerate(indices):
                right = indices[(index + 1) % len(indices)]
                key = tuple(sorted((left, right)))
                counts[key] = counts.get(key, 0) + 1
        boundary += sum(count == 1 for count in counts.values())
        nonmanifold += sum(count > 2 for count in counts.values())
    return {
        "objects": len(objects),
        "vertices": vertices,
        "triangles": triangles,
        "boundaryEdges": boundary,
        "nonManifoldEdges": nonmanifold,
    }


def face_normal(points):
    normal = np.cross(points[1] - points[0], points[2] - points[0])
    length = np.linalg.norm(normal)
    return normal / length if length > 1e-12 else None


def best_fit_plane(points):
    center = points.mean(axis=0)
    _, _, vh = np.linalg.svd(points - center, full_matrices=False)
    normal = vh[-1]
    length = np.linalg.norm(normal)
    if length <= 1e-12:
        return None
    normal /= length
    return normal, float(np.dot(normal, center))


def parallelogram_like(vertex_points, left_ids, right_ids, shared, normal):
    boundary_edges = []
    for ids in (left_ids, right_ids):
        for index, first in enumerate(ids):
            second = ids[(index + 1) % 3]
            edge = tuple(sorted((first, second)))
            if edge != shared:
                boundary_edges.append(edge)
    if len(set(boundary_edges)) != 4:
        return False
    adjacency = {}
    for first, second in boundary_edges:
        adjacency.setdefault(first, []).append(second)
        adjacency.setdefault(second, []).append(first)
    if any(len(neighbors) != 2 for neighbors in adjacency.values()):
        return False
    order = [boundary_edges[0][0]]
    previous = None
    current = order[0]
    for _ in range(3):
        choices = [item for item in adjacency[current] if item != previous]
        if not choices:
            return False
        following = choices[0]
        order.append(following)
        previous, current = current, following
    if order[-1] not in adjacency[order[0]]:
        return False

    edges = []
    for index, vertex_id in enumerate(order):
        following = order[(index + 1) % 4]
        vector = vertex_points[following] - vertex_points[vertex_id]
        # Remove the shallow fold before measuring the intended outline.
        vector = vector - normal * np.dot(vector, normal)
        length = np.linalg.norm(vector)
        if length <= 1e-12:
            return False
        edges.append(vector / length)
    parallel_limit = math.cos(math.radians(15.0))
    if abs(float(np.dot(edges[0], edges[2]))) < parallel_limit:
        return False
    if abs(float(np.dot(edges[1], edges[3]))) < parallel_limit:
        return False
    # Exclude extremely skewed four-sided facets that happen to have parallel opposing edges.
    if abs(float(np.dot(edges[0], edges[1]))) > math.cos(math.radians(55.0)):
        return False
    return True


def pair_candidates(obj, max_angle_radians, max_displacement):
    mesh = obj.data
    vertex_points = np.array([vertex.co[:] for vertex in mesh.vertices], dtype=float)
    triangles = [polygon for polygon in mesh.polygons if len(polygon.vertices) == 3]
    face_by_index = {polygon.index: polygon for polygon in triangles}
    edge_faces = {}
    for polygon in triangles:
        ids = list(polygon.vertices)
        for index, left in enumerate(ids):
            right = ids[(index + 1) % 3]
            edge_faces.setdefault(tuple(sorted((left, right))), []).append(polygon.index)

    candidates = []
    for shared, linked in edge_faces.items():
        if len(linked) != 2:
            continue
        left_face = face_by_index.get(linked[0])
        right_face = face_by_index.get(linked[1])
        if left_face is None or right_face is None:
            continue
        left_ids = list(left_face.vertices)
        right_ids = list(right_face.vertices)
        unique = sorted(set(left_ids + right_ids))
        if len(unique) != 4:
            continue

        left_points = vertex_points[left_ids]
        right_points = vertex_points[right_ids]
        left_normal = face_normal(left_points)
        right_normal = face_normal(right_points)
        if left_normal is None or right_normal is None:
            continue
        dot = float(np.clip(abs(np.dot(left_normal, right_normal)), -1.0, 1.0))
        angle = math.acos(dot)
        if angle <= math.radians(0.05) or angle > max_angle_radians:
            continue

        shared_length = np.linalg.norm(vertex_points[shared[0]] - vertex_points[shared[1]])

        def longest_edge(ids):
            lengths = []
            for index, first in enumerate(ids):
                second = ids[(index + 1) % 3]
                lengths.append(np.linalg.norm(vertex_points[first] - vertex_points[second]))
            return max(lengths)

        # A triangulated rectangular face normally shares its longest edge: the hidden diagonal.
        if shared_length < longest_edge(left_ids) * 0.94:
            continue
        if shared_length < longest_edge(right_ids) * 0.94:
            continue

        points = vertex_points[unique]
        fitted = best_fit_plane(points)
        if fitted is None:
            continue
        normal, offset = fitted
        if not parallelogram_like(
            vertex_points,
            left_ids,
            right_ids,
            tuple(sorted(shared)),
            normal,
        ):
            continue
        distances = np.abs(points @ normal - offset)
        span = max(
            np.linalg.norm(points[first] - points[second])
            for first in range(4)
            for second in range(first + 1, 4)
        )
        if span <= 1e-12:
            continue
        displacement_ratio = float(distances.max() / span)
        if displacement_ratio > max_displacement:
            continue
        candidates.append(
            {
                "faces": tuple(linked),
                "vertices": tuple(unique),
                "normal": normal,
                "offset": offset,
                "angleDegrees": math.degrees(angle),
                "displacementRatio": displacement_ratio,
                "sharedLength": float(shared_length),
            }
        )

    # A triangle may participate in only one reconstructed structural quad.
    accepted = []
    used_faces = set()
    for candidate in sorted(
        candidates,
        key=lambda item: (-item["sharedLength"], item["displacementRatio"]),
    ):
        if any(face in used_faces for face in candidate["faces"]):
            continue
        used_faces.update(candidate["faces"])
        accepted.append(candidate)
    return accepted


def cluster_constraints(constraints):
    clustered = []
    for normal, offset in constraints:
        matched = None
        for cluster in clustered:
            alignment = float(np.dot(normal, cluster["normal"]))
            adjusted_normal = normal
            adjusted_offset = offset
            if alignment < 0:
                alignment = -alignment
                adjusted_normal = -normal
                adjusted_offset = -offset
            if alignment >= math.cos(math.radians(3.0)):
                matched = cluster
                cluster["normals"].append(adjusted_normal)
                cluster["offsets"].append(adjusted_offset)
                mean_normal = np.mean(cluster["normals"], axis=0)
                cluster["normal"] = mean_normal / np.linalg.norm(mean_normal)
                cluster["offset"] = float(np.mean(cluster["offsets"]))
                break
        if matched is None:
            clustered.append(
                {
                    "normal": normal.copy(),
                    "offset": float(offset),
                    "normals": [normal.copy()],
                    "offsets": [float(offset)],
                }
            )
    return [(cluster["normal"], cluster["offset"]) for cluster in clustered]


def solve_vertex(original, constraints):
    constraints = cluster_constraints(constraints)
    matrix = np.array([normal for normal, _ in constraints], dtype=float)
    offsets = np.array([offset for _, offset in constraints], dtype=float)
    residual = matrix @ original - offsets
    correction = matrix.T @ np.linalg.pinv(matrix @ matrix.T) @ residual
    return original - correction


source, output, max_angle_degrees, max_displacement_ratio = arguments()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(source))
objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
if not objects:
    raise SystemExit("No mesh objects imported.")

bpy.ops.object.select_all(action="DESELECT")
for obj in objects:
    if obj.data.users > 1:
        obj.data = obj.data.copy()
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    obj.select_set(False)

before = topology_report(objects)
object_reports = []
total_pairs = 0
total_vertices = 0
largest_move = 0.0
for obj in objects:
    mesh = obj.data
    candidates = pair_candidates(
        obj,
        math.radians(max_angle_degrees),
        max_displacement_ratio,
    )
    constraints = {}
    for candidate in candidates:
        for vertex in candidate["vertices"]:
            constraints.setdefault(vertex, []).append(
                (candidate["normal"], candidate["offset"])
            )

    reach = max(float(value) for value in obj.dimensions)
    move_limit = reach * max_displacement_ratio
    moved = 0
    rejected_vertices = 0
    max_move = 0.0
    for index, vertex_constraints in constraints.items():
        original = np.array(mesh.vertices[index].co[:], dtype=float)
        corrected = solve_vertex(original, vertex_constraints)
        distance = float(np.linalg.norm(corrected - original))
        if distance > move_limit:
            rejected_vertices += 1
            continue
        if distance <= 1e-9:
            continue
        mesh.vertices[index].co = Vector(corrected.tolist())
        moved += 1
        max_move = max(max_move, distance)
    mesh.update()
    total_pairs += len(candidates)
    total_vertices += moved
    largest_move = max(largest_move, max_move)
    object_reports.append(
        {
            "object": obj.name,
            "flattenedPairs": len(candidates),
            "movedVertices": moved,
            "rejectedVertices": rejected_vertices,
            "maxMove": max_move,
            "pairAngles": [
                round(candidate["angleDegrees"], 4) for candidate in candidates
            ],
        }
    )

after = topology_report(objects)
if before != after:
    raise RuntimeError(f"Topology changed unexpectedly: before={before}, after={after}")

output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action="DESELECT")
for obj in objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = objects[0]
bpy.ops.export_scene.gltf(
    filepath=str(output),
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_materials="EXPORT",
    export_normals=False,
    export_tangents=False,
)

print(
    "GENESIS_PLANARITY_REPORT="
    + json.dumps(
        {
            "source": str(source),
            "output": str(output),
            "maxAngleDegrees": max_angle_degrees,
            "maxDisplacementRatio": max_displacement_ratio,
            "before": before,
            "after": after,
            "flattenedPairs": total_pairs,
            "movedVertices": total_vertices,
            "maxMove": largest_move,
            "objects": object_reports,
            "outputBytes": output.stat().st_size,
        },
        separators=(",", ":"),
    )
)
