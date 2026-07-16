/* GENESIS MODULE — src/engine/place-spatialize.js — DUNGEON-GRAPH U1: the spatializer
   (docs/DUNGEON-GRAPH.md "Build units" U1). Classic <script> (shared global scope).
   Registered in manifest.json; validated by build/check-manifest.py.

   spatializePlan(segments, topologyName, opts) turns a walk's segment graph (rooms=nodes,
   exits=edges — the exact shape src/engine/walk.js:593-625 builds, e.g. rollDungeonWalk's
   output) into a walkable cell-grid floor plan (the `SpatialPlan` shape DUNGEON-GRAPH.md
   "Shared data shape" defines). Engine-layer purity: this file never touches `w`/`U`/render/
   DOM — pure data in, pure data out.

   DETERMINISM LAW: no un-seeded Math.random / Date.now anywhere in this file. The seed is
   derived by hashing `opts.walkId` (a small string-hash → mulberry32 PRNG, the same reference
   pattern src/ui/theater-boot.js's mulberry32 uses) — same walk id + same segments/topology
   ⇒ byte-identical `cells` buffer. DEVIATION FROM SPEC TEXT (documented, not silent): the walk
   object itself carries no single top-level id field today (only per-segment ids exist) — the
   spec's own §"Shared data shape" block lists `seed` as a plan output, implying the caller
   supplies or the module derives one. `opts.walkId` is the seam U2/U3/U4 (and world.prep, which
   already owns the walk's storage key) pass the walk's real identity through; when omitted this
   module falls back to hashing a deterministic fingerprint of the topology + segment ids/exits
   so the "same input twice ⇒ same plan" law still holds without a caller-supplied id.

   Stages (per DUNGEON-GRAPH.md U1): per-topology layout seed → room rect placement → AABB
   separation → corridor carving along EXITS ONLY → rasterize (walls auto-derive; doors at
   corridor/room-perimeter meets) → BFS reachability verify from the entry segment's room →
   on fail, mutate seed and retry (≤5 more attempts) → honest-fail (throw naming topology+seed,
   never a hand-patched plan).

   Internal helpers are `dsp`-prefixed (mirrors the `dwalk`-prefix convention in
   src/engine/dungeon-walk.js) so nothing here collides with another module's globals.

   STAGE-C (docs/STAGE-C.md, 2026-07-12): C1 SIZE FIDELITY sizes a room's footprint off the rolled
   `segment.dims` (dspDimsToCells) instead of a blind rng() 4-7 draw. C2 STRUCTURAL TERRAIN
   (dspParseSideTerrain) keyword-scans `segment.side` into a per-room dais/pit elevation patch,
   stamped onto a parallel `tiers` buffer (SAME shape/indexing as `cells`) the render seam
   (theater-interior.js's interiorBuildBoard) folds into floor height. C3 REAL SHAPES
   (shapeForArchetype/rasterizeShape) substring-classifies `segment.areaType` into a `shape` tag
   (rect/circle/octagon/ellipse/L/T/cross/cave) and rasterizes a non-rect room's ACTUAL footprint
   (rooms[].shape/rooms[].cells) instead of a filled rect, deriving door cells FROM the shape's own
   polygon boundary (dspRoomDoorAnchor/dspChooseDoorCell) instead of a corridor-crosses-a-rectangle
   test. All three live behind the shared `SPATIAL_SHAPES` flag (default ON; OFF is byte-identical
   pre-C1 behavior for every room). */

const SPATIAL_CELL = Object.freeze({ VOID: 0, FLOOR: 1, WALL: 2, DOOR: 3, WATER: 4 });

/* ─── STAGE-C C1 SIZE FIDELITY (docs/STAGE-C.md C1) ────────────────────────────────────────────
   Reversible flag, `var` (not `const`) — same classic-script "auto-attaches to window" convention
   src/ui/theater-interior.js's ITR_ACTIVE_ROOM_ONLY documents (a live session or verify harness can
   flip it at runtime: `window.SPATIAL_SHAPES = false`). Default ON: a segment's rolled `dims` sizes
   its room footprint. OFF restores the pre-C1 `rng() 4-7` random rect byte-for-byte — see
   dspBuildPlanOnce's size-assignment loop below, the ONLY call site that reads this flag. */
var SPATIAL_SHAPES = true;

// Clamp band for a parsed-`dims` footprint (GRID LAW: 1 cell = 5 ft, DUNGEON-GRAPH.md:67).
// MIN=4 mirrors the pre-existing hard floor dspBuildPlanOnce already applied to EVERY room
// (`Math.max(4, w)` below, present before C1) — a room under 4 cells/20 ft per axis isn't
// walkably furnishable, so a tiny rolled dims (e.g. a 10'x10' Small Chamber, 2 cells) is honestly
// too small to stage and gets floored, same as an unlucky rng() draw always was.
// MAX=24 is the real ceiling of the "Dungeon Area Type" table's own "Base Dimensions" column
// (Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Area Type.md) — the largest rolled
// footprint on that table is row 145's Massive Cavern "50' x 120' irregular" (120'/5 = 24 cells on
// the long axis); 24 is that exact ceiling with zero slop beyond it, so every legitimate d200 roll
// fits inside the band untouched while a garbage/absurd dims string (check 4: "500' x 500'") still
// clamps hard rather than blowing the grid/render/combat cell budgets.
const SPATIAL_MIN_CELL = 4;
const SPATIAL_MAX_CELL = 24;

/* dspDimsToCells(dims) -> {wCells,dCells} | null (unparseable/absent -> null, caller falls back
   to the existing rng() 4-7 draw). Lifted regex from combat.js's cmDimsToGrid (:32, "the FIRST TWO
   integer feet values in the string win" — `/(\d+)\s*'/g`) but emits GRID-LAW CELLS (feet/5,
   rounded) instead of combat's clamped band/lane COUNTS; a "diameter" value yields a square bbox
   (wCells===dCells) per STAGE-C.md C1 step 1. Ordering mirrors cmDimsToGrid's own documented
   convention verbatim (combat.js:26-27: "order = depth then width, matching the walk tables' 'L x
   W' convention") — the FIRST feet value becomes dCells (this module's y/depth axis: room.d drives
   the y-extent at the rasterize loop, ~:304), the SECOND becomes wCells (room.w, the x-extent,
   ~:305). Verified against 6 real "Dungeon Area Type" table strings incl. a diameter row and two
   arm-width-parenthetical rows — see dev/verify-stage-c-size.mjs check 5 for the full list + the
   worked cell math. Pure string parsing: no rng()/Math.random/Date.now, never advances the seed
   (dspBuildPlanOnce below never lets a parse outcome change the rng() call sequence either). */
// dspFeetPairRaw(s) -> {wCells,dCells} | null — the shared, UNCLAMPED half of the feet-string
// parse (STAGE-C C2 addendum, 2026-07-12): lifted out of dspDimsToCells so a caller sizing a whole
// ROOM (which must respect the [SPATIAL_MIN_CELL,SPATIAL_MAX_CELL] furnishability band) and a
// caller sizing a small sub-room TERRAIN PATCH (dspParseSideTerrain below — a 15'x15' dais patch
// is honestly 3 cells, and forcing it up to the room's own SPATIAL_MIN_CELL=4 floor would silently
// inflate a "3x3 patch" roll into a wrong 4x4 one) can apply their OWN clamp band over the same
// parse. No behavior change to dspDimsToCells itself — it still applies the identical
// [SPATIAL_MIN_CELL,SPATIAL_MAX_CELL] clamp it always has, just via this shared core.
function dspFeetPairRaw(s) {
  const nums = s.match(/(\d+)\s*'/g);
  if (!nums || !nums.length) return null;
  const feet = nums.map((n) => parseInt(n, 10)).filter((n) => Number.isFinite(n) && n > 0);
  if (!feet.length) return null;
  if (/diameter/i.test(s)) {
    const c = Math.round(feet[0] / 5);
    return { wCells: c, dCells: c };
  }
  if (feet.length < 2) return null; // a single non-diameter feet value isn't a W x D pair
  return { dCells: Math.round(feet[0] / 5), wCells: Math.round(feet[1] / 5) };
}

/* dspDimsToCells(dims) -> {wCells,dCells} | null (unparseable/absent -> null, caller falls back
   to the existing rng() 4-7 draw). Lifted regex from combat.js's cmDimsToGrid (:32, "the FIRST TWO
   integer feet values in the string win" — `/(\d+)\s*'/g`) but emits GRID-LAW CELLS (feet/5,
   rounded) instead of combat's clamped band/lane COUNTS; a "diameter" value yields a square bbox
   (wCells===dCells) per STAGE-C.md C1 step 1. Ordering mirrors cmDimsToGrid's own documented
   convention verbatim (combat.js:26-27: "order = depth then width, matching the walk tables' 'L x
   W' convention") — the FIRST feet value becomes dCells (this module's y/depth axis: room.d drives
   the y-extent at the rasterize loop, ~:304), the SECOND becomes wCells (room.w, the x-extent,
   ~:305). Verified against 6 real "Dungeon Area Type" table strings incl. a diameter row and two
   arm-width-parenthetical rows — see dev/verify-stage-c-size.mjs check 5 for the full list + the
   worked cell math. Pure string parsing: no rng()/Math.random/Date.now, never advances the seed
   (dspBuildPlanOnce below never lets a parse outcome change the rng() call sequence either). */
function dspDimsToCells(dims) {
  const raw = dspFeetPairRaw(String(dims || ""));
  if (!raw) return null;
  const clamp = (c) => Math.max(SPATIAL_MIN_CELL, Math.min(SPATIAL_MAX_CELL, c));
  return { wCells: clamp(raw.wCells), dCells: clamp(raw.dCells) };
}

/* ─── STAGE-C C2 STRUCTURAL TERRAIN (docs/STAGE-C.md C2) ────────────────────────────────────────
   `segment.side` ("Side Area & Structural Features", the d200 table's 3rd column) is prose that
   today is rendered narratively but never reaches the grid — a "15' x 15' central raised dais"
   never becomes real geometry. This keyword-scans that prose into per-room elevation-tier PATCHES
   (the DUNGEON-GRAPH.md U6 `terrain:[{cells,tier,kind}]` shape) + stamps the tiers onto
   a parallel per-cell buffer (`tiers`, alongside `cells`) the render seam folds in. Prose parsing
   only — never rejects an incongruous roll, never mutates the segment, never calls rng()/
   Math.random()/Date.now() (this module's own DETERMINISM LAW, header comment above): corner/wall
   disambiguation below uses a SEPARATE hash chain (dspTerrainSeedHash, keyed off this build's own
   `seed` + the segment's num + "side") that never touches the shared mulberry32 `rng` stream
   dspBuildPlanOnce's other draws depend on — the call-count/order those draws see is byte-
   identical whether or not a room's `side` string parses, mirroring C1's own "do NOT change the
   rng call sequence" law for `dims`. */

// tier +1 (raised architecture) vs tier -1 (sunken architecture) keyword sets, verbatim off
// STAGE-C.md C2 step 1's own list. \b-bounded so e.g. "lower" never matches inside "flower", and
// \w* lets a keyword's own inflection (recessed, elevating, ...) still match its stem.
const DSP_TERRAIN_RAISE_RE = /\b(raised|dais|platforms?|step[- ]?up|elevated|elevating|gallery|balcon\w*)\b/i;
const DSP_TERRAIN_SINK_RE = /\b(sunken|pits?|pools?|below|lower|recess\w*)\b/i;

// dspTerrainSeedHash(seed, segNum) -> a stable per-room hash, DELIBERATELY a second, independent
// hash chain off dspHashStr (not the shared `rng`) — see this section's header note. Used only to
// disambiguate an AMBIGUOUS location cue ("in one corner" doesn't say which of 4; "along the wall"
// doesn't say which of 4) deterministically without an extra rng() draw.
function dspTerrainSeedHash(seed, segNum) {
  return dspHashStr(String(seed) + ":" + String(segNum) + ":side");
}

/* dspParseSideTerrain(side, room, seed) -> {cells:[{x,y}...], tier:signed one-foot quanta, kind:'dais'|'pit'} | null.
   Missing/unparseable/no-elevation-keyword `side` -> null (flat room, no terrain — never throws).
   Algorithm (STAGE-C.md C2 step 1 + art-direction amendment):
     1. split the side roll into ';'-delimited clauses and parse each independently; prose order is
        retained so a later patch wins only where its cells genuinely overlap an earlier patch.
     2. find the first elevation keyword within each clause and parse that clause's footprint via the
        already-lifted feet parser (feet-with-apostrophe pairs or a
        "N' diameter" -> a square patch; the table's own "(N ft high/deep)" height clause never has
        an apostrophe, so it never pollutes the footprint parse). Unparseable footprint (present
        keyword, absent/odd dims) falls back to a sane default 3x3 patch rather than dropping the
        feature entirely — still fully deterministic, no rng().
        A ring clause treats its dimension as width and expands inward from the shaped room boundary.
     3. clamp every patch to fit inside the room's own w x d bbox (a patch can never exceed its room).
     4. resolve a LOCATION for a non-ring patch off the same clause's cue words: "corner" -> one of the
        room's 4 corners (dspTerrainSeedHash picks which); "wall" -> centered along one of the 4
        walls (same hash picks which side); anything else (incl. "central"/"center", the common
        case) -> centered in the room. Every branch re-clamps into the room bbox as a final guard. */
function dspParseSideTerrainClause(clause, room, seed, clauseIndex) {
  if (!room || typeof room.x !== "number" || typeof room.w !== "number") return null;
  const s = String(clause || "").trim();
  if (!s) return null;

  const raiseM = s.match(DSP_TERRAIN_RAISE_RE);
  const sinkM = s.match(DSP_TERRAIN_SINK_RE);
  let tier, kind;
  if (raiseM && (!sinkM || raiseM.index <= sinkM.index)) { tier = 1; kind = "dais"; }
  else if (sinkM) { tier = -1; kind = "pit"; }
  else return null; // no elevation keyword at all -> flat room, no terrain

  // One tier quantum is one rendered foot (ITR_DAIS_STEP=0.2 world units; GRID LAW is 5 ft/unit).
  // Horizontal footprints use apostrophes, so an explicit `N ft high/deep/below/step` cannot be
  // mistaken for width. Clamp malformed extremes to two grid units (10 ft).
  const verticalM = s.match(/\b(\d+)\s*ft\s*(?:high|deep|below|step(?:ped)?(?:\s*up|\s*down)?)/i);
  if (verticalM) tier *= Math.max(1, Math.min(10, parseInt(verticalM[1], 10)));

  // Ring features are widths, not W x D footprints. Preserve them as perimeter cells so rolls such
  // as Grand Octagon row 101 can carry both the central arena and its raised surrounding walkway.
  if (/\bring\b/i.test(s)) {
    const widthMatch = s.match(/(\d+)\s*'/);
    const widthCells = Math.max(1, Math.min(SPATIAL_MAX_CELL,
      widthMatch ? Math.round(parseInt(widthMatch[1], 10) / 5) : 1));
    const allowed = Array.isArray(room.cells) && room.cells.length ? room.cells : (function(){
      const out = [];
      for (let yy = room.y; yy < room.y + room.d; yy++) {
        for (let xx = room.x; xx < room.x + room.w; xx++) out.push({ x: xx, y: yy });
      }
      return out;
    })();
    const allowedKeys = new Set(allowed.map((c) => c.x + "," + c.y));
    let frontier = allowed.filter((c) =>
      !allowedKeys.has((c.x - 1) + "," + c.y) || !allowedKeys.has((c.x + 1) + "," + c.y) ||
      !allowedKeys.has(c.x + "," + (c.y - 1)) || !allowedKeys.has(c.x + "," + (c.y + 1)));
    const ringKeys = new Set(frontier.map((c) => c.x + "," + c.y));
    for (let band = 1; band < widthCells; band++) {
      const next = [];
      frontier.forEach((c) => {
        [[-1,0],[1,0],[0,-1],[0,1]].forEach((d) => {
          const x = c.x + d[0], y = c.y + d[1], key = x + "," + y;
          if (allowedKeys.has(key) && !ringKeys.has(key)) { ringKeys.add(key); next.push({ x, y }); }
        });
      });
      frontier = next;
    }
    return { cells: allowed.filter((c) => ringKeys.has(c.x + "," + c.y)), tier, kind, footprint: "ring" };
  }

  // dspFeetPairRaw, NOT dspDimsToCells — a terrain patch has no furnishability floor the way a
  // whole ROOM does (dspDimsToCells's own SPATIAL_MIN_CELL=4 clamp is right for sizing a room, but
  // would silently inflate a legit "15'x15'" (3x3) dais patch up to 4x4). Only the room's own bbox
  // (below) and a floor of 1 bound a patch's size.
  const footprint = dspFeetPairRaw(s);
  const DSP_TERRAIN_DEFAULT_PATCH = 3; // a keyword matched but no parseable footprint (rare) -> a sane 3x3, never dropped
  let pw = footprint ? footprint.wCells : DSP_TERRAIN_DEFAULT_PATCH;
  let pd = footprint ? footprint.dCells : DSP_TERRAIN_DEFAULT_PATCH;
  // clamp to [1, SPATIAL_MAX_CELL] first (a garbage/absurd clause, e.g. "500' x 500'", still can't
  // blow the grid), THEN to the room's own bbox — a terrain patch can never exceed its own room.
  pw = Math.max(1, Math.min(pw, SPATIAL_MAX_CELL));
  pd = Math.max(1, Math.min(pd, SPATIAL_MAX_CELL));
  pw = Math.max(1, Math.min(pw, room.w));
  pd = Math.max(1, Math.min(pd, room.d));

  const isCorner = /\bcorner\b/i.test(s);
  const isWall = /\bwall\b/i.test(s);
  const hash = dspTerrainSeedHash(seed, String(room.segNum) + ":" + String(clauseIndex || 0));
  let ox, oy;
  if (isCorner) {
    const corners = [
      { ox: room.x, oy: room.y },
      { ox: room.x + room.w - pw, oy: room.y },
      { ox: room.x, oy: room.y + room.d - pd },
      { ox: room.x + room.w - pw, oy: room.y + room.d - pd },
    ];
    const chosen = corners[hash % corners.length];
    ox = chosen.ox; oy = chosen.oy;
  } else if (isWall) {
    const sides = [
      { ox: room.x + Math.floor((room.w - pw) / 2), oy: room.y },                       // north
      { ox: room.x + Math.floor((room.w - pw) / 2), oy: room.y + room.d - pd },         // south
      { ox: room.x, oy: room.y + Math.floor((room.d - pd) / 2) },                       // west
      { ox: room.x + room.w - pw, oy: room.y + Math.floor((room.d - pd) / 2) },         // east
    ];
    const chosen = sides[hash % sides.length];
    ox = chosen.ox; oy = chosen.oy;
  } else {
    // default (incl. "central"/"in the center"/no cue at all): centered.
    ox = room.x + Math.floor((room.w - pw) / 2);
    oy = room.y + Math.floor((room.d - pd) / 2);
  }
  ox = Math.max(room.x, Math.min(ox, room.x + room.w - pw));
  oy = Math.max(room.y, Math.min(oy, room.y + room.d - pd));

  const cells = [];
  for (let yy = oy; yy < oy + pd; yy++) {
    for (let xx = ox; xx < ox + pw; xx++) cells.push({ x: xx, y: yy });
  }
  return { cells, tier, kind };
}

// A side-area roll can license several simultaneous structural facts. Parse each semicolon-delimited
// table clause independently and preserve all elevation features in narrative order. The singular
// helper remains as a compatibility seam for older harnesses/callers and returns the first patch.
function dspParseSideTerrains(side, room, seed) {
  const s = String(side || "").trim();
  if (!s) return [];
  return s.split(";").map((clause, i) => dspParseSideTerrainClause(clause, room, seed, i)).filter(Boolean);
}
function dspParseSideTerrain(side, room, seed) {
  return dspParseSideTerrains(side, room, seed)[0] || null;
}

/* ─── STAGE-C C3 REAL SHAPES (docs/STAGE-C.md C3) ───────────────────────────────────────────────
   `segment.areaType` ("Dungeon Area Type" table's own d200 NAME column, e.g. "Grand Octagon",
   "Mid-Size Rotunda", "L-Shaped Chamber") today only decorates prose — the room itself always
   rasterizes as a filled rectangle (C1's own real w x d bbox, but still a RECT). This substring-
   classifies the archetype NAME into a `shape` tag, then rasterizes that shape's cells inside the
   C1 bbox as a STAIRCASED ORTHOGONAL approximation (the landed C4 room-shell compiler already
   traces + bevels an arbitrary orthogonal contour — see docs/ROOM-SHELL-COMPILER.md — so no curved
   geometry is needed here), and derives door cells FROM the polygon's own boundary faces instead of
   the old "corridor path crosses a rectangle" test. Prose/name classification only — never rolls,
   never rejects an incongruous roll, never calls rng()/Math.random()/Date.now() (this module's own
   DETERMINISM LAW): shape rasterization + door-face selection both use dspHashStr-derived stable
   hashes (dspShapeCellHash01/dspChooseDoorCell below), a SEPARATE chain off this build's own `seed`
   — same discipline as C2's own dspTerrainSeedHash — never the shared mulberry32 `rng` stream
   dspBuildPlanOnce's other draws depend on. A `rect` archetype (the "else" branch, or SPATIAL_SHAPES
   OFF) takes the EXACT pre-C3 code path in dspBuildPlanOnce (full-rect fill + the original
   dspExitDoorCell/dspEntryDoorCell corridor-crossing door test) — byte-identical, regression-safe. */

// shapeForArchetype(areaType) -> 'rect'|'circle'|'octagon'|'ellipse'|'L'|'T'|'cross'|'cave'
// (DUNGEON-GRAPH.md U6 enum). Ordered substring rules, first match wins — order only matters where
// a name could plausibly hit two rules at once (none do in the real table today, verified against
// every row of Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Area Type.md), so this is
// a flat first-match scan, not a priority ladder. \b-bounded so e.g. "Crossing" (a room name on the
// real table, row 184) never matches the cross-hall rule the way an un-bounded "cross" substring
// would.
const SPATIAL_SHAPE_RULES = [
  { re: /\b(rotunda|round)\b/i, shape: "circle" },
  { re: /\boctagon\w*/i, shape: "octagon" },
  { re: /\boval\b/i, shape: "ellipse" },
  { re: /\bl-shaped\b/i, shape: "L" },
  { re: /\bt-shaped\b/i, shape: "T" },
  { re: /\bcross\b/i, shape: "cross" },
  { re: /\b(cave|cavern\w*|natural|fissure|chasm|lava)\b/i, shape: "cave" },
];
function shapeForArchetype(areaType) {
  const s = String(areaType || "");
  for (let i = 0; i < SPATIAL_SHAPE_RULES.length; i++) {
    if (SPATIAL_SHAPE_RULES[i].re.test(s)) return SPATIAL_SHAPE_RULES[i].shape;
  }
  return "rect";
}

// dspShapeCellHash01(seed, tag, x, y) -> a stable [0,1) float, DELIBERATELY its own hash chain
// (never the shared `rng` stream — see this section's header note). Used by the cave shape's
// per-cell noise threshold.
function dspShapeCellHash01(seed, tag, x, y) {
  return (dspHashStr(String(seed) + ":" + tag + ":" + x + "," + y) % 100000) / 100000;
}

// dspForceCenterCore(included, w, d) -> mutates `included` (a flat w*d boolean array, row-major
// y*w+x) so the room's own geometric center 2x2 block is ALWAYS included, regardless of shape. Pure
// safety net: an L/T/cross's corner-subtraction (or an unlucky cave noise draw) can otherwise land
// the room's center — where dspBuildPlanOnce's own entry-room BFS start point AND theater-
// interior.js's itrCenter2x2/itrDaisCellsFor (the dais-anchor convention, SAME floor((w-2)/2) corner
// this mirrors) both expect real floor — on a VOID cell. A union-only op (never removes a cell), so
// it can't disconnect anything it's applied to; algebraically floor(w/2)/floor(d/2) (the reachability
// BFS's own start-cell formula) always falls inside this 2x2 block for any w,d >= 1 (verified for
// both odd/even w,d in dev/verify-stage-c-shapes.mjs).
function dspForceCenterCore(included, w, d) {
  const cx0 = Math.max(0, Math.floor((w - 2) / 2));
  const cy0 = Math.max(0, Math.floor((d - 2) / 2));
  for (let yy = cy0; yy < Math.min(d, cy0 + 2); yy++) {
    for (let xx = cx0; xx < Math.min(w, cx0 + 2); xx++) included[yy * w + xx] = true;
  }
}

/* rasterizeShape(shape, wCells, dCells, seed) -> flat boolean array (row-major y*wCells+x, length
   wCells*dCells) marking which LOCAL cells are FLOOR for `shape` inside a wCells x dCells bbox — a
   STAIRCASED ORTHOGONAL approximation per shape (STAGE-C.md C3 step 2):
     circle/ellipse: radial inclusion test on cell centers vs the bbox's own half-extents (a circle
       is just the square-bbox special case of the same formula — no separate branch needed).
     octagon: chamfer all 4 corners by a fixed fraction of the shorter side -> an 8-face boundary
       (4 axis-aligned edges + 4 diagonal chamfers), clamped so the chamfer never eats a whole edge.
     L: subtract ONE bbox quadrant (which quadrant is picked by a stable per-room hash, never rng()).
     T: a full-width crossbar band + a centered stem band (subtracts the two bottom corners).
     cross: a centered horizontal band UNION a centered vertical band (subtracts all 4 corners).
     cave: a solid guaranteed core (r <= 0.55) union a per-cell hash-noise fringe (0.55 < r <= 1.10),
       then a flood-fill FROM THE CENTER over the candidate set keeps only cells actually reachable
       from it — guarantees a single CONNECTED irregular blob (never an isolated island the caller's
       BFS reachability verify would flag as unreachable FLOOR).
     rect (or any unrecognized tag): every cell — the full bbox, for direct unit-testing symmetry;
       dspBuildPlanOnce itself never calls this for a 'rect' room (it keeps the original full-rect
       fill code path unchanged, see this section's header note).
   Every branch finishes through dspForceCenterCore (see its own header) as a uniform safety net. */
function rasterizeShape(shape, wCells, dCells, seed) {
  const w = Math.max(1, wCells | 0), d = Math.max(1, dCells | 0);
  const included = new Array(w * d).fill(false);
  const hw = w / 2, hd = d / 2;

  if (shape === "circle" || shape === "ellipse") {
    for (let y = 0; y < d; y++) {
      for (let x = 0; x < w; x++) {
        const nx = (x + 0.5 - hw) / hw, ny = (y + 0.5 - hd) / hd;
        if (nx * nx + ny * ny <= 1.0) included[y * w + x] = true;
      }
    }
  } else if (shape === "octagon") {
    const short = Math.min(w, d);
    const k = Math.max(1, Math.min(Math.floor(short * 0.3), Math.floor((short - 2) / 2) || 1));
    for (let y = 0; y < d; y++) {
      for (let x = 0; x < w; x++) {
        const cornerTL = x + y < k;
        const cornerTR = (w - 1 - x) + y < k;
        const cornerBL = x + (d - 1 - y) < k;
        const cornerBR = (w - 1 - x) + (d - 1 - y) < k;
        if (!(cornerTL || cornerTR || cornerBL || cornerBR)) included[y * w + x] = true;
      }
    }
  } else if (shape === "L") {
    const splitX = Math.round(w / 2), splitY = Math.round(d / 2);
    const orient = dspHashStr(String(seed) + ":Lquadrant") % 4; // which quadrant is REMOVED
    for (let y = 0; y < d; y++) {
      for (let x = 0; x < w; x++) {
        const inTL = x < splitX && y < splitY, inTR = x >= splitX && y < splitY;
        const inBL = x < splitX && y >= splitY, inBR = x >= splitX && y >= splitY;
        const removed = (orient === 0 && inBR) || (orient === 1 && inBL) || (orient === 2 && inTR) || (orient === 3 && inTL);
        if (!removed) included[y * w + x] = true;
      }
    }
  } else if (shape === "T") {
    const barH = Math.max(1, Math.round(d * 0.35));
    const stemW = Math.max(1, Math.min(w, Math.round(w * 0.35)));
    const stemX0 = Math.floor((w - stemW) / 2);
    for (let y = 0; y < d; y++) {
      for (let x = 0; x < w; x++) {
        if (y < barH || (x >= stemX0 && x < stemX0 + stemW)) included[y * w + x] = true;
      }
    }
  } else if (shape === "cross") {
    const bandW = Math.max(1, Math.min(w, Math.round(w * 0.4)));
    const bandD = Math.max(1, Math.min(d, Math.round(d * 0.4)));
    const bx0 = Math.floor((w - bandW) / 2), by0 = Math.floor((d - bandD) / 2);
    for (let y = 0; y < d; y++) {
      for (let x = 0; x < w; x++) {
        if ((x >= bx0 && x < bx0 + bandW) || (y >= by0 && y < by0 + bandD)) included[y * w + x] = true;
      }
    }
  } else if (shape === "cave") {
    const candidate = new Array(w * d).fill(false);
    for (let y = 0; y < d; y++) {
      for (let x = 0; x < w; x++) {
        const nx = (x + 0.5 - hw) / hw, ny = (y + 0.5 - hd) / hd;
        const r = Math.sqrt(nx * nx + ny * ny);
        const noise = dspShapeCellHash01(seed, "cave", x, y);
        const threshold = 0.55 + noise * 0.55;
        if (r <= threshold) candidate[y * w + x] = true;
      }
    }
    // flood-fill from the bbox center over `candidate` -> guarantees ONE connected component (never
    // an isolated noise-included island the caller's BFS reachability verify would choke on).
    const cx = Math.min(w - 1, Math.floor(w / 2)), cy = Math.min(d - 1, Math.floor(d / 2));
    if (candidate[cy * w + cx]) {
      const seen = new Array(w * d).fill(false);
      const q = [[cx, cy]]; seen[cy * w + cx] = true;
      let head = 0;
      while (head < q.length) {
        const [qx, qy] = q[head++];
        included[qy * w + qx] = true;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const nx2 = qx + dx, ny2 = qy + dy;
          if (nx2 < 0 || ny2 < 0 || nx2 >= w || ny2 >= d) return;
          const ii = ny2 * w + nx2;
          if (!seen[ii] && candidate[ii]) { seen[ii] = true; q.push([nx2, ny2]); }
        });
      }
    }
  } else {
    // 'rect' or an unrecognized tag: the full bbox.
    included.fill(true);
  }

  dspForceCenterCore(included, w, d);
  return included;
}

// dspBoundaryCellsFor(room) -> the subset of room.cells (GLOBAL {x,y} coords) that sit on the
// room's own polygon boundary — a FLOOR cell with at least one 4-neighbor NOT in the room's own
// cell set (either a VOID notch within the bbox, or simply outside it). This is the "polygon face"
// door cells are chosen FROM (STAGE-C.md C3 step 3), replacing the old corridor-crosses-a-rectangle
// test for any non-rect room.
function dspBoundaryCellsFor(room) {
  const cells = room.cells || [];
  const set = new Set(cells.map((c) => c.x + "," + c.y));
  return cells.filter((c) => {
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !set.has((c.x + dx) + "," + (c.y + dy)));
  });
}

// dspChooseDoorCell(room, targetPoint, seed, tag) -> the room's own boundary cell NEAREST
// `targetPoint` (the other room's center — a deterministic geometric choice: the door should face
// the room it connects to), stable-hash tie-broken (dspHashStr chain, never rng()) on an exact
// distance tie. Falls back to the room's own bbox center if `room.cells`/boundary is somehow empty
// (never happens given dspForceCenterCore + a non-empty shape, but a safe non-throw fallback).
function dspChooseDoorCell(room, targetPoint, seed, tag) {
  const boundary = dspBoundaryCellsFor(room);
  if (!boundary.length) {
    return { x: room.x + Math.floor(room.w / 2), y: room.y + Math.floor(room.d / 2) };
  }
  let bestDist = Infinity, ties = [];
  boundary.forEach((c) => {
    const dx = c.x - targetPoint.x, dy = c.y - targetPoint.y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist - 1e-9) { bestDist = dist; ties = [c]; }
    else if (Math.abs(dist - bestDist) <= 1e-9) ties.push(c);
  });
  if (ties.length === 1) return ties[0];
  ties.sort((a, b) => a.x - b.x || a.y - b.y); // deterministic order before the hash pick
  const h = dspHashStr(String(seed) + ":" + tag);
  return ties[h % ties.length];
}

// dspRoomDoorAnchor(room, other, seed) -> the {x,y} point dspLShapedPathPts routes a corridor
// to/from for this room. A rect room (shape==='rect'|null/undefined, incl. every room when
// SPATIAL_SHAPES is off) returns its own bbox center — BYTE-IDENTICAL to the pre-C3 code (the old
// dspLShapedPath computed exactly this from the room object inline); a non-rect room returns a real
// polygon-boundary door cell instead (dspChooseDoorCell above).
function dspRoomDoorAnchor(room, other, seed) {
  if (!room.shape || room.shape === "rect" || !Array.isArray(room.cells) || !room.cells.length) {
    return { x: room.x + Math.floor(room.w / 2), y: room.y + Math.floor(room.d / 2) };
  }
  const target = { x: other.x + Math.floor(other.w / 2), y: other.y + Math.floor(other.d / 2) };
  return dspChooseDoorCell(room, target, seed, "door:" + room.segNum + ">" + other.segNum);
}

// ─── seeded RNG (mulberry32 — same reference pattern as src/ui/theater-boot.js) ──────────────
function dspHashStr(s) {
  // djb2-ish string hash → unsigned 32-bit int. Pure, deterministic, no Math.random/Date.now.
  let h = 5381;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return h >>> 0;
}
function dspMulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── topology → layout family (DUNGEON-GRAPH.md U1 stage 1) ─────────────────────────────────
const DSP_TOPOLOGY_GROUP = {
  "The Hub": "hub", "The Stronghold": "hub",
  "The Onion": "onion",
  "The Spine": "linear", "The Cascade": "linear", "The Ruin": "linear",
  "The Convergence": "linear", "The Figure-8": "linear",
  "The Loop": "loop",
  "The Branch": "tree",
  "The Web": "web", "The Labyrinth Fragment": "web",
};

function dspTopologyGroup(topologyName) {
  return DSP_TOPOLOGY_GROUP[topologyName] || "linear";
}

// radial layout shared by Hub (tight center, spokes evenly spread — check §3's >60° spread
// assertion) and Onion (wider rings per BFS depth = concentric shells).
function dspRadialByDepth(sorted, rng, ringGap) {
  const byDepth = {};
  sorted.forEach((s) => { (byDepth[s.depth] = byDepth[s.depth] || []).push(s); });
  const anchors = {};
  const baseAngle = rng() * Math.PI * 2;
  Object.keys(byDepth).map(Number).sort((a, b) => a - b).forEach((d) => {
    const arr = byDepth[d];
    const radius = d === 0 ? 0 : ringGap * d;
    arr.forEach((s, i) => {
      const angle = baseAngle + (2 * Math.PI * i) / arr.length + d * 0.15;
      anchors[s.id] = { ax: radius * Math.cos(angle), ay: radius * Math.sin(angle) };
    });
  });
  return anchors;
}

// linear-drift: depth on the x-axis, siblings fanned on the y-axis with a small seeded jitter.
function dspLinearDrift(sorted, rng) {
  const stepX = 9;
  const byDepth = {};
  sorted.forEach((s) => { (byDepth[s.depth] = byDepth[s.depth] || []).push(s); });
  const anchors = {};
  Object.keys(byDepth).map(Number).sort((a, b) => a - b).forEach((d) => {
    const arr = byDepth[d];
    arr.forEach((s, i) => {
      const lateral = (i - (arr.length - 1) / 2) * 7 + (rng() - 0.5) * 2;
      anchors[s.id] = { ax: d * stepX, ay: lateral };
    });
  });
  return anchors;
}

// ring: every node evenly on a circle in num order — also doubles as the Web/Labyrinth
// "planarize" seed (chords between non-adjacent num nodes cross naturally; the crossing-edge
// → bridge:true flag is caught later at corridor-carve time by real cell-overlap detection,
// not a separate geometric predicate).
function dspRingLayout(sorted, rng) {
  const n = Math.max(1, sorted.length);
  const radius = Math.max(8, n * 2);
  const baseAngle = rng() * Math.PI * 2;
  const anchors = {};
  sorted.forEach((s, i) => {
    const angle = baseAngle + (2 * Math.PI * i) / n;
    anchors[s.id] = { ax: radius * Math.cos(angle), ay: radius * Math.sin(angle) };
  });
  return anchors;
}

// tree-drift: recursive fan-out from the entry room; each node's parent is a depth-1 neighbor
// (lowest num wins a tie), children fan across the parent's angular wedge, radius grows by depth.
function dspTreeDrift(sorted, edges, entry, rng) {
  const byId = {}; sorted.forEach((s) => { byId[s.id] = s; });
  const adj = {}; sorted.forEach((s) => { adj[s.id] = []; });
  edges.forEach(({ aId, bId }) => { adj[aId].push(bId); adj[bId].push(aId); });
  const childrenOf = {};
  sorted.forEach((s) => {
    if (s.id === entry.id) return;
    const candidates = (adj[s.id] || [])
      .filter((nid) => byId[nid] && byId[nid].depth === s.depth - 1)
      .sort((a, b) => byId[a].num - byId[b].num);
    const p = candidates[0];
    if (p != null) (childrenOf[p] = childrenOf[p] || []).push(s.id);
  });
  const anchors = { [entry.id]: { ax: 0, ay: 0 } };
  const angleOf = { [entry.id]: 0 };
  const spanOf = { [entry.id]: Math.PI * 2 };
  const radiusStep = 8;
  const queue = [entry.id];
  while (queue.length) {
    const pid = queue.shift();
    const kids = childrenOf[pid] || [];
    if (!kids.length) continue;
    const parentAngle = angleOf[pid], span = spanOf[pid];
    const startAngle = parentAngle - span / 2;
    kids.forEach((kid, i) => {
      const a = kids.length === 1 ? parentAngle : startAngle + (span * (i + 0.5)) / kids.length;
      const jitter = (rng() - 0.5) * 0.3;
      angleOf[kid] = a + jitter;
      spanOf[kid] = Math.max(0.6, span / Math.max(1, kids.length));
      const r = radiusStep * byId[kid].depth;
      anchors[kid] = { ax: r * Math.cos(angleOf[kid]), ay: r * Math.sin(angleOf[kid]) };
      queue.push(kid);
    });
  }
  // any node dspTreeDrift's parent-walk didn't reach (ties/multi-parent edge cases) still needs
  // a deterministic anchor — fall back to a depth-keyed radial placement.
  sorted.forEach((s) => {
    if (!anchors[s.id]) anchors[s.id] = { ax: radiusStep * s.depth, ay: (rng() - 0.5) * radiusStep };
  });
  return anchors;
}

function dspLayoutFor(topologyName, sorted, edges, entry, rng) {
  const group = dspTopologyGroup(topologyName);
  if (group === "hub") return dspRadialByDepth(sorted, rng, 10);
  if (group === "onion") return dspRadialByDepth(sorted, rng, 8);
  if (group === "loop" || group === "web") return dspRingLayout(sorted, rng);
  if (group === "tree") return dspTreeDrift(sorted, edges, entry, rng);
  return dspLinearDrift(sorted, rng); // "linear" group (Spine/Cascade/Ruin/Convergence/Figure-8)
}

// ─── AABB separation (iterative push-apart, deterministic) ──────────────────────────────────
function dspSeparateRooms(rooms, minGap, iterations, rng) {
  for (let iter = 0; iter < iterations; iter++) {
    let moved = false;
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const a = rooms[i], b = rooms[j];
        const overlapX = a.x + a.w + minGap > b.x && b.x + b.w + minGap > a.x;
        const overlapY = a.y + a.d + minGap > b.y && b.y + b.d + minGap > a.y;
        if (!(overlapX && overlapY)) continue;
        const acx = a.x + a.w / 2, acy = a.y + a.d / 2;
        const bcx = b.x + b.w / 2, bcy = b.y + b.d / 2;
        let dx = bcx - acx, dy = bcy - acy;
        if (dx === 0 && dy === 0) {
          const ang = rng() * Math.PI * 2;
          dx = Math.cos(ang); dy = Math.sin(ang);
        }
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        const ux = dx / dist, uy = dy / dist;
        const push = 0.75; // sub-cell nudge per iteration — converges over `iterations` passes
        a.x -= ux * push; a.y -= uy * push;
        b.x += ux * push; b.y += uy * push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  rooms.forEach((r) => { r.x = Math.round(r.x); r.y = Math.round(r.y); });
}

function dspNormalizeRooms(rooms, padding) {
  if (!rooms.length) return;
  let minX = Infinity, minY = Infinity;
  rooms.forEach((r) => { minX = Math.min(minX, r.x); minY = Math.min(minY, r.y); });
  const dx = padding - minX, dy = padding - minY;
  rooms.forEach((r) => { r.x += dx; r.y += dy; });
}

// ─── corridor carving (EXITS ONLY — never an invented edge) ─────────────────────────────────
function dspInRect(c, r) { return c.x >= r.x && c.x < r.x + r.w && c.y >= r.y && c.y < r.y + r.d; }

// dspLShapedPathPts(pa, pb) -> the raw points-based core (STAGE-C C3): an L-bend path from point
// `pa` to point `pb` (horizontal leg first, then vertical), guaranteed path[0]===pa (exactly) and
// path[last]===pb (exactly) — the property C3's door-anchor wiring below depends on (a non-rect
// room's own chosen boundary door cell IS the path's own start/end point, no separate crossing-
// search needed on that side, see dspRoomDoorAnchor's header).
function dspLShapedPathPts(pa, pb) {
  const ax = pa.x, ay = pa.y, bx = pb.x, by = pb.y;
  const path = [];
  const stepX = bx >= ax ? 1 : -1;
  for (let x = ax; x !== bx; x += stepX) path.push({ x, y: ay });
  path.push({ x: bx, y: ay });
  const stepY = by >= ay ? 1 : -1;
  for (let y = ay; y !== by; y += stepY) path.push({ x: bx, y });
  path.push({ x: bx, y: by });
  return path;
}

// dspLShapedPath(ra, rb) -> BYTE-IDENTICAL to the pre-C3 code: an L-bend path between the two
// rooms' own bbox centers. Kept as a thin wrapper over dspLShapedPathPts (its own centers-from-
// room-objects computation, unchanged) for any direct caller (dev/*.mjs harnesses) that still
// expects the (room,room) signature.
function dspLShapedPath(ra, rb) {
  const pa = { x: ra.x + Math.floor(ra.w / 2), y: ra.y + Math.floor(ra.d / 2) };
  const pb = { x: rb.x + Math.floor(rb.w / 2), y: rb.y + Math.floor(rb.d / 2) };
  return dspLShapedPathPts(pa, pb);
}

function dspDedupe(path) {
  const seen = new Set(), out = [];
  path.forEach((c) => { const k = c.x + "," + c.y; if (!seen.has(k)) { seen.add(k); out.push(c); } });
  return out;
}

function dspWidenPath(path, width) {
  if (width <= 1) return dspDedupe(path);
  const map = new Map();
  path.forEach((c) => {
    map.set(c.x + "," + c.y, { x: c.x, y: c.y });
    map.set((c.x + 1) + "," + c.y, { x: c.x + 1, y: c.y });
    map.set(c.x + "," + (c.y + 1), { x: c.x, y: c.y + 1 });
  });
  return Array.from(map.values());
}

function dspExitDoorCell(path, room) {
  let idx = -1;
  path.forEach((c, i) => { if (dspInRect(c, room)) idx = i; });
  return idx >= 0 ? path[idx] : null;
}
function dspEntryDoorCell(path, room) {
  for (let i = 0; i < path.length; i++) if (dspInRect(path[i], room)) return path[i];
  return null;
}

/* ─── ELEV-1 — rolled room elevation, THE PROJECTION (docs/KENNEY-SOCKET-WAVE.md ELEV-1) ────────
   `segment.elevation` (src/engine/dungeon-walk.js's dwalkElevation, {roll,profile,degradedFrom})
   projects onto the SAME parallel `tiers` buffer STAGE C2's side-parse patches already write —
   extends its logical write range to ±3 quanta (the buffer itself is Int8Array already, no
   datatype change; ±3 is the new LEGITIMATE write range this unit adds). PRECEDENCE LAW: a
   side-parse cell (Adam's rolled prose) WINS — the profile only fills cells side-parse left at 0.
   Door-aperture cells + their inside neighbor are forced back to tier 0 as a final pass (a rolled
   profile routinely covers HALF the room or more, unlike side-parse's small hand-authored patches,
   so a profile/door collision is the common case here, not the rare one side-parse never needed to
   guard). SHAPE-GENERIC: every patch generator below reads ONLY `room.cells` (the room's actual
   C3 polygon, whatever its shape) — no octagon/L/cross special-casing. Determinism: every
   disambiguating choice (which half raises, terrace step count, chasm depth) uses ITS OWN
   dspHashStr-derived chain off this build's `seed` (never the shared mulberry32 `rng` stream),
   same discipline as C2's dspTerrainSeedHash / C3's dspShapeCellHash01 — never perturbs the call
   sequence any OTHER draw in this file depends on. */

function dspElevBBox(cells) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  cells.forEach((c) => {
    if (c.x < minX) minX = c.x; if (c.x > maxX) maxX = c.x;
    if (c.y < minY) minY = c.y; if (c.y > maxY) maxY = c.y;
  });
  return { minX, maxX, minY, maxY, w: maxX - minX + 1, d: maxY - minY + 1 };
}

// Dais / Sunken center: a centroid patch at ~half the room's own bbox extent per axis, intersected
// against the room's ACTUAL polygon (never bleeds onto a non-floor cell of an L/octagon/cave room).
function dspElevCentroidCells(room, frac) {
  const cellSet = new Set(room.cells.map((c) => c.x + "," + c.y));
  const bb = dspElevBBox(room.cells);
  const pw = Math.max(1, Math.min(bb.w, Math.round(bb.w * frac)));
  const pd = Math.max(1, Math.min(bb.d, Math.round(bb.d * frac)));
  const ox = bb.minX + Math.floor((bb.w - pw) / 2), oy = bb.minY + Math.floor((bb.d - pd) / 2);
  const out = [];
  for (let y = oy; y < oy + pd; y++) for (let x = ox; x < ox + pw; x++) if (cellSet.has(x + "," + y)) out.push({ x, y });
  return out;
}

// Split-level: raise ONE half (picked off the seed hash) +1 along the room's own longer axis; the
// "one stair/ramp cell" is a SINGLE cell (never a whole boundary column/row) — the room.cells member
// nearest the split line AND nearest the room's own cross-axis center, held back to baseline 0
// regardless of which half it would otherwise fall in.
function dspElevSplitCells(room, seed) {
  const bb = dspElevBBox(room.cells);
  const alongX = bb.w >= bb.d;
  const raiseFirst = (dspHashStr(String(seed) + ":elev:split:" + room.segNum) % 2) === 0;
  const mid = alongX ? (bb.minX + Math.floor(bb.w / 2)) : (bb.minY + Math.floor(bb.d / 2));
  const crossCenter = alongX ? (bb.minY + bb.d / 2) : (bb.minX + bb.w / 2);
  let joinKey = null, joinDist = Infinity;
  room.cells.forEach((c) => {
    const along = alongX ? c.x : c.y, cross = alongX ? c.y : c.x;
    const dist = Math.abs(along - mid) + Math.abs(cross - crossCenter);
    if (dist < joinDist) { joinDist = dist; joinKey = c.x + "," + c.y; }
  });
  const out = [];
  room.cells.forEach((c) => {
    if (joinKey && (c.x + "," + c.y) === joinKey) return; // the one stair/ramp cell
    const along = alongX ? c.x : c.y;
    if ((along < mid) === raiseFirst) out.push(c);
  });
  return out;
}

// Terraced: 2-3 steps of +1 climbing from one edge along the room's own longer axis. Step count is
// seed-picked (2 or 3, matching the table's "2-3 steps" band); band 0 (the starting edge) stays
// baseline 0, bands 1..steps climb +1 each — caps the max tier at +3, inside the ±3 budget exactly.
function dspElevTerracedPatches(room, seed) {
  const bb = dspElevBBox(room.cells);
  const alongX = bb.w >= bb.d;
  const steps = 2 + (dspHashStr(String(seed) + ":elev:terrace:" + room.segNum) % 2);
  const bands = steps + 1;
  const extent = alongX ? bb.w : bb.d, base = alongX ? bb.minX : bb.minY;
  const byBand = Array.from({ length: bands }, () => []);
  room.cells.forEach((c) => {
    const rel = (alongX ? c.x : c.y) - base;
    const bandIdx = Math.max(0, Math.min(bands - 1, Math.floor((rel * bands) / Math.max(1, extent))));
    byBand[bandIdx].push(c);
  });
  const patches = [];
  for (let b = 1; b < bands; b++) if (byBand[b].length) patches.push({ cells: byBand[b], tier: b });
  return patches;
}

// Gallery ring: the room's own polygon FRONTIER (any cell 4-adjacent to a non-member cell) at +2 —
// a one-cell-wide perimeter ring, shape-generic off room.cells (works identically for a rect,
// octagon, or cave room's frontier). The interior stays at baseline 0 ("overlooking center" — the
// draft names no separate center tier, so none is invented here).
function dspElevGalleryRingCells(room) {
  const allowed = room.cells;
  const allowedKeys = new Set(allowed.map((c) => c.x + "," + c.y));
  return allowed.filter((c) =>
    !allowedKeys.has((c.x - 1) + "," + c.y) || !allowedKeys.has((c.x + 1) + "," + c.y) ||
    !allowedKeys.has(c.x + "," + (c.y - 1)) || !allowedKeys.has(c.x + "," + (c.y + 1)));
}

// Chasm/shaft: a one-cell-wide cut perpendicular to the room's longer axis, through its middle, at
// -2 or -3 (seed-picked); one cell along the cut (the "bridge or edge path") stays baseline 0 so
// the room is never fully bisected into two unreachable halves by the profile alone.
function dspElevChasmPatches(room, seed) {
  const bb = dspElevBBox(room.cells);
  const alongX = bb.w >= bb.d;
  const h = dspHashStr(String(seed) + ":elev:chasm:" + room.segNum);
  const tier = -(2 + (h % 2));
  const mid = alongX ? (bb.minX + Math.floor(bb.w / 2)) : (bb.minY + Math.floor(bb.d / 2));
  const bridgeAt = alongX ? (bb.minY + Math.floor(bb.d / 2)) : (bb.minX + Math.floor(bb.w / 2));
  const cells = [];
  room.cells.forEach((c) => {
    const coord = alongX ? c.x : c.y;
    if (coord !== mid) return;
    const cross = alongX ? c.y : c.x;
    if (cross === bridgeAt) return; // the bridge/edge-path cell
    cells.push(c);
  });
  return cells.length ? [{ cells, tier }] : [];
}

// dspElevationPatchesForProfile(profile, room, seed) -> [{cells:[{x,y}...], tier}] — the dispatcher.
// "Flat" and any unrecognized profile name (a future Adam re-tune this build hasn't seen yet)
// -> [] (no patches, room stays flat) — an honest no-op, never a guess.
function dspElevationPatchesForProfile(profile, room, seed) {
  if (!room || !Array.isArray(room.cells) || !room.cells.length) return [];
  switch (profile) {
    case "Dais": { const cells = dspElevCentroidCells(room, 0.5); return cells.length ? [{ cells, tier: 1 }] : []; }
    case "Sunken center": { const cells = dspElevCentroidCells(room, 0.5); return cells.length ? [{ cells, tier: -1 }] : []; }
    case "Split-level": { const cells = dspElevSplitCells(room, seed); return cells.length ? [{ cells, tier: 1 }] : []; }
    case "Terraced": return dspElevTerracedPatches(room, seed);
    case "Gallery ring": { const cells = dspElevGalleryRingCells(room); return cells.length ? [{ cells, tier: 2 }] : []; }
    case "Chasm/shaft": return dspElevChasmPatches(room, seed);
    default: return [];
  }
}

// ─── the single-attempt build (throws on an unreachable plan; caller retries with a new seed) ─
function dspBuildPlanOnce(segments, topologyName, opts, seed) {
  const rng = dspMulberry32(seed);
  const byId = {}; segments.forEach((s) => { byId[s.id] = s; });

  // unique undirected edges — exits are stored symmetrically (walk.js builds adj both ways), so
  // dedupe by an order-independent key. This is the ONLY source of corridors: never invent one.
  const edgeMap = new Map();
  segments.forEach((s) => {
    (s.exits || []).forEach((e) => {
      if (!byId[e.targetId]) return; // never invent an edge to a segment that doesn't exist
      const key = s.id < e.targetId ? s.id + "|" + e.targetId : e.targetId + "|" + s.id;
      if (!edgeMap.has(key)) edgeMap.set(key, { aId: s.id, bId: e.targetId });
    });
  });
  const edges = Array.from(edgeMap.values());

  const entry = segments.find((s) => s.depth === 0)
    || segments.slice().sort((a, b) => a.depth - b.depth || a.num - b.num)[0];
  if (!entry) throw new Error("no entry segment (empty segments[])");

  const sizeClass = opts.sizeClass || {};
  const minW = sizeClass.minW || 4, maxW = Math.max(minW, sizeClass.maxW || 7);
  const minD = sizeClass.minD || 4, maxD = Math.max(minD, sizeClass.maxD || 7);
  const sorted = segments.slice().sort((a, b) => a.num - b.num);
  const sizeOf = {}, dimsRefOf = {}, shapeOf = {};
  sorted.forEach((s) => {
    // STAGE-C C1: ALWAYS draw the same two rng() numbers here, in the same order, regardless of
    // SPATIAL_SHAPES or whether `s.dims` parses — this is what "do NOT change the rng call
    // sequence" (STAGE-C.md C1 step 2) means in practice. Every later rng() consumer in this
    // function (dspLayoutFor, dspSeparateRooms, corridor width, ...) then sees a byte-identical
    // draw stream whether a room's footprint ends up parsed-from-dims or fallback-random — the
    // ONLY thing SPATIAL_SHAPES/a successful parse changes is which w/d values get USED below,
    // never how many rng() calls happened or in what order.
    const w = minW + Math.floor(rng() * (maxW - minW + 1));
    const d = minD + Math.floor(rng() * (maxD - minD + 1));
    let sz = { w: Math.max(4, w), d: Math.max(4, d) };
    if (SPATIAL_SHAPES) {
      const parsed = dspDimsToCells(s.dims);
      if (parsed) { sz = { w: parsed.wCells, d: parsed.dCells }; dimsRefOf[s.id] = s.dims; }
      // STAGE-C C3: shape classification is pure string work off `s.areaType` — never touches rng()
      // (same "never change the call sequence" law C1's own comment states above), independent of
      // whether `s.dims` itself parsed.
      shapeOf[s.id] = shapeForArchetype(s.areaType);
    }
    sizeOf[s.id] = sz;
  });

  const anchors = dspLayoutFor(topologyName, sorted, edges, entry, rng);

  const rooms = sorted.map((s) => {
    const sz = sizeOf[s.id];
    const a = anchors[s.id] || { ax: 0, ay: 0 };
    return {
      segNum: s.num, segId: s.id,
      x: a.ax - sz.w / 2, y: a.ay - sz.d / 2, w: sz.w, d: sz.d,
      depth: s.depth, isFinale: !!s.isFinale, role: null, scaleDomain: 1.0,
      dimsRef: dimsRefOf[s.id] || null, // STAGE-C C1 step 3: additive provenance, harmless if unused
      terrain: null, // STAGE-C C2: [{cells,tier,kind}] | null — populated below when segment.side parses
      shape: shapeOf[s.id] || null, // STAGE-C C3: 'rect'|'circle'|'octagon'|'ellipse'|'L'|'T'|'cross'|'cave'|null
      cells: null, // STAGE-C C3: [{x,y}] GLOBAL floor cells for this room — populated below
    };
  });

  dspSeparateRooms(rooms, 2, 60, rng);
  dspNormalizeRooms(rooms, 3);

  let maxX = 0, maxY = 0;
  rooms.forEach((r) => { maxX = Math.max(maxX, r.x + r.w); maxY = Math.max(maxY, r.y + r.d); });
  const cellW = maxX + 3, cellD = maxY + 3;
  const cells = new Uint8Array(cellW * cellD);
  const idx = (x, y) => y * cellW + x;

  // STAGE-C C3 REAL SHAPES: a `shape` other than 'rect' rasterizes its OWN footprint (rasterizeShape,
  // this section's header note) inside the room's C1 bbox instead of filling the whole rect; a 'rect'
  // shape (or SPATIAL_SHAPES off, where r.shape is always null) takes the ORIGINAL full-rect fill
  // loop unchanged — byte-identical cells-buffer output for every rect room, every SPATIAL_SHAPES-off
  // plan.
  rooms.forEach((r) => {
    const roomCells = [];
    if (r.shape && r.shape !== "rect") {
      const localIncluded = rasterizeShape(r.shape, r.w, r.d, seed + ":shape:" + r.segNum);
      for (let ly = 0; ly < r.d; ly++) {
        for (let lx = 0; lx < r.w; lx++) {
          if (!localIncluded[ly * r.w + lx]) continue;
          const xx = r.x + lx, yy = r.y + ly;
          roomCells.push({ x: xx, y: yy });
          if (xx >= 0 && yy >= 0 && xx < cellW && yy < cellD) cells[idx(xx, yy)] = SPATIAL_CELL.FLOOR;
        }
      }
    } else {
      for (let yy = r.y; yy < r.y + r.d; yy++) {
        for (let xx = r.x; xx < r.x + r.w; xx++) {
          roomCells.push({ x: xx, y: yy });
          if (xx >= 0 && yy >= 0 && xx < cellW && yy < cellD) cells[idx(xx, yy)] = SPATIAL_CELL.FLOOR;
        }
      }
      if (SPATIAL_SHAPES) r.shape = "rect"; // stamp the tag even for the rect/default path (additive)
    }
    if (SPATIAL_SHAPES) r.cells = roomCells; // additive; stays null when SPATIAL_SHAPES is off
  });

  // STAGE-C C2 STRUCTURAL TERRAIN (docs/STAGE-C.md C2): parse each room's own segment.side into
  // structural terrain patches + stamp their tiers onto a parallel `tiers` buffer (SAME shape/indexing as
  // `cells`, default 0 everywhere = flat). Additive only — never touches `cells`' own SPATIAL_CELL
  // code, so a dais/pit cell stays exactly as walkable/routable/BFS-reachable as it always was; the
  // render seam (interiorBuildBoard, theater-interior.js) is the only consumer of `tiers`. Behind
  // the shared SPATIAL_SHAPES flag: OFF restores byte-identical pre-C2 behavior (tiers stays
  // all-zero, no room gets `.terrain`).
  const tiers = new Int8Array(cellW * cellD);
  if (SPATIAL_SHAPES) {
    rooms.forEach((r) => {
      const seg = byId[r.segId];
      const terrain = dspParseSideTerrains(seg && seg.side, r, seed);
      if (!terrain.length) return;
      r.terrain = terrain; // DUNGEON-GRAPH.md U6 shape: rooms[].terrain = [{cells,tier,kind}]
      terrain.forEach((patch) => patch.cells.forEach((c) => {
        if (c.x >= 0 && c.y >= 0 && c.x < cellW && c.y < cellD) tiers[idx(c.x, c.y)] = patch.tier;
      }));
    });
  }

  const roomBySeg = {}; rooms.forEach((r) => { roomBySeg[r.segId] = r; });

  const corridors = [], doors = [], carvedCellSets = [];
  edges.forEach(({ aId, bId }) => {
    const ra = roomBySeg[aId], rb = roomBySeg[bId];
    if (!ra || !rb) return;
    const width = 1 + (rng() < 0.15 ? 1 : 0); // width 1-2 cells, seeded

    // STAGE-C C3: dspRoomDoorAnchor returns a room's own bbox center for a rect room (BYTE-
    // IDENTICAL to the pre-C3 `dspLShapedPath(ra,rb)` call this replaces — both compute the exact
    // same two points) or a real polygon-boundary cell for a non-rect room (the "exit derived FROM
    // the polygon face" STAGE-C.md C3 step 3 calls for). dspLShapedPathPts guarantees
    // path[0]===anchorA and path[last]===anchorB exactly, so a non-rect room's door cell IS its own
    // anchor — no separate crossing-search needed on that side.
    const anchorA = dspRoomDoorAnchor(ra, rb, seed);
    const anchorB = dspRoomDoorAnchor(rb, ra, seed);
    const path = dspLShapedPathPts(anchorA, anchorB);
    const widened = dspWidenPath(path, width);
    const cellKeySet = new Set(widened.map((c) => c.x + "," + c.y));

    // Web/Labyrinth planarize law: a crossing edge emits bridge:true instead of overlapping —
    // detected here as a REAL cell-overlap against every already-carved corridor (not a topology
    // special-case), so it fires for any topology whose layout happens to cross, honestly.
    let bridge = false;
    for (const prior of carvedCellSets) {
      for (const k of cellKeySet) { if (prior.has(k)) { bridge = true; break; } }
      if (bridge) break;
    }
    carvedCellSets.push(cellKeySet);

    widened.forEach((c) => {
      if (c.x >= 0 && c.y >= 0 && c.x < cellW && c.y < cellD) {
        if (cells[idx(c.x, c.y)] === SPATIAL_CELL.VOID) cells[idx(c.x, c.y)] = SPATIAL_CELL.FLOOR;
      }
    });

    // rect room (or SPATIAL_SHAPES off, where .shape stays null so this test is always false) keeps
    // the ORIGINAL corridor-crosses-the-rectangle search; a non-rect room's door is its own anchor.
    const doorA = (ra.shape && ra.shape !== "rect") ? anchorA : dspExitDoorCell(path, ra);
    const doorB = (rb.shape && rb.shape !== "rect") ? anchorB : dspEntryDoorCell(path, rb);
    if (doorA && doorA.x >= 0 && doorA.y >= 0 && doorA.x < cellW && doorA.y < cellD) {
      cells[idx(doorA.x, doorA.y)] = SPATIAL_CELL.DOOR;
      // STAGE-C C3: `toSeg` binds this door to the segment.exits[] edge it serves (the segment this
      // door LEADS TO from ra's side) — additive alongside the pre-existing `betweenSegs` pair.
      doors.push({ x: doorA.x, y: doorA.y, betweenSegs: [ra.segNum, rb.segNum], toSeg: rb.segNum, heightScale: 1.0 });
    }
    if (doorB && doorB.x >= 0 && doorB.y >= 0 && doorB.x < cellW && doorB.y < cellD) {
      cells[idx(doorB.x, doorB.y)] = SPATIAL_CELL.DOOR;
      doors.push({ x: doorB.x, y: doorB.y, betweenSegs: [ra.segNum, rb.segNum], toSeg: ra.segNum, heightScale: 1.0 });
    }

    corridors.push({ fromSeg: ra.segNum, toSeg: rb.segNum, cells: widened, width, bridge });
  });

  // ELEV-1 (docs/KENNEY-SOCKET-WAVE.md ELEV-1): fold each room's rolled `segment.elevation` profile
  // into `tiers` — runs HERE (after doors are carved, `doors[]` fully populated) so the door-cell
  // law below can zero every real door-aperture cell regardless of source. PRECEDENCE LAW: only
  // writes a cell still at 0 (a side-parse patch, stamped above, already claimed anything nonzero).
  if (SPATIAL_SHAPES) {
    rooms.forEach((r) => {
      const seg = byId[r.segId];
      if (!seg || !seg.elevation || !r.cells || !r.cells.length) return;
      const profile = seg.elevation.profile;
      const patches = dspElevationPatchesForProfile(profile, r, seed);
      if (!patches.length) return;
      r.elevationProfile = { profile, degradedFrom: seg.elevation.degradedFrom || null }; // additive provenance
      patches.forEach((patch) => patch.cells.forEach((c) => {
        if (c.x < 0 || c.y < 0 || c.x >= cellW || c.y >= cellD) return;
        const ii = idx(c.x, c.y);
        if (tiers[ii] !== 0) return; // side-parse already claimed this cell — it wins
        tiers[ii] = patch.tier;
      }));
    });

    // Door-aperture law: a door cell, and every room-interior cell immediately inside it, always
    // stay tier 0 — a rolled profile can legitimately cover half a room or more (unlike side-parse's
    // small hand-authored patches), so without this a dais/sunken/terrace/chasm patch would routinely
    // stamp a doorway. `toSeg` identifies the OTHER room a door leads to; the door's OWN room is
    // whichever of betweenSegs isn't toSeg (dungeon-walk.js's own doors[] convention, unchanged here).
    // ALL matching same-room 4-neighbors are zeroed, not just the first found — a door cell can sit
    // where more than one of its neighbors belongs to its own room (e.g. near a corner of a non-rect
    // C3 shape), and a player stepping through should never land on a raised/lowered cell on ANY side.
    doors.forEach((d) => {
      if (d.x < 0 || d.y < 0 || d.x >= cellW || d.y >= cellD) return;
      tiers[idx(d.x, d.y)] = 0;
      const ownSeg = Array.isArray(d.betweenSegs) ? d.betweenSegs.find((n) => n !== d.toSeg) : null;
      const ownRoom = ownSeg != null ? rooms.find((r) => r.segNum === ownSeg) : null;
      if (!ownRoom || !Array.isArray(ownRoom.cells)) return;
      const ownKeys = new Set(ownRoom.cells.map((c) => c.x + "," + c.y));
      const nbrs = [[d.x + 1, d.y], [d.x - 1, d.y], [d.x, d.y + 1], [d.x, d.y - 1]];
      for (const [nx, ny] of nbrs) {
        if (ownKeys.has(nx + "," + ny) && nx >= 0 && ny >= 0 && nx < cellW && ny < cellD) tiers[idx(nx, ny)] = 0;
      }
    });
  }

  // rasterize: any VOID cell 8-adjacent to a passable (FLOOR/DOOR/WATER) cell becomes WALL.
  const passable = new Set([SPATIAL_CELL.FLOOR, SPATIAL_CELL.DOOR, SPATIAL_CELL.WATER]);
  const toWall = [];
  for (let y = 0; y < cellD; y++) {
    for (let x = 0; x < cellW; x++) {
      if (cells[idx(x, y)] !== SPATIAL_CELL.VOID) continue;
      let adj = false;
      for (let dy = -1; dy <= 1 && !adj; dy++) {
        for (let dx = -1; dx <= 1 && !adj; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= cellW || ny >= cellD) continue;
          if (passable.has(cells[idx(nx, ny)])) adj = true;
        }
      }
      if (adj) toWall.push(idx(x, y));
    }
  }
  toWall.forEach((i) => { cells[i] = SPATIAL_CELL.WALL; });

  // BFS reachability verify from the entry segment's room.
  const entryRoom = roomBySeg[entry.id];
  if (!entryRoom) throw new Error("no entry room placed");
  const startX = Math.min(cellW - 1, Math.max(0, entryRoom.x + Math.floor(entryRoom.w / 2)));
  const startY = Math.min(cellD - 1, Math.max(0, entryRoom.y + Math.floor(entryRoom.d / 2)));
  if (!passable.has(cells[idx(startX, startY)])) throw new Error("entry cell not passable");
  const seen = new Uint8Array(cellW * cellD);
  const q = [[startX, startY]]; seen[idx(startX, startY)] = 1;
  let head = 0;
  while (head < q.length) {
    const [cx, cy] = q[head++];
    const nbrs = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
    for (const [nx, ny] of nbrs) {
      if (nx < 0 || ny < 0 || nx >= cellW || ny >= cellD) continue;
      const ii = idx(nx, ny);
      if (seen[ii] || !passable.has(cells[ii])) continue;
      seen[ii] = 1; q.push([nx, ny]);
    }
  }
  let unreachable = 0;
  for (let i = 0; i < cells.length; i++) if (cells[i] === SPATIAL_CELL.FLOOR && !seen[i]) unreachable++;
  if (unreachable > 0) throw new Error(`unreachable FLOOR cells: ${unreachable} of ${cells.length}`);

  const domains = [{ scale: 1.0, segNums: rooms.map((r) => r.segNum), transitions: [] }];

  return { seed, topology: topologyName, cellW, cellD, cells, tiers, rooms, corridors, doors, domains };
}

/** spatializePlan(segments, topologyName, opts) → SpatialPlan (docs/DUNGEON-GRAPH.md
 *  "Shared data shape"). `segments` is a walk's segment array (walk.js:593-625 shape: id/num/
 *  label/isFinale/depth/exits[]/light). `opts.walkId` seeds determinism; `opts.sizeClass`
 *  ({minW,maxW,minD,maxD}) is the optional GRID-LAW room-size override. Honest-fail: after the
 *  first attempt + up to 5 seed-mutated retries still can't verify reachability, throws naming
 *  the topology and the seed that failed — never returns a hand-patched plan. */
function spatializePlan(segments, topologyName, opts) {
  opts = opts || {};
  if (!Array.isArray(segments) || !segments.length) {
    throw new Error("spatializePlan: segments[] is required and must be non-empty");
  }
  const fingerprint = opts.walkId != null
    ? String(opts.walkId)
    : topologyName + "|" + segments.map((s) => s.id + ":" + s.num + ":" + (s.exits || []).map((e) => e.targetId).join(",")).join("|");
  let seed = dspHashStr(fingerprint);
  const originalSeed = seed;
  let lastErr = null;
  const MAX_ATTEMPTS = 6; // first try + 5 retries
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return dspBuildPlanOnce(segments, topologyName, opts, seed);
    } catch (e) {
      lastErr = e;
      seed = dspHashStr(seed + ":retry:" + attempt); // mutate seed, deterministic re-hash
    }
  }
  throw new Error(
    `spatializePlan: topology "${topologyName}" seed ${originalSeed} failed to verify after ${MAX_ATTEMPTS} attempts — ${lastErr ? lastErr.message : "unknown"}`
  );
}
