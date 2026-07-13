/* dev/geometry-research/fixtures/builders.mjs — UNIT G0.

   Pure, deterministic cell-set constructors used to assemble the golden fixture corpus. Every builder
   returns a plain `{x,z,tier,isDoor,sourceRef}[]` cell array (the shared input contract's own `cells`
   shape, GEOMETRY-ACCELERATION-TOOLCHAIN.md §4.1) local to a room's own (0,0) origin. No Math.random —
   any "noisy" shape uses a fixed integer hash (deterministic across runs/machines/Node versions), per
   GEOMETRY-OSS-INTEGRATION.md §5's determinism law. */

/** hash2(x, z, seed) -> deterministic unsigned 32-bit-ish pseudo-random value in [0,1) for a given cell
    coordinate — used only by cave()/noisyBoundary() below, never for anything that must be uniform
    RNG-grade (it doesn't need to be; it only needs to be a FIXED function of (x,z,seed)). */
function hash2(x, z, seed) {
  let h = (x * 374761393 + z * 668265263 + seed * 2246822519) | 0;
  h = (h ^ (h >>> 13)) | 0;
  h = Math.imul(h, 1274126177);
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

function cell(x, z, tier = 0, isDoor = false, sourceRef = null) {
  return { x, z, tier, isDoor, sourceRef: sourceRef || { builder: "cell", x, z } };
}

export function rectangle(w, d, opts = {}) {
  const { tier = 0, sourceRef = "rectangle" } = opts;
  const cells = [];
  for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) cells.push(cell(x, z, tier, false, { builder: sourceRef, x, z }));
  return cells;
}

export function oneCell() {
  return [cell(0, 0, 0, false, { builder: "oneCell" })];
}

export function corridor(length, opts = {}) {
  const { axis = "x", tier = 0 } = opts;
  const cells = [];
  for (let i = 0; i < length; i++) {
    const x = axis === "x" ? i : 0, z = axis === "x" ? 0 : i;
    cells.push(cell(x, z, tier, false, { builder: "corridor", i }));
  }
  return cells;
}

/** lShape(w, d) -> full w x d bbox minus the bottom-right quadrant (deterministic quadrant choice,
    mirrors place-spatialize.js's own rasterizeShape 'L' branch shape but with a FIXED removed quadrant
    for fixture reproducibility — this module never reads the engine's seed hash). */
export function lShape(w, d) {
  const splitX = Math.round(w / 2), splitZ = Math.round(d / 2);
  const cells = [];
  for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) {
    if (x >= splitX && z >= splitZ) continue; // remove bottom-right quadrant
    cells.push(cell(x, z, 0, false, { builder: "L", x, z }));
  }
  return cells;
}

/** tShape(w, d) -> a full-width crossbar band + a centered stem band, matching place-spatialize.js's
    own rasterizeShape 'T' proportions (barH = round(d*0.35), stemW = round(w*0.35)). */
export function tShape(w, d) {
  const barH = Math.max(1, Math.round(d * 0.35));
  const stemW = Math.max(1, Math.min(w, Math.round(w * 0.35)));
  const stemX0 = Math.floor((w - stemW) / 2);
  const cells = [];
  for (let z = 0; z < d; z++) {
    for (let x = 0; x < w; x++) {
      const inBar = z < barH;
      const inStem = x >= stemX0 && x < stemX0 + stemW;
      if (inBar || inStem) cells.push(cell(x, z, 0, false, { builder: "T", x, z }));
    }
  }
  return cells;
}

/** crossShape(w, d) -> centered horizontal band UNION centered vertical band (subtracts all 4
    corners), matching place-spatialize.js's own rasterizeShape 'cross' proportions. */
export function crossShape(w, d) {
  const bandW = Math.max(1, Math.round(w * 0.4));
  const bandD = Math.max(1, Math.round(d * 0.4));
  const x0 = Math.floor((w - bandW) / 2), z0 = Math.floor((d - bandD) / 2);
  const cells = [];
  for (let z = 0; z < d; z++) {
    for (let x = 0; x < w; x++) {
      const inH = z >= z0 && z < z0 + bandD;
      const inV = x >= x0 && x < x0 + bandW;
      if (inH || inV) cells.push(cell(x, z, 0, false, { builder: "cross", x, z }));
    }
  }
  return cells;
}

/** octagon(w, d) -> chamfers all 4 corners by k = clamp(floor(min(w,d)*0.3)). EXACT port of
    src/engine/place-spatialize.js's own rasterizeShape('octagon', ...) formula (verified against the
    real engine 2026-07-12 — the row-101 fixture below was captured live from that same code path), and
    identical to the octagonRoom() helper dev/verify-octagon-miter.mjs and
    dev/verify-stage-c3b-circle-smooth.mjs already use for their own theater-room-mesh.js fixtures. */
export function octagon(w, d) {
  const short = Math.min(w, d);
  const k = Math.max(1, Math.min(Math.floor(short * 0.3), Math.floor((short - 2) / 2) || 1));
  const cells = [];
  for (let z = 0; z < d; z++) {
    for (let x = 0; x < w; x++) {
      const cornerTL = x + z < k;
      const cornerTR = (w - 1 - x) + z < k;
      const cornerBL = x + (d - 1 - z) < k;
      const cornerBR = (w - 1 - x) + (d - 1 - z) < k;
      if (!(cornerTL || cornerTR || cornerBL || cornerBR)) cells.push(cell(x, z, 0, false, { builder: "octagon", x, z }));
    }
  }
  return cells;
}

/** ellipse(w, d) -> radial inclusion test on cell centers vs the bbox half-extents (EXACT port of
    place-spatialize.js's own rasterizeShape('circle'|'ellipse', ...)). w===d degenerates to a circle. */
export function ellipse(w, d) {
  const hw = w / 2, hd = d / 2;
  const cells = [];
  for (let z = 0; z < d; z++) {
    for (let x = 0; x < w; x++) {
      const nx = (x + 0.5 - hw) / hw, nz = (z + 0.5 - hd) / hd;
      if (nx * nx + nz * nz <= 1.0) cells.push(cell(x, z, 0, false, { builder: "ellipse", x, z }));
    }
  }
  return cells;
}

/** rotunda(diameterCells) -> ellipse(d,d), the raster-circle special case, pre/post "render smoothing"
    is a RENDER-layer concern (renderShape tag) — this returns the canonical (pre-smooth) raster cells,
    corpus fixture #9 supplies both by tagging renderShape differently on two fixture entries sharing
    this same cell set. */
export function rotunda(diameterCells) {
  return ellipse(diameterCells, diameterCells);
}

/** cave(w, d, seed) -> a solid guaranteed core (r<=0.55) union a per-cell hash-noise fringe
    (0.55<r<=1.10), flood-filled from center to keep a single connected blob — EXACT structural port of
    place-spatialize.js's own rasterizeShape('cave', ...) generator, using this module's own
    deterministic hash2() in place of the engine's seed-string hash (same shape family, fixture-local
    determinism, no engine dependency). */
export function cave(w, d, seed = 1) {
  const hw = w / 2, hd = d / 2;
  const candidate = new Set();
  for (let z = 0; z < d; z++) {
    for (let x = 0; x < w; x++) {
      const nx = (x + 0.5 - hw) / hw, nz = (z + 0.5 - hd) / hd;
      const r = Math.sqrt(nx * nx + nz * nz);
      if (r <= 0.55) candidate.add(`${x},${z}`);
      else if (r <= 1.1 && hash2(x, z, seed) < 0.55) candidate.add(`${x},${z}`);
    }
  }
  // flood fill from center to keep only the connected blob (never an isolated fringe island).
  const cx = Math.floor(w / 2), cz = Math.floor(d / 2);
  const visited = new Set();
  const stack = [[cx, cz]];
  visited.add(`${cx},${cz}`);
  const NEI = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (stack.length) {
    const [x, z] = stack.pop();
    for (const [dx, dz] of NEI) {
      const nx = x + dx, nz = z + dz, k = `${nx},${nz}`;
      if (candidate.has(k) && !visited.has(k)) { visited.add(k); stack.push([nx, nz]); }
    }
  }
  const cells = [];
  visited.forEach((k) => {
    const [x, z] = k.split(",").map(Number);
    cells.push(cell(x, z, 0, false, { builder: "cave", x, z, seed }));
  });
  return cells;
}

/** neck(lobeW, lobeD, neckLen) -> two lobeW x lobeD square lobes joined by a 1-cell-wide neck of length
    neckLen (corpus fixture #12). */
export function neck(lobeW, lobeD, neckLen) {
  const cells = [];
  for (let z = 0; z < lobeD; z++) for (let x = 0; x < lobeW; x++) cells.push(cell(x, z, 0, false, { builder: "neck-lobe-a" }));
  const midZ = Math.floor(lobeD / 2);
  for (let i = 0; i < neckLen; i++) cells.push(cell(lobeW + i, midZ, 0, false, { builder: "neck-bridge" }));
  const lobe2X0 = lobeW + neckLen;
  for (let z = 0; z < lobeD; z++) for (let x = 0; x < lobeW; x++) cells.push(cell(lobe2X0 + x, z, 0, false, { builder: "neck-lobe-b" }));
  return cells;
}

/** cornerTouch(size) -> two size x size squares touching only diagonally at one corner cell pair
    (corpus fixture #13) — MUST resolve to 2 connected components under 4-adjacency. */
export function cornerTouch(size) {
  const a = rectangle(size, size, { sourceRef: "corner-touch-a" });
  const b = rectangle(size, size, { sourceRef: "corner-touch-b" }).map((c) => cell(c.x + size, c.z + size, 0, false, { builder: "corner-touch-b" }));
  return a.concat(b);
}

/** islands(size, gap) -> two size x size squares separated by `gap` empty columns (corpus fixture #14)
    — two fully disconnected components. */
export function islands(size, gap) {
  const a = rectangle(size, size, { sourceRef: "island-a" });
  const b = rectangle(size, size, { sourceRef: "island-b" }).map((c) => cell(c.x + size + gap, c.z, 0, false, { builder: "island-b" }));
  return a.concat(b);
}

/** annulus(outer, holeSize) -> outer x outer square with a centered holeSize x holeSize hole punched
    out (corpus fixture #15, donut/annulus with one hole). */
export function annulus(outer, holeSize) {
  const off = Math.floor((outer - holeSize) / 2);
  const cells = [];
  for (let z = 0; z < outer; z++) {
    for (let x = 0; x < outer; x++) {
      const inHole = x >= off && x < off + holeSize && z >= off && z < off + holeSize;
      if (!inHole) cells.push(cell(x, z, 0, false, { builder: "annulus", x, z }));
    }
  }
  return cells;
}

/** twoHoles(outer, holeSize) -> outer x outer square with TWO holeSize x holeSize holes side by side
    (corpus fixture #16, outer polygon with two holes). */
export function twoHoles(outer, holeSize) {
  const gap = Math.max(1, Math.floor(outer * 0.15));
  const totalHoleSpan = holeSize * 2 + gap;
  const off0 = Math.floor((outer - totalHoleSpan) / 2);
  const holeZ = Math.floor((outer - holeSize) / 2);
  const hole1X0 = off0, hole2X0 = off0 + holeSize + gap;
  const cells = [];
  for (let z = 0; z < outer; z++) {
    for (let x = 0; x < outer; x++) {
      const inHole1 = x >= hole1X0 && x < hole1X0 + holeSize && z >= holeZ && z < holeZ + holeSize;
      const inHole2 = x >= hole2X0 && x < hole2X0 + holeSize && z >= holeZ && z < holeZ + holeSize;
      if (!inHole1 && !inHole2) cells.push(cell(x, z, 0, false, { builder: "twoHoles", x, z }));
    }
  }
  return cells;
}

/** nestedRing(outer, ringWidth, tierOuter, tierInner) -> raised ring around a sunken arena (corpus
    fixture #17): the ring band (width `ringWidth`) at `tierOuter`, the interior arena at `tierInner`.
    Distinct from annulus() — this is one CONTIGUOUS floor footprint (no cell removed), just two
    elevation tiers, matching GEOMETRY-OSS-INTEGRATION.md §7.2's row-101-like annular terrain law. */
export function nestedRing(outer, ringWidth, tierOuter, tierInner) {
  const cells = [];
  for (let z = 0; z < outer; z++) {
    for (let x = 0; x < outer; x++) {
      const depth = Math.min(x, outer - 1 - x, z, outer - 1 - z);
      const tier = depth < ringWidth ? tierOuter : tierInner;
      cells.push(cell(x, z, tier, false, { builder: "nestedRing", x, z, depth }));
    }
  }
  return cells;
}

/** dais(w, d, patchW, patchD, tier) -> a flat w x d room with a centered patchW x patchD patch at
    `tier` (corpus fixture #19, two elevation levels). */
export function dais(w, d, patchW, patchD, tier) {
  const x0 = Math.floor((w - patchW) / 2), z0 = Math.floor((d - patchD) / 2);
  const cells = [];
  for (let z = 0; z < d; z++) {
    for (let x = 0; x < w; x++) {
      const inPatch = x >= x0 && x < x0 + patchW && z >= z0 && z < z0 + patchD;
      cells.push(cell(x, z, inPatch ? tier : 0, false, { builder: "dais", x, z }));
    }
  }
  return cells;
}

/** pitAtWall(w, d, pitW, pitD, tier) -> a flat room with a sunken patch touching one outer wall
    (corpus fixture #20, pit touching an outer wall — NOT centered). */
export function pitAtWall(w, d, pitW, pitD, tier) {
  const x0 = 0, z0 = 0; // flush against the (0,z) / (x,0) wall corner
  const cells = [];
  for (let z = 0; z < d; z++) {
    for (let x = 0; x < w; x++) {
      const inPatch = x >= x0 && x < x0 + pitW && z >= z0 && z < z0 + pitD;
      cells.push(cell(x, z, inPatch ? tier : 0, false, { builder: "pitAtWall", x, z }));
    }
  }
  return cells;
}

/** addDoor(cells, x, z) -> returns a NEW cell array with the (x,z) cell's own isDoor flag set true
    (cells must already contain that coordinate). Non-mutating. */
export function addDoor(cells, x, z) {
  return cells.map((c) => (c.x === x && c.z === z ? Object.assign({}, c, { isDoor: true }) : c));
}

/** translate(cells, dx, dz) -> a NEW cell array shifted by (dx,dz) — used for the "translated copies at
    large positive/negative coordinates" bakeoff class (translation-invariance fixture). */
export function translate(cells, dx, dz) {
  return cells.map((c) => Object.assign({}, c, { x: c.x + dx, z: c.z + dz }));
}

/** reflect(cells) -> mirror across x (x -> -x), used for reflection-invariance scoring. */
export function reflect(cells) {
  return cells.map((c) => Object.assign({}, c, { x: -c.x }));
}
