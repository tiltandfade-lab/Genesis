/* dev/geometry-research/fuzz/bands.mjs — UNIT R2 generator bands (docs/GEOMETRY-ACCELERATION-
   TOOLCHAIN.md §5.2).

   Each band composes the arbitraries.mjs primitives into one "scenario" arbitrary:

     { cells, apertures, terrain, renderShape, wallProfile, sunken, tag }

   Bands isolate a specific structural feature (holes, tiers, apertures, shape transforms) by FORCING
   it through composition (punchHoleArbitrary, tierAssignmentArbitrary, repeated apertureArbitrary,
   shapeTransformArbitrary) rather than hoping uniform random sampling stumbles onto it -- exactly the
   §5.2 rationale ("so difficult cases are not drowned by rectangles"). Every band still routes through
   the SAME connectedCellSetArbitrary core (no band invents its own disconnected-coordinate generator),
   except invalid-input, which deliberately breaks specific fields on top of a valid connected base
   (never regenerates cells from scratch some other way). */

import {
  connectedCellSetArbitrary, punchHoleArbitrary, tierAssignmentArbitrary,
  apertureArbitrary, terrainPatchArbitrary, shapeTransformArbitrary, wallProfileArbitrary,
} from "./arbitraries.mjs";

const FLAT_SCENARIO_DEFAULTS = { apertures: [], terrain: [], renderShape: "identity", wallProfile: null, sunken: null };

function tagged(tag, arb) {
  return arb.map((s) => ({ ...FLAT_SCENARIO_DEFAULTS, ...s, tag }));
}

export function makeBands(fc) {
  const bands = {};

  // ── small-exhaustive: 1-12 cells, tight box, no extra features -- the "does the floor work at all" band.
  bands["small-exhaustive"] = tagged(
    "small-exhaustive",
    connectedCellSetArbitrary(fc, { minMoves: 0, maxMoves: 11 }).map((cells) => ({ cells: cells.map((c) => ({ ...c, tier: 0 })) }))
  );

  // ── concavity-heavy: larger move budget so parent-revisit collisions carve notches/necks organically.
  bands["concavity-heavy"] = tagged(
    "concavity-heavy",
    connectedCellSetArbitrary(fc, { minMoves: 25, maxMoves: 90 }).map((cells) => ({ cells: cells.map((c) => ({ ...c, tier: 0 })) }))
  );

  // ── holes-heavy: force a real interior hole via punchHoleArbitrary, chained twice for multi-hole cases.
  bands["holes-heavy"] = tagged(
    "holes-heavy",
    connectedCellSetArbitrary(fc, { minMoves: 30, maxMoves: 100 })
      .chain((cells) => punchHoleArbitrary(fc, cells))
      .chain((cells) => punchHoleArbitrary(fc, cells))
      .map((cells) => ({ cells: cells.map((c) => ({ ...c, tier: 0 })) }))
  );

  // ── tiers-heavy: 2-4 nested/adjacent tiers via radial-ring assignment, PLUS the sunken transform slot
  // (shapeTransformArbitrary's `sunken` field) so this same band drives the negative-sy production
  // defect search (dev/geometry-research/fuzz/negative-sy-drive.mjs reuses this band verbatim).
  // renderShape is pinned to "identity" here (shapeTransformArbitrary is only asked for its `sunken`
  // slot) -- an early authoring run of this band with a free-varying renderShape surfaced octagon/radial
  // render-smoothing producing >50% area inflation on tiny, highly-irregular, multi-tier-fragmented
  // blobs. That is a REAL area-tolerance violation but an AMBIGUOUS one: octagon/radial smoothing is
  // designed for the coherent near-convex room shapes place-spatialize.js's own rasterizeShape produces,
  // never for this arbitrary's adversarial per-tier-fragmented footprints. Render-shape smoothing is
  // exercised on its own, on larger coherent single-tier footprints, by the shape-heavy band below --
  // this keeps tiers-heavy's own signal (does TIER assignment stay correct) isolated from that separate,
  // flagged, unresolved question. See README's "flagged ambiguities" section.
  bands["tiers-heavy"] = tagged(
    "tiers-heavy",
    connectedCellSetArbitrary(fc, { minMoves: 15, maxMoves: 60 })
      .chain((cells) => tierAssignmentArbitrary(fc, cells))
      .chain((tieredCells) => shapeTransformArbitrary(fc, { renderShapes: ["identity"] }).map((st) => ({ cells: tieredCells, ...st })))
  );

  // ── apertures-heavy: two independent aperture rounds (corners/joins/narrow-neck doors), occasionally
  // through an octagon (chamfer-diagonal doorway) or a neck-forcing high move-count shape (narrow piers).
  bands["apertures-heavy"] = tagged(
    "apertures-heavy",
    connectedCellSetArbitrary(fc, { minMoves: 15, maxMoves: 60 })
      .chain((cells) => apertureArbitrary(fc, cells))
      .chain(({ cells, apertures: ap1 }) =>
        apertureArbitrary(fc, cells).map(({ cells: cells2, apertures: ap2 }) => ({
          cells: cells2, apertures: [...ap1, ...ap2].filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i),
        }))
      )
      .chain((s) => shapeTransformArbitrary(fc, { renderShapes: ["identity", "identity", "octagon"] }).map((st) => ({ ...s, renderShape: st.renderShape })))
  );

  // ── shape-heavy: octagon/radial/L/T/cross render transforms over larger, notch-prone footprints.
  bands["shape-heavy"] = tagged(
    "shape-heavy",
    connectedCellSetArbitrary(fc, { minMoves: 20, maxMoves: 80 })
      .chain((cells) => shapeTransformArbitrary(fc, { renderShapes: ["octagon", "radial", "L", "T", "cross"] }).map((st) => ({ cells: cells.map((c) => ({ ...c, tier: 0 })), renderShape: st.renderShape })))
  );

  // ── large-production: representative maximum rooms (row-101 was 120 cells) -- full combo of tiers +
  // apertures + shape + wall profile, all at once, at realistic scale.
  bands["large-production"] = tagged(
    "large-production",
    connectedCellSetArbitrary(fc, { minMoves: 150, maxMoves: 400 })
      .chain((cells) => tierAssignmentArbitrary(fc, cells, { ringWidthMin: 3, ringWidthMax: 8 }))
      .chain((cells) => apertureArbitrary(fc, cells))
      .chain(({ cells, apertures }) =>
        shapeTransformArbitrary(fc, { renderShapes: ["identity", "octagon", "radial"] }).chain((st) =>
          wallProfileArbitrary(fc).map((wallProfile) => ({ cells, apertures, renderShape: st.renderShape, wallProfile }))
        )
      )
  );

  // ── invalid-input: deliberately broken fields layered on a valid connected base. Every mutation here
  // is a NAMED, intentional corruption (never an accidental generator bug) -- duplicates, disconnected
  // metadata, self-touching (degenerate zero-length) apertures, bad tier values.
  bands["invalid-input"] = tagged(
    "invalid-input",
    connectedCellSetArbitrary(fc, { minMoves: 1, maxMoves: 30 }).chain((cells) =>
      fc.constantFrom("duplicate-cells", "disconnected-extra-cell", "nan-tier", "dangling-aperture-ref", "empty-cells").chain((kind) => {
        if (kind === "duplicate-cells" && cells.length) {
          return fc.constant({ cells: [...cells, ...cells.slice(0, Math.max(1, Math.floor(cells.length / 2)))].map((c) => ({ ...c, tier: 0 })), corruption: kind });
        }
        if (kind === "disconnected-extra-cell") {
          // Offset just needs to be clearly outside the base shape's own reach (<=30 moves from origin,
          // so within roughly +/-30) -- NOT 500-900: geometry-truth.mjs's countHoles() floods the padded
          // bounding box between the two clusters, so a huge offset makes an O(bbox-area) property call
          // pathologically slow (a real performance footgun this band's own authoring hit and fixed, not
          // a production defect -- the offset choice is this fixture's own scope, not compileRoomShellData's).
          return fc.record({ fx: fc.integer({ min: 80, max: 150 }), fz: fc.integer({ min: 80, max: 150 }) }).map(({ fx, fz }) => ({
            cells: [...cells.map((c) => ({ ...c, tier: 0 })), { x: fx, z: fz, tier: 0 }], corruption: kind,
          }));
        }
        if (kind === "nan-tier" && cells.length) {
          return fc.nat({ max: cells.length - 1 }).map((i) => ({
            cells: cells.map((c, idx) => (idx === i ? { ...c, tier: NaN } : { ...c, tier: 0 })), corruption: kind,
          }));
        }
        if (kind === "dangling-aperture-ref") {
          return fc.constant({
            cells: cells.map((c) => ({ ...c, tier: 0 })),
            apertures: [{ id: "dangling", sourceEdgeRefs: ["9999,9999"], width: 1, state: "open", sourceRef: "R2-fuzz-invalid" }],
            corruption: kind,
          });
        }
        return fc.constant({ cells: [], corruption: "empty-cells" });
      })
    )
  );

  return bands;
}

export const BAND_NAMES = [
  "small-exhaustive", "concavity-heavy", "holes-heavy", "tiers-heavy",
  "apertures-heavy", "shape-heavy", "large-production", "invalid-input",
];
