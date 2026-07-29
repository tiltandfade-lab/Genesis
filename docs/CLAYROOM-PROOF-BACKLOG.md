---
type: execution-backlog
created: 2026-07-27
owner: this file (the ordered architectural proof backlog between the Clayroom reset ladder and the
  site generator)
authority: subordinate to `CLAYROOM-RESET-LADDER.md` (owns the CL-R rung ids and the fixture family),
  `ART-DIRECTION-CANON.md` (verbatim art authority — quoted here, never re-ruled),
  `GRAPHICS-CONVERGENCE-CHARTER.md` (graphics law), `GOLDEN-SITES-PROOF-QUEUE.md` (the common
  clay-proof contract every proof below inherits), `STRUCTURE-KIT-CATALOG.md` (structure ownership),
  `MESHY-PREMIUM-MONTH-1-MODEL-SLATE.md` + `-BATCH-PRODUCTION-HANDOFF.md` (Meshy admission + queue
  format). Consumed by the eventual C1J/C1K passes and by every golden-site fixture.
siblings: the same 2026-07-27 clayroom phase also opens a terrain program and a ground-materials
  program. Those own ground, cliffs, water, and surface blends. This file owns BUILT THINGS and the
  seam where they meet the ground.
---

# CLAYROOM PROOF BACKLOG — the architectural problems still unproven in clay

**STATUS: DRAFT — Opus lane 2026-07-27, decisions recorded with grounds, visual gates Adam's.**

Nothing in this file rules on how anything looks. Every visual verdict below is marked
`ADAM GATES` and stays Adam's. Every engineering claim carries the evidence it was read from.

---

## 0. What this document owns, and what it does not

**Owns.** The question *"what must still be PROVEN in the Clayroom before a site generator can
call this construction system and get a legal, buildable, tactically honest place?"* — the ordered
backlog `A1…A18`, the assembly contract (item / dressing / interactive-item), and the
in-engine-vs-Meshy split for architectural item classes.

**Does not own.** CL-R rung ids and the retained fixture family (`CLAYROOM-RESET-LADDER.md`) ·
clay-pass ids `C1A…C5` (`procedural-dungeon-direction/CLAY-PROOF-LADDER.md`) · site composition
(`GOLDEN-SITES-CATALOG.md`) · material authoring (`MATERIAL-LANE.md`) · trim contracts
(`TRIM-SHEET-PIPELINE.md`) · terrain and ground materials (the two sibling programs opened the same
day) · any art ruling (`ART-DIRECTION-CANON.md` is verbatim authority; this file quotes and routes).

**Relationship to the reset ladder.** CL-R0…CL-R6 answer *"is the fixture trustworthy enough to
judge anything else through?"* They are a **renderer-trust gate**. This backlog answers the next
question: *"is there enough construction system to build a place with?"* The two interleave —
several items below are new retained fixtures joining the `CL-F00…CL-F06` family, and they inherit
the ladder's capture-and-receipt law unchanged.

---

## 1. Honesty protocol used in this pass

1. Every "proven" claim below was read from a **committed capture PNG or receipt JSON**, or from
   the **source file and line**, not from a status header. Doc status lines are treated as claims,
   not evidence — three of them are already stale (§2.5).
2. Where the rounds proved something narrower than the headline, the narrower thing is what is
   recorded.
3. Where I could not verify, it says so.
4. **Evidence-handling defect found this pass, recorded because it will bite the next lane:** in
   this worktree (`Genesis-clayspec`, created with `GIT_LFS_SKIP_SMUDGE=1`) **every capture PNG in
   `dev/clay-captures/` is a 131-byte LFS pointer, not an image.** A reviewer working in a lane
   worktree cannot see the evidence at all. The real bytes were read from the root repo
   (`../genesis/dev/clay-captures/…`). Any packet sent to Adam must ship absolute paths into a tree
   that holds real bytes — this is the standing send-files-not-links rule, now with a measured
   failure mode.

---

## 2. What the CL rounds have actually proven

### 2.1 Rung by rung

| rung | what the frame actually shows | what the receipt/harness actually gates | what it does **not** establish |
|---|---|---|---|
| **CL-R0** | `cl-r0/after-04-clean-no-overlay.png` — a legible neutral-clay room where the "before" frame was near-black with a dungeon floor glued on | Diagnostic-clay routing survives every async rebuild; `verify-clay-room` check 18; mutation-proven twice (deleting the hook turns 18j red *and* returns the dungeon material live) | Nothing about objects. The census answers "who owns this surface", not "is there anything in this room" |
| **CL-R1** | `cl-r1-lighting-matrix/cl-r1-lighting-comparison.png` — seven recipes on one sheet; a wall torch with visible haft/cup/flame | Light recipes are authored JSON → compiled lock → shared consumer; a fifth light, an unmounted practical, and physical intensity > 30 all rejected at compile; sprite sRGB proven causally (untagged `meanSat 42.2` → tagged `60.2`; source art `145.7`) | One practical family (wall torch on a wall socket). No lamp on a table, no lantern hung from a hook, no brazier standing on the floor — i.e. **no practical that needs a socket the room-shell does not already emit** |
| **CL-R2** | `cl-r2-sprite-citizenship/*.png` — seven-sprite cast, 0.25–60 ft, shallow rounded support strips, side shell, five lighting contexts | Production standee builder on `data.pieces`; support OBB de-overlap; contact pools linked and multiplying; plane-only alpha shadow casters | Standees are citizens. **Objects are not.** No object in the corpus has a support, a contact pool, a de-overlap test, or a footprint relation |
| **CL-R3 / R3a** | `cl-r3-continuity-grid-mood-v18/01-assembled-live-ui.png` — clay masses: walls with foundations, quoined corners, one-cell/wide/inside/outside stairs, ramp, blocker, square + round supports, a six-foot human witness | 32 specimens through `compileRoomShell`; camera-side wall omission as a compile-time decision with a versioned receipt; wrong-axis join rejected as `socket-axis-mismatch`; staged/latched door behaviour executable; click-to-climb resolves on an open d20 | The socket proof is **butt-joins only** — `03-sockets-viewport.png` shows exactly two labels, `W · BUTT` and `E · BUTT`. The receipt's 32 specimens carry six socket types total (§4.1); the catalog's declared vocabulary is larger and the rest is unimplemented |
| **CL-R4a/b** | `cl-r4b-two-material-grid-v001/cl-r4b-final-04-clean-no-overlay.png` — two matched bays, fine white-brick beside rough-hewn block, world-strip multiply grid on every horizontal top | 16 material surfaces, both parents `pbrReady`, byte-identical MM run A/B hashes, exact 3×3 field at 1.65 m/tile, grid as depth-tested surface-clipped strips | Materials on **structure**. No object, container, fixture, or dressing surface has ever been routed through an MM parent |
| **CL-R5** | `cl-r5-trimmed-structures-v005/cl-r5-pbr-04-clean-no-overlay.png` — two complete architectural twins with base course, cornice, coping, platform, curb, two-tread approach | Six semantic trim roles bind exact packed lineage; runs split at repeat boundary; V clamped to band; UV1 present; a **pre-mount architecture audit** that refuses an out-of-bounds stair, unequal rises, non-contacting solids, a curb that blocks the stair, or a doorway intersecting the platform — with a room-depth mutation that reproduces and rejects the old failure | Both rooms are **empty, roofless, doorless, unpeopled**. The receipt has no `pieces`, no `furniture`, no `dressing`, no witness. The proof contract's own §3 requires "a six-foot human witness plus the relevant small/large standee envelopes" — CL-F05 has none |

### 2.2 The single largest honest fact

**The Clayroom fixture family is an empty-room family.**

Verified in source, not inferred: every fixture except `CL-F00` sets `furniture: []`,
`dressing: []`, `wallProps: []` (`src/ui/theater-clay-room.js` — the fixture board literals at
~5022, ~5058, ~5074, ~5083, ~5117). `CL-F00` stages exactly one object:

```js
// src/engine/clay-room.js:1506
var object = Object.freeze({ id: "obj-crate-c1a", kind: "crate", cell: clayCellId(6, 7), … });
// src/engine/clay-room.js:1884
board.furniture = objectCell ? [{ slug, kind, realmId: null, x, y, roomSegNum }] : [];
```

and `kind: "crate"` resolves to a frozen one-prism recipe:

```js
// src/ui/theater-interior.js — ITR_FURNITURE_RECIPES
crate: [{ dx: 0, dz: 0, yBase: 0, sx: 0.6, sy: 0.6, sz: 0.6, face: "crate-body", topFace: "crate-top" }]
```

That is one 3-foot cube. The capture agrees:
`cl-r3-continuity-grid-mood-v18/11-room-truth-crate-grid.png` shows a featureless white box on a
near-empty tray. **After seven rounds, the entire object corpus of the Clayroom is one cube, one
goblin standee, and one door leaf.** Every claim about materials, light, trim, grids, and cutaway
has been tested against architecture only.

This is not a criticism of the rounds — the ladder deliberately scoped itself to fixture trust. It
*is* the reason this backlog exists, and it is why the assembly section (§4) is the load-bearing
part of this document rather than an appendix.

### 2.3 What the rounds honestly dodged, and where they were honest about dodging

Recorded so the next reader can tell discipline from drift.

- **CL-R3a corrected its own overclaim.** The shadow argument for compile-time omission was walked
  back in the ledger: the property is proven, but in that fixture the visible difference is nil, and
  the real advantages are determinism and cost. That is the standard the rest of this file tries to
  meet.
- **The door is still not resolved as a *thing*.** CL-R0 finding 5 ("two thin flat planks and a cap,
  no reveal depth, members taller than the wall") was routed to the door tranche and the frame is now
  record-derived. But CL-R5's architecture audit only checks `doorwayClearOfPlatform` and
  `doorBounds` — i.e. that the doorway does not collide with the platform. No round has proven a
  door **as an aperture family** (reveal, splay, sill, head, swing clearance, shutter, gate, slit).
  Item **A8**.
- **`materials: 0` on the instanced path** is still "consistent with lazy ghost creation and has not
  been proven a defect." Honest, and still open.
- **The 12 baseline-red verify harnesses** in an LFS-skipped tree were correctly declared as
  environmental rather than hidden. They remain ungated in any lane worktree (§1.4).
- **CL-R6 has never run.** Every capture in the corpus is one curated seed. The generator's whole
  value proposition is the *other* seeds.

### 2.4 The named authority that turned out not to bear on this

`dev/GAUNTLET-FINDINGS.md` (run 2026-07-16, seed 20260702) is a generated mechanics report: 0
crashes, 1 corrupt (`saveU()` throws uncaught on `QuotaExceededError`), 0 wrong, 0 ugly, 1,847
review rows dominated by 30-round combat stalemates and a persistence-size projection. **Nothing in
it bears on clayroom architecture.** Recorded rather than silently omitted; its one real finding
belongs to the persistence lane, not here.

### 2.5 Doc-status drift found this pass

| doc | says | is |
|---|---|---|
| `MESHY-…-BATCH-PRODUCTION-HANDOFF.md` front-matter | `accepted: 5 / queued: 295` | live manifest is **15 accepted / 283 queued / 2 regeneration-required** |
| `DRESSING-ATMOSPHERE.md` | `SPECCED` | `dev/verify-atmosphere.mjs` exists — landed |
| `THEATER-MODULES.md` (updated 07-25) | module ownership map | does not list `theater-donor.js` or `theater-procedural-kit.js` |

---

## 3. The backlog

Every item inherits the **common clay-proof contract** (`GOLDEN-SITES-PROOF-QUEUE.md` §"Common
clay-proof contract"): fixed production camera with governed zoom/pan and no orbit · six-foot human
witness plus the relevant small/large standee envelopes · clay + tactical-overlay + dressed/lighted
captures over the same committed ids · `early` and `settled` frames · a receipt carrying fixture
id/version/seed, recipe id/version, runtime path, camera pose, renderer size/dpr, per-surface census,
provenance audit and console errors · at least two changed seeds and one adversarial envelope ·
failures retained as diagnostic evidence. Items below name only what is **additional** to that.

Ordering is by dependency, then by how much of the site generator is blocked.

---

### TIER 0 — the spine (nothing above it can be proven honestly until these land)

#### A1 · One socket algebra

**Real-world construction.** A builder does not "attach"; he *seats* one thing into a prepared
receiver. A hinge pin drops into a knuckle. A joist end sits in a pocket. A sconce bracket takes two
lead anchors at a known height on a known face. A wall run butts a quoin at a known plane. Each of
those is a **named receiver with a position, an orientation, and a rule about what may enter it** —
and a joist pocket that accepts a sconce is a construction error, not a preference.

**Current state — seven incompatible representations, three of which fight over one field.**

| # | shape | owner | status |
|---|---|---|---|
| 1 | `userData.sockets[] = {type, position:[x,y,z], rotation:[x,y,z], …extra}` | `src/ui/theater-procedural-kit.js:245` (`socket()`) | live code, **zero production callers** |
| 2 | GLTF `extras.genesisDonor.sockets` flattened onto **the same** `userData.sockets` | `src/ui/theater-donor.js:407-455` | live and consumed |
| 3 | `partFn.anchors = {mainHand, offHand, back, head, shoulders, base, mount}` → `{pos, rot}` | `src/ui/theater-parts.js` (7 frozen names) | live, figures only |
| 4 | `mountSlots[] = {slotId, ownerSegIndex, u, worldPos, normal, tangent}` | `src/ui/theater-room-mesh.js:2308` | live; **one slot per wall segment, `u: 0.5`, fixed eye height** |
| 5 | `{id, type, axis:{x,z}}` — face-typed, planar axis, **no position** | CL-F01 structure specimens (receipt-level) | live in the bench |
| 6 | bare strings — `"floor-mount"`, `"wall-mount"`, `"interaction"` | `Reference/Meshy-Premium-Month-1/runtime-citizenship.json` | live, 15 assets, **no transforms at all** |
| 7 | dotted strings — `"interaction.front"`, `"loot.origin"` | `EXTRUDED-SPRITE-PROP-LIBRARY.md` §6 | paper only |

Representations 1 and 2 write the *same key* with **disjoint type vocabularies** (functional:
`axle`, `hinge-axis`, `cargo`, `load` vs architectural: `floor-mount`, `top-surface`,
`butt-join-{n,e,s,w}`). Nothing validates either. `attachProceduralAtSocket()` would silently
"work" on a donor group with a meaningless type match. Meanwhile
`ART-DIRECTION-CANON.md:1623-1626` already treats `SOCKET` as a **protected production scope the
Clayroom must not silently rewrite** — presupposing a persisted socket record that exists in no
data file. And `STRUCTURE-KIT-CATALOG.md` §4 has owed "one merged registry, one authority" since
2026-07-24; the procedural kit added a third vocabulary two days ago.

**Why the generator needs it.** A generator's whole job is to place things it did not author into
receivers it did not author. Seven vocabularies means seven bespoke placement branches, which is
exactly the "bespoke renderer branch" the Graphics Convergence Charter §1.4 forbids.

**Decision (mine, grounds recorded).** Adopt **one socket record** with the union of what the seven
already need, and make the existing seven *projections* of it rather than replacing them:

```
{ id, type, ownerRef, frame: {position:[x,y,z], normal:[x,y,z], tangent:[x,y,z]},
  accepts: [typeIds], capacity: n, occupiedBy: refOrNull,
  scaleRule: "fixed"|"stretch-u"|"stretch-uv", provenance: {source, version} }
```

Grounds: (a) `KENNEY-SOCKET-WAVE.md:27-60` records Adam's ruling to *adopt the kits' conventions,
don't invent a schema* — so the **type names** stay the kit names and only the record shape is
unified; (b) `normal` + `tangent` already exist in representation 4 and are the only way a wall
mount can be correct at any yaw; (c) `accepts` is what turns `socket-axis-mismatch` from a
CL-F01-only check into a general validator; (d) `capacity`/`occupiedBy` is what makes representation
4's one-slot-per-wall limit visible instead of silent.

**The clay proof (`CL-F07 assembly-bench`, new retained fixture).** One bench that mounts, through
the production renderer: a structure specimen (rep 5), a donor piece (rep 2), a procedural-kit part
(rep 1), and a wall practical (rep 4) — all four resolving through the one record. Required
additional evidence: a socket-visualization mode drawing every socket's frame as a real triad (not a
label); an **illegal-pairing capture** showing a rejected mount with the typed reason and a physical
gap, matching CL-F01's existing `socket-axis-mismatch` precedent; a **yaw-hostile case** — the same
wall mount on all four wall faces plus one non-axis-aligned face — proving `normal`/`tangent` and not
an accidental world-axis assumption; a **capacity case** — two things requesting one slot, with the
second rejected or lawfully relocated and receipted.
`ADAM GATES` nothing here; this is a countable back-end item.

**Dependency position.** Root. Blocks A2, A4, A5, A6, A7, A8, A12.

---

#### A2 · Declarative assembly records

**Real-world construction.** A cart is not a shape. It is a bill of materials plus a joining
schedule: two wheels seated on one axle, the axle in two bearing blocks, the blocks bolted under a
bed, the bed's corners plated. Change the bed length and the schedule still holds — that is what
makes it a *design* rather than a *carving*.

**Current state — assembly is imperative JavaScript, and the ladder's own law forbids that.**
`createProceduralBarrier()` (`theater-procedural-kit.js:1232-1296`) hardcodes roughly twenty box
positions, two hinge placements and a latch offset as literals inside a function. It is genuinely
good geometry — `dev/model-foundry/procedural-asset-state-recipes-proof.png` shows the same barrier
in eight states with real silhouette changes — but it is **one hand-authored object**, not a system,
and there is **no cart recipe, no gate recipe, no winch recipe anywhere in the repo.** The parts
exist (`axle` exposes `wheel-left`/`wheel-right`/`chassis`; `wheel` exposes `axle`); the schedule
does not.

The Clayroom reset ladder already rules on this, and the current state fails the rule:

> Every saved workbench change must become a table/catalog row, a versioned recipe/lock, or an
> explicit renderer invariant. If it cannot be represented that way, it is hand-authored decoration
> and does not enter the procedural pipeline.
> — `CLAYROOM-RESET-LADDER.md`, "The table / engine / renderer boundary"

And so does canon, which already states the assembly law but never says *from what data*:

> **§4.1 component-kit contract** — an object with moving, swappable, repeating, or independently
> deep parts is an assembly kit: the image model supplies ISOLATED component art, NEVER
> preassembled; the engine assembles and owns every state (door shut/ajar/open reuse one leaf
> sprite; lever left/right are deterministic rotations; **pivots are metadata, never painted
> marks**). Do not split fixed ornament; the goal is useful reuse, not maximum fragmentation.
> — `ART-DIRECTION-CANON.md:507-512` (verbatim)

**Decision (mine, grounds recorded).** The missing artifact is an **assembly record**: authored
data, compiled and validated the way light locks already are.

```
{ id, version, class: "item"|"dressing"|"interactive"|"structure",
  members: [{ ref: partId|donorSlug|assemblyId, seat: {parentSocket, childSocket}, morph: {…} }],
  morphParams: [{ name, min, max, unit, propagates: [memberIds] }],
  states: { condition, access, occupancy },        // the three axes the kit already has
  proxy: { footprint, collision, cover, walkTops },
  provenance: { source, seed, catalogRow } }
```

Grounds: (a) it is the same shape the light lane already proved works —
`data/light-profile-locks.json` → `build/compile-light-locks.py` → compiled registry → shared
consumers, with the compiler doing the rejecting; (b) `members[].ref` accepting an `assemblyId`
gives nesting, which `MODEL-GRAMMAR.md`'s figure recipe format explicitly lacks; (c) `proxy` is
required by the canon furnishing boundary — *"if a furnishing changes collision, cover, sight,
support, practical-light position, or exact interaction reach, it must receive the smallest truthful
physical proxy — invisible tactical furniture is not permitted"* (`ART-DIRECTION-CANON.md:1357-1361`).

**The clay proof.** On `CL-F07`: build the SAME object twice — once from the hardcoded
`createProceduralBarrier()` and once from an assembly record — and prove **byte-identical geometry
bounds and socket sets**, then delete the hardcoded path. Additional evidence: one record with a
deliberate illegal seat, rejected with a typed receipt; one record nesting a sub-assembly two deep;
the same record compiled twice producing byte-identical output.

**Dependency position.** Depends on A1. Blocks A4, A5, A6, A7, A11, A15, A16.

---

#### A3 · The morph contract

**Real-world construction.** A carpenter can make a bench any length. He cannot make it any
*proportion* — stretch a bench to twelve feet and the seat sags unless you add a leg. Real building
components have a **legal range and a rule about what happens at the ends of it**: repeat a member,
subdivide a bay, add a support, or refuse.

**Why this is Tier 0.** The standing constraint on this whole lane is that anything in-engine must be
**procedural and morphable — resize/stretch/deform as first-class.** Today morphability is ad hoc:
the procedural kit takes `opts.radius`, `opts.width`, `opts.height`, `opts.scale`, `opts.slots`,
`opts.spacing` per builder with no declared bounds and no validation; `ITR_FURNITURE_RECIPES` are
**frozen literals with no parameters at all**; and the Meshy runtime pack declares `scaleAxes`
(`uniform`, `x`, `z`) with no bounds — `M035-A` claims `["uniform","x"]` and nothing anywhere says
how far.

**Decision (mine, grounds recorded).** Every in-engine class in the split list (§5) must declare
**named, bounded, validated morph parameters**, and the compiler must reject out-of-band values
rather than clamping silently. Three morph behaviours are legal and must be declared per parameter:

- `stretch` — the member scales (a slab, a beam web);
- `repeat` — the member's *count* changes and its size does not (merlons, palisade stakes, treads,
  balusters, chain links);
- `subdivide` — beyond a threshold a new member is introduced (a bench gains a centre leg; a wall
  run gains a pier).

Grounds: (a) `repeat`-not-`stretch` is what stops a merlon becoming a stretched blob and is already
implicitly how `createCargoSocketRack({slots})` works — this makes it a declared kind rather than an
accident; (b) `subdivide` is the only honest answer to the bench problem and it is the same rule
`STRUCTURE-KIT-CATALOG.md` §2 already applies to stairs ("the eventual generator chooses tread count
from rise while preserving the one-cell footprint"); (c) silent clamping is the exact failure the
"validators preserve the thing's job" discipline forbids.

**The clay proof.** A **morph sheet** on `CL-F07`: for each proved class, one capture at `min`, one
at the authored default, one at `max`, and one **rejected** out-of-band request with its receipt — at
the fixed camera, with a six-foot witness in every frame so the reader can judge proportion, not just
size. Hostile case: the smallest legal and largest legal value of every parameter **simultaneously**
(the corner of the parameter space, which is where proportion breaks). `ADAM GATES` the proportions.

**Dependency position.** Depends on A2 for where parameters live. Blocks every in-engine row in §5.

---

### TIER 1 — the contents of a room (the three assembly classes made real)

#### A4 · Fixture and furniture assembly — Class I

**Real-world construction.** A workroom's furniture is joinery: a top, a frame, legs or a plinth,
sometimes a back and shelves. The joints are repeated and the dimensions vary with the room. Nobody
carves a table from one block, which is exactly what `ITR_FURNITURE_RECIPES` does today (a table is
five loose boxes with no joints and no parameters).

**Why the generator needs it.** C1J's primary question is whether the clay shell can become "one
functioning small guard-post room through a canonical furniture assembly — rather than a bag of
attractive props." C1J is a *behaviour* pass. It presumes a furniture system exists. It does not.

**The clay proof.** `CL-F07` mounts, from assembly records: one work surface, one storage unit, one
seat, one light-bearing fixture. Additional evidence: each at three morph values; each with its
`proxy` drawn as a visible tactical overlay beside the beauty frame (proving collision/cover/walk-top
agree with the visible mass); one **substitution** capture — the same semantic slot filled by a
different admitted record — proving the slot, not the object, is what the generator addresses.
`ADAM GATES` the look. Countable: proxy-vs-visible-mass agreement, zero ownerless surfaces, morph
bounds honoured.

**Dependency.** A1, A2, A3.

---

#### A5 · Surface attachment — Class II (dressing assembly)

**Real-world construction.** Dressing is *fixing things to surfaces*: a sconce lead-anchored at
shoulder height on a wall face, a notice nailed to a board, a sack set on a shelf, a rope coiled over
a cleat, a lamp hung from a ceiling hook. Every one of those needs a **point on a surface with an
outward normal and a height**, and most surfaces can carry several.

**Current state — the ceiling on this is one slot per wall.** `theater-room-mesh.js:2308` emits
exactly one mount slot per wall segment, at `u: 0.5` (mid-span), at
`DEFAULT_WALL_MOUNT_EYE_HEIGHT`. You cannot hang two things on a wall. You cannot choose a height.
There is no floor-surface, object-top, ceiling, or riser-face mount vocabulary at all. Wall props
route through a separate path (`interiorBuildWallProps` in `theater-dressing.js:623`) which
back-computes a position from `entry.wallSide` and pushes a shallow extrusion half a cell toward the
wall — a good-faith fix, and a second placement authority.

Meanwhile the noun supply is already live and already blank at the tail: dressing rolls per
room/leg/segment are BUILT and verified, they resolve through `THEATER_PROP_KEYWORD_RULES` to 26
scenery part-families, and **14 of those 26 still render as the plain block**
(`PROP-NOUN-LIBRARY.md` §1a). The tables are producing nouns that the renderer answers with a cube.

**The clay proof.** A **surface-attachment matrix** on `CL-F07`: the same four dressing items mounted
on wall face, floor, object top, riser face, and (if A9 licenses one) ceiling — each at two heights
and two positions along the run, with the socket frames visualized. Hostile cases: a wall that is
camera-side-omitted (does its dressing vanish, relocate, or float?); a wall shorter than the item;
two items competing for one span. Additional evidence: one item on a **curved or diagonal** face once
A13 lands. `ADAM GATES` density and placement taste.

**Dependency.** A1, A2, A3. Interacts with A9 (ceilings) and A13 (non-orthogonal faces).

---

#### A6 · Interactive-item assembly — Class III

**Real-world construction.** An interactive thing is an assembly plus a **hinge line and a swept
volume**. A door needs a jamb, a pin axis, and clear floor for the leaf to travel through. A lever
needs a fulcrum and two rest positions. A chest lid needs clearance above it. The mechanism is not
decoration; it *reserves space*.

**Current state — one archetype renders.** The registry is real and generated
(`data/interactables.js` from `build/gen-interactables.py`; 8 archetypes — door, chest, lever,
shrine, campfire, trap, portal, container; `INTERACTABLE_ARCHETYPE_STATES` is the single source
`applyEvent` validates a `state_transition` against). Placement is real
(`src/engine/walk-interactables.js` → `plan.interactables[]`, consumed by `theater-data.js:1841`).
But `interiorBuildInteractables` (`theater-boot.js:3115`) opens with
`if(!entry || entry.archetype !== "door") return;` and the comment says the rest "render in D5" — D5
never landed, and D4's taste gate failed 2026-07-14. **Seven of eight archetypes have no geometry.**
And the Clayroom is blind to the pipeline entirely: `CL-F00` hand-derives its single
`board.interactables` door entry in the engine adapter rather than receiving one from `trayFrom`.

**Decision (mine, grounds recorded).** Interactive items are **not a fourth thing**. They are Class I
assemblies with two additions: a declared **pivot** (the canon §4.1 "pivots are metadata" clause) and
a declared **swept reservation** (the space the motion needs, which the tactical layer must respect).
Grounds: `KENNEY-SOCKET-WAVE.md:20-22` already rules this — *"a door stops being bespoke prism math
and becomes a FRAME piece with a hinge SOCKET plus a LEAF that mounts it. Interactables inherit
correctness from assembly conventions, not per-object geometry code."* Building a separate
interactive-object system would contradict a landed ruling.

**The clay proof.** Three archetypes beyond `door` — chosen as `chest` (lid, vertical sweep, contents),
`lever` (two deterministic rotations, no sweep), `container` (access + occupancy states) — each built
from an assembly record, each with its swept reservation drawn as a tactical overlay, each cycling
its full authored state list on the production path. Hostile cases: a door whose swing is blocked by
furniture (does it refuse, reverse, or clip?); a chest against a wall with insufficient lid
clearance; a state transition interrupted mid-tween by a rebuild. `ADAM GATES` the presentation —
and D4's failed taste card is retained as the red baseline this proof must beat.

**Dependency.** A1, A2, A3, A8 (the door's aperture is A8's, the leaf is A6's).

---

#### A7 · Containers, contents, and holding allocation

**Real-world construction.** A crate holds things. A rack holds crates. A shelf holds sacks. The
container's interior volume is real, its contents rest on a real surface, and what you can see is not
what you can reach.

**Current state.** The procedural kit's containers already expose a `contents` socket, and
`createCargoSocketRack` exposes indexed `cargo` sockets — the only nested-assembly evidence in the
repo (`procedural-asset-kit-proof.png`, "SOCKET ASSEMBLIES"). Production has none of this: canon
rules the crate is *"one human-scale six-sided box, not a stacked lid/body assembly"*
(`ART-DIRECTION-CANON.md:1610-1613`), and there is no contents relation anywhere in the theater.
C1J requires "one exact container/holding allocation and one aggregate search surface"; C1K requires
custody, quantity band, ownership/access and observer knowledge.

**The clay proof.** One rack + three containers + contents, built from nested assembly records, with:
capacity honoured (a fourth container rejected or lawfully relocated); an aggregate search surface
distinguished from an exact holding; contents that survive a rebuild with stable ids; and one
container whose contents are *known* vs *unknown* to the viewpoint, rendered honestly in both.
Hostile case: a container morphed to its minimum size with contents that no longer fit.
`ADAM GATES` nothing except the look; the allocation rules are countable.

**Dependency.** A2, A4.

---

### TIER 2 — the architecture that has never been built

#### A8 · The aperture family

**Real-world construction.** An opening in a wall is not a hole. It is a **reveal** — the wall's own
thickness exposed on both faces — plus a **sill** or threshold, a **head** (flat lintel, segmental
arch, or relieving arch), optional **splay** (widening inward for light or for shooting), and a
**stop** that the leaf closes against. The leaf then needs a **hinge line** and **swing clearance**.
Windows, doors, gates, arrow slits, and shuttered observation openings are the SAME construction
with different parameters — that is why a real mason builds them with the same rules.

**Why the generator needs it.** Site 1 alone needs: a controlled door, a shuttered observation
window (LOCKED, `STRUCTURE-KIT-CATALOG.md` §13), and a gate/barrier at the threshold. Site 6 needs
bar grating. The parapet family brings arrow slits. Today the doorway is a hand-tuned prototype:
`ITR_DOORWAY_OPENING_W = 0.61`, `ITR_DOORWAY_OPENING_H = 1.35`, `ITR_DOORWAY_DEPTH = 0.3` — Adam's
own "kindergarten doorway", explicitly a prototype, with no reveal, no sill, no head type, no splay,
no family.

**Decision (mine, grounds recorded).** One parametric **aperture** with morph parameters
`clearW · clearH · sillY · revealDepth · splayAngle · headType(flat|segmental|arched) ·
stopSide · leafCount` and a separate **closure** record (leaf / shutter pair / grating / portcullis)
seating on the aperture's `hinge` sockets. Grounds: `ART-DIRECTION-CANON.md:1475-1509` already rules
the split — *the frame is WALL; the door is the only OBJECT; dressing belongs to the doorway, never
the door* — so the aperture belongs to the wall compiler and the leaf to the assembly system, and
building them as one thing would contradict canon.

**The clay proof.** An **aperture sheet** on the structure bench: door, window, shuttered
observation opening, gate, arrow slit, and one sealed niche, all from one parameter set, each shown
in section (role-debug) and in beauty, with a six-foot witness standing in each opening. Hostile
cases: an opening wider than its wall run; an opening one cell from a corner (does the reveal own the
corner?); an opening in a camera-side-omitted wall; a leaf whose swing crosses a stair.
`ADAM GATES` the look, and this is where CL-R0's "popsicle door" redline is finally answered.

**Dependency.** A1 (hinge sockets), A3 (morph), A12 (the corner case). Blocks A6's door and A9's
roof penetrations.

---

#### A9 · Ceiling, roof, and the interior/exterior boundary

**Real-world construction.** A room is a floor, walls, and something over it — joists and boards, or
a vault, or open sky. A roof is planes meeting at typed edges (eave, verge, ridge, hip, valley) over
a supporting structure, oversailing the wall at the eave so water clears the face. Structurally the
roof and the ceiling are different objects that usually get built together.

**Why the generator needs it.** Every fixture in the corpus is roofless. The guard post's ruled
posture is a **flat walkable deck in both cultures** with a culture-expressive defensive edge, i.e. a
roof that is also a floor. Camp needs canopies. Monastery needs gable + spire. Site 10 needs street
frontage with rooftops. And the fixed camera means the interior/exterior boundary is a **cutaway
question** before it is a geometry question: what happens to the thing over the room when the camera
must see in?

**Decision (mine, grounds recorded).** Prove **deck-over-room first**, not pitched roofs. Grounds:
`STRUCTURE-KIT-CATALOG.md` §7 already sets the build order (parapet → shed → gable → hip) *because*
the flat deck forces the height quantum, the walkable-surface contract, access validation, and
cutaway — the systems everything else reuses; and CL-F01 already proved a two-storey deck over a
three-wall workroom. The unproven half is not the deck, it is **what the deck does to the room
beneath it** under the fixed camera.

**The clay proof.** One room with an occupied deck above it, captured in four states: deck opaque
(exterior read), deck removed (interior read), deck ghosted, and the governed strategic view.
Additional evidence: a standee on the deck and a standee below in the same frame; a practical light
inside proving the interior does not go black when the deck is opaque; a roof penetration (stair head
or hatch) using A8's aperture family. Hostile case: a deck partly over and partly not — the
half-covered room. `ADAM GATES` the cutaway read; this is a composition verdict, not a countable one.

**Dependency.** A8 (penetrations). Blocks A10 and the whole exterior/interior story.

---

#### A10 · Floor plates and occupied storeys

**Real-world construction.** A second floor is a plate carried on bearing walls or beams, with a
stair well cut through it, an edge that is either a wall or a rail, and a soffit underneath that the
room below sees.

**Current state.** CL-F01 composes two maximum-rise stair units around a landing into an occupied
+10-ft deck — genuinely proven, and visible in `02b`/`02d`/`02f`. What is unproven: the plate as a
**generated** element (thickness, span, bearing, edge condition, soffit), the well cut through it,
and more than one of them.

**The clay proof.** A three-storey shell with a stair well, one rail edge and one wall edge, and a
visible soffit; standees on all three levels in one frame at the fixed camera. Hostile case: a plate
spanning further than its declared bearing (must `subdivide` per A3, or be refused).

**Dependency.** A3, A9.

---

#### A11 · Openings in the ground plane

**Real-world construction.** A pit, a hatch, a well head, a drain channel, a sump, a shaft collar.
Each is a **negative** in a floor with an edge treatment and a fall consequence, and each is a
tactical fact before it is a visual one.

**Why the generator needs it.** Site 5 (mine) owns drain/channel, sump edge, waterline socket and a
shaft collar; site 8 owns trapdoors and concealed pieces; site 3 owns collapse voids. The floor
compiler currently makes tiers and slabs. It has no concept of a hole.

**The clay proof.** Four negatives in one floor — pit, hatch (with A8 closure), drain channel, shaft
collar — with edge geometry, correct traversability-grid exclusion (the grid must NOT mint walk cells
over a hole), and a fall receipt from a standee entering one. Hostile case: a hole under a wall, and
a hole one cell from a stair.

**Dependency.** A2, A8. Coordinates with the sibling terrain program at the ground seam (A14).

---

#### A12 · The junction and termination resolver

**Real-world construction.** Wall runs do not simply stop. They terminate into something: a quoined
corner, a pier, a buttress, a door jamb, a return, or a clean rock transition. The choice is a
*construction-profile* decision — an ashlar building expresses a quoin, a mud-daub building does not.

**Current state.** Ruled 2026-07-25, implementation **owed**. CL-F01 has a bounded implementation
(OSS polygon kernel, common-datum plinths, full-height interpenetrating quoins, short cutaway
returns, 0.02-unit contact overlap) and that is real and visible in `01-assembled-live-ui.png`. What
does not exist is the **resolver**: the thing that, given a run and a profile, chooses and builds the
termination. The catalog is explicit that "until that clay proof and validator exist, the direction
is ruled and implementation is owed."

**The clay proof.** `SK-J01 Junction House` per its own spec, plus: the same wall graph resolved
under two construction profiles (Institutional expressing quoins, a makeshift profile resolving to a
hidden seam) with **identical topology and identical tactical facts**, proving the profile changes
expression and not truth. Hostile cases: a three-way and a four-way meeting; a run terminating into a
different-thickness run; a run terminating into terrain.

**Dependency.** A1. Blocks A13 and every culture A/B claim.

---

#### A13 · Non-orthogonal construction

**Real-world construction.** Buildings turn corners other than 90°. Towers are round. Arcades are
repeating bays on an arc. A curved wall is built from short straight courses that read as a curve —
which is exactly how it should be generated.

**Why the generator needs it.** Every capture in the corpus is axis-aligned rectilinear. The FFT
reference boards — the declared masterclass — are full of diagonals, rounds, and irregular masses.
The room-shell compiler's own doc puts "true polygon/octagon room authoring" out of scope and defers
it to C3, which has not run. The monastery's cloister arcade, the tower stage, and the mine's worked
portal all need it.

**Decision (mine, grounds recorded).** Prove **faceted curves, not true curves** — a round tower is
an N-gon whose facet count derives from radius, and a curved wall is a course-segmented polyline.
Grounds: the FFT tone law is explicit that *richness lives in the paint; geometry exists for
silhouette and tactical truth*, and the tactical grid is square — a true curve would create cells the
combat layer cannot describe. This also keeps the trim-run splitter (CL-R5) working, since it already
splits at declared world-repeat boundaries.

**The clay proof.** One 45° diagonal wall run with both corner conditions, one round tower with a
walkable top and a stair, one three-bay arcade — each with trim bound, sockets resolved, the
traversability grid clipped to real polygons, and a witness. Hostile cases: a diagonal meeting an
orthogonal run; a curve whose radius is smaller than one cell; an aperture in a curved wall.
`ADAM GATES` the silhouette.

**Dependency.** A12.

---

### TIER 3 — from a room to a site

#### A14 · The structure/terrain seam

**Real-world construction.** A building on a slope is levelled: you cut, you fill, you found. The
foundation descends to bearing and the plinth hides the difference. The guard post's LOCKED form is
*a roadside post built into a hill shoulder* — the seam IS the site.

**Scope note.** The sibling **terrain program** owns cliffs, crevices, chasms, ponds, hills. This
item owns only the **seam**: foundation descent, cut/fill, plinth expression, and the socket type
(`terrain-join`) that already exists in the CL-F01 receipt with no terrain to join.

**The clay proof.** One structure founded on a non-flat surface at three slopes, showing cut, fill,
stepped foundation, and a plinth that resolves the difference; the traversability grid correct across
the seam; no floating and no buried threshold. Hostile case: a slope steeper than the walkable limit
meeting a doorway.

**Dependency.** A12, plus the terrain program's first deliverable. Cross-lane.

---

#### A15 · Makeshift and scavenged construction

**Real-world construction.** Lashed poles, hide stretched over a frame, wattle woven between stakes,
scavenged plank patchwork, mud daub. None of it is a box, and its irregularity is *the point* — it is
how the eye reads "improvised" without a label.

**Why the generator needs it.** Vernacular 6 is a cross-cutting construction condition available to
any culture, and the bullywug checkpoint is a named proof case: the same guard-post grammar expressed
in swamp materials. It is also the honest stress test of A3 — if the morph contract only produces
boxes, "makeshift" will read as "the same building, browner."

**The clay proof.** The SAME guard-room assembly expressed twice: dressed-institutional and
makeshift, with identical topology and identical tactical facts. `ADAM GATES` whether the makeshift
version reads as improvised. Hostile case: the makeshift expression at maximum morph (does lashing
stretch into a smear?).

**Dependency.** A2, A3, A12. Composes with the founder question in §6.4.

---

#### A16 · Break states and destructibility geometry

**Real-world construction.** Things fail at their joints and their spans. A wall breaches where it is
thinnest or where the opening weakened it; a roof falls in; a barricade loses a member. The rubble
goes *somewhere*.

**Current state.** Ruled 2026-07-24: *"get it standing first, but destructibility WILL be a mechanic
— build with it in mind. Schema consequence: every piece carries reserved fields (material class,
break-state slot) from day one; no behavior yet."* The procedural kit already ships a `breached`
recipe that cuts a central negative space with broken stubs and a rubble fan — the only break
geometry in the repo, and it is inside the hardcoded barrier.

**Decision (mine, grounds recorded).** Prove **state swap, not simulation**: a break state is another
member list in the assembly record, not physics. Grounds: the ruling says schema now, behaviour
later; and the kit's readability law already demands the state change silhouette, negative space, or
members — all authorable, none requiring simulation.

**The clay proof.** One wall run and one closure, each in intact / damaged / breached, with proxy
and traversability recomputed per state (a breach must mint a route), and the rubble as real geometry
that the grid excludes from walk unless declared. Hostile case: a breach at a junction.

**Dependency.** A2, A12.

---

#### A17 · Site-scale composition and budget

**Real-world construction.** Not a construction problem — a **capacity** problem. A site is several
masses, terrain, a road, and a garrison, not one room.

**Why the generator needs it.** Every capture in the corpus is one small structure at 1280×720 @ dpr
2. Nothing has ever measured what happens at guard-post scale: draw calls, triangles, texture memory,
frame time, shadow-map budget with more than one practical, and the cutaway system's behaviour with
several masses in front of the camera rather than one.

**The clay proof.** The CL-F01/F05 vocabulary composed into a site-scale arrangement (target: the
Rung-C roadside post envelope) with the QA panel's counters banked in the receipt, on the target
MacBook Pro, at gameplay scale. Countable thresholds to be set from the first measurement, not
guessed. Hostile case: the largest legal envelope with every practical lit at night.

**Dependency.** A4–A13. This is the gate before any golden-site fixture is attempted.

---

#### A18 · CL-R6 seed resilience — the terminal gate

Carried unchanged from `CLAYROOM-RESET-LADDER.md` §CL-R6, not re-invented here: one retained golden
seed, ≥8 changed seeds per admitted fixture, adversarial smallest/largest legal dimensions, no
seed-specific branches or hand-placed coordinates, typed rejection receipts rather than broken
geometry.

**One addition from this backlog.** CL-R6 must now also cover **assemblies**, not only structure:
the same assembly record under changed seeds must vary only its licensed fields, and a rejected
assembly must produce a typed receipt and a lawful fallback rather than a hole in the room.

**Dependency.** Everything above. Nothing ships to the generator until this passes.

---

## 4. Assembly — what it means mechanically, and the proof ladder

### 4.1 The three classes, defined

| class | what it is | what makes it different | canon anchor |
|---|---|---|---|
| **I · item assembly** | a composed object built from generated parts (cart, winch, rack, barricade, table, brazier) | it has members and a joining schedule; it may nest | §4.1 component-kit contract |
| **II · dressing assembly** | attaching an item to a **surface** of something else (sconce on wall, notice on board, sack on shelf, coil on cleat) | the receiver is a *surface* with a normal and a run, not a point; several may share it | furnishing boundary, `ART-DIRECTION-CANON.md:1357-1361` |
| **III · interactive-item assembly** | Class I plus a declared **pivot** and a **swept reservation**, plus authored states | motion reserves space, and the state list is validated by `applyEvent` | `KENNEY-SOCKET-WAVE.md:20-22` |

These are **not three systems.** Class II is Class I with a surface-typed seat; Class III is Class I
with a pivot and a reservation. Building three systems is the failure mode this section exists to
prevent.

### 4.2 What assembly is today, honestly

- **In production:** `ITR_FURNITURE_RECIPES` — six kinds, each a frozen literal list of 1–5
  axis-aligned boxes, no sockets, no parameters, no states, no proxy, no provenance beyond a slug.
  The object record staged by the engine is `{slug, kind, realmId, x, y, roomSegNum}` — **no
  rotation, no scale, no state**. This is the whole production object contract.
- **In the new kit:** genuine socketed parts and genuine composable state axes, with one real nested
  demonstration (rack + containers) — and **zero production consumers**. Loaded at
  `genesis.html:1673`, registered at `manifest.json:1246`, consumed only by
  `dev/verify-procedural-asset-kit.mjs` and three foundry galleries.
- **In the donor pack:** 15 accepted Meshy donors with socket *names* and no socket *transforms*.
- **On paper:** a registry shape in `EXTRUDED-SPRITE-PROP-LIBRARY.md` §6 with
  `geometry.chassis` + `geometry.attachments[]` that nothing implements.

**The honest summary: seven socket representations, one assembly API, zero assembly recipes, and no
persistence for an assembled object.**

### 4.3 Reading the two kit proofs honestly

`dev/model-foundry/procedural-asset-kit-proof.png` — forty parts on a plane. The hardware reads
well: real collars, knuckles, tires, fasteners. But it is a **free-orbit gallery camera**, bespoke
gallery lighting, donor-adapter materials, and **no standee anywhere in frame**. Under the clay-proof
contract that is not evidence: no fixed camera, no witness, no envelope, no changed seed. The parts
may be correctly sized — the frame cannot tell you.

`dev/model-foundry/procedural-asset-state-recipes-proof.png` — one barrier in eight states. This is
the strongest assembly evidence in the repo: `open` swings the leaf, `breached` cuts a real gap and
scatters rubble, `abandoned` sags and grows weeds. It honours its own readability law. Two honest
caveats: `intact` and `damaged` are hard to separate at this angle, and the object is **one hardcoded
function**, so the sheet proves that *this* barrier's states read — not that a state system exists.

### 4.4 The proof ladder

New retained fixture **`CL-F07 assembly-bench`**, joining the `CL-F00…CL-F06` family under the same
capture-and-receipt law. Decision, grounds: assemblies must not be proven inside `CL-F01`, because
CL-F01's question is *"do construction atoms join and terminate correctly?"* and mixing object
assembly into it would repeat exactly the mistake the reset ladder was written to fix — a fixture
answering two questions answers neither.

| rung | question | gate |
|---|---|---|
| **AS-0** | Does one socket record serve all seven representations? | A1's four-way mount + illegal pairing + yaw-hostile + capacity |
| **AS-1** | Can a hardcoded assembly be reproduced byte-identically from a record? | A2's barrier equivalence; then delete the hardcoded path |
| **AS-2** | Do declared morph parameters hold proportion? | A3's morph sheet, min/default/max/rejected, witness in every frame — `ADAM GATES` |
| **AS-3** | Class I — do four furniture/fixture assemblies mount, morph, and carry honest proxies? | A4 |
| **AS-4** | Class II — do four dressing items attach to five surface kinds at chosen heights and positions? | A5 |
| **AS-5** | Class III — do three non-door archetypes build, pivot, reserve, and cycle states? | A6 — must beat the retained D4 red baseline |
| **AS-6** | Do containers hold, allocate, and survive rebuild with stable ids? | A7 |
| **AS-7** | Do assemblies survive changed seeds and adversarial envelopes with typed rejections? | folded into A18 / CL-R6 |

Each rung banks `early` + `settled` frames, a receipt carrying the assembly record id/version and
every resolved seat, and an independent measurement pass. Green harnesses alone never close a rung
whose question is visual.

---

## 5. THE SPLIT LIST

### 5.1 The rule I applied

Two founder-locked authorities already draw this line; this section applies them rather than
re-deciding them.

> Do **not** spend Meshy generations this month on: walls, wall ends, party walls, corners, posts,
> capitals, structural junctions; floors, roads, terrain slabs, retaining prisms, stairs, ramps,
> ladders, or landings; roof planes, ridges, roof spines, gables, parapets, or exact arcade bays;
> ordinary boxes, barrels, sacks, tables, beds, benches, shelves, simple doors, or crates; …
> Those belong to procedural geometry, faced boxes, extrusion, sprites, shaders, local Blender
> derivation, or runtime composition.
> — `MESHY-PREMIUM-MONTH-1-MODEL-SLATE.md:222-236` (verbatim)

> Use this kit when variation comes primarily from dimensions, repetition, attachment, material,
> cargo, condition, or effects. Use a donor model when the object's value comes primarily from a
> difficult authored silhouette, complex biological construction, sculpture, culturally distinctive
> carving, or machinery that cannot be described cleanly as reusable modules.
> — `PROCEDURAL-ASSET-KIT.md:308-315` (verbatim)

Plus the standing locks: **Genesis-procedural-first / Kenney-fallback — CONFIRMED** (Adam,
2026-07-24), and the geometry/paint split (*gameplay-legible = geometry; dressing = paint*).

**My operative test, in one line:** *if the thing's identity survives being stretched, it is
in-engine; if stretching it destroys what it is, it is a donor.* A wall stretched is still a wall. A
carved memorial stone stretched is a smear.

### 5.2 In-engine — procedural and morphable

Morph kinds per A3: `S` stretch · `R` repeat · `D` subdivide.

| # | architectural item class | morph parameters | construction class | grounds |
|---:|---|---|---|---|
| 1 | floor slab / plate | `cellsW`·`cellsD` (R) · `tierY` (S) · `thickness` (S) · `edgeProfile` · `bearingSpan` (D) | MODEL_RECIPE | forbidden to Meshy; already compiled |
| 2 | wall run | `length` (R at course) · `thickness` (S) · `height` (S) · `batter` (S) · `capProfile` | MODEL_RECIPE | forbidden to Meshy; identity survives stretch |
| 3 | wall termination — end/cap, inner + outer corner, T, cross, quoin, pier, buttress | `profileId` · `projection` (S) · `courseCount` (R) | MODEL_RECIPE | A12; "structural junctions" explicitly forbidden to Meshy |
| 4 | **aperture** — door, window, gate, arrow slit, niche, grating opening | `clearW`·`clearH`·`sillY`·`revealDepth`·`splayAngle` (S) · `headType` · `barCount` (R) | MODEL_RECIPE | A8; one family, six expressions — the definition of modular |
| 5 | closure — door leaf, shutter pair, grating, portcullis | `leafW`·`leafH`·`thickness` (S) · `panelCount` (R) · `hingeSide` · `swingDir` | EXTRUDE / FACED_BOX | canon: leaf is the OBJECT; "simple doors" forbidden to Meshy |
| 6 | stair run — straight, wide, inside-corner, outside-corner | `rise` (D→tread count) · `width` (S) · `treadDepth` (S) · `landing` | MODEL_RECIPE | forbidden to Meshy; already proven in CL-F01 |
| 7 | ramp | `pitch` (S, ≤30°) · `width` (S) · `length` (S) | MODEL_RECIPE | forbidden to Meshy |
| 8 | riser / retaining face | `height` (S) · `length` (R) · `batter` (S) · `capProfile` | MODEL_RECIPE | forbidden to Meshy |
| 9 | parapet / merlon run | `wallWalkH` (S) · `merlonW`·`gapW` (S) · `merlonCount` (**R — never stretch**) · `copingProfile` | MODEL_RECIPE | forbidden to Meshy; the canonical `repeat` case |
| 10 | column / post / pier | `profile(square\|round\|tapered\|broken)` · `diameter` (S) · `height` (S) · `facetCount` (R) | MODEL_RECIPE | "posts, capitals" forbidden to Meshy |
| 11 | beam / lintel / header | `span` (S) · `section` (S) · `bearing` | MODEL_RECIPE | modular by definition |
| 12 | roof plane — shed, gable | `pitch` (S) · `span` (S) · `overhang` (S) · edge roles (eave/verge/ridge) | MODEL_RECIPE | "roof planes, ridges, gables" forbidden to Meshy |
| 13 | trim band — base course, cornice, coping, nosing, curb | `runLength` (R at repeat boundary) · `profileDepth` (S) · band selection | trim atlas + profile core | CL-R5 proved it |
| 14 | foundation / plinth | `datumDrop` (S) · `batter` (S) · `courseCount` (R) | MODEL_RECIPE | A14 |
| 15 | blocker / low wall / bench-height mass | `length` (S) · `height` (S) · `depth` (S) | FACED_BOX | trivially modular |
| 16 | ground negative — pit, hatch surround, drain channel, sump edge, shaft collar | `w`·`d`·`depth` (S) · `edgeProfile` · `linerCourses` (R) | MODEL_RECIPE | A11; a hole is a parameter, not a sculpture |
| 17 | ladder / rung run | `height` (D→rung count) · `width` (S) · `railSection` (S) | kit (`rung`) | "ladders" forbidden to Meshy |
| 18 | palisade / stake run | `length` (R) · `stakeH` (S) · `stakeD` (S) · `lean` (S) | kit + repeat | pure repetition |
| 19 | rail / balustrade / fence | `length` (R) · `postSpacing` (R) · `railCount` (R) | kit + repeat | pure repetition |
| 20 | grating / bar field | `barCount` (R) · `barSection` (S) · `spacing` (S) | kit | site 6; pure repetition |
| 21 | container — crate, barrel, sack, jar, basket | `scale` (S) · `bandCount` (R) | FACED_BOX / LATHE | "boxes, barrels, sacks, crates" forbidden to Meshy; canon rules the crate is one six-sided box |
| 22 | furniture — table, bench, shelf, cabinet, rack | `length` (S→D at threshold) · `height` (S) · `shelfCount` (R) · `legCount` (D) | MODEL_RECIPE | "tables, beds, benches, shelves" forbidden to Meshy; the canonical `subdivide` case |
| 23 | mechanical hardware — the 40 kit parts | per-part dimensional params (A3 must bound them) | kit | already built; explicitly engine-owned by the runtime pack |
| 24 | rope / chain / cable run | path points · `radius`/`linkRadius` (S) · `segments`/`links` (R) | SWEEP | already built |
| 25 | surface media — sign, notice, banner, paper | `w`·`h` (S) · mark seed | kit surface | already built |
| 26 | practical fixture bodies — sconce bracket, floor stand, hook | `height` (S) · `armLength` (S) | kit (`bracket`, `hook`, `cap`) | CL-R1's torch already does this |
| 27 | decals — blood, moss, scorch, crack, rust, wear | `extent` (S) · `edgeIrregularity` | DECAL | canon decal exemption; "surface-state masks" forbidden to Meshy |
| 28 | FX — flame, ember, smoke, magic | `scale` (S) · `rate` · `color` | FX | already built |

**28 in-engine classes.**

### 5.3 Meshy — authored silhouettes the parameter space cannot reach

Every row below passes the operative test (stretching it destroys it) **and** clears the forbidden
list. Where a Month-1 family already covers the need, I say so rather than proposing a duplicate —
the wilderness queue's own "extend, do not re-buy" discipline.

| # | architectural item class | why not in-engine | queue status |
|---:|---|---|---|
| 1 | natural rock portal / cave mouth | irregular fused mass; no parameter set produces a believable karst arch | **already queued** `M005-A` |
| 2 | root arch / burrow mouth | biological construction | **already queued** `M011-A` (regeneration-required) |
| 3 | **collapsed structural mass** — fallen roof heap, breached-wall rubble mound, leaning ruin fragment | the value is the *irregularity*; A16 proves the state swap, but the heap itself is a sculpture | **propose** (§5.4) |
| 4 | **worked rock portal head** — mine adit mouth with irregular host rock meeting cut stone | the seam between geological and worked is the whole read; site 5's signature | **propose** |
| 5 | **statuary / idol / memorial stone** | sculpture, explicitly a donor case | **propose** |
| 6 | **shrine / altar mass with carved relief** | culturally distinctive carving | **propose** |
| 7 | **thatch / turf roof eave mass** (ragged edge only — the plane stays in-engine) | ragged organic edge; a parametric plane cannot fray | **propose, pending §6.4** |
| 8 | **hide / canvas canopy shell** | tensioned sag; a box kit cannot sag | **propose, pending §6.4** |
| 9 | organic / impossible connector (site 12) | by definition outside the grammar | defer until site 12 concepts land |
| 10 | non-modular embedded machinery — waterwheel housing, bellows, mill gear case | machinery that cannot be described cleanly as reusable modules | partly covered by `M025-A` (windlass), `M059-A` (forge); revisit after A17 |

**6 proposed + 2 already queued + 2 deferred = 10 Meshy architectural classes** against 28 in-engine.

**Headline: 28 in-engine · 10 Meshy** — of which 2 are already in the authorized queue (`M005-A`,
`M011-A`), 6 are proposed here, and 2 are deferred until their sites are concepted.

Class-to-row mapping for the slate in §5.4: class 3 (collapsed mass) splits into two rows, because a
fallen roof heap and an outward breach fan are different silhouettes with different tactical
consequences; class 7 (thatch eave) is held without a row pending the founder question at §6.4, since
it is the row most likely to be reversed to in-engine.

### 5.4 Candidate queue rows

Format is the live manifest's exact column order. Following the wilderness queue's precedent, these
use **new wave ids (`K1`/`K2`) and status `proposed`** so they cannot be mistaken for authorized
work, and **modelIds from `M090`** to clear the wilderness slate's proposed `M076–M089`. No budget is
allocated; this is a candidate slate.

```
priority,wave,status,jobId,modelId,variant,category,family,variantSubject,purpose,targetPolygons,referenceImage,canonicalIncoming,canonicalProcessed,donorOwns,engineOwns,expectedProceduralReplacements,acceptanceFocus,meshyPrompt
```

| jobId | wave | category | family | variantSubject | targetPolys | donorOwns | engineOwns |
|---|---|---|---|---|---|---|---|
| `M090-A` | K1 | ruin | Collapsed roof and rubble mound | fallen timber-and-slate heap over a wall stub | 1,500 | the irregular fused heap silhouette, its major broken members, and the real negative spaces a body could pass through | walkability, cover class, route minting, collision, materials, dust/scorch decals, and which structure it belongs to |
| `M091-A` | K1 | ruin | Breached wall rubble fan | outward stone fan from a wall breach | 1,200 | the fan's irregular mass and its few large fragments | the breach aperture itself (A8), the wall it came from, cover, route, and the break-state binding |
| `M092-A` | K1 | excavated | Worked rock portal head | adit mouth where cut stone meets irregular host rock | 1,500 | the geological-to-worked transition mass and the real opening depth | exact terrain hole, elevation authority, the supported drift behind it, lintel/support set, lighting, and collision |
| `M093-A` | K2 | sculpture | Standing memorial stone | weathered carved marker with relief face | 700 | the carved silhouette and relief | placement, scale-to-cell, cover class, decals, inscription content, and any interaction |
| `M094-A` | K2 | sculpture | Shrine altar mass | culturally carved altar block with offering shelf | 900 | the carved block silhouette and its shelf | offering contents, practical light, interaction state, materials, and footprint |
| `M095-A` | K2 | organic-construction | Tensioned hide canopy shell | four-point sagging hide canopy | 800 | the tensioned sag surface and its edge irregularity | poles, lashings, pegs, guy lines (all kit parts), span morph, weather state, and collision |

Every row inherits the standing Meshy settings recipe (`Image to 3D` · Smart Topology · target =
`targetPolygons` · texture off · prompt prefixed `SMART TOPOLOGY — TARGET N TRIANGLES — NO TEXTURE.`
· closing invariant `Exactly one coherent object or intentionally fused cluster.`) and the
donor-to-runtime-citizenship gate: stable scale and bottom-centred origin, footprint and mounting
class, collision/cover/walkability policy, Genesis materials, allowed scaling axes and bounds,
sockets and state ownership, locally derived LODs, **fixed-camera and clay-room proof**, provenance.

**One addition I am proposing to that gate, with grounds.** The runtime-citizenship record currently
carries `scaleAxes: ["uniform","x"]` with **no bounds**. Under A3 that is not a morph contract, it is
a licence to smear. Every donor admitted from `K1`/`K2` should carry `scaleBounds` per listed axis,
and the intake should refuse a donor whose acceptance frame was never captured at its declared
extremes. Grounds: the same reason the light-lock compiler rejects intensity above 30 — a bound that
is not validated is a bound that is not real.

### 5.5 Explicitly neither

Paint, decal, or trim — never geometry, per the geometry/paint split: shingle pattern, mortar
detail, timber-framing pattern, plaster texture, signage content, weathering, soot, moss, waterline
stain, mine marks (claim, grade, tally, last-safe-support, ownership, memorial). One exception is
flagged as a founder question (§6.1).

---

## 6. Founder questions

Only questions that are genuinely taste or direction. Everything else in this file is decided above
with grounds.

**6.1 — Shutters: paint or geometry?**
`STRUCTURE-KIT-CATALOG.md` §5 (your ruling) lists shutters as *dressing = paint*. §13 (also your
ruling) LOCKS the guard post's observation opening as a **shuttered window**, culture-expressive.
Those two pull in opposite directions, because an observation opening that can be closed changes
sightline, and §5's own test is *gameplay-legible = geometry*. My working call is: a shutter with
open/closed states affecting sight is geometry (an A8 closure); a purely decorative shutter is paint.
That edits your own example list, so it should be yours to confirm.

**6.2 — Does an interior ever show its ceiling?**
Every fixture so far is open-top and the fixed camera looks down. A9 can prove *deck-over-room*
either as "the deck is simply removed when you are inside" (cheap, always readable, slightly
diagram-like) or "the deck ghosts and the room lights itself" (richer, more expensive, and the
interior must then carry its own motivated light everywhere). This is a mood-and-feel decision with a
large cost tail, not a technical one.

**6.3 — How furnished is furnished?**
C1J says a room must be "a functioning room, not a bag of attractive props," and canon's hybrid
beauty floor says expensive dressing "varies when semantically licensed" and is not a universal
quota. Between those two there is a dial: is a pre-alpha guard room **four** objects or **twelve**?
The proof sheets should be built at the number you want to see.

**6.4 — Ragged silhouettes: bought or generated?**
Thatch eaves, hide canopies, and collapse heaps are the three places where "procedural and morphable"
and "reads as real" genuinely conflict. Bought (Meshy) gives richer irregularity at fixed sizes and a
per-family cost; generated gives any size, plainer. Rows `M090`, `M091`, `M095` above assume
**bought**; I can reverse them to in-engine parametric forms at the cost of the ragged read. This is
a taste-versus-flexibility call.

**6.5 — Does the door's failed taste card get re-shot now, or after A8?**
D4's presentation was rejected 2026-07-14 and D5 (every non-door archetype) has been gated behind it
ever since. My ordering assumes the aperture family (A8) lands first so the re-shot card shows a door
in a real opening rather than a leaf in a prototype hole — which means one more wait. Say the word
and it moves earlier.

---

## 7. Decision log

| # | decision | grounds |
|---:|---|---|
| D1 | One socket record with `frame{position,normal,tangent}`, `accepts`, `capacity`; the seven existing shapes become projections | Adam's adopt-the-kits'-conventions ruling keeps the *type names*; `normal`+`tangent` already exist in `mountSlots` and are the only yaw-correct answer; `accepts` generalizes the existing `socket-axis-mismatch` check |
| D2 | Assemblies become authored records compiled and validated, on the light-lock pattern | the reset ladder's own table/engine/renderer boundary law makes hardcoded composition "hand-authored decoration"; the light lane already proved the pipeline shape |
| D3 | Morph parameters are declared as `stretch` / `repeat` / `subdivide`, bounded, and rejected out-of-band rather than clamped | silent clamping is the failure the "validators preserve the thing's job" discipline forbids; `repeat` is what stops merlons smearing |
| D4 | Interactive items are Class I plus pivot plus swept reservation — not a fourth system | `KENNEY-SOCKET-WAVE.md:20-22` already ruled that interactables inherit correctness from assembly conventions |
| D5 | Assemblies get their own retained fixture `CL-F07`, not a bigger `CL-F01` | the reset ladder's founding argument: a fixture answering two questions answers neither |
| D6 | Roof work starts at deck-over-room, not pitched planes | `STRUCTURE-KIT-CATALOG.md` §7 build order; the guard post's LOCKED flat-deck posture; CL-F01 already has a deck |
| D7 | Curves are faceted, never true | the tactical grid is square; the FFT tone law puts richness in the paint; the CL-R5 trim splitter needs declared boundaries |
| D8 | Break states are member-list swaps, not simulation | the 2026-07-24 ruling says schema now, behaviour later; the kit's readability law is authorable without physics |
| D9 | Meshy candidates use new wave ids `K1`/`K2`, status `proposed`, `M090+` | the wilderness queue's own precedent for keeping unauthorized proposals unmistakable |
| D10 | Propose adding validated `scaleBounds` to runtime citizenship | an unvalidated bound is not a bound; same reasoning as the light-lock intensity ceiling |
| D11 | The operative split test is "does the thing's identity survive being stretched?" | it reduces two founder-locked authorities to one test that can be applied consistently, and it produces the same answers they already gave on every named case |

---

## 8. Suggested execution order

1. **A1** socket algebra — then **A2** assembly records, then **A3** morph contract. Nothing else is
   honest before these three.
2. **A8** aperture family — it unblocks the door, the observation opening, the gate, and A6.
3. **A4 → A5 → A6 → A7** — the room's contents, in that order (each depends on the last's proxy work).
4. **A12** junction resolver — owed since 2026-07-25 and blocking every culture A/B claim.
5. **A9 → A10** — deck over room, then storeys.
6. **A11**, **A13**, **A16** — in whatever order the first golden site demands.
7. **A14** at the terrain program's first deliverable; **A15** once A12 can express two profiles.
8. **A17** budget measurement before any site fixture is attempted.
9. **A18 / CL-R6** — the terminal gate, now covering assemblies as well as structure.
