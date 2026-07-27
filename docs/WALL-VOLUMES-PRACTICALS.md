---
type: system-spec
project: Genesis
status: SPECCED
updated: 2026-07-12
companion: docs/STAGE-C-ART-DIRECTION-REVIEW.md
refs: ui-sketches/mock-frames/vq-next-waves/README.md (frames 01/02/03)
supersedes-gate: docs/STAGE-C-ART-DIRECTION-REVIEW.md items "C4.1 wall volumes" + "E0 visible practicals"
---

# Wall Volumes + Visible Practicals — the next graphics wave

Execution contract for the C4.1 / E0 graphics lane. Three units, one dependency spine. This
doc is the source of truth; the art-direction review and the vq-next-waves README frames 01/02/03
are the *why* and the visual target. **If the review and this doc disagree on a code anchor, this
doc wins** (its anchors are grounded against the current tree, 2026-07-12).

## Authority order (from the vq-next-waves README)

1. canonical stored walk fields + persistent state — geometry/lights may PROJECT them, never re-roll;
2. the technical notes in this spec + the art-direction review;
3. the executable capture gates;
4. the reference images (frames 01/02/03) — reproduce intended behavior, never copy an image accident
   (the frames over-budget flame count and add illustrative damage — do not copy those).

## The units and their queue

| Unit | Branch | Base | What |
|---|---|---|---|
| **C4.1a** wall volume geometry | `feat/wall-volumes-geo` | master | single-quad walls → capped thick stem + independently-fadeable upper + trim + mount slots; per-segment upper meshes; static parapet cut preserved as show/hide-upper (no visual regression) |
| **C4.1b** segment upper occlusion | `feat/wall-upper-occlusion` | C4.1a tip | replace the static near/far parapet decision with camera-to-subject ray-vs-segment blocking + hysteresis/tween; stems stay opaque |
| **E0** visible practicals | `feat/visible-practicals` | C4.1a tip | physical fixture geometry per light + emissive submesh + PointLight at emitterLocal; disable glow disc behind a diagnostics flag; wall fixtures parent to C4.1a mount slots |

**C4.1a GATES the wave.** After it lands to master, C4.1b and E0 run in parallel worktrees off
master (C4.1a's landed tip). They touch disjoint regions of `setInteriorBoard` (occlusion vs
lights) but both consume C4.1a's new shell outputs, so they land through an integration-gate
(§Integration) before master merges.

Global unit constraints (all three): classic `<script>` globals in the loaded files EXCEPT
`theater-boot.js`/`theater-room-mesh.js` which are the ES-module boundary (imports at top);
transient state in `GS`/`S`; run `python3 build/check-manifest.py` after ANY module edit and it must
end `RESULT: OK`; **never** run `dev/verify-bridge.py`. World-unit convention: **1 world unit = 5 feet.**

---

## Shared grounding (verified anchors, 2026-07-12)

### The room-shell compiler — `src/ui/theater-room-mesh.js`

- Pure core `compileRoomShellData(cells, opts)` — **:731**. Its `segments.forEach` loop emits, per
  wall segment, **exactly one vertical quad** at the `seg.kind === "wall"` branch **:964-974**
  (`pushQuad(wallBuf, p0,p1,p2,p3, {x:n.x,y:0,z:n.z}, ...)`, verts `p0/p1` at `baseY`, `p2/p3` at
  `baseY+h`). Riser branch **:975-990** (sibling, leave alone). Door branch **:911-937** emits no
  wall quad (aperture record + floor filler).
- Returns bundle **:1033-1045**: `{ floor, walls, risers, apertures, cellTriangleMap, meta }`. Each
  `walls` bundle carries `{ positions, normals, uvs, colors, indices, segments }`; each wall segment
  record pushed at **:974** is `{ a, b, tier, height }`.
- Thin THREE assembler `compileRoomShell(cells, opts)` — **:1076**, exported **:1103**. Wraps the pure
  bundle into `{ floorGeometry, wallGeometry, riserGeometry, cellTriangleMap, apertures, floorTiers,
  wallSegments, riserSegments, meta }`.
- Helpers: `segmentNormal(seg)` (INWARD horizontal unit normal) **:294**; `DEFAULT_WALL_HEIGHT = 2.4`
  **:82**; `DEFAULT_BEVEL_WIDTH/DROP` **:83-84** (a floor/wall seam chamfer, NOT wall thickness).
- Opts contract doc-block **:30-55** (`tierHeights`, `wallHeight`, `wallHeightForSegment(segMeta)`,
  `bevelWidth/bevelDrop`, `uvDensity`, `smoothShape`, `radialSmoothBlend`). `segMeta` handed to
  `wallHeightForSegment` is `{ a, b, mid:{x,z}, kind:"wall", tier }` (built **:965**).
- Manifest: id `ui.theater-room-mesh`, `manifest.json:2362-2394`, `type:"module"`. `owns` list
  **:2365-2391** is ALREADY incomplete vs the export surface — **extend it** with every new exported
  symbol (do not just append; audit the export list at **:1091-1104**).

### The consumer/assembler — `src/ui/theater-boot.js` (ES-module boundary; owns `*window.Theater`)

- `setInteriorBoard` builds the shell. `ITR_ROOM_SHELL = true` (**:7935**). The shell block is
  `if(ITR_ROOM_SHELL && floorList.length){` **:8704**.
- **Static parapet cut (today's near-wall shortening):** `wallHeightForSegment` supplied **:8760-8768**
  — `parapetFr = data.focusRect`, yaw-derived `parapetDir`; near-side (dot>0, in-band) → `roomWallHeight
  * ITR_ROOM_SHELL_PARAPET_FRAC` (**:7943**, `=0.4`); far-side stays full. `compileRoomShell(shellCells,
  {...})` called **:8895-8898**.
- Wall mesh built **:8906-8912** as ONE `THREE.Mesh(shell.wallGeometry, wallMat)`, `userData.interiorKind
  = "room-shell-wall"` (**:8910**), `wallMat` is `MeshLambertMaterial` (**:8832-8845**). Floor **:8899-8905**,
  riser **:8913-8918**. All pushed to `roomShellMeshes`.
- Persisted for the board: `S.interiorLastRoomShell = { wallSegments, apertures, riserSegments,
  floorTiers, ... }` **:8922-8925**.
- Scene attach **:9001-9003**: `itrFloorWallMeshes = (ITR_ROOM_SHELL && roomShellMeshes.length) ?
  roomShellMeshes : [floorMesh, wallMesh, wallGhostMesh]` — the compiled shell **REPLACES** the per-cell
  wall path; they are mutually exclusive.
- **Runtime A4 occlusion machinery** (currently runs only on the per-cell `wallList`, NOT the shell):
  `itrOcclusionClassify(id, rawBlocking, holdPrior)` **:7869-7904** (pure hysteresis decision
  `itrOcclusionNextCommitted` **:7856**; opacity tween mutates `entry.materials.forEach(m=>m.opacity=v)`
  **:7890-7895**). Tunables: `ITR_OCCLUSION_STEM_HEIGHT_U=0.20` (exactly one foot),
  `ITR_OCCLUSION_UPPER_OPACITY=0.08`
  **:7783**, fade `150/220ms` **:7785-7786**, `ITR_OCCLUSION_RECLASSIFY_HYSTERESIS_DEG=3` **:7787**. This
  classify/tween engine is REUSABLE as-is by C4.1b. **Superseded 2026-07-26:** every cutaway path
  now uses an exact 0.20u / one-foot total stub; compiled volume walls express that as a 0.14u body
  plus the existing 0.06u cap.
- ShotPlan occlusion targets: `S.lastShotPlan.occlusionTargets` read **:8345**; produced by
  `occlusionTargetsFromTray(tray)` `theater-shot.js:386-392` as **positions only** `{id,kind,x,z}`.
  `penaltyHardOcclusionArea(...)` is a **stub returning 0** `theater-shot.js:647` — no ray/segment test
  exists anywhere; that is C4.1b's slot.

### The light producer — `src/engine/theater-interior.js`

- `itrRoomLights(room, plan, kit, dressingByRoom)` **:532**; record built **:546-555**:
  `{ x, z, y, color, intensity, distance, decay, kind, roomSegNum }`. `kind = kit.lightKind || "torch"`
  (**:543**) ∈ {`torch`,`lamp`}. Called from `interiorBuildBoard` **:1386**; lights returned on the board.
- Realm kits `INTERIOR_TILE_KITS` **:40-166** carry `lightKind`/`lightColor`/`lightIntensity` per realm.
- A SEPARATE rolled "light profile" (ambient wash only, not fixtures) lives in `theater-data.js`
  (`THEATER_LIGHT_TABLE`, `theaterRollLightProfile`, keyword→profile map ~**:171-175**: lamp/lantern→
  `lamplit`, brazier|torch|sconce→`torchlit`, glow/luminous→`magic-glow`). Consumed by `applyLightProfile`
  `theater-boot.js:4904`. **E0 reads this vocabulary to pick a fixture family but must not disturb the
  ambient wash it drives.**

### The glow disc + light build — `src/ui/theater-boot.js`

- `interiorBuildGlowDisc(light)` **:6344-6359** — camera-facing additive `PlaneGeometry` billboard
  (`MeshBasicMaterial`, `AdditiveBlending`, `userData.sprite=true` **:6357**). Consts **:6341-6343**.
- `interiorBuildLights(lights, cx, cz, realmId, floorTopMap, pieces, isBrightRealm)` **:6487-6595**;
  called **:9011** (passed NO wall/shell object today). `suppressPractical` gate **:6514**. PointLight
  **:6515-6536**. Glow disc mount + `glowCount++` **:6541-6547**. Existing emitter fixtures
  `interiorBuildLightCard`/`interiorBuildLightEmitterNub` **:6565-6579** (`INTERIOR_LIGHT_CARD` maps only
  3 realms, **:6311-6315**). Flicker collection **:6583-6592** pushes `{ pl, marker: glow.mesh, cone, ... }`
  — **fragile**: `glow.mesh` is dereferenced inside the `!suppressPractical` branch; do not break that
  coupling. Return **:6594** `{ group, casters, flickerTargets, glowCount }`. `S.interiorLightGlowCount`
  stamped ~**:9021**.
- Bloom: `UnrealBloomPass` **:4243-4254** (strength 1.15, radius 0.5, **threshold 0.68 linear**) —
  **luminance-gated, not object-masked**; a per-object mask is explicitly rejected as nonexistent
  **:7809-7814**. So E0 makes fixtures bloom by giving the flame/bulb/crystal submesh emissive material
  bright enough to clear 0.68, and keeping diffuse stone below it. No new mask.

---

## Unit C4.1a — wall volume geometry + mount slots

**Goal:** every boundary wall segment becomes a heavy architectural volume — an always-opaque capped
**stem**, an independently-hideable **upper**, optional **trim**, and **mount slots** — instead of a
single two-triangle plane. Reproduce today's look exactly (near wall = low capped tray edge, far/side
walls = full height) by mapping the existing static parapet decision to *show-or-hide the upper per
segment*. **No material/PBR/AO/bloom work** — walls stay `MeshLambertMaterial`. See frame 01.

### Phase 0 — octagon contour miter correction (Codex diagnosis, 2026-07-12; MUST land first, gated on its own)

The thick-wall compiler builds inner/outer/cap from the segment CONTOUR, so a contour dogleg is
inherited and amplified by the volumes. C4.1a therefore fixes the contour FIRST.

**Bug:** `chamferRunCorners` (`theater-room-mesh.js:409-417`) builds the correct collinear 45°
midpoint diagonal, but lines 413/415 leave a short **axis-aligned half-edge stub** at each end of the
run — the visible S/dogleg where the diagonal meets the straight wall (admitted in the header comment
:407-408). `diagonalizeStaircaseRing` (:434-462) also skips the ring wraparound seam (:431-433), so a
corner can be left un-mitered.

**Fix (render-only):** each octagon corner renders as ONE continuous 45° plane cleanly mitered into
the adjacent straight walls — extend the diagonal to its miter intersection with the neighbor straight
lines, trim/extend those neighbors to meet it (endpoint-continuous, zero axis-aligned stubs), and
handle the wraparound seam so no corner is left un-mitered. Preserve logical cells, door placement
(door/riser stay hard run-breaks), combat geometry, and `cellTriangleMap`; the miter fills the outer
notch (contour moves OUTWARD = adds floor only), so every cell center must still resolve inside a
containing triangle (`dev/verify-stage-c3b-circle-smooth.mjs` stays green).

**Test (red-first, its own gate before volumes):** assert COMPLETE face straightness + endpoint
continuity — each corner a single straight 45° segment with NO adjacent axis-aligned stub, contour
endpoint-continuous with zero degenerate stub segments, clean miter at each junction. Prove the
CURRENT `chamferRunCorners` output fails these (stub segments exist) before the fix. Add a zoomed
octagon-corner render capture (orchestrator READS it for straightness).

**Then Phase 1+ (below):** build inner/outer/cap off THIS corrected contour so all three share it;
offset the outer face via the module's existing `insetPolygon`/`insetOffset` miter math so the offset
stays continuous through the 45° miter vertices (no re-introduced stub on outer face or cap).

### Files + functions to touch

1. `src/ui/theater-room-mesh.js` — `compileRoomShellData` **:731** (wall branch **:964-974**),
   `compileRoomShell` **:1076-1089**, module opts doc-block **:30-55**, exports **:1091-1104**.
2. `src/ui/theater-boot.js` — `setInteriorBoard` shell block **:8704-8926** (wall mesh build
   **:8906-8912**, `S.interiorLastRoomShell` **:8922-8925**), the `wallHeightForSegment` supplier
   **:8760-8768** (repurpose to a per-segment *upper-visible* predicate, see below).
3. `dev/verify-room-shell.mjs` — update the breaking checks (§Verification).
4. New harness `dev/verify-wall-volumes.mjs`.
5. `dev/battle-gate/capture-stage-c3-shapes.mjs` — no code change needed; re-shoot for the gate.
6. `manifest.json` — extend `ui.theater-room-mesh` `owns` with new exported symbols.

### Data shapes (exact)

Extend the opts contract on `compileRoomShellData`/`compileRoomShell` (defaults in parens):

```js
opts.wallThickness        // number, inward extrusion depth (0.22). realm/material profile 0.15–0.32.
opts.wallStemHeight       // number, persistent stub BODY height (0.14).
opts.wallCapHeight        // number, top-cap slab thickness (0.06).
opts.wallCapOverhang      // number, cap projection past each face per side (0.035). 0.025–0.06.
opts.wallFooting          // number, base-course projection past the outer face (0.06). 0.04–0.10.
opts.wallTrim             // bool, emit base-course + cornice trim sweeps (true).
opts.upperVisibleForSegment// OPTIONAL (segMeta)->bool. default ()=>true. replaces the height-fraction
                           //   override: when it returns false, that segment emits stem+cap+footing
                           //   only (no upper) — the capped tray edge. Pure module: no camera concept.
```

Current cutaway invariant (Adam, 2026-07-26): `wallStemHeight + wallCapHeight === 0.20u`, exactly
one foot at the Clayroom scale. This is no longer a proportional parapet or a tunable 0.22–0.40u
range.

Keep `wallHeightForSegment` accepted for back-compat but deprecate its use for the parapet cut; the
near/far decision now flows through `upperVisibleForSegment` (a boolean, not a height fraction), so
the near wall renders a full-thickness capped stem instead of a squashed thin quad.

Per-segment geometry, emitted into **separate named buffers** (all indexed, world-space UVs, existing
inward-normal convention). For a wall segment with endpoints `a,b`, inward unit normal `n =
segmentNormal(seg)`, tangent `t = normalize(b-a)`:

- **stem** (always opaque, collision-valid): `inner` face (a→b at floor→`stemHeight`), `outer` face
  (offset inward-negative by `wallThickness` along `n`, i.e. the back face at the same span),
  `topCap` (a horizontal slab of `capHeight` bridging inner↔outer at `stemHeight`, overhanging
  `capOverhang` on each side), `endCaps` (the two `a` and `b` end quads closing the box ends where a
  segment terminates at an aperture or a convex corner — skip an end shared with a collinear
  continuation), `footing` (a short skirt projecting `wallFooting` past the outer face at the base).
- **upper**: `inner`, `outer`, `topCap`, `endCaps` from `stemHeight`→`wallHeight` (the existing 2.4
  baseline). Same thickness. Emitted per segment so each can be shown/hidden independently.
- **trim** (optional, `wallTrim`): a `baseCourse` sweep at the footing line and a `cornice` sweep at
  the stem/upper seam — thin profile ribbons, same occlusion group as their owner segment.
- **mountSlots**: for each wall segment, compute an array of candidate mount transforms on the INNER
  face: `{ slotId, ownerSegIndex, u /*0..1 along a→b*/, worldPos:{x,y,z}, normal:{x,y,z} /*inward n*/,
  tangent:{x,y,z} }` at a default eye-height band (y ≈ 1.4) and at least the segment midpoint; door
  segments contribute NO mount slots. These are DATA only in C4.1a (E0 consumes them).

### Compiler return additions

`compileRoomShellData` returns, additionally: `wallStem`, `wallUpper`, `wallTrim` (each a
`{positions,normals,uvs,colors,indices, segments:[{ownerSegIndex, tier}]}` bundle; `wallTrim` may be
null), and `mountSlots:[...]`. Keep the legacy `walls` bundle present but as the *stem inner face only*
so nothing that reads `.walls` hard-breaks; note it deprecated in a comment. `compileRoomShell`
assembles `wallStemGeometry`, `wallUpperGeometry` (**see per-segment note**), `wallTrimGeometry`
(nullable), and passes through `mountSlots`.

**Per-segment upper handle (critical for C4.1b + parapet):** emit the upper as **one geometry group
per wall segment** so each can be a separate `THREE.Mesh` (or a merged geometry with per-segment
draw-groups + per-group material). Rooms here have ≤ ~12 boundary segments, so per-segment upper meshes
are acceptable; prefer that for simplicity. Each upper mesh carries `userData = { interiorKind:
"room-shell-wall-upper", ownerSegIndex }`. The stem is ONE merged opaque mesh
(`interiorKind:"room-shell-wall-stem"`); trim one merged mesh (`interiorKind:"room-shell-wall-trim"`).

### Assembler behavior (`setInteriorBoard`)

Ordered:
1. Build the stem mesh (opaque, `MeshLambertMaterial`, same tint as today's `wallMat`), add to
   `roomShellMeshes` + `S.interiorGroup`.
2. Build one upper mesh per wall segment; for each, set initial visibility from the repurposed
   parapet predicate: reuse the near/far test currently at **:8760-8768** but return a **boolean**
   `upperVisibleForSegment` (near-side, in-band, dot>0 → `false`; else `true`). A hidden upper: set
   `mesh.visible=false` (C4.1a) — C4.1b will swap this hard toggle for a tweened opacity.
3. Build trim mesh if present; add.
4. Persist on `S.interiorLastRoomShell`: add `wallStemMesh`, `wallUpperMeshes:[{mesh,ownerSegIndex}]`,
   `wallTrimMesh`, `mountSlots`, and keep `wallSegments`/`apertures` as today (**:8922-8925**).
5. `itrFloorWallMeshes` selection (**:9001**) unchanged in shape — `roomShellMeshes` now contains the
   stem + upper(s) + trim instead of the single wall mesh.

### Out of scope (C4.1a)

- Camera-to-subject ray occlusion (that's C4.1b — C4.1a only reproduces the static near/far show/hide).
- Any material change beyond keeping `MeshLambertMaterial` (no MeshStandard, no PBR, no AO, no bloom).
- Mounting anything IN the slots (E0). C4.1a only emits the slot data.
- Ceilings, per-brick meshes (surface masonry is a future material concern — a few long quads only).
- Touching the riser/floor branches or the door aperture logic beyond adding stem end-caps at apertures.

### Verification (C4.1a)

New harness `dev/verify-wall-volumes.mjs` (pure-core, imports `compileRoomShellData`), each check
RED-FIRST where marked ⊗:

1. ⊗ **Thickness exists** — a straight wall segment emits BOTH an inner and an outer face separated by
   `wallThickness` along the inward normal (prove: with a synthetic single-quad build the outer face is
   absent → assertion fails → then the volume build passes). Assert outer-face verts = inner-face verts
   offset by `-n * wallThickness`.
2. ⊗ **Top cap** — a horizontal cap slab exists at `stemHeight` (or `wallHeight` for a visible upper)
   spanning inner↔outer with `capOverhang`; assert a near-horizontal normal (|ny|≈1) cap triangle set.
3. ⊗ **Footing** — a base skirt projects `wallFooting` past the outer face at y≈0.
4. **Stem/upper separability** — `wallStem` and `wallUpper` are distinct bundles; each wall segment
   appears in both `wallStem.segments` and (unless upper-hidden) `wallUpper.segments` keyed by
   `ownerSegIndex`.
5. ⊗ **Upper omission** — with `upperVisibleForSegment = ()=>false`, `wallUpper` for those segments is
   empty while `wallStem` (with cap) is intact (prove: default all-visible fails this).
6. **Mount slots** — every wall segment yields ≥1 mount slot on its inner face (`normal ≈ segmentNormal`,
   `worldPos` on the inner plane); door segments yield ZERO.
7. **Segment-count invariant preserved** — a no-door 6×5 room still collapses to exactly 4 wall
   segments (the C4/C3b collapse logic is untouched); an 18×12 room also → 4.
8. **Determinism** — same cells+opts → byte-identical buffers across two builds.

Update `dev/verify-room-shell.mjs`: the old check 4a `quadCount === 4` (**:138-156**) breaks — rewrite
it (red-first, commented WHY) to assert **4 wall SEGMENTS** still collapse (count invariant) and that
each segment's stem carries inner+outer+cap+footing, not one quad. Preserve checks 1 (segment count),
2 (door aperture survives), and the UV-continuity intent (assert U continuity across the inner-face
run). Do NOT weaken the door/aperture assertions.

Regression harnesses (must stay green): `dev/verify-stage-c3b-circle-smooth.mjs` (imports
`compileRoomShellData` — roundness + octagon 45° diagonal faces on the INNER boundary), `dev/verify-
stage-c-terrain.mjs` (row-101 tiers), `dev/verify-stage-c-shapes.mjs`, `dev/verify-stage-c-size.mjs`,
and `python3 build/check-manifest.py` → `RESULT: OK`.

**Capture gate:** re-run `node dev/battle-gate/capture-stage-c3-shapes.mjs` → the orchestrator READS
`dev/battle-gate/stage-c3-shapes/{octagon,rotunda,l-shaped}.png` + `contact-sheet.png` against frame
01: far/side walls full height with visible top-cap thickness + exposed ends; near wall a low capped
thick stem (the tray edge); apertures with jamb depth; no wall segment a single flat plane. Add a
second grazing-angle capture (low camera) proving inner face + cap + outer face all resolve — either a
new `dev/battle-gate/capture-wall-volumes.mjs` or a low-angle variant scene in the existing harness.

### Decisions (do not re-litigate)

- **Per-segment upper meshes** over one merged upper — chosen for a simple independent-fade handle;
  segment count is small (≤ ~12). Grounds: single-mesh wall has no per-segment opacity handle
  (`theater-boot.js:8907`); C4.1b needs per-segment fade.
- **Parapet cut becomes a boolean show/hide-upper**, not a height fraction — grounds: the frame-01
  target near wall is a full-thickness *capped stem*, not a squashed 40%-height plane. The current
  `ITR_ROOM_SHELL_PARAPET_FRAC=0.4` is retired for the shell (keep the const only if some other reader
  references it — grep first).
- **Walls stay Lambert.** MeshStandard/PBR is Stage E1, explicitly out of this wave.

---

## Unit C4.1b — segment-level upper-wall occlusion

**Goal:** replace C4.1a's static near/far upper show/hide with a camera-relative, per-segment decision:
a wall-upper hides only when its volume actually blocks the camera-to-subject ray for a required
subject; stems stay opaque and capped; mechanics/collision/mounts read the logical full segment. See
frame 02: identical encounter across camera changes, far walls retained, only affected upper segments
change. **Base off C4.1a's landed tip.**

### Files + functions

1. `src/ui/theater-shot.js` — flesh out the `penaltyHardOcclusionArea` stub **:647** (or a sibling)
   into a real ray-vs-segment blocking test used by `composeShot` candidate scoring; and expose a
   pure `wallUpperBlockingSet({camera, subjects, wallSegments})` helper for both scoring and runtime.
2. `src/ui/theater-boot.js` — in `setInteriorBoard`, drive each C4.1a upper mesh's opacity through the
   EXISTING `itrOcclusionClassify` engine **:7869-7904** (register each upper mesh's material in an
   occlusion entry's `materials` array; reuse tunables **:7783-7787**). Feed it the blocking set from
   the shot's camera + `S.lastShotPlan` subjects (player, primary threat, objective, focal
   interaction) resolved against `S.interiorLastRoomShell.wallSegments`.
3. New harness `dev/verify-wall-occlusion.mjs`.

### Behavior (ordered)

1. Build full wall volumes once (C4.1a) — logical structure never changes here.
2. Keep `wall-stem` opaque + persistent always.
3. For the current camera and the required subject set, cast camera→subject rays; a wall-upper segment
   is **blocking** iff its upper volume (the segment's inner/outer faces between `stemHeight` and
   `wallHeight`) intersects a ray *before* the ray reaches its subject.
4. Feed the raw blocking flags into `itrOcclusionNextCommitted`/`itrOcclusionClassify` per segment
   (hysteresis + tween), mutating that upper mesh's material opacity `1 → ITR_OCCLUSION_UPPER_OPACITY`
   and back. Never toggle `.visible` hard once tweening; never touch the stem.
5. Camera moves away / no longer blocks → restore upper with the existing hysteresis/tween.
6. A roll that explicitly licenses ruined/low/partition walls may make canonical full height itself
   low (a C4.1a `upperVisibleForSegment=false` from a licensed roll, not camera-driven) — leave that
   alone; C4.1b only governs the camera-driven near cut.
7. `composeShot` scoring: penalize candidates that place a wall-mounted objective's owning segment
   between camera and action (via `penaltyHardOcclusionArea` now returning a real cost); if all
   candidates fail, prefer an orbit/closer wall-facing shot — never detach the mount.

### Out of scope (C4.1b)

- Collision, pathing, doors, cover, wall-mounted STATE — all read the logical full segment, untouched.
- The fixture mounting itself (E0). C4.1b only fades geometry.
- Any new material/bloom work.

### Verification (C4.1b)

New harness `dev/verify-wall-occlusion.mjs` (pure, imports the `wallUpperBlockingSet` helper), ⊗ = red-first:

1. ⊗ **Ray blocking** — a segment whose upper volume lies between camera and a subject is in the
   blocking set (prove: with the stub returning ∅ the known blocker is missed → red → real test green).
2. **Determinism** — same camera + same subjects + same segments → identical blocking set across runs.
3. **Stem never blocks** — the blocking set contains only upper volumes; stems are never members.
4. **Segment-local** — a camera change that clears one subject's sightline flips only that segment's
   membership, not a whole room side (assert the set delta is minimal).
5. **Non-required walls stay full** — a wall blocking nothing required is never in the set.
6. **Scoring** — `penaltyHardOcclusionArea` returns >0 for a candidate that hides a `mountImportant`
   objective's segment and 0 when it doesn't (mutation: objective flag off → penalty 0).

Runtime check: extend the shapes capture (or a new `dev/battle-gate/capture-wall-occlusion.mjs`) to
shoot the SAME encounter from two camera yaws; orchestrator READS both against frame 02 — same minis,
far walls full, only near/blocking uppers faded, stems opaque throughout. Byte-identical logical state
across the two (assert `wallSegments`, collision, mounts unchanged).

Regression: `dev/verify-theater-shot.mjs`, `dev/verify-frustum.mjs`, `dev/verify-wall-volumes.mjs`
(C4.1a), full `dev/verify-*.mjs` sweep, `check-manifest.py` OK.

### Decisions

- **Reuse `itrOcclusionClassify`** (do not build a new fade engine) — grounds: it already implements
  hysteresis + tween + per-material opacity **:7869-7904**; it was just never wired to the compiled
  shell. C4.1b is the wiring.
- **Ray-vs-upper-volume, not screen side** — grounds: review P1 + frame 02 require segment/ray, and
  `penaltyHardOcclusionArea` is a 0-stub today.

---

## Unit E0 — visible practicals

**Goal:** every local light gets an inspectable physical fixture (the visible noun); the PointLight
illuminates; only the flame/bulb/crystal submesh is emissive and clears the bloom threshold. Disable
the floating glow disc in production (diagnostics flag only). Wall fixtures parent to C4.1a mount
slots. See frame 03 (six families: floor candle cluster, handled floor lantern, low brazier, wall
sconce, ceiling-hung lamp, chrome faceted crystal). **Base off C4.1a's landed tip** (needs mount slots).

### Files + functions

1. `src/engine/theater-interior.js` — `itrRoomLights` **:532-555**: resolve and stamp a fixture spec
   onto each light record (see shape). Pure engine (no `w`/`U`/render).
2. `src/ui/theater-boot.js` — `interiorBuildGlowDisc` **:6344** (gate behind a diagnostics flag);
   `interiorBuildLights` **:6487-6595** (build fixture geometry per record, attach PointLight to
   `emitterLocal`, collect flicker on the emissive submesh not the disc); the call site **:9011**
   (thread the wall mount data in). Add a small fixture-recipe grammar (new functions in this file).
3. New harness `dev/verify-visible-practicals.mjs`; rewrite `dev/verify-diegetic-light.mjs` and
   `dev/verify-bw3-4-light-shafts.mjs`.
4. New capture `dev/battle-gate/capture-practicals.mjs`.
5. `manifest.json` if any new owned symbol crosses a module boundary (theater-boot owns
   `*window.Theater`; new internal fns need no owns entry unless exported).

### Data shapes (exact)

Extend the light record produced by `itrRoomLights` (**:546-555**) with:

```js
{
  // ...existing x,z,y,color,intensity,distance,decay,kind,roomSegNum...
  fixtureId,               // string, resolved recipe id (see resolution)
  mount: "floor"|"wall",   // "ceiling" DEFERRED (open-top diorama) — see out-of-scope
  ownerSegIndex: null,     // set for wall mounts (index into wallSegments), else null
  emitterLocal: {x,y,z},   // flame/bulb/crystal center in fixture-local space
  sourceRef,               // provenance: the walk light-profile roll ref this fixture came from
}
```

**Fixture resolution** (deterministic, seeded on `roomSegNum`+index — no `Math.random`): from
`(realm family, light profile keyword, kind)`:

| realm / profile | family (fixtureId) | mount |
|---|---|---|
| gloom, torchlit | `sconce-iron` (wall) or `brazier-low` (floor), alternate by seed | wall / floor |
| gloom, ambient/dark | `candle-cluster` | floor |
| fantasy, torchlit | `sconce-torch` | wall |
| fantasy, lamplit | `lantern-handled` (floor) or `lantern-hung`→degrade to floor post | floor |
| chrome, lamplit/magic | `crystal-faceted` | floor (pedestal) |
| default | `bracket-generic` (wall if a segment is near) else `lamp-post` (floor) | wall/floor |

Wall mount → snap to the nearest C4.1a mount slot on the segment closest to the light's `(x,z)`; set
`ownerSegIndex` + position/orient from that slot. Floor mount → stand on the floor-top at `(x,z)`.

**Fixture geometry grammar** (a small deterministic recipe set built from primitives — cylinders,
cups, handles, chains, brackets, cages, wax columns, faceted crystals). Each recipe returns a
`THREE.Group` with a named child `emitter` submesh (the flame/bulb/crystal) using an emissive material
bright enough to clear bloom threshold 0.68 (emissive color = light color, `emissiveIntensity` tuned so
the submesh apex reads ≥0.7 linear), and body meshes using `MeshLambertMaterial` (NOT emissive, NOT
bloom). Instancing/reuse encouraged. The PointLight is positioned at the group-local `emitterLocal`
(world = group transform × emitterLocal).

### Behavior (ordered, `interiorBuildLights`)

1. For each light record, resolve its fixture recipe → build the fixture `THREE.Group`.
2. Place the group: floor mount at floor-top `(x,z)`; wall mount parented to the C4.1a wall-mounts data
   threaded in via a new arg (see seam), oriented to the slot's inward normal, so it cannot float.
3. Create the PointLight (unchanged params) at the emitter world position; add to the light group.
4. Collect flicker on the **emitter submesh's** material (emissiveIntensity pulse) + the PointLight —
   NOT on a glow disc. Preserve the flicker amplitude/coupling but read `fixture.emitter` instead of
   `glow.mesh` (fix the fragile **:6583-6592** coupling accordingly).
5. Glow disc: gate `interiorBuildGlowDisc` behind `ITR_GLOW_DISC_DIAGNOSTIC` (default `false`);
   `glowCount` stays 0 in production. Keep the function for the diagnostics flag only.
6. `suppressPractical` (bright realms): still suppresses the PointLight intensity as today, but a bright
   realm now shows the *fixture body* (unlit) rather than nothing — keep the fixture, drop the glow.

**Seam for wall mounts:** thread the wall mount data into `interiorBuildLights`. Add a parameter
(e.g. `wallMountData` = `S.interiorLastRoomShell.mountSlots` + `wallSegments`) at the **:9011** call
site; inside, resolve wall fixtures against it. Floor fixtures ignore it (so E0 floor practicals work
even if C4.1a mount data is absent — defensive: `mount:"wall"` with no slot degrades to `mount:"floor"`
at the light's position, logged).

### Out of scope (E0)

- **Ceiling mounts** — open-top diorama has no ceiling; `mount:"ceiling"` is DEFERRED. If a record ever
  asks for it, degrade to a floor lamp-post or a wall-bracket hang and note it. (Frame 03's ceiling
  lantern is aspirational; do not build a ceiling.)
- Selective-bloom MASK (rejected as nonexistent **:7809-7814**) — E0 uses the existing luminance bloom
  by making the emitter submesh bright; do NOT build a mask layer.
- MeshStandard/PBR materials (Stage E1). Fixtures use Lambert bodies + emissive emitter only.
- Semantic construction resolver / prop recipes for non-light nouns (that's D0/D1, a later wave).

### Verification (E0)

New harness `dev/verify-visible-practicals.mjs`, ⊗ = red-first:

1. ⊗ **Fixture per light** — every non-suppressed PointLight resolves exactly one fixture group with a
   named `emitter` submesh (prove: pre-change there is no fixture → red).
2. **Emitter co-location** — the PointLight world position lies inside/on the emitter submesh's bounding
   box (the review's "emitter world position inside its fixture emissive bounds").
3. ⊗ **No glow disc in production** — with `ITR_GLOW_DISC_DIAGNOSTIC=false`, `glowCount === 0` and no
   `userData.sprite` glow plane is built (prove: this is the inverse of the old `glowCount>0` check —
   red-first by flipping the diagnostic flag on and asserting the count moves).
4. **Wall fixtures owned** — a `mount:"wall"` fixture has a valid `ownerSegIndex` and is a child of the
   wall group (cannot float); a `mount:"floor"` fixture sits on floor-top.
5. **Single dominant practical** — assert one practical owns the brightest region and supporting
   sources are subordinate (intensity ordering).
6. **Fixture without bloom still legible** — with emissive intensity forced to 0 the fixture body is
   still a recognizable physical object (geometry present, non-empty group).
7. **Flicker rebind** — flicker targets reference the emitter submesh, not a glow mesh; the fragile
   `glow.mesh` deref is gone.

**Rewrite (red-first, commented WHY):**
- `dev/verify-diegetic-light.mjs` — replace the `glowCount>0` assertion (**:605**) and the disc-based
  visible-source checks with fixture/emitter co-location + `glowCount===0` production assertions. Keep
  the per-realm "visible emitter under every light" intent (now a fixture, not a nub/disc).
- `dev/verify-bw3-4-light-shafts.mjs` — the per-light `{PointLight, glow}` child-count checks (**:276,
  333, 343, 355, 364**) become `{PointLight, fixtureGroup}`; glow child appears only under the
  diagnostics flag.

**Capture gate:** new `dev/battle-gate/capture-practicals.mjs` renders a room lit by the six fixture
families → `dev/battle-gate/practicals/*.png`. Orchestrator READS against frame 03: each light has a
physical fixture body, only flame/bulb/crystal glows, warm floor pools, deep surrounding darkness, NO
floating discs. Also re-shoot the shapes contact sheet to confirm no regression.

Event-surface note: E0 touches no `applyEvent` case, so no `gauntlet-fuzz-events`/`monkey` needed
unless a light field is threaded through the DM contract (it is not — this is render-only).

### Decisions

- **Ceiling deferred** — grounds: rooms are open-top tabletop dioramas; a ceiling-hung lamp has nothing
  to hang from. Floor + wall cover frames 01/03's real fixtures.
- **No bloom mask** — grounds: per-object mask explicitly rejected as nonexistent **:7809-7814**; the
  luminance pass already blooms additive apexes, so a bright emissive submesh suffices.
- **Keep the fixture in bright realms** (drop only the glow) — grounds: review "turning emissive bloom
  off still leaves the fixture physically understandable"; suppression is about light intensity, not
  hiding the noun.

---

## Integration + landing (orchestrator)

1. Land **C4.1a** to master first (`--no-ff`), push. Re-gate: `check-manifest` OK, `verify-wall-volumes`,
   updated `verify-room-shell`, the stage-c regression set, READ the re-shot shapes + grazing captures.
2. Run **C4.1b** and **E0** in parallel worktrees off master. Re-gate each on its branch tip.
3. **Integration gate:** merge both onto a temp branch, run the FULL `dev/verify-*.mjs` sweep + both
   capture gates on that exact tree, confirm disjoint (no overlapping hunks beyond additive seams in
   `setInteriorBoard`), then replay `--no-ff` onto master and verify `git diff <integration> master`
   empty. Push.
4. Docs coherence at close via `/genesis-clean-close`: CHANGELOG + HANDOFF + NEXT-STEPS + this doc's
   status → BUILT, and the STAGE-C-ART-DIRECTION-REVIEW "Do next" items C4.1/E0 checked off.

## Acceptance (wave-level, from the frames)

- No wall segment is a single two-triangle plane; grazing angle resolves inner face + cap + outer face.
- Apertures have jamb depth + header/threshold; every wall-mounted object has a valid segment owner.
- Removing all textures still leaves a convincing architectural silhouette (Lambert-only is fine).
- Same camera+subjects → same blocking set; stems opaque throughout; logical state byte-identical
  before/after cutaway.
- Every non-environment PointLight resolves exactly one visible fixture; emitter inside its bounds;
  no floating practical markers; one dominant practical; diffuse near-white clipping stays low.
