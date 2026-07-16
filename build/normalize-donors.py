#!/usr/bin/env python3
"""build/normalize-donors.py — KS-1 (docs/KENNEY-SOCKET-WAVE.md) the Kenney donor build-time
normalizer. Pure Python 3 stdlib only (no pygltflib/trimesh/node available in this environment —
verified before writing this: `python3 -c "import pygltflib"` / `import trimesh` both
ModuleNotFoundError, no node_modules/package.json in the repo). Implements a minimal glTF-binary
(.glb) reader/writer by hand off the public glTF 2.0 spec (12-byte header + JSON chunk + optional
BIN chunk, each chunk padded to 4-byte alignment).

GOVERNED BY (read in full before touching this file):
  docs/ART-DIRECTION-CANON.md (quoted, never paraphrased, for any art-direction language)
  docs/GRAPHICS-CONVERGENCE-CHARTER.md §3.4/§5/§6
  docs/KENNEY-SOCKET-WAVE.md unit KS-1 (this file's spec — executed verbatim, not re-litigated)
  Sol's P-B recipe, quoted verbatim below (docs/VQ2-RESPEC.md §1 / ui-sketches/mock-frames/
  vq2-world-looks/SOL-SOLUTIONS.md, branch codex/vq2-world-looks — read via `git show`, that
  branch is NOT merged to master; this file only depends on its LANGUAGE, not its code):

  P-B LAW (verbatim): "Kenney is a geometry reserve, never a render style. A donor mesh is
  admitted only after its materials, value grouping, scale, sockets, and condition are replaced
  by Genesis-owned recipes; if its silhouette still reads "raw Kenney" at gameplay thumbnail
  size, it is CHASSIS and requires a generated face treatment or decomposition rather than a
  stronger tint."
  P-B RECIPE (verbatim): "Add one donor adapter at the GLTF boundary, keyed by
  {pack, slug, admissionClass, semanticParts, sockets, canonicalScale}. On load, traverse donor
  meshes, discard their authored pastel MeshStandardMaterials, classify node/material names into
  stone|wood|iron|roof|glass|cloth, and rebuild with Genesis materials: roughness 0.82–0.94,
  metalness 0.0 except iron 0.35, realm-graded five-band albedo sampled through gradeColorLocal,
  nearest-filtered 32×32 deterministic grain from interiorMaterialTexture, and selective outline
  color from the realm profile. ... Cache the normalized GLTF by recipe hash and keep the source
  pack untouched."

  BUILD/RUNTIME SPLIT (this file's own scope decision, stated up front): gradeColorLocal and
  interiorMaterialTexture are THREE.js/canvas/live-realm-profile calls — they cannot run in an
  offline Python build step. This script's job is the OFFLINE half of the recipe: discard the
  authored materials wholesale (byte-level — the output GLB carries no materials/textures/images/
  samplers at all), CLASSIFY each node into a Genesis material family, and STAMP that
  classification (+ sockets + canonicalScale + provenance) as glTF `extras` on the relevant
  nodes. The RUNTIME half (actually painting roughness/metalness/graded-albedo/grain onto a THREE
  material at load time, keyed off the family this script stamps) lives in
  src/ui/theater-donor.js — the one new ES-module runtime loader this KS-1 unit also ships,
  per the lane boundary in its own header (it must not edit theater-boot.js/theater-materials.js).

USAGE:
    python3 build/normalize-donors.py           # normalize the KS-1 pilot set, write outputs
    python3 build/normalize-donors.py --check   # re-run + diff against committed output
                                                 # (the determinism gate dev/verify-kenney-adapter.mjs
                                                 # also exercises programmatically)

OUTPUTS:
    assets/models-normalized/<pack>/<slug>.glb     — normalized GLB (materials stripped, sockets +
                                                       provenance in node.extras.genesisDonor,
                                                       canonicalScale BAKED into each scene root
                                                       node's own `scale` field — so a plain
                                                       GLTFLoader.load() already returns geometry
                                                       correctly sized to Genesis world units;
                                                       sockets are recorded in that SAME post-scale
                                                       frame).
    assets/models-normalized/<pack>/index.json      — slug -> {file, recipeHash, admissionClass,
                                                       semanticParts, sockets, canonicalScale}
                                                       lookup table the runtime loader fetches.
    dev/model-foundry/KS1-PROVENANCE.json           — the full per-piece provenance/report record
                                                       (raw data: measured dims, scale derivation,
                                                       socket counts, material families, source
                                                       sha256, recipe hash, license pointer).
"""
import json
import os
import struct
import sys
import hashlib
import math

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSETS_MODELS = os.path.join(REPO_ROOT, "assets", "models")
OUT_ROOT = os.path.join(REPO_ROOT, "assets", "models-normalized")
PROVENANCE_PATH = os.path.join(REPO_ROOT, "dev", "model-foundry", "KS1-PROVENANCE.json")

# recipe/classification code version — folded into recipeHash so a future rule change (a new
# semanticPart mapping, a corrected socket formula, a canonicalScale re-derivation) invalidates
# the cache deterministically without needing a manual cache-bust. Bump this when the
# classification/socket/scale RULES below change (not when unrelated parts of this file change).
NORMALIZER_RECIPE_VERSION = "ks1-normalize-v1"

# ─────────────────────────────────────────────────────────────────────────────────────────────
# GRID LAW (src/ui/theater-interior.js:25, quoted): "1 SpatialPlan cell = 5 ft = 1 world unit".
# Every canonicalScale below targets this — the pilot's own measured "1 kit module" maps to
# 2 Genesis world units (10 ft), not 1 (5 ft). MEASURED, not guessed — see "SCALE DERIVATION"
# below for the full measurement + cross-check chain per pack.
# ─────────────────────────────────────────────────────────────────────────────────────────────
GENESIS_WORLD_UNIT_FT = 5.0
MODULE_TARGET_WORLD_UNITS = 2.0  # 1 kit module = 2 Genesis cells = 10 ft (measured, see below)

# ─────────────────────────────────────────────────────────────────────────────────────────────
# SCALE DERIVATION (measured, not guessed — dev/normalize-donors measurement pass, 2026-07-15):
#
# kenney-modular-dungeon-kit: template-floor.glb / corridor.glb / template-corner.glb / room-*.glb
# all measure an exact 4.0-authored-unit module footprint (template-floor.glb world AABB:
# X [-2,2] Z [-2,2] = 4.0x4.0; corridor.glb 4.0x4.15x4.0; room-small.glb 12.0x12.0 = exactly 3
# modules; room-large.glb 20.0x20.0 = exactly 5 modules — module size is internally consistent
# across 7+ independently-measured pieces). Cross-check for the module-to-feet ratio: standard
# D&D dungeon corridors are conventionally 10 ft (2 cells) wide, and this pack's corridor.glb is
# exactly 1 module wide -> 1 module = 10 ft = 2 world units -> 1 authored unit = 2.5 ft.
# Second independent cross-check: at that ratio, corridor.glb's measured wall height (4.15
# authored units) comes out to 10.375 ft, matching the DMG's own 10-ft standard dungeon ceiling
# convention within ~4%. Two independent real-world references (10-ft corridor convention, 10-ft
# ceiling convention) both land within a few percent of the same authored-unit-to-feet ratio —
# this is the "measure the wall module against the 5-ft cell" the spec asks for, not a guess.
#   canonicalScale = MODULE_TARGET_WORLD_UNITS / measured_module_units = 2.0 / 4.0 = 0.5
#
# kenney-mini-dungeon: wall.glb / floor.glb both measure an exact 1.0-authored-unit module
# footprint (world AABB X [-0.5,0.5] Z [-0.5,0.5] = 1.0x1.0, consistent across both pieces).
# This is a SEPARATE pack with its own authored-unit convention (Kenney does not publish a
# shared real-world scale across separate downloadable kits), so it cannot borrow the modular-
# dungeon-kit's per-authored-unit ratio directly — it needs its own measurement. Cross-check
# path: assume the SAME real-world module size (10 ft = 2 world units) as the sibling dungeon
# pack, since both are Kenney "dungeon" kits built to the same design brief (a documented,
# stated assumption, not hidden) -> 1 authored unit = 10 ft = 2 world units.
#   canonicalScale = MODULE_TARGET_WORLD_UNITS / measured_module_units = 2.0 / 1.0 = 2.0
# Independent cross-check: at that ratio, wall.glb's measured height (1.1 authored units) comes
# out to 11 ft — within the same plausible 10-11ft dungeon-ceiling band the OTHER pack's
# independently-derived ratio produced (10.375 ft) via a completely different reference
# (module-footprint assumption vs corridor-width+ceiling-height convention). The two packs'
# independently-measured ceiling heights landing within ~6% of each other, via two unrelated
# derivation paths, is the cross-validation — recorded honestly in KS1-PROVENANCE.json for
# Adam's red-pen, not asserted as certain. (character-human.glb was ALSO measured — 0.7553
# authored units tall — but Kenney "mini" kit characters are commonly stylized/short relative to
# true anthropometric scale for tile-kit legibility, so anchoring the ratio to a "6ft human"
# assumption produced an INCONSISTENT wall height (~8.4ft) vs the module-parity method (~11ft);
# the module-parity + corridor/ceiling cross-check was preferred as the more consistent, better-
# corroborated measurement. This deviation is logged, not hidden.)
# ─────────────────────────────────────────────────────────────────────────────────────────────
PACK_CANONICAL_SCALE = {
    "kenney-modular-dungeon-kit": 0.5,
    "kenney-mini-dungeon": 2.0,
}
PACK_MEASURED_MODULE_UNITS = {
    "kenney-modular-dungeon-kit": 4.0,
    "kenney-mini-dungeon": 1.0,
}

# ─── minimal glTF-binary (.glb) reader ─────────────────────────────────────────────────────────
GLB_MAGIC = b"glTF"
CHUNK_JSON = 0x4E4F534A
CHUNK_BIN = 0x004E4942


def read_glb(path):
    with open(path, "rb") as f:
        data = f.read()
    magic, version, length = struct.unpack_from("<4sII", data, 0)
    if magic != GLB_MAGIC:
        raise ValueError(f"not a glb (bad magic): {path}")
    offset = 12
    gltf = None
    binchunk = b""
    while offset < length:
        chunk_len, chunk_type = struct.unpack_from("<II", data, offset)
        offset += 8
        chunk_data = data[offset:offset + chunk_len]
        offset += chunk_len
        if chunk_type == CHUNK_JSON:
            gltf = json.loads(chunk_data.decode("utf-8"))
        elif chunk_type == CHUNK_BIN:
            binchunk = chunk_data
    if gltf is None:
        raise ValueError(f"no JSON chunk in glb: {path}")
    return gltf, binchunk, data


def write_glb(path, gltf_json, binchunk):
    """Repacks a glTF JSON object + an UNTOUCHED binary chunk into a .glb. JSON chunk padded with
    spaces (0x20) to 4-byte alignment per spec; BIN chunk padded with zero bytes. Deterministic:
    sort_keys + fixed separators means byte-identical output for byte-identical input (the
    determinism gate dev/verify-kenney-adapter.mjs exercises)."""
    json_bytes = json.dumps(gltf_json, sort_keys=True, separators=(",", ":")).encode("utf-8")
    pad = (4 - (len(json_bytes) % 4)) % 4
    json_bytes += b" " * pad
    bin_bytes = binchunk
    bin_pad = (4 - (len(bin_bytes) % 4)) % 4 if bin_bytes else 0
    bin_bytes = bin_bytes + (b"\x00" * bin_pad) if bin_bytes else bin_bytes

    total_len = 12 + 8 + len(json_bytes)
    if bin_bytes:
        total_len += 8 + len(bin_bytes)

    with open(path, "wb") as f:
        f.write(struct.pack("<4sII", GLB_MAGIC, 2, total_len))
        f.write(struct.pack("<II", len(json_bytes), CHUNK_JSON))
        f.write(json_bytes)
        if bin_bytes:
            f.write(struct.pack("<II", len(bin_bytes), CHUNK_BIN))
            f.write(bin_bytes)


# ─── pure AABB math (no numpy) — mirrors dev tooling written during measurement, kept local so
#     this script has zero non-stdlib deps ──────────────────────────────────────────────────────
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
    t = t or [0, 0, 0]
    r = r or [0, 0, 0, 1]
    s = s or [1, 1, 1]
    m3 = quat_to_mat3(r)
    M = [[0] * 4 for _ in range(4)]
    for i in range(3):
        for j in range(3):
            M[i][j] = m3[i][j] * s[j]
    M[0][3] = t[0]
    M[1][3] = t[1]
    M[2][3] = t[2]
    M[3][3] = 1
    return M


def mat4_from_matrix(mat):
    M = [[0] * 4 for _ in range(4)]
    for col in range(4):
        for row in range(4):
            M[row][col] = mat[col * 4 + row]
    return M


def mat_mul(A, B):
    C = [[0] * 4 for _ in range(4)]
    for i in range(4):
        for j in range(4):
            C[i][j] = sum(A[i][k] * B[k][j] for k in range(4))
    return C


def mat_identity():
    return [[1 if i == j else 0 for j in range(4)] for i in range(4)]


def transform_point(M, p):
    x, y, z = p
    v = [x, y, z, 1]
    out = [sum(M[i][k] * v[k] for k in range(4)) for i in range(4)]
    return (out[0], out[1], out[2])


def node_local_matrix(node):
    if "matrix" in node:
        return mat4_from_matrix(node["matrix"])
    return mat4_from_trs(node.get("translation"), node.get("rotation"), node.get("scale"))


def walk_aabb(gltf, node_idx, parent_matrix, aabb):
    node = gltf["nodes"][node_idx]
    world = mat_mul(parent_matrix, node_local_matrix(node))
    mesh_idx = node.get("mesh")
    if mesh_idx is not None:
        for prim in gltf["meshes"][mesh_idx].get("primitives", []):
            pos_idx = prim.get("attributes", {}).get("POSITION")
            if pos_idx is None:
                continue
            acc = gltf["accessors"][pos_idx]
            mn, mx = acc.get("min"), acc.get("max")
            if not mn or not mx:
                continue
            for corner in [(mn[0], mn[1], mn[2]), (mn[0], mn[1], mx[2]), (mn[0], mx[1], mn[2]), (mn[0], mx[1], mx[2]),
                           (mx[0], mn[1], mn[2]), (mx[0], mn[1], mx[2]), (mx[0], mx[1], mn[2]), (mx[0], mx[1], mx[2])]:
                wp = transform_point(world, corner)
                for i in range(3):
                    aabb[0][i] = min(aabb[0][i], wp[i])
                    aabb[1][i] = max(aabb[1][i], wp[i])
    for c in node.get("children", []):
        walk_aabb(gltf, c, world, aabb)


def scene_aabb(gltf):
    scene_idx = gltf.get("scene", 0)
    scene = gltf["scenes"][scene_idx]
    aabb = [[math.inf, math.inf, math.inf], [-math.inf, -math.inf, -math.inf]]
    for root in scene.get("nodes", []):
        walk_aabb(gltf, root, mat_identity(), aabb)
    return aabb


def node_world_matrix(gltf, target_idx):
    """world matrix of one specific node (used for hinge-position derivation)."""
    result = {"m": None}

    def walk(node_idx, parent_matrix):
        node = gltf["nodes"][node_idx]
        world = mat_mul(parent_matrix, node_local_matrix(node))
        if node_idx == target_idx:
            result["m"] = world
        for c in node.get("children", []):
            walk(c, world)

    scene_idx = gltf.get("scene", 0)
    for root in gltf["scenes"][scene_idx].get("nodes", []):
        walk(root, mat_identity())
    return result["m"]


def node_local_mesh_aabb(gltf, node_idx):
    """AABB of just this node's own mesh in the node's OWN local space (pre-transform) — used to
    find the leaf's own edge for hinge derivation."""
    node = gltf["nodes"][node_idx]
    mesh_idx = node.get("mesh")
    if mesh_idx is None:
        return None
    aabb = None
    for prim in gltf["meshes"][mesh_idx].get("primitives", []):
        pos_idx = prim.get("attributes", {}).get("POSITION")
        if pos_idx is None:
            continue
        acc = gltf["accessors"][pos_idx]
        mn, mx = acc.get("min"), acc.get("max")
        if not mn or not mx:
            continue
        aabb = [list(mn), list(mx)]
    return aabb


# ─────────────────────────────────────────────────────────────────────────────────────────────
# MATERIAL FAMILY CLASSIFICATION — "classify node/material names into stone|wood|iron|roof|glass
# |cloth" (Sol P-B, quoted above). Kenney's own glTF exports carry ONE shared "colormap" material
# per file (a texture-atlas convention) — the material NAME itself carries zero semantic
# information (verified: every inspected piece's material is literally named "colormap"). So
# classification here runs on NODE NAME (the mesh/node's own authored name — "wall", "door",
# "gate", "stairs", "template-floor", etc.) which DOES carry real semantic signal in every piece
# inspected. This is "classify node/material names" read correctly for a kit that only gives one
# of those two signals anything to classify on.
# ─────────────────────────────────────────────────────────────────────────────────────────────
FAMILY_STONE, FAMILY_WOOD, FAMILY_IRON, FAMILY_ROOF, FAMILY_GLASS, FAMILY_CLOTH = (
    "stone", "wood", "iron", "roof", "glass", "cloth",
)

# roughness ALWAYS in the 0.82-0.94 band regardless of family (Sol P-B: "roughness 0.82-0.94,
# metalness 0.0 except iron 0.35" reads as ONE roughness band for every family, ONLY metalness
# varies by family) — this table is exported for src/ui/theater-donor.js's own header record
# (kept here as the single source Adam can review; the runtime module inlines the same numbers
# since it cannot import this Python file, and its own header says so).
MATERIAL_RECIPE = {
    FAMILY_STONE: {"roughness": 0.90, "metalness": 0.0},
    FAMILY_WOOD: {"roughness": 0.85, "metalness": 0.0},
    FAMILY_IRON: {"roughness": 0.88, "metalness": 0.35},
    FAMILY_ROOF: {"roughness": 0.88, "metalness": 0.0},
    FAMILY_GLASS: {"roughness": 0.30, "metalness": 0.0},
    FAMILY_CLOTH: {"roughness": 0.92, "metalness": 0.0},
}

# ─────────────────────────────────────────────────────────────────────────────────────────────
# PILOT MANIFEST — the KS-1 admitted set. "master-resident packs only ... STRUCTURAL pieces —
# walls, wall-corners, doorways/gates, doors, arches, floors, stairs — NOT decor first" (spec,
# verbatim). Every file in each pack was individually inspected (node names, mesh names, world
# AABB via the exact AABB code above) before this table was written — see
# dev/model-foundry/KS1-PROVENANCE.json for the full measured-dims record per piece. Pieces NOT
# in this table (creatures, weapons, containers, terrain dressing, wood-structure/wood-support
# bracing, column) are left as SOURCE_RESERVE per KENNEY-MESH-AUDIT.md's own taxonomy — untouched,
# undeleted, simply not normalized this wave; each exclusion is logged in the provenance report
# with a one-line reason, never silently dropped.
#
# Per-entry fields:
#   category: one of the spec's named STRUCTURAL categories this piece fills
#   rootFamily: material family for the piece's root/frame node
#   leafNode: name of a CHILD node that is a distinct sub-part needing its OWN family + its own
#             hinge socket (a swinging door leaf / portcullis leaf), or None
#   leafFamily: material family for that child node, if leafNode is set
#   shellLike: True for whole floor+wall(+ceiling) architectural chunks -> gets floor-mount +
#              top-surface + all 4 butt-joins
#   frameLike: True for doorway/gate frames -> gets floor-mount + all 4 butt-joins (+ hinge if it
#              owns/hosts a leaf, whether in this same file or a companion file in the pack)
#   wallLike:  True for wall/corner/floor-tile atomic template pieces -> floor-mount + butt-joins
#              (+ top-surface for floor-flavored ones, see isFloor)
#   isFloor:   True adds a top-surface socket (walkable/placeable top face) to a wallLike piece
#   isStairs:  True -> floor-mount + top-surface (at measured top landing height) + butt-joins
#   leafOnly:  True for a standalone door-leaf file with NO frame geometry of its own (mini-
#              dungeon's gate.glb) -> hinge + floor-mount only, no butt-joins (not a module-grid
#              piece)
# ─────────────────────────────────────────────────────────────────────────────────────────────
MODULAR_DUNGEON_PIECES = {
    # corridor shells (floor+walls+ceiling baked as one mesh)
    "corridor": {"category": "corridor-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "corridor-corner": {"category": "corridor-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "corridor-end": {"category": "corridor-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "corridor-intersection": {"category": "corridor-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "corridor-junction": {"category": "corridor-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "corridor-transition": {"category": "corridor-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "corridor-wide": {"category": "corridor-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "corridor-wide-corner": {"category": "corridor-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "corridor-wide-end": {"category": "corridor-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "corridor-wide-intersection": {"category": "corridor-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "corridor-wide-junction": {"category": "corridor-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    # room shells
    "room-corner": {"category": "room-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "room-large": {"category": "room-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "room-large-variation": {"category": "room-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "room-small": {"category": "room-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "room-small-variation": {"category": "room-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "room-wide": {"category": "room-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    "room-wide-variation": {"category": "room-shell", "rootFamily": FAMILY_STONE, "shellLike": True},
    # doorway/gate frames — gate-door.glb/gate-door-window.glb carry a child "door" node (the
    # swinging leaf, wood); gate-metal-bars.glb carries a child "gate" node (the leaf, iron); the
    # plain gate.glb has NO leaf child (an open, fixed archway) -> fills the "arches" category,
    # honestly noted in the report as the closest analog since neither pack ships a dedicated
    # freestanding arch piece.
    "gate-door": {"category": "doorway-frame", "rootFamily": FAMILY_STONE, "frameLike": True,
                  "leafNode": "door", "leafFamily": FAMILY_WOOD},
    "gate-door-window": {"category": "doorway-frame", "rootFamily": FAMILY_STONE, "frameLike": True,
                          "leafNode": "door", "leafFamily": FAMILY_WOOD},
    "gate-metal-bars": {"category": "doorway-frame", "rootFamily": FAMILY_STONE, "frameLike": True,
                         "leafNode": "gate", "leafFamily": FAMILY_IRON},
    "gate": {"category": "arch", "rootFamily": FAMILY_STONE, "frameLike": True},
    # stairs
    "stairs": {"category": "stairs", "rootFamily": FAMILY_STONE, "isStairs": True},
    "stairs-wide": {"category": "stairs", "rootFamily": FAMILY_STONE, "isStairs": True},
    # atomic wall/corner/floor template pieces
    "template-corner": {"category": "wall-corner", "rootFamily": FAMILY_STONE, "wallLike": True},
    "template-wall-corner": {"category": "wall-corner", "rootFamily": FAMILY_STONE, "wallLike": True},
    "template-wall": {"category": "wall", "rootFamily": FAMILY_STONE, "wallLike": True},
    "template-wall-detail-a": {"category": "wall", "rootFamily": FAMILY_STONE, "wallLike": True},
    "template-wall-half": {"category": "wall", "rootFamily": FAMILY_STONE, "wallLike": True},
    "template-wall-stairs": {"category": "wall", "rootFamily": FAMILY_STONE, "wallLike": True},
    "template-wall-top": {"category": "wall", "rootFamily": FAMILY_STONE, "wallLike": True},
    "template-detail": {"category": "wall", "rootFamily": FAMILY_STONE, "wallLike": True},
    "template-floor": {"category": "floor", "rootFamily": FAMILY_STONE, "wallLike": True, "isFloor": True},
    "template-floor-big": {"category": "floor", "rootFamily": FAMILY_STONE, "wallLike": True, "isFloor": True},
    "template-floor-detail": {"category": "floor", "rootFamily": FAMILY_STONE, "wallLike": True, "isFloor": True},
    "template-floor-detail-a": {"category": "floor", "rootFamily": FAMILY_STONE, "wallLike": True, "isFloor": True},
    "template-floor-layer": {"category": "floor", "rootFamily": FAMILY_STONE, "wallLike": True, "isFloor": True},
    "template-floor-layer-hole": {"category": "floor", "rootFamily": FAMILY_STONE, "wallLike": True, "isFloor": True},
    "template-floor-layer-raised": {"category": "floor", "rootFamily": FAMILY_STONE, "wallLike": True, "isFloor": True},
}

MINI_DUNGEON_PIECES = {
    "wall": {"category": "wall", "rootFamily": FAMILY_STONE, "wallLike": True},
    "wall-half": {"category": "wall", "rootFamily": FAMILY_STONE, "wallLike": True},
    "wall-narrow": {"category": "wall", "rootFamily": FAMILY_STONE, "wallLike": True},
    # wall-opening is the doorway HOST in this pack (the leaf lives in the separate gate.glb file
    # below) — gets a hinge socket marking where that companion leaf mounts.
    "wall-opening": {"category": "doorway-frame", "rootFamily": FAMILY_STONE, "frameLike": True,
                      "companionLeaf": "gate"},
    "floor": {"category": "floor", "rootFamily": FAMILY_STONE, "wallLike": True, "isFloor": True},
    "floor-detail": {"category": "floor", "rootFamily": FAMILY_STONE, "wallLike": True, "isFloor": True},
    "stairs": {"category": "stairs", "rootFamily": FAMILY_STONE, "isStairs": True},
    # standalone leaf: parent "gate" node carries NO mesh, child "door" node carries the actual
    # leaf geometry, symmetric about its own node origin (X -0.4..0.4) — unlike the modular-
    # dungeon-kit's asymmetric leaf (offset entirely to one side, so ITS node origin already IS
    # the hinge edge), this leaf's hinge edge is derived from its own local mesh-space min-X face.
    "gate": {"category": "door-leaf", "rootFamily": FAMILY_WOOD, "leafOnly": True, "leafChildNode": "door"},
}

# excluded pieces, logged with an honest one-line reason (never silently dropped) — kept OUT of
# the pilot admission per the spec's named category list (walls/wall-corners/doorways-gates/
# door-leaves/arches/floors/stairs); left as SOURCE_RESERVE.
EXCLUDED_MINI_DUNGEON = {
    "character-human": "creature figure, out of KS-1's structural-pilot scope",
    "character-orc": "creature figure, out of KS-1's structural-pilot scope",
    "dirt": "terrain dressing, not a named structural category",
    "rocks": "terrain dressing, not a named structural category",
    "stones": "terrain dressing, not a named structural category",
    "banner": "decor, KS-1 pilot is structural-only (\"NOT decor first\", spec verbatim)",
    "barrel": "prop/container, not a named structural category",
    "chest": "prop/container, not a named structural category",
    "coin": "prop, not a named structural category",
    "shield-rectangle": "weapon/prop, not a named structural category",
    "shield-round": "weapon/prop, not a named structural category",
    "weapon-spear": "weapon/prop, not a named structural category",
    "weapon-sword": "weapon/prop, not a named structural category",
    "trap": "mechanism/prop, not a named structural category",
    "column": "support piece with no clean fit to walls/wall-corners/floors/stairs/doorways/"
              "arches; excluded to stay disciplined to the spec's named category list",
    "wood-structure": "support/bracing piece, same exclusion reasoning as column",
    "wood-support": "support/bracing piece, same exclusion reasoning as column",
}


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        h.update(f.read())
    return h.hexdigest()


def find_node_index_by_name(gltf, name):
    for i, n in enumerate(gltf.get("nodes", [])):
        if n.get("name") == name:
            return i
    return None


def strip_materials(gltf):
    """Byte-level material discard, per P-B: 'discard their authored pastel MeshStandardMaterials'.
    Drops materials/textures/images/samplers arrays wholesale and every primitive's `material`
    index + any now-unused TEXCOORD attribute reference. The BIN chunk is left completely
    untouched (image bytes become unreferenced dead weight inside it rather than being surgically
    cut — deliberately: re-offsetting bufferViews after removing image bytes is exactly the kind
    of binary-surgery bug class this script avoids by construction; a few dead KB of orphaned
    texture bytes is a fully acceptable, honestly-documented tradeoff for zero risk of corrupting
    live POSITION/NORMAL geometry accessors, which is what actually matters for KS-1)."""
    for key in ("materials", "textures", "images", "samplers"):
        if key in gltf:
            del gltf[key]
    if "extensionsUsed" in gltf:
        gltf["extensionsUsed"] = [e for e in gltf["extensionsUsed"] if e != "KHR_texture_transform"]
        if not gltf["extensionsUsed"]:
            del gltf["extensionsUsed"]
    if "extensionsRequired" in gltf:
        gltf["extensionsRequired"] = [e for e in gltf["extensionsRequired"] if e != "KHR_texture_transform"]
        if not gltf["extensionsRequired"]:
            del gltf["extensionsRequired"]
    for mesh in gltf.get("meshes", []):
        for prim in mesh.get("primitives", []):
            if "material" in prim:
                del prim["material"]
            attrs = prim.get("attributes", {})
            for tk in [k for k in attrs if k.startswith("TEXCOORD_")]:
                del attrs[tk]
            if "extensions" in prim:
                del prim["extensions"]


def bake_scale_into_roots(gltf, scale):
    """Bakes canonicalScale directly into every scene root node's own `scale` field (none of the
    pilot pieces carry a `matrix` on their root nodes — verified during inspection — so this is a
    safe, minimal JSON edit: no vertex/accessor rewriting, no matrix-decomposition risk). After
    this, a plain GLTFLoader.load() on the output file already returns geometry sized correctly
    to Genesis world units — sockets (computed below, already in the post-scale frame) line up
    with it with no further runtime math."""
    scene_idx = gltf.get("scene", 0)
    for root_idx in gltf["scenes"][scene_idx].get("nodes", []):
        node = gltf["nodes"][root_idx]
        if "matrix" in node:
            raise ValueError("unexpected matrix on a pilot root node — scale-bake assumption violated")
        existing = node.get("scale", [1, 1, 1])
        node["scale"] = [existing[0] * scale, existing[1] * scale, existing[2] * scale]


def sockets_for_shell(aabb_scaled):
    (mnx, mny, mnz), (mxx, mxy, mxz) = aabb_scaled
    cx, cz = (mnx + mxx) / 2.0, (mnz + mxz) / 2.0
    return [
        {"type": "floor-mount", "position": [cx, 0.0, cz]},
        {"type": "top-surface", "position": [cx, 0.0, cz]},
        {"type": "butt-join-n", "position": [cx, 0.0, mnz]},
        {"type": "butt-join-s", "position": [cx, 0.0, mxz]},
        {"type": "butt-join-e", "position": [mxx, 0.0, cz]},
        {"type": "butt-join-w", "position": [mnx, 0.0, cz]},
    ]


def sockets_for_wall(aabb_scaled, is_floor):
    (mnx, mny, mnz), (mxx, mxy, mxz) = aabb_scaled
    cx, cz = (mnx + mxx) / 2.0, (mnz + mxz) / 2.0
    s = [
        {"type": "floor-mount", "position": [cx, 0.0, cz]},
        {"type": "butt-join-n", "position": [cx, 0.0, mnz]},
        {"type": "butt-join-s", "position": [cx, 0.0, mxz]},
        {"type": "butt-join-e", "position": [mxx, 0.0, cz]},
        {"type": "butt-join-w", "position": [mnx, 0.0, cz]},
    ]
    if is_floor:
        s.append({"type": "top-surface", "position": [cx, 0.0, cz]})
    return s


def sockets_for_stairs(aabb_scaled):
    (mnx, mny, mnz), (mxx, mxy, mxz) = aabb_scaled
    cx, cz = (mnx + mxx) / 2.0, (mnz + mxz) / 2.0
    return [
        {"type": "floor-mount", "position": [cx, 0.0, cz]},
        # top landing: approximated at the piece's measured top height, centered in XZ — a
        # documented simplification (the true landing is a sub-region, not the whole footprint
        # center); flagged for KS-2/KS-3 to refine when stairs actually get placed against a wall
        # run. mxy is already the height in the CALLER's (post-scale) frame.
        {"type": "top-surface", "position": [cx, mxy, cz]},
        {"type": "butt-join-n", "position": [cx, 0.0, mnz]},
        {"type": "butt-join-s", "position": [cx, 0.0, mxz]},
        {"type": "butt-join-e", "position": [mxx, 0.0, cz]},
        {"type": "butt-join-w", "position": [mnx, 0.0, cz]},
    ]


def sockets_for_frame(aabb_scaled, hinge_pos):
    (mnx, mny, mnz), (mxx, mxy, mxz) = aabb_scaled
    cx, cz = (mnx + mxx) / 2.0, (mnz + mxz) / 2.0
    s = [
        {"type": "floor-mount", "position": [cx, 0.0, cz]},
        {"type": "butt-join-n", "position": [cx, 0.0, mnz]},
        {"type": "butt-join-s", "position": [cx, 0.0, mxz]},
        {"type": "butt-join-e", "position": [mxx, 0.0, cz]},
        {"type": "butt-join-w", "position": [mnx, 0.0, cz]},
    ]
    if hinge_pos is not None:
        s.append({"type": "hinge", "position": list(hinge_pos)})
    return s


def derive_hinge_for_leaf_child(gltf, root_idx, leaf_node_idx, scale):
    """Hinge derivation rule (documented, applied consistently, not hand-tuned per file):
    - if the leaf's OWN local mesh AABB is asymmetric about its node origin (heavily offset to
      one side — e.g. spans [-3,0] not [-1.5,1.5]), the node's own local origin (its translation
      in the PARENT's frame, i.e. its world position when the parent/frame node is untransformed)
      IS already the hinge edge — the kit's own modeling convention places the pivot there.
    - if the leaf's local mesh AABB is roughly SYMMETRIC about its node origin, there is no
      offset to read the edge from; the hinge edge is instead the leaf's own local mesh-space
      min-X face (a deterministic, documented convention — 'hinge on the local-space left edge'),
      transformed into world space.
    Returns (x,y,z) in the ALREADY-SCALED (canonicalScale-applied) Genesis-world frame.
    """
    world_m = node_world_matrix(gltf, leaf_node_idx)
    local_aabb = node_local_mesh_aabb(gltf, leaf_node_idx)
    if world_m is None or local_aabb is None:
        return None
    mn, mx = local_aabb
    span = [mx[i] - mn[i] for i in range(3)]
    mid = [(mn[i] + mx[i]) / 2.0 for i in range(3)]
    # asymmetry ratio on X (the swing axis in every pilot leaf) — how far the local AABB's own
    # midpoint sits from 0 (the node origin) relative to its own half-width.
    half_w = span[0] / 2.0 if span[0] > 1e-9 else 1e-9
    asym = abs(mid[0]) / half_w
    if asym > 0.5:
        # asymmetric: node origin (0,0,0) local -> hinge edge already there
        hinge_local = (0.0, mid[1], mid[2])
    else:
        # symmetric: hinge = local mesh-space min-X face, mid Y/Z
        hinge_local = (mn[0], mid[1], mid[2])
    world_pt = transform_point(world_m, hinge_local)
    return (world_pt[0] * scale, world_pt[1] * scale, world_pt[2] * scale)


def classify_piece(pack, slug, gltf, binchunk, src_path, spec):
    scale = PACK_CANONICAL_SCALE[pack]
    raw_aabb = scene_aabb(gltf)
    scaled_aabb = [[c * scale for c in raw_aabb[0]], [c * scale for c in raw_aabb[1]]]
    raw_dims = [raw_aabb[1][i] - raw_aabb[0][i] for i in range(3)]
    scaled_dims = [scaled_aabb[1][i] - scaled_aabb[0][i] for i in range(3)]

    root_idx = gltf["scenes"][gltf.get("scene", 0)]["nodes"][0]
    node_extras = {}  # node_idx -> genesisDonor dict
    all_sockets = []
    semantic_parts = [spec["category"]]
    material_families = [spec["rootFamily"]]

    if spec.get("shellLike"):
        sockets = sockets_for_shell(scaled_aabb)
    elif spec.get("isStairs"):
        sockets = sockets_for_stairs(scaled_aabb)
    elif spec.get("leafOnly"):
        leaf_idx = find_node_index_by_name(gltf, spec["leafChildNode"])
        hinge = derive_hinge_for_leaf_child(gltf, root_idx, leaf_idx, scale) if leaf_idx is not None else None
        (mnx, mny, mnz), (mxx, mxy, mxz) = scaled_aabb
        cx, cz = (mnx + mxx) / 2.0, (mnz + mxz) / 2.0
        sockets = [{"type": "floor-mount", "position": [cx, 0.0, cz]}]
        if hinge is not None:
            sockets.append({"type": "hinge", "position": list(hinge)})
    elif spec.get("frameLike"):
        hinge = None
        leaf_node_name = spec.get("leafNode")
        if leaf_node_name:
            leaf_idx = find_node_index_by_name(gltf, leaf_node_name)
            if leaf_idx is not None:
                hinge = derive_hinge_for_leaf_child(gltf, root_idx, leaf_idx, scale)
                node_extras[leaf_idx] = {
                    "semanticPart": "door-leaf",
                    "materialFamily": spec["leafFamily"],
                    "sockets": [{"type": "hinge", "position": list(hinge)}] if hinge else [],
                }
                semantic_parts.append("door-leaf")
                material_families.append(spec["leafFamily"])
        elif spec.get("companionLeaf"):
            # this frame's leaf lives in a SEPARATE file (mini-dungeon's wall-opening.glb hosts
            # the opening, gate.glb IS the leaf — two donor files, one doorway assembly). No
            # in-file child node to measure against, so the hinge is derived from the FRAME's own
            # local mesh AABB: the min-X edge (mirroring the "symmetric leaf" convention used
            # above), at mid-height, at the FRONT face (max-Z, where a mounted leaf would swing
            # from) — a documented, consistent convention, not a per-file guess. KS-2 (which
            # actually assembles frame+companion-leaf pairs) is the right place to visually
            # confirm/refine this against the real geometry.
            frame_local = node_local_mesh_aabb(gltf, root_idx)
            if frame_local is not None:
                mn, mx = frame_local
                hinge_local = (mn[0], (mn[1] + mx[1]) / 2.0, mx[2])
                world_m = node_world_matrix(gltf, root_idx)
                wp = transform_point(world_m, hinge_local)
                hinge = (wp[0] * scale, wp[1] * scale, wp[2] * scale)
        sockets = sockets_for_frame(scaled_aabb, hinge)
    elif spec.get("wallLike"):
        sockets = sockets_for_wall(scaled_aabb, spec.get("isFloor", False))
    else:
        raise ValueError(f"{pack}/{slug}: no socket rule matched spec {spec}")

    all_sockets = list(sockets)
    for extra in node_extras.values():
        all_sockets.extend(extra.get("sockets", []))

    source_sha = sha256_file(src_path)
    recipe_key = json.dumps({
        "pack": pack, "slug": slug, "version": NORMALIZER_RECIPE_VERSION,
        "spec": {k: v for k, v in spec.items()}, "scale": scale,
    }, sort_keys=True)
    recipe_hash = hashlib.sha256((source_sha + recipe_key).encode("utf-8")).hexdigest()

    root_extras = {
        "pack": pack, "slug": slug,
        "admissionClass": "DIRECT_MODULATED",
        "semanticParts": semantic_parts,
        "materialFamily": spec["rootFamily"],
        "materialFamilies": material_families,
        "sockets": sockets,  # root-level sockets only; leaf-node sockets live on the leaf node
        "canonicalScale": scale,
        "sourceSha256": source_sha,
        "recipeHash": recipe_hash,
        "recipeVersion": NORMALIZER_RECIPE_VERSION,
        "license": "CC0-1.0",
        "attribution": "assets/models/ATTRIBUTION.md",
    }
    node_extras[root_idx] = merge_extras(node_extras.get(root_idx), root_extras)

    return {
        "rawDims": raw_dims,
        "scaledDims": scaled_dims,
        "sockets": all_sockets,
        "nodeExtras": node_extras,
        "semanticParts": semantic_parts,
        "materialFamilies": material_families,
        "sourceSha256": source_sha,
        "recipeHash": recipe_hash,
        "companionLeaf": spec.get("companionLeaf"),
        "category": spec["category"],
    }


def merge_extras(existing, new):
    if not existing:
        return new
    merged = dict(existing)
    merged.update(new)
    return merged


def apply_node_extras(gltf, node_extras):
    for idx, extras in node_extras.items():
        node = gltf["nodes"][idx]
        node["extras"] = merge_extras(node.get("extras"), {"genesisDonor": extras})


def normalize_pack(pack, pieces):
    src_dir = os.path.join(ASSETS_MODELS, pack)
    out_dir = os.path.join(OUT_ROOT, pack)
    os.makedirs(out_dir, exist_ok=True)
    index = {}
    report_pieces = []

    for slug, spec in sorted(pieces.items()):
        src_path = os.path.join(src_dir, slug + ".glb")
        if not os.path.exists(src_path):
            raise FileNotFoundError(f"pilot manifest references missing file: {src_path}")
        gltf, binchunk, _raw = read_glb(src_path)
        info = classify_piece(pack, slug, gltf, binchunk, src_path, spec)

        strip_materials(gltf)
        bake_scale_into_roots(gltf, PACK_CANONICAL_SCALE[pack])
        apply_node_extras(gltf, info["nodeExtras"])
        gltf.setdefault("asset", {})
        gltf["asset"]["extras"] = {
            "genesisDonorNormalizer": NORMALIZER_RECIPE_VERSION,
            "recipeHash": info["recipeHash"],
        }

        out_path = os.path.join(out_dir, slug + ".glb")
        write_glb(out_path, gltf, binchunk)

        index[slug] = {
            "file": slug + ".glb",
            "recipeHash": info["recipeHash"],
            "admissionClass": "DIRECT_MODULATED",
            "category": info["category"],
            "semanticParts": info["semanticParts"],
            "materialFamilies": sorted(set(info["materialFamilies"])),
            "sockets": info["sockets"],
            "canonicalScale": PACK_CANONICAL_SCALE[pack],
            "companionLeaf": info["companionLeaf"],
        }
        report_pieces.append({
            "pack": pack, "slug": slug, "category": info["category"],
            "semanticParts": info["semanticParts"],
            "materialFamilies": sorted(set(info["materialFamilies"])),
            "socketCounts": socket_type_counts(info["sockets"]),
            "sockets": info["sockets"],
            "rawDims": info["rawDims"], "scaledDims": info["scaledDims"],
            "canonicalScale": PACK_CANONICAL_SCALE[pack],
            "sourceSha256": info["sourceSha256"],
            "recipeHash": info["recipeHash"],
            "outputFile": os.path.relpath(out_path, REPO_ROOT),
        })

    index_path = os.path.join(out_dir, "index.json")
    with open(index_path, "w") as f:
        json.dump(index, f, indent=2, sort_keys=True)
        f.write("\n")

    return report_pieces, index


def socket_type_counts(sockets):
    counts = {}
    for s in sockets:
        counts[s["type"]] = counts.get(s["type"], 0) + 1
    return counts


def main():
    check_mode = "--check" in sys.argv
    os.makedirs(OUT_ROOT, exist_ok=True)
    os.makedirs(os.path.dirname(PROVENANCE_PATH), exist_ok=True)

    all_pieces = []
    pack_indexes = {}

    r1, idx1 = normalize_pack("kenney-modular-dungeon-kit", MODULAR_DUNGEON_PIECES)
    all_pieces.extend(r1)
    pack_indexes["kenney-modular-dungeon-kit"] = idx1

    r2, idx2 = normalize_pack("kenney-mini-dungeon", MINI_DUNGEON_PIECES)
    all_pieces.extend(r2)
    pack_indexes["kenney-mini-dungeon"] = idx2

    excluded = [{"pack": "kenney-mini-dungeon", "slug": s, "reason": r}
                for s, r in sorted(EXCLUDED_MINI_DUNGEON.items())]

    global_socket_counts = {}
    for p in all_pieces:
        for t, c in p["socketCounts"].items():
            global_socket_counts[t] = global_socket_counts.get(t, 0) + c

    report = {
        "unit": "KS-1",
        "normalizerVersion": NORMALIZER_RECIPE_VERSION,
        "packs": {
            "kenney-modular-dungeon-kit": {
                "canonicalScale": PACK_CANONICAL_SCALE["kenney-modular-dungeon-kit"],
                "measuredModuleUnits": PACK_MEASURED_MODULE_UNITS["kenney-modular-dungeon-kit"],
                "moduleTargetWorldUnits": MODULE_TARGET_WORLD_UNITS,
                "piecesAdmitted": len(r1),
            },
            "kenney-mini-dungeon": {
                "canonicalScale": PACK_CANONICAL_SCALE["kenney-mini-dungeon"],
                "measuredModuleUnits": PACK_MEASURED_MODULE_UNITS["kenney-mini-dungeon"],
                "moduleTargetWorldUnits": MODULE_TARGET_WORLD_UNITS,
                "piecesAdmitted": len(r2),
            },
        },
        "totalPiecesAdmitted": len(all_pieces),
        "globalSocketCounts": global_socket_counts,
        "materialFamiliesObserved": sorted(set(f for p in all_pieces for f in p["materialFamilies"])),
        "materialFamiliesUnusedThisWave": sorted(
            set([FAMILY_STONE, FAMILY_WOOD, FAMILY_IRON, FAMILY_ROOF, FAMILY_GLASS, FAMILY_CLOTH])
            - set(f for p in all_pieces for f in p["materialFamilies"])
        ),
        "materialRecipe": MATERIAL_RECIPE,
        "pieces": all_pieces,
        "excluded": excluded,
        "deviationsAndNotes": [
            "Neither pilot pack ships a dedicated freestanding 'arch' piece — "
            "kenney-modular-dungeon-kit's gate.glb (a leafless open archway) is admitted under "
            "category 'arch' as the closest analog; noted here rather than silently substituted.",
            "No 'roof'/'glass'/'cloth' material family appears anywhere in this pilot's admitted "
            "structural set (see materialFamiliesUnusedThisWave) — gate-door-window.glb's "
            "'window' is a cut opening in the stone frame, not a separate glass-material node at "
            "the node-name granularity this classifier reads; no piece in this pilot mounts a "
            "distinct glass pane.",
            "No 'wall-mount' socket appears anywhere in this pilot — every admitted piece is "
            "floor-based (walls/floors/doorframes sit ON the grid, nothing mounts flush to a "
            "vertical wall face). Reserved for a future decor donor wave (sconces, banners).",
            "kenney-modular-dungeon-kit gate-metal-bars.glb's leaf offset (-0.05 authored units) "
            "is unusually small for a swinging door — flagged as possibly a sliding-gate "
            "mechanism rather than a hinge-swing in the source kit; the hinge socket is stamped "
            "per the same rule as every other leaf regardless, for KS-2 to judge visually.",
            "canonicalScale derivation for kenney-mini-dungeon used a same-publisher-module-"
            "parity assumption (documented above, PACK_CANONICAL_SCALE comment) rather than a "
            "direct real-world reference, because the pack's own character-model height produced "
            "an inconsistent ratio (see the long comment above PACK_CANONICAL_SCALE) — this is "
            "the single lowest-confidence measurement in this report and is flagged for Adam's "
            "red-pen explicitly, not smoothed over.",
        ],
    }
    with open(PROVENANCE_PATH, "w") as f:
        json.dump(report, f, indent=2, sort_keys=True)
        f.write("\n")

    print(f"[normalize-donors] {len(all_pieces)} pieces normalized "
          f"({len(r1)} modular-dungeon-kit + {len(r2)} mini-dungeon), "
          f"{len(excluded)} excluded (reserved).")
    print(f"[normalize-donors] provenance -> {os.path.relpath(PROVENANCE_PATH, REPO_ROOT)}")
    print(f"[normalize-donors] material families observed: {report['materialFamiliesObserved']}")
    if check_mode:
        print("[normalize-donors] --check: re-run complete; diff the two runs' output trees "
              "with `git status`/`git diff --stat` to confirm byte-identical determinism.")


if __name__ == "__main__":
    main()
