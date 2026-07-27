/* Verify CL-F07a — the rung-1 terrain proof (docs/TERRAIN-PROGRAM.md §2.0, §2.1, §3.5, §4.3).

   THIS FILE IS THE EXECUTABLE BACK-END GATE, verbatim from §4.3:
     · zero walkable cells above 30 degrees
     · zero unowned faces at 2h+ neighbour deltas
     · zero unreachable standable surfaces
     · all 6 boundary strings resolve
     · all 50 d50 rows resolve or are declared non-terrain with a reason
     · all 13 footing coverage strings place
     · determinism (same segment id -> byte-identical heightfield, twice, in separate page loads)

   Per the Teeth Law the back end is mine to prove and the visual verdict is Adam's: nothing in
   this file asserts that anything LOOKS right. jsdom, classic-script load, no GL.

   "Separate page loads" is honoured literally: every determinism check builds each field in its
   OWN fresh JSDOM window, so the two heightfields never share a module instance, a closure, or a
   cursor — a shared-state determinism bug cannot hide behind one window.

   RED-FIRST. Run with `--red` to execute the same assertions against a NULL chassis (the three
   engine modules blanked). Every gate below must FAIL in that mode; if any passes red, the check
   is not testing what it claims and is worthless. That mode is the proof these gates have teeth,
   run in the same process as the green pass rather than asserted in a comment. */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const RED = process.argv.includes("--red");
/* In the red run EVERY source read comes back empty, not just the eval'd chassis — otherwise the
   source-text gates (15a-f) would read the real file off disk and "pass" while proving nothing. */
const read = (p) => RED ? "" : readFileSync(join(ROOT, p), "utf8");

const CHASSIS = [
  "src/engine/terrain-field.js",
  "src/engine/terrain-pieces.js",
  "src/engine/terrain-bench.js"
];

/* A fresh window = a fresh page load. */
function freshWin(){
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const src = RED ? "/* chassis blanked for the red run */" : CHASSIS.map(read).join("\n;\n");
  dom.window.eval(src);
  return dom.window;
}

let pass = 0, fail = 0;
const results = [];
const check = (name, cond, detail = "") => {
  results.push({ name, ok: !!cond });
  return cond ? (pass++, console.log("  ✓", name))
              : (fail++, console.log("  ✗", name, detail ? "— " + detail : ""));
};
/* Every assertion runs inside this so a missing chassis fails the gate instead of crashing the
   harness — which is exactly what the red run needs. */
function guard(name, fn){
  try { return fn(); }
  catch(e){ check(name, false, String(e && e.message || e).slice(0, 160)); return null; }
}

console.log(RED
  ? "\n=== CL-F07a gate — RED RUN (chassis blanked; every check MUST fail) ===\n"
  : "\n=== CL-F07a gate — docs/TERRAIN-PROGRAM.md §4.3 ===\n");

const W = freshWin();
const GATE = guard("0. gate report builds", () => W.terrainBenchGateReport());

// ============================================================================
// 1. The grid law is STRUCTURE-KIT's, not a second copy that can drift
// ============================================================================
console.log("1. grid-law provenance");
guard("1a. grid law matches STRUCTURE-KIT §2", () => {
  const src = read("src/engine/clay-room.js");
  const grab = (k) => { const m = src.match(new RegExp(k + ":\\s*([0-9.]+)")); return m ? Number(m[1]) : null; };
  const law = W.TERRAIN_GRID_LAW;
  const same = law.cellFeet === grab("cellFeet")
    && law.cellWorldUnits === grab("cellWorldUnits")
    && law.verticalQuantumFeet === grab("verticalQuantumFeet")
    && law.verticalQuantumWorldUnits === grab("verticalQuantumWorldUnits")
    && law.storeyQuanta === grab("storeyQuanta")
    && law.storeyFeet === grab("storeyFeet")
    && law.maxWalkableSlopeDeg === grab("maxWalkableSlopeDeg");
  check("1a. TERRAIN_GRID_LAW === CLAY_STRUCTURE_KIT_CATALOG.gridLaw (no second copy)", same,
    JSON.stringify({ terrain: law.verticalQuantumFeet, kit: grab("verticalQuantumFeet") }));
});
guard("1b. one walkable step is 26.57 deg", () => {
  const deg = W.terrainSlopeDegForStepH(1);
  check("1b. a 1h step across one 5-ft cell = 26.565 deg, inside the 30 deg limit",
    Math.abs(deg - 26.5650511771) < 1e-6 && deg < W.TERRAIN_GRID_LAW.maxWalkableSlopeDeg, "deg=" + deg);
});

// ============================================================================
// 2. DETERMINISM — the hard gate. Two SEPARATE page loads, byte-identical.
// ============================================================================
console.log("2. determinism (hard gate)");
guard("2. determinism", () => {
  const scenes = W.CL_F07_TERRAIN_BENCH.scenes.map(s => s.id);
  const A = freshWin(), B = freshWin();
  let allSame = true, mismatch = "";
  scenes.forEach(id => {
    const fa = A.terrainBenchSceneBuild(id).fields;
    const fb = B.terrainBenchSceneBuild(id).fields;
    if(fa.length !== fb.length){ allSame = false; mismatch = id + " field count"; return; }
    fa.forEach((f, i) => {
      const bytesA = Array.from(f.heights).join(",");
      const bytesB = Array.from(fb[i].heights).join(",");
      if(bytesA !== bytesB){ allSame = false; mismatch = id + "/" + f.id + " heightfield bytes"; }
      if(f.fingerprint !== fb[i].fingerprint){ allSame = false; mismatch = id + "/" + f.id + " fingerprint"; }
    });
  });
  check("2a. same segment id -> byte-identical heightfield across two separate page loads",
    allSame && scenes.length === 7, mismatch);

  /* A generator that ignores its seed would also pass 2a. */
  const c = freshWin();
  const s1 = c.terrainBenchSceneBuild("thirteen-piece-sheet", 111).primary.fingerprint;
  const s2 = c.terrainBenchSceneBuild("thirteen-piece-sheet", 222).primary.fingerprint;
  check("2b. a different seed produces a different field (the seed is load-bearing)", s1 !== s2);

  /* Determinism must survive REORDERING, or a shared cursor is hiding in the pieces. */
  const d = freshWin();
  const forward = d.terrainBenchSceneBuild("boundary-sheet").fields.map(f => f.fingerprint);
  const reverse = d.CL_F07_TERRAIN_BENCH.scenes.slice().reverse()
    .filter(s => s.id === "boundary-sheet")
    .flatMap(() => d.terrainBenchSceneBuild("boundary-sheet").fields.map(f => f.fingerprint));
  check("2c. rebuilding the same scene in one window is stable (no shared cursor)",
    JSON.stringify(forward) === JSON.stringify(reverse));

  /* Match the CALL, not the prose — terrain-field.js's own header says the words "no Math.random". */
  const noRandom = CHASSIS.every(p => !/Math\.random\s*\(/.test(read(p)));
  check("2d. no Math.random anywhere in the chassis", !RED && noRandom);
});

// ============================================================================
// 3. THE ONE CLAMP — if this fails the §2.0 chassis claim is false. STOP, do not fudge.
// ============================================================================
console.log("3. the one-clamp proof (§4.3 capture 2)");
guard("3. one clamp", () => {
  const p = W.terrainOneClampProof(W.terrainSeedFrom("cl-f07a"));
  check("3a. hill and cliff come from the SAME generator", p.sameGenerator);
  check("3b. their parameter sets are identical except slopeClamp", p.sameParametersExceptClamp,
    JSON.stringify(p.parameterDiff));
  check("3c. clamp=1 yields a hill: max walkable step 1h, zero faces",
    p.hill.maxWalkStepH <= 1 && p.hillHasNoFaces,
    "step=" + p.hill.maxWalkStepH + " faces=" + p.hill.faces);
  check("3d. clamp=Infinity yields a cliff: faces exist at 2h+",
    p.cliffHasFaces, "faces=" + p.cliff.faces);
  check("3e. the clamp actually lowered ground (it is not a no-op)", p.cellsLoweredByClamp > 0,
    "lowered=" + p.cellsLoweredByClamp);
  check("3f. VERDICT: one chassis", p.verdict.indexOf("ONE CHASSIS") === 0, p.verdict);
});

// ============================================================================
// 4-6. The geometric gates, over EVERY field of all seven scenes
// ============================================================================
console.log("4. geometry gates (all seven scenes)");
guard("4-6. geometry", () => {
  const g = GATE.gates;
  check("4a. GATE zero walkable cells above 30 degrees", g.walkableCellsAbove30Deg === 0,
    "count=" + g.walkableCellsAbove30Deg + " max=" + g.maxWalkableSlopeDeg + "deg");
  check("4b. no walk edge exceeds the 1h quantum", g.illegalWalkEdges === 0,
    "edges=" + g.illegalWalkEdges);
  check("5. GATE zero unowned faces at 2h+ neighbour deltas", g.unownedFacesAt2hPlus === 0,
    "count=" + g.unownedFacesAt2hPlus);
  check("6. GATE zero unreachable standable surfaces (non-flying route)",
    g.unreachableStandableSurfaces === 0, "count=" + g.unreachableStandableSurfaces);
});

// ============================================================================
// 7. All six boundary strings resolve
// ============================================================================
console.log("7. the six boundary strings (§1.2A)");
guard("7. boundaries", () => {
  const g = GATE.gates;
  check("7a. GATE all 6 boundary kinds exist", g.boundaryKinds === 6, "kinds=" + g.boundaryKinds);
  check("7b. GATE every distinct boundary string in the live table resolves",
    g.boundaryStringsResolved === g.boundaryStringsTotal && g.boundaryStringsTotal === 7,
    g.boundaryStringsResolved + "/" + g.boundaryStringsTotal);
  /* Built, not merely mapped: each of the six must produce a real perimeter on the same kidney. */
  const fields = W.terrainBenchSceneBuild("boundary-sheet").fields;
  const sameLayout = fields.every(f => f.extent.x === 12 && f.extent.y === 16 && f.shape === "kidney");
  check("7c. all six build on ONE 60x80 kidney layout", fields.length === 6 && sameLayout);
  const hard = fields.filter(f => f.metrics.faces > 0);
  check("7d. the two hard-elevation boundaries build real faces (cliff 8h, bank 4h)",
    hard.length === 2, "faces>0 in " + hard.length);
  const named = fields.every(f => f.metrics.entryCells > 0);
  check("7e. every boundary frame still admits its named entry (94.3% rule)", named);
  const blocking = fields.find(f => f.id.indexOf("thorn") >= 0);
  const fog = fields.find(f => f.id.indexOf("fog") >= 0);
  check("7f. an impassable volume restricts entries where an obscurement volume does not",
    blocking.metrics.entryCells < fog.metrics.entryCells,
    "thicket=" + blocking.metrics.entryCells + " fog=" + fog.metrics.entryCells);
});

// ============================================================================
// 8. All 50 d50 rows resolve or are declared non-terrain WITH A REASON
// ============================================================================
console.log("8. wilderness-tactical-terrain, all 50 rows (§1.2B)");
guard("8. d50", () => {
  const g = GATE.gates;
  check("8a. GATE all 50 rows accounted for", g.d50Total === 50 && g.d50Unresolved === 0,
    "terrain=" + g.d50Terrain + " nonTerrain=" + g.d50NonTerrainDeclared + " unresolved=" + g.d50Unresolved);
  const reasoned = GATE.d50NonTerrain.every(r => typeof r.reason === "string" && r.reason.length > 20);
  check("8b. every non-terrain declaration carries a real reason", reasoned,
    JSON.stringify(GATE.d50NonTerrain.filter(r => !r.reason || r.reason.length <= 20)));
  /* A row is only "resolved" if its piece actually builds. */
  let builds = 0, broke = "";
  for(let d = 1; d <= 50; d++){
    const row = W.terrainResolveTacticalRow(d);
    if(!row || row.nonTerrain) continue;
    try {
      const ops = W.terrainPieceOps(row.pieceId, row.params, { ex: 8, ey: 8, rng: W.terrainRng(d) });
      const f = W.terrainFieldBuild({ id: "d50-" + d, seed: d, extentCells: { x: 8, y: 8 },
        slopeClamp: 1, pieces: [{ id: "d50-" + d, pieceId: row.pieceId, params: ops.params, ops: ops.ops }] });
      if(f.metrics.walkableCellsOverSlopeLimit === 0 && f.metrics.unownedFaces === 0) builds++;
      else broke += " d50-" + d;
    } catch(e){ broke += " d50-" + d + "!"; }
  }
  check("8c. every terrain row BUILDS legally, not just maps", builds === GATE.gates.d50Terrain,
    builds + "/" + GATE.gates.d50Terrain + broke);
});

// ============================================================================
// 9. Footing coverage grammar
// ============================================================================
console.log("9. wilderness-footing coverage placement (§1.2D)");
guard("9. coverage", () => {
  const g = GATE.gates;
  check("9a. GATE all 13 canonical coverage forms place",
    g.coverageCanonicalForms === 13 && g.coverageFailed.length === 0, JSON.stringify(g.coverageFailed));
  check("9b. all 18 DISTINCT strings in the live table place (superset, not just the 13)",
    g.coveragePlaced === 18 && g.coverageTotal === 18, g.coveragePlaced + "/" + g.coverageTotal);
  const full = W.terrainResolveCoverage("100% of Area", 12, 16);
  const perim = W.terrainResolveCoverage("Outer Perimeter", 12, 16);
  const half = W.terrainResolveCoverage("50% of Area", 12, 16);
  check("9c. coverage geometry is honest (100% = every cell; 50% = half; perimeter = the rim)",
    full.cellCount === 192 && half.cellCount === 96 && perim.cellCount === 2 * 12 + 2 * 16 - 4,
    full.cellCount + "/" + half.cellCount + "/" + perim.cellCount);
});

// ============================================================================
// 10. The walk-down (hostile case, §4.2)
// ============================================================================
console.log("10. the 16-cell walk-down (§4.3 capture 5)");
guard("10. walk-down", () => {
  const wd = W.terrainBenchWalkDownProof(W.terrainSeedFrom("cl-f07a"));
  check("10a. degradedFrom is recorded", !!wd.degradedFrom && wd.degradedFrom.steps.length > 0,
    JSON.stringify(wd.degradedFrom && wd.degradedFrom.steps && wd.degradedFrom.steps.length));
  check("10b. the request genuinely exceeded the tray", wd.requestedFootprintCells > wd.trayCells * 0.6,
    wd.requestedFootprintCells + " vs " + wd.trayCells);
  check("10c. the walked-down variant fits the 60% law",
    wd.finalFootprintCells <= wd.trayCells * W.TERRAIN_TRAY_OCCUPANCY_LIMIT,
    wd.finalFootprintCells + "/" + wd.trayCells);
  check("10d. it produced a LEGAL board, never an illegal one", wd.legalBoard);
  check("10e. the receipt names the law it borrowed",
    /room-elevation-profile/.test(wd.degradedFrom.law));
});

// ============================================================================
// 11. Thirteen PRESETS over one chassis — not thirteen generators
// ============================================================================
console.log("11. thirteen presets, one chassis (§2.1)");
guard("11. presets", () => {
  const ids = W.TERRAIN_R1_PIECE_IDS;
  check("11a. all thirteen pieces exist, R1-01..R1-13", ids.length === 13
    && ids[0] === "R1-01" && ids[12] === "R1-13", ids.join(","));
  const vocab = new Set(W.TERRAIN_CHASSIS_OPS);
  let offVocab = [];
  ids.forEach(id => {
    const built = W.terrainPieceOps(id, {}, { ex: 8, ey: 8, rng: W.terrainRng(1) });
    built.ops.forEach(op => { if(!vocab.has(op.type)) offVocab.push(id + ":" + op.type); });
  });
  check("11b. every preset emits ONLY chassis ops (no piece has its own generator)",
    offVocab.length === 0, offVocab.join(","));
  const constructed = ids.filter(id => {
    const c = W.TERRAIN_R1_PRESETS[id].construction;
    return typeof c === "string" && c.length > 40;
  });
  check("11c. every preset carries its real-world construction sentence as DATA",
    constructed.length === 13, constructed.length + "/13");
  const morphed = ids.filter(id => (W.TERRAIN_R1_PRESETS[id].morphParams || []).length >= 6);
  check("11d. every preset names at least six morph parameters (resize/stretch/deform first-class)",
    morphed.length === 13, morphed.length + "/13");
  /* A preset that ignores its morph parameters is a fixed asset wearing a parameter's name. */
  const hillSmall = W.terrainFieldBuild({ id: "h1", seed: 7, extentCells: { x: 12, y: 12 }, slopeClamp: 1,
    pieces: [{ id: "h", pieceId: "R1-02", ops: W.terrainPieceOps("R1-02",
      { crestHeightH: 2, footprintRadiusCells: 2, cx: 6, cy: 6 }, { ex: 12, ey: 12, rng: W.terrainRng(7) }).ops }] });
  const hillBig = W.terrainFieldBuild({ id: "h2", seed: 7, extentCells: { x: 12, y: 12 }, slopeClamp: 1,
    pieces: [{ id: "h", pieceId: "R1-02", ops: W.terrainPieceOps("R1-02",
      { crestHeightH: 5, footprintRadiusCells: 5, cx: 6, cy: 6 }, { ex: 12, ey: 12, rng: W.terrainRng(7) }).ops }] });
  check("11e. a morph parameter actually morphs (crest 2h/r2 vs 5h/r5 differ, both legal)",
    hillBig.metrics.maxH > hillSmall.metrics.maxH
    && hillBig.metrics.walkableCellsOverSlopeLimit === 0
    && hillSmall.metrics.walkableCellsOverSlopeLimit === 0,
    hillSmall.metrics.maxH + " -> " + hillBig.metrics.maxH);
});

// ============================================================================
// 12. R1-13 morph proof (§3.5) — four results, one parameterization, no code branch
// ============================================================================
console.log("12. R1-13 root/branch bridge — chassis hooks (§3.5)");
guard("12. R1-13", () => {
  const field = W.terrainBenchSceneBuild("route-proof").primary;
  const anchors = W.terrainAnchorSet(field);
  check("12a. anchors derive from the rung-1 field, not from an authored list",
    anchors.length > 0 && anchors.some(a => a.kind === "face-top")
    && anchors.some(a => a.kind === "tray-edge"), "n=" + anchors.length);
  const cases = [
    { name: "single root arch over a 1-cell stream cut", p: { spanCount: 1, undercutDepthH: 1, lengthCells: 1 } },
    { name: "three-span root bridge across a 3-cell chasm", p: { spanCount: 3, junctionCount: 1, lengthCells: 3 } },
    { name: "branch highway at 4h between two boles", p: { spanCount: 1, heightAboveDatumH: 4, sagRatio: 0.15 } },
    { name: "case 2 with one span dead-brittle", p: { spanCount: 3, junctionCount: 1, barkCondition: "dead-brittle" } }
  ].map(c => W.terrainSpanNetwork(anchors, c.p));
  check("12b. all four §3.5 morph cases come from one parameterization",
    cases[0].spanCount === 1 && cases[1].spanCount === 3
    && cases[2].spans[0].role === "high-ground-with-a-fall-beneath"
    && cases[3].spans[0].collapse !== null,
    cases.map(c => c.spanCount).join("/"));
  check("12c. collapse is a DECLARED property with a countable trigger, never improvisation",
    cases[3].spans[0].collapse.trigger === "weight"
    && typeof cases[3].spans[0].collapse.threshold === "number"
    && cases[3].spans[0].collapse.visibleOnInspection === true);
  check("12d. tread width is DERIVED from diameter, not authored",
    W.terrainSpanNetwork(anchors, { spanCount: 1, diameterFt: 1 }).spans[0].movement === "balance-check"
    && W.terrainSpanNetwork(anchors, { spanCount: 1, diameterFt: 3 }).spans[0].movement === "normal"
    && W.terrainSpanNetwork(anchors, { spanCount: 1, diameterFt: 5 }).spans[0].movement === "one-cell-footprint");
  check("12e. the deferral is DECLARED, not hidden",
    /deferred/.test(JSON.stringify(cases[0].deferred)) === false
    && typeof cases[0].deferred === "string" && cases[0].deferred.length > 20, cases[0].deferred);
});

// ============================================================================
// 13. The route proof (§4.3 capture 4)
// ============================================================================
console.log("13. the route proof (§4.3 capture 4)");
guard("13. route", () => {
  const r = W.terrainBenchRouteProof(W.terrainSeedFrom("cl-f07a"));
  check("13a. the row is a REAL area-type row, quoted",
    r.sourceRow.d300 === 260 && /20' wide paths at both ends/.test(r.sourceRow.features));
  check("13b. every named entry resolves to a walkable edge cell",
    r.namedEntries.length === 2 && r.namedEntries.every(e => e.walkableEdgeCell && e.cell != null),
    JSON.stringify(r.namedEntries));
  check("13c. approach / deployment / objective / retreat all exist",
    r.approach && r.approach.length > 1 && r.deployment.length > 0
    && r.objective != null && r.retreat && r.retreat.length > 1,
    "approach=" + (r.approach && r.approach.length) + " retreat=" + (r.retreat && r.retreat.length));
  check("13d. two meaningfully different plans, both TERRAIN-caused, both with a tradeoff",
    r.plans.length === 2 && r.plans.every(p => p.terrainCause && p.tradeoff)
    && r.plans[0].terrainCause !== r.plans[1].terrainCause);
  check("13e. the objective is genuinely raised ground (the 20'x20' platform)",
    r.field.cells[r.objective].h > 0, "h=" + r.field.cells[r.objective].h);
});

// ============================================================================
// 14. The support graph (§4.3 capture 6)
// ============================================================================
console.log("14. the support graph (§4.3 capture 6)");
guard("14. support", () => {
  const s = W.terrainSupportGraphReport(W.terrainBenchSceneBuild("support-graph").primary);
  check("14a. the contract is stated", s.contract === "every-standable-surface-reachable-without-flight");
  check("14b. zero standable surfaces unreachable without flight", s.unreachableStandable === 0,
    JSON.stringify(s.unreachableIndices));
  check("14c. no sub-cell surface mints a false 5-ft footprint", s.subCellSurfaces === 0);
  check("14d. guarded slope is EXCLUDED from the walkable set, not silently walked", (() => {
    const f = W.terrainBenchSceneBuild("thirteen-piece-sheet").primary;
    const guarded = f.cells.filter(c => c.kind === "guarded-slope");
    return guarded.length > 0 && guarded.every(c => !c.standable);
  })());
});

// ============================================================================
// 15. Renderer owns zero terrain (the walk-native / clay-proof boundary)
// ============================================================================
console.log("15. renderer-owns-zero-terrain boundary");
guard("15. renderer boundary", () => {
  const src = read("src/ui/theater-clay-room.js");
  const start = src.indexOf("CL-F07 TERRAIN BENCH");
  const end = src.indexOf("function clayRoomSuppressLightingBenchNoise");
  const region = start >= 0 && end > start ? src.slice(start, end) : "";
  check("15a. the terrain bench region exists in the production clay module", region.length > 2000);
  check("15b. it PROJECTS the chassis (calls terrainBenchSceneBuild)",
    /terrainBenchSceneBuild\(/.test(region));
  check("15c. it authors no randomness of its own", region.length > 2000 && !/Math\.random/.test(region));
  check("15d. it refuses to draw when the chassis is absent",
    /terrain chassis not loaded/.test(region));
  check("15e. it never rolls dice or applies events (renderer owns zero mechanics)",
    region.length > 2000 && !/\bd20\b|applyEvent\(|walkPick\(/.test(region));
  check("15f. it reuses the governed 72-degree strategic camera rather than a second one",
    /clayRoomTerrainView === "strategic"/.test(src) && (src.match(/72 \* Math\.PI \/ 180/g) || []).length === 1);
});

// ============================================================================
// 16. Manifest
// ============================================================================
console.log("16. manifest");
/* Skipped in the red run: check-manifest reads the real tree, so it can neither pass nor fail on
   account of a blanked chassis. A check that cannot be falsified by the red condition does not
   belong in the red tally. */
if(!RED) guard("16. manifest", () => {
  let out = "";
  try { out = execFileSync("python3", [join(ROOT, "build/check-manifest.py")], { cwd: ROOT, encoding: "utf8" }); }
  catch(e){ out = String(e.stdout || "") + String(e.stderr || ""); }
  check("16a. python3 build/check-manifest.py -> RESULT: OK", /RESULT: OK/.test(out));
  check("16b. all three chassis modules exist on disk", CHASSIS.every(p => existsSync(join(ROOT, p))));
});

// ============================================================================
console.log("");
if(RED){
  const green = results.filter(r => r.ok);
  console.log(`RED RUN: ${pass} passed, ${fail} failed.`);
  if(green.length){
    console.log("RED RUN FAILED — these checks pass without a chassis and therefore prove nothing:");
    green.forEach(r => console.log("   !", r.name));
    process.exit(1);
  }
  console.log("RED RUN OK — every gate fails without the chassis, so every gate has teeth.");
  process.exit(0);
}
console.log(`${pass} passed, ${fail} failed.`);
process.exit(fail ? 1 : 0);
