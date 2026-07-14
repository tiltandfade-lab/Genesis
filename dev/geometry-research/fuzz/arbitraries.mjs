/* dev/geometry-research/fuzz/arbitraries.mjs — UNIT R2 custom arbitraries (docs/GEOMETRY-
   ACCELERATION-TOOLCHAIN.md §3.5).

   Every arbitrary here takes the already-loaded `fc` module as its first argument (fast-check is
   resolved at runtime from GEOMETRY_TOOLS_HOME via require-tools.mjs — these functions never import
   fast-check directly, so they stay agnostic to how it was resolved).

   connectedCellSetArbitrary is the load-bearing one: it GROWS a cell set from a seed cell by legal
   cardinal (4-connectivity) neighbor moves, so every generated set is connected BY CONSTRUCTION — never
   an arbitrary coordinate array filtered down by a precondition (§3.5's explicit anti-pattern warning).
   Its shrinker is fast-check's own array shrinker acting on the move sequence: shrinking removes moves
   from the END first, which removes the LATEST-attached (leaf-most) cells while every earlier move's
   parent reference stays valid (parents are only ever earlier-indexed cells) — so a shrunk case is
   always still connected, and shrinking strictly prefers dropping leaves over disconnecting the middle
   of the shape, matching the required shrink law. */

const CARDINAL = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** growCellsFromMoves(moves) -> connected cell array, deterministic fold over a move sequence.
    A move that would land on an already-occupied cell is a harmless no-op (not a rejected sample —
    this is why the arbitrary never discards generated values via a precondition). */
function growCellsFromMoves(moves) {
  const cells = [{ x: 0, z: 0 }];
  const keySet = new Set(["0,0"]);
  for (const mv of moves) {
    const parent = cells[mv.parentPick % cells.length];
    const [dx, dz] = CARDINAL[mv.dir % 4];
    const nx = parent.x + dx, nz = parent.z + dz;
    const k = `${nx},${nz}`;
    if (!keySet.has(k)) {
      keySet.add(k);
      cells.push({ x: nx, z: nz });
    }
  }
  return cells;
}

/** connectedCellSetArbitrary(fc, {minMoves, maxMoves}) -> Arbitrary<{x,z}[]>
    minMoves/maxMoves bound the move-sequence length, not the final cell count directly (collisions are
    expected and are what produces concavities/necks/near-holes, not a bug). Callers that need a
    specific minimum FINAL cell count should filter post-hoc on the mapped array length — done at the
    band level (bands.mjs), never inside this primitive, so this stays the one honest generator. */
export function connectedCellSetArbitrary(fc, options = {}) {
  const { minMoves = 0, maxMoves = 40 } = options;
  return fc
    .array(
      fc.record({ parentPick: fc.nat({ max: 4096 }), dir: fc.integer({ min: 0, max: 3 }) }),
      { minLength: minMoves, maxLength: maxMoves }
    )
    .map(growCellsFromMoves);
}

/** punchHoleArbitrary(fc, cells) -> Arbitrary<{x,z}[]> (post-processing combinator, not a new primitive)
    Picks an interior-adjacent cell (has all 4 cardinal neighbors present) and removes it plus optionally
    its own interior neighbors up to a small radius, IF doing so does not disconnect the remaining set —
    used by bands.mjs's holes-heavy band to compose connectedCellSetArbitrary into ring/donut shapes
    without inventing a 7th named arbitrary. Falls back to identity (no candidate) as an honest no-op. */
export function punchHoleArbitrary(fc, cells) {
  const interior = cells.filter((c) =>
    CARDINAL.every(([dx, dz]) => cells.some((o) => o.x === c.x + dx && o.z === c.z + dz))
  );
  if (!interior.length) return fc.constant(cells);
  return fc.nat({ max: interior.length - 1 }).map((i) => {
    const victim = interior[i];
    const punched = cells.filter((c) => !(c.x === victim.x && c.z === victim.z));
    return connectedComponentsQuick(punched).length === 1 ? punched : cells; // never disconnect
  });
}

function connectedComponentsQuick(cells) {
  const set = new Set(cells.map((c) => `${c.x},${c.z}`));
  const visited = new Set();
  const comps = [];
  for (const c of cells) {
    const k = `${c.x},${c.z}`;
    if (visited.has(k)) continue;
    const stack = [c];
    visited.add(k);
    const comp = [];
    while (stack.length) {
      const cur = stack.pop();
      comp.push(cur);
      for (const [dx, dz] of CARDINAL) {
        const nk = `${cur.x + dx},${cur.z + dz}`;
        if (set.has(nk) && !visited.has(nk)) {
          visited.add(nk);
          stack.push({ x: cur.x + dx, z: cur.z + dz });
        }
      }
    }
    comps.push(comp);
  }
  return comps;
}

/** tierAssignmentArbitrary(fc, cells, {tierValues}) -> Arbitrary<cellsWithTier[]>
    Assigns tiers by quantized radial distance from a generated center + a generated ring width, so
    tiers come out NESTED (matching §5.2's "2-4 nested/adjacent tiers" tiers-heavy band requirement)
    rather than independently-random-per-cell (which would mostly produce meaningless checkerboards). */
export function tierAssignmentArbitrary(fc, cells, options = {}) {
  const { tierValues = [-3, -2, -1, 0, 1, 2, 3], ringWidthMin = 1, ringWidthMax = 4 } = options;
  if (!cells.length) return fc.constant(cells);
  return fc
    .record({
      centerIdx: fc.nat({ max: cells.length - 1 }),
      ringWidth: fc.integer({ min: ringWidthMin, max: ringWidthMax }),
      tierCount: fc.integer({ min: 2, max: Math.min(4, tierValues.length) }),
      tierOffset: fc.nat({ max: Math.max(0, tierValues.length - 1) }),
    })
    .map(({ centerIdx, ringWidth, tierCount, tierOffset }) => {
      const center = cells[centerIdx];
      const chosenTiers = [];
      for (let i = 0; i < tierCount; i++) chosenTiers.push(tierValues[(tierOffset + i) % tierValues.length]);
      return cells.map((c) => {
        const dist = Math.abs(c.x - center.x) + Math.abs(c.z - center.z); // Manhattan ring distance
        const ring = Math.min(chosenTiers.length - 1, Math.floor(dist / Math.max(1, ringWidth)));
        return { ...c, tier: chosenTiers[ring] };
      });
    });
}

/** apertureArbitrary(fc, cells, options) -> Arbitrary<{cells, apertures}>
    Picks a BOUNDARY cell (missing at least one cardinal neighbor -- i.e. it legitimately borders a
    real wall segment) and marks it isDoor:true, producing one aperture record with a sourceEdgeRefs
    entry for that cell. Falls back to no aperture (honest no-op) if the cell set has no boundary cell
    (impossible for a nonempty connected set, but guarded for the empty case). */
export function apertureArbitrary(fc, cells, options = {}) {
  const { allowMultiCellDoor = true } = options;
  const boundary = cells.filter((c) =>
    CARDINAL.some(([dx, dz]) => !cells.some((o) => o.x === c.x + dx && o.z === c.z + dz))
  );
  if (!boundary.length) return fc.constant({ cells, apertures: [] });
  return fc
    .record({
      doorIdx: fc.nat({ max: boundary.length - 1 }),
      wide: allowMultiCellDoor ? fc.boolean() : fc.constant(false),
    })
    .map(({ doorIdx, wide }) => {
      const door = boundary[doorIdx];
      const doorKeys = [door];
      if (wide) {
        // try to widen with one boundary-adjacent neighbor sharing the same missing-side character.
        const neighbor = boundary.find(
          (b) => b !== door && Math.abs(b.x - door.x) + Math.abs(b.z - door.z) === 1
        );
        if (neighbor) doorKeys.push(neighbor);
      }
      const doorKeySet = new Set(doorKeys.map((d) => `${d.x},${d.z}`));
      const newCells = cells.map((c) => (doorKeySet.has(`${c.x},${c.z}`) ? { ...c, isDoor: true } : c));
      const apertures = [{
        id: `fuzz-door-${door.x}-${door.z}`,
        sourceEdgeRefs: doorKeys.map((d) => `${d.x},${d.z}`),
        width: doorKeys.length,
        state: "open",
        sourceRef: "R2-fuzz",
      }];
      return { cells: newCells, apertures };
    });
}

/** terrainPatchArbitrary(fc, cells, options) -> Arbitrary<terrainPatch[]>
    Picks a random contiguous sub-run of the cell array (already order-independent since it's a subset,
    not a shape reconstruction) and tags it as one terrain patch record — mirrors G0 corpus.mjs's own
    `terrain: [{id, tier, cells, sourceRef}]` shape (dev/geometry-research/fixtures/corpus.mjs). */
export function terrainPatchArbitrary(fc, cells, options = {}) {
  const { tierValues = [-3, -2, -1, 1, 2, 3], kinds = ["pit", "dais"] } = options;
  if (!cells.length) return fc.constant([]);
  return fc
    .record({
      startIdx: fc.nat({ max: cells.length - 1 }),
      len: fc.integer({ min: 1, max: cells.length }),
      tier: fc.constantFrom(...tierValues),
      kind: fc.constantFrom(...kinds),
    })
    .map(({ startIdx, len, tier, kind }) => {
      const patchCells = [];
      for (let i = 0; i < Math.min(len, cells.length); i++) {
        patchCells.push(cells[(startIdx + i) % cells.length]);
      }
      return [{
        id: `fuzz-patch-${kind}-${tier}`,
        tier,
        kind,
        cells: patchCells.map((c) => ({ x: c.x, z: c.z })),
        sourceRef: "R2-fuzz",
      }];
    });
}

/** shapeTransformArbitrary(fc, options) -> Arbitrary<{renderShape, sunken}>
    `renderShape` covers the render-smoothing family (identity/octagon/radial/L/T/cross). `sunken`
    covers the NEGATIVE transform this program specifically needs to drive toward the known negative-sy
    production defect (adapters.mjs's productionShellCellsAdapter / theater-boot.js:8888): when present,
    it names a magnitude a caller applies as a NEGATIVE sourceRef.rawSy on some subset of cells. */
export function shapeTransformArbitrary(fc, options = {}) {
  const { renderShapes = ["identity", "octagon", "radial", "L", "T", "cross"] } = options;
  return fc.record({
    renderShape: fc.constantFrom(...renderShapes),
    sunken: fc.option(
      fc.record({ depth: fc.float({ min: Math.fround(0.05), max: Math.fround(2.0), noNaN: true }) }),
      { nil: null }
    ),
  });
}

/** wallProfileArbitrary(fc, options) -> Arbitrary<wallProfile>
    Bounded to the realm/material bands documented at each DEFAULT_WALL_* constant's own definition
    site (src/ui/theater-room-mesh.js:125-129) so generated profiles stay physically plausible, never
    degenerate (zero/negative thickness would be a legitimately different bug class, not geometry fuzz). */
export function wallProfileArbitrary(fc, options = {}) {
  const b = Object.assign(
    {
      thickness: [0.15, 0.32],
      stemHeight: [0.22, 0.4],
      capHeight: [0.04, 0.1],
      capOverhang: [0.025, 0.06],
      footing: [0.04, 0.1],
      miterLimit: [2, 8],
    },
    options.bounds || {}
  );
  const f = ([lo, hi]) => fc.float({ min: Math.fround(lo), max: Math.fround(hi), noNaN: true });
  return fc.record({
    thickness: f(b.thickness),
    stemHeight: f(b.stemHeight),
    capHeight: f(b.capHeight),
    capOverhang: f(b.capOverhang),
    footing: f(b.footing),
    miterLimit: fc.integer({ min: b.miterLimit[0], max: b.miterLimit[1] }),
  });
}
