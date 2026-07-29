# THE STANDEE CONTRACT FOR NON-FLAT TERRAIN

**What area of a 5-ft tactical cell must be protected so a standee stands cleanly, once cells stop
being flat cubes.**

Measured 2026-07-28 in `/Users/adamstephenson/Desktop/Work/projects/Genesis/Genesis-terrain`
(read-only session; no file in the worktree was changed, nothing committed). Every number below
either came out of a source file, out of a banked capture receipt, or out of a script that runs the
**real** `THREE.ExtrudeGeometry` the game uses — none are estimated. Scratch scripts:
`…/scratchpad/base-geom.mjs`, `…/scratchpad/contract-math.mjs`.

Units: **1 world unit (wu) = 1 cell = 5 ft.** Vertical quantum h = 0.5 wu = 2.5 ft.

---

## 0. THE SHORT VERSION

| question | answer |
|---|---|
| protected area, Medium | **a disc 0.932 wu (4.66 ft) across, centred on the stand point** — 93% of the cell |
| why a disc and not a rectangle | the base child rotates with the standee's **camera-facing yaw**, so its rectangle sweeps a circle |
| sloped cells | **tilt the base to the cell's own top plane; keep the sprite vertical.** Every flat-plant option buries or floats the plinth by 0.09–0.43 wu on a 1h/cell slope |
| tri-split cells | **a Medium standee cannot stand inside one half-cell triangle at any yaw.** Small and Tiny can |
| 1/9 corner blocks | intrude **0.230 wu (1.15 ft)** into the protected disc at free yaw. Largest compatible corner block is **≈1/6 of a cell edge (0.85 ft)**, not 1/3 — and only if it stays **below** the cell's top plane |
| stairs | **proof exists and it is legal today — by 0.002 wu.** See §5 |
| gateable failure signals | **11**, all countable off geometry already in the scene graph |

---

## 1. THE MEASURED INPUTS (and where each came from)

### 1.1 The grid law
`src/engine/terrain-field.js:36` `TERRAIN_GRID_LAW` — cellFeet 5, cellWorldUnits 1,
verticalQuantumFeet 2.5, verticalQuantumWorldUnits 0.5, storeyQuanta 4, maxWalkableSlopeDeg 30,
walkableStepQuanta 1 (= 26.565°), faceStepQuanta 2. Mirrored at
`src/engine/clay-room.js:781` (`CLAY_STRUCTURE_KIT_CATALOG.gridLaw`);
`dev/verify-terrain-bench.mjs` asserts the two agree.

### 1.2 The base — authored numbers
`src/ui/theater-standee-mount.js`:

| symbol | value | line |
|---|---|---|
| `INTERIOR_BASE_HEIGHT` | 0.09 wu (0.45 ft) | 91 |
| `INTERIOR_BASE_TREAD_DEPTH` | 1/3 wu (1.667 ft) | 92 |
| `INTERIOR_BASE_Y_OFFSET` | 0.006 wu | 93 |
| `INTERIOR_POOL_Y_OFFSET` | 0.003 wu | 442 |
| `STANDEE_SUPPORT_CLEARANCE` | 0.035 wu | 244 |
| base depth ladder | Tiny 0.18 · Small 0.26 · everything else 1/3 | 111 |
| width bound | `max(depth×1.35, min(tacticalSpan×0.82, renderedWidth×0.82))` | 112–114 |
| contact law | `interiorStandeeContactY(floorTop) = floorTop + 0.006 + 0.09 = floorTop + 0.096` | 188 |

`STANDEE_SIDE_SHELL_THICKNESS` = 0.035 (`src/ui/theater-sprites.js:331`) — the card's own physical
thickness, which is what makes a non-camera-facing standee read as a box (see §1.6).

### 1.3 The base rectangle, MEASURED per envelope
Widths are not free parameters — they are set by each sprite's rendered width. The measured values
are banked in `dev/clay-captures/cl-r2-sprite-citizenship/cl-r2-sprite-citizenship-measurements.json`
(`rows[].supportWidthCells` / `supportDepthCells`). The **rendered bounding box** is bigger than the
nominal rectangle because `interiorBaseGeoFor` builds a bevelled `ExtrudeGeometry`
(`bevelSize = min(0.018, radius×0.18)`, `bevelThickness = 0.012`); the bbox below is what the real
three.js geometry produces:

| envelope | witness | nominal w × d | **rendered bbox w × d** | bbox Ymin / Ymax |
|---|---|---|---|---|
| Tiny (0.5 span) | blind cave rat | 0.243 × 0.180 | **0.2570 × 0.1940** | −0.102 / +0.012 |
| Small | winged kobold urd | 0.4441 × 0.260 | **0.4697 × 0.2856** | −0.102 / +0.012 |
| Medium (human) | human fighter | 0.7081 × 0.3333 | **0.7441 × 0.3693** | −0.102 / +0.012 |
| Medium (cap) | wraith / flaming skeleton | 0.820 × 0.3333 | **0.8560 × 0.3693** | −0.102 / +0.012 |
| Large (cap) | — | 1.640 × 0.3333 | **1.6760 × 0.3693** | −0.102 / +0.012 |
| Huge | treant | 2.460 × 0.3333 | **2.4960 × 0.3693** | −0.102 / +0.012 |
| Gargantuan | kraken | 3.280 × 0.3333 | **3.3160 × 0.3693** | −0.102 / +0.012 |

**Two facts the authored constants hide, and both matter:**

1. **The plinth's real bottom is 0.102 wu below the standee's origin, not 0.09** (bevelThickness
   0.012 hangs below the extrusion). So the production contact law
   (`figure.position.y = floorTop + 0.096`, used by `clayTerrainPlaceWitness`,
   `src/ui/theater-clay-room.js:4095`) actually **embeds the plinth 0.006 wu into the ground.**
   The stair/perch path uses a different law —
   `clayRoomStructureStandeeOriginYForSurface` (`theater-clay-room.js:1773`) measures the real bbox
   and sets origin = surfaceY + 0.006 + 0.102, which **floats** the plinth 0.006 wu above.
   **There are two contact conventions in the codebase, 0.012 wu apart.** On flat ground nobody
   notices. On a slope they diverge visibly. Pick one before the slope work starts.
2. The plinth's top pokes **0.012 wu above** the feet-line, so the sprite's bottom row of texels is
   always slightly inside the plinth. That is what makes contact read; keep it.

### 1.4 The contact pool is a SECOND, larger footprint
`addInteriorContactBlob` (`theater-standee-mount.js:443`): `poolRadius = width × 0.48 × 1.55`, quad
side `= poolRadius × 2`, `scale.y = depth/width`. So the pool is **1.488 × the base** on both axes:

| envelope | pool W × D | pool disc dia | vs its own tactical span |
|---|---|---|---|
| Tiny | 0.362 × 0.268 | 0.450 | fits (0.5 span) |
| Small | 0.661 × 0.387 | 0.766 | fits |
| **Medium** | 1.054 × 0.496 | **1.165** | **overflows the cell by 16.5%** |
| **Medium cap** | 1.220 × 0.496 | **1.317** | **overflows by 31.7%** |
| Large / Huge / Garg | — | 2.490 / 3.694 / 4.906 | overflow by 24.5 / 23.1 / 22.6% |

It is a **horizontal** quad (`syncStandeeContactBlob` hard-sets `rotation.x = −π/2`,
`theater-standee-mount.js:365`) pinned to one Y. On flat ground the multiply-identity white rim
makes the overflow invisible. On a slope, a tread, or a chamfered corner it does not: a flat quad
1.22 wu wide over sloping ground penetrates/floats by ±0.303 wu (1.52 ft). **The pool will break
before the plinth does.** It must be treated as part of this contract, not as a decoration.

### 1.5 The base's YAW — the single most important fact in this document
`updateSpriteBillboardYaw` (`src/ui/theater-sprites.js:565`):

```
const yaw   = S.rotationStep*90° + CAM_YAW_OFFSET_DEG(45°);
const facing = yaw + 180°;
fig.rotation.y = facing + kilterRad + viewOffset;      // the BASE is a child of fig
```

The plinth is a plain child of the outer figure group, so **the plinth turns with the camera-facing
yaw.** The clay camera bearing is 45° (measured off the banked receipt, §1.7), so in the ordinary
production case **the plinth sits diagonal to the cell axes**, not square to them.

The *only* escape is `claySupportWorldYaw`: when set, lines 598–606 counter-rotate the base child so
the plinth holds a world yaw while the card keeps facing the camera. That is exactly what
`clayRoomStructureSupportLock` (`theater-clay-room.js:1729`) does for stair parking — and it is the
reason a standee can stand on a tread at all (§5).

So there are **two yaw regimes**, and they give two different protected areas:

* **FREE yaw** (production default): protected area = the **circumscribed circle** of the base bbox.
* **LOCKED yaw** (support-lock set): protected area = the axis-aligned base **rectangle**.

The kilter (`KILTER_YAW_DEG` 4°, `KILTER_POS_FRAC` 0.06, `theater-boot.js:2436`) adds ±4° of yaw and
±0.06 wu of position jitter — but only on the **flat-tabletop unit path** (`theater-tabletop.js:787`)
and **dressing cards** (`theater-dressing.js:239`). Interior pieces and terrain witnesses carry no
kilter. If kilter is ever extended to interior/terrain standees, add 0.06 wu to every protected
radius below and the Medium-cap disc (0.466 + 0.06 = 0.526) **exceeds the half-cell**.

### 1.6 A defect found while measuring — the terrain witnesses never face the camera
`updateSpriteBillboardYaw`'s interior sweep (lines 637–646) walks **exactly two levels**:
`interiorGroup.children[i].children[j]`. The terrain bench mounts
`S.interiorGroup.add(group)` (`theater-clay-room.js:4536`), and a witness lives at
`group → fieldBuild.group → figure` — **three** levels down. So `face()` never reaches it: the
witness keeps `rotation.y = 0`, grid-aligned, and never billboards.

This is visible in the banked frame:
`dev/clay-captures/cl-f07a-terrain-bench-v001/01-thirteen-piece-sheet-02-settled-production.png`
shows every witness with its **side shell exposed as a rectangular box outline** — the read you only
get from a card that is not camera-facing. (`mountedStandeeFigures` uses a deep `traverse`, so
collision and blob-sync *do* reach them; only facing does not. That asymmetry is the tell.)

**Consequence for this contract:** every banked terrain proof so far exercised the *easy*
(axis-aligned) base yaw. **No banked capture in this repo shows a free-yaw, diagonal plinth on
terrain.** Any contract we set must be proved against the free-yaw case, not against these frames.

### 1.7 The two cameras (measured off `01-thirteen-piece-sheet-receipt.json`)

| read | pitch | bearing | fov | dist | scale |
|---|---|---|---|---|---|
| production | **35.000°** | 45.000° | 20 | 115.985 | 35.2 px per wu |
| strategic | **72.000°** | 45.000° | 20 | 107.369 | 38.0 px per wu |

(`clayRoomApplyCamPose`, `theater-clay-room.js:6355`, pins the strategic pitch at exactly 72°.)
At these poses **0.01 wu ≈ 0.35 px.** That sets the visibility floor: a 0.006 wu contact offset is
0.2 px and can never be seen; a 0.2 wu gap is 7 px and always can.

---

## 2. §1 — THE PROTECTED AREA

> **THE CONTRACT.** A standee stands cleanly on a cell only if, centred on its stand point, the cell
> presents a **flat, horizontal-or-uniformly-inclined, unbroken support surface** of at least the
> radius below, **and** nothing rises above that surface inside it.

| envelope | FREE-yaw protected **disc diameter** | as fraction of its span | in feet | LOCKED-yaw protected **rectangle** (incl. 0.035 clearance) |
|---|---|---|---|---|
| Tiny | **0.322 wu** | 64.4% of a 0.5-cell | 1.61 ft | 0.278 × 0.215 |
| Small | **0.550 wu** | 55.0% of one cell | 2.75 ft | 0.479 × 0.295 |
| **Medium (human)** | **0.831 wu** | **83.1%** | **4.15 ft** | 0.743 × 0.368 |
| **Medium (cap)** | **0.932 wu** | **93.2%** | **4.66 ft** | 0.855 × 0.368 |
| Large | **1.716 wu** | 85.8% of 2 cells | 8.58 ft | 1.675 × 0.368 |
| Huge | **2.523 wu** | 84.1% of 3 cells | 12.62 ft | 2.495 × 0.368 |
| Gargantuan | **3.337 wu** | 83.4% of 4 cells | 16.68 ft | 3.315 × 0.368 |

**The headline number: 0.932 wu — 93% of the 5-ft cell — for the worst Medium.** The residual free
ring around the cell edge is **0.034 wu (0.17 ft, ~2 inches).**

**Second contract, from §1.4:** the contact pool needs a *coplanar* support out to **1.317 wu**
(Medium cap) — larger than the cell. It cannot be satisfied by one cell. Two ways out, and one must
be chosen: (a) clip the pool to the real support polygon (the ART-DIRECTION-CANON rule for the
tactical grid, §"non-cell-sized tops are clipped to their actual support polygon", already law for
the grid overlay — extend it to the pool); or (b) shrink the pool multiplier from 1.488 toward 1.0.
(a) is better: it is the same clipping the grid overlay already owes.

**Why this is the number that kills every sub-cell idea.** Whatever sub-cell expression you invent,
it gets to touch a ring 0.034 wu wide at free yaw, or 0.066 wu at locked yaw on the depth axis. A
3×3 subdivision hands you cells of 0.333 wu. The two scales are an order of magnitude apart.

---

## 3. §2 — SLOPED CELLS

Case: a cell top inclined by one walkable quantum across one cell — 0.5 wu rise over 1.0 wu run,
**tan θ = 0.5, θ = 26.565°** (`terrainSlopeDegForStepH`, `terrain-field.js:62`). This is the steepest
walkable single-cell step the chassis can emit; the 30° limit allows a further 0.155h of headroom
(`TERRAIN_WALK_NOISE_BUDGET_H`, `terrain-field.js:57`).

**Note first: no terrain cell can incline today.** `clayTerrainBuildFieldGroup`
(`theater-clay-room.js:3905`) emits `new THREE.BoxGeometry(1, columnH, 1)` per cell — every terrain
cell is a **flat-topped square column**. A slope is expressed as a staircase of flat tops.

**But the inclined surface itself already exists — as a structure-kit atom, with no standee ever
placed on it.** `src/engine/clay-room.js:936`:

```
id: "shallow-ramp", kind: "ramp", label: "shallow ramp · 26.565°", width: 1.2, run: 1, rise: 0.5
```

Geometry: `clayStructureRampGeometry` (`theater-clay-room.js:1042`) — a 6-vertex wedge whose
`0,1,3 / 0,3,2` face is the declared walk surface. The traversability grid **is** projected onto it
(`theater-clay-room.js:5679–5697`, `report.rampSurfaces++`) and `dev/verify-clay-room.mjs:1849`
gates its pitch against the 30° law. **A figure has never been put on it.** That ramp is the
ready-made fixture for the slope proof (§8, P2) — the surface is built, gated and grid-projected;
only the standee is missing.

The one place a standee has met genuinely continuous sloped ground is
`dev/uneven-ground-proof/uneven-ground-proof.html:400–424` (`addStandee`), on a heightfield reaching
`maxSlopeDegrees: 33.635`. It is a bare `THREE.Sprite` at `y + 0.025` with **no plinth at all** and
a hard-horizontal shadow disc. It proves nothing about the base contract.

So: **zero existing evidence of a plinth on an inclined surface.**

### The four options, with their measured consequences

Half-extents used: 45° free yaw `(w+d)/2/√2`; worst locked `w/2` (long axis down the gradient);
best locked `d/2` (long axis across the gradient).

**(a) Plant the base flat at the cell CENTROID height.**

| envelope | yaw | uphill penetration | downhill gap | corner-to-corner |
|---|---|---|---|---|
| Medium cap | 45° free | **0.217 wu (1.08 ft)** | 0.217 wu | 0.433 wu (2.17 ft) |
| Medium cap | worst locked | 0.214 wu (1.07 ft) | 0.214 wu | 0.428 wu |
| Medium cap | best locked | 0.092 wu (0.46 ft) | 0.092 wu | 0.185 wu |
| Medium | 45° free | 0.197 wu (0.98 ft) | 0.197 wu | 0.394 wu |
| Small | 45° free | 0.134 wu (0.67 ft) | 0.134 wu | 0.267 wu |
| Large | worst locked | 0.419 wu (2.09 ft) | 0.419 wu | 0.838 wu (4.19 ft) |

The plinth is **0.114 wu tall in total.** So at every yaw except "long axis exactly across the
gradient", the uphill half of the plinth is **completely swallowed** and the downhill half is
**completely airborne** — 2–8 px of visible daylight under the downhill corner at the production
read. Reads as a coin pushed into mud at one end. **Reject.**

**(b) Plant flat at the DOWNHILL corner height.** Zero penetration; maximum gap = the full
corner-to-corner drop: **0.433 wu = 2.17 ft = 15 px** of air under a 0.45-ft plinth at the
production camera. This is exactly the "floating figure" defect the terrain lane already fixed once
(`theater-clay-room.js:4396–4403`, the R1-03 pinnacle note). **Reject.**

**(c) Plant flat at the UPHILL corner height.** Zero float; the whole plinth plus 0.32 wu of the
sprite's legs disappear into the hill, and the figure's feet-line sits 0.433 wu above the visible
ground at the downhill corner — reads as standing on an invisible box. **Reject.**

**(d) TILT the base to match the cell's top plane. ← RECOMMENDED.**

Set the plinth child's `rotation.x` / `rotation.z` (in its own `YXZ` order, after the existing
`rotation.y` write) so the plinth's top face is coplanar with the cell's declared top plane, with the
plinth's *centre* on the stand point. Result: **gap 0 and penetration 0 at every yaw and every
pitch**, by construction, because the plinth is now parallel to what it stands on.

Grounds:

1. **It is the only option with zero error.** (a)/(b)/(c) all carry 0.09–0.43 wu of error, i.e.
   3–15 px of visible defect at the production read.
2. **The wiring already exists and is free.** The plinth is deliberately a *plain sibling child* of
   the outer figure group and never a child of the sprite wrap — `buildInteriorBase`'s own header
   (`theater-standee-mount.js:191–204`) says so, and `updateSpriteBillboardYaw` writes only
   `child.rotation.y` on it. `.x` and `.z` on the **base child** are unused. The outer group's `.x`
   stays reserved for `standee-verbs.js`'s fall-death tip; the sprite's camera-pitch tilt stays on
   `standeeWrap`. Three rotation budgets, three owners, no collision.
3. **The sprite must NOT tilt.** A 26.565° lean on a standing human reads as falling over. Keeping
   the card vertical while the plinth conforms is what a real miniature on a wedge base does, and it
   is exactly the read the ART-DIRECTION-CANON asks for ("Runtime geometry owns the plinth, thin
   side shell, contact shadow", line 81).
4. **STRUCTURE-KIT-CATALOG already promises this.** §2, lines 64–65: *"The visual proof rides the
   standee-base rework (bases are being reworked to sit on sloped surfaces without looking broken);
   that lane owns the look and Adam gates it."* This is that lane; the ruling is already scoped.
5. **Forbidding standing on sloped cells is not available.** Sloped tops that are non-standable
   would delete walkable hills — the chassis's whole premise ("hills and cliffs are the same
   generator with one clamp changed", `terrain-field.js:11`). That is a gameplay change, not a
   render change.

**A green harness currently asserts the opposite — and (d) slips past it, which is the problem.**
`dev/verify-bw2-2-floor-contact.mjs:581` asserts `result.figRotationXBeforeTip === 0` under the
title *"the base's world-up stays +Y (outer group rotation.x === 0) while the sprite's inner wrap
alone carries the nonzero camera-pitch tilt"*. Recommendation (d) puts the tilt on the **base
child's own** `rotation.x`/`.z`, so that assertion **stays green while the base is tilted** — it
would be checking a proposition that no longer means what it says. The harness must be **extended**
in the same change: assert that the base child's world-up equals the **support plane's normal**, not
that the outer group is upright. A gate that silently stops covering its subject is worse than one
that fails.

**What (d) costs — three riders that must ship with it:**

* **The contact pool must tilt too.** `syncStandeeContactBlob` hard-sets `rotation.x = −π/2`. On a
  26.565° slope an untilted pool 0.496 wu deep penetrates/floats ±0.303 wu (1.52 ft, 11 px).
* **The stand point's Y must be the cell-top plane evaluated AT the stand point**, not the cell's
  integer `h`. Today `clayTerrainCellWorld` returns `baseY + (c.h + c.sub) × 0.5` — one scalar per
  cell. A sloped cell needs a plane (or at minimum a per-cell gradient), so the field must publish
  one. That is a chassis addition, not a renderer trick.
* **Adjacent-cell consistency.** Two standees on adjacent sloped cells must read at heights that
  differ by exactly the ground's own difference — see failure F8, §7.

**Where the tilt must stop.** A guarded slope (>1h/cell) is already non-standable
(`terrain-field.js:549`), so the tilt never has to exceed 30°. Cap the base tilt at
`maxWalkableSlopeDeg` and treat any request above it as a bug rather than clamping silently.

---

## 4. §3 — TRI-SPLIT CELLS (one cell, two triangles at different pitches)

Geometry: the split runs corner-to-corner, so each triangle is a right isoceles triangle with legs
1.0 and hypotenuse √2 = 1.414. Its **inradius is (1 + 1 − √2)/2 = 0.2929 wu**, so the largest disc
that fits inside one triangle is **0.586 wu across**, centred 0.293 wu in from the right-angle
corner.

### Can a standee stand on one triangle?

| envelope | needs (free-yaw disc) | inscribed disc 0.586 | locked along the hypotenuse (have 0.676) | locked along a leg (have 0.631) |
|---|---|---|---|---|
| Tiny | 0.322 | **FITS** | FITS | FITS |
| Small | 0.550 | **FITS** (by 0.036) | FITS | FITS |
| **Medium (human)** | 0.831 | **NO** | NO (need 0.744) | NO (need 0.744) |
| **Medium (cap)** | 0.932 | **NO** | NO (need 0.856) | NO (need 0.856) |

**A Medium standee does not fit inside one half-cell triangle at any yaw — not free, not locked to
the hypotenuse, not locked to a leg.** The margin is not close: 0.83 needed against 0.59 available.

### What breaks

1. **The fold runs under the stand point.** A corner-to-corner split passes exactly through the cell
   centre. Any base seated at the cell centre straddles it. A single-plane plinth on a fold either
   penetrates the steeper triangle or floats over the shallower one. If the two pitches differ by
   one walkable quantum, the error at the plinth's corners is 0.11–0.22 wu — the same magnitude as
   §3(a), which we rejected.
2. **Two stand points, or one?** If each triangle is independently standable, the cell mints **two**
   5-ft footprints out of one cell — the exact thing STRUCTURE-KIT-CATALOG §2 forbids ("a sub-cell
   object top does not mint a false 5×5-ft occupancy cell", line 73) and the exact thing
   `terrainSupportGraphReport` currently certifies as zero (`subCellSurfaces: 0`,
   "no sub-cell surface mints a footprint in rung 1", `terrain-field.js:816–817`). **It would change
   the walkable-cell count. That is a GAMEPLAY change, not a cosmetic one.**
3. **Stand points would have to move off centre** to the standable triangle's incentre — 0.293 wu
   from the corner, i.e. **0.207 wu off cell centre**. Every downstream thing that assumes "the
   standee is at the cell centre" (route overlay `clayTerrainCellWorld`, the OBB collision sweep, the
   contact pool, the tactical grid overlay, targeting) would need the same offset or would disagree
   with the picture.

### What would have to be true for it to work

Exactly one of these, and each is a real decision:

* **(A) Visual relief only — RECOMMENDED.** The cell declares **one** stand plane (a single tilted
  plane through the cell centre, at the walkable pitch). The tri-split is a *sub-quantum surface
  break-up* of that plane — the mechanism `noiseAmplitudeH` / `TERRAIN_WALK_NOISE_BUDGET_H` already
  provides, budgeted at 0.155h so it can never change a tier. The two triangles differ visually but
  the support the standee stands on is the declared plane. Zero gameplay change, zero new footprint,
  and the FFT read is preserved because FFT's diagonal tiles are mostly *visual* too.
* **(B) One triangle standable, one guarded.** Legal, but Medium+ still does not fit (0.83 > 0.59),
  so the cell becomes standable only for Small and Tiny — a size-gated cell, which is a new tactical
  concept and needs its own ruling.
* **(C) A conforming (bent) plinth.** A two-plane base that folds along the split. Genuinely new
  geometry, new collision math, and the sprite's feet-line still only touches at one point. Reject
  for now; revisit only if Adam wants the fold visible under the figure.

---

## 5. §4 — SUB-CELL CORNER BLOCKS (Adam's "1/9 sized block")

Reading: a 3×3 subdivision of the 5-ft cell, so **one sub-cell = 5/3 ft = 1.6667 ft = 0.3333 wu**,
and a corner sub-cell occupies `[0.1667, 0.5]` on both axes measured from the cell centre.

**Its inner corner is 0.2357 wu (1.18 ft) from the cell centre.**

### Does it intrude on the protected area? Yes, deeply, at free yaw.

| envelope | protected radius | intrusion at FREE yaw | intrusion at LOCKED yaw (depth axis) | locked overlap per corner |
|---|---|---|---|---|
| Small | 0.275 | 0.039 wu (0.20 ft) | **none** (−0.024) | 0 |
| **Medium (human)** | 0.415 | **0.180 wu (0.90 ft)** | 0.018 wu (0.09 ft) | 0.0037 wu² — 5.4% of base area |
| **Medium (cap)** | 0.466 | **0.230 wu (1.15 ft)** | 0.018 wu (0.09 ft) | 0.0047 wu² — 6.0% of base area |

**At free yaw a 1/9 corner block cuts 1.15 ft into the protected disc — that is a quarter of the
plinth's diagonal half-width.** If the corner *rises*, a plinth corner is buried in it; if the corner
is *removed*, a plinth corner hangs over nothing.

**The largest corner block that a free-yaw Medium tolerates** (inner corner must sit at or beyond
the protected radius: `s ≤ 0.5 − R/√2`):

| envelope | max corner block edge | in feet | as a fraction of a cell edge |
|---|---|---|---|
| Medium (cap) | **0.170 wu** | **0.85 ft** | ≈ **1/6** |
| Medium (human) | 0.206 wu | 1.03 ft | ≈ 1/5 |
| Small | 0.306 wu | 1.53 ft | ≈ 1/3 (a 1/9 block *just* works) |
| Large / Huge / Garg | **negative** | — | **no corner block of any size** on the cells under a multi-cell base |

So the answer to Adam's question is: **the instinct is right, the size is about half.** Corner
softening at **1/6 of a cell edge (0.85 ft, a 6×6 subdivision)** clears a free-yaw Medium.
**1/3 (a 3×3 subdivision) does not.**

### The compatibility rule that makes it work at ANY size

The intrusion above is only real if the corner treatment touches the **top plane**. Restate it as a
law and the whole problem evaporates:

> **CORNER SOFTENING LIVES BELOW THE TOP PLANE.** A cell's top surface stays a full, unbroken 1×1
> plane. Corner treatment is a chamfer/bevel/round of the **vertical corner where two exposed faces
> meet**, beginning at or below the top edge and cutting downward and outward. It never removes,
> raises, or lowers any part of the top plane.

Under that rule a 1/9 corner (or any size) intrudes **0.000 wu** on the protected area, softens
exactly the silhouette Adam is looking at, and is provably **COSMETIC**.

### Does it change the walkable-cell count?

**This is the distinction that decides whether it is a render change or a game change, and it must
be stated in the ruling:**

| corner treatment | walkable-cell count | classification |
|---|---|---|
| chamfer strictly **below** the top plane | unchanged — the top plane is untouched, `standable` is untouched, `walkAdj` is untouched | **COSMETIC** |
| corner sub-cell **lowered or raised** to a new datum, non-standable | unchanged *count*, but the usable top shrinks to a 0.333 wu centred square — **below the 0.932 wu a Medium needs**, so every Medium cell silently becomes un-standable-in-practice while still reporting `standable: true` | **GAMEPLAY (a lie)** |
| corner sub-cell becomes its **own** standable surface | count rises by up to 4× — `terrainSupportGraphReport.subCellSurfaces` stops being 0, footprints multiply, `walkEdges` changes, reachability changes | **GAMEPLAY** |

The middle row is the dangerous one: it changes nothing that the current gates count while making
the game unplayable at Medium. **Add the protected-radius check (F10) to the gate before any
sub-cell top-plane work, or this failure ships green.**

**The project already has the precedent for the ruling above, and it is exactly the right shape.**
`docs/STAGE-C.md:224–227` (C3b diagonal wall faces), verbatim: *"Hard constraint (unchanged from
C3): the LOGICAL cell grid never moves. `place-spatialize.js` is untouched by C3b entirely — …
combat/placement/pathing/determinism read that grid and never see a curve or a diagonal. C3b is a
RENDER-ONLY refinement."* And `docs/STAGE-C4.1c-FLOOR-CONGRUENCE.md:18–20`: *"Render-only. Logical
cells, cellTriangleMap …, tier elevations, combat geometry, and door placement are all
byte-identical."* Corner softening should be filed under the same law: **a render-only refinement
that never moves the logical grid, proved byte-identical rather than argued.**

The enforcing check already exists in one place: `dev/verify-terrain-bench.mjs:371`
`check("14c. no sub-cell surface mints a false 5-ft footprint", s.subCellSurfaces === 0)`. It is
currently green because nothing has tried. It is the right gate; it just needs the standableCells /
walkEdges diff beside it (F11).

---

## 6. §5 — STAIRS: THE NAMED GAP

### Does the proof exist? **YES. It exists, it is banked, and it is both visual and numeric.**

Adam is right that he has not been *shown* it — but it is in the repo.

**Visual:** `dev/clay-captures/cl-r3-continuity-stairs-mood-v12/02e-standee-balanced-on-stair.png`
(also `…-v10/`, `…-v11/`). A human-fighter standee stands on tread 2 of a three-tread flight with its
plinth visible under its feet. (The bytes are LFS-hydrated in the sibling worktree
`/Users/adamstephenson/Desktop/Work/projects/Genesis/genesis/…`; in `Genesis-terrain` this path is a
pointer file.) Sibling frames: `02b/02c-second-storey-stair-proof*`, `02d-straight-two-cell-storey-proof`,
`02f-l-storey-three-cell-proof`, `04a-inner-corner-stair-close`, `04b-outer-corner-stair-close`.

**Numeric:** every `cl-r3-structure-bench-receipt.json` from v10 through v18 carries
`stairParkingProbe.structure.parking` — nine identical receipts, produced by
`clayRoomStructureParkingAudit` (`theater-clay-room.js:1789`):

```
specId "assembly-story-lower-stair", stepIndex 1 of 3, axis "z", supportWorldYawDeg 0
tread   { along 0.37333, cross 1.0, logicalDepth 0.33333 }
support { along 0.33333, cross 0.70811, alongMargin 0.02, crossMargin 0.14594,
          baseBottomClearance 0.006 }
centered true · baseBottomOnSurface true · balanced true · clipsTreadEdge false
```

Backed by `dev/clay-captures/cl-r2-sprite-citizenship/…-measurements.json`:
`support.everySupportFitsTread: true`, `mediumSupportEqualsOneTread: true`, and per-view
`supportToTreadRatio: 1` at face / three-quarter / edge.

### Is it legal today? **Yes — by 0.002 wu. Marginal is an understatement.**

What the base needs vs. what the stair provides:

| | value | source |
|---|---|---|
| stair unit footprint | 1 cell, rise ≤ 5 ft | `CLAY_STRUCTURE_KIT_CATALOG.gridLaw.stairAdapter`, `clay-room.js:787` |
| authored steps per unit | 3 (2 for the 2-ft unit) | `clay-room.js:882–916`, `run: 1, steps: 3` |
| **logical tread depth** | `run/steps` = **0.33333 wu = 1.667 ft** | `theater-clay-room.js:1369` |
| **rendered tread box depth** | **0.37333 wu** (`tread + 2 × CLAY_STRUCTURE_CONTACT_EMBED 0.02`) | `theater-clay-room.js:1380–1381`, `1248` |
| Medium base **nominal** depth | 0.33333 | `INTERIOR_BASE_TREAD_DEPTH` |
| Medium base **rendered bbox** depth | **0.36933** (bevel adds 0.036) | measured, §1.3 |

| envelope | margin/side vs **rendered** tread | margin/side vs **logical** tread |
|---|---|---|
| Tiny | +0.0897 wu (0.45 ft) | +0.0697 |
| Small | +0.0439 wu (0.22 ft) | +0.0239 |
| **Medium / Medium cap** | **+0.0020 wu (0.010 ft ≈ 1/8 inch)** | **−0.0180 wu — the bevel overhangs** |

**Three honest consequences:**

1. **The parking audit overstates the margin by 10×.** It measures `userData.interiorBaseDepth`
   (0.33333, the *nominal* rectangle) against the tread, giving `alongMargin: 0.02`. Against the
   **rendered** bbox (0.36933) the real margin is **0.0020 wu**. The audit is not wrong about
   pass/fail, but it is not measuring the geometry that is drawn. Fix: measure the base's
   `Box3` (the same thing `clayRoomStructureStandeeOriginYForSurface` already does), not the
   authored scalar.
2. **It passes only because the tread box is inflated.** The 0.02 contact-embed per edge exists to
   kill a shadow slit (`theater-clay-room.js:1377`), not to hold a standee. On the *logical* tread
   the base's bevel already overhangs by 0.018 wu per side. The margin is an accident of an
   unrelated fix.
3. **It passes only because the yaw is LOCKED.** With the ordinary free (camera-facing, 45°) yaw the
   Medium-cap plinth's along-tread extent is `(0.856 + 0.369)/√2 = 0.866 wu` against a 0.373 wu
   tread — **0.247 wu (1.23 ft, 9 px) of plinth hanging off each side**. `clayRoomStructureSupportLock`
   is not a nicety; it is the only thing standing between the game and that picture.

### What breaks it immediately

* **A 4-step stair on the same 1-cell run.** tread 0.25 → rendered 0.29 → Medium bbox 0.36933 →
  **−0.040 wu per side, clipping.** The stair adapter law (1-cell footprint, any rise to 5 ft) makes
  a 4-step unit a legal future variant.
* **Any stair whose run < 1 cell.** The corner-stair family already does this:
  `clayStructureCornerStair` sets `tread = size/steps` with `size = spec.run || spec.width` —
  `inside-corner-stair` has `run: 1.35, steps: 3` → tread 0.45 (safe), but a 1.0-run corner at 3
  steps gives 0.333, the same knife edge.
* **A stair nosing.** `stair-nosing` strips already exist (`theater-clay-room.js:3575–3584`,
  offset 0.09 below the tread top). A nosing that projects *forward* eats the tread depth.
* **Anything Large or bigger.** No envelope above Medium has ever been parked on a tread. Their
  base depth is the same 0.3333, so the along-axis is identical — but their *width* is 1.64–3.28 wu
  against a `spec.width` of 1–2 cells, so a Huge standee's plinth overhangs a 1-cell-wide flight by
  0.75 wu per side.

### The ruling this implies

> **A stair tread is a LOCKED-YAW support.** A standee may occupy a tread only with
> `claySupportWorldYaw` set to the tread axis. The minimum tread depth is the **base's rendered bbox
> depth plus a stated margin**, not the nominal base depth: **0.369 + 2×margin**. At a 0.03 wu
> margin that is **0.429 wu (2.15 ft)** — which a 1-cell run supports at **2 steps**, not 3, and
> never at 4. Either the stair adapter caps at 2 treads per cell, or the Medium base depth comes
> down from 1/3, or treads formally overhang (a real stair has a nosing; a 0.06 wu nosing buys back
> exactly the margin needed).

---

## 7. §6 — THE FAILURE CATALOGUE (11 gateable signals)

Every signal below is countable from geometry already in the scene graph. Suggested BLOCK
thresholds; all in world units.

| # | failure | what it looks like | **measurable signal** | BLOCK at |
|---|---|---|---|---|
| **F1** | base corner buried in a riser / uphill face | plinth corner disappears into the step above | `min over base bbox corners of (cornerY − supportPlaneY(corner))` — sample the support plane at each of the plinth's 4 bbox corners | < −0.002 |
| **F2** | base floating over a slope or a tread edge | visible daylight under the plinth at the 35° read | `max over base bbox corners of (cornerY − supportPlaneY(corner))` | > +0.012 (one bevelThickness) |
| **F3** | base overhangs the support polygon | plinth hangs in air past a nosing / chamfer / triangle edge | `overhangArea = area(baseFootprint) − area(baseFootprint ∩ supportPolygon)`, evaluated at the **rendered bbox**, not the nominal rect | > 0 (WARN), > 2% of base area (BLOCK) |
| **F4** | billboard intersects an uphill face | the card's lower texels vanish into the hill behind | `min over the card's bottom edge of (edgeY − terrainTopY at that xz)` sampled along the card's full rendered width | < 0 |
| **F5** | free-yaw plinth on a narrow support | the stair failure of §5(3): 1.23 ft of plinth in mid-air | `claySupportWorldYaw` **unset** while `supportPolygon.minWidth < baseBboxDiagonal` | any occurrence |
| **F6** | base tilt exceeds the walk law | a standee leaning past what the ground can legally be | `abs(baseTiltDeg) > TERRAIN_GRID_LAW.maxWalkableSlopeDeg` | > 30° |
| **F7** | sprite tilted with the base | the figure reads as falling over | `abs(standeeWrap.worldTiltDeg − CAM_ELEV_DEG)` — the card's tilt must stay the camera-pitch value and nothing else | > 0.5° |
| **F8** | adjacent standees at inconsistent heights | two figures on neighbouring sloped cells read as if on different ground | for every walk-adjacent standee pair: `abs((standeeAY − standeeBY) − (groundAY − groundBY))` | > 0.006 |
| **F9** | contact pool off its support | the soft shadow lies on air, or z-fights the tread below | `poolQuad.area − area(poolQuad ∩ supportPolygon)`; **and** pool normal ≠ support normal | > 0 area (WARN); normal mismatch > 0.5° (BLOCK once slopes exist) |
| **F10** | protected area not delivered | the cell claims `standable` but cannot actually hold the figure | for every `standable` cell: `largestInscribedDisc(cellTopPolygon, at the stand point) < protectedRadius(envelope)` | any occurrence |
| **F11** | sub-cell surfaces mint footprints | a cosmetic change silently became a gameplay change | `terrainSupportGraphReport.subCellSurfaces`, plus a **before/after diff of `metrics.standableCells` and `metrics.walkEdges` across the change** | `subCellSurfaces > 0`, or any delta in standableCells / walkEdges on a change declared cosmetic |

**F11 is the distinction Adam asked to have stated.** Corner softening, tri-split, and sub-cell
relief are **cosmetic** if and only if `standableCells` and `walkEdges` are byte-identical before and
after. The field already carries a `fingerprint` (`terrainFieldFingerprint`, `terrain-field.js:744`)
— but it folds `kind`, `surface` and `depthH`, so it will change for a purely visual edit. **A
second, walk-only fingerprint over `(standable, walkAdj)` alone would make "cosmetic" a single
comparable string** instead of a claim.

### What is already gated, with its real thresholds

| gate | file | threshold | live value |
|---|---|---|---|
| levitation | `dev/measure-clay-terrain-bench.py:44,490` | `WITNESS_MAX_GAP = 0.2` — *"0 refusals must also mean 0 levitations"* | `witnessMaxGap: 0.096` |
| witness footing | `clayTerrainSameHeightNeighbours`, `theater-clay-room.js:4043` | same-height standable orthogonal neighbours | banked 2 and 4 |
| base bottom on surface | `clayRoomStructureBaseClearanceAudit:1770` / `ParkingAudit:1841` | `clearance ∈ [−0.0001, 0.01]` | 0.006 |
| tread balance | `ParkingAudit:1842–1843` | `alongMargin ≥ −0.0001`, `crossMargin ≥ −0.0001` | 0.02 / 0.14594 |
| centering | `ParkingAudit:1839` | `< 0.001` | true |
| hard throw on stair parking | `dev/capture-clay-structure-bench.cjs:165` | throws unless `balanced && baseBottomOnSurface` | passes |
| base is floor-flat | `dev/verify-bw2-2-floor-contact.mjs:581` | `fig.rotation.x === 0` | 0 |
| no sub-cell footprints | `dev/verify-terrain-bench.mjs:371` | `subCellSurfaces === 0` | 0 |
| ramp within the slope law | `dev/verify-clay-room.mjs:1849` | `atan2(rise, run) ≤ 30°` | 26.565° |
| base dimensions | `dev/verify-dungeon-interior.mjs:925–928` | height 0.09, depth 1/3, width ≤ 0.82 | all hold |

**Every one of them measures against a horizontal `surfaceY`. Not one measures a normal, a tilt, or
a per-corner gap.**

**And the levitation gate is blind to the slope failure by construction.** `WITNESS_MAX_GAP = 0.2`
is tested against `standeeY − groundY`, which `clayTerrainPlaceWitness` sets to exactly 0.096 every
time (`theater-clay-room.js:4095`, `interiorStandeeContactY`). Under §3 option (a) — flat-plant at
centroid — the origin gap is *still* 0.096 and the gate is *still* green, while the plinth's uphill
corner is 0.217 wu buried and its downhill corner is 0.217 wu airborne. **The one gate that exists
for "is the figure floating" would pass the exact picture Adam is worried about.** F1/F2 must
replace it, measured per **bbox corner** against the **support plane**, not per origin against a
scalar.

`clayRoomStructureParkingAudit` and `clayRoomStructureBaseClearanceAudit` are the closest thing to
F1/F2/F3 that exists — but both measure the **nominal** rectangle (see §5) and both run **only on
the structure bench**. Nothing of the kind runs on terrain. **Today's terrain gate cannot see any of
the 11.**

---

## 8. THE PROOF PLAN

Smallest set of clay fixtures that demonstrates the contract holds — or fails — for each expression
option. Every frame at **both** reads (production 35° / strategic 72°, both already governed by
`clayRoomApplyCamPose`), every fixture at **two seeds**, plus one hostile case per option. Visual
verdicts are Adam's; the counts below are what makes each frame a proof rather than a picture.

**Standing requirements for every frame:** the six-foot human witness present; a receipt carrying all
11 signals of §7; the same `terrainseed` query param that `clayRoomTerrainSeedFromLocation` already
reads, so seed changes are one URL edit.

### P0 — THE BASELINE (proves the instrument, not the contract). 1 fixture, 2 frames.
One flat 5×5 field. Three standees: Small, Medium, **Medium-cap (wraith)**. **Free yaw forced on**
(this requires fixing the 2-level `face()` walk found in §1.6, or explicitly setting
`fig.rotation.y`). Count: all 11 signals green, F5 fires 0×.
*What it proves:* the gate is real and the flat case is clean. *What it exposes:* whether the
terrain witnesses have ever been camera-faced at all.

### P1 — THE PROTECTED-AREA RULER. 1 fixture, 2 frames.
One flat cell per envelope with a **drawn 0.932 / 0.831 / 0.550 / 0.322 wu ring** on the cell top
(the support-graph overlay already draws per-cell line loops, `theater-clay-room.js:3987–3996` —
reuse it at the protected radius instead of 0.46). Standees free-yawed and spun through
`rotationStep` 0→3. Count: plinth bbox stays inside its ring at all four steps, 0 exceptions.
*What it proves:* the number in §2 is the number, visually.

### P2 — THE SLOPE MATRIX. 1 fixture, 4 frames (2 options × 2 reads), ×2 seeds.
**Start from geometry that already exists:** the structure kit's `shallow-ramp`
(`clay-room.js:936`, 26.565°, run 1, rise 0.5) is already built, already grid-projected, already
gated at ≤30° — and has never carried a figure. Put four of them in one bay with gradients pointing
N/E/S/W, so a free-yaw plinth meets the gradient at 0° / 45° / 90° / 135°.

Two standee treatments **side by side in the same frame**: **flat-plant at centroid** (the reject)
and **tilted plinth** (the recommendation). Count per ramp: F1 min-corner, F2 max-corner, F7 sprite
tilt, F9 pool normal — and print the **old** `WITNESS_MAX_GAP` origin-gap beside them, so the
receipt shows the legacy gate reading 0.096-green on a frame the new signals fail. That single row
is the argument for replacing it.

Expected: flat-plant fires F1 at −0.217 and F2 at +0.217; tilted fires neither.
*Hostile case:* one ramp at the 30° limit with the noise budget spent (`noiseAmplitudeH` at
`TERRAIN_WALK_NOISE_BUDGET_H.perCellH` = 0.0774h, `docs/DESIGN.md:1041`) so the plane is not exactly
the quantum.

### P3 — THE TRI-SPLIT INTERROGATION. 1 fixture, 2 frames.
One cell split corner-to-corner with the two triangles at 0 and 1h. Four attempts in one frame:
Tiny at the incentre · Small at the incentre · **Medium at the cell centre** (expected: F1/F2 fire —
the fold is under the plinth) · **Medium at a triangle incentre** (expected: F3 fires, overhang).
Plus the recommended option (A): the same cell rendered as **one tilted plane with tri-split
sub-quantum relief**, Medium standing, expected all-green.
Count: F10 `largestInscribedDisc` per triangle — should print 0.586 against a 0.932 requirement, i.e.
the failure is *stated as a number in the receipt* rather than argued.
*What it decides:* whether tri-split is relief (A) or a size-gated surface (B).

### P4 — THE CORNER LADDER (Adam's question, answered visually). 1 fixture, 2 frames, ×2 seeds.
One row of otherwise-identical cells, corner treatment stepping **1/3 → 1/4 → 1/6 → 1/8 → none**,
each with a free-yaw Medium standee at centre. Two variants of the whole row:
**(i) corner cuts the TOP plane** — expected: F3/F1 fire at 1/3 and 1/4, clear from 1/6 down.
**(ii) corner chamfers BELOW the top plane** — expected: all-green at every size, including 1/3.
Receipt must carry the **F11 walk-only fingerprint for both variants** so "cosmetic" is proved, not
claimed: variant (ii) must be byte-identical to the un-chamfered field.
*What it proves:* the §5 ruling — 1/6 at the top plane, any size below it — with a picture Adam can
rule on, and the cosmetic/gameplay line drawn in numbers.

### P5 — STAIRS, RE-PROVED HONESTLY. 1 fixture, 4 frames.
Re-run the CL-F01 parking probe with three changes: measure the **rendered bbox** not the nominal
rect (F3); park **Medium-cap (wraith)**, not just the human; and add a **free-yaw control** —
the same tread with `claySupportWorldYaw` deliberately unset. Frames: 2-step / 3-step / 4-step on a
1-cell run, plus the free-yaw control. Expected: 2-step green, 3-step green by 0.002, **4-step
clipping at −0.040**, free-yaw control firing F5 with 0.247 wu of overhang.
*Hostile case:* a **Large** standee on a 1-cell-wide flight (expected 0.75 wu overhang per side) —
the case nothing has ever tested.
*What it proves:* the §5 verdict is honest, and it hands Adam the picture of the failure mode
alongside the picture of the success.

### P6 — THE TWO-STANDEE CONSISTENCY READ. 1 fixture, 2 frames.
Two standees on adjacent sloped cells, plus two on adjacent flat cells as the control, at the
**72° strategic read** (this is the read where relative height is judged). Count: F8 for both pairs.
*What it proves:* the failure Adam named — "two standees on adjacent sloped cells reading at
inconsistent heights" — is at or below the 0.006 threshold.

**Total: 7 fixtures, ~18 frames, 2 seeds on the three that carry randomness.** Every frame produces
the same 11-signal receipt, so the whole plan collapses to one table Adam can scan beside the images.

---

## 9. WHAT I COULD NOT SETTLE — for Adam

1. **Which contact convention wins** — production embeds the plinth 0.006 wu; the stair path floats
   it 0.006 wu (§1.3). 0.012 wu apart. Both cannot be right on a slope.
2. **The contact pool's overflow** (§1.4): clip it to the support polygon, or shrink the 1.488
   multiplier? Clipping is consistent with the grid-overlay law already ruled; shrinking is cheaper.
3. **Tread count per stair unit** (§5): cap at 2 treads per cell, shrink the Medium base depth below
   1/3, or add a real nosing that formally overhangs. All three are legal; they read differently.
4. **Whether the terrain witnesses failing to billboard (§1.6) is a defect or intended.** It changes
   what the banked cl-f07a frames prove. I did not change anything to find out.
5. **Two gates must be rewritten, not merely extended**, and both are currently green:
   `dev/measure-clay-terrain-bench.py`'s `WITNESS_MAX_GAP` (blind to the slope failure by
   construction) and `dev/verify-bw2-2-floor-contact.mjs` group 21b (asserts a proposition the
   recommendation makes meaningless). Neither will fail on its own; both will quietly stop covering
   their subject. Per the Teeth Law, the slope ruling is not recorded until these two are replaced.

---

*No file in `Genesis-terrain` was modified and nothing was committed. Image bytes for the
`cl-r3-continuity-stairs-mood-*` captures were read from the hydrated sibling worktree
`…/Genesis/genesis/`; the `cl-f07a-terrain-bench-v001` bytes are hydrated in `Genesis-terrain`
itself.*
