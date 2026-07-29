/* Verify CL-F08a — the authored terrain feature book (docs/TERRAIN-FEATURE-BOOK.md).

   This gate proves the engine facts and the coarse form budgets that prevent known visual
   regressions. It does not claim that the renders look good:
     * four small, four large, and two defensive compositions exist and differ;
     * authored geometry is seed-invariant until a later procedural-transform pass is approved;
     * walk, face ownership, and non-flying reachability remain legal;
     * FFT-style local angle variation keeps complete shared-edge continuity;
     * natural features do not acquire a repeated curb/ridge rhythm;
     * the gate approach rises into one far-side mass across a split obstacle;
     * three- and four-storey structures are legal when they occupy the camera-far band.

   `--red` blanks the chassis. Every section must fail instead of passing vacuously. */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");
const RED = process.argv.includes("--red");
const read = (path) => RED ? "" : readFileSync(join(ROOT, path), "utf8");

const CHASSIS = [
  "src/engine/terrain-field.js",
  "src/engine/terrain-pieces.js",
  "src/engine/terrain-features.js",
  "src/engine/terrain-expression.js",
  "src/engine/terrain-bench.js"
];

function freshWin(){
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    runScripts: "dangerously",
    url: "http://localhost/"
  });
  dom.window.eval(RED ? "/* CL-F08a chassis blanked */" : CHASSIS.map(read).join("\n;\n"));
  return dom.window;
}

let pass = 0;
let fail = 0;
function check(name, condition, detail = ""){
  if(condition){
    pass++;
    console.log("  ✓", name);
  }else{
    fail++;
    console.log("  ✗", name, detail ? "— " + detail : "");
  }
}
function guard(name, fn){
  try {
    return fn();
  } catch(error){
    fail++;
    console.log("  ✗", name, "—", String(error && error.message || error).slice(0, 220));
    return null;
  }
}

console.log(RED
  ? "\n=== CL-F08a authored terrain gate — RED RUN ===\n"
  : "\n=== CL-F08a authored terrain gate ===\n");

const W = freshWin();
const SEED_A = 0x51f08a;
const SEED_B = 0xa80f15;
const IDS = guard("0. feature registry loads", () => Array.from(W.TERRAIN_AUTHORED_FEATURE_IDS));

console.log("1. authored census and dispatch");
guard("1. census", () => {
  const recipes = IDS.map((id) => W.terrainFeatureRecipe(id));
  check("1a. the book has exactly four small and four large authored landforms",
    recipes.filter((r) => r.scale === "small").length === 4
      && recipes.filter((r) => r.scale === "large").length === 4,
    recipes.map((r) => r.id + ":" + r.scale).join(", "));
  check("1b. every recipe publishes construction, tactical read, and a transform quality lock",
    recipes.every((r) => r.construction && r.tacticalRead && r.qualityLock));
  check("1c. CL-F07 remains its seven-scene proof; CL-F08 adds three scenes without rewriting it",
    W.CL_F07_TERRAIN_BENCH.scenes.length === 7
      && W.CL_F08_TERRAIN_FEATURE_BOOK.scenes.length === 3);
  const dispatched = W.terrainBenchSceneBuild("authored-feature-book", SEED_A, { frameIndex: 7 });
  check("1d. the shared bench dispatches CL-F08 frames and preserves the selected feature",
    dispatched && dispatched.featureId === IDS[7] && dispatched.fields.length === 1);
  check("1e. the three new scene ids all resolve through the shared light-recipe seam",
    W.CL_F08_TERRAIN_FEATURE_BOOK.scenes.every((scene) =>
      W.terrainBenchSceneLightRecipe(scene.id) === "daylit"));
});

console.log("\n2. authored-first geometry lock");
guard("2. authored lock", () => {
  const a = IDS.map((id) => W.terrainFeatureBuild(id, SEED_A));
  const b = IDS.map((id) => W.terrainFeatureBuild(id, SEED_B));
  const same = a.every((built, index) =>
    W.terrainWalkFingerprint(built.field) === W.terrainWalkFingerprint(b[index].field));
  check("2a. changing the seed does not rearrange any authored feature", same);
  check("2b. every authored spec explicitly carries zero per-cell geometry noise",
    a.every((built) => built.spec.noiseAmplitudeH === 0));
  const defensive = [
    W.terrainFeatureSceneBuild("defensive-ridgeworks", SEED_A),
    W.terrainFeatureSceneBuild("defensive-gateworks", SEED_A)
  ];
  const fingerprints = a.map((built) => built.field.fingerprint)
    .concat(defensive.map((scene) => scene.primary.fingerprint));
  check("2c. all ten authored compositions have distinct geometry/surface fingerprints",
    new Set(fingerprints).size === 10, fingerprints.join(", "));
});

console.log("\n3. traversal and ownership gates");
guard("3. engine legality", () => {
  const report = W.terrainFeatureGateReport(SEED_A);
  check("3a. gate census is 4 small + 4 large + 2 defensive",
    report.smallFeatures === 4 && report.largeFeatures === 4
      && report.defensiveCompositions === 2);
  check("3b. zero walkable cells exceed the slope limit", report.rows.every((row) =>
    row.metrics.walkableCellsOverSlopeLimit === 0));
  check("3c. zero illegal walk edges", report.rows.every((row) =>
    row.metrics.illegalWalkEdges === 0));
  check("3d. every 2h+ face has an owning terrain piece", report.rows.every((row) =>
    row.metrics.unownedFaces === 0));
  check("3e. every standable surface is reachable without flying", report.rows.every((row) =>
    row.metrics.unreachableStandableNonFlying === 0));
  check("3f. the combined back-end verdict passes", report.ok, JSON.stringify(report.illegal));
  check("3g. both defensive plates preserve at least 45% quiet datum ground",
    report.defensive.ridgeQuietGroundShare >= report.defensive.ridgeQuietGroundMinimum
      && report.defensive.gateQuietGroundShare >= report.defensive.gateQuietGroundMinimum,
    JSON.stringify(report.defensive));
});

console.log("\n4. FFT-style continuity without flattening");
guard("4. responsive surfaces", () => {
  const flags = W.terrainExpressionFlags("material", { shallowgrade: true, gradeId: "g3" });
  const rows = IDS.map((id) => {
    const field = W.terrainFeatureBuild(id, SEED_A).field;
    return {
      id,
      continuity: W.terrainSurfaceContinuityReport(field, flags),
      variation: W.terrainSurfaceVariationReport(field, flags)
    };
  });
  check("4a. every joined natural edge agrees at all five sampled points",
    rows.every((row) => row.continuity.ok && row.continuity.failures === 0),
    JSON.stringify(rows.filter((row) => !row.continuity.ok)));
  check("4b. every feature keeps several local angles and responsive neighbouring tiles",
    rows.every((row) => row.variation.ok
      && row.variation.distinctTangentPlanes >= 3
      && row.variation.responsiveJoinedPairs > 0),
    JSON.stringify(rows.map((row) => [row.id, row.variation.distinctTangentPlanes,
      row.variation.responsiveJoinedPairs])));
  check("4c. no natural recipe gains semantic curbs; only the authored terraced bluff may use them",
    rows.every((row) => row.id === "AF-L04" || row.variation.edgeKinds.curb === 0),
    JSON.stringify(rows.map((row) => [row.id, row.variation.edgeKinds.curb])));
  const roomSource = read("src/ui/theater-clay-room.js");
   check("4d. rejected regular sedimentary face banding remains absent from the renderer",
    roomSource.length > 2000
      && !/clayTerrainFaceBands|A7-face-band|flags\.facedress/.test(roomSource));
  check("4e. natural ground has no hard faces except the explicitly authored bluff",
    IDS.every((id) => id === "AF-L04"
      || W.terrainFeatureBuild(id, SEED_A).field.faces.length === 0));
});

console.log("\n5. defensive terrain grammar and grounded tall masses");
guard("5. defensive grammar", () => {
  const ridge = W.terrainFeatureSceneBuild("defensive-ridgeworks", SEED_A);
  const gate = W.terrainFeatureSceneBuild("defensive-gateworks", SEED_A);
  check("5a. ridgeworks uses two deliberately offset breaches and a turning entry",
    ridge.tacticalGrammar.profile === "turning-earthwork-entry"
      && ridge.tacticalGrammar.outerGap.x0 !== ridge.tacticalGrammar.innerGap.x0
      && /turn/.test(ridge.tacticalGrammar.committedApproach));
  check("5b. gateworks declares one gate mass, one rising approach, and a split obstacle",
    gate.tacticalGrammar.profile === "gate-mass-rising-causeway"
      && gate.tacticalGrammar.gateMassId === "df-gatehouse-four-storey"
      && gate.tacticalGrammar.committedApproachPieceId === "df-gate-stair"
      && gate.tacticalGrammar.obstaclePieceIds.length === 2
      && gate.tacticalGrammar.approachChangesLevel === true);
  const approach = [3, 4, 5, 6, 7].map((y) => gate.primary.heights[y * 18 + 8]);
  check("5c. the committed causeway climbs continuously 0h→4h into the gate seat",
    JSON.stringify(approach) === JSON.stringify([4, 3, 2, 1, 0]),
    JSON.stringify(approach));
  const grounded = gate.structures.every((structure) => {
    const fp = structure.footprint;
    for(let y = fp.y; y < fp.y + fp.d; y++){
      for(let x = fp.x; x < fp.x + fp.w; x++){
        if(gate.primary.heights[y * gate.primary.extent.x + x] !== structure.baseH) return false;
      }
    }
    return true;
  });
  check("5d. every diagnostic structure footprint is grounded on its explicit terrain seat", grounded);
  check("5e. the scene includes three- and four-storey masses; there is no two-storey cap",
    gate.cameraReport.maxStoreys === 4 && gate.cameraReport.tallStructures === 3);
  check("5f. every 3+ storey mass occupies the declared camera-far band",
    gate.cameraReport.ok && gate.cameraReport.rows.every((row) => row.inFarBand),
    JSON.stringify(gate.cameraReport.rows));

  const mutated = gate.structures.map((structure) => ({
    ...structure,
    footprint: { ...structure.footprint }
  }));
  mutated[0].footprint.x = 15;
  mutated[0].footprint.y = 18;
  const teeth = W.terrainDefensiveCameraReport(mutated, gate.primary.extent, gate.cameraLaw);
  check("5g. TEETH — moving the four-storey gatehouse into the near band fails the law",
    !teeth.ok && teeth.violations.some((row) => row.id === "df-gatehouse-four-storey"));
});

console.log("\n6. authored form-language budgets");
guard("6. form language", () => {
  const built = IDS.map((id) => W.terrainFeatureBuild(id, SEED_A));
  const stats = built.map((entry) => {
    const heights = Array.from(entry.field.heights);
    const min = Math.min(...heights);
    const max = Math.max(...heights);
    const datumCount = heights.filter((h) => h === entry.field.baseDatumH).length;
    const topCount = heights.filter((h) => h === max).length;
    return {
      id: entry.recipe.id,
      scale: entry.recipe.scale,
      relief: max - min,
      datumShare: datumCount / heights.length,
      topShare: topCount / heights.length,
      operations: entry.spec.pieces.flatMap((piece) => piece.ops || [])
    };
  });
  check("6a. small forms stay low enough to read as terrain events rather than monuments",
    stats.filter((row) => row.scale === "small").every((row) => row.relief <= 2),
    JSON.stringify(stats.filter((row) => row.scale === "small")
      .map((row) => [row.id, row.relief])));
  check("6b. large natural forms stay within three quanta; the causal bluff alone may reach four",
    stats.every((row) => row.id === "AF-L04" ? row.relief <= 4 : row.relief <= 3),
    JSON.stringify(stats.map((row) => [row.id, row.relief])));
  check("6c. every study preserves at least half its plate as calm datum ground",
    stats.every((row) => row.datumShare >= 0.5),
    JSON.stringify(stats.map((row) => [row.id, Number(row.datumShare.toFixed(3))])));
  check("6d. no non-bluff feature is dominated by one flat summit tier",
    stats.every((row) => row.id === "AF-L04" || row.topShare <= 0.22),
    JSON.stringify(stats.map((row) => [row.id, Number(row.topShare.toFixed(3))])));
  check("6e. the authored vocabulary actually uses directional masses and fading/tapering runs",
    stats.every((row) => {
      const directionalMass = row.operations.some((op) =>
        (op.type === "radial" || op.type === "basin")
          && op.params.radiusX !== op.params.radiusY
          && Number.isFinite(op.params.rotationDeg));
      const responsiveRun = row.operations.some((op) =>
        (op.type === "ridge" || op.type === "slot")
          && (op.params.endFadeCells > 0
            || op.params.halfWidthStartCells !== op.params.halfWidthEndCells
            || op.params.widthStartCells !== op.params.widthEndCells));
      return directionalMass || responsiveRun;
    }),
    JSON.stringify(stats.map((row) => [row.id, row.operations.map((op) => op.type)])));
  const tapered = W.terrainFieldBuild({
    id: "verify-tapered-run",
    segmentId: "verify-tapered-run",
    seed: SEED_A,
    extentCells: { x: 11, y: 12 },
    baseDatumH: 0,
    slopeClamp: Infinity,
    noiseAmplitudeH: 0,
    pieces: [{
      id: "verify-run-piece",
      pieceId: "R1-02",
      ops: [{
        type: "ridge",
        mode: "max",
        params: {
          polyline: [{ x: 5, y: 1 }, { x: 5, y: 10 }],
          halfWidthStartCells: 3,
          halfWidthEndCells: 1,
          heightStartH: 2,
          heightEndH: 1,
          crossProfile: "smooth",
          endFadeCells: 0.6,
          baseH: 0,
          slopeClamp: Infinity,
          kind: "ground"
        }
      }]
    }]
  });
  function raisedInRow(field, y){
    return Array.from(field.heights).slice(y * field.extent.x, (y + 1) * field.extent.x)
      .filter((h) => h > field.baseDatumH).length;
  }
  check("6f. tapered runs are functionally broad/high upstream, narrow/low downstream, and fade at the end",
    raisedInRow(tapered, 3) > raisedInRow(tapered, 8)
      && raisedInRow(tapered, 3) > 0
      && raisedInRow(tapered, 1) === 0,
    JSON.stringify([raisedInRow(tapered, 1), raisedInRow(tapered, 3),
      raisedInRow(tapered, 8)]));
  const reverse = stats.find((row) => row.id === "AF-L02");
  check("6g. the reverse-slope reference remains a low rolling ridge, not a wall or broad slab",
    reverse.relief === 2 && reverse.topShare <= 0.18,
    JSON.stringify(reverse));
  const rejectedSlab = { ...reverse, relief: 4, topShare: 0.4 };
  check("6h. TEETH — a tall broad summit fails the reverse-slope form budget",
    !(rejectedSlab.relief === 2 && rejectedSlab.topShare <= 0.18));
});

console.log("\n" + (fail ? "FAIL" : "PASS") + ` — ${pass} passed, ${fail} failed\n`);
if(RED){
  if(pass !== 0){
    console.error("RED RUN INVALID: a blank chassis passed one or more checks.");
    process.exit(1);
  }
  process.exit(0);
}
if(fail) process.exit(1);
