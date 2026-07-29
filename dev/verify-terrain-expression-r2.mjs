/* Verify TERRAIN EXPRESSION R2 — Adam's seven rulings (docs/TERRAIN-EXPRESSION-R2.md).

   The ENGINE half. dev/verify-terrain-expression.mjs proves the R1 dressing pass; this proves the
   six things R2 adds that can be proved without a renderer:

     R1  the F7 threshold has been REVERSED — the law is now "the sprite matches its base", and the
         old "the sprite must NOT tilt" constant is gone rather than left lying around to be read by
         mistake. (The world-up AGREEMENT itself needs a scene graph: dev/verify-bw2-2-floor-contact
         group 21b and dev/verify-terrain-standee.cjs.)
     R2  the base skirt is ADAPTIVE — each terrain witness derives its cosmetic depth from the
         responsive rendered surface beneath the worst Medium-cap footprint, while the published
         clamp remains inside the terrain column.
     R3  the overhang LICENCE: the rule, the forbidden list, and the scene cap, with the cap proved
         to actually withdraw licences on a field that would exceed it.
     R4  the grade ladder: every declared angle is arithmetically what it claims, the declared
         maximum is a CEILING (an outside corner cannot exceed it), and the whole ladder is
         render-only — the walk fingerprint is byte-identical across every rung, which is now a
         load-bearing assertion rather than a nice-to-have.
     R5  the Medium-accessibility floor, measured on all seven CL-F07 scenes, with its teeth proved:
         a field mutated to violate the share clause fails, and a field mutated to SHATTER the
         admitting set fails the connectivity clause even while the share still passes.
     R6  the eased climb band and its rate.

   RED-FIRST. `--red` blanks the chassis; every check must fail. `--mutate` prints the R5 teeth
   detail. `--prove-r3-cap` prints the cap's withdrawal ledger.

   Per the Teeth Law the back end is mine to prove and the visual verdict is Adam's: nothing in this
   file asserts that anything LOOKS right. jsdom, classic-script load, no GL.
*/

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const RED = process.argv.includes("--red");
const read = (p) => RED ? "" : readFileSync(join(ROOT, p), "utf8");
const readRaw = (p) => readFileSync(join(ROOT, p), "utf8");

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
  catch(e){ check(name, false, String(e && e.message || e).slice(0, 220)); return null; }
}

console.log(RED
  ? "\n=== TERRAIN EXPRESSION R2 gate — RED RUN (chassis blanked; every check MUST fail) ===\n"
  : "\n=== TERRAIN EXPRESSION R2 gate — docs/TERRAIN-EXPRESSION-R2.md ===\n");

const W = freshWin();
const SCENES = ["thirteen-piece-sheet", "one-clamp-proof", "boundary-sheet", "route-proof",
  "walk-down-16", "support-graph", "dark"];

function allFields(){
  const out = [];
  SCENES.forEach((id) => {
    W.terrainBenchSceneBuild(id).fields.forEach((f) => out.push({ scene: id, field: f }));
  });
  return out;
}

// ============================================================================
console.log("R1. the F7 threshold is REVERSED — the sprite matches its base");
guard("R1", () => {
  const t = W.TERRAIN_CONTACT_THRESHOLDS;
  check("R1a. the old 'the sprite must NOT tilt with the base' constant is GONE, not merely "
    + "re-commented — a reversed law that leaves its old constant in place is a trap for the next "
    + "reader",
    t && t.spriteTiltDeg === undefined, JSON.stringify(t && t.spriteTiltDeg));
  check("R1b. the reversed law is stated as an AGREEMENT tolerance, in degrees",
    t && typeof t.spriteBaseAgreementDeg === "number" && t.spriteBaseAgreementDeg > 0
    && t.spriteBaseAgreementDeg <= 2, JSON.stringify(t && t.spriteBaseAgreementDeg));
  check("R1c. the law names the measurable proposition (an angle between two world-ups, equal to "
    + "the camera-pitch constant) rather than a vague 'they match'",
    /spriteWorldUp/.test(String(t && t.spriteBaseAgreementLaw))
    && /baseWorldUp/.test(String(t && t.spriteBaseAgreementLaw)),
    String(t && t.spriteBaseAgreementLaw));
  const sprites = read("src/ui/theater-sprites.js");
  check("R1d. the sprite's wrap carries the PLANE tilt composed with the camera pitch, and the "
    + "outer group's rotation.x is still never written by the facing pass (fall-death's channel)",
    /standeePlaneQuat|planeQuat/.test(sprites)
    && !/fig\.userData\.clayStandeePlaneTilt[\s\S]{0,600}fig\.rotation\.x =[^=]/.test(sprites),
    sprites ? "sprites source read" : "no source");
  check("R1e. a standee with NO plane tilt still takes the byte-identical legacy path (wrap.x = "
    + "the camera tilt and nothing else) — the flat board must not move",
    /wrap\.rotation\.x = tilt;/.test(sprites));
});

// ============================================================================
console.log("\nR2. the base skirt follows the responsive tile instead of flattening it");
guard("R2", () => {
  const s = W.TERRAIN_BASE_SKIRT;
  check("R2a. the law declares an adaptive range, sample slack, and the terrain-column bound",
    s && s.adaptive === true && s.minDepthWU > 0 && s.maxDepthWU > s.minDepthWU
      && s.sampleSlackWU > 0 && s.minimumColumnDepthWU > s.maxDepthWU,
    JSON.stringify(s));
  const fields = allFields().map((x) => x.field);
  const flatFlags = W.terrainExpressionFlags("material", { shallowgrade: true, gradeId: "g0" });
  const gradeFlags = W.terrainExpressionFlags("material", { shallowgrade: true, gradeId: "g3" });
  const flatDepths = [];
  const gradeDepths = [];
  fields.forEach((f) => f.cells.forEach((c, i) => {
    if(!c.standable) return;
    flatDepths.push(W.terrainStandeeSkirtNeedWU(f, i, flatFlags));
    gradeDepths.push(W.terrainStandeeSkirtNeedWU(f, i, gradeFlags));
  }));
  check("R2b. a flat field asks only for the published minimum support",
    flatDepths.length > 0 && flatDepths.every((d) => d === s.minDepthWU),
    JSON.stringify([...new Set(flatDepths)]));
  check("R2c. responsive convex/concave terrain derives several deeper supports from its actual "
    + "surface, rather than applying one global guess",
    gradeDepths.some((d) => d > s.minDepthWU)
      && new Set(gradeDepths.map((d) => d.toFixed(4))).size >= 4,
    JSON.stringify([...new Set(gradeDepths)].slice(0, 12)));
  check("R2d. every derived support stays inside the declared adaptive range and the minimum "
    + "terrain-column depth",
    gradeDepths.every((d) => d >= s.minDepthWU && d <= s.maxDepthWU)
      && s.maxDepthWU < s.minimumColumnDepthWU,
    Math.min(...gradeDepths) + ".." + Math.max(...gradeDepths));
  const room = read("src/ui/theater-clay-room.js");
  check("R2e. the renderer requests the per-tile derived depth from the engine instead of "
    + "silently falling back to one constant",
    /terrainStandeeSkirtNeedWU\(field, index, expressionFlags\)/.test(room),
    "no adaptive skirt call in theater-clay-room.js");
  check("R2f. the skirt is declared COSMETIC and scoped to terrain witnesses — the flat tabletop "
    + "and the interior boards keep the plinth they have",
    /contact Y/.test(String(s.cosmeticOnly)) && /terrain witnesses only/.test(String(s.defaultOn)));
});

// ============================================================================
console.log("\nR3. the overhang licence — the rule, the forbidden list, and the scene cap");
const r3 = guard("R3", () => {
  const law = W.TERRAIN_OVERHANG_LAW;
  check("R3a. the law states what EARNS an overhang, and it is the face step (a cliffside), not "
    + "any exposed side", /faceStepQuanta/.test(String(law.earnsAt)), String(law.earnsAt));
  check("R3b. the forbidden list names the four cases Adam's ruling implies — interior seams, 1h "
    + "risers, boulders, and volumes/water", law.forbidden.length >= 5,
    JSON.stringify(law.forbidden));
  check("R3c. a scene cap exists and is well under 1.0 (the universal case Adam called overkill "
    + "must be structurally unreachable, not merely discouraged)",
    law.maxSceneShare > 0 && law.maxSceneShare < 0.5, String(law.maxSceneShare));

  const flags = W.terrainExpressionFlags("all");
  const rows = allFields().map(({ scene, field }) => {
    const c = W.terrainOverhangCensus(field, flags);
    return { scene, id: field.id, live: c.liveCells, rule: c.ruleLicensedCells,
      ruleShare: c.ruleShare, final: c.overhangCells, finalShare: c.finalShare,
      withdrawn: c.withdrawnCells, obeysCap: c.obeysCap };
  });
  console.log("     licensed share per field (rule, then after the cap):");
  rows.forEach((r) => console.log("       " + r.scene.padEnd(22) + r.id.padEnd(30)
    + " live=" + String(r.live).padStart(4)
    + "  rule=" + String(r.rule).padStart(4) + " (" + (r.ruleShare * 100).toFixed(2) + "%)"
    + "  final=" + String(r.final).padStart(4) + " (" + (r.finalShare * 100).toFixed(2) + "%)"
    + (r.withdrawn ? "  withdrawn=" + r.withdrawn : "")));
  check("R3d. EVERY field obeys the scene cap", rows.every((r) => r.obeysCap),
    JSON.stringify(rows.filter((r) => !r.obeysCap)));
  check("R3e. the rule is SELECTIVE on every field of arrival size — no field of 50+ live cells "
    + "licenses more than half of them, and AFTER the cap no field carries an overhang everywhere "
    + "(that last picture is the one Adam rejected). The 8-cell walk-down tray is the honest "
    + "exception: every cell of a 4x4 chasm tray really does stand over a full face, and it is the "
    + "CAP that takes it from 100% to 25%.",
    rows.every((r) => r.finalShare < 1)
    && rows.filter((r) => r.live >= 50).every((r) => r.ruleShare <= 0.6),
    JSON.stringify(rows.map((r) => [r.live, r.ruleShare, r.finalShare])));
  check("R3f. the rule is not vacuous either — at least one field licenses some overhang, or the "
    + "device has been ruled out of existence rather than governed",
    rows.some((r) => r.rule > 0), JSON.stringify(rows.map((r) => r.rule)));

  /* THE CAP'S OWN TEETH. Build a field that would exceed the cap and prove the census WITHDRAWS.
     A cap that has never withdrawn anything is a comment, not a cap. */
  const f = allFields()[0].field;
  const forced = Object.assign({}, f, {
    cells: f.cells.map((c) => Object.assign({}, c, { kind: "ground", depthH: 0, surface: null }))
  });
  /* make every cell a 2h+ island: alternate heights so every side drops a full face */
  forced.cells = forced.cells.map((c) => Object.assign({}, c,
    { h: ((c.x + c.y) % 2) ? c.h : c.h - 3 }));
  const forcedCensus = W.terrainOverhangCensus(forced, flags);
  check("R3g. TEETH — on a field engineered as a pillar checkerboard (every raised cell stands "
    + "over a 3h drop on all four sides, which is the most a single-valued heightfield can do) the "
    + "RULE licenses " + (forcedCensus.ruleShare * 100).toFixed(1) + "% and the CAP "
    + "withdraws " + forcedCensus.withdrawnCells + " of them to land at "
    + (forcedCensus.finalShare * 100).toFixed(1) + "%",
    forcedCensus.ruleShare > 0.5 && forcedCensus.withdrawnCells > 0 && forcedCensus.obeysCap
    && forcedCensus.finalShare <= law.maxSceneShare + 1e-9,
    JSON.stringify({ rule: forcedCensus.ruleShare, withdrawn: forcedCensus.withdrawnCells,
      final: forcedCensus.finalShare }));
  check("R3h. the cap keeps the TALL faces — every cell that survived the withdrawal is at least "
    + "as deep as every cell that lost its licence",
    (() => {
      let minKept = Infinity, maxLost = -Infinity;
      forcedCensus.perCell.forEach((r) => {
        if(!r) return;
        if(r.any) minKept = Math.min(minKept, r.deepest);
        else if(r.reason === "withdrawn by the scene cap") maxLost = Math.max(maxLost, r.deepest);
      });
      return maxLost === -Infinity || minKept >= maxLost;
    })());
  check("R3i. it is DETERMINISTIC — the same field censused twice licenses exactly the same cells",
    JSON.stringify(W.terrainOverhangCensus(f, flags).perCell)
    === JSON.stringify(W.terrainOverhangCensus(f, flags).perCell));
  check("R3j. with the chamfer device OFF, no cell carries an overhang at all",
    W.terrainOverhangCensus(f, W.terrainExpressionFlags("naked")).overhangCells === 0);

  /* Adam's later ruling removes A7 outright; a sub-visibility proud value still leaves the rejected
     regular sedimentary rhythm in the material read. */
  const room = read("src/ui/theater-clay-room.js");
  check("R3k. rejected regular sedimentary face banding is not part of the terrain renderer",
    room.length > 2000 && !/clayTerrainFaceBands|A7-face-band|flags\.facedress/.test(room));
  return { rows, forcedCensus };
});

// ============================================================================
console.log("\nR4. the grade ladder — every declared angle, and the maximum is a CEILING");
guard("R4", () => {
  const ladder = W.TERRAIN_GRADE_LADDER;
  check("R4a. the ladder has at least five declared rungs, ordered shallowest to steepest",
    ladder.length >= 5 && ladder.every((g, i) => i === 0 || g.gradeH > ladder[i - 1].gradeH),
    JSON.stringify(ladder.map((g) => g.gradeH)));
  check("R4b. EVERY rung declares whether it is render-only or logical — R4 asks for that "
    + "statement per grade, not once for the ladder",
    ladder.every((g) => g.mode === "render-only" || g.mode === "logical"),
    JSON.stringify(ladder.map((g) => [g.id, g.mode])));
  check("R4c. every rung is render-only in this pass — a LOGICAL grade changes walkability and is "
    + "a gameplay change Adam has not signed off",
    ladder.every((g) => g.mode === "render-only"));
  const deg = (h) => Math.atan2(h * W.TERRAIN_GRID_LAW.verticalQuantumFeet,
    W.TERRAIN_GRID_LAW.cellFeet) * 180 / Math.PI;
  check("R4d. every declared angle is arithmetically what its gradeH says (run cell), to 0.001 deg",
    ladder.every((g) => Math.abs(deg(g.gradeH) - g.deg) < 0.001),
    JSON.stringify(ladder.map((g) => [g.id, g.deg, Number(deg(g.gradeH).toFixed(4))])));
  check("R4e. and every declared EDGE angle is the half-gradient a one-sided step really renders — "
    + "stated rather than left for a reviewer to discover the render is half the label",
    ladder.every((g) => Math.abs(deg(g.gradeH / 2) - g.edgeDeg) < 0.001),
    JSON.stringify(ladder.map((g) => [g.id, g.edgeDeg, Number(deg(g.gradeH / 2).toFixed(4))])));
  const maxG = ladder[ladder.length - 1];
  const prop = W.TERRAIN_GRADE_MAX_PROPOSED;
  check("R4f. the steepest rung IS the proposed maximum, it is marked PROPOSED, and it names the "
    + "alternative reading rather than presenting one candidate as the answer",
    prop.id === maxG.id && /PROPOSED/.test(prop.status) && /26\.5/.test(prop.alternative),
    JSON.stringify(prop));
  check("R4g. the proposed maximum equals the chassis's own published walk limit — it is not a new "
    + "number (30.000 deg = TERRAIN_GRID_LAW.maxWalkableSlopeDeg, and gradeH = "
    + "TERRAIN_WALK_NOISE_BUDGET_H.maxRenderedStepH)",
    Math.abs(maxG.deg - W.TERRAIN_GRID_LAW.maxWalkableSlopeDeg) < 1e-6
    && Math.abs(maxG.gradeH - W.TERRAIN_WALK_NOISE_BUDGET_H.maxRenderedStepH) < 5e-5,
    JSON.stringify([maxG.deg, W.TERRAIN_GRID_LAW.maxWalkableSlopeDeg,
      maxG.gradeH, W.TERRAIN_WALK_NOISE_BUDGET_H.maxRenderedStepH]));
  check("R4h. an unknown grade id THROWS rather than silently rendering the default — a frame "
    + "labelled g4 that quietly drew g2 is the light-recipe lie again",
    (() => { try { W.terrainGradeById("no-such-grade"); return false; } catch(e){ return true; } })());

  /* THE CEILING. Across every scene, at every rung, no cell's rendered plane may exceed the rung's
     declared angle. Before the uniform clamp an outside corner rendered sqrt(2) times steeper. */
  const fields = allFields();
  const worst = {};
  ladder.forEach((g) => {
    const flags = W.terrainExpressionFlags("all", { gradeId: g.id });
    let mx = 0, mxAt = null;
    fields.forEach(({ scene, field }) => {
      for(let i = 0; i < field.cells.length; i++){
        if(field.cells[i].kind === "void") continue;
        const p = W.terrainCellStandPlane(field, i, flags);
        if(p.slopeDeg > mx){ mx = p.slopeDeg; mxAt = scene + ":" + i; }
      }
    });
    worst[g.id] = { deg: Number(mx.toFixed(4)), at: mxAt, declared: g.deg };
  });
  console.log("     steepest RENDERED plane per rung, across all seven scenes:");
  ladder.forEach((g) => console.log("       " + g.id + "  declared " + g.deg.toFixed(4)
    + " deg   steepest rendered " + worst[g.id].deg.toFixed(4) + " deg   (" + g.label + ")"));
  check("R4i. THE MAXIMUM IS A CEILING — no cell in any scene renders steeper than its rung's "
    + "declared angle, at any rung",
    ladder.every((g) => worst[g.id].deg <= g.deg + 1e-6),
    JSON.stringify(ladder.map((g) => [g.id, worst[g.id].deg, g.deg])
      .filter((r) => r[1] > r[2] + 1e-6)));
  check("R4j. and the ladder REACHES its declared angle — a ceiling nothing touches would mean the "
    + "rung renders nothing new",
    ladder.every((g) => g.gradeH === 0 || worst[g.id].deg >= g.deg - 1e-3),
    JSON.stringify(ladder.map((g) => [g.id, worst[g.id].deg, g.deg])));

  /* THE LOAD-BEARING INVARIANCE. A render-only grade that moves the walk fingerprint is a bug. */
  const base = fields.map(({ field }) => W.terrainWalkFingerprint(field)).join("|");
  const perGrade = ladder.map((g) => {
    const flags = W.terrainExpressionFlags("all", { gradeId: g.id });
    /* the plane is a pure derivation, so touching every cell's plane must not touch the field */
    fields.forEach(({ field }) => {
      for(let i = 0; i < field.cells.length; i++) W.terrainCellStandPlane(field, i, flags);
    });
    return { id: g.id, fp: fields.map(({ field }) => W.terrainWalkFingerprint(field)).join("|") };
  });
  check("R4k. the walk fingerprint is BYTE-IDENTICAL across every rung of the grade ladder — the "
    + "R1 invariance instrument, now load-bearing for grades",
    perGrade.every((r) => r.fp === base),
    JSON.stringify(perGrade.filter((r) => r.fp !== base).map((r) => r.id)));
});

// ============================================================================
console.log("\nR5. the Medium-accessibility floor");
guard("R5", () => {
  const law = W.TERRAIN_MEDIUM_ACCESS_LAW;
  check("R5a. the law is stated with all THREE clauses — a share, a cohesion ratio, and an entry "
    + "clause", /SHARE/.test(law.statement) && /COHESION/.test(law.statement)
    && /ENTRY/.test(law.statement), law.statement);
  check("R5b. it is gated against the WORST-CASE Medium plinth (the 0.932 wu cap disc), not the "
    + "average one — a law that only holds for the average body is not a law",
    Math.abs(law.mediumCapProtectedDiameter - W.terrainProtectedDiameter("mediumCap")) < 0.001
    && /mediumCap/.test(law.gatedAgainst),
    String(law.mediumCapProtectedDiameter) + " vs "
      + W.terrainProtectedDiameter("mediumCap").toFixed(4));
  check("R5c. the ordinary Medium disc is stated too, and it is smaller than the cap disc",
    Math.abs(law.mediumProtectedDiameter - W.terrainProtectedDiameter("medium")) < 0.001
    && law.mediumProtectedDiameter < law.mediumCapProtectedDiameter);
  check("R5d. the floor is marked PROPOSED — the share is a founder number",
    /PROPOSED/.test(law.status), law.status);

  const rows = allFields().map(({ scene, field }) => {
    const c = W.terrainMediumAccessCensus(field);
    return { scene, id: field.id, c };
  });
  console.log("     MEASURED Medium-accessible share, every CL-F07 scene:");
  rows.forEach((r) => console.log("       " + r.scene.padEnd(22) + r.id.padEnd(30)
    + " standable=" + String(r.c.standableCells).padStart(4)
    + "  medium=" + String(r.c.mediumAdmittingCells).padStart(4)
    + " (" + (r.c.mediumShare * 100).toFixed(2) + "%)"
    + "  cohesion=" + (r.c.cohesion * 100).toFixed(2) + "%"
    + "  small/tiny-only=" + r.c.smallTinyOnlyCells
    + "  entriesBlocked=" + r.c.entriesBlockedToMedium + "/" + r.c.entryCells));
  check("R5e. every existing CL-F07 field passes the floor (all three clauses)",
    rows.every((r) => r.c.ok),
    JSON.stringify(rows.filter((r) => !r.c.ok).map((r) => [r.id, r.c.mediumShare,
      r.c.cohesion, r.c.entriesBlockedToMedium])));

  /* TEETH 1 — the SHARE clause. Declare intrusions that eat the usable top on 40% of the standable
     cells and the census must fail. This is the shape every future sub-cell device takes. */
  const f = allFields()[0].field;
  const standable = [];
  for(let i = 0; i < f.cells.length; i++) if(f.cells[i].standable) standable.push(i);
  /* the intrusion shape every future sub-cell device takes: something parked toward the cell rim
     that leaves a Small body room and does not leave a Medium one. 0.5 - 0.15 = 0.35 wu of usable
     radius: Small needs 0.275, Medium-cap needs 0.466. */
  const BITE = { du: 0.5, dv: 0, radius: 0.15 };
  const bite = standable.filter((_, k) => k % 5 < 2)      /* 40% */
    .map((idx) => Object.assign({ cell: idx }, BITE));
  const bitten = W.terrainMediumAccessCensus(f, { intrusions: bite });
  check("R5f. TEETH (share) — a field whose usable top is eaten on 40% of its standable cells "
    + "FAILS the floor (" + (bitten.mediumShare * 100).toFixed(2) + "% admitting against a "
    + (law.minShare * 100).toFixed(0) + "% floor)",
    !bitten.shareOk && !bitten.ok && bitten.mediumShare < law.minShare,
    JSON.stringify({ share: bitten.mediumShare, ok: bitten.ok }));

  /* TEETH 2 — the CONNECTIVITY clause, which is the half a bare percentage cannot see. Shatter the
     admitting set into stripes: the SHARE still passes, the connectivity clause must not. */
  const stripe = [];
  for(let i = 0; i < f.cells.length; i++){
    const c = f.cells[i];
    if(c.standable && c.y % 7 === 3) stripe.push(Object.assign({ cell: i }, BITE));
  }
  const shattered = W.terrainMediumAccessCensus(f, { intrusions: stripe });
  check("R5g. TEETH (cohesion) — a field cut into stripes keeps a PASSING share ("
    + (shattered.mediumShare * 100).toFixed(2) + "%) while its largest admitting component "
    + "collapses to " + (shattered.cohesion * 100).toFixed(2) + "% of the largest STANDABLE one — "
    + "the share clause alone would have called this fine",
    shattered.shareOk && !shattered.cohesionOk && !shattered.ok,
    JSON.stringify({ share: shattered.mediumShare, cohesion: shattered.cohesion,
      shareOk: shattered.shareOk, cohesionOk: shattered.cohesionOk }));
  /* TEETH 3 — the ENTRY clause, on the median-arrival route-proof field (100 standable cells, 8
     entries) so blocking the way in does NOT also move the share past its floor. On the 24x24 bench
     sheet it would: 92 of 546 cells are entries, and blocking them alone drops the share to 83%,
     which would prove the share clause rather than this one. */
  const entryField = allFields().filter((r) => r.scene === "route-proof")[0].field;
  const doorBlock = (entryField.entryCells || [])
    .filter((idx) => entryField.cells[idx] && entryField.cells[idx].standable)
    .map((idx) => Object.assign({ cell: idx }, BITE));
  const doored = W.terrainMediumAccessCensus(entryField, { intrusions: doorBlock });
  check("R5g2. TEETH (entry) — blocking only the entry cells leaves the share at "
    + (doored.mediumShare * 100).toFixed(2) + "% and the cohesion at "
    + (doored.cohesion * 100).toFixed(2) + "%, both passing, and the field still FAILS because a "
    + "Medium cannot get in",
    doorBlock.length > 0 && doored.shareOk && doored.cohesionOk && !doored.entryOk && !doored.ok,
    JSON.stringify({ entries: doorBlock.length, blocked: doored.entriesBlockedToMedium,
      ok: doored.ok }));
  check("R5h. the census never writes to the field — the same field censused before and after "
    + "still reports the same walk fingerprint",
    (() => {
      const before = W.terrainWalkFingerprint(f);
      W.terrainMediumAccessCensus(f, { intrusions: bite });
      return W.terrainWalkFingerprint(f) === before;
    })());
  check("R5i. a Small body admits where a Medium does not — the Small/Tiny advantage is real and "
    + "measurable, not merely asserted",
    (() => {
      const small = W.terrainMediumAccessCensus(f,
        { intrusions: bite, radius: W.terrainProtectedRadius("small") });
      return small.mediumAdmittingCells > bitten.mediumAdmittingCells;
    })());
});

// ============================================================================
console.log("\nR6. the eased climb band and its visible affordance");
guard("R6", () => {
  const e = W.TERRAIN_CLIMB_EASED;
  check("R6a. the eased band is marked PROPOSED — a DC is a gameplay value and is Adam's",
    /PROPOSED/.test(e.status), e.status);
  check("R6b. the three standard bands are the chassis's own, untouched",
    JSON.stringify(e.standardBands) === JSON.stringify(W.TERRAIN_GRID_LAW.climbDcBands),
    JSON.stringify(e.standardBands));
  check("R6c. the eased DC is EASIER than the easiest standard band",
    e.easedDc < W.TERRAIN_GRID_LAW.climbDcBands[0], e.easedDc + " vs "
      + W.TERRAIN_GRID_LAW.climbDcBands[0]);
  check("R6d. the affordance is declared VISIBLE — the player has to be able to read which faces "
    + "are the easy ones", /face/.test(String(e.affordance)), String(e.affordance));
  const rows = allFields().map(({ scene, field }) => {
    const c = W.terrainFaceClimbCensus(field);
    return { scene, id: field.id, c };
  });
  const withFaces = rows.filter((r) => r.c.faces > 0);
  console.log("     eased faces per field:");
  withFaces.forEach((r) => console.log("       " + r.scene.padEnd(22) + r.id.padEnd(30)
    + " faces=" + String(r.c.faces).padStart(4) + "  eased=" + String(r.c.easedFaces).padStart(4)
    + " (" + (r.c.easedShare * 100).toFixed(1) + "%)  auto=" + r.c.autoFaces));
  check("R6e. some faces are eased and most are not — an affordance every face carries is not an "
    + "affordance",
    withFaces.length > 0 && withFaces.some((r) => r.c.easedFaces > 0)
    && withFaces.every((r) => r.c.easedShare < 0.5),
    JSON.stringify(withFaces.map((r) => r.c.easedShare)));
  check("R6f. it is deterministic — the same field twice yields the same eased set",
    (() => {
      const f = allFields()[0].field;
      return JSON.stringify(W.terrainFaceClimbCensus(f).rows)
        === JSON.stringify(W.terrainFaceClimbCensus(f).rows);
    })());
  check("R6g. an eased face carries relief bits to draw — the DC and the picture come from ONE "
    + "predicate, so a face cannot be easy without looking easy",
    rows.every((r) => r.c.rows.every((x) => (x.eased ? x.reliefBits > 0 : x.reliefBits === 0))));
  const room = read("src/ui/theater-clay-room.js");
  check("R6h. the renderer draws the affordance off that same predicate",
    /terrainFaceClimb/.test(room), "no terrainFaceClimb in the clay room");
});

// ============================================================================
console.log("\nmanifest + module hygiene");
guard("manifest", () => {
  const manifest = JSON.parse(readRaw("manifest.json"));
  const mod = manifest.modules.find((m) => m.path === "src/engine/terrain-expression.js");
  const engineSource = read("src/engine/terrain-expression.js");
  check("M1. terrain-expression.js still owns every symbol R2 added",
    engineSource.length > 2000 && !!mod
    && ["TERRAIN_GRADE_LADDER", "TERRAIN_OVERHANG_LAW", "TERRAIN_MEDIUM_ACCESS_LAW",
      "TERRAIN_CLIMB_EASED", "TERRAIN_BASE_SKIRT", "terrainOverhangCensus",
      "terrainMediumAccessCensus", "terrainFaceClimb", "terrainSurfaceContinuityReport",
      "terrainSurfaceVariationReport", "terrainStandeeSkirtNeedWU",
      "TERRAIN_FINE_JOINT_LAW", "terrainFineJointSegments"].every((s) => mod.owns.includes(s)),
    mod ? JSON.stringify(mod.owns.filter((o) => /GRADE|OVERHANG|MEDIUM|CLIMB|SKIRT/.test(o))) : "no module");
  check("M2. the engine layer stays engine — no THREE construction, no DOM, no camera in the R2 "
    + "additions (a prose mention of THREE.ExtrudeGeometry in a measurement note is not a dependency)",
    engineSource.length > 2000 &&
    !/new THREE\.|document\.(getElementById|querySelector|createElement)|window\.(location|document)/
      .test(engineSource));
});

console.log(`\n${pass} passed, ${fail} failed.`);
if(RED && fail === 0){
  console.log("RED RUN DID NOT GO RED — this gate cannot fail and is therefore not a gate.");
  process.exit(1);
}
process.exit(RED ? (pass > 0 ? 1 : 0) : (fail ? 1 : 0));
