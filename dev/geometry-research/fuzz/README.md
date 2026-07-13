# Geometry property-fuzz harness (R2)

`docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md` §3.5, §5, §13.5 — the property-based geometry fuzz harness
that stresses `compileRoomShellData` (`src/ui/theater-room-mesh.js`) with GENERATED inputs, on top of
G0's 52 hand-authored golden fixtures (`dev/geometry-research/fixtures/`).

## CHARTER STATEMENT (`docs/GRAPHICS-CONVERGENCE-CHARTER.md` §7)

- **Convergence rung advanced:** C0 (topology is correct) — stressed well beyond hand fixtures.
- **Canonical contracts preserved:** every generator here builds plain-data cell scenarios (`{cells,
  apertures, terrain, renderShape, wallProfile}`); nothing rolls game content, nothing enters
  `genesis.html`/`manifest.json`. This unit READS `src/ui/theater-room-mesh.js` only (via
  `adapters.mjs`, the same read-only posture G0's own harness uses) and never edits it or any other
  production file. Narrative RNG is never touched — every generator here is fast-check's own PRNG,
  fully separate from the walk/table engine's roll sequence.
- **Classification:** research-only, dev-only. Nothing under `dev/geometry-research/fuzz/` is imported
  by `genesis.html` or listed in `manifest.json`.
- **Negative control:** two REQUIRED red-first demonstrations, both included:
  1. `redfirst-faulty-adapter.mjs` — the property suite run against two deliberately broken adapters
     (`faulty-adapter.mjs`), proving the suite actually detects injected defects.
  2. `negative-sy-drive.mjs` — the tiers-heavy band driven at the known negative-`sy` production defect
     (`theater-boot.js:8888`), showing fast-check finds and shrinks a minimal case, confirmed outside
     fast-check, and promotes it as a regression fixture. **This unit does not fix the defect** — it
     proves and promotes it, per the explicit orchestrator instruction.

## Files

| File | Job |
| --- | --- |
| `require-tools.mjs` | resolves `fast-check` from `GEOMETRY_TOOLS_HOME` (R0's scratch tool home) via `createRequire`, mirroring `dev/geometry-tools/smoke-imports.mjs`'s own resolution pattern |
| `adapters.mjs` | `legacyAdapter` / `reconstructRings` / `productionShellCellsAdapter` — a read-only port of G0's own adapter logic (`dev/verify-geometry-fixtures.mjs`, which is a top-level script with no exports and so cannot be `import`ed as a module) against `src/ui/theater-room-mesh.js` |
| `faulty-adapter.mjs` | two deliberately-broken adapters (`faultyAdapterDropsCell`, `faultyAdapterFillsHole`) used ONLY by the required negative control |
| `arbitraries.mjs` | the 6 required custom fast-check arbitraries (§3.5) |
| `bands.mjs` | the 8 required generator bands (§5.2), each composing the arbitraries into a scenario |
| `properties.mjs` | the property suite (§5.1) |
| `run-fuzz.mjs` | main runner — PR-smoke by default, `--mode nightly\|release` documented/wired but not executed by this unit, `--band`/`--seed` for bug-hunt |
| `seed-ledger.json` | fixed seeds per band per mode (§5.3) |
| `promote-regression.mjs` | writes/lists promoted regressions in the exact §3.5 JSON shape |
| `redfirst-faulty-adapter.mjs` | REQUIRED negative control #1 |
| `negative-sy-drive.mjs` | REQUIRED negative control #2 |
| `promote-bonus-findings.mjs` | promotes two additional real defects the PR-smoke run surfaced (see "Bonus findings" below) |
| `regressions/*.json` | promoted regression fixtures (3 total — see below) |
| `run-report.pr-smoke.json` | the honest PR-smoke output data (regenerate with `node run-fuzz.mjs`) |

## The 6 custom arbitraries (§3.5)

All defined in `arbitraries.mjs`, each taking the resolved `fc` module as its first argument:

- **`connectedCellSetArbitrary(fc, {minMoves, maxMoves})`** — the load-bearing one. GROWS a cell set
  from a seed cell `(0,0)` by legal cardinal (4-connectivity) neighbor moves, so every generated set is
  connected BY CONSTRUCTION — never an arbitrary coordinate array filtered down by a precondition (the
  exact anti-pattern §3.5 warns against). A move landing on an already-occupied cell is a harmless
  no-op, not a rejected sample. Its shrinker is fast-check's own array shrinker acting on the move
  sequence: shrinking removes moves from the END first, which drops the LATEST-attached (leaf-most)
  cells while every earlier move's parent reference stays valid (parents are always earlier-indexed
  cells) — a shrunk case is always still connected, and shrinking prefers dropping leaves.
- **`tierAssignmentArbitrary(fc, cells, options)`** — assigns tiers by quantized radial distance from a
  generated center, producing genuinely NESTED tiers (not independent-per-cell noise).
- **`apertureArbitrary(fc, cells, options)`** — picks a real boundary cell (one missing a cardinal
  neighbor) and marks it `isDoor:true`.
- **`terrainPatchArbitrary(fc, cells, options)`** — tags a contiguous sub-run of cells as one terrain
  patch record, mirroring G0's own `corpus.mjs` `terrain:[{id,tier,cells,sourceRef}]` shape.
- **`shapeTransformArbitrary(fc, options)`** — picks a `renderShape` (identity/octagon/radial/L/T/cross)
  and, separately, an optional `sunken` slot (`{depth}`) used by the negative-sy driver.
- **`wallProfileArbitrary(fc, options)`** — bounded to the realm/material bands documented at each
  `DEFAULT_WALL_*` constant's own definition site (`src/ui/theater-room-mesh.js:125-129`).

One combinator, `punchHoleArbitrary(fc, cells)`, composes `connectedCellSetArbitrary`'s output into
ring/donut shapes for the holes-heavy band without inventing a 7th named primitive.

## The 8 generator bands (§5.2)

`bands.mjs`: `small-exhaustive`, `concavity-heavy`, `holes-heavy`, `tiers-heavy`, `apertures-heavy`,
`shape-heavy`, `large-production`, `invalid-input`. Each isolates its named feature by FORCING it
through composition, not by hoping uniform sampling stumbles onto it. See the file's own header comment
for the isolation rationale on `tiers-heavy` specifically (a documented ambiguity — see below).

## The property suite (§5.1)

20 named properties in `properties.mjs`, matching §5.1's list one-to-one. 17 are real, executable
checks against `legacyAdapter`. **3 are marked `SKIPPED_AMBIGUOUS`** (not faked green): the wall-offset
trio (`wall-offset-contains-inner-envelope`, `wall-offset-no-self-intersection`,
`wall-offset-distance-within-tolerance`). `legacyAdapter`'s wall segments carry `innerA`/`innerB` only —
`outerA`/`outerB` are always `null` (a KNOWN GAP inherited verbatim from G0's own harness comment). There
is no outer wall envelope in the current shared output contract to test against; a real offset kernel is
G1/G2's job.

## Run modes (§5.3)

```
node run-fuzz.mjs                       # PR-smoke: fixed seeds, 500 cases/band, ALL bands, + promoted-regression replay
node run-fuzz.mjs --band tiers-heavy    # PR-smoke, one band
node run-fuzz.mjs --mode nightly        # 25,000 cases/band -- flag wired, NOT run as part of landing R2
node run-fuzz.mjs --mode release        # 100,000 cases/band -- flag wired, NOT run as part of landing R2
node run-fuzz.mjs --band X --seed N     # bug-hunt: replay one band/seed with the PR-smoke case count
```

Per the toolchain doc's own instruction, nightly/release run counts are wired (`seed-ledger.json` has a
full seed set for both) but were **not executed** during R2's authoring — only PR-smoke (500/band) and
the two dedicated red-first drivers (300-500 cases each) actually ran.

## PR-smoke results (actual run, this session — regenerate with `node run-fuzz.mjs`)

This is DATA, not a gate, exactly like G0's own `baseline-report.json` posture ("this is DATA, not a
gate — G0's job is an honest baseline, not a green legacy"). `run-report.pr-smoke.json` is the full
machine-readable output; summary:

| band | pass/20 | failing properties |
| --- | --- | --- |
| small-exhaustive | 20/20 | — |
| concavity-heavy | 19/20 | union-idempotent |
| holes-heavy | 19/20 | union-idempotent |
| tiers-heavy | 14/20 | union-area, union-idempotent, quarter-turn-rotation, reflection, triangulated-area, triangle-centroids |
| apertures-heavy | 16/20 | union-area, union-idempotent, triangulated-area, triangle-centroids |
| shape-heavy | 13/20 | union-area, union-idempotent, quarter-turn-rotation, reflection, triangulated-area, triangle-centroids, floor-cell-bounded-triangle |
| large-production | 12/20 | union-area, union-idempotent, quarter-turn-rotation, reflection, triangulated-area, triangle-centroids, floor-cell-bounded-triangle, apertures-remove-intervals |
| invalid-input | 14/20 | union-area, union-idempotent, quarter-turn-rotation, reflection, triangulated-area, all-vertices-finite, apertures-remove-intervals (`typed-invalid-input-never-crashes-or-blanks` — the property this band exists to prove — PASSES in every case) |

Every failure traces back to one of **two real, confirmed root causes** (never a distinct new class per
band):

1. **`union-idempotent` fails on concave/branching cell sets under full input duplication** — see "Bonus
   findings" below. This is the dominant driver of `union-area`/`triangulated-area` failures too, since
   several properties reuse the duplicate-input technique.
2. **Render-shape smoothing (octagon/radial/L/T/cross) applied to arbitrary, adversarial, highly
   irregular/multi-tier-fragmented footprints produces large area/topology deviations** (one measured
   case: 53% area inflation). This is FLAGGED AMBIGUOUS, not promoted as a defect — see below.

`wallProfileArbitrary`'s generated profiles never independently caused a failure beyond these two
causes.

## REQUIRED negative control #1 — faulty adapter (`redfirst-faulty-adapter.mjs`)

Both deliberately-injected faults (`faultyAdapterDropsCell` — removes all triangles centroid-owned by
one cell; `faultyAdapterFillsHole` — fans a hole shut, ignoring it) were caught and shrunk on the
`large-production` band:

```
=== negative control: faulty-adapter-drop-cell (seed=400001, numRuns=300) ===
  [CAUGHT] union-area-equals-unique-cells -- numRuns before failure: 2, shrunk cell count: 66
    detail: {"expected":66,"got":80.85...,"tol":5.28}
  [CAUGHT] every-canonical-floor-cell-maps-to-bounded-triangle -- numRuns before failure: 1, shrunk cell count: 83
    detail: {"missing":["-4,-3"],"totalMissing":1}
  [CAUGHT] triangulated-area-equals-normalized-polygon-area -- numRuns before failure: 1, shrunk cell count: 83

=== negative control: faulty-adapter-fill-hole (seed=400002, numRuns=300) ===
  [CAUGHT] union-area-equals-unique-cells -- numRuns before failure: 1, shrunk cell count: 58
    detail: {"expected":58,"got":122.09...,"tol":4.64}
  [CAUGHT] triangulated-area-equals-normalized-polygon-area -- numRuns before failure: 1, shrunk cell count: 58
  [CAUGHT] triangle-centroids-inside-outer-outside-holes -- numRuns before failure: 1, shrunk cell count: 58

RED-FIRST NEGATIVE CONTROL HOLDS: both deliberately-injected faults were caught and shrunk by fast-check.
```

Run it yourself: `node redfirst-faulty-adapter.mjs` (exits 0 iff both faults were caught).

## REQUIRED negative control #2 — negative-`sy` drive (`negative-sy-drive.mjs`)

Drives the `tiers-heavy` band (via its `sunken` slot) at `theater-boot.js:8888`'s known defect (a
negative `sy` silently falls back to the flat floor height, so a sunken tier collapses onto the
baseline tier — the same defect class G0's `F18-row101-exact-canonical` fixture proves on ONE
hand-authored shape). fast-check found and shrank an INDEPENDENT minimal case:

```
=== driving tiers-heavy toward the negative-sy defect (seed=400003, numRuns=500) ===
  [SHRUNK] numRuns before failure: 2, shrunk cell count: 17
    shrunk scenario sunken: {"depth":1.9999985694885254}
    property detail: {"collapsed":true,"arenaTiers":[1],"baselineTiers":[1],"arenaCellCount":3}

=== confirming outside fast-check (deterministic one-case replay) ===
  reproduced outside fast-check: true

  promoted: geo-regression-be825c9cc76b
NEGATIVE CONTROL #2 HOLDS.
```

Run it yourself: `node negative-sy-drive.mjs`. **This does not fix `theater-boot.js:8888`** — it proves
and promotes, per the explicit instruction that R2 only proves+promotes this defect.

## Promoted regressions (`regressions/`)

Three fixtures, all in the exact §3.5 JSON shape (`{id, foundBy, seed, path, property, cells, tiers,
apertures, profile, expected, firstSeenCommit}`, plus a `scenario`/`notes` extension), each confirmed
to reproduce OUTSIDE fast-check before being written (§5.4 step 3):

| id | property | what it proves |
| --- | --- | --- |
| `geo-regression-be825c9cc76b` | `sunken-tier-survives-production-guard` | **REQUIRED**: the negative-`sy` sunken-tier-collapse defect, minimal 17-cell case, independent of G0's row-101 fixture |
| `geo-regression-0965fc745dcf` | `union-idempotent` | **bonus**: concave/branching cell sets don't dedupe under full input duplication (a plain filled rectangle DOES dedupe correctly under the same duplication — this is topology-triggered) |
| `geo-regression-5f69b811eb7b` | `all-vertices-finite` | **bonus**: a single `tier:NaN` cell produces NaN floor vertex coordinates with zero diagnostics and no thrown error — worse than a clean crash |

All three replay consistently (still RED, as expected for an unfixed defect) via `run-fuzz.mjs`'s own
promoted-regression replay step — see its `=== promoted regression replay ===` section. One replay
subtlety, documented rather than hidden: JSON has no `NaN` literal, so a promoted `tier:NaN` case
round-trips through JSON as `tier:null`; `run-fuzz.mjs`'s replay step rehydrates `null` back to `NaN`
before re-running (the one value this program's own invalid-input generator ever produces for `tier`).

None of these three defects were fixed by this unit — R2's job is proving and promoting, never fixing
production code, per this unit's own explicit scope and `CLAUDE.md`'s "propose + archive before any
destructive edit" discipline extended to production geometry code.

## Flagged ambiguities (for the orchestrator)

1. **Render-shape smoothing on adversarial/arbitrary shapes.** `octagon`/`radial`/`L`/`T`/`cross`
   smoothing (`compileRoomShellData`'s `opts.smoothShape`) is designed for the coherent, near-convex
   room shapes `src/engine/place-spatialize.js`'s own `rasterizeShape` produces — never for
   `connectedCellSetArbitrary`'s adversarial, highly-irregular, sometimes multi-tier-fragmented
   footprints. One measured case showed 53% area inflation, wildly outside any reasonable smoothing
   tolerance. This is a REAL, reproducible area-tolerance violation but an AMBIGUOUS one: is smoothing
   actually broken, or is this simply outside its intended input domain (real production rooms only ever
   reach `compileRoomShellData` with `smoothShape` set for shapes `rasterizeShape` itself generated)?
   `tiers-heavy` and other property-suite bands pin `renderShape:"identity"` specifically to avoid
   conflating this open question with their own named signal; `shape-heavy` and `large-production`
   still exercise it (honestly, per §5.4's "never patch a generator to stop producing a valid room that
   exposes a bug" — restricting the SHAPE's own topology to something rasterizeShape-plausible would be
   exactly that kind of patch). **Not promoted as a regression** pending a ruling on whether this input
   domain is even reachable in production.
2. **`reflection-preserves-topology-flips-winding`'s literal wording doesn't hold at the raw-trace
   level for this implementation** (see the property's own long in-code comment in `properties.mjs`).
   `traceTierContour`/`chainEdgesIntoRings` re-derive a boundary from cell adjacency rather than
   mirroring an ordered vertex list, and empirically produce the SAME raw winding sign for an outer ring
   regardless of reflection — arguably the more robust design (canonical orientation by construction),
   but it means the raw-sign-flip half of §5.1's property doesn't apply as literally stated. The
   property was redefined to check what's actually meaningful (topology/area preserved, triangle winding
   stays internally consistent under reflection, and the underlying `signedArea2D` self-check on an
   explicitly-mirrored vertex list still holds as a pure math identity) rather than silently deleting
   the requirement.
3. **`every-canonical-floor-cell-maps-to-bounded-triangle`'s real contract**: `cellTriangleMap[key]` is
   `{tier, triIndex}` — ONE representative global triangle per cell (chosen because it contains that
   cell's own point), not a full per-cell triangle list (`theater-room-mesh.js:1132`'s own doc comment).
   The property was written against this real contract using legacy's own `pointInTriangle2D` primitive;
   flagged here because the doc's plain-English property name ("maps to A bounded triangle," singular)
   doesn't by itself make this one-representative-triangle contract obvious.

## Regenerating

`fast-check` must already be installed in `GEOMETRY_TOOLS_HOME` (R0's job — `node
dev/geometry-tools/setup.mjs`). Nothing in this directory installs or vendors anything itself.
