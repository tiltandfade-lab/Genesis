---
type: orchestration-plan
project: Genesis
status: ACTIVE
updated: 2026-07-12
governed_by: GRAPHICS-CONVERGENCE-CHARTER.md
composes: GEOMETRY-OSS-INTEGRATION.md (G0-G6), GEOMETRY-ACCELERATION-TOOLCHAIN.md (R0-R9), GRAPHICS-PRODUCTION-RESEARCH-WAVE.md (GP-1..4)
audience: Claude orchestration sessions
---

# Graphics Convergence Plan — the execution spine

The charter (`GRAPHICS-CONVERGENCE-CHARTER.md`) governs intent; the three research docs each carry
their own unit plan (G0-G6 / R0-R9 / GP-1..4). This doc is the **orchestration spine** that composes
them into phased waves with real dependencies, mapped to the C0-C8 ladder. It is the plan the
orchestrator drives; it authors no new architecture.

## The layered stack (why three docs = one trajectory)

```
GRAPHICS-PRODUCTION-RESEARCH-WAVE (GP-1..4)  BEAUTY payload — oracle · materials/UV · atlas · distribution · VFX
                 rides on
GEOMETRY-OSS-INTEGRATION (G0..G6)            STRUCTURE — PolygonKernel · robust floors/holes/tiers/walls · provenance
                 selected by
GEOMETRY-ACCELERATION-TOOLCHAIN (R0..R9)     SELECTION + TOOLING — four-path bakeoff + fuzz/lint/capture-regression
```

Beauty-wave framing: **BW6 = Geometry Convergence** (structure provably correct + robust; retires the
bespoke miter/wall-shell math if the bakeoff says so) → **BW7 = Visual Production** (oracle-gated push
to the vision renders). Dev tooling (fast-check, webgl-lint/Spector, pixelmatch, stats-gl) is the
instrumentation floor under both.

## Trajectory-changing facts (from the combed research)

- The just-landed **C4.1a corner-miter + C4.1c hole-bridging are the P0 baseline** the four-path
  bakeoff must beat. If Clipper2 robust offsetting wins (P2/P3), that bespoke wall-shell math
  **retires** — eliminating endpoint hooks / acute spikes / adjacent-volume gaps / concave overlaps by
  construction. Nothing is hand-adopted before R1 decides. Fixture #20 = "the known S-hook regression
  from the production octagon."
- **The two open bugs are subsumed, not spot-fixed:**
  - **negative-`sy`** (sunken arena collapses; `theater-boot.js` `f.sy > 0` discards negative) is the
    **row-101 hole-preservation class** the geometry model is built for. It lands correctly in the
    geometry integration (floor-congruence prereq / G2 tier-surface resolution) and is caught+promoted
    permanently by R2's `tiers-heavy` fuzz band + reflection/transform invariants. A one-line patch
    papers over a domain being rebuilt.
  - **room-shell-render serialization** (`_interiorRoomShellForTest` returns raw THREE.Mesh) is
    prevented by construction — the PolygonKernel's "no THREE type escapes the adapter" rule, plus the
    R3 WebGL-diagnostic harness. The seam returns kernel plain-data (Codex already showed the JSON-safe
    pattern with `_graphicsResearchInventoryForTest`).

## Phase plan

### Phase 0 — instrumentation foundation (NOW; dev-only, new paths, ZERO production edits)

Enables C0 (topology correct) verification + the no-human-production instrumentation. Everything here
is new spike/fixture/harness paths that cannot collide with production.

| Unit | Charter rung | Ownership (new paths) | Classification | Negative control |
|---|---|---|---|---|
| **R0** tool bootstrap + dependency/license ledger | (enabling) | scratch `~/.genesis-geometry-tools` setup script + `dev/geometry-tools/LEDGER.md` + smoke tests | research/build-time | a smoke import fails loudly if a pin/integrity/license is wrong |
| **G0** golden fixture corpus + pure kernel verify-harness skeleton | C0 | `dev/geometry-research/fixtures/` + `dev/verify-geometry-fixtures.mjs` | research-only | ≥1 RED fixture reproduces a real known defect (S-hook octagon, row-101 sunken collapse) before any kernel exists |
| **R2** fast-check property-fuzz harness + arbitraries | C0 | `dev/geometry-research/fuzz/` + promoted-regression dir | research-only | red-first against a deliberately faulty adapter; shrinks the negative-`sy` case |
| **R3** WebGL diagnostics (webgl-lint + Spector) | (enabling) | `dev/graphics-debug/` | research-only | zero GL-lint errors on the deterministic corpus; proves absent from release boot |
| **R4** pixelmatch capture-region regression | (enabling) | `dev/graphics-research/capture-regions/` + region-mask data | research-only | red-first on a one-pixel/topology mutation |
| **GP-1** GPU telemetry + material census | C7 (measurement) | `dev/battle-gate/capture-gpu-telemetry.mjs` + `dev/verify-transparent-material-contract.mjs` | dev harness | census reports unique resources separately from draw submissions; no runtime behavior change |

**Wave A (parallel):** R0 + G0 (G0 is pure Node, no tool dependency; R0 populates the scratch tool
home). **Wave B (after R0's scratch home + ledger land):** R2, R3, R4, GP-1 in parallel (they import
the pinned tools).

Canonical contracts every Phase-0 unit preserves: the walk + logical cells + rolled cards are inputs
only; no unit edits `src/` production render/geometry code; no unit mutates narrative RNG.

### Phase 1 — the geometry decision (after Phase 0)

**R1** four-path bakeoff (P0→P3) + **G1** PolygonKernel adapter (vendored Earcut + polygon-clipping,
Clipper2 spike) → **R6** selection amendment. Settles booleans/triangulation/wall-offset/predicates
ownership on evidence. Advances toward C1.

### Phase 2 — geometry integration (behind `legacy|oss-compare|oss`)

**G2** floor (Earcut holes → floor congruence + negative-`sy` correct + independent-riser static
substrate) → **G3** walls/apertures/cell-map (serialization seam fixed JSON-safe here). C4.1b/E0
harnesses stay green. Advances C0→C1, unblocks C2/C4. Independent-riser dynamic raise/lower rides on
this substrate when Codex's riser research lands (still parked).

### Phase 3 — visual production (BW7)

**GP-2** path-traced oracle + xatlas UV → **GP-3** Poisson distribution + atlases → **GP-4**
oracle-driven raster corrections (named deltas: contact shadow, cap separation, ambient fill, normal
response) + semantic materials + VFX vocabulary. Advances C2→C6/C8.

### Parallel report-only spikes (non-blocking)

R5/G6 JSCAD/Manifold prop foundry → R8 glTF pipeline; R9/N8AO AO spike; G4 three-mesh-bvh spike.

## Orchestration law (this wave)

- Every Phase-0 unit is a background executor in an isolated worktree on **new paths only**; it never
  edits production `src/` and never merges master.
- Executors state, per charter §7, before implementing: rung advanced · canonical contracts preserved ·
  exact fixtures/refs for acceptance · the load-bearing negative control · runtime/build/research/art
  classification.
- Orchestrator re-gates every unit personally (never on self-report), READS every capture, serializes
  `--no-ff` merges, pushes master after each, updates shared docs once at close.
- Adopt/defer/reject by the charter §5 doctrine + the toolchain evidence gates; a rejected library with
  durable evidence is a successful outcome.
