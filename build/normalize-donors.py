#!/usr/bin/env python3
"""Normalize calibrated Kenney GLB donors into Genesis donor schema v2.

The calibration file is the only asset inventory. This build step owns deterministic geometry
measurement, source-to-Genesis transforms, attachment frames, validation, provenance, and indexes.
It intentionally has no per-pack or per-slug dispatch table: adding a valid calibration record and
source GLB is sufficient to produce a normalized donor.
"""
import argparse
import copy
import hashlib
import json
import math
import os
import shutil
import struct
import sys
import tempfile


REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEFAULT_SOURCE_ROOT = os.path.join(REPO_ROOT, "assets", "models")
DEFAULT_OUT_ROOT = os.path.join(REPO_ROOT, "assets", "models-normalized")
DEFAULT_CALIBRATION = os.path.join(REPO_ROOT, "dev", "model-foundry", "kenney-calibration.json")
DEFAULT_PROVENANCE = os.path.join(REPO_ROOT, "dev", "model-foundry", "KS1-PROVENANCE.json")
NORMALIZER_RECIPE_VERSION = "kgr3-calibration-v2"

GLB_MAGIC = b"glTF"
CHUNK_JSON = 0x4E4F534A
CHUNK_BIN = 0x004E4942
MATERIAL_FAMILIES = {"stone", "wood", "iron", "roof", "glass", "cloth"}
ADMISSION_CLASSES = {"DIRECT_MODULATED", "PART_DONOR", "CHASSIS"}
SOCKET_TYPES = {"floor-mount", "wall-mount", "top-surface", "hinge"}
MATE_RULES = {"coincident", "opposed-z"}
QA_STATUSES = {"needs-review", "approved-dev", "approved-runtime", "quarantined"}
MATERIAL_RECIPE = {
    "stone": {"roughness": 0.90, "metalness": 0.0},
    "wood": {"roughness": 0.85, "metalness": 0.0},
    "iron": {"roughness": 0.88, "metalness": 0.35},
    "roof": {"roughness": 0.88, "metalness": 0.0},
    "glass": {"roughness": 0.30, "metalness": 0.0},
    "cloth": {"roughness": 0.92, "metalness": 0.0},
}


class CalibrationError(Exception):
    pass


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def sha256_file(path):
    with open(path, "rb") as handle:
        return sha256_bytes(handle.read())


def canonical_json_bytes(value, indent=None):
    if indent is None:
        return json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8")
    return (json.dumps(value, sort_keys=True, indent=indent, allow_nan=False) + "\n").encode("utf-8")


def read_glb(path):
    with open(path, "rb") as handle:
        data = handle.read()
    if len(data) < 20:
        raise ValueError(f"truncated glb: {path}")
    magic, version, length = struct.unpack_from("<4sII", data, 0)
    if magic != GLB_MAGIC or version != 2 or length != len(data):
        raise ValueError(f"invalid glb header: {path}")
    offset, gltf, binchunk = 12, None, b""
    while offset < length:
        chunk_len, chunk_type = struct.unpack_from("<II", data, offset)
        offset += 8
        chunk = data[offset:offset + chunk_len]
        offset += chunk_len
        if chunk_type == CHUNK_JSON:
            gltf = json.loads(chunk.decode("utf-8"))
        elif chunk_type == CHUNK_BIN:
            binchunk = chunk
    if gltf is None:
        raise ValueError(f"no JSON chunk: {path}")
    return gltf, binchunk, data


def encode_glb(gltf, binchunk):
    json_chunk = canonical_json_bytes(gltf)
    json_chunk += b" " * ((4 - len(json_chunk) % 4) % 4)
    binary = binchunk + (b"\x00" * ((4 - len(binchunk) % 4) % 4) if binchunk else b"")
    total = 12 + 8 + len(json_chunk) + (8 + len(binary) if binary else 0)
    parts = [struct.pack("<4sII", GLB_MAGIC, 2, total),
             struct.pack("<II", len(json_chunk), CHUNK_JSON), json_chunk]
    if binary:
        parts.extend([struct.pack("<II", len(binary), CHUNK_BIN), binary])
    return b"".join(parts)


def write_glb(path, gltf_json, binchunk):
    with open(path, "wb") as handle:
        handle.write(encode_glb(gltf_json, binchunk))


def quat_to_mat3(q):
    x, y, z, w = q
    xx, yy, zz = x * x, y * y, z * z
    xy, xz, yz = x * y, x * z, y * z
    wx, wy, wz = w * x, w * y, w * z
    return [
        [1 - 2 * (yy + zz), 2 * (xy - wz), 2 * (xz + wy)],
        [2 * (xy + wz), 1 - 2 * (xx + zz), 2 * (yz - wx)],
        [2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (xx + yy)],
    ]


def mat4_from_trs(t, r, s):
    t, r, s = t or [0, 0, 0], r or [0, 0, 0, 1], s or [1, 1, 1]
    rot = quat_to_mat3(r)
    out = [[0.0] * 4 for _ in range(4)]
    for row in range(3):
        for col in range(3):
            out[row][col] = rot[row][col] * s[col]
    out[0][3], out[1][3], out[2][3], out[3][3] = t[0], t[1], t[2], 1.0
    return out


def mat4_from_matrix(values):
    return [[values[col * 4 + row] for col in range(4)] for row in range(4)]


def mat_mul(a, b):
    return [[sum(a[row][k] * b[k][col] for k in range(4)) for col in range(4)] for row in range(4)]


def mat_identity():
    return [[1.0 if row == col else 0.0 for col in range(4)] for row in range(4)]


def mat_column_major(matrix):
    return [matrix[row][col] for col in range(4) for row in range(4)]


def transform_point(matrix, point):
    vector = [point[0], point[1], point[2], 1.0]
    result = [sum(matrix[row][k] * vector[k] for k in range(4)) for row in range(4)]
    return result[:3]


def node_local_matrix(node):
    if "matrix" in node:
        return mat4_from_matrix(node["matrix"])
    return mat4_from_trs(node.get("translation"), node.get("rotation"), node.get("scale"))


def node_local_mesh_aabb(gltf, node_idx):
    node = gltf["nodes"][node_idx]
    mesh_idx = node.get("mesh")
    if mesh_idx is None:
        return None
    result = None
    for primitive in gltf["meshes"][mesh_idx].get("primitives", []):
        position_idx = primitive.get("attributes", {}).get("POSITION")
        if position_idx is None:
            continue
        accessor = gltf["accessors"][position_idx]
        low, high = accessor.get("min"), accessor.get("max")
        if not low or not high or not all(math.isfinite(v) for v in list(low[:3]) + list(high[:3])):
            continue
        if result is None:
            result = [list(low[:3]), list(high[:3])]
        else:
            for axis in range(3):
                result[0][axis] = min(result[0][axis], low[axis])
                result[1][axis] = max(result[1][axis], high[axis])
    return result


def walk_aabb(gltf, node_idx, parent_matrix, aabb):
    node = gltf["nodes"][node_idx]
    world = mat_mul(parent_matrix, node_local_matrix(node))
    local = node_local_mesh_aabb(gltf, node_idx)
    if local:
        low, high = local
        for x in (low[0], high[0]):
            for y in (low[1], high[1]):
                for z in (low[2], high[2]):
                    point = transform_point(world, [x, y, z])
                    for axis in range(3):
                        aabb[0][axis] = min(aabb[0][axis], point[axis])
                        aabb[1][axis] = max(aabb[1][axis], point[axis])
    for child in node.get("children", []):
        walk_aabb(gltf, child, world, aabb)


def scene_aabb(gltf):
    result = [[math.inf] * 3, [-math.inf] * 3]
    scene = gltf["scenes"][gltf.get("scene", 0)]
    for root in scene.get("nodes", []):
        walk_aabb(gltf, root, mat_identity(), result)
    if not all(math.isfinite(v) for side in result for v in side):
        raise ValueError("scene contains no measurable POSITION bounds")
    return result


def strip_materials(gltf):
    for key in ("materials", "textures", "images", "samplers"):
        gltf.pop(key, None)
    for ext_key in ("extensionsUsed", "extensionsRequired"):
        if ext_key in gltf:
            gltf[ext_key] = [value for value in gltf[ext_key] if value != "KHR_texture_transform"]
            if not gltf[ext_key]:
                del gltf[ext_key]
    for mesh in gltf.get("meshes", []):
        for primitive in mesh.get("primitives", []):
            primitive.pop("material", None)
            primitive.pop("extensions", None)


def merge_extras(node, donor_data):
    extras = dict(node.get("extras") or {})
    extras["genesisDonor"] = donor_data
    node["extras"] = extras


def is_finite_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def validate_vector(errors, label, value, length, positive=False):
    if not isinstance(value, list) or len(value) != length:
        errors.append(f"{label}: expected {length}-vector")
        return
    for index, component in enumerate(value):
        if not is_finite_number(component):
            errors.append(f"{label}[{index}]: must be finite")
        elif positive and component <= 0:
            errors.append(f"{label}[{index}]: must be positive")


def validate_quaternion(errors, label, value):
    validate_vector(errors, label, value, 4)
    if isinstance(value, list) and len(value) == 4 and all(is_finite_number(v) for v in value):
        norm = math.sqrt(sum(v * v for v in value))
        if norm == 0 or abs(norm - 1.0) > 1e-5:
            errors.append(f"{label}: quaternion norm {norm!r} is not 1 within 1e-5")


def reject_unknown(errors, label, value, allowed):
    if isinstance(value, dict):
        for key in sorted(set(value) - set(allowed)):
            errors.append(f"{label}.{key}: unknown field")


def load_calibration(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def validate_calibration(calibration, source_root):
    errors, sources = [], {}
    reject_unknown(errors, "calibration", calibration, {"schema", "algorithmVersion", "packs", "assets"})
    if calibration.get("schema") != "genesis.kenney-calibration.v1":
        errors.append("schema: expected genesis.kenney-calibration.v1")
    if not isinstance(calibration.get("algorithmVersion"), int) or calibration["algorithmVersion"] < 1:
        errors.append("algorithmVersion: expected positive integer")
    packs, assets = calibration.get("packs"), calibration.get("assets")
    if not isinstance(packs, dict) or not packs:
        errors.append("packs: expected nonempty object")
        packs = {}
    if not isinstance(assets, dict) or not assets:
        errors.append("assets: expected nonempty object")
        assets = {}

    for pack_id, pack in sorted(packs.items()):
        label = f"packs.{pack_id}"
        if not isinstance(pack, dict):
            errors.append(f"{label}: expected object")
            continue
        reject_unknown(errors, label, pack, {"sourceUp", "sourceForward", "canonicalScale", "structuralGrid"})
        scale = pack.get("canonicalScale")
        if not is_finite_number(scale) or scale <= 0:
            errors.append(f"{label}.canonicalScale: must be finite and positive")
        if pack.get("sourceUp") != "+Y" or pack.get("sourceForward") != "+Z":
            errors.append(f"{label}: KGR-3 seed supports calibrated +Y up / +Z forward only")
        grid = pack.get("structuralGrid")
        if grid is None:
            continue
        if not isinstance(grid, dict):
            errors.append(f"{label}.structuralGrid: expected object or null")
            continue
        reject_unknown(errors, f"{label}.structuralGrid", grid,
                       {"sourceModuleUnits", "targetWorldUnits", "orientationSteps", "joinMode"})
        for key in ("sourceModuleUnits", "targetWorldUnits"):
            if not is_finite_number(grid.get(key)) or grid[key] <= 0:
                errors.append(f"{label}.structuralGrid.{key}: must be finite and positive")
        if grid.get("orientationSteps") != 4 or grid.get("joinMode") != "cell-orientation":
            errors.append(f"{label}.structuralGrid: requires orientationSteps=4 and joinMode=cell-orientation")
        if (is_finite_number(scale) and isinstance(grid, dict) and
                is_finite_number(grid.get("sourceModuleUnits")) and
                is_finite_number(grid.get("targetWorldUnits")) and
                abs(scale * grid["sourceModuleUnits"] - grid["targetWorldUnits"]) > 1e-6):
            errors.append(f"{label}: canonicalScale * sourceModuleUnits must equal targetWorldUnits")

    for asset_id, asset in sorted(assets.items()):
        label = f"assets.{asset_id}"
        if not isinstance(asset, dict):
            errors.append(f"{label}: expected object")
            continue
        reject_unknown(errors, label, asset, {
            "sourceSha256", "admissionClass", "category", "rootMaterialFamily", "preTransform",
            "scaleReason", "groundOffset", "semanticParts", "sockets", "footprintOverride",
            "qaStatus", "notes", "companionLeaf",
        })
        if asset_id.count("/") != 1:
            errors.append(f"{label}: id must be <pack>/<slug>")
            continue
        pack_id, slug = asset_id.split("/", 1)
        if pack_id not in packs:
            errors.append(f"{label}: unknown pack {pack_id}")
        elif asset.get("admissionClass") == "DIRECT_MODULATED" and packs[pack_id].get("structuralGrid") is None:
            errors.append(f"{label}: DIRECT_MODULATED requires a pack structuralGrid")
        source_sha = asset.get("sourceSha256")
        if not isinstance(source_sha, str) or len(source_sha) != 64 or any(c not in "0123456789abcdef" for c in source_sha):
            errors.append(f"{label}.sourceSha256: expected 64 lowercase hex characters")
        if asset.get("admissionClass") not in ADMISSION_CLASSES:
            errors.append(f"{label}.admissionClass: invalid enum")
        if asset.get("rootMaterialFamily") not in MATERIAL_FAMILIES:
            errors.append(f"{label}.rootMaterialFamily: invalid enum")
        if not isinstance(asset.get("category"), str) or not asset["category"].strip():
            errors.append(f"{label}.category: nonempty string required")
        if asset.get("qaStatus") not in QA_STATUSES:
            errors.append(f"{label}.qaStatus: invalid enum")
        pre = asset.get("preTransform")
        if not isinstance(pre, dict):
            errors.append(f"{label}.preTransform: expected object")
        else:
            reject_unknown(errors, f"{label}.preTransform", pre, {"translation", "rotation", "scale"})
            validate_vector(errors, f"{label}.preTransform.translation", pre.get("translation"), 3)
            validate_quaternion(errors, f"{label}.preTransform.rotation", pre.get("rotation"))
            validate_vector(errors, f"{label}.preTransform.scale", pre.get("scale"), 3, positive=True)
            scale_vec = pre.get("scale")
            if isinstance(scale_vec, list) and len(scale_vec) == 3 and all(is_finite_number(v) for v in scale_vec):
                uniform = max(scale_vec) - min(scale_vec) <= 1e-9
                identity = all(abs(v - 1.0) <= 1e-9 for v in scale_vec)
                if not uniform:
                    errors.append(f"{label}.preTransform.scale: nonuniform scale is forbidden")
                if asset.get("admissionClass") == "DIRECT_MODULATED" and not identity:
                    errors.append(f"{label}: DIRECT_MODULATED per-asset scale must be identity")
                if not identity and not str(asset.get("scaleReason") or "").strip():
                    errors.append(f"{label}: nonidentity per-asset scale requires scaleReason")
        if not is_finite_number(asset.get("groundOffset")):
            errors.append(f"{label}.groundOffset: must be finite")
        semantic_parts = asset.get("semanticParts")
        if not isinstance(semantic_parts, dict):
            errors.append(f"{label}.semanticParts: expected object")
            semantic_parts = {}
        for part_id, part in sorted(semantic_parts.items()):
            reject_unknown(errors, f"{label}.semanticParts.{part_id}", part,
                           {"nodePath", "detachable", "materialFamily"})
            if not isinstance(part, dict) or not str(part.get("nodePath") or "").strip():
                errors.append(f"{label}.semanticParts.{part_id}: stable nodePath required")
            if not isinstance(part, dict) or not isinstance(part.get("detachable"), bool):
                errors.append(f"{label}.semanticParts.{part_id}.detachable: boolean required")
            if not isinstance(part, dict) or part.get("materialFamily") not in MATERIAL_FAMILIES:
                errors.append(f"{label}.semanticParts.{part_id}.materialFamily: invalid enum")
        sockets = asset.get("sockets")
        if not isinstance(sockets, list):
            errors.append(f"{label}.sockets: expected array")
            sockets = []
        ids = set()
        for index, socket in enumerate(sockets):
            slabel = f"{label}.sockets[{index}]"
            if not isinstance(socket, dict):
                errors.append(f"{slabel}: expected object")
                continue
            reject_unknown(errors, slabel, socket,
                           {"id", "type", "position", "rotation", "mateRule", "mateFamily", "size", "clearance"})
            socket_id = socket.get("id")
            if not isinstance(socket_id, str) or not socket_id:
                errors.append(f"{slabel}.id: nonempty string required")
            elif socket_id in ids:
                errors.append(f"{label}: duplicate socket id {socket_id}")
            else:
                ids.add(socket_id)
            if socket.get("type") not in SOCKET_TYPES:
                errors.append(f"{slabel}.type: invalid v2 type (butt-join sockets are forbidden)")
            if socket.get("mateRule") not in MATE_RULES:
                errors.append(f"{slabel}.mateRule: invalid enum")
            if not isinstance(socket.get("mateFamily"), str) or not socket["mateFamily"].strip():
                errors.append(f"{slabel}.mateFamily: nonempty string required")
            validate_vector(errors, f"{slabel}.position", socket.get("position"), 3)
            validate_quaternion(errors, f"{slabel}.rotation", socket.get("rotation"))
            validate_vector(errors, f"{slabel}.size", socket.get("size"), 3, positive=True)
            clearance = socket.get("clearance")
            if not isinstance(clearance, dict) or clearance.get("shape") != "box":
                errors.append(f"{slabel}.clearance: box required")
            else:
                reject_unknown(errors, f"{slabel}.clearance", clearance, {"shape", "size"})
                validate_vector(errors, f"{slabel}.clearance.size", clearance.get("size"), 3, positive=True)
        override = asset.get("footprintOverride")
        if override is not None:
            if not isinstance(override, dict):
                errors.append(f"{label}.footprintOverride: expected object or null")
            else:
                reject_unknown(errors, f"{label}.footprintOverride", override,
                               {"center", "halfExtents", "yawRadians"})
                validate_vector(errors, f"{label}.footprintOverride.center", override.get("center"), 2)
                validate_vector(errors, f"{label}.footprintOverride.halfExtents", override.get("halfExtents"), 2, positive=True)
                if not is_finite_number(override.get("yawRadians")):
                    errors.append(f"{label}.footprintOverride.yawRadians: must be finite")
        if asset.get("scaleReason") is not None and not isinstance(asset.get("scaleReason"), str):
            errors.append(f"{label}.scaleReason: string or null required")
        if not isinstance(asset.get("notes"), list) or not all(isinstance(note, str) for note in asset.get("notes", [])):
            errors.append(f"{label}.notes: string array required")

        source_path = os.path.join(source_root, pack_id, slug + ".glb")
        if not os.path.isfile(source_path):
            errors.append(f"{label}: missing source {source_path}")
            continue
        try:
            gltf, binchunk, raw = read_glb(source_path)
            actual_sha = sha256_bytes(raw)
            if actual_sha != source_sha:
                errors.append(f"{label}: sourceSha256 mismatch (expected {source_sha}, got {actual_sha})")
            paths = node_paths(gltf)
            for part_id, part in semantic_parts.items():
                if isinstance(part, dict) and part.get("nodePath") not in paths:
                    errors.append(f"{label}.semanticParts.{part_id}: nodePath not found: {part.get('nodePath')}")
            sources[asset_id] = (gltf, binchunk, raw_aabb_for_source(gltf))
        except Exception as exc:
            errors.append(f"{label}: source read failed: {exc}")
    return errors, sources


def node_paths(gltf):
    result = {}
    def visit(index, parents):
        node = gltf["nodes"][index]
        path = "/".join(parents + [node.get("name") or f"node-{index}"])
        result[path] = index
        for child in node.get("children", []):
            visit(child, parents + [node.get("name") or f"node-{index}"])
    for root in gltf["scenes"][gltf.get("scene", 0)].get("nodes", []):
        visit(root, [])
    return result


def raw_aabb_for_source(gltf):
    # This must remain the transformed scene walk. Accessor-wide unions include NORMAL/TANGENT
    # accessors and ignore node TRS; the real mini-dungeon wall is the mutation fixture for that bug.
    return scene_aabb(gltf)


def default_socket(socket_id, socket_type, position, mate_family):
    return {
        "id": socket_id, "type": socket_type, "position": position,
        "rotation": [0, 0, 0, 1], "mateRule": "coincident", "mateFamily": mate_family,
        "size": [0.05, 0.05, 0.05], "clearance": {"shape": "box", "size": [0.1, 0.1, 0.1]},
    }


def wrap_source(gltf, pack, asset, asset_id):
    old_roots = list(gltf["scenes"][gltf.get("scene", 0)].get("nodes", []))
    pre = asset["preTransform"]
    canonical = pack["canonicalScale"]
    source_translation = list(pre["translation"])
    source_translation[1] += asset["groundOffset"]
    source_scale = [value * canonical for value in pre["scale"]]
    source_idx = len(gltf["nodes"])
    gltf["nodes"].append({
        "name": "genesis-source-transform", "children": old_roots,
        "translation": source_translation, "rotation": list(pre["rotation"]), "scale": source_scale,
    })
    donor_idx = len(gltf["nodes"])
    gltf["nodes"].append({"name": asset_id.split("/", 1)[1], "children": [source_idx]})
    gltf["scenes"][gltf.get("scene", 0)]["nodes"] = [donor_idx]
    return donor_idx, mat4_from_trs(source_translation, pre["rotation"], source_scale)


def stamp_mesh_materials(gltf, original_paths, asset):
    overrides = {part["nodePath"]: (part_id, part) for part_id, part in asset["semanticParts"].items()}
    for path, index in original_paths.items():
        node = gltf["nodes"][index]
        if node.get("mesh") is None:
            continue
        family, part_id = asset["rootMaterialFamily"], None
        if path in overrides:
            part_id, part = overrides[path]
            family = part["materialFamily"]
        data = {"materialFamily": family}
        if part_id:
            data["semanticPart"] = part_id
        merge_extras(node, data)


def derive_bounds(gltf, asset):
    low, high = scene_aabb(gltf)
    if asset["footprintOverride"] is None:
        footprint = {
            "center": [(low[0] + high[0]) / 2.0, (low[2] + high[2]) / 2.0],
            "halfExtents": [(high[0] - low[0]) / 2.0, (high[2] - low[2]) / 2.0],
            "yawRadians": 0,
        }
        source = "derived"
    else:
        footprint, source = copy.deepcopy(asset["footprintOverride"]), "override"
    return {
        "aabbMin": low, "aabbMax": high, "groundY": low[1],
        "footprint": footprint, "footprintSource": source,
    }


def derive_sockets(asset, bounds):
    sockets = copy.deepcopy(asset["sockets"])
    types = {socket["type"] for socket in sockets}
    center = bounds["footprint"]["center"]
    if "floor-mount" not in types:
        sockets.append(default_socket("floor-mount", "floor-mount",
                                      [center[0], bounds["groundY"], center[1]], "floor"))
    if asset["category"] in {"floor", "stairs"} and "top-surface" not in types:
        sockets.append(default_socket("top-surface", "top-surface",
                                      [center[0], bounds["aabbMax"][1], center[1]], "placeable"))
    return sorted(sockets, key=lambda item: item["id"])


def validate_output_contract(errors, asset_id, asset, pack, gltf, bounds, sockets, source_matrix):
    label = f"assets.{asset_id}"
    if asset["admissionClass"] == "DIRECT_MODULATED":
        target = pack["structuralGrid"]["targetWorldUnits"]
        for axis, dimension in (("x", bounds["aabbMax"][0] - bounds["aabbMin"][0]),
                                ("z", bounds["aabbMax"][2] - bounds["aabbMin"][2])):
            nearest = round(dimension / target) * target
            if nearest <= 0 or abs(dimension - nearest) / nearest > 0.02:
                errors.append(f"{label}: DIRECT_MODULATED {axis} footprint {dimension} is not a module multiple within 2%")
    if any(socket["type"].startswith("butt-join-") for socket in sockets):
        errors.append(f"{label}: v2 structural output contains butt-join socket")
    for socket in sockets:
        if not all(is_finite_number(value) for value in socket["position"] + socket["rotation"]):
            errors.append(f"{label}.sockets.{socket['id']}: frame contains nonfinite value")
        matrix = mat4_from_trs(socket["position"], socket["rotation"], [1, 1, 1])
        axes = [[matrix[row][col] for row in range(3)] for col in range(3)]
        for index, axis in enumerate(axes):
            if abs(sum(v * v for v in axis) - 1.0) > 1e-5:
                errors.append(f"{label}.sockets.{socket['id']}: frame axis {index} is not unit length")
        if any(abs(sum(axes[a][i] * axes[b][i] for i in range(3))) > 1e-5
               for a in range(3) for b in range(a + 1, 3)):
            errors.append(f"{label}.sockets.{socket['id']}: frame axes are not orthogonal")
        if socket["type"] == "floor-mount" and abs(socket["position"][1] - bounds["groundY"]) > 0.01:
            errors.append(f"{label}.sockets.{socket['id']}: floor mount is off derived ground")
    flat_matrix = mat_column_major(source_matrix)
    if not all(is_finite_number(v) for v in flat_matrix):
        errors.append(f"{label}: sourceToGenesis matrix is nonfinite")


def normalize_asset(asset_id, asset, pack, source_tuple, calibration_hash):
    source_gltf, binchunk, raw_bounds = source_tuple
    gltf = copy.deepcopy(source_gltf)
    original_paths = node_paths(gltf)
    strip_materials(gltf)
    stamp_mesh_materials(gltf, original_paths, asset)
    donor_idx, source_matrix = wrap_source(gltf, pack, asset, asset_id)
    bounds = derive_bounds(gltf, asset)
    sockets = derive_sockets(asset, bounds)
    recipe_payload = {
        "version": NORMALIZER_RECIPE_VERSION, "calibrationHash": calibration_hash,
        "assetId": asset_id, "pack": pack, "asset": asset,
    }
    recipe_hash = sha256_bytes(canonical_json_bytes(recipe_payload))
    metadata = {
        "schema": "genesis.donor.v2", "assetId": asset_id,
        "sourceSha256": asset["sourceSha256"], "recipeHash": recipe_hash,
        "admissionClass": asset["admissionClass"], "category": asset["category"],
        "normalizedFrame": {"up": "+Y", "forward": "+Z", "sourceToGenesis": mat_column_major(source_matrix)},
        "structuralGrid": copy.deepcopy(pack["structuralGrid"]), "bounds": bounds,
        "semanticParts": copy.deepcopy(asset["semanticParts"]), "sockets": sockets,
        "qaStatus": asset["qaStatus"],
    }
    merge_extras(gltf["nodes"][donor_idx], metadata)
    gltf.setdefault("asset", {})["extras"] = {
        "genesisDonorNormalizer": NORMALIZER_RECIPE_VERSION, "recipeHash": recipe_hash,
        "schema": "genesis.donor.v2",
    }
    low, high = raw_bounds
    raw_dims = [high[i] - low[i] for i in range(3)]
    scaled_dims = [bounds["aabbMax"][i] - bounds["aabbMin"][i] for i in range(3)]
    entry = {
        "schema": "genesis.donor.v2", "file": asset_id.split("/", 1)[1] + ".glb",
        "assetId": asset_id, "recipeHash": recipe_hash, "sourceSha256": asset["sourceSha256"],
        "admissionClass": asset["admissionClass"], "category": asset["category"],
        "semanticParts": copy.deepcopy(asset["semanticParts"]),
        "materialFamilies": sorted({asset["rootMaterialFamily"]} |
                                   {part["materialFamily"] for part in asset["semanticParts"].values()}),
        "sockets": sockets, "canonicalScale": pack["canonicalScale"],
        "structuralGrid": copy.deepcopy(pack["structuralGrid"]), "bounds": bounds,
        "normalizedFrame": metadata["normalizedFrame"],
        "companionLeaf": asset.get("companionLeaf"), "qaStatus": asset["qaStatus"],
    }
    report = dict(entry)
    report.update({"pack": asset_id.split("/", 1)[0], "slug": asset_id.split("/", 1)[1],
                   "rawDims": raw_dims, "scaledDims": scaled_dims,
                   "socketCounts": socket_type_counts(sockets),
                   "outputFile": f"assets/models-normalized/{asset_id}.glb"})
    return encode_glb(gltf, binchunk), entry, report, (gltf, bounds, sockets, source_matrix)


def socket_type_counts(sockets):
    counts = {}
    for socket in sockets:
        counts[socket["type"]] = counts.get(socket["type"], 0) + 1
    return counts


def build_all(calibration, sources):
    calibration_hash = sha256_bytes(canonical_json_bytes(calibration))
    outputs, indexes, reports, contract_errors = {}, {}, [], []
    for asset_id, asset in sorted(calibration["assets"].items()):
        pack_id, slug = asset_id.split("/", 1)
        glb_bytes, entry, report, contract = normalize_asset(
            asset_id, asset, calibration["packs"][pack_id], sources[asset_id], calibration_hash)
        validate_output_contract(contract_errors, asset_id, asset, calibration["packs"][pack_id], *contract)
        outputs[(pack_id, slug + ".glb")] = glb_bytes
        indexes.setdefault(pack_id, {})[slug] = entry
        reports.append(report)
    index_docs = {}
    for pack_id, entries in sorted(indexes.items()):
        index_docs[pack_id] = {
            "schema": "genesis.donor-index.v2", "pack": pack_id,
            "algorithmVersion": calibration["algorithmVersion"],
            "normalizerVersion": NORMALIZER_RECIPE_VERSION,
            "calibrationHash": calibration_hash, "assets": entries,
        }
    global_counts = {}
    for report in reports:
        for socket_type, count in report["socketCounts"].items():
            global_counts[socket_type] = global_counts.get(socket_type, 0) + count
    provenance = {
        "schema": "genesis.donor-provenance.v2", "unit": "KGR-3",
        "normalizerVersion": NORMALIZER_RECIPE_VERSION,
        "algorithmVersion": calibration["algorithmVersion"], "calibrationHash": calibration_hash,
        "packs": {pack_id: {**copy.deepcopy(pack),
                             "piecesAdmitted": sum(1 for report in reports if report["pack"] == pack_id)}
                  for pack_id, pack in sorted(calibration["packs"].items())},
        "totalPiecesAdmitted": len(reports), "globalSocketCounts": global_counts,
        "materialFamiliesObserved": sorted({family for report in reports for family in report["materialFamilies"]}),
        "materialRecipe": MATERIAL_RECIPE, "pieces": reports,
        "deviationsAndNotes": [
            "Donor schema v1 point/universal butt-join sockets are superseded by v2 attachment frames and cell-orientation structural placement.",
            "All v2 attachment positions inherited from the KS-1 seed remain needs-review until KGR-4C visual approval.",
        ],
    }
    return contract_errors, outputs, index_docs, provenance


def atomic_write(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, temp_path = tempfile.mkstemp(prefix=".kgr3-", dir=os.path.dirname(path))
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
        os.replace(temp_path, path)
    except Exception:
        try:
            os.unlink(temp_path)
        except OSError:
            pass
        raise


def write_outputs(out_root, provenance_path, outputs, indexes, provenance):
    os.makedirs(out_root, exist_ok=True)
    stage = tempfile.mkdtemp(prefix=".kgr3-stage-", dir=os.path.dirname(out_root))
    backups = []
    try:
        for (pack_id, filename), data in outputs.items():
            pack_dir = os.path.join(stage, pack_id)
            os.makedirs(pack_dir, exist_ok=True)
            with open(os.path.join(pack_dir, filename), "wb") as handle:
                handle.write(data)
        for pack_id, index in indexes.items():
            with open(os.path.join(stage, pack_id, "index.json"), "wb") as handle:
                handle.write(canonical_json_bytes(index, indent=2))
        for pack_id in sorted(indexes):
            destination = os.path.join(out_root, pack_id)
            incoming = os.path.join(stage, pack_id)
            backup = destination + ".kgr3-backup"
            if os.path.exists(backup):
                shutil.rmtree(backup)
            if os.path.exists(destination):
                os.replace(destination, backup)
                backups.append((destination, backup))
            os.replace(incoming, destination)
        atomic_write(provenance_path, canonical_json_bytes(provenance, indent=2))
        for _, backup in backups:
            shutil.rmtree(backup)
    except Exception:
        for destination, backup in reversed(backups):
            if os.path.exists(destination):
                shutil.rmtree(destination)
            if os.path.exists(backup):
                os.replace(backup, destination)
        raise
    finally:
        shutil.rmtree(stage, ignore_errors=True)


def parse_args(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("--calibration", default=DEFAULT_CALIBRATION)
    parser.add_argument("--source-root", default=DEFAULT_SOURCE_ROOT)
    parser.add_argument("--output-root", default=DEFAULT_OUT_ROOT)
    parser.add_argument("--provenance", default=DEFAULT_PROVENANCE)
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--check", action="store_true")
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv or sys.argv[1:])
    try:
        calibration = load_calibration(args.calibration)
    except Exception as exc:
        print(f"[normalize-donors] calibration read failed: {exc}", file=sys.stderr)
        return 1
    errors, sources = validate_calibration(calibration, args.source_root)
    if not errors:
        try:
            contract_errors, outputs, indexes, provenance = build_all(calibration, sources)
            errors.extend(contract_errors)
        except Exception as exc:
            errors.append(f"normalization planning failed: {exc}")
    if errors:
        print(f"[normalize-donors] {len(errors)} validation error(s); no outputs replaced:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1
    if not args.validate_only:
        write_outputs(args.output_root, args.provenance, outputs, indexes, provenance)
    print(f"[normalize-donors] {len(outputs)} calibrated assets validated"
          f"{' (no writes)' if args.validate_only else ' and normalized'}; schema genesis.donor.v2")
    if args.check:
        print("[normalize-donors] --check complete; deterministic artifacts regenerated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
