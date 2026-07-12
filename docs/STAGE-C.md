# STAGE C — polygon room shells (GRAPHICS-NORTH-STAR wave 3)

type: system-spec
status: SPECCED (Opus 4.8, 2026-07-12 — Adam confirmed Stage C as the next graphics wave after Stage A
closed. Consumes the walk's rolled `areaType/dims/side` (today discarded) into real room geometry that
feeds the already-landed room-shell compiler. Grounded against the 2026-07-12 tree; every anchor
grepped live. Follows the RM-1/2/3 decomposition already specced in `docs/DUNGEON-GRAPH.md` U6 +
`docs/BEAUTY-WAVE-5.md` SEAM 2 — do not reinvent it.)

Read with: `docs/GRAPHICS-NORTH-STAR.md` §Stage C, `docs/DUNGEON-GRAPH.md` (U6 RM-1/2/3 + the SpatialPlan
BW5 additions), `docs/BEAUTY-WAVE-5.md` SEAM 2, `docs/ROOM-SHELL-COMPILER.md` (the landed C4), and the
target frames `12-gloom-octagon-room-shape` + `19-fantasy-dungeon-terrain-tiers`.

## The prime directive (from the walk-native contract — binds every unit)
The rolled `areaType/dims/side` are CANONICAL walk facts. Stage C is a **projection**: it interprets
those fields into geometry, deterministically. It may NOT roll new content, reject an incongruous roll
(a "rotunda in a corridor" was licensed — render it), call `Math.random()`/`Date.now()`, or mutate the
segment. `spatializePlan` is already under a DETERMINISM LAW (seeded mulberry32, no `Math.random`);
every shape/size/tier derivation MUST stay on that seed. Consume the provenanced WalkScene `structure`
lane (`walkSceneFrom` emits `areaType/dims/side` as `{role:"structure",sourceRef,value}` — walk-scene.js
:172-174) or the raw segment fields, but preserve provenance.

## The core problem (stated bluntly)
`spatializePlan` (place-spatialize.js:275-280) sizes every room from `sizeClass + rng()` (default 4–7
cells) and rasterizes a filled axis-aligned rectangle (:303-309). `segment.areaType/dims/side` are
**never read** — a "60′×60′ Grand Octagon with a central raised dais" rolls, then renders as a random
4–7 rectangle. The C4 room-shell compiler (`theater-room-mesh.js`, landed) already compiles an arbitrary
orthogonal `{x,z,tier,isDoor}` cell contour into a continuous polygon shell with per-tier risers — it is
fed only the rectangle's cells today (theater-boot.js:8702-8714). Stage C is the missing middle:
field → real cell footprint + tiers + shape, in the LOGICAL plan, so mechanics (combat cells,
placement, pathing) and render agree.

## Architecture decision (already ruled by DUNGEON-GRAPH U6 / BW5 SEAM 2 — do not relitigate)
**Shape/size/tier live in the LOGICAL plan (`spatializePlan` output), not render-only.** Combat happens
on the real octagon cells, not a phantom bounding rectangle; `interiorBuildBoard` faithfully renders
`plan.cells`, so once the spatializer emits non-rect FLOOR cells + per-cell tiers, the whole downstream
(interiorBuildBoard → floorList → the C4 shellCells at theater-boot.js:8706) carries them with no
render-side special-casing. Reversibility: gate the new plan behavior behind a diagnostic flag
(`SPATIAL_SHAPES`, default ON) so the old random-rect plan is one flag away during migration, mirroring
the `ITR_ROOM_SHELL`/`ITR_ACTIVE_ROOM_ONLY` convention.

## Reusable parsers (lift, don't reinvent)
- **dims → cells:** `cmDimsToGrid(dims)` / `cmGridFromCells(dims)` (combat.js:32/52) already regex the
  feet string (`/(\d+)\s*'/g`, first two ints) → grid. **Verify the W/D ordering** against the table's
  "W′ × D′" column (combat.js uses depth-then-width per its own note — confirm and normalize).
- GRID LAW: 1 cell = 5 ft (DUNGEON-GRAPH.md:67; combat.js:45). 20′→4, 30′→6, 40′→8, 60′→12 cells.

## The queue (stacked pipeline — each consumes the prior; land serially)
```
C1  feat/stage-c1-size-fidelity   dims → real w×d footprint in spatializePlan   off master
C2  feat/stage-c2-structural-tier side → per-cell dais/pit tiers in the plan     off C1 tip
C3  feat/stage-c3-real-shapes     areaType → polygon footprint + exits-from-face off C2 tip
```
All three touch `place-spatialize.js` (the shape/size/tier source) → strictly serial. C1 is foundational
(C2 tiers + C3 shapes both need the real footprint). Execute C1 first, re-gate, then C2, then C3.

---

## C1 — SIZE FIDELITY (RM-1) [foundational]

Make a room's footprint the ROLLED size, not `rng()` 4–7. Rooms stay rectangular in C1 (shape is C3);
only the w×d comes from `dims`.

### Behavior (in `src/engine/place-spatialize.js`, `dspBuildPlanOnce`, the size assignment ~:275-280)
1. For each segment, parse `segment.dims` → `{wCells, dCells}` via a lifted `cmDimsToGrid` regex
   (leading `N' x M'` or `N' diameter` → cells = feet/5, rounded; a `diameter` value gives a square
   bbox wCells==dCells). Clamp to a sane `[SPATIAL_MIN_CELL, SPATIAL_MAX_CELL]` band (name the consts;
   the room-shell/combat budgets assume ≤ a max — pick from the current 4–7 default's ceiling + headroom,
   document the number). A missing/unparseable `dims` falls back to the existing `rng()` 4–7 (never throw).
2. Use `{wCells,dCells}` as the room's `w`/`d` instead of the `rng()` values. Keep everything else
   (placement, corridors, doors, the seeded rng advance) IDENTICAL — do NOT change the rng call
   sequence for the fallback path (determinism: the same seed must still reproduce, and a parsed-dims
   room must be deterministic too). Behind `SPATIAL_SHAPES` (default ON); OFF = today's random rect.
3. Consume provenance: thread the `dims` `sourceRef` onto the room entry (`rooms[].dimsRef`) so C3/the
   digest can trace the footprint to its d200 roll (additive field; harmless if unused).

### Out of scope (C1)
Non-rectangular shapes (C3); elevation tiers (C2); exit-from-polygon (C3); any render-side change
(interiorBuildBoard already renders whatever cells the plan emits).

### Verify — `dev/verify-stage-c-size.mjs` (plain Node; copy a `verify-place-*.mjs` bootstrap)
1. ⊗ RED-FIRST **the discard is fixed:** feed a segment with `dims:"60' x 60'"` (or a real "Grand
   Octagon" roll) → the room footprint is 12×12 cells (±0), NOT a random 4–7. (Red-first: with
   `SPATIAL_SHAPES` OFF, assert it renders the random small rect — proving the field was discarded.)
2. **fallback safety:** a segment with missing/garbage `dims` → the exact `rng()` 4–7 room as today
   (byte-identical to `SPATIAL_SHAPES` OFF for that room).
3. **determinism:** same `walkId` seed → byte-identical plan (rooms/cells/doors) across two builds.
4. **clamp:** an absurd `dims:"500' x 500'"` clamps to `SPATIAL_MAX_CELL`, no runaway grid.
5. dims parser W/D ordering matches the table column (unit-test the regex on 6 real table strings incl.
   diameter + arm-width parens).
Regression (the plan/mechanics surface this ripples into): verify-dungeon-spatialize (place-spatialize
9/9), verify-place-semantics 26/26, verify-dungeon-walkbind 20/20, verify-combat-cells, verify-dungeon-
interior 287/0. check-manifest OK. If a regression harness moves because rooms are now correctly-sized
(not random), that's a FIXTURE update (red-first, commented) — never weaken the behavior.

---

## C2 — STRUCTURAL TERRAIN (RM-2) [off C1 tip]

Parse `segment.side` prose → per-cell elevation tiers (dais/pit), stamped into the plan, so the C4
compiler's per-cell `tier` input (theater-room-mesh.js, `{x,z,tier}`) renders real dais risers / sunken
pits from the roll instead of only the VP3 jitter + finale dais.

### Behavior
1. A `parseSideTerrain(side, room)` (in place-spatialize.js or a small pure helper): keyword-scan the
   prose (raised/dais/platform/step-up/elevated/gallery/balcony → tier **+1**; sunken/pit/pool/below/
   lower/recess → tier **−1**; else 0), pull the footprint (`N' x N'` / `N' diameter` → cell extent)
   and location cue (central / one corner / along a wall) → a `terrain:[{cells:[{x,y}...], tier, kind}]`
   entry on the room (the DUNGEON-GRAPH U6 shape). Deterministic placement of the terrain patch (a
   stable hash of `walkId+segNum+"side"`, never `rng()` at a new call site that shifts the seed stream).
2. Stamp the tier onto the plan's FLOOR cells for that patch (a parallel per-cell tier the render seam
   reads), so `interiorBuildBoard`/the theater-boot shellCell builder (:8706, currently `tier` from VP3
   `sy` only) folds `side` tiers in. Do NOT disturb the finale-dais path (itrDaisCellsFor) — additive.
3. Behind `SPATIAL_SHAPES` (shared flag). Missing/unparseable `side` → no terrain (flat room), never throw.

### Out of scope (C2)
Non-rect shapes (C3); the AO-gradient fast-path extension (note it — the compiler's grid-tessellation
AO path only fires for axis-aligned rects, :409; a raised sub-rect still is one, so C2 is usually fine).

### Verify — `dev/verify-stage-c-terrain.mjs` (plain Node + a render assertion via the room-shell test seam)
1. ⊗ RED-FIRST: a `side:"15' x 15' central raised dais (3 ft high)"` roll → a +1-tier 3×3 patch of cells
   at the room center; the C4 compiler emits a riser between tiers (reuse verify-room-shell's tier
   assertions). (Red-first: OFF → flat room, no tier.)
2. sunken: `side:"...sunken pool (3 ft deep)"` → a −1 tier patch.
3. determinism + flat-fallback + finale-dais-unbroken (the existing dais still renders).
Regression: verify-room-shell (tier/riser checks), verify-dungeon-interior 287/0, the C1 harness still
green. check-manifest OK.

---

## C3 — REAL SHAPES (RM-3) [off C2 tip; the headline unit]

`areaType` archetype → a non-rectangular cell footprint (rotunda/octagon/oval → radial; L/T/cross →
composite rects; cave/cavern/natural/fissure → irregular orthogonal blob), + exits derived FROM the
polygon faces. Feeds the C4 compiler's arbitrary-contour path directly.

### Behavior
1. `shapeForArchetype(areaType)`: substring-classify the archetype NAME (Rotunda/Round → circle;
   Octagon → octagon; Oval → ellipse; L-Shaped → L; T-Shaped → T; Cross → cross; Cave/Cavern/Natural/
   Fissure/Chasm/Lava → cave; else → rect). Returns a `shape` tag (the DUNGEON-GRAPH U6 enum:
   `rect|circle|octagon|ellipse|L|T|cross|cave`).
2. `rasterizeShape(shape, wCells, dCells, seed)`: fill the room's cells to the shape within the C1
   bbox — a staircased orthogonal approximation the compiler's contour tracer already handles
   (circle/octagon/ellipse = radial inclusion test; L/T/cross = subtract corner rects; cave = a
   seeded orthogonal blob within the bbox, deterministic). Emit these as the room's FLOOR cells in
   `plan.cells` (replacing the filled rect) + `rooms[].shape` + `rooms[].cells`.
3. **Exits from polygon faces:** derive door cells from the shape's boundary faces/arcs (one exit per
   `segment.exits[]` edge → a boundary cell on a chosen face, stable-hashed), replacing the
   corridor-hits-rectangle door placement (`dspExitDoorCell`/the plan `doors[]`, :240-347). Bind each
   door to its `segment.exits[]` edge (`toSeg`). Keep corridors connecting to the chosen boundary cell.
4. Behind `SPATIAL_SHAPES`. A `rect` archetype → today's behavior exactly (regression-safe). AO-gradient
   caveat: non-rect footprints fall back to plain ear-clip (no per-cell AO gradient, theater-room-mesh.js
   :409/603) — either extend that path to sample per-triangle, or accept the flat-lit non-rect floor for
   this wave and note it (RECOMMEND accept + note; extending AO is a Stage-E material concern).

### Out of scope (C3)
Vertical stair two-slot connections (DUNGEON-GRAPH — later); the AO-gradient extension (Stage E);
per-realm shape skinning; smoothing the staircased contour (the compiler's bevel already softens it).

### Verify — `dev/verify-stage-c-shapes.mjs` (plain Node) + a CAPTURE gate (real Chrome)
1. ⊗ RED-FIRST (the BW5 SEAM 2 test): feed a "30′ diameter Rotunda" → the room's FLOOR cells form a
   radial/round footprint (a cell-count + boundary-non-rectangularity assertion), NOT a filled rect.
   (Red-first: OFF → filled rect.)
2. octagon → 8-face boundary; L-Shaped → an L footprint (a subtracted corner); cave → irregular
   (boundary is non-convex, deterministic per seed).
3. exits: N `segment.exits[]` → N door cells, each ON the polygon boundary (not interior), each bound
   to its `toSeg`; a rect archetype still places doors as today.
4. determinism; rect-archetype byte-identical to `SPATIAL_SHAPES` OFF.
5. **CAPTURE gate (I read it):** render a real rolled octagon room + a rotunda + an L-room through the
   theater interior; the shells must READ as those shapes (not rectangles). Shoot via the interior/
   loop capture tooling; give paths. A harness can't judge "reads as an octagon" — the orchestrator will.
Regression: the FULL plan/mechanics/interior suite — place-spatialize 9/9, place-semantics 26/26,
walkbind 20/20, combat-cells, dungeon-interior 287/0, verify-room-shell, the loop gate 5/5. Any move =
red-first fixture update, never a behavior weakening. check-manifest OK.

## Decisions (grounds recorded)
- **Shape in the logical plan, not render-only** — combat/placement/pathing must match the real shape
  (DUNGEON-GRAPH U6 / BW5 SEAM 2 ruling). `SPATIAL_SHAPES` flag makes it reversible during migration.
- **Staircased orthogonal approximation** — the C4 compiler traces an arbitrary ORTHOGONAL contour and
  bevels the steps; we do not build true curved geometry (a circle is a fine-stepped orthogonal ring).
- **Prose parsing, deterministically** — `dims`/`side` are freetext; parse them with named regex/keyword
  scans on the seed, never a new `rng()` call that shifts the stream.
- **AO-gradient on non-rect floors deferred to Stage E** — accept flat-lit non-rect floors this wave.
- **Coordinate frames** — spatializer rooms are `x/y` (grid plane); the C4 compiler cells are `x/z`
  (world plane). The existing floorList→shellCells mapper (theater-boot.js:8706) already bridges them;
  C3's plan cells stay in the plan's `x/y` convention.

## Cross-lane note (parallel Codex session)
Codex's active sprite/dressing lane has uncommitted changes to `src/ui/theater-interior.js` (a file Stage
C's C1/C2 may lightly touch for the cell-iteration). Keep Stage C's theater-interior.js touches minimal +
localized; serialize the master merge (`git fetch && git merge origin/master` before landing). Stage C's
primary surface (`place-spatialize.js`) is NOT in Codex's lane — prefer keeping changes there.

## Wave close
After C3: re-shoot + READ the octagon/rotunda/L captures + frame `12`/`19` approximations; run the plan/
combat/interior regression suite; `/genesis-clean-close` (mark Stage C complete in GRAPHICS-NORTH-STAR;
tick DUNGEON-GRAPH U6 RM-1/2/3; note the AO-gradient + vertical-stair follow-ons).
