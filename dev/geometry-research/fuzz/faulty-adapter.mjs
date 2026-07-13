/* dev/geometry-research/fuzz/faulty-adapter.mjs — UNIT R2 negative control #1 (docs/GEOMETRY-
   ACCELERATION-TOOLCHAIN.md §13.5: "at least one red-first demonstration against a deliberately
   faulty adapter or known legacy defect").

   Two deliberately broken adapters, each wrapping the real legacyAdapter (dev/geometry-research/fuzz/
   adapters.mjs) and then corrupting its output in one specific, named way. These exist ONLY to prove
   the property suite actually detects real defects (a suite that can't fail is not evidence of
   anything) — they are never treated as candidate production code and never promoted as "the fix."

   - faultyAdapterDropsCell: after a correct compile, silently deletes ONE floor cell's triangles from
     the output (and its cellTriangleMap entry) — simulates a union/triangulation implementation that
     drops a cell under some input shape.
   - faultyAdapterFillsHole: after a correct compile, if the tier has >=1 hole, re-triangulates that
     tier's outer ring WITHOUT subtracting the hole (i.e. triangulates the raw cell footprint including
     the hole's interior) — simulates a triangulator that ignores hole rings. */

import { legacyAdapter } from "./adapters.mjs";

export function faultyAdapterDropsCell(scenario) {
  const out = legacyAdapter(scenario);
  if (!out.raw || !scenario.cells.length) return out;
  // Drop every triangle whose centroid falls within the LAST canonical cell's own unit square. This
  // does NOT lean on cellTriangleMap's shape (that map holds exactly ONE representative triangle per
  // cell -- theater-room-mesh.js:1132's own "triIndex = GLOBAL floor triangle index" doc comment -- not
  // a full per-cell triangle list), so it stays correct regardless of how many triangles a real
  // implementation happens to emit per cell.
  const victim = scenario.cells[scenario.cells.length - 1];
  const idx = out.raw.floor.indices, pos = out.raw.floor.positions;
  const keptIndices = [];
  let droppedAny = false;
  for (let t = 0; t * 3 < idx.length; t++) {
    const ai = idx[t * 3] * 3, bi = idx[t * 3 + 1] * 3, ci = idx[t * 3 + 2] * 3;
    const cx = (pos[ai] + pos[bi] + pos[ci]) / 3, cz = (pos[ai + 2] + pos[bi + 2] + pos[ci + 2]) / 3;
    const inVictimCell = Math.abs(cx - victim.x) <= 0.5 + 1e-6 && Math.abs(cz - victim.z) <= 0.5 + 1e-6;
    if (inVictimCell) { droppedAny = true; continue; }
    keptIndices.push(idx[t * 3], idx[t * 3 + 1], idx[t * 3 + 2]);
  }
  if (!droppedAny) return out; // nothing to corrupt for this scenario -- honest no-op, not a fake failure
  const victimKey = `${victim.x},${victim.z}`;
  const corruptedCellTriangleMap = { ...(out.cellTriangleMap || {}) };
  delete corruptedCellTriangleMap[victimKey];
  const corruptedRaw = {
    ...out.raw,
    floor: { ...out.raw.floor, indices: keptIndices },
    cellTriangleMap: corruptedCellTriangleMap,
  };
  return { ...out, raw: corruptedRaw, cellTriangleMap: corruptedCellTriangleMap, faultInjected: { kind: "drop-cell", cellKey: victimKey } };
}

export function faultyAdapterFillsHole(scenario) {
  const out = legacyAdapter(scenario);
  if (!out.raw) return out;
  const holeySurface = out.surfaces.find((s) => s.polygons.some((p) => p.holes.length > 0));
  if (!holeySurface) return out; // no hole in this scenario -- honest no-op
  // Re-triangulate that tier's outer ring as a plain fan, IGNORING the hole entirely (fills it in).
  const poly = holeySurface.polygons.find((p) => p.holes.length > 0);
  const outer = poly.outer;
  if (outer.length < 3) return out;
  const basePosCount = out.raw.floor.positions.length / 3;
  const newPositions = out.raw.floor.positions.slice();
  // outer ring points are {x,z} objects (adapters.mjs's reconstructRings -> theater-room-mesh.js's own
  // ring shape), not [x,z] arrays.
  outer.forEach((v) => newPositions.push(v.x, 0, v.z));
  const fanTris = [];
  for (let i = 1; i < outer.length - 1; i++) {
    fanTris.push(basePosCount, basePosCount + i, basePosCount + i + 1);
  }
  const corruptedRaw = {
    ...out.raw,
    floor: {
      ...out.raw.floor,
      positions: newPositions,
      indices: [...out.raw.floor.indices, ...fanTris],
    },
  };
  return { ...out, raw: corruptedRaw, faultInjected: { kind: "fill-hole", tier: holeySurface.tier } };
}
