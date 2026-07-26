"""Render a neutral diagnostic preview of a GLB with Blender.

Usage:
  Blender --background --python blender-intake-preview.py -- input.glb output.png [yaw] [elevation]
"""
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def arguments():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(args) not in (2, 3, 4):
        raise SystemExit("Expected: input.glb output.png [yaw] [elevation]")
    yaw = math.radians(float(args[2])) if len(args) >= 3 else math.radians(-51.2)
    elevation = math.radians(float(args[3])) if len(args) >= 4 else math.radians(26.5)
    return Path(args[0]).resolve(), Path(args[1]).resolve(), yaw, elevation


def point_camera(camera, target):
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()


source, output, yaw, elevation = arguments()
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))

meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
if not meshes:
    raise SystemExit("No mesh objects imported.")

clay = bpy.data.materials.new("Genesis intake clay")
clay.diffuse_color = (0.50, 0.44, 0.36, 1.0)
clay.roughness = 0.82
for obj in meshes:
    obj.data.materials.clear()
    obj.data.materials.append(clay)

corners = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
minimum = Vector(tuple(min(point[axis] for point in corners) for axis in range(3)))
maximum = Vector(tuple(max(point[axis] for point in corners) for axis in range(3)))
center = (minimum + maximum) * 0.5
size = maximum - minimum
reach = max(size)

camera_data = bpy.data.cameras.new("Intake camera")
camera = bpy.data.objects.new("Intake camera", camera_data)
bpy.context.scene.collection.objects.link(camera)
camera_direction = Vector((
    math.cos(yaw) * math.cos(elevation),
    math.sin(yaw) * math.cos(elevation),
    math.sin(elevation),
))
camera.location = center + camera_direction * reach * 2.8
camera.data.type = "ORTHO"
camera.data.ortho_scale = reach * 1.48
point_camera(camera, center)

scene = bpy.context.scene
scene.camera = camera
scene.render.engine = "BLENDER_WORKBENCH"
scene.display.shading.light = "STUDIO"
scene.display.shading.studio_light = "rim.sl"
scene.display.shading.color_type = "MATERIAL"
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = "WORLD"
scene.display.shading.curvature_ridge_factor = 1.1
scene.display.shading.curvature_valley_factor = 0.8
scene.display.shading.background_type = "WORLD"
scene.display.shading.show_specular_highlight = False
scene.world.color = (0.018, 0.021, 0.026)
scene.render.resolution_x = 900
scene.render.resolution_y = 760
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(output)
scene.render.film_transparent = False
output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.render.render(write_still=True)

report = {
    "source": str(source),
    "output": str(output),
    "meshObjects": len(meshes),
    "vertices": sum(len(obj.data.vertices) for obj in meshes),
    "edges": sum(len(obj.data.edges) for obj in meshes),
    "polygons": sum(len(obj.data.polygons) for obj in meshes),
    "bounds": {
        "min": list(minimum),
        "max": list(maximum),
        "size": list(size),
    },
}
print("GENESIS_INTAKE_REPORT=" + json.dumps(report, separators=(",", ":")))
