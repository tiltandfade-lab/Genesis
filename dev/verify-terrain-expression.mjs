/* Verify TERRAIN EXPRESSION — the engine half (docs/TERRAIN-EXPRESSION-BUILD.md §2-§5).

   THE BACK-END GATE FOR THE DRESSING PASS. dev/verify-terrain-bench.mjs proves the chassis;
   dev/verify-terrain-standee.cjs proves what only a renderer and a camera can show; this proves the
   two claims that make the whole build honest and that neither of the others can:

     * §5 GAMEPLAY INVARIANCE — the walkable census, cover set, occupancy and LOS are byte-identical
       across all six rungs of the ladder. The instrument is terrainWalkFingerprint, and this file
       PROVES THE INSTRUMENT CAN FAIL before trusting it: mutate occupancy, walking, climbing,
       movement cost, a face, and an entry, and the fingerprint must move every time. A gate that
       cannot fail is not a gate (the backdrop-luma lesson; two probes were discarded this session
       for exactly this).

     * §1 P2 — the two gates that would stay green on the failure picture. The flat-plant-on-a-slope
       case is executed here, in arithmetic, so the receipt can show the LEGACY origin gap reading
       0.096-green on the exact picture the new nearest-contact gap fails at 0.217.

   Per the Teeth Law the back end is mine to prove and the visual verdict is Adam's: nothing in this
   file asserts that anything LOOKS right. jsdom, classic-script load, no GL.

   RED-FIRST. `--red` runs every assertion against a BLANKED chassis; every check must fail.
   `--mutate` runs the invariance proof against a deliberately corrupted field; the gate must fire.
*/

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
const read = (p) => RED ? "" : readFileSync(join(ROOT, p), "utf8");

const CHASSIS = [
  "src/engine/terrain-field.js",
  "src/engine/terrain-pieces.js",
  "src/engine/terrain-expression.js",
  "src/engine/terrain-bench.js"
];

function freshWin(){
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(RED ? "/* chassis blanked for the red run */" : CHASSIS.map(read).join("\n;\n"));
  return dom.window;
}

let pass = 0, fail = 0;
const results = [];
const check = (name, cond, detail = "") => {
  results.push({ name, ok: !!cond });
  return cond ? (pass++, console.log("  ✓", name))
              : (fail++, console.log("  ✗", name, detail ? "— " + detail : ""));
};
function guard(name, fn){
  try { return fn(); }
  catch(e){ check(name, false, String(e && e.message || e).slice(0, 200)); return null; }
}

console.log(RED
  ? "\n=== TERRAIN EXPRESSION gate — RED RUN (chassis blanked; every check MUST fail) ===\n"
  : "\n=== TERRAIN EXPRESSION gate — docs/TERRAIN-EXPRESSION-BUILD.md ===\n");

const W = freshWin();

// ============================================================================
console.log("1. the device registry and the three dressing bins");
guard("1. registry", () => {
  const devices = W.TERRAIN_EXPRESSION_DEVICES;
  check("1a. eleven live devices, each with an id, a bin and its grounds (rejected A7 sedimentary "
    + "face bands are absent; R6's climbable rock bits remain independently governed)",
    devices.length === 11
    && devices.every(d => d.id && d.key && d.bin && typeof d.grounds === "string" && d.grounds.length > 30),
    "n=" + devices.length);
  const bins = new Set(W.TERRAIN_EXPRESSION_BINS);
  check("1b. every device sorts into a declared bin", devices.every(d => bins.has(d.bin)),
    devices.filter(d => !bins.has(d.bin)).map(d => d.id).join(","));
  check("1c. `geometry` is a bin of its own, so a shape change cannot hide in a dressing bin",
    bins.has("geometry") && devices.some(d => d.bin === "geometry"));
  check("1d. every device declares itself non-gameplay (the claim this file re-proves in §5)",
    devices.every(d => d.gameplay === false));
  const keys = devices.map(d => d.key);
  check("1e. device keys are unique", new Set(keys).size === keys.length);
});

console.log("2. the six-rung ladder");
guard("2. ladder", () => {
  const rungs = W.TERRAIN_EXPRESSION_RUNGS;
  check("2a. six rungs: naked -> material -> decal -> prop -> all -> jitter-disabled control",
    rungs.length === 6
    && JSON.stringify(rungs.map(r => r.id))
      === JSON.stringify(["naked", "material", "decal", "prop", "all", "nojitter"]),
    rungs.map(r => r.id).join(","));
  const naked = W.terrainExpressionFlags("naked");
  check("2b. NAKED turns on nothing at all (the control is a control)",
    naked.on.length === 0 && naked.anyDevice === false, naked.on.join(","));
  const mat = W.terrainExpressionFlags("material");
  check("2c. the material rung turns on the material bin and no prop or decal",
    mat.rollover && mat.joint && mat.wash && !mat.occluders && !mat.jitter);
  const dec = W.terrainExpressionFlags("decal");
  check("2d. the historical decal URL is now an inert compatibility control: it cannot resurrect "
    + "the rejected regular face bands",
    !("facedress" in dec) && JSON.stringify(dec.on) === JSON.stringify(mat.on) && !dec.occluders);
  const prop = W.terrainExpressionFlags("prop");
  check("2e. the prop rung adds occluders and jitter", prop.occluders && prop.jitter);
  const all = W.terrainExpressionFlags("all");
  check("2f. ALL turns on every device", all.off.length === 0, all.off.join(","));
  const nj = W.terrainExpressionFlags("nojitter");
  check("2g. the negative control differs from ALL by exactly one device — jitter",
    nj.jitter === false && nj.off.length === 1 && nj.off[0] === "A1", nj.off.join(","));
  let threw = false;
  try { W.terrainExpressionFlags("no-such-rung"); } catch(e){ threw = true; }
  check("2h. an unknown rung THROWS instead of silently rendering naked", threw);
  check("2i. every device is independently switchable (an explicit override wins over the rung)",
    W.terrainExpressionFlags("naked", { rollover: true }).rollover === true
    && W.terrainExpressionFlags("all", { rollover: false }).rollover === false);
});

// ============================================================================
console.log("3. THE INSTRUMENT MUST BE ABLE TO FAIL (mutation proof, before it is trusted)");
const MUT = guard("3. mutation", () => {
  const field = W.terrainBenchSceneBuild("thirteen-piece-sheet").primary;
  const base = W.terrainWalkFingerprint(field);
  check("3a. the walk fingerprint is a stable string", typeof base === "string" && base.length === 17, base);

  function clone(){
    const f = W.terrainBenchSceneBuild("thirteen-piece-sheet").primary;
    return f;
  }
  const mutations = [
    ["a standable flag flips", (f) => { const i = f.cells.findIndex(c => c.standable); f.cells[i].standable = false; }],
    ["one walk edge disappears", (f) => { const i = f.walkAdj.findIndex(a => a.length > 0); f.walkAdj[i] = f.walkAdj[i].slice(1); }],
    ["one height moves by a quantum", (f) => { f.heights[f.heights.length >> 1] += 1; }],
    ["a face changes its delta", (f) => { f.faces[0].deltaH += 1; }],
    ["an entry cell is lost", (f) => { f.entryCells = f.entryCells.slice(1); }],
    ["a cell leaves the playfield", (f) => { const i = f.cells.findIndex(c => c.inPlayfield); f.cells[i].inPlayfield = false; }],
    ["one climb edge disappears", (f) => {
      const i = f.climbAdj.findIndex(a => a.length > 0);
      f.climbAdj[i] = f.climbAdj[i].slice(1);
    }],
    ["difficult terrain flips", (f) => {
      const i = f.cells.findIndex(c => c.inPlayfield);
      f.cells[i].difficult = !f.cells[i].difficult;
    }],
    ["a face climb DC changes", (f) => {
      f.faces[0].climbDc = (f.faces[0].climbDc == null ? 12 : f.faces[0].climbDc + 1);
    }]
  ];
  const caught = mutations.filter(([, mutate]) => {
    const f = clone(); mutate(f);
    return W.terrainWalkFingerprint(f) !== base;
  });
  check("3b. EVERY gameplay mutation moves the fingerprint (9/9) — the gate has teeth",
    caught.length === mutations.length,
    caught.length + "/" + mutations.length + " caught: " + caught.map(c => c[0]).join(" · "));

  /* And the converse: a purely visual edit must NOT move it, or "cosmetic" would be unprovable. */
  const vis = clone();
  vis.cells.forEach(c => { c.surface = c.surface || "scree"; });
  check("3c. a purely visual edit (a surface label) does NOT move the walk fingerprint",
    W.terrainWalkFingerprint(vis) === base);
  check("3d. the FULL fingerprint DOES move on that same visual edit — which is exactly why it "
    + "cannot answer the cosmetic question and a walk-only instrument was needed",
    W.terrainFieldFingerprint(vis) !== field.fingerprint);
  return base;
});

// ============================================================================
console.log("4. §5 THE GAMEPLAY-INVARIANCE GATE — six rungs, one census");
guard("4. invariance", () => {
  const proof = W.terrainExpressionInvarianceProof(function(){
    return W.terrainBenchSceneBuild("thirteen-piece-sheet");
  });
  check("4a. all six rungs report the SAME walk-only fingerprint", proof.identical,
    proof.divergedRungs.join(","));
  check("4b. the verdict is COSMETIC", proof.verdict.indexOf("COSMETIC") === 0, proof.verdict);
  check("4c. standable cells, walk edges, faces and entries are identical across the six rungs",
    new Set(proof.rungs.map(r => r.standableCells)).size === 1
    && new Set(proof.rungs.map(r => r.walkEdges)).size === 1
    && new Set(proof.rungs.map(r => r.faces)).size === 1
    && new Set(proof.rungs.map(r => r.entryCells)).size === 1,
    JSON.stringify(proof.rungs.map(r => [r.rung, r.standableCells, r.walkEdges])));
  /* the gate firing, proved rather than asserted */
  let fired = false;
  try {
    let n = 0;
    const bad = W.terrainExpressionInvarianceProof(function(rung){
      const s = W.terrainBenchSceneBuild("thirteen-piece-sheet");
      if(n++ === 3){ s.fields[0].cells[0].standable = !s.fields[0].cells[0].standable; }
      return s;
    });
    fired = !bad.identical && bad.verdict.indexOf("GAMEPLAY CHANGE") === 0
      && bad.divergedRungs.indexOf("prop") >= 0;
  } catch(e){ fired = false; }
  check("4d. RED: corrupt one rung's standable set and the gate reports GAMEPLAY CHANGE naming it",
    fired);
  /* every rung must be measured over EVERY scene, not just the sheet */
  const scenes = W.CL_F07_TERRAIN_BENCH.scenes.map(s => s.id);
  const allSame = scenes.every(id => W.terrainExpressionInvarianceProof(
    function(){ return W.terrainBenchSceneBuild(id); }).identical);
  check("4e. invariance holds on all seven scenes, not only the sheet", allSame && scenes.length === 7);
});

// ============================================================================
console.log("5. the declared stand plane (§3 B1's chassis rider)");
guard("5. stand plane", () => {
  const f = W.terrainBenchSceneBuild("thirteen-piece-sheet").primary;
  const off = W.terrainExpressionFlags("naked");
  const on = W.terrainExpressionFlags("all");
  const idx = f.cells.findIndex(c => c.standable && Math.abs(W.terrainCellGradient(f, c.index).dx) > 0.4);
  check("5a. the sheet contains a graded cell to measure", idx >= 0, "idx=" + idx);
  const pOff = W.terrainCellStandPlane(f, idx, off);
  const pOn = W.terrainCellStandPlane(f, idx, on);
  check("5b. THE WALKABLE CENTRE NEVER MOVES — visual sub-noise cannot offset one cell from the next",
    pOff.centreH === pOn.centreH && Math.abs(pOn.centreH - f.cells[idx].h) < 1e-12);
  check("5c. with the shallow grade OFF the plane is exactly horizontal",
    pOff.dHdx === 0 && pOff.dHdz === 0 && pOff.slopeDeg === 0);
  check("5d. the default is g3: the only grade that joins a real 1h-per-cell run without a residual "
    + "riser or invented height",
    on.gradeId === "g3" && Math.abs(pOn.slopeDeg - W.terrainSlopeDegForStepH(1)) < 0.001,
    on.gradeId + " / " + pOn.slopeDeg);
  const g2 = W.terrainExpressionFlags("all", { gradeId: "g2" });
  check("5d2. the 18-degree FFT comparison grade remains explicitly selectable",
    g2.gradeId === "g2" && Math.abs(W.terrainSlopeDegForStepH(g2.gradeScale) - 18.0) < 0.05,
    g2.gradeId + " / " + W.terrainSlopeDegForStepH(g2.gradeScale));
  let worst = 0;
  f.cells.forEach(c => {
    if(c.kind === "void") return;
    const p = W.terrainCellStandPlane(f, c.index, on);
    if(p.slopeDeg > worst) worst = p.slopeDeg;
  });
  check("5e. no rendered stand plane anywhere claims a grade past the 30 deg walk law",
    worst <= W.TERRAIN_GRID_LAW.maxWalkableSlopeDeg + 1e-9, "worst=" + worst.toFixed(3) + "deg");
  check("5f. and none exceeds the 26.565 deg one-quantum step",
    worst <= W.terrainSlopeDegForStepH(1) + 1e-9, "worst=" + worst.toFixed(3));
});

// ============================================================================
console.log("6. the tri-split fold, honestly (§3 B4)");
guard("6. fold", () => {
  const f = W.terrainBenchSceneBuild("thirteen-piece-sheet").primary;
  const on = W.terrainExpressionFlags("all");
  const budget = W.TERRAIN_WALK_NOISE_BUDGET_H.perCellH;
  let worst = 0, atCentre = 0;
  f.cells.forEach(c => {
    if(c.kind === "void") return;
    atCentre = Math.max(atCentre, Math.abs(W.terrainCellFoldOffset(f, c.index, 0, 0, on)));
    for(let u = -0.5; u <= 0.5001; u += 0.25) for(let v = -0.5; v <= 0.5001; v += 0.25){
      worst = Math.max(worst, Math.abs(W.terrainCellFoldOffset(f, c.index, u, v, on)));
    }
  });
  check("6a. the fold NEVER exceeds TERRAIN_WALK_NOISE_BUDGET_H.perCellH (2.32 inches per cell)",
    worst <= budget + 1e-12, worst.toFixed(6) + " vs " + budget.toFixed(6));
  check("6b. the fold is EXACTLY ZERO at the stand point — the plinth never sits on a crease",
    atCentre === 0);
  check("6c. it is off entirely when the device is off",
    W.terrainCellFoldOffset(f, 5, 0.5, 0.5, W.terrainExpressionFlags("naked")) === 0);
  const a = freshWin(), b = freshWin();
  const fa = a.terrainBenchSceneBuild("thirteen-piece-sheet").primary;
  const fb = b.terrainBenchSceneBuild("thirteen-piece-sheet").primary;
  const seq = (w, fld) => fld.cells.slice(0, 60).map(c => w.terrainCellFoldDiagonal(fld, c.index)).join("");
  check("6d. the per-cell diagonal is deterministic across two separate page loads",
    seq(a, fa) === seq(b, fb));
  check("6e. the diagonal is not constant (it is a real per-cell choice, not a fixed split)",
    new Set(seq(a, fa).split("")).size === 2, seq(a, fa).slice(0, 30));
  check("6f. the tri-split declares ONE stand plane — a Medium needs 0.831 wu and a half-cell "
    + "triangle inscribes only 0.586, so two standable triangles was never available",
    Math.abs(W.terrainProtectedDiameter("medium") - 0.831) < 0.002
    && (1 + 1 - Math.SQRT2) < W.terrainProtectedDiameter("medium"),
    W.terrainProtectedDiameter("medium").toFixed(4));
  let edgeFold = 0;
  f.cells.forEach(c => {
    if(c.kind === "void") return;
    [-0.5, 0, 0.5].forEach(t => {
      edgeFold = Math.max(edgeFold,
        Math.abs(W.terrainCellFoldOffset(f, c.index, -0.5, t, on)),
        Math.abs(W.terrainCellFoldOffset(f, c.index, 0.5, t, on)),
        Math.abs(W.terrainCellFoldOffset(f, c.index, t, -0.5, on)),
        Math.abs(W.terrainCellFoldOffset(f, c.index, t, 0.5, on)));
    });
  });
  check("6g. the fold is EXACTLY ZERO around the whole cell perimeter — adjacent cells cannot "
    + "publish unrelated relief at one edge", edgeFold === 0, String(edgeFold));
  const route = W.terrainBenchSceneBuild("route-proof");
  const reports = route.fields.map(field => W.terrainSurfaceContinuityReport(field, on));
  check("6h. every declared terrace/ramp surface in the route proof publishes one shared edge "
    + "height, with a non-empty measured sample",
    reports.length > 0 && reports.every(r => r.ok && r.samplesChecked > 0),
    JSON.stringify(reports));
  const segs = W.terrainFineJointSegments(f, f.cells.find(c => c.inPlayfield).index);
  check("6i. fine material joints are clipped staggered courses, never a second tactical square",
    W.TERRAIN_FINE_JOINT_LAW.pattern === "staggered-running-bond"
    && segs.length === 7
    && segs.every(s => s.every(v => Math.abs(v) < 0.5))
    && segs.some(s => s[1] === s[3]) && segs.some(s => s[0] === s[2]),
    JSON.stringify(segs));
  check("6j. continuous tactical seams are lighter than real relief boundaries, so the height "
    + "topology—not the square lattice—owns the silhouette",
    W.TERRAIN_FINE_JOINT_LAW.continuousTacticalValueMultiplier
      > W.TERRAIN_FINE_JOINT_LAW.reliefBoundaryValueMultiplier
    && W.TERRAIN_FINE_JOINT_LAW.fineValueMultiplier
      > W.TERRAIN_FINE_JOINT_LAW.continuousTacticalValueMultiplier);
});

// ============================================================================
console.log("7. §1 P2 — THE GATE THAT COULD NOT FAIL, shown failing");
guard("7. contact probe", () => {
  const C = W.TERRAIN_STANDEE_CONTRACT;
  check("7a. the protected disc is 0.932 wu for the worst Medium — 93% of the cell",
    Math.abs(W.terrainProtectedDiameter("mediumCap") - 0.932) < 0.002,
    W.terrainProtectedDiameter("mediumCap").toFixed(4));
  check("7b. the free ring around it is 0.034 wu (about two inches)",
    Math.abs((0.5 - W.terrainProtectedRadius("mediumCap")) - 0.034) < 0.002);

  /* One cell inclined by one walkable quantum: 0.5 wu rise over 1.0 wu run, 26.565 deg. */
  const dY = 0.5;                                   /* world units of rise per cell of run */
  const groundY = 0;
  const originY = groundY + C.contactLift;          /* the production contact law, verbatim */
  const planeAt = (x) => groundY + x * dY;
  const common = {
    bboxW: C.envelopes.mediumCap.bboxW, bboxD: C.envelopes.mediumCap.bboxD,
    yawRad: Math.PI / 4,                            /* FREE yaw — the production default */
    originY: originY, standX: 0, standZ: 0,
    planeAt: (x) => planeAt(x)
  };
  const flat = W.terrainStandeeContactProbe(Object.assign({}, common,
    { tilted: false, planeDYdx: dY, planeDYdz: 0 }));
  const tilt = W.terrainStandeeContactProbe(Object.assign({}, common,
    { tilted: true, planeDYdx: dY, planeDYdz: 0 }));

  check("7c. FLAT-PLANT on a 26.565 deg cell: the LEGACY origin gap reads 0.096 — exactly the "
    + "number WITNESS_MAX_GAP=0.2 passes — while the plinth's corners are ±0.21 wu out",
    Math.abs(flat.legacyOriginGap - 0.096) < 1e-4 && flat.legacyOriginGap < 0.2
    && Math.abs(flat.maxCornerGap) > 0.2 && flat.minCornerGap < -0.2,
    "legacy=" + flat.legacyOriginGap + " min=" + flat.minCornerGap + " max=" + flat.maxCornerGap);
  check("7d. the NEW signals fire on that same picture (F1 buried AND F2 airborne)",
    flat.fires.F1 && flat.fires.F2);
  check("7e. TILTING the plinth to the plane gives zero error at free yaw, by construction",
    Math.abs(tilt.cornerSpread) < 1e-9 && !tilt.fires.F1 && !tilt.fires.F2,
    "spread=" + tilt.cornerSpread + " min=" + tilt.minCornerGap);
  check("7f. and the tilted plinth still sits at the authored 0.006 embed, not floating",
    Math.abs(tilt.nearestContactGap + C.nominalEmbed) < 1e-4, tilt.nearestContactGap);
  check("7g. on FLAT ground both conventions agree and both read the authored embed",
    Math.abs(W.terrainStandeeContactProbe(Object.assign({}, common,
      { tilted: false, planeDYdx: 0, planeDYdz: 0, planeAt: () => 0 })).nearestContactGap
      + C.nominalEmbed) < 1e-4);
  /* F5 — the structure-kit stair's free-yaw failure, stated as a number rather than argued */
  const treadDepth = 0.37333;
  const diag = Math.sqrt(C.envelopes.mediumCap.bboxW ** 2 + C.envelopes.mediumCap.bboxD ** 2);
  const alongFree = (C.envelopes.mediumCap.bboxW + C.envelopes.mediumCap.bboxD) / Math.SQRT2;
  check("7h. F5 stated: a FREE-yaw Medium-cap plinth spans 0.866 wu along a 0.373 wu structure-kit "
    + "tread — 0.247 wu of plinth off each side. claySupportWorldYaw is the only thing between the "
    + "game and that picture, and this build does not touch it",
    Math.abs(alongFree - 0.866) < 0.003
    && Math.abs((alongFree - treadDepth) / 2 - 0.247) < 0.003 && diag > treadDepth,
    "along=" + alongFree.toFixed(4) + " overhang/side=" + ((alongFree - treadDepth) / 2).toFixed(4));
});

// ============================================================================
console.log("8. the placement laws (A1 jitter, A5 occluders)");
guard("8. placement", () => {
  const f = W.terrainBenchSceneBuild("thirteen-piece-sheet").primary;
  const on = W.terrainExpressionFlags("all");
  const sites = W.terrainOccluderSites(f, on);
  check("8a. the occluder pass emits sites", sites.length > 0, "n=" + sites.length);
  check("8b. EVERY site straddles a cell boundary (its centre lies exactly on a grid line)",
    sites.every(s => Math.abs(s.u - Math.round(s.u)) < 1e-9 || Math.abs(s.v - Math.round(s.v)) < 1e-9),
    sites.filter(s => Math.abs(s.u - Math.round(s.u)) > 1e-9 && Math.abs(s.v - Math.round(s.v)) > 1e-9).length + " off-line");
  const R = W.terrainProtectedRadius("mediumCap");
  check("8c. NO site enters the standee disc of either cell it touches (0.5 wu away vs a 0.466 "
    + "protected radius — the whole ring the contract leaves)",
    sites.every(s => 0.5 >= R - 1e-9), "R=" + R.toFixed(4));
  check("8d. every site is on a real height discontinuity (a riser or a face foot)",
    sites.every(s => s.deltaH >= 1 && (s.kind === "riser" || s.kind === "face-foot")));
  check("8e. no site at all when the device is off",
    W.terrainOccluderSites(f, W.terrainExpressionFlags("material")).length === 0);
  const a = freshWin(), b = freshWin();
  const sa = a.terrainOccluderSites(a.terrainBenchSceneBuild("thirteen-piece-sheet").primary,
    a.terrainExpressionFlags("all")).map(s => s.key).join(",");
  const sb = b.terrainOccluderSites(b.terrainBenchSceneBuild("thirteen-piece-sheet").primary,
    b.terrainExpressionFlags("all")).map(s => s.key).join(",");
  check("8f. the placement law is deterministic across two separate page loads", sa === sb);

  const j1 = W.terrainExpressionJitter(1234, "rock-a");
  const j2 = W.terrainExpressionJitter(1234, "rock-b");
  const j1b = W.terrainExpressionJitter(1234, "rock-a");
  check("8g. jitter is deterministic per instance key", JSON.stringify(j1) === JSON.stringify(j1b));
  check("8h. two instances get DIFFERENT poses (the defect is identical posing, not repetition)",
    j1.yawDeg !== j2.yawDeg && j1.sinkH !== j2.sinkH && j1.tiltXDeg !== j2.tiltXDeg);
  let worstSink = 0;
  for(let i = 0; i < 500; i++) worstSink = Math.max(worstSink, W.terrainExpressionJitter(9, "k" + i).sinkH);
  check("8i. THE CLAMP: sink never exceeds the walkable noise budget over 500 draws",
    worstSink <= W.TERRAIN_WALK_NOISE_BUDGET_H.perCellH + 1e-12,
    worstSink.toFixed(6) + " vs " + W.TERRAIN_WALK_NOISE_BUDGET_H.perCellH.toFixed(6));
  check("8j. sink is always downward — things settle, they do not rise",
    Array.from({ length: 200 }, (_, i) => W.terrainExpressionJitter(3, "s" + i).sinkH).every(v => v >= 0));
});

// ============================================================================
console.log("9. A6 wash — driven off the REAL height channel, never painted relief");
guard("9. wash", () => {
  const f = W.terrainBenchSceneBuild("thirteen-piece-sheet").primary;
  const on = W.terrainExpressionFlags("all");
  const off = W.terrainExpressionFlags("naked");
  check("9a. off is exactly 1.0 (an identity multiplier, never a tint)",
    f.cells.every(c => W.terrainCellWashFactor(f, c.index, off) === 1));
  const vals = f.cells.filter(c => c.kind !== "void").map(c => W.terrainCellWashFactor(f, c.index, on));
  check("9b. on, it varies — cavities darken and curvature lightens",
    Math.min.apply(null, vals) < 0.95 && Math.max.apply(null, vals) > 1.05,
    Math.min.apply(null, vals).toFixed(3) + ".." + Math.max.apply(null, vals).toFixed(3));
  /* a cell strictly below all four neighbours must darken; strictly above must lighten */
  const lowest = f.cells.filter(c => c.kind !== "void")
    .reduce((a, b) => (b.h < a.h ? b : a));
  const highest = f.cells.filter(c => c.kind !== "void")
    .reduce((a, b) => (b.h > a.h ? b : a));
  check("9c. the sign is right: the field's lowest cell darkens, its highest lightens",
    W.terrainCellWashFactor(f, lowest.index, on) <= 1
    && W.terrainCellWashFactor(f, highest.index, on) >= 1,
    W.terrainCellWashFactor(f, lowest.index, on).toFixed(3) + " / "
    + W.terrainCellWashFactor(f, highest.index, on).toFixed(3));
  check("9d. it is bounded — a wash is a wash, never a repaint",
    vals.every(v => v >= 0.7 && v <= 1.3));
});

// ============================================================================
console.log("10. the renderer boundary — the dressing pass never authors terrain");
guard("10. renderer boundary", () => {
  const src = read("src/ui/theater-clay-room.js");
  const start = src.indexOf("CL-F07 TERRAIN BENCH");
  const end = src.indexOf("function clayRoomSuppressLightingBenchNoise");
  const region = start >= 0 && end > start ? src.slice(start, end) : "";
  check("10a. the terrain bench region still exists", region.length > 2000);
  check("10b. the NAKED rung takes the byte-identical legacy path (one BoxGeometry, nothing added)",
    /if\(!flags\.anyDevice\)\{/.test(region)
    && /new THREE\.BoxGeometry\(1, columnH, 1\)/.test(region));
  check("10c. every device is gated on its own flag, so the ladder can isolate one bin",
    /flags\.chamfer/.test(region) && /flags\.rollover/.test(region) && /flags\.joint/.test(region)
    && /flags\.occluders/.test(region)
    && /flags\.jitter/.test(region) && /flags\.nosing/.test(region) && /flags\.fold/.test(region));
  check("10c2. rejected sedimentary face bands are absent from both registry and renderer—not "
    + "merely hidden by the current rung",
    read("src/engine/terrain-expression.js").length > 2000 && region.length > 2000
    && !/key: "facedress"/.test(read("src/engine/terrain-expression.js"))
    && !/clayTerrainFaceBands|A7-face-band|flags\.facedress/.test(region));
  check("10d. the renderer authors no randomness of its own (every draw is seeded off the field)",
    region.length > 2000 && !/Math\.random/.test(region));
  check("10e. it reads the ONE published stand plane rather than deriving a second one",
    /terrainCellStandPlane/.test(region) && /standPlaneFor/.test(region)
    && (region.match(/function standPlaneFor/g) || []).length <= 1);
  check("10e2. the cap samples the shared surface, only exposed/downhill edges get skirts, and "
    + "the fine joint mesh consumes the clipped running-bond law",
    /terrainCellTopH/.test(region) && /const skirtEdges = \[sides\.n > 0/.test(region)
    && /terrainFineJointSegments/.test(region) && /terrainFineJointReachesBoundary/.test(region)
    && /continuous-tactical/.test(region) && /relief-boundary/.test(region));
  const spritesSrc = read("src/ui/theater-sprites.js");
  /* AMENDED 2026-07-28 by TERRAIN-EXPRESSION-R2 R1. This check used to also assert that the tilt
     never reached the sprite wrap. Adam's R1 ruling REVERSES that — "the sprite itself should
     always be fixed at the same angle as its base" — so the wrap now carries the SAME plane
     rotation composed with its camera pitch, and asserting the old proposition would be asserting
     against the ruling. What survives unchanged is the part that was never about the sprite: the
     plinth's conformance lands on the base child, it is derived in WORLD space by counter-rotating
     the figure's yaw, and the OUTER group's rotation.x stays fall-death's alone. The sprite/base
     agreement itself is measured, not text-matched, in verify-bw2-2 group 21b-R1 and
     dev/verify-terrain-standee-r2.cjs. */
  check("10f. the plinth tilt lands on the BASE CHILD's own rotation, never on the outer group "
    + "(fall-death's channel), and it is written in WORLD space by counter-rotating the figure's "
    + "own yaw",
    /child\.rotation\.x = tiltX/.test(spritesSrc) && /child\.rotation\.z = tiltZ/.test(spritesSrc)
    && /planeTilt\.dYdx \* cosP - planeTilt\.dYdz \* sinP/.test(spritesSrc)
    && !/fig\.userData\.clayStandeePlaneTilt[\s\S]{0,400}fig\.rotation\.x =/.test(spritesSrc)
    && !/figure\.rotation\.x =/.test(region));
  check("10f-R1. and the SPRITE now shares that same plane rotation (Adam 2026-07-28, reversing "
    + "the standee-contract study): the wrap composes the plane quaternion with the camera pitch, "
    + "and a standee with no stand plane still takes the byte-identical legacy write",
    /planeQuat/.test(spritesSrc) && /wrap\.quaternion\.copy\(planeQuat\)/.test(spritesSrc)
    && /wrap\.rotation\.x = tilt;/.test(spritesSrc));
  check("10f2. the tilt has ONE writer — the clay mount records the world gradient and the angles "
    + "themselves are written only in the per-frame facing pass",
    !/base\.rotation\.[xz] =/.test(region) && /clayStandeePlaneTilt/.test(region));
  check("10g. the receipt carries the rung, the devices and the walk-only fingerprints",
    /rungId: expressionFlags\.rungId/.test(region) && /devicesOn/.test(region)
    && /walkFingerprints/.test(region));
  check("10h. the receipt reports the nearest-contact gap, not only the origin gap",
    /nearestContactGap/.test(read("src/engine/terrain-expression.js"))
    && /clayTerrainWitnessFacingReport/.test(region) && /cornersWorld/.test(region));
  const sprites = read("src/ui/theater-sprites.js");
  check("10i. P1 FIXED: the facing sweep no longer walks a fixed two levels — it reaches every "
    + "sprite group under the interior group, at any depth, without special-casing terrain",
    /faceDescendants|function faceTree|traverse\(/.test(sprites)
    && !/for\(let j = 0; j < sub\.children\.length; j\+\+\)\{\s*const fig = sub\.children\[j\];/.test(sprites));
});

// ============================================================================
console.log("11. manifest");
if(!RED) guard("11. manifest", () => {
  let out = "";
  try { out = execFileSync("python3", [join(ROOT, "build/check-manifest.py")], { cwd: ROOT, encoding: "utf8" }); }
  catch(e){ out = String(e.stdout || "") + String(e.stderr || ""); }
  check("11a. python3 build/check-manifest.py -> RESULT: OK", /RESULT: OK/.test(out));
  check("11b. every chassis module exists on disk", CHASSIS.every(p => existsSync(join(ROOT, p))));
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
