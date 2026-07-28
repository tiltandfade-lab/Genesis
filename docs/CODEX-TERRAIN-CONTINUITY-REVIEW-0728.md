# Codex terrain-continuity review — 2026-07-28

**Scope:** `feat/terrain-bench-r1` → `feat/terrain-expression` →
`feat/terrain-expression-r2`, reviewed at `7fc21259` plus the edits named below.

**Verdict:** **HOLDS WITH EDITS as a terrain-expression prototype.** It did not hold as a claim of
FFT/XCOM-like continuous terrain before these edits, and it is not promoted to a final production
terrain architecture here.

The chassis, deterministic field construction, fixture coverage, standee contact work, overhang
licence, and render/gameplay separation are useful. The visible result nevertheless looked like
earthquake-displaced tiles because the surface rules were local to each cell. Every plane could pass
its angle test while two neighbouring planes disagreed about the same edge.

## Refuted claims

### 1. “One declared stand plane” did not mean one continuous surface

`terrainCellStandPlane` published one plane **per cell**. Its old central-difference gradient leaned
an isolated step, crest, foot, or outside corner whenever one neighbour differed. No rule required a
slope to continue through the next cell, and no gate compared the two cells' heights at a shared
point.

Measured on the route proof before repair, using the rendered top sampler:

- all devices, g2: maximum shared-edge disagreement **0.4463 wu**, p95 **0.3389 wu**, mean
  **0.0669 wu**; **420 / 522** samples exceeded the 0.012-wu visibility floor;
- g3 did not solve it: maximum **0.4026 wu**, p95 **0.2514 wu**;
- even same-tier material/g0 edges reached **0.0793 wu** because cell-local sub-noise and folds
  disagreed.

Those are geometric cracks, not taste differences. The angle gate was testing the wrong
proposition.

### 2. The fold rule spent maximum relief at the worst possible place

The old radial `r²` profile was zero at the stand point and maximal at the cell rim. Adjacent cells
then added independently signed, independently oriented offsets to the same edge. The protected
standee centre remained safe while the field visibly broke apart around it. The contact proof and
fold-amplitude proof both passed because neither measured neighbour agreement.

The diagonal was also described as serving the terrain, but it was only a cell-coordinate hash. A
random deterministic bit is not terrain continuity.

### 3. The default 18-degree grade could not connect the integer field

The logical field places neighbouring run centres one quantum apart. Applying a 0.65-quantum g2
plane independently to those centres necessarily leaves a residual 0.35-quantum riser. G2 remains
a useful FFT comparison register, but it cannot be the default continuous rendering of a one-height
per-cell Genesis run. A shallower continuous ramp needs a longer authored logical run, not a smaller
angle multiplier over the same centres.

### 4. The gameplay fingerprint had three blind spots

The six-mutation proof omitted:

- `climbAdj`, which changes non-flying reachability;
- `cell.difficult`, which changes movement cost;
- face `climbable` / `climbDc`, which changes traversal.

The old “COSMETIC” gate could therefore stay green on those gameplay changes. The proof now catches
all nine mutation classes.

### 5. The fine joint did impersonate the tactical grid

The diagnosis in the handover holds. A complete 4×4 square lattice was not material texture; it was
a second tactical grid. In addition, both cells drew the same coarse shared edge with multiply
blending, turning a nominal 55% line into roughly a 30% black outline. That made even a flat terrace
read as a tray of separate blocks.

### 6. Regular face banding was a rejected style embedded as a generic engine device

A7 applied evenly spaced horizontal bands to every exposed face. Reducing their proud offset fixed
the “protruding rail” defect but preserved the rejected sedimentary rhythm. That is not a generic
FFT/XCOM continuity device and cannot be smuggled back as a subtler material-value stripe. A7 has
been removed from the device registry and renderer; the historical `decal` URL remains only as an
inert compatibility control identical to `material`.

## Edits applied

| File | Edit | Why |
|---|---|---|
| `src/engine/terrain-expression.js` | A grade now requires a monotone three-centre run. Isolated steps, crests, feet, and corners stay flat with honest risers. | Angles now describe terrain topology rather than arbitrary neighbour differences. |
| same | Walkable cell centres no longer receive independent `sub` offsets. | Same-tier centres cannot begin with random height disagreement. |
| same | Added a shared-boundary resolver and `terrainSurfaceContinuityReport`. | Continuous neighbours publish one height at the same edge; the missing visual proposition is executable. |
| same | B4 fold uses an interior bell, zero at centre and the full perimeter; its diagonal follows the fall line or quieter neighbour axis. | Relief cannot crack a shared edge, and diagonals suggest landform continuity. |
| same | Default render grade changed from g2 to g3; g2 remains selectable. | G3 is the only existing rung that exactly connects a legal one-quantum-per-cell run. |
| same | Added `TERRAIN_FINE_JOINT_LAW` with clipped staggered running bond. | Fine material seams terminate inside the cell and cannot form a second map lattice. |
| same | Expanded the gameplay fingerprint to difficult terrain, climb adjacency, and face climb facts. | “Cosmetic” now covers the traversal facts this chassis actually exposes. |
| `src/ui/theater-clay-room.js` | Caps sample a 5×5 faceted interior rather than two triangles; equal/shared edges resolve through the engine law; skirts draw only on downhill/exposed sides. | The fold can exist inside the surface without opening seams or outlining every tile. |
| same | Each tactical edge is emitted once. Continuous-surface seams are restrained; real relief boundaries remain strong. | Height topology owns the silhouette while the five-foot grid stays readable. |
| same | Removed A7 regular horizontal face bands and their renderer function. | The rejected sedimentary ridge treatment is no longer part of the terrain engine. |
| same | Capture receipts record surface-continuity and joint-law results. | A future render cannot silently regress while the old angle gate stays green. |
| `dev/verify-terrain-expression*.mjs` | Added neighbour-continuity, perimeter-fold, joint-topology, renderer-routing, and nine-mutation proofs. | Every repaired failure now has a gate that can name it. |
| `manifest.json` | Registered the new engine-owned laws and instruments. | Module ownership remains explicit. |

After repair, the official route-proof receipt reports **480 shared-surface samples, 0 failures,
0 maximum gap** at g3. The live frame census reports 192 staggered-running-bond joint groups and no
fine-joint boundary breach. The clean production view shows continuous floors and ramp bands first,
with the tactical lattice subordinate to actual risers and cliffs. A second clean capture after the
A7 removal confirms exposed faces have no repeated horizontal ridge geometry.

## What still does not hold

- The renderer still assembles one shaft and cap per logical cell. This pass repairs how those cells
  join; it does not replace them with a contour-compiled regional mesh.
- True non-rectilinear top footprints, shared contour bevels, undercuts, floor-over-floor terrain,
  and authored multi-cell shallow ramps remain future terrain-architecture work.
- The fixture's route proof deliberately contains tall rectilinear walls. It should look like
  coherent terraces and ramp runs now, not like natural eroded geology.
- G1, g2, and g4 remain comparison renders with intentional residual seams where their centre delta
  cannot match the logical field. Only g3 joins a current one-quantum run.
- The proposed eased-climb DC is gameplay data even if no current consumer reads it. This review
  does not adopt it.

The next cleanup should consolidate the terrain studies and old amended decisions, then decide
whether production terrain remains cell-cap assembly or graduates to a field-level contour mesh.
Do not add more per-cell cosmetics until that architecture decision is made.

## Founder packet

1. **Maximum rendered/logical grade.** Recommendation: use g3 / 26.565° as the production ceiling
   for current one-cell logical runs. Keep g4 / 30° experimental until a logical grade model exists;
   otherwise the renderer spends slope headroom the gameplay field cannot describe continuously.
2. **Logical shallow grades.** Recommendation: yes eventually, authored as multi-cell runs with
   explicit endpoints and traversal semantics. Do not fake them by scaling an integer one-cell step.
3. **Medium-accessibility floor.** Still pending. The current 100% Medium-accessible corpus does not
   prove the proposed 85% rule and contains none of the Small/Tiny-only pockets it aims to govern.
4. **Overhang licence and 34% cap.** No contradiction found here; leave proposed rather than promote.
5. **Eased climb DC.** Do not adopt until climb DC has a real gameplay consumer and the visible
   affordance is tested through that path.
6. **Joint remedy.** Applied as staggered clipped coursing plus reduced value contrast and
   single-owner tactical edges. This follows the new continuity direction and preserves the visible
   traversability-grid ruling.

## Verification

- `node dev/verify-terrain-expression.mjs` — **77 passed, 0 failed**
- `node dev/verify-terrain-expression-r2.mjs` — **53 passed, 0 failed**
- `node dev/verify-terrain-bench.mjs` — **73 passed, 0 failed**
- `node dev/verify-terrain-standee.cjs 5182` — **72 passed, 0 failed**
- `node dev/verify-terrain-standee-r2.cjs 5182` — **71 passed, 0 failed**
- both expression `--red` runs — **0 accidental passes**
- `python3 build/check-manifest.py` — **RESULT: OK**
- official browser capture, `route-proof / all / g3` — continuity receipt **480 / 0 / 0**
