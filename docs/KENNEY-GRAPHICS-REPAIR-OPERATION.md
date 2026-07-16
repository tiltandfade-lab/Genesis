---
type: system-spec
project: Genesis
status: SPECCED
created: 2026-07-16
updated: 2026-07-16
consumer: Codex/Fable orchestrator + leaf executors; orchestrator personally re-gates every unit
depends_on: KENNEY-SOCKET-WAVE, KENNEY-MESH-AUDIT, GRAPHICS-CONVERGENCE-CHARTER, GRAPHICS-PRODUCTION-RESEARCH-WAVE
scope: Kenney normalization, transform frames, sockets, donor rendering, calibration tools, footprint-aware visual realization
---

# KENNEY GRAPHICS REPAIR OPERATION

## 0. Intent and authority

Adam's 2026-07-16 direction is captured verbatim in `ART-DIRECTION-CANON.md`: the Kenney catalog is
being used to populate procedural trays so the prototype feels alive and real. The present result is
not acceptable: visible polygon interference, wrong axes, oversized/detached parts, incomplete material
response, and prop placement that does not respect the actual mesh footprint.

This operation repairs the **walk facts -> visual realization -> attachment -> render** boundary. It
does not alter the walk, reroll a noun, or substitute an asset whose identity conflicts with the card.
The canonical walk remains playable and narratable when no approved model can realize a citizen.

Spec anchors were verified against master `2c1707d6` on 2026-07-16. Executors must re-`rg` every named
symbol after rebasing; any stale anchor is a stop-and-report condition, not permission to hunt broadly.

## 1. Current diagnosis — accepted; do not re-litigate

1. **Detached-child transform loss.** `kitDoorSplitTemplate` in
   `src/ui/theater-boot.js:4056-4079` bakes only `leafObj.matrix`. It omits ancestor/root transforms,
   including the modular-dungeon pack's canonical scale, before reparenting the leaf at
   `src/ui/theater-boot.js:4150-4163`. The leaf and frame therefore occupy different frames.
2. **Unsafe outline hull.** `buildDonorOutlineHull` in `src/ui/theater-donor.js:270-276` scales a
   back-sided duplicate about an arbitrary local origin. It is not a normal offset and crosses
   concave/off-center geometry. The floor exception at `theater-donor.js:303` treats one symptom.
3. **Whole-board shell downgrade.** `useCompiledRoomShell` at `src/ui/theater-boot.js:11023`
   disables the continuous room-shell compiler whenever any kit wall/floor is claimed. The mixed
   path intentionally leaves corners, jamb neighbors, incompatible scales, and odd remainders as
   prisms (`src/ui/theater-interior.js:517-651`), producing incompatible profiles and sawtooth seams.
4. **Point-only sockets.** `build/normalize-donors.py:542-599` stamps AABB-derived positions without
   orientation, size, compatibility, or clearance. Runtime flattening at
   `src/ui/theater-donor.js:336-365` does not preserve a socket node's full frame. Wall/floor mounting
   still uses center placement plus hard-coded 0/90-degree yaw at `theater-boot.js:4466-4483`.
5. **Primitive bounds bug.** `node_local_mesh_aabb` at `build/normalize-donors.py:307-324`
   overwrites the AABB per primitive; the last primitive wins instead of a union.
6. **UV destruction.** `strip_materials` at `build/normalize-donors.py:495-523` deletes every
   `TEXCOORD_*` attribute, while the runtime material assigns a map. The map consequently samples a
   constant texel (`theater-boot.js:4487-4494`).
7. **The full corpus is not runtime-admitted.** `KENNEY-MESH-AUDIT.md:14-33` defines 1,752 raw GLBs
   and a 149-candidate review queue, not a runtime registry. Only 47 pieces are normalized today (39
   modular-dungeon, 8 mini-dungeon), and live code names only the door/wall/floor pilot pieces.
8. **Placement has no real asset footprint.** `place-distribution.js:57-69` uses `cardKind` as a
   circular proxy and is off by default at line 55. Projected walk citizens are forced to billboards
   at `theater-data.js:1809-1814`; `board.walkScene` is stamped after board construction at lines
   1903-1910 rather than driving asset selection.

### 1.1 Research disposition — 2026-07-16 adversarial read

Two advisory reports were read against this incumbent plan: *Genesis — OSS & Asset Mining Research*
and *Kenney upstream findings*. Their useful evidence narrows one contract and exposes one missing
admission gate, but does not change the operation's posture.

**Accepted:** Kenney's structural convention is grid cell + quarter-turn orientation, not
socket-to-socket assembly; source module size is a per-pack constant; the packs contain useful
pre-baked room/elevation vocabulary; Kenney publishes no reusable three.js placement code. Therefore
v2 sockets narrow to attachment mounts, while structural metadata records a grid module and
orientation index.

**Corrected:** the upstream appendix unions raw POSITION-accessor bounds without applying node
transforms. That reports `kenney-mini-dungeon/wall` as 2x2 source units even though its transformed
scene footprint is 1x1, and similarly overstates other dimensions. Genesis's existing scene-graph
measurement is the authoritative method. The locked constants remain modular-dungeon 4.0 source
units -> 2.0 Genesis world units (`canonicalScale:0.5`) and mini-dungeon 1.0 -> 2.0
(`canonicalScale:2.0`). KGR-1/KGR-3 gain a negative control so this measurement bug cannot return.

**Plan weakness corrected:** the original queue built the workbench and then assumed approved pilot
calibrations would exist for KGR-5. Tool creation is not calibrated data. KGR-4C now explicitly uses
the workbench to normalize, capture, and approve the ten named external assets before runtime binding.

**Deferred or rejected for this operation:** pre-baked Kenney rooms, structural elevation pieces,
and `InstancedMesh` are valuable inputs to a later structural-shell re-admission/performance unit, but
they do not repair the current transform, seam, collision, or walk-fidelity failures. A pre-baked room
may be used only when its dimensions, polygon, tiers, apertures, and provenance exactly match the
canonical Stage-C room. KayKit, rot.js, WFC, graph libraries, BVHs, atlas tooling, and other OSS mining
suggestions solve different problems and do not enter this corrective operation.

## 2. Locked decisions

### D1 — recover correctness before expanding admission

No additional member of the 149-candidate queue may become `approved-runtime` until Units KGR-1 and
KGR-2 have landed. Source-reserve files remain untouched and available.

### D2 — source GLBs are immutable; calibration is a sidecar

Manual corrections live in `dev/model-foundry/kenney-calibration.json`, source-hash-bound. The build
normalizer consumes that sidecar and owns generated normalized GLBs. No executor hand-edits binary GLB
output or writes renderer-local per-slug yaw/scale patches.

### D3 — attachment sockets are six-degree frames; structures use grid addresses

A v2 socket represents a mount relationship only: `floor-mount`, `wall-mount`, `top-surface`, or
`hinge`. It has identity, position, quaternion, mate rule, family compatibility, size, and clearance.
A point without an orientation is invalid under schema v2. `butt-join-{n|s|e|w}` is retired from v2;
structural adjacency is `{cell, orientationIndex}` against the pack's measured module grid, with
`orientationIndex` constrained to 0..3 quarter-turns. Runtime attachment mating uses full matrices,
never `if(axis === "z") rotation.y = PI/2` as a mount solution.

### D4 — full scene-graph transforms cross every detach boundary

When a semantic part leaves its authored hierarchy, its transform relative to the donor piece root is
`inverse(piece.matrixWorld) * part.matrixWorld`. Local matrices alone are forbidden. Tests compare
the complete pre/post world-space geometry, not just a hinge coordinate.

### D5 — the unsafe outline retreats immediately

Kenney geometry renders with no duplicate inverted hull during this operation. `donorOutlineStyleFor`
may remain as dormant policy metadata; no mesh may receive `userData.donorOutlineHull`. A future
normal-extrusion or screen-space outline is a separate visual unit. Correct silhouettes without moire
beat a nominal style law implemented incorrectly.

### D6 — continuous Genesis shells remain the structural truth

`KIT_SHELL_ENABLED` defaults false. The continuous room-shell compiler remains active. Kenney walls
and floors do not return during this operation. Re-admission requires a later segment/cladding spec
that replaces or deliberately offsets matching compiled surfaces; mixed cell-prism construction is
not revived. The repaired Kenney door and calibrated props remain in scope.

### D7 — visual realization is additive and provenance-preserving

Asset resolution may add `visualAsset` metadata to an existing card/dressing/prop. It may not change
`slug`, `sourceRef`, `role`, `count`, home room, or canonical position. No match means the existing
billboard/procedural/whole-object fallback renders.

### D8 — catalog scale is approval-driven

The workbench can open all 1,752 source assets. Runtime registry generation selects only calibration
records with `qaStatus:"approved-runtime"` and a matching source hash. `needs-review`,
`approved-dev`, and `quarantined` never enter production lookup.

## 3. Shared payload contracts

### 3.1 Calibration source

`dev/model-foundry/kenney-calibration.json`:

```json
{
  "schema": "genesis.kenney-calibration.v1",
  "algorithmVersion": 1,
  "packs": {
    "kenney-modular-dungeon-kit": {
      "sourceUp": "+Y",
      "sourceForward": "+Z",
      "canonicalScale": 0.5,
      "structuralGrid": {
        "sourceModuleUnits": 4.0,
        "targetWorldUnits": 2.0,
        "orientationSteps": 4,
        "joinMode": "cell-orientation"
      }
    },
    "kenney-mini-dungeon": {
      "sourceUp": "+Y",
      "sourceForward": "+Z",
      "canonicalScale": 2.0,
      "structuralGrid": {
        "sourceModuleUnits": 1.0,
        "targetWorldUnits": 2.0,
        "orientationSteps": 4,
        "joinMode": "cell-orientation"
      }
    }
  },
  "assets": {
    "kenney-modular-dungeon-kit/gate-door": {
      "sourceSha256": "<64 lowercase hex>",
      "admissionClass": "PART_DONOR",
      "category": "doorway-frame",
      "rootMaterialFamily": "stone",
      "preTransform": {
        "translation": [0, 0, 0],
        "rotation": [0, 0, 0, 1],
        "scale": [1, 1, 1]
      },
      "scaleReason": null,
      "groundOffset": 0,
      "semanticParts": {
        "door-leaf": {
          "nodePath": "<stable slash-delimited node path>",
          "detachable": true,
          "materialFamily": "wood"
        }
      },
      "sockets": [
        {
          "id": "hinge-left",
          "type": "hinge",
          "position": [0, 0, 0],
          "rotation": [0, 0, 0, 1],
          "mateRule": "coincident",
          "mateFamily": "door-leaf",
          "size": [0.05, 2.0, 0.05],
          "clearance": { "shape": "box", "size": [2.0, 2.4, 2.0] }
        }
      ],
      "footprintOverride": null,
      "qaStatus": "needs-review",
      "notes": []
    }
  }
}
```

Rules:

- vectors contain finite numbers; scale components are positive;
- `admissionClass` is `DIRECT_MODULATED|PART_DONOR|CHASSIS` and `rootMaterialFamily` is one of the
  normalizer's declared Genesis material families;
- `DIRECT_MODULATED` structural assets require `preTransform.scale:[1,1,1]`; other assets may use a
  nonidentity positive uniform per-asset scale only with a nonempty `scaleReason`; nonuniform scale
  is invalid;
- each semantic part supplies a stable `nodePath`, `detachable` boolean, and declared material family;
- quaternions are normalized within `1e-5` and stored `[x,y,z,w]`;
- socket ids are unique inside one asset;
- socket `type` is `floor-mount|wall-mount|top-surface|hinge`; v2 rejects `butt-join-*`;
- `mateRule` is `coincident` or `opposed-z`;
- `qaStatus` is `needs-review|approved-dev|approved-runtime|quarantined`;
- `sourceSha256` mismatch is a hard normalizer/registry failure;
- `structuralGrid` is null for a nonstructural pack; otherwise `joinMode` is `cell-orientation`,
  `orientationSteps` is exactly 4, and `canonicalScale * sourceModuleUnits === targetWorldUnits`
  within `1e-6`;
- `footprintOverride`, when non-null, is
  `{center:[x,z],halfExtents:[x,z],yawRadians:number}`; otherwise bounds derive from transformed
  geometry;
- pack defaults compose once with `preTransform`; renderer code never reapplies canonical scale.

### 3.2 Normalized donor metadata

Each output piece root carries:

```js
{
  schema: "genesis.donor.v2",
  assetId: "<pack>/<slug>",
  sourceSha256: "<hash>",
  recipeHash: "<hash>",
  admissionClass: "DIRECT_MODULATED",
  category: "floor",
  normalizedFrame: {
    up: "+Y",
    forward: "+Z",
    sourceToGenesis: [/* 16 column-major finite numbers */]
  },
  structuralGrid: {
    sourceModuleUnits: 4,
    targetWorldUnits: 2,
    orientationSteps: 4,
    joinMode: "cell-orientation"
  },
  bounds: {
    aabbMin: [x,y,z], aabbMax: [x,y,z], groundY: y,
    footprint: {center:[x,z], halfExtents:[x,z], yawRadians:0}
  },
  semanticParts: {"door-leaf": {nodePath:"...", detachable:true, materialFamily:"wood"}},
  sockets: [{id,type,position,rotation,mateRule,mateFamily,size,clearance}]
}
```

The identity donor root is in Genesis coordinates. A child named `genesis-source-transform` owns the
source-to-Genesis TRS and parents the original source roots. Socket positions/quaternions are expressed
in the identity donor-root frame, not in pre-transform source coordinates.

### 3.3 Runtime visual asset

The pure realization layer may stamp:

```js
visualAsset: {
  assetId: "kenney-retro-fantasy-kit/detail-barrel",
  pack: "kenney-retro-fantasy-kit",
  slug: "detail-barrel",
  mountSocket: "floor-mount",
  yawRadians: 0,
  footprint: {center:[0,0], halfExtents:[0.35,0.35], yawRadians:0},
  resolutionRule: "realm-prop-name:barrel",
  registryHash: "<hash>"
}
```

This is derived data. Saves and walk records do not persist it.

## 4. Unit KGR-1 — transform and material-coordinate repair

**Branch:** `fix/kenney-transform-uv` off the locked spec/master tip.

**Files/functions:**

- `build/normalize-donors.py:307` `node_local_mesh_aabb` — union min/max across all primitives;
- `build/normalize-donors.py:495` `strip_materials` — remove authored material bindings but preserve
  every `TEXCOORD_*` attribute and referenced accessors/bufferViews;
- `src/ui/theater-boot.js:4056` `kitDoorSplitTemplate` — bake the full leaf-to-piece-root matrix;
- generated `assets/models-normalized/<pilot-pack>/*`, both pack `index.json` files, and
  `dev/model-foundry/KS1-PROVENANCE.json` only through `python3 build/normalize-donors.py`;
- `dev/verify-kenney-adapter.mjs`, `dev/verify-ks2-door-assembly.mjs`.

**Ordered behavior:**

1. Union every primitive accessor's min/max; a mesh with zero usable POSITION accessors returns null.
   Pack/asset dimensions continue to come from the transformed scene walk, never a global union of
   raw accessors that ignores node matrices.
2. Preserve UV attributes exactly while continuing to discard material/texture/image/sampler records.
3. Before detaching a door leaf: call `rawGroup.updateMatrixWorld(true)` and
   `leafObj.updateWorldMatrix(true,false)`; compute
   `leafToPiece = inverse(rawGroup.matrixWorld) * leafObj.matrixWorld`; apply it to cloned geometry.
4. Translate the baked geometry by the negative hinge position expressed in the piece-root frame, so
   the leaf mesh's new local origin is the hinge socket.
5. Remove the original leaf only after the cloned geometry and material are valid. On any invalid or
   non-invertible matrix, return null and retain the existing prism-door fallback.
6. Regenerate all 47 normalized outputs. Do not manually edit generated GLBs or indexes.

**RED-FIRST / mutation checks:**

1. ⊗ A synthetic two-primitive node whose second primitive is smaller must fail the old last-primitive
   AABB implementation and pass the union implementation.
2. ⊗ A normalized pilot primitive must retain its raw `TEXCOORD_0` accessor; deleting the preservation
   line must fail.
3. ⊗ In real Chrome, snapshot the gate leaf's world-space vertex bounds before split and after closed
   remount. Every min/max component must match within `1e-5`. Replacing `leafToPiece` with
   `leafObj.matrix` must fail.
4. ⊗ A node-scaled scene fixture must report transformed scene bounds, not raw accessor bounds;
   replacing the scene walk with the upstream appendix's accessor-only union must fail. The real
   mini-dungeon wall/floor structural footprints both report 1.0x1.0 source units.
5. The hinge world position remains fixed within `1e-5` for shut/ajar/open rotations.
6. `python3 build/normalize-donors.py` run twice produces byte-identical indexes/provenance and
   recipe-identical GLBs.

**Visual gate:** re-shoot `dev/battle-gate/ks2-door-assembly/{kit-door-shut,kit-door-open}.png` at the
existing camera. The leaf fits the frame; the open leaf is not a giant slab; no frame member visibly
passes through the leaf except the intended hinge contact.

**Out:** socket v2, workbench, catalog expansion, shell behavior, new outline.

## 5. Unit KGR-2 — render-safety retreat

**Branch:** `fix/kenney-render-safety` stacked on KGR-1.

**Files/functions:**

- `src/ui/theater-donor.js:260-303` outline policy/build path and `loadDonorPiece` traversal;
- `src/ui/theater-interior.js:517-533` `KIT_SHELL_ENABLED`;
- `src/ui/theater-boot.js:11012-11031` `useCompiledRoomShell`, plus kit wall/floor mount at
  `11656-11685`;
- `dev/verify-kenney-adapter.mjs`, `dev/verify-ks3-kit-shells.mjs`,
  `dev/battle-gate/capture-ks3-kit-shells.mjs`.

**Ordered behavior:**

1. Stop adding inverted-hull child meshes for every donor category. Retain the realm outline table as
   dormant policy metadata, with an explicit comment that the geometry implementation is retired.
2. Default `KIT_SHELL_ENABLED` to false. With the flag false, wall/floor claim sets and groups are empty.
3. Define `useCompiledRoomShell = ITR_ROOM_SHELL`; no kit array may disable the compiler.
4. Preserve kit doors and every non-shell fallback.
5. Keep the old kit-shell code behind the flag for evidence/research only; do not delete the normalized
   pieces or pretend the structural experiment never happened.

**RED-FIRST / mutation checks:**

1. ⊗ Load every normalized pilot asset and assert zero descendants have
   `userData.donorOutlineHull`; restoring the `obj.add(hull)` call fails.
2. ⊗ Inject nonempty `kitShellWalls/kitShellFloors` into a renderer fixture and assert the compiled
   room shell still mounts. Restoring the old conditional fails.
3. Default board output has zero kit-shell wall/floor claims and unchanged door claims.
4. All pre-KS room-shell topology/area/aperture harnesses remain green.

**Visual gate:** rect/L/octagon gameplay-scale captures show no triangular stipple/moire, no mixed
crenellation-to-prism sawtooth, continuous floors/walls, and the repaired Kenney door still present.

**Out:** replacement outline shader and structural Kenney-shell re-admission.

## 6. Unit KGR-3 — calibration manifest and donor schema v2

**Branch:** `feat/kenney-calibration-contract` stacked on KGR-2.

**Files/functions:**

- new `dev/model-foundry/kenney-calibration.json` and
  `dev/model-foundry/kenney-calibration.schema.json`;
- `build/normalize-donors.py` mapping/constants, root transform, socket stamping, validation,
  provenance/index emission, and calibration-driven asset iteration;
- `src/ui/theater-donor.js` metadata/socket loading;
- new `dev/verify-kenney-calibration.mjs`; update `dev/verify-kenney-adapter.mjs`;
- `docs/KENNEY-SOCKET-WAVE.md` deviation note: v1 point/universal sockets are superseded by v2
  mount frames plus the cell-orientation structural contract.

**Ordered behavior:**

1. Convert the fixed two-pack piece dictionaries into seed data for the calibration source, then make
   the normalizer iterate validated `calibration.assets` records. Adding a calibrated asset must not
   require a new Python branch or slug constant.
2. Seed pack records for the two normalized packs and asset records for all current 47 outputs. Lock
   modular-dungeon `4.0 -> 2.0` / scale `0.5` and mini-dungeon `1.0 -> 2.0` / scale `2.0` from
   transformed scene bounds.
3. Stamp structural pieces with the pack's grid contract. Their placement primitive is canonical
   grid cell + `orientationIndex:0|1|2|3`; do not emit v2 butt-join sockets. Preserve v1 butt-join
   reads only as old-output compatibility metadata.
4. Replace scale-on-arbitrary-source-root output with the identity donor-root +
   `genesis-source-transform` hierarchy in §3.2. Apply scale exactly once.
5. Validate hashes/TRS/quaternions/socket ids/enums before writing any generated output. Collect every
   error and exit nonzero without partially replacing the output tree.
6. Derive transformed bounds/ground/footprint after the complete source-to-Genesis matrix; an explicit
   footprint override wins and is reported as such.
7. Emit v2 attachment socket frames only. Existing AABB mount positions may seed positions, but every
   one receives an explicit quaternion and remains `needs-review` until visually approved.
8. Runtime loader accepts v1 for graceful old-output fallback but runtime registry generation accepts
   v2 only.

**RED-FIRST / mutation checks:**

1. ⊗ Hash mismatch, duplicate socket id, zero quaternion, negative scale, and NaN each fail before
   output replacement.
2. ⊗ Replacing the transformed scene measurement with raw accessor-union measurement fails the real
   mini-dungeon 1.0-module fixture and blocks normalization.
3. ⊗ Applying pack scale at both wrapper and source root must fail dimension parity.
4. Every `DIRECT_MODULATED` structural piece is a clean multiple of its pack module within 2%; every
   exception is `PART_DONOR`. No v2 structural piece contains a `butt-join-*` socket.
5. ⊗ A `DIRECT_MODULATED` structural per-asset scale, a nonuniform scale, or a PART_DONOR nonidentity
   scale without `scaleReason` fails before output replacement.
6. Adding a valid scratch calibration record causes normalization without editing Python source;
   removing the calibration-driven iteration must fail.
7. Every v2 attachment socket matrix is finite and orthonormal within `1e-5`.
8. Every floor-mount lies on derived ground within `0.01u`, unless a reviewed override explicitly says
   otherwise.
9. Two normalizer runs are byte-identical.

**Out:** approving the 149 queue and a UI editor.

## 7. Unit KGR-4A — Donor/Socket Workbench

**Branch:** `feat/kenney-socket-workbench` off KGR-3. May run parallel with KGR-4B.

**Files:**

- new `dev/model-foundry/kenney-workbench.html` and `kenney-workbench.js`;
- new `dev/model-foundry/kenney-workbench-server.mjs`;
- vendor the matching pinned Three r166 `vendor/three/addons/controls/TransformControls.js` only;
- new `dev/verify-kenney-workbench.mjs` and capture output under
  `dev/model-foundry/kenney-workbench-captures/`;
- extend `dev/model-foundry/README.md` if present, otherwise add run instructions to
  `docs/KENNEY-MESH-AUDIT.md`.

**Required UI:**

- asset search/filter across census, candidates, normalized assets, and QA state;
- raw / normalized / Genesis-material views using the real GLTFLoader and donor material path;
- axes, one-unit Genesis grid, pack-module source grid, ground plane, wireframe, backface, normals,
  AABB, footprint, and hierarchy overlays;
- structural quarter-turn preview buttons (`orientationIndex` 0..3) with cell/module occupancy readout;
- editable translation/rotation/scale and ground offset; UI may display Euler degrees but stores a
  normalized quaternion;
- socket list with add/delete/rename/type/mate/size/clearance fields and translate/rotate gizmo;
- vertex/edge/face/AABB snapping, with an explicit unsnapped mode;
- host+child mate preview, exploded slider, socket axes, seam-distance readout, and door sweep preview;
- dirty-state indicator, Reset Asset, Save Asset, and Export Snapshot.

**Write safety:**

The server binds `127.0.0.1` on a non-5175 port. It exposes only:

- `GET /api/calibration`;
- `PUT /api/calibration/<urlencoded assetId>` body
  `{expectedSourceSha256, record}`;
- `POST /api/validate` body `{assetId, record}` with no write.

PUT validates the full record, verifies the source hash against the census, rejects unknown asset ids
and traversal, updates exactly one `assets[assetId]`, writes a sibling temporary file, fsyncs, then
renames atomically. It cannot write GLBs, generated indexes, or arbitrary paths.

**RED-FIRST / mutation checks:**

1. ⊗ Source-hash mismatch, unknown id, invalid quaternion, and traversal each return 4xx and leave the
   manifest byte-identical.
2. ⊗ A valid save changes exactly one asset record and survives server restart.
3. Raw/normalized toggle changes the loaded URL; Genesis-material mode passes through
   `loadDonorPiece`, not a lookalike material implementation.
4. Mate preview reports ≤`0.005u` positional and ≤`0.5°` angular error after Snap.
5. Puppeteer capture contains visible axis/ground/socket overlays and zero console errors.

**Out:** an in-game editor, scene-local overrides, and editing raw GLBs.

## 8. Unit KGR-4B — attachment-frame solver and door migration

**Branch:** `feat/kenney-attachment-solver` off KGR-3. May run parallel with KGR-4A.

**Files/functions:**

- new pure ESM `src/ui/theater-attachment.js`;
- `src/ui/theater-donor.js` socket frame conversion;
- `src/ui/theater-boot.js` `kitDoorSplitTemplate` / `interiorBuildKitDoorMesh` migration;
- `genesis.html` module import only through `theater-boot.js`; manifest registration for the new module;
- new `dev/verify-kenney-attachment.mjs`; extend `dev/verify-ks2-door-assembly.mjs`.

**Public API:**

```js
socketFrameOf(piece, socketId) -> {socket, localMatrix} | null
mateMatrix(host, hostSocketId, child, childSocketId, options={}) -> {matrixWorld, positionError, angleError} | null
applyMate(child, result, parent) -> boolean
```

`opposed-z` composes a 180-degree local-Y flip between socket frames; `coincident` composes no flip.
The formula is `host.matrixWorld * hostSocket.localMatrix * mateFlip * inverse(childSocket.localMatrix)`.
`applyMate` converts the result into the requested parent's local frame before decomposing TRS.

**Behavior:**

1. Convert sockets from their owning donor node to the identity piece-root frame using the node's full
   matrix, including quaternion orientation.
2. Return null for missing/duplicate/incompatible sockets, singular matrices, or non-finite results.
3. Door frame hinge and detachable leaf pivot use `coincident`; the solver owns the mount. Door state
   owns only the additional swing rotation around the mated hinge frame.
4. The door frame itself remains placed by the canonical aperture cell + quarter-turn orientation;
   the attachment solver does not use or recreate butt-join sockets.
5. Preserve fallback behavior when the donor/template/solver is unavailable.

**RED-FIRST / mutation checks:**

1. ⊗ Nested translated+rotated+scaled socket fixture mates within tolerance; using local node
   transforms fails.
2. ⊗ `opposed-z` normals face each other; removing the flip fails.
3. ⊗ Real gate leaf pre/post closed world vertices match within `1e-5`; open/ajar keep the hinge fixed.
4. Missing/incompatible sockets return null without mutating either object.

**Out:** automatic wall-run assembly and physics joints.

## 9. Unit KGR-4C — ten-asset pilot calibration and normalization

**Branch:** `chore/kenney-pilot-calibration` after KGR-4A and KGR-4B have both landed.

**Files/artifacts:**

- `dev/model-foundry/kenney-calibration.json` only through the workbench save API;
- generated normalized GLBs/indexes/provenance only through `python3 build/normalize-donors.py`;
- `dev/model-foundry/kenney-workbench-captures/pilot-<asset>.png` and
  `pilot-calibration-report.json`;
- new `dev/verify-kenney-pilot-calibration.mjs`;
- no production JS. A workbench/normalizer defect stops and returns to its owning unit.

**Candidates and physical envelopes** (Genesis GRID LAW: 1 world unit = 5 ft):

| asset | mount | accepted transformed envelope |
| --- | --- | --- |
| `kenney-retro-fantasy-kit/detail-barrel` | floor | height 0.50-0.85u; width/depth 0.35-0.80u |
| `kenney-pirate-kit/crate` | floor | height 0.30-0.80u; width/depth 0.35-1.20u |
| `kenney-pirate-kit/chest` | floor | height 0.35-0.85u; width 0.60-1.30u; depth 0.30-0.90u |
| `kenney-furniture-kit/tableRound` | floor | height 0.50-0.72u; width/depth 0.60-1.40u |
| `kenney-furniture-kit/bench` | floor | height 0.30-0.65u; long axis 0.65-1.80u |
| `kenney-furniture-kit/chair` | floor | height 0.55-1.05u; width/depth 0.25-0.80u |
| `kenney-furniture-kit/lampWall` | wall | height 0.10-0.60u; wall depth <=0.40u |
| `kenney-furniture-kit/lampRoundFloor` | floor | height 0.80-1.60u; width/depth 0.15-0.60u |
| `kenney-fantasy-town-kit/lantern` | floor | height 0.80-2.00u; width/depth 0.15-0.70u |
| `kenney-factory-kit/lever-double` | floor | height 0.25-0.85u; width/depth 0.25-1.00u |

**Ordered behavior:**

1. Add pack records (`structuralGrid:null`) and source-hash-bound asset records for exactly these
   candidates. A pack owns one unit-system `canonicalScale`; asset-level scale is uniform, optional,
   and justified by `scaleReason:"semantic-size:<envelope>"`.
2. Use raw/normalized/Genesis-material views to set forward/up, ground offset, footprint, mount frame,
   and any semantic-size scale. Compare beside a 1.2u (6-ft) human yardstick and one-unit grid.
3. Floor assets receive one reviewed `floor-mount`; `lampWall` receives one reviewed `wall-mount` whose
   +Z faces away from the wall. Do not add decorative or speculative sockets.
4. Save each record as `approved-dev`, normalize all ten, then inspect the generated capture at
   orientation indices 0..3. The orchestrator alone promotes a record to `approved-runtime` after the
   physical envelope, grounding, forward read, material response, and footprint pass.
5. If any candidate cannot pass without nonuniform distortion, hash bypass, renderer-local patch, or
   false noun identity, quarantine it and stop KGR-4C. Amend this spec with a named replacement before
   KGR-5; do not silently lower the ten-asset gate.

**RED-FIRST / mutation checks:**

1. ⊗ A record outside its physical envelope or with a mount ground/wall error >`0.01u` cannot become
   `approved-runtime`.
2. ⊗ A stale source hash, nonuniform scale, or unreviewed mount blocks normalization/admission.
3. Every normalized primitive retains UVs; every result has finite transformed bounds and OBB footprint.
4. Two normalizer runs are byte-identical; the report names source hash, pack scale, per-asset scale
   reason, dimensions, footprint, mounts, and QA state for all ten.

**Visual gate:** one fixed-camera lineup shows raw, normalized, Genesis-material, and 6-ft-yardstick
views for all ten. Nothing floats, sinks, faces sideways, clips its own ground plane, or reads at an
implausible human scale.

**Out:** runtime rule binding, more than ten admissions, structural shells, and performance batching.

## 10. Unit KGR-5 — footprint-aware walk-to-Kenney realization

**Branch:** `feat/kenney-runtime-realization` stacked after KGR-4C.

**Files/functions:**

- new source `dev/model-foundry/kenney-visual-rules.json`;
- new `build/gen-kenney-runtime-registry.py`;
- generated `data/kenney-runtime-registry.js` loaded after `data/realm-props.js` and before
  `src/engine/place-dressing.js` in `manifest.json` / `genesis.html`;
- new classic/pure `src/engine/kenney-realization.js` loaded before `place-distribution.js`;
- `src/engine/theater-data.js:1796-1824` realization call before distribution;
- `src/engine/place-distribution.js:57-69,165-270` footprint/yaw collision;
- `src/ui/theater-boot.js:7725-7855` board props and `9470-9520` interior dressing donor mount;
- new `dev/verify-kenney-realization.mjs`; extend place-distribution/dungeon-dressing harnesses.

**Approved pilot asset ids:**

`kenney-retro-fantasy-kit/detail-barrel`, `kenney-pirate-kit/crate`,
`kenney-pirate-kit/chest`, `kenney-furniture-kit/tableRound`, `kenney-furniture-kit/bench`,
`kenney-furniture-kit/chair`, `kenney-furniture-kit/lampWall`,
`kenney-furniture-kit/lampRoundFloor`, `kenney-fantasy-town-kit/lantern`,
`kenney-factory-kit/lever-double`. Approval is contingent on KGR-4A visual calibration; a failing asset
stays out rather than weakening the ten-asset requirement.

**Rule source shape:**

```json
{
  "schema":"genesis.kenney-visual-rules.v1",
  "rules":[
    {"id":"fantasy-emptybarrel","match":{"slug":"fantasy-clutter-emptybarrel"},
     "families":["barrel"],"mount":"floor-mount"},
    {"id":"fantasy-lanternhook","match":{"slug":"fantasy-clutter-lanternhook"},
     "families":["lantern","lamp-wall"],"mount":"wall-mount"},
    {"id":"realm-prop-barrel","match":{"realmPropNameIncludes":["barrel"]},
     "families":["barrel"],"mount":"floor-mount"},
    {"id":"realm-prop-crate","match":{"realmPropNameIncludes":["crate"]},
     "families":["crate"],"mount":"floor-mount"},
    {"id":"realm-prop-table","match":{"realmPropNameIncludes":["table"]},
     "families":["table"],"mount":"floor-mount"},
    {"id":"realm-prop-bench","match":{"realmPropNameIncludes":["bench","pew"]},
     "families":["bench"],"mount":"floor-mount"},
    {"id":"realm-prop-chair","match":{"realmPropNameIncludes":["chair"]},
     "families":["chair"],"mount":"floor-mount"},
    {"id":"realm-prop-light","match":{"realmPropNameIncludes":["lantern","lamp"]},
     "families":["lantern","lamp-floor","lamp-wall"],"mount":"context"}
  ]
}
```

Rules match only already-present nouns. First matching rule wins; candidates are filtered to
`approved-runtime`, compatible mount, and active realm policy, then selected by a local hash of
`sourceRef|ruleId|registryHash`. No global RNG stream is consumed.

**Placement:**

1. Stamp `visualAsset` before `placeDistribute` without modifying canonical fields.
2. Candidate yaw is one of `0, PI/2, PI, 3PI/2`; wall mounts derive yaw from the existing stamped
   `wallSide` and are not randomized.
3. Use transformed footprint OBBs and a four-axis 2D SAT overlap test. Wall erosion uses the projected
   half-extent along the wall normal. Existing `cardKind` radii remain fallback-only.
4. If no legal placement exists, retain the canonical anchor and set
   `visualAsset.placementStatus:"fallback-overlap"`; renderer uses the old visual fallback rather than
   mounting an intersecting donor.
5. Renderer mounts the donor at its named socket. Cold cache, load failure, or invalid socket renders
   the existing card/whole-object immediately and schedules the normal board replay only after success.

**RED-FIRST / mutation checks:**

1. ⊗ A long table and chair overlap under circle-only placement but separate under OBB SAT; replacing
   OBBs with `cardKind` radii fails.
2. ⊗ Rotating a 2x0.5 footprint by PI/2 swaps projected extents and changes wall eligibility.
3. Same walk/segment/source refs produce byte-identical visualAsset choices and positions.
4. No rule may change slug/sourceRef/role/count/room/position fields.
5. Unapproved/hash-stale assets and unmatched nouns use the old visual path.
6. `ROOM_PLACE_DISTRIBUTE` becomes true only after the new fixture suite proves canonical anchors never
   move and every moved incidental remains in its legal room.

**Out:** semantic substitutions beyond the named rules, stacking loose clutter on table tops, and
structural kit shells.

## 11. Unit KGR-6 — proving run and admission gate

**Branch:** `test/kenney-repair-proving-run` stacked on KGR-5.

**Files:**

- new `dev/verify-kenney-graphics-repair.mjs`;
- new `dev/battle-gate/capture-kenney-graphics-repair.mjs`;
- outputs under `dev/battle-gate/kenney-graphics-repair/`:
  `rect.png`, `l-room.png`, `octagon.png`, `door-shut.png`, `door-open.png`,
  `pilot-lineup.png`, `socket-mates.png`, `report.json`, `inventory.json`;
- no production code unless the proving run exposes a spec conflict, which must be documented before
  amending this spec.

**Fixtures:**

1. Rect/L/octagon interior rooms at gameplay camera/DPR2 with repaired door and compiled shell.
2. Shut/ajar/open door in both width axes.
3. Ten-asset pilot lineup with ground, bounds, forward arrow, and every socket frame visible.
4. A deterministic furnished room using barrel/crate/table/bench/chair/lantern rules.
5. Raw vs normalized vs Genesis-material three-card comparison for each pilot family.

**Machine acceptance:**

- zero non-finite transforms/vertices;
- detached-part pre/post world vertex bounds delta ≤`1e-5`;
- floor-mount ground error ≤`0.01u`;
- mate position error ≤`0.005u`, angle error ≤`0.5°`;
- zero donor outline-hull descendants;
- every mapped donor primitive has a UV channel;
- zero OBB overlaps among separately placed pilot props; wall penetration ≤`0.01u`;
- zero runtime registry entries with stale hash or non-`approved-runtime` status;
- modular-dungeon and mini-dungeon module constants match transformed scene bounds; every structural
  orientation index is an integer in 0..3 and no v2 donor emits `butt-join-*`;
- continuous room shell active on all three shapes; kit wall/floor count zero;
- capture page reports zero console errors and zero failed GLB loads.

**Orchestrator visual acceptance — mandatory, never delegated:**

- no triangular moire/checker/interference;
- no giant detached slabs or leaf/frame scale mismatch;
- every floor citizen looks grounded; every wall citizen faces and touches its wall;
- no prop visibly passes through another prop, wall, doorway apron, PC, or focal anchor;
- nouns read truthfully at gameplay scale; no asset is admitted merely because its axes are finite;
- room remains a coherent diorama with negative space, not a catalog dump.

The orchestrator reads every PNG, the real diff, and `report.json`, then personally runs:

```sh
python3 build/check-manifest.py
node dev/verify-kenney-adapter.mjs
node dev/verify-ks2-door-assembly.mjs
node dev/verify-ks3-kit-shells.mjs
node dev/verify-kenney-calibration.mjs
node dev/verify-kenney-workbench.mjs
node dev/verify-kenney-attachment.mjs
node dev/verify-kenney-pilot-calibration.mjs
node dev/verify-kenney-realization.mjs
node dev/verify-kenney-graphics-repair.mjs
for f in dev/verify-*.mjs; do node "$f" >/dev/null 2>&1 || echo "FAIL $f"; done
```

After landing, run one real bridge playtest through `genesis-playtest-rig`; log any alignment,
collision, asset-truth, or first-render fallback complaint before considering catalog expansion.

## 12. Queue and execution ownership

```text
KGR-1 transform+UV
  -> KGR-2 render retreat
    -> KGR-3 calibration contract
      -> KGR-4A workbench ----\
      -> KGR-4B attachment ----+-> KGR-4C pilot calibration -> KGR-5 realization
                                                          -> KGR-6 proving run -> playtest
```

- KGR-1, KGR-2, KGR-3, KGR-4C, KGR-5, and KGR-6 serialize because they touch shared normalization/render
  seams or depend on approved calibration output.
- KGR-4A and KGR-4B may run in parallel in separate worktrees. This is the only fan-out.
- Leaf executors execute exactly one unit, do not spawn subagents, commit, and never merge.
- The primary orchestrator writes/locks this spec, launches units, checks branch/disk truth, reads every
  load-bearing diff, reproduces red-first mutations where practical, runs all gates, and lands each
  unit with `--no-ff` only after personal acceptance.
- Sol review is optional and advisory: use it only for a disputed transform/attachment ruling or an
  adversarial review of this locked plan. Sol does not replace the orchestrator or silently amend the
  accepted decisions.

## 13. Explicitly out of scope for the entire operation

- automatic admission of all 1,752 source assets or all 149 candidates;
- structural Kenney wall/floor re-enablement;
- rewriting walk/table/room facts to fit an asset;
- raw GLB edits, Blender cleanup, runtime CSG, or a physics engine;
- a new screen-space outline/post stack;
- new generated art or edits to existing sprite/dressing images;
- in-game authoring UI or scene-specific saved overrides;
- material-authoring beyond preserving UVs and the existing Genesis grading path;
- KayKit or any other new asset corpus, procgen/graph/WFC/BVH/UI dependency, and runtime package
  adoption prompted by the advisory OSS report;
- `InstancedMesh` conversion or other draw-call optimization before the repaired inventory is
  profiled and shown to need it;
- stacking arbitrary loose objects on top-surface sockets in production (the workbench proves the
  contract; a later composition unit may consume it).

## 14. Completion definition

The operation is complete only when all eight executable units are merged, full CI-equivalent
verification is green, the proving captures pass the orchestrator's visual read, one bridge playtest
records no P0/P1 alignment or collision complaint, and docs close coherently through
`genesis-clean-close`.

“The workbench exists,” “the harness is green,” or “ten assets load” is not completion by itself.
